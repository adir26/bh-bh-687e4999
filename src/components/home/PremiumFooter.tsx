import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  services: {
    title: 'שירותים',
    links: [
      { label: 'חיפוש ספקים', href: '/categories' },
      { label: 'ספקים מובילים', href: '/top-suppliers' },
      { label: 'מבצעים', href: '/local-deals' },
      { label: 'השראה', href: '/inspiration' },
    ]
  },
  support: {
    title: 'תמיכה',
    links: [
      { label: 'מרכז עזרה', href: '/support' },
      { label: 'שאלות נפוצות', href: '/faq' },
      { label: 'צור קשר', href: '/support' },
      { label: 'דווח על בעיה', href: '/support' },
    ]
  },
  company: {
    title: 'החברה',
    links: [
      { label: 'אודות', href: '/about' },
      { label: 'קריירה', href: '/careers' },
      { label: 'בלוג', href: '/blog' },
      { label: 'לספקים', href: '/for-suppliers' },
    ]
  },
  legal: {
    title: 'מדיניות',
    links: [
      { label: 'תנאי שימוש', href: '/terms' },
      { label: 'מדיניות פרטיות', href: '/privacy-policy' },
      { label: 'הצהרת נגישות', href: '/accessibility' },
      { label: 'מדיניות cookies', href: '/cookies' },
    ]
  }
};

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export const PremiumFooter: React.FC = () => {
  return (
    <footer className="w-full bg-foreground text-white" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6">
              <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                בונים-פה
              </span>
            </div>
            <p className="text-white/70 text-caption mb-6">
              הפלטפורמה המובילה בישראל לחיבור בין בעלי בתים לספקי בנייה ועיצוב מקצועיים.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/70 text-caption">
                <Mail className="w-4 h-4" />
                <span>info@bonim-po.co.il</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-caption">
                <Phone className="w-4 h-4" />
                <span>03-1234567</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-caption">
                <MapPin className="w-4 h-4" />
                <span>תל אביב, ישראל</span>
              </div>
            </div>
          </div>
          
          {/* Footer Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-label font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-white/70 text-caption hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-white/50 text-caption text-center md:text-right">
              © {new Date().getFullYear()} בונים-פה. כל הזכויות שמורות.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Safe area padding for mobile */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </footer>
  );
};
