import ProductCategory from '../models/ProductCategory.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Create a new product category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { 
    name, 
    description, 
    types, 
    featured, 
    order, 
    filters 
  } = req.body;

  // Check if category already exists
  const categoryExists = await ProductCategory.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await ProductCategory.create({
    name,
    description,
    types: types || [],
    featured: featured || false,
    order: order || 0,
    filters: filters || {}
  });

  res.status(201).json(category);
});

// @desc    Get all product categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const { featured } = req.query;
  const filter = {};

  if (featured) {
    filter.featured = featured === 'true';
  }

  const categories = await ProductCategory.find(filter)
    .sort({ order: 1, name: 1 })
    .populate('filters.brands', 'name');
    
  res.json(categories);
});

// @desc    Get a product category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let category;
  
  // Check if id is a valid MongoDB ObjectId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    category = await ProductCategory.findById(id)
      .populate('filters.brands', 'name category');
  } else {
    // If not, try to find by slug
    category = await ProductCategory.findOne({ slug: id })
      .populate('filters.brands', 'name category');
  }
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.json(category);
});

// @desc    Update a product category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { 
    name, 
    description, 
    types, 
    featured, 
    order, 
    filters 
  } = req.body;
  
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Update fields that are provided
  if (name) category.name = name;
  if (description) category.description = description;
  if (types) category.types = types;
  if (featured !== undefined) category.featured = featured;
  if (order !== undefined) category.order = order;
  if (filters) category.filters = filters;
  
  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete a product category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  await category.deleteOne();
  res.json({ message: 'Category removed' });
});

// @desc    Add a type to a category
// @route   POST /api/categories/:id/types
// @access  Private/Admin
export const addType = asyncHandler(async (req, res) => {
  try {
    console.log('Add Type endpoint hit with params:', req.params);
    console.log('Request body:', req.body);
    
    const { name, description, subtypes } = req.body;
    const category = await ProductCategory.findById(req.params.id);
    
    console.log('Category found:', category ? 'Yes' : 'No');
    
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    
    // Check if type already exists
    if (category.types.some(type => type.name === name)) {
      console.log('Type already exists in category');
      res.status(400);
      throw new Error('Type already exists in this category');
    }
    
    category.types.push({
      name,
      description,
      subtypes: subtypes || []
    });
    
    const updatedCategory = await category.save();
    console.log('Category updated successfully');
    res.status(201).json(updatedCategory);
  } catch (error) {
    console.error('Error in addType function:', error);
    throw error; // Re-throw to be caught by asyncHandler
  }
});

// @desc    Update a type in a category
// @route   PUT /api/categories/:id/types/:typeId
// @access  Private/Admin
export const updateType = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const typeIndex = category.types.findIndex(type => type._id.toString() === req.params.typeId);
  
  if (typeIndex === -1) {
    res.status(404);
    throw new Error('Type not found');
  }
  
  if (name) category.types[typeIndex].name = name;
  if (description) category.types[typeIndex].description = description;
  
  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete a type from a category
// @route   DELETE /api/categories/:id/types/:typeId
// @access  Private/Admin
export const deleteType = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const typeIndex = category.types.findIndex(type => type._id.toString() === req.params.typeId);
  
  if (typeIndex === -1) {
    res.status(404);
    throw new Error('Type not found');
  }
  
  category.types.splice(typeIndex, 1);
  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Add a subtype to a type
// @route   POST /api/categories/:id/types/:typeId/subtypes
// @access  Private/Admin
export const addSubtype = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const typeIndex = category.types.findIndex(type => type._id.toString() === req.params.typeId);
  
  if (typeIndex === -1) {
    res.status(404);
    throw new Error('Type not found');
  }
  
  // Check if subtype already exists
  if (category.types[typeIndex].subtypes.some(subtype => subtype.name === name)) {
    res.status(400);
    throw new Error('Subtype already exists in this type');
  }
  
  category.types[typeIndex].subtypes.push({
    name,
    description
  });
  
  const updatedCategory = await category.save();
  res.status(201).json(updatedCategory);
});

// @desc    Update a subtype
// @route   PUT /api/categories/:id/types/:typeId/subtypes/:subtypeId
// @access  Private/Admin
export const updateSubtype = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const typeIndex = category.types.findIndex(type => type._id.toString() === req.params.typeId);
  
  if (typeIndex === -1) {
    res.status(404);
    throw new Error('Type not found');
  }
  
  const subtypeIndex = category.types[typeIndex].subtypes.findIndex(
    subtype => subtype._id.toString() === req.params.subtypeId
  );
  
  if (subtypeIndex === -1) {
    res.status(404);
    throw new Error('Subtype not found');
  }
  
  if (name) category.types[typeIndex].subtypes[subtypeIndex].name = name;
  if (description) category.types[typeIndex].subtypes[subtypeIndex].description = description;
  
  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete a subtype
// @route   DELETE /api/categories/:id/types/:typeId/subtypes/:subtypeId
// @access  Private/Admin
export const deleteSubtype = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const typeIndex = category.types.findIndex(type => type._id.toString() === req.params.typeId);
  
  if (typeIndex === -1) {
    res.status(404);
    throw new Error('Type not found');
  }
  
  const subtypeIndex = category.types[typeIndex].subtypes.findIndex(
    subtype => subtype._id.toString() === req.params.subtypeId
  );
  
  if (subtypeIndex === -1) {
    res.status(404);
    throw new Error('Subtype not found');
  }
  
  category.types[typeIndex].subtypes.splice(subtypeIndex, 1);
  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addType,
  updateType,
  deleteType,
  addSubtype,
  updateSubtype,
  deleteSubtype
}; 