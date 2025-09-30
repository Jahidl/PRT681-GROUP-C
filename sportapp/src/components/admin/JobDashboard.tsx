import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Eye, 
  RefreshCw,
  BarChart3,
  FileText,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/button';
import { JobService, type JobStatus, type JobListResponse, type JobStats } from '../../services/jobService';

interface JobDashboardProps {
  onClose: () => void;
}

const JobDashboard: React.FC<JobDashboardProps> = ({ onClose }) => {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobStatus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async (page = 1, status = '') => {
    try {
      setLoading(page === 1);
      const response: JobListResponse = await JobService.getJobs(page, 10, status || undefined);
      setJobs(response.jobs);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.totalCount / response.pageSize));
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await JobService.getJobStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadJobs(currentPage, statusFilter),
      loadStats()
    ]);
    setRefreshing(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await JobService.deleteJob(jobId);
      await loadJobs(currentPage, statusFilter);
      await loadStats();
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job');
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    loadJobs(1, status);
  };

  useEffect(() => {
    loadJobs();
    loadStats();
    
    // Auto-refresh every 5 seconds for active jobs
    const interval = setInterval(() => {
      if (jobs.some(job => job.status === 'Processing' || job.status === 'Queued')) {
        handleRefresh();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Queued':
        return 'text-yellow-400';
      case 'Processing':
        return 'text-blue-400';
      case 'Completed':
        return 'text-green-400';
      case 'Failed':
        return 'text-red-400';
      case 'Cancelled':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Job Dashboard</h1>
            <p className="text-gray-400">Monitor CSV upload jobs and processing status</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Jobs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalJobs}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Products Created</p>
                  <p className="text-2xl font-bold text-green-400">{stats.totalProductsCreated}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Processing</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.processingJobs}</p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{stats.failedJobs}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 font-medium">Filter by status:</span>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleStatusFilterChange('')}
                variant={statusFilter === '' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter === '' ? 'bg-orange-500 hover:bg-orange-600' : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800'}
              >
                All
              </Button>
              <Button
                onClick={() => handleStatusFilterChange('Queued')}
                variant={statusFilter === 'Queued' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter === 'Queued' ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800'}
              >
                Queued
              </Button>
              <Button
                onClick={() => handleStatusFilterChange('Processing')}
                variant={statusFilter === 'Processing' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter === 'Processing' ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800'}
              >
                Processing
              </Button>
              <Button
                onClick={() => handleStatusFilterChange('Completed')}
                variant={statusFilter === 'Completed' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter === 'Completed' ? 'bg-green-500 hover:bg-green-600' : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800'}
              >
                Completed
              </Button>
              <Button
                onClick={() => handleStatusFilterChange('Failed')}
                variant={statusFilter === 'Failed' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter === 'Failed' ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800'}
              >
                Failed
              </Button>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Results
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-400 mt-2">Loading jobs...</p>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{job.fileName}</p>
                          <p className="text-gray-400 text-sm font-mono">{job.id}</p>
                          <p className="text-gray-500 text-xs">{formatFileSize(job.fileSizeBytes)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(job.status)}
                          <span className={`ml-2 font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {job.totalRows > 0 ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300">{job.progressPercentage}%</span>
                              <span className="text-gray-400">{job.processedRows}/{job.totalRows}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${job.progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {job.successfulRows}
                          </div>
                          <div className="flex items-center text-red-400">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {job.failedRows}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(job.createdAtUtc)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => setSelectedJob(job)}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteJob(job.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:text-white hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    loadJobs(newPage, statusFilter);
                  }}
                  disabled={currentPage === 1}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    loadJobs(newPage, statusFilter);
                  }}
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Job Details</h2>
                  <Button
                    onClick={() => setSelectedJob(null)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm">Job ID</label>
                        <p className="text-white font-mono">{selectedJob.id}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">File Name</label>
                        <p className="text-white">{selectedJob.fileName}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Status</label>
                        <div className="flex items-center">
                          {getStatusIcon(selectedJob.status)}
                          <span className={`ml-2 font-medium ${getStatusColor(selectedJob.status)}`}>
                            {selectedJob.statusText}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm">File Size</label>
                        <p className="text-white">{formatFileSize(selectedJob.fileSizeBytes)}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Created</label>
                        <p className="text-white">{formatDate(selectedJob.createdAtUtc)}</p>
                      </div>
                      {selectedJob.completedAtUtc && (
                        <div>
                          <label className="text-gray-400 text-sm">Completed</label>
                          <p className="text-white">{formatDate(selectedJob.completedAtUtc)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  {selectedJob.totalRows > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Progress</h3>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-white">{selectedJob.totalRows}</p>
                            <p className="text-gray-400 text-sm">Total Rows</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{selectedJob.successfulRows}</p>
                            <p className="text-gray-400 text-sm">Successful</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-400">{selectedJob.failedRows}</p>
                            <p className="text-gray-400 text-sm">Failed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{selectedJob.progressPercentage}%</p>
                            <p className="text-gray-400 text-sm">Complete</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedJob.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {selectedJob.errors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Errors</h3>
                      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                        {selectedJob.errors.map((error, index) => (
                          <p key={index} className="text-red-300 text-sm mb-2">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Created Items */}
                  {(selectedJob.createdCategories.length > 0 || selectedJob.createdSubcategories.length > 0) && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Created Items</h3>
                      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                        {selectedJob.createdCategories.length > 0 && (
                          <div className="mb-3">
                            <p className="text-green-300 font-medium mb-1">Categories ({selectedJob.createdCategories.length})</p>
                            <p className="text-green-200 text-sm">{selectedJob.createdCategories.join(', ')}</p>
                          </div>
                        )}
                        {selectedJob.createdSubcategories.length > 0 && (
                          <div>
                            <p className="text-green-300 font-medium mb-1">Subcategories ({selectedJob.createdSubcategories.length})</p>
                            <p className="text-green-200 text-sm">{selectedJob.createdSubcategories.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDashboard;
