CREATE INDEX IF NOT EXISTS "idx_masks_scene_id" ON "masks" USING btree ("scene_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_masks_category" ON "masks" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_renders_scene_id" ON "renders" USING btree ("scene_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scenes_project_id" ON "scenes" USING btree ("project_id");