import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import SubscribeSection from "@/components/SubscribeSection";
import { VideoCard, ArticleCard } from "./Home";
import type { Pillar, Video, Article } from "@shared/schema";

const PILLAR_COLORS: Record<string, string> = {
  "faith-flag": "#e05252",
  "faith-family": "#f59e0b",
  "faith-fitness": "#34d399",
  "faith-finance": "#60a5fa",
  "faith-facts": "#c084fc",
};

const PILLAR_VERSES: Record<string, { text: string; ref: string }> = {
  "faith-flag": { text: "Render to Caesar what is Caesar's, and to God what is God's.", ref: "Mark 12:17" },
  "faith-family": { text: "Train up a child in the way he should go; even when he is old he will not depart from it.", ref: "Proverbs 22:6" },
  "faith-fitness": { text: "Or do you not know that your body is a temple of the Holy Spirit within you?", ref: "1 Corinthians 6:19" },
  "faith-finance": { text: "A false balance is an abomination to the LORD, but a just weight is His delight.", ref: "Proverbs 11:1" },
  "faith-facts": { text: "Beloved, do not believe every spirit, but test the spirits to see whether they are from God, for many false prophets have gone out into the world.", ref: "1 John 4:1" },
};

export default function PillarPage() {
  const { id } = useParams<{ id: string }>();

  const { data: pillar, isLoading: loadingPillar } = useQuery<Pillar>({
    queryKey: ["/api/pillars", id],
    queryFn: async () => {
      const pillars = await apiRequest("GET", "/api/pillars").then(r => r.json()) as Pillar[];
      return pillars.find(p => p.id === id) as Pillar;
    },
  });

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ["/api/videos", id],
    queryFn: () => apiRequest("GET", `/api/videos?pillar=${id}`).then(r => r.json()),
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles", id],
    queryFn: () => apiRequest("GET", `/api/articles?pillar=${id}`).then(r => r.json()),
  });

  const color = PILLAR_COLORS[id || ""] || "#c9962a";
  const verse = PILLAR_VERSES[id || ""];

  if (loadingPillar) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Pillar Hero */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1020 0%, #12213a 100%)" }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
        <div className="max-w-4xl mx-auto text-center fade-up">
          <div className="inline-block mb-4 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest" style={{ background: `${color}20`, color, border: `1px solid ${color}50` }}>
            Content Pillar
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black mb-4" style={{ color: "var(--cream)" }}>
            {pillar?.name || id}
          </h1>
          <span className="accent-line mx-auto" style={{ background: color }} />
          <p className="mt-5 text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            {pillar?.description}
          </p>
          {verse && (
            <blockquote className="mt-8 text-sm italic max-w-md mx-auto" style={{ color: `${color}cc` }}>
              "{verse.text}" — <strong>{verse.ref}</strong>
            </blockquote>
          )}
        </div>
      </section>

      {/* Videos */}
      <section className="py-16 px-4" style={{ background: "var(--navy)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold" style={{ color: "var(--cream)" }}>Videos</h2>
            <span className="accent-line" style={{ background: color }} />
          </div>
          {videos.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p className="text-base">No videos yet in this pillar.</p>
              <a href="https://www.youtube.com/@TheToddHermanShow" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-amber-400 hover:text-amber-300">
                Watch on YouTube →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(v => <VideoCard key={v.id} video={v} />)}
            </div>
          )}
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 px-4" style={{ background: "var(--navy-light)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold" style={{ color: "var(--cream)" }}>Articles</h2>
            <span className="accent-line" style={{ background: color }} />
          </div>
          {articles.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p className="text-base">No articles published in this pillar yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
        </div>
      </section>

      <SubscribeSection />
    </div>
  );
}
