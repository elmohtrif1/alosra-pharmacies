import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

function getResetRedirectUrl(): string {
  const base =
    (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, "") ||
    window.location.origin;
  return `${base}/admin/reset-password`;
}

export function AdminForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setLoading(true);
    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getResetRedirectUrl(),
      });
      if (sbError) throw sbError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إرسال رابط إعادة التعيين");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
        </div>
        <h1 className="text-xl font-black text-slate-800 text-center mb-1">إعادة تعيين كلمة المرور</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور
        </p>

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center leading-relaxed">
              إذا كان البريد الإلكتروني مسجلًا، فسيتم إرسال رابط إعادة تعيين كلمة المرور إليه
            </div>
            <button
              onClick={() => navigate("/admin/login")}
              className="w-full text-sm text-blue-600 hover:text-blue-700 hover:underline text-center"
            >
              العودة إلى تسجيل الدخول
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-right">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                  placeholder="admin@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                className="w-full text-sm text-slate-500 hover:text-slate-700 hover:underline text-center"
              >
                العودة إلى تسجيل الدخول
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
