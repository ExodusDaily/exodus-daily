import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const pillars = [
  { id: "faith-flag", name: "Faith & Flag", href: "/pillar/faith-flag" },
  { id: "faith-family", name: "Faith & Family", href: "/pillar/faith-family" },
  { id: "faith-fitness", name: "Faith & Fitness", href: "/pillar/faith-fitness" },
  { id: "faith-finance", name: "Faith & Finance", href: "/pillar/faith-finance" },
  { id: "faith-facts", name: "Faith & Facts", href: "/pillar/faith-facts" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      {/* Cross mark */}
      <svg viewBox="0 0 12 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto flex-shrink-0">
        <rect x="4.5" y="0" width="3" height="24" rx="1.5" fill="#c9962a"/>
        <rect x="0" y="9" width="12" height="3" rx="1.5" fill="#c9962a"/>
      </svg>
      {/* Text as HTML — never clips */}
      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 800, color: "#f5f0e8", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
        THE EXODUS DAILY
      </span>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  const scrollToSubscribe = () => {
    document.getElementById("subscribe")?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--navy)" }}>
      {/* Top bar */}
      <div className="text-center py-1.5 text-xs font-semibold tracking-widest uppercase" style={{ background: "var(--crimson)", color: "var(--cream)" }}>
        Faith · Flag · Family · Fitness · Finance · Facts
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "var(--navy-light)", borderColor: "rgba(201,150,42,0.25)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {pillars.map(p => (
              <Link key={p.id} href={p.href} className={`text-sm font-medium transition-colors hover:text-amber-400 ${location.startsWith(`/pillar/${p.id}`) ? "text-amber-400" : "text-gray-300"}`}>
                {p.name}
              </Link>
            ))}
            <Link href="/articles" className={`text-sm font-medium transition-colors hover:text-amber-400 ${location === "/articles" ? "text-amber-400" : "text-gray-300"}`}>
              Articles
            </Link>
            <button onClick={scrollToSubscribe} className="ml-2 px-4 py-1.5 text-sm font-semibold rounded" style={{ background: "var(--crimson)", color: "white" }}>
              Subscribe
            </button>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-300" onClick={() => setMenuOpen(!menuOpen)} data-testid="mobile-menu-button">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t px-4 py-4 space-y-3" style={{ background: "var(--navy-light)", borderColor: "rgba(201,150,42,0.2)" }}>
            {pillars.map(p => (
              <Link key={p.id} href={p.href} onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-300 hover:text-amber-400 py-1">
                {p.name}
              </Link>
            ))}
            <Link href="/articles" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-300 hover:text-amber-400 py-1">
              Articles
            </Link>
            <button onClick={scrollToSubscribe} className="w-full mt-2 px-4 py-2 text-sm font-semibold rounded" style={{ background: "var(--crimson)", color: "white" }}>
              Subscribe Free
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t mt-16" style={{ background: "var(--navy-light)", borderColor: "rgba(201,150,42,0.2)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Logo />
              <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
                Biblical truth applied to every area of life — politics, family, health, and finance. Hosted by Todd Herman.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Pillars</h4>
              <ul className="space-y-2">
                {pillars.map(p => (
                  <li key={p.id}><Link href={p.href} className="text-sm text-gray-400 hover:text-gray-200">{p.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Listen & Watch</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://www.youtube.com/@TheToddHermanShow" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200">YouTube — @TheToddHermanShow</a></li>
                <li><a href="https://thetoddhermanshow.substack.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200">Substack Newsletter</a></li>
                <li><span>Radio — 181 FM Stations (American Family Radio)</span></li>
                <li><span>Radio America Network</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} The Exodus Daily · TheExodusDaily.com · All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
