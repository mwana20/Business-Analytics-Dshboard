import { API } from './api.js';
import { checkAuth, formatCurrency, formatDate, logout } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // Set up logout button
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Close menu on link click
  document.querySelectorAll('.menu ul li a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('menu-toggle').checked = false;
    });
  });
  
  // Load dashboard data
  try {
    const token = localStorage.getItem('authToken');
    const data = await API.getDashboardData(token);
    
    // Update metrics
    document.getElementById('total-revenue').textContent = formatCurrency(data.metrics.totalRevenue);
    document.getElementById('revenue-change').textContent = `${data.metrics.revenueChange}% vs last period`;
    document.getElementById('new-customers').textContent = data.metrics.newCustomers;
    document.getElementById('customer-change').textContent = `${data.metrics.customerChange}% vs last period`;
    document.getElementById('repeat-customers').textContent = data.metrics.repeatCustomers;
    document.getElementById('repeat-change').textContent = `${data.metrics.repeatChange}% vs last period`;
    document.getElementById('inventory-alerts').textContent = data.metrics.lowStockItems;
    
    // Update recent activity
    const activityList = document.getElementById('activity-list');
    data.recentActivity.forEach(activity => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="activity-date">${formatDate(activity.date)}</span>
        <span class="activity-message">${activity.message}</span>
      `;
      activityList.appendChild(li);
    });
    
    // Create charts
    createRevenueChart(data.revenueTrend);
    createCustomerChart(data.customerAcquisition);
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    alert('Failed to load dashboard data. Please try again.');
  }
});

function createRevenueChart(data) {
  const ctx = document.getElementById('revenue-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Revenue',
        data: data.values,
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value;
            }
          }
        }
      }
    }
  });
}

function createCustomerChart(data) {
  const ctx = document.getElementById('customer-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'New Customers',
          data: data.newCustomers,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
        },
        {
          label: 'Repeat Customers',
          data: data.repeatCustomers,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true
        }
      }
    }
  });
}