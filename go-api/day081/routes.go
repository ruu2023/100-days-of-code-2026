package day081

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type GeminiResponse struct {
	Summary string   `json:"summary"`
	Tags    []string `json:"tags"`
}

// SetupRoutes /day081 のルートを設定
func SetupRoutes(r *gin.Engine) {
	day081 := r.Group("/day081")
	{
		day081.GET("/gemini", GeminiHandler)
	}
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
