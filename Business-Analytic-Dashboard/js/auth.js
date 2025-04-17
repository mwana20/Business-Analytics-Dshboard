
import { navigateTo } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-analysis-btn').addEventListener('click', () => {

    window.location.href = '../src/dashboard.html';
  });
});