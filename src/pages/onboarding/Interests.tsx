import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronRight, Utensils, Zap, FileText, Lightbulb, Tag, Phone, MessageCircle, Mail } from 'lucide-react';

const interestTopics = [
  {
    id: 'kitchen',
    title: 'השראות למטבח',
    description: 'רעיונות ועיצובים למטבח',
    icon: Utensils,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'smart-home',
    title: 'מערכות בית חכם',
    description: 'טכנולוגיות ופתרונות חכמים',
    icon: Zap,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'legal',
    title: 'מסמכים משפטיים',
    description: 'מידע משפטי וחוזים',
    icon: FileText,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    id: 'tips',
    title: 'טיפים לקונים',
    description: 'מדריכים ועצות מעשיות',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 'promotions',
    title: 'מבצעים והנחות',
    description: 'הצעות מיוחדות ומבצעים',
    icon: Tag,
    color: 'bg-green-100 text-green-600'
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
      languages: selectedLanguages
    };
    
    localStorage.setItem('userInterests', JSON.stringify(interestsData));
    navigate('/'); // Navigate to main app
  };

  const handleBack = () => {
    navigate('/onboarding/documents');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-500">שלב 5</div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              מה מעניין אותכם הכי הרבה?
            </h1>
            <p className="text-gray-600">
              בחרו נושאים שמעניינים אתכם כדי לקבל תוכן מותאם
            </p>
          </div>

          {/* Interest Topics */}
          <div className="mb-8">
            <h3 className="font-medium text-gray-900 mb-4">נושאים מעניינים</h3>
            <div className="grid grid-cols-2 gap-3">
              {interestTopics.map((topic) => {
                const Icon = topic.icon;
                const isSelected = selectedInterests.includes(topic.id);
                
                return (
                  <Card 
                    key={topic.id}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleInterest(topic.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 rounded-lg ${topic.color} mx-auto mb-3 flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">{topic.title}</h4>
                      <p className="text-xs text-gray-500">{topic.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="mb-8">
            <h3 className="font-medium text-gray-900 mb-4">אמצעי יצירת קשר מועדפים</h3>
            <div className="flex flex-wrap gap-2">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                
                return (
                  <button
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <h3 className="font-medium text-gray-900 mb-4">שפה מועדפת</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => {
                const isSelected = selectedLanguages.includes(language.id);
                
                return (
                  <button
                    key={language.id}
                    onClick={() => toggleLanguage(language.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Finish Button */}
          <Button 
            onClick={handleFinish}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
          >
            סיום
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center pb-6">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
        </div>
      </div>
    </div>
  );
}