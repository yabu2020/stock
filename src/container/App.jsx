import { useState,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Reset from "../Reset";
import Userpage from "../user/Userpage";
import Department from "../admin/Department";
import Resetpassword from "../admin/Resetpassword";
import Createuser from '../admin/Createuser';
import UsersList from '../admin/UsersList';
import Login from "../Login";
import AdminSidebar from '../admin/AdminSidebar'; 
import ProductList from '../admin/ProductList'; 
import RegisterProduct from '../admin/RegisterProduct'; 
import Category from '../admin/Category';
import ProductSold from '../admin/ProductSold';
import Report from '../admin/Report';
import Order from '../admin/Order';
import TransferAsset from "../admin/TransferAsset";
import Security from '../user/Security';
import UserContext from '../admin/UserContext';

function App() {
  const [cUSer, setCuser] = useState({});
  const [users, setUsers] = useState([]);
  const renderSidebar = () => {
    if (!cUSer || !cUSer.role) {
      return null; // Or return some default component or placeholder if necessary
    }
    if (cUSer.role === 'Admin') {
      return <AdminSidebar />;
    // } else if (cUSer.role === 'Clerk') {
    //   return <ClerkSidebar />;
    // } else if (cUSer.role === 'asset approver') {
    //   return <ApproverSidebar />;
    }
    return null;
  };
  useEffect(() => {
    // Check for user data in local storage
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      setCuser(storedUser);
    }
  }, []);
  return (
    <UserContext.Provider value={{ cUSer, setCuser }}>
      <BrowserRouter>
        {renderSidebar()}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Login setCuser={setCuser} />} />  
            <Route path="/reset-password" element={<Reset />} />
            {/* <Route path="/admin" element={<AdminSidebar cUSer={cUSer} />} /> */}
            <Route path="/users" element={<UsersList users={users} />} />
            <Route path="/department" element={<Department />} />
            <Route path="/adduser" element={<Createuser setUsers={setUsers} />} />
            <Route path="/resetpassword" element={<Resetpassword />} />
            {/* Admin */}
            <Route path="/admin/:userId" element={<AdminSidebar cUSer={cUSer} />} />
            <Route path="/productlist" element={<ProductList />} /> 
            <Route path="/registerproduct" element={<RegisterProduct />} />
            <Route path="/category" element={<Category />} />
            <Route path="/sellproduct" element={<ProductSold />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/order" element={<Order />} />
            <Route path="/transferasset" element={<TransferAsset />} />
            {/* user */}
            <Route path="/userpage/:userId" element={<Userpage />} />
            <Route path="/security-question/:userId" element={<Security />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
