import React, { useState } from "react";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSupplier = location.pathname.startsWith('/supplier/');
  
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+972-50-123-4567",
    location: "Tel Aviv",
    language: "he",
    darkMode: false,
    fontSize: "medium",
    // Supplier specific
    businessDescription: "",
    workingHours: "8:00 - 18:00",
    serviceCategories: "Kitchen Design, Renovation"
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
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
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-20">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Main Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData({...formData, language: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he">עברית</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" className="w-full">
              Reset Password
            </Button>
          </CardContent>
        </Card>

        {/* Interface Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Interface Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch
                checked={formData.darkMode}
                onCheckedChange={(checked) => setFormData({...formData, darkMode: checked})}
              />
            </div>
            
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Select value={formData.fontSize} onValueChange={(value) => setFormData({...formData, fontSize: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Specific Settings */}
        {isSupplier && (
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company Logo</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload logo</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  placeholder="Describe your business and services..."
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="workingHours">Working Hours</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="serviceCategories">Service Categories</Label>
                <Input
                  id="serviceCategories"
                  value={formData.serviceCategories}
                  onChange={(e) => setFormData({...formData, serviceCategories: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Links */}
        <Card>
          <CardContent className="p-0">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4"
                onClick={() => navigate('/notifications-preferences')}
              >
                Notification Settings
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4"
                onClick={() => navigate('/faq')}
              >
                FAQ
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4"
                onClick={() => navigate('/support')}
              >
                Contact Support
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4"
              >
                Terms of Use
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 text-destructive"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;