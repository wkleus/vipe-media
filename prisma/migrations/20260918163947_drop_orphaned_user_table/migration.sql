-- Drop the orphaned "User" table left over from an earlier, abandoned
-- next-auth-style schema attempt. Superseded by Better Auth's lowercase
-- "user" table (see migration 20260918163145_add_better_auth).
DROP TABLE IF EXISTS "User";