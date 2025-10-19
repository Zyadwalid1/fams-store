import express from 'express';
import {
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
} from '../controllers/productCategoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes - Category CRUD
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

// Admin routes - Type management
router.post('/:id/types', protect, admin, addType);
router.put('/:id/types/:typeId', protect, admin, updateType);
router.delete('/:id/types/:typeId', protect, admin, deleteType);

// Admin routes - Subtype management
router.post('/:id/types/:typeId/subtypes', protect, admin, addSubtype);
router.put('/:id/types/:typeId/subtypes/:subtypeId', protect, admin, updateSubtype);
router.delete('/:id/types/:typeId/subtypes/:subtypeId', protect, admin, deleteSubtype);

export default router; 