import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaVideo, FaTimes, FaUpload, FaPlay, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const ReelsTab = () => {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    product: '',
    isActive: true
  });
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch products for the form
  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/products?populate=type,subtype`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch reels
  const fetchReels = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/reels?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reels');
      }

      const data = await response.json();
      setReels(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch reels');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReels(currentPage);
    fetchProducts();
  }, [currentPage]);

  // Handle file upload with progress
  const handleFileUpload = async (file, type) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append(type, file);

      const token = localStorage.getItem('adminToken');

      console.log('Starting upload:', {
        type,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/reels/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Upload response status:', response.status);

      const data = await response.json();
      console.log('Upload response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      if (!data.data || !data.data.url) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      toast.success('File uploaded successfully');
      return data.data.url;
    } catch (error) {
      console.error('Upload error details:', error);
      toast.error(error.message || 'Failed to upload file');
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle form input changes
  const handleInputChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (!file) return;

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        toast.error('File size must be less than 100MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid video file (MP4, WebM, or MOV)');
        return;
      }

      try {
        const fileType = name === 'video' ? 'video' : 'thumbnail';
        
        // Show upload starting toast
        const toastId = toast.loading('Starting upload...', { duration: Infinity });
        
        console.log('Starting file upload process:', {
          uploadType: fileType,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        });

        const url = await handleFileUpload(file, fileType);
        
        // Update toast to success
        toast.success('Upload complete!', { id: toastId });
        
        setFormData(prev => ({
          ...prev,
          [fileType === 'video' ? 'videoUrl' : 'thumbnailUrl']: url
        }));
      } catch (error) {
        // Update toast to error
        toast.error('Upload failed: ' + (error.message || 'Unknown error'), { id: 'uploadToast' });
        console.error('File upload error:', error);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle create/update reel
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = selectedReel 
        ? `${apiUrl}/api/reels/${selectedReel._id}`
        : `${apiUrl}/api/reels`;
      
      const method = selectedReel ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save reel');
      }

      const data = await response.json();
      toast.success(`Reel ${selectedReel ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setSelectedReel(null);
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        product: '',
        isActive: true
      });
      fetchReels(currentPage);
    } catch (error) {
      toast.error(error.message || 'Failed to save reel');
      console.error(error);
    }
  };

  // Handle delete reel
  const handleDelete = async (reelId) => {
    if (!window.confirm('Are you sure you want to delete this reel?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/reels/${reelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete reel');
      }

      toast.success('Reel deleted successfully');
      fetchReels(currentPage);
    } catch (error) {
      toast.error('Failed to delete reel');
      console.error(error);
    }
  };

  // Handle edit reel
  const handleEdit = (reel) => {
    setSelectedReel(reel);
    setFormData({
      title: reel.title,
      description: reel.description,
      videoUrl: reel.videoUrl,
      product: reel.product._id,
      isActive: reel.isActive
    });
    setShowForm(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reels</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedReel(null);
              setFormData({
                title: '',
                description: '',
                videoUrl: '',
                product: '',
                isActive: true
              });
              setShowForm(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-primary/25"
          >
            <FaPlus className="h-4 w-4" />
            <span>Add Reel</span>
          </motion.button>
        </div>

        {/* Reels List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reels.map((reel) => (
              <div key={reel._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
                  {reel.videoUrl && (
                    <video
                      src={reel.videoUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{reel.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{reel.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reel.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {reel.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(reel)}
                        className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                      >
                        <FaEdit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(reel._id)}
                        className="p-2 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
                      >
                        <FaTrash className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal Portal */}
      {showForm && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999]"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedReel ? 'Edit Reel' : 'Add New Reel'}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        required
                      />
                    </div>

                    {/* Video Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Video
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex-1 cursor-pointer">
                          <div className={`px-4 py-2 rounded-lg border-2 border-dashed ${
                            isUploading 
                              ? 'border-primary animate-pulse' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary'
                          } bg-gray-50 dark:bg-gray-700 text-center relative`}>
                            {isUploading ? (
                              <div className="flex flex-col items-center">
                                <FaSpinner className="h-6 w-6 text-primary animate-spin mb-2" />
                                <span className="text-sm text-primary">Uploading...</span>
                                <div className="w-full h-1 bg-gray-200 rounded-full mt-2">
                                  <div 
                                    className="h-1 bg-primary rounded-full transition-all duration-300"
                                    style={{ width: '100%', animation: 'progress 2s infinite linear' }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <FaUpload className="mx-auto h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {formData.videoUrl ? 'Change Video' : 'Upload Video'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                                  MP4, WebM, or MOV (max 100MB)
                                </span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            name="video"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={handleInputChange}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                        {formData.videoUrl && !isUploading && (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                            <video
                              src={formData.videoUrl}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <FaPlay className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product
                      </label>
                      <select
                        name="product"
                        value={formData.product}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} - {product.type?.name} {product.subtype?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary rounded-lg shadow-md hover:shadow-primary/25 transition-all"
                    >
                      {selectedReel ? 'Update Reel' : 'Create Reel'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ReelsTab; 