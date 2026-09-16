# PLPE Game — Supabase auth client fix

Fixes `permission denied for table game_players` after email/password login.

Cause: the shared service-role Supabase client was also used for `signInWithPassword()`. Supabase Auth then attached the player's JWT to that singleton client, so later database operations ran under player RLS instead of service-role privileges.

Fix:
- keep one permanent service-role client for all `game_*` table operations;
- create an isolated temporary Supabase client for password verification only.

No SQL changes are required. After extracting, restart the backend.
