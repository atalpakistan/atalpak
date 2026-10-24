/**
 * Cloudflare Pages Functions API Router for ATAL Store
 * Executes at Cloudflare Edge when deployed on Cloudflare Pages.
 * Handles /api/* requests natively if no external Node server is configured.
 */

interface Env {
  // Cloudflare KV or Environment Variables if configured
  VITE_API_URL?: string;
}

const DEFAULT_STAFF = [
  {
    id: 'staff-admin-1',
    email: 'uatal.pk@gmail.com',
    name: 'Umer (Admin)',
    role: 'admin',
    password: 'Umer@9157',
    isPasswordChangeable: true,
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'staff-emp-1',
    email: 'ali@atal.com',
    name: 'Ali (Employee)',
    role: 'employee',
    password: 'Ali@297',
    isPasswordChangeable: true,
    createdAt: '2026-10-01T00:00:00.000Z'
  }
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Content-Type': 'application/json'
};

export async function onRequest(context: { request: Request; env: Env; params: { path?: string[] } }): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // 1. Staff Admin Login
    if (path === '/api/admin/login' && request.method === 'POST') {
      const body: any = await request.json().catch(() => ({}));
      const email = (body.email || '').toString().trim().toLowerCase();
      const password = (body.password || '').toString().trim();

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Please enter both Email and Password.' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const staff = DEFAULT_STAFF.find(u => u.email.toLowerCase() === email || u.name.toLowerCase() === email);

      if (!staff || staff.password.trim() !== password) {
        return new Response(JSON.stringify({ error: 'Invalid admin or employee email or password.' }), {
          status: 401,
          headers: corsHeaders
        });
      }

      const { password: _, ...safeUser } = staff;
      return new Response(JSON.stringify({
        success: true,
        message: `Welcome to ATAL Portal, ${safeUser.name}!`,
        user: safeUser
      }), { status: 200, headers: corsHeaders });
    }

    // 2. Customer Registration
    if (path === '/api/customers/register' && request.method === 'POST') {
      const body: any = await request.json().catch(() => ({}));
      const { name, email, whatsapp, password, address, city, province, area } = body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return new Response(JSON.stringify({ error: 'Please enter your full name.' }), { status: 400, headers: corsHeaders });
      }

      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), { status: 400, headers: corsHeaders });
      }

      if (!whatsapp || typeof whatsapp !== 'string' || whatsapp.trim().length < 10) {
        return new Response(JSON.stringify({ error: 'Please provide a valid 11-digit WhatsApp mobile number.' }), { status: 400, headers: corsHeaders });
      }

      if (!password || typeof password !== 'string' || password.trim().length < 6) {
        return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long.' }), { status: 400, headers: corsHeaders });
      }

      const newCustomer = {
        id: `cust-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        createdAt: new Date().toISOString(),
        defaultAddress: address && city && province ? {
          address: address.trim(),
          city: city.trim(),
          province: province.trim(),
          area: area ? area.trim() : ''
        } : undefined
      };

      return new Response(JSON.stringify({
        success: true,
        message: 'Account created successfully! Welcome to ATAL.',
        customer: newCustomer
      }), { status: 201, headers: corsHeaders });
    }

    // 3. Customer Login
    if (path === '/api/customers/login' && request.method === 'POST') {
      const body: any = await request.json().catch(() => ({}));
      const identifier = (body.identifier || '').toString().trim().toLowerCase();
      const password = (body.password || '').toString().trim();

      if (!identifier || !password) {
        return new Response(JSON.stringify({ error: 'Please enter your Email or WhatsApp number and Password.' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Edge dummy return or success acknowledgement
      const dummyCustomer = {
        id: `cust-${Date.now()}`,
        name: identifier.includes('@') ? identifier.split('@')[0] : 'ATAL Valued Customer',
        email: identifier.includes('@') ? identifier : `${identifier}@customer.atal.pk`,
        whatsapp: identifier.replace(/\D/g, '') || '03001234567',
        createdAt: new Date().toISOString()
      };

      return new Response(JSON.stringify({
        success: true,
        message: `Welcome back!`,
        customer: dummyCustomer
      }), { status: 200, headers: corsHeaders });
    }

    // Default fallback response
    return new Response(JSON.stringify({ message: 'ATAL Cloudflare Edge API Active' }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
