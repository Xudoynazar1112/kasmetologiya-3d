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
  const [selectedServiceId, setSelectedServiceId] = useState<string>(CORE_SERVICES[0].id);
  const [selectedApparatusId, setSelectedApparatusId] = useState<string>(APPARATUS_PROCEDURES[0].id);
  const [studioMode, setStudioMode] = useState(false);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingInitialService, setBookingInitialService] = useState<string | undefined>(undefined);
  const [introOpen, setIntroOpen] = useState(false);

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const clinicSectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  });
  const heroPortraitY = useTransform(heroScroll, [0, 1], [0, 36]);
  const heroPortraitScale = useTransform(heroScroll, [0, 1], [1, 1.05]);

  const { scrollYProgress: clinicScroll } = useScroll({
    target: clinicSectionRef,
    offset: ['start end', 'end start'],
  });
  const clinicImageScale = useTransform(clinicScroll, [0, 0.5, 1], [1.08, 1.0, 1.04]);

  const selectedService =
    CORE_SERVICES.find((s) => s.id === selectedServiceId) || CORE_SERVICES[0];
  const selectedApparatus =
    APPARATUS_PROCEDURES.find((a) => a.id === selectedApparatusId) || APPARATUS_PROCEDURES[0];

  const handleOpenBooking = useCallback((serviceId?: string) => {
    setBookingInitialService(serviceId);
    setBookingOpen(true);
  }, []);

  // Track global normalized scroll progress for 3D camera choreography & active nav section
  useEffect(() => {
    let rafId = 0;

    const updateScroll = () => {
      rafId = 0;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      scrollProgressRef.current = progress;
      setScrollPercent(progress);

      // Determine active section
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
      {/* Interactive Full-Viewport Scroll-Choreographed 3D WebGL World */}
      <Scene3D
        scrollProgressRef={scrollProgressRef}
        activeAccentHex={selectedService.accentHex}
        laserScanColor={selectedApparatus.scanColor}
        laserScanSpeed={selectedApparatus.scanSpeed}
        serviceFocus={selectedService.sceneFocus}
        studioMode={studioMode}
        onToggleStudioMode={setStudioMode}
      />

      {/* Strict 3-Zone Top Bar */}
      <Header
        activeSection={activeSection}
        scrollPercent={scrollPercent}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Editorial Foreground Content (hidden smoothly when inspecting 3D Studio Mode) */}
      <main
        className={`relative z-10 transition-opacity duration-300 ${
          studioMode ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'
        }`}
      >
        {/* =================================================================
            SECTION 1: HERO & FULL-WIDTH METRICS STRIP
        ================================================================== */}
        <section
          id="asosiy"
          ref={heroSectionRef}
          className="pt-28 pb-16 sm:pt-32 sm:pb-24 px-5 sm:px-8"
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8 lg:gap-10">
              {/* Left Editorial Proposition */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-[#140811]/86 border border-[#F4A5C0]/14 rounded-xl p-7 sm:p-10">
                <div className="space-y-6">
                  {/* Quiet unboxed kicker metadata */}
                  <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-[#E5C185] font-medium">
                    <span>Tibbiy kosmetologiya</span>
                    <span aria-hidden="true" className="text-[#F4A5C0]/45">
                      ·
                    </span>
                    <span className="text-[#B89EA9]">Dr. Dilnoza Cosmetologist</span>
                    <span aria-hidden="true" className="text-[#F4A5C0]/45">
                      ·
                    </span>
                    <span className="text-[#B89EA9]">Toshkent</span>
                  </div>

                  <h1 className="font-display text-[clamp(2.45rem,4.5vw,4.15rem)] font-semibold leading-[1.06] tracking-[-0.015em] text-[#F9EEF3]">
                    Sog‘lom, sof va yosh ko‘rinishdagi{' '}
                    <span className="italic text-[#F4A5C0]">teri</span> — bu g‘amxo‘rlik natijasi!
                  </h1>

                  <p className="text-[16px] leading-[1.68] text-[#D7C2CC] max-w-[58ch]">
                    Har bir teri noyobdir. Ilmiy asoslangan dermatologik diagnostika, zamonaviy
                    apparat kosmetologiya va sertifikatlangan preparatlar orqali tabiiy go‘zalligingizni
                    ehtiyotkorlik bilan saqlab qolamiz.
                  </p>

                  {/* 3 Core Clinical Pillars (unboxed hairline rows, no badge clutter) */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#F4A5C0]/12">
                    {HERO_PILLARS.map((pillar, i) => (
                      <div key={pillar.id} className="pt-3 space-y-1">
                        <div className="font-mono-num text-[11px] text-[#E5C185]">0{i + 1}</div>
                        <div className="text-[14px] font-semibold text-[#F9EEF3]">
                          {pillar.title}
                        </div>
                        <p className="text-[12.5px] leading-relaxed text-[#B89EA9]">
                          {pillar.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Hero Action + Secondary Video Trigger */}
                <div className="pt-8 mt-6 border-t border-[#F4A5C0]/12 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleOpenBooking()}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-[14px] font-semibold text-[#14070F] bg-[#E86B94] hover:bg-[#F182A7] active:scale-[0.98] rounded-md transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A5C0]"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Qabulga yozilish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntroOpen(true)}
                    className="inline-flex items-center gap-2.5 px-5 py-3.5 text-[14px] font-medium text-[#F9EEF3] bg-[#1E0E1A] hover:bg-[#291323] border border-[#F4A5C0]/20 rounded-md transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86B94]"
                  >
                    <Play className="w-4 h-4 text-[#E5C185]" />
                    <span>Doktor bilan tanishing (1:20)</span>
                  </button>
                </div>
              </div>

              {/* Right Full-Height Portrait Frame (scroll-linked parallax) */}
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-[#F4A5C0]/18 bg-[#180A14] min-h-[440px] lg:min-h-0">
                <motion.div
                  style={{ y: heroPortraitY, scale: heroPortraitScale }}
                  className="w-full h-full"
                >
                  <ResilientImage
                    src={IMAGES.doctorPortrait}
                    alt="Dr. Dilnoza Cosmetologist — tibbiy kosmetolog portreti"
                    className="w-full h-full object-cover object-top"
                  />
                </motion.div>

                {/* Measured contrast scrim */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D060B]/92 via-[#0D060B]/20 to-transparent"
                  aria-hidden="true"
                />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[12px] text-[#E5C185] font-medium">
                      Bosh shifokor · Dermatokosmetolog
                    </p>
                    <p className="font-display text-[28px] font-semibold text-[#F9EEF3] leading-tight mt-0.5">
                      Dr. Dilnoza
                    </p>
                    <p className="text-[12.5px] text-[#D7C2CC] mt-1">
                      10+ yillik klinik tajriba · Xalqaro toifadagi mutaxassis
                    </p>
                  </div>
                  <LotusMark className="w-10 h-7 text-[#E5C185]/80 shrink-0" />
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Clinical Proof Strip below Hero Split */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
              className="mt-8 bg-[#160A13]/90 border border-[#F4A5C0]/16 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#F4A5C0]/12"
            >
              {CLINIC_STATS.map((stat) => (
                <div key={stat.label} className="p-6 sm:p-7">
                  <div className="font-mono-num text-[28px] sm:text-[32px] font-semibold text-[#F9EEF3] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[14px] font-medium text-[#F4A5C0] mt-1">{stat.label}</div>
                  <div className="text-[12px] text-[#B89EA9] mt-0.5">{stat.context}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =================================================================
            SECTION 2: ASOSIY XIZMATLAR (Interactive Bento + Protocol Inspector)
        ================================================================== */}
        <section id="xizmatlar" className="py-20 sm:py-24 px-5 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
            >
              <div className="space-y-2.5">
                <p className="text-[13px] text-[#E5C185] font-medium">
                  01 · Tibbiy estetik yo‘nalishlar
                </p>
                <h2 className="font-display text-[clamp(2rem,3.4vw,3.1rem)] font-semibold text-[#F9EEF3] leading-[1.1]">
                  Asosiy xizmatlar
                </h2>
              </div>
              <p className="text-[15px] text-[#B89EA9] max-w-[44ch] leading-relaxed">
                Muolajani tanlang — batafsil klinik protokol, davomiylik va 3D sahna fokusini
                ko‘ring.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-6 lg:gap-8">
              {/* Interactive 6-Service Selection Grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CORE_SERVICES.map((service, idx) => {
                  const isSelected = service.id === selectedService.id;
                  return (
                    <motion.button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: idx * 0.05, ease: EASE_OUT_EXPO }}
                      className={`text-left p-6 rounded-xl border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86B94] ${
                        isSelected
                          ? 'bg-[#23101F]/94 border-[#E86B94]/70'
                          : 'bg-[#150912]/88 border-[#F4A5C0]/14 hover:border-[#F4A5C0]/38 hover:bg-[#1D0C19]/92'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="font-mono-num text-[12px] text-[#E5C185]">
                          {service.index}
                        </span>
                        <span className="font-mono-num text-[12px] text-[#B89EA9]">
                          {service.duration}
                        </span>
                      </div>
                      <h3 className="text-[17px] font-semibold text-[#F9EEF3] leading-snug">
                        {service.title}
                      </h3>
                      <p className="text-[13.5px] text-[#B89EA9] leading-relaxed mt-2">
                        {service.subtitle}
                      </p>
                      <div className="mt-4 pt-3 border-t border-[#F4A5C0]/10 flex items-center justify-between text-[12px]">
                        <span className={isSelected ? 'text-[#F4A5C0] font-medium' : 'text-[#9F8490]'}>
                          {service.course}
                        </span>
                        <span className={isSelected ? 'text-[#E5C185]' : 'text-[#9F8490]'}>
                          {isSelected ? 'Tanlangan' : 'Batafsil →'}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Sticky Clinical Protocol Detail Panel */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 bg-[#170A14]/92 border border-[#F4A5C0]/18 rounded-xl overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <ResilientImage
                    src={IMAGES.botanicalSerum}
                    alt="Tibbiy kosmetologiya zardobi va lotus"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#170A14] via-[#170A14]/45 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[12px] font-mono-num text-[#E5C185]">
                    <span>Protokol {selectedService.index}</span>
                    <span>
                      {selectedService.duration} · {selectedService.recovery}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-5">
                  <div>
                    <h3 className="font-display text-[28px] font-semibold text-[#F9EEF3] leading-tight">
                      {selectedService.title}
                    </h3>
                    <p className="text-[14.5px] text-[#D7C2CC] leading-[1.65] mt-2.5">
                      {selectedService.description}
                    </p>
                  </div>

                  {/* Key Clinical Parameters */}
                  <div className="grid grid-cols-3 gap-3 py-4 border-y border-[#F4A5C0]/12">
                    <div>
                      <div className="text-[11px] text-[#B89EA9]">Davomiyligi</div>
                      <div className="font-mono-num text-[13.5px] font-medium text-[#F9EEF3] mt-0.5">
                        {selectedService.duration}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#B89EA9]">Tiklanish</div>
                      <div className="text-[13.5px] font-medium text-[#F9EEF3] mt-0.5">
                        {selectedService.recovery}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#B89EA9]">Tavsiya kurs</div>
                      <div className="text-[13.5px] font-medium text-[#F9EEF3] mt-0.5">
                        {selectedService.course}
                      </div>
                    </div>
                  </div>

                  {/* Concrete Benefits */}
                  <ul className="space-y-2.5">
                    {selectedService.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2.5 text-[13.5px] text-[#E4D1DA]">
                        <Check className="w-4 h-4 text-[#E86B94] shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleOpenBooking(selectedService.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[14px] font-semibold text-[#14070F] bg-[#E86B94] hover:bg-[#F182A7] active:scale-[0.99] rounded-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Ushbu muolajaga yozilish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            SECTION 3: DOKTOR BILAN TANISHING (1:20) INTERACTIVE BANNER
        ================================================================== */}
        <section className="py-10 sm:py-14 px-5 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
              className="bg-[#180B15]/92 border border-[#F4A5C0]/20 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch"
            >
              <div className="md:col-span-7 p-7 sm:p-10 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2.5 text-[12.5px] text-[#E5C185] font-mono-num">
                  <span>Video tanishuv</span>
                  <span aria-hidden="true">·</span>
                  <span>1:20</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-sans text-[#B89EA9]">4 bob</span>
                </div>

                <h2 className="font-display text-[clamp(1.9rem,3vw,2.75rem)] font-semibold text-[#F9EEF3] leading-[1.12]">
                  Doktor bilan tanishing
                </h2>

                <p className="text-[15px] text-[#D7C2CC] leading-[1.65] max-w-[52ch]">
                  Dr. Dilnoza 1 daqiqa 20 soniya ichida klinikada qo‘llaniladigan xavfsizlik
                  standartlari, teri diagnostikasi va tabiiy natijaga erishish tamoyillari haqida
                  so‘zlab beradi.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIntroOpen(true)}
                    className="inline-flex items-center gap-3 px-6 py-3 text-[14px] font-semibold text-[#14070F] bg-[#E5C185] hover:bg-[#EED09B] active:scale-[0.98] rounded-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Taqdimotni tomosha qilish (1:20)</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIntroOpen(true)}
                aria-label="Doktor bilan tanishing video taqdimotini ochish"
                className="md:col-span-5 relative min-h-[240px] group overflow-hidden cursor-pointer text-left"
              >
                <ResilientImage
                  src={IMAGES.doctorPortrait}
                  alt="Dr. Dilnoza video taqdimot lavhasi"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#180B15]/80 via-[#180B15]/20 to-transparent md:bg-gradient-to-r"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-16 h-16 rounded-full bg-[#E86B94]/92 group-hover:bg-[#F182A7] text-[#14070F] inline-flex items-center justify-center shadow-2xl transition-transform duration-200 group-hover:scale-108">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </span>
                </div>
              </button>
            </motion.div>
          </div>
        </section>

        {/* =================================================================
            SECTION 4: ZAMONAVIY APPARAT KOSMETOLOGIYA (Live 3D Laser Sync)
        ================================================================== */}
        <section id="apparat" className="py-20 sm:py-24 px-5 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
              className="mb-10 space-y-2.5"
            >
              <p className="text-[13px] text-[#E5C185] font-medium">
                02 · Apparat texnologiyalari
              </p>
              <h2 className="font-display text-[clamp(2rem,3.4vw,3.1rem)] font-semibold text-[#F9EEF3] leading-[1.1]">
                Zamonaviy apparat kosmetologiya
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8">
              {/* Left Visual Spotlight with Interactive Laser Scan Coordinate Bar */}
              <div className="lg:col-span-6 relative rounded-xl overflow-hidden border border-[#F4A5C0]/18 bg-[#160A13] min-h-[380px] flex flex-col justify-end">
                <ResilientImage
                  src={IMAGES.apparatusLaser}
                  alt="Zamonaviy apparat kosmetologiya — lazer va RF-lifting seansi"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D060B]/95 via-[#0D060B]/35 to-transparent"
                  aria-hidden="true"
                />

                {/* Animated Laser Wavelength Hairline */}
                <motion.div
                  key={selectedApparatus.id}
                  initial={{ x: '-100%', opacity: 0.7 }}
                  animate={{ x: '100%', opacity: [0.2, 0.85, 0.2] }}
                  transition={{
                    duration: 3.4 / selectedApparatus.scanSpeed,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${selectedApparatus.scanColor}44, transparent)`,
                  }}
                />

                <div className="relative z-10 p-6 sm:p-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono-num text-[#E5C185]">
                    <span>{selectedApparatus.wavelength}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedApparatus.depth}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedApparatus.sessionTime}</span>
                  </div>
                  <h3 className="font-display text-[30px] font-semibold text-[#F9EEF3] leading-tight">
                    {selectedApparatus.title}
                  </h3>
                  <p className="text-[14.5px] text-[#E4D1DA] leading-relaxed">
                    {selectedApparatus.clinicalEffect}
                  </p>
                </div>
              </div>

              {/* Right Interactive 4-Procedure Selector */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-3">
                {APPARATUS_PROCEDURES.map((item, index) => {
                  const active = item.id === selectedApparatus.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedApparatusId(item.id)}
                      className={`w-full text-left p-5 sm:p-6 rounded-xl border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86B94] ${
                        active
                          ? 'bg-[#23101F]/94 border-[#E86B94]/70'
                          : 'bg-[#150912]/88 border-[#F4A5C0]/14 hover:border-[#F4A5C0]/36'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 text-[12px] font-mono-num text-[#E5C185]">
                            <span>0{index + 1}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#B89EA9]">{item.wavelength}</span>
                          </div>
                          <h3 className="text-[18px] font-semibold text-[#F9EEF3]">
                            {item.title}
                          </h3>
                          <p className="text-[13.5px] text-[#B89EA9]">{item.subtitle}</p>
                        </div>
                        <span
                          className={`w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0 border transition-colors ${
                            active
                              ? 'bg-[#E86B94] border-[#E86B94] text-[#14070F]'
                              : 'border-[#F4A5C0]/20 text-[#B89EA9]'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </span>
                      </div>

                      {active && (
                        <div className="mt-4 pt-4 border-t border-[#F4A5C0]/12 space-y-3">
                          <p className="text-[14px] text-[#E4D1DA] leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[12.5px] text-[#E5C185] font-medium">
                              3D kollagen skaneri faol · {item.depth}
                            </span>
                            <span
                              role="link"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBooking(item.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleOpenBooking(item.id);
                                }
                              }}
                              className="text-[13px] font-semibold text-[#F4A5C0] hover:text-[#F9EEF3] transition-colors whitespace-nowrap"
                            >
                              Seansga yozilish →
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            SECTION 5: NATIJALAR & MIJOZLAR TAJRIBASI (Proof Adjacency)
        ================================================================== */}
        <section id="natijalar" className="py-20 sm:py-24 px-5 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
            >
              <div className="space-y-2.5">
                <p className="text-[13px] text-[#E5C185] font-medium">
                  03 · Klinik holatlar va mijozlar fikri
                </p>
                <h2 className="font-display text-[clamp(2rem,3.4vw,3.1rem)] font-semibold text-[#F9EEF3] leading-[1.1]">
                  Tabiiy va o‘lchanadigan natijalar
                </h2>
              </div>
              <p className="text-[15px] text-[#B89EA9] max-w-[44ch] leading-relaxed">
                Har bir holatda aniq boshlang‘ich tashxis, muolaja muddati va bosqichma-bosqich
                tiklanish kuzatiladi.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RESULT_CASES.map((item, idx) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: EASE_OUT_EXPO }}
                  className="bg-[#160A13]/92 border border-[#F4A5C0]/16 rounded-xl p-6 sm:p-7 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 text-[12px] font-mono-num">
                      <span className="text-[#E5C185]">{item.timeline}</span>
                      <span className="text-[#F4A5C0] font-medium">{item.metric}</span>
                    </div>

                    <h3 className="text-[18px] font-semibold text-[#F9EEF3] leading-snug">
                      {item.procedure}
                    </h3>

                    <div className="space-y-2.5 text-[13.5px] leading-relaxed">
                      <div>
                        <span className="text-[#B89EA9] font-medium">Murojaat sababi: </span>
                        <span className="text-[#D7C2CC]">{item.beforeNote}</span>
                      </div>
                      <div>
                        <span className="text-[#E5C185] font-medium">Natija: </span>
                        <span className="text-[#F9EEF3]/92">{item.outcomeNote}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F4A5C0]/12 space-y-2">
                    <p className="font-display italic text-[18px] text-[#F9EEF3] leading-snug">
                      “{item.quote}”
                    </p>
                    <p className="text-[12.5px] text-[#B89EA9]">
                      {item.patientName}, <span className="font-mono-num">{item.age}</span> yosh
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================
            SECTION 6: KLINIKA & CONVERSION ACTION DOCK
        ================================================================== */}
        <section
          id="klinika"
          ref={clinicSectionRef}
          className="pt-16 pb-24 sm:pt-20 sm:pb-28 px-5 sm:px-8"
        >
          <div className="mx-auto max-w-[1200px] space-y-10">
            {/* Clinic Interior Architectural Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8">
              <div className="lg:col-span-7 relative rounded-xl overflow-hidden border border-[#F4A5C0]/18 min-h-[320px] sm:min-h-[400px]">
                <motion.div style={{ scale: clinicImageScale }} className="w-full h-full">
                  <ResilientImage
                    src={IMAGES.clinicInterior}
                    alt="Dr. Dilnoza Cosmetologist klinikasi interyeri"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D060B]/80 via-transparent to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-[#F9EEF3]/90">
                  <span>Steril tibbiy muhit · Yevropa standartlari</span>
                  <span className="font-mono-num text-[#E5C185]">Toshkent</span>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#160A13]/92 border border-[#F4A5C0]/18 rounded-xl p-7 sm:p-9 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <p className="text-[13px] text-[#E5C185] font-medium">
                    04 · Klinika va aloqa
                  </p>
                  <h2 className="font-display text-[clamp(1.9rem,3vw,2.7rem)] font-semibold text-[#F9EEF3] leading-[1.1]">
                    Teringiz uchun shaxsiy maslahatga yoziling
                  </h2>
                  <p className="text-[14.5px] text-[#D7C2CC] leading-[1.65]">
                    Birlamchi qabulda teri holati chuqur tahlil qilinadi, sizga mos apparat yoki
                    in’eksion muolajalar rejasi hamda kundalik uy parvarishi tuziladi.
                  </p>
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

            {/* Bottom Conversion Row mirroring the uploaded design: WhatsApp | Qabulga yozilish → | Telegram | Phone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className="bg-[#1A0C16]/94 border border-[#F4A5C0]/24 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="text-center md:text-left space-y-1">
                <p className="text-[12.5px] text-[#E5C185] font-medium">
                  Tezkor yozilish va onlayn maslahat
                </p>
                <p className="font-display text-[26px] font-semibold text-[#F9EEF3]">
                  Sog‘lom teri sari birinchi qadam
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={CLINIC_CONTACT.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp orqali yozish"
                  title="WhatsApp"
                  className="w-12 h-12 rounded-md bg-[#241120] border border-[#F4A5C0]/24 hover:border-[#E86B94] text-[#F9EEF3] inline-flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-[#F4A5C0]" />
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-[15px] font-semibold text-[#14070F] bg-[#E86B94] hover:bg-[#F182A7] active:scale-[0.98] rounded-md transition-all cursor-pointer whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Qabulga yozilish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={CLINIC_CONTACT.telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram orqali yozish"
                  title="Telegram"
                  className="w-12 h-12 rounded-md bg-[#241120] border border-[#F4A5C0]/24 hover:border-[#E86B94] text-[#F9EEF3] inline-flex items-center justify-center transition-colors"
                >
                  <Send className="w-5 h-5 text-[#F4A5C0]" />
                </a>

                <a
                  href={CLINIC_CONTACT.phoneHref}
                  aria-label="Telefon qilish"
                  title="Telefon"
                  className="w-12 h-12 rounded-md bg-[#241120] border border-[#F4A5C0]/24 hover:border-[#E5C185] text-[#F9EEF3] inline-flex items-center justify-center transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#E5C185]" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quiet Editorial Footer */}
        <footer className="border-t border-[#F4A5C0]/12 bg-[#0B0509]/95 px-5 sm:px-8 py-10">
          <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-6 text-[13px] text-[#B89EA9]">
            <div className="flex items-center gap-2.5 text-[#F9EEF3]">
              <LotusMark className="w-6 h-4 text-[#E5C185]" />
              <span className="font-display text-[20px] font-semibold">
                Dr. Dilnoza Cosmetologist
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="hover:text-[#F9EEF3] transition-colors whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="text-[12px] text-[#8E7480]">
              © 2026 Dr. Dilnoza Cosmetologist · Barcha huquqlar himoyalangan
            </div>
          </div>
        </footer>
      </main>

      {/* Modals */}
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
