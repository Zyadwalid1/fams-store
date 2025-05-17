# Category System Migration

This directory contains scripts to help migrate from the old dual-category system to the consolidated ProductCategory system.

## Background

Previously, the application had two separate category systems:
1. A simple Category model (`/api/categories`)
2. A more robust ProductCategory model (`/api/product-categories`)

This created redundancy and made data management more complex. We've consolidated to use only the ProductCategory system, which provides a better hierarchical structure with types and subtypes.

## Changes Made

1. Updated Product model to use ObjectId references for category, type, and subtype
2. Deprecated the old Category routes in app.js
3. Updated productController to work with ObjectId references
4. Created migration script to update existing product data

## Running the Migration

To run the migration script and update your existing products:

```bash
# Navigate to server directory
cd server

# Run the migration script
node src/scripts/migrateCategoryData.js
```

The script will:
- Find all existing products
- For each product, match its string-based category/type/subtype to the corresponding ProductCategory items
- Update the product with the correct ObjectId references
- Log the results of the migration process

## Post-Migration Steps

After running the migration:

1. Verify that products are correctly linked to their categories
2. Update any frontend code that was using the `/api/categories` endpoints to use `/api/product-categories` instead
3. After confirming everything works, you can safely remove the Category model and routes completely

## Rolling Back (if needed)

If you encounter issues:

1. Restore the original app.js to re-enable `/api/categories` routes
2. Revert the Product model schema changes
3. If needed, create a rollback script to convert ObjectIds back to strings

## Data Model

The new data model relationship is:

- Product → references → ProductCategory (via ObjectId)
- Product → references → Type (via ObjectId, stored in ProductCategory.types)
- Product → references → Subtype (via ObjectId, stored in ProductCategory.types[].subtypes) 