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
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });
  try {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const caller = await getCallerProfile(token);
    if (!caller || caller.role !== "admin") return res.status(403).json({ error: "Forbidden: admin only" });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "User ID required" });
    if (id === caller.id) return res.status(400).json({ error: "لا يمكنك حذف حسابك الخاص" });

    const admin = getAdminClient();
    await admin.from("profiles").delete().eq("id", id);
    const { error: deleteError } = await admin.auth.admin.deleteUser(id);
    if (deleteError) return res.status(400).json({ error: deleteError.message });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
}
