import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck, User, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EGYPT_GOVERNORATES = [
  'القاهرة',
  'الإسكندرية',
  'الجيزة',
  'الدقهلية',
  'الشرقية',
  'الغربية',
  'القليوبية',
  'المنوفية',
  'أسيوط',
  'بني سويف',
  'الفيوم',
  'الأقصر',
  'المنيا',
  'أسوان',
  'البحيرة',
  'الإسماعيلية',
  'دمياط',
  'بورسعيد',
  'كفر الشيخ',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'الوادي الجديد'
];

const getShippingCost = (shippingMethod, governorate) => {
  if (shippingMethod === 'pickup') return 0;

  if (!governorate) return 120;

  const normalized = governorate.trim();
  if (normalized === 'القاهرة' || normalized === 'الإسكندرية') return 65;
  return 120;
};

const Checkout = () => {
  const { cartTotal, cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState('pickup');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    governorate: 'القاهرة',
    city: '',
    street: '',
    building: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const shippingCost = getShippingCost(shippingMethod, formData.governorate);
  const finalTotal = cartTotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (shippingMethod === 'delivery' && (!formData.governorate || !formData.city || !formData.street)) {
      alert('يرجى إكمال بيانات العنوان للتوصيل');
      return;
    }

    setLoading(true);

    const customerAddress = shippingMethod === 'delivery'
      ? [formData.governorate, formData.city, formData.street, formData.building, formData.notes]
          .filter(Boolean)
          .join(' - ')
      : 'استلام من المحل';

    const orderData = {
      customer_name: `${formData.firstName} ${formData.lastName}`,
      customer_email: formData.email,
      customer_phone: formData.phone,
      customer_address: customerAddress,
      shipping_method: shippingMethod === 'delivery' ? 'التوصيل' : 'استلام من المحل',
      shipping_cost: shippingCost,
      total_amount: finalTotal,
      items: JSON.stringify(cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })))
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        clearCart();
        navigate(`/order-success?id=${responseData.id}`);
      } else {
        alert(responseData.error || 'حدث خطأ أثناء إتمام الطلب');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="pt-40 pb-20 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">لا توجد منتجات لإتمام الطلب</h2>
        <a href="/products" className="btn-orange px-8 py-3 inline-block font-bold rounded-lg shadow-lg shadow-hp-orange/20">تصفح المنتجات</a>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-right">إتمام الطلب</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Order Summary (First on mobile) */}
          <div className="lg:sticky lg:top-32 h-fit order-1 lg:order-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-100 text-right">ملخص الطلب</h2>
              <div className="max-h-60 overflow-y-auto mb-6 space-y-4 px-2 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-right gap-4">
                    <div className="flex items-center space-x-3 space-x-reverse min-w-0">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                        <img 
                          src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`} 
                          className="w-full h-full object-cover" 
                          alt={item.name} 
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-hp-charcoal truncate">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.quantity} x {item.price} ج.م</div>
                      </div>
                    </div>
                    <div className="font-bold text-hp-charcoal whitespace-nowrap">{item.price * item.quantity} ج.م</div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 pt-6 border-t border-gray-100 text-right">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">المجموع الفرعي</span>
                  <span className="font-bold">{cartTotal} ج.م</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">الشحن</span>
                  <span className="font-bold">{shippingCost} ج.م</span>
                </div>
                <div className="pt-4 border-t-2 border-hp-orange/20 flex justify-between items-center text-2xl font-black">
                  <span>الإجمالي</span>
                  <span className="text-hp-orange">{finalTotal} ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6 md:space-y-8 text-right order-2 lg:order-1">
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 space-x-reverse mb-6 text-hp-orange">
                <User size={24} />
                <h2 className="text-xl font-bold">المعلومات الشخصية</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-600">الاسم الأول</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full p-3.5 bg-hp-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-hp-orange transition-all" placeholder="محمد" />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-600">اسم العائلة</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full p-3.5 bg-hp-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-hp-orange transition-all" placeholder="أحمد" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-gray-600">البريد الإلكتروني</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-3.5 bg-hp-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-hp-orange transition-all" placeholder="example@mail.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-gray-600">رقم الهاتف</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full p-3.5 bg-hp-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-hp-orange transition-all" placeholder="01234567890" />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 space-x-reverse mb-6 text-hp-orange">
                <Truck size={24} />
                <h2 className="text-xl font-bold">طريقة الاستلام</h2>
              </div>
              <div className="space-y-4">
                <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${shippingMethod === 'pickup' ? 'border-hp-orange bg-hp-orange/5' : 'border-gray-100 bg-white'}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="pickup"
                    checked={shippingMethod === 'pickup'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="ml-4 w-5 h-5 accent-hp-orange"
                  />
                  <div className="flex-1 text-right">
                    <span className="font-black block text-lg text-hp-charcoal">استلام من المحل</span>
                    <span className="text-sm text-gray-500">بدون مصاريف شحن (0 ج.م)</span>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${shippingMethod === 'delivery' ? 'border-hp-orange bg-hp-orange/5' : 'border-gray-100 bg-white'}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="delivery"
                    checked={shippingMethod === 'delivery'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="ml-4 w-5 h-5 accent-hp-orange"
                  />
                  <div className="flex-1 text-right">
                    <span className="font-black block text-lg text-hp-charcoal">التوصيل إلى المنزل</span>
                    <span className="text-sm text-gray-500">القاهرة والإسكندرية 65 ج.م، وباقي المحافظات 120 ج.م</span>
                  </div>
                </label>

                {shippingMethod === 'delivery' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-2">
                    <div>
                      <label className="block text-sm mb-2 text-gray-600">المحافظة</label>
                      <select
                        name="governorate"
                        required
                        value={formData.governorate}
                        onChange={handleInputChange}
                        className="w-full p-3.5 bg-hp-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-hp-orange transition-all"
                      >
                        {EGYPT_GOVERNORATES.map((governorate) => (
                          <option key={governorate} value={governorate}>{governorate}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-600">المدينة / المنطقة</label>
                      <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full p-3.5 bg-hp-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-hp-orange transition-all" placeholder="المدينة أو المنطقة" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm mb-2 text-gray-600">الشارع / رقم المنزل</label>
                      <input type="text" name="street" required value={formData.street} onChange={handleInputChange} className="w-full p-3.5 bg-hp-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-hp-orange transition-all" placeholder="الشارع، رقم المنزل، أو أي تفاصيل إضافية" />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-600">اسم المبنى / العمارة</label>
                      <input type="text" name="building" value={formData.building} onChange={handleInputChange} className="w-full p-3.5 bg-hp-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-hp-orange transition-all" placeholder="اسم المبنى أو العمارة" />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-600">ملاحظات إضافية</label>
                      <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} className="w-full p-3.5 bg-hp-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-hp-orange transition-all" placeholder="أي ملاحظات للوصول" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 space-x-reverse mb-6 text-hp-orange">
                <CreditCard size={24} />
                <h2 className="text-xl font-bold">طريقة الدفع</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center p-4 border-2 border-hp-orange rounded-2xl cursor-pointer bg-hp-orange/5">
                  <input type="radio" name="payment" defaultChecked className="ml-4 w-5 h-5 accent-hp-orange" />
                  <span className="font-black text-hp-charcoal">الدفع عند الاستلام (افتراضي)</span>
                </label>
                <label className="flex items-center p-4 border border-gray-100 rounded-2xl cursor-not-allowed opacity-40">
                  <input type="radio" name="payment" disabled className="ml-4 w-5 h-5 accent-hp-orange" />
                  <span className="font-bold">البطاقة الائتمانية (قريباً)</span>
                </label>
              </div>
            </section>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full bg-hp-orange hover:bg-hp-orange-dark text-white py-4 md:py-5 text-xl font-black rounded-2xl flex items-center justify-center space-x-3 space-x-reverse shadow-lg shadow-hp-orange/20 transition-all active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CheckCircle2 size={24} />
              <span>{loading ? 'جاري تنفيذ الطلب...' : 'تأكيد الطلب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
