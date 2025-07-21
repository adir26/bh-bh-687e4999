import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronRight, Utensils, Zap, FileText, Lightbulb, Tag, Phone, MessageCircle, Mail } from 'lucide-react';
import OnboardingProgress from '@/components/OnboardingProgress';
import interestsImage from '@/assets/interests.jpg';

const interestTopics = [
  {
    id: 'interior-design',
    title: 'עיצוב פנים',
    description: 'רעיונות ועיצובים לבית',
    icon: Utensils,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'renovation',
    title: 'שיפוץ',
    description: 'שיפוץ ועיצוב חדר',
    icon: Zap,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'shading-solutions',
    title: 'פתרונות הצללה/תריסים',
    description: 'תריסים ופתרונות הצללה',
    icon: FileText,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    id: 'construction-extensions',
    title: 'הרחבות בנייה',
    description: 'הרחבות ובנייה חדשה',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 'electrical-plumbing',
    title: 'חשמל ואינסטלציה',
    description: 'חשמל ואינסטלציה',
    icon: Tag,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'design-inspiration',
    title: 'השראות לעיצוב',
    description: 'רעיונות ועיצובים',
    icon: Lightbulb,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'bathroom-renovation',
    title: 'חידוש חדרי רחצה',
    description: 'שיפוץ וחידוש חדרי רחצה',
    icon: Utensils,
    color: 'bg-teal-100 text-teal-600'
  }
];

const contactChannels = [
  { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
  { id: 'email', label: 'אימייל', icon: Mail },
  { id: 'phone', label: 'טלפון', icon: Phone }
];

const languages = [
  { id: 'hebrew', label: 'עברית' },
  { id: 'arabic', label: 'ערבית' },
  { id: 'english', label: 'English' }
];

export default function OnboardingInterests() {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['hebrew']);
  const [userNotes, setUserNotes] = useState('');

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const toggleLanguage = (languageId: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageId) 
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handleFinish = () => {
    const interestsData = {
      interests: selectedInterests,
      contactChannels: selectedChannels,
      languages: selectedLanguages,
      notes: userNotes
    };
    
    localStorage.setItem('userInterests', JSON.stringify(interestsData));
    navigate('/profile'); // Navigate to profile to see summary
  };

  const handleBack = () => {
    navigate('/onboarding/documents');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-border">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground text-xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          ×
        </button>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={5} totalSteps={5} />

      {/* Interests Image */}
      <div className="relative h-48 mx-6 mb-6 rounded-2xl overflow-hidden">
        <img 
          src={interestsImage}
          alt="תחומי עניין"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-32">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              נושאים מעניינים
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              בחרו את התחומים שמעניינים אתכם, כדי שנוכל להציע לכם הצעות מדויקות, תוכן רלוונטי והטבות מותאמות אישית.
            </p>
          </div>

          {/* Interest Topics */}
          <div className="mb-8">
            <h3 className="font-medium text-foreground mb-4">בחרו תחומים</h3>
            <div className="grid grid-cols-2 gap-3">
              {interestTopics.map((topic) => {
                const Icon = topic.icon;
                const isSelected = selectedInterests.includes(topic.id);
                
                return (
                  <Card 
                    key={topic.id}
                    className={`cursor-pointer transition-all rounded-xl ${
                      isSelected 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleInterest(topic.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 rounded-lg ${topic.color} mx-auto mb-3 flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                       <h4 className="font-medium text-sm text-foreground mb-1">{topic.title}</h4>
                       <p className="text-xs text-muted-foreground">{topic.description}</p>
                     </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="mb-8">
            <h3 className="font-medium text-foreground mb-4">אמצעי יצירת קשר מועדפים</h3>
            <div className="flex flex-wrap gap-2">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                
                return (
                  <button
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted/50 text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{channel.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Preferences */}
          <div className="mb-8">
            <h3 className="font-medium text-foreground mb-4">שפה מועדפת</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => {
                const isSelected = selectedLanguages.includes(language.id);
                
                return (
                  <button
                    key={language.id}
                    onClick={() => toggleLanguage(language.id)}
                    className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted/50 text-foreground hover:bg-muted'
                    }`}
                  >
                    {language.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Notes */}
          <div className="mb-8">
            <h3 className="font-medium text-foreground mb-4">הערות נוספות</h3>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="ספרו לנו מה חשוב לכם, איך אנחנו יכולים לעזור לכם..."
              className="w-full p-4 rounded-xl bg-muted/50 border border-muted text-foreground placeholder:text-muted-foreground resize-none h-24 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleFinish}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg rounded-xl h-14 font-medium"
          >
            סיום
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}