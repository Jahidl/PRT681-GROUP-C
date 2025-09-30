import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, X, FileText, Clock, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { JobService, type JobStatus } from '../../services/jobService';

// Toast notification component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const icon = type === 'success' ? <CheckCircle className="h-5 w-5" /> : 
               type === 'error' ? <AlertCircle className="h-5 w-5" /> : 
               <AlertCircle className="h-5 w-5" />;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md`}>
      {icon}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface CsvUploadResult {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
  createdProducts: unknown[];
  createdCategories: string[];
  createdSubcategories: string[];
}

interface CsvUploadProps {
  onCancel: () => void;
  onUploaded: () => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onCancel, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CsvUploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopPollingRef = useRef<(() => void) | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      showToast('Please select a CSV file', 'error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);
    setCurrentJob(null);

    try {
      // Read file content
      const fileContent = await file.text();
      
      // Create job using the new API
      const jobResponse = await JobService.createJob(file.name, fileContent, file.size);
      
      showToast('CSV upload queued for processing. Tracking progress...', 'info');
      
      // Start polling for job status
      const stopPolling = await JobService.pollJobStatus(
        jobResponse.jobId,
        (job) => {
          setCurrentJob(job);
          // Update progress in real-time
        },
        (completedJob) => {
          setCurrentJob(completedJob);
          
          // Convert job result to legacy format for display
          const legacyResult: CsvUploadResult = {
            totalRows: completedJob.totalRows,
            successfulRows: completedJob.successfulRows,
            failedRows: completedJob.failedRows,
            errors: completedJob.errors,
            createdProducts: completedJob.createdProducts,
            createdCategories: completedJob.createdCategories,
            createdSubcategories: completedJob.createdSubcategories,
          };
          setResult(legacyResult);
          
          if (completedJob.status === 'Completed' && completedJob.successfulRows > 0) {
            showToast(`Successfully processed ${completedJob.successfulRows} product${completedJob.successfulRows !== 1 ? 's' : ''}!`, 'success');
            onUploaded();
          } else if (completedJob.status === 'Failed') {
            showToast(`Processing failed: ${completedJob.errorMessage || 'Unknown error'}`, 'error');
          } else if (completedJob.failedRows > 0) {
            showToast(`Processing completed with ${completedJob.failedRows} failed row${completedJob.failedRows !== 1 ? 's' : ''}. Check the results below.`, 'error');
          }
        },
        (error) => {
          showToast(`Error tracking job: ${error.message}`, 'error');
        }
      );
      
      stopPollingRef.current = stopPolling;
      
    } catch (error) {
      console.error('Upload error:', error);
      showToast(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
    };
  }, []);

  const downloadTemplate = () => {
    const headers = [
      'Id', 'Name', 'Description', 'Price', 'OriginalPrice', 'CategoryId', 'SubcategoryId',
      'Brand', 'Rating', 'ReviewCount', 'InStock', 'StockCount', 'Images', 'Features',
      'Specifications', 'Tags', 'Sizes', 'Colors', 'IsActive'
    ];

    const sampleRow = [
      'sample-product-1',
      'Sample Product',
      'This is a sample product description',
      '99.99',
      '129.99',
      'fitness',
      'cardio',
      'SampleBrand',
      '4.5',
      '150',
      'true',
      '100',
      '["image1.jpg","image2.jpg"]',
      '["Feature 1","Feature 2"]',
      '{"Material":"Cotton","Weight":"1kg"}',
      '["tag1","tag2"]',
      '["S","M","L"]',
      '["Red","Blue"]',
      'true'
    ];

    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-upload-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('CSV template downloaded successfully!', 'success');
  };

  return (
    <div className="p-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">CSV Product Upload</h1>
            <p className="text-gray-400">Upload multiple products at once using a CSV file</p>
          </div>
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Instructions</h3>
          <div className="space-y-3 text-gray-300">
            <p>1. Download the CSV template to see the required format</p>
            <p>2. Fill in your product data following the template structure</p>
            <p>3. Ensure all required fields are filled: Id, Name, CategoryId, Brand</p>
            <p>4. JSON fields (Images, Features, etc.) should be valid JSON arrays or objects</p>
            <p>5. Upload your completed CSV file</p>
          </div>
          
          <Button
            onClick={downloadTemplate}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
        </div>

        {/* File Upload Area */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            
            {file ? (
              <div className="space-y-2">
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  onClick={() => setFile(null)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-300">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Select CSV File
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {file && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Products
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Job Progress */}
        {currentJob && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Processing Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Job ID:</span>
                <span className="text-white font-mono text-sm">{currentJob.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status:</span>
                <div className="flex items-center">
                  {currentJob.status === 'Processing' && (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />
                  )}
                  {currentJob.status === 'Queued' && (
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                  )}
                  {currentJob.status === 'Completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  )}
                  {currentJob.status === 'Failed' && (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className={`font-medium ${
                    currentJob.status === 'Processing' ? 'text-blue-400' :
                    currentJob.status === 'Queued' ? 'text-yellow-400' :
                    currentJob.status === 'Completed' ? 'text-green-400' :
                    currentJob.status === 'Failed' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {currentJob.statusText}
                  </span>
                </div>
              </div>

              {currentJob.totalRows > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-white">{currentJob.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentJob.progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Processed: {currentJob.processedRows}/{currentJob.totalRows}</span>
                    <span>Success: {currentJob.successfulRows} | Failed: {currentJob.failedRows}</span>
                  </div>
                </div>
              )}

              {currentJob.errorMessage && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{currentJob.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Rows</span>
                  <span className="text-2xl font-bold text-white">{result.totalRows}</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Successful</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-2xl font-bold text-green-500">{result.successfulRows}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Failed</span>
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-2xl font-bold text-red-500">{result.failedRows}</span>
                  </div>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold mb-2">Errors:</h4>
                <div className="max-h-40 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-red-300 text-sm mb-1">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {result.successfulRows > 0 && (
              <div className="mt-4 bg-green-900/20 border border-green-800 rounded-lg p-4">
                <p className="text-green-400 mb-3">
                  Successfully uploaded {result.successfulRows} product{result.successfulRows !== 1 ? 's' : ''}!
                </p>
                
                {result.createdCategories && result.createdCategories.length > 0 && (
                  <div className="mb-2">
                    <span className="text-green-300 text-sm font-medium">Created Categories: </span>
                    <span className="text-green-200 text-sm">
                      {result.createdCategories.join(', ')}
                    </span>
                  </div>
                )}
                
                {result.createdSubcategories && result.createdSubcategories.length > 0 && (
                  <div>
                    <span className="text-green-300 text-sm font-medium">Created Subcategories: </span>
                    <span className="text-green-200 text-sm">
                      {result.createdSubcategories.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvUpload;
