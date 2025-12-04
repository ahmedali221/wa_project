import api from './axios';

const dashboardService = {
  /**
   * Get admin dashboard data (ADMIN/SUPER_ADMIN only)
   * @returns {Promise} Dashboard statistics and data
   */
  async getAdminDashboard() {
    try {
      const response = await api.get('/dashboard/admin');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get user dashboard data
   * @returns {Promise} User dashboard data
   */
  async getUserDashboard() {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Handle API errors
   * @param {Error} error - Axios error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const errorObj = new Error(message);
      errorObj.status = error.response.status;
      errorObj.data = error.response.data;
      return errorObj;
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  },
};

export default dashboardService;

















