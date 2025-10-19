import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import Category from '../models/Category.js';
import connectDB from '../config/db.js';

dotenv.config();

// Connect to DB
connectDB();

/**
 * This script migrates products from the old category system (string-based) 
 * to the new ProductCategory system (ObjectId-based)
 */
async function migrateProducts() {
  console.log('Starting category data migration...');
  
  try {
    // Get all old categories
    const oldCategories = await Category.find({});
    console.log(`Found ${oldCategories.length} old categories`);
    
    // Get all product categories
    const productCategories = await ProductCategory.find({});
    console.log(`Found ${productCategories.length} product categories`);
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each product
    for (const product of products) {
      try {
        // Find matching category by name
        const oldCategoryName = product.category; // Assuming this is a string name
        
        // Find matching ProductCategory
        const matchingCategory = productCategories.find(
          pc => pc.name.toLowerCase() === oldCategoryName.toLowerCase()
        );
        
        if (!matchingCategory) {
          console.log(`No matching category found for product ${product._id} with category "${oldCategoryName}"`);
          errorCount++;
          continue;
        }
        
        // Find matching type by name
        const oldTypeName = product.type; // Assuming this is a string name
        const matchingType = matchingCategory.types.find(
          t => t.name.toLowerCase() === oldTypeName.toLowerCase()
        );
        
        if (!matchingType) {
          console.log(`No matching type found for product ${product._id} with type "${oldTypeName}"`);
          errorCount++;
          continue;
        }
        
        // Find matching subtype by name if it exists
        let matchingSubtype = null;
        if (product.subtype) {
          const oldSubtypeName = product.subtype;
          matchingSubtype = matchingType.subtypes.find(
            s => s.name.toLowerCase() === oldSubtypeName.toLowerCase()
          );
          
          if (!matchingSubtype) {
            console.log(`No matching subtype found for product ${product._id} with subtype "${oldSubtypeName}"`);
            // Continue anyway, just won't set subtype
          }
        }
        
        // Update product with new ObjectId references
        product.category = matchingCategory._id;
        product.type = matchingType._id;
        if (matchingSubtype) {
          product.subtype = matchingSubtype._id;
        } else {
          product.subtype = undefined;
        }
        
        await product.save();
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`Processed ${successCount} products successfully`);
        }
      } catch (error) {
        console.error(`Error processing product ${product._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('Migration completed!');
    console.log(`Successfully migrated: ${successCount} products`);
    console.log(`Failed to migrate: ${errorCount} products`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    console.log('Disconnecting from database...');
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the migration
migrateProducts(); 