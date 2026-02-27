import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserCircle, Settings, LogOut, Eye, EyeOff, Upload, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { templates } from '../data/templates';
import { projectId, publicAnonKey } from '/utils/supabase/info';

function IndexContent() {
  const { user, accessToken, logout, updateUser, saveSettings } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(templates[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dad33b02`;

  useEffect(() => {
    // Initialize default data
    fetch(`${API_BASE}/init`, { method: 'POST' })
      .catch(err => console.error('Init error:', err));

    // Load packages
    fetch(`${API_BASE}/packages`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPackages(data.packages);
        }
      })
      .catch(err => console.error('Error loading packages:', err));

    // Load content
    fetch(`${API_BASE}/content`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setContent(data.content);
        }
      })
      .catch(err => console.error('Error loading content:', err));
  }, []);

  useEffect(() => {
    // Apply user's saved template
    if (user?.settings?.template) {
      const template = templates.find(t => t.id === user.settings.template);
      if (template) {
        setCurrentTemplate(template);
        applyTemplate(template);
      }
    }
  }, [user]);

  const applyTemplate = (template: typeof templates[0]) => {
    setCurrentTemplate(template);
    document.documentElement.style.setProperty('--color-primary', template.colors.primary);
    document.documentElement.style.setProperty('--color-secondary', template.colors.secondary);
    document.documentElement.style.setProperty('--color-background', template.colors.background);
    document.documentElement.style.setProperty('--color-text', template.colors.text);
    document.documentElement.style.setProperty('--color-accent', template.colors.accent);
  };

  const handleTemplateSelect = async (template: typeof templates[0]) => {
    applyTemplate(template);
    
    if (user && accessToken) {
      try {
        await saveSettings({ template: template.id });
        toast.success('Template applied and saved!');
      } catch (error) {
        toast.error('Template applied but could not save');
      }
    } else {
      toast.success('Template applied! Login to save your preferences.');
    }
    
    setShowTemplates(false);
  };

  const handleSubscribe = async (packageId: string) => {
    if (!user || !accessToken) {
      toast.error('Please login to subscribe');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Subscription request sent! Waiting for admin approval.');
      } else {
        toast.error(data.error || 'Subscription failed');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error('Failed to subscribe');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updates: any = {};
      
      if (profilePicture) {
        updates.profilePicture = profilePicture;
      }
      
      if (passwordInput) {
        updates.password = passwordInput;
      }

      if (Object.keys(updates).length > 0) {
        await updateUser(updates);
        toast.success('Profile updated successfully!');
        setPasswordInput('');
        setProfilePicture('');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: currentTemplate.colors.background,
        color: currentTemplate.colors.text,
      }}
    >
      {/* Header */}
      <header className="border-b" style={{ borderColor: currentTemplate.colors.primary + '20' }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: currentTemplate.colors.primary }}>
            Daily Task Tracker
          </h1>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowTemplates(true)}
            >
              Choose Template
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <UserCircle className="w-6 h-6" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserCircle className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/login?mode=login')}>
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/login?mode=signup')}>
                    Signup
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Packages Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: currentTemplate.colors.primary }}>
            Subscription Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.length === 0 ? (
              // Default packages if admin hasn't uploaded any
              <>
                {['pkg1', 'pkg2', 'pkg3'].map((id, idx) => (
                  <Card key={id} style={{ borderColor: currentTemplate.colors.primary }}>
                    <CardHeader>
                      <CardTitle>Package {idx + 1}</CardTitle>
                      <CardDescription>Contact admin for details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-200 rounded mb-4 flex items-center justify-center">
                        <p className="text-gray-500">No image uploaded</p>
                      </div>
                      <Button 
                        className="w-full"
                        style={{ backgroundColor: currentTemplate.colors.primary }}
                        onClick={() => handleSubscribe(id)}
                      >
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              packages.map((pkg) => (
                <Card key={pkg.id} style={{ borderColor: currentTemplate.colors.primary }}>
                  <CardHeader>
                    <CardTitle>{pkg.title || `Package ${pkg.id}`}</CardTitle>
                    <CardDescription>{pkg.description || 'Premium subscription package'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pkg.imageUrl && (
                      <img 
                        src={pkg.imageUrl} 
                        alt={pkg.title}
                        className="w-full aspect-video object-cover rounded mb-4"
                      />
                    )}
                    {pkg.price && (
                      <p className="text-2xl font-bold mb-4" style={{ color: currentTemplate.colors.accent }}>
                        {pkg.price}
                      </p>
                    )}
                    <Button 
                      className="w-full"
                      style={{ backgroundColor: currentTemplate.colors.primary }}
                      onClick={() => handleSubscribe(pkg.id)}
                    >
                      Subscribe
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Content Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6" style={{ color: currentTemplate.colors.primary }}>
            Published Content
          </h2>
          {content.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No content published yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <Card key={item.id} style={{ borderColor: currentTemplate.colors.secondary }}>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{item.description}</p>
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full rounded"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your account and preferences</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                {user?.profilePicture && (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <Input
                  placeholder="Enter image URL"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex items-center gap-2">
                  <Input value={user?.username || ''} disabled />
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      Status: <span className={user?.accountStatus === 'active' ? 'text-green-600' : 'text-red-600'}>
                        {user?.accountStatus || 'Unknown'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {user?.accountCreated ? new Date(user.accountCreated).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {user?.accountStatus === 'deactivated' && (
                    <Button variant="outline" size="sm">
                      Appeal
                    </Button>
                  )}
                </div>
              </div>

              <Button onClick={handleUpdateProfile} className="w-full">
                Update Profile
              </Button>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      currentTemplate.id === template.id ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{ 
                      borderColor: template.colors.primary,
                      ...(currentTemplate.id === template.id && { 
                        '--tw-ring-color': template.colors.primary 
                      } as any)
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {Object.values(template.colors).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4">
              {user?.subscription ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Subscription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Package:</span> {user.subscription.packageId}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span className={
                          user.subscription.status === 'active' ? 'text-green-600' :
                          user.subscription.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {user.subscription.status}
                        </span>
                      </p>
                      {user.subscription.expiryDate && (
                        <p>
                          <span className="font-medium">Expires:</span>{' '}
                          {new Date(user.subscription.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 mb-4">No active subscription</p>
                    <Button onClick={() => setShowSettings(false)}>
                      View Packages
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>Select a color scheme and layout for your page</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  currentTemplate.id === template.id ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{ 
                  borderColor: template.colors.primary,
                  ...(currentTemplate.id === template.id && { 
                    '--tw-ring-color': template.colors.primary 
                  } as any)
                }}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.values(template.colors).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-full h-8 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Index() {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
}