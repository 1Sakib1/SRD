-- EMERGENCY ROLLBACK for 003_vote_report_distinct_voters.sql
-- Restores vote_report() exactly as it was captured from the live DB before the change.
-- Apply this if voting misbehaves after 003.
drop index if exists public.vote_events_unique_user_vote;

CREATE OR REPLACE FUNCTION public.vote_report(p_report_id uuid, p_vote_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_uid uuid;
BEGIN
  IF p_vote_type = 'still_there' THEN
    UPDATE public.reports
    SET still_there_votes = still_there_votes + 1
    WHERE id = p_report_id;
  ELSIF p_vote_type = 'not_there' THEN
    UPDATE public.reports
    SET not_there_votes = not_there_votes + 1
    WHERE id = p_report_id;
  END IF;

  IF p_vote_type IN ('still_there', 'not_there') THEN
    BEGIN
      SELECT u.id INTO v_uid FROM public.users u WHERE u.id = auth.uid();
      INSERT INTO public.vote_events (report_id, user_id, vote)
      SELECT r.id, v_uid, p_vote_type FROM public.reports r WHERE r.id = p_report_id;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- provenance logging must never break the user-facing vote
    END;
  END IF;

  IF p_vote_type = 'not_there' THEN
    WITH d AS (
      DELETE FROM public.reports
      WHERE id = p_report_id AND not_there_votes >= 4
      RETURNING *
    )
    INSERT INTO public.reports_archive (report_id, report, votes, reason)
    SELECT d.id,
           to_jsonb(d),
           (SELECT jsonb_agg(to_jsonb(e)) FROM public.vote_events e WHERE e.report_id = d.id),
           'community_not_there_votes'
    FROM d;
  END IF;
END;
$function$;
