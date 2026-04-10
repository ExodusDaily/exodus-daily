import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import SubscribeSection from "@/components/SubscribeSection";
import { ArticleCard } from "./Home";
import type { Article } from "@shared/schema";

const PILLARS = [
  { id: "", label: "All Pillars" },
  { id: "faith-flag", label: "Faith & Flag" },
  { id: "faith-family", label: "Faith & Family" },
  { id: "faith-fitness", label: "Faith & Fitness" },
  { id: "faith-finance", label: "Faith & Finance" },
  { id: "faith-facts", label: "Faith & Facts" },
];

export default function ArticlesPage() {
  const [activePillar, setActivePillar] = useState("");

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", activePillar],
    queryFn: () => apiRequest("GET", `/api/articles${activePillar ? `?pillar=${activePillar}` : ""}`).then(r => r.json()),
  });

  return (
    <div>
      <section className="py-16 px-4" style={{ background: "linear-gradient(135deg, #0a1020 0%, #12213a 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-black mb-3" style={{ color: "var(--cream)" }}>Articles</h1>
          <span className="accent-line mx-auto" />
          <p className="mt-4 text-gray-400 max-w-lg mx-auto">Biblical analysis across all five pillars — written from the videos of The Todd Herman Show.</p>
        </div>
      </section>

      <section className="py-12 px-4" style={{ background: "var(--navy)" }}>
        <div className="max-w-7xl mx-auto">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {PILLARS.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                data-testid={`filter-${p.id || "all"}`}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border transition-colors"
                style={activePillar === p.id
                  ? { background: "var(--gold)", color: "var(--navy)", borderColor: "var(--gold)" }
                  : { background: "transparent", color: "var(--cream)", borderColor: "rgba(201,150,42,0.35)" }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-24 text-gray-600">
              <p>No articles published yet.</p>
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
