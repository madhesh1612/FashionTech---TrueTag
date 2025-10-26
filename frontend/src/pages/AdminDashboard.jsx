import React, { useState, useEffect } from 'react';
import { products } from '../services/api';

function AdminDashboard() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newProduct, setNewProduct] = useState({
    serialNumber: '',
    name: '',
    brand: '',
    labelCoordinates: { x: 0, y: 0, width: 0, height: 0 }
  });

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      const response = await products.getList(page);
      setProductList(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await products.register(newProduct);
      setNewProduct({
        serialNumber: '',
        name: '',
        brand: '',
        labelCoordinates: { x: 0, y: 0, width: 0, height: 0 }
      });
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Product Registration Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Register New Product</h3>
          <form onSubmit={handleCreateProduct}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={newProduct.serialNumber}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  serialNumber: e.target.value
                })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={newProduct.name}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  name: e.target.value
                })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={newProduct.brand}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  brand: e.target.value
                })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Label X
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newProduct.labelCoordinates.x}
                  onChange={(e) => setNewProduct({
                    ...newProduct,
                    labelCoordinates: {
                      ...newProduct.labelCoordinates,
                      x: parseInt(e.target.value)
                    }
                  })}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Label Y
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newProduct.labelCoordinates.y}
                  onChange={(e) => setNewProduct({
                    ...newProduct,
                    labelCoordinates: {
                      ...newProduct.labelCoordinates,
                      y: parseInt(e.target.value)
                    }
                  })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Register Product
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Registered Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Serial</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {productList.map((product) => (
                  <tr key={product._id}>
                    <td className="border px-4 py-2">{product.serialNumber}</td>
                    <td className="border px-4 py-2">{product.name}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        product.status === 'activated'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'returned'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;