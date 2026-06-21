import { motion } from "framer-motion";
import { Pill, Baby, Heart, Leaf, Sparkles, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    title: "الأدوية والوصفات الطبية",
    description: "توفير وصرف جميع أنواع الأدوية بوصفات طبية موثوقة",
    icon: Pill,
  },
  {
    title: "منتجات الأم والطفل",
    description: "مجموعة متكاملة من منتجات الأمومة والطفولة والرضاعة",
    icon: Baby,
  },
  {
    title: "قياس الضغط والسكر",
    description: "أجهزة متطورة لمتابعة مستويات الضغط والسكر بدقة",
    icon: Heart,
  },
  {
    title: "الفيتامينات والمكملات",
    description: "مجموعة واسعة من الفيتامينات والمكملات الغذائية المتنوعة",
    icon: Leaf,
  },
  {
    title: "مستحضرات التجميل",
    description: "أفضل منتجات العناية بالبشرة والشعر والجسم من أشهر الماركات",
    icon: Sparkles,
  },
  {
    title: "خدمة التوصيل السريع",
    description: "توصيل طلباتك بسرعة وأمان إلى أي مكان تريده",
    icon: Truck,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function Services() {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
            خدماتنا
          </h2>
          <div className="w-24 h-1.5 bg-accent mx-auto rounded-full" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden bg-white">
                  <CardContent className="p-8 flex flex-col items-start text-right">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                      <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
