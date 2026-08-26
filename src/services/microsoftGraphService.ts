import { PublicClientApplication, Configuration, PopupRequest } from '@azure/msal-browser';

// Retrieve values from Vite environment variables (fallback to placeholder values)
const CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'your-client-app-id-here';
const TENANT_ID = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common';

const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.origin, // e.g. http://localhost:5173
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage'
  }
};

// Scopes required to authenticate and fetch calendar items
const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'Calendars.Read']
};

let msalInstance: PublicClientApplication | null = null;

// Initialize MSAL client lazily to avoid timing issues on load
const getMsalInstance = async (): Promise<PublicClientApplication> => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }
  return msalInstance;
};

export const microsoftGraphService = {
  /**
   * Log the user in via Popup
   */
  login: async () => {
    try {
      const instance = await getMsalInstance();
      const loginResponse = await instance.loginPopup(loginRequest);
      return loginResponse.account;
    } catch (error) {
      console.error('MSAL Login Error:', error);
      throw error;
    }
  },

  /**
   * Log the user out
   */
  logout: async () => {
    try {
      const instance = await getMsalInstance();
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        await instance.logoutPopup({
          account: accounts[0],
          postLogoutRedirectUri: window.location.origin
        });
      }
    } catch (error) {
      console.error('MSAL Logout Error:', error);
      throw error;
    }
  },

  /**
   * Retrieve the active logged in account
   */
  getAccount: async () => {
    const instance = await getMsalInstance();
    const accounts = instance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  },

  /**
   * Retrieve active Access Token silently, fallback to interactive popup on expiry/challenge
   */
  getAccessToken: async (): Promise<string> => {
    const instance = await getMsalInstance();
    const accounts = instance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No user account active. Please connect your Microsoft Calendar.');
    }

    const tokenRequest = {
      scopes: ['Calendars.Read'],
      account: accounts[0]
    };

    try {
      const response = await instance.acquireTokenSilent(tokenRequest);
      return response.accessToken;
    } catch (error) {
      console.warn('Silent token acquisition failed. Prompting user interactively...', error);
      try {
        const response = await instance.acquireTokenPopup(tokenRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error('Interactive token acquisition failed:', popupError);
        throw popupError;
      }
    }
  },

  /**
   * Fetch calendar events from Microsoft Graph API based on chosen time range
   */
  fetchCalendarEvents: async (filterType: 'today' | '7days' | 'month'): Promise<any[]> => {
    const token = await microsoftGraphService.getAccessToken();

    // Compute dynamic window bounds
    const now = new Date();
    let startDateTime = new Date();
    let endDateTime = new Date();

    if (filterType === 'today') {
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime.setHours(23, 59, 59, 999);
    } else if (filterType === '7days') {
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime.setDate(now.getDate() + 7);
      endDateTime.setHours(23, 59, 59, 999);
    } else if (filterType === 'month') {
      startDateTime = new Date(now.getFullYear(), now.getMonth(), 1);
      endDateTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const startISO = startDateTime.toISOString();
    const endISO = endDateTime.toISOString();

    // Query Microsoft Graph calendarView, which expands recurring occurrences
    const graphUrl = `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${encodeURIComponent(startISO)}&endDateTime=${encodeURIComponent(endISO)}&$top=50&$select=id,subject,bodyPreview,start,end,location,organizer,onlineMeeting,isCancelled,importance`;

    const response = await fetch(graphUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'outlook.timezone="local"' // Requests local timezone coordinates
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Microsoft Graph request failed: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  }
};
