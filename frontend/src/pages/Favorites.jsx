import React from 'react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const { favorites } = useCart();

  return (
    <div className="pt-32 pb-20 bg-hp-offwhite min-h-screen font-arabic">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-hp-orange/10 rounded-full">
              <Heart className="text-hp-orange" size={40} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-hp-charcoal mb-4">المفضلة</h1>
          <p className="text-gray-500">المنتجات التي نالت إعجابك وترغب في العودة إليها لاحقاً</p>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <Heart size={64} className="mx-auto text-gray-200 mb-6" />
            <h2 className="text-2xl font-bold text-hp-charcoal mb-4">قائمة المفضلة فارغة</h2>
            <p className="text-gray-400 mb-8 px-8">لم تقم بإضافة أي منتجات للمفضلة بعد. تصفح منتجاتنا وأضف ما يعجبك!</p>
            <Link to="/products" className="btn-orange px-10 py-3 inline-block font-bold rounded-xl">تصفح المنتجات</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
