/**
 * Utility functions for cookie management
 */

/**
 * Clear all cookies from the current domain
 */
export const clearAllCookies = (): void => {
  // Get all cookies
  const cookies = document.cookie.split(";");
  
  // Clear each cookie by setting it to expire in the past
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    if (name) {
      // Clear cookie for current path
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      
      // Clear cookie for current domain
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      
      // Clear cookie for parent domain (with dot prefix)
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    }
  });
};

/**
 * Clear a specific cookie by name
 */
export const clearCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
};

/**
 * Logout utility that clears both localStorage and cookies
 */
export const performLogout = (): void => {
  // Clear localStorage (for Redux persist and other local data)
  localStorage.clear();
  
  // Clear all cookies
  clearAllCookies();
};