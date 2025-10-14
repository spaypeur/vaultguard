-- VaultGuard Database Schema
-- Core tables for user management, portfolios, assets, threats, and compliance

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums for type safety (MUST be created BEFORE tables that reference them)
CREATE TYPE user_role AS ENUM ('admin', 'advisor', 'client', 'family_member', 'auditor');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification', 'locked', 'deactivated');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending_review', 'approved', 'rejected', 'expired');

CREATE TYPE risk_level AS ENUM ('conservative', 'moderate', 'aggressive', 'very_aggressive');
CREATE TYPE asset_type AS ENUM ('cryptocurrency', 'token', 'nft', 'defi_position', 'staked', 'fiat', 'stock', 'bond', 'real_estate', 'commodity');
CREATE TYPE blockchain AS ENUM ('bitcoin', 'ethereum', 'solana', 'polygon', 'avalanche', 'binance_smart_chain', 'arbitrum', 'optimism', 'base', 'cardano');

CREATE TYPE transaction_type AS ENUM ('buy', 'sell', 'transfer', 'swap', 'stake', 'unstake', 'claim', 'deposit', 'withdraw');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed', 'cancelled');

CREATE TYPE threat_type AS ENUM ('phishing', 'malware', 'suspicious_transaction', 'social_engineering', 'network_attack', 'physical_security', 'regulatory_violation', 'market_manipulation');
CREATE TYPE threat_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE threat_status AS ENUM ('detected', 'investigating', 'confirmed', 'false_positive', 'resolved', 'ignored');

CREATE TYPE jurisdiction AS ENUM ('US', 'UK', 'EU', 'CH', 'SG', 'UAE');
CREATE TYPE compliance_type AS ENUM ('kyc', 'aml', 'tax_filing', 'fatca', 'crs', 'travel_rule', 'entity_management', 'audit');
CREATE TYPE compliance_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'expired', 'exempt');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role user_role NOT NULL DEFAULT 'client',
    status user_status NOT NULL DEFAULT 'pending_verification',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret TEXT,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    jurisdiction jurisdiction NOT NULL DEFAULT 'US',
    referral_code VARCHAR(50) UNIQUE,
    referred_by UUID REFERENCES users(id),
    kyc_status kyc_status NOT NULL DEFAULT 'not_submitted',
    kyc_submitted_at TIMESTAMP,
    kyc_verified_at TIMESTAMP,
    kyc_documents JSONB,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User sessions table for tracking active sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_value DECIMAL(36,18) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    risk_level risk_level NOT NULL DEFAULT 'moderate',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    rebalancing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    rebalancing_frequency VARCHAR(20) DEFAULT 'monthly',
    target_allocations JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type asset_type NOT NULL,
    amount DECIMAL(36,18) NOT NULL DEFAULT 0,
    value DECIMAL(36,18) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    blockchain blockchain,
    address TEXT,
    exchange VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Transactions table for tracking asset movements
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(36,18) NOT NULL,
    value DECIMAL(36,18) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    fee DECIMAL(36,18) DEFAULT 0,
    exchange_rate DECIMAL(36,18),
    from_address TEXT,
    to_address TEXT,
    tx_hash TEXT,
    block_number BIGINT,
    blockchain blockchain,
    status transaction_status NOT NULL DEFAULT 'pending',
    confirmed_at TIMESTAMP,
    failed_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Threats table for security monitoring
CREATE TABLE threats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type threat_type NOT NULL,
    severity threat_severity NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status threat_status NOT NULL DEFAULT 'detected',
    source_ip INET,
    source_location JSONB,
    indicators JSONB DEFAULT '{}',
    evidence JSONB DEFAULT '{}',
    detected_at TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    false_positive BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Compliance records table
CREATE TABLE compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jurisdiction jurisdiction NOT NULL,
    type compliance_type NOT NULL,
    status compliance_status NOT NULL DEFAULT 'pending',
    title VARCHAR(500) NOT NULL,
    description TEXT,
    due_date DATE,
    completed_at TIMESTAMP,
    submitted_at TIMESTAMP,
    verified_at TIMESTAMP,
    documents JSONB DEFAULT '[]',
    requirements JSONB DEFAULT '{}',
    notes TEXT,
    assigned_to UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit logs table for tracking all system activities
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    threat_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    portfolio_updates BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_emails BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- API keys table for external integrations
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash TEXT NOT NULL,
    permissions JSONB DEFAULT '{}',
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_jurisdiction ON users(jurisdiction);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_is_active ON portfolios(is_active);

CREATE INDEX idx_assets_portfolio_id ON assets(portfolio_id);
CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_blockchain ON assets(blockchain);

CREATE INDEX idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_threats_user_id ON threats(user_id);
CREATE INDEX idx_threats_type ON threats(type);
CREATE INDEX idx_threats_severity ON threats(severity);
CREATE INDEX idx_threats_status ON threats(status);
CREATE INDEX idx_threats_detected_at ON threats(detected_at);

CREATE INDEX idx_compliance_records_user_id ON compliance_records(user_id);
CREATE INDEX idx_compliance_records_jurisdiction ON compliance_records(jurisdiction);
CREATE INDEX idx_compliance_records_type ON compliance_records(type);
CREATE INDEX idx_compliance_records_status ON compliance_records(status);
CREATE INDEX idx_compliance_records_due_date ON compliance_records(due_date);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);



-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for portfolios table
CREATE POLICY "Users can view own portfolios" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own portfolios" ON portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Advisors can view client portfolios" ON portfolios FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('advisor', 'admin'))
);

-- Similar policies for other tables...
CREATE POLICY "Users can view own assets" ON assets FOR SELECT USING (
    EXISTS (SELECT 1 FROM portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own assets" ON assets FOR ALL USING (
    EXISTS (SELECT 1 FROM portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threats_updated_at BEFORE UPDATE ON threats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_records_updated_at BEFORE UPDATE ON compliance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
