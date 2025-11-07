import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

export const emailTemplateService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.fetchRecords('email_template_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching email templates:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "description_c"}}
        ]
      };

      const response = await apperClient.getRecordById('email_template_c', id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching email template ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(templateData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      // Only include Updateable fields
      const createData = {
        Name: templateData.name_c || templateData.name,
        name_c: templateData.name_c || templateData.name,
        category_c: templateData.category_c || templateData.category,
        subject_c: templateData.subject_c || templateData.subject,
        content_c: templateData.content_c || templateData.content,
        description_c: templateData.description_c || templateData.description
      };

      // Remove null/undefined values
      Object.keys(createData).forEach(key => {
        if (createData[key] === null || createData[key] === undefined || createData[key] === '') {
          delete createData[key];
        }
      });

      const params = {
        records: [createData]
      };

      const response = await apperClient.createRecord('email_template_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating email template:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      // Only include Updateable fields
      const updateData = { Id: parseInt(id) };

      // Map old field names to new ones
      const fieldMapping = {
        name: 'name_c',
        category: 'category_c',
        subject: 'subject_c',
        content: 'content_c',
        description: 'description_c'
      };

      Object.keys(updates).forEach(key => {
        const dbField = fieldMapping[key] || key;
        
        if (updates[key] !== null && updates[key] !== undefined && updates[key] !== '') {
          updateData[dbField] = updates[key];
        }
      });

      // Update Name field if name_c is being updated
      if (updateData.name_c) {
        updateData.Name = updateData.name_c;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('email_template_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating email template:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return false;
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('email_template_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting email template:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getByCategory(category) {
    try {
      const templates = await this.getAll();
      return templates.filter(template => (template.category_c || template.category) === category);
    } catch (error) {
      console.error("Error getting templates by category:", error);
      return [];
    }
  },

  // Helper function to replace variables in template content
  replaceVariables(content, variables) {
    let processedContent = content;
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = variables[key] || `[${key}]`;
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });
    return processedContent;
  },

  // Get available variables for templates
  getAvailableVariables() {
    return [
      { key: 'name', label: 'Contact Name', example: 'John Smith' },
      { key: 'company', label: 'Company Name', example: 'Acme Corp' },
      { key: 'position', label: 'Position/Title', example: 'Marketing Director' },
      { key: 'email', label: 'Email Address', example: 'john@acme.com' },
      { key: 'phone', label: 'Phone Number', example: '+1 (555) 123-4567' },
      { key: 'source', label: 'Lead Source', example: 'Website' },
      { key: 'currentDate', label: 'Current Date', example: new Date().toLocaleDateString() },
      { key: 'senderName', label: 'Your Name', example: 'Sales Representative' },
      { key: 'companyName', label: 'Your Company', example: 'Pipeline Pro' }
    ];
  }
};