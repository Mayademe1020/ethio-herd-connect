-- Verification Requests Table
-- For muzzle-based ownership verification (transfers, bank loans, insurance)

CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN (
        'ownership_sale',
        'ownership_transfer', 
        'bank_loan',
        'insurance_claim',
        'police_report'
    )),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    animal_name TEXT,
    animal_code TEXT,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'payment_completed',
        'in_progress',
        'verified',
        'rejected',
        'expired'
    )),
    fee_amount INTEGER NOT NULL DEFAULT 0,
    fee_paid BOOLEAN DEFAULT FALSE,
    payment_method TEXT,
    payment_reference TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    verifier_id UUID REFERENCES auth.users(id),
    verification_result JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_verification_requests_requester ON verification_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_owner ON verification_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_animal ON verification_requests(animal_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_type ON verification_requests(type);
CREATE INDEX IF NOT EXISTS idx_verification_requests_expires ON verification_requests(expires_at);

-- RLS Policies
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests (as requester or owner)
CREATE POLICY "Users can view own verification requests"
    ON verification_requests FOR SELECT
    USING (
        auth.uid() = requester_id 
        OR auth.uid() = owner_id
    );

-- Users can create their own verification requests
CREATE POLICY "Users can create verification requests"
    ON verification_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests"
    ON verification_requests FOR UPDATE
    USING (
        auth.uid() = requester_id 
        AND status = 'pending'
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_verification_requests_updated_at
    BEFORE UPDATE ON verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
