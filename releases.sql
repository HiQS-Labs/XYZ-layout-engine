-- releases-app canonical dump (GH-32 grammar: GID-keyed rows, natural keys elsewhere,
-- no integer PKs/FKs as values; rebuild renumbers deterministically)
-- generation: 2
-- table: schema_migrations
INSERT INTO schema_migrations(version, applied_at) VALUES('1', '2026-10-01T18:15:14Z');
INSERT INTO schema_migrations(version, applied_at) VALUES('2', '2026-10-01T18:15:14Z');
INSERT INTO schema_migrations(version, applied_at) VALUES('3', '2026-10-01T18:15:14Z');
INSERT INTO schema_migrations(version, applied_at) VALUES('4', '2026-10-01T18:15:14Z');
INSERT INTO schema_migrations(version, applied_at) VALUES('5', '2026-10-01T18:15:14Z');
INSERT INTO schema_migrations(version, applied_at) VALUES('6', '2026-10-01T18:15:14Z');
INSERT INTO schema_migrations(version, applied_at) VALUES('7', '2026-10-01T18:15:14Z');
INSERT INTO schema_migrations(version, applied_at) VALUES('8', '2026-10-01T18:15:14Z');
INSERT INTO schema_migrations(version, applied_at) VALUES('9', '2026-10-01T18:15:14Z');
-- table: settings
INSERT INTO settings(key, value, updated_at) VALUES('enforcement', 'lenient', '2026-10-01T18:15:14Z');
INSERT INTO settings(key, value, updated_at) VALUES('generation', '2', '2026-10-09T05:30:21Z');
INSERT INTO settings(key, value, updated_at) VALUES('repo_slug', 'XYZ-layout-engine', '2026-10-01T18:15:14Z');
-- table: repos
INSERT INTO repos(global_id, slug, updated_at) VALUES('repo-01M3WATZ7NDF91ERJZE2C3RJ14', 'XYZ-layout-engine', '2026-10-01T18:15:14Z');
-- table: roadmap_items
INSERT INTO roadmap_items(global_id, repo_gid, gh_number, title, section, position, status_marker, complexity, risk, effort, doc_path, issue_url, raw_text, first_seen, updated_at, rating_pri, rating_sev, rating_appeal, rating_effort, rating_ovr, status_label) VALUES('rmi-01M4FJ85W5YRFM3WZM88KQ301B', 'repo-01M3WATZ7NDF91ERJZE2C3RJ14', '5', 'MVP foundation: reusable recipes, resumable image generation, and faster rendering', 'Queue / parked intake', '1', '🆕', NULL, NULL, NULL, 'PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md', 'https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5', '- **GH-5 · MVP foundation: reusable recipes, resumable image generation, and faster rendering** — Proposed; [capture](PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md); rated 75/55/50/25', '2026-10-09T05:30:21Z', '2026-10-09T05:30:21Z', '75', '55', '50', '25', NULL, NULL);
-- table: op_receipts
INSERT INTO op_receipts(op, target_gid, at, txn_id, session_id, state_digest_before, state_digest_after) VALUES('roadmap-add', 'rmi-01M4FJ85W5YRFM3WZM88KQ301B', '2026-10-09T05:30:21Z', '0b5391eb7d5b458d92f6e6481a93a843', 'default', '3fff66affea1ffb6cf08f25116ffbff3e7eb7183f526f959441d551fc734e190', '719d1af7e2d50e8a4c0ff9643d834f943a2a6adca4205308da465ac55adcf901');
-- table: work_events
INSERT INTO work_events(global_id, repo_gid, gh_number, txn_id, event, payload, at) VALUES('wev-01M4FJ85W9MMH0B7MWFJAVRPFP', 'repo-01M3WATZ7NDF91ERJZE2C3RJ14', '5', '0b5391eb7d5b458d92f6e6481a93a843', 'parked', '{"section": "Queue / parked intake"}', '2026-10-09T05:30:21Z');
