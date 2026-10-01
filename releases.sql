-- releases-app canonical dump (GH-32 grammar: GID-keyed rows, natural keys elsewhere,
-- no integer PKs/FKs as values; rebuild renumbers deterministically)
-- generation: 1
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
INSERT INTO settings(key, value, updated_at) VALUES('generation', '1', '2026-10-01T18:15:14Z');
INSERT INTO settings(key, value, updated_at) VALUES('repo_slug', 'XYZ-layout-engine', '2026-10-01T18:15:14Z');
-- table: repos
INSERT INTO repos(global_id, slug, updated_at) VALUES('repo-01M3WATZ7NDF91ERJZE2C3RJ14', 'XYZ-layout-engine', '2026-10-01T18:15:14Z');
