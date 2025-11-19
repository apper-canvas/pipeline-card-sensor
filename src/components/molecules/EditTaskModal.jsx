import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { tasksService } from "@/services/api/tasksService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const EditTaskModal = ({ isOpen, onClose, onTaskUpdated, task }) => {
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
    Tags: '',
    isAllDay: false
  });

  const [errors, setErrors] = useState({});

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        task_title_c: task.task_title_c || '',
        task_type_c: task.task_type_c || 'To-Do',
        priority_c: task.priority_c || 'Medium',
        status_c: task.status_c || 'Open',
        due_date_c: task.due_date_c ? new Date(task.due_date_c).toISOString().slice(0, 16) : '',
        assign_to_c: task.assign_to_c || '',
        related_to_c: task.related_to_c || '',
        description_c: task.description_c || '',
        Tags: task.Tags || '',
        isAllDay: false
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.task_title_c.trim()) {
      newErrors.task_title_c = 'Task title is required';
    }

    if (formData.due_date_c && new Date(formData.due_date_c) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.due_date_c = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !task) {
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
        Tags: formData.Tags.trim() || null
      };

      // Format due date if provided
      if (formData.due_date_c) {
        if (formData.isAllDay) {
          // For all-day tasks, set to start of day
          taskData.due_date_c = new Date(formData.due_date_c).toISOString().split('T')[0] + 'T00:00:00.000Z';
        } else {
          taskData.due_date_c = new Date(formData.due_date_c).toISOString();
        }
      } else {
        taskData.due_date_c = null;
      }

      const result = await tasksService.update(task.Id, taskData);

      if (result) {
        toast.success('Task updated successfully');
        onTaskUpdated(); // Refresh parent data
        handleClose();
      }
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMode = () => {
    setIsQuickMode(!isQuickMode);
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] modal-scrollbar overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Edit Task</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {isQuickMode ? 'Quick task editing' : 'Detailed task information'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleToggleMode}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600"
                >
                  <ApperIcon name={isQuickMode ? "Settings" : "Zap"} className="w-4 h-4 mr-2" />
                  {isQuickMode ? 'Detailed' : 'Quick'}
                </Button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Quick Mode Fields */}
            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.task_title_c}
                  onChange={(e) => handleInputChange('task_title_c', e.target.value)}
                  placeholder="What needs to be done?"
                  className={errors.task_title_c ? 'border-red-500' : ''}
                  required
                />
                {errors.task_title_c && (
                  <p className="text-red-500 text-sm mt-1">{errors.task_title_c}</p>
                )}
              </div>

              {/* Task Type & Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Task Type
                  </label>
                  <select
                    value={formData.task_type_c}
                    onChange={(e) => handleInputChange('task_type_c', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="To-Do">To-Do</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority_c}
                    onChange={(e) => handleInputChange('priority_c', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Status & Due Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status_c}
                    onChange={(e) => handleInputChange('status_c', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.due_date_c}
                    onChange={(e) => handleInputChange('due_date_c', e.target.value)}
                    className={errors.due_date_c ? 'border-red-500' : ''}
                  />
                  {errors.due_date_c && (
                    <p className="text-red-500 text-sm mt-1">{errors.due_date_c}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Mode Fields */}
            <AnimatePresence>
              {!isQuickMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t border-slate-200 pt-6"
                >
                  {/* Assign To & Related To Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Assign To
                      </label>
                      <Input
                        type="text"
                        value={formData.assign_to_c}
                        onChange={(e) => handleInputChange('assign_to_c', e.target.value)}
                        placeholder="Person responsible"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Related To
                      </label>
                      <Input
                        type="text"
                        value={formData.related_to_c}
                        onChange={(e) => handleInputChange('related_to_c', e.target.value)}
                        placeholder="Related lead, deal, or contact"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description_c}
                      onChange={(e) => handleInputChange('description_c', e.target.value)}
                      placeholder="Additional details about this task..."
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tags
                    </label>
                    <Input
                      type="text"
                      value={formData.Tags}
                      onChange={(e) => handleInputChange('Tags', e.target.value)}
                      placeholder="Enter tags separated by commas"
                    />
                    <p className="text-sm text-slate-500 mt-1">Separate multiple tags with commas</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <Button
                type="button"
                onClick={handleClose}
                variant="ghost"
                disabled={isSubmitting}
              >
                Cancel
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
                Update Task
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditTaskModal;