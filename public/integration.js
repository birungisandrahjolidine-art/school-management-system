const API = {
  base: "/api",

  async request(path, options = {}) {
    if (path.charAt(0) !== "/") path = "/" + path;
    path = path.replace(/^\/api(\/|$)/, "/");
    const res = await fetch(this.base + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && data.error) || "Request failed");
    }
    return data;
  },

  get(path) {
    return this.request(path);
  },

  post(path, body) {
    return this.request(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(path, body) {
    return this.request(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  del(path) {
    return this.request(path, { method: "DELETE" });
  },
};

function fmtUGX(value) {
  return "UGX " + Number(value || 0).toLocaleString("en-UG");
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDateShort(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-UG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function toast(message, type = "success", wrapId) {
  let wrap = document.getElementById(wrapId || "toastWrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = wrapId || "toastWrap";
    wrap.style.cssText =
      "position:fixed;top:16px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  const bg =
    type === "error"
      ? "#e74c3c"
      : type === "warning"
      ? "#f39c12"
      : "#27ae60";
  el.style.cssText = `background:${bg};color:#fff;padding:12px 18px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.2);`;
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
