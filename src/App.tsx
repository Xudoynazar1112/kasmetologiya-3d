import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Send,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BookingModal } from './components/BookingModal';
import { CosmetologyStage3D } from './components/CosmetologyStage3D';
import { DoctorIntroModal } from './components/DoctorIntroModal';
import { Header } from './components/Header';
import { LotusMark } from './components/LotusMark';
import { ResilientImage } from './components/ResilientImage';
import { Scene3D } from './components/Scene3D';
import {
  APPARATUS_PROCEDURES,
  CLINIC_CONTACT,
  CLINIC_STATS,
  CORE_SERVICES,
  HERO_PILLARS,
  IMAGES,
  NAV_LINKS,
  RESULT_CASES,
} from './data/clinicData';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function App() {
  const scrollProgressRef = useRef(0);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('asosiy');
  const [activeAccentHex, setActiveAccentHex] = useState<string>(CORE_SERVICES[0].accentHex);
  const [activeApparatusId, setActiveApparatusId] = useState<string>(APPARATUS_PROCEDURES[0].id);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingInitialService, setBookingInitialService] = useState<string | undefined>(undefined);
  const [introOpen, setIntroOpen] = useState(false);

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const clinicSectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  });
  const heroPortraitY = useTransform(heroScroll, [0, 1], [0, 28]);

  const { scrollYProgress: clinicScroll } = useScroll({
    target: clinicSectionRef,
    offset: ['start end', 'end start'],
  });
  const clinicImageScale = useTransform(clinicScroll, [0, 0.5, 1], [1.06, 1.0, 1.03]);

  const activeApparatus =
    APPARATUS_PROCEDURES.find((a) => a.id === activeApparatusId) || APPARATUS_PROCEDURES[0];

  const handleOpenBooking = useCallback((serviceId?: string) => {
    setBookingInitialService(serviceId);
    setBookingOpen(true);
  }, []);

  const handleSelectApparatus = useCallback((id: string) => {
    setActiveApparatusId(id);
    const found = APPARATUS_PROCEDURES.find((a) => a.id === id);
    if (found) setActiveAccentHex(found.scanColor);
  }, []);

  // Global normalized scroll progress driving ambient 3D background & active section nav
  useEffect(() => {
    let rafId = 0;

    const updateScroll = () => {
      rafId = 0;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      scrollProgressRef.current = progress;
      setScrollPercent(progress);

      const viewportMid = window.scrollY + window.innerHeight * 0.35;
      let currentId: string = NAV_LINKS[0].id;
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.id);
        if (el && el.offsetTop <= viewportMid) {
          currentId = link.id;
        }
      }
      setActiveSection(currentId);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0D060B] text-[#F9EEF3]">
      {/* Pure Ambient Scroll-Animated 3D WebGL Background (no floating corner button) */}
      <Scene3D scrollProgressRef={scrollProgressRef} activeAccentHex={activeAccentHex} />

      {/* Top Navigation */}
      <Header
        activeSection={activeSection}
        scrollPercent={scrollPercent}
        onOpenBooking={() => handleOpenBooking()}
      />

      <main className="relative z-10">
        {/* =================================================================
            SECTION 1: MOBILE-FIRST HERO & 4-METRIC PROOF STRIP
        ================================================================== */}
        <section
          id="asosiy"
          ref={heroSectionRef}
          className="pt-24 pb-12 sm:pt-30 sm:pb-18 px-4 sm:px-8"
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-5 sm:gap-8">
              {/* Portrait appears cleanly on mobile right below headline via visual hierarchy */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-[#140811]/86 border border-[#F4A5C0]/14 rounded-2xl p-6 sm:p-10">
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-[12.5px] text-[#E5C185] font-medium">
                    <span>Tibbiy kosmetologiya</span>
                    <span aria-hidden="true" className="text-[#F4A5C0]/45">
                      ·
                    </span>
                    <span className="text-[#B89EA9]">Dr. Dilnoza Cosmetologist</span>
                  </div>

                  <h1 className="font-display text-[clamp(2.35rem,5.2vw,4.05rem)] font-semibold leading-[1.05] tracking-[-0.015em] text-[#F9EEF3]">
                    Sog‘lom, sof va yosh ko‘rinishdagi{' '}
                    <span className="italic text-[#F4A5C0]">teri</span> — bu g‘amxo‘rlik natijasi!
                  </h1>

                  {/* 3 Concise Pillars — Single-line clean scannable markers */}
                  <div className="pt-1 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13.5px] text-[#E4D1DA]">
                    {HERO_PILLARS.map((pillar, i) => (
                      <div key={pillar.id} className="flex items-center gap-2">
                        <span className="font-mono-num text-[11px] text-[#E5C185]">0{i + 1}</span>
                        <span>{pillar.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tactile 48px Primary & Video Buttons */}
                <div className="pt-7 mt-6 border-t border-[#F4A5C0]/12 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenBooking()}
                    className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-3 text-[14px] font-semibold text-[#14070F] bg-[#E86B94] hover:bg-[#F182A7] active:scale-[0.98] rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A5C0]"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Qabulga yozilish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntroOpen(true)}
                    className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 text-[14px] font-medium text-[#F9EEF3] bg-[#1E0E1A] hover:bg-[#291323] border border-[#F4A5C0]/20 rounded-xl transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86B94]"
                  >
                    <Play className="w-4 h-4 text-[#E5C185]" />
                    <span>Doktor bilan tanishing (1:20)</span>
                  </button>
                </div>
              </div>

              {/* Right Studio Portrait Frame */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#F4A5C0]/18 bg-[#180A14] min-h-[380px] sm:min-h-[440px] lg:min-h-0">
                <motion.div style={{ y: heroPortraitY }} className="w-full h-full">
                  <ResilientImage
                    src={IMAGES.doctorPortrait}
                    alt="Dr. Dilnoza Cosmetologist portreti"
                    className="w-full h-full object-cover object-top"
                  />
                </motion.div>

                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D060B]/92 via-[#0D060B]/15 to-transparent"
                  aria-hidden="true"
                />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[12px] text-[#E5C185] font-medium">Dermatokosmetolog</p>
                    <p className="font-display text-[26px] sm:text-[30px] font-semibold text-[#F9EEF3] leading-tight">
                      Dr. Dilnoza
                    </p>
                  </div>
                  <LotusMark className="w-9 h-6 text-[#E5C185]/85 shrink-0" />
                </div>
              </div>
            </div>

            {/* Compact 4-Stat Strip */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className="mt-5 sm:mt-7 bg-[#160A13]/90 border border-[#F4A5C0]/16 rounded-2xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#F4A5C0]/12"
            >
              {CLINIC_STATS.map((stat) => (
                <div key={stat.label} className="p-5 sm:p-6">
                  <div className="font-mono-num text-[24px] sm:text-[30px] font-semibold text-[#F9EEF3] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[13px] sm:text-[14px] text-[#F4A5C0] mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =================================================================
            SECTION 2: DEDICATED SPACIOUS 3D COSMETOLOGY BLOCK
            Generous width & height on BOTH mobile and desktop (uncramped!)
        ================================================================== */}
        <section id="model3d" className="py-12 sm:py-20 px-4 sm:px-8">
          <div className="mx-auto max-w-[1200px] space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
            >
              <div className="space-y-1.5">
                <p className="text-[12.5px] text-[#E5C185] font-medium">
                  Interaktiv 3D kosmetologiya
                </p>
                <h2 className="font-display text-[clamp(1.95rem,3.6vw,3.1rem)] font-semibold text-[#F9EEF3] leading-[1.08]">
                  Teri qatlamlari va apparat ta’siri
                </h2>
              </div>
              <p className="text-[13.5px] sm:text-[14.5px] text-[#B89EA9]">
                Modelni aylantiring va protsedura rejimini tanlang
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            >
              <CosmetologyStage3D
                activeApparatusId={activeApparatusId}
                onSelectApparatus={handleSelectApparatus}
                onOpenBooking={handleOpenBooking}
              />
            </motion.div>
          </div>
        </section>

        {/* =================================================================
            SECTION 3: ASOSIY XIZMATLAR (Concise, Scannable 6-Card Grid)
        ================================================================== */}
        <section id="xizmatlar" className="py-12 sm:py-20 px-4 sm:px-8">
          <div className="mx-auto max-w-[1200px] space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
            >
              <div className="space-y-1.5">
                <p className="text-[12.5px] text-[#E5C185] font-medium">01 · Yo‘nalishlar</p>
                <h2 className="font-display text-[clamp(1.95rem,3.4vw,3rem)] font-semibold text-[#F9EEF3] leading-[1.08]">
                  Asosiy xizmatlar
                </h2>
              </div>
              <p className="text-[13.5px] text-[#B89EA9]">
                Individual protokol · Sertifikatlangan preparatlar
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {CORE_SERVICES.map((service, idx) => (
                <motion.button
                  key={service.id}
                  type="button"
                  onMouseEnter={() => setActiveAccentHex(service.accentHex)}
                  onClick={() => {
                    setActiveAccentHex(service.accentHex);
                    handleOpenBooking(service.id);
                  }}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.04, ease: EASE_OUT_EXPO }}
                  className="group text-left bg-[#160A13]/90 hover:bg-[#220F1E]/95 border border-[#F4A5C0]/15 hover:border-[#E86B94]/60 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86B94]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[12px] font-mono-num">
                      <span className="text-[#E5C185]">{service.index}</span>
                      <span className="text-[#B89EA9]">
                        {service.duration} · {service.course}
                      </span>
                    </div>
                    <h3 className="text-[17.5px] font-semibold text-[#F9EEF3] leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-[13.5px] text-[#B89EA9] leading-relaxed">
                      {service.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F4A5C0]/10 flex items-center justify-between text-[13px] font-medium text-[#F4A5C0] group-hover:text-[#F9EEF3] transition-colors">
                    <span>Qabulga yozilish</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================
            SECTION 4: VIDEO BANNER + ZAMONAVIY APPARAT KOSMETOLOGIYA
        ================================================================== */}
        <section className="py-12 sm:py-20 px-4 sm:px-8">
          <div className="mx-auto max-w-[1200px] space-y-8">
            {/* Compact Doktor bilan tanishing (1:20) Strip */}
            <motion.button
              type="button"
              onClick={() => setIntroOpen(true)}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className="w-full text-left group bg-[#180B15]/92 hover:bg-[#220F1D]/95 border border-[#F4A5C0]/20 hover:border-[#E5C185]/50 rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-12 items-center transition-colors cursor-pointer"
            >
              <div className="sm:col-span-8 p-6 sm:p-8 flex items-center gap-4 sm:gap-6">
                <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E86B94] group-hover:bg-[#F182A7] text-[#14070F] inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </span>
                <div>
                  <p className="font-mono-num text-[12px] text-[#E5C185]">Video · 1:20</p>
                  <h2 className="font-display text-[26px] sm:text-[32px] font-semibold text-[#F9EEF3] leading-tight">
                    Doktor bilan tanishing
                  </h2>
                  <p className="text-[13.5px] text-[#B89EA9] mt-0.5">
                    Xavfsizlik, tashxis va tabiiy yoshartirish yondashuvi
                  </p>
                </div>
              </div>

              <div className="sm:col-span-4 h-44 sm:h-full min-h-[140px] relative overflow-hidden">
                <ResilientImage
                  src={IMAGES.doctorPortrait}
                  alt="Dr. Dilnoza video taqdimoti"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#180B15] via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>
            </motion.button>

            {/* Zamonaviy Apparat Kosmetologiya Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-6">
              <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-[#F4A5C0]/18 min-h-[290px] sm:min-h-[360px] flex flex-col justify-end">
                <ResilientImage
                  src={IMAGES.apparatusLaser}
                  alt="Zamonaviy apparat kosmetologiya"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D060B]/92 via-[#0D060B]/25 to-transparent"
                  aria-hidden="true"
                />
                <div className="relative z-10 p-6 sm:p-7 space-y-1.5">
                  <p className="font-mono-num text-[12px] text-[#E5C185]">
                    {activeApparatus.wavelength} · {activeApparatus.depth}
                  </p>
                  <h3 className="font-display text-[28px] font-semibold text-[#F9EEF3] leading-tight">
                    Zamonaviy apparat kosmetologiya
                  </h3>
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between gap-2.5">
                {APPARATUS_PROCEDURES.map((item) => {
                  const active = item.id === activeApparatus.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectApparatus(item.id)}
                      className={`w-full text-left min-h-[68px] px-5 py-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer ${
                        active
                          ? 'bg-[#23101F]/94 border-[#E86B94]/70'
                          : 'bg-[#150912]/88 border-[#F4A5C0]/14 hover:border-[#F4A5C0]/36'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-[16px] font-semibold text-[#F9EEF3]">{item.title}</div>
                        <div className="text-[13px] text-[#B89EA9]">{item.effect}</div>
                      </div>
                      <span
                        className={`w-8 h-8 rounded-lg inline-flex items-center justify-center shrink-0 border ${
                          active
                            ? 'bg-[#E86B94] border-[#E86B94] text-[#14070F]'
                            : 'border-[#F4A5C0]/20 text-[#B89EA9]'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            SECTION 5: NATIJALAR & KLINIKA + CONVERSION ACTION DOCK
        ================================================================== */}
        <section id="natijalar" className="py-12 sm:py-18 px-4 sm:px-8">
          <div className="mx-auto max-w-[1200px] space-y-6">
            <div className="space-y-1.5">
              <p className="text-[12.5px] text-[#E5C185] font-medium">02 · Mijozlar fikri</p>
              <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-semibold text-[#F9EEF3] leading-[1.1]">
                Tabiiy natijalar
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {RESULT_CASES.map((item, idx) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.06, ease: EASE_OUT_EXPO }}
                  className="bg-[#160A13]/92 border border-[#F4A5C0]/16 rounded-2xl p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[12px] font-mono-num">
                      <span className="text-[#E5C185]">{item.timeline}</span>
                      <span className="text-[#F4A5C0] font-medium">{item.metric}</span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#F9EEF3]">{item.procedure}</h3>
                    <p className="font-display italic text-[19px] text-[#F9EEF3]/95 leading-snug">
                      “{item.quote}”
                    </p>
                  </div>
                  <p className="pt-3 border-t border-[#F4A5C0]/10 text-[12.5px] text-[#B89EA9]">
                    {item.patientName}, <span className="font-mono-num">{item.age}</span> yosh
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="klinika" ref={clinicSectionRef} className="pt-8 pb-20 sm:pb-24 px-4 sm:px-8">
          <div className="mx-auto max-w-[1200px] space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-5 sm:gap-6">
              <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-[#F4A5C0]/18 min-h-[260px] sm:min-h-[340px]">
                <motion.div style={{ scale: clinicImageScale }} className="w-full h-full">
                  <ResilientImage
                    src={IMAGES.clinicInterior}
                    alt="Dr. Dilnoza Cosmetologist klinikasi"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D060B]/75 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>

              <div className="lg:col-span-5 bg-[#160A13]/92 border border-[#F4A5C0]/18 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-5">
                <div className="space-y-2">
                  <p className="text-[12.5px] text-[#E5C185] font-medium">03 · Klinika</p>
                  <h2 className="font-display text-[28px] sm:text-[32px] font-semibold text-[#F9EEF3] leading-tight">
                    Shaxsiy konsultatsiyaga yoziling
                  </h2>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#F4A5C0]/12 text-[14px]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#E86B94] shrink-0 mt-1" />
                    <span className="text-[#F9EEF3]">{CLINIC_CONTACT.address}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#E5C185] shrink-0 mt-1" />
                    <span className="text-[#D7C2CC]">{CLINIC_CONTACT.hours}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#F4A5C0] shrink-0 mt-1" />
                    <a
                      href={CLINIC_CONTACT.phoneHref}
                      className="font-mono-num text-[#F9EEF3] hover:text-[#F4A5C0] transition-colors"
                    >
                      {CLINIC_CONTACT.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Conversion Row matching uploaded design: WhatsApp · Qabulga yozilish → · Telegram · Phone */}
            <div className="bg-[#1A0C16]/94 border border-[#F4A5C0]/22 rounded-2xl p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-display text-[24px] sm:text-[26px] font-semibold text-[#F9EEF3] text-center sm:text-left">
                Sog‘lom teri sari ilk qadam
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <a
                  href={CLINIC_CONTACT.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="w-12 h-12 rounded-xl bg-[#241120] border border-[#F4A5C0]/24 hover:border-[#E86B94] inline-flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-[#F4A5C0]" />
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  className="flex-1 sm:flex-none min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-3 text-[14.5px] font-semibold text-[#14070F] bg-[#E86B94] hover:bg-[#F182A7] active:scale-[0.98] rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Qabulga yozilish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={CLINIC_CONTACT.telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                  className="w-12 h-12 rounded-xl bg-[#241120] border border-[#F4A5C0]/24 hover:border-[#E86B94] inline-flex items-center justify-center transition-colors"
                >
                  <Send className="w-5 h-5 text-[#F4A5C0]" />
                </a>

                <a
                  href={CLINIC_CONTACT.phoneHref}
                  aria-label="Telefon"
                  className="w-12 h-12 rounded-xl bg-[#241120] border border-[#F4A5C0]/24 hover:border-[#E5C185] inline-flex items-center justify-center transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#E5C185]" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Quiet Footer */}
        <footer className="border-t border-[#F4A5C0]/12 bg-[#0B0509]/95 px-4 sm:px-8 py-8">
          <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#B89EA9]">
            <div className="flex items-center gap-2 text-[#F9EEF3]">
              <LotusMark className="w-6 h-4 text-[#E5C185]" />
              <span className="font-display text-[20px] font-semibold">
                Dr. Dilnoza Cosmetologist
              </span>
            </div>

            <div className="text-[12px] text-[#8E7480]">
              © 2026 Dr. Dilnoza Cosmetologist
            </div>
          </div>
        </footer>
      </main>

      <DoctorIntroModal
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        onOpenBooking={() => handleOpenBooking()}
      />
      <BookingModal
        open={bookingOpen}
        initialServiceId={bookingInitialService}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
}
