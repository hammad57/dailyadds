# Daily Task Tracker - Setup Instructions

## Application Overview

This is a comprehensive subscription-based task tracker application with:

- **User Management**: Email/password and Google OAuth authentication
- **Subscription System**: 3 customizable packages with admin approval
- **Template System**: 8 pre-built color themes and layouts
- **Admin Dashboard**: Complete user and content management
- **Content Publishing**: Admin can publish content visible to all users

## Pages

### 1. Index Page (/)
- Main user-facing page
- Displays 3 subscription packages
- Shows published content from admin
- Template selection (8 different designs)
- User account menu (Login/Signup/Settings/Logout)

### 2. Login/Signup Page (/login)
- Email/password authentication
- Google OAuth login
- Profile picture upload (URL)
- Phone number (optional)

### 3. Admin Dashboard (/admin)
- User statistics with charts
- User management (activate/deactivate/delete)
- Subscription management
- Package upload/management
- Content publishing

## Important Setup Steps

### Google OAuth Configuration

**IMPORTANT:** To enable Google login, you MUST configure Google OAuth in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Enable Google provider
4. Follow the setup instructions at: https://supabase.com/docs/guides/auth/social-login/auth-google
5. Configure OAuth consent screen in Google Cloud Console
6. Add authorized redirect URIs

**Without completing this setup, Google login will show "provider is not enabled" error.**

## Features

### User Features

1. **Authentication**
   - Email/password signup and login
   - Google OAuth login (requires setup)
   - Persistent sessions
   - Secure password updates

2. **Templates**
   - 8 pre-built color schemes:
     - Default (Blue)
     - Dark Mode
     - Ocean Blue
     - Forest Green
     - Sunset Orange
     - Purple Dream
     - Rose Garden
     - Midnight
   - Templates persist for logged-in users
   - Non-logged users can preview templates

3. **Subscriptions**
   - 3 package tiers (customizable by admin)
   - Subscription requests (pending admin approval)
   - Expiry date tracking
   - Status: pending, active, expired

4. **Profile Settings**
   - Update profile picture (via URL)
   - Change password (with show/hide toggle)
   - View account status
   - View subscription details

### Admin Features

1. **Dashboard**
   - Total users count
   - Email users vs Google users statistics
   - Interactive bar and pie charts
   - Click on graphs to view user lists

2. **User Management**
   - View all registered users
   - Edit user details:
     - Username
     - Password
     - Profile picture
     - Phone number
     - Account status (active/deactivated)
   - Manage subscriptions:
     - Activate/deactivate
     - Set expiry dates
     - Change subscription status
   - Delete users (clears all data)

3. **Package Management**
   - Upload package images (via URL)
   - Set package titles and descriptions
   - Configure pricing
   - 3 package slots: pkg1, pkg2, pkg3

4. **Content Publishing**
   - Publish content with title, description, and image
   - Set special instructions
   - Delete published content
   - Content shows to all users on main page

## Data Storage

All data is stored in Supabase:
- **User Authentication**: Supabase Auth
- **User Data**: Supabase KV Store
- **Settings**: Saved per user in KV Store
- **Packages**: Stored in KV Store
- **Content**: Stored in KV Store

## Usage Instructions

### For Users

1. **Getting Started**
   - Visit the home page
   - Click user icon (top right) → Signup
   - Choose signup method:
     - Email/password with optional phone and profile picture
     - Google OAuth (requires admin setup)

2. **Selecting Templates**
   - Click "Choose Template" button
   - Select from 8 color schemes
   - Template applies immediately
   - Login to save your preference

3. **Subscribing to Packages**
   - View 3 packages on home page
   - Click "Subscribe" on desired package
   - Wait for admin approval
   - Check status in Settings → Subscription

4. **Managing Profile**
   - Click user icon → Settings
   - Update profile picture and password
   - View account and subscription status
   - Change layout template

### For Admins

1. **Access Admin Dashboard**
   - Navigate to `/admin`
   - View user statistics and charts

2. **Managing Users**
   - Go to "Users" tab
   - Click edit icon on any user
   - Modify user details
   - Approve/activate subscriptions
   - Set expiry dates
   - Delete users if needed

3. **Managing Packages**
   - Go to "Packages" tab
   - Click "Upload Package"
   - Select package slot (1, 2, or 3)
   - Add title, description, price, and image URL
   - Save to make visible to users

4. **Publishing Content**
   - Go to "Content" tab
   - Click "Publish Content"
   - Enter title, description, image URL, and instructions
   - Published content appears on user home page
   - Delete content anytime

## Technical Details

- **Frontend**: React with TypeScript
- **Routing**: React Router v7
- **UI Components**: Radix UI + Tailwind CSS
- **Charts**: Recharts
- **Backend**: Supabase Edge Functions (Hono)
- **Database**: Supabase KV Store
- **Authentication**: Supabase Auth

## Security Notes

- Passwords are hashed by Supabase Auth
- Access tokens required for authenticated routes
- Admin routes should ideally have additional authentication (not implemented in this prototype)
- Profile pictures use URLs (no file upload implemented)
- This is a prototype - additional security measures recommended for production

## Limitations

- No actual payment processing (subscription approval is manual)
- Profile pictures via URL only (no file upload)
- Admin panel has no authentication (add in production)
- No email notifications
- Google OAuth requires manual setup in Supabase

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Google OAuth is configured if using that feature
3. Ensure user has active internet connection
4. Check Supabase project is running
