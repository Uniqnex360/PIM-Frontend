// import React, { useState } from 'react';
// import './Sidebar.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faStore, faBriefcase,faList, faColumns, faListAlt, faCogs, faBox, faDatabase, faShapes, faSignOutAlt, faBroadcastTower } from '@fortawesome/free-solid-svg-icons';
// import { useNavigate } from 'react-router-dom';

// const Sidebar = ({ isSidebarOpen, toggleSidebar, handleNavigate }) => {
//   const [collapsed, setCollapsed] = useState({
//     dashboard: false,
//     vendors: false,
//     brands: false,
//     categories: false,
//     variants: false,
//     products: false
//   });

//   const navigate = useNavigate();

//   const handleMenuClick = (menu, path) => {    
//     setCollapsed(prevState => ({
//       ...prevState,
//       [menu]: !prevState[menu]
//     }));
//     // Collapse the sidebar after clicking a menu item
//     toggleSidebar();
//     if (path === '/Admin/products') {
//       handleNavigate(path);  // Trigger the navigate function passed from HomePage
//     } 
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/';
//   };

//   return (
//     <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
//       <ul className="menu">
//         <li onClick={() => { handleMenuClick('dashboard'); navigate('/Admin'); }}>
//           <FontAwesomeIcon icon={faColumns} className="icon" />
//           {isSidebarOpen && <span className="menu-text">Dashboard</span>}
//           <span className="hover-text">Dashboard</span>
//         </li>
//         <li onClick={() => { handleMenuClick('vendors'); navigate('/Admin/vendors'); }}>
//           <FontAwesomeIcon icon={faStore} className="icon" />
//           {isSidebarOpen && <span className="menu-text">Suppliers</span>}
//           <span className="hover-text vendorht">Suppliers</span>
//         </li>
//         <li onClick={() => { handleMenuClick('brands'); navigate('/Admin/brands'); }}>
//           <FontAwesomeIcon icon={faBriefcase} className="icon" />
//           {isSidebarOpen && <span className="menu-text">Brands</span>}
//           <span className="hover-text brandht">Brands</span>
//         </li>
//         <li onClick={() => { handleMenuClick('categories'); navigate('/Admin/categories'); }}>
//           <FontAwesomeIcon icon={faListAlt} className="icon" />
//           {isSidebarOpen && <span className="menu-text"> Categories</span>}
//           <span className="hover-text categoryht"> Categories</span>
//         </li>
//         <li onClick={() => { handleMenuClick('attribute'); navigate('/Admin/attributes'); }}>
//           <FontAwesomeIcon icon={faCogs} className="icon" />
//           {isSidebarOpen && <span className="menu-text">  Attributes </span>}
//           <span className="hover-text attributeht">  Attributes </span>
//         </li>
//         <li onClick={() => { handleMenuClick('products', '/Admin/products')}
//           //  window.location.reload(); 
//            }>
//           <FontAwesomeIcon icon={faBox} className="icon" />
//           {isSidebarOpen && <span className="menu-text">Products</span>}
//           <span className="hover-text productht">Products</span>
//         </li>
//         <li onClick={() => { handleMenuClick('dam'); navigate('/Admin/dam'); }}>
//           <FontAwesomeIcon icon={faDatabase} className="icon" />
//           {isSidebarOpen && <span className="menu-text"> Assets</span>}
//           <span className="hover-text damht"> Assets</span>
//         </li>
//         <li onClick={() => { handleMenuClick('channel'); navigate('/Admin/channel'); }}>
//           <FontAwesomeIcon icon={faBroadcastTower} className="icon" />
//           {isSidebarOpen && <span className="menu-text">Channels</span>}
//           <span className="hover-text channelht">Channels</span>
//         </li>
//         <li onClick={() => { handleMenuClick('logs'); navigate('/Admin/logs'); }}>
//           <FontAwesomeIcon icon={faList} className="icon" />
//           {isSidebarOpen && <span className="menu-text">Logs</span>}
//           <span className="hover-text logsht">Logs</span>
//         </li>

     
//         {/* <li onClick={() => { handleMenuClick('variants'); navigate('/Admin/variants'); }}>
//           <FontAwesomeIcon icon={faShapes} className="icon" />
//           {isSidebarOpen && <span className="menu-text">Variants</span>}
//           <span className="hover-text variantsht">Variants</span>
//         </li> */}
//       </ul>

//       {/* Logout button at the end of the sidebar */}
//       <div className="logout-section">
//         <button className="logout-button" onClick={handleLogout}>
//           <FontAwesomeIcon icon={faSignOutAlt} className="icon" />
//           {isSidebarOpen && <span className="menu-text"> Sign Out</span>}
//           <span className="hover-text logoutht"> Sign Out</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StoreIcon from "@mui/icons-material/Store";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TuneIcon from "@mui/icons-material/Tune";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import LanguageIcon from '@mui/icons-material/Language';
import HistoryIcon from "@mui/icons-material/History";
import CloudSyncIcon from '@mui/icons-material/Sync';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import { faStore, faBriefcase,faList, faColumns, faListAlt, faCogs, faBox, faDatabase, faShapes,  faBroadcastTower } from '@fortawesome/free-solid-svg-icons';
import WaterIcon from '@mui/icons-material/Water';
import StorageIcon from '@mui/icons-material/Storage';
import { Dashboard, ShoppingCart, Contacts, Settings ,Person} from "@mui/icons-material";
const Sidebar = ({ isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeColor = "#923be3"; // White color for text & icon when active
  const defaultColor = "#121212"; // Default icon & text color
  // const bgHighlight = "#923be3"; // Background highlight color for active item

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/Admin" },
    { text: "Suppliers", icon: <StoreIcon />, path: "/Admin/vendors" },
    { text: "Brands", icon: <BusinessIcon />, path: "/Admin/brands" },
    { text: "Categories", icon: <AccountTreeIcon />, path: "/Admin/categories" },
    // { text: "Attributes", icon: <TuneIcon />, path: "/Admin/attributes" },
    { text: "Attributes", icon:   <CategoryIcon/>, path: "/Admin/attributes" },

    { text: "Products", icon: <ShoppingCart />, path: "/Admin/products" },
    // { text: "Assets", icon: <StorageIcon />, path: "/Admin/dam" },
    { 
      text: "Assets", 
      icon: <PermMediaIcon />, 
      path: "/Admin/dam" 
    },
    
    { text: "Channels", icon: <LanguageIcon />, path: "/Admin/channel" },
    { text: "Logs", icon: <HistoryIcon />, path: "/Admin/logs" },
    { text: "User", icon: <PeopleIcon />, path: "/Admin/users" },

  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <Drawer
      variant="permanent"
      open={isSidebarOpen}
      sx={{
        width: isSidebarOpen ? 240 : 80,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isSidebarOpen ? 240 : 80,
          transition: "width 0.3s",
          overflowX: "hidden",
          paddingTop: "10px",
          overflowX: "overlay",
          backgroundColor: "#f8f9fa", // Sidebar Background Color
          "&::-webkit-scrollbar": {
            height: "2px",
            width: "2px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "10px",
          },
        },
      }}
    >
      <List sx={{ paddingTop: "64px", paddingLeft: "6px", paddingRight: "2px" }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ marginBottom: "7px" }}>
              <Tooltip title={item.text} placement="right" arrow>
                <ListItemButton
                  onClick={() => handleMenuClick(item.path)}
               
                >
                  <ListItemIcon sx={{ minWidth: "50px" }}>
                    {React.isValidElement(item.icon) ? (
                      React.cloneElement(item.icon, {
                        style: { color: isActive ? activeColor : defaultColor },
                      })
                    ) : (
                      <FontAwesomeIcon
                        icon={item.icon}
                        size="lg"
                        style={{ color: isActive ? activeColor : defaultColor }}
                      />
                    )}
                  </ListItemIcon>
                  {isSidebarOpen && (
                    <ListItemText
                      primary={item.text}
                      sx={{ color: isActive ? activeColor : defaultColor }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      <Tooltip title="Sign Out" placement="right" arrow>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            marginTop: "auto",
            marginBottom: "10px",
          }}
        >
          <ListItemIcon sx={{ minWidth: "50px", paddingLeft: "10px" }}>
            <FontAwesomeIcon
              icon={faSignOutAlt}
              size="lg"
              style={{ color: defaultColor }}
            />
          </ListItemIcon>
          {isSidebarOpen && <ListItemText primary="Sign Out" sx={{ color: defaultColor }} />}
        </ListItemButton>
      </Tooltip>
    </Drawer>
  );
};

export default Sidebar;
