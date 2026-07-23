import React from 'react';
import { ShieldCheck, Truck, CreditCard, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="text-hp-orange" size={40} strokeWidth={1} />,
    title: "100% أصلي",
    description: "نضمن لك جودة وأصالة كل منتج في متجرنا"
  },
  {
    icon: <CheckCircle className="text-hp-orange" size={40} strokeWidth={1} />,
    title: "معاينة عند الاستلام",
    description: "حقك في فحص المنتج قبل إتمام عملية الدفع"
  },
  {
    icon: <CreditCard className="text-hp-orange" size={40} strokeWidth={1} />,
    title: "دفع آمن",
    description: "خيارات دفع متعددة تلبي احتياجاتك"
  }
];

const TrustSection = () => {
  return (
    <section className="py-20 bg-hp-offwhite">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-8 bg-white rounded-2xl border border-hp-orange/5 hover:border-hp-orange/20 transition-all duration-300 shadow-sm">
              <div className="flex justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
              <p className="text-luxury-charcoal/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
