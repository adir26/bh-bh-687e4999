import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Building2, MapPin, Phone, Mail, Star, TrendingUp } from 'lucide-react';
import { EnhancedProfile } from '@/types/admin';

interface UserDetailModalProps {
  user: EnhancedProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  open,
  onOpenChange
}) => {
  if (!user) return null;

  const formatDate = (date: string | null) => {
    if (!date) return 'לא זמין';
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'לא זמין';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} דקות`;
    const hours = Math.round(minutes / 60);
    return `${hours} שעות`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'supplier':
        return <Badge className="bg-blue-100 text-blue-800">ספק</Badge>;
      case 'client':
        return <Badge variant="outline">לקוח</Badge>;
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">מנהל</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getOnboardingBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">הושלם</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-orange-200 text-orange-800">בתהליך</Badge>;
      case 'not_started':
        return <Badge variant="outline" className="border-gray-200 text-gray-600">לא החל</Badge>;
      default:
        return <Badge variant="outline">לא ידוע</Badge>;
    }
  };

  const renderOnboardingData = (data: any) => {
    if (!data || Object.keys(data).length === 0) {
      return <p className="text-muted-foreground text-sm">אין נתונים זמינים</p>;
    }

    return (
      <div className="space-y-4">
        {/* Client Onboarding Data */}
        {data.interests && (
          <div>
            <h4 className="font-medium mb-2 text-right">תחומי עניין:</h4>
            <div className="flex flex-wrap gap-2">
              {data.interests.map((interest: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.contact_channels && (
          <div>
            <h4 className="font-medium mb-2 text-right">ערוצי קשר מועדפים:</h4>
            <div className="flex flex-wrap gap-2">
              {data.contact_channels.map((channel: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.home_details && (
          <div>
            <h4 className="font-medium mb-2 text-right">פרטי הבית:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {data.home_details.homeType && (
                <div className="text-right">
                  <span className="text-muted-foreground">סוג בית:</span>
                  <p className="font-medium">{data.home_details.homeType}</p>
                </div>
              )}
              {data.home_details.homeSize && (
                <div className="text-right">
                  <span className="text-muted-foreground">גודל:</span>
                  <p className="font-medium">{data.home_details.homeSize}</p>
                </div>
              )}
              {data.home_details.rooms && (
                <div className="text-right">
                  <span className="text-muted-foreground">מספר חדרים:</span>
                  <p className="font-medium">{data.home_details.rooms}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {data.project_planning && (
          <div>
            <h4 className="font-medium mb-2 text-right">תכנון פרויקט:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {data.project_planning.budget && (
                <div className="text-right">
                  <span className="text-muted-foreground">תקציב:</span>
                  <p className="font-medium">{data.project_planning.budget}</p>
                </div>
              )}
              {data.project_planning.timeline && (
                <div className="text-right">
                  <span className="text-muted-foreground">לוח זמנים:</span>
                  <p className="font-medium">{data.project_planning.timeline}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Supplier Onboarding Data */}
        {data.company_info && (
          <div>
            <h4 className="font-medium mb-2 text-right">פרטי חברה:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {data.company_info.companyName && (
                <div className="text-right">
                  <span className="text-muted-foreground">שם החברה:</span>
                  <p className="font-medium">{data.company_info.companyName}</p>
                </div>
              )}
              {data.company_info.category && (
                <div className="text-right">
                  <span className="text-muted-foreground">קטגוריה:</span>
                  <p className="font-medium">{data.company_info.category}</p>
                </div>
              )}
              {data.company_info.operatingArea && (
                <div className="text-right">
                  <span className="text-muted-foreground">אזור פעילות:</span>
                  <p className="font-medium">{data.company_info.operatingArea}</p>
                </div>
              )}
              {data.company_info.phone && (
                <div className="text-right">
                  <span className="text-muted-foreground">טלפון:</span>
                  <p className="font-medium">{data.company_info.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {data.branding && (
          <div>
            <h4 className="font-medium mb-2 text-right">מיתוג:</h4>
            {data.branding.description && (
              <div className="text-right">
                <span className="text-muted-foreground">תיאור:</span>
                <p className="text-sm mt-1">{data.branding.description}</p>
              </div>
            )}
          </div>
        )}

        {data.products && data.products.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-right">מוצרים ({data.products.length}):</h4>
            <div className="space-y-2">
              {data.products.slice(0, 3).map((product: any, index: number) => (
                <div key={index} className="bg-muted p-2 rounded text-sm text-right">
                  <div className="font-medium">{product.name}</div>
                  {product.price && (
                    <div className="text-muted-foreground">₪{product.price}</div>
                  )}
                </div>
              ))}
              {data.products.length > 3 && (
                <p className="text-sm text-muted-foreground text-right">
                  ועוד {data.products.length - 3} מוצרים...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Completion Info */}
        {data.completed_at && (
          <div className="pt-4 border-t">
            <div className="text-right">
              <span className="text-muted-foreground">הושלם ב:</span>
              <p className="text-sm font-medium">{formatDate(data.completed_at)}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-hebrew" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <User className="h-5 w-5" />
            פרטי משתמש - {user.full_name || 'משתמש'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <User className="h-4 w-4" />
                מידע בסיסי
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">שם מלא</div>
                  <div className="font-medium">{user.full_name || 'לא צוין'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">אימייל</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">תפקיד</div>
                  <div>{getRoleBadge(user.role)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">סטטוס</div>
                  <div>
                    {user.is_blocked ? (
                      <Badge variant="destructive">חסום</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">פעיל</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    תאריך הצטרפות
                  </div>
                  <div className="font-medium text-sm">{formatDate(user.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    התחברות ראשונה
                  </div>
                  <div className="font-medium text-sm">{formatDate(user.first_login_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    פעילות אחרונה
                  </div>
                  <div className="font-medium text-sm">{formatDate(user.last_login_at || user.updated_at)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Star className="h-4 w-4" />
                סטטוס רישום
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">סטטוס נוכחי</div>
                  <div>{getOnboardingBadge(user.onboarding_status || 'not_started')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">צעד נוכחי</div>
                  <div className="font-medium">{user.onboarding_step || 0}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">גרסת רישום</div>
                  <div className="font-medium">{user.onboarding_version || 1}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">הושלם ב</div>
                  <div className="font-medium">{formatDate(user.onboarding_completed_at)}</div>
                </div>
              </div>

              {user.onboarding_completion_time && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">זמן השלמה</div>
                  <div className="font-medium">{formatDuration(user.onboarding_completion_time)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Onboarding Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                נתוני רישום
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderOnboardingData(user.onboarding_data)}
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                נתונים סטטיסטיים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.orders_count || 0}</div>
                  <div className="text-sm text-muted-foreground">הזמנות</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{user.complaints_count || 0}</div>
                  <div className="text-sm text-muted-foreground">תלונות</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {user.total_spent ? `₪${user.total_spent.toLocaleString()}` : '₪0'}
                  </div>
                  <div className="text-sm text-muted-foreground">סה"כ הוצאות</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};