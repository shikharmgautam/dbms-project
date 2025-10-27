//go:build ignore

package tools

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// PingCheck can be called manually for diagnostics. It is non-main so it does
// not conflict when running the main server.
func PingCheck() {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		// use 127.0.0.1 to avoid IPv6 (::1) resolution issues on Windows
		uri = "mongodb://127.0.0.1:27017"
	}
	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = "placement_portal"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		fmt.Println("connect error:", err)
		os.Exit(1)
	}
	defer func() {
		_ = client.Disconnect(context.Background())
	}()

	if err := client.Ping(ctx, nil); err != nil {
		fmt.Println("ping error:", err)
		os.Exit(1)
	}

	fmt.Println("OK: connected to mongo:", uri, "db:", dbName)
}
