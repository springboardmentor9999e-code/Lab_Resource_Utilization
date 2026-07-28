import { useState, useRef } from 'react';
import { X, FileText, File, Image, FileSpreadsheet, Trash2, Upload, Download, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FILE_ICONS = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  doc: { icon: File, color: 'text-blue-500', bg: 'bg-blue-50' },
  docx: { icon: File, color: 'text-blue-500', bg: 'bg-blue-50' },
  xls: { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50' },
  xlsx: { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50' },
  png: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-50' },
  jpg: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-50' },
  jpeg: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-50' },
};

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || { icon: File, color: 'text-gray-500', bg: 'bg-gray-50' };
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function DocumentManagementModal({ equipment, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = (files) => {
    const newDocs = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      addedAt: new Date().toISOString(),
      status: 'uploaded',
    }));
    setDocuments(prev => [...prev, ...newDocs]);
    toast.success(`${newDocs.length} document(s) added`);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast.success('Document removed');
  };

  const handleDownload = (doc) => {
    toast.success(`Downloading ${doc.name} (demo)`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Document Management</h2>
            <p className="text-sm text-gray-500">{equipment?.equipmentName || 'Equipment'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
              className="hidden"
            />
            <Upload size={40} className={`mx-auto mb-3 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, XLSX, PNG, JPG up to 10MB
            </p>
          </div>

          {/* Document List */}
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-xs text-gray-400 mt-1">Upload files to attach them to this equipment</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Attached Documents ({documents.length})</h3>
                <span className="text-xs text-gray-400">Demo mode — files stored locally</span>
              </div>
              {documents.map((doc) => {
                const fileConfig = getFileIcon(doc.name);
                const Icon = fileConfig.icon;
                return (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-lg ${fileConfig.bg}`}>
                      <Icon size={20} className={fileConfig.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.size)} • Added {new Date(doc.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle size={12} /> Uploaded
                      </span>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-500"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-1.5 hover:bg-red-100 rounded text-red-500"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex-shrink-0">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-yellow-700 text-center">
              This is a prototype demo. Documents are stored in browser memory only. In production, files would be uploaded to cloud storage (AWS S3 / Cloudinary).
            </p>
          </div>
          <button onClick={onClose} className="w-full btn-secondary py-2">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
