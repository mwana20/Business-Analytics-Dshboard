import { API } from './api.js';
import { checkAuth, formatCurrency, formatDate, logout } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // Set up logout button
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Load sales data
  try {
    const token = localStorage.getItem('authToken');
    const salesData = await API.getSalesData(token);
    
    // Update summary cards
    document.getElementById('total-sales').textContent = formatCurrency(salesData.summary.totalSales);
    document.getElementById('total-transactions').textContent = salesData.summary.transactionCount;
    document.getElementById('avg-order-value').textContent = formatCurrency(salesData.summary.avgOrderValue);
    
    // Create sales trend chart
    createSalesTrendChart(salesData.trend);
    
    // Populate sales table
    populateSalesTable(salesData.recentTransactions);
    
    // Set up event listeners
    setupSalesPageInteractions();
    
  } catch (error) {
    console.error('Failed to load sales data:', error);
    alert('Failed to load sales data. Please try again.');
  }
});

function createSalesTrendChart(trendData) {
  const ctx = document.getElementById('sales-trend-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [{
        label: 'Daily Sales',
        data: trendData.values,
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        borderColor: 'rgba(46, 204, 113, 1)',
        borderWidth: 2,
        tension: 0.1
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

function populateSalesTable(transactions) {
  const tableBody = document.querySelector('#sales-table tbody');
  tableBody.innerHTML = '';
  
  transactions.forEach(transaction => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${formatDate(transaction.date)}</td>
      <td>${transaction.id}</td>
      <td>${transaction.customer || 'Walk-in'}</td>
      <td>${transaction.items.length} items</td>
      <td>${formatCurrency(transaction.amount)}</td>
      <td>
        <button class="btn-view" data-id="${transaction.id}">View</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

function setupSalesPageInteractions() {
  // Add sale button click handler
  document.getElementById('add-sale-btn').addEventListener('click', () => {
    document.getElementById('add-sale-modal').style.display = 'block';
  });
  
  // Close modal button
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('add-sale-modal').style.display = 'none';
  });
  
  // Customer select change handler
  document.getElementById('sale-customer').addEventListener('change', (e) => {
    const newCustomerFields = document.getElementById('new-customer-fields');
    newCustomerFields.style.display = e.target.value === '' ? 'block' : 'none';
  });
  
  // Add item button click handler
  document.getElementById('add-item-btn').addEventListener('click', addSaleItemRow);
  
  // Form submission handler
  document.getElementById('add-sale-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Implement form submission logic
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('add-sale-modal')) {
      document.getElementById('add-sale-modal').style.display = 'none';
    }
  });
}

function addSaleItemRow() {
  const container = document.getElementById('sale-items-container');
  const itemCount = container.children.length;
  const itemDiv = document.createElement('div');
  itemDiv.className = 'sale-item';
  itemDiv.innerHTML = `
    <select class="item-select">
      <option value="">Select Item</option>
      <!-- Items would be populated from API -->
    </select>
    <input type="number" class="item-quantity" placeholder="Qty" min="1" value="1">
    <input type="number" class="item-price" placeholder="Price" step="0.01" min="0">
    <button type="button" class="btn-remove-item">×</button>
  `;
  container.appendChild(itemDiv);
  
  // Add remove item handler
  itemDiv.querySelector('.btn-remove-item').addEventListener('click', () => {
    container.removeChild(itemDiv);
    calculateSaleTotal();
  });
  
  // Add change handlers for quantity/price
  itemDiv.querySelector('.item-quantity').addEventListener('change', calculateSaleTotal);
  itemDiv.querySelector('.item-price').addEventListener('change', calculateSaleTotal);
}

function calculateSaleTotal() {
  let total = 0;
  const items = document.querySelectorAll('.sale-item');
  
  items.forEach(item => {
    const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(item.querySelector('.item-price').value) || 0;
    total += quantity * price;
  });
  
  document.getElementById('sale-total').value = total.toFixed(2);
}