import { navigateTo } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-analysis-btn').addEventListener('click', () => {
    window.location.href = '../src/dashboard.html';
  });

  document.querySelectorAll('.menu ul li a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('menu-toggle').checked = false;
    });
  });
});