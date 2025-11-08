"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Building,
} from "lucide-react";

interface UserSettings {
  profile: {
    name: string | null;
    email: string;
    image: string | null;
  };
  company: {
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    website: string | null;
    logo: string | null;
  };
  preferences: {
    timezone: string | null;
    currency: string | null;
    language: string | null;
    dateFormat: string | null;
    taxRate: number | null;
    taxNumber: string | null;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  subscription: {
    status: string;
    plan: string | null;
    endsAt: string | null;
  };
}

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch user settings');
      }
      const data = await response.json();
      setSettings(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Show success message
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2388ff]"></div>
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Settings</h3>
          <p className="text-gray-600 mb-4">{error || 'Failed to load settings'}</p>
          <Button onClick={fetchUserSettings} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
    <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and preferences.
          </p>
        </div>
        <Button 
          className="bg-[#2388ff] hover:bg-blue-600" 
          onClick={handleSaveSettings}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-[#2388ff]" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-[#2388ff] text-white text-lg">
                    U
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-sm text-gray-600 mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={settings.profile.name?.split(' ')[0] || ''} 
                    onChange={(e) => {
                      const lastName = settings.profile.name?.split(' ').slice(1).join(' ') || '';
                      setSettings({
                        ...settings,
                        profile: {
                          ...settings.profile,
                          name: `${e.target.value} ${lastName}`.trim()
                        }
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={settings.profile.name?.split(' ').slice(1).join(' ') || ''} 
                    onChange={(e) => {
                      const firstName = settings.profile.name?.split(' ')[0] || '';
                      setSettings({
                        ...settings,
                        profile: {
                          ...settings.profile,
                          name: `${firstName} ${e.target.value}`.trim()
                        }
                      });
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={settings.profile.email} 
                  disabled 
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    defaultValue="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2 text-[#2388ff]" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.company.name || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, name: e.target.value }
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.company.email || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, email: e.target.value }
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={settings.company.phone || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, phone: e.target.value }
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyAddress">Address</Label>
                <Input
                  id="companyAddress"
                  value={settings.company.address || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, address: e.target.value }
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  value={settings.company.website || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, website: e.target.value }
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="gstin">GSTIN (Tax Number)</Label>
                <Input
                  id="gstin"
                  value={settings.preferences.taxNumber || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, taxNumber: e.target.value }
                    })
                  }
                  placeholder="27ABCDE1234F1Z5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-[#2388ff]" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: checked }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, push: checked }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, sms: checked }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#2388ff]" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <Badge className="bg-[#2388ff] text-white">
                  {settings.subscription.plan || 'Free'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={`${
                  settings.subscription.status === 'ACTIVE' || settings.subscription.status === 'FREE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {settings.subscription.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next Billing</span>
                <span className="text-sm font-medium">
                  {settings.subscription.endsAt 
                    ? new Date(settings.subscription.endsAt).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-[#2388ff]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing & Subscription
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Palette className="w-4 h-4 mr-2" />
                Appearance
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Globe className="w-4 h-4 mr-2" />
                Language & Region
              </Button>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-[#2388ff]" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Download Data
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
