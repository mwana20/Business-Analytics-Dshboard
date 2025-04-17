import { API } from './api.js';
import { checkAuth, formatCurrency, logout } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // Set up logout button
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Load marketing data
  try {
    const token = localStorage.getItem('authToken');
    const marketingData = await API.getMarketingData(token);
    
    // Update metrics
    updateMarketingMetrics(marketingData.metrics);
    
    // Create charts
    createSpendRevenueChart(marketingData.spendVsRevenue);
    createChannelChart(marketingData.channelPerformance);
    
    // Populate campaigns table
    populateCampaignsTable(marketingData.campaigns);
    
    // Set up event listeners
    setupMarketingPageInteractions();
    
  } catch (error) {
    console.error('Failed to load marketing data:', error);
    alert('Failed to load marketing data. Please try again.');
  }
});

function updateMarketingMetrics(metrics) {
  document.getElementById('total-spend').textContent = formatCurrency(metrics.totalSpend);
  document.getElementById('spend-change').textContent = `${metrics.spendChange}% vs last period`;
  document.getElementById('total-revenue').textContent = formatCurrency(metrics.totalRevenue);
  document.getElementById('revenue-change').textContent = `${metrics.revenueChange}% vs last period`;
  document.getElementById('roas').textContent = metrics.roas.toFixed(2);
  document.getElementById('cpa').textContent = formatCurrency(metrics.cpa);
  
  // Style ROAS based on performance
  const roasElement = document.getElementById('roas');
  roasElement.className = metrics.roas >= 1 ? 'roas-positive' : 'roas-negative';
}

function createSpendRevenueChart(data) {
  const ctx = document.getElementById('spend-revenue-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Spend',
          data: data.spend,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
        },
        {
          label: 'Revenue',
          data: data.revenue,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

function createChannelChart(data) {
  const ctx = document.getElementById('channel-chart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: [
          'rgba(59, 89, 152, 0.7)',
          'rgba(66, 133, 244, 0.7)',
          'rgba(29, 161, 242, 0.7)',
          'rgba(255, 193, 7, 0.7)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

function populateCampaignsTable(campaigns) {
  const tableBody = document.querySelector('#campaigns-table tbody');
  tableBody.innerHTML = '';
  
  campaigns.forEach(campaign => {
    const row = document.createElement('tr');
    
    // Determine ROAS class
    const roasClass = campaign.roas >= 1 ? 'roas-positive' : 'roas-negative';
    
    row.innerHTML = `
      <td>${campaign.name}</td>
      <td>${campaign.channel}</td>
      <td>${formatCurrency(campaign.spend)}</td>
      <td>${formatCurrency(campaign.revenue)}</td>
      <td class="${roasClass}">${campaign.roas.toFixed(2)}</td>
      <td>${campaign.impressions.toLocaleString()}</td>
      <td>${campaign.clicks.toLocaleString()}</td>
      <td>${formatCurrency(campaign.cpa)}</td>
    `;
    
    tableBody.appendChild(row);
  });
}

function setupMarketingPageInteractions() {
  // Connect ads button click handler
  document.getElementById('connect-ads-btn').addEventListener('click', () => {
    document.getElementById('connect-ads-modal').style.display = 'block';
  });
  
  // Close modal button
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('connect-ads-modal').style.display = 'none';
  });
  
  // Connect Facebook button
  document.getElementById('connect-fb-btn').addEventListener('click', () => {
    // Implement Facebook connection
    alert('Facebook connection will be implemented');
  });
  
  // Connect Google button
  document.getElementById('connect-google-btn').addEventListener('click', () => {
    // Implement Google connection
    alert('Google connection will be implemented');
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('connect-ads-modal')) {
      document.getElementById('connect-ads-modal').style.display = 'none';
    }
  });
  
  // Period selector change handler
  document.getElementById('marketing-period').addEventListener('change', async (e) => {
    try {
      const token = localStorage.getItem('authToken');
      const period = e.target.value;
      const marketingData = await API.getMarketingData(token, period);
      
      updateMarketingMetrics(marketingData.metrics);
      populateCampaignsTable(marketingData.campaigns);
      
    } catch (error) {
      console.error('Failed to update marketing data:', error);
      alert('Failed to update marketing data. Please try again.');
    }
  });
  
  // Search functionality
  document.getElementById('campaign-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#campaigns-table tbody tr');
    
    rows.forEach(row => {
      const campaign = row.cells[0].textContent.toLowerCase();
      const channel = row.cells[1].textContent.toLowerCase();
      
      const matchesSearch = campaign.includes(searchTerm) || 
                          channel.includes(searchTerm);
      
      row.style.display = matchesSearch ? '' : 'none';
    });
  });
  
  // Menu link interactions
  document.querySelectorAll('.menu ul li a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('menu-toggle').checked = false;
    });
  });
}