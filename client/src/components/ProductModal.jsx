import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaStar, FaCloudUploadAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Helper function to generate a slug from a string
const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
};

// Create API instance with base URL
const API_BASE_URL = 'http://localhost:5000';
const api = axios.create({
  baseURL: API_BASE_URL
});

const ProductModal = ({ isOpen, onClose, onSubmit, product }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    type: '',
    subtype: '',
    description: '',
    shortDescription: '',
    rating: 5,
    featured: false,
    bestseller: false,
    newArrival: true,
    discount: 0,
    stock: 10,
    brand: '',
    tags: '',
    slug: ''
  });
  
  const [productCategories, setProductCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Automatically generate slug when name changes
  useEffect(() => {
    if (formData.name && !slugManuallyEdited) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name)
      }));
    }
  }, [formData.name, slugManuallyEdited]);

  // Fetch product categories and brands on component mount
  useEffect(() => {
    if (isOpen) {
      fetchProductCategories();
      fetchBrands();
      setRemovedImageUrls([]); // Reset removed images when modal opens
    }
  }, [isOpen]);

  // Fetch product categories from API
  const fetchProductCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/product-categories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product categories');
      }
      
      const data = await response.json();
      setProductCategories(data.categories || data);
    } catch (error) {
      toast.error('Failed to fetch product categories');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/brands`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      
      const data = await response.json();
      // The API now consistently returns { brands: [...] }
      if (data.brands && Array.isArray(data.brands)) {
        setBrands(data.brands);
      } else {
        console.error('Unexpected API response format:', data);
        setBrands([]);
      }
    } catch (error) {
      toast.error('Failed to fetch brands');
      console.error(error);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      console.log('Editing product:', product);
      
      // Handle the case where brand is an object
      const brandValue = product.brand && typeof product.brand === 'object' 
        ? product.brand.name 
        : product.brand || '';
        
      // Handle the case where category is an object
      const categoryValue = product.category && typeof product.category === 'object'
        ? product.category._id
        : product.category || '';
        
      // Handle the case where type is an object
      const typeValue = product.type && typeof product.type === 'object'
        ? product.type._id
        : product.type || '';
        
      // Handle the case where subtype is an object
      const subtypeValue = product.subtype && typeof product.subtype === 'object'
        ? product.subtype._id
        : product.subtype || '';
        
      // Keep original tags for now, will update after setting form data
      const originalTags = Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '';
        
      setFormData({
        ...product,
        brand: brandValue,
        category: categoryValue,
        type: typeValue,
        subtype: subtypeValue,
        rating: product.rating?.average || 5,
        featured: product.featured || false,
        discount: product.discount || 0,
        stock: product.stock || 10,
        shortDescription: product.shortDescription || product.description?.substring(0, 200) || '',
        bestseller: product.bestseller || false,
        newArrival: product.newArrival || true,
        tags: originalTags,
        slug: product.slug || generateSlug(product.name)
      });
      
      // Update tags after form data is set (on the next tick)
      setTimeout(() => {
        setFormData(current => {
          // Merge auto-generated tags with existing tags
          const autoTags = generateTags().split(', ').filter(Boolean);
          const existingTags = originalTags.split(',').map(tag => tag.trim()).filter(Boolean);
          const mergedTags = [...new Set([...autoTags, ...existingTags])].join(', ');
          
          return {
            ...current,
            tags: mergedTags
          };
        });
      }, 100); // Slight delay to ensure productCategories and brands are loaded
      
      // Set preview images if product has images
      if (product.photos && product.photos.length > 0) {
        setPreviewImages(product.photos.map(photo => photo.secure_url));
      } else if (product.image) {
        setPreviewImages([product.image]);
      }
    }
  }, [product, productCategories, brands]);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    // Preview images but don't upload yet
    const filePreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...filePreviews]);
    setSelectedFiles([...selectedFiles, ...files]);
  };
  
  const uploadImagesToCloudinary = async (files) => {
    try {
      // Get both tokens and prefer the adminToken if available
      const adminToken = localStorage.getItem('adminToken');
      const regularToken = localStorage.getItem('accessToken');
      const token = adminToken || regularToken;
      
      if (!token) {
        toast.error('Authentication token missing. Please login again.');
        setTimeout(() => {
          navigate('/admin/login');
        }, 1500);
        throw new Error('Authentication token missing. Please login again.');
      }
      
      console.log('Using token for upload:', token ? `Token exists (first 10 chars: ${token.substring(0, 10)}...)` : 'No token');
      
      // Check if token is likely expired (JWT typically has three parts separated by dots)
      if (!token.includes('.') || token.split('.').length !== 3) {
        toast.error('Your authentication token appears to be invalid. Please login again.');
        setTimeout(() => {
          navigate('/admin/login');
        }, 1500);
        throw new Error('Invalid token format');
      }
      
      const uploadPromises = files.map(file => {
        // Create a new FormData for each file
        const formData = new FormData();
        
        // Make sure this field name matches what the server expects ('image')
        formData.append('image', file);
        
        // Log what we're sending for debugging
        console.log('Uploading file:', file.name, file.type, file.size);
        
        return fetch(`${API_BASE_URL}/api/products/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't add Content-Type here, it will be set automatically with the boundary
          },
          body: formData
        })
        .then(async res => {
          // Try to parse the response as JSON
          let responseData;
          try {
            responseData = await res.json();
          } catch (err) {
            console.error('Failed to parse response as JSON:', err);
            responseData = { message: 'Invalid server response' };
          }
          
          if (!res.ok) {
            // Log detailed error information
            console.error('Image upload error:', {
              status: res.status,
              statusText: res.statusText,
              responseData,
              token: token ? 'Token present' : 'No token'
            });
            
            // Handle auth errors specially
            if (res.status === 401) {
              localStorage.removeItem('adminToken'); // Clear invalid token
              toast.error('Your session has expired. Please log in again.');
              setTimeout(() => {
                navigate('/admin/login');
              }, 1500);
              throw new Error('Your session has expired. Please log out and log in again.');
            }
            
            throw new Error(responseData.message || `Image upload failed with status ${res.status}`);
          }
          return responseData;
        });
      });
      
      const results = await Promise.all(uploadPromises.map(p => p.catch(error => {
        console.error('Upload promise error:', error);
        return null; // Return null for failed uploads
      })));
      
      console.log('Upload results:', results);
      
      // Extract URLs from response correctly - try multiple possible formats
      const uploadedUrls = results
        .filter(result => result !== null)
        .map(result => {
          if (!result) return null;
          
          // Log the entire result for debugging
          console.log('Individual result format:', result);
          
          // Try different possible response formats
          if (result.url) return result.url;
          if (result.secure_url) return result.secure_url;
          
          // If result has a nested format like Cloudinary might return
          if (result.result && result.result.url) return result.result.url;
          if (result.result && result.result.secure_url) return result.result.secure_url;
          
          // If the result itself is a string URL
          if (typeof result === 'string' && (
            result.startsWith('http://') || 
            result.startsWith('https://')
          )) {
            return result;
          }
          
          // Check for Cloudinary-specific format
          if (result.path && typeof result.path === 'string') {
            return result.path;
          }
          
          console.error('Unrecognized response format:', result);
          return null;
        })
        .filter(url => url !== null); // Filter out any nulls
      
      if (uploadedUrls.length > 0) {
        toast.success(`Successfully uploaded ${uploadedUrls.length} images`);
      } else {
        throw new Error('No images were successfully uploaded');
      }
      
      return uploadedUrls;
    } catch (error) {
      toast.error(`Failed to upload images: ${error.message}`);
      console.error('Image upload error:', error);
      return [];
    }
  };
  
  const removeImage = (index) => {
    // If this is an existing product image (not a newly selected file)
    if (product && product.photos && index < previewImages.length) {
      const imageToRemove = previewImages[index];
      
      // Check if this is an existing Cloudinary image
      if (product.photos.some(photo => photo.secure_url === imageToRemove)) {
        // Track this URL for later deletion on the server
        setRemovedImageUrls(prev => [...prev, imageToRemove]);
      }
    }
    
    // Create new arrays without the item at the specified index
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
    
    // If we have selected files (not uploaded yet), remove from there
    if (selectedFiles.length > index) {
      const newSelectedFiles = [...selectedFiles];
      newSelectedFiles.splice(index, 1);
      setSelectedFiles(newSelectedFiles);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate required fields
    if (!formData.name || !formData.price || !formData.category) {
      setError('Name, price and category are required');
      setSubmitting(false);
      return;
    }
    
    // Ensure slug is valid
    let productSlug = formData.slug;
    
    // Generate slug if empty
    if (!productSlug) {
      productSlug = generateSlug(formData.name);
      if (!productSlug) {
        setError('Could not generate a valid slug. Please enter a slug manually.');
        setSubmitting(false);
        return;
      }
    }
    
    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(productSlug)) {
      setError('Slug must contain only lowercase letters, numbers, and hyphens.');
      setSubmitting(false);
      return;
    }
    
    // Check if images are available or selected
    if (product) {
      // If editing an existing product
      if (previewImages.length === 0 && selectedFiles.length === 0) {
        setError('Please select at least one product image');
        setSubmitting(false);
        return;
      }
    } else {
      // If creating a new product
      if (selectedFiles.length === 0) {
        setError('Please select at least one product image');
        setSubmitting(false);
        return;
      }
    }
    
    // Ensure tags are generated if empty
    let productTags = formData.tags;
    if (!productTags || productTags.trim() === '') {
      productTags = generateTags();
      if (!productTags) {
        productTags = ''; // Fallback to empty string if generation fails
      }
    }
    
    try {
      let productImages = [];
      
      // Upload images if there are any new files selected
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const uploadedUrls = await uploadImagesToCloudinary(selectedFiles);
        setUploadingImages(false);
        
        if (uploadedUrls.length === 0) {
          setError('Failed to upload images. Please try again.');
          setSubmitting(false);
          return;
        }
        
        productImages = uploadedUrls.map(url => ({
          public_id: url.split('/').pop().split('.')[0],
          secure_url: url
        }));
      }
      
      // If editing, include existing images that weren't removed
      if (product && product.photos) {
        const existingImages = product.photos
          .filter(photo => !removedImageUrls.includes(photo.secure_url))
          .map(photo => ({
            public_id: photo.public_id,
            secure_url: photo.secure_url
          }));
        
        productImages = [...existingImages, ...productImages];
      }
      
      // Prepare the final form data with the validated slug and images
      const finalFormData = {
        ...formData,
        slug: productSlug,
        photos: productImages,
        // Brand is now stored as text directly, not as a reference to a brand ID
        tags: productTags.split(',').map(tag => tag.trim()).filter(Boolean), // Clean up tags
        removedImageUrls // Include list of images to remove on server
      };

      // If editing, update the product
      if (product) {
        const adminToken = localStorage.getItem('adminToken');
        const accessToken = localStorage.getItem('accessToken');
        const token = adminToken || accessToken;
        
        const response = await api.put(
          `/api/products/${product._id}`,
          finalFormData,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (response.status === 200) {
          toast.success('Product updated successfully!');
          onClose();
          onSubmit(response.data);
        }
      } else {
        // If creating a new product
        const adminToken = localStorage.getItem('adminToken');
        const accessToken = localStorage.getItem('accessToken');
        const token = adminToken || accessToken;
        
        const response = await api.post('/api/products', finalFormData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 201) {
          toast.success('Product created successfully!');
          onClose();
          onSubmit(response.data);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error submitting product. Please try again.'
      );
      console.error('Product submission error:', err);
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  // Get subtypes for selected type
  const getSubtypesForType = (categoryId, typeId) => {
    const category = productCategories.find(c => c._id === categoryId);
    if (!category) return [];
    
    const type = category.types.find(t => t._id === typeId);
    return type ? type.subtypes : [];
  };

  // Generate tags based on category, type, and subtype
  const generateTags = () => {
    const tags = [];
    
    // Get category name
    if (formData.category) {
      const category = productCategories.find(c => c._id === formData.category);
      if (category) {
        tags.push(category.name.toLowerCase());
      }
    }
    
    // Get type name
    if (formData.category && formData.type) {
      const category = productCategories.find(c => c._id === formData.category);
      if (category) {
        const type = category.types.find(t => t._id === formData.type);
        if (type) {
          tags.push(type.name.toLowerCase());
        }
      }
    }
    
    // Get subtype name
    if (formData.category && formData.type && formData.subtype) {
      const category = productCategories.find(c => c._id === formData.category);
      if (category) {
        const type = category.types.find(t => t._id === formData.type);
        if (type) {
          const subtype = type.subtypes.find(st => st._id === formData.subtype);
          if (subtype) {
            tags.push(subtype.name.toLowerCase());
          }
        }
      }
    }
    
    // Add brand name if available
    if (formData.brand) {
      // Since brand is now a text input, we can use it directly
      tags.push(formData.brand.toLowerCase());
    }
    
    // Filter out duplicates and join with commas
    return [...new Set(tags)].join(', ');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'rating' || name === 'discount' || name === 'stock' 
          ? parseFloat(value) || value 
          : value
      }));

      // If the user manually edits the slug, mark it as edited
      if (name === 'slug') {
        setSlugManuallyEdited(true);
      }
      
      // If name is changed and slug hasn't been manually edited, update the slug
      if (name === 'name' && !slugManuallyEdited) {
        setFormData(prev => ({
          ...prev,
          slug: generateSlug(value)
        }));
      }
    }

    // When category changes, reset type and subtype and update tags
    if (name === 'category') {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          type: '',
          subtype: ''
        };
        
        // Wait until the next tick to generate tags to ensure formData is updated
        setTimeout(() => {
          setFormData(current => ({
            ...current,
            tags: generateTags()
          }));
        }, 0);
        
        return updatedData;
      });
    }
    
    // When type changes, reset subtype and update tags
    else if (name === 'type') {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          subtype: ''
        };
        
        // Wait until the next tick to generate tags to ensure formData is updated
        setTimeout(() => {
          setFormData(current => ({
            ...current,
            tags: generateTags()
          }));
        }, 0);
        
        return updatedData;
      });
    }
    
    // When subtype or brand changes, update tags
    else if (name === 'subtype' || name === 'brand') {
      setTimeout(() => {
        setFormData(current => ({
          ...current,
          tags: generateTags()
        }));
      }, 0);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  // Get types for selected category
  const getTypesForCategory = (categoryId) => {
    const category = productCategories.find(c => c._id === categoryId);
    return category ? category.types : [];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-primary/20 dark:border-primary/10"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {product ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    max="90"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter discount"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter stock"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Featured
                  </label>
                  <div className="flex items-center h-10 mt-1">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Show on homepage
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter brand name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {productCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.category && getTypesForCategory(formData.category).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a type</option>
                    {getTypesForCategory(formData.category).map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {formData.category && formData.type && getSubtypesForType(formData.category, formData.type).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subtype
                  </label>
                  <select
                    name="subtype"
                    value={formData.subtype}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a subtype</option>
                    {getSubtypesForType(formData.category, formData.type).map((subtype) => (
                      <option key={subtype._id} value={subtype._id}>
                        {subtype.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span className="px-2">Upload images</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImages}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                
                {uploadingImages && (
                  <div className="mt-2 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent mr-2"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Uploading images...</span>
                  </div>
                )}
                
                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {previewImages.map((src, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={src} 
                          alt={`Preview ${index + 1}`} 
                          className="h-20 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows="2"
                  maxLength="200"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description for product listings (max 200 chars)"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formData.shortDescription.length}/200 characters
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bestseller
                  </label>
                  <div className="flex items-center h-10 mt-1">
                    <input
                      type="checkbox"
                      name="bestseller"
                      checked={formData.bestseller}
                      onChange={handleChange}
                      className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Mark as bestseller
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Arrival
                  </label>
                  <div className="flex items-center h-10 mt-1">
                    <input
                      type="checkbox"
                      name="newArrival"
                      checked={formData.newArrival}
                      onChange={handleChange}
                      className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Mark as new arrival
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((ratingValue) => (
                    <motion.button
                      key={ratingValue}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRatingClick(ratingValue)}
                      className="focus:outline-none"
                    >
                      <FaStar
                        className={`h-8 w-8 ${
                          ratingValue <= formData.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (auto-generated from category, type, subtype & brand)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tags auto-generated from category, type, subtype, brand"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tags are automatically generated from category, type, subtype and brand. You can add more tags separated by commas.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Slug (URL-friendly name)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter product slug (auto-generated if empty)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This will be used in the product URL. Leave empty to auto-generate from product name.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImages || submitting}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-lg ${
                    uploadingImages || submitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary hover:shadow-primary/25'
                  }`}
                >
                  {product ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal; 