import React, { useEffect } from 'react';
import './Channel.css'; // Create your own styling for the card layout
import { useNavigate } from 'react-router-dom'; // To navigate to different routes
import amazonLogo from '../../../assets/Amazon.png'; // Add your Amazon logo here
import shopifyLogo from '../../../assets/Shopify.jpg'; // Add your Shopify logo here
import bigcommerceLogo from '../../../assets/Bigcommerce.jpg';

const Channel = ({ isSidebarOpen, toggleSidebar }) => {
   useEffect(() => {
          if (isSidebarOpen) {
            const timer = setTimeout(() => {
              toggleSidebar();  // Close the sidebar after 10 seconds
            }, 2000);  // 10 seconds timeout
      
            // Cleanup the timer if the component is unmounted before the timer ends
            return () => clearTimeout(timer);
          }
        }, [isSidebarOpen, toggleSidebar]);
  const navigate = useNavigate(); // Using navigate from react-router-dom for navigation

  const handleViewChannel = (channel) => {
    // Navigate to the dynamic route for the selected channel
    navigate(`/admin/channeldetail/${channel}`);
  };


  return (
    <div className="channel-container">
      <h1 className="channel-header" style={{textAlign:'left', fontSize:'21px'}}>Channels</h1> {/* Add a header for the page */}
      
      <div className="card-container">
        {/* Amazon Card */}
        <div className="channel-card">
          <div className="logo-container">
            <img src={amazonLogo} alt="Amazon Logo" className="logos" />
          </div>
          <div className="channel-title">Amazon</div>
          {/* <div className="channel-description">Sell your products on Amazon with a global audience.</div> */}
          <button className="btn" onClick={() => handleViewChannel('amazon')}>View</button>
        </div>

        {/* Shopify Card */}
        <div className="channel-card">
          <div className="logo-container">
            <img src={shopifyLogo} alt="Shopify Logo" className="logos" />
          </div>
          <div className="channel-title">Shopify</div>
          {/* <div className="channel-description">Build your online store with Shopify and reach customers worldwide.</div> */}
          <button className="btn" onClick={() => handleViewChannel('shopify')}>View</button>
        </div>
        <div className="channel-card">
      <div className="logo-container">
        <img src={bigcommerceLogo} alt="BigCommerce Logo" className="logos" />
      </div>
      <div className="channel-title">BigCommerce</div> {/* Update the title to BigCommerce */}
      {/* <div className="channel-description">Build and scale your online business with BigCommerce.</div>  */}
      <button className="btn" onClick={() => handleViewChannel('bigcommerce')}>View</button>
    </div>
      </div>
    </div>
  );
};

export default Channel;
