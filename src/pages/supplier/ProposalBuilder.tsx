import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, Eye, FileText, Palette, Send, Save } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProposalPreview } from '@/components/proposal/ProposalPreview';
import { quotesService } from '@/services/quotesService';
import { proposalsService } from '@/services/proposalsService';
import { useToast } from '@/hooks/use-toast';

interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ProposalData {
  quoteNumber: string;
  creationDate: string;
  supplierInfo: {
    name: string;
    phone: string;
    email: string;
    logo?: string;
  };
  clientInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: ProposalItem[];
  discount: number;
  vat: number;
  notes: string;
  terms: string;
  template: 'modern' | 'minimal' | 'classic';
}

const ProposalBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { proposalId } = useParams();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quoteId');
  const { toast } = useToast();
  
  const [showPreview, setShowPreview] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalData>({
    quoteNumber: `PRO-${Date.now().toString().slice(-6)}`,
    creationDate: new Date().toISOString().split('T')[0],
    supplierInfo: {
      name: 'Your Company Name',
      phone: '+972-50-123-4567',
      email: 'contact@yourcompany.com',
    },
    clientInfo: {
      name: '',
      email: '',
      phone: '',
    },
    items: [{
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    }],
    discount: 0,
    vat: 17,
    notes: '',
    terms: 'תנאי תשלום: 30 יום\nאחריות: 12 חודשים\nמועד אספקה: 7-14 ימי עסקים',
    template: 'modern',
  });

  // Fetch quote data if creating from quote
  const { data: quote } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quotesService.getQuoteById(quoteId!),
    enabled: !!quoteId && !proposalId
  });

  // Initialize proposal data from quote
  useEffect(() => {
    if (quote && quote.items) {
      const items = quote.items.map((item: any) => ({
        id: item.id,
        description: item.name || item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.subtotal
      }));

      setProposalData(prev => ({
        ...prev,
        quoteNumber: `Q-${quote.quote.id.slice(-6)}`,
        creationDate: quote.quote.created_at.split('T')[0],
        clientInfo: {
          name: '',
          email: '',
          phone: ''
        },
        items,
        discount: 0,
        vat: ((quote.quote.tax_amount / quote.quote.subtotal) * 100) || 17
      }));
    }
  }, [quote]);

  // Mutations for proposal operations
  const createProposalMutation = useMutation({
    mutationFn: (data: { quoteId: string; htmlContent: string }) =>
      proposalsService.createProposalFromQuote(data.quoteId, data.htmlContent),
    onSuccess: (proposal) => {
      toast({
        title: "הצעה נוצרה בהצלחה",
        description: "ההצעה נשמרה במערכת"
      });
      navigate(`/supplier/proposals/${proposal.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "שגיאה ביצירת הצעה",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const sendForSignatureMutation = useMutation({
    mutationFn: (proposalId: string) => proposalsService.sendForSignature(proposalId),
    onSuccess: (token) => {
      const signatureUrl = `${window.location.origin}/sign/${token}`;
      toast({
        title: "הצעה נשלחה לחתימה",
        description: "קישור החתימה נוצר בהצלחה"
      });
      navigator.clipboard.writeText(signatureUrl);
    },
    onError: (error: any) => {
      toast({
        title: "שגיאה בשליחה לחתימה",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSaveProposal = useCallback(() => {
    if (quoteId) {
      const htmlContent = JSON.stringify(proposalData);
      createProposalMutation.mutate({ quoteId, htmlContent });
    }
  }, [proposalData, quoteId]);

  const handleSendForSignature = useCallback(() => {
    if (!proposalId) {
      toast({
        title: "יש לשמור את הצעת המחיר תחילה",
        description: "נא לשמור את ההצעה לפני שליחה לחתימה",
        variant: "destructive"
      });
      return;
    }
    sendForSignatureMutation.mutate(proposalId);
  }, [proposalId]);

  // Calculations
  const subtotalAmount = proposalData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotalAmount * proposalData.discount) / 100;
  const taxableAmount = subtotalAmount - discountAmount;
  const vatAmount = (taxableAmount * proposalData.vat) / 100;
  const totalAmount = taxableAmount + vatAmount;

  const calculations = { subtotalAmount, discountAmount, vatAmount, totalAmount };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">יצירת הצעת מחיר</h1>
                <p className="text-sm text-muted-foreground">מס' הצעה: {proposalData.quoteNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowPreview(!showPreview)} variant="outline" size="sm">
                <Eye className="w-4 h-4 ml-2" />
                {showPreview ? 'עריכה' : 'תצוגה מקדימה'}
              </Button>
              <Button 
                onClick={handleSaveProposal} 
                variant="outline" 
                size="sm"
                disabled={createProposalMutation.isPending}
              >
                <Save className="w-4 h-4 ml-2" />
                שמור הצעה
              </Button>
              {proposalId && (
                <Button 
                  onClick={handleSendForSignature} 
                  size="sm"
                  disabled={sendForSignatureMutation.isPending}
                >
                  <Send className="w-4 h-4 ml-2" />
                  שלח לחתימה
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {showPreview ? (
          <ProposalPreview data={proposalData} calculations={calculations} />
        ) : (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">בונה הצעות מחיר</h2>
            <p className="text-muted-foreground">הכלי להכנת הצעות מחיר מקצועיות עם חתימה דיגיטלית</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalBuilder;