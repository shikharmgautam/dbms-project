package middleware

import (
	"backend/db"
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"google.golang.org/api/option"
)

var FirebaseAuth *auth.Client
var jwtSecret []byte

func InitFirebase() {
	optFile := os.Getenv("FIREBASE_SERVICE_ACCOUNT")
	if optFile == "" {
		optFile = "firebase_service_account.json"
	}
	opt := option.WithCredentialsFile(optFile)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatal("Failed to initialize Firebase app:", err)
	}

	FirebaseAuth, err = app.Auth(context.Background())
	if err != nil {
		log.Fatal("Failed to initialize Firebase auth:", err)
	}
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key"
	}
	jwtSecret = []byte(secret)
}

type AuthContext struct {
	UserID string
	Role   string
}

// AuthMiddleware verifies either a custom JWT or a Firebase token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
			c.Abort()
			return
		}

		// Try JWT first
		jwtToken, jwtErr := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		var userID string
		if jwtErr == nil && jwtToken != nil && jwtToken.Valid {
			if claims, ok := jwtToken.Claims.(jwt.MapClaims); ok {
				if uid, ok := claims["user_id"].(string); ok {
					userID = uid
				}
			}
		}

		if userID == "" {
			// fallback to Firebase verification
			tok, err := FirebaseAuth.VerifyIDToken(context.Background(), tokenString)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
				c.Abort()
				return
			}
			userID = tok.UID
		}

		// load profile (supports in-memory fallback)
		profile, err := db.GetProfile(userID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Profile not found"})
			c.Abort()
			return
		}

		c.Set("userID", userID)
		c.Set("role", profile.Role)
		c.Next()
	}
}

func GetAuthContext(c *gin.Context) (string, string) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")
	return userID.(string), role.(string)
}
