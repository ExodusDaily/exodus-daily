import { apiRequest } from "./queryClient";

export const api = {
  // Public
  getPillars: () => apiRequest("GET", "/api/pillars"),
  getVideos: (pillar?: string) => apiRequest("GET", `/api/videos${pillar ? `?pillar=${pillar}` : ""}`),
  getVideo: (id: number) => apiRequest("GET", `/api/videos/${id}`),
  getArticles: (pillar?: string) => apiRequest("GET", `/api/articles${pillar ? `?pillar=${pillar}` : ""}`),
  getArticleBySlug: (slug: string) => apiRequest("GET", `/api/articles/slug/${slug}`),
  subscribe: (email: string) => apiRequest("POST", "/api/subscribe", { email }),

  // Admin
  adminAuth: (password: string) => apiRequest("POST", "/api/admin/auth", { password }),
  fetchYoutube: (url: string, password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/youtube/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ url }),
    }).then(r => r.json()),
  generateArticle: (data: any, password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/articles/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  createVideo: (data: any, password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  createArticle: (data: any, password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  updateArticle: (id: number, data: any, password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  deleteArticle: (id: number, password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/articles/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    }).then(r => r.json()),
  deleteVideo: (id: number, password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/videos/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    }).then(r => r.json()),
  getAdminVideos: (password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/videos`, {
      headers: { "x-admin-password": password },
    }).then(r => r.json()),
  getAdminArticles: (password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/articles`, {
      headers: { "x-admin-password": password },
    }).then(r => r.json()),
  getSubscribers: (password: string) =>
    fetch(`${(window as any).__PORT_5000__ || ""}/api/admin/subscribers`, {
      headers: { "x-admin-password": password },
    }).then(r => r.json()),
};
