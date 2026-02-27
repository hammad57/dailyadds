import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Mail, UserCheck, UserX, Trash2, Edit, Package, FileText, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '/utils/supabase/info';

function AdminContent() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, emailUsers: 0, googleUsers: 0 });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [content, setContent] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // User edit fields
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editProfilePicture, setEditProfilePicture] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editAccountStatus, setEditAccountStatus] = useState('');
  const [editSubscriptionStatus, setEditSubscriptionStatus] = useState('');
  const [editSubscriptionExpiry, setEditSubscriptionExpiry] = useState('');

  // Package fields
  const [packageId, setPackageId] = useState('pkg1');
  const [packageTitle, setPackageTitle] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageImageUrl, setPackageImageUrl] = useState('');

  // Content fields
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentImageUrl, setContentImageUrl] = useState('');
  const [contentInstructions, setContentInstructions] = useState('');

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dad33b02`;

  useEffect(() => {
    loadUsers();
    loadContent();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/users`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const loadContent = async () => {
    try {
      const response = await fetch(`${API_BASE}/content`);
      const data = await response.json();

      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setEditUsername(user.username || '');
    setEditPassword('');
    setEditProfilePicture(user.profilePicture || '');
    setEditPhoneNumber(user.phoneNumber || '');
    setEditAccountStatus(user.accountStatus || 'active');
    setEditSubscriptionStatus(user.subscription?.status || 'none');
    setEditSubscriptionExpiry(user.subscription?.expiryDate || '');
    setShowUserDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const updates: any = {
        username: editUsername,
        profilePicture: editProfilePicture,
        phoneNumber: editPhoneNumber,
        accountStatus: editAccountStatus,
      };

      if (editPassword) {
        updates.password = editPassword;
      }

      if (editSubscriptionStatus !== 'none') {
        updates.subscription = {
          packageId: selectedUser.subscription?.packageId || 'pkg1',
          status: editSubscriptionStatus,
          expiryDate: editSubscriptionExpiry,
        };
      } else {
        updates.subscription = null;
      }

      const response = await fetch(`${API_BASE}/admin/user/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User updated successfully');
        setShowUserDialog(false);
        loadUsers();
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_BASE}/admin/user/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User deleted successfully');
        setShowUserDialog(false);
        loadUsers();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleUploadPackage = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          title: packageTitle,
          description: packageDescription,
          price: packagePrice,
          imageUrl: packageImageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Package uploaded successfully');
        setShowPackageDialog(false);
        // Reset fields
        setPackageTitle('');
        setPackageDescription('');
        setPackagePrice('');
        setPackageImageUrl('');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload package error:', error);
      toast.error('Failed to upload package');
    }
  };

  const handlePublishContent = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: contentTitle,
          description: contentDescription,
          imageUrl: contentImageUrl,
          instructions: contentInstructions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Content published successfully');
        setShowContentDialog(false);
        loadContent();
        // Reset fields
        setContentTitle('');
        setContentDescription('');
        setContentImageUrl('');
        setContentInstructions('');
      } else {
        toast.error(data.error || 'Publish failed');
      }
    } catch (error) {
      console.error('Publish content error:', error);
      toast.error('Failed to publish content');
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`${API_BASE}/admin/content/${contentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Content deleted successfully');
        loadContent();
      } else {
        toast.error('Delete failed');
      }
    } catch (error) {
      console.error('Delete content error:', error);
      toast.error('Failed to delete content');
    }
  };

  // Chart data
  const userTypeData = [
    { name: 'Email Users', value: stats.emailUsers, color: '#3b82f6' },
    { name: 'Google Users', value: stats.googleUsers, color: '#10b981' },
  ];

  const barChartData = [
    { name: 'Total Users', count: stats.total },
    { name: 'Email Users', count: stats.emailUsers },
    { name: 'Google Users', count: stats.googleUsers },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Users</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.emailUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email/password signups
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Google Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.googleUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Google OAuth signups
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                  <CardDescription>Overview of user distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Types</CardTitle>
                  <CardDescription>Distribution by authentication method</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Auth Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.authProvider === 'google' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.authProvider === 'google' ? 'Google' : 'Email'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.accountStatus === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.accountStatus}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.subscription ? (
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.subscription.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : user.subscription.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.subscription.status}
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserClick(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <CardTitle>Package Management</CardTitle>
                <CardDescription>Upload and manage subscription packages</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowPackageDialog(true)}>
                  <Package className="w-4 h-4 mr-2" />
                  Upload Package
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Content Management</CardTitle>
                    <CardDescription>Publish and manage content for users</CardDescription>
                  </div>
                  <Button onClick={() => setShowContentDialog(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Publish Content
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <CardDescription>
                              {new Date(item.publishedAt).toLocaleString()}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContent(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2">{item.description}</p>
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full max-w-md rounded"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {content.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No content published yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Edit Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Manage user details and subscription</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              {editProfilePicture && (
                <img 
                  src={editProfilePicture} 
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <Input
                placeholder="Image URL"
                value={editProfilePicture}
                onChange={(e) => setEditProfilePicture(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password (optional)"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
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
              <Label>Phone Number</Label>
              <Input
                value={editPhoneNumber}
                onChange={(e) => setEditPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={editAccountStatus}
                onChange={(e) => setEditAccountStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Subscription Status</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={editSubscriptionStatus}
                onChange={(e) => setEditSubscriptionStatus(e.target.value)}
              >
                <option value="none">None</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {editSubscriptionStatus !== 'none' && (
              <div className="space-y-2">
                <Label>Subscription Expiry Date</Label>
                <Input
                  type="date"
                  value={editSubscriptionExpiry}
                  onChange={(e) => setEditSubscriptionExpiry(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpdateUser} className="flex-1">
                Update User
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Package Upload Dialog */}
      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Package</DialogTitle>
            <DialogDescription>Add or update a subscription package</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Package</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
              >
                <option value="pkg1">Package 1</option>
                <option value="pkg2">Package 2</option>
                <option value="pkg3">Package 3</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Package title"
                value={packageTitle}
                onChange={(e) => setPackageTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Package description"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                placeholder="e.g., $9.99/month"
                value={packagePrice}
                onChange={(e) => setPackagePrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="Package image URL"
                value={packageImageUrl}
                onChange={(e) => setPackageImageUrl(e.target.value)}
              />
            </div>

            <Button onClick={handleUploadPackage} className="w-full">
              Upload Package
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Publish Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Content</DialogTitle>
            <DialogDescription>Create new content for users</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Content title"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Content description"
                value={contentDescription}
                onChange={(e) => setContentDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL (Optional)</Label>
              <Input
                placeholder="Content image URL"
                value={contentImageUrl}
                onChange={(e) => setContentImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Instructions (Optional)</Label>
              <Textarea
                placeholder="Special instructions for users"
                value={contentInstructions}
                onChange={(e) => setContentInstructions(e.target.value)}
              />
            </div>

            <Button onClick={handlePublishContent} className="w-full">
              Publish Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Admin() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
