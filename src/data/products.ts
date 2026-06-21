export type Product = {
  id: number;
  name: string;
  brand?: string;
  category: string;
  price: number;
  unit?: string;
  badge?: string;
  image?: string;
  description?: string;
  features?: string[];
};

export const products: Product[] = [
  {
    id: 1,
    name: "Only Curly Shampoo",
    brand: "Les Karités",
    category: "عناية بالشعر",
    price: 150,
    unit: "300 ml",
    badge: "جديد",
    image: "/products-only-curly-shampoo.png",
    description: `مع Only Curly Shampoo من Les Karités، شعرك الكيرلي هيحصل على العناية اللي يستحقها 💖

🌸 يساعد على تحديد التموجات الطبيعية للشعر.
🌸 يقلل الهيشان والتطاير.
🌸 يمنح الشعر نعومة ولمعان طبيعي.
🌸 ينظف الشعر بلطف بدون ما يسبب جفاف.
🌸 خالٍ من السلفات والبارابين والسيليكون.

💗 لأن كل خصلة كيرلي ليها جمالها الخاص... خلي روتين العناية بشعرك يدعم جماله الطبيعي كل يوم.`,
  },
  { id: 2, name: "فيتامين C 1000mg", category: "فيتامينات", price: 85, unit: "30 قرص", badge: "الأكثر مبيعاً" },
  { id: 3, name: "أوميغا 3 زيت السمك", category: "فيتامينات", price: 120, unit: "60 كبسولة" },
  { id: 4, name: "كريم ترطيب يومي SPF 50", category: "عناية بالبشرة", price: 95, unit: "50ml" },
  { id: 5, name: "شامبو للشعر الجاف", category: "عناية بالبشرة", price: 65, unit: "200ml" },
  { id: 6, name: "ضاغط الدم الرقمي", category: "مستلزمات طبية", price: 350, unit: "جهاز", badge: "مميز" },
  { id: 7, name: "ميزان حرارة رقمي", category: "مستلزمات طبية", price: 75, unit: "جهاز" },
  { id: 8, name: "شراب السعال للأطفال", category: "أطفال", price: 45, unit: "120ml" },
  { id: 9, name: "فيتامين D3 للأطفال", category: "أطفال", price: 90, unit: "30 مل", badge: "الأكثر مبيعاً" },
  { id: 10, name: "باراسيتامول 500mg", category: "أدوية", price: 25, unit: "20 قرص" },
  { id: 11, name: "إيبوبروفين 400mg", category: "أدوية", price: 30, unit: "20 قرص" },
  { id: 12, name: "فيتامين B Complex", category: "فيتامينات", price: 70, unit: "30 قرص" },
  { id: 13, name: "غسول اليدين المعقم", category: "عناية بالبشرة", price: 35, unit: "500ml" },
  {
    id: 14,
    name: "GLAMY LAB Hydra Intense Cream",
    brand: "GLAMY LAB",
    category: "عناية بالبشرة",
    price: 550,
    badge: "جديد",
    image: "/products-glamy-lab-hydra-cream.png",
    description: `دلّعي بشرتك بتركيبة متطورة غنية بـ العسل والإيلاستين البحري لتمنحك ترطيبًا عميقًا، نعومة ملحوظة، ومرونة أكثر مع كل استخدام.

✅ ترطيب مكثف يدوم لساعات طويلة
✅ يساعد على زيادة مرونة البشرة
✅ يدعم تجديد البشرة وحمايتها من العوامل الخارجية
✅ مناسب لجميع أنواع البشرة حتى الحساسة
✅ خالٍ من العطور

احصلي على بشرة أكثر نضارة وإشراقًا كل يوم مع GLAMY LAB Hydra Intense Cream.`,
    features: [
      "تركيبة غنية بالعسل والإيلاستين البحري",
      "ترطيب عميق ومكثف",
      "مناسب لجميع أنواع البشرة",
      "خالٍ من العطور",
      "فريدة من نوعها UNIQUE FORMULA",
    ],
  },
];
