import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Video, Article, Pillar } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const PILLARS = [
  { id: "faith-flag", name: "Faith & Flag" },
  { id: "faith-family", name: "Faith & Family" },
  { id: "faith-fitness", name: "Faith & Fitness" },
  { id: "faith-finance", name: "Faith & Finance" },
  { id: "faith-facts", name: "Faith & Facts" },
];

// ── LOGIN ────────────────────────────────────────────────────────
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
    <div className="admin-theme min-h-screen flex items-center justify-center px-4" style={{ background: "#f3f4f6" }}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: "#8b1a2a" }}>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="white">
              <rect x="11" y="2" width="2" height="20" rx="1"/>
              <rect x="2" y="9" width="20" height="2" rx="1"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Exodus Daily Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your admin password</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Admin password"
            data-testid="input-admin-password"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-700"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            data-testid="button-admin-login"
            className="w-full py-2.5 text-sm font-bold rounded-lg text-white"
            style={{ background: "#8b1a2a" }}
          >
            {loading ? "Checking..." : "Enter Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── MAIN ADMIN ───────────────────────────────────────────────────
export default function Admin() {
  const [password, setPassword] = useState<string | null>(null);
  const [tab, setTab] = useState<"videos" | "articles" | "subscribers">("videos");
  const { toast } = useToast();

  if (!password) return <LoginScreen onLogin={pw => setPassword(pw)} />;

  return (
    <div className="admin-theme min-h-screen" style={{ background: "#f3f4f6", fontFamily: "Inter, sans-serif", color: "#1a1a2e" }}>
      {/* Admin header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "#8b1a2a" }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="white">
              <rect x="11" y="2" width="2" height="20" rx="1"/>
              <rect x="2" y="9" width="20" height="2" rx="1"/>
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Exodus Daily Admin</h1>
            <p className="text-xs text-gray-400">Content Management</p>
          </div>
        </div>
        <button onClick={() => setPassword(null)} className="text-xs text-gray-400 hover:text-gray-600">Sign out</button>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          {(["videos", "articles", "subscribers"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t}`}
              className="px-4 py-2 text-sm font-medium rounded transition-colors capitalize"
              style={tab === t ? { background: "#8b1a2a", color: "white" } : { color: "#6b7280" }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "videos" && <VideosTab password={password} toast={toast} />}
        {tab === "articles" && <ArticlesTab password={password} toast={toast} />}
        {tab === "subscribers" && <SubscribersTab password={password} />}
      </div>
    </div>
  );
}

// ── VIDEOS TAB ───────────────────────────────────────────────────
function VideosTab({ password, toast }: { password: string; toast: any }) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedPillar, setSelectedPillar] = useState("faith-flag");
  const [fetching, setFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    api.getAdminVideos(password).then(setVideos);
  }, []);

  const handleFetch = async () => {
    if (!youtubeUrl) return;
    setFetching(true);
    setFetchedData(null);
    const data = await api.fetchYoutube(youtubeUrl, password);
    setFetching(false);
    if (data.error) {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    } else {
      setFetchedData(data);
    }
  };

  const handleImport = async () => {
    if (!fetchedData) return;
    setSaving(true);
    const result = await api.createVideo({
      ...fetchedData,
      pillarId: selectedPillar,
      publishedAt: new Date().toISOString(),
    }, password);
    setSaving(false);
    if (result.error) {
      toast({ title: "Error", description: typeof result.error === "string" ? result.error : "Import failed", variant: "destructive" });
    } else {
      toast({ title: "Video imported!", description: fetchedData.title });
      setYoutubeUrl("");
      setFetchedData(null);
      api.getAdminVideos(password).then(setVideos);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this video?")) return;
    await api.deleteVideo(id, password);
    setVideos(v => v.filter(x => x.id !== id));
    toast({ title: "Deleted" });
  };

  return (
    <div className="space-y-6">
      {/* Import form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Import YouTube Video</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">YouTube URL or ID</label>
            <div className="flex gap-2">
              <input
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or video ID"
                data-testid="input-youtube-url"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-700"
              />
              <button
                onClick={handleFetch}
                disabled={fetching || !youtubeUrl}
                data-testid="button-fetch-youtube"
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                style={{ background: "#8b1a2a" }}
              >
                {fetching ? "Fetching..." : "Fetch"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">Assign Pillar</label>
            <select
              value={selectedPillar}
              onChange={e => setSelectedPillar(e.target.value)}
              data-testid="select-pillar"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-700 bg-white w-full"
            >
              {PILLARS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Preview */}
          {fetchedData && (
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex gap-4">
                {fetchedData.thumbnailUrl && (
                  <img src={fetchedData.thumbnailUrl} alt="" className="w-32 rounded object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{fetchedData.title}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {fetchedData.youtubeId}</p>
                  <p className="text-xs text-gray-500">Channel: {fetchedData.authorName}</p>
                </div>
              </div>
              <button
                onClick={handleImport}
                disabled={saving}
                data-testid="button-import-video"
                className="mt-4 w-full py-2 text-sm font-bold text-white rounded-lg"
                style={{ background: "#8b1a2a" }}
              >
                {saving ? "Importing..." : "Import & Save Video"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">All Videos ({videos.length})</h2>
        </div>
        {videos.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No videos imported yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {videos.map(v => (
              <li key={v.id} className="px-6 py-4 flex items-center gap-4">
                {v.thumbnailUrl && <img src={v.thumbnailUrl} alt="" className="w-20 h-12 object-cover rounded flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{v.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{PILLARS.find(p => p.id === v.pillarId)?.name} · {v.youtubeId}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={`https://youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                  <button onClick={() => handleDelete(v.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── ARTICLES TAB ─────────────────────────────────────────────────
function ArticlesTab({ password, toast }: { password: string; toast: any }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", pillarId: "faith-flag", excerpt: "", body: "", status: "draft" as "draft" | "published" });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadArticles = () => api.getAdminArticles(password).then(setArticles);

  useEffect(() => { loadArticles(); }, []);

  const handleGenerate = async () => {
    if (!form.title || !form.pillarId) return;
    setGenerating(true);
    const result = await api.generateArticle({ title: form.title, pillarId: form.pillarId }, password);
    setGenerating(false);
    if (result.excerpt) {
      setForm(f => ({ ...f, excerpt: result.excerpt, body: result.body }));
      toast({ title: "AI draft generated!", description: "Review and edit before publishing." });
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    let result: any;
    if (editing) {
      result = await api.updateArticle(editing.id, form, password);
    } else {
      result = await api.createArticle(form, password);
    }
    setSaving(false);
    if (result.error) {
      toast({ title: "Error", description: typeof result.error === "string" ? result.error : "Save failed", variant: "destructive" });
    } else {
      toast({ title: editing ? "Article updated!" : "Article saved!", description: form.title });
      setEditing(null);
      setCreating(false);
      setForm({ title: "", pillarId: "faith-flag", excerpt: "", body: "", status: "draft" });
      loadArticles();
    }
  };

  const handleEdit = (a: Article) => {
    setEditing(a);
    setCreating(false);
    setForm({ title: a.title, pillarId: a.pillarId, excerpt: a.excerpt, body: a.body, status: a.status as "draft" | "published" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this article?")) return;
    await api.deleteArticle(id, password);
    loadArticles();
    toast({ title: "Deleted" });
  };

  const isFormOpen = creating || !!editing;

  return (
    <div className="space-y-6">
      {!isFormOpen && (
        <button
          onClick={() => { setCreating(true); setEditing(null); setForm({ title: "", pillarId: "faith-flag", excerpt: "", body: "", status: "draft" }); }}
          data-testid="button-new-article"
          className="px-5 py-2.5 text-sm font-bold text-white rounded-lg"
          style={{ background: "#8b1a2a" }}
        >
          + New Article
        </button>
      )}

      {/* Editor */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editing ? "Edit Article" : "New Article"}</h2>
            <button onClick={() => { setCreating(false); setEditing(null); }} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Article title"
                  data-testid="input-article-title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">Pillar *</label>
                <select
                  value={form.pillarId}
                  onChange={e => setForm(f => ({ ...f, pillarId: e.target.value }))}
                  data-testid="select-article-pillar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-700 bg-white"
                >
                  {PILLARS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating || !form.title}
                data-testid="button-generate-draft"
                className="px-4 py-2 text-xs font-bold rounded-lg border"
                style={{ borderColor: "#8b1a2a", color: "#8b1a2a" }}
              >
                {generating ? "Generating..." : "⚡ Generate AI Draft"}
              </button>
              <span className="text-xs text-gray-400 self-center">Generates article structure from the title — edit before publishing.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Short summary shown in listings..."
                rows={2}
                data-testid="input-article-excerpt"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-700 resize-y"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">Body * (Markdown supported)</label>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Write the article body here. Use ## for headings, **bold**, > for blockquotes..."
                rows={16}
                data-testid="input-article-body"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono outline-none focus:border-red-700 resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="status" checked={form.status === "draft"} onChange={() => setForm(f => ({ ...f, status: "draft" }))} />
                  <span className="text-gray-600">Save as Draft</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="status" checked={form.status === "published"} onChange={() => setForm(f => ({ ...f, status: "published" }))} />
                  <span className="text-gray-600">Publish Now</span>
                </label>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.body}
                data-testid="button-save-article"
                className="px-6 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-50"
                style={{ background: "#8b1a2a" }}
              >
                {saving ? "Saving..." : editing ? "Update Article" : "Save Article"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">All Articles ({articles.length})</h2>
        </div>
        {articles.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No articles yet. Create your first article above.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {articles.map(a => (
              <li key={a.id} className="px-6 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{PILLARS.find(p => p.id === a.pillarId)?.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${a.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => handleEdit(a)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── SUBSCRIBERS TAB ──────────────────────────────────────────────
function SubscribersTab({ password }: { password: string }) {
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    api.getSubscribers(password).then(setSubscribers);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Email Subscribers ({subscribers.length})</h2>
        <p className="text-xs text-gray-400 mt-0.5">Emails captured on this site. Your primary list is on Substack.</p>
      </div>
      {subscribers.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">No subscribers yet.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
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
