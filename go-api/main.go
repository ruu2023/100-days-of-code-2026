package main

import (
	"net/http"

	"go-web-tools/day068"
	"go-web-tools/day081"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/up", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "go is runnning")
	})

	// day068 ルート
	day068.SetupRoutes(r)
	day081.SetupRoutes(r)

	r.Run("0.0.0.0:8080")
}
