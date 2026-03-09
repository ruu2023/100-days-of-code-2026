FROM golang:1.25-alpine AS build
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server .

FROM debian:bookworm-slim
RUN apk --no-cache add ca-certificates

WORKDIR /app
COPY --from=build /app/server /app/server

EXPOSE 8080
ENV PORT=8080
CMD ["/app/server"]