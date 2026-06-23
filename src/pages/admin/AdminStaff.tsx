import { useState, useEffect } from "react";
import { UserCog, Trash2, Shield, UserCheck, Plus, X, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@/types";
import { AdminLayout } from "./AdminLayout";

async function getAccessToken(): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return token;
}

export function AdminStaff() {
  const { profile: currentProfile, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "staff">("staff");
  const [showPassword, setShowPassword] = useState(false);
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("*").order("created_at");
    setProfiles((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id: string, newRoleVal: "admin" | "staff") => {
    if (!supabase || !isAdmin) return;
    setSaving(id);
    await supabase.from("profiles").update({ role: newRoleVal }).eq("id", id);
    await load();
    setSaving(null);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!isAdmin) return;
    if (id === currentProfile?.id) {
      alert("لا يمكنك حذف حسابك الخاص.");
      return;
    }
    if (!confirm(`هل أنت متأكد من إزالة ${email}؟`)) return;
    setSaving(id);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        alert(body.error ?? "فشل حذف المستخدم");
      } else {
        await load();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل حذف المستخدم");
    } finally {
      setSaving(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: newFullName, email: newEmail, password: newPassword, role: newRole }),
      });
      const body = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) {
        setAddError(body.error ?? "فشل إنشاء المستخدم");
      } else {
        closeModal();
        await load();
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "فشل إنشاء المستخدم");
    } finally {
      setAdding(false);
    }
  };

  const closeModal = () => {
    setShowAddUser(false);
    setNewFullName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("staff");
    setAddError("");
    setShowPassword(false);
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-800">الموظفون</h1>
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة مستخدم
          </button>
        </div>

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
                          disabled={saving === p.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-40"
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

      {showAddUser && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-800">إضافة مستخدم جديد</h2>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-right">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4" dir="rtl">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: أحمد محمد (اختياري)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الصلاحية</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "admin" | "staff")}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="staff">موظف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                {adding ? "جارٍ الإنشاء..." : "إنشاء المستخدم"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
