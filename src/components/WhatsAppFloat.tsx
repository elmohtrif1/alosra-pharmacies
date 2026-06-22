import { useLocation } from "wouter";

const WHATSAPP_NUMBER = "201275006840";
const WHATSAPP_MESSAGE = encodeURIComponent("مرحباً، أريد الاستفسار عن منتجاتكم");

export function WhatsAppFloat() {
  const [location] = useLocation();

  if (location.startsWith("/admin")) return null;

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 group"
    >
      <span className="hidden group-hover:flex bg-white text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg border border-gray-100 whitespace-nowrap transition-all duration-200">
        تواصل معنا
      </span>
      <div className="w-14 h-14 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-8 h-8 fill-white"
        >
          <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.736 5.471 2.024 7.773L0 32l8.469-2.001A15.937 15.937 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.28 13.28 0 0 1-6.773-1.851l-.486-.29-5.025 1.187 1.228-4.895-.317-.503A13.263 13.263 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.273-9.961c-.398-.199-2.355-1.162-2.72-1.294-.365-.133-.631-.199-.897.199s-1.029 1.294-1.261 1.56c-.232.265-.465.298-.863.1-.398-.199-1.681-.619-3.201-1.977-1.183-1.056-1.981-2.36-2.213-2.758-.232-.399-.025-.614.174-.812.179-.178.398-.465.597-.698.199-.232.265-.398.398-.664.133-.265.066-.498-.033-.697-.1-.199-.897-2.162-1.229-2.96-.323-.777-.652-.672-.897-.684l-.764-.013c-.266 0-.698.1-.1063.498-.365.398-1.395 1.362-1.395 3.325 0 1.962 1.428 3.858 1.627 4.124.199.265 2.811 4.291 6.81 6.017.952.411 1.695.656 2.274.84.956.304 1.825.261 2.513.158.767-.114 2.355-.963 2.688-1.893.333-.93.333-1.727.233-1.893-.099-.165-.365-.265-.763-.465z" />
        </svg>
      </div>
    </a>
  );
}
