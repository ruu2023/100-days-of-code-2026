#!/bin/bash

# Cloud Run deployment script for ndlocr-lite API

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project)}"

if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID is not set. Please set your GCP project ID."
    echo "Usage: PROJECT_ID=your-project-id ./deploy.sh"
    exit 1
fi

SERVICE_NAME="${SERVICE_NAME:-ndlocr-api}"
REGION="${REGION:-asia-northeast1}"

echo "Deploying to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Build and push container image
echo "Building Docker image..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
gcloud builds submit "$SCRIPT_DIR" --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10

echo ""
echo "Deployment complete!"
echo "Get the service URL with:"
echo "  gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'"
