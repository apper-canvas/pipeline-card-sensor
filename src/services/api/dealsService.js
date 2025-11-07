import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

export const dealsService = {
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
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "lead_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.fetchRecords('deal_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error);
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
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "lead_id_c"}}
        ]
      };

      const response = await apperClient.getRecordById('deal_c', id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(dealData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      // Only include Updateable fields
      const createData = {
        Name: dealData.title_c || dealData.title,
        title_c: dealData.title_c || dealData.title,
        stage_c: dealData.stage_c || dealData.stage || 'new',
        value_c: dealData.value_c || dealData.value ? parseFloat(dealData.value_c || dealData.value) : null,
        probability_c: dealData.probability_c || dealData.probability ? parseInt(dealData.probability_c || dealData.probability) : null,
        expected_close_date_c: dealData.expected_close_date_c || dealData.expectedCloseDate,
        assigned_to_c: dealData.assigned_to_c || dealData.assignedTo,
        notes_c: dealData.notes_c || dealData.notes,
        lead_id_c: dealData.lead_id_c || dealData.leadId ? parseInt(dealData.lead_id_c || dealData.leadId) : null
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

      const response = await apperClient.createRecord('deal_c', params);

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
      console.error("Error creating deal:", error?.response?.data?.message || error);
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
        stage: 'stage_c',
        value: 'value_c',
        probability: 'probability_c',
        expectedCloseDate: 'expected_close_date_c',
        assignedTo: 'assigned_to_c',
        notes: 'notes_c',
        leadId: 'lead_id_c'
      };

      Object.keys(updates).forEach(key => {
        const dbField = fieldMapping[key] || key;
        
        if (updates[key] !== null && updates[key] !== undefined && updates[key] !== '') {
          if (dbField === 'value_c') {
            updateData[dbField] = parseFloat(updates[key]);
          } else if (dbField === 'probability_c' || dbField === 'lead_id_c') {
            updateData[dbField] = parseInt(updates[key]);
          } else {
            updateData[dbField] = updates[key];
          }
        }
      });

      // Update Name field if title_c is being updated
      if (updateData.title_c) {
        updateData.Name = updateData.title_c;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('deal_c', params);

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
      console.error("Error updating deal:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('deal_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getByStage(stage) {
    try {
      const deals = await this.getAll();
      return deals.filter(deal => (deal.stage_c || deal.stage) === stage);
    } catch (error) {
      console.error("Error getting deals by stage:", error);
      return [];
    }
  },

  async updateStage(id, newStage) {
    try {
      return await this.update(id, { stage: newStage });
    } catch (error) {
      console.error("Error updating deal stage:", error);
      return null;
    }
  },

  async getMetrics() {
    try {
      const deals = await this.getAll();
      const closedWonDeals = deals.filter(deal => (deal.stage_c || deal.stage) === "closed_won");
      
      // Average deal size
      const avgDealSize = closedWonDeals.length > 0 
        ? closedWonDeals.reduce((sum, deal) => sum + (deal.value_c || deal.value || 0), 0) / closedWonDeals.length
        : 0;
      
      // Time to close (average days from creation to close)
      const timeToClose = closedWonDeals.length > 0
        ? closedWonDeals.reduce((sum, deal) => {
            const created = new Date(deal.CreatedOn || deal.createdAt);
            const closed = new Date(deal.ModifiedOn || deal.updatedAt);
            return sum + Math.ceil((closed - created) / (1000 * 60 * 60 * 24));
          }, 0) / closedWonDeals.length
        : 0;
      
      // Sales velocity: (Number of deals × Average deal value) / Average sales cycle
      const salesVelocity = timeToClose > 0 
        ? (closedWonDeals.length * avgDealSize) / timeToClose
        : 0;
      
      return {
        avgDealSize,
        timeToClose,
        salesVelocity,
        totalClosedWonDeals: closedWonDeals.length
      };
    } catch (error) {
      console.error("Error calculating deal metrics:", error);
      return {
        avgDealSize: 0,
        timeToClose: 0,
        salesVelocity: 0,
        totalClosedWonDeals: 0
      };
    }
  }
};