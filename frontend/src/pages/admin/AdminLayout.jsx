import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token || token === 'undefined' || token === 'null') {
      navigate('/admin/login', { replace: true });
    } else {
      setIsCheckingAuth(false);
    }
  }, [navigate]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'نظرة عامة', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'المنتجات', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'الطلبات', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'الإعدادات', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        {(isSidebarOpen || isMobileMenuOpen) && <span className="text-xl font-black text-orange-500">لوحة التحكم</span>}
        <button 
          onClick={() => isMobileMenuOpen ? setIsMobileMenuOpen(false) : setIsSidebarOpen(!isSidebarOpen)} 
          className="text-gray-400 hover:text-white lg:block hidden"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="text-gray-400 hover:text-white lg:hidden"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center px-6 py-4 transition-all ${
              location.pathname === item.path 
                ? 'bg-orange-500/10 text-orange-500 border-l-4 border-orange-500' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className={(isSidebarOpen || isMobileMenuOpen) ? 'ml-4' : 'mx-auto'}>{item.icon}</span>
            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold">{item.name}</span>}
          </Link>
        ))}
      </nav>

      <button 
        onClick={handleLogout}
        className="p-6 flex items-center text-red-500 hover:bg-red-500/10 transition-colors border-t border-white/5 mt-auto"
      >
        <span className={(isSidebarOpen || isMobileMenuOpen) ? 'ml-4' : 'mx-auto'}><LogOut size={20} /></span>
        {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold">تسجيل الخروج</span>}
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col lg:flex-row" dir="rtl">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-[#2a2a2a] border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-50">
        <span className="text-xl font-black text-orange-500">لوحة التحكم</span>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-orange-500">
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className={`hidden lg:flex bg-[#2a2a2a] border-l border-white/5 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex-col h-screen sticky top-0`}>
        {sidebarContent}
      </aside>

      {/* Sidebar (Mobile Overlay) */}
      <div className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute inset-y-0 right-0 w-72 bg-[#2a2a2a] shadow-2xl transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {sidebarContent}
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
