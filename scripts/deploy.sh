#!/bin/bash

# Audio Processing UI Deployment Script

set -e

echo "🚀 Starting deployment of Audio Processing UI..."

# Build production image
echo "📦 Building production Docker image..."
docker build -f Dockerfile.prod -t audio-ui:latest .

# Optional: Tag for registry
if [ ! -z "$DOCKER_REGISTRY" ]; then
    echo "🏷️  Tagging image for registry..."
    docker tag audio-ui:latest $DOCKER_REGISTRY/audio-ui:latest
    
    echo "📤 Pushing to registry..."
    docker push $DOCKER_REGISTRY/audio-ui:latest
fi

# Run production container
echo "🏃 Starting production container..."
docker-compose --profile prod up -d

echo "✅ Deployment complete!"
echo "🌐 Application should be available at http://localhost"