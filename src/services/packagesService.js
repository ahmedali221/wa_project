import api from './axios';

const packagesService = {
  /**
   * Get all active packages
   * @returns {Promise} Array of packages
   */
  async getAllPackages() {
    try {
      const response = await api.get('/packages');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get package by ID
   * @param {string} packageId - Package ID
   * @returns {Promise} Package data
   */
  async getPackageById(packageId) {
    try {
      const response = await api.get(`/packages/${packageId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Subscribe to a package
   * @param {string} packageId - Package ID to subscribe to
   * @param {string} paymentStatus - Payment status (optional, defaults to PAID)
   * @returns {Promise} Subscription data
   */
  async subscribe(packageId, paymentStatus = 'PAID') {
    try {
      const response = await api.post('/user-packages/subscribe', { 
        packageId,
        paymentStatus 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get current active subscription
   * @returns {Promise} Current subscription data
   */
  async getCurrentSubscription() {
    try {
      const response = await api.get('/user-packages/current');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get subscription history
   * @returns {Promise} Array of subscription history
   */
  async getSubscriptionHistory() {
    try {
      const response = await api.get('/user-packages/history');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get usage statistics
   * @returns {Promise} Usage statistics data
   */
  async getUsageStatistics() {
    try {
      const response = await api.get('/user-packages/statistics/usage');
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
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const errorObj = new Error(message);
      errorObj.status = error.response.status;
      errorObj.data = error.response.data;
      return errorObj;
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  },
};

export default packagesService;

