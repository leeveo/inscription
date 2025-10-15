# Database Migrations

## How to Apply Migration: Add Intervenant and Programme to Sessions

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run the Migration SQL

Copy and paste the contents of `add_intervenant_programme_to_sessions.sql` into the SQL editor and click **Run**.

This will:
- Add `intervenant_id` column (nullable foreign key to `inscription_intervenants`)
- Add `programme` column (text field for session program details)
- Create index on `intervenant_id` for better performance
- Add comments explaining the new columns

### Step 3: Verify Migration

Run this query to verify the migration was successful:

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'inscription_sessions'
  AND column_name IN ('intervenant_id', 'programme');
```

You should see both columns listed.

### Step 4: Test the Application

1. Restart your development server
2. Navigate to an event edit page
3. Go to the "Sessions" tab
4. Click "Ajouter une session"
5. You should now see:
   - A dropdown list to select an intervenant
   - The selected intervenant's profile card below the dropdown
   - A "Programme de la session" textarea field

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the columns
ALTER TABLE inscription_sessions DROP COLUMN IF EXISTS intervenant_id;
ALTER TABLE inscription_sessions DROP COLUMN IF EXISTS programme;

-- Remove the index
DROP INDEX IF EXISTS idx_sessions_intervenant_id;
```

## Notes

- The `intervenant_id` field is nullable, so sessions can exist without an assigned speaker
- The old `intervenant` text field is kept for backward compatibility
- Sessions will cascade to NULL if the linked intervenant is deleted (ON DELETE SET NULL)
