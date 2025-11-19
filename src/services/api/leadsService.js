import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";

export const leadsService = {
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
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "source_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "last_contacted_at_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "website_url_c"}},
          {"field": {"Name": "linkedin_url_c"}},
          {"field": {"Name": "team_size_c"}},
          {"field": {"Name": "arr_c"}},
          {"field": {"Name": "funding_type_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "edition_c"}},
          {"field": {"Name": "estimated_value_c"}},
          {"field": {"Name": "sales_rep_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.fetchRecords('lead_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching leads:", error?.response?.data?.message || error);
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
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "source_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "last_contacted_at_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "website_url_c"}},
          {"field": {"Name": "linkedin_url_c"}},
          {"field": {"Name": "team_size_c"}},
          {"field": {"Name": "arr_c"}},
          {"field": {"Name": "funding_type_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "edition_c"}},
          {"field": {"Name": "estimated_value_c"}},
          {"field": {"Name": "sales_rep_c"}}
        ]
      };

      const response = await apperClient.getRecordById('lead_c', id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching lead ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(leadData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      // Only include Updateable fields
      const createData = {
Name: leadData.name_c || leadData.name,
        name_c: leadData.name_c || leadData.name,
        email_c: leadData.email_c || leadData.email,
        phone_c: leadData.phone_c || leadData.phone,
        company_c: leadData.company_c || leadData.company,
        position_c: leadData.position_c || leadData.position,
        source_c: leadData.source_c || leadData.source,
        status_c: leadData.status_c || leadData.status,
        value_c: leadData.value_c || leadData.value ? parseFloat(leadData.value_c || leadData.value) : null,
        assigned_to_c: leadData.assigned_to_c || leadData.assignedTo || leadData.salesRep,
        last_contacted_at_c: leadData.last_contacted_at_c || leadData.lastContactedAt,
        notes_c: leadData.notes_c || leadData.notes,
        website_url_c: leadData.website_url_c || leadData.websiteUrl,
        linkedin_url_c: leadData.linkedin_url_c || leadData.linkedinUrl,
        team_size_c: leadData.team_size_c || leadData.teamSize ? parseInt(leadData.team_size_c || leadData.teamSize) : null,
        arr_c: leadData.arr_c || leadData.arr ? parseFloat(leadData.arr_c || leadData.arr) : null,
        funding_type_c: leadData.funding_type_c || leadData.fundingType,
        category_c: leadData.category_c || leadData.category,
        edition_c: leadData.edition_c || leadData.edition,
        estimated_value_c: leadData.estimated_value_c || leadData.estimatedValue ? parseFloat(leadData.estimated_value_c || leadData.estimatedValue) : null,
        sales_rep_c: leadData.sales_rep_c || leadData.salesRep
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

      const response = await apperClient.createRecord('lead_c', params);

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
      console.error("Error creating lead:", error?.response?.data?.message || error);
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
email: 'email_c',
        phone: 'phone_c',
        company: 'company_c',
        position: 'position_c',
        source: 'source_c',
        status: 'status_c',
        value: 'value_c',
        assignedTo: 'assigned_to_c',
        lastContactedAt: 'last_contacted_at_c',
        notes: 'notes_c',
        websiteUrl: 'website_url_c',
        linkedinUrl: 'linkedin_url_c',
        teamSize: 'team_size_c',
        arr: 'arr_c',
        fundingType: 'funding_type_c',
        category: 'category_c',
        edition: 'edition_c',
        estimatedValue: 'estimated_value_c',
        salesRep: 'sales_rep_c'
      };

      Object.keys(updates).forEach(key => {
        const dbField = fieldMapping[key] || key;
        
        if (updates[key] !== null && updates[key] !== undefined && updates[key] !== '') {
          if (dbField === 'value_c' || dbField === 'arr_c' || dbField === 'estimated_value_c') {
            updateData[dbField] = parseFloat(updates[key]);
          } else if (dbField === 'team_size_c') {
            updateData[dbField] = parseInt(updates[key]);
          } else {
            updateData[dbField] = updates[key];
          }
        }
      });

      // Update Name field if name_c is being updated
      if (updateData.name_c) {
        updateData.Name = updateData.name_c;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('lead_c', params);

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
      console.error("Error updating lead:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('lead_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting lead:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getByStatus(status) {
    try {
      const leads = await this.getAll();
      return leads.filter(lead => (lead.status_c || lead.status) === status);
    } catch (error) {
      console.error("Error getting leads by status:", error);
      return [];
    }
  },

  async getBySource(source) {
    try {
      const leads = await this.getAll();
      return leads.filter(lead => (lead.source_c || lead.source) === source);
    } catch (error) {
      console.error("Error getting leads by source:", error);
      return [];
    }
  },

  async getWinRateBySource(deals) {
    try {
      const leads = await this.getAll();
      const sources = [...new Set(leads.map(lead => lead.source_c || lead.source))];
      const sourceStats = {};

      sources.forEach(source => {
        const leadsFromSource = leads.filter(lead => (lead.source_c || lead.source) === source);
        const dealsFromSource = deals.filter(deal => 
          leadsFromSource.some(lead => lead.Id === (deal.lead_id_c?.Id || deal.leadId))
        );
        const wonDeals = dealsFromSource.filter(deal => (deal.stage_c || deal.stage) === "closed_won");

        sourceStats[source] = {
          totalDeals: dealsFromSource.length,
          wonDeals: wonDeals.length,
          winRate: dealsFromSource.length > 0 ? Math.round((wonDeals.length / dealsFromSource.length) * 100) : 0
        };
      });

      // Return overall win rate across all sources
      const totalDeals = Object.values(sourceStats).reduce((sum, stat) => sum + stat.totalDeals, 0);
      const totalWon = Object.values(sourceStats).reduce((sum, stat) => sum + stat.wonDeals, 0);
      const overallWinRate = totalDeals > 0 ? Math.round((totalWon / totalDeals) * 100) : 0;

      return {
        bySource: sourceStats,
        overall: overallWinRate
      };
} catch (error) {
      console.error("Error calculating win rate by source:", error);
      return { bySource: {}, overall: 0 };
    }
  }
};