import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getCallerProfile(token) {
  const admin = getAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await admin.from("profiles").select("id, role").eq("id", user.id).single();
  return profile;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const caller = await getCallerProfile(token);
    if (!caller || caller.role !== "admin") return res.status(403).json({ error: "Forbidden: admin only" });

    const { full_name, email, password, role } = req.body ?? {};
    if (!email || !password || !role) return res.status(400).json({ error: "email, password, and role are required" });
    if (role !== "admin" && role !== "staff") return res.status(400).json({ error: "role must be 'admin' or 'staff'" });

    const admin = getAdminClient();
    const { data, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name, role },
    });
    if (createError) return res.status(400).json({ error: createError.message || "Supabase user creation failed" });

    await admin.from("profiles").upsert({ id: data.user.id, email: data.user.email, full_name: full_name || null, role });
    return res.status(201).json({ id: data.user.id, email: data.user.email, role });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
}
