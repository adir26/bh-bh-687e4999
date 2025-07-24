import { suppliers } from './suppliers';

export interface SearchableItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: 'category' | 'supplier' | 'service';
  category?: string;
  location?: string;
  rating?: number;
  keywords: string[];
  route?: string;
}

// Kitchen categories with local images
import kitchenDesignImg from '@/assets/kitchen-design.jpg';
import kitchenAccessoriesImg from '@/assets/kitchen-accessories.jpg';
import kitchenModernImg from '@/assets/kitchen-modern.jpg';
import kitchenHardwareImg from '@/assets/kitchen-hardware.jpg';
import kitchenInstallationImg from '@/assets/kitchen-installation.jpg';
import furnitureImg from '@/assets/furniture.jpg';
import airConditioningImg from '@/assets/air-conditioning.jpg';
import renovationImg from '@/assets/renovation.jpg';

export const searchableCategories: SearchableItem[] = [
  {
    id: 'kitchens-design',
    title: 'מטבחים מעוצבים',
    subtitle: 'מטבחים',
    image: kitchenModernImg,
    type: 'category',
    category: 'kitchens',
    keywords: ['מטבח', 'מטבחים', 'עיצוב', 'מעוצב', 'מעוצבים', 'מודרני', 'יוקרה'],
    route: '/category/kitchens'
  },
  {
    id: 'kitchens-hardware',
    title: 'אבזור למטבח',
    subtitle: 'מטבחים',
    image: kitchenHardwareImg,
    type: 'category',
    category: 'kitchens',
    keywords: ['אבזור', 'אביזרים', 'מטבח', 'ברזים', 'כיור', 'ידיות', 'צירים'],
    route: '/category/kitchens'
  },
  {
    id: 'kitchens-installation',
    title: 'התקנת מטבחים',
    subtitle: 'מטבחים',
    image: kitchenInstallationImg,
    type: 'category',
    category: 'kitchens',
    keywords: ['התקנה', 'התקנת', 'מטבח', 'מטבחים', 'עבודות', 'מקצועי'],
    route: '/category/kitchens'
  },
  {
    id: 'kitchens-planning',
    title: 'עיצוב מטבחים',
    subtitle: 'מטבחים',
    image: kitchenDesignImg,
    type: 'category',
    category: 'kitchens',
    keywords: ['עיצוב', 'תכנון', 'מטבח', 'מטבחים', 'מעצב', 'אדריכל'],
    route: '/category/kitchens'
  },
  {
    id: 'kitchens-accessories',
    title: 'אביזרי מטבח',
    subtitle: 'מטבחים',
    image: kitchenAccessoriesImg,
    type: 'category',
    category: 'kitchens',
    keywords: ['אביזרים', 'כלים', 'מטבח', 'אביזרי', 'מקרר', 'תנור', 'גז'],
    route: '/category/kitchens'
  },
  {
    id: 'furniture',
    title: 'ריהוט מודרני',
    subtitle: 'ריהוט',
    image: furnitureImg,
    type: 'category',
    category: 'furniture',
    keywords: ['ריהוט', 'רהיטים', 'מודרני', 'עיצוב', 'כורסא', 'ספה', 'שולחן'],
    route: '/category/furniture'
  },
  {
    id: 'air-conditioning',
    title: 'מיזוג אוויר',
    subtitle: 'מיזוג',
    image: airConditioningImg,
    type: 'category',
    category: 'air-conditioning',
    keywords: ['מיזוג', 'אוויר', 'מזגן', 'מזגנים', 'קירור', 'חימום', 'אקלים'],
    route: '/category/air-conditioning'
  },
  {
    id: 'renovation',
    title: 'שיפוצי בתים',
    subtitle: 'שיפוצים',
    image: renovationImg,
    type: 'category',
    category: 'renovation',
    keywords: ['שיפוץ', 'שיפוצים', 'בית', 'בתים', 'דירה', 'דירות', 'עבודות'],
    route: '/category/renovation'
  }
];

export const searchableSuppliers: SearchableItem[] = suppliers.map(supplier => ({
  id: supplier.id,
  title: supplier.name,
  subtitle: supplier.tagline,
  image: supplier.logo,
  type: 'supplier',
  category: supplier.category,
  location: supplier.location,
  rating: supplier.rating,
  keywords: [
    supplier.name,
    supplier.tagline,
    supplier.category,
    supplier.location,
    ...supplier.services,
    ...supplier.description.split(' ').filter(word => word.length > 2)
  ],
  route: `/supplier/${supplier.id}`
}));

export const searchableServices: SearchableItem[] = [
  {
    id: 'kitchen-design-service',
    title: 'שירותי עיצוב מטבחים',
    subtitle: 'שירות',
    image: kitchenDesignImg,
    type: 'service',
    category: 'kitchens',
    keywords: ['שירות', 'שירותי', 'עיצוב', 'מטבח', 'מטבחים', 'ייעוץ', 'תכנון'],
    route: '/category/kitchens'
  },
  {
    id: 'furniture-assembly-service',
    title: 'הרכבת רהיטים',
    subtitle: 'שירות',
    image: furnitureImg,
    type: 'service',
    category: 'furniture',
    keywords: ['הרכבה', 'הרכבת', 'רהיטים', 'ריהוט', 'שירות', 'מקצועי'],
    route: '/category/furniture'
  },
  {
    id: 'ac-maintenance-service',
    title: 'תחזוקת מזגנים',
    subtitle: 'שירות',
    image: airConditioningImg,
    type: 'service',
    category: 'air-conditioning',
    keywords: ['תחזוקה', 'תחזוקת', 'מזגן', 'מזגנים', 'מיזוג', 'שירות', 'טיפול'],
    route: '/category/air-conditioning'
  }
];

export const allSearchableItems: SearchableItem[] = [
  ...searchableCategories,
  ...searchableSuppliers,
  ...searchableServices
];

export function searchItems(query: string, filters?: {
  type?: 'category' | 'supplier' | 'service';
  category?: string;
  location?: string;
  minRating?: number;
}): SearchableItem[] {
  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase().trim();
  
  let filteredItems = allSearchableItems;

  // Apply filters
  if (filters?.type) {
    filteredItems = filteredItems.filter(item => item.type === filters.type);
  }
  if (filters?.category) {
    filteredItems = filteredItems.filter(item => item.category === filters.category);
  }
  if (filters?.location) {
    filteredItems = filteredItems.filter(item => 
      item.location?.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  if (filters?.minRating) {
    filteredItems = filteredItems.filter(item => 
      item.rating ? item.rating >= filters.minRating! : true
    );
  }

  // Search in keywords, title, and subtitle
  const results = filteredItems.filter(item => {
    const searchableText = [
      item.title.toLowerCase(),
      item.subtitle.toLowerCase(),
      item.location?.toLowerCase() || '',
      ...item.keywords.map(k => k.toLowerCase())
    ].join(' ');

    return searchableText.includes(normalizedQuery);
  });

  // Sort by relevance
  return results.sort((a, b) => {
    const aTitle = a.title.toLowerCase().includes(normalizedQuery) ? 2 : 0;
    const bTitle = b.title.toLowerCase().includes(normalizedQuery) ? 2 : 0;
    const aSubtitle = a.subtitle.toLowerCase().includes(normalizedQuery) ? 1 : 0;
    const bSubtitle = b.subtitle.toLowerCase().includes(normalizedQuery) ? 1 : 0;
    
    const aScore = aTitle + aSubtitle + (a.rating || 0);
    const bScore = bTitle + bSubtitle + (b.rating || 0);
    
    return bScore - aScore;
  });
}

export function getPopularSearches(): string[] {
  return [
    'מטבחים בתל אביב',
    'שיפוצי דירות',
    'מיזוג אוויר',
    'יועץ משכנתאות',
    'ריהוט מודרני',
    'עיצוב פנים',
    'התקנת מטבחים',
    'אבזור למטבח'
  ];
}