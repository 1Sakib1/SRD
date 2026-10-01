-- 003_vote_report_distinct_voters.sql
--
-- Closes the report-wipe vulnerability in public.vote_report().
--
-- BEFORE: vote_report() was callable by `anon` with no dedupe, and 4 'not_there'
--   votes auto-deleted a report. A single anonymous caller could delete ANY report
--   with 4 HTTP calls to /rest/v1/rpc/vote_report -- i.e. wipe the whole map in a loop.
--   The vote_events provenance insert was wrapped in `EXCEPTION WHEN OTHERS THEN NULL`,
--   so it recorded nothing and blocked nothing (vote_events was empty).
--
-- AFTER: voting stays open to guests, but DELETION requires 4 DISTINCT SIGNED-IN
--   voters. An attacker now needs 4 real accounts per report instead of 4 HTTP calls.
--
-- The function signature is unchanged, so no frontend change is required.

-- ---------------------------------------------------------------------------
-- 1. Dedupe key for signed-in voters.
--    user_id is NULLable and NULLs are distinct in a unique index, so guests can
--    still vote repeatedly (open voting) while a signed-in user gets one row per
--    (report, vote). vote_events is currently empty, so this cannot fail on
--    pre-existing duplicates.
-- ---------------------------------------------------------------------------
create unique index if not exists vote_events_unique_user_vote
  on public.vote_events (report_id, user_id, vote);

-- ---------------------------------------------------------------------------
-- 2. Rewritten vote_report().
-- ---------------------------------------------------------------------------
create or replace function public.vote_report(p_report_id uuid, p_vote_type text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid              uuid := auth.uid();
  v_rows             int  := 0;
  v_distinct_voters  int  := 0;
  v_votes_snapshot   jsonb;
begin
  -- Unchanged: only these two types affect counters. 'cleaned' is accepted by the
  -- vote_events CHECK constraint but was ignored before, so it stays ignored here.
  if p_vote_type not in ('still_there', 'not_there') then
    return;
  end if;

  if not exists (select 1 from public.reports where id = p_report_id) then
    return;
  end if;

  -- Record provenance FIRST, and let it decide whether the vote counts.
  -- No EXCEPTION swallow: a failure here must not silently become an uncounted vote.
  if v_uid is not null then
    insert into public.vote_events (report_id, user_id, vote)
    values (p_report_id, v_uid, p_vote_type)
    on conflict (report_id, user_id, vote) do nothing;
    get diagnostics v_rows = row_count;
  else
    -- Guest: always recorded, never deduped.
    insert into public.vote_events (report_id, user_id, vote)
    values (p_report_id, null, p_vote_type);
    v_rows := 1;
  end if;

  -- A signed-in user re-voting the same way is a no-op: counters no longer inflate.
  if v_rows = 0 then
    return;
  end if;

  if p_vote_type = 'still_there' then
    update public.reports
       set still_there_votes = still_there_votes + 1
     where id = p_report_id;
  else
    update public.reports
       set not_there_votes = not_there_votes + 1
     where id = p_report_id;
  end if;

  -- Deletion gate: 4 DISTINCT signed-in voters, not 4 raw votes.
  -- user_id IS NULL (guests) is excluded; count(distinct ...) ignores NULLs anyway,
  -- but the predicate makes the intent explicit. Note vote_events.user_id is
  -- ON DELETE SET NULL, so a deleted account stops contributing to the threshold.
  if p_vote_type = 'not_there' then
    select count(distinct e.user_id)
      into v_distinct_voters
      from public.vote_events e
     where e.report_id = p_report_id
       and e.vote = 'not_there'
       and e.user_id is not null;

    if v_distinct_voters >= 4 then
      -- Snapshot the votes BEFORE deleting. vote_events.report_id is
      -- ON DELETE CASCADE, so the old in-statement subselect relied on snapshot
      -- semantics to survive its own cascade. Doing it explicitly is unambiguous.
      select jsonb_agg(to_jsonb(e))
        into v_votes_snapshot
        from public.vote_events e
       where e.report_id = p_report_id;

      with d as (
        delete from public.reports
         where id = p_report_id
        returning *
      )
      insert into public.reports_archive (report_id, report, votes, reason)
      select d.id, to_jsonb(d), v_votes_snapshot, 'community_not_there_votes'
        from d;
    end if;
  end if;
end;
$function$;

-- Grants are unchanged on purpose: anon and authenticated keep EXECUTE so guest
-- voting keeps working. The function is SECURITY DEFINER with search_path = ''.
