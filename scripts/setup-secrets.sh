#!/bin/bash
PROJECT_ID="fire-new-globul"
echo "🔐 Setting up Google Secret Manager for New Globul Cars..."

# Ensure gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

echo "👉 Please ensure you are logged in: 'gcloud auth login'"
echo "👉 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable API
echo "🔌 Enabling Secret Manager API..."
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

# List of secrets to create
SECRETS=(
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "SENDGRID_API_KEY"
    "ALGOLIA_ADMIN_KEY"
    "GEMINI_API_KEY"
    "FIREBASE_SERVICE_ACCOUNT"
    "FACEBOOK_ACCESS_TOKEN"
    "FACEBOOK_APP_SECRET"
)

for SECRET in "${SECRETS[@]}"; do
    echo "------------------------------------------------"
    echo "🛡️  Processing secret: $SECRET"
    
    # Check if secret exists
    if gcloud secrets describe $SECRET --project=$PROJECT_ID &> /dev/null; then
        echo "✅ Secret $SECRET already exists."
    else
        echo "🆕 Creating secret $SECRET..."
        gcloud secrets create $SECRET --project=$PROJECT_ID --replication-policy="automatic"
    fi

    # Prompt user to add a version
    read -p "❓ Do you want to add a new version value for $SECRET? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "✍️  Enter value for $SECRET (input will be hidden):"
        read -s SECRET_VALUE
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET --data-file=- --project=$PROJECT_ID
        echo "✅ Version added."
    fi
done

echo "------------------------------------------------"
echo "✅ Secrets infrastructure setup complete."
echo "👉 Verify at: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
