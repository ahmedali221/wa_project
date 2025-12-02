import api from './axios';

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email address
   * @param {string} userData.password - User's password
   * @returns {Promise} Response with user data
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email address
   * @param {string} credentials.password - User's password
   * @returns {Promise} Response with access token and user data
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Updated user data
   */
  async updateProfile(profileData) {
    try {
      const response = await api.patch('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise} Success message
   */
  async changePassword(passwordData) {
    try {
      const response = await api.patch('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Logout user
   * @param {boolean} redirect - Whether to redirect to login page (default: false, let component handle navigation)
   */
  logout(redirect = false) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    if (redirect) {
      window.location.href = '/login';
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if current user is Super Admin
   * @returns {boolean} True if user is SUPER_ADMIN
   */
  isSuperAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'SUPER_ADMIN';
  },

  /**
   * Check if current user is Admin or Super Admin
   * @returns {boolean} True if user is ADMIN or SUPER_ADMIN
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
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

export default authService;

