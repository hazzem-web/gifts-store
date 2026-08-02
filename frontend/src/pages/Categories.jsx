import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';

const Categories = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["عيد ميلاد", "سبوع", "ورد وهدايا"];

  const categoryDescriptions = {
    "عيد ميلاد": "تجهيزات كاملة لأعياد الميلاد، بالونات والديكور المتناسق لكل الأعمار.",
    "سبوع": "أرقى هدايا السبوع وأطقم استقبال المولود الجديد بلمسات فاخرة.",
    "ورد وهدايا": "باقات ورد طبيعي طازج وهدايا مميزة لجميع المناسبات السعيدة."
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products for categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-20 bg-hp-offwhite min-h-screen font-arabic">
      <div className="container mx-auto px-4 text-right">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-black mb-4 text-hp-charcoal">أقسام المتجر</h1>
          <div className="w-20 md:w-24 h-1.5 bg-hp-orange mx-auto mb-4 rounded-full" />
          <p className="text-gray-500 text-base md:text-lg">تصفح تشكيلاتنا المتميزة مخصصة حسب مناسبتك السعيدة</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-hp-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, index) => {
              const catProducts = products.filter(p => p.category === cat);
              const coverImage = catProducts[0]?.image || "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop";

              return (
                <motion.div 
                  key={cat}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="group relative h-[400px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl border border-gray-100"
                >
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="block w-full h-full">
                    <img 
                      src={coverImage.startsWith('http') ? coverImage : `${import.meta.env.VITE_API_URL}${coverImage}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={cat} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8 text-right">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-hp-orange text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Package size={14} />
                          {catProducts.length} منتجات
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{cat}</h2>
                      <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
                        {categoryDescriptions[cat] || `تصفح أرقى منتجات وتجهيزات قسم ${cat}`}
                      </p>
                      <div className="flex items-center gap-2 text-hp-orange font-bold text-base group-hover:translate-x-[-8px] transition-transform">
                        <span>استكشف المنتجات</span>
                        <ArrowLeft size={20} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

