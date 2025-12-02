import api from './axios';

const contactsService = {
  /**
   * Upload Excel file and save contacts to database
   * @param {File} file - Excel file (.xlsx, .xls, or .csv)
   * @param {string} groupName - Optional group name for contacts
   * @returns {Promise} Response with statistics and imported contacts
   */
  async uploadExcel(file, groupName) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (groupName) {
        formData.append('groupName', groupName);
      }

      const response = await api.post('/contacts/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get all contacts
   * @param {string} groupName - Optional group name filter
   * @returns {Promise} Response with contacts list
   */
  async getAllContacts(groupName) {
    try {
      const params = groupName ? { groupName } : {};
      const response = await api.get('/contacts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get contact by ID
   * @param {string} id - Contact ID
   * @returns {Promise} Response with contact details
   */
  async getContactById(id) {
    try {
      const response = await api.get(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new contact
   * @param {Object} contactData - Contact data (name, phone, email, groupName)
   * @returns {Promise} Response with created contact
   */
  async createContact(contactData) {
    try {
      const response = await api.post('/contacts', contactData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update contact by ID
   * @param {string} id - Contact ID
   * @param {Object} contactData - Contact data to update (name, phone, email, groupName)
   * @returns {Promise} Response with updated contact
   */
  async updateContact(id, contactData) {
    try {
      const response = await api.put(`/contacts/${id}`, contactData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Delete contact by ID
   * @param {string} id - Contact ID
   * @returns {Promise} Response with success message
   */
  async deleteContact(id) {
    try {
      const response = await api.delete(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Delete all contacts (optionally by group)
   * @param {string} groupName - Optional group name
   * @returns {Promise} Response with success message
   */
  async deleteAllContacts(groupName) {
    try {
      const params = groupName ? { groupName } : {};
      const response = await api.delete('/contacts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get contact groups
   * @returns {Promise} Response with groups list
   */
  async getGroups() {
    try {
      const response = await api.get('/contacts/groups');
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

export default contactsService;

