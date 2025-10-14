-- Multi-signature transactions table
CREATE TABLE multi_sig_transactions (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('withdrawal', 'key_rotation', 'config_change', 'compliance_override')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'executed', 'failed')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    required_signatures INTEGER NOT NULL CHECK (required_signatures > 0),
    current_signatures JSONB NOT NULL DEFAULT '[]',
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Indexes for common queries
    CONSTRAINT valid_signatures CHECK (jsonb_array_length(current_signatures) <= required_signatures)
);

-- Indexes for performance
CREATE INDEX idx_multi_sig_status ON multi_sig_transactions(status);
CREATE INDEX idx_multi_sig_created_by ON multi_sig_transactions(created_by);
CREATE INDEX idx_multi_sig_expires_at ON multi_sig_transactions(expires_at);
CREATE INDEX idx_multi_sig_type ON multi_sig_transactions(type);

-- Composite indexes for common query patterns
CREATE INDEX idx_multi_sig_status_created_at ON multi_sig_transactions(status, created_at DESC);
CREATE INDEX idx_multi_sig_type_status ON multi_sig_transactions(type, status);

-- Full text search on transaction data
CREATE INDEX idx_multi_sig_data_gin ON multi_sig_transactions USING gin(data jsonb_path_ops);

-- Comments for documentation
COMMENT ON TABLE multi_sig_transactions IS 'Stores multi-signature transactions requiring multiple approvals';
COMMENT ON COLUMN multi_sig_transactions.id IS 'Unique identifier for the transaction';
COMMENT ON COLUMN multi_sig_transactions.type IS 'Type of transaction (withdrawal, key_rotation, etc.)';
COMMENT ON COLUMN multi_sig_transactions.status IS 'Current status of the transaction';
COMMENT ON COLUMN multi_sig_transactions.created_by IS 'User ID who created the transaction';
COMMENT ON COLUMN multi_sig_transactions.created_at IS 'Timestamp when transaction was created';
COMMENT ON COLUMN multi_sig_transactions.expires_at IS 'Timestamp when transaction expires';
COMMENT ON COLUMN multi_sig_transactions.data IS 'Transaction-specific data';
COMMENT ON COLUMN multi_sig_transactions.required_signatures IS 'Number of signatures required for approval';
COMMENT ON COLUMN multi_sig_transactions.current_signatures IS 'Array of current signatures with metadata';
COMMENT ON COLUMN multi_sig_transactions.metadata IS 'Additional transaction metadata';