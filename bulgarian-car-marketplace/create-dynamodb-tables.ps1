# Create DynamoDB Tables for Bulgarian Car Marketplace
# Execute in PowerShell with AWS CLI configured

Write-Host "🚀 Creating DynamoDB tables for Bulgarian Car Marketplace..." -ForegroundColor Green
Write-Host "📍 Region: eu-central-1 (Frankfurt)" -ForegroundColor Yellow

# Set default region
$env:AWS_DEFAULT_REGION = "eu-central-1"

# 1. Car Telemetry Table (IoT Data)
Write-Host "📊 Creating CarTelemetry table..." -ForegroundColor Cyan
try {
    aws dynamodb create-table `
        --table-name "CarTelemetry" `
        --attribute-definitions `
            AttributeName=carId,AttributeType=S `
            AttributeName=timestamp,AttributeType=N `
        --key-schema `
            AttributeName=carId,KeyType=HASH `
            AttributeName=timestamp,KeyType=RANGE `
        --billing-mode PAY_PER_REQUEST `
        --region eu-central-1 `
        --tags Key=Project,Value=BulgarianCarMarketplace Key=Environment,Value=Production Key=Service,Value=IoT
    
    Write-Host "✅ CarTelemetry table created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ CarTelemetry table already exists or error occurred" -ForegroundColor Yellow
}

# 2. Car Analytics Table (Aggregated Data)
Write-Host "📈 Creating CarAnalytics table..." -ForegroundColor Cyan
try {
    aws dynamodb create-table `
        --table-name "CarAnalytics" `
        --attribute-definitions `
            AttributeName=carId,AttributeType=S `
            AttributeName=date,AttributeType=S `
        --key-schema `
            AttributeName=carId,KeyType=HASH `
            AttributeName=date,KeyType=RANGE `
        --billing-mode PAY_PER_REQUEST `
        --region eu-central-1 `
        --tags Key=Project,Value=BulgarianCarMarketplace Key=Environment,Value=Production Key=Service,Value=Analytics
    
    Write-Host "✅ CarAnalytics table created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ CarAnalytics table already exists or error occurred" -ForegroundColor Yellow
}

# 3. User Sessions Table (Real-time tracking)
Write-Host "👥 Creating UserSessions table..." -ForegroundColor Cyan
try {
    aws dynamodb create-table `
        --table-name "UserSessions" `
        --attribute-definitions `
            AttributeName=userId,AttributeType=S `
            AttributeName=sessionId,AttributeType=S `
        --key-schema `
            AttributeName=userId,KeyType=HASH `
            AttributeName=sessionId,KeyType=RANGE `
        --billing-mode PAY_PER_REQUEST `
        --region eu-central-1 `
        --tags Key=Project,Value=BulgarianCarMarketplace Key=Environment,Value=Production Key=Service,Value=UserTracking
    
    Write-Host "✅ UserSessions table created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ UserSessions table already exists or error occurred" -ForegroundColor Yellow
}

# 4. Market Analytics Table (Business Intelligence)
Write-Host "💼 Creating MarketAnalytics table..." -ForegroundColor Cyan
try {
    aws dynamodb create-table `
        --table-name "MarketAnalytics" `
        --attribute-definitions `
            AttributeName=region,AttributeType=S `
            AttributeName=date,AttributeType=S `
        --key-schema `
            AttributeName=region,KeyType=HASH `
            AttributeName=date,KeyType=RANGE `
        --billing-mode PAY_PER_REQUEST `
        --region eu-central-1 `
        --tags Key=Project,Value=BulgarianCarMarketplace Key=Environment,Value=Production Key=Service,Value=MarketIntelligence
    
    Write-Host "✅ MarketAnalytics table created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ MarketAnalytics table already exists or error occurred" -ForegroundColor Yellow
}

# Wait for tables to be active
Write-Host "⏳ Waiting for tables to become active..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verify table creation
Write-Host "🔍 Verifying table creation..." -ForegroundColor Cyan
$tables = @("CarTelemetry", "CarAnalytics", "UserSessions", "MarketAnalytics")

foreach ($table in $tables) {
    try {
        $status = aws dynamodb describe-table --table-name $table --region eu-central-1 --query 'Table.TableStatus' --output text
        Write-Host "📋 $table : $status" -ForegroundColor $(if ($status -eq "ACTIVE") { "Green" } else { "Yellow" })
    } catch {
        Write-Host "❌ $table : ERROR" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 DynamoDB setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Tables created in eu-central-1:" -ForegroundColor Cyan
Write-Host "   • CarTelemetry - IoT sensor data" -ForegroundColor White
Write-Host "   • CarAnalytics - Aggregated analytics" -ForegroundColor White  
Write-Host "   • UserSessions - User activity tracking" -ForegroundColor White
Write-Host "   • MarketAnalytics - Business intelligence" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Update your application with table names" -ForegroundColor White
Write-Host "   2. Configure IAM permissions" -ForegroundColor White
Write-Host "   3. Test the integration at /admin/integration-status" -ForegroundColor White
Write-Host ""
Write-Host "💡 All tables use PAY_PER_REQUEST billing (no upfront costs)" -ForegroundColor Green