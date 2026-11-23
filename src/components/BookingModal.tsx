import { Calendar, CheckCircle2, MessageCircle, Phone, Send, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { APPARATUS_PROCEDURES, CLINIC_CONTACT, CORE_SERVICES } from '../data/clinicData';

interface BookingModalProps {
  open: boolean;
  initialServiceId?: string;
  onClose: () => void;
}

const TIME_SLOTS = ['10:00', '11:30', '14:00', '16:00', '18:00'] as const;

export function BookingModal({ open, initialServiceId, onClose }: BookingModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [selectedService, setSelectedService] = useState(
    initialServiceId || CORE_SERVICES[0].title,
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState<string>(TIME_SLOTS[1]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const allProcedures = [
    ...CORE_SERVICES.map((s) => ({ id: s.id, title: s.title })),
    ...APPARATUS_PROCEDURES.map((a) => ({ id: a.id, title: a.title })),
    { id: 'consultation', title: 'Birlamchi dermatologik konsultatsiya' },
  ];

  useEffect(() => {
    if (!open) return;
    if (initialServiceId) {
      const found = allProcedures.find(
        (p) => p.id === initialServiceId || p.title === initialServiceId,
      );
      if (found) setSelectedService(found.title);
    }
    setSubmitted(false);
    setErrorMessage('');

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, initialServiceId, onClose]);

  if (!open) return null;

  const minDate = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedName = fullName.trim();
    const digits = phone.replace(/\D/g, '');

    if (cleanedName.length < 2) {
      setErrorMessage('Iltimos, ismingizni to‘liq kiriting.');
      return;
    }
    if (digits.length < 9) {
      setErrorMessage('Iltimos, to‘g‘ri telefon raqamingizni kiriting (masalan: +998 90 123 45 67).');
      return;
    }

    setErrorMessage('');
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#070306]/88 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] bg-[#160A13] border border-[#F4A5C0]/22 rounded-xl overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F4A5C0]/12">
          <div>
            <p className="text-[12px] text-[#E5C185] font-medium">
              Dr. Dilnoza Cosmetologist · Individual qabul
            </p>
            <h3
              id="booking-modal-title"
              className="font-display text-[28px] font-semibold text-[#F9EEF3] leading-tight"
            >
              Qabulga yozilish
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Oynani yopish"
            className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-[#F4A5C0]/18 text-[#F9EEF3] hover:bg-[#241120] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-[#E5C185] shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="text-[20px] font-semibold text-[#F9EEF3]">
                  Arizangiz muvaffaqiyatli qabul qilindi
                </h4>
                <p className="text-[14px] text-[#B89EA9] leading-relaxed">
                  Hurmatli {fullName.trim()}, administratorimiz 15 daqiqa ichida{' '}
                  <span className="text-[#F9EEF3] font-mono-num">{phone}</span> raqamingizga
                  bog‘lanib, vaqtni tasdiqlaydi.
                </p>
              </div>
            </div>

            <div className="bg-[#1E0E1A] border border-[#F4A5C0]/14 rounded-lg p-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-4 border-b border-[#F4A5C0]/10 pb-2">
                <span className="text-[#B89EA9]">Tanlangan muolaja</span>
                <span className="text-[#F9EEF3] font-medium text-right">{selectedService}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#F4A5C0]/10 pb-2">
                <span className="text-[#B89EA9]">Sana va vaqt</span>
                <span className="text-[#F9EEF3] font-mono-num">
                  {preferredDate || 'Eng yaqin bo‘sh kun'} · {preferredTime}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#B89EA9]">Manzil</span>
                <span className="text-[#F9EEF3] text-right">{CLINIC_CONTACT.address}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <a
                  href={CLINIC_CONTACT.telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-[#F9EEF3] border border-[#F4A5C0]/20 hover:border-[#E86B94]/60 rounded-md transition-colors"
                >
                  <Send className="w-4 h-4 text-[#F4A5C0]" />
                  <span>Telegram</span>
                </a>
                <a
                  href={CLINIC_CONTACT.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-[#F9EEF3] border border-[#F4A5C0]/20 hover:border-[#E86B94]/60 rounded-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#E5C185]" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-[13px] font-semibold bg-[#E86B94] hover:bg-[#F182A7] text-[#14070F] rounded-md transition-colors cursor-pointer"
              >
                Tayyor
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div
                role="alert"
                className="px-4 py-3 text-[13px] text-[#FFD4E0] bg-[#3E1326] border border-[#E86B94]/45 rounded-md"
              >
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="booking-name" className="block text-[12px] font-medium text-[#B89EA9]">
                  Ismingiz
                </label>
                <input
                  id="booking-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masalan: Malika"
                  className="w-full px-3.5 py-2.5 text-[14px] text-[#F9EEF3] bg-[#0F060D] border border-[#F4A5C0]/20 focus:border-[#E86B94] focus:outline-none rounded-md placeholder:text-[#7E6370]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="booking-phone" className="block text-[12px] font-medium text-[#B89EA9]">
                  Telefon raqamingiz
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2.5 text-[14px] font-mono-num text-[#F9EEF3] bg-[#0F060D] border border-[#F4A5C0]/20 focus:border-[#E86B94] focus:outline-none rounded-md placeholder:text-[#7E6370]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="booking-service" className="block text-[12px] font-medium text-[#B89EA9]">
                Qaysi muolaja qiziqtirmoqda?
              </label>
              <select
                id="booking-service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[14px] text-[#F9EEF3] bg-[#0F060D] border border-[#F4A5C0]/20 focus:border-[#E86B94] focus:outline-none rounded-md"
              >
                {allProcedures.map((proc) => (
                  <option key={proc.id} value={proc.title} className="bg-[#160A13] text-[#F9EEF3]">
                    {proc.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="booking-date" className="block text-[12px] font-medium text-[#B89EA9]">
                  Qulay sana
                </label>
                <input
                  id="booking-date"
                  type="date"
                  min={minDate}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[14px] font-mono-num text-[#F9EEF3] bg-[#0F060D] border border-[#F4A5C0]/20 focus:border-[#E86B94] focus:outline-none rounded-md"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-[12px] font-medium text-[#B89EA9]">Qulay vaqt</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPreferredTime(slot)}
                      className={`py-2.5 text-[12px] font-mono-num rounded-md border transition-colors cursor-pointer ${
                        preferredTime === slot
                          ? 'bg-[#E86B94] text-[#14070F] border-[#E86B94] font-semibold'
                          : 'bg-[#0F060D] text-[#B89EA9] border-[#F4A5C0]/16 hover:text-[#F9EEF3]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="booking-notes" className="block text-[12px] font-medium text-[#B89EA9]">
                Qo‘shimcha izoh (ixtiyoriy)
              </label>
              <textarea
                id="booking-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Teri turi yoki savollaringiz haqida qisqacha yozishingiz mumkin"
                className="w-full px-3.5 py-2 text-[14px] text-[#F9EEF3] bg-[#0F060D] border border-[#F4A5C0]/20 focus:border-[#E86B94] focus:outline-none rounded-md placeholder:text-[#7E6370] resize-none"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <a
                href={CLINIC_CONTACT.phoneHref}
                className="inline-flex items-center justify-center gap-2 text-[13px] font-mono-num text-[#E5C185] hover:text-[#F9EEF3] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{CLINIC_CONTACT.phoneDisplay}</span>
              </a>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-semibold text-[#14070F] bg-[#E86B94] hover:bg-[#F182A7] active:scale-[0.98] rounded-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span>Qabulni tasdiqlash</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
