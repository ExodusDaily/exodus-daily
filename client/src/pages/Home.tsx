import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import SubscribeSection from "@/components/SubscribeSection";
import type { Video, Article, Pillar } from "@shared/schema";

const PILLAR_COLORS: Record<string, string> = {
  "faith-flag": "#e05252",
  "faith-family": "#f59e0b",
  "faith-fitness": "#34d399",
  "faith-finance": "#60a5fa",
  "faith-facts": "#c084fc",
};

const PILLAR_ICONS: Record<string, React.ReactNode> = {
  "faith-flag": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  "faith-family": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  "faith-fitness": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  "faith-finance": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  "faith-facts": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const PILLAR_VERSES: Record<string, string> = {
  "faith-flag": "Render to Caesar what is Caesar's, and to God what is God's. — Mark 12:17",
  "faith-family": "Train up a child in the way he should go; even when he is old he will not depart from it. — Proverbs 22:6",
  "faith-fitness": "Your body is a temple of the Holy Spirit. — 1 Corinthians 6:19",
  "faith-finance": "A just weight is His delight. — Proverbs 11:1",
  "faith-facts": "Beloved, do not believe every spirit, but test the spirits. — 1 John 4:1",
};

export default function Home() {
  const { data: pillars = [] } = useQuery<Pillar[]>({
    queryKey: ["/api/pillars"],
    queryFn: () => apiRequest("GET", "/api/pillars").then(r => r.json()),
  });

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    queryFn: () => apiRequest("GET", "/api/videos").then(r => r.json()),
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    queryFn: () => apiRequest("GET", "/api/articles").then(r => r.json()),
  });

  const featuredVideos = videos.filter(v => v.featured).slice(0, 3);
  const recentVideos = videos.slice(0, 6);
  const recentArticles = articles.slice(0, 3);

  const displayVideos = featuredVideos.length > 0 ? featuredVideos : recentVideos.slice(0, 3);

  return (
    <div>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-4" style={{ background: "linear-gradient(135deg, #0a1020 0%, #12213a 50%, #0d1526 100%)" }}>
        {/* Subtle cross watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <svg viewBox="0 0 200 200" className="w-96 h-96">
            <rect x="90" y="10" width="20" height="180" fill="#c9962a"/>
            <rect x="10" y="70" width="180" height="20" fill="#c9962a"/>
          </svg>
        </div>

        {/* Gold top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "var(--gold)" }} />

        <div className="relative max-w-4xl mx-auto text-center fade-up">
          <div className="inline-block mb-4 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase" style={{ background: "rgba(201,150,42,0.15)", color: "var(--gold)", border: "1px solid rgba(201,150,42,0.3)" }}>
            The Todd Herman Show
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-black leading-tight mb-6" style={{ color: "var(--cream)" }}>
            The Exodus<br />
            <span style={{ color: "var(--gold)" }}>Daily</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Biblical truth applied to politics, family, health, and money. <br className="hidden md:block"/>
            No compromise. No retreat. No apology.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => document.getElementById("subscribe")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 font-bold text-sm rounded uppercase tracking-wider"
              style={{ background: "var(--crimson)", color: "white" }}
            >
              Subscribe Free
            </button>
            <a
              href="https://www.youtube.com/@TheToddHermanShow"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 font-bold text-sm rounded uppercase tracking-wider border transition-colors hover:bg-white/10"
              style={{ color: "var(--cream)", borderColor: "rgba(245,240,232,0.3)" }}
            >
              Watch on YouTube
            </a>
          </div>

          {/* Radio / Podcast badge */}
          <p className="mt-6 text-xs text-gray-500 uppercase tracking-wider">
            Heard on 181 FM Stations · American Family Radio · Radio America Network
          </p>
        </div>
      </section>

      {/* ── FIVE PILLARS ──────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ background: "var(--navy)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--cream)" }}>Five Pillars. One Biblical Worldview.</h2>
            <span className="accent-line mx-auto" />
            <p className="mt-4 text-gray-400 text-base max-w-xl mx-auto">
              Every area of your life, examined through Scripture.
            </p>
          </div>
          {/* Pyramid layout: 2 on top row, 3 on bottom row */}
          {(() => {
            const sorted = pillars.slice().sort((a, b) => a.sortOrder - b.sortOrder);
            const topRow = sorted.slice(0, 2);
            const bottomRow = sorted.slice(2);
            const PillarCard = ({ pillar }: { pillar: typeof sorted[0] }) => (
              <Link key={pillar.id} href={`/pillar/${pillar.id}`}>
                <div className="card-lift rounded-lg p-6 border h-full cursor-pointer" style={{ background: "var(--navy-light)", borderColor: "rgba(201,150,42,0.15)" }}>
                  <div style={{ color: PILLAR_COLORS[pillar.id] || "#c9962a" }}>
                    {PILLAR_ICONS[pillar.id]}
                  </div>
                  <h3 className="font-display text-lg font-bold mt-3 mb-2" style={{ color: "var(--cream)" }}>{pillar.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{pillar.description}</p>
                  <p className="mt-4 text-xs italic" style={{ color: "rgba(201,150,42,0.7)" }}>
                    "{PILLAR_VERSES[pillar.id]}"
                  </p>
                </div>
              </Link>
            );
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-2/3 lg:mx-auto">
                  {topRow.map(pillar => <PillarCard key={pillar.id} pillar={pillar} />)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {bottomRow.map(pillar => <PillarCard key={pillar.id} pillar={pillar} />)}
                </div>
              </div>
            );
          })()}
          {/* End pyramid layout */}
        </div>
      </section>

      {/* ── LATEST VIDEOS ─────────────────────────────────────── */}
      {displayVideos.length > 0 && (
        <section className="py-16 px-4" style={{ background: "var(--navy-light)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--cream)" }}>Latest Videos</h2>
                <span className="accent-line" />
              </div>
              <a href="https://www.youtube.com/@TheToddHermanShow" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 hover:text-amber-300 font-medium hidden sm:block">
                View all on YouTube →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RADIO CTA ─────────────────────────────────────────── */}
      <section className="py-12 px-4 text-center" style={{ background: "var(--crimson)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(245,240,232,0.7)" }}>Heard on Radio</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--cream)" }}>
            Find Todd on 181 FM Stations Nationwide
          </h2>
          <p className="text-sm mb-5" style={{ color: "rgba(245,240,232,0.8)" }}>
            A Disciple's View on American Family Radio · Radio America Network
          </p>
          <a
            href="https://www.youtube.com/@TheToddHermanShow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 text-sm font-bold rounded uppercase tracking-wider border-2"
            style={{ borderColor: "var(--cream)", color: "var(--cream)" }}
          >
            Watch on YouTube Instead
          </a>
        </div>
      </section>

      {/* ── LATEST ARTICLES ───────────────────────────────────── */}
      {recentArticles.length > 0 && (
        <section className="py-16 px-4" style={{ background: "var(--navy)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--cream)" }}>Latest Articles</h2>
                <span className="accent-line" />
              </div>
              <Link href="/articles" className="text-sm text-amber-400 hover:text-amber-300 font-medium hidden sm:block">
                All articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SUBSCRIBE ─────────────────────────────────────────── */}
      <SubscribeSection />
    </div>
  );
}

export function VideoCard({ video }: { video: Video }) {
  const color = PILLAR_COLORS[video.pillarId] || "#c9962a";
  return (
    <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" className="card-lift block rounded-lg overflow-hidden border" style={{ background: "var(--navy)", borderColor: "rgba(201,150,42,0.12)" }}>
      {video.thumbnailUrl ? (
        <img src={video.thumbnailUrl} alt={video.title} className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center" style={{ background: "var(--navy-light)" }}>
          <svg viewBox="0 0 48 48" className="w-12 h-12 text-gray-600" fill="currentColor">
            <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 28V16l12 8-12 8z"/>
          </svg>
        </div>
      )}
      <div className="p-4">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{video.pillarId.replace("faith-", "Faith & ").replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
        <h3 className="mt-1 text-sm font-semibold leading-snug" style={{ color: "var(--cream)" }}>{video.title}</h3>
      </div>
    </a>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  const color = PILLAR_COLORS[article.pillarId] || "#c9962a";
  const pillarLabel = article.pillarId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" & ").replace("Faith & Flag", "Faith & Flag").replace("Faith & Family", "Faith & Family");
  return (
    <Link href={`/article/${article.slug}`} className="card-lift block rounded-lg p-5 border" style={{ background: "var(--navy-light)", borderColor: "rgba(201,150,42,0.12)" }}>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{article.pillarId.replace("faith-", "Faith & ").replace(/\b\w/g, l => l.toUpperCase())}</span>
      <h3 className="mt-2 font-display text-base font-bold leading-snug" style={{ color: "var(--cream)" }}>{article.title}</h3>
      {article.excerpt && <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3">{article.excerpt}</p>}
      <span className="mt-3 inline-block text-xs font-semibold" style={{ color: "var(--gold)" }}>Read article →</span>
    </Link>
  );
}
