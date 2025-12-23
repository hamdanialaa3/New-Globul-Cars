#!/bin/bash

# AWS Setup Script for Bulgarian Car Marketplace
# Region: eu-central-1 (Frankfurt) for optimal Bulgaria performance
# Execute in AWS CloudShell or with AWS CLI configured

set -e  # Exit on any error

echo "🚀 Starting AWS setup for Bulgarian Car Marketplace..."
echo "📍 Region: eu-central-1 (Frankfurt)"

# Set default region
export AWS_DEFAULT_REGION=eu-central-1

# 1. Create S3 Buckets
echo "📦 Creating S3 buckets..."

aws s3 mb s3://bulgarian-car-marketplace-images-eu --region eu-central-1 || echo "Bucket already exists"
aws s3 mb s3://bulgarian-car-marketplace-backups-eu --region eu-central-1 || echo "Bucket already exists"
aws s3 mb s3://bulgarian-car-marketplace-analytics-eu --region eu-central-1 || echo "Bucket already exists"

# Configure CORS for images bucket
echo "🔧 Configuring CORS for images bucket..."
aws s3api put-bucket-cors \
    --bucket bulgarian-car-marketplace-images-eu \
    --cors-configuration '{
        "CORSRules": [
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
                "AllowedOrigins": ["*"],
                "MaxAgeSeconds": 3000
            }
        ]
    }' || echo "CORS already configured"

# 2. Setup Rekognition
echo "👁️ Setting up Amazon Rekognition..."

aws rekognition create-collection \
    --collection-id "car-images-collection" \
    --region eu-central-1 || echo "Collection already exists"

# 3. Create IAM Roles
echo "🔐 Creating IAM roles..."

# Rekognition Role
aws iam create-role \
    --role-name CarMarketplaceRekognitionRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "rekognition.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }' || echo "Rekognition role already exists"

# Lambda Execution Role
aws iam create-role \
    --role-name CarMarketplaceLambdaRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }' || echo "Lambda role already exists"

# Attach policies
aws iam attach-role-policy \
    --role-name CarMarketplaceLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole || echo "Policy already attached"

aws iam attach-role-policy \
    --role-name CarMarketplaceLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess || echo "Policy already attached"

aws iam attach-role-policy \
    --role-name CarMarketplaceLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonRekognitionFullAccess || echo "Policy already attached"

# 4. Setup CloudWatch Alarms
echo "📊 Setting up CloudWatch alarms..."

aws cloudwatch put-metric-alarm \
    --alarm-name "CarTelemetry-HighReadCapacity" \
    --alarm-description "High read capacity on CarTelemetry table" \
    --metric-name ConsumedReadCapacityUnits \
    --namespace AWS/DynamoDB \
    --statistic Sum \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=TableName,Value=CarTelemetry \
    --evaluation-periods 2 \
    --region eu-central-1 || echo "Alarm already exists"

aws cloudwatch put-metric-alarm \
    --alarm-name "IoT-HighMessageCount" \
    --alarm-description "High IoT message count" \
    --metric-name PublishIn.Success \
    --namespace AWS/IoT \
    --statistic Sum \
    --period 300 \
    --threshold 1000 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --region eu-central-1 || echo "Alarm already exists"

# 5. Create IoT Policy
echo "🌐 Creating IoT policies..."

aws iot create-policy \
    --policy-name CarMarketplaceIoTPolicy \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Connect",
                    "iot:Publish",
                    "iot:Subscribe",
                    "iot:Receive"
                ],
                "Resource": "*"
            }
        ]
    }' || echo "IoT policy already exists"

# 6. Setup Personalize (if needed)
echo "🤖 Setting up Amazon Personalize..."

aws personalize create-dataset-group \
    --name "car-recommendations" \
    --region eu-central-1 || echo "Dataset group already exists"

# 7. Create Lambda function for image processing
echo "⚡ Creating Lambda function..."

# Create deployment package
cat > /tmp/lambda_function.py << 'EOF'
import json
import boto3
import base64
from io import BytesIO

rekognition = boto3.client('rekognition')
s3 = boto3.client('s3')

def lambda_handler(event, context):
    try:
        # Process car image with Rekognition
        image_data = base64.b64decode(event['image'])
        
        response = rekognition.detect_labels(
            Image={'Bytes': image_data},
            MaxLabels=10,
            MinConfidence=80
        )
        
        # Extract car-related labels
        car_labels = []
        for label in response['Labels']:
            if any(keyword in label['Name'].lower() for keyword in ['car', 'vehicle', 'auto', 'sedan', 'suv']):
                car_labels.append({
                    'name': label['Name'],
                    'confidence': label['Confidence']
                })
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'labels': car_labels,
                'success': True
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'success': False
            })
        }
EOF

# Package Lambda function
cd /tmp
zip lambda_function.zip lambda_function.py

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create Lambda function
aws lambda create-function \
    --function-name CarImageAnalysis \
    --runtime python3.9 \
    --role arn:aws:iam::${ACCOUNT_ID}:role/CarMarketplaceLambdaRole \
    --handler lambda_function.lambda_handler \
    --zip-file fileb://lambda_function.zip \
    --description "Analyze car images using Rekognition" \
    --timeout 30 \
    --memory-size 256 \
    --region eu-central-1 || echo "Lambda function already exists"

# 8. Get IoT endpoint
echo "🔗 Getting IoT endpoint..."
IOT_ENDPOINT=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS --region eu-central-1 --query endpointAddress --output text)

echo ""
echo "✅ AWS setup completed successfully!"
echo ""
echo "📋 Important Information:"
echo "🌐 IoT Endpoint: $IOT_ENDPOINT"
echo "📦 S3 Buckets created:"
echo "   - bulgarian-car-marketplace-images-eu"
echo "   - bulgarian-car-marketplace-backups-eu"
echo "   - bulgarian-car-marketplace-analytics-eu"
echo "👁️ Rekognition Collection: car-images-collection"
echo "⚡ Lambda Function: CarImageAnalysis"
echo ""
echo "🔧 Next Steps:"
echo "1. Update .env file with IoT endpoint:"
echo "   REACT_APP_IOT_ENDPOINT=$IOT_ENDPOINT"
echo ""
echo "2. Configure AWS credentials in your application"
echo ""
echo "3. Test the integration using /admin/integration-status"
echo ""
echo "🎉 Your Bulgarian Car Marketplace is now ready for advanced AWS features!"