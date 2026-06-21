import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const branches = [
  {
    city: "فرع ابو سليمان",
    hours: "مفتوح 24 ساعة",
    phones: ["+20 12 25652314"],
    whatsapp: "+20 12 25652314",
    mapsUrl: "https://www.google.com/maps/place/31%C2%B014'15.7%22N+29%C2%B058'57.2%22E/@31.2376938,29.9799748,17z",
  },
  {
    city: "فرع سيدي بشر",
    hours: "من 8 الصبح حتى 2 بالليل",
    phones: ["+20 12 20218685"],
    whatsapp: "+20 12 20218685",
    mapsUrl: "https://www.google.com/maps/place/31%C2%B015'21.8%22N+29%C2%B059'57.1%22E/@31.2560463,30.0013857,17z",
  },
  {
    city: "فرع المنشية",
    hours: "مفتوح 24 ساعة",
    phones: ["01202112105", "035176644"],
    whatsapp: "01202112105",
    mapsUrl: "https://www.google.com/maps/place/31%C2%B015'21.5%22N+30%C2%B001'14.4%22E/@31.25597,30.0228453,17z",
  },
  {
    city: "فرع اسكوت",
    hours: "مفتوح 24 ساعة",
    phones: ["01097912033", "035168484"],
    whatsapp: "01097912033",
    mapsUrl: "https://www.google.com/maps/place/31%C2%B015'27.0%22N+30%C2%B001'16.0%22E/@31.2575,30.0211111,17z",
  },
  {
    city: "فرع شارع 10",
    hours: "مفتوح 24 ساعة",
    phones: ["01201247543", "035168525"],
    whatsapp: "01201247543",
    mapsUrl: "https://www.google.com/maps/place/31%C2%B015'21.5%22N+30%C2%B001'14.4%22E/@31.25597,30.0228453,17z",
  },
];

function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/[\s+\-()]/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return "20" + digits.slice(1);
  return digits;
}

type Branch = typeof branches[0];

function BranchCard({ branch, index }: { branch: Branch; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="h-full"
    >
      <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow h-full">
        <CardContent className="p-6 text-center flex flex-col items-center h-full">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">
            {branch.city}
          </h3>
          <div className="space-y-2 mb-6 text-muted-foreground font-medium w-full">
            {branch.hours && <p className="text-sm">{branch.hours}</p>}
            {branch.phones.map((phone, pi) => (
              <a
                key={pi}
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span dir="ltr">{phone}</span>
              </a>
            ))}
            <a
              href={`https://wa.me/${toWhatsAppNumber(branch.whatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-green-600 hover:text-green-700 transition-colors"
            >
              <SiWhatsapp className="w-4 h-4 flex-shrink-0" />
              <span>واتساب</span>
            </a>
          </div>
          <a
            href={branch.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-auto"
          >
            <Button
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent hover:text-white transition-colors"
            >
              عرض الفرع على الخريطة
            </Button>
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Branches() {
  return (
    <section id="branches" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
            فروعنا
          </h2>
          <div className="w-24 h-1.5 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {branches.slice(0, 3).map((branch, index) => (
            <BranchCard key={index} branch={branch} index={index} />
          ))}
        </div>

        <div className="flex justify-center mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full lg:w-2/3">
            {branches.slice(3).map((branch, index) => (
              <BranchCard key={index + 3} branch={branch} index={index + 3} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full h-[400px] bg-secondary rounded-3xl relative overflow-hidden flex items-center justify-center border border-border/50"
        >
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1a6baf_1px,transparent_1px),linear-gradient(to_bottom,#1a6baf_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <MapPin className="w-12 h-12 text-primary opacity-50" />
            <p className="text-primary/60 font-bold text-xl">خريطة الفروع</p>
            <div className="flex flex-wrap justify-center gap-3">
              {branches.map((branch, index) => (
                <a
                  key={index}
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary/70 hover:text-primary transition-colors font-medium"
                >
                  <MapPin className="w-3 h-3" />
                  {branch.city}
                </a>
              ))}
            </div>
          </div>
          {["top-1/4 left-1/4", "top-1/3 right-1/3", "bottom-1/3 left-1/2", "top-1/2 left-1/3", "bottom-1/4 right-1/4"].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-4 h-4 bg-accent rounded-full shadow-lg shadow-accent/50 animate-pulse`}
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
