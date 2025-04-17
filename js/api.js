const API_BASE_URL = 'https://your-api-endpoint.com/api';

export const API = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    return await response.json();
  },

  async register(email, password, businessName, role) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, businessName, role })
    });
    
    return await response.json();
  },

  async getSalesData(token) {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return await response.json();
  },

  // Add other API methods for customer, inventory, marketing data
};