CREATE TABLE `game_sessions` (
 `id` text PRIMARY KEY NOT NULL,
 `name` text NOT NULL,
 `revision` integer NOT NULL DEFAULT 1,
 `writer` text NOT NULL,
 `snapshot` text NOT NULL,
 `summary` text NOT NULL,
 `created_at` integer NOT NULL,
 `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `app_state` (
 `key` text PRIMARY KEY NOT NULL,
 `value` text NOT NULL
);
