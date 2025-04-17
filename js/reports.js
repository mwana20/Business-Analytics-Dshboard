import { API } from './api.js';
import { checkAuth, formatCurrency, formatDate, logout } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // Set up logout button
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Load report data
  try {
    const token = localStorage.getItem('authToken');
    const reportData = await API.getReportData(token, 'profit-loss', '30');
    
    // Update profit & loss report
    updateProfitLossReport(reportData);
    
    // Set up event listeners
    setupReportPageInteractions();
    
  } catch (error) {
    console.error('Failed to load report data:', error);
    alert('Failed to load report data. Please try again.');
  }
});

function updateProfitLossReport(data) {
  // Update period label
  document.getElementById('report-period-label').textContent = data.period;
  
  // Update revenue section
  document.getElementById('product-sales').textContent = formatCurrency(data.revenue.productSales);
  document.getElementById('service-revenue').textContent = formatCurrency(data.revenue.serviceRevenue);
  document.getElementById('other-income').textContent = formatCurrency(data.revenue.otherIncome);
  document.getElementById('total-revenue').textContent = formatCurrency(data.revenue.total);
  
  // Update COGS section
  document.getElementById('inventory-costs').textContent = formatCurrency(data.cogs.inventory);
  document.getElementById('labor-costs').textContent = formatCurrency(data.cogs.labor);
  document.getElementById('material-costs').textContent = formatCurrency(data.cogs.materials);
  document.getElementById('total-cogs').textContent = formatCurrency(data.cogs.total);
  
  // Update gross profit
  document.getElementById('gross-profit').textContent = formatCurrency(data.grossProfit.amount);
  document.getElementById('gross-margin').textContent = `${data.grossProfit.margin}%`;
  
  // Update expenses
  document.getElementById('rent-expense').textContent = formatCurrency(data.expenses.rent);
  document.getElementById('utilities-expense').textContent = formatCurrency(data.expenses.utilities);
  document.getElementById('marketing-expense').textContent = formatCurrency(data.expenses.marketing);
  document.getElementById('salaries-expense').textContent = formatCurrency(data.expenses.salaries);
  document.getElementById('other-expenses').textContent = formatCurrency(data.expenses.other);
  document.getElementById('total-expenses').textContent = formatCurrency(data.expenses.total);
  
  // Update net profit
  document.getElementById('net-profit').textContent = formatCurrency(data.netProfit.amount);
  document.getElementById('profit-margin').textContent = `${data.netProfit.margin}%`;
}

function setupReportPageInteractions() {
  // Report type change handler
  document.getElementById('report-type').addEventListener('change', async (e) => {
    const reportType = e.target.value;
    const period = document.getElementById('report-period').value;
    
    // Hide all reports
    document.querySelectorAll('.report-container').forEach(container => {
      container.classList.remove('active');
    });
    
    // Show selected report
    document.getElementById(`${reportType}-report`).classList.add('active');
    
    try {
      const token = localStorage.getItem('authToken');
      const reportData = await API.getReportData(token, reportType, period);
      
      // Update the appropriate report based on type
      switch(reportType) {
        case 'profit-loss':
          updateProfitLossReport(reportData);
          break;
        case 'sales':
          updateSalesReport(reportData);
          break;
        case 'expenses':
          updateExpensesReport(reportData);
          break;
        case 'inventory':
          updateInventoryReport(reportData);
          break;
        case 'custom':
          setupCustomReport(reportData);
          break;
      }
      
    } catch (error) {
      console.error(`Failed to load ${reportType} report:`, error);
      alert(`Failed to load ${reportType} report. Please try again.`);
    }
  });
  
  // Period selector change handler
  document.getElementById('report-period').addEventListener('change', async (e) => {
    const period = e.target.value;
    const reportType = document.getElementById('report-type').value;
    
    try {
      const token = localStorage.getItem('authToken');
      const reportData = await API.getReportData(token, reportType, period);
      
      // Update the current report
      switch(reportType) {
        case 'profit-loss':
          updateProfitLossReport(reportData);
          break;
        case 'sales':
          updateSalesReport(reportData);
          break;
        case 'expenses':
          updateExpensesReport(reportData);
          break;
        case 'inventory':
          updateInventoryReport(reportData);
          break;
      }
      
    } catch (error) {
      console.error('Failed to update report:', error);
      alert('Failed to update report. Please try again.');
    }
  });
  
  // Export button click handler
  document.getElementById('export-report-btn').addEventListener('click', () => {
    const reportType = document.getElementById('report-type').value;
    const format = document.getElementById('report-format').value;
    
    // Implement export functionality
    alert(`Exporting ${reportType} report as ${format.toUpperCase()}`);
  });
}

function updateSalesReport(data) {
  document.querySelector('#sales-report .report-period').textContent = data.period;
  
  // Update overview
  document.getElementById('total-sales').textContent = formatCurrency(data.overview.totalSales);
  document.getElementById('transaction-count').textContent = data.overview.transactionCount;
  document.getElementById('avg-order-value').textContent = formatCurrency(data.overview.avgOrderValue);
  
  // Update sales by category
  createSalesCategoryChart(data.salesByCategory);
  populateSalesCategoryTable(data.salesByCategory);
  
  // Update sales trend
  createSalesTrendChart(data.salesTrend);
}

function updateExpensesReport(data) {
  document.querySelector('#expenses-report .report-period').textContent = data.period;
  
  // Update overview
  document.getElementById('total-expenses-summary').textContent = formatCurrency(data.overview.total);
  document.getElementById('fixed-expenses').textContent = formatCurrency(data.overview.fixed);
  document.getElementById('variable-expenses').textContent = formatCurrency(data.overview.variable);
  document.getElementById('expenses-percentage').textContent = `${data.overview.percentage}%`;
  
  // Update expenses by category
  createExpensesCategoryChart(data.expensesByCategory);
  populateExpensesCategoryTable(data.expensesByCategory);
  
  // Update expenses trend
  createExpensesTrendChart(data.expensesTrend);
}

function updateInventoryReport(data) {
  document.querySelector('#inventory-report .report-period').textContent = 'Current';
  
  // Update overview
  document.getElementById('total-inventory-value').textContent = formatCurrency(data.overview.totalValue);
  document.getElementById('product-count').textContent = data.overview.productCount;
  document.getElementById('inventory-turnover').textContent = `${data.overview.turnoverDays} days`;
  
  // Update inventory by category
  createInventoryCategoryChart(data.inventoryByCategory);
  populateInventoryCategoryTable(data.inventoryByCategory);
  
  // Update low stock items
  populateLowStockTable(data.lowStockItems);
}

function setupCustomReport(data) {
  // Populate available columns
  const columnsContainer = document.getElementById('available-columns');
  columnsContainer.innerHTML = '';
  
  data.availableColumns.forEach(column => {
    const div = document.createElement('div');
    div.className = 'column-checkbox';
    div.innerHTML = `
      <input type="checkbox" id="col-${column.id}" value="${column.id}">
      <label for="col-${column.id}">${column.name}</label>
    `;
    columnsContainer.appendChild(div);
  });
  
  // Populate filter fields
  const filterFieldSelect = document.getElementById('filter-field');
  filterFieldSelect.innerHTML = '<option value="">Select field...</option>';
  
  data.filterableFields.forEach(field => {
    const option = document.createElement('option');
    option.value = field.id;
    option.textContent = field.name;
    filterFieldSelect.appendChild(option);
  });
  
  // Set up generate report button
  document.getElementById('generate-custom-report-btn').addEventListener('click', generateCustomReport);
}

function generateCustomReport() {
  // Get selected columns
  const selectedColumns = [];
  document.querySelectorAll('#available-columns input:checked').forEach(checkbox => {
    selectedColumns.push(checkbox.value);
  });
  
  // Get active filters
  const activeFilters = [];
  document.querySelectorAll('.active-filter').forEach(filter => {
    const field = filter.getAttribute('data-field');
    const operator = filter.getAttribute('data-operator');
    const value = filter.getAttribute('data-value');
    activeFilters.push({ field, operator, value });
  });
  
  // In a real app, we would fetch data based on these selections
  // For now, we'll just show a placeholder
  const resultsSection = document.getElementById('custom-report-results');
  resultsSection.style.display = 'block';
  
  const table = document.getElementById('custom-report-table');
  table.innerHTML = `
    <thead>
      <tr>
        ${selectedColumns.map(col => `<th>${col}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="${selectedColumns.length}">Custom report data would appear here based on your selections</td>
      </tr>
    </tbody>
  `;
}

// Chart creation functions
function createSalesCategoryChart(data) {
  const ctx = document.getElementById('sales-category-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Sales by Category',
        data: data.values,
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
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

function createSalesTrendChart(data) {
  const ctx = document.getElementById('sales-trend-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Sales Trend',
        data: data.values,
        borderColor: 'rgba(46, 204, 113, 1)',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        fill: true,
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

function createExpensesCategoryChart(data) {
  const ctx = document.getElementById('expenses-category-chart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: [
          'rgba(231, 76, 60, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(52, 152, 219, 0.7)',
          'rgba(155, 89, 182, 0.7)',
          'rgba(26, 188, 156, 0.7)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

function createExpensesTrendChart(data) {
  const ctx = document.getElementById('expenses-trend-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Expenses Trend',
        data: data.values,
        borderColor: 'rgba(231, 76, 60, 1)',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        fill: true,
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

function createInventoryCategoryChart(data) {
  const ctx = document.getElementById('inventory-category-chart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',
          'rgba(155, 89, 182, 0.7)',
          'rgba(26, 188, 156, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(231, 76, 60, 0.7)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

// Table population functions
function populateSalesCategoryTable(data) {
  const tableBody = document.getElementById('sales-category-table');
  tableBody.innerHTML = '';
  
  data.labels.forEach((label, index) => {
    const row = document.createElement('tr');
    const percentage = ((data.values[index] / data.total) * 100).toFixed(1);
    
    row.innerHTML = `
      <td>${label}</td>
      <td>${formatCurrency(data.values[index])}</td>
      <td>${percentage}%</td>
    `;
    
    tableBody.appendChild(row);
  });
}

function populateExpensesCategoryTable(data) {
  const tableBody = document.getElementById('expenses-category-table');
  tableBody.innerHTML = '';
  
  data.labels.forEach((label, index) => {
    const row = document.createElement('tr');
    const percentage = ((data.values[index] / data.total) * 100).toFixed(1);
    
    row.innerHTML = `
      <td>${label}</td>
      <td>${formatCurrency(data.values[index])}</td>
      <td>${percentage}%</td>
    `;
    
    tableBody.appendChild(row);
  });
}

function populateInventoryCategoryTable(data) {
  const tableBody = document.getElementById('inventory-category-table');
  tableBody.innerHTML = '';
  
  data.labels.forEach((label, index) => {
    const row = document.createElement('tr');
    const percentage = ((data.values[index] / data.total) * 100).toFixed(1);
    
    row.innerHTML = `
      <td>${label}</td>
      <td>${formatCurrency(data.values[index])}</td>
      <td>${percentage}%</td>
    `;
    
    tableBody.appendChild(row);
  });
}

function populateLowStockTable(items) {
  const tableBody = document.getElementById('low-stock-table');
  tableBody.innerHTML = '';
  
  items.forEach(item => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.currentStock}</td>
      <td>${item.threshold}</td>
      <td>${formatCurrency(item.value)}</td>
    `;
    
    tableBody.appendChild(row);
  });
}