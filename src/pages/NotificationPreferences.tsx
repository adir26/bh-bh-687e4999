import React, { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface NotificationSettings {
  [key: string]: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
}

const NotificationPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSupplier = location.pathname.startsWith('/supplier/');

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newLead: { inApp: true, email: true, sms: false },
    orderStatus: { inApp: true, email: true, sms: true },
    newReview: { inApp: true, email: false, sms: false },
    quoteResponse: { inApp: true, email: true, sms: false },
    supportMessages: { inApp: true, email: true, sms: false },
    promotions: { inApp: false, email: false, sms: false },
  });

  const notificationTypes = [
    {
      key: "newLead",
      title: "New Lead",
      description: "When a client contacts you for a quote",
      supplierOnly: true
    },
    {
      key: "orderStatus",
      title: "Order Status Updates",
      description: "When your order status changes",
      supplierOnly: false
    },
    {
      key: "newReview",
      title: "New Reviews",
      description: "When someone leaves a review",
      supplierOnly: false
    },
    {
      key: "quoteResponse",
      title: "Quote Responses",
      description: "When quotes are accepted or rejected",
      supplierOnly: false
    },
    {
      key: "supportMessages",
      title: "Support Messages",
      description: "Messages from customer support",
      supplierOnly: false
    },
    {
      key: "promotions",
      title: "Promotions & Updates",
      description: "Marketing emails and app updates",
      supplierOnly: false
    }
  ];

  const channels = [
    { key: "inApp", label: "In-App", icon: "🔔" },
    { key: "email", label: "Email", icon: "📧" },
    { key: "sms", label: "SMS", icon: "📱" }
  ];

  const filteredNotificationTypes = notificationTypes.filter(type => 
    !type.supplierOnly || isSupplier
  );

  const handleToggle = (notificationType: string, channel: string) => {
    setNotifications(prev => ({
      ...prev,
      [notificationType]: {
        ...prev[notificationType],
        [channel]: !prev[notificationType][channel]
      }
    }));
  };

  const handleSave = () => {
    // Here you would typically save to a backend
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const toggleAll = (channel: string, enabled: boolean) => {
    const updatedNotifications = { ...notifications };
    Object.keys(updatedNotifications).forEach(key => {
      updatedNotifications[key][channel] = enabled;
    });
    setNotifications(updatedNotifications);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Notification Preferences</h1>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-20">
        {/* Description */}
        <div className="text-sm text-muted-foreground">
          Choose how you want to receive notifications for different types of activities.
        </div>

        {/* Notification Settings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 pb-4 border-b border-border mb-4">
              <div className="font-medium text-sm">Type</div>
              {channels.map(channel => (
                <div key={channel.key} className="text-center">
                  <div className="font-medium text-sm mb-2">
                    {channel.icon} {channel.label}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      const allEnabled = filteredNotificationTypes.every(type => 
                        notifications[type.key][channel.key]
                      );
                      toggleAll(channel.key, !allEnabled);
                    }}
                  >
                    All
                  </Button>
                </div>
              ))}
            </div>

            {/* Notification Rows */}
            <div className="space-y-4">
              {filteredNotificationTypes.map(notificationType => (
                <div key={notificationType.key} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-border last:border-b-0">
                  <div>
                    <Label className="font-medium text-sm">
                      {notificationType.title}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notificationType.description}
                    </p>
                  </div>
                  
                  {channels.map(channel => (
                    <div key={channel.key} className="flex justify-center">
                      <Switch
                        checked={notifications[notificationType.key][channel.key]}
                        onCheckedChange={() => handleToggle(notificationType.key, channel.key)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Do Not Disturb Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Pause all notifications (22:00 - 08:00)
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Group Similar Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Combine multiple notifications of the same type
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
          <strong>Note:</strong> Critical notifications (like payment confirmations and security alerts) 
          will always be sent regardless of these settings. SMS charges may apply depending on your carrier.
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;