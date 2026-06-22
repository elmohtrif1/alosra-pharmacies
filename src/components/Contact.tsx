import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-primary to-[#0d4a8a]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            تواصل معنا
          </h2>
          <div className="w-24 h-1.5 bg-accent mx-auto rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-white"
        >
          <h3 className="text-3xl font-bold mb-4 text-center">نحن هنا لخدمتك</h3>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed text-center">
            يسعدنا تواصلك معنا للإجابة على استفساراتك وتلبية احتياجاتك الصحية. فريقنا متاح على مدار الساعة لتقديم الدعم والمشورة.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-200">الهاتف الموحد</p>
                <a href="tel:01220218685" className="text-xl font-bold hover:text-white/80 transition-colors" dir="ltr">012 20218685</a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <SiWhatsapp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-blue-200">واتساب</p>
                <a
                  href="https://wa.me/201275006840"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold hover:text-white/80 transition-colors"
                  dir="ltr"
                >
                  +20 12 75006840
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-200">البريد الإلكتروني</p>
                <a href="mailto:dr.mahmoudawad36@gmail.com" className="text-lg font-medium font-sans hover:text-white/80 transition-colors">dr.mahmoudawad36@gmail.com</a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-200">المقر الرئيسي</p>
                <p className="text-lg font-medium">مصر،الإسكندرية</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
