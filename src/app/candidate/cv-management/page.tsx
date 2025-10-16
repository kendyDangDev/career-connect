'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Upload, FileText, Download, Eye, Trash2, Edit, Star, Search, X } from 'lucide-react';
import { format } from 'date-fns';

interface CandidateCv {
  id: string;
  candidateId: string;
  cvName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isPrimary: boolean;
  description?: string;
  uploadedAt: string;
  lastViewedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CvStatistics {
  totalCvs: number;
  totalFileSize: number;
  totalViews: number;
  primaryCvId: string | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function CvManagementPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState<CandidateCv | null>(null);

  const [uploadForm, setUploadForm] = useState({
    cvName: '',
    description: '',
    isPrimary: false,
    file: null as File | null,
  });

  const [editForm, setEditForm] = useState({
    cvName: '',
    description: '',
    isPrimary: false,
  });

  // Fetch CVs
  const { data, isLoading, error } = useQuery({
    queryKey: ['candidate-cvs', page, searchTerm, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/candidate/cv?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CVs');
      }

      return response.json();
    },
  });

  // Upload CV mutation
  const uploadCvMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/candidate/cv', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload CV');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('CV uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['candidate-cvs'] });
      setUploadModalOpen(false);
      resetUploadForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload CV');
    },
  });

  // Update CV mutation
  const updateCvMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/candidate/cv/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update CV');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('CV updated successfully');
      queryClient.invalidateQueries({ queryKey: ['candidate-cvs'] });
      setEditModalOpen(false);
      setSelectedCv(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update CV');
    },
  });

  // Delete CV mutation
  const deleteCvMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/candidate/cv/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete CV');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('CV deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['candidate-cvs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete CV');
    },
  });

  // Set primary CV mutation
  const setPrimaryCvMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/candidate/cv/${id}/primary`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to set primary CV');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Primary CV updated successfully');
      queryClient.invalidateQueries({ queryKey: ['candidate-cvs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to set primary CV');
    },
  });

  const resetUploadForm = () => {
    setUploadForm({
      cvName: '',
      description: '',
      isPrimary: false,
      file: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, or DOCX file');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must not exceed 10MB');
        return;
      }

      setUploadForm((prev) => ({
        ...prev,
        file,
        cvName: prev.cvName || file.name.replace(/\.[^/.]+$/, ''), // Auto-fill name if empty
      }));
    }
  };

  const handleUpload = () => {
    if (!uploadForm.file || !uploadForm.cvName) {
      toast.error('Please select a file and provide a name');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('cvName', uploadForm.cvName);
    if (uploadForm.description) {
      formData.append('description', uploadForm.description);
    }
    formData.append('isPrimary', uploadForm.isPrimary.toString());

    uploadCvMutation.mutate(formData);
  };

  const handleEdit = (cv: CandidateCv) => {
    setSelectedCv(cv);
    setEditForm({
      cvName: cv.cvName,
      description: cv.description || '',
      isPrimary: cv.isPrimary,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedCv) return;

    updateCvMutation.mutate({
      id: selectedCv.id,
      data: editForm,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this CV?')) {
      deleteCvMutation.mutate(id);
    }
  };

  const handleView = async (cv: CandidateCv) => {
    try {
      const response = await fetch(`/api/candidate/cv/${cv.id}?action=preview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to get preview URL');

      const result = await response.json();
      window.open(result.data.url, '_blank');
    } catch (error) {
      toast.error('Failed to preview CV');
    }
  };

  const handleDownload = async (cv: CandidateCv) => {
    try {
      const response = await fetch(`/api/candidate/cv/${cv.id}?action=download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to get download URL');

      const result = await response.json();
      const link = document.createElement('a');
      link.href = result.data.url;
      link.download = result.data.fileName;
      link.click();
    } catch (error) {
      toast.error('Failed to download CV');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const cvs = data?.data?.cvs || [];
  const pagination = data?.data?.pagination as PaginationInfo | undefined;
  const statistics = data?.data?.statistics as CvStatistics | undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">My CVs/Resumes</h1>
        <p className="text-gray-600">Manage your CV collection. You can upload up to 5 CVs.</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-1 text-sm text-gray-500">Total CVs</div>
            <div className="text-2xl font-bold">{statistics.totalCvs}/5</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-1 text-sm text-gray-500">Total Size</div>
            <div className="text-2xl font-bold">{formatFileSize(statistics.totalFileSize)}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-1 text-sm text-gray-500">Total Views</div>
            <div className="text-2xl font-bold">{statistics.totalViews}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <button
              onClick={() => setUploadModalOpen(true)}
              disabled={statistics.totalCvs >= 5}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <Upload className="mr-2 inline h-5 w-5" />
              Upload CV
            </button>
          </div>
        </div>
      )}

      {/* Search and Sort */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search CVs..."
                className="w-full rounded-lg border py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="uploadedAt">Upload Date</option>
              <option value="cvName">Name</option>
              <option value="fileSize">File Size</option>
              <option value="viewCount">Views</option>
            </select>
            <select
              className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* CV List */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading CVs...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">Failed to load CVs. Please try again.</div>
        ) : cvs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="mb-4 text-gray-600">You haven't uploaded any CVs yet.</p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Upload Your First CV
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    CV Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cvs.map((cv: CandidateCv) => (
                  <tr key={cv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{cv.cvName}</div>
                            {cv.description && (
                              <div className="text-sm text-gray-500">{cv.description}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatFileSize(cv.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {format(new Date(cv.uploadedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{cv.viewCount}</td>
                    <td className="px-6 py-4">
                      {cv.isPrimary ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <Star className="mr-1 h-3 w-3" />
                          Primary
                        </span>
                      ) : (
                        <button
                          onClick={() => setPrimaryCvMutation.mutate(cv.id)}
                          className="text-sm text-gray-400 hover:text-yellow-500"
                        >
                          Set as Primary
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(cv)}
                          className="text-gray-600 hover:text-blue-600"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(cv)}
                          className="text-gray-600 hover:text-green-600"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(cv)}
                          className="text-gray-600 hover:text-yellow-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cv.id)}
                          className="text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevious}
                className="rounded border px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
                className="rounded border px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-xl font-semibold">Upload CV</h2>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  resetUploadForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select File *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {uploadForm.file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">CV Name *</label>
                <input
                  type="text"
                  value={uploadForm.cvName}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, cvName: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  maxLength={100}
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={uploadForm.isPrimary}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, isPrimary: e.target.checked }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Set as primary CV</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setUploadModalOpen(false);
                    resetUploadForm();
                  }}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadCvMutation.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadCvMutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedCv && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-xl font-semibold">Edit CV</h2>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedCv(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">CV Name *</label>
                <input
                  type="text"
                  value={editForm.cvName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, cvName: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  maxLength={100}
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isPrimary}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, isPrimary: e.target.checked }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Set as primary CV</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedCv(null);
                  }}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateCvMutation.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateCvMutation.isPending ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
