import { SiWhatsapp } from "react-icons/si";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { branches, toWhatsAppNumber } from "@/components/Branches";

interface BranchOrderDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  waMessage: string;
}

export function BranchOrderDialog({ open, setOpen, waMessage }: BranchOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-black">اختر الفرع الذي تريد الطلب منه</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            يمكنك التواصل عبر واتساب مع أي فرع من الفروع التالية.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          {branches.map((branch) => (
            <a
              key={branch.city}
              href={`https://wa.me/${toWhatsAppNumber(branch.whatsapp)}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md text-right"
            >
              <p className="font-semibold text-gray-800">{branch.city}</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-white text-xs font-bold">
                <SiWhatsapp className="w-3 h-3" />
                واتساب
              </span>
            </a>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <DialogClose asChild>
            <button className="text-sm text-gray-500 hover:text-gray-700 transition">إلغاء</button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
