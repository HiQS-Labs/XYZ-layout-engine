-- releases-app canonical dump (GH-32 grammar: GID-keyed rows, natural keys elsewhere,
-- no integer PKs/FKs as values; rebuild renumbers deterministically)
-- generation: 6
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
INSERT INTO settings(key, value, updated_at) VALUES('generation', '6', '2026-10-02T04:52:26Z');
INSERT INTO settings(key, value, updated_at) VALUES('repo_slug', 'XYZ-layout-engine', '2026-10-01T18:15:14Z');
-- table: repos
INSERT INTO repos(global_id, slug, updated_at) VALUES('repo-01M3WATZ7NDF91ERJZE2C3RJ14', 'XYZ-layout-engine', '2026-10-01T18:15:14Z');
-- table: issue_refs
INSERT INTO issue_refs(global_id, url, temp_id, created_at, updated_at) VALUES('ref-01M3XF4BSN3BYNQ9KQFZWX664Q', 'https://github.com/HiQS-Labs/XYZ-layout-engine/issues/1', NULL, '2026-10-02T04:49:30Z', '2026-10-02T04:49:30Z');
-- table: marathons
INSERT INTO marathons(global_id, repo_gid, tracking_ref_gid, status, created_at, updated_at) VALUES('mar-01M3XF4BSKA4B4QPC5NV2484MH', 'repo-01M3WATZ7NDF91ERJZE2C3RJ14', 'ref-01M3XF4BSN3BYNQ9KQFZWX664Q', 'planned', '2026-10-02T04:49:30Z', '2026-10-02T04:49:30Z');
-- table: roadmap_items
INSERT INTO roadmap_items(global_id, repo_gid, gh_number, title, section, position, status_marker, complexity, risk, effort, doc_path, issue_url, raw_text, first_seen, updated_at, rating_pri, rating_sev, rating_appeal, rating_effort, rating_ovr, status_label) VALUES('rmi-01M3XF4BMSA6K2F4QZN8KZN6C4', 'repo-01M3WATZ7NDF91ERJZE2C3RJ14', '1', 'XYZ Layout Engine: Phase 0 renderer and reference infographic spike', 'In progress', '1', '🚧', NULL, NULL, NULL, 'PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md', 'https://github.com/HiQS-Labs/XYZ-layout-engine/issues/1', '- **GH-1 · Renderer spike preparation** — [plan](PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md) · [PRD](PROJECT/2-WORKING/SPECS-PRD.md) · no dispatch yet.', '2026-10-02T04:49:30Z', '2026-10-02T04:52:26Z', NULL, NULL, NULL, NULL, NULL, NULL);
-- table: op_receipts
INSERT INTO op_receipts(op, target_gid, at, txn_id, session_id, state_digest_before, state_digest_after) VALUES('roadmap-add', 'rmi-01M3XF4BMSA6K2F4QZN8KZN6C4', '2026-10-02T04:49:30Z', '30c281b053da4786bc1d7b91d8af1775', 'default', '3fff66affea1ffb6cf08f25116ffbff3e7eb7183f526f959441d551fc734e190', '1a6fd8341bb722ee11aef5d3f990132b2b97a6c845b744e34bb448b97ed91330');
INSERT INTO op_receipts(op, target_gid, at, txn_id, session_id, state_digest_before, state_digest_after) VALUES('marathon-add', 'mar-01M3XF4BSKA4B4QPC5NV2484MH', '2026-10-02T04:49:30Z', 'f7c064445e534c7187d7a7ee351ba304', 'default', '1a6fd8341bb722ee11aef5d3f990132b2b97a6c845b744e34bb448b97ed91330', '354f8de3a4f3ce2a631a97bb94ee599c0731f06bb191c417309909f8a4e9cfeb');
INSERT INTO op_receipts(op, target_gid, at, txn_id, session_id, state_digest_before, state_digest_after) VALUES('roadmap-repoint', 'rmi-01M3XF4BMSA6K2F4QZN8KZN6C4', '2026-10-02T04:52:05Z', '641918bf24b448f491425f41216b2a28', 'default', '354f8de3a4f3ce2a631a97bb94ee599c0731f06bb191c417309909f8a4e9cfeb', '3cbeeb3b1084e9099bf9c0f0173328c097dc71417df7a2af7a1a05aa6dc5f35b');
INSERT INTO op_receipts(op, target_gid, at, txn_id, session_id, state_digest_before, state_digest_after) VALUES('roadmap-rate', 'rmi-01M3XF4BMSA6K2F4QZN8KZN6C4', '2026-10-02T04:52:05Z', 'b887d2399e8040de821d7deec2b39db9', 'default', '3cbeeb3b1084e9099bf9c0f0173328c097dc71417df7a2af7a1a05aa6dc5f35b', 'c9f10a2c0d46e06af94242e3085884e07ea2e6e00e67e544cc38a4ab031735f4');
INSERT INTO op_receipts(op, target_gid, at, txn_id, session_id, state_digest_before, state_digest_after) VALUES('roadmap-update', 'rmi-01M3XF4BMSA6K2F4QZN8KZN6C4', '2026-10-02T04:52:26Z', '20ccb3955ec340fd8e4b34e05ad97a8e', 'default', 'c9f10a2c0d46e06af94242e3085884e07ea2e6e00e67e544cc38a4ab031735f4', '81e8c50f351d30ae07f89004910ee250bb11df12e8205a58fa816c044b8c7867');
-- table: work_events
INSERT INTO work_events(global_id, repo_gid, gh_number, txn_id, event, payload, at) VALUES('wev-01M3XF4BMX57F40A0HTD52S46J', 'repo-01M3WATZ7NDF91ERJZE2C3RJ14', '1', '30c281b053da4786bc1d7b91d8af1775', 'parked', '{"section": "Queue / parked intake"}', '2026-10-02T04:49:30Z');
INSERT INTO work_events(global_id, repo_gid, gh_number, txn_id, event, payload, at) VALUES('wev-01M3XF92M7DSDN8RWMSNE0Q9AH', 'repo-01M3WATZ7NDF91ERJZE2C3RJ14', '1', 'b887d2399e8040de821d7deec2b39db9', 'rated', '{"rated": "85/20/80/65"}', '2026-10-02T04:52:05Z');
INSERT INTO work_events(global_id, repo_gid, gh_number, txn_id, event, payload, at) VALUES('wev-01M3XF9Q86Q5B2G0FWFS55CRJ5', 'repo-01M3WATZ7NDF91ERJZE2C3RJ14', '1', '20ccb3955ec340fd8e4b34e05ad97a8e', 'in_flight', '{"marker": "\ud83d\udea7", "section": "In progress", "source": "roadmap-update", "transition": true}', '2026-10-02T04:52:26Z');
