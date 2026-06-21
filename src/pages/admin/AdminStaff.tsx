import { useState, useEffect } from "react";
import { UserCog, Trash2, Shield, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@/types";
import { AdminLayout } from "./AdminLayout";

export function AdminStaff() {
  const { profile: currentProfile, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("*").order("created_at");
    setProfiles((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id: string, newRole: "admin" | "staff") => {
    if (!supabase || !isAdmin) return;
    setSaving(id);
    await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    await load();
    setSaving(null);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!supabase || !isAdmin) return;
    if (id === currentProfile?.id) return alert("لا يمكنك حذف حسابك الخاص.");
    if (!confirm(`هل أنت متأكد من إزالة ${email}؟`)) return;
    await supabase.from("profiles").delete().eq("id", id);
    await load();
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-slate-400">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>هذه الصفحة للمديرين فقط</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-slate-800 mb-2">الموظفون</h1>
        <p className="text-sm text-slate-500 mb-6">
          أضف موظفين جدد من خلال Supabase Authentication ← Users ← Add User
        </p>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : profiles.length === 0 ? (
            <p className="text-center text-slate-400 py-12 text-sm">لا يوجد موظفون</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {profiles.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold
                      ${p.role === "admin" ? "bg-violet-600" : "bg-blue-500"}`}>
                      {(p.full_name || p.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{p.full_name || p.email}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                      ${p.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                      {p.role === "admin" ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      {p.role === "admin" ? "مدير" : "موظف"}
                    </span>

                    {p.id !== currentProfile?.id && (
                      <>
                        <button
                          onClick={() => handleRoleChange(p.id, p.role === "admin" ? "staff" : "admin")}
                          disabled={saving === p.id}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-40"
                          title={p.role === "admin" ? "تحويل لموظف" : "ترقية لمدير"}
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.email)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                          title="إزالة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
