-- Migration: Add multi-class spam type fields to predictions table
-- Version: v7 multi-class support
-- Date: 2026-05-12

-- Add new columns for spam type classification
ALTER TABLE predictions 
ADD COLUMN IF NOT EXISTS spam_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS spam_type_confidence FLOAT,
ADD COLUMN IF NOT EXISTS spam_type_explanation VARCHAR(500),
ADD COLUMN IF NOT EXISTS ai_spam_score FLOAT,
ADD COLUMN IF NOT EXISTS traditional_spam_score FLOAT,
ADD COLUMN IF NOT EXISTS ham_score FLOAT;

-- Create index on spam_type for filtering
CREATE INDEX IF NOT EXISTS idx_predictions_spam_type ON predictions(spam_type);

-- Add comments for documentation
COMMENT ON COLUMN predictions.spam_type IS 'Spam type: ham, traditional_spam, ai_spam, or suspicious';
COMMENT ON COLUMN predictions.spam_type_confidence IS 'Confidence in spam type classification (0-1)';
COMMENT ON COLUMN predictions.spam_type_explanation IS 'Human-readable explanation of classification';
COMMENT ON COLUMN predictions.ai_spam_score IS 'AI spam pattern score (0-10)';
COMMENT ON COLUMN predictions.traditional_spam_score IS 'Traditional spam pattern score (0-10)';
COMMENT ON COLUMN predictions.ham_score IS 'Ham (legitimate) pattern score (0-10)';
