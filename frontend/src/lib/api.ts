export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

/** API server origin (no /api/v1) for static uploads and other non-JSON routes. */
export function apiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "http://127.0.0.1:8000";
  }
}

/** Turn a stored path like `/uploads/pg_images/x.jpg` into a browser URL. */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiOrigin()}${p}`;
}

export async function uploadPgImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await apiFetch<{ url: string }>("/pg/upload-image", {
    method: "POST",
    auth: true,
    body: fd,
  });
  return res.url;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("pgtrust_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) window.localStorage.removeItem("pgtrust_token");
  else window.localStorage.setItem("pgtrust_token", token);
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const formatDetail = (detail: unknown): string => {
    if (typeof detail === "string" || typeof detail === "number" || typeof detail === "boolean") {
      return String(detail);
    }

    if (Array.isArray(detail)) {
      const parts = detail.map((d) => {
        if (typeof d === "string" || typeof d === "number") return String(d);
        if (d && typeof d === "object") {
          const anyD = d as Record<string, unknown>;
          if (typeof anyD.msg === "string") return anyD.msg;
          if (typeof anyD.message === "string") return anyD.message;
        }
        return JSON.stringify(d);
      });
      return parts.join("; ");
    }

    if (detail && typeof detail === "object") {
      const anyD = detail as Record<string, unknown>;
      if (typeof anyD.message === "string") return anyD.message;
      if (typeof anyD.detail !== "undefined") return formatDetail(anyD.detail);
      return JSON.stringify(detail);
    }

    return "";
  };

  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (opts.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>).detail
        : undefined;
    const formatted = typeof detail !== "undefined" ? formatDetail(detail) : "";
    const msg = formatted || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

