import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", href: "/#home" },
    { name: "المنتجات", href: "/products" },
    { name: "من نحن", href: "/#about" },
    { name: "خدماتنا", href: "/#services" },
    { name: "الفروع", href: "/#branches" },
    { name: "تواصل معنا", href: "/#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const hash = href.slice(1);
      const scrollToHash = () => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      };

      if (location !== "/") {
        navigate("/");
        setTimeout(scrollToHash, 200);
      } else {
        scrollToHash();
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="bg-primary text-primary-foreground py-1 px-4 text-sm text-left font-medium">
        <div className="container mx-auto">
          اتصل بنا: <a href="tel:01220218685" className="underline hover:text-white/80 transition-colors" dir="ltr">012 20218685</a> | كل أيام الأسبوع 24 ساعة
        </div>
      </div>

      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-white py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="صيدليات الأسرة" className="h-10 w-auto object-contain" />
            <span className="text-primary font-bold text-xl hidden sm:inline-block">صيدليات الأسرة</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-foreground hover:text-primary transition-colors font-semibold"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm transition-transform hover:scale-105 active:scale-95"
              asChild
            >
              <a href="/#contact" onClick={(e) => handleNavClick(e, "/#contact")}>اطلب الآن</a>
            </Button>
          </div>

          <button
            className="md:hidden text-foreground hover:text-primary transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-border shadow-lg py-4 px-4 flex flex-col gap-4">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block text-foreground hover:text-primary transition-colors font-semibold text-lg"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 w-full mt-2"
              asChild
            >
              <a href="/#contact" onClick={(e) => handleNavClick(e, "/#contact")}>اطلب الآن</a>
            </Button>
          </div>
        )}
      </nav>
    </>
  );
}
