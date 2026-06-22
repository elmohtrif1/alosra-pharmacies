import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] w-full flex items-center overflow-hidden bg-gradient-to-l from-primary to-[#0d4a8a]"
    >
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Right Side (Text) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-right"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            صيدليات الأسرة
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 mb-10 max-w-2xl font-medium leading-relaxed">
            نرعى صحتكم ونوفر أفضل الخدمات الدوائية لجميع أفراد الأسرة. رعاية طبية متكاملة بلمسة إنسانية.
          </p>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-4 items-center">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base md:text-lg px-5 md:px-8 py-5 md:py-6 h-auto shadow-lg transition-transform hover:scale-105 active:scale-95"
              asChild
            >
              <a href="#contact">اطلب الآن</a>
            </Button>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base md:text-lg px-5 md:px-8 py-5 md:py-6 h-auto shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
              asChild
            >
              <a href="/products">
                <ShoppingBag className="w-5 h-5" />
                تسوق الآن
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary text-base md:text-lg px-5 md:px-8 py-5 md:py-6 h-auto transition-transform hover:scale-105 active:scale-95"
              asChild
            >
              <a href="#branches">فروعنا</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary text-base md:text-lg px-5 md:px-8 py-5 md:py-6 h-auto transition-transform hover:scale-105 active:scale-95"
              asChild
            >
              <a href="#about">تعرف علينا</a>
            </Button>
          </div>
        </motion.div>

        {/* Left Side (Decorative) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative hidden lg:flex items-center justify-center"
        >
          <div className="relative w-full max-w-md mx-auto">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl scale-110" />
            <div className="relative bg-white/15 backdrop-blur-sm rounded-[3rem] p-10 border border-white/25 shadow-2xl flex flex-col items-center gap-6">
              <img src="/logo.png" alt="صيدليات الأسرة" className="w-36 h-36 object-contain drop-shadow-xl" />
              <div className="text-center">
                <p className="text-white font-black text-2xl mb-1">صيدليات الأسرة</p>
                <p className="text-blue-200 text-base font-medium">رعاية صحية متكاملة لعائلتك</p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-2">
                {[
                  { num: "٢٤", label: "ساعة خدمة" },
                  { num: "١٠٠٪", label: "جودة مضمونة" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/10 rounded-2xl p-3 text-center border border-white/20">
                    <p className="text-white font-black text-lg leading-tight">{stat.num}</p>
                    <p className="text-blue-200 text-xs mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
    </section>
  );
}
