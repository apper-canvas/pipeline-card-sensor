import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";

export const calendarService = {
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "related_to_c"}},
          {"field": {"Name": "related_type_c"}},
          {"field": {"Name": "start_time_c"}},
          {"field": {"Name": "end_time_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.fetchRecords('calendar_event_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching calendar events:", error?.response?.data?.message || error);
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "related_to_c"}},
          {"field": {"Name": "related_type_c"}},
          {"field": {"Name": "start_time_c"}},
          {"field": {"Name": "end_time_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "description_c"}}
        ]
      };

      const response = await apperClient.getRecordById('calendar_event_c', id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching calendar event ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(eventData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      // Only include Updateable fields
      const createData = {
        Name: eventData.title_c || eventData.title,
        title_c: eventData.title_c || eventData.title,
        type_c: eventData.type_c || eventData.type,
        related_to_c: eventData.related_to_c || eventData.relatedTo,
        related_type_c: eventData.related_type_c || eventData.relatedType,
        start_time_c: eventData.start_time_c || eventData.startTime,
        end_time_c: eventData.end_time_c || eventData.endTime,
        location_c: eventData.location_c || eventData.location,
        description_c: eventData.description_c || eventData.description
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

      const response = await apperClient.createRecord('calendar_event_c', params);

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
      console.error("Error creating calendar event:", error?.response?.data?.message || error);
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
        title: 'title_c',
        type: 'type_c',
        relatedTo: 'related_to_c',
        relatedType: 'related_type_c',
        startTime: 'start_time_c',
        endTime: 'end_time_c',
        location: 'location_c',
        description: 'description_c'
      };

      Object.keys(updates).forEach(key => {
        const dbField = fieldMapping[key] || key;
        
        if (updates[key] !== null && updates[key] !== undefined && updates[key] !== '') {
          updateData[dbField] = updates[key];
        }
      });

      // Update Name field if title_c is being updated
      if (updateData.title_c) {
        updateData.Name = updateData.title_c;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('calendar_event_c', params);

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
      console.error("Error updating calendar event:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('calendar_event_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting calendar event:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getByDateRange(startDate, endDate) {
    try {
      const events = await this.getAll();
      return events
        .filter(event => {
          const eventDate = new Date(event.start_time_c || event.startTime);
          return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
        });
    } catch (error) {
      console.error("Error getting events by date range:", error);
      return [];
    }
},

  async getByType(type) {
    try {
      const events = await this.getAll();
      return events.filter(event => (event.type_c || event.type) === type);
    } catch (error) {
      console.error("Error getting events by type:", error);
      return [];
    }
  }
};