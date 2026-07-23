import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, MapPin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-hp-charcoal text-white pt-20 pb-10 font-arabic">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-right">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-6">
              <h3 className="text-2xl font-black text-hp-orange tracking-tighter">HALLOWEEN PARTY</h3>
              <div className="h-12 w-12 bg-hp-orange rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,112,0,0.5)] overflow-hidden">
                <img src="./logo.svg" alt="Halloween Party Logo" className="w-full h-full object-contain p-1" />
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              متجر هالوين بارتي متخصص في توفير أرقى الهدايا وتجهيزات الحفلات لكل مناسباتكم السعيدة. نسعى دائماً لتقديم التميز والإبداع في كل ما نقدمه.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-8 border-b border-hp-orange/20 pb-2 w-fit ml-auto">روابط سريعة</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-hp-orange transition-colors">الرئيسية</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-hp-orange transition-colors">الأقسام</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-hp-orange transition-colors">المنتجات</Link></li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="text-lg font-bold mb-8 border-b border-hp-orange/20 pb-2 w-fit ml-auto">السياسات</h3>
            <ul className="space-y-4">
              <li><Link to="/policy/return" className="text-gray-400 hover:text-hp-orange transition-colors">سياسة الاسترجاع</Link></li>
              <li><Link to="/policy/privacy" className="text-gray-400 hover:text-hp-orange transition-colors">سياسة الخصوصية</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold mb-8 border-b border-hp-orange/20 pb-2 w-fit text-center">معلومات التواصل</h3>
            <ul className="space-y-6 w-full mb-10">
              <li className="flex items-center justify-center space-x-3 space-x-reverse text-gray-400">
                <span className="font-bold text-lg">+20 123 456 7890</span>
                <Phone size={22} className="text-hp-orange" />
              </li>
              <li className="flex items-center justify-center space-x-3 space-x-reverse text-gray-400">
                <span className="font-bold text-lg">info@halloweenparty.com</span>
                <Mail size={22} className="text-hp-orange" />
              </li>
              <li className="flex items-center justify-center space-x-3 space-x-reverse text-gray-400">
                <span className="font-bold text-lg">القاهرة، مصر</span>
                <MapPin size={22} className="text-hp-orange" />
              </li>
            </ul>
            <div className="flex items-center justify-center gap-8 w-full border-t border-white/5 pt-8">
              <a href="#" className="text-hp-orange hover:scale-110 transition-transform duration-300">
                <MessageCircle size={28} strokeWidth={1.5} />
              </a>
              <a href="#" className="text-hp-orange hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="text-hp-orange hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} HALLOWEEN PARTY. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
