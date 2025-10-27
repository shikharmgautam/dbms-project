package handlers

import (
	"backend/db"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// Health returns whether the server is connected to MongoDB or using the in-memory fallback.
func Health(c *gin.Context) {
	mode := "mongo"
	connected := true
	if db.UseInMemory {
		mode = "in-memory"
		connected = false
	}

	dbName := ""
	if db.DB != nil {
		dbName = db.DB.Name()
	} else if v := os.Getenv("MONGO_DB"); v != "" {
		dbName = v
	} else {
		dbName = "placement_portal"
	}

	c.JSON(http.StatusOK, gin.H{
		"db_connected": connected,
		"db_mode":      mode,
		"db_name":      dbName,
	})
}
