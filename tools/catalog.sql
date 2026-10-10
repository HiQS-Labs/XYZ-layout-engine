-- XYZ Layout Engine recipe catalog; migration 1; canonical LF dump.
-- GIDs retained; rows ordered by natural keys; no timestamps or binary database.
CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY CHECK(version = 1)) STRICT;
CREATE TABLE recipes (gid TEXT PRIMARY KEY, serial INTEGER NOT NULL UNIQUE CHECK(serial BETWEEN 1 AND 9999), slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','deprecated','retired')), reason TEXT NOT NULL) STRICT;
CREATE TABLE recipe_versions (gid TEXT PRIMARY KEY, recipe_gid TEXT NOT NULL REFERENCES recipes(gid), version TEXT NOT NULL, content_sha256 TEXT NOT NULL, schema_sha256 TEXT NOT NULL, UNIQUE(recipe_gid,version)) STRICT;
CREATE TABLE recipe_version_files (version_gid TEXT NOT NULL REFERENCES recipe_versions(gid), path TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('module','schema','content')), sha256 TEXT NOT NULL, PRIMARY KEY(version_gid,path)) STRICT;
CREATE TABLE recipe_outputs (version_gid TEXT NOT NULL REFERENCES recipe_versions(gid), format TEXT NOT NULL CHECK(format IN ('png','svg','html','html-inline')), PRIMARY KEY(version_gid,format)) STRICT;
CREATE TRIGGER recipes_no_delete BEFORE DELETE ON recipes BEGIN SELECT RAISE(ABORT,'recipe identity retained'); END;
CREATE TRIGGER recipes_identity BEFORE UPDATE OF gid,serial,slug ON recipes BEGIN SELECT RAISE(ABORT,'recipe identity immutable'); END;
CREATE TRIGGER versions_no_update BEFORE UPDATE ON recipe_versions BEGIN SELECT RAISE(ABORT,'published version immutable'); END;
CREATE TRIGGER versions_no_delete BEFORE DELETE ON recipe_versions BEGIN SELECT RAISE(ABORT,'published version immutable'); END;
CREATE TRIGGER files_no_update BEFORE UPDATE ON recipe_version_files BEGIN SELECT RAISE(ABORT,'published files immutable'); END;
CREATE TRIGGER files_no_delete BEFORE DELETE ON recipe_version_files BEGIN SELECT RAISE(ABORT,'published files immutable'); END;
CREATE TRIGGER outputs_no_update BEFORE UPDATE ON recipe_outputs BEGIN SELECT RAISE(ABORT,'published outputs immutable'); END;
CREATE TRIGGER outputs_no_delete BEFORE DELETE ON recipe_outputs BEGIN SELECT RAISE(ABORT,'published outputs immutable'); END;
INSERT INTO schema_migrations VALUES (1);
