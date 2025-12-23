#!/bin/bash

# Quick AWS Setup - Essential Services Only
# Execute in AWS CloudShell

echo "🚀 Quick AWS Setup for Bulgarian Car Marketplace"
echo "📍 Region: eu-central-1"

# Set region
export AWS_DEFAULT_REGION=eu-central-1

# 1. Essential S3 Bucket
echo "📦 Creating images bucket..."
aws s3 mb s3://bulgarian-car-marketplace-images-eu --region eu-central-1

# 2. Configure CORS
echo "🔧 Setting up CORS..."
aws s3api put-bucket-cors \
    --bucket bulgarian-car-marketplace-images-eu \
    --cors-configuration '{
        "CORSRules": [{
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST"],
            "AllowedOrigins": ["*"],
            "MaxAgeSeconds": 3000
        }]
    }'

# 3. Get IoT Endpoint
echo "🌐 Getting IoT endpoint..."
IOT_ENDPOINT=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS --query endpointAddress --output text)

# 4. Create Rekognition Collection
echo "👁️ Creating Rekognition collection..."
aws rekognition create-collection --collection-id "car-images-collection"

echo ""
echo "✅ Quick setup completed!"
echo ""
echo "🔗 IoT Endpoint: $IOT_ENDPOINT"
echo ""
echo "📝 Add to your .env file:"
echo "REACT_APP_IOT_ENDPOINT=$IOT_ENDPOINT"
echo "REACT_APP_AWS_REGION=eu-central-1"
echo ""
echo "🎯 Next: Visit /admin/integration-status to verify setup"