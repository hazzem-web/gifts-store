import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, User } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (token && token !== 'undefined' && token !== 'null') {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminUser', data.username);
        navigate('/admin');
      } else {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 font-arabic" dir="rtl">
      <div className="max-w-md w-full bg-[#2a2a2a] rounded-2xl shadow-2xl p-8 border border-orange-500/20">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم</h1>
          <p className="text-gray-400">سجل الدخول للمتابعة</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full bg-transparent border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 font-bold py-3 rounded-xl transition-all"
          >
            <ArrowLeft size={18} />
            <span>العودة إلى الصفحة الرئيسية</span>
          </button>

          <div>
            <label className="block text-gray-400 mb-2 mr-1">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 text-white p-3 pr-10 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2 mr-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 text-white p-3 pr-10 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98]"
          >
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
