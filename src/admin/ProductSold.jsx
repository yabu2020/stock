import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from 'lodash.debounce';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProductSold() {
  const [assets, setAssets] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedAssets, setAssignedAssets] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchAssignedAssets();
  }, [searchTerm]);

  const fetchAssets = useCallback(debounce(() => {
    axios
      .get("http://localhost:3001/productlist", { params: { search: searchTerm } })
      .then((response) => {
        const filteredAssets = response.data.flatMap(category =>
          category.assets.filter(asset => 
            asset.status === "Available" || asset.status === "Low Stock"
          )
        );
        setAssets(filteredAssets);
      })
      .catch((error) => setMessage(`Error fetching assets: ${error.message}`));
  }, 300), [searchTerm]);

  const fetchAssignedAssets = useCallback(() => {
    axios
      .get("http://localhost:3001/assigned-assets")
      .then((response) => {
        setAssignedAssets(response.data);
      })
      .catch((error) => setMessage(`Error fetching assigned assets: ${error.message}`));
  }, []);

  const handleGiveAsset = () => {
    if (!selectedAsset || quantity <= 0) {
      setMessage("Please select an asset and enter a valid quantity.");
      return;
    }
  
    const asset = assets.find(a => a._id === selectedAsset);
    if (!asset) {
      setMessage("Selected asset not found.");
      return;
    }
  
    const totalPrice = asset.saleprice * quantity;
  
    axios
      .post("http://localhost:3001/sellproduct", {
        assetId: selectedAsset,
        quantity,
        totalPrice,
      })
      .then((response) => {
        console.log("Response received:", response.data);
        
        // Show notification based on asset status
        const status = response.data.status;
        if (status === 'Out Of Stock') {
          toast.error("Alert: The product is now out of stock!");
        } else if (status === 'Low Stock') {
          toast.warn("Alert: The product is low on stock!");
        }
  
        setMessage("Product sold successfully");
        fetchAssets(); // Refresh the asset list after assignment
        fetchAssignedAssets(); // Refresh the assigned assets list
        setSelectedAsset("");
        setQuantity(1); // Reset quantity
      })
      .catch((error) => {
        console.error("Error during asset sale:", error);
        const errorMsg = error.response?.data?.error || error.message;
        setMessage(`Error assigning asset: ${errorMsg}`);
      });
  };
  

  return (
    <div className="max-w-4xl mx-auto p-6 ml-60 rounded-lg shadow-md bg-white">
      <h2 className="text-3xl mt-4 font-bold text-blue-400 mb-6">Sell Product</h2>
      {message && <p className="text-green-400 text-lg mb-4">{message}</p>}
      
      <ToastContainer /> {/* Add ToastContainer for notifications */}
      
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="search" className="block text-lg font-medium text-gray-500 mb-2 ml-2">Search Product:</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Search for products"
            />
            <label htmlFor="asset-select" className="block text-lg font-medium text-gray-500 mb-2"></label>
            <select
              id="asset-select"
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full sm:w-64 md:w-80 lg:w-96 px-4 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="" disabled>Select a Product</option>
              {assets.map((asset) => (
                <option key={asset._id} value={asset._id}>
                  {asset.assetno} - {asset.name} - {asset.saleprice} ({asset.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="quantity" className="block text-lg font-medium text-gray-500 mb-2">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            min="1"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Enter quantity"
          />
        </div>
      </div>

      <button
        onClick={handleGiveAsset}
        className="px-6 py-3 bg-blue-400 ml-80 text-white font-semibold rounded-md shadow-md hover:bg-gray-500 transition duration-300"
      >
        Sell Product
      </button>

      <h3 className="text-xl font-semibold text-gray-500 mt-10">Sold Products</h3>
      <table className="w-full mt-6 border-collapse bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-blue-400">
            <th className="px-4 py-2">Product ID</th>
            <th className="px-4 py-2">Product Name</th>
            <th className="px-4 py-2">Sale Price</th>
            <th className="px-4 py-2">Cost Price</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Total Price</th>
            <th className="px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {assignedAssets.length > 0 ? (
            assignedAssets.map((assignment, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{assignment.asset?.assetno || "N/A"}</td>
                <td className="px-4 py-2">{assignment.asset?.name || "N/A"}</td>
                <td className="px-4 py-2">{assignment.asset?.saleprice || "N/A"}</td>
                <td className="px-4 py-2">{assignment.costPrice || "N/A"}</td>
                <td className="px-4 py-2">{assignment.quantity || "N/A"}</td>
                <td className="px-4 py-2">{assignment.totalPrice || "N/A"}</td>
                <td className="px-4 py-2">{new Date(assignment.dateAssigned).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-4">No products sold</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductSold;
