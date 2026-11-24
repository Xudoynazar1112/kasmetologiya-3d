export interface ServiceItem {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  duration: string;
  course: string;
  accentHex: string;
}

export interface ApparatusItem {
  id: string;
  shortLabel: string;
  title: string;
  wavelength: string;
  depth: string;
  effect: string;
  scanColor: string;
  scanSpeed: number;
}

export interface ResultCase {
  id: string;
  patientName: string;
  age: number;
  procedure: string;
  timeline: string;
  metric: string;
  quote: string;
}

export interface IntroChapter {
  id: string;
  timeRange: string;
  startSec: number;
  endSec: number;
  title: string;
  caption: string;
  image: string;
}

export const IMAGES = {
  doctorPortrait: '/src/assets/images/dr_dilnoza_portrait_1795420051916.jpg',
  apparatusLaser: '/src/assets/images/apparatus_laser_treatment_1795420072996.jpg',
  clinicInterior: '/src/assets/images/luxury_clinic_interior_1795420052566.jpg',
  botanicalSerum: '/src/assets/images/botanical_serum_detail_1795420051745.jpg',
} as const;

export const NAV_LINKS = [
  { id: 'asosiy', label: 'Asosiy' },
  { id: 'model3d', label: '3D Model' },
  { id: 'xizmatlar', label: 'Xizmatlar' },
  { id: 'natijalar', label: 'Natijalar' },
  { id: 'klinika', label: 'Klinika' },
] as const;

export const HERO_PILLARS = [
  { id: 'medical', title: 'Tibbiy yondashuv' },
  { id: 'tech', title: 'Zamonaviy texnologiyalar' },
  { id: 'natural', title: 'Tabiiy va xavfsiz natija' },
] as const;

export const CLINIC_STATS = [
  { value: '5 000+', label: 'mamnun mijoz' },
  { value: '10+ yil', label: 'tajriba' },
  { value: '30+', label: 'mutaxassislik kursi' },
  { value: '100%', label: 'individual yondashuv' },
] as const;

export const CORE_SERVICES: ServiceItem[] = [
  {
    id: 'rejuvenation',
    index: '01',
    title: 'Yuz terisini yangilash (rejuvenatsiya)',
    subtitle: 'Kollagen sintezi va yoshartirish',
    duration: '45 daq',
    course: '3–4 seans',
    accentHex: '#E86B94',
  },
  {
    id: 'botox',
    index: '02',
    title: 'Botulino-terapiya (Botoks)',
    subtitle: 'Mimik ajinlarni tabiiy tekislash',
    duration: '25 daq',
    course: '6–8 oyda 1 marta',
    accentHex: '#E5C185',
  },
  {
    id: 'biorevitalization',
    index: '03',
    title: 'Biorevitalizatsiya va mezoterapiya',
    subtitle: 'Gialuron bilan chuqur namlantirish',
    duration: '40 daq',
    course: '3 seans',
    accentHex: '#F4A5C0',
  },
  {
    id: 'lifting',
    index: '04',
    title: 'Lifting protseduralar (teri tortish)',
    subtitle: 'Jarrohliksiz aniq yuz ovali',
    duration: '50 daq',
    course: '1–3 seans',
    accentHex: '#D97B9B',
  },
  {
    id: 'acne',
    index: '05',
    title: 'Akne va yallig‘lanishlarni davolash',
    subtitle: 'Dermatologik terapiya va post-akne',
    duration: '45 daq',
    course: '4–6 seans',
    accentHex: '#C98FA8',
  },
  {
    id: 'tone',
    index: '06',
    title: 'Teri rangini va sifatini yaxshilash',
    subtitle: 'Pigmentatsiya va porloq tiniq ton',
    duration: '35 daq',
    course: '2–4 seans',
    accentHex: '#F0B69C',
  },
];

export const APPARATUS_PROCEDURES: ApparatusItem[] = [
  {
    id: 'laser',
    shortLabel: 'Lazer',
    title: 'Lazerli teri yangilash',
    wavelength: '1540 nm Er:Glass',
    depth: '1.2 mm derma',
    effect: 'Fraksion nurlar kollagen tolalarini chuqur yangilaydi.',
    scanColor: '#E86B94',
    scanSpeed: 1.35,
  },
  {
    id: 'rf-lifting',
    shortLabel: 'RF-lifting',
    title: 'RF-lifting (teri tarangligi)',
    wavelength: '4.0 MHz RF',
    depth: '2.5 mm derma',
    effect: 'Radiochastota issiqligi yuz konturini darhol taranglashtiradi.',
    scanColor: '#E5C185',
    scanSpeed: 1.0,
  },
  {
    id: 'ultrasound',
    shortLabel: 'Gialuron / UZI',
    title: 'UZI-tozalash (chuqur tozalash)',
    wavelength: '28 kHz UZI',
    depth: 'Epidermis',
    effect: 'Poralarni shikastsiz tozalab, gialuron singishini 3x oshiradi.',
    scanColor: '#F4A5C0',
    scanSpeed: 0.9,
  },
  {
    id: 'phototherapy',
    shortLabel: 'Fototerapiya',
    title: 'Fototerapiya (teri rangini yaxshilash)',
    wavelength: '530–633 nm IPL',
    depth: '0.8 mm yuza',
    effect: 'Pigment dog‘lari va qizarishlarni muloyim tiniqlashtiradi.',
    scanColor: '#F2B89B',
    scanSpeed: 1.15,
  },
];

export const RESULT_CASES: ResultCase[] = [
  {
    id: 'case-1',
    patientName: 'Malika Karimova',
    age: 34,
    procedure: 'Biorevitalizatsiya + Fototerapiya',
    timeline: '4 hafta · 3 seans',
    metric: 'Namlik +68%',
    quote: 'Hech qanday sun’iylik yo‘q — terim tabiiy yorqinlashib, dam olgandek ko‘rindi.',
  },
  {
    id: 'case-2',
    patientName: 'Nigora Rustamova',
    age: 42,
    procedure: 'RF-lifting + Botulino-terapiya',
    timeline: '6 hafta · 2 bosqich',
    metric: 'Aniq yuz ovali',
    quote: 'Mimika tabiiy saqlanib qoldi, natija kutganimdan ham mayin chiqdi.',
  },
  {
    id: 'case-3',
    patientName: 'Shahzoda Alimova',
    age: 26,
    procedure: 'Akne terapiya + Lazer',
    timeline: '10 hafta · 5 seans',
    metric: 'Yallig‘lanish -92%',
    quote: 'Birinchi marta ko‘chaga tonal kremsiz chiqishga ishonch paydo bo‘ldi.',
  },
];

export const DOCTOR_INTRO_CHAPTERS: IntroChapter[] = [
  {
    id: 'ch-1',
    timeRange: '0:00 – 0:20',
    startSec: 0,
    endSec: 20,
    title: 'Tibbiy kosmetologiya falsafasi',
    caption:
      '«Maqsadim yuzni o‘zgartirish emas, balki terining sog‘lomligi va tabiiy yoshligini qaytarish.»',
    image: IMAGES.doctorPortrait,
  },
  {
    id: 'ch-2',
    timeRange: '0:20 – 0:42',
    startSec: 20,
    endSec: 42,
    title: '10+ yil tajriba va 30+ kurs',
    caption:
      '«Xalqaro dermatologik protokollar har bir bemor uchun xavfsizlik kafolatidir.»',
    image: IMAGES.clinicInterior,
  },
  {
    id: 'ch-3',
    timeRange: '0:42 – 1:02',
    startSec: 42,
    endSec: 62,
    title: 'Apparat va zardob uyg‘unligi',
    caption:
      '«Fraksion lazer, RF-lifting va gialuron kokteyllari og‘riqsiz va barqaror natija beradi.»',
    image: IMAGES.apparatusLaser,
  },
  {
    id: 'ch-4',
    timeRange: '1:02 – 1:20',
    startSec: 62,
    endSec: 80,
    title: '100% individual yondashuv',
    caption:
      '«Har bir muolaja aniq teri diagnostikasi va shaxsiy parvarish rejasidan boshlanadi.»',
    image: IMAGES.botanicalSerum,
  },
];

export const CLINIC_CONTACT = {
  phoneDisplay: '+998 90 123 45 67',
  phoneHref: 'tel:+998901234567',
  whatsappHref:
    'https://wa.me/998901234567?text=Assalomu%20alaykum%2C%20Dr.%20Dilnoza%20qabuliga%20yozilmoqchiman',
  telegramHref: 'https://t.me/dr_dilnoza_cosmetologist',
  address: 'Toshkent, Mirzo Ulug‘bek tumani, Osiyo ko‘chasi 14',
  hours: 'Du – Sha · 09:30 – 19:30',
} as const;
