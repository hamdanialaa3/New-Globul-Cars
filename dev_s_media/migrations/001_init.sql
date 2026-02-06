-- 001_init.sql
-- Initial Schema for Social Media Automation (Strict Idempotency & Audit)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SOCIAL POSTS (Main Table)
CREATE TABLE social_posts (
    post_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id VARCHAR(50) NOT NULL, -- Foreign key to main Ad table
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'x')),
    
    -- Idempotency: Ensure one post per ad per platform
    idempotency_key VARCHAR(255) NOT NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'queued' 
        CHECK (status IN ('queued', 'processing', 'published', 'failed', 'retrying')),
    
    platform_post_id VARCHAR(100), -- ID returned from Meta API
    post_url TEXT,
    
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraint: Unique ad per platform
    CONSTRAINT uq_ad_platform UNIQUE (ad_id, platform),
    CONSTRAINT uq_idempotency UNIQUE (idempotency_key)
);

-- 2. PUBLISH ATTEMPTS (Log every try)
CREATE TABLE publish_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES social_posts(post_id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    response_payload JSONB, -- Store full Meta API response
    duration_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AUDIT LOGS (Security & Manual Actions)
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'post', 'secret', 'config'
    entity_id VARCHAR(100),
    action VARCHAR(50) NOT NULL, -- 'approve', 'reject', 'retry', 'rotate_secret'
    actor_id VARCHAR(50) NOT NULL, -- Admin User ID or 'system'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DLQ JOBS (Dead Letter Queue Persistence)
-- Stores failed jobs for manual inspection/retry via Admin UI
CREATE TABLE dlq_jobs (
    job_id VARCHAR(100) PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    failed_reason TEXT,
    attempts INT,
    queue_name VARCHAR(50), -- Optional: to know where to requeue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE -- NULL until processed
);

-- Indexes for performance
CREATE INDEX idx_posts_status ON social_posts(status);
CREATE INDEX idx_posts_ad_id ON social_posts(ad_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_dlq_resolved ON dlq_jobs(resolved_at);
