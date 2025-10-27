package handlers

import (
	"backend/db"
	"backend/middleware"
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

type googleAuthRequest struct {
	IDToken string `json:"idToken"`
}

func GoogleAuth(c *gin.Context) {
	var req googleAuthRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// verify firebase id token
	tok, err := middleware.FirebaseAuth.VerifyIDToken(context.Background(), req.IDToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Firebase token"})
		return
	}

	// ensure profile exists
	collection := db.DB.Collection("profiles")
	var existing db.Profile
	err = collection.FindOne(context.Background(), map[string]interface{}{"_id": tok.UID}).Decode(&existing)
	if err != nil {
		// create profile
		newProfile := db.Profile{
			ID:   tok.UID,
			Role: "student",
			FullName: func() string {
				if n, ok := tok.Claims["name"].(string); ok {
					return n
				}
				return ""
			}(),
			Email: func() string {
				if e, ok := tok.Claims["email"].(string); ok {
					return e
				}
				return ""
			}(),
			CreatedAt: time.Now().Format(time.RFC3339),
			UpdatedAt: time.Now().Format(time.RFC3339),
		}
		_, err := collection.InsertOne(context.Background(), newProfile)
		if err != nil {
			log.Println("failed to create profile:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create profile"})
			return
		}
	}

	// create custom JWT
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key"
	}
	claims := jwt.MapClaims{
		"user_id": tok.UID,
		"email":   tok.Claims["email"],
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": signed})
}
