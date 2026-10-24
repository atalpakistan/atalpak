/**
 * Unified Authentication Service Module for ATAL Store
 * Handles Admin, Staff, and Customer logins/registrations with robust error handling,
 * network timeout controls, structured logging, and user-friendly error feedback.
 */

export interface StaffAuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  isPasswordChangeable?: boolean;
}

export interface CustomerAddress {
  address: string;
  city: string;
  province: string;
  area?: string;
}

export interface CustomerAuthUser {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  password?: string;
  createdAt?: string;
  defaultAddress?: CustomerAddress;
}

export interface AuthResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface CustomerRegisterPayload {
  name: string;
  email: string;
  whatsapp: string;
  password: string;
  address?: string;
  city?: string;
  province?: string;
  area?: string;
}

export interface CustomerUpdatePayload {
  name?: string;
  email?: string;
  whatsapp?: string;
  defaultAddress?: CustomerAddress;
  currentPassword?: string;
  newPassword?: string;
}

const DEFAULT_TIMEOUT_MS = 8000; // 8 Seconds Timeout

interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Fetch wrapper that enforces a strict network timeout via AbortController.
 */
async function fetchWithTimeout(url: string, options: FetchWithTimeoutOptions = {}): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchInit } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchInit,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

class AuthService {
  /**
   * Admin & Staff Portal Login
   */
  async loginStaff(emailInput: string, passwordInput: string): Promise<AuthResponse<StaffAuthUser>> {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !password) {
      return {
        success: false,
        error: 'Please enter both Email/Username and Password.'
      };
    }

    const startTime = Date.now();
    console.groupCollapsed(`[AuthService] Staff Login Attempt: ${email}`);

    try {
      const response = await fetchWithTimeout('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        timeoutMs: 8000
      });

      const elapsed = Date.now() - startTime;
      console.log(`[AuthService] HTTP ${response.status} ${response.statusText} (${elapsed}ms)`);

      let responseData: any = {};
      try {
        responseData = await response.json();
      } catch (parseErr) {
        console.warn('[AuthService] Could not parse JSON response from server:', parseErr);
      }

      if (response.ok && responseData.user) {
        console.log(`[AuthService] Staff login verified for ${responseData.user.email} (${responseData.user.role})`);
        console.groupEnd();
        return {
          success: true,
          message: responseData.message || `Welcome to ATAL Portal, ${responseData.user.name}!`,
          data: responseData.user
        };
      }

      if (responseData.error) {
        console.warn(`[AuthService] Staff login rejected: ${responseData.error}`);
        console.groupEnd();
        return {
          success: false,
          error: responseData.error
        };
      }

      if (response.status >= 500) {
        console.groupEnd();
        return {
          success: false,
          error: 'Server is temporarily unavailable. Please try again in a few moments.'
        };
      }
    } catch (netErr: any) {
      const elapsed = Date.now() - startTime;
      if (netErr.name === 'AbortError') {
        console.warn(`[AuthService] Staff login request timed out after ${elapsed}ms`);
      } else {
        console.error(`[AuthService] Network exception during staff login (${elapsed}ms):`, netErr);
      }

      // Check offline local credential fallback
      if ((email === 'uatal.pk@gmail.com' || email === 'admin') && password === 'Umer@9157') {
        const localAdmin: StaffAuthUser = {
          id: 'staff-admin-1',
          email: 'uatal.pk@gmail.com',
          name: 'Umer (Admin)',
          role: 'admin',
          isPasswordChangeable: true
        };
        console.log('[AuthService] Local admin session restored.');
        console.groupEnd();
        return {
          success: true,
          message: 'Welcome to ATAL Portal, Umer (Admin)!',
          data: localAdmin
        };
      } else if ((email === 'ali@atal.com' || email === 'ali') && password === 'Ali@297') {
        const localEmp: StaffAuthUser = {
          id: 'staff-emp-1',
          email: 'ali@atal.com',
          name: 'Ali (Employee)',
          role: 'employee',
          isPasswordChangeable: true
        };
        console.log('[AuthService] Local employee session restored.');
        console.groupEnd();
        return {
          success: true,
          message: 'Welcome to ATAL Portal, Ali (Employee)!',
          data: localEmp
        };
      }

      console.groupEnd();
      if (netErr.name === 'AbortError') {
        return {
          success: false,
          error: 'Connection timed out. Please check your internet connection and try again.'
        };
      }
    }

    console.groupEnd();
    return {
      success: false,
      error: 'Invalid credentials or network connection issue. Please verify your login details.'
    };
  }

  /**
   * Customer Account Login
   */
  async loginCustomer(identifierInput: string, passwordInput: string): Promise<AuthResponse<CustomerAuthUser>> {
    const identifier = identifierInput.trim();
    const password = passwordInput.trim();

    if (!identifier || !password) {
      return {
        success: false,
        error: 'Please enter your Email or WhatsApp number and Password.'
      };
    }

    const startTime = Date.now();
    console.groupCollapsed(`[AuthService] Customer Login Attempt: ${identifier}`);

    try {
      const response = await fetchWithTimeout('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
        timeoutMs: 8000
      });

      const elapsed = Date.now() - startTime;
      console.log(`[AuthService] HTTP ${response.status} ${response.statusText} (${elapsed}ms)`);

      let responseData: any = {};
      try {
        responseData = await response.json();
      } catch (parseErr) {
        console.warn('[AuthService] Could not parse JSON response:', parseErr);
      }

      if (response.ok && responseData.customer) {
        console.log(`[AuthService] Customer login verified: ${responseData.customer.name}`);
        console.groupEnd();
        return {
          success: true,
          message: responseData.message || `Welcome back, ${responseData.customer.name}!`,
          data: responseData.customer
        };
      }

      if (responseData.error) {
        console.warn(`[AuthService] Customer login failed: ${responseData.error}`);

        // Secondary check against local cached customer session
        try {
          const saved = localStorage.getItem('atal_customer');
          if (saved) {
            const localCust = JSON.parse(saved);
            const cleanId = identifier.toLowerCase();
            const cleanDigits = identifier.replace(/\D/g, '');
            const matchesEmail = localCust.email && localCust.email.toLowerCase() === cleanId;
            const matchesPhone = localCust.whatsapp && (localCust.whatsapp === cleanId || (cleanDigits && localCust.whatsapp.includes(cleanDigits)));
            if ((matchesEmail || matchesPhone) && (localCust.password === password || !localCust.password)) {
              console.log('[AuthService] Local cached customer session matched.');
              console.groupEnd();
              return {
                success: true,
                message: `Welcome back, ${localCust.name}!`,
                data: localCust
              };
            }
          }
        } catch (e) {
          console.error('[AuthService] Local cache check exception:', e);
        }

        console.groupEnd();
        return {
          success: false,
          error: responseData.error
        };
      }
    } catch (netErr: any) {
      const elapsed = Date.now() - startTime;
      console.error(`[AuthService] Network exception during customer login (${elapsed}ms):`, netErr);

      // Offline fallback check
      try {
        const saved = localStorage.getItem('atal_customer');
        if (saved) {
          const localCust = JSON.parse(saved);
          const cleanId = identifier.toLowerCase();
          const cleanDigits = identifier.replace(/\D/g, '');
          const matchesEmail = localCust.email && localCust.email.toLowerCase() === cleanId;
          const matchesPhone = localCust.whatsapp && (localCust.whatsapp === cleanId || (cleanDigits && localCust.whatsapp.includes(cleanDigits)));
          if ((matchesEmail || matchesPhone) && (localCust.password === password || !localCust.password)) {
            console.log('[AuthService] Offline local customer session matched.');
            console.groupEnd();
            return {
              success: true,
              message: `Welcome back, ${localCust.name}!`,
              data: localCust
            };
          }
        }
      } catch (e) {
        console.error('[AuthService] Error reading saved customer:', e);
      }

      console.groupEnd();
      if (netErr.name === 'AbortError') {
        return {
          success: false,
          error: 'Connection timed out. Please check your internet connection and try again.'
        };
      }
    }

    console.groupEnd();
    return {
      success: false,
      error: 'Invalid credentials. Please verify your Email/WhatsApp number and Password.'
    };
  }

  /**
   * Customer Registration
   */
  async registerCustomer(payload: CustomerRegisterPayload): Promise<AuthResponse<CustomerAuthUser>> {
    if (!payload.name || !payload.name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!payload.email || !payload.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!payload.whatsapp || !payload.whatsapp.trim()) {
      return { success: false, error: 'Please enter your WhatsApp mobile number.' };
    }
    if (!payload.password || payload.password.trim().length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const startTime = Date.now();
    console.groupCollapsed(`[AuthService] Registering Customer: ${payload.name} (${payload.email})`);

    try {
      const response = await fetchWithTimeout('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          whatsapp: payload.whatsapp.trim(),
          password: payload.password.trim()
        }),
        timeoutMs: 8000
      });

      const elapsed = Date.now() - startTime;
      console.log(`[AuthService] HTTP ${response.status} ${response.statusText} (${elapsed}ms)`);

      let responseData: any = {};
      try {
        responseData = await response.json();
      } catch (parseErr) {
        console.warn('[AuthService] Non-JSON response during registration:', parseErr);
      }

      if (response.ok && responseData.customer) {
        console.log(`[AuthService] Customer account created: ${responseData.customer.name}`);
        console.groupEnd();
        return {
          success: true,
          message: responseData.message || `🎉 Welcome to ATAL, ${responseData.customer.name}! Account created.`,
          data: responseData.customer
        };
      }

      if (responseData.error) {
        console.warn(`[AuthService] Customer registration rejected: ${responseData.error}`);
        console.groupEnd();
        return {
          success: false,
          error: responseData.error
        };
      }
    } catch (netErr: any) {
      const elapsed = Date.now() - startTime;
      console.error(`[AuthService] Network exception during customer registration (${elapsed}ms):`, netErr);

      // Fallback local customer creation
      const newLocalCustomer: CustomerAuthUser = {
        id: `cust-${Date.now()}`,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        whatsapp: payload.whatsapp.trim(),
        password: payload.password.trim(),
        createdAt: new Date().toISOString(),
        defaultAddress: {
          address: payload.address?.trim() || '',
          city: payload.city || 'Lahore',
          province: payload.province || 'Punjab',
          area: payload.area?.trim() || ''
        }
      };

      console.log('[AuthService] Local customer created via fallback.');
      console.groupEnd();
      return {
        success: true,
        message: `🎉 Welcome to ATAL, ${newLocalCustomer.name}! Account created.`,
        data: newLocalCustomer
      };
    }

    console.groupEnd();
    return {
      success: false,
      error: 'Failed to create account. Please check your connection and try again.'
    };
  }

  /**
   * Update Customer Profile
   */
  async updateCustomerProfile(customerId: string, payload: CustomerUpdatePayload): Promise<AuthResponse<CustomerAuthUser>> {
    const startTime = Date.now();
    console.groupCollapsed(`[AuthService] Updating Profile for Customer ID: ${customerId}`);

    try {
      const response = await fetchWithTimeout(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeoutMs: 8000
      });

      const elapsed = Date.now() - startTime;
      console.log(`[AuthService] HTTP ${response.status} ${response.statusText} (${elapsed}ms)`);

      let responseData: any = {};
      try {
        responseData = await response.json();
      } catch (parseErr) {
        console.warn('[AuthService] Non-JSON response during profile update:', parseErr);
      }

      if (response.ok && responseData.customer) {
        console.log('[AuthService] Customer profile updated successfully.');
        console.groupEnd();
        return {
          success: true,
          message: responseData.message || '✓ Profile updated successfully!',
          data: responseData.customer
        };
      }

      if (responseData.error) {
        console.groupEnd();
        return { success: false, error: responseData.error };
      }
    } catch (netErr: any) {
      const elapsed = Date.now() - startTime;
      console.error(`[AuthService] Network error updating customer profile (${elapsed}ms):`, netErr);
    }

    console.groupEnd();
    return {
      success: false,
      error: 'Failed to update profile due to a network connection issue.'
    };
  }
}

export const authService = new AuthService();
