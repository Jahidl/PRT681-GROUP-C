import React, { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, X, FileText } from 'lucide-react';
import { Button } from '../ui/button';

interface CsvUploadResult {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
  createdProducts: any[];
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a CSV file');
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
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/products/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadResult: CsvUploadResult = await response.json();
        setResult(uploadResult);
        if (uploadResult.successfulRows > 0) {
          onUploaded();
        }
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
  };

  return (
    <div className="p-8">
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
