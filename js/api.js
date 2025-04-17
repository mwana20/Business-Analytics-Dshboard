const API_BASE_URL = 'https://your-api-endpoint.com/api';

export const API = {

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