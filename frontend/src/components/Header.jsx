import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Search, User, Gift, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { cartCount, favorites } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'عيد ميلاد', path: '/products?category=عيد ميلاد' },
    { name: 'سبوع', path: '/products?category=سبوع' },
    { name: 'ورد وهدايا', path: '/products?category=ورد وهدايا' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-black z-50 border-b border-hp-orange/20 shadow-[0_0_20px_rgba(255,112,0,0.1)]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Right: Logo */}
        <Link to="/" className="flex items-center space-x-2 space-x-reverse group shrink-0">
          <div className="h-10 w-10 md:h-12 md:w-12 bg-hp-orange rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,112,0,0.5)] group-hover:scale-110 transition-transform overflow-hidden">
            <img src="./logo.svg" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          </div>
          <span className="text-lg md:text-2xl font-black text-hp-orange hover:text-white transition-colors duration-300 tracking-tighter shadow-orange-500/50">
            HALLOWEEN PARTY
          </span>
        </Link>

        {/* Center: Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className="text-gray-300 hover:text-hp-orange font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Left: Search & Icons */}
        <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-hp-orange transition-all">
            <button type="submit">
              <Search size={18} className="text-gray-500 hover:text-hp-orange transition-colors" />
            </button>
            <input 
              type="text" 
              placeholder="بحث..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm px-2 w-32 text-white placeholder:text-gray-600"
            />
          </form>
          
          <Link to="/favorites" className="relative p-1.5 md:p-2 text-gray-400 hover:text-hp-orange transition-colors">
            <Heart size={20} className={`md:w-6 md:h-6 ${favorites.length > 0 ? 'fill-hp-orange text-hp-orange' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute top-0 right-0 bg-hp-orange text-hp-charcoal font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </Link>
          
          <Link to="/cart" className="relative p-1.5 md:p-2 text-gray-400 hover:text-hp-orange transition-colors">
            <ShoppingBag size={20} className="md:w-6 md:h-6" />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={cartCount}
                className="absolute top-0 right-0 bg-hp-orange text-hp-charcoal font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,112,0,0.5)]"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-1.5 text-hp-orange"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[280px] bg-[#1a1a1a] shadow-2xl z-[60] md:hidden border-r border-white/5"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-xl font-black text-hp-orange">القائمة</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSearch} className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-8 focus-within:border-hp-orange transition-all">
                  <Search size={18} className="text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن منتج..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-sm px-3 w-full text-white placeholder:text-gray-600"
                  />
                </form>

                <nav className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      className="text-lg font-bold text-gray-300 hover:text-hp-orange hover:bg-white/5 p-3 rounded-xl transition-all flex items-center justify-between group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                      <ArrowLeft size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="mt-auto p-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center justify-around">
                  <Link to="/favorites" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-hp-orange">
                    <Heart size={24} />
                    <span className="text-xs">المفضلة</span>
                  </Link>
                  <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-hp-orange">
                    <ShoppingBag size={24} />
                    <span className="text-xs">السلة</span>
                  </Link>
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-hp-orange">
                    <User size={24} />
                    <span className="text-xs">حسابي</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
