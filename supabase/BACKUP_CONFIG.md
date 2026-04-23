# EthioHerd Connect - Database Backup Configuration
# ==============================================
# Supabase provides automatic backups for Pro projects
# This file documents the backup strategy and can be used for CI/CD

# Backup Configuration (applies to Supabase Pro)
# -----------------------------------------------
# - Daily automatic backups retained for 7 days
# - Point-in-time recovery enabled
# - Weekly full backup on Sundays
# - Monthly archive retention: 12 months

# To configure backups via Supabase CLI:
# supabase db remote commit --db-url [your-database-url]

# Manual Backup Commands
# ----------------------
# Create manual backup:
# supabase db dump --db-url [your-database-url] > backup_$(date +%Y%m%d).sql

# Restore from backup:
# psql $DATABASE_URL -f backup_20240101.sql

# Point-in-Time Recovery
# -----------------------
# Supabase Pro supports point-in-time recovery.
# Enable via: Supabase Dashboard > Settings > Database
# Recovery window: 7 days (default for Pro)

# Export Configuration
# --------------------
# For external backup storage, use these tables:
# - All data is in: public schema
# - Auth data in: auth schema (managed by Supabase)
# - Storage metadata in: storage schema

# Recommended external backup schedule:
# - Daily: Full database export at 2:00 AM EAT
# - Weekly: Complete archive every Sunday
# - Monthly: Long-term archive on 1st of each month

# Environment Variables for Backup
# ---------------------------------
# BACKUP_ENABLED=true
# BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
# BACKUP_RETENTION_DAYS=7

# Disaster Recovery Plan
# ---------------------
# 1. Check Supabase dashboard for backup status
# 2. In case of data loss:
#    a. Stop all write operations
#    b. Identify last known good backup
#    c. Restore database from backup
#    d. Verify data integrity
#    e. Resume operations

# Contact: support@supabase.com for backup assistance
