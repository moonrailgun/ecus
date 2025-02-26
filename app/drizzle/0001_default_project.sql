-- Custom SQL migration file, put you code below! --

-- Insert default project
INSERT INTO "public"."project" ("id", "name") VALUES ('mxcv71ljj1l4elkqu0crv3i3', 'Default');

-- Add default channel
INSERT INTO "public"."channel" ("id", "project_id", "name") VALUES ('es48bumsin9fo1afor6on4c9', 'mxcv71ljj1l4elkqu0crv3i3', 'Production');
