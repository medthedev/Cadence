-- FreeTodo cloud sync schema for Supabase.
-- Paste this into the Supabase SQL Editor and run it once per project.
-- The app talks to the two RPC functions below using only the project URL
-- and the public anon key, so no direct table access is needed.

create table if not exists public.workspaces (
  code text primary key,
  data jsonb not null,
  revision integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

-- Block direct table access; all reads and writes go through the RPCs.
drop policy if exists "no_direct_access" on public.workspaces;
create policy "no_direct_access"
  on public.workspaces for all to anon
  using (false) with check (false);

create or replace function public.sync_pull(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.workspaces%rowtype;
begin
  select * into v_row from public.workspaces where code = upper(p_code);
  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'data', v_row.data,
    'revision', v_row.revision,
    'updatedAt', to_char(v_row.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
  );
end;
$$;

create or replace function public.sync_push(p_code text, p_data jsonb, p_revision integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.workspaces%rowtype;
  v_revision integer;
  v_updated text;
begin
  -- Serialize concurrent writes for the same sync code.
  perform pg_advisory_xact_lock(hashtext(upper(p_code)));

  select * into v_row from public.workspaces where code = upper(p_code);

  if found and v_row.revision <> p_revision then
    return jsonb_build_object(
      'conflict', true,
      'remote', jsonb_build_object(
        'data', v_row.data,
        'revision', v_row.revision,
        'updatedAt', to_char(v_row.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
      )
    );
  end if;

  v_revision := coalesce(v_row.revision, 0) + 1;

  insert into public.workspaces (code, data, revision, updated_at)
  values (upper(p_code), p_data, v_revision, now())
  on conflict (code) do update
    set data = excluded.data,
        revision = excluded.revision,
        updated_at = now();

  v_updated := to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"');
  return jsonb_build_object('revision', v_revision, 'updatedAt', v_updated);
end;
$$;

revoke all on function public.sync_pull(text) from public;
revoke all on function public.sync_push(text, jsonb, integer) from public;
grant execute on function public.sync_pull(text) to anon, authenticated;
grant execute on function public.sync_push(text, jsonb, integer) to anon, authenticated;
