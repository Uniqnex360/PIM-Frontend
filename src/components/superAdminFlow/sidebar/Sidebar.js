
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
import PeopleIcon from "@mui/icons-material/People";
import LanguageIcon from '@mui/icons-material/Language';
import HistoryIcon from "@mui/icons-material/History";
import PermMediaIcon from '@mui/icons-material/PermMedia';
import { Dashboard, ShoppingCart, Contacts, Settings ,Person} from "@mui/icons-material";
const Sidebar = ({ isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeColor = "#923be3"; // White color for text & icon when active
  const defaultColor = "#121212"; // Default icon & text color
  // const bgHighlight = "#923be3"; // Background highlight color for active item

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/SuperAdmin" },
    { text: "User", icon: <PeopleIcon />, path: "/SuperAdmin/users" },

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
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between", // Push Sign Out to bottom
          height: "100vh", // Full height for the drawer
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List
          sx={{
            paddingTop: "64px",
            paddingLeft: "6px",
            paddingRight: "2px",
            paddingBottom: "293px",
            flexGrow: 1,
          }}
        >
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ marginBottom: "7px" }}>
                <Tooltip title={item.text} placement="right" arrow>
                  <ListItemButton onClick={() => handleMenuClick(item.path)}>
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
              marginBottom: "10px",
            }}
          >
            <ListItemIcon sx={{ maxWidth: "10px", paddingLeft: "10px" }}>
              <FontAwesomeIcon
                icon={faSignOutAlt}
                size="lg"
                style={{ color: defaultColor }}
              />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Sign Out" sx={{ color: defaultColor }} />}
          </ListItemButton>
        </Tooltip>
      </div>
    </Drawer>
  );
  
};

export default Sidebar;
