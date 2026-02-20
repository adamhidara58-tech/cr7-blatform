import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  icon: string;
  isOpen: boolean;
  onClick: () => void;
}

// استخدام memo لمنع الـ re-render غير الضروري لكل عنصر عند فتح عنصر آخر
const FAQItem = memo(({ question, answer, icon, isOpen, onClick }: FAQItemProps) => {
  return (
    <div 
      className={`glass-card rounded-2xl border transition-colors duration-300 overflow-hidden mb-4 ${
        isOpen ? 'border-gold/40 bg-white/5' : 'border-white/5 hover:border-white/10'
      }`}
      style={{ transform: 'translateZ(0)' }} // GPU Acceleration
    >
      <button
        onClick={onClick}
        className="w-full px-5 py-5 flex items-center justify-between gap-4 text-right outline-none"
      >
        <div className="flex items-center gap-4 flex-1">
          <span className="text-2xl" style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>{icon}</span>
          <span className={`font-bold text-sm md:text-base transition-colors duration-200 ${isOpen ? 'text-gold' : 'text-white/90'}`}>
            {question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className={`${isOpen ? 'text-gold' : 'text-white/30'}`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              height: { type: "spring", duration: 0.3, bounce: 0 },
              opacity: { duration: 0.2 }
            }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-6 pt-0 will-change-transform">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
              <div className="text-white/70 text-sm leading-relaxed font-medium whitespace-pre-line">
                {answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FAQItem.displayName = 'FAQItem';

export const FAQSection = memo(() => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // استخدام useCallback لضمان ثبات المرجع ومنع الـ re-render للـ FAQItem
  const handleToggle = useCallback((index: number) => {
    setOpenIndex(prev => prev === index ? null : index);
  }, []);

  const faqs = [
    {
      question: "ما هي هذه المنصة؟",
      icon: "💎",
      answer: "هذه المنصة هي تجربة رقمية متطورة مستوحاة من مسيرة النجاح والانضباط التي جسّدها كريستيانو رونالدو. تم تصميمها لتقديم نظام عضويات VIP ذكي، حيث يمثّل كل مستوى مرحلة من مراحل التقدم والنمو. تعتمد المنصة على استراتيجيات الأصول الرقمية وتقنيات البلوكشين الحديثة بهدف تحقيق عوائد يومية بطريقة منظمة، شفافة، وآمنة."
    },
    {
      question: "كيف تعمل المنصة؟",
      icon: "⚡",
      answer: "عند تفعيل أي عضوية VIP، يتم دمج مساهمتك ضمن محفظة أصول رقمية مُدارة باحتراف. تقوم المنصة بتشغيل استراتيجيات رقمية متقدمة لتوليد العوائد عبر تقنيات البلوكشين، ويتم احتساب الأرباح بشكل يومي وإضافتها مباشرة إلى حسابك داخل لوحة التحكم، مع عرض تفصيلي لكل العمليات بشفافية تامة."
    },
    {
      question: "كيف تتم عمليات الإيداع والسحب؟",
      icon: "🔒",
      answer: `تعتمد المنصة على العملات الرقمية لضمان معاملات سريعة، آمنة، وعابرة للحدود دون تعقيدات.

• الإيداع: يتم بشكل فوري تقريبًا، ويظهر الرصيد مباشرة في حسابك بعد التأكيد.
• السحب: متاح مرة واحدة يوميًا خلال الفترة (12:00 – 13:30 بتوقيت UTC) لضمان إدارة مالية منظمة وآمنة لجميع المستخدمين عالميًا.

في حال عدم السحب خلال هذه الفترة، يمكن سحب الرصيد كاملًا في نفس الفترة من اليوم التالي بسهولة.
هذا النظام يضمن تنظيم العمليات، حماية السيولة، وتوفير تجربة موثوقة وواضحة لجميع الأعضاء.`
    },
    {
      question: "هل يمكنني متابعة أرباحي وعمليّاتي؟",
      icon: "📊",
      answer: `نعم، توفر المنصة لوحة تحكم متكاملة تتيح لك متابعة كل شيء لحظة بلحظة، بما في ذلك:
• الرصيد الإجمالي
• الأرباح اليومية
• سجل الإيداع والسحب
• حالة طلبات السحب
• مستوى VIP الحالي وتطوره

كل البيانات تُعرض بشفافية وسهولة لضمان تجربة استخدام احترافية.`
    },
    {
      question: "ما هي مستويات VIP والأرباح اليومية؟",
      icon: "🏆",
      answer: `توفر المنصة عدة مستويات VIP لتناسب مختلف المستخدمين، وكل مستوى يمنح عائدًا يوميًا مختلفًا:
• VIP 1 — تفعيل: 30$ → ربح يومي: 2.5$
• VIP 2 — تفعيل: 58$ → ربح يومي: 9.5$
• VIP 3 — تفعيل: 120$ → ربح يومي: 18.75$
• VIP 4 — تفعيل: 358$ → ربح يومي: 93.75$
• VIP 5 — تفعيل: 535$ → ربح يومي: 168.75$

🎁 جميع العضويات تتضمن خصم ترحيبي بقيمة 20$ عند التفعيل`
    }
  ];

  return (
    <section className="px-4 lg:px-8 mb-20 relative">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full h-40 bg-gold/5 blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-4">
          <HelpCircle className="w-4 h-4 text-gold" />
          <span className="text-[10px] font-black text-gold uppercase tracking-widest">الأسئلة الشائعة</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-black text-white mb-3">لديك استفسار؟</h2>
        <p className="text-white/40 text-sm lg:text-base max-w-[280px] lg:max-w-md mx-auto leading-relaxed">
          كل ما تحتاج معرفته عن المنصة وكيفية تحقيق أقصى استفادة منها
        </p>
      </motion.div>

      <div className="max-w-2xl lg:max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            icon={faq.icon}
            isOpen={openIndex === index}
            onClick={() => handleToggle(index)}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-white/20 text-[11px] font-medium">
          © 2026 CR7 ELITE PLATFORM • نظام آمن وموثوق
        </p>
      </div>
    </section>
  );
});

FAQSection.displayName = 'FAQSection';
