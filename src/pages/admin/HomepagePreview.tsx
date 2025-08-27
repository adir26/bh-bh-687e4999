import React from 'react';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { HomepageTelemetry } from '@/components/HomepageTelemetry';
import { HeroSection } from '@/components/HeroSection';
import { CategorySection } from '@/components/CategorySection';
import { SupplierSection } from '@/components/SupplierSection';
import { SectionTitle } from '@/components/SectionTitle';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Platform } from '@/types/homepage';

interface HomepagePreviewProps {
  platform?: Platform;
}

export function HomepagePreview({ platform = 'web' }: HomepagePreviewProps) {
  const navigate = useNavigate();
  const { data: sections = [], isLoading } = useHomepageContent(platform);

  const renderSection = (section: any) => {
    const { section: sectionData, items } = section;

    switch (sectionData.type) {
      case 'banner':
        if (items.length === 0) return null;
        const bannerItem = items[0];
        return (
          <HomepageTelemetry
            key={sectionData.id}
            itemId={bannerItem.id}
            itemType="banner"
            onItemClick={() => handleItemClick(bannerItem)}
          >
            <HeroSection 
              onCTAClick={() => handleItemClick(bannerItem)}
            />
          </HomepageTelemetry>
        );

      case 'category_carousel':
        if (items.length === 0) return null;
        return (
          <div key={sectionData.id} className="w-full">
            <SectionTitle title={sectionData.title || 'קטגוריות'} />
            <CategorySection
              items={items.map(item => ({
                id: item.id,
                title: item.title || '',
                subtitle: item.subtitle || '',
                image: item.image_url || ''
              }))}
              onItemClick={(item) => {
                const originalItem = items.find(i => i.id === item.id);
                if (originalItem) handleItemClick(originalItem);
              }}
            />
          </div>
        );

      case 'supplier_cards':
        if (items.length === 0) return null;
        return (
          <div key={sectionData.id} className="w-full">
            <SectionTitle title={sectionData.title || 'ספקים'} />
            <SupplierSection
              suppliers={items.map(item => ({
                id: item.id,
                name: item.title || '',
                tagline: item.subtitle || '',
                logo: item.image_url || ''
              }))}
              onSupplierClick={(supplier) => {
                const originalItem = items.find(i => i.id === supplier.id);
                if (originalItem) handleItemClick(originalItem);
              }}
            />
          </div>
        );

      case 'tabs':
        // Custom tabs implementation would go here
        return (
          <div key={sectionData.id} className="w-full p-4 bg-muted/20 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{sectionData.title || 'טאבים'}</h3>
            <div className="grid grid-cols-2 gap-2">
              {items.map(item => (
                <HomepageTelemetry
                  key={item.id}
                  itemId={item.id}
                  itemType="tab"
                  onItemClick={() => handleItemClick(item)}
                >
                  <div className="p-3 bg-background rounded border hover:shadow-md cursor-pointer">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.title || ''} 
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                    )}
                    <div className="text-sm font-medium">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                    )}
                  </div>
                </HomepageTelemetry>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div key={sectionData.id} className="w-full p-4 border rounded-lg">
            <h3 className="font-medium">קטע לא מוכר: {sectionData.type}</h3>
            <p className="text-sm text-muted-foreground">
              {items.length} פריטים
            </p>
          </div>
        );
    }
  };

  const handleItemClick = (item: any) => {
    // Get navigation target based on link type
    let target: string | null = null;

    switch (item.link_type) {
      case 'url':
        target = item.link_url;
        break;
      case 'category':
        target = `/category/${item.link_target_id}/suppliers`;
        break;
      case 'supplier':
        target = `/supplier/${item.link_target_id}`;
        break;
      case 'screen':
        target = item.link_target_id;
        break;
    }

    if (target) {
      if (target.startsWith('http')) {
        window.open(target, '_blank');
      } else {
        navigate(target);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">טוען תצוגה מקדימה...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">תצוגה מקדימה</h2>
          <p className="text-sm text-blue-700">
            זהו תצוגה מקדימה של עמוד הבית עם התוכן הנוכחי
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/homepage-content')}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לעריכה
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">אין תוכן פורסם להצגה</p>
          <p className="text-sm">עבור לעמוד הניהול כדי לפרסם קטעי תוכן</p>
        </div>
      ) : (
        <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-background">
          <main className="flex flex-col items-start w-full bg-muted/30 pb-nav-safe">
            <div className="flex flex-col items-start w-full space-y-4">
              {sections.map(renderSection)}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}