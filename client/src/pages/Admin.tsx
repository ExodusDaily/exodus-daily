import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Video, Article } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const PILLARS = [
  { id: "faith-flag",    name: "Faith & Flag" },
  { id: "faith-family",  name: "Faith & Family" },
  { id: "faith-fitness", name: "Faith & Fitness" },
  { id: "faith-finance", name: "Faith & Finance" },
  { id: "faith-facts",   name: "Faith & Facts" },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function Cross() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
      <rect x="11" y="2" width="2" height="20" rx="1"/>
      <rect x="2" y="9" width="20" height="2" rx="1"/>
    </svg>
  );
}

function Badge({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
      published ? "bg-green-100 text-green-700" : "bg-amber-50 text-amber-600"
    }`}>
      {published ? "Published" : "Draft"}
    </span>
  );
}

// Simple markdown-to-HTML renderer for preview
function renderMarkdown(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2 text-gray-900">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1 text-gray-800">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-red-800 pl-4 italic text-gray-600 my-3">$1</blockquote>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank">$1</a>')
    .replace(/^---$/gm, '<hr class="my-4 border-gray-200"/>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^/, '<p class="mb-3">')
    .replace(/$/, '</p>');
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await api.adminAuth(pw).then((r: any) => r.json()).catch(() => ({})) as any;
    if (res.success) {
      onLogin(pw);
    } else {
      setError("Incorrect password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f3f4f6" }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "#8b1a2a" }}>
            <Cross />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Exodus Daily</h1>
          <p className="text-sm text-gray-500 mt-1">Content Manager</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Admin password"
            data-testid="input-admin-password"
            autoFocus
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:border-red-800 transition"
            style={{ focusBorderColor: "#8b1a2a" }}
          />
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            data-testid="button-admin-login"
            className="w-full py-3 text-sm font-bold rounded-xl text-white transition opacity-90 hover:opacity-100 disabled:opacity-50"
            style={{ background: "#8b1a2a" }}
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── VIDEOS TAB ────────────────────────────────────────────────────────────────
function VideosTab({ password, toast }: { password: string; toast: any }) {
  const [urls, setUrls] = useState("");
  const [pillar, setPillar] = useState("faith-flag");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; current: string } | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);

  const loadVideos = () => api.getAdminVideos(password).then(setVideos);
  useEffect(() => { loadVideos(); }, []);

  const parseUrls = (raw: string): string[] =>
    raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

  const handleImport = async () => {
    const urlList = parseUrls(urls);
    if (!urlList.length) return;
    setImporting(true);
    setProgress({ done: 0, total: urlList.length, current: "" });

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i];
      setProgress({ done: i, total: urlList.length, current: url });
      try {
        const data = await api.fetchYoutube(url, password);
        if (data.error) { failed++; continue; }
        const result = await api.createVideo({
          ...data,
          pillarId: pillar,
          publishedAt: new Date().toISOString(),
        }, password);
        if (result.error) { failed++; } else { succeeded++; }
      } catch { failed++; }
    }

    setImporting(false);
    setProgress(null);
    setUrls("");
    loadVideos();
    toast({
      title: `Import complete`,
      description: `${succeeded} imported${failed ? `, ${failed} failed` : ""}.`,
      variant: failed > 0 ? "destructive" : "default",
    });
  };

  return (
    <div className="space-y-6">
      {/* Bulk Import */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 text-base mb-1">Import YouTube Videos</h2>
        <p className="text-xs text-gray-400 mb-5">Paste one or more YouTube URLs — one per line. All will be assigned to the selected pillar.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">YouTube URLs (one per line)</label>
            <textarea
              value={urls}
              onChange={e => setUrls(e.target.value)}
              placeholder={"https://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=..."}
              rows={5}
              data-testid="input-youtube-urls"
              disabled={importing}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-red-800 resize-y transition disabled:opacity-50"
            />
            <p className="text-xs text-gray-400 mt-1">{parseUrls(urls).length} URL{parseUrls(urls).length !== 1 ? "s" : ""} detected</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Assign to Pillar</label>
            <select
              value={pillar}
              onChange={e => setPillar(e.target.value)}
              data-testid="select-pillar"
              disabled={importing}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white focus:border-red-800 transition disabled:opacity-50"
            >
              {PILLARS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Progress */}
          {progress && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Importing...</span>
                <span className="text-xs text-gray-400">{progress.done} / {progress.total}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(progress.done / progress.total) * 100}%`, background: "#8b1a2a" }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 truncate">{progress.current}</p>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing || !parseUrls(urls).length}
            data-testid="button-import-videos"
            className="px-6 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-40 transition"
            style={{ background: "#8b1a2a" }}
          >
            {importing ? "Importing..." : `Import ${parseUrls(urls).length || ""} Video${parseUrls(urls).length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>

      {/* Video list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base">All Videos</h2>
          <span className="text-sm text-gray-400">{videos.length} total</span>
        </div>
        {videos.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-gray-400 text-sm">No videos yet. Import some above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {videos.map(v => (
              <li key={v.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                {v.thumbnailUrl && (
                  <img src={v.thumbnailUrl} alt="" className="w-24 h-14 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{v.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {PILLARS.find(p => p.id === v.pillarId)?.name}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <a
                    href={`https://youtube.com/watch?v=${v.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Watch
                  </a>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this video?")) return;
                      await api.deleteVideo(v.id, password);
                      loadVideos();
                      toast({ title: "Deleted" });
                    }}
                    className="text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── ARTICLES TAB ──────────────────────────────────────────────────────────────
function ArticlesTab({ password, toast }: { password: string; toast: any }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [view, setView] = useState<"list" | "edit">("list");
  const [editing, setEditing] = useState<Article | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState({
    title: "",
    pillarId: "faith-flag",
    excerpt: "",
    body: "",
    status: "draft" as "draft" | "published",
  });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadArticles = () => api.getAdminArticles(password).then(setArticles);
  useEffect(() => { loadArticles(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", pillarId: "faith-flag", excerpt: "", body: "", status: "draft" });
    setPreviewMode(false);
    setView("edit");
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({ title: a.title, pillarId: a.pillarId, excerpt: a.excerpt, body: a.body, status: a.status as "draft" | "published" });
    setPreviewMode(false);
    setView("edit");
  };

  const handleGenerate = async () => {
    if (!form.title) return;
    setGenerating(true);
    const result = await api.generateArticle({ title: form.title, pillarId: form.pillarId }, password);
    setGenerating(false);
    if (result.excerpt) {
      setForm(f => ({ ...f, excerpt: result.excerpt, body: result.body }));
      toast({ title: "Draft generated", description: "Review and edit before publishing." });
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!form.title || !form.body) return;
    setSaving(true);
    const payload = { ...form, status };
    let result: any;
    if (editing) {
      result = await api.updateArticle(editing.id, payload, password);
    } else {
      result = await api.createArticle(payload, password);
    }
    setSaving(false);
    if (result.error) {
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    } else {
      toast({ title: status === "published" ? "Published!" : "Saved as draft", description: form.title });
      setView("list");
      loadArticles();
    }
  };

  if (view === "edit") {
    return (
      <div className="space-y-4">
        {/* Editor header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium"
          >
            ← Back to articles
          </button>
          <button
            onClick={() => setPreviewMode(p => !p)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            {previewMode ? "✏️ Edit" : "👁 Preview"}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {/* Title + Pillar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Article headline"
                data-testid="input-article-title"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-red-800 transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Pillar *</label>
              <select
                value={form.pillarId}
                onChange={e => setForm(f => ({ ...f, pillarId: e.target.value }))}
                data-testid="select-article-pillar"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white focus:border-red-800 transition"
              >
                {PILLARS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* AI Generate */}
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">Generate AI Draft</p>
              <p className="text-xs text-amber-600 mt-0.5">Enter a title above, then click generate. Review before publishing.</p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !form.title}
              data-testid="button-generate-draft"
              className="px-4 py-2 text-xs font-bold rounded-lg text-white disabled:opacity-40 flex-shrink-0 transition"
              style={{ background: "#c9962a" }}
            >
              {generating ? "Generating..." : "⚡ Generate"}
            </button>
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Excerpt <span className="text-gray-400 font-normal normal-case">(shown in article listings)</span></label>
            <textarea
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="One or two sentences summarizing the article..."
              rows={2}
              data-testid="input-article-excerpt"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-800 resize-none transition"
            />
          </div>

          {/* Body editor / preview */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Article Body *
              {!previewMode && <span className="text-gray-400 font-normal normal-case ml-1">— paste your article here. Use ## for headings, **bold**, &gt; for Scripture quotes.</span>}
            </label>
            {previewMode ? (
              <div
                className="w-full min-h-64 px-5 py-4 border border-gray-200 rounded-xl text-sm leading-relaxed prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(form.body) }}
              />
            ) : (
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder={"Paste your article here...\n\n## First Heading\n\nParagraph text...\n\n> Scripture quote here"}
                rows={20}
                data-testid="input-article-body"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-red-800 resize-y transition"
              />
            )}
          </div>

          {/* Action buttons — big and clear */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => handleSave("published")}
              disabled={saving || !form.title || !form.body}
              data-testid="button-publish"
              className="flex-1 py-3 text-sm font-bold text-white rounded-xl disabled:opacity-40 transition"
              style={{ background: "#8b1a2a" }}
            >
              {saving ? "Saving..." : "✓ Publish Now"}
            </button>
            <button
              onClick={() => handleSave("draft")}
              disabled={saving || !form.title || !form.body}
              data-testid="button-save-draft"
              className="flex-1 py-3 text-sm font-bold rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Save as Draft
            </button>
            <button
              onClick={() => setView("list")}
              className="sm:w-auto px-6 py-3 text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Articles <span className="text-gray-400 font-normal">({articles.length})</span></h2>
        <button
          onClick={openNew}
          data-testid="button-new-article"
          className="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition"
          style={{ background: "#8b1a2a" }}
        >
          + New Article
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {articles.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-gray-400 text-sm">No articles yet.</p>
            <button onClick={openNew} className="mt-3 text-sm font-semibold underline" style={{ color: "#8b1a2a" }}>
              Create your first article
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {articles.map(a => (
              <li key={a.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{PILLARS.find(p => p.id === a.pillarId)?.name}</span>
                    <Badge status={a.status} />
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => openEdit(a)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  {a.status === "draft" && (
                    <button
                      onClick={async () => {
                        await api.updateArticle(a.id, { ...a, status: "published" }, password);
                        loadArticles();
                        toast({ title: "Published!", description: a.title });
                      }}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: "#8b1a2a" }}
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this article?")) return;
                      await api.deleteArticle(a.id, password);
                      loadArticles();
                      toast({ title: "Deleted" });
                    }}
                    className="text-xs font-medium text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── SUBSCRIBERS TAB ───────────────────────────────────────────────────────────
function SubscribersTab({ password }: { password: string }) {
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    api.getSubscribers(password).then(setSubscribers);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-base">Email Subscribers</h2>
          <p className="text-xs text-gray-400 mt-0.5">Captured on this site. Primary list is on Substack.</p>
        </div>
        <span className="text-sm font-semibold text-gray-700">{subscribers.length}</span>
      </div>
      {subscribers.length === 0 ? (
        <div className="px-6 py-16 text-center text-gray-400 text-sm">No subscribers yet.</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {subscribers.map((s: any) => (
            <li key={s.id} className="px-6 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-800">{s.email}</span>
              <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── MAIN ADMIN ────────────────────────────────────────────────────────────────
export default function Admin() {
  const [password, setPassword] = useState<string | null>(null);
  const [tab, setTab] = useState<"videos" | "articles" | "subscribers">("videos");
  const { toast } = useToast();

  if (!password) return <LoginScreen onLogin={pw => setPassword(pw)} />;

  const tabs = [
    { id: "videos" as const,      label: "📹 Videos" },
    { id: "articles" as const,    label: "📝 Articles" },
    { id: "subscribers" as const, label: "📧 Subscribers" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f8f8f6", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#8b1a2a" }}>
            <Cross />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Exodus Daily</h1>
            <p className="text-xs text-gray-400 leading-tight">Content Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-xs font-medium text-gray-400 hover:text-gray-700 transition"
          >
            View Site →
          </a>
          <button
            onClick={() => setPassword(null)}
            className="text-xs font-medium text-gray-400 hover:text-gray-700 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab nav */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`tab-${t.id}`}
              className="px-5 py-2 text-sm font-semibold rounded-lg transition"
              style={tab === t.id
                ? { background: "#8b1a2a", color: "white" }
                : { color: "#9ca3af" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "videos"      && <VideosTab password={password} toast={toast} />}
        {tab === "articles"    && <ArticlesTab password={password} toast={toast} />}
        {tab === "subscribers" && <SubscribersTab password={password} />}
      </div>
    </div>
  );
}
