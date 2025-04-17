import { API } from './api.js';
import { checkAuth, formatCurrency, formatDate, logout } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // Set up logout button
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Load customer data
  try {
    const token = localStorage.getItem('authToken');
    const customerData = await API.getCustomerData(token);
    
    // Update metrics
    updateCustomerMetrics(customerData.metrics);
    
    // Create charts
    createAcquisitionChart(customerData.acquisition);
    createValueChart(customerData.valueSegments);
    
    // Update segments
    updateCustomerSegments(customerData.segments);
    
    // Populate customer table
    populateCustomerTable(customerData.customers);
    
    // Set up event listeners
    setupCustomerPageInteractions();
    
  } catch (error) {
    console.error('Failed to load customer data:', error);
    alert('Failed to load customer data. Please try again.');
  }
  
  // Close menu on link click
  document.querySelectorAll('.menu ul li a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('menu-toggle').checked = false;
    });
  });
});

function updateCustomerMetrics(metrics) {
  document.getElementById('total-customers').textContent = metrics.totalCustomers;
  document.getElementById('repeat-customers').textContent = metrics.repeatCustomers;
  document.getElementById('repeat-rate').textContent = `${metrics.repeatRate}% repeat rate`;
  document.getElementById('avg-spend').textContent = formatCurrency(metrics.avgSpend);
  document.getElementById('avg-visits').textContent = metrics.avgVisits;
}

function createAcquisitionChart(acquisitionData) {
  const ctx = document.getElementById('acquisition-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: acquisitionData.labels,
      datasets: [{
        label: 'New Customers',
        data: acquisitionData.values,
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function createValueChart(valueData) {
  const ctx = document.getElementById('value-chart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: valueData.labels,
      datasets: [{
        data: valueData.values,
        backgroundColor: [
          'rgba(46, 204, 113, 0.7)',
          'rgba(52, 152, 219, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(155, 89, 182, 0.7)'
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

function updateCustomerSegments(segments) {
  document.getElementById('high-value-count').textContent = segments.highValue;
  document.getElementById('loyal-count').textContent = segments.loyal;
  document.getElementById('at-risk-count').textContent = segments.atRisk;
  document.getElementById('new-count').textContent = segments.new;
}

function populateCustomerTable(customers) {
  const tableBody = document.querySelector('#customers-table tbody');
  tableBody.innerHTML = '';
  
  customers.forEach(customer => {
    const row = document.createElement('tr');
    
    // Determine segment tag
    let segmentClass, segmentText;
    if (customer.segment === 'high_value') {
      segmentClass = 'high-value';
      segmentText = 'High Value';
    } else if (customer.segment === 'loyal') {
      segmentClass = 'loyal';
      segmentText = 'Loyal';
    } else if (customer.segment === 'at_risk') {
      segmentClass = 'at-risk';
      segmentText = 'At Risk';
    } else if (customer.segment === 'new') {
      segmentClass = 'new';
      segmentText = 'New';
    }
    
    row.innerHTML = `
      <td>${customer.name || 'Unknown'}</td>
      <td>${customer.email || 'N/A'}</td>
      <td>${customer.phone || 'N/A'}</td>
      <td>${formatCurrency(customer.totalSpend)}</td>
      <td>${customer.visitCount}</td>
      <td>${customer.lastVisit ? formatDate(customer.lastVisit) : 'Never'}</td>
      <td><span class="segment-tag ${segmentClass}">${segmentText}</span></td>
    `;
    
    tableBody.appendChild(row);
  });
}

function setupCustomerPageInteractions() {
  // Period selector change handler
  document.getElementById('customer-period').addEventListener('change', async (e) => {
    try {
      const token = localStorage.getItem('authToken');
      const period = e.target.value;
      const customerData = await API.getCustomerData(token, period);
      
      updateCustomerMetrics(customerData.metrics);
      updateCustomerSegments(customerData.segments);
      populateCustomerTable(customerData.customers);
      
    } catch (error) {
      console.error('Failed to update customer data:', error);
      alert('Failed to update customer data. Please try again.');
    }
  });
  
  // Search functionality
  document.getElementById('customer-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#customers-table tbody tr');
    
    rows.forEach(row => {
      const name = row.cells[0].textContent.toLowerCase();
      const email = row.cells[1].textContent.toLowerCase();
      const phone = row.cells[2].textContent.toLowerCase();
      
      const matchesSearch = name.includes(searchTerm) || 
                          email.includes(searchTerm) || 
                          phone.includes(searchTerm);
      
      row.style.display = matchesSearch ? '' : 'none';
    });
  });
  
  // Export button click handler
  document.getElementById('export-customers-btn').addEventListener('click', () => {
    // Implement export functionality
    alert('Export functionality will be implemented');
  });
}