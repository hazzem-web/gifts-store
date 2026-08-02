import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="pt-40 pb-20 text-center px-4">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-hp-orange/10 rounded-full text-hp-orange">
            <ShoppingBag size={64} className="md:w-16 md:h-16 w-12 h-12" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">سلة المشتريات فارغة</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">يبدو أنك لم تضف أي منتجات للسلة بعد. تصفح منتجاتنا المميزة الآن.</p>
        <Link to="/products" className="btn-orange px-10 py-3 inline-block font-bold">
          ابدأ التسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-right">سلة المشتريات</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {cartItems.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id} 
                className="flex flex-col sm:flex-row items-center p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 gap-4"
              >
                <div className="w-full sm:w-24 h-48 sm:h-24 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                </div>
                
                <div className="flex-grow text-right w-full sm:w-auto">
                  <h3 className="font-bold text-lg md:text-xl text-hp-charcoal">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.category} {item.size && `- ${item.size}`}</p>
                  <div className="font-black text-hp-orange text-lg">{item.price} ج.م</div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="flex items-center space-x-3 space-x-reverse bg-hp-offwhite p-1.5 rounded-xl border border-gray-200">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:text-hp-orange transition-colors text-hp-charcoal"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-8 text-center font-bold text-hp-charcoal">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:text-hp-orange transition-colors text-hp-charcoal"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-100 text-right">ملخص الطلب</h2>
            <div className="space-y-4 mb-8 text-right">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">المجموع الفرعي</span>
                <span className="font-bold">{cartTotal} ج.م</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span>التوصيل</span>
                <span className="text-sm">يتم حسابه في الخطوة التالية</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xl font-black">
                <span>الإجمالي</span>
                <span className="text-hp-orange">{cartTotal} ج.م</span>
              </div>
            </div>
            <Link to="/checkout" className="w-full btn-orange py-4 block text-center text-lg font-bold shadow-lg shadow-hp-orange/20">
              إتمام الطلب
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
