import { useState, useEffect } from "react";
import { Eye, EyeOff, KeyRound, UserCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "./AdminLayout";

function formatLastLogin(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminSettings() {
  const { profile, refetch, user } = useAuth();

  // ── Profile ─────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !profile?.id) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() || null })
        .eq("id", profile.id);
      if (error) throw error;
      await refetch?.();
      toast.success("تم تحديث الاسم بنجاح");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تحديث الاسم");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password ─────────────────────────────────────────────
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const resetPwd = () => { setCurrent(""); setNext(""); setConfirm(""); };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (next.length < 6) { toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"); return; }
    if (next !== confirm) { toast.error("كلمتا المرور الجديدتان غير متطابقتين"); return; }
    setSavingPwd(true);
    try {
      const email = profile?.email;
      if (!email) throw new Error("لا يمكن التحقق من الحساب");
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: current });
      if (signInError) { toast.error("كلمة المرور الحالية غير صحيحة"); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password: next });
      if (updateError) throw updateError;
      toast.success("تم تغيير كلمة المرور بنجاح");
      resetPwd();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تغيير كلمة المرور");
    } finally {
      setSavingPwd(false);
    }
  };

  const avatar = (profile?.full_name || profile?.email || "?")[0].toUpperCase();

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto space-y-5">
        <h1 className="text-2xl font-black text-slate-800">الإعدادات</h1>

        {/* ── Profile card ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <UserCircle2 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">الملف الشخصي</p>
              <p className="text-xs text-slate-400">{profile?.email}</p>
            </div>
          </div>

          {/* Avatar preview */}
          <div className="flex justify-center mb-5">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black
              ${profile?.role === "admin" ? "bg-violet-600" : "bg-blue-500"}`}>
              {avatar}
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4" dir="rtl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="مثال: أحمد محمد"
              />
              <p className="text-xs text-slate-400 mt-1">يظهر هذا الاسم في الشريط الجانبي وفي قائمة الموظفين</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="text"
                value={profile?.email ?? ""}
                disabled
                dir="ltr"
                className="w-full px-3 py-2.5 border border-slate-100 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed text-left"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الصلاحية</label>
              <input
                type="text"
                value={profile?.role === "admin" ? "مدير" : "موظف"}
                disabled
                className="w-full px-3 py-2.5 border border-slate-100 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">آخر تسجيل دخول</p>
                <p className="text-sm text-slate-600 font-medium">
                  {formatLastLogin(user?.last_sign_in_at)}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full bg-violet-600 text-white font-bold py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors text-sm"
            >
              {savingProfile ? "جارٍ الحفظ..." : "حفظ الاسم"}
            </button>
          </form>
        </div>

        {/* ── Password card ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">تغيير كلمة المرور</p>
              <p className="text-xs text-slate-400">يجب إدخال كلمة المرور الحالية للتأكيد</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4" dir="rtl">
            {[
              { label: "كلمة المرور الحالية", val: current, set: setCurrent, show: showCurrent, setShow: setShowCurrent },
              { label: "كلمة المرور الجديدة", val: next, set: setNext, show: showNext, setShow: setShowNext },
              { label: "تأكيد كلمة المرور الجديدة", val: confirm, set: setConfirm, show: showConfirm, setShow: setShowConfirm, mismatch: !!(confirm && next && confirm !== next) },
            ].map(({ label, val, set, show, setShow, mismatch }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    required
                    minLength={6}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 transition-colors
                      ${mismatch ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v: boolean) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mismatch && <p className="text-xs text-red-500 mt-1">كلمتا المرور غير متطابقتين</p>}
              </div>
            ))}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={savingPwd}
                className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                {savingPwd ? "جارٍ الحفظ..." : "حفظ كلمة المرور الجديدة"}
              </button>
              <button
                type="button"
                onClick={resetPwd}
                disabled={savingPwd}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
