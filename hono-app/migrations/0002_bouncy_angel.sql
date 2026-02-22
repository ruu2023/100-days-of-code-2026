CREATE TABLE `tango_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
