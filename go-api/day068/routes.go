package day068

import (
	"net/http"

	md "github.com/JohannesKaufmann/html-to-markdown"
	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
)

// SetupRoutes /day068 のルートを設定
func SetupRoutes(r *gin.Engine) {
	day068 := r.Group("/day068")
	{
		day068.GET("/md", MDHandler)
		day068.GET("/images", ImagesHandler)
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
