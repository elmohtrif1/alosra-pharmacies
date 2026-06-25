import { useLocation } from "wouter";
import {
  LayoutDashboard, Package, Tag, Users, Star, LogOut, Menu, X, Settings,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/categories", label: "الفئات", icon: Tag },
  { href: "/admin/staff", label: "الموظفون", icon: Users, adminOnly: true },
  { href: "/admin/ratings", label: "التقييمات", icon: Star },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location, navigate] = useLocation();
  const { profile, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-slate-900 text-white flex flex-col z-30 transform transition-transform duration-200
          ${open ? "translate-x-0" : "translate-x-full"} lg:translate-x-0 lg:static`}
      >
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-lg object-contain bg-white p-0.5" />
            <div>
              <p className="font-bold text-sm text-white">صيدليات الأسرة</p>
              <p className="text-xs text-slate-400">لوحة الإدارة</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.filter((n) => !n.adminOnly || isAdmin).map(({ href, label, icon: Icon }) => {
            const active = location.startsWith(href);
            return (
              <button
                key={href}
                onClick={() => { navigate(href); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-right
                  ${active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="mb-3">
            <p className="text-sm font-semibold text-white truncate">{profile?.full_name ?? profile?.email}</p>
            <p className="text-xs text-slate-400">
              {profile?.role === "admin" ? "مدير" : "موظف"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { isAuthenticated, isStaff, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isStaff) {
    navigate("/admin/login");
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden" dir="rtl">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-800">صيدليات الأسرة</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
