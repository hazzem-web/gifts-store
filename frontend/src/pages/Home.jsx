import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import TrustSection from '../components/TrustSection';
import { ArrowLeft } from 'lucide-react';
import { apiUrl } from '../lib/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetch(apiUrl('/api/products'))
      .then(res => res.json())
      .then(data => setFeaturedProducts(data.slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[85vh] flex items-center overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1920&auto=format&fit=crop"
            alt="تجهيزات الحفلات والهدايا"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/60 md:bg-black/50" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-white"
          >
            <h1 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              اجعل حفلتك لا تُنسى
            </h1>
            <p className="text-lg md:text-2xl mb-8 md:mb-10 text-white/90 leading-relaxed px-4">
              نقدم لك أرقى الهدايا وتجهيزات الحفلات التي تضيف لمسة من السحر على مناسباتك الخاصة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-6 sm:px-0">
              <Link to="/products" className="btn-orange text-base md:text-lg px-8 md:px-12 py-3 md:py-4 flex items-center justify-center font-bold shadow-lg shadow-hp-orange/20">
                تسوق الآن
              </Link>
              <Link to="/categories" className="btn-orange-outline !text-white !border-white hover:!bg-white hover:!text-hp-charcoal text-base md:text-lg px-8 md:px-12 py-3 md:py-4 flex items-center justify-center font-bold">
                تصفح الأقسام
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-16 md:py-24 bg-hp-offwhite overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">تسوق حسب القسم</h2>
            <div className="w-16 md:w-24 h-1 bg-hp-orange mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Link 
              to="/products?category=عيد ميلاد"
              className="relative h-[300px] md:h-[500px] group cursor-pointer overflow-hidden rounded-2xl block shadow-xl"
            >
              <img src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="عيد ميلاد" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10 text-right">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">عيد ميلاد</h3>
                <p className="text-white/70 text-sm md:text-base mb-3 md:mb-4">تجهيزات كاملة لكل الأعمار</p>
                <span className="text-hp-orange font-bold flex items-center gap-2 text-sm md:text-base">تصفح الآن <ArrowLeft size={18} /></span>
              </div>
            </Link>
            <Link 
              to="/products?category=سبوع"
              className="relative h-[300px] md:h-[500px] group cursor-pointer overflow-hidden rounded-2xl block shadow-xl"
            >
              <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="سبوع" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10 text-right">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">سبوع</h3>
                <p className="text-white/70 text-sm md:text-base mb-3 md:mb-4">أرقى هدايا المولود الجديد</p>
                <span className="text-hp-orange font-bold flex items-center gap-2 text-sm md:text-base">تصفح الآن <ArrowLeft size={18} /></span>
              </div>
            </Link>
            <Link 
              to="/products?category=ورد وهدايا"
              className="relative h-[300px] md:h-[500px] group cursor-pointer overflow-hidden rounded-2xl block shadow-xl"
            >
              <img src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="ورد وهدايا" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10 text-right">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">ورد وهدايا</h3>
                <p className="text-white/70 text-sm md:text-base mb-3 md:mb-4">باقات ورد وهدايا مميزة</p>
                <span className="text-hp-orange font-bold flex items-center gap-2 text-sm md:text-base">تصفح الآن <ArrowLeft size={18} /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div className="text-right">
              <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">المنتجات المميزة</h2>
              <div className="w-16 md:w-20 h-1 bg-hp-orange" />
            </div>
            <Link to="/products" className="text-hp-orange flex items-center space-x-2 space-x-reverse hover:underline font-bold text-sm md:text-base">
              <span>عرض الكل</span>
              <ArrowLeft size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <TrustSection />
    </div>
  );
};

export default Home;
