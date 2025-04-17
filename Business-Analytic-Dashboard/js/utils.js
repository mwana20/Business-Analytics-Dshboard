export function navigateTo(path) {
    window.location.href = path;
  }
  
  export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  export function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigateTo('index.html');
      return false;
    }
    return true;
  }
  
  export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigateTo('index.html');
  }