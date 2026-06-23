/**
 * Local development API server.
 * Run alongside the Vite dev server: npm run server
 *
 * On Vercel this is not used — the /api directory handles API routes automatically.
 *
 * Prerequisites:
 *   npm install express dotenv
 *   (these are listed under devDependencies as they are only needed locally)
 */
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config(); // loads .env

const app = express();
app.use(express.json());

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey)
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getCallerProfile(token) {
  const admin = getAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();
  return profile;
}

// POST /api/admin/users
app.post("/api/admin/users", async (req, res) => {
  try {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const caller = await getCallerProfile(token);
    if (!caller || caller.role !== "admin")
      return res.status(403).json({ error: "Forbidden: admin only" });

    const { full_name, email, password, role } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ error: "email, password, and role are required" });

    if (role !== "admin" && role !== "staff")
      return res.status(400).json({ error: "role must be 'admin' or 'staff'" });

    const admin = getAdminClient();
    const { data, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (createError) {
      const msg = createError.message || createError.code || JSON.stringify(createError);
      return res.status(400).json({ error: msg || "Supabase user creation failed" });
    }

    await admin.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: full_name || null,
      role,
    });

    return res.status(201).json({ id: data.user.id, email: data.user.email, role });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});

// DELETE /api/admin/users/:id
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const caller = await getCallerProfile(token);
    if (!caller || caller.role !== "admin")
      return res.status(403).json({ error: "Forbidden: admin only" });

    const { id } = req.params;
    if (id === caller.id)
      return res.status(400).json({ error: "لا يمكنك حذف حسابك الخاص" });

    const admin = getAdminClient();
    await admin.from("profiles").delete().eq("id", id);

    const { error: deleteError } = await admin.auth.admin.deleteUser(id);
    if (deleteError)
      return res.status(400).json({ error: deleteError.message });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
