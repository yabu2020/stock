import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

const ProductList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState(""); // Alert state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsResponse, categoriesResponse] = await Promise.all([
          axios.get("http://localhost:3001/productlist"),
          axios.get("http://localhost:3001/categories"),
        ]);

        setAssets(assetsResponse.data);
        setCategories(categoriesResponse.data);
        
        // Check for stock levels
        checkStockLevels(assetsResponse.data);
      } catch (error) {
        setMessage(`Error: ${error.response ? error.response.data.message : error.message}`);
      }
    };

    fetchData();
  }, []);

  const checkStockLevels = (assets) => {
    const lowStockAssets = assets.flatMap(categoryGroup => categoryGroup.assets).filter(asset => asset.status === 'Low Stock');
    const outOfStockAssets = assets.flatMap(categoryGroup => categoryGroup.assets).filter(asset => asset.status === 'Out Of Stock');
  
    const lowStockNames = lowStockAssets.map(asset => asset.name).join(', ');
    const outOfStockNames = outOfStockAssets.map(asset => asset.name).join(', ');
  
    let alertMessage = '';
  
    if (lowStockAssets.length > 0) {
      alertMessage += `Alert: The following products are low on stock: ${lowStockNames}. `;
    }
  
    if (outOfStockAssets.length > 0) {
      alertMessage += `Alert: The following products are out of stock: ${outOfStockNames}.`;
    }
  
    setAlert(alertMessage || ""); // Clear alert if no issues
  };
  

  const startEditing = (asset) => {
    setEditingAsset(asset._id);
    setEditData({ ...asset });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const saveChanges = (assetId) => {
    let newStatus;
    if (editData.quantity === 0) {
      newStatus = 'Out Of Stock';
    } else if (editData.quantity < 5) {
      newStatus = 'Low Stock';
    } else {
      newStatus = 'Available';
    }

    axios
      .put(`http://localhost:3001/updateasset/${assetId}`, {
        ...editData,
        status: newStatus,
      })
      .then((response) => {
        setAssets((prevAssets) =>
          prevAssets.map((categoryGroup) => ({
            ...categoryGroup,
            assets: categoryGroup.assets.map((asset) =>
              asset._id === assetId ? response.data : asset
            ),
          }))
        );
        checkStockLevels(assets); // Check stock levels after saving
        setEditingAsset(null);
        setEditData({});
        setMessage("Asset updated successfully");
      })
      .catch((error) => {
        setMessage(`Error: ${error.response ? error.response.data.message : error.message}`);
      });
  };

  const cancelEditing = () => {
    setEditingAsset(null);
    setEditData({});
  };

  const deleteAsset = (assetId) => {
    axios
      .delete(`http://localhost:3001/deleteasset/${assetId}`)
      .then(() => {
        setAssets((prevAssets) =>
          prevAssets.map((categoryGroup) => ({
            ...categoryGroup,
            assets: categoryGroup.assets.filter((asset) => asset._id !== assetId),
          }))
        );
        checkStockLevels(assets); // Check stock levels after deleting
        setMessage("Asset deleted successfully");
      })
      .catch((error) => {
        setMessage(`Error: ${error.response ? error.response.data.message : error.message}`);
      });
  };

  const categoryMap = categories.reduce((map, category) => {
    map[category._id] = category.category;
    return map;
  }, {});

  return (
    <div className="grid grid-cols-1 mt-10 ml-80 lg:grid-cols-1 gap-6 w-80">
      <div className="flex justify-between w-80">
        <div>
          <h1 className="font-semibold text-2xl text-blue-400 bg-gray-50">List of Products</h1>
        </div>
        <div className="flex-grow self-end text-right">
          <Link to="/registerproduct">
            <button className="bg-blue-400 w-28 h-11 justify-around hover:text-white items-center hover:bg-gray-300">
              New Products
            </button>
          </Link>
        </div>
        {message && <p className="text-gray-300 text-md font-medium hover:text-green-500 ml-20">{message}</p>}
      </div>
      {alert && <p className="text-red-500 font-bold">{alert}</p>} {/* Display alert message */}
      <div>
        {assets.length > 0 ? (
          assets.map((categoryGroup, index) => (
            <div key={index} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {categoryMap[categoryGroup._id] || "Unknown Category"}
              </h2>
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="text-[15px] uppercase border border-solid tracking-wide font-semibold text-gray-600 py-2 px-3 bg-gray-50 text-left rounded-bl-md">Product Name</th>
                    <th className="text-[15px] uppercase border border-solid tracking-wide font-semibold text-gray-600 py-2 px-3 bg-gray-50 text-left rounded-bl-md">Quantity</th>
                    <th className="text-[15px] uppercase border border-solid tracking-wide font-semibold text-gray-600 py-2 px-3 bg-gray-50 text-left rounded-bl-md">Purchase Price</th>
                    <th className="text-[15px] uppercase border border-solid tracking-wide font-semibold text-gray-600 py-2 px-3 bg-gray-50 text-left rounded-bl-md">Selling Price</th>
                    <th className="text-[15px] uppercase border border-solid tracking-wide font-semibold text-gray-600 py-2 px-3 bg-gray-50 text-left rounded-bl-md">Description</th>
                    <th className="text-[15px] uppercase border border-solid tracking-wide font-semibold text-gray-600 py-2 px-3 bg-gray-50 text-left rounded-bl-md">Status</th>
                    <th className="text-[15px] uppercase border border-solid tracking-wide font-semibold text-gray-600 py-2 px-3 bg-gray-50 text-left rounded-bl-md">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryGroup.assets.length > 0 ? (
                    categoryGroup.assets.map((asset) => (
                      <tr key={asset._id}>
                        <td className="py-2 px-4 border-b border-gray-200">{editingAsset === asset._id ? <input type="text" name="name" value={editData.name} onChange={handleInputChange} className="border p-1 w-full" style={{ maxWidth: '120px' }} /> : asset.name}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{editingAsset === asset._id ? <input type="number" name="quantity" value={editData.quantity} onChange={handleInputChange} className="border p-1 w-full" style={{ maxWidth: '120px' }} /> : asset.quantity}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{editingAsset === asset._id ? <input type="number" name="purchaseprice" value={editData.purchaseprice} onChange={handleInputChange} className="border p-1 w-full" style={{ maxWidth: '120px' }} /> : asset.purchaseprice}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{editingAsset === asset._id ? <input type="number" name="saleprice" value={editData.saleprice} onChange={handleInputChange} className="border p-1 w-full" style={{ maxWidth: '120px' }} /> : asset.saleprice}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{editingAsset === asset._id ? <input type="text" name="description" value={editData.description} onChange={handleInputChange} className="border p-1 w-full" style={{ maxWidth: '120px' }} /> : asset.description}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{editingAsset === asset._id ? <input type="text" name="status" value={editData.status} onChange={handleInputChange} className="border p-1 w-full" style={{ maxWidth: '120px' }} /> : asset.status}</td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          {editingAsset === asset._id ? (
                            <>
                              <button onClick={() => saveChanges(asset._id)} className="text-blue-500 hover:underline mr-4">Save</button>
                              <button onClick={cancelEditing} className="text-red-500 hover:underline">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditing(asset)} className="hover:text-blue-700 hover:cursor-pointer mr-4"><FaEdit /></button>
                              <button onClick={() => deleteAsset(asset._id)} className="hover:text-red-500 hover:cursor-pointer"><FaTrash /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-2 px-4 border-b border-gray-200 text-center">No assets found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p className="text-center">Loading assets...</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
