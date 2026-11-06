// Tiny REST API (no dependencies) used as the system under test: node mock-api/server.js
const http = require("http");
let users = [{ id: 1, name: "Alice", email: "alice@example.com" }, { id: 2, name: "Bob", email: "bob@example.com" }];
let nextId = 3;
const TOKEN = "abc123token";

function send(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(body === undefined ? "" : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve) => {
    let d = ""; req.on("data", (c) => (d += c));
    req.on("end", () => { try { resolve(d ? JSON.parse(d) : {}); } catch { resolve(null); } });
  });
}
const validEmail = (e) => typeof e === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  const body = ["POST", "PUT"].includes(req.method) ? await readBody(req) : {};
  if (body === null) return send(res, 400, { error: "Invalid JSON" });

  if (url.pathname === "/login" && req.method === "POST") {
    if (body.email === "admin@example.com" && body.password === "pass1234") return send(res, 200, { token: TOKEN });
    return send(res, 401, { error: "Invalid credentials" });
  }
  if (parts[0] !== "users") return send(res, 404, { error: "Not found" });

  if (req.method !== "GET" && req.headers.authorization !== `Bearer ${TOKEN}`) return send(res, 401, { error: "Unauthorized" });

  if (parts.length === 1 && req.method === "GET") return send(res, 200, users);
  if (parts.length === 1 && req.method === "POST") {
    if (!body.name || !validEmail(body.email)) return send(res, 400, { error: "name and valid email are required" });
    const u = { id: nextId++, name: body.name, email: body.email }; users.push(u); return send(res, 201, u);
  }
  const id = Number(parts[1]); const u = users.find((x) => x.id === id);
  if (!u) return send(res, 404, { error: "User not found" });
  if (req.method === "GET") return send(res, 200, u);
  if (req.method === "PUT") {
    if (body.email !== undefined && !validEmail(body.email)) return send(res, 400, { error: "invalid email" });
    Object.assign(u, { name: body.name ?? u.name, email: body.email ?? u.email }); return send(res, 200, u);
  }
  if (req.method === "DELETE") { users = users.filter((x) => x.id !== id); return send(res, 204); }
  send(res, 405, { error: "Method not allowed" });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Mock API running on http://localhost:${PORT}`));
