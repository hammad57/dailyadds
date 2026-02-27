import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase clients
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-dad33b02/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize default data
app.post("/make-server-dad33b02/init", async (c) => {
  try {
    // Initialize default packages if they don't exist
    const pkg1 = await kv.get('package:pkg1');
    if (!pkg1) {
      await kv.set('package:pkg1', {
        id: 'pkg1',
        title: 'Basic Package',
        description: 'Perfect for individuals starting out',
        price: '$9.99/month',
        imageUrl: '',
      });
    }

    const pkg2 = await kv.get('package:pkg2');
    if (!pkg2) {
      await kv.set('package:pkg2', {
        id: 'pkg2',
        title: 'Professional Package',
        description: 'Ideal for growing teams and businesses',
        price: '$19.99/month',
        imageUrl: '',
      });
    }

    const pkg3 = await kv.get('package:pkg3');
    if (!pkg3) {
      await kv.set('package:pkg3', {
        id: 'pkg3',
        title: 'Enterprise Package',
        description: 'Full-featured solution for large organizations',
        price: '$49.99/month',
        imageUrl: '',
      });
    }

    return c.json({ success: true, message: 'Initialized default data' });
  } catch (error) {
    console.log(`Init exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== AUTH ROUTES ==========

// Signup with email/password
app.post("/make-server-dad33b02/signup", async (c) => {
  try {
    const { email, password, username, phoneNumber, profilePicture } = await c.req.json();

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        username: username || email.split('@')[0],
        phoneNumber,
        profilePicture: profilePicture || '',
        accountStatus: 'active',
        accountCreated: new Date().toISOString(),
      },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      username: username || email.split('@')[0],
      phoneNumber,
      profilePicture: profilePicture || '',
      accountStatus: 'active',
      accountCreated: new Date().toISOString(),
      subscription: null,
      settings: null,
    });

    // Increment user count
    const countData = await kv.get('user:count');
    const count = countData ? parseInt(countData as string) : 0;
    await kv.set('user:count', (count + 1).toString());

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Signup exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Signup with Google OAuth
app.post("/make-server-dad33b02/signup-google", async (c) => {
  try {
    const { email, name, profilePicture } = await c.req.json();

    // Check if user already exists
    const existingUsers = await kv.getByPrefix('user:');
    const existingUser = existingUsers.find((u: any) => u.email === email);
    
    if (existingUser) {
      return c.json({ success: true, user: existingUser });
    }

    // Create user record in KV (Google auth handled by frontend)
    const userId = `google_${Date.now()}`;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      username: name || email.split('@')[0],
      profilePicture: profilePicture || '',
      accountStatus: 'active',
      accountCreated: new Date().toISOString(),
      subscription: null,
      settings: null,
      authProvider: 'google',
    });

    // Increment user count
    const countData = await kv.get('user:count');
    const count = countData ? parseInt(countData as string) : 0;
    await kv.set('user:count', (count + 1).toString());

    return c.json({ success: true, userId });
  } catch (error) {
    console.log(`Google signup exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Login
app.post("/make-server-dad33b02/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Login error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Get user data from KV
    const userData = await kv.get(`user:${data.user.id}`);

    return c.json({ 
      success: true, 
      accessToken: data.session.access_token,
      user: userData || data.user 
    });
  } catch (error) {
    console.log(`Login exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get current user
app.get("/make-server-dad33b02/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user data from KV
    const userData = await kv.get(`user:${user.id}`);

    return c.json({ success: true, user: userData || user });
  } catch (error) {
    console.log(`Get user exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update user
app.put("/make-server-dad33b02/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();

    // Get current user data
    const userData = await kv.get(`user:${user.id}`) as any;

    // Update password if provided
    if (updates.password) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: updates.password,
      });
    }

    // Update user metadata
    const updatedData = {
      ...userData,
      ...updates,
      password: undefined, // Don't store password in KV
    };

    await kv.set(`user:${user.id}`, updatedData);

    return c.json({ success: true, user: updatedData });
  } catch (error) {
    console.log(`Update user exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Logout
app.post("/make-server-dad33b02/logout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (accessToken) {
      await supabaseClient.auth.signOut();
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Logout exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== SETTINGS ROUTES ==========

// Save user settings
app.post("/make-server-dad33b02/settings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const settings = await c.req.json();

    // Get current user data
    const userData = await kv.get(`user:${user.id}`) as any;

    // Update settings
    const updatedData = {
      ...userData,
      settings,
    };

    await kv.set(`user:${user.id}`, updatedData);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Save settings exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== PACKAGE ROUTES ==========

// Get all packages
app.get("/make-server-dad33b02/packages", async (c) => {
  try {
    const pkg1 = await kv.get('package:pkg1');
    const pkg2 = await kv.get('package:pkg2');
    const pkg3 = await kv.get('package:pkg3');

    return c.json({ 
      success: true, 
      packages: [pkg1, pkg2, pkg3].filter(Boolean) 
    });
  } catch (error) {
    console.log(`Get packages exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Subscribe to package
app.post("/make-server-dad33b02/subscribe", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { packageId } = await c.req.json();

    // Get current user data
    const userData = await kv.get(`user:${user.id}`) as any;

    // Create subscription request (pending admin approval)
    const subscription = {
      packageId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const updatedData = {
      ...userData,
      subscription,
    };

    await kv.set(`user:${user.id}`, updatedData);

    return c.json({ success: true, subscription });
  } catch (error) {
    console.log(`Subscribe exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== CONTENT ROUTES ==========

// Get all published content
app.get("/make-server-dad33b02/content", async (c) => {
  try {
    const content = await kv.getByPrefix('content:');
    return c.json({ success: true, content });
  } catch (error) {
    console.log(`Get content exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ========== ADMIN ROUTES ==========

// Get all users (admin only)
app.get("/make-server-dad33b02/admin/users", async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    const userCount = await kv.get('user:count');
    
    // Filter out the count key
    const actualUsers = users.filter((u: any) => u && typeof u === 'object' && u.id);

    // Calculate stats
    const emailUsers = actualUsers.filter((u: any) => !u.authProvider || u.authProvider === 'email');
    const googleUsers = actualUsers.filter((u: any) => u.authProvider === 'google');

    return c.json({ 
      success: true, 
      users: actualUsers,
      stats: {
        total: actualUsers.length,
        emailUsers: emailUsers.length,
        googleUsers: googleUsers.length,
      }
    });
  } catch (error) {
    console.log(`Get admin users exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update user (admin)
app.put("/make-server-dad33b02/admin/user/:id", async (c) => {
  try {
    const userId = c.req.param('id');
    const updates = await c.req.json();

    const userData = await kv.get(`user:${userId}`) as any;

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedData = {
      ...userData,
      ...updates,
    };

    await kv.set(`user:${userId}`, updatedData);

    return c.json({ success: true, user: updatedData });
  } catch (error) {
    console.log(`Admin update user exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete user (admin)
app.delete("/make-server-dad33b02/admin/user/:id", async (c) => {
  try {
    const userId = c.req.param('id');

    // Delete from Auth if not Google user
    const userData = await kv.get(`user:${userId}`) as any;
    
    if (userData && !userData.authProvider) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }

    // Delete from KV
    await kv.del(`user:${userId}`);

    // Decrement user count
    const countData = await kv.get('user:count');
    const count = countData ? parseInt(countData as string) : 0;
    await kv.set('user:count', Math.max(0, count - 1).toString());

    return c.json({ success: true });
  } catch (error) {
    console.log(`Admin delete user exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Upload package (admin)
app.post("/make-server-dad33b02/admin/package", async (c) => {
  try {
    const { packageId, imageUrl, title, description, price } = await c.req.json();

    await kv.set(`package:${packageId}`, {
      id: packageId,
      imageUrl,
      title,
      description,
      price,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Upload package exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Publish content (admin)
app.post("/make-server-dad33b02/admin/content", async (c) => {
  try {
    const content = await c.req.json();
    const contentId = `content_${Date.now()}`;

    await kv.set(`content:${contentId}`, {
      id: contentId,
      ...content,
      publishedAt: new Date().toISOString(),
    });

    return c.json({ success: true, contentId });
  } catch (error) {
    console.log(`Publish content exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete content (admin)
app.delete("/make-server-dad33b02/admin/content/:id", async (c) => {
  try {
    const contentId = c.req.param('id');
    await kv.del(`content:${contentId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete content exception: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);