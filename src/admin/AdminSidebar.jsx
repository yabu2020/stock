import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaBox, FaPlusSquare, FaTags, FaShoppingCart, FaChartBar,FaLock,FaUserPlus  } from "react-icons/fa"; // New icons

function AdminSidebar({ children }) {
    const [isOpen, setIsOpen] = useState(true);
    const toggle = () => setIsOpen(!isOpen);
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    const menuItem = [
        {
            path: "/productlist",
            name: "List Of Product",
            icon: <FaBox /> // Box for products
        },
        {
            path: "/registerproduct",
            name: "Register Product",
            icon: <FaPlusSquare /> // Plus sign for register
        },
        {
            path: "/category",
            name: "Category",
            icon: <FaTags /> // Tags for category
        },
        {
            path: "/sellproduct",
            name: "Sell Product",
            icon: <FaShoppingCart /> // Cart for selling product
        },
        {
            path: "/reports",
            name: "Report",
            icon: <FaChartBar /> // Chart for reports
        },
        // {
        //     path: "/adduser",
        //     name: "Create User",
        //     icon: <FaUserPlus />
        // },
        // {
        //     path: "/resetpassword",
        //     name: "Reset Password",
        //     icon: <FaLock  />
        // },
        {
            path: "/",
            name: "Sign Out",
        },
    ];

    return (
        <>
            {isAuthenticated && location.pathname !== '/' && (
                <div style={{
                    display: location.pathname === "/reset-password" ? "none" : "flex"
                }}
                className="flex">
                
                {/* Sidebar */}
                <div className={`fixed top-0 left-0 bottom-0 bg-blueblack transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} text-white flex flex-col shadow-lg border-r border-gray-700 overflow-y-auto`}
                    style={{ backgroundColor: '#1c1c2e' }}>  
                    <div className="flex items-center bg-gray-80 p-4">
                        <h1 className={`${isOpen ? 'block' : 'hidden'} text-xl font-bold ml-2 mb-2 mt-2 text-blue-500`}>
                        Admin
                        </h1>
                        <div className="ml-auto text-2xl cursor-pointer mb-4 mt-2 pr-4 hover:bg-blue-400 rounded-full p-1 transition-colors duration-200" onClick={toggle}>
                            <FaBars />
                        </div>
                    </div>

                    {/* Menu Items */}
                    {menuItem.map((item, index) => (
                        <NavLink 
                            to={item.path} 
                            key={index} 
                            className="link flex items-center py-2 px-4 hover:bg-blue-600 transition-colors"
                            style={{ transition: 'background-color 0.3s' }}
                        >
                            <div className="icon text-xl text-gray-300 mb-4 mr-2">{item.icon}</div>
                            <div className={`link_text mb-4 ml-2 text-gray-400 text-xl mr-2 ${isOpen ? 'block' : 'hidden'}`}>{item.name}</div>
                        </NavLink>
                    ))}
                </div>

                {/* Main content */}
                <main className="ml-20 w-full p-6">
                    {children}
                </main>
                </div>
            )}
        </>
    );
}

export default AdminSidebar;
