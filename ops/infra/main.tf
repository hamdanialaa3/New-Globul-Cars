# Koli One Infrastructure as Code (Terraform)
# Google Cloud Platform resources for production deployment
# See: https://www.terraform.io/

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # Backend: Store state in Google Cloud Storage
  backend "gcs" {
    bucket  = "koli-one-terraform-state"
    prefix  = "prod"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "google-beta" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Variables
variable "gcp_project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "gcp_region" {
  type        = string
  default     = "europe-west1"
  description = "GCP region"
}

variable "environment" {
  type        = string
  description = "Environment (dev, staging, prod)"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Firestore Database
resource "google_firestore_database" "koli_one" {
  name            = "koli-one-${var.environment}"
  location_id     = var.gcp_region
  type            = "FIRESTORE_NATIVE"
  concurrency_mode = "OPTIMISTIC"
}

# Cloud Storage Bucket for media (images, videos)
resource "google_storage_bucket" "media" {
  name          = "koli-one-media-${var.environment}"
  location      = var.gcp_region
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  cors {
    origin          = ["https://*.koli-one.com", "http://localhost:3000"]
    method          = ["GET", "HEAD", "DELETE", "POST", "PUT"]
    response_header = ["Content-Type", "X-Goog-Meta-Uploaded-By"]
    max_age_seconds = 3600
  }

  lifecycle_rule {
    condition {
      age = 90
      num_newer_versions = 5
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  tags = {
    environment = var.environment
    service     = "media-storage"
    managed_by  = "terraform"
  }
}

# Cloud Storage Bucket for backups
resource "google_storage_bucket" "backups" {
  name          = "koli-one-backups-${var.environment}"
  location      = var.gcp_region
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  tags = {
    environment = var.environment
    service     = "backups"
    managed_by  = "terraform"
  }
}

# Cloud Functions for image processing
resource "google_cloudfunctions_function" "image_processor" {
  name        = "image-processor-${var.environment}"
  runtime     = "nodejs20"
  trigger_topic = google_pubsub_topic.image_processing.name

  entry_point = "processImage"
  
  source_archive_bucket = google_storage_bucket.functions_source.name
  source_archive_object = "image-processor-latest.zip"

  available_memory_mb   = 512
  timeout              = 300
  max_instances        = 100

  environment_variables = {
    BUCKET_NAME = google_storage_bucket.media.name
    ENVIRONMENT = var.environment
  }

  labels = {
    environment = var.environment
    service     = "image-processing"
    managed_by  = "terraform"
  }
}

# Cloud Functions for pricing estimation
resource "google_cloudfunctions_function" "pricing_estimator" {
  name        = "pricing-estimator-${var.environment}"
  runtime     = "nodejs20"
  trigger_http = true

  entry_point = "estimatePrice"
  
  source_archive_bucket = google_storage_bucket.functions_source.name
  source_archive_object = "pricing-estimator-latest.zip"

  available_memory_mb   = 256
  timeout              = 60
  max_instances        = 50

  labels = {
    environment = var.environment
    service     = "ai-pricing"
    managed_by  = "terraform"
  }
}

# Cloud Storage Bucket for Cloud Functions source code
resource "google_storage_bucket" "functions_source" {
  name          = "koli-one-functions-source-${var.environment}"
  location      = var.gcp_region
  force_destroy = true

  uniform_bucket_level_access = true

  tags = {
    environment = var.environment
    service     = "cloud-functions"
    managed_by  = "terraform"
  }
}

# Pub/Sub topic for image processing
resource "google_pubsub_topic" "image_processing" {
  name = "image-processing-${var.environment}"

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Redis cache for caching and rate limiting
resource "google_redis_instance" "cache" {
  count           = var.environment == "prod" ? 1 : 0
  name            = "koli-one-cache-${var.environment}"
  tier            = "standard"
  memory_size_gb  = var.environment == "prod" ? 5 : 1
  region          = var.gcp_region
  connect_mode    = "PRIVATE_SERVICE_ACCESS"
  redis_version   = "7.0"
  authorized_network = data.google_compute_network.default.id

  labels = {
    environment = var.environment
    service     = "cache"
    managed_by  = "terraform"
  }
}

# Service Account for Cloud Functions
resource "google_service_account" "functions" {
  account_id   = "koli-one-functions-${var.environment}"
  display_name = "Koli One Cloud Functions"

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# IAM binding: Functions -> Storage
resource "google_storage_bucket_iam_member" "functions_media_access" {
  bucket = google_storage_bucket.media.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.functions.email}"
}

# 🔒 SECURED: Least-Privilege IAM Bindings for Cloud Functions
# Each binding grants ONLY what's needed — no Editor/Owner roles

# Firestore read/write for Cloud Functions
resource "google_project_iam_member" "functions_firestore" {
  project = var.gcp_project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

# Cloud Functions Developer (deploy & invoke)
resource "google_project_iam_member" "functions_developer" {
  project = var.gcp_project_id
  role    = "roles/cloudfunctions.developer"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

# Pub/Sub subscriber (for event-driven functions)
resource "google_project_iam_member" "functions_pubsub" {
  project = var.gcp_project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

# Secret Manager accessor (read secrets, no write)
resource "google_project_iam_member" "functions_secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

# Logging writer
resource "google_project_iam_member" "functions_logging" {
  project = var.gcp_project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

# Monitoring metric writer
resource "google_project_iam_member" "functions_monitoring" {
  project = var.gcp_project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

# ============================================
# GitHub Actions Deployment Service Account
# 🔒 Restricted to deployment roles ONLY — no Editor/Owner
# ============================================
resource "google_service_account" "github_actions" {
  account_id   = "koli-one-gh-deploy-${var.environment}"
  display_name = "Koli One GitHub Actions Deployer"
}

# GitHub Actions -> Firebase Hosting deploy
resource "google_project_iam_member" "gh_firebase_hosting" {
  project = var.gcp_project_id
  role    = "roles/firebasehosting.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# GitHub Actions -> Cloud Functions deploy
resource "google_project_iam_member" "gh_functions_deploy" {
  project = var.gcp_project_id
  role    = "roles/cloudfunctions.developer"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# GitHub Actions -> Storage (deploy artifacts)
resource "google_project_iam_member" "gh_storage" {
  project = var.gcp_project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# GitHub Actions -> Service Account User (to deploy functions as the functions SA)
resource "google_project_iam_member" "gh_sa_user" {
  project = var.gcp_project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# ============================================
# Secret Manager — Store all sensitive keys here
# 🔒 SECURED: Secrets are accessed by Cloud Functions at runtime
# ============================================
resource "google_secret_manager_secret" "stripe_secret_key" {
  secret_id = "stripe-secret-key"
  
  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    service     = "payments"
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret" "hcaptcha_secret_key" {
  secret_id = "hcaptcha-secret-key"
  
  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    service     = "security"
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret" "facebook_page_token" {
  secret_id = "facebook-page-access-token"
  
  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    service     = "social-media"
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret" "whatsapp_access_token" {
  secret_id = "whatsapp-access-token"
  
  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    service     = "messaging"
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret" "epay_secret_key" {
  secret_id = "epay-secret-key"
  
  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    service     = "payments"
    managed_by  = "terraform"
  }
}

# Cloud Monitoring (basic setup)
resource "google_monitoring_alert_policy" "firestore_quota" {
  count        = var.environment == "prod" ? 1 : 0
  display_name = "Firestore Quota Alert"
  combiner     = "OR"

  conditions {
    display_name = "Firestore Quota Usage > 80%"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_firestore_database\" AND metric.type=\"firestore.googleapis.com/quota/used\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8
    }
  }

  notification_channels = [google_monitoring_notification_channel.email[0].name]
}

resource "google_monitoring_notification_channel" "email" {
  count           = var.environment == "prod" ? 1 : 0
  display_name    = "Koli One Alerts"
  type            = "email"
  enabled         = true
  
  labels = {
    email_address = "ops@alaa-technologies.com"
  }
}

# Data sources
data "google_compute_network" "default" {
  name = "default"
}

# Outputs
output "firestore_database" {
  value = google_firestore_database.koli_one.name
}

output "media_bucket" {
  value = google_storage_bucket.media.name
}

output "backups_bucket" {
  value = google_storage_bucket.backups.name
}

output "redis_host" {
  value       = try(google_redis_instance.cache[0].host, null)
  description = "Redis cache hostname (prod only)"
}

output "functions_service_account" {
  value = google_service_account.functions.email
}

output "github_actions_service_account" {
  value       = google_service_account.github_actions.email
  description = "Service account for GitHub Actions CI/CD"
}

