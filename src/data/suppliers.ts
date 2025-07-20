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
    reviews: [
      {
        id: '1',
        customerName: 'מיכל ישראלי',
        rating: 5,
        comment: 'מטבח מושלם! תודה על השירות המדהים.',
        date: '2024-01-12'
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
    reviews: []
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
    reviews: []
  }
];

export const getSuppliersByCategory = (category: string): Supplier[] => {
  return suppliers.filter(supplier => supplier.category === category);
};

export const getSupplierById = (id: string): Supplier | undefined => {
  return suppliers.find(supplier => supplier.id === id);
};