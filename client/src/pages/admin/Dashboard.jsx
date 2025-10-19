import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaChevronDown, FaChevronUp, FaStar, FaSearch, FaFilter, FaTimes, FaTags, FaArrowUp, FaArrowDown, FaPencilAlt, FaExclamationTriangle, FaFire, FaTag, FaComments, FaPaperPlane, FaVideo, FaCheck, FaSpinner } from 'react-icons/fa';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { toast } from 'react-hot-toast';
import ProductModal from '../../components/ProductModal';
import io from 'socket.io-client';
import ChatTab from './ChatTab';
import ReelsTab from '../../components/admin/ReelsTab';

const Dashboard = () => {
  const { adminLogout } = useAdmin();
  const { 
    categories, 
    categoryStructure, 
    popularBrands,
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useShop();
  
  const [activeTab, setActiveTab] = useState('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    subtype: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    featured: null,
    bestseller: null,
    newArrival: null,
    stockStatus: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [brands, setBrands] = useState([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandFormData, setBrandFormData] = useState({
    name: '',
    description: '',
    category: 'affordable',
    featured: false
  });

  // ProductCategory state
  const [productCategories, setProductCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSubtype, setSelectedSubtype] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    featured: false,
    order: 0
  });
  const [typeFormData, setTypeFormData] = useState({
    name: '',
    description: ''
  });
  const [subtypeFormData, setSubtypeFormData] = useState({
    name: '',
    description: ''
  });
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddSubtypeModal, setShowAddSubtypeModal] = useState(false);
  const [showTypesDialog, setShowTypesDialog] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // State for brand dialog
  const [showBrandsDialog, setShowBrandsDialog] = useState(false);

  // Add a new state for products and loading state
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const socketRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [orderStatus, setOrderStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Fetch product categories from API
  const fetchProductCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const token = localStorage.getItem('adminToken');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/product-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch product categories');
      }
      
      const data = await response.json();
      setProductCategories(data.categories || data);
    } catch (error) {
      toast.error('Failed to fetch product categories');
      console.error(error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      setIsLoadingBrands(true);
      const token = localStorage.getItem('adminToken');
      
      // Fetch all brands
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
      
      // Also fetch grouped brands for reference
      const groupedResponse = await fetch(`${apiUrl}/api/brands/grouped`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (groupedResponse.ok) {
        const groupedData = await groupedResponse.json();
        console.log('Grouped brands:', groupedData);
        // Optional: You can store this in a state variable if needed
      }
    } catch (error) {
      toast.error('Failed to fetch brands');
      console.error(error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  // Handle adding a new brand
  const handleAddBrand = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/brands`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to add brand');
      }

      const newBrand = await response.json();
      setBrands([...brands, newBrand]);
      toast.success('Brand added successfully');
      setBrandFormData({
        name: '',
        description: '',
        category: 'affordable',
        featured: false
      });
      
      // Close the brands dialog after successful addition
      setShowBrandsDialog(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle updating an existing brand
  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    
    if (!selectedBrand) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/brands/${selectedBrand._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to update brand');
      }

      const updatedBrand = await response.json();
      setBrands(brands.map(brand => 
        brand._id === selectedBrand._id ? updatedBrand : brand
      ));
      toast.success('Brand updated successfully');
      setSelectedBrand(null);
      setBrandFormData({
        name: '',
        description: '',
        category: 'affordable',
        featured: false
      });
      
      // Close the brands dialog after successful update
      setShowBrandsDialog(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle deleting a brand
  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/brands/${brandId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }

      setBrands(brands.filter(brand => brand._id !== brandId));
      toast.success('Brand deleted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Edit brand
  const handleEditBrand = (brand) => {
    setSelectedBrand(brand);
    setBrandFormData({
      name: brand.name,
      description: brand.description || '',
      category: brand.category || 'affordable',
      featured: brand.featured || false
    });
    setShowBrandsDialog(true);
  };

  const handleBrandFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setBrandFormData({
        ...brandFormData,
        [name]: checked
      });
    } else {
      setBrandFormData({
        ...brandFormData,
        [name]: value
      });
    }
  };

  const handleAddProduct = (product) => {
    // addProduct will now be handled by ProductModal component with direct API call
    toast.success('Product added successfully');
    setShowAddModal(false);
    // Refresh the products list
    fetchProducts(currentPage);
  };

  const handleEditProduct = (product) => {
    // updateProduct will now be handled by ProductModal component with direct API call
    toast.success('Product updated successfully');
    setShowEditModal(false);
    setSelectedProduct(null);
    // Refresh the products list with a short delay to allow the server to update
    setTimeout(() => {
      fetchProducts(currentPage);
    }, 500);
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This will also delete all associated images.')) return;
    
    try {
      toast.loading('Deleting product and associated images...');
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }
      
      // Refresh products after deletion
      toast.dismiss();
      toast.success('Product and associated images deleted successfully');
      fetchProducts(currentPage);
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Error deleting product');
      console.error(error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (name, value) => {
    // If changing category, reset type and subtype
    if (name === 'category' && value !== filters.category) {
      setFilters({
        ...filters,
        [name]: value,
        type: '',
        subtype: ''
      });
    }
    // If changing type, reset subtype
    else if (name === 'type' && value !== filters.type) {
      setFilters({
        ...filters,
        [name]: value,
        subtype: ''
      });
    }
    else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
    
    // Reset to first page when changing filters
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      type: '',
      subtype: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      featured: null,
      bestseller: null,
      newArrival: null,
      stockStatus: ''
    });
    setSearchTerm('');
    // Reset to first page
    setCurrentPage(1);
    // Force refetch
    fetchProducts(1);
  };

  // Get types for selected category - more robust implementation
  const getTypesForCategory = (categoryId) => {
    if (!categoryId) return [];
    
    // Try to find the category in the loaded categories
    const category = productCategories.find(c => {
      // Convert both to strings to ensure comparison works
      const catIdStr = typeof c._id === 'object' ? c._id.toString() : c._id;
      const targetIdStr = typeof categoryId === 'object' ? categoryId.toString() : categoryId;
      return catIdStr === targetIdStr;
    });
    
    return category?.types || [];
  };

  // Get subtypes for selected type - more robust implementation
  const getSubtypesForType = (categoryId, typeId) => {
    if (!categoryId || !typeId) return [];
    
    // Get types for this category
    const types = getTypesForCategory(categoryId);
    
    // Find the specific type
    const type = types.find(t => {
      // Convert both to strings to ensure comparison works
      const typeIdStr = typeof t._id === 'object' ? t._id.toString() : t._id;
      const targetIdStr = typeof typeId === 'object' ? typeId.toString() : typeId;
      return typeIdStr === targetIdStr;
    });
    
    return type?.subtypes || [];
  };

  // Filter and sort products based on current state
  const filteredAndSortedProducts = [...products]
    .filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && typeof product.brand === 'string' && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand && typeof product.brand === 'object' && product.brand.name && product.brand.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filters.category === '' || 
        (typeof product.category === 'object' && product.category?._id === filters.category) ||
        product.category === filters.category;
        
      const matchesType = filters.type === '' || 
        (typeof product.type === 'object' && product.type?._id === filters.type) ||
        product.type === filters.type;
        
      const matchesSubtype = filters.subtype === '' || 
        (typeof product.subtype === 'object' && product.subtype?._id === filters.subtype) ||
        product.subtype === filters.subtype;
        
      const matchesBrand = filters.brand === '' || 
        (typeof product.brand === 'object' && product.brand?._id === filters.brand) ||
        product.brand === filters.brand;
      
      return matchesSearch && matchesCategory && matchesType && matchesSubtype && matchesBrand;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'price') {
        comparison = a.price - b.price;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'category') {
        const categoryA = typeof a.category === 'object' ? a.category.name : a.category || '';
        const categoryB = typeof b.category === 'object' ? b.category.name : b.category || '';
        comparison = categoryA.localeCompare(categoryB);
      } else if (sortField === 'brand') {
        const brandA = typeof a.brand === 'object' ? a.brand.name : a.brand || '';
        const brandB = typeof b.brand === 'object' ? b.brand.name : b.brand || '';
        comparison = brandA.localeCompare(brandB);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Category management handlers
  const handleCategoryFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setCategoryFormData({
        ...categoryFormData,
        [name]: checked
      });
    } else if (type === 'number') {
      setCategoryFormData({
        ...categoryFormData,
        [name]: parseInt(value) || 0
      });
    } else {
      setCategoryFormData({
        ...categoryFormData,
        [name]: value
      });
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/product-categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      const newCategory = await response.json();
      setProductCategories([...productCategories, newCategory]);
      toast.success('Category added successfully');
      setCategoryFormData({
        name: '',
        description: '',
        featured: false,
        order: 0
      });
      setShowCategoryModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/product-categories/${selectedCategory._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      const updatedCategory = await response.json();
      setProductCategories(productCategories.map(category => 
        category._id === selectedCategory._id ? updatedCategory : category
      ));
      toast.success('Category updated successfully');
      setSelectedCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
        featured: false,
        order: 0
      });
      setShowCategoryModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will affect all products in this category.')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/product-categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setProductCategories(productCategories.filter(category => category._id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      featured: category.featured || false,
      order: category.order || 0
    });
    setShowCategoryModal(true);
  };

  const handleViewTypes = (category) => {
    setSelectedCategory(category);
    setShowTypesDialog(true);
  };

  // Type and Subtype handlers
  const handleTypeFormChange = (e) => {
    const { name, value } = e.target;
    setTypeFormData({
      ...typeFormData,
      [name]: value
    });
  };

  const handleSubtypeFormChange = (e) => {
    const { name, value } = e.target;
    setSubtypeFormData({
      ...subtypeFormData,
      [name]: value
    });
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) return;

    try {
      console.log('Adding type:', typeFormData);
      console.log('Selected category ID:', selectedCategory._id);
      
      const token = localStorage.getItem('adminToken');
      const url = `http://localhost:5000/api/product-categories/${selectedCategory._id}/types`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(typeFormData)
      });

      if (!response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.message || 'Failed to add type');
      }

      console.log('Success response:', data);
      
      // Update the productCategories state
      setProductCategories(productCategories.map(category => 
        category._id === selectedCategory._id ? data : category
      ));
      
      // Update the selectedCategory state to reflect changes immediately in the UI
      setSelectedCategory(data);
      
      toast.success('Type added successfully');
      setTypeFormData({
        name: '',
        description: ''
      });
      setShowAddTypeModal(false);
    } catch (error) {
      console.error('Error in handleAddType:', error);
      toast.error(error.message || 'An error occurred while adding the type');
    }
  };

  const handleUpdateType = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory || !selectedType) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/product-categories/${selectedCategory._id}/types/${selectedType._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(typeFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to update type');
      }

      const updatedCategory = await response.json();
      
      // Update the productCategories state
      setProductCategories(productCategories.map(category => 
        category._id === selectedCategory._id ? updatedCategory : category
      ));
      
      // Update the selectedCategory state to reflect changes immediately in the UI
      setSelectedCategory(updatedCategory);
      
      toast.success('Type updated successfully');
      setTypeFormData({
        name: '',
        description: ''
      });
      setSelectedType(null);
      setShowAddTypeModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteType = async (categoryId, typeId) => {
    if (!window.confirm('Are you sure you want to delete this type? This will affect all products using this type.')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/product-categories/${categoryId}/types/${typeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete type');
      }

      const updatedCategory = await response.json();
      
      // Update the productCategories state
      setProductCategories(productCategories.map(category => 
        category._id === categoryId ? updatedCategory : category
      ));
      
      // Update the selectedCategory state to reflect changes immediately in the UI
      if (selectedCategory._id === categoryId) {
        setSelectedCategory(updatedCategory);
      }
      
      toast.success('Type deleted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddSubtype = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error('No category selected');
      return;
    }
    
    if (!selectedType) {
      toast.error('No type selected');
      return;
    }

    try {
      console.log('Adding subtype:', subtypeFormData);
      console.log('Selected category ID:', selectedCategory._id);
      console.log('Selected type ID:', selectedType._id);
      
      // Try with adminToken first
      let token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('No adminToken found, trying regular token');
        token = localStorage.getItem('token');
      }
      
      if (!token) {
        toast.error('No authentication token found. Please log in again.');
        return;
      }
      
      console.log('Using token (first 10 chars):', token.substring(0, 10) + '...');
      
      const url = `http://localhost:5000/api/product-categories/${selectedCategory._id}/types/${selectedType._id}/subtypes`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subtypeFormData)
      });

      console.log('Response status:', response.status);
      
      // Read the response data
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Response data:', data);
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.message || `Failed to add subtype (status ${response.status})`);
      }

      console.log('Success response:', data);
      
      // Update the productCategories state
      setProductCategories(productCategories.map(category => 
        category._id === selectedCategory._id ? data : category
      ));
      
      // Update the selectedCategory state to reflect changes immediately in the UI
      setSelectedCategory(data);
      
      toast.success('Subtype added successfully');
      setSubtypeFormData({
        name: '',
        description: ''
      });
      setShowAddSubtypeModal(false);
      
      // Refresh categories to ensure we have the latest data
      fetchProductCategories();
    } catch (error) {
      console.error('Error in handleAddSubtype:', error);
      toast.error(error.message || 'An error occurred while adding the subtype');
    }
  };

  const handleUpdateSubtype = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory || !selectedType || !selectedSubtype) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/product-categories/${selectedCategory._id}/types/${selectedType._id}/subtypes/${selectedSubtype._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subtypeFormData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update subtype');
      }

      const updatedCategory = await response.json();
      
      // Update the productCategories state
      setProductCategories(productCategories.map(category => 
        category._id === selectedCategory._id ? updatedCategory : category
      ));
      
      // Update the selectedCategory state to reflect changes immediately in the UI
      setSelectedCategory(updatedCategory);
      
      toast.success('Subtype updated successfully');
      setSubtypeFormData({
        name: '',
        description: ''
      });
      setSelectedSubtype(null);
      setShowAddSubtypeModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteSubtype = async (categoryId, typeId, subtypeId) => {
    if (!window.confirm('Are you sure you want to delete this subtype? This will affect all products using this subtype.')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/product-categories/${categoryId}/types/${typeId}/subtypes/${subtypeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete subtype');
      }

      const updatedCategory = await response.json();
      
      // Update the productCategories state
      setProductCategories(productCategories.map(category => 
        category._id === categoryId ? updatedCategory : category
      ));
      
      // Update the selectedCategory state to reflect changes immediately in the UI
      if (selectedCategory._id === categoryId) {
        setSelectedCategory(updatedCategory);
      }
      
      toast.success('Subtype deleted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch products from API
  const fetchProducts = async (page = 1, limit = 10) => {
    try {
      setIsLoadingProducts(true);
      const token = localStorage.getItem('adminToken');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.subtype) params.append('subtype', filters.subtype);
      if (filters.brand) params.append('brand', filters.brand);
      
      // Add new filter parameters
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.featured === true) params.append('featured', 'true');
      if (filters.bestseller === true) params.append('bestseller', 'true');
      if (filters.newArrival === true) params.append('newArrival', 'true');
      
      // Handle stock status
      if (filters.stockStatus === 'in-stock') params.append('inStock', 'true');
      if (filters.stockStatus === 'out-of-stock') params.append('inStock', 'false');
      
      // Add sorting
      if (sortField && sortDirection) {
        let sort = '';
        if (sortField === 'price') {
          sort = sortDirection === 'asc' ? 'price_asc' : 'price_desc';
        } else if (sortField === 'name') {
          sort = sortDirection === 'asc' ? 'name_asc' : 'name_desc';
        } else if (sortField === 'rating') {
          sort = 'rating_desc';
        }
        if (sort) params.append('sort', sort);
      }
      
      console.log(`Fetching products with URL: http://localhost:5000/api/products?${params.toString()}`);
      console.log('Applied filters:', filters);
      
      const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle error response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        
        // Reset the problematic filter if it's an ID format error
        if (errorMessage.includes('Invalid category ID')) {
          toast.error('Invalid category selected');
          handleFilterChange('category', '');
        } else if (errorMessage.includes('Invalid type ID')) {
          toast.error('Invalid type selected');
          handleFilterChange('type', '');
        } else if (errorMessage.includes('Invalid subtype ID')) {
          toast.error('Invalid subtype selected');
          handleFilterChange('subtype', '');
        } else if (errorMessage.includes('Invalid brand ID')) {
          toast.error('Invalid brand selected');
          handleFilterChange('brand', '');
        } else {
          throw new Error(errorMessage);
        }
        
        // Return to avoid the error at the end
        return;
      }
      
      const data = await response.json();
      console.log(`Found ${data.products?.length || 0} products out of ${data.total || 0} total`);
      
      setProducts(data.products || []);
      setCurrentPage(data.page || 1);
      setTotalPages(data.pages || 1);
    } catch (error) {
      toast.error(`Failed to fetch products: ${error.message}`);
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Effect to fetch products when pagination changes
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts(currentPage);
    }
  }, [currentPage, sortField, sortDirection]);

  // Handle search and filters with debounce
  useEffect(() => {
    if (activeTab !== 'products') return;
    
    const timer = setTimeout(() => {
      fetchProducts(1); // Reset to first page when search/filters change
      setCurrentPage(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [
    searchTerm, 
    filters.category, 
    filters.type, 
    filters.subtype, 
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.featured,
    filters.bestseller,
    filters.newArrival,
    filters.stockStatus
  ]);

  // Initial fetch on mount
  useEffect(() => {
    fetchProductCategories();
    fetchBrands();
    fetchProducts(1);
    // Initial orders fetch
    fetchOrders(1);
  }, []);

  // Effect to refetch orders when status changes
  useEffect(() => {
    fetchOrders(1, orderStatus);
  }, [orderStatus]);

  // Format order date
  const formatOrderDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    let dateObj;
    
    // Handle MongoDB date object format
    if (typeof dateValue === 'object' && dateValue.$date) {
      dateObj = new Date(dateValue.$date);
    } else {
      // Handle regular date string
      dateObj = new Date(dateValue);
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle viewing order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleViewProductDetails = (product) => {
    // Log detailed information about product and associated data
    console.log('Viewing product details:', product.name);
    
    // Make sure categories are loaded before showing product details
    if (productCategories.length === 0) {
      toast.loading('Loading categories...');
      fetchProductCategories()
        .then(() => {
          setSelectedProductDetails(product);
          setShowProductDetails(true);
          toast.dismiss();
        })
        .catch(error => {
          toast.error('Failed to load categories');
          console.error(error);
          
          // Still show product details even if categories failed to load
          setSelectedProductDetails(product);
          setShowProductDetails(true);
        });
    } else {
      setSelectedProductDetails(product);
      setShowProductDetails(true);
    }
  };

  // Helper function to look up type/subtype names from their IDs
  const getNameFromId = (itemType, id, categoryId, parentTypeId = null) => {
    // Return N/A if id is missing
    if (!id) return 'N/A';
    
    // If it's already an object with a name, use that
    if (typeof id === 'object' && id.name) {
      return id.name;
    }
    
    // Make sure we have a string for comparison
    const idStr = typeof id === 'string' ? id : id.toString();
    
    // Debug logging
    console.log(`Looking up ${itemType} with ID: ${idStr}, categoryId: ${categoryId}`);
    
    if (itemType === 'category') {
      // Find the category directly
      const category = productCategories.find(c => {
        const catId = typeof c._id === 'string' ? c._id : c._id.toString();
        return catId === idStr;
      });
      
      if (category) return category.name;
    }
    else if (itemType === 'type' && categoryId) {
      // Convert categoryId to string for comparison
      const catIdStr = typeof categoryId === 'object' ? 
        (categoryId._id || "").toString() : 
        (categoryId || "").toString();
        
      // Find the category first
      const category = productCategories.find(c => {
        const catId = typeof c._id === 'string' ? c._id : c._id.toString();
        return catId === catIdStr;
      });
      
      // If category found, look for the type
      if (category && category.types && category.types.length > 0) {
        const type = category.types.find(t => {
          const typeId = typeof t._id === 'string' ? t._id : t._id.toString();
          return typeId === idStr;
        });
        
        if (type) return type.name;
      }
    } 
    else if (itemType === 'subtype' && categoryId && parentTypeId) {
      // Convert IDs to strings for comparison
      const catIdStr = typeof categoryId === 'object' ? 
        (categoryId._id || "").toString() : 
        (categoryId || "").toString();
      
      const typeIdStr = typeof parentTypeId === 'object' ? 
        (parentTypeId._id || "").toString() : 
        (parentTypeId || "").toString();
        
      // Find the category
      const category = productCategories.find(c => {
        const catId = typeof c._id === 'string' ? c._id : c._id.toString();
        return catId === catIdStr;
      });
      
      // If category found, find the type
      if (category && category.types && category.types.length > 0) {
        const type = category.types.find(t => {
          const typeId = typeof t._id === 'string' ? t._id : t._id.toString();
          return typeId === typeIdStr;
        });
        
        // If type found, find the subtype
        if (type && type.subtypes && type.subtypes.length > 0) {
          const subtype = type.subtypes.find(st => {
            const subtypeId = typeof st._id === 'string' ? st._id : st._id.toString();
            return subtypeId === idStr;
          });
          
          if (subtype) return subtype.name;
        }
      }
    }
    
    // If lookup fails, try one more approach for types and subtypes
    if (itemType === 'type' || itemType === 'subtype') {
      // Try finding in all categories
      for (const category of productCategories) {
        if (category.types && category.types.length > 0) {
          // For type lookup
          if (itemType === 'type') {
            const type = category.types.find(t => {
              const typeId = typeof t._id === 'string' ? t._id : t._id.toString();
              return typeId === idStr;
            });
            
            if (type) return type.name;
          }
          
          // For subtype lookup, check all types in all categories
          if (itemType === 'subtype') {
            for (const type of category.types) {
              if (type.subtypes && type.subtypes.length > 0) {
                const subtype = type.subtypes.find(st => {
                  const subtypeId = typeof st._id === 'string' ? st._id : st._id.toString();
                  return subtypeId === idStr;
                });
                
                if (subtype) return subtype.name;
              }
            }
          }
        }
      }
    }
    
    // If all lookups fail, return the ID 
    return `ID: ${idStr}`;
  };

  // Socket.io connection for admin
  useEffect(() => {
    if (activeTab === 'chat' && !socketRef.current) {
      const token = localStorage.getItem('adminToken');
      
      // Initialize socket
      socketRef.current = io('http://localhost:5000');
      
      // Join admin support room
      socketRef.current.emit('join_admin_support');
      
      // Listen for incoming messages
      socketRef.current.on('receive_message', (data) => {
        // If the message is for the current chat, add it to messages
        if (selectedChat && data.chatId === `support_${selectedChat.userId}`) {
          setChatMessages(prev => [...prev, data]);
          scrollChatToBottom();
          
          // Mark message as read
          markChatMessagesAsRead(data.chatId, true);
        } else {
          // If not in the current chat, mark the conversation as having unread messages
          setConversations(prev => 
            prev.map(conv => 
              conv.chatId === data.chatId 
                ? { ...conv, unreadCount: conv.unreadCount + 1 }
                : conv
            )
          );
        }
      });
      
      // Load conversations
      fetchChatConversations();
    }
    
    // Cleanup on unmount or when changing tabs
    return () => {
      if (socketRef.current && activeTab !== 'chat') {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [activeTab, selectedChat]);

  // Scroll to bottom of chat messages
  useEffect(() => {
    if (activeTab === 'chat') {
      scrollChatToBottom();
    }
  }, [chatMessages, activeTab]);

  const scrollChatToBottom = () => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch chat conversations
  const fetchChatConversations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:5000/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      toast.error('Failed to load conversations: ' + error.message);
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch chat messages for a user
  const fetchChatMessages = async (userId) => {
    try {
      setIsFetchingMessages(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/chat/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setChatMessages(data.messages || []);
      
      // Mark messages as read
      markChatMessagesAsRead(`support_${userId}`, true);
    } catch (error) {
      toast.error('Failed to load messages: ' + error.message);
      console.error('Error fetching messages:', error);
    } finally {
      setIsFetchingMessages(false);
    }
  };

  // Mark chat messages as read
  const markChatMessagesAsRead = async (chatId, isAdmin) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      await fetch('http://localhost:5000/api/chat/messages/read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chatId, isAdmin })
      });
      
      // Update conversation unread count in state
      if (isAdmin) {
        setConversations(prev => 
          prev.map(conv => 
            conv.chatId === chatId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send chat message
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedChat) return;
    
    setIsSendingMessage(true);
    try {
      const token = localStorage.getItem('adminToken');
      const userId = selectedChat.userId;
      const chatId = `support_${userId}`;
      
      // Create message object
      const messageData = {
        userId,
        content: chatMessage,
        isFromCustomer: false,
        chatId,
        timestamp: new Date(),
        id: `admin_${Date.now()}`
      };
      
      // Add to UI immediately
      setChatMessages(prev => [...prev, {
        ...messageData,
        _id: `local_${Date.now()}`,
        createdAt: new Date()
      }]);
      
      // Emit socket event
      socketRef.current.emit('send_message', messageData);
      
      // No need to save to database separately - socket.io server handles it now
      console.log('Message sent via socket, server will save to database');
      
      setChatMessage('');
    } catch (error) {
      toast.error('Failed to send message: ' + error.message);
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
    fetchChatMessages(conversation.userId);
    
    // Mark messages as read
    markChatMessagesAsRead(conversation.chatId, true);
  };

  // Format chat date
  const formatChatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Fetch orders
  const fetchOrders = async (page = 1, status = '') => {
    try {
      setIsLoadingOrders(true);
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token not found');
        setIsLoadingOrders(false);
        return;
      }
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let url = `${apiBaseUrl}/api/orders/admin?page=${page}&limit=100`; 
      
      if (status) {
        url += `&status=${status}`; // Add status filter to API request if needed
        console.log(`Filtering orders by status: ${status}`);
      }
      
      console.log('Fetching orders from database API:', url);
      console.log('Using token (first 10 chars):', token.substring(0, 10) + '...');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API request failed:', errorText);
        throw new Error(`Failed to fetch orders from API: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('Raw API Response (first 200 chars):', responseText.substring(0, 200) + '...');
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        throw new Error('Failed to parse API response');
      }
      
      // Extract orders from various possible response structures
      const ordersData = data.data || data.orders || (Array.isArray(data) ? data : []);
      console.log(`Database returned ${ordersData.length} orders`);
      
      // Double-check server-side filtering (if the server isn't filtering correctly)
      let filteredOrders = ordersData;
      if (status) {
        // Check if we need to apply client-side filtering as a fallback
        const serverFilteredCorrectly = status === '' || 
          ordersData.every(order => order.status === status) || 
          ordersData.length === 0;
        
        if (!serverFilteredCorrectly) {
          console.log(`API filtering not working correctly. Applying client-side filtering for "${status}"`);
          filteredOrders = ordersData.filter(order => order.status === status);
          console.log(`After client-side filtering: ${filteredOrders.length} orders match "${status}"`);
        }
      }
      
      // Apply pagination if needed
      const limit = 20;
      const totalOrders = filteredOrders.length;
      const totalPages = Math.max(1, Math.ceil(totalOrders / limit));
      const adjustedPage = Math.min(page, totalPages);
      const startIndex = (adjustedPage - 1) * limit;
      const endIndex = adjustedPage * limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      setOrders(paginatedOrders);
      setOrdersTotalPages(totalPages);
      setOrdersPage(adjustedPage);
      
      console.log(`Showing ${paginatedOrders.length} orders on page ${adjustedPage} of ${totalPages}`);
      
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast.error(error.message || 'Failed to fetch orders from database');
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };
  
  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsUpdatingOrder(true);
      
      // Get token from multiple possible sources
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
      
      // Extract the actual ID if it's in MongoDB format
      let actualOrderId = orderId;
      if (typeof orderId === 'object' && orderId.$oid) {
        actualOrderId = orderId.$oid;
      }
      
      // Debug info
      console.log('Updating order status for ID:', actualOrderId);
      console.log('New status:', newStatus);
      
      // Use environment variable for API URL
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Try both endpoints to ensure we hit the correct one
      let url = `${apiBaseUrl}/api/orders/${actualOrderId}/status`;
      
      console.log(`Updating order status using API URL: ${url}`);
      
      // For delivered orders, also set payment status to paid
      const requestBody = { status: newStatus };
      if (newStatus === 'delivered') {
        requestBody.isPaid = true;
        requestBody.paidAt = new Date().toISOString();
      }
      
      // First attempt - try the regular endpoint
      let response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('API Response status:', response.status);
      
      // If that didn't work, try the alternative endpoint
      if (!response.ok && response.status !== 422) {
        console.log('First endpoint failed, trying alternative endpoint');
        url = `${apiBaseUrl}/api/admin/orders/${actualOrderId}`;
        console.log(`Trying alternative URL: ${url}`);
        
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('Alternative endpoint response status:', response.status);
      }
      
      // Read the response text regardless of status
      const responseText = await response.text();
      console.log('Response text:', responseText.length > 200 ? responseText.substring(0, 200) + '...' : responseText);
      
      let responseData;
      try {
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log('Response data:', responseData);
        }
      } catch (e) {
        console.error('Failed to parse response as JSON:', e.message);
      }
      
      if (!response.ok) {
        throw new Error(responseData?.message || `Error ${response.status}: Failed to update order status`);
      }
      
      // Update the orders in state to immediately reflect the change
      setOrders(orders.map(order => {
        const orderIdToCompare = order._id.$oid || order._id;
        
        if (orderIdToCompare === actualOrderId) {
          const updatedOrder = {
            ...order,
            status: newStatus
          };
          
          // For delivered orders, also update payment status in local state
          if (newStatus === 'delivered') {
            updatedOrder.isPaid = true;
            updatedOrder.paidAt = new Date();
          }
          
          return updatedOrder;
        }
        return order;
      }));
      
      // If order details modal is open, update the selected order
      if (showOrderDetails && selectedOrder) {
        const selectedOrderId = selectedOrder._id.$oid || selectedOrder._id;
        if (selectedOrderId === actualOrderId) {
          if (responseData?.data) {
            setSelectedOrder(responseData.data);
          } else if (responseData?.order) {
            setSelectedOrder(responseData.order);
          } else {
            // If the response doesn't contain updated order data, just update the status locally
            const updatedOrder = {
              ...selectedOrder,
              status: newStatus
            };
            
            // For delivered orders, also update payment status in modal state
            if (newStatus === 'delivered') {
              updatedOrder.isPaid = true;
              updatedOrder.paidAt = new Date();
            }
            
            setSelectedOrder(updatedOrder);
          }
        }
      }
      
      // If the update was successful, refresh orders from the API to ensure we're in sync
      await fetchOrders(ordersPage, orderStatus);
      
      toast.success(`Order status updated to ${newStatus}${newStatus === 'delivered' ? ' and marked as paid' : ''}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  if (!products) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const selectedTypes = filters.category ? getTypesForCategory(filters.category) : [];
  const selectedSubtypes = filters.type ? getSubtypesForType(filters.category, filters.type) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={adminLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-600 text-white rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-red-500/25"
            >
              <FaSignOutAlt className="h-4 w-4" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 mx-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1.5 shadow-md border border-gray-200 dark:border-gray-700 flex justify-center w-full">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 mx-2 font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => {
              setActiveTab('categories');
              fetchProductCategories(); // Load product categories when tab is selected
            }}
            className={`px-5 py-2.5 mx-2 font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => {
              setActiveTab('orders');
              fetchOrders(1, orderStatus); // Load orders when tab is selected
            }}
            className={`px-5 py-2.5 mx-2 font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Orders
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('chat');
            }}
            className={`px-5 py-2.5 mx-2 font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <FaComments className="mr-2" />
              Support Chat
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'reels'
                ? 'bg-primary text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <FaVideo className="inline-block mr-2" />
            Reels
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-primary/25"
              >
                <FaPlus className="h-4 w-4" />
                <span>Add Product</span>
              </motion.button>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name..."
                className="pl-10 block w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-primary/20 dark:border-primary/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                Search only matches product names
              </div>
            </div>
            <div className="w-full md:w-64">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="block w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-primary/20 dark:border-primary/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Categories</option>
                {productCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-primary/20 dark:border-primary/10 rounded-lg flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-primary/10"
            >
              <FaFilter className="h-4 w-4" />
              <span>Advanced Filters</span>
              {showAdvancedFilters ? <FaChevronUp className="h-3 w-3 ml-1" /> : <FaChevronDown className="h-3 w-3 ml-1" />}
            </button>
          </div>
          
          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-primary/20 dark:border-primary/10 rounded-lg p-4 space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category, Type, Subtype selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="block w-full bg-white/75 dark:bg-gray-700/75 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">All Categories</option>
                      {productCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {filters.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="block w-full bg-white/75 dark:bg-gray-700/75 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">All Types</option>
                        {getTypesForCategory(filters.category).map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {filters.type && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subtype
                      </label>
                      <select
                        value={filters.subtype}
                        onChange={(e) => handleFilterChange('subtype', e.target.value)}
                        className="block w-full bg-white/75 dark:bg-gray-700/75 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">All Subtypes</option>
                        {getSubtypesForType(filters.category, filters.type).map((subtype) => (
                          <option key={subtype._id} value={subtype._id}>
                            {subtype.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brand
                    </label>
                    <select
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      className="block w-full bg-white/75 dark:bg-gray-700/75 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">All Brands</option>
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-1/2 bg-white/75 dark:bg-gray-700/75 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-1/2 bg-white/75 dark:bg-gray-700/75 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                
                {/* Product Status Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center">
                      <input
                        id="featured-filter"
                        type="checkbox"
                        checked={filters.featured === true}
                        onChange={(e) => handleFilterChange('featured', e.target.checked)}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="featured-filter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Featured
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="bestseller-filter"
                        type="checkbox"
                        checked={filters.bestseller === true}
                        onChange={(e) => handleFilterChange('bestseller', e.target.checked)}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="bestseller-filter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Bestseller
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="newArrival-filter"
                        type="checkbox"
                        checked={filters.newArrival === true}
                        onChange={(e) => handleFilterChange('newArrival', e.target.checked)}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="newArrival-filter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        New Arrival
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Stock Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Status</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        id="in-stock-filter"
                        type="radio"
                        checked={filters.stockStatus === 'in-stock'}
                        onChange={() => handleFilterChange('stockStatus', 'in-stock')}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="in-stock-filter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        In Stock
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="out-of-stock-filter"
                        type="radio"
                        checked={filters.stockStatus === 'out-of-stock'}
                        onChange={() => handleFilterChange('stockStatus', 'out-of-stock')}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="out-of-stock-filter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Out of Stock
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="any-stock-filter"
                        type="radio"
                        checked={!filters.stockStatus}
                        onChange={() => handleFilterChange('stockStatus', '')}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="any-stock-filter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Any
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 flex items-center space-x-2"
                  >
                    <FaTimes className="h-4 w-4" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Active Filters */}
          {(filters.category || filters.type || filters.subtype || filters.brand || filters.minPrice || filters.maxPrice || filters.featured || filters.bestseller || filters.newArrival || filters.stockStatus || searchTerm) && (
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active Filters:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  Search: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  Category: {productCategories.find(c => c._id === filters.category)?.name || filters.category}
                  <button 
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  Type: {getTypesForCategory(filters.category).find(t => t._id === filters.type)?.name || filters.type}
                  <button 
                    onClick={() => handleFilterChange('type', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.subtype && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  Subtype: {getSubtypesForType(filters.category, filters.type).find(s => s._id === filters.subtype)?.name || filters.subtype}
                  <button 
                    onClick={() => handleFilterChange('subtype', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.brand && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  Brand: {brands.find(b => b._id === filters.brand)?.name || filters.brand}
                  <button 
                    onClick={() => handleFilterChange('brand', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  Price: {filters.minPrice ? `$${filters.minPrice}` : '$0'} - {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
                  <button 
                    onClick={() => {
                      handleFilterChange('minPrice', '');
                      handleFilterChange('maxPrice', '');
                    }}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.stockStatus && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  Stock: {filters.stockStatus === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                  <button 
                    onClick={() => handleFilterChange('stockStatus', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  Featured
                  <button 
                    onClick={() => handleFilterChange('featured', false)}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.bestseller && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  Bestseller
                  <button 
                    onClick={() => handleFilterChange('bestseller', false)}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.newArrival && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-800 dark:text-primary-200">
                  New Arrival
                  <button 
                    onClick={() => handleFilterChange('newArrival', false)}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Products Table */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {isLoadingProducts ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No products found. Try adjusting your filters or add a new product.</p>
                </div>
              ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                          Name
                      {sortField === 'name' && (
                        <span className="ml-1">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                  </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                          Price
                      {sortField === 'price' && (
                        <span className="ml-1">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                  </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Stock
                  </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                  </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Brand
                  </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
                    <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                      {products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                            {product.photos && product.photos.length > 0 ? (
                          <img
                                src={product.photos[0].secure_url} 
                            alt={product.name}
                                className="h-10 w-10 rounded-md object-cover"
                          />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                No image
                        </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <button 
                              onClick={() => handleViewProductDetails(product)}
                              className="hover:text-primary dark:text-primary-dark text-left w-full hover:underline font-medium transition-all duration-200"
                            >
                            {product.name}
                            </button>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {product.price.toFixed(2)} EGP
                      {product.discount > 0 && (
                              <span className="ml-2 text-green-600 dark:text-green-400 text-xs">
                          {product.discount}% off
                              </span>
                      )}
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {product.stock}
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {product.category && typeof product.category === 'object' 
                              ? product.category.name 
                              : product.category 
                                ? product.category 
                                : 'N/A'}
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {product.brand && typeof product.brand === 'object' 
                              ? product.brand.name 
                              : product.brand 
                                ? product.brand 
                                : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowEditModal(true);
                              }}
                              className="text-primary hover:text-primary-dark"
                            >
                              <FaEdit className="inline h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900 ml-3"
                            >
                              <FaTrash className="inline h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 10, (products?.length || 0) * totalPages)}
                        </span>{' '}
                        of <span className="font-medium">{(products?.length || 0) * totalPages}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                            currentPage === 1
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          First
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                            currentPage === 1
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          Previous
                        </button>
                        
                        {/* Page numbers */}
                        {[...Array(totalPages).keys()].map(index => {
                          const pageNumber = index + 1;
                          // Show current page, one page before and after, first and last pages
                          if (
                            pageNumber === currentPage ||
                            pageNumber === currentPage - 1 ||
                            pageNumber === currentPage + 1 ||
                            pageNumber === 1 ||
                            pageNumber === totalPages
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border ${
                                  pageNumber === currentPage
                                    ? 'z-10 bg-primary-100 border-primary-500 text-primary-600 dark:bg-primary-900 dark:border-primary-500 dark:text-primary-200'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                                } text-sm font-medium`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          // Show ellipsis between non-consecutive pages
                          if (
                            (pageNumber === currentPage - 2 && currentPage > 3) ||
                            (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
                              >
                                ...
                          </span>
                            );
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                            currentPage === totalPages
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          Next
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                            currentPage === totalPages
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          Last
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
                          )}
                        </div>
          </>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            {/* Brands Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Brands</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedBrand(null);
                  setBrandFormData({
                    name: '',
                    description: '',
                    category: 'affordable',
                    featured: false
                  });
                  setShowBrandsDialog(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-primary/25"
              >
                <FaPlus className="h-4 w-4" />
                <span>Manage Brands</span>
              </motion.button>
      </div>

            {/* Brands Table */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Brands
                </h3>
              </div>
              
              {isLoadingBrands ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent shadow-lg"></div>
                </div>
              ) : brands.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No brands found. Add your first brand using the "Manage Brands" button above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Featured
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {brands.map((brand) => (
                        <tr key={brand._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {brand.name}
                            </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {brand.category === 'luxury' ? 'Luxury' : 'Affordable'}
                        </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {brand.featured ? 'Yes' : 'No'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditBrand(brand)}
                              className="text-primary hover:text-primary-dark"
                            >
                              <FaEdit className="inline h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBrand(brand._id)}
                              className="text-red-600 hover:text-red-900 ml-3"
                            >
                              <FaTrash className="inline h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                          </div>
                        )}
                      </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Categories Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Product Categories</h2>
                        <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                          onClick={() => {
                  setSelectedCategory(null);
                  setCategoryFormData({
                    name: '',
                    description: '',
                    featured: false,
                    order: 0
                  });
                  setShowCategoryModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-primary/25"
              >
                <FaPlus className="h-4 w-4" />
                <span>Add Category</span>
                        </motion.button>
                      </div>
            
            {/* Categories Table */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Categories
                </h3>
              </div>
              
              {isLoadingCategories ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent shadow-lg"></div>
                </div>
              ) : productCategories.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No categories found. Add your first category using the button above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Types
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Featured
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {productCategories.map((category) => (
                        <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {category.slug}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {category.types?.length || 0} types
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {category.featured ? 'Yes' : 'No'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {category.order}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-primary hover:text-primary-dark "
                            >
                              <FaEdit className="inline h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleViewTypes(category)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-200 ml-3"
                            >
                              <FaTags className="inline h-4 w-4 mr-1" />
                              Types
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-600 hover:text-red-900 ml-3"
                            >
                              <FaTrash className="inline h-4 w-4 mr-1" />
                              Delete
                            </button>
                    </td>
                  </tr>
                      ))}
              </tbody>
            </table>
          </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Order Management
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage customer orders and update their status
              </p>
            </div>

            {/* Status Filter */}
            <div className="mb-6">
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                <button
                  onClick={() => {
                    setOrderStatus('');
                    fetchOrders(1, '');
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    orderStatus === '' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setOrderStatus('pending');
                    fetchOrders(1, 'pending');
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    orderStatus === 'pending' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => {
                    setOrderStatus('processing');
                    fetchOrders(1, 'processing');
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    orderStatus === 'processing' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Processing
                </button>
                <button
                  onClick={() => {
                    setOrderStatus('shipped');
                    fetchOrders(1, 'shipped');
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    orderStatus === 'shipped' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Shipped
                </button>
                <button
                  onClick={() => {
                    setOrderStatus('delivered');
                    fetchOrders(1, 'delivered');
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    orderStatus === 'delivered' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Delivered
                </button>
                <button
                  onClick={() => {
                    setOrderStatus('cancelled');
                    fetchOrders(1, 'cancelled');
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    orderStatus === 'cancelled' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {/* Orders Table */}
            {isLoadingOrders ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-400">No orders found</p>
                <p className="mt-2 text-gray-500 dark:text-gray-500">
                  {orderStatus ? `No ${orderStatus} orders available` : 'There are no orders in the system'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Order #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order._id.$oid || order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.shippingAddress?.firstName 
                              ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}`
                              : (order.user?.name || 'Unknown User')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.shippingAddress?.email || order.user?.email || 'No email provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatOrderDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : 'N/A'} EGP
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                            order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-500' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {order.orderItems?.length || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewOrderDetails(order)}
                            className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-lighter"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {orders.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {ordersPage} of {ordersTotalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (ordersPage > 1) {
                        fetchOrders(ordersPage - 1, orderStatus);
                      }
                    }}
                    disabled={ordersPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      if (ordersPage < ordersTotalPages) {
                        fetchOrders(ordersPage + 1, orderStatus);
                      }
                    }}
                    disabled={ordersPage === ordersTotalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && <ChatTab />}

        {/* Reels Tab */}
        {activeTab === 'reels' && <ReelsTab />}
      </div>

      {/* Product Modals */}
      <ProductModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct}
        product={null}
      />

      <ProductModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditProduct}
        product={selectedProduct}
      />

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 m-4 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={selectedCategory ? handleUpdateCategory : handleAddCategory}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={categoryFormData.description}
                      onChange={handleCategoryFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={categoryFormData.order}
                      onChange={handleCategoryFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={categoryFormData.featured}
                      onChange={handleCategoryFormChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Featured
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg shadow-md hover:shadow-primary/25"
                  >
                    {selectedCategory ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Types Dialog */}
      <AnimatePresence>
        {showTypesDialog && selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 m-4 max-w-4xl w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Types for {selectedCategory.name}
                </h3>
                <button
                  onClick={() => setShowTypesDialog(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setTypeFormData({
                      name: '',
                      description: ''
                    });
                    setShowAddTypeModal(true);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center space-x-2 sticky top-0 z-10"
                >
                  <FaPlus className="h-4 w-4" />
                  <span>Add Type</span>
                </button>

                {selectedCategory.types && selectedCategory.types.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedCategory.types.map((type) => (
                        <li key={type._id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-base font-medium text-gray-900 dark:text-white">{type.name}</h4>
                              {type.description && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                              )}
                              {type.subtypes && type.subtypes.length > 0 && (
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtypes:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {type.subtypes.map((subtype) => (
                                      <div key={subtype._id} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{subtype.name}</span>
                                        <button
                                          onClick={() => {
                                            setSelectedSubtype(subtype);
                                            setSubtypeFormData({
                                              name: subtype.name,
                                              description: subtype.description || ''
                                            });
                                            setShowAddSubtypeModal(true);
                                          }}
                                          className="text-primary hover:text-primary-dark"
                                        >
                                          <FaEdit className="h-3 w-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSubtype(selectedCategory._id, type._id, subtype._id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <FaTrash className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setSelectedType(type);
                                  setSelectedSubtype(null);
                                  setSubtypeFormData({
                                    name: '',
                                    description: ''
                                  });
                                  setShowAddSubtypeModal(true);
                                }}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                <FaPlus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedType(type);
                                  setTypeFormData({
                                    name: type.name,
                                    description: type.description || ''
                                  });
                                  setShowAddTypeModal(true);
                                }}
                                className="text-primary hover:text-primary-dark"
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteType(selectedCategory._id, type._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No types found. Create a new type using the button above.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Type Modal */}
      <AnimatePresence>
        {showAddTypeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 m-4 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedType ? 'Edit Type' : 'Add Type'}
                </h3>
                <button
                  onClick={() => setShowAddTypeModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={selectedType ? handleUpdateType : handleAddType}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={typeFormData.name}
                      onChange={handleTypeFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={typeFormData.description}
                      onChange={handleTypeFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddTypeModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg shadow-md hover:shadow-primary/25"
                  >
                    {selectedType ? 'Update Type' : 'Add Type'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Subtype Modal */}
      <AnimatePresence>
        {showAddSubtypeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 m-4 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedSubtype ? 'Edit Subtype' : 'Add Subtype'}
                </h3>
                <button
                  onClick={() => setShowAddSubtypeModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={selectedSubtype ? handleUpdateSubtype : handleAddSubtype}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={subtypeFormData.name}
                      onChange={handleSubtypeFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={subtypeFormData.description}
                      onChange={handleSubtypeFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddSubtypeModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg shadow-md hover:shadow-primary/25"
                  >
                    {selectedSubtype ? 'Update Subtype' : 'Add Subtype'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brands Dialog */}
      <AnimatePresence>
        {showBrandsDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 m-4 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedBrand ? 'Edit Brand' : 'Add Brand'}
                </h3>
                <button
                  onClick={() => setShowBrandsDialog(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={selectedBrand ? handleUpdateBrand : handleAddBrand}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={brandFormData.name}
                      onChange={handleBrandFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={brandFormData.description}
                      onChange={handleBrandFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={brandFormData.category}
                      onChange={handleBrandFormChange}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="affordable">Affordable</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="brand-featured"
                      name="featured"
                      checked={brandFormData.featured}
                      onChange={handleBrandFormChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="brand-featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Featured
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBrandsDialog(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg shadow-md hover:shadow-primary/25"
                  >
                    {selectedBrand ? 'Update Brand' : 'Add Brand'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Details Modal */}
      <AnimatePresence>
        {showProductDetails && selectedProductDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Product Details
                </h3>
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product Images */}
                <div className="col-span-1">
                  {selectedProductDetails.photos && selectedProductDetails.photos.length > 0 ? (
                    <div className="space-y-4">
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={selectedProductDetails.photos[0].secure_url}
                          alt={selectedProductDetails.name}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      {selectedProductDetails.photos.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedProductDetails.photos.slice(1).map((photo, index) => (
                            <div key={index} className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                              <img
                                src={photo.secure_url}
                                alt={`${selectedProductDetails.name} ${index + 2}`}
                                className="w-full h-16 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400">No images available</span>
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedProductDetails.name}
                    </h2>
                    
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <FaStar 
                            key={star} 
                            className={`h-5 w-5 ${
                              star <= Math.round(selectedProductDetails.rating?.average || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {selectedProductDetails.rating?.average?.toFixed(1) || '0.0'} 
                        ({selectedProductDetails.rating?.count || 0} reviews)
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                      {selectedProductDetails.discount > 0 ? (
                        <>
                          <span className="text-2xl font-bold text-primary-600">
                            ${(selectedProductDetails.price - (selectedProductDetails.price * selectedProductDetails.discount / 100)).toFixed(2)}
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            ${selectedProductDetails.price.toFixed(2)}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            {selectedProductDetails.discount}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-primary-600">
                          ${selectedProductDetails.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Category
                          </div>
                          <div className="text-base text-gray-900 dark:text-white">
                            {selectedProductDetails.category && typeof selectedProductDetails.category === 'object' && selectedProductDetails.category.name
                              ? selectedProductDetails.category.name
                              : getNameFromId('category', selectedProductDetails.category, null)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Brand
                          </div>
                          <div className="text-base text-gray-900 dark:text-white">
                            {selectedProductDetails.brand?.name || selectedProductDetails.brand || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Type
                          </div>
                          <div className="text-base text-gray-900 dark:text-white">
                            {selectedProductDetails.type && typeof selectedProductDetails.type === 'object' && selectedProductDetails.type.name
                              ? selectedProductDetails.type.name
                              : getNameFromId('type', selectedProductDetails.type, selectedProductDetails.category)}
                          </div>
                        </div>
                        {selectedProductDetails.subtype && (
                          <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Subtype
                            </div>
                            <div className="text-base text-gray-900 dark:text-white">
                              {selectedProductDetails.subtype && typeof selectedProductDetails.subtype === 'object' && selectedProductDetails.subtype.name
                                ? selectedProductDetails.subtype.name
                                : getNameFromId('subtype', selectedProductDetails.subtype, selectedProductDetails.category, selectedProductDetails.type)}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Stock
                          </div>
                          <div className="text-base text-gray-900 dark:text-white">
                            {selectedProductDetails.stock > 0 ? (
                              <span className="text-green-600">{selectedProductDetails.stock} in stock</span>
                            ) : (
                              <span className="text-red-600">Out of stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedProductDetails.featured && (
                        <span className="px-3 py-1 bg-primary/10 text-primary-800 dark:text-primary-200 text-xs font-medium rounded-full">
                          Featured
                        </span>
                      )}
                      {selectedProductDetails.bestseller && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                          Bestseller
                        </span>
                      )}
                      {selectedProductDetails.newArrival && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          New Arrival
                        </span>
                      )}
                      {selectedProductDetails.tags && selectedProductDetails.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {selectedProductDetails.description}
                      </p>
                    </div>

                    {selectedProductDetails.specifications && Object.keys(selectedProductDetails.specifications).length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Specifications</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {Object.entries(selectedProductDetails.specifications).map(([key, value], index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {key}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {value}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowProductDetails(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(selectedProductDetails);
                        setShowEditModal(true);
                        setShowProductDetails(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg shadow-md hover:shadow-primary/25"
                    >
                      Edit Product
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        
      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 m-4 max-w-3xl w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order #{selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Customer</h4>
                    <p className="text-gray-900 dark:text-white">
                      {selectedOrder.shippingAddress?.firstName 
                        ? `${selectedOrder.shippingAddress.firstName} ${selectedOrder.shippingAddress.lastName || ''}`
                        : (selectedOrder.user?.name || 'Unknown User')}
                    </p>
                    <p className="text-gray-900 dark:text-white text-sm">
                      {selectedOrder.shippingAddress?.email || selectedOrder.user?.email || 'No email provided'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Order Date</h4>
                    <p className="text-gray-900 dark:text-white">
                      {formatOrderDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Method</h4>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {selectedOrder.paymentMethod || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Status</h4>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {selectedOrder.isPaid || selectedOrder.status === 'delivered' ? 
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <FaCheck className="mr-1" /> Paid
                          {selectedOrder.paidAt && ` on ${formatOrderDate(selectedOrder.paidAt)}`}
                          {!selectedOrder.paidAt && selectedOrder.status === 'delivered' && 
                            ` on ${formatOrderDate(selectedOrder.deliveredAt || selectedOrder.updatedAt || selectedOrder.createdAt)}`}
                        </span> : 
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <FaTimes className="mr-1" /> Not Paid
                        </span>
                      }
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Shipping Address</h4>
                    <p className="text-gray-900 dark:text-white">
                      {selectedOrder.shippingAddress ? (
                        <>
                          {selectedOrder.shippingAddress.address}, 
                          {selectedOrder.shippingAddress.city}, 
                          {selectedOrder.shippingAddress.governorate && ` ${selectedOrder.shippingAddress.governorate},`}
                          {selectedOrder.shippingAddress.postalCode}
                        </>
                      ) : 'No shipping address provided'}
                    </p>
                  </div>
                </div>
                
                {/* Status Updates */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Status</h4>
                  
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-200 dark:bg-gray-600 h-2 flex-grow rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          selectedOrder.status === 'delivered' ? 'bg-green-500' :
                          selectedOrder.status === 'shipped' ? 'bg-blue-500' :
                          selectedOrder.status === 'processing' ? 'bg-yellow-500' :
                          selectedOrder.status === 'cancelled' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}
                        style={{ 
                          width: 
                            selectedOrder.status === 'delivered' ? '100%' :
                            selectedOrder.status === 'shipped' ? '75%' :
                            selectedOrder.status === 'processing' ? '50%' :
                            selectedOrder.status === 'pending' ? '25%' :
                            selectedOrder.status === 'cancelled' ? '100%' : '0%'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                        selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                        selectedOrder.status === 'shipped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-500' :
                        selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                      }`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    
                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                      <div className="flex items-center space-x-2">
                        <label htmlFor="status-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Update status:
                        </label>
                        <select 
                          id="status-select"
                          className="border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          value={selectedOrder.status}
                          onChange={(e) => updateOrderStatus(selectedOrder._id.$oid || selectedOrder._id, e.target.value)}
                          disabled={isUpdatingOrder}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {isUpdatingOrder && <FaSpinner className="animate-spin h-4 w-4 text-primary" />}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Items</h4>
                  
                  <div className="space-y-3">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                              onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                              loading="lazy" // Add lazy loading
                            />
                          ) : (
                            <span className="text-gray-400 text-xs text-center">No image</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.quantity} x {(item.price || item.discountedPrice || 0).toFixed(2)} EGP
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {(item.quantity * (item.price || item.discountedPrice || 0)).toFixed(2)} EGP
                          </p>
                          {item.discount > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {item.discount}% off
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Summary</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="text-gray-900 dark:text-white">
                        {typeof selectedOrder.itemsTotal === 'number' 
                          ? selectedOrder.itemsTotal.toFixed(2) 
                          : (typeof selectedOrder.itemsPrice === 'number' 
                             ? selectedOrder.itemsPrice.toFixed(2) 
                             : '0.00')} EGP
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                      <span className="text-gray-900 dark:text-white">
                        {typeof selectedOrder.shippingFee === 'number' 
                          ? selectedOrder.shippingFee.toFixed(2) 
                          : (typeof selectedOrder.shippingPrice === 'number' 
                             ? selectedOrder.shippingPrice.toFixed(2) 
                             : '0.00')} EGP
                      </span>
                    </div>
                    {(selectedOrder.taxPrice > 0 || selectedOrder.tax > 0) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                        <span className="text-gray-900 dark:text-white">
                          {(selectedOrder.taxPrice || selectedOrder.tax || 0).toFixed(2)} EGP
                        </span>
                      </div>
                    )}
                    {(selectedOrder.discount > 0) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                        <span className="text-green-600 dark:text-green-400">
                          -{selectedOrder.discount.toFixed(2)} EGP
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-gray-900 dark:text-white">
                          {typeof selectedOrder.totalAmount === 'number' 
                            ? selectedOrder.totalAmount.toFixed(2) 
                            : '0.00'} EGP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Close
                </button>
                
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id.$oid || selectedOrder._id, 'cancelled')}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg"
                    disabled={isUpdatingOrder}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard; 