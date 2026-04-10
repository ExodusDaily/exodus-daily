import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertVideoSchema, insertArticleSchema, insertSubscriberSchema } from "@shared/schema";
import { z } from "zod";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "exodus2026";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 80);
}

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["x-admin-password"];
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export function registerRoutes(httpServer: Server, app: Express) {
  // ── Public routes ──────────────────────────────────────────────

  // Pillars
  app.get("/api/pillars", (_req, res) => {
    const pillars = storage.getPillars().sort((a, b) => a.sortOrder - b.sortOrder);
    res.json(pillars);
  });

  // Videos (public — only needed fields)
  app.get("/api/videos", (req, res) => {
    const { pillar } = req.query;
    const videos = storage.getVideos(pillar as string | undefined);
    res.json(videos);
  });

  app.get("/api/videos/:id", (req, res) => {
    const video = storage.getVideo(Number(req.params.id));
    if (!video) return res.status(404).json({ error: "Not found" });
    res.json(video);
  });

  // Articles (public — only published)
  app.get("/api/articles", (req, res) => {
    const { pillar } = req.query;
    const articles = storage.getArticles(pillar as string | undefined, "published");
    res.json(articles);
  });

  app.get("/api/articles/slug/:slug", (req, res) => {
    const article = storage.getArticleBySlug(req.params.slug);
    if (!article || article.status !== "published") return res.status(404).json({ error: "Not found" });
    res.json(article);
  });

  // Subscribe
  app.post("/api/subscribe", (req, res) => {
    const result = insertSubscriberSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid email" });
    try {
      const subscriber = storage.createSubscriber(result.data);
      res.json({ success: true, subscriber });
    } catch (e: any) {
      if (e.message?.includes("UNIQUE")) {
        return res.json({ success: true, message: "Already subscribed" });
      }
      res.status(500).json({ error: "Server error" });
    }
  });

  // ── Admin routes ───────────────────────────────────────────────

  // Auth check
  app.post("/api/admin/auth", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  // Fetch YouTube metadata
  app.post("/api/admin/youtube/fetch", requireAdmin, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    // Extract YouTube ID from various URL formats
    let videoId: string | null = null;
    const patterns = [
      /(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) { videoId = match[1]; break; }
    }
    if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

    // Check if already imported
    const existing = storage.getVideoByYoutubeId(videoId);
    if (existing) return res.status(409).json({ error: "Video already imported", video: existing });

    try {
      // Fetch oEmbed metadata (no API key needed)
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const oembedRes = await fetch(oembedUrl);
      if (!oembedRes.ok) return res.status(400).json({ error: "Could not fetch YouTube metadata" });
      const oembed = await oembedRes.json() as any;

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      res.json({
        youtubeId: videoId,
        title: oembed.title || "",
        thumbnailUrl,
        authorName: oembed.author_name || "",
      });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch YouTube data" });
    }
  });

  // Import video
  app.post("/api/admin/videos", requireAdmin, (req, res) => {
    const result = insertVideoSchema.safeParse({
      ...req.body,
      publishedAt: req.body.publishedAt || new Date().toISOString(),
    });
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    try {
      const video = storage.createVideo(result.data);
      res.json(video);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/admin/videos/:id", requireAdmin, (req, res) => {
    const video = storage.updateVideo(Number(req.params.id), req.body);
    if (!video) return res.status(404).json({ error: "Not found" });
    res.json(video);
  });

  app.delete("/api/admin/videos/:id", requireAdmin, (req, res) => {
    storage.deleteVideo(Number(req.params.id));
    res.json({ success: true });
  });

  // Admin: get all articles (including drafts)
  app.get("/api/admin/articles", requireAdmin, (req, res) => {
    const { pillar } = req.query;
    const articles = storage.getArticles(pillar as string | undefined);
    res.json(articles);
  });

  // Generate article draft from video (AI draft)
  app.post("/api/admin/articles/generate", requireAdmin, async (req, res) => {
    const { videoId, pillarId, title } = req.body;
    if (!title || !pillarId) return res.status(400).json({ error: "title and pillarId required" });

    // Generate a structured article draft
    const slug = slugify(title) + "-" + Date.now().toString(36);
    const pillarNames: Record<string, string> = {
      "faith-flag": "Faith & Flag",
      "faith-family": "Faith & Family",
      "faith-fitness": "Faith & Fitness",
      "faith-finance": "Faith & Finance",
    };
    const pillarName = pillarNames[pillarId] || pillarId;

    const excerpt = `A biblical examination of ${title.toLowerCase()} — from the ${pillarName} perspective on The Todd Herman Show.`;

    const body = `## Introduction

In this episode of The Todd Herman Show, Todd examines **${title}** through the lens of Scripture and the ${pillarName} pillar. As men of faith, we are called to think biblically about every area of life — not just Sunday morning.

## What Scripture Says

The Bible is not silent on this issue. God's Word gives us a clear framework for understanding what is happening in our culture and how we are to respond as followers of Christ.

> *"For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope."* — Jeremiah 29:11

## The Cultural Moment

We are living through a moment of profound pressure on Christian families, institutions, and values. The forces arrayed against biblical truth are real — but they are not new, and they are not sovereign.

## Todd's Analysis

[This section will be expanded from the video transcript. Paste key talking points here.]

## What Christian Men Must Do

1. **Stay informed through Scripture** — Read the Word first, the news second
2. **Lead your household** — The responsibility starts at home
3. **Engage, don't retreat** — Biblical engagement with culture is obedience, not compromise
4. **Pray with urgency** — Our real battle is not against flesh and blood

## Conclusion

The stakes are high — but so is our confidence. The God who created nations is sovereign over them. We are called to be faithful, not fearful.

*Watch the full video on [The Todd Herman Show YouTube Channel](https://www.youtube.com/@TheToddHermanShow) and subscribe for new content weekly.*`;

    res.json({ slug, excerpt, body, title, pillarId, videoId: videoId || null });
  });

  // Create article
  app.post("/api/admin/articles", requireAdmin, (req, res) => {
    const slug = req.body.slug || slugify(req.body.title || "") + "-" + Date.now().toString(36);
    const result = insertArticleSchema.safeParse({
      ...req.body,
      slug,
      publishedAt: req.body.status === "published" ? new Date().toISOString() : null,
    });
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    try {
      const article = storage.createArticle(result.data);
      res.json(article);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/admin/articles/:id", requireAdmin, (req, res) => {
    const updates: any = { ...req.body };
    if (updates.status === "published" && !updates.publishedAt) {
      updates.publishedAt = new Date().toISOString();
    }
    const article = storage.updateArticle(Number(req.params.id), updates);
    if (!article) return res.status(404).json({ error: "Not found" });
    res.json(article);
  });

  app.delete("/api/admin/articles/:id", requireAdmin, (req, res) => {
    storage.deleteArticle(Number(req.params.id));
    res.json({ success: true });
  });

  // Admin: subscribers list
  app.get("/api/admin/subscribers", requireAdmin, (_req, res) => {
    res.json(storage.getSubscribers());
  });

  // Admin: all videos
  app.get("/api/admin/videos", requireAdmin, (req, res) => {
    const { pillar } = req.query;
    res.json(storage.getVideos(pillar as string | undefined));
  });
}
