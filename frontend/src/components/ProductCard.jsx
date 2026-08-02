import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Minus, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { imageUrl } from '../lib/api';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { addToCart, toggleFavorite, favorites, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const isFavorite = favorites.some(p => p.id === product.id);
  const inCartQuantity = getItemQuantity(product.id);
  const effectiveStock = product.stock - inCartQuantity;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const qtyToAdd = parseInt(quantity) || 0;
    if (qtyToAdd > 0 && effectiveStock >= qtyToAdd) {
      for(let i = 0; i < qtyToAdd; i++) {
        addToCart(product);
      }
      setQuantity(1);
    }
  };

  const increment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < effectiveStock) setQuantity(q => q + 1);
  };

  const decrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleQuantityChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  if (viewMode === 'list') {
    // ... existing list mode code (could also be updated if needed, but focusing on grid as per screenshot)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-white/5 hover:border-hp-orange/30"
    >
      {/* Favorite Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product);
        }}
        className="absolute top-4 left-4 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-hp-orange transition-colors shadow-md"
      >
        <Heart size={18} className={isFavorite ? 'fill-hp-orange text-hp-orange' : ''} />
      </button>

      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden block">
        <img 
          src={imageUrl(product.image)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60" />
      </Link>

      {/* Details Area */}
      <div className="p-3 md:p-5 text-right flex flex-col gap-2 md:gap-3">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-base md:text-xl font-bold text-white mb-0.5 md:mb-1 truncate group-hover:text-hp-orange transition-colors">
            {product.name}
          </h3>
          <div className="text-lg md:text-2xl font-black text-hp-orange">
            {product.price} <span className="text-xs md:text-sm font-bold text-hp-orange/80">ج.م</span>
          </div>
        </Link>

        {/* Quantity and Add to Cart */}
        <div className="flex flex-col gap-2 mt-1 md:mt-2">
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-1 border border-white/5">
            <div className="flex items-center space-x-1 space-x-reverse">
              <button 
                onClick={decrement}
                className="p-1.5 md:p-2 hover:text-hp-orange transition-colors text-white disabled:opacity-30"
                disabled={quantity <= 1}
              >
                <Minus size={14} className="md:w-4 md:h-4" />
              </button>
              <input 
                type="text" 
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleBlur}
                className="w-8 md:w-12 bg-transparent text-center text-white font-bold text-sm md:text-base focus:outline-none"
              />
              <button 
                onClick={increment}
                className="p-1.5 md:p-2 hover:text-hp-orange transition-colors text-white disabled:opacity-30"
                disabled={quantity >= effectiveStock}
              >
                <Plus size={14} className="md:w-4 md:h-4" />
              </button>
            </div>
            <span className="text-[10px] md:text-xs text-gray-500 font-medium px-2">
              {effectiveStock > 0 ? `متوفر: ${effectiveStock}` : 'نفذ'}
            </span>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={effectiveStock <= 0}
            className="w-full bg-hp-orange hover:bg-hp-orange-dark text-white py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-hp-orange/20 text-sm md:text-base"
          >
            <ShoppingCart size={16} className="md:w-5 md:h-5" />
            إضافة للسلة
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
