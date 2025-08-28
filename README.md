## How to run

### Option 1: Simple way with Docker Compose
- Clone the repository :
```
git clone https://github.com/auxence-m/blog-app.git
```

- Navigate to the project directory :
```
cd blog-app
```

- Use Docker Compose to start the application. The -d flag runs the containers in the background, freeing up your terminal :
```
docker compose up --build -d
```

- Access the app through (http://localhost:5173/)
```
 http://localhost:5173/
```

- To stop the running containers, use:
```
docker compose stop
```

- If you want to fully stop and clean up the Docker environment, run:
```
docker compose down
```

### Option 2: Longer way without Docker Compose

f you don't have Docker installed, you can run the app manually. Make sure you have the latest version of [Golang](https://go.dev/doc/install) and [Node.js](https://nodejs.org/en/download) installed.

- Clone the repository :
```
git clone https://github.com/auxence-m/blog-app.git
```

- Navigate to the project directory :
```
cd blog-app
```

- Navigate to blog-app-api directory :
```
cd blog-app-api
```

- Install the go dependencies :
```
go mod tidy
```

- Build the go project :
```
go build
```

- Run the project :
```
go run main.go
```

- **Now open another terminal in the blog-app directory, and navigate to the blog-app-client directory. Don't closer first terminal**:
```
cd blog-app-client
```

- Install the node.js dependencies :
```
npm install
```

- Run the go project :
```
npm run dev
```

- Access the app through (http://localhost:5173/)
```
 http://localhost:5173/
```