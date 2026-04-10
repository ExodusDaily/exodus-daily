import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pillars
export const pillars = sqliteTable("pillars", {
  id: text("id").primaryKey(), // e.g. "faith-flag"
  name: text("name").notNull(), // e.g. "Faith & Flag"
  description: text("description").notNull(),
  icon: text("icon").notNull(), // lucide icon name
  color: text("color").notNull(), // tailwind color class
  sortOrder: integer("sort_order").notNull().default(0),
});

// Videos
export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  youtubeId: text("youtube_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  pillarId: text("pillar_id").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  publishedAt: text("published_at").notNull(),
  duration: text("duration").notNull().default(""),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

// Articles
export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  videoId: integer("video_id"),
  pillarId: text("pillar_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull(),
  status: text("status").notNull().default("draft"), // draft | published
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
});

// Subscribers
export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

// Insert schemas
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true });
export const insertSubscriberSchema = createInsertSchema(subscribers).omit({ id: true, createdAt: true });

// Types
export type Pillar = typeof pillars.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
