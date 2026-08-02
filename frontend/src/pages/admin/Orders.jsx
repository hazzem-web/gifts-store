import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Search, Trash2, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('الكل'); // 'الكل', 'قيد الانتظار', 'تأكيد التسليم'
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ status })
    });
    if (response.ok) fetchOrders();
  };

  const deleteOrder = async (id) => {
    if (window.confirm('هل أنت متأكد من مسح هذا الطلب نهائياً؟')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
           fetchOrders();
         } else {
           const contentType = response.headers.get("content-type");
           let errorMessage = 'خطأ غير معروف';
           
           if (contentType && contentType.indexOf("application/json") !== -1) {
             const errorData = await response.json();
             errorMessage = errorData.error || errorMessage;
           } else {
             // Handle non-JSON errors (like HTML error pages)
             const textError = await response.text();
             console.error('Server returned non-JSON error:', textError);
           }
           
           alert(`فشل الحذف: ${errorMessage}`);
         }
      } catch (err) {
        console.error('Delete error:', err);
        alert('حدث خطأ في الاتصال بالخادم أثناء محاولة الحذف');
      }
    }
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone.includes(searchQuery);
      
      const matchesTab = activeTab === 'الكل' || order.status === activeTab;
      
      return matchesSearch && matchesTab;
    });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'قيد الانتظار': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'تأكيد التسليم': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'إلغاء': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const parseOrderItems = (items) => {
    try {
      return JSON.parse(items);
    } catch (e) {
      return [];
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-right">إدارة الطلبات</h1>

      {/* Search and Tabs */}
      <div className="flex flex-col gap-6 mb-8 bg-[#2a2a2a] p-4 md:p-6 rounded-2xl border border-white/5">
        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="بحث عن عميل أو رقم هاتف..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-[#1a1a1a] border border-white/5 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['الكل', 'قيد الانتظار', 'تأكيد التسليم', 'إلغاء'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders View */}
      <div className="hidden md:block bg-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-sm">
              <th className="p-6">العميل</th>
              <th className="p-6">المنتجات</th>
              <th className="p-6">المبلغ</th>
              <th className="p-6">الحالة</th>
              <th className="p-6 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map(order => {
              const items = parseOrderItems(order.items);
              return (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-white">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors text-sm font-bold"
                      >
                        <span>عرض المنتجات ({items.length})</span>
                        {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-orange-500">{order.total_amount} ج.م</div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('ar-EG')}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3 justify-start">
                        <button 
                          onClick={() => updateStatus(order.id, 'تأكيد التسليم')}
                          className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="تم التسليم"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => updateStatus(order.id, 'إلغاء')}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="إلغاء الطلب"
                        >
                          <XCircle size={20} />
                        </button>
                        <button 
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 text-gray-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          title="حذف نهائي"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr>
                      <td colSpan={5} className="p-6 bg-black/30">
                        <div className="space-y-4">
                          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-right">
                            <div className="text-sm text-gray-400">طريقة الاستلام</div>
                            <div className="font-bold text-white">{order.shipping_method || 'استلام من المحل'}</div>
                            <div className="text-sm text-gray-400 mt-2">العنوان</div>
                            <div className="font-bold text-white">{order.customer_address || 'استلام من المحل'}</div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((item, idx) => (
                              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="font-bold text-white">{item.name}</div>
                                <div className="text-sm text-gray-400 mt-1">
                                  الكمية: {item.quantity} × {item.price} ج.م
                                </div>
                                <div className="text-orange-500 font-bold mt-2">
                                  الإجمالي: {item.quantity * item.price} ج.م
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Orders List */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map(order => {
          const items = parseOrderItems(order.items);
          return (
            <div key={order.id} className="bg-[#2a2a2a] p-5 rounded-2xl border border-white/5 shadow-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="text-right">
                  <div className="font-bold text-white text-lg">{order.customer_name}</div>
                  <div className="text-sm text-gray-500">{order.customer_phone}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-y border-white/5">
                <div className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('ar-EG')}
                </div>
                <div className="font-black text-orange-500">{order.total_amount} ج.م</div>
              </div>

              <button 
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full flex items-center justify-center gap-2 text-orange-500 hover:text-orange-400 transition-colors text-sm font-bold py-2"
              >
                <span>عرض المنتجات ({items.length})</span>
                {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedOrder === order.id && (
                <div className="space-y-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-right">
                    <div className="text-[10px] text-gray-400">طريقة الاستلام</div>
                    <div className="font-bold text-white text-sm">{order.shipping_method || 'استلام من المحل'}</div>
                    <div className="text-[10px] text-gray-400 mt-2">العنوان</div>
                    <div className="font-bold text-white text-sm">{order.customer_address || 'استلام من المحل'}</div>
                  </div>
                  {items.map((item, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        الكمية: {item.quantity} × {item.price} ج.م
                      </div>
                      <div className="text-orange-500 font-bold mt-1 text-sm">
                        الإجمالي: {item.quantity * item.price} ج.م
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-around pt-2">
                <button 
                  onClick={() => updateStatus(order.id, 'تأكيد التسليم')}
                  className="flex flex-col items-center gap-1 text-green-500"
                >
                  <CheckCircle size={24} />
                  <span className="text-[10px]">تسليم</span>
                </button>
                <button 
                  onClick={() => updateStatus(order.id, 'إلغاء')}
                  className="flex flex-col items-center gap-1 text-red-500"
                >
                  <XCircle size={24} />
                  <span className="text-[10px]">إلغاء</span>
                </button>
                <button 
                  onClick={() => deleteOrder(order.id)}
                  className="flex flex-col items-center gap-1 text-gray-500"
                >
                  <Trash2 size={24} />
                  <span className="text-[10px]">حذف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-20 bg-[#2a2a2a] rounded-2xl border border-white/5 mt-8">
          <div className="text-gray-500 mb-2 font-bold">لا توجد طلبات تطابق بحثك</div>
          <button onClick={() => {setSearchQuery(''); setActiveTab('الكل');}} className="text-orange-500 hover:underline">إعادة ضبط البحث</button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
