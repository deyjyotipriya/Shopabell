'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface SystemSettings {
  platform: {
    name: string;
    description: string;
    supportEmail: string;
    defaultCommissionRate: number;
    minOrderAmount: number;
    maxOrderAmount: number;
  };
  features: {
    sellerOnboarding: boolean;
    buyerRegistration: boolean;
    socialSharing: boolean;
    autoPayouts: boolean;
    fraudDetection: boolean;
    multiLanguage: boolean;
  };
  integrations: {
    facebook: {
      enabled: boolean;
      appId: string;
      appSecret: string;
    };
    payment: {
      provider: 'stripe' | 'paypal' | 'square';
      publicKey: string;
      secretKey: string;
    };
    email: {
      provider: 'sendgrid' | 'mailgun' | 'ses';
      apiKey: string;
      fromAddress: string;
    };
  };
  security: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    platform: {
      name: '',
      description: '',
      supportEmail: '',
      defaultCommissionRate: 10,
      minOrderAmount: 0,
      maxOrderAmount: 10000,
    },
    features: {
      sellerOnboarding: true,
      buyerRegistration: true,
      socialSharing: true,
      autoPayouts: false,
      fraudDetection: true,
      multiLanguage: false,
    },
    integrations: {
      facebook: {
        enabled: true,
        appId: '',
        appSecret: '',
      },
      payment: {
        provider: 'stripe',
        publicKey: '',
        secretKey: '',
      },
      email: {
        provider: 'sendgrid',
        apiKey: '',
        fromAddress: '',
      },
    },
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      twoFactorAuth: false,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('platform');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/master/settings');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/master/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and integrations
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {saveSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>
                Basic platform settings and business rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input
                    id="platform-name"
                    value={settings.platform.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platform: { ...settings.platform, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings.platform.supportEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platform: { ...settings.platform, supportEmail: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="platform-description">Platform Description</Label>
                <Textarea
                  id="platform-description"
                  rows={3}
                  value={settings.platform.description}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platform: { ...settings.platform, description: e.target.value },
                    })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="commission-rate">Default Commission Rate (%)</Label>
                  <Input
                    id="commission-rate"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.platform.defaultCommissionRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platform: {
                          ...settings.platform,
                          defaultCommissionRate: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="min-order">Min Order Amount ($)</Label>
                  <Input
                    id="min-order"
                    type="number"
                    min="0"
                    value={settings.platform.minOrderAmount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platform: {
                          ...settings.platform,
                          minOrderAmount: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="max-order">Max Order Amount ($)</Label>
                  <Input
                    id="max-order"
                    type="number"
                    min="0"
                    value={settings.platform.maxOrderAmount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platform: {
                          ...settings.platform,
                          maxOrderAmount: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={key} className="text-base">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getFeatureDescription(key)}
                    </p>
                  </div>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        features: { ...settings.features, [key]: checked },
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facebook Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="facebook-enabled">Enable Facebook Integration</Label>
                <Switch
                  id="facebook-enabled"
                  checked={settings.integrations.facebook.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        facebook: { ...settings.integrations.facebook, enabled: checked },
                      },
                    })
                  }
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="fb-app-id">App ID</Label>
                  <Input
                    id="fb-app-id"
                    value={settings.integrations.facebook.appId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          facebook: { ...settings.integrations.facebook, appId: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fb-app-secret">App Secret</Label>
                  <Input
                    id="fb-app-secret"
                    type="password"
                    value={settings.integrations.facebook.appSecret}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          facebook: { ...settings.integrations.facebook, appSecret: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payment-provider">Provider</Label>
                <Select
                  value={settings.integrations.payment.provider}
                  onValueChange={(value: any) =>
                    setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        payment: { ...settings.integrations.payment, provider: value },
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="payment-public">Public Key</Label>
                  <Input
                    id="payment-public"
                    value={settings.integrations.payment.publicKey}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          payment: { ...settings.integrations.payment, publicKey: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="payment-secret">Secret Key</Label>
                  <Input
                    id="payment-secret"
                    type="password"
                    value={settings.integrations.payment.secretKey}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          payment: { ...settings.integrations.payment, secretKey: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-verification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email before accessing the platform
                    </p>
                  </div>
                  <Switch
                    id="email-verification"
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, requireEmailVerification: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="phone-verification">Require Phone Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Additional verification via SMS
                    </p>
                  </div>
                  <Switch
                    id="phone-verification"
                    checked={settings.security.requirePhoneVerification}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, requirePhoneVerification: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable 2FA for enhanced security
                    </p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactorAuth: checked },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="max-login">Max Login Attempts</Label>
                  <Input
                    id="max-login"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          maxLoginAttempts: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeout: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    sellerOnboarding: 'Allow new sellers to join the platform',
    buyerRegistration: 'Enable buyer account registration',
    socialSharing: 'Allow users to share products on social media',
    autoPayouts: 'Automatically process seller payouts',
    fraudDetection: 'Enable automated fraud detection system',
    multiLanguage: 'Support multiple languages on the platform',
  };
  return descriptions[feature] || '';
}