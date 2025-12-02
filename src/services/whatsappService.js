import api from './axios';

const whatsappService = {
  /**
   * Initialize WhatsApp connection
   * @returns {Promise} Response with success message
   */
  async initializeConnection() {
    try {
      const response = await api.post('/whatsapp/initialize');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get QR code for WhatsApp connection
   * @returns {Promise} Response with QR code data URL
   */
  async getQRCode() {
    try {
      const response = await api.get('/whatsapp/qr-code');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Request pairing code for phone number
   * @param {string} phoneNumber - Phone number in international format (e.g., +201234567890)
   * @returns {Promise} Response with pairing code
   */
  async requestPairingCode(phoneNumber) {
    try {
      const response = await api.post('/whatsapp/request-pairing-code', {
        phoneNumber,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get WhatsApp connection status
   * @returns {Promise} Response with connection status and phone number
   */
  async getConnectionStatus() {
    try {
      const response = await api.get('/whatsapp/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Disconnect WhatsApp
   * @returns {Promise} Response with success message
   */
  async disconnect() {
    try {
      const response = await api.post('/whatsapp/disconnect');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Send bulk messages
   * @param {Array} messages - Array of message objects with phone, message, and optional name
   * @returns {Promise} Response with sending results
   */
  async sendMessages(messages) {
    try {
      const response = await api.post('/whatsapp/send-messages', { messages });
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

export default whatsappService;


