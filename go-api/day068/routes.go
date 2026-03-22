package day068

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	md "github.com/JohannesKaufmann/html-to-markdown"
	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
)

type GeminiResponse struct {
	Summary string   `json:"summary"`
	Tags    []string `json:"tags"`
}

// SetupRoutes /day068 のルートを設定
func SetupRoutes(r *gin.Engine) {
	day068 := r.Group("/day068")
	{
		day068.GET("/md", MDHandler)
		day068.GET("/images", ImagesHandler)
		day068.GET("/gemini", GeminiHandler)
	}
}

// MDHandler URLをMarkdownに変換するハンドラ
func MDHandler(c *gin.Context) {
	targetURL := c.Query("url")
	if targetURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url query is required"})
		return
	}

	converter := md.NewConverter("", true, nil)
	markdown, err := converter.ConvertURL(targetURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.String(http.StatusOK, markdown)
}

// ImagesHandler URL先の画像のリンクだけを返すハンドラ
func ImagesHandler(c *gin.Context) {
	targetURL := c.Query("url")
	if targetURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url query is required"})
		return
	}

	res, err := http.Get(targetURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch URL"})
		return
	}
	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse HTML"})
		return
	}

	var images []string
	doc.Find("img").Each(func(i int, s *goquery.Selection) {
		src, exists := s.Attr("src")
		if exists {
			images = append(images, src)
		}
	})

	c.JSON(http.StatusOK, gin.H{
		"url":    targetURL,
		"images": images,
	})
}

// GeminiHandler gemini CLI を実行して JSON を返すハンドラ
func GeminiHandler(c *gin.Context) {
	prompt := c.DefaultQuery(
		"prompt",
		"日本の鉄道について、summaryとtagsを持つJSON形式で出力してください。解説は不要です。",
	)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	geminiBin := os.Getenv("GEMINI_BIN")
	if geminiBin == "" {
		geminiBin = "gemini"
	}

	cmd := exec.CommandContext(ctx, geminiBin, prompt)
	out, err := cmd.Output()
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			c.JSON(http.StatusGatewayTimeout, gin.H{"error": "gemini command timed out"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "failed to execute gemini command",
			"detail": err.Error(),
		})
		return
	}

	cleaned := cleanGeminiJSON(string(out))

	var res GeminiResponse
	if err := json.Unmarshal([]byte(cleaned), &res); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "failed to parse gemini response as JSON",
			"detail": err.Error(),
			"output": cleaned,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"prompt": prompt,
		"result": res,
	})
}

func cleanGeminiJSON(raw string) string {
	trimmed := strings.TrimSpace(raw)
	trimmed = strings.TrimPrefix(trimmed, "```json")
	trimmed = strings.TrimPrefix(trimmed, "```")
	trimmed = strings.TrimSuffix(trimmed, "```")

	return strings.TrimSpace(trimmed)
}
