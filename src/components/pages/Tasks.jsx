import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, isThisWeek, isPast, parseISO } from 'date-fns';
import { tasksService } from '@/services/api/tasksService';
import ApperIcon from '@/components/ApperIcon';
import MetricCard from '@/components/molecules/MetricCard';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';
import CreateTaskModal from '@/components/molecules/CreateTaskModal';
import { toast } from 'react-toastify';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, overdue: 0, dueToday: 0, completedThisWeek: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('due_date');

  const loadTasks = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const [tasksData, statsData] = await Promise.all([
        tasksService.getAll(),
        tasksService.getTaskStats()
      ]);
      
      setTasks(tasksData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Filter and search tasks
  useEffect(() => {
    let filtered = [...tasks];

    // Apply active filter
    if (activeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      switch (activeFilter) {
        case 'today':
          filtered = filtered.filter(task => {
            const dueDate = task.due_date_c ? new Date(task.due_date_c) : null;
            return dueDate && isToday(dueDate);
          });
          break;
        case 'upcoming':
          filtered = filtered.filter(task => {
            const dueDate = task.due_date_c ? new Date(task.due_date_c) : null;
            return dueDate && dueDate > today && dueDate <= nextWeek;
          });
          break;
        case 'overdue':
          filtered = filtered.filter(task => {
            const dueDate = task.due_date_c ? new Date(task.due_date_c) : null;
            return dueDate && isPast(dueDate) && !isToday(dueDate) && task.status_c !== 'Completed';
          });
          break;
        case 'completed':
          filtered = filtered.filter(task => task.status_c === 'Completed');
          break;
        case 'no-due-date':
          filtered = filtered.filter(task => !task.due_date_c);
          break;
        default:
          break;
      }
    }

    // Apply additional filters
    if (priorityFilter) {
      filtered = filtered.filter(task => task.priority_c === priorityFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter(task => task.task_type_c === typeFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(task => task.status_c === statusFilter);
    }

    // Apply search
if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.task_title_c?.toLowerCase().includes(query) ||
        task.description_c?.toLowerCase().includes(query) ||
        task.assign_to_c?.toLowerCase().includes(query) ||
        task.Tags?.toLowerCase().includes(query)
      );
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          const aDate = a.due_date_c ? new Date(a.due_date_c) : new Date('9999-12-31');
          const bDate = b.due_date_c ? new Date(b.due_date_c) : new Date('9999-12-31');
          return aDate - bDate;
        case 'priority':
          const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
          return (priorityOrder[a.priority_c] || 3) - (priorityOrder[b.priority_c] || 3);
        case 'created_date':
          return new Date(b.CreatedOn) - new Date(a.CreatedOn);
        case 'title':
          return (a.task_title_c || '').localeCompare(b.task_title_c || '');
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, activeFilter, priorityFilter, typeFilter, statusFilter, searchQuery, sortBy]);

  const handleTaskComplete = async (taskId) => {
    try {
      await tasksService.update(taskId, { status_c: 'Completed' });
      await loadTasks(); // Refresh data
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await tasksService.delete(taskId);
        await loadTasks(); // Refresh data
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const clearAllFilters = () => {
    setActiveFilter('all');
    setPriorityFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setSearchQuery('');
  };

  const getTaskGrouping = (tasks) => {
    const groups = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      noDueDate: []
    };

    tasks.forEach(task => {
      if (!task.due_date_c) {
        groups.noDueDate.push(task);
      } else {
        const dueDate = new Date(task.due_date_c);
        if (isPast(dueDate) && !isToday(dueDate) && task.status_c !== 'Completed') {
          groups.overdue.push(task);
        } else if (isToday(dueDate)) {
          groups.today.push(task);
        } else if (isTomorrow(dueDate)) {
          groups.tomorrow.push(task);
        } else if (isThisWeek(dueDate)) {
          groups.thisWeek.push(task);
        } else {
          groups.later.push(task);
        }
      }
    });

    return groups;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'Call': return 'Phone';
      case 'Email': return 'Mail';
      case 'Meeting': return 'Users';
      case 'To-Do': return 'CheckSquare';
      case 'Follow-up': return 'RotateCcw';
      default: return 'FileText';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return { text: 'No due date', color: 'text-gray-500' };
    
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) {
      return { text: format(date, 'MMM dd, p'), color: 'text-red-600' };
    } else if (isToday(date)) {
      return { text: `Today, ${format(date, 'p')}`, color: 'text-orange-600' };
    } else if (isTomorrow(date)) {
      return { text: `Tomorrow, ${format(date, 'p')}`, color: 'text-black' };
    } else {
      return { text: format(date, 'MMM dd, p'), color: 'text-black' };
    }
  };

  const renderTaskCard = (task) => {
    const dueDateInfo = formatDueDate(task.due_date_c);
    
    return (
      <motion.div
        key={task.Id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <button
            onClick={() => handleTaskComplete(task.Id)}
            className="mt-1 w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 transition-colors"
            disabled={task.status_c === 'Completed'}
          >
            {task.status_c === 'Completed' && (
              <ApperIcon name="Check" className="w-3 h-3 text-primary-600" />
            )}
          </button>

          {/* Priority Indicator */}
          <div className={`w-1 h-16 rounded-full ${getPriorityColor(task.priority_c)}`} />

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className={`font-medium text-slate-900 line-clamp-2 ${task.status_c === 'Completed' ? 'line-through text-slate-500' : ''}`}>
              {task.task_title_c}
            </h3>

            {/* Due Date & Assigned To */}
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <div className="flex items-center space-x-1">
                <ApperIcon name="Calendar" className="w-4 h-4 text-slate-400" />
                <span className={dueDateInfo.color}>{dueDateInfo.text}</span>
              </div>
              {task.assign_to_c && (
                <div className="flex items-center space-x-1">
                  <ApperIcon name="User" className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{task.assign_to_c}</span>
                </div>
              )}
            </div>

            {/* Related To */}
            {task.related_to_c && (
              <div className="flex items-center space-x-1 mt-1 text-sm text-slate-600">
                <ApperIcon name="Building" className="w-4 h-4 text-slate-400" />
                <span>Related: {task.related_to_c}</span>
              </div>
)}
            <td className="px-6 py-4 whitespace-nowrap">
              {task.Tags && (
                <div className="flex flex-wrap gap-1">
                  {task.Tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </td>

            {/* Task Type & Status */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <ApperIcon name={getTaskTypeIcon(task.task_type_c)} className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{task.task_type_c}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status_c)}`}>
                  {task.status_c}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                  <ApperIcon name="Edit" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTaskComplete(task.Id)}
                  className="p-1 text-slate-400 hover:text-green-600 rounded"
                  disabled={task.status_c === 'Completed'}
                >
                  <ApperIcon name="CheckCircle" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTaskDelete(task.Id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadTasks} />;

  const groupedTasks = getTaskGrouping(filteredTasks);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <ApperIcon name="CheckSquare" className="w-8 h-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
              </div>
              <p className="text-slate-600">Manage your to-dos and follow-ups</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <MetricCard
              title="Total Tasks"
              value={stats.total}
              icon="CheckSquare"
              color="primary"
            />
            <MetricCard
              title="Overdue Tasks"
              value={stats.overdue}
              icon="AlertCircle"
              color="error"
            />
            <MetricCard
              title="Due Today"
              value={stats.dueToday}
              icon="Clock"
              color="warning"
            />
            <MetricCard
              title="Completed This Week"
              value={stats.completedThisWeek}
              icon="CheckCircle"
              color="success"
            />
          </div>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              {/* My Tasks Section */}
              <div className="mb-6">
                <h3 className="font-medium text-slate-900 mb-3">My Tasks</h3>
                <div className="space-y-1">
                  {[
                    { key: 'all', label: 'All Tasks', count: tasks.length },
                    { key: 'today', label: 'Today', count: groupedTasks.today.length },
                    { key: 'upcoming', label: 'Upcoming', count: groupedTasks.tomorrow.length + groupedTasks.thisWeek.length },
                    { key: 'overdue', label: 'Overdue', count: groupedTasks.overdue.length, className: 'text-red-600' },
                    { key: 'completed', label: 'Completed', count: tasks.filter(t => t.status_c === 'Completed').length },
                    { key: 'no-due-date', label: 'No Due Date', count: groupedTasks.noDueDate.length }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        activeFilter === filter.key 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-slate-600 hover:bg-slate-50'
                      } ${filter.className || ''}`}
                    >
                      <span>{filter.label}</span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter By Section */}
              <div className="mb-6">
                <h3 className="font-medium text-slate-900 mb-3">Filter By</h3>
                
                {/* Priority Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Priorities</option>
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Task Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Call">📞 Call</option>
                    <option value="Email">📧 Email</option>
                    <option value="Meeting">🤝 Meeting</option>
                    <option value="To-Do">✅ To-Do</option>
                    <option value="Follow-up">🔄 Follow-up</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Quick Actions</h3>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Center Area - Task List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-slate-200">
              {/* Task List Controls */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <h2 className="font-medium text-slate-900">
                      {activeFilter === 'all' ? 'All Tasks' : 
                       activeFilter === 'today' ? 'Due Today' :
                       activeFilter === 'upcoming' ? 'Upcoming' :
                       activeFilter === 'overdue' ? 'Overdue' :
                       activeFilter === 'completed' ? 'Completed' :
                       activeFilter === 'no-due-date' ? 'No Due Date' : 'Tasks'}
                    </h2>
                    <span className="text-sm text-slate-500">
                      ({filteredTasks.length} tasks)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                      <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    
                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-slate-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="due_date">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="created_date">Created Date</option>
                      <option value="title">Title</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Task List */}
              <div className="divide-y divide-slate-200">
                {filteredTasks.length === 0 ? (
                  <div className="p-8">
                    <Empty
                      title="No tasks found"
                      description="Create your first task to get started"
                      icon="CheckSquare"
                      action={
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                          New Task
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {/* Grouped Task Sections */}
                    {groupedTasks.overdue.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                          <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
                          Overdue ({groupedTasks.overdue.length} tasks)
                        </h3>
                        <div className="space-y-3">
                          {groupedTasks.overdue.map(renderTaskCard)}
                        </div>
                      </div>
                    )}

                    {groupedTasks.today.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-orange-600 mb-2 flex items-center">
                          <ApperIcon name="Clock" className="w-4 h-4 mr-1" />
                          Today ({groupedTasks.today.length} tasks)
                        </h3>
                        <div className="space-y-3">
                          {groupedTasks.today.map(renderTaskCard)}
                        </div>
                      </div>
                    )}

                    {groupedTasks.tomorrow.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                          Tomorrow ({groupedTasks.tomorrow.length} tasks)
                        </h3>
                        <div className="space-y-3">
                          {groupedTasks.tomorrow.map(renderTaskCard)}
                        </div>
                      </div>
                    )}

                    {groupedTasks.thisWeek.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                          This Week ({groupedTasks.thisWeek.length} tasks)
                        </h3>
                        <div className="space-y-3">
                          {groupedTasks.thisWeek.map(renderTaskCard)}
                        </div>
                      </div>
                    )}

                    {groupedTasks.later.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <ApperIcon name="Clock" className="w-4 h-4 mr-1" />
                          Later ({groupedTasks.later.length} tasks)
                        </h3>
                        <div className="space-y-3">
                          {groupedTasks.later.map(renderTaskCard)}
                        </div>
                      </div>
                    )}

                    {groupedTasks.noDueDate.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <ApperIcon name="Minus" className="w-4 h-4 mr-1" />
                          No Due Date ({groupedTasks.noDueDate.length} tasks)
                        </h3>
                        <div className="space-y-3">
                          {groupedTasks.noDueDate.map(renderTaskCard)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={loadTasks}
      />
    </div>
  );
};

export default Tasks;