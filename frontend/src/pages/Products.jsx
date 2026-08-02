import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Filter, Grid, List, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { apiUrl } from '../lib/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'الكل';
  const initialSearch = queryParams.get('search') || '';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState(2000);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);

  const categories = ["عيد ميلاد", "سبوع", "ورد وهدايا"];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(apiUrl('/api/products'));
      const data = await response.json();
      setProducts(data);
      // Calculate max price from products
      if (data.length > 0) {
        const highestPrice = Math.max(...data.map(p => p.price));
        setMaxPrice(highestPrice);
        setPriceRange(highestPrice);
        setSliderValue(highestPrice); // Start at max (visually left, which is max price)
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    // When container is flipped, sliderValue directly maps to priceRange!
    setPriceRange(value);
  };

  const filteredProducts = products
    .filter(p => selectedCategory === 'الكل' || p.category === selectedCategory)
    .filter(p => p.price <= priceRange)
    .filter(p => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term));
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return b.id - a.id; // newest
    });

  const FilterContent = () => (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 text-right">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <SlidersHorizontal size={20} className="text-hp-orange" />
        <h2 className="text-xl font-bold">الفلاتر</h2>
        <button onClick={() => setIsFilterOpen(false)} className="lg:hidden text-gray-400">
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-8 md:mb-10">
        <h3 className="font-bold mb-4 md:mb-6 text-hp-charcoal">الأقسام</h3>
        <div className="space-y-3 md:space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="category" 
              checked={selectedCategory === 'الكل'} 
              onChange={() => {setSelectedCategory('الكل'); setIsFilterOpen(false);}}
              className="w-5 h-5 accent-hp-orange"
            />
            <span className={`transition-colors ${selectedCategory === 'الكل' ? 'text-hp-orange font-bold' : 'text-gray-500 group-hover:text-hp-orange'}`}>الكل</span>
          </label>
          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category" 
                checked={selectedCategory === cat} 
                onChange={() => {setSelectedCategory(cat); setIsFilterOpen(false);}}
                className="w-5 h-5 accent-hp-orange"
              />
              <span className={`transition-colors ${selectedCategory === cat ? 'text-hp-orange font-bold' : 'text-gray-500 group-hover:text-hp-orange'}`}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8 md:mb-10">
        <h3 className="font-bold mb-4 md:mb-6 text-hp-charcoal">السعر</h3>
        <div 
          className="relative" 
          style={{ 
            transform: 'scaleX(-1)',
            WebkitTransform: 'scaleX(-1)'
          }}
        >
          <input 
            type="range" 
            min="0" 
            max={maxPrice} 
            value={sliderValue} 
            onChange={handleSliderChange}
            onInput={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-hp-orange"
          />
        </div>
        <div className="flex justify-between mt-4 font-bold text-sm">
          <span>{maxPrice} ج.م</span>
          <span>{priceRange} ج.م</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-28 md:pt-32 pb-20 bg-hp-offwhite min-h-screen font-arabic">
      <div className="container mx-auto px-4">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 text-hp-charcoal font-bold"
          >
            <SlidersHorizontal size={20} className="text-hp-orange" />
            <span>الفلاتر</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">{filteredProducts.length} منتج</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:w-1/4 order-1 lg:order-2">
            <div className="sticky top-32">
              <FilterContent />
            </div>
          </aside>

          {/* Sidebar (Mobile Overlay) */}
          {isFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-[100] flex items-end">
              <div className="absolute inset-0 bg-black/60" onClick={() => setIsFilterOpen(false)} />
              <div className="w-full bg-white rounded-t-3xl relative z-10 animate-slide-up">
                <FilterContent />
              </div>
            </div>
          )}
          
          {/* Products Grid Area */}
          <div className="lg:w-3/4 order-2 lg:order-1">
            <div className="flex items-center justify-between mb-8">
              <div className="hidden lg:block text-gray-500 font-bold">
                تم العثور على <span className="text-hp-orange">{filteredProducts.length}</span> منتج
              </div>
              
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-grow lg:flex-grow-0">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full lg:w-auto appearance-none bg-white border border-gray-100 px-10 py-2.5 rounded-xl font-bold text-sm focus:outline-none focus:border-hp-orange shadow-sm text-right cursor-pointer"
                  >
                    <option value="newest">الأحدث</option>
                    <option value="price-low">السعر: من الأقل للأعلى</option>
                    <option value="price-high">السعر: من الأعلى للأقل</option>
                  </select>
                  <ChevronDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-40">
                <div className="w-12 h-12 border-4 border-hp-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-40 bg-white rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-300 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-400">حاول البحث بكلمات أخرى أو تغيير الفلاتر</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
