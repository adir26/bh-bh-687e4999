import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { PageHeader } from "@/components/ui/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    {
      category: "שימוש באפליקציה",
      items: [
        {
          question: "איך אני מוצא ספק?",
          answer: "ניתן למצוא ספקים על ידי דפדוף בקטגוריות בעמוד הבית, שימוש בפונקציית החיפוש, או בדיקת הקטגוריות 'ספקים מובילים' ו'ספקים חדשים'."
        },
        {
          question: "איך אני מבצע הזמנה?",
          answer: "לאחר שמוצאים ספק, ניתן לבקר בפרופיל שלו, לעיין בשירותים ולחץ על 'צור קשר' או 'קבל הצעת מחיר' כדי להתחיל בתהליך ההזמנה."
        },
        {
          question: "האם ניתן לשמור ספקים במועדפים?",
          answer: "כן! לחץ על הלב בכל כרטיס ספק כדי להוסיף אותו למועדפים. ניתן לגשת למועדפים דרך הניווט התחתון."
        }
      ]
    },
    {
      category: "תשלומים",
      items: [
        {
          question: "מתי ואיך מעובד התשלום?",
          answer: "התשלום מעובד בדרך כלל לאחר אישור הצעת המחיר ולפני תחילת העבודה. אנו תומכים בכרטיסי אשראי, העברות בנקאיות ושיטות תשלום מקומיות נוספות."
        },
        {
          question: "האם ניתן לשלם ישירות לספק?",
          answer: "למען הבטיחות ופתרון מחלוקות, אנו ממליצים להשתמש במערכת התשלומים של הפלטפורמה. תשלומים ישירים לספקים אפשריים אך אינם מכוסים על ידי מדיניות ההגנה שלנו."
        },
        {
          question: "מה אם אני לא מרוצה מהעבודה?",
          answer: "יש לנו מערכת לפתרון מחלוקות. צרו קשר עם התמיכה תוך 7 ימים מסיום העבודה, ואנחנו נעזור לתווך בינכם לבין הספק."
        }
      ]
    },
    {
      category: "הצעות מחיר",
      items: [
        {
          question: "איך שולחים הצעת מחיר ללקוח? (ספקים)",
          answer: "כאשר לקוח יוצר איתך קשר, עבור ללוח הבקרה, מצא את הפנייה ולחץ על 'שלח הצעת מחיר'. מלא את הפרטים כולל מחיר, לוח זמנים והיקף העבודה."
        },
        {
          question: "איך ניתן להשוות הצעות מחיר?",
          answer: "תקבלו הצעות מחיר בקטגוריית 'הזמנות'. ניתן להשוות מחירים, לוחות זמנים, דירוגי ספקים ושירותים כלולים זה לצד זה."
        },
        {
          question: "כמה זמן הצעות מחיר תקפות?",
          answer: "רוב הצעות המחיר תקפות למשך 30 יום אלא אם צוין אחרת על ידי הספק. בדקו את פרטי הצעת המחיר לתאריך התפוגה המדויק."
        }
      ]
    },
    {
      category: "תמיכה",
      items: [
        {
          question: "איך פותחים פנייה לתמיכה?",
          answer: "עברו לקטגוריית התמיכה מהתפריט הראשי או ההגדרות. ניתן להתחיל צ'אט חי, לשלוח טופס או להתקשר לקו התמיכה שלנו."
        },
        {
          question: "מה קורה במקרה של מחלוקת?",
          answer: "צוות הגישור שלנו יבחן את המקרה, יתקשר עם שני הצדדים ויפעל לקראת פתרון הוגן. זה עשוי לכלול החזרים חלקיים או ערבויות השלמה."
        },
        {
          question: "כמה מהר התמיכה מגיבה?",
          answer: "אנו שואפים להגיב לכל הפניות תוך שעתיים בשעות העבודה (8:00 - 18:00). בעיות דחופות מקבלות עדיפות."
        }
      ]
    },
    {
      category: "הגדרות חשבון",
      items: [
        {
          question: "איך מעדכנים את האימייל?",
          answer: "עברו להגדרות > פרטי החשבון ועדכנו את כתובת האימייל. תצטרכו לאמת את האימייל החדש לפני שהשינוי ייכנס לתוקף."
        },
        {
          question: "איך מוחקים את החשבון?",
          answer: "צרו קשר עם התמיכה כדי לבקש מחיקת חשבון. שימו לב שפעולה זו בלתי הפיכה ותסיר את כל הנתונים, ההזמנות והביקורות שלכם."
        },
        {
          question: "האם ניתן לשנות את סוג החשבון מלקוח לספק?",
          answer: "כן, צרו קשר עם התמיכה ואנחנו נוכל לעזור להמיר את החשבון. תצטרכו לספק מסמכי אימות עסקיים נוספים."
        }
      ]
    }
  ];

  const filteredFaq = faqData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PageHeader 
        title="שאלות נפוצות" 
        variant="minimal"
      />

      {/* Content */}
      <div className="p-4 pb-nav-safe">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchInput
            placeholder="חיפוש בשאלות נפוצות..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-lg font-semibold mb-3 text-primary">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem
                      key={itemIndex}
                      value={`${categoryIndex}-${itemIndex}`}
                      className="border border-border rounded-lg mb-2"
                    >
                      <AccordionTrigger className="px-4 py-3 text-right hover:no-underline">
                        <span className="font-medium">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-muted-foreground text-right">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">לא נמצאו שאלות נפוצות התואמות את החיפוש.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                נקה חיפוש
              </Button>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-3">
            לא מוצאים את מה שאתם מחפשים?
          </p>
          <Button
            onClick={() => navigate('/support')}
            variant="outline"
          >
            צור קשר עם התמיכה
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;