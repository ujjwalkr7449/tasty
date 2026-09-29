import { menuItems, categories, comparisonRows } from '../data/menu.js';

// Replace these mock responses with fetch() calls once the backend is available.
export const menuApi = {
  async getMenu() { return menuItems; },
  async getCategories() { return categories; },
  async getComparison() { return comparisonRows; },
};
