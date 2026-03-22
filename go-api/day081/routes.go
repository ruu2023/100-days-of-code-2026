package day081

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const maxTranscriptRunes = 12000

var subtitleTimestampPattern = regexp.MustCompile(`^\d{2}:\d{2}:\d{2},\d{3}\s+-->\s+\d{2}:\d{2}:\d{2},\d{3}`)

// SetupRoutes /day081 のルートを設定
func SetupRoutes(r *gin.Engine) {
	day081 := r.Group("/day081")
	{
		day081.GET("/gemini", GeminiHandler)
	}
}

// GeminiHandler YouTube 字幕を取得して gemini CLI に要約させるハンドラ
func GeminiHandler(c *gin.Context) {
	videoURL := c.Query("url")
	if videoURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url query is required"})
		return
	}

	lang := c.DefaultQuery("lang", "ja")

	subtitleCtx, subtitleCancel := context.WithTimeout(c.Request.Context(), 2*time.Minute)
	defer subtitleCancel()

	transcript, subtitleFile, err := downloadTranscript(subtitleCtx, videoURL, lang)
	if err != nil {
		status := http.StatusInternalServerError
		if subtitleCtx.Err() == context.DeadlineExceeded {
			status = http.StatusGatewayTimeout
		}

		c.JSON(status, gin.H{
			"error":  "failed to fetch subtitles",
			"detail": err.Error(),
		})
		return
	}

	prompt := buildSummaryPrompt(transcript)

	geminiCtx, geminiCancel := context.WithTimeout(c.Request.Context(), 45*time.Second)
	defer geminiCancel()

	summary, err := runGemini(geminiCtx, prompt)
	if err != nil {
		status := http.StatusInternalServerError
		if geminiCtx.Err() == context.DeadlineExceeded {
			status = http.StatusGatewayTimeout
		}

		c.JSON(status, gin.H{
			"error":         "failed to summarize subtitles",
			"detail":        err.Error(),
			"subtitle_file": filepath.Base(subtitleFile),
		})
		return
	}

	c.Data(http.StatusOK, "text/plain; charset=utf-8", []byte(summary))
}

func downloadTranscript(ctx context.Context, videoURL, lang string) (string, string, error) {
	ytDLPBin := os.Getenv("YT_DLP_BIN")
	if ytDLPBin == "" {
		ytDLPBin = "yt-dlp"
	}

	tempDir, err := os.MkdirTemp("", "day081-subs-*")
	if err != nil {
		return "", "", err
	}
	defer os.RemoveAll(tempDir)

	outputTemplate := filepath.Join(tempDir, "%(id)s.%(ext)s")
	cmd := exec.CommandContext(
		ctx,
		ytDLPBin,
		"--write-auto-subs",
		"--sub-lang", lang,
		"--convert-subs", "srt",
		"--skip-download",
		"--output", outputTemplate,
		videoURL,
	)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", "", fmt.Errorf("%w: %s", err, strings.TrimSpace(string(out)))
	}

	matches, err := filepath.Glob(filepath.Join(tempDir, "*.srt"))
	if err != nil {
		return "", "", err
	}
	if len(matches) == 0 {
		return "", "", fmt.Errorf("subtitle file was not generated")
	}

	content, err := os.ReadFile(matches[0])
	if err != nil {
		return "", "", err
	}

	transcript := sanitizeSRT(string(content))
	if transcript == "" {
		return "", "", fmt.Errorf("subtitle content was empty after sanitizing")
	}

	return transcript, matches[0], nil
}

func runGemini(ctx context.Context, prompt string) (string, error) {
	geminiBin := os.Getenv("GEMINI_BIN")
	if geminiBin == "" {
		geminiBin = "gemini"
	}

	cmd := exec.CommandContext(ctx, geminiBin, prompt)
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}

	return cleanGeminiResponse(string(out)), nil
}

func buildSummaryPrompt(transcript string) string {
	return fmt.Sprintf(
		"次のYouTube字幕を日本語で要約してください。\n\n字幕:\n%s",
		limitRunes(transcript, maxTranscriptRunes),
	)
}

func sanitizeSRT(raw string) string {
	lines := strings.Split(strings.ReplaceAll(raw, "\r\n", "\n"), "\n")
	var parts []string

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		if isSRTSequence(trimmed) || subtitleTimestampPattern.MatchString(trimmed) {
			continue
		}

		parts = append(parts, trimmed)
	}

	return strings.Join(parts, " ")
}

func isSRTSequence(line string) bool {
	for _, r := range line {
		if r < '0' || r > '9' {
			return false
		}
	}

	return line != ""
}

func limitRunes(input string, limit int) string {
	runes := []rune(input)
	if len(runes) <= limit {
		return input
	}

	return string(runes[:limit]) + "..."
}

func cleanGeminiResponse(raw string) string {
	trimmed := strings.TrimSpace(raw)
	trimmed = strings.TrimPrefix(trimmed, "```markdown")
	trimmed = strings.TrimPrefix(trimmed, "```json")
	trimmed = strings.TrimPrefix(trimmed, "```text")
	trimmed = strings.TrimPrefix(trimmed, "```")
	trimmed = strings.TrimSuffix(trimmed, "```")

	return strings.TrimSpace(trimmed)
}
