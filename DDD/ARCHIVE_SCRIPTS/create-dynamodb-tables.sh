#!/bin/bash

# Create DynamoDB Tables for Bulgarian Car Marketplace
# Execute in AWS CloudShell or bash with AWS CLI configured

echo "🚀 Creating DynamoDB tables for Bulgarian Car Marketplace..."
echo "📍 Region: eu-central-1 (Frankfurt)"

# Set default region
export AWS_DEFAULT_REGION=eu-central-1

# 1. Car Telemetry Table (IoT Data)
echo "📊 Creating CarTelemetry table..."
aws dynamodb create-table \
    --table-name "CarTelemetry" \
    --attribute-definitions \
        AttributeName=carId,AttributeType=S \
        AttributeName=timestamp,AttributeType=N \
    --key-schema \
        AttributeName=carId,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region eu-central-1 \
    --tags Key=Project,Value=BulgarianCarMarketplace Key=Environment,Value=Production Key=Service,Value=IoT \
    || echo "⚠️ CarTelemetry table already exists"

# 2. Car Analytics Table
echo "📈 Creating CarAnalytics table..."
aws dynamodb create-table \
    --table-name "CarAnalytics" \
    --attribute-definitions \
        AttributeName=carId,AttributeType=S \
        AttributeName=date,AttributeType=S \
    --key-schema \
        AttributeName=carId,KeyType=HASH \
        AttributeName=date,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region eu-central-1 \
    --tags Key=Project,Value=BulgarianCarMarketplace Key=Environment,Value=Production Key=Service,Value=Analytics \
    || echo "⚠️ CarAnalytics table already exists"

# 3. User Sessions Table
echo "👥 Creating UserSessions table..."
aws dynamodb create-table \
    --table-name "UserSessions" \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=sessionId,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=sessionId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region eu-central-1 \
    --tags Key=Project,Value=BulgarianCarMarketplace Key=Environment,Value=Production Key=Service,Value=UserTracking \
    || echo "⚠️ UserSessions table already exists"

# Wait for tables to be active
echo "⏳ Waiting for tables to become active..."
sleep 10

# Verify table creation
echo "🔍 Verifying table creation..."
tables=("CarTelemetry" "CarAnalytics" "UserSessions")

for table in "${tables[@]}"; do
    status=$(aws dynamodb describe-table --table-name "$table" --region eu-central-1 --query 'Table.TableStatus' --output text 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "📋 $table: $status"
    else
        echo "❌ $table: ERROR"
    fi
done

echo ""
echo "🎉 DynamoDB setup completed!"
echo ""
echo "📊 Tables created in eu-central-1:"
echo "   • CarTelemetry - IoT sensor data"
echo "   • CarAnalytics - Aggregated analytics"  
echo "   • UserSessions - User activity tracking"
echo ""
echo "🔧 Next steps:"
echo "   1. Update your application with table names"
echo "   2. Configure IAM permissions"
echo "   3. Test the integration at /admin/integration-status"
echo ""
echo "💡 All tables use PAY_PER_REQUEST billing (no upfront costs)"