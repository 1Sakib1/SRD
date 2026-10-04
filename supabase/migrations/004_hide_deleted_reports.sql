-- 004_hide_deleted_reports.sql
--
-- Admin "delete" is a soft delete: the row stays in public.reports with
-- status = 'archived_deleted' so it remains available for ML/research training.
-- Previously the SELECT policy was USING (true), so a soft-deleted report was
-- still readable by anyone with the anon key -- client-side filters hid it from
-- the UI, but /rest/v1/reports returned it to anyone who asked.
--
-- This enforces the rule in the database, so it holds for every client at once.
--
-- Deliberately NOT affected:
--   * service_role bypasses RLS, so the edge function and any research/export
--     job still read every row, including archived_deleted ones.
--   * AdminDashboard lists reports through the edge function (service_role),
--     not through the anon client, so admin views are unchanged.

drop policy if exists "Anyone can view reports" on public.reports;

create policy "Anyone can view non-deleted reports"
  on public.reports
  for select
  using (status <> 'archived_deleted');
