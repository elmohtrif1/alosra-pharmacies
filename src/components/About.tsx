import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function About() {
  return (
    <section id="about" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              من نحن
            </h2>
            <p className="text-accent font-bold text-lg mb-4">تأسست عام 2004</p>
            <div className="w-20 h-1.5 bg-accent mb-8 rounded-full" />
            
            <div className="space-y-6 text-lg text-foreground/80 font-medium leading-relaxed">
              <p>
                صيدليات الأسرة هي سلسلة صيدليات رائدة وموثوقة، نفخر بتقديم أفضل خدمات الرعاية الصحية لمجتمعاتنا. نؤمن بأن الصحة هي أغلى ما نملك، ولذلك نسعى جاهدين لنكون الوجهة الأولى لكل أسرة تبحث عن الرعاية المتكاملة والاستشارة الطبية الموثوقة.
              </p>
              <p>
                يضم فريقنا نخبة من الصيادلة المرخصين والمؤهلين تأهيلاً عالياً، ملتزمين بتطبيق أعلى معايير الجودة في صرف الأدوية وتقديم المشورة الصحية. نحن لسنا مجرد مكان لبيع الأدوية، بل شريك دائم لأسرتك في رحلة الصحة والعافية.
              </p>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="mt-10 border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 h-auto text-lg transition-transform hover:scale-105 active:scale-95"
              asChild
            >
              <a href="#services">اعرف المزيد عن خدماتنا</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-white/60 rounded-3xl -rotate-2 scale-105" />
            <img
              src="/about.png"
              alt="صيدلية الأسرة من الداخل"
              className="relative z-10 w-full h-auto object-cover rounded-2xl shadow-xl border border-white/20"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
