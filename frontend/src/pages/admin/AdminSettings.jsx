import React, { useState } from 'react';
import { Save, User, Lock, Key } from 'lucide-react';
import { apiUrl } from '../../lib/api';

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    username: sessionStorage.getItem('adminUser') || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const username = formData.username.trim();
    const oldPassword = formData.oldPassword.trim();
    const newPassword = formData.newPassword;
    const confirmPassword = formData.confirmPassword;

    if (!username) {
      setMessage({ type: 'error', text: 'اسم المستخدم لا يمكن أن يكون فارغًا' });
      return;
    }

    if (!oldPassword) {
      setMessage({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية لتأكيد التغييرات' });
      return;
    }

    const wantsPasswordChange =
      newPassword.trim() !== '' || confirmPassword.trim() !== '';

    if (wantsPasswordChange) {
      if (!newPassword.trim() || !confirmPassword.trim()) {
        setMessage({ type: 'error', text: 'يرجى إدخال كلمة المرور الجديدة وتأكيدها' });
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'كلمات المرور الجديدة غير متطابقة' });
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          username,
          oldPassword,
          newPassword: wantsPasswordChange ? newPassword : ''
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' });
        sessionStorage.setItem('adminUser', username);
        setFormData({
          username,
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'فشل تحديث البيانات'
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'فشل الاتصال بالخادم' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-white">إعدادات الحساب والأمان</h1>

      {message.text && (
        <div
          className={`p-4 rounded-xl mb-6 text-center border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/50 text-green-500'
              : 'bg-red-500/10 border-red-500/50 text-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-[#2a2a2a] p-8 rounded-2xl border border-white/5 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
          <div>
            <label className="block text-gray-400 mb-2">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full bg-[#1a1a1a] border border-gray-700 p-3 pr-10 rounded-xl focus:border-orange-500 outline-none text-white"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <label className="block text-orange-500 mb-2 font-bold">
              كلمة المرور الحالية (للأمان)
            </label>
            <div className="relative">
              <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
                required
                className="w-full bg-[#1a1a1a] border border-orange-500/30 p-3 pr-10 rounded-xl focus:border-orange-500 outline-none text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">كلمة المرور الجديدة</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 p-3 pr-10 rounded-xl focus:border-orange-500 outline-none text-white"
                placeholder="اتركها فارغة إذا لم ترد التغيير"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">تأكيد كلمة المرور الجديدة</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 p-3 pr-10 rounded-xl focus:border-orange-500 outline-none text-white"
                placeholder="أعد كتابة كلمة المرور الجديدة"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save size={20} />
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;