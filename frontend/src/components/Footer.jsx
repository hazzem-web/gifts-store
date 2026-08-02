import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, MapPin, Mail, ShieldCheck, Heart, ShoppingBag, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-hp-charcoal text-white pt-20 pb-10 font-arabic border-t border-hp-orange/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-right">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-6">
              <h3 className="text-2xl font-black text-hp-orange tracking-tighter">HALLOWEEN PARTY</h3>
              <div className="h-10 w-10 bg-hp-orange rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,112,0,0.5)] overflow-hidden">
                <img src="./logo.svg" alt="Halloween Party Logo" className="w-full h-full object-contain p-1" />
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm mb-6">
              متجر هالوين بارتي متخصص في توفير أرقى الهدايا وتجهيزات الحفلات لكل مناسباتكم السعيدة. نسعى دائماً لتقديم التميز والإبداع في كل ما نقدمه.
            </p>
            <div className="flex items-center gap-2 text-xs text-hp-orange font-bold bg-white/5 p-3 rounded-xl border border-white/5 w-fit">
              <ShieldCheck size={18} />
              <span>تسوق آمن وخيارات دفع عند الاستلام</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-hp-orange/20 pb-2 w-fit ml-auto text-hp-orange">روابط سريعة</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-hp-orange transition-colors flex items-center gap-2 justify-end">الرئيسية</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-hp-orange transition-colors flex items-center gap-2 justify-end">الأقسام</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-hp-orange transition-colors flex items-center gap-2 justify-end">جميع المنتجات</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-hp-orange transition-colors flex items-center gap-2 justify-end"><ShoppingBag size={16} />سلة الشراء</Link></li>
              <li><Link to="/favorites" className="text-gray-400 hover:text-hp-orange transition-colors flex items-center gap-2 justify-end"><Heart size={16} />المفضلة</Link></li>
              <li><Link to="/admin" className="text-gray-400 hover:text-hp-orange transition-colors flex items-center gap-2 justify-end"><Lock size={16} />لوحة التحكم (Admin)</Link></li>
            </ul>
          </div>

          {/* Column 3: Categories Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-hp-orange/20 pb-2 w-fit ml-auto text-hp-orange">أقسام المتجر</h3>
            <ul className="space-y-3">
              <li><Link to="/products?category=عيد ميلاد" className="text-gray-400 hover:text-hp-orange transition-colors">تجهيزات عيد ميلاد</Link></li>
              <li><Link to="/products?category=سبوع" className="text-gray-400 hover:text-hp-orange transition-colors">هدايا سبوع ومواليد</Link></li>
              <li><Link to="/products?category=ورد وهدايا" className="text-gray-400 hover:text-hp-orange transition-colors">باقات ورد وهدايا فاخرة</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="flex flex-col items-end text-right">
            <h3 className="text-lg font-bold mb-6 border-b border-hp-orange/20 pb-2 w-fit text-hp-orange">تواصل معنا</h3>
            <ul className="space-y-4 w-full mb-8 text-sm">
              <li className="flex items-center justify-end space-x-3 space-x-reverse text-gray-400">
                <span className="font-bold">+20 123 456 7890</span>
                <Phone size={18} className="text-hp-orange" />
              </li>
              <li className="flex items-center justify-end space-x-3 space-x-reverse text-gray-400">
                <span className="font-bold">info@halloweenparty.com</span>
                <Mail size={18} className="text-hp-orange" />
              </li>
              <li className="flex items-center justify-end space-x-3 space-x-reverse text-gray-400">
                <span className="font-bold">القاهرة، مصر</span>
                <MapPin size={18} className="text-hp-orange" />
              </li>
            </ul>
            <div className="flex items-center justify-end gap-6 w-full border-t border-white/5 pt-6">
              <a href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer" title="واتساب" className="text-hp-orange hover:scale-125 transition-transform duration-300">
                <MessageCircle size={24} strokeWidth={1.8} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="إنستجرام" className="text-hp-orange hover:scale-125 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="فيسبوك" className="text-hp-orange hover:scale-125 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm gap-4">
          <p>© {new Date().getFullYear()} HALLOWEEN PARTY. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <Link to="/products" className="hover:text-hp-orange transition-colors">تسوق الآن</Link>
            <Link to="/admin/login" className="hover:text-hp-orange transition-colors">تسجيل دخول الأدمن</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

