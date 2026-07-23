import React, { useEffect, useState } from 'react';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    stockOuts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('adminToken');
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/products`)
        ]);

        if (statsRes.ok && ordersRes.ok && productsRes.ok) {
          const statsData = await statsRes.json();
          const ordersData = await ordersRes.json();
          const productsData = await productsRes.json();
          
          setStats(statsData);
          setRecentOrders(ordersData.slice(0, 5));
          setLowStockProducts(productsData.filter(p => p.stock <= 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { name: 'إجمالي المنتجات', value: stats.totalProducts, icon: <Package size={32} />, color: 'bg-blue-500', path: '/admin/products' },
    { name: 'إجمالي المبيعات', value: `${stats.totalSales} ج.م`, icon: <TrendingUp size={32} />, color: 'bg-green-500', path: '/admin/orders' },
    { name: 'نواقص المخزون', value: stats.stockOuts, icon: <AlertTriangle size={32} />, color: 'bg-red-500', path: '/admin/products?filter=low-stock' },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">نظرة عامة</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {cards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => navigate(card.path)}
            className="bg-[#2a2a2a] p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl cursor-pointer hover:scale-[1.02] transition-all hover:border-orange-500/30 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 md:p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                {React.cloneElement(card.icon, { size: window.innerWidth < 768 ? 24 : 32 })}
              </div>
              <span className="text-2xl md:text-4xl font-bold">{card.value}</span>
            </div>
            <p className="text-gray-400 font-medium text-sm md:text-base">{card.name}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions or Recent Activity */}
      <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#2a2a2a] p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
          <h2 className="text-lg md:text-xl font-bold mb-6 border-b border-white/5 pb-4 text-right">أحدث الطلبات</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[500px]">
              <thead>
                <tr className="text-gray-400 text-sm">
                  <th className="pb-4">العميل</th>
                  <th className="pb-4">المبلغ</th>
                  <th className="pb-4 text-left">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map(order => (
                  <tr key={order.id} className="text-sm">
                    <td className="py-4">
                      <div className="font-bold">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="py-4 font-bold text-orange-500">{order.total_amount} ج.م</td>
                    <td className="py-4 text-left">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#2a2a2a] p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
          <h2 className="text-lg md:text-xl font-bold mb-6 border-b border-white/5 pb-4 text-right">منتجات منخفضة المخزون</h2>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-right">
                    <div className="font-bold text-sm">{product.name}</div>
                    <div className="text-xs text-red-500">متبقي {product.stock} فقط</div>
                  </div>
                  <button 
                    onClick={() => navigate(`/admin/products?edit=${product.id}`)}
                    className="text-xs bg-orange-500/20 text-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all font-bold"
                  >
                    تعديل
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">لا توجد منتجات منخفضة المخزون</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
