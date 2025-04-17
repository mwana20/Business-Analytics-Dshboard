import { API } from './api.js';
import { checkAuth, logout } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // Set up logout button
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Load inventory data
  try {
    const token = localStorage.getItem('authToken');
    const inventoryData = await API.getInventoryData(token);
    
    // Display low stock alerts
    displayLowStockAlerts(inventoryData.lowStockItems);
    
    // Populate inventory table
    populateInventoryTable(inventoryData.items);
    
    // Set up event listeners
    setupInventoryPageInteractions();
    
  } catch (error) {
    console.error('Failed to load inventory data:', error);
    alert('Failed to load inventory data. Please try again.');
  }
});

document.querySelectorAll('.menu ul li a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('menu-toggle').checked = false;
  });
});

function displayLowStockAlerts(lowStockItems) {
  const alertsContainer = document.getElementById('alerts-container');
  alertsContainer.innerHTML = '';
  
  if (lowStockItems.length === 0) {
    alertsContainer.innerHTML = '<p class="no-alerts">No low stock items at this time.</p>';
    return;
  }
  
  lowStockItems.forEach(item => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-item';
    alertDiv.innerHTML = `
      <span class="alert-product">${item.name}</span>
      <span class="alert-stock">Only ${item.stock} remaining (threshold: ${item.threshold})</span>
    `;
    alertsContainer.appendChild(alertDiv);
  });
}

function populateInventoryTable(items) {
  const tableBody = document.querySelector('#inventory-table tbody');
  tableBody.innerHTML = '';
  
  // Get unique categories for filter
  const categories = [...new Set(items.map(item => item.category))];
  const categoryFilter = document.getElementById('category-filter');
  
  // Add category options to filter
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Add items to table
  items.forEach(item => {
    const row = document.createElement('tr');
    
    // Determine stock status
    let statusClass, statusText;
    if (item.stock === 0) {
      statusClass = 'out-of-stock';
      statusText = 'Out of Stock';
    } else if (item.stock <= item.threshold) {
      statusClass = 'low-stock';
      statusText = 'Low Stock';
    } else {
      statusClass = 'in-stock';
      statusText = 'In Stock';
    }
    
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.sku || 'N/A'}</td>
      <td>${item.category || 'Uncategorized'}</td>
      <td>${item.stock}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><span class="stock-status ${statusClass}">${statusText}</span></td>
      <td>
        <button class="btn-view" data-id="${item.id}">Edit</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

function setupInventoryPageInteractions() {
  // Add item button click handler
  document.getElementById('add-item-btn').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Add Inventory Item';
    document.getElementById('item-id').value = '';
    document.getElementById('inventory-form').reset();
    document.getElementById('inventory-modal').style.display = 'block';
  });
  
  // Close modal button
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('inventory-modal').style.display = 'none';
  });
  
  // Form submission handler
  document.getElementById('inventory-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Implement form submission logic
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('inventory-modal')) {
      document.getElementById('inventory-modal').style.display = 'none';
    }
  });
  
  // Edit button click handlers (delegated)
  document.querySelector('#inventory-table tbody').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-view')) {
      const itemId = e.target.getAttribute('data-id');
      // Implement edit functionality
    }
  });
  
  // Search and filter functionality
  document.getElementById('inventory-search').addEventListener('input', filterInventory);
  document.getElementById('category-filter').addEventListener('change', filterInventory);
  document.getElementById('stock-filter').addEventListener('change', filterInventory);
}

function filterInventory() {
  const searchTerm = document.getElementById('inventory-search').value.toLowerCase();
  const categoryFilter = document.getElementById('category-filter').value;
  const stockFilter = document.getElementById('stock-filter').value;
  
  const rows = document.querySelectorAll('#inventory-table tbody tr');
  
  rows.forEach(row => {
    const name = row.cells[0].textContent.toLowerCase();
    const category = row.cells[2].textContent;
    const status = row.cells[5].querySelector('.stock-status').textContent;
    
    const matchesSearch = name.includes(searchTerm);
    const matchesCategory = !categoryFilter || category === categoryFilter;
})
};