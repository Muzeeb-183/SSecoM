// frontend/src/pages/ProductManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getImageForContext } from '../utils/imageOptimization';

// ✅ UPDATED: Category interface with imageUrl field
interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string; // ✅ NEW: Add imageUrl field for category images
  status: string;
  createdAt: string;
}

interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  affiliateLink: string;
  imageUrl: string;
  tags: string;
  status: string;
  createdAt: string;
}

interface ProductButton {
  name: string;
  link: string;
}

interface ProductFormData {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  uploadedImages: { url: string; fileId: string }[];
  button1: ProductButton;
  button2: ProductButton;
  button3: ProductButton;
  tags: string;
}

// ✅ NEW: Category image upload component
const CategoryImageUpload: React.FC<{
  selectedImage: File | null;
  currentImageUrl?: string;
  onImageChange: (file: File | null) => void;
  onRemoveImage: () => void;
}> = ({ selectedImage, currentImageUrl, onImageChange, onRemoveImage }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Category image must be less than 2MB');
        return;
      }
      onImageChange(file);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">🖼️ Category Image</h4>
      
      {/* Current or Preview Image */}
      {(previewUrl || currentImageUrl) && (
        <div className="mb-4 text-center">
          <img
            src={previewUrl || getImageForContext(currentImageUrl!, 'thumbnail')}
            alt="Category preview"
            className="w-32 h-24 object-cover rounded-lg border mx-auto"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="mt-2 text-red-600 text-sm hover:underline"
          >
            🗑️ Remove Image
          </button>
        </div>
      )}
      
      {/* Upload Input */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="category-image-upload"
        />
        <label 
          htmlFor="category-image-upload" 
          className="cursor-pointer"
        >
          <div className="text-gray-400 mb-2">
            📁 {(previewUrl || currentImageUrl) ? 'Change Image' : 'Upload Category Image'}
          </div>
          <div className="text-sm text-gray-500">
            PNG, JPG up to 2MB • Recommended: 400x300px
          </div>
        </label>
      </div>
    </div>
  );
};

// Product Image Upload Section (unchanged)
const ImageUploadSection: React.FC<{
  uploadedImages: { url: string; fileId: string }[];
  onImagesChange: (images: { url: string; fileId: string }[]) => void;
  token: string;
}> = ({ uploadedImages, onImagesChange, token }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    if (uploadedImages.length + files.length > 3) {
      toast.error('Maximum 3 images allowed per product');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        const newImages = [...uploadedImages, ...data.images];
        onImagesChange(newImages);
        toast.success(`${data.images.length} images uploaded successfully!`);
      } else {
        toast.error(data.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    toast.success('Image removed');
  };

  return (
    <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">📸 Product Images</h4>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🖼️ Upload Images <span className="text-red-500">* (1-3 images required)</span>
        </label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="image-upload"
            disabled={uploading || uploadedImages.length >= 3}
          />
          
          <label 
            htmlFor="image-upload" 
            className={`cursor-pointer ${uploading || uploadedImages.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-gray-400 mb-2">
              {uploading ? '⏳ Uploading...' : '📁 Click to upload images'}
            </div>
            <div className="text-sm text-gray-500">
              {uploadedImages.length}/3 images • PNG, JPG up to 5MB each
            </div>
          </label>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={getImageForContext(image.url, 'thumbnail')}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
              >
                ×
              </button>
              <div className="text-xs text-gray-500 mt-1">
                Image {index + 1} {index === 0 && '(Main)'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductManagement: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ ENHANCED: Category form state with image support
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    categoryImage: null as File | null // ✅ NEW: Add image file state
  });

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    uploadedImages: [],
    button1: { name: '', link: '' },
    button2: { name: '', link: '' },
    button3: { name: '', link: '' },
    tags: ''
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // ✅ ENHANCED: Category form submission with image support
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = editingCategory !== null;
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/admin/categories/${editingCategory.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/categories`;
      
      // ✅ NEW: Create FormData for file upload
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description);
      
      if (categoryForm.categoryImage) {
        formData.append('categoryImage', categoryForm.categoryImage);
      }
      
      // ✅ NEW: Handle image removal for editing
      if (isEditing && !categoryForm.categoryImage && editingCategory?.imageUrl) {
        formData.append('removeImage', 'true');
      }
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // ✅ Don't set Content-Type for FormData
        },
        body: formData // ✅ Use FormData instead of JSON
      });

      const data = await response.json();
      if (data.success) {
        toast.success(isEditing ? 'Category updated successfully!' : 'Category created successfully!');
        setCategoryForm({ name: '', description: '', categoryImage: null }); // ✅ Reset image
        setShowCategoryForm(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        toast.error(data.error || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.categoryId || !productForm.name || !productForm.price || 
        productForm.uploadedImages.length === 0 || !productForm.button1.name || !productForm.button1.link) {
      toast.error('Please fill all required fields (Category, Name, Price, At least 1 Image, First Button)');
      return;
    }

    try {
      const imageUrls = productForm.uploadedImages.map(img => img.url);
      const imageFileIds = productForm.uploadedImages.map(img => img.fileId);

      const buttons = [productForm.button1, productForm.button2, productForm.button3]
        .filter(btn => btn.name.trim() !== '' && btn.link.trim() !== '');

      const isEditing = editingProduct !== null;
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/admin/products/${editingProduct.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/products`;

      const productData = {
        categoryId: productForm.categoryId,
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        images: JSON.stringify(imageUrls),
        imageFileIds: JSON.stringify(imageFileIds),
        buttons: JSON.stringify(buttons),
        tags: productForm.tags,
        imageUrl: imageUrls[0] || '',
        affiliateLink: productForm.button1.link
      };

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
        setProductForm({
          categoryId: '',
          name: '',
          description: '',
          price: '',
          originalPrice: '',
          uploadedImages: [],
          button1: { name: '', link: '' },
          button2: { name: '', link: '' },
          button3: { name: '', link: '' },
          tags: ''
        });
        setShowProductForm(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        toast.error(data.error || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to ${editingProduct ? 'update' : 'create'} product`);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This will also delete all products in this category.`)) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Category deleted successfully!');
        fetchCategories();
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Product deleted successfully!');
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // ✅ ENHANCED: Edit category function with image support
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      categoryImage: null // ✅ Don't preload existing image
    });
    setShowCategoryForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    
    const existingImages: { url: string; fileId: string }[] = [];
    
    if (product.imageUrl) {
      existingImages.push({ 
        url: product.imageUrl, 
        fileId: ''
      });
    }
    
    setProductForm({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      uploadedImages: existingImages,
      button1: { name: 'Buy Now', link: product.affiliateLink },
      button2: { name: '', link: '' },
      button3: { name: '', link: '' },
      tags: product.tags || ''
    });
    setShowProductForm(true);
  };

  // ✅ ENHANCED: Cancel edit functions with image reset
  const handleCancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', categoryImage: null }); // ✅ Reset image
    setShowCategoryForm(false);
  };

  const handleCancelProductEdit = () => {
    setEditingProduct(null);
    setProductForm({
      categoryId: '',
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      uploadedImages: [],
      button1: { name: '', link: '' },
      button2: { name: '', link: '' },
      button3: { name: '', link: '' },
      tags: ''
    });
    setShowProductForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-content-bg to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-heading flex items-center">
                🛍️ Product Management
              </h1>
              <p className="text-subheading mt-2">
                Manage categories and products for your affiliate platform
              </p>
            </div>
            <div className="bg-logo-purple text-white px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-4 font-medium text-sm rounded-tl-xl ${
                activeTab === 'categories' 
                  ? 'bg-logo-purple text-white' 
                  : 'text-gray-500 hover:text-logo-purple'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              📂 Categories ({categories.length})
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === 'products' 
                  ? 'bg-logo-purple text-white' 
                  : 'text-gray-500 hover:text-logo-purple'
              }`}
              onClick={() => setActiveTab('products')}
            >
              🛍️ Products ({products.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'categories' && (
              <div>
                {/* Categories Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-heading">Categories Management</h2>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    + Add Category
                  </button>
                </div>

                {/* ✅ ENHANCED: Category Form with Image Upload */}
                {showCategoryForm && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-6">
                      {editingCategory ? '🔥 Edit Fire Category' : '🔥 Add New Fire Category'}
                    </h3>
                    <form onSubmit={handleCategorySubmit} className="space-y-6">
                      
                      {/* Category Name */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🔥 Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo-purple focus:border-transparent"
                          placeholder="Enter FIRE category name (e.g., Electronics, Fashion)"
                        />
                      </div>

                      {/* Category Description */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📝 Category Description
                        </label>
                        <textarea
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo-purple focus:border-transparent"
                          placeholder="Describe this FIRE category..."
                        />
                      </div>

                      {/* ✅ NEW: Category Image Upload */}
                      <CategoryImageUpload
                        selectedImage={categoryForm.categoryImage}
                        currentImageUrl={editingCategory?.imageUrl}
                        onImageChange={(file) => setCategoryForm({...categoryForm, categoryImage: file})}
                        onRemoveImage={() => setCategoryForm({...categoryForm, categoryImage: null})}
                      />

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                          type="button"
                          onClick={handleCancelCategoryEdit}
                          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 font-semibold"
                        >
                          🔥 {editingCategory ? 'UPDATE FIRE CATEGORY' : 'CREATE FIRE CATEGORY'} 💥
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ✅ ENHANCED: Categories List with Image Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      
                      {/* ✅ NEW: Category image display */}
                      {category.imageUrl && (
                        <div className="mb-3">
                          <img
                            src={getImageForContext(category.imageUrl, 'thumbnail')}
                            alt={category.name}
                            className="w-full h-32 object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-heading">{category.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${
                          category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.status}
                        </span>
                      </div>
                      <p className="text-sm text-subheading mb-3">{category.description || 'No description'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Created: {new Date(category.createdAt).toLocaleDateString()}
                          {category.imageUrl && <span className="ml-2 text-green-600">📸 Has Image</span>}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {categories.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📂</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Categories Yet</h3>
                    <p className="text-gray-500 mb-4">Start by creating your first product category</p>
                    <button
                      onClick={() => setShowCategoryForm(true)}
                      className="bg-logo-purple text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create First Category
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                {/* Products Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-heading">Products Management</h2>
                  <button
                    onClick={() => setShowProductForm(true)}
                    disabled={categories.length === 0}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      categories.length === 0 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    + Add Product
                  </button>
                </div>

                {categories.length === 0 && (
                  <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Categories Required</h3>
                    <p className="text-yellow-700 mb-4">You need to create at least one category before adding products</p>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Go to Categories
                    </button>
                  </div>
                )}

                {/* Product Form (unchanged from your original) */}
                {showProductForm && categories.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-6">
                      {editingProduct ? '🔥 Edit Fire Product' : '🔥 Add New Fire Product'}
                    </h3>
                    <form onSubmit={handleProductSubmit} className="space-y-6">
                      
                      {/* Category Selection */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🔥 Product Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={productForm.categoryId}
                          onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo-purple focus:border-transparent"
                        >
                          <option value="">Select Fire Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              🔥 {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Product Name */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          💥 Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo-purple focus:border-transparent"
                          placeholder="Enter a FIRE product name..."
                        />
                      </div>

                      {/* Description */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📝 Product Description
                        </label>
                        <textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo-purple focus:border-transparent"
                          placeholder="Describe this FIRE product and why students need it..."
                        />
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            💰 Current Price (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="₹999"
                          />
                        </div>
                        <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            💸 Original Price (₹) - Optional
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={productForm.originalPrice}
                            onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="₹1299"
                          />
                        </div>
                      </div>

                      {/* Product Images */}
                      {token && (
                        <ImageUploadSection
                          uploadedImages={productForm.uploadedImages}
                          onImagesChange={(images) => setProductForm({...productForm, uploadedImages: images})}
                          token={token}
                        />
                      )}

                      {!token && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-600">⚠️ Authentication required for image upload</p>
                        </div>
                      )}

                      {/* Product Buttons */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-pink-500">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">🔗 Product Buy Buttons</h4>
                        
                        {/* Button 1 - Mandatory */}
                        <div className="mb-4 p-3 bg-pink-50 rounded border">
                          <h5 className="font-medium text-gray-800 mb-3">
                            🔥 Main Button <span className="text-red-500">* (Required)</span>
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              required
                              value={productForm.button1.name}
                              onChange={(e) => setProductForm({
                                ...productForm, 
                                button1: { ...productForm.button1, name: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Buy from Amazon"
                            />
                            <input
                              type="url"
                              required
                              value={productForm.button1.link}
                              onChange={(e) => setProductForm({
                                ...productForm, 
                                button1: { ...productForm.button1, link: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="https://amazon.in/product-link"
                            />
                          </div>
                        </div>

                        {/* Button 2 - Optional */}
                        <div className="mb-4 p-3 bg-gray-50 rounded border">
                          <h5 className="font-medium text-gray-800 mb-3">⚡ Second Button - Optional</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={productForm.button2.name}
                              onChange={(e) => setProductForm({
                                ...productForm, 
                                button2: { ...productForm.button2, name: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                              placeholder="Buy from Flipkart"
                            />
                            <input
                              type="url"
                              value={productForm.button2.link}
                              onChange={(e) => setProductForm({
                                ...productForm, 
                                button2: { ...productForm.button2, link: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                              placeholder="https://flipkart.com/product-link"
                            />
                          </div>
                        </div>

                        {/* Button 3 - Optional */}
                        <div className="p-3 bg-gray-50 rounded border">
                          <h5 className="font-medium text-gray-800 mb-3">💥 Third Button - Optional</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={productForm.button3.name}
                              onChange={(e) => setProductForm({
                                ...productForm, 
                                button3: { ...productForm.button3, name: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                              placeholder="Buy from Official Site"
                            />
                            <input
                              type="url"
                              value={productForm.button3.link}
                              onChange={(e) => setProductForm({
                                ...productForm, 
                                button3: { ...productForm.button3, link: e.target.value }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                              placeholder="https://official-site.com/product"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🏷️ Product Tags
                        </label>
                        <input
                          type="text"
                          value={productForm.tags}
                          onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="student, tech, affordable, trending (comma separated)"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          💡 Separate multiple tags with commas for better search and categorization
                        </p>
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                          type="button"
                          onClick={handleCancelProductEdit}
                          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 font-semibold"
                        >
                          🔥 {editingProduct ? 'UPDATE FIRE PRODUCT' : 'CREATE FIRE PRODUCT'} 💥
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-heading">{product.name}</h3>
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              {product.categoryName}
                            </span>
                          </div>
                          <p className="text-sm text-subheading mb-3 line-clamp-2">
                            {product.description || 'No description'}
                          </p>
                        </div>
                        {product.imageUrl && (
                          <img 
                            src={getImageForContext(product.imageUrl, 'thumbnail')}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover ml-4"
                            loading="lazy"
                          />
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Price:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-green-600">₹{product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                        {product.tags && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tags:</span>
                            <span className="text-sm text-gray-500">{product.tags}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Delete
                          </button>
                          <a 
                            href={product.affiliateLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 text-sm hover:underline"
                          >
                            View Link
                          </a>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {products.length === 0 && categories.length > 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Yet</h3>
                    <p className="text-gray-500 mb-4">Start by adding your first affiliate product</p>
                    <button
                      onClick={() => setShowProductForm(true)}
                      className="bg-logo-purple text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add First Product
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
