import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Categories from './pages/Categories';
import Checkout from './pages/Checkout';
import Favorites from './pages/Favorites';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminSettings from './pages/admin/AdminSettings';

const OrderSuccess = () => {
  const location = useLocation();
  const id = new URLSearchParams(location.search).get('id');

  return (
    <div className="pt-40 pb-20 container mx-auto px-4 text-center font-arabic">
      <div className="bg-green-100 text-green-700 p-8 rounded-2xl max-w-lg mx-auto border border-green-200 shadow-lg">
        <h2 className="text-4xl font-bold mb-4">تم الطلب بنجاح! 🎉</h2>
        <p className="text-xl mb-6">شكراً لثقتكم بنا. طلبكم قيد المراجعة حالياً.</p>
        <Link to="/" className="btn-orange px-10 py-3 inline-block font-bold">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) return children;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </MainLayout>
      </Router>
    </CartProvider>
  );
}

export default App;