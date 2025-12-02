import api from './axios';

const messagesService = {
  /**
   * Get all messages
   * @param {string} status - Optional status filter (PENDING, SENT, FAILED)
   * @returns {Promise} Response with messages list
   */
  async getAllMessages(status) {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/messages', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get grouped messages by message text
   * @returns {Promise} Response with grouped messages
   */
  async getGroupedMessages() {
    try {
      const response = await api.get('/messages/grouped');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get messages by message text
   * @param {string} messageText - The message text to filter by
   * @returns {Promise} Response with messages for that text
   */
  async getMessagesByText(messageText) {
    try {
      const response = await api.get('/messages/by-text', {
        params: { message: messageText },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get message by ID
   * @param {string} id - Message ID
   * @returns {Promise} Response with message details
   */
  async getMessageById(id) {
    try {
      const response = await api.get(`/messages/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get messages statistics
   * @returns {Promise} Response with statistics
   */
  async getStatistics() {
    try {
      const response = await api.get('/messages/statistics');
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

export default messagesService;

