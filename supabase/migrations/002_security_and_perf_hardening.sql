-- 002_security_and_perf_hardening.sql
--
-- Resolves Supabase advisor findings WITHOUT changing application behavior.
-- Every statement below was verified against the live schema first; see the
-- rationale on each. Deliberately EXCLUDES advisor suggestions that would
-- break functionality (documented at the bottom).

-- 1. PERF: cover the vote_events.user_id foreign key (lint 0001).
--    Pure addition; speeds up FK checks and user-scoped vote lookups.
create index if not exists idx_vote_events_user_id
  on public.vote_events (user_id);

-- 2. PERF: drop a strictly redundant permissive SELECT policy on public.users (lint 0006).
--    "Users can view all profiles" is USING (true); "Users can view own profile" is
--    USING (auth.uid() = id) -- a strict subset. Both are PERMISSIVE SELECT for the
--    same roles, so removing the narrower one cannot reduce visibility. Clears 4 warnings.
drop policy if exists "Users can view own profile" on public.users;

-- 3. SECURITY: remove kv_store from the anon/authenticated API surface (lints 0026, 0027).
--    RLS is enabled on this table with zero policies, so anon/authenticated already get
--    nothing -- verified empirically: as anon, SELECT returns 0 of 219 rows. Revoking the
--    unused grant stops the table being discoverable in the public GraphQL/REST schema.
--    service_role is untouched, so the edge function keeps full access.
--    NOTE: if you ever add an RLS policy here for client reads, re-grant SELECT too.
revoke all on public.kv_store_3e3b490b from anon, authenticated;


-- ---------------------------------------------------------------------------
-- DELIBERATELY NOT CHANGED -- each of these advisor findings is either
-- intentional design or would break the app. Do not "fix" without a plan.
--
-- * view public.top_users is SECURITY DEFINER (lint 0010, ERROR)
--     KEEP AS IS. It is a deliberate safe projection (id, name, eco_points;
--     admins filtered) over kv_store_3e3b490b, which is RLS-locked with no
--     policies. Setting security_invoker = true makes it return ZERO rows and
--     the leaderboard goes blank. Verified: it currently returns 10 rows.
--
-- * vote_report() / user_count() executable by anon (lints 0028, 0029)
--     KEEP AS IS. Guest voting and the public user-count stat depend on these.
--     The usual SECURITY DEFINER risk is search_path hijacking; both already
--     set search_path = '', so that vector is closed.
--
-- * "Anyone can view reports" on public.reports (lint 0012)
--     INTENTIONAL. It is a public litter map; reports must be world-readable.
--
-- * "Public Access" on storage.objects (lint 0012)
--     INTENTIONAL. Report photos are served publicly.
--
-- * 7 unused indexes (lint 0005)
--     KEEP. "Unused" reflects low traffic, not uselessness. Dropping them
--     would hurt once the tables grow.
--
-- * ai_analyses / reports_archive / status_events / vote_events have RLS on
--   with no policies (lint 0008, INFO)
--     CORRECT AS IS. These are written server-side only (service_role bypasses
--     RLS). Deny-all to clients is the intended posture. anon/authenticated
--     already hold no grants on them.
-- ---------------------------------------------------------------------------
