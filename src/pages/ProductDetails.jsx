import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, ShieldCheck, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, toggleFavorite, favorites, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await response.json();
        const found = data.find(p => p.id === parseInt(id));
        setProduct(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="pt-40 text-center">جاري التحميل...</div>;
  if (!product) return <div className="pt-40 text-center">المنتج غير موجود</div>;

  const isFavorite = favorites.some(p => p.id === product.id);
  const inCartQuantity = getItemQuantity(product.id);
  const effectiveStock = product.stock - inCartQuantity;

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      if (num < 1) setQuantity(1);
      else if (num > effectiveStock) setQuantity(effectiveStock);
      else setQuantity(num);
    }
  };

  const handleBlur = () => {
    if (quantity === '' || isNaN(quantity)) {
      setQuantity(1);
    }
  };

  return (
      <div className="pt-24 md:pt-32 pb-20 bg-hp-offwhite font-arabic">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs or Close Button */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <span className="text-hp-charcoal font-bold text-base md:text-lg truncate max-w-[200px] md:max-w-none">{product.name}</span>
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 bg-white rounded-full shadow-md hover:text-hp-orange transition-all flex items-center justify-center group"
              title="رجوع"
            >
              <X size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 bg-white p-6 md:p-12 rounded-3xl shadow-xl border border-gray-100">
          {/* Image Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-2xl overflow-hidden cursor-zoom-in"
            onClick={() => setIsImageModalOpen(true)}
          >
            <img 
              src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL}${product.image}`} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              alt={product.name}
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product);
              }}
              className="absolute top-4 left-4 md:top-6 md:left-6 p-3 md:p-4 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:text-hp-orange transition-all"
            >
              <Heart size={20} className={`md:w-6 md:h-6 ${isFavorite ? 'fill-hp-orange text-hp-orange' : ''}`} />
            </button>
          </motion.div>

          {/* Details Area */}
          <div className="text-right flex flex-col justify-center">
            <span className="text-hp-orange font-bold tracking-widest uppercase mb-2 md:mb-4 block text-sm md:text-base">{product.category}</span>
            <h1 className="text-3xl md:text-5xl font-black text-hp-charcoal mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 justify-end mb-6 md:mb-8">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${effectiveStock - quantity >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {effectiveStock - quantity > 0 
                  ? `متوفر: ${effectiveStock - quantity} قطعة` 
                  : effectiveStock - quantity === 0 
                    ? 'ستنفذ الكمية عند الطلب' 
                    : 'الكمية غير متوفرة'}
              </span>
              <div className="text-3xl md:text-4xl font-black text-hp-orange">
                {product.price} <span className="text-lg md:text-xl font-bold">ج.م</span>
              </div>
            </div>

            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 md:mb-10">
              {product.description || 'لا يوجد وصف متاح لهذا المنتج حالياً. ولكننا نضمن لك جودة عالية وتجربة مميزة مع جميع منتجاتنا.'}
            </p>

            {effectiveStock > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-10 md:mb-12">
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 bg-hp-offwhite justify-between sm:justify-center">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                    className="px-4 py-2 text-2xl font-bold text-gray-400 hover:text-hp-orange"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onBlur={handleBlur}
                    className="w-16 md:w-20 bg-transparent text-center text-xl font-bold border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-hp-charcoal"
                  />
                  <button 
                    onClick={() => setQuantity(q => Math.min(effectiveStock, q + 1))} 
                    className="px-4 py-2 text-2xl font-bold text-gray-400 hover:text-hp-orange"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => {
                    const qtyToAdd = parseInt(quantity) || 0;
                    if (qtyToAdd > 0 && effectiveStock >= qtyToAdd) {
                      for(let i=0; i<qtyToAdd; i++) addToCart(product);
                      setQuantity(1);
                    }
                  }}
                  className="flex-1 bg-hp-orange hover:bg-hp-orange-dark text-white py-4 md:py-5 text-lg md:text-xl font-bold rounded-xl flex items-center justify-center gap-4 shadow-xl shadow-hp-orange/20 transition-all active:scale-95"
                >
                  <ShoppingCart size={24} />
                  <span>إضافة إلى السلة</span>
                </button>
              </div>
            )}

            {/* Quick Trust Icons */}
            <div className="grid grid-cols-2 gap-4 pt-6 md:pt-8 border-t border-gray-100">
              <div className="flex flex-col items-center gap-2 text-center">
                <ShieldCheck size={28} className="text-hp-orange" strokeWidth={1.5} />
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">ضمان 100%</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <CheckCircle size={28} className="text-hp-orange" strokeWidth={1.5} />
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">معاينة مجانية</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal (Lightbox) */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageModalOpen(false)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsImageModalOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-hp-orange transition-colors flex items-center gap-2 font-bold"
              >
                <span>إغلاق</span>
                <X size={32} />
              </button>
              <img 
                src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL}${product.image}`} 
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
                alt={product.name}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
