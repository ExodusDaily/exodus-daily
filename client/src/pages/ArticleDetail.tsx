import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import SubscribeSection from "@/components/SubscribeSection";
import type { Article } from "@shared/schema";

const PILLAR_COLORS: Record<string, string> = {
  "faith-flag": "#e05252",
  "faith-family": "#f59e0b",
  "faith-fitness": "#34d399",
  "faith-finance": "#60a5fa",
};

function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (m) => m.startsWith('<') ? m : m);
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, isError } = useQuery<Article>({
    queryKey: ["/api/articles/slug", slug],
    queryFn: () => apiRequest("GET", `/api/articles/slug/${slug}`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-2xl mx-auto text-center py-32 px-4">
        <h1 className="font-display text-3xl font-bold mb-4" style={{ color: "var(--cream)" }}>Article Not Found</h1>
        <Link href="/articles" className="text-amber-400 hover:text-amber-300">← Back to Articles</Link>
      </div>
    );
  }

  const color = PILLAR_COLORS[article.pillarId] || "#c9962a";
  const pillarLabel = article.pillarId.split("-").slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const dateStr = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div>
      {/* Article header */}
      <section className="py-16 px-4" style={{ background: "linear-gradient(135deg, #0a1020 0%, #12213a 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/articles" className="text-xs text-gray-500 hover:text-gray-300">Articles</Link>
            <span className="text-gray-700">/</span>
            <span className="text-xs font-bold uppercase" style={{ color }}>Faith & {pillarLabel}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-black leading-tight mb-4" style={{ color: "var(--cream)" }}>{article.title}</h1>
          <span className="accent-line" style={{ background: color }} />
          {dateStr && <p className="mt-4 text-sm text-gray-500">{dateStr}</p>}
          {article.excerpt && <p className="mt-3 text-lg text-gray-400 leading-relaxed">{article.excerpt}</p>}
        </div>
      </section>

      {/* Article body */}
      <section className="py-12 px-4" style={{ background: "var(--navy)" }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(article.body)}</p>` }}
          />

          {/* YouTube CTA */}
          <div className="mt-12 p-6 rounded-lg border" style={{ background: "var(--navy-light)", borderColor: "rgba(201,150,42,0.2)" }}>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--cream)" }}>Watch the full video on YouTube</p>
            <a
              href="https://www.youtube.com/@TheToddHermanShow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2 text-xs font-bold rounded uppercase tracking-wider"
              style={{ background: "var(--crimson)", color: "white" }}
            >
              @TheToddHermanShow →
            </a>
          </div>
        </div>
      </section>

      <SubscribeSection />
    </div>
  );
}
