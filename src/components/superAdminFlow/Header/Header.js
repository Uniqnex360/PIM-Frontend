// // Header.js
// import React from "react";
// import "./Header.css";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// const Header = ({ toggleSidebar }) => {
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/';
//   };

//   return (
//     <header className="header">
//       <div className="header-left">
//         <button className="toggle-sidebar" onClick={toggleSidebar}>
//           <FontAwesomeIcon icon={faBars} />
//         </button>
//         <div className="logo">
//           <h2 style={{margin:'8px',width:'100%'}}>PIM Tool</h2></div>
//       </div>
//       <div className="header-right">
//         {/* <button className="logout-button" onClick={handleLogout}>
//           <FontAwesomeIcon icon={faSignOutAlt} /> Logout
//         </button> */}
//       </div>
//     </header>
//   );
// };
// export default Header;

// Header.js
import React, { useState } from "react";
import "./Header.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemText,
  ListItemIcon
} from '@mui/material'; // Import necessary Material-UI components
import { Notifications, AccountCircle, CreditCard, HelpOutline, ExitToApp } from '@mui/icons-material'; // Icon imports

const Header = ({ toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null); // For profile menu
  const [open, setOpen] = useState(false);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const userName = localStorage.getItem("user_name") || "";
  const firstLetter = userName.charAt(0).toUpperCase();
  const accentColor = '#9758d3'; // Example color for AppBar

  return (
    <AppBar position="fixed" sx={{ backgroundColor: accentColor, zIndex: 1201, minHeight:'57px',    height: '57px' }}>
      <Toolbar>
        {/* Sidebar Toggle Button */}
        <IconButton edge="start" color="inherit" aria-label="menu">
          <div className="header-left">
            <button className="toggle-sidebar menuiconhere" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faBars} />
            </button>
         
          </div>
        </IconButton>
        <div className="logo">
              <h2 style={{ margin: '8px 8px 15px 8px', color:'#121212', fontSize:'23px', width: '100%' }}>PIM Tool</h2>
            </div>
       
        {/* Right-Aligned Box */}
        <Box sx={{ display: "flex",     marginBottom: '5px',alignItems: "center", justifyContent: "flex-end", width: '100%' }}>
          {/* Notification Icon */}
      

          {/* Profile Section */}
          <List sx={{ display: "flex", alignItems: "center", marginLeft: 2 }}>


          <ListItem sx={{ display: "flex", alignItems: "center", padding: 0 }}>
            {/* <Notifications sx={{ fontSize: 28, color: "#121212" }} /> */}
          </ListItem>
            <ListItem
              button
              onClick={handleProfileClick}
              sx={{
                flexDirection: "column",
                alignItems: "center",
                padding: "10px",
                margin:'0px 0px 2px 0px'
              }}
            >
              <Avatar sx={{ bgcolor: "white", color: "#923be3" }}> {firstLetter}</Avatar>
            </ListItem>
          </List>
        </Box>
      </Toolbar>

      {/* Profile Dropdown Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} sx={{ mt: 1 }}>
     
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
       
      </Menu>
    </AppBar>
  );
};

export default Header;
