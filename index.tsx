import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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

// Helper function to verify auth token
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No token provided', status: 401 };
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Invalid token', status: 401 };
  }

  return { user, accessToken };
}

// Health check endpoint
app.get("/make-server-f1154d58/health", (c) => {
  return c.json({ status: "ok" });
});

// Seed demo users endpoint
app.post("/make-server-f1154d58/seed-demo-users", async (c) => {
  try {
    const demoUsers = [
      {
        email: 'patient@demo.com',
        password: 'demo123',
        name: 'Demo Patient',
        role: 'patient'
      },
      {
        email: 'dietitian@demo.com',
        password: 'demo123',
        name: 'Dr. Demo Dietitian',
        role: 'dietitian'
      }
    ];

    const results = [];
    
    for (const user of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await supabase.auth.admin.listUsers();
        const userExists = existingUser.data?.users?.some(u => u.email === user.email);
        
        if (!userExists) {
          const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            user_metadata: { name: user.name, role: user.role },
            email_confirm: true
          });

          if (error) {
            console.error(`Error creating user ${user.email}:`, error);
            results.push({ email: user.email, status: 'error', error: error.message });
          } else {
            // Store user profile in KV store
            await kv.set(`user:${data.user.id}`, {
              id: data.user.id,
              email: data.user.email,
              name: user.name,
              role: user.role,
              created_at: new Date().toISOString()
            });
            
            results.push({ email: user.email, status: 'created', id: data.user.id });
          }
        } else {
          results.push({ email: user.email, status: 'already exists' });
        }
      } catch (err: any) {
        console.error(`Exception creating user ${user.email}:`, err);
        results.push({ email: user.email, status: 'error', error: err.message });
      }
    }

    return c.json({ message: 'Demo users seeding completed', results });
  } catch (error: any) {
    console.error('Seed demo users error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User signup endpoint
app.post("/make-server-f1154d58/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      role,
      created_at: new Date().toISOString()
    });

    return c.json({ user: data.user, message: 'User created successfully' });
  } catch (error: any) {
    console.error('Signup endpoint error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User signin endpoint
app.post("/make-server-f1154d58/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Signin error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Get user profile from KV store
    let profile = await kv.get(`user:${data.user.id}`);
    
    if (!profile) {
      // If profile doesn't exist, create a basic one
      profile = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
        role: data.user.user_metadata?.role || 'patient',
        created_at: new Date().toISOString()
      };
      await kv.set(`user:${data.user.id}`, profile);
    }

    return c.json({ 
      user: { ...data.user, ...profile }, 
      session: data.session,
      access_token: data.session.access_token 
    });
  } catch (error: any) {
    console.error('Signin endpoint error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user profile
app.get("/make-server-f1154d58/user/profile", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const profile = await kv.get(`user:${auth.user.id}`);
    return c.json(profile || { id: auth.user.id, role: 'patient' });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update user profile
app.put("/make-server-f1154d58/user/profile", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const updates = await c.req.json();
    const existingProfile = await kv.get(`user:${auth.user.id}`) || {};
    
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      id: auth.user.id,
      updated_at: new Date().toISOString()
    };

    await kv.set(`user:${auth.user.id}`, updatedProfile);
    return c.json(updatedProfile);
  } catch (error: any) {
    console.error('Update profile error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Prakriti assessment endpoint
app.post("/make-server-f1154d58/prakriti/assess", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const { answers } = await c.req.json();
    
    // Simple Prakriti calculation based on answers
    const doshaScores = { vata: 0, pitta: 0, kapha: 0 };
    
    answers.forEach((answer: any) => {
      if (answer.dosha === 'vata') doshaScores.vata += answer.score || 1;
      if (answer.dosha === 'pitta') doshaScores.pitta += answer.score || 1;
      if (answer.dosha === 'kapha') doshaScores.kapha += answer.score || 1;
    });

    const total = doshaScores.vata + doshaScores.pitta + doshaScores.kapha;
    const percentages = {
      vata: Math.round((doshaScores.vata / total) * 100),
      pitta: Math.round((doshaScores.pitta / total) * 100),
      kapha: Math.round((doshaScores.kapha / total) * 100)
    };

    const dominantDosha = Object.entries(percentages).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    const result = {
      user_id: auth.user.id,
      dominant_dosha: dominantDosha,
      dosha_percentages: percentages,
      assessment_date: new Date().toISOString(),
      recommendations: generatePrakritiRecommendations(dominantDosha)
    };

    await kv.set(`prakriti:${auth.user.id}`, result);
    return c.json(result);
  } catch (error: any) {
    console.error('Prakriti assessment error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get Prakriti assessment
app.get("/make-server-f1154d58/prakriti/:userId", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const userId = c.req.param('userId');
    const assessment = await kv.get(`prakriti:${userId}`);
    return c.json(assessment || null);
  } catch (error: any) {
    console.error('Get Prakriti error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Generate diet plan
app.post("/make-server-f1154d58/diet-plan/generate", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const { preferences, goals, restrictions } = await c.req.json();
    const prakriti = await kv.get(`prakriti:${auth.user.id}`);
    
    const dietPlan = generateDietPlan(prakriti?.dominant_dosha || 'balanced', preferences, goals, restrictions);
    
    const planData = {
      user_id: auth.user.id,
      plan: dietPlan,
      created_at: new Date().toISOString(),
      preferences,
      goals,
      restrictions
    };

    await kv.set(`diet_plan:${auth.user.id}`, planData);
    return c.json(planData);
  } catch (error: any) {
    console.error('Diet plan generation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get diet plan
app.get("/make-server-f1154d58/diet-plan/:userId", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const userId = c.req.param('userId');
    const dietPlan = await kv.get(`diet_plan:${userId}`);
    return c.json(dietPlan || null);
  } catch (error: any) {
    console.error('Get diet plan error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Book appointment
app.post("/make-server-f1154d58/appointments", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const appointmentData = await c.req.json();
    const appointmentId = `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const appointment = {
      id: appointmentId,
      patient_id: auth.user.id,
      ...appointmentData,
      status: 'scheduled',
      created_at: new Date().toISOString()
    };

    await kv.set(`appointment:${appointmentId}`, appointment);
    
    // Add to user's appointments list
    const userAppointments = await kv.get(`appointments:${auth.user.id}`) || [];
    userAppointments.push(appointmentId);
    await kv.set(`appointments:${auth.user.id}`, userAppointments);

    return c.json(appointment);
  } catch (error: any) {
    console.error('Book appointment error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user appointments
app.get("/make-server-f1154d58/appointments/:userId", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const userId = c.req.param('userId');
    const appointmentIds = await kv.get(`appointments:${userId}`) || [];
    
    const appointments = [];
    for (const id of appointmentIds) {
      const appointment = await kv.get(`appointment:${id}`);
      if (appointment) appointments.push(appointment);
    }

    return c.json(appointments);
  } catch (error: any) {
    console.error('Get appointments error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Progress tracking
app.post("/make-server-f1154d58/progress", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const progressData = await c.req.json();
    const progressId = `prog_${Date.now()}`;
    
    const progress = {
      id: progressId,
      user_id: auth.user.id,
      ...progressData,
      date: new Date().toISOString()
    };

    await kv.set(`progress:${progressId}`, progress);
    
    // Add to user's progress list
    const userProgress = await kv.get(`progress_list:${auth.user.id}`) || [];
    userProgress.push(progressId);
    await kv.set(`progress_list:${auth.user.id}`, userProgress);

    return c.json(progress);
  } catch (error: any) {
    console.error('Progress tracking error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user progress
app.get("/make-server-f1154d58/progress/:userId", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const userId = c.req.param('userId');
    const progressIds = await kv.get(`progress_list:${userId}`) || [];
    
    const progressData = [];
    for (const id of progressIds) {
      const progress = await kv.get(`progress:${id}`);
      if (progress) progressData.push(progress);
    }

    return c.json(progressData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  } catch (error: any) {
    console.error('Get progress error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Dietitian endpoints
app.get("/make-server-f1154d58/dietitian/patients", async (c) => {
  const auth = await verifyAuth(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    // Get all users with role 'patient'
    const allKeys = await kv.getByPrefix('user:');
    const patients = allKeys.filter(user => user.role === 'patient');
    return c.json(patients);
  } catch (error: any) {
    console.error('Get patients error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Helper functions
function generatePrakritiRecommendations(dominantDosha: string) {
  const recommendations = {
    vata: {
      diet: ['Warm, cooked foods', 'Sweet, sour, and salty tastes', 'Regular meal times', 'Avoid cold drinks'],
      lifestyle: ['Regular sleep schedule', 'Gentle exercise', 'Meditation', 'Avoid excessive stimulation'],
      foods_to_include: ['Rice', 'Wheat', 'Dairy', 'Nuts', 'Sweet fruits'],
      foods_to_avoid: ['Raw vegetables', 'Bitter and astringent foods', 'Caffeine', 'Cold foods']
    },
    pitta: {
      diet: ['Cool, fresh foods', 'Sweet, bitter, and astringent tastes', 'Avoid spicy foods', 'Moderate portions'],
      lifestyle: ['Avoid excessive heat', 'Moderate exercise', 'Cool environments', 'Stress management'],
      foods_to_include: ['Leafy greens', 'Sweet fruits', 'Coconut', 'Cucumber', 'Mint'],
      foods_to_avoid: ['Spicy foods', 'Sour fruits', 'Alcohol', 'Red meat']
    },
    kapha: {
      diet: ['Light, warm foods', 'Pungent, bitter, and astringent tastes', 'Smaller portions', 'Avoid heavy foods'],
      lifestyle: ['Regular vigorous exercise', 'Early rising', 'Active lifestyle', 'Avoid oversleeping'],
      foods_to_include: ['Spices', 'Legumes', 'Vegetables', 'Light grains', 'Honey'],
      foods_to_avoid: ['Dairy', 'Sweet foods', 'Cold foods', 'Excessive fats']
    }
  };

  return recommendations[dominantDosha as keyof typeof recommendations] || recommendations.vata;
}

function generateDietPlan(dosha: string, preferences: any, goals: any, restrictions: any) {
  // Sample diet plan generation based on dosha
  const basePlans = {
    vata: {
      breakfast: ['Warm oatmeal with nuts and honey', 'Herbal tea', 'Cooked fruits'],
      lunch: ['Rice with dal', 'Steamed vegetables', 'Ghee'],
      dinner: ['Soup with vegetables', 'Whole grain bread', 'Warm milk'],
      snacks: ['Nuts and dates', 'Warm herbal tea', 'Sweet fruits']
    },
    pitta: {
      breakfast: ['Cool cereals', 'Sweet fruits', 'Coconut water'],
      lunch: ['Salads with cucumber', 'Quinoa', 'Mint lassi'],
      dinner: ['Light soup', 'Steamed rice', 'Cooling herbs'],
      snacks: ['Fresh fruits', 'Coconut water', 'Cooling drinks']
    },
    kapha: {
      breakfast: ['Spiced tea', 'Light fruits', 'Honey'],
      lunch: ['Spicy vegetables', 'Millet', 'Ginger tea'],
      dinner: ['Light soup', 'Steamed vegetables', 'Herbal tea'],
      snacks: ['Spiced nuts', 'Ginger tea', 'Light fruits']
    }
  };

  return basePlans[dosha as keyof typeof basePlans] || basePlans.vata;
}

Deno.serve(app.fetch);