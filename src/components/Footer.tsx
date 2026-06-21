import { SiFacebook, SiInstagram } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-[#1a2d4f] text-white pt-16 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          <div>
            <img src="/logo.png" alt="صيدليات الأسرة" className="h-14 w-auto object-contain mb-6 brightness-0 invert" />
            <p className="text-gray-300 mb-6 leading-relaxed">
              نرعى صحتكم ونوفر الأفضل لعائلتك. نلتزم بتقديم أفضل الخدمات الدوائية والصحية بأعلى معايير الجودة والموثوقية.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/alosrapharmacies?locale=ar_AR" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors" aria-label="فيسبوك">
                <SiFacebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/alosra.pharmacies/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors" aria-label="انستقرام">
                <SiInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all inline-block">الرئيسية</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all inline-block">من نحن</a></li>
              <li><a href="#services" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all inline-block">خدماتنا</a></li>
              <li><a href="#branches" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all inline-block">فروعنا</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all inline-block">تواصل معنا</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white">خدماتنا</h4>
            <ul className="space-y-3">
              <li className="text-gray-300">الأدوية والوصفات الطبية</li>
              <li className="text-gray-300">منتجات الأم والطفل</li>
              <li className="text-gray-300">قياس الضغط والسكر</li>
              <li className="text-gray-300">الفيتامينات والمكملات</li>
              <li className="text-gray-300">مستحضرات التجميل</li>
              <li className="text-gray-300">خدمة التوصيل السريع</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} صيدليات الأسرة - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
