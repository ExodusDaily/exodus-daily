import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { Pillar, Video, Article, Subscriber, InsertVideo, InsertArticle, InsertSubscriber } from "@shared/schema";

// Use persistent disk on Render (/data), fallback to local for dev
const DB_PATH = process.env.NODE_ENV === 'production' ? '/data/exodus.db' : 'exodus.db';
const sqlite = new Database(DB_PATH);
export const db = drizzle(sqlite, { schema });

// Run migrations
db.run(`
  CREATE TABLE IF NOT EXISTS pillars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    youtube_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    pillar_id TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL DEFAULT '',
    published_at TEXT NOT NULL,
    duration TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER,
    pillar_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    featured INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    created_at TEXT NOT NULL
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  )
`);

// Seed pillars if empty
const pillarCount = db.select().from(schema.pillars).all().length;
if (pillarCount === 0) {
  const seedPillars = [
    { id: "faith-flag", name: "Faith & Flag", description: "Political issues through a biblical lens — government, elections, sovereignty, and the Christian's civic duty.", icon: "Flag", color: "red", sortOrder: 1 },
    { id: "faith-family", name: "Faith & Family", description: "Cultural issues affecting families — fatherhood, marriage, parenting, and raising children with biblical values.", icon: "Home", color: "amber", sortOrder: 2 },
    { id: "faith-fitness", name: "Faith & Fitness", description: "Food freedom, medicine liberty, and physical stewardship from a biblical perspective.", icon: "Shield", color: "green", sortOrder: 3 },
    { id: "faith-finance", name: "Faith & Finance", description: "Christian stewardship of personal and national wealth — biblical economics, debt, and God's design for money.", icon: "DollarSign", color: "blue", sortOrder: 4 },
    { id: "faith-facts", name: "Faith & Facts", description: "Confronting false teachers, twisted Scripture, and wolves in pulpits — biblical truth is not up for negotiation.", icon: "AlertTriangle", color: "purple", sortOrder: 5 },
  ];
  for (const p of seedPillars) {
    db.insert(schema.pillars).values(p).run();
  }
}

export interface IStorage {
  // Pillars
  getPillars(): Pillar[];
  getPillar(id: string): Pillar | undefined;

  // Videos
  getVideos(pillarId?: string): Video[];
  getVideo(id: number): Video | undefined;
  getVideoByYoutubeId(youtubeId: string): Video | undefined;
  createVideo(data: InsertVideo): Video;
  updateVideo(id: number, data: Partial<InsertVideo>): Video | undefined;
  deleteVideo(id: number): void;

  // Articles
  getArticles(pillarId?: string, status?: string): Article[];
  getArticle(id: number): Article | undefined;
  getArticleBySlug(slug: string): Article | undefined;
  createArticle(data: InsertArticle): Article;
  updateArticle(id: number, data: Partial<InsertArticle>): Article | undefined;
  deleteArticle(id: number): void;

  // Subscribers
  createSubscriber(data: InsertSubscriber): Subscriber;
  getSubscribers(): Subscriber[];
}

export const storage: IStorage = {
  // Pillars
  getPillars() {
    return db.select().from(schema.pillars).all();
  },
  getPillar(id: string) {
    return db.select().from(schema.pillars).where(eq(schema.pillars.id, id)).get();
  },

  // Videos
  getVideos(pillarId?: string) {
    if (pillarId) {
      return db.select().from(schema.videos).where(eq(schema.videos.pillarId, pillarId)).orderBy(desc(schema.videos.createdAt)).all();
    }
    return db.select().from(schema.videos).orderBy(desc(schema.videos.createdAt)).all();
  },
  getVideo(id: number) {
    return db.select().from(schema.videos).where(eq(schema.videos.id, id)).get();
  },
  getVideoByYoutubeId(youtubeId: string) {
    return db.select().from(schema.videos).where(eq(schema.videos.youtubeId, youtubeId)).get();
  },
  createVideo(data: InsertVideo) {
    return db.insert(schema.videos).values({ ...data, createdAt: new Date().toISOString() }).returning().get();
  },
  updateVideo(id: number, data: Partial<InsertVideo>) {
    return db.update(schema.videos).set(data).where(eq(schema.videos.id, id)).returning().get();
  },
  deleteVideo(id: number) {
    db.delete(schema.videos).where(eq(schema.videos.id, id)).run();
  },

  // Articles
  getArticles(pillarId?: string, status?: string) {
    let q = db.select().from(schema.articles);
    if (pillarId && status) {
      return db.select().from(schema.articles).where(and(eq(schema.articles.pillarId, pillarId), eq(schema.articles.status, status))).orderBy(desc(schema.articles.createdAt)).all();
    } else if (pillarId) {
      return db.select().from(schema.articles).where(eq(schema.articles.pillarId, pillarId)).orderBy(desc(schema.articles.createdAt)).all();
    } else if (status) {
      return db.select().from(schema.articles).where(eq(schema.articles.status, status)).orderBy(desc(schema.articles.createdAt)).all();
    }
    return db.select().from(schema.articles).orderBy(desc(schema.articles.createdAt)).all();
  },
  getArticle(id: number) {
    return db.select().from(schema.articles).where(eq(schema.articles.id, id)).get();
  },
  getArticleBySlug(slug: string) {
    return db.select().from(schema.articles).where(eq(schema.articles.slug, slug)).get();
  },
  createArticle(data: InsertArticle) {
    return db.insert(schema.articles).values({ ...data, createdAt: new Date().toISOString() }).returning().get();
  },
  updateArticle(id: number, data: Partial<InsertArticle>) {
    return db.update(schema.articles).set(data).where(eq(schema.articles.id, id)).returning().get();
  },
  deleteArticle(id: number) {
    db.delete(schema.articles).where(eq(schema.articles.id, id)).run();
  },

  // Subscribers
  createSubscriber(data: InsertSubscriber) {
    return db.insert(schema.subscribers).values({ ...data, createdAt: new Date().toISOString() }).returning().get();
  },
  getSubscribers() {
    return db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt)).all();
  },
};
