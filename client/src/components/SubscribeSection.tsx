import { useState } from "react";
import { api } from "@/lib/api";

export default function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await api.subscribe(email) as any;
      if (res.success) {
        setStatus("success");
        setMessage("You're in. Check your email — truth delivered straight to your inbox.");
        setEmail("");
        // Also open Substack in new tab
        window.open("https://thetoddhermanshow.substack.com", "_blank");
      } else {
        setStatus("error");
        setMessage(res.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <section id="subscribe" className="py-20 px-4" style={{ background: "var(--navy-light)" }}>
      <div className="max-w-2xl mx-auto text-center">
        {/* Cross emblem */}
        <div className="flex justify-center mb-6">
          <svg viewBox="0 0 32 32" className="w-10 h-10" fill="none">
            <rect x="14" y="2" width="4" height="28" rx="1.5" fill="#c9962a"/>
            <rect x="2" y="11" width="28" height="4" rx="1.5" fill="#c9962a"/>
          </svg>
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--cream)" }}>
          Biblical Truth. Delivered Free.
        </h2>
        <span className="accent-line mx-auto" />
        <p className="mt-4 text-gray-400 text-base max-w-md mx-auto">
          Get new videos and articles across all five pillars — faith applied to every area of your life. No noise. No compromise.
        </p>

        {status === "success" ? (
          <div className="mt-8 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm font-medium">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              data-testid="input-email"
              className="flex-1 px-4 py-3 rounded text-sm outline-none border"
              style={{ background: "var(--navy)", color: "var(--cream)", borderColor: "rgba(201,150,42,0.35)", fontFamily: "Inter, sans-serif" }}
            />
            <button
              type="submit"
              data-testid="button-subscribe"
              disabled={status === "loading"}
              className="px-6 py-3 text-sm font-bold rounded uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--crimson)", color: "white" }}
            >
              {status === "loading" ? "Sending..." : "Subscribe Free"}
            </button>
          </form>
        )}
        {status === "error" && <p className="mt-3 text-red-400 text-sm">{message}</p>}

        <p className="mt-4 text-xs text-gray-600">
          No spam. Unsubscribe anytime. Connects to our{" "}
          <a href="https://thetoddhermanshow.substack.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-400 underline">
            Substack newsletter
          </a>.
        </p>
      </div>
    </section>
  );
}
