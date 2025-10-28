import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';

interface ReviewFormProps {
  companyId: string;
  onReviewSubmitted?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ companyId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewerName || !rating) {
      showToast.error('נא למלא שם ודירוג');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showToast.error('יש להתחבר כדי להשאיר ביקורת');
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewed_id: companyId,
          rating,
          title: reviewerName,
          content: comment || null,
        });

      if (error) throw error;

      showToast.success('הביקורת נשלחה בהצלחה!');
      
      // Reset form
      setRating(0);
      setComment('');
      setReviewerName('');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast.error('אירעה שגיאה בשליחת הביקורת');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">השאר ביקורת</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>דירוג *</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="reviewerName">שם *</Label>
            <Input
              id="reviewerName"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="השם שלך"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="comment">הביקורת שלך (אופציונלי)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="ספר על החוויה שלך..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'שולח...' : 'שלח ביקורת'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
