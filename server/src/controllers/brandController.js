import Brand from '../models/Brand.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Create a new brand
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = asyncHandler(async (req, res) => {
  const { name, description, category, featured } = req.body;

  // Check if brand already exists
  const brandExists = await Brand.findOne({ name });
  if (brandExists) {
    res.status(400);
    throw new Error('Brand already exists');
  }

  const brand = await Brand.create({
    name,
    description,
    category: category || 'affordable',
    featured: featured || false
  });

  res.status(201).json(brand);
});

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = asyncHandler(async (req, res) => {
  const { category, featured } = req.query;
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (featured) {
    filter.featured = featured === 'true';
  }

  const brands = await Brand.find(filter).sort({ name: 1 });
  res.json({ brands });
});

// @desc    Get brands grouped by category (affordable/luxury)
// @route   GET /api/brands/grouped
// @access  Public
export const getGroupedBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({}).sort({ name: 1 });
  
  // Group brands by category
  const groupedBrands = {
    affordable: brands.filter(brand => brand.category === 'affordable'),
    luxury: brands.filter(brand => brand.category === 'luxury')
  };
  
  res.json({ groupedBrands });
});

// @desc    Get a brand by ID
// @route   GET /api/brands/:id
// @access  Public
export const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  
  res.json(brand);
});

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = asyncHandler(async (req, res) => {
  const { name, description, category, featured } = req.body;
  const brand = await Brand.findById(req.params.id);
  
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  
  // Update fields
  brand.name = name || brand.name;
  brand.description = description || brand.description;
  brand.category = category || brand.category;
  brand.featured = featured !== undefined ? featured : brand.featured;
  
  const updatedBrand = await brand.save();
  res.json(updatedBrand);
});

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  
  await brand.deleteOne();
  res.json({ message: 'Brand removed' });
}); 