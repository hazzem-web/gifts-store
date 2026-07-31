import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload, Search, Filter } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const AdminProducts = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get('filter');

  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'عيد ميلاد',
    price: '',
    stock: '',
    description: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchProducts();
    if (initialFilter === 'low-stock') {
      // Logic for low stock will be applied in filteredProducts
    }
  }, [initialFilter]);

  const fetchProducts = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
    const data = await response.json();
    setProducts(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append text fields
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('description', formData.description);

    // Image logic
    if (formData.image instanceof File) {
      // User uploaded a new file
      data.append('image', formData.image);
    } else if (currentProduct && currentProduct.image) {
      // User did NOT upload a new file, send back the existing image path
      data.append('image', currentProduct.image);
    }

    const productId = currentProduct ? (currentProduct.id || currentProduct._id) : null;
    const url = currentProduct 
      ? `${import.meta.env.VITE_API_URL}/api/products/${productId}`
      : `${import.meta.env.VITE_API_URL}/api/products`;
    
    const method = currentProduct ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` },
      body: data
    });

    if (response.ok) {
      fetchProducts();
      closeModal();
    }
  };

  const handleDelete = async (targetProduct) => {
    const targetId = typeof targetProduct === 'object' ? (targetProduct.id || targetProduct._id) : targetProduct;
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` }
      });
      if (response.ok) fetchProducts();
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        image: null
      });
      setPreviewImage(product.image 
        ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL}${product.image}`)
        : null
      );
    } else {
      setCurrentProduct(null);
      setFormData({ name: '', category: 'عيد ميلاد', price: '', stock: '', description: '', image: null });
      setPreviewImage(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;
    const matchesLowStock = initialFilter === 'low-stock' ? product.stock <= 5 : true;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">إدارة المنتجات</h1>
        <button 
          onClick={() => openModal()}
          className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-[#2a2a2a] p-4 md:p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="بحث عن منتج..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-[#1a1a1a] border border-white/5 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          {['الكل', 'عيد ميلاد', 'سبوع', 'ورد وهدايا'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden shadow-xl group hover:border-orange-500/30 transition-all">
            <div className="relative aspect-square">
              <img 
                src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL}${product.image}`} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute top-2 left-2 flex gap-2">
                <button 
                  onClick={() => openModal(product)}
                  className="p-2 bg-blue-500/80 backdrop-blur-md text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-red-500/80 backdrop-blur-md text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-orange-500 border border-orange-500/20">
                {product.category}
              </div>
            </div>
            <div className="p-4 text-right">
              <h3 className="font-bold text-white mb-1 truncate">{product.name}</h3>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-400'}`}>
                  المخزون: {product.stock}
                </span>
                <span className="font-black text-orange-500">{product.price} ج.م</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="bg-[#2a2a2a] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#2a2a2a] z-20">
              <h2 className="text-xl font-bold">{currentProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 mb-2">اسم المنتج</label>
                  <input 
                    type="text" name="name" required value={formData.name} onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 focus:border-orange-500 outline-none text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">القسم</label>
                  <select 
                    name="category" value={formData.category} onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 focus:border-orange-500 outline-none text-white"
                  >
                    <option value="عيد ميلاد">عيد ميلاد</option>
                    <option value="سبوع">سبوع</option>
                    <option value="ورد وهدايا">ورد وهدايا</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">السعر</label>
                    <input 
                      type="number" name="price" required value={formData.price} onChange={handleInputChange}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 focus:border-orange-500 outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">المخزون</label>
                    <input 
                      type="number" name="stock" required value={formData.stock} onChange={handleInputChange}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 focus:border-orange-500 outline-none text-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 mb-2">الوصف</label>
                  <textarea 
                    name="description" rows="3" value={formData.description} onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 focus:border-orange-500 outline-none text-white resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 mb-2">صورة المنتج</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl p-8 hover:border-orange-500/50 transition-colors cursor-pointer relative overflow-hidden group">
                    <input 
                      type="file" accept="image/*" onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {previewImage ? (
                      <div className="relative w-full aspect-video">
                        <img src={previewImage} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white" size={32} />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto text-gray-500 mb-2" size={32} />
                        <div className="text-sm text-gray-500 font-bold">اضغط أو اسحب لرفع صورة</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  {currentProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
                <button 
                  type="button" onClick={closeModal}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
