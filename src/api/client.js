const BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  getSchema: () => fetch(`${BASE}/schema`).then(handle),
  submit: (formData) =>
    fetch(`${BASE}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(handle),
};
