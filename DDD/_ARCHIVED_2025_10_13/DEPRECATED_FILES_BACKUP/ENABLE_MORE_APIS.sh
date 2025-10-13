#!/bin/bash
# Enable additional required APIs for Firebase Authentication

# Set project
gcloud config set project fire-new-globul

# Enable Identity Platform API (different from Identity Toolkit)
gcloud services enable identityplatform.googleapis.com

# Enable Token Service API
gcloud services enable securetoken.googleapis.com

# Enable Cloud Resource Manager API
gcloud services enable cloudresourcemanager.googleapis.com

# Verify all enabled
echo "Checking enabled services:"
gcloud services list --enabled --filter="identity"
gcloud services list --enabled --filter="token"

echo ""
echo "✅ All APIs enabled!"
echo "⏰ Wait 5-10 minutes for changes to propagate"

