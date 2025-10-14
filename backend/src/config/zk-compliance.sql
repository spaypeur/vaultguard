-- zk-compliance tables
CREATE TABLE zk_compliance_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jurisdiction jurisdiction NOT NULL,
    document_hash TEXT NOT NULL,
    requirements JSONB NOT NULL,
    private_hash TEXT NOT NULL,
    proof_data JSONB NOT NULL,
    public_signals JSONB NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Functions for zk-compliance
CREATE OR REPLACE FUNCTION verify_zk_compliance_proof(
    proof_id UUID,
    verifier_input JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    proof_record zk_compliance_proofs%ROWTYPE;
BEGIN
    -- Get the proof record
    SELECT * INTO proof_record
    FROM zk_compliance_proofs
    WHERE id = proof_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proof not found';
    END IF;

    -- In production, this would perform actual zk-SNARK verification
    -- For now, we just return true if the proof exists and hasn't expired
    RETURN proof_record.verified = FALSE 
        AND (proof_record.expires_at IS NULL OR proof_record.expires_at > NOW());
END;
$$ LANGUAGE plpgsql;

-- Indexes for zk-compliance tables
CREATE INDEX idx_zk_compliance_proofs_user_id ON zk_compliance_proofs(user_id);
CREATE INDEX idx_zk_compliance_proofs_jurisdiction ON zk_compliance_proofs(jurisdiction);
CREATE INDEX idx_zk_compliance_proofs_verified ON zk_compliance_proofs(verified);

-- RLS policies for zk-compliance tables
ALTER TABLE zk_compliance_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own zk proofs" ON zk_compliance_proofs 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own zk proofs" ON zk_compliance_proofs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all zk proofs" ON zk_compliance_proofs 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Trigger for updating timestamps
CREATE TRIGGER update_zk_compliance_proofs_updated_at 
    BEFORE UPDATE ON zk_compliance_proofs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();