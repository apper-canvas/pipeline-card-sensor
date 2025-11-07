import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

export const activitiesService = {
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "related_to_c"}},
          {"field": {"Name": "related_type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "scheduled_at_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.fetchRecords('activity_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error?.response?.data?.message || error);
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "related_to_c"}},
          {"field": {"Name": "related_type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "scheduled_at_c"}},
          {"field": {"Name": "completed_at_c"}}
        ]
      };

      const response = await apperClient.getRecordById('activity_c', id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(activityData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      // Only include Updateable fields
      const createData = {
        Name: activityData.subject_c || activityData.subject,
        type_c: activityData.type_c || activityData.type,
        related_to_c: activityData.related_to_c || activityData.relatedTo,
        related_type_c: activityData.related_type_c || activityData.relatedType,
        subject_c: activityData.subject_c || activityData.subject,
        description_c: activityData.description_c || activityData.description,
        scheduled_at_c: activityData.scheduled_at_c || activityData.scheduledAt || new Date().toISOString(),
        completed_at_c: activityData.completed_at_c || activityData.completedAt
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

      const response = await apperClient.createRecord('activity_c', params);

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
      console.error("Error creating activity:", error?.response?.data?.message || error);
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
        type: 'type_c',
        relatedTo: 'related_to_c',
        relatedType: 'related_type_c',
        subject: 'subject_c',
        description: 'description_c',
        scheduledAt: 'scheduled_at_c',
        completedAt: 'completed_at_c'
      };

      Object.keys(updates).forEach(key => {
        const dbField = fieldMapping[key] || key;
        
        if (updates[key] !== null && updates[key] !== undefined && updates[key] !== '') {
          updateData[dbField] = updates[key];
        }
      });

      // Update Name field if subject_c is being updated
      if (updateData.subject_c) {
        updateData.Name = updateData.subject_c;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('activity_c', params);

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
      console.error("Error updating activity:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('activity_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting activity:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getByRelatedItem(relatedTo, relatedType) {
    try {
      const activities = await this.getAll();
      return activities
        .filter(activity => 
          (activity.related_to_c || activity.relatedTo) === relatedTo && 
          (activity.related_type_c || activity.relatedType) === relatedType
        );
    } catch (error) {
      console.error("Error getting activities by related item:", error);
      return [];
    }
  },

  async getByType(type) {
    try {
      const activities = await this.getAll();
      return activities.filter(activity => (activity.type_c || activity.type) === type);
    } catch (error) {
      console.error("Error getting activities by type:", error);
      return [];
    }
  },

  async markCompleted(id) {
    try {
      return await this.update(id, { completedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error marking activity as completed:", error);
      return null;
    }
  }
};