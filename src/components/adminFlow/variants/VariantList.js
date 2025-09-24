import React, { useEffect } from 'react';
import './VariantList.css'; // Optional: if you want to style this page

const VariantList = ({ isSidebarOpen, toggleSidebar }) => {
   useEffect(() => {
        if (isSidebarOpen) {
          const timer = setTimeout(() => {
            toggleSidebar();  // Close the sidebar after 10 seconds
          }, 2000);  // 10 seconds timeout
    
          // Cleanup the timer if the component is unmounted before the timer ends
          return () => clearTimeout(timer);
        }
      }, [isSidebarOpen, toggleSidebar]);
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-message">
        <h1>Coming Soon</h1>
        <p>We're working on something exciting! Stay tuned for updates.</p>
        <p>Make sure to check back later for more info.</p>
      </div>
    </div>
  );
};

export default VariantList;
