import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCategories } from "@/hooks/useCategories";
import { AdminLayout } from "./AdminLayout";

export function AdminCategories() {
  const { categories, loading, reload } = useCategories();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!supabase || !newName.trim()) return;
    setSaving(true);
    await supabase.from("categories").insert({ name: newName.trim(), sort_order: categories.length });
    setNewName("");
    setAdding(false);
    await reload();
    setSaving(false);
  };

  const handleEdit = async (id: number) => {
    if (!supabase || !editName.trim()) return;
    setSaving(true);
    await supabase.from("categories").update({ name: editName.trim() }).eq("id", id);
    setEditId(null);
    await reload();
    setSaving(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!supabase) return;
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟ المنتجات المرتبطة ستفقد فئتها.`)) return;
    await supabase.from("categories").delete().eq("id", id);
    await reload();
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-800">الفئات</h1>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            إضافة فئة
          </button>
        </div>

        {adding && (
          <div className="bg-white border border-blue-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="اسم الفئة الجديدة..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              dir="rtl"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button onClick={handleAdd} disabled={saving} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setAdding(false)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between px-5 py-3.5">
                  {editId === cat.id ? (
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        dir="rtl"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleEdit(cat.id)}
                      />
                      <button onClick={() => handleEdit(cat.id)} disabled={saving} className="p-1.5 bg-emerald-600 text-white rounded-lg">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditId(null)} className="p-1.5 bg-slate-200 rounded-lg">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-800 font-medium text-sm">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
