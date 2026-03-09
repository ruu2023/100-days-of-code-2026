package main

import (
	"net/http"

	md "github.com/JohannesKaufmann/html-to-markdown"
	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// 1. URLを渡したらMarkdownにパースして返す
	r.GET("/md", func(c *gin.Context) {
		targetURL := c.Query("url")
		if targetURL == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "url query is required"})
			return
		}

		// HTMLを取得
		converter := md.NewConverter("", true, nil)
		markdown, err := converter.ConvertURL(targetURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.String(http.StatusOK, markdown)
	})

	// 2. URL先の画像のリンクだけを返す
	r.GET("/images", func(c *gin.Context) {
		targetURL := c.Query("url")
		if targetURL == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "url query is required"})
			return
		}

		// HTTPリクエストを送信
		res, err := http.Get(targetURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch URL"})
			return
		}
		defer res.Body.Close()

		// HTMLをパース
		doc, err := goquery.NewDocumentFromReader(res.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse HTML"})
			return
		}

		// imgタグのsrc属性を抽出
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
	})

	r.Run(":8080") // 8080ポートで起動
}