import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";

const TABLE_NAME = 'tasks_c';

export const tasksService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "task_title_c"}},
          {"field": {"Name": "task_type_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "assign_to_c"}},
          {"field": {"Name": "related_to_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "CreatedOn"}},
{"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "Tags"}}
        ],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      toast.error("Failed to load tasks");
      return [];
    }
  },

  async getById(taskId) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "task_title_c"}},
          {"field": {"Name": "task_type_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "assign_to_c"}},
          {"field": {"Name": "related_to_c"}},
          {"field": {"Name": "description_c"}},
{"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "Tags"}}
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, taskId, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error?.response?.data?.message || error);
      toast.error("Failed to load task");
      return null;
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const filteredData = {};
      if (taskData.task_title_c) filteredData.task_title_c = taskData.task_title_c;
      if (taskData.task_type_c) filteredData.task_type_c = taskData.task_type_c;
      if (taskData.priority_c) filteredData.priority_c = taskData.priority_c;
      if (taskData.status_c) filteredData.status_c = taskData.status_c;
      if (taskData.due_date_c) filteredData.due_date_c = taskData.due_date_c;
      if (taskData.assign_to_c) filteredData.assign_to_c = taskData.assign_to_c;
      if (taskData.related_to_c) filteredData.related_to_c = taskData.related_to_c;
      if (taskData.description_c) filteredData.description_c = taskData.description_c;
if (taskData.tags_c !== undefined) filteredData.tags_c = taskData.tags_c;
      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Task created successfully");
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      toast.error("Failed to create task");
      return null;
    }
  },

  async update(taskId, taskData) {
    try {
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const filteredData = { Id: taskId };
      if (taskData.task_title_c !== undefined) filteredData.task_title_c = taskData.task_title_c;
      if (taskData.task_type_c !== undefined) filteredData.task_type_c = taskData.task_type_c;
      if (taskData.priority_c !== undefined) filteredData.priority_c = taskData.priority_c;
      if (taskData.status_c !== undefined) filteredData.status_c = taskData.status_c;
      if (taskData.due_date_c !== undefined) filteredData.due_date_c = taskData.due_date_c;
      if (taskData.assign_to_c !== undefined) filteredData.assign_to_c = taskData.assign_to_c;
      if (taskData.related_to_c !== undefined) filteredData.related_to_c = taskData.related_to_c;
if (taskData.description_c !== undefined) filteredData.description_c = taskData.description_c;
      if (taskData.tags_c !== undefined) filteredData.tags_c = taskData.tags_c;

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Task updated successfully");
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      toast.error("Failed to update task");
      return null;
    }
  },

  async delete(taskId) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [taskId]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Task deleted successfully");
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      toast.error("Failed to delete task");
      return false;
    }
  },

  async getTaskStats() {
    try {
      const tasks = await this.getAll();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        total: tasks.length,
        overdue: 0,
        dueToday: 0,
        completedThisWeek: 0
      };

      tasks.forEach(task => {
        const dueDate = task.due_date_c ? new Date(task.due_date_c) : null;
        const status = task.status_c;

        // Overdue tasks
        if (dueDate && dueDate < today && status !== 'Completed') {
          stats.overdue++;
        }

        // Due today
        if (dueDate && dueDate.toDateString() === today.toDateString() && status !== 'Completed') {
          stats.dueToday++;
        }

        // Completed this week
        if (status === 'Completed') {
          const modifiedDate = task.ModifiedOn ? new Date(task.ModifiedOn) : null;
          if (modifiedDate && modifiedDate >= weekAgo) {
            stats.completedThisWeek++;
          }
        }
      });

      return stats;
    } catch (error) {
      console.error("Error calculating task stats:", error);
      return { total: 0, overdue: 0, dueToday: 0, completedThisWeek: 0 };
    }
  }
};