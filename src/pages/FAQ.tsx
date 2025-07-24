import React, { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    {
      category: "Using the App",
      items: [
        {
          question: "How do I find a supplier?",
          answer: "You can find suppliers by browsing categories on the home page, using the search function, or checking the 'Top Suppliers' and 'New Suppliers' sections."
        },
        {
          question: "How do I place an order?",
          answer: "Once you find a supplier, visit their profile, browse their services, and click 'Contact' or 'Get Quote' to start the ordering process."
        },
        {
          question: "Can I save suppliers to favorites?",
          answer: "Yes! Click the heart icon on any supplier card to add them to your favorites. You can access your favorites from the bottom navigation."
        }
      ]
    },
    {
      category: "Payments",
      items: [
        {
          question: "When and how is payment processed?",
          answer: "Payment is typically processed after you approve a quote and before work begins. We support credit cards, bank transfers, and other local payment methods."
        },
        {
          question: "Can I pay directly to the supplier?",
          answer: "For security and dispute resolution, we recommend using our platform's payment system. Direct payments to suppliers are possible but not covered by our protection policies."
        },
        {
          question: "What if I'm not satisfied with the work?",
          answer: "We have a dispute resolution system. Contact support within 7 days of completion, and we'll help mediate between you and the supplier."
        }
      ]
    },
    {
      category: "Quotes",
      items: [
        {
          question: "How do I send a quote to a client? (Suppliers)",
          answer: "When a client contacts you, go to your dashboard, find the inquiry, and click 'Send Quote'. Fill in the details including price, timeline, and scope of work."
        },
        {
          question: "How can I compare quotes?",
          answer: "You'll receive quotes in your 'Orders' section. You can compare prices, timelines, supplier ratings, and included services side by side."
        },
        {
          question: "How long are quotes valid?",
          answer: "Most quotes are valid for 30 days unless specified otherwise by the supplier. Check the quote details for the exact expiration date."
        }
      ]
    },
    {
      category: "Support",
      items: [
        {
          question: "How to open a support ticket?",
          answer: "Go to the Support section from the main menu or settings. You can start a live chat, submit a form, or call our support hotline."
        },
        {
          question: "What happens in case of a dispute?",
          answer: "Our mediation team will review the case, communicate with both parties, and work towards a fair resolution. This may include partial refunds or completion guarantees."
        },
        {
          question: "How quickly does support respond?",
          answer: "We aim to respond to all inquiries within 2 hours during business hours (8 AM - 6 PM). Urgent issues are prioritized."
        }
      ]
    },
    {
      category: "Account Settings",
      items: [
        {
          question: "How to update my email?",
          answer: "Go to Settings > Account Information and update your email address. You'll need to verify the new email before the change takes effect."
        },
        {
          question: "How to delete my account?",
          answer: "Contact support to request account deletion. Please note that this action is irreversible and will remove all your data, orders, and reviews."
        },
        {
          question: "Can I change my account type from client to supplier?",
          answer: "Yes, contact support and we can help convert your account. You'll need to provide additional business verification documents."
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Frequently Asked Questions</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
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
                      <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                        <span className="font-medium">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No FAQs found matching your search.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Can't find what you're looking for?
          </p>
          <Button
            onClick={() => navigate('/support')}
            variant="outline"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;