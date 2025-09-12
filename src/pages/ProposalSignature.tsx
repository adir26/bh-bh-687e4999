import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, FileText, Calendar, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProposalPreview } from '@/components/proposal/ProposalPreview';
import { proposalsService } from '@/services/proposalsService';
import { useToast } from '@/hooks/use-toast';

const ProposalSignature: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureResult, setSignatureResult] = useState<{ action: string; success: boolean } | null>(null);

  // Fetch signature link and proposal data
  const { data: signatureData, isLoading, error } = useQuery({
    queryKey: ['signature-link', token],
    queryFn: () => proposalsService.getSignatureLinkByToken(token!),
    enabled: !!token,
    retry: false
  });

  const signProposalMutation = useMutation({
    mutationFn: (action: 'accept' | 'reject') =>
      proposalsService.signProposal(token!, action, clientInfo),
    onSuccess: (data) => {
      setSignatureResult({ action: data.action, success: true });
      toast({
        title: data.action === 'accept' ? "הצעה אושרה בהצלחה!" : "הצעה נדחתה",
        description: data.action === 'accept' ? 
          "תודה על האישור! אנו ניצור איתך קשר בהקדם." : 
          "תודה על המשוב שלך.",
        variant: data.action === 'accept' ? "default" : "destructive"
      });
    },
    onError: (error: any) => {
      toast({
        title: "שגיאה בחתימה על ההצעה",
        description: error.message,
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleAction = async (action: 'accept' | 'reject') => {
    if (!clientInfo.name.trim()) {
      toast({
        title: "שם מלא נדרש",
        description: "אנא הכנס את שמך המלא",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    signProposalMutation.mutate(action);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען הצעת מחיר...</p>
        </div>
      </div>
    );
  }

  if (error || !signatureData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">קישור לא תקין</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              הקישור שגוי, פג תוקף או כבר נוצל
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              חזור לעמוד הבית
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { signatureLink, proposal, quote } = signatureData;
  
  // Check if already signed
  if (signatureLink.acted_at) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">הצעה כבר נחתמה</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 ${
              signatureLink.action === 'accept' ? 'text-green-500' : 'text-red-500'
            }`}>
              {signatureLink.action === 'accept' ? <CheckCircle /> : <XCircle />}
            </div>
            <p className="text-muted-foreground mb-2">
              ההצעה {signatureLink.action === 'accept' ? 'אושרה' : 'נדחתה'} בתאריך{' '}
              {new Date(signatureLink.acted_at).toLocaleDateString('he-IL')}
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              חזור לעמוד הבית
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if expired
  if (new Date(signatureLink.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">קישור פג תוקף</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              תוקף הקישור פג. אנא פנה למספק השירות לקבלת קישור חדש
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              חזור לעמוד הבית
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success screen after signing
  if (signatureResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              {signatureResult.action === 'accept' ? 'תודה על האישור!' : 'תודה על המשוב'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 ${
              signatureResult.action === 'accept' ? 'text-green-500' : 'text-red-500'
            }`}>
              {signatureResult.action === 'accept' ? <CheckCircle /> : <XCircle />}
            </div>
            <p className="text-muted-foreground mb-4">
              {signatureResult.action === 'accept' ? 
                'הצעת המחיר אושרה בהצלחה. אנו ניצור איתך קשר בהקדם האפשרי להמשך התהליך.' :
                'הצעת המחיר נדחתה. תודה על הזמן שהשקעת בבדיקת ההצעה.'
              }
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              חזור לעמוד הבית
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert quote data to proposal preview format
  const proposalPreviewData = {
    quoteNumber: quote.quote_number,
    creationDate: quote.created_at,
    supplierInfo: {
      name: quote.supplier?.full_name || 'ספק',
      phone: '',
      email: quote.supplier?.email || '',
      logo: ''
    },
    clientInfo: {
      name: clientInfo.name,
      email: clientInfo.email,
      phone: ''
    },
    items: quote.items || [],
    discount: ((quote.discount_amount || 0) / (quote.subtotal || 1)) * 100,
    vat: ((quote.tax_amount || 0) / (quote.subtotal || 1)) * 100,
    notes: quote.notes || '',
    terms: quote.terms_conditions || '',
    template: 'modern' as const
  };

  const calculations = {
    subtotalAmount: quote.subtotal || 0,
    discountAmount: quote.discount_amount || 0,
    vatAmount: quote.tax_amount || 0,
    totalAmount: quote.total_amount || 0
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">חתימה על הצעת מחיר</h1>
          <p className="text-muted-foreground">
            אנא בדוק את פרטי ההצעה ואשר או דחה את ההצעה
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline">
              <Calendar className="w-4 h-4 ml-1" />
              תוקף עד: {new Date(signatureLink.expires_at).toLocaleDateString('he-IL')}
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Proposal Preview */}
          <div className="lg:col-span-2">
            <ProposalPreview 
              data={proposalPreviewData}
              calculations={calculations}
            />
          </div>

          {/* Signature Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  פרטיך
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">שם מלא *</Label>
                  <Input
                    id="name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="הכנס את שמך המלא"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">כתובת מייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>פעולות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    לאחר החתימה, לא ניתן יהיה לשנות את ההחלטה
                  </AlertDescription>
                </Alert>
                
                <Separator />
                
                <div className="space-y-3">
                  <Button
                    onClick={() => handleAction('accept')}
                    disabled={isSubmitting || !clientInfo.name.trim()}
                    className="w-full"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 ml-2" />
                    אשר הצעת מחיר
                  </Button>
                  
                  <Button
                    onClick={() => handleAction('reject')}
                    disabled={isSubmitting || !clientInfo.name.trim()}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <XCircle className="w-5 h-5 ml-2" />
                    דחה הצעת מחיר
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalSignature;