export interface ServiceItem {
  id: string;
  index: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  duration: string;
  recovery: string;
  course: string;
  accentHex: string;
  sceneFocus: 'lotus' | 'flacon' | 'matrix';
  benefits: string[];
}

export interface ApparatusItem {
  id: string;
  title: string;
  subtitle: string;
  wavelength: string;
  depth: string;
  sessionTime: string;
  description: string;
  scanColor: string;
  scanSpeed: number;
  clinicalEffect: string;
}

export interface ResultCase {
  id: string;
  patientName: string;
  age: number;
  procedure: string;
  timeline: string;
  metric: string;
  beforeNote: string;
  outcomeNote: string;
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
  { id: 'xizmatlar', label: 'Xizmatlar' },
  { id: 'apparat', label: 'Texnologiya' },
  { id: 'natijalar', label: 'Natijalar' },
  { id: 'klinika', label: 'Klinika' },
] as const;

export const HERO_PILLARS = [
  {
    id: 'medical',
    title: 'Tibbiy yondashuv',
    detail: 'Dermatologik tashxis va klinik protokollar asosida',
  },
  {
    id: 'tech',
    title: 'Zamonaviy texnologiyalar',
    detail: 'Sertifikatlangan Yevropa va Koreya apparat tizimlari',
  },
  {
    id: 'natural',
    title: 'Tabiiy va xavfsiz natija',
    detail: 'Yuz mimikasini saqlagan holda muloyim yoshartirish',
  },
] as const;

export const CLINIC_STATS = [
  { value: '5 000+', label: 'mamnun mijoz', context: 'Toshkent va viloyatlardan' },
  { value: '10+ yil', label: 'tajriba', context: 'Tibbiy kosmetologiya' },
  { value: '30+', label: 'mutaxassislik kursi', context: 'Xalqaro sertifikatlar' },
  { value: '100%', label: 'individual yondashuv', context: 'Shaxsiy davolash rejasi' },
] as const;

export const CORE_SERVICES: ServiceItem[] = [
  {
    id: 'rejuvenation',
    index: '01',
    title: 'Yuz terisini yangilash (rejuvenatsiya)',
    shortTitle: 'Yuz terisini yangilash',
    subtitle: 'Hujayra darajasida yangilanish va kollagen sintezi',
    description:
      'Terining chuqur qatlamlarini faollashtirish orqali tabiiy elastiklikni tiklaydi, mayda ajinlarni yumshatadi va yuzga tiniq, dam olgan ko‘rinish qaytaradi.',
    duration: '45 daqiqa',
    recovery: '1–2 kun',
    course: '3–4 seans',
    accentHex: '#E86B94',
    sceneFocus: 'lotus',
    benefits: [
      'Tabiiy kollagen va elastin ishlab chiqarishni kuchaytiradi',
      'Terining mikro-relyefi va poralarini tekislaydi',
      'Mavsumiy charchoq va xira rangni bartaraf etadi',
    ],
  },
  {
    id: 'botox',
    index: '02',
    title: 'Botulino-terapiya (Botoks)',
    shortTitle: 'Botulino-terapiya',
    subtitle: 'Mimik ajinlarni nozik va tabiiy korreksiya qilish',
    description:
      'Peshona, qoshlar orasi va ko‘z atrofidagi faol mimik ajinlarni yuz ifodasini qotirmasdan yumshatishga qaratilgan aniq dozali tibbiy muolaja.',
    duration: '25 daqiqa',
    recovery: 'Tiklanishsiz',
    course: '6–8 oyda 1 marta',
    accentHex: '#E5C185',
    sceneFocus: 'flacon',
    benefits: [
      'Yuzning jonli va tabiiy mimikasini to‘liq saqlab qoladi',
      'Chuqur ajinlar shakllanishining oldini oladi',
      'Rasmiy ro‘yxatdan o‘tgan original preparatlar qo‘llaniladi',
    ],
  },
  {
    id: 'biorevitalization',
    index: '03',
    title: 'Biorevitalizatsiya va mezoterapiya',
    shortTitle: 'Biorevitalizatsiya',
    subtitle: 'Gialuron kislotasi, peptidlar va aminokislotalar bilan chuqur namlantirish',
    description:
      'Quruq, suvsizlangan va tarangligini yo‘qotgan terini ichkaridan oziqlantiradi. Birinchi muolajadanoq teri mayinlashib, sog‘lom jilo paydo bo‘ladi.',
    duration: '40 daqiqa',
    recovery: '12–24 soat',
    course: '3 seans (14 kun oraliq)',
    accentHex: '#F4A5C0',
    sceneFocus: 'flacon',
    benefits: [
      'Derma qatlamida uzoq muddatli namlik balansini tiklaydi',
      'Ko‘z osti xiraligi va suvsizlanish izlarini kamaytiradi',
      'Har bir teri turiga mos individual kokteyl tanlanadi',
    ],
  },
  {
    id: 'lifting',
    index: '04',
    title: 'Lifting protseduralar (teri tortish)',
    shortTitle: 'Lifting protseduralar',
    subtitle: 'Jarrohliksiz yuz ovalini mustahkamlash va konturlash',
    description:
      'Yuz pastki uchdan bir qismi, yonoq va bo‘yin sohasidagi bo‘shashishni jarrohlik aralashuvisiz mustahkamlab, aniq va yosh kontur yaratadi.',
    duration: '50 daqiqa',
    recovery: '1–3 kun',
    course: '1–3 seans',
    accentHex: '#D97B9B',
    sceneFocus: 'matrix',
    benefits: [
      'Yuz ovalini aniqroq va tarangroq qiladi',
      'To‘qimalarni tabiiy tayanch karkasi orqali ko‘taradi',
      'Natija 12 oygacha barqaror saqlanadi',
    ],
  },
  {
    id: 'acne',
    index: '05',
    title: 'Akne va yallig‘lanishlarni davolash',
    shortTitle: 'Akne davolash',
    subtitle: 'Dermatologik tashxis, kompleks terapiya va post-akne tiklash',
    description:
      'Toshmalar sababini aniqlab, yog‘ bezlari faoliyatini me’yorlashtiruvchi tibbiy protokollar hamda post-akne dog‘ va chandiqlarni tekislash muolajalari.',
    duration: '45 daqiqa',
    recovery: 'Minimal',
    course: '4–6 seans',
    accentHex: '#C98FA8',
    sceneFocus: 'matrix',
    benefits: [
      'Yallig‘lanish o‘choqlarini xavfsiz va tizimli kamaytiradi',
      'Post-akne dog‘lar va notekis teksturani silliqlaydi',
      'Uyda parvarishlash uchun shaxsiy dermo-kosmetika rejasi',
    ],
  },
  {
    id: 'tone',
    index: '06',
    title: 'Teri rangini va sifatini yaxshilash',
    shortTitle: 'Teri rangi va sifati',
    subtitle: 'Pigmentatsiya korreksiyasi va porloq bir xil ton',
    description:
      'Quyosh dog‘lari, melazma va notekis rangni muloyim fototerapiya hamda antioksidant protokollar yordamida yorqin va tiniq holatga keltiradi.',
    duration: '35 daqiqa',
    recovery: 'Tiklanishsiz',
    course: '2–4 seans',
    accentHex: '#F0B69C',
    sceneFocus: 'lotus',
    benefits: [
      'Pigment dog‘lari va qizarishlarni sezilarli yengillashtiradi',
      'Teri himoya barerini mustahkamlaydi',
      'Tabiiy "glass skin" tiniqligi va tekis rang beradi',
    ],
  },
];

export const APPARATUS_PROCEDURES: ApparatusItem[] = [
  {
    id: 'laser',
    title: 'Lazerli teri yangilash',
    subtitle: 'Fraksion mikro-nurlar orqali chuqur regeneratsiya',
    wavelength: '1540 nm Er:Glass',
    depth: '1.2 mm derma',
    sessionTime: '30 daqiqa',
    description:
      'Yuqori aniqlikdagi lazer nurlari teri yuzasiga shikast yetkazmasdan kollagen tolalarini qayta qurishni ishga tushiradi, chandiqlar va ajinlarni tekislaydi.',
    scanColor: '#E86B94',
    scanSpeed: 1.35,
    clinicalEffect: 'Kollagen zichligi 4–6 hafta ichida bosqichma-bosqich oshadi',
  },
  {
    id: 'rf-lifting',
    title: 'RF-lifting (teri tarangligi)',
    subtitle: 'Radiochastotali termo-lifting va kontur mustahkamlash',
    wavelength: '4.0 MHz RF',
    depth: '2.5 mm SMAS/Derma',
    sessionTime: '40 daqiqa',
    description:
      'Boshqariladigan radiochastota issiqligi bo‘shashgan kollagen spirallarini darhol taranglashtirib, yuz va bo‘yin terisiga mustahkamlik bag‘ishlaydi.',
    scanColor: '#E5C185',
    scanSpeed: 1.0,
    clinicalEffect: 'Birinchi seansdayoq sezilarli taranglik va aniq yuz konturi',
  },
  {
    id: 'ultrasound',
    title: 'UZI-tozalash (chuqur tozalash)',
    subtitle: 'Ultratovushli shikastsiz pora tozalash va kislorodlash',
    wavelength: '28 kHz UZI',
    depth: 'Epidermis yuzasi',
    sessionTime: '45 daqiqa',
    description:
      'Ultratovush to‘lqinlari qora nuqtalar, ortiqcha sebum va o‘lik hujayralarni terini qizartirmasdan tozalab, keyingi zardoblar singishini 3 barobar oshiradi.',
    scanColor: '#F4A5C0',
    scanSpeed: 0.85,
    clinicalEffect: 'Nozik terilar uchun ham xavfsiz, toza va nafas oluvchi poralar',
  },
  {
    id: 'phototherapy',
    title: 'Fototerapiya (teri rangini yaxshilash)',
    subtitle: 'IPL va LED keng spektrli yorug‘lik bilan tiniqlashtirish',
    wavelength: '530–633 nm IPL',
    depth: '0.8 mm kapillyar',
    sessionTime: '25 daqiqa',
    description:
      'Maqsadli yorug‘lik impulslari pigment to‘planishlari va mayda tomir to‘rlarini muloyim parchalaydi, teri rangini yorqin va bir tekis qiladi.',
    scanColor: '#F2B89B',
    scanSpeed: 1.15,
    clinicalEffect: 'Qizarish va pigment dog‘lari 2–3 muolajadan so‘ng sezilarli kamayadi',
  },
];

export const RESULT_CASES: ResultCase[] = [
  {
    id: 'case-1',
    patientName: 'Malika Karimova',
    age: 34,
    procedure: 'Biorevitalizatsiya + Fototerapiya',
    timeline: '4 hafta · 3 seans',
    metric: 'Teri namligi +68%',
    beforeNote: 'Tug‘ruqdan keyingi suvsizlanish, yonoqlarda quyosh pigmentatsiyasi va xira rang.',
    outcomeNote: 'Uchinchi haftadan boshlab yuz rangi tekislandi, mayda quruqlik chiziqlari yo‘qolib, tabiiy yorqinlik tiklandi.',
    quote: 'Eng yoqqani — hech qanday sun’iylik yo‘q. Yaqinlarim dam olib kelgandek ko‘rinyapsan deyishdi.',
  },
  {
    id: 'case-2',
    patientName: 'Nigora Rustamova',
    age: 42,
    procedure: 'RF-lifting + Botulino-terapiya',
    timeline: '6 hafta · 2 bosqich',
    metric: 'Yuz ovali tarangligi',
    beforeNote: 'Peshona va ko‘z atrofidagi faol mimik ajinlar, pastki jag‘ konturida yengil bo‘shashish.',
    outcomeNote: 'Mimika tabiiyligi saqlangan holda peshona silliqlandi, yuz pastki konturi aniq va tarang ko‘rinish oldi.',
    quote: 'Dr. Dilnoza har bir nuqtani shoshilmay tushuntirdi. Qo‘rquvim butunlay ketdi va natija kutganimdan ham mayin chiqdi.',
  },
  {
    id: 'case-3',
    patientName: 'Shahzoda Alimova',
    age: 26,
    procedure: 'Akne kompleks terapiya + Lazer yangilash',
    timeline: '10 hafta · 5 seans',
    metric: 'Yallig‘lanish -92%',
    beforeNote: '3 yil davom etgan surunkali yallig‘lanish va yonoq sohasidagi post-akne izlari.',
    outcomeNote: 'Tizimli dermatologik muolaja va uy parvarishi natijasida faol toshmalar to‘xtadi, teri teksturasi sezilarli tekislandi.',
    quote: 'Birinchi marta ko‘chaga tonal kremsiz chiqishga ishonch paydo bo‘ldi. Tibbiy yondashuvning farqi juda katta ekan.',
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
      '«Har bir ayolning go‘zalligi — o‘ziga xos. Mening maqsadim yuzni o‘zgartirish emas, balki terining sog‘lomligi va tabiiy yoshligini ehtiyotkorlik bilan qaytarish.»',
    image: IMAGES.doctorPortrait,
  },
  {
    id: 'ch-2',
    timeRange: '0:20 – 0:42',
    startSec: 20,
    endSec: 42,
    title: '10+ yillik tajriba va 30+ xalqaro kurs',
    caption:
      '«Toshkent, Moskva, Seul va Parij konferensiyalarida o‘zlashtirilgan zamonaviy dermatologik protokollar har bir bemor uchun xavfsizlik kafolatidir.»',
    image: IMAGES.clinicInterior,
  },
  {
    id: 'ch-3',
    timeRange: '0:42 – 1:02',
    startSec: 42,
    endSec: 62,
    title: 'Zamonaviy apparat va zardoblar uyg‘unligi',
    caption:
      '«Fraksion lazer, RF-lifting va sertifikatlangan gialuron zardoblarini to‘g‘ri uyg‘unlashtirish orqali uzoq muddatli, og‘riqsiz natijaga erishamiz.»',
    image: IMAGES.apparatusLaser,
  },
  {
    id: 'ch-4',
    timeRange: '1:02 – 1:20',
    startSec: 62,
    endSec: 80,
    title: '100% individual parvarish rejasi',
    caption:
      '«Konsultatsiya teri diagnostikasidan boshlanadi. Sizga faqat haqiqatan kerakli muolajalar va qulay uy parvarishi tavsiya etiladi.»',
    image: IMAGES.botanicalSerum,
  },
];

export const CLINIC_CONTACT = {
  phoneDisplay: '+998 90 123 45 67',
  phoneHref: 'tel:+998901234567',
  whatsappHref: 'https://wa.me/998901234567?text=Assalomu%20alaykum%2C%20Dr.%20Dilnoza%20qabuliga%20yozilmoqchiman',
  telegramHref: 'https://t.me/dr_dilnoza_cosmetologist',
  address: 'Toshkent sh., Mirzo Ulug‘bek tumani, Osiyo ko‘chasi 14',
  hours: 'Dushanba – Shanba · 09:30 – 19:30',
} as const;
