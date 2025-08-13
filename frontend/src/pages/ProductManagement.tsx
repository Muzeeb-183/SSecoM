// frontend/src/pages/ProductManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
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
  image1: string; // Mandatory
  image2: string; // Optional
  image3: string; // Optional
  button1: ProductButton; // Mandatory
  button2: ProductButton; // Optional
  button3: ProductButton; // Optional
  tags: string;
}

const ProductManagement: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Enhanced Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    image1: '',
    image2: '',
    image3: '',
    button1: { name: '', link: '' },
    button2: { name: '', link: '' },
    button3: { name: '', link: '' },
    tags: ''
  });

  // Fetch categories
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

  // Fetch products
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

  // Handle category submission (create/update)
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = editingCategory !== null;
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/admin/categories/${editingCategory.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/categories`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryForm)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(isEditing ? 'Category updated successfully!' : 'Category created successfully!');
        setCategoryForm({ name: '', description: '' });
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

  // Handle enhanced product submission (create/update)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!productForm.categoryId || !productForm.name || !productForm.price || !productForm.image1 || !productForm.button1.name || !productForm.button1.link) {
      toast.error('Please fill all required fields (Category, Name, Price, First Image, First Button)');
      return;
    }

    try {
      // Prepare images array (filter out empty images)
      const images = [productForm.image1, productForm.image2, productForm.image3]
        .filter(img => img.trim() !== '');

      // Prepare buttons array (filter out empty buttons)
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
        images: JSON.stringify(images), // Store as JSON
        buttons: JSON.stringify(buttons), // Store as JSON
        tags: productForm.tags,
        // For backward compatibility, use first image and button for old fields
        imageUrl: productForm.image1,
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
          image1: '',
          image2: '',
          image3: '',
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

  // Delete category function
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
        fetchProducts(); // Refresh both lists
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // Delete product function
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
        fetchProducts(); // Refresh the products list
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Edit category function
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || ''
    });
    setShowCategoryForm(true);
  };

  // Edit product function
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      image1: product.imageUrl || '',
      image2: '',
      image3: '',
      button1: { name: 'Buy Now', link: product.affiliateLink },
      button2: { name: '', link: '' },
      button3: { name: '', link: '' },
      tags: product.tags || ''
    });
    setShowProductForm(true);
  };

  // Cancel edit functions
  const handleCancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
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
      image1: '',
      image2: '',
      image3: '',
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

                {/* Category Form */}
                {showCategoryForm && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h3>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo-purple focus:border-transparent"
                          placeholder="Enter category name (e.g., Electronics, Fashion)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo-purple focus:border-transparent"
                          placeholder="Enter category description..."
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="bg-logo-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          {editingCategory ? 'Update Category' : 'Create Category'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelCategoryEdit}
                          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Categories List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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

                {/* ENHANCED PRODUCT FORM */}
                {showProductForm && categories.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-6">
                      {editingProduct ? '🔥 Edit Fire Product' : '🔥 Add New Fire Product'}
                    </h3>
                    <form onSubmit={handleProductSubmit} className="space-y-6">
                      
                      {/* 1. Category Selection */}
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

                      {/* 2. Product Name */}
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

                      {/* 3. Description */}
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

                      {/* 4. & 5. Pricing */}
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

                      {/* 6. Images Section */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">📸 Product Images</h4>
                        
                        {/* Image 1 - Mandatory */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🖼️ Main Image <span className="text-red-500">* (Required)</span>
                          </label>
                          <input
                            type="url"
                            required
                            value={productForm.image1}
                            onChange={(e) => setProductForm({...productForm, image1: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="https://example.com/main-image.jpg"
                          />
                        </div>

                        {/* Image 2 - Optional */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🖼️ Second Image - Optional
                          </label>
                          <input
                            type="url"
                            value={productForm.image2}
                            onChange={(e) => setProductForm({...productForm, image2: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="https://example.com/second-image.jpg"
                          />
                        </div>

                        {/* Image 3 - Optional */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🖼️ Third Image - Optional
                          </label>
                          <input
                            type="url"
                            value={productForm.image3}
                            onChange={(e) => setProductForm({...productForm, image3: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="https://example.com/third-image.jpg"
                          />
                        </div>
                      </div>

                      {/* 7. Product Buttons Section */}
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

                      {/* 8. Tags */}
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
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover ml-4"
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
