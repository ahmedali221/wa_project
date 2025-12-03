import api from './axios';

const usersService = {
  /**
   * Get all users with pagination (SUPER_ADMIN only)
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @param {string} search - Search term for name/email
   * @returns {Promise} Response with users and pagination data
   */
  async getAllUsers(page = 1, limit = 10, search = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) {
        params.append('search', search);
      }
      const response = await api.get(`/auth/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get user by ID (SUPER_ADMIN only)
   * @param {string} id - User ID
   * @returns {Promise} User data
   */
  async getUserById(id) {
    try {
      const response = await api.get(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update user by admin (SUPER_ADMIN only)
   * @param {string} id - User ID
   * @param {Object} data - Update data (name, email, role)
   * @returns {Promise} Updated user data
   */
  async updateUser(id, data) {
    try {
      const response = await api.patch(`/auth/users/${id}`, data);
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

export default usersService;













