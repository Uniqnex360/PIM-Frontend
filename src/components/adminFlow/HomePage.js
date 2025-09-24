import React, { useState } from 'react';
import { useParams, Routes, Route, useNavigate  } from 'react-router-dom';
import './HomePage.css';
import Sidebar from './sidebar/Sidebar';
import Header from '../Header/Header.js';
import Footer from '../Footer/Footer.js';
import Dashboard from './dashboard/Dashboard';
import BrandList from './brand/BrandList.js';
import VendorList from './vendor/VendorList.js';
import BrandDetail from './brand/BrandDetail.js';
import VendorDetail from './vendor/VendorDetail.js';
import CategoryList from './category/CategoryList.js';
import ProductList from './product/ProductList.js';
import CreateProduct from './product/CreateProduct.js';
import ProductDetail from './product/ProductDetail.js';
import Attribute from './attribute/Attribute.js';
import AddVendor from './vendor/AddVendor.js';
import AddBrand from './brand/AddBrand.js';
import CategoryDetail from './category/CategoryDetail.js';
import AddAttribute from './attribute/AddAttribute.js';
import VariantList from './variants/VariantList.js';
import Dam from './dam/Dam.js';
import AdditionalPage from './product/AdditionalPage.js';
import Channel from './channel/Channel.js';
import ChannelDetail from './channel/ChannelDetail.js';
import Logs from './log/Logs.js';
import User from './user/User.js';
import AddUser from './user/AddUser.js';
import AddClientUser from './user/AddClientUser.js';
import UpdateUser from './user/UpdateUser.js';

function HomePage() {
  const { brandId } = useParams();  // This will capture the dynamic brandId
  const { vendorId } = useParams(); 
  const { productId } = useParams(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [routeKey, setRouteKey] = useState(0);  // Key to force re-mount of components
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const handleNavigate = (path) => {
    // Update the key to force a re-render
    setRouteKey((prevKey) => prevKey + 1);
    navigate(path);
  };
  return (
    <div className="home-container">
      <Header toggleSidebar={toggleSidebar}  />
      <div className="main-container">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} handleNavigate={handleNavigate} />
        <div className={`right-container ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
          <Routes>
            <Route path="/" element={<Dashboard isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/brands" element={<BrandList  isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/brands/add" element={<AddBrand isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
            <Route path="/brand/:brandId" element={<BrandDetail brandId={brandId} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/vendors" element={<VendorList isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/vendors/add" element={<AddVendor isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/vendor/:vendorId" element={<VendorDetail vendorId={vendorId} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/categories" element={<CategoryList isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/variants" element={<VariantList isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/category/edit/:id" element={<CategoryDetail />} />
            <Route path="/products" element={<ProductList key={routeKey} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/products/add" element= {<CreateProduct isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/products/add/additionalinformation/:productId" element={<AdditionalPage productId={productId}  isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path='/product/:productId' element = {<ProductDetail productId={productId}  isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/attributes" element={<Attribute isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="/attribute/add" element={<AddAttribute isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="dam" element={<Dam isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="channel" element={<Channel isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="channeldetail/:channelName" element={<ChannelDetail isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="logs" element={<Logs isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="users" element={<User isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="addUser" element={<AddUser isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="addClientUser" element={<AddClientUser isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="updateUser/:userId" element={<UpdateUser isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
