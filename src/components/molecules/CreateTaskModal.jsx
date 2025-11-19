import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tasksService } from '@/services/api/tasksService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { toast } from 'react-toastify';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [isQuickMode, setIsQuickMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    task_title_c: '',
    task_type_c: 'To-Do',
    priority_c: 'Medium',
    status_c: 'Open',
    due_date_c: '',
    assign_to_c: '',
    related_to_c: '',
description_c: '',
    tags_c: '',
    isAllDay: false
  });

  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setFormData({
      task_title_c: '',
      task_type_c: 'To-Do',
      priority_c: 'Medium',
      status_c: 'Open',
      due_date_c: '',
      assign_to_c: '',
      related_to_c: '',
      description_c: '',
      isAllDay: false
});
    
    if (!formData.tags_c?.trim()) {
      newErrors.tags_c = 'Tags field cannot be empty';
    }
    setErrors({});
    setIsQuickMode(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.task_title_c.trim()) {
      newErrors.task_title_c = 'Task title is required';
    } else if (formData.task_title_c.length > 100) {
      newErrors.task_title_c = 'Task title must be 100 characters or less';
    }

    if (!formData.task_type_c) {
      newErrors.task_type_c = 'Task type is required';
    }

    if (!formData.priority_c) {
      newErrors.priority_c = 'Priority is required';
    }

    if (formData.due_date_c) {
      const dueDate = new Date(formData.due_date_c);
      const now = new Date();
      if (dueDate < now.setHours(0, 0, 0, 0)) {
        newErrors.due_date_c = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, createAnother = false) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for API submission
      const taskData = {
task_title_c: formData.task_title_c.trim(),
        task_type_c: formData.task_type_c,
        priority_c: formData.priority_c,
        status_c: formData.status_c,
        assign_to_c: formData.assign_to_c.trim() || null,
        related_to_c: formData.related_to_c.trim() || null,
        description_c: formData.description_c.trim() || null,
        tags_c: formData.tags_c.trim() || null
      };

      // Format due date if provided
      if (formData.due_date_c) {
        if (formData.isAllDay) {
          // For all-day tasks, set to start of day
          taskData.due_date_c = new Date(formData.due_date_c).toISOString().split('T')[0] + 'T00:00:00.000Z';
        } else {
          taskData.due_date_c = new Date(formData.due_date_c).toISOString();
        }
      }

      const result = await tasksService.create(taskData);

      if (result) {
        toast.success('Task created successfully');
        onTaskCreated(); // Refresh parent data
        
        if (createAnother) {
          resetForm();
        } else {
          handleClose();
        }
      }
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const taskTypes = [
    { value: 'Call', label: '📞 Call', icon: 'Phone' },
    { value: 'Email', label: '📧 Email', icon: 'Mail' },
    { value: 'Meeting', label: '🤝 Meeting', icon: 'Users' },
    { value: 'To-Do', label: '✅ To-Do', icon: 'CheckSquare' },
    { value: 'Follow-up', label: '🔄 Follow-up', icon: 'RotateCcw' }
  ];

  const priorities = [
    { value: 'High', label: '🔴 High', color: 'text-red-600' },
    { value: 'Medium', label: '🟡 Medium', color: 'text-yellow-600' },
    { value: 'Low', label: '🟢 Low', color: 'text-green-600' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col modal-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Create New Task</h2>
              <p className="text-sm text-slate-600 mt-1">
                {isQuickMode ? 'Quick task creation' : 'Detailed task information'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setIsQuickMode(true)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isQuickMode 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quick Add
                </button>
                <button
                  onClick={() => setIsQuickMode(false)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    !isQuickMode 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Advanced
                </button>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Step 1: Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Task Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.task_title_c}
                      onChange={(e) => handleInputChange('task_title_c', e.target.value)}
                      placeholder="Enter task title..."
                      maxLength={100}
                      className={errors.task_title_c ? 'border-red-300' : ''}
                    />
                    {errors.task_title_c && (
                      <p className="mt-1 text-sm text-red-600">{errors.task_title_c}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      {formData.task_title_c.length}/100 characters
                    </p>
                  </div>

                  {/* Task Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Task Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.task_type_c}
                      onChange={(e) => handleInputChange('task_type_c', e.target.value)}
                      className={`w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.task_type_c ? 'border-red-300' : ''
                      }`}
                    >
                      {taskTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.task_type_c && (
                      <p className="mt-1 text-sm text-red-600">{errors.task_type_c}</p>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.priority_c}
                      onChange={(e) => handleInputChange('priority_c', e.target.value)}
                      className={`w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.priority_c ? 'border-red-300' : ''
                      }`}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                    {errors.priority_c && (
                      <p className="mt-1 text-sm text-red-600">{errors.priority_c}</p>
                    )}
                  </div>

                  {!isQuickMode && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={formData.status_c}
                        onChange={(e) => handleInputChange('status_c', e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Scheduling */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">Scheduling</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                    <Input
                      type={formData.isAllDay ? "date" : "datetime-local"}
                      value={formData.due_date_c}
                      onChange={(e) => handleInputChange('due_date_c', e.target.value)}
                      className={errors.due_date_c ? 'border-red-300' : ''}
                    />
                    {errors.due_date_c && (
                      <p className="mt-1 text-sm text-red-600">{errors.due_date_c}</p>
                    )}
                    {!formData.due_date_c && (
                      <p className="mt-1 text-xs text-amber-600">
                        <ApperIcon name="AlertTriangle" className="w-3 h-3 inline mr-1" />
                        Setting a due date is recommended
                      </p>
                    )}
                  </div>

                  {/* All Day Toggle */}
                  <div className="flex items-center space-x-2 mt-8">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={formData.isAllDay}
                      onChange={(e) => {
                        handleInputChange('isAllDay', e.target.checked);
                        if (e.target.checked && formData.due_date_c) {
                          // Convert to date only format
                          const dateOnly = formData.due_date_c.split('T')[0];
                          handleInputChange('due_date_c', dateOnly);
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="allDay" className="text-sm text-slate-700">
                      All-day task
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 3: Assignment (Quick Mode) / Advanced (Full Mode) */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  {isQuickMode ? 'Assignment' : 'Assignment & Details'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assign To */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
                    <Input
                      type="text"
                      value={formData.assign_to_c}
                      onChange={(e) => handleInputChange('assign_to_c', e.target.value)}
                      placeholder="Enter assignee name or email..."
                    />
                  </div>

                  {!isQuickMode && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Related To</label>
                      <Input
                        type="text"
                        value={formData.related_to_c}
                        onChange={(e) => handleInputChange('related_to_c', e.target.value)}
                        placeholder="Company, Contact, or Deal..."
                      />
                    </div>
)}
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags_c"
                      value={formData.tags_c}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter tags separated by commas (e.g., urgent, client, follow-up)"
                    />
                    {errors.tags_c && (
                      <p className="mt-1 text-sm text-red-600">{errors.tags_c}</p>
                    )}
                  </div>
                </div>

                {/* Description - Full Mode Only */}
                {!isQuickMode && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={formData.description_c}
                      onChange={(e) => handleInputChange('description_c', e.target.value)}
                      placeholder="Add task details, notes, or instructions..."
                      rows={4}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                {isSubmitting ? (
                  <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                )}
                Create & Add Another
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                {isSubmitting ? (
                  <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2" />
                )}
                Create Task
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTaskModal;