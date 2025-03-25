CREATE INDEX IF NOT EXISTS "access_log_project_id_idx" ON "access_log" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "access_log_client_id_idx" ON "access_log" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "access_log_created_at_idx" ON "access_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "access_log_client_created_idx" ON "access_log" USING btree ("client_id","created_at");