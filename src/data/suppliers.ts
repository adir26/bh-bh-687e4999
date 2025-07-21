// Supplier data for different categories
export interface Supplier {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  category: string;
  rating: number;
  reviewCount: number;
  phone: string;
  location: string;
  description: string;
  services: string[];
  gallery: string[];
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
  }[];
  reviews: {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export const suppliers: Supplier[] = [
  // Kitchen suppliers
  {
    id: 'semel-kitchens',
    name: 'סמל מטבחים',
    tagline: 'מטבחים יוקרתיים ומעוצבים',
    logo: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=400&h=300&fit=crop',
    category: 'kitchens',
    rating: 4.8,
    reviewCount: 124,
    phone: '050-1234567',
    location: 'תל אביב',
    description: 'אנו מתמחים בעיצוב וייצור מטבחים יוקרתיים ברמה הגבוהה ביותר. עם ניסיון של מעל 15 שנה בתחום, אנו מביאים פתרונות מתקדמים ועיצובים ייחודיים.',
    services: ['עיצוב מטבחים', 'ייצור על פי מידה', 'התקנה מקצועית', 'שירות לקוחות'],
    gallery: [
      'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556909109-4096c61c0a45?w=400&h=300&fit=crop'
    ],
    products: [
      {
        id: '1',
        name: 'מטבח מודרני קלאסיק',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=400&h=300&fit=crop',
        description: 'מטבח יוקרתי עם גימור עליון'
      },
      {
        id: '2',
        name: 'מטבח מינימליסטי',
        price: 18000,
        image: 'https://images.unsplash.com/photo-1556909109-4096c61c0a45?w=400&h=300&fit=crop',
        description: 'עיצוב נקי ופונקציונלי'
      },
      {
        id: '3',
        name: 'מטבח כפרי',
        price: 22000,
        image: 'https://images.unsplash.com/photo-1556909106-f06c0620e19c?w=400&h=300&fit=crop',
        description: 'סטייל כפרי חם ומזמין'
      }
    ],
    reviews: [
      {
        id: '1',
        customerName: 'נועה כהן',
        rating: 5,
        comment: 'המטבח שלנו הפך למרכז הבית! עבודה מקצועית ברמה הגבוהה ביותר.',
        date: '2024-01-15'
      },
      {
        id: '2',
        customerName: 'אבי לוי',
        rating: 4,
        comment: 'שירות מעולה ואיכות עבודה גבוהה. ממליץ בחום!',
        date: '2024-01-10'
      },
      {
        id: '3',
        customerName: 'רונן דוד',
        rating: 5,
        comment: 'הכי מרוצה מהמטבח החדש! עבודה מעולה ושירות אדיב.',
        date: '2024-01-08'
      }
    ]
  },
  {
    id: 'aviv-kitchens',
    name: 'אביב מטבחים',
    tagline: 'פתרונות מטבח חכמים ומודרניים',
    logo: 'https://images.unsplash.com/photo-1556909109-4096c61c0a45?w=400&h=300&fit=crop',
    category: 'kitchens',
    rating: 4.6,
    reviewCount: 89,
    phone: '052-9876543',
    location: 'חיפה',
    description: 'מתמחים בפתרונות מטבח חדשניים ומודרניים. אנו מספקים שירות מקצועי מתכנון ועד התקנה.',
    services: ['תכנון מטבחים', 'ייצור רהיטי מטבח', 'התקנה', 'תחזוקה'],
    gallery: [
      'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556909109-4096c61c0a45?w=400&h=300&fit=crop'
    ],
    products: [
      {
        id: '1',
        name: 'מטבח חכם',
        price: 20000,
        image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=400&h=300&fit=crop',
        description: 'מטבח עם טכנולוגיה חכמה'
      },
      {
        id: '2',
        name: 'מטבח קומפקטי',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1556909109-4096c61c0a45?w=400&h=300&fit=crop',
        description: 'פתרון מושלם לדירות קטנות'
      }
    ],
    reviews: [
      {
        id: '1',
        customerName: 'מיכל ישראלי',
        rating: 5,
        comment: 'מטבח מושלם! תודה על השירות המדהים.',
        date: '2024-01-12'
      },
      {
        id: '2',
        customerName: 'דני כהן',
        rating: 4,
        comment: 'שירות מהיר ומקצועי. המטבח נראה נהדר!',
        date: '2024-01-05'
      }
    ]
  },
  {
    id: 'premium-kitchens',
    name: 'פרימיום מטבחים',
    tagline: 'מטבחים יוקרתיים במחירים שווים',
    logo: 'https://images.unsplash.com/photo-1556909106-f06c0620e19c?w=400&h=300&fit=crop',
    category: 'kitchens',
    rating: 4.9,
    reviewCount: 156,
    phone: '054-5555555',
    location: 'ירושלים',
    description: 'חברת מטבחים מובילה המתמחה במטבחים יוקרתיים עם חומרים איכותיים ועיצוב מתקדם.',
    services: ['מטבחים יוקרתיים', 'עיצוב אישי', 'התקנה מקצועית'],
    gallery: [
      'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=400&h=300&fit=crop'
    ],
    products: [
      {
        id: '1',
        name: 'מטבח יוקרה פרימיום',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=400&h=300&fit=crop',
        description: 'מטבח יוקרתי ברמה הגבוהה ביותר'
      }
    ],
    reviews: []
  },

  // Furniture suppliers
  {
    id: 'modern-furniture',
    name: 'מודרן ריהוט',
    tagline: 'ריהוט מודרני ואיכותי',
    logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    category: 'furniture',
    rating: 4.7,
    reviewCount: 78,
    phone: '053-1111111',
    location: 'רמת גן',
    description: 'מתמחים בריהוט מודרני ועיצוב פנים. מגוון רחב של רהיטים איכותיים למשרד ולבית.',
    services: ['ריהוט משרדי', 'ריהוט בית', 'עיצוב פנים', 'התקנה'],
    gallery: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    ],
    products: [
      {
        id: '1',
        name: 'ספה מודרנית',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
        description: 'ספה נוחה ומעוצבת'
      },
      {
        id: '2',
        name: 'שולחן עבודה',
        price: 2200,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
        description: 'שולחן עבודה ארגונומי'
      }
    ],
    reviews: [
      {
        id: '1',
        customerName: 'שרה לוי',
        rating: 5,
        comment: 'הריהוט מדהים! איכות עליונה ועיצוב מושלם.',
        date: '2024-01-14'
      },
      {
        id: '2',
        customerName: 'יוסי אברהם',
        rating: 4,
        comment: 'שירות מעולה והתקנה מקצועית.',
        date: '2024-01-11'
      },
      {
        id: '3',
        customerName: 'נטע כהן',
        rating: 5,
        comment: 'ממליצה בחום! הרהיטים הפכו את הבית שלנו.',
        date: '2024-01-09'
      }
    ]
  },
  {
    id: 'classic-furniture',
    name: 'קלאסיק רהיטים',
    tagline: 'רהיטים קלאסיים בטוב טעם',
    logo: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    category: 'furniture',
    rating: 4.5,
    reviewCount: 92,
    phone: '054-2222222',
    location: 'באר שבע',
    description: 'רהיטים קלאסיים ואיכותיים לבית. מגוון רחב של רהיטי עץ מלא ועיצובים קלאסיים.',
    services: ['רהיטי עץ מלא', 'עיצוב קלאסי', 'שחזור רהיטים'],
    gallery: [],
    products: [
      {
        id: '1',
        name: 'ארון עץ מלא',
        price: 3800,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
        description: 'ארון עץ מלא בסגנון קלאסי'
      }
    ],
    reviews: []
  },

  // Air conditioning suppliers
  {
    id: 'cool-air',
    name: 'קול אייר',
    tagline: 'מיזוג אוויר מקצועי',
    logo: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=300&fit=crop',
    category: 'air-conditioning',
    rating: 4.8,
    reviewCount: 134,
    phone: '050-3333333',
    location: 'פתח תקווה',
    description: 'התקנה ותחזוקה של מערכות מיזוג אוויר. שירות זמין 24/7 ואחריות מלאה.',
    services: ['התקנת מיזוג', 'תחזוקת מיזוג', 'שירות 24/7'],
    gallery: [],
    products: [
      {
        id: '1',
        name: 'מזגן אינוורטר',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=300&fit=crop',
        description: 'מזגן חסכוני ושקט'
      }
    ],
    reviews: []
  },

  // Renovation suppliers
  {
    id: 'renovation-pro',
    name: 'שיפוצי פרו',
    tagline: 'שיפוצים מקצועיים ואמינים',
    logo: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop',
    category: 'renovation',
    rating: 4.6,
    reviewCount: 67,
    phone: '052-4444444',
    location: 'הרצליה',
    description: 'קבלן שיפוצים מקצועי עם ניסיון רב בשיפוצי דירות ובתים פרטיים.',
    services: ['שיפוצי דירות', 'שיפוצי בתים', 'עבודות גמר'],
    gallery: [],
    products: [
      {
        id: '1',
        name: 'חבילת שיפוץ מלאה',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop',
        description: 'שיפוץ מלא לדירת 3 חדרים'
      }
    ],
    reviews: []
  }
];

export const getSuppliersByCategory = (category: string): Supplier[] => {
  return suppliers.filter(supplier => supplier.category === category);
};

export const getSupplierById = (id: string): Supplier | undefined => {
  return suppliers.find(supplier => supplier.id === id);
};