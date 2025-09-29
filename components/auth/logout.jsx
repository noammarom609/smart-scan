import { toast } from 'sonner';

// Auth keys that should be cleared on logout
const AUTH_KEYS = [
  'access_token',
  'id_token', 
  'base44.auth',
  'supabase.auth.token',
  'msal.account',
  'msal.token.keys',
  'firebase:authUser',
  'g_state',
  'oauth_state',
  'oauth_code_verifier'
];

// Helper function to get CSRF token if available
const getCsrfToken = () => {
  // Check for CSRF token in meta tag
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (csrfMeta) {
    return csrfMeta.getAttribute('content');
  }
  
  // Check for CSRF token in cookie
  const csrfCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='));
  
  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  }
  
  return null;
};

// Helper function to delete cookies
const deleteCookie = (name, path = '/', domain = '') => {
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path};`;
  if (domain) {
    cookieString += ` domain=${domain};`;
  }
  document.cookie = cookieString;
};

// Clear client-side storage
const clearClientStorage = () => {
  try {
    // Clear localStorage
    AUTH_KEYS.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key} from localStorage:`, e);
      }
    });

    // Clear sessionStorage
    AUTH_KEYS.forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key} from sessionStorage:`, e);
      }
    });

    // Clear auth-related cookies
    const authCookies = ['access_token', 'id_token', 'refresh_token', 'auth_session'];
    authCookies.forEach(cookieName => {
      deleteCookie(cookieName);
      deleteCookie(cookieName, '/', window.location.hostname);
      deleteCookie(cookieName, '/', `.${window.location.hostname}`);
    });

    console.log('Client storage cleared successfully');
  } catch (error) {
    console.error('Error clearing client storage:', error);
  }
};

// Handle third-party auth libraries
const handleThirdPartyLogout = async () => {
  const logoutPromises = [];

  try {
    // Supabase
    if (window.supabase && typeof window.supabase.auth?.signOut === 'function') {
      console.log('Logging out from Supabase...');
      logoutPromises.push(
        window.supabase.auth.signOut().catch(e => 
          console.warn('Supabase logout failed:', e)
        )
      );
    }

    // Firebase
    if (window.firebase && window.firebase.auth) {
      console.log('Logging out from Firebase...');
      logoutPromises.push(
        window.firebase.auth().signOut().catch(e => 
          console.warn('Firebase logout failed:', e)
        )
      );
    }

    // Auth0
    if (window.auth0Client && typeof window.auth0Client.logout === 'function') {
      console.log('Logging out from Auth0...');
      // Note: Auth0 logout will redirect, so this should be called last
      window.auth0Client.logout({ 
        returnTo: window.location.origin + '/login',
        federated: true 
      });
      return; // Don't continue with other logout steps
    }

    // MSAL (Microsoft)
    if (window.msalInstance && typeof window.msalInstance.logoutRedirect === 'function') {
      console.log('Logging out from MSAL...');
      window.msalInstance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin + '/login'
      });
      return; // Don't continue with other logout steps
    }

    // Wait for third-party logouts to complete
    if (logoutPromises.length > 0) {
      await Promise.allSettled(logoutPromises);
    }

  } catch (error) {
    console.error('Error in third-party logout:', error);
  }
};

// Server logout request
const serverLogout = async (retryCount = 0) => {
  const maxRetries = 1;
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    // Add CSRF token if available
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers
    });

    if (!response.ok) {
      throw new Error(`Server logout failed: ${response.status} ${response.statusText}`);
    }

    console.log('Server logout successful');
    return true;

  } catch (error) {
    console.warn('Server logout failed:', error);

    // Retry once on failure
    if (retryCount < maxRetries) {
      console.log('Retrying server logout...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return serverLogout(retryCount + 1);
    }

    // Try alternative logout endpoints
    const alternativeEndpoints = ['/oauth/logout', '/auth/logout', '/logout'];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          console.log(`Alternative logout successful: ${endpoint}`);
          return true;
        }
      } catch (e) {
        // Continue to next endpoint
      }
    }

    console.warn('All server logout attempts failed, proceeding with client-side cleanup');
    return false;
  }
};

// Main logout function
export const logout = async () => {
  try {
    console.log('Starting logout process...');

    // Step 1: Server logout (attempt to invalidate server-side session and tokens)
    await serverLogout();

    // Step 2: Handle third-party auth providers
    await handleThirdPartyLogout();

    // Step 3: Clear client-side storage
    clearClientStorage();

    // Step 4: Clear any app-specific state
    // If you have a global state management library (Redux, Zustand, etc.)
    // you should clear the auth state here
    if (window.authStore && typeof window.authStore.reset === 'function') {
      window.authStore.reset();
    }

    // Step 5: Disconnect WebSockets if any
    if (window.websocket && window.websocket.close) {
      window.websocket.close();
    }

    // Step 6: Cancel any ongoing polling/timers
    if (window.authRefreshTimer) {
      clearInterval(window.authRefreshTimer);
      window.authRefreshTimer = null;
    }

    console.log('Logout process completed successfully');

    // Step 7: Navigate to login page
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);

  } catch (error) {
    console.error('Logout process failed:', error);
    
    // Analytics
    if (window.gtag) {
      window.gtag('event', 'logout_failed', {
        error: error.message
      });
    }

    // Even if logout fails, try to clear storage and redirect
    try {
      clearClientStorage();
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (fallbackError) {
      console.error('Fallback logout failed:', fallbackError);
      toast.error('שגיאה חמורה בהתנתקות. אנא סגור את הדפדפן ופתח מחדש.');
    }

    throw error;
  }
};