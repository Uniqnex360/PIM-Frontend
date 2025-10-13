import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import './User.css';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useNavigate  } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { EllipsisVertical } from 'lucide-react';
import Swal from 'sweetalert2';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const User = ({ isSidebarOpen, toggleSidebar }) => {
  const [users, setUsers] = useState([]);
useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        toggleSidebar();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, toggleSidebar]);
  useEffect(() => {
    fetchUsers();
  }, []);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [sortAsc, setSortAsc] = useState(true);
  const [sortAscRole, setSortAscRole] = useState(true);
  const [sortAscUser, setSortAscUser] = useState(true);

  useEffect(() => {
    fetchsortOrder();
  }, [sortAsc]);
  useEffect(() => {
    fetchsortOrderRole();
  }, [sortAscRole]);
  useEffect(() => {
    fetchsortOrderUser();
  }, [sortAscUser]);

const fetchsortOrder = async () => {
    setLoading(true);
    try {
        const response = await axiosInstance.get(
            `${process.env.REACT_APP_IP}/obtainClientUser/?sort_by=is_active&sort=${sortAsc}&&search=`,
        );
        console.log('Sort order API Response:', response.data); // Debug log
        setUsers(response.data.user_list || []); // Remove the extra .data layer
    } catch (error) {
        console.error('Error fetching clients:', error);
    }
    setLoading(false);
};

const fetchsortOrderRole = async () => {
    setLoading(true);
    try {
        const response = await axiosInstance.get(
            `${process.env.REACT_APP_IP}/obtainClientUser/?sort_by=role&sort=${sortAscRole}&&search=`,
        );
        console.log('Sort order role API Response:', response.data); // Debug log
        setUsers(response.data.user_list || []); // Remove the extra .data layer
    } catch (error) {
        console.error('Error fetching clients:', error);
    }
    setLoading(false);
};


const fetchsortOrderUser = async () => {
    setLoading(true);
    try {
        const response = await axiosInstance.get(
            `${process.env.REACT_APP_IP}/obtainClientUser/?sort_by=user_name&&sort=${sortAscUser}&&search=`,
        );
        console.log('Sort order user API Response:', response.data); // Debug log
        setUsers(response.data.user_list || []); // Remove the extra .data layer
    } catch (error) {
        console.error('Error fetching clients:', error);
    }
    setLoading(false);
};


  const toggleSort = () => {
    setSortAsc((prev) => !prev);
  };
  
  const toggleSortRole = () => {
    setSortAscRole((prev) => !prev);
  };
  const toggleSortUser = () => {
    setSortAscUser((prev) => !prev);
  };
  const handleThreeDotClick = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right - 160, // adjust for dropdown width
    });
    setActiveMenuIndex(index);
  };
  // Close menu when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setActiveMenuIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  
  const userRole = localStorage.getItem('user_role');
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


const fetchUsers = async (searchQuery = "") => {
    setLoading(true);
    try {
        const endpoint =
            userRole === 'admin'
                ? 'obtainClientUser'
                : userRole === 'superadmin'
                ? 'obtainClientForAdmin'
                : null;

        if (!endpoint) {
            console.warn("Unknown user role, cannot fetch data.");
            setLoading(false);
            return;
        }
 const response = await axiosInstance.get(
            `${process.env.REACT_APP_IP}/${endpoint}/`,
            {
                params: {
                    search: searchQuery,
                },
            }
        );
        console.log('Fetch users API Response:', response.data); // Debug log
        
        if (response.status === 401) {
            setUnauthorized(true);
        } 
        
        const userData =  
     userRole === 'admin'
                ? response?.data?.user_list // Remove the extra .data layer
                : response?.data?.client_list; // Remove the extra .data layer

        setUsers(userData || []);
        setLoading(false);
    } catch (error) {
        setLoading(false);
        if (error.response?.status === 401) { // Use error.response?.status instead of error.status
            setUnauthorized(true);
        }
        console.error("Error fetching users", error);
    }
};
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
  const handleSearchClear = () => {
    setSearchQuery(""); // Clear the search query
    fetchUsers(""); // Fetch all users again
  };
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchUsers(query); // Trigger API call with the updated search query
  };
  
  const handleAddUser = async () => {
      navigate('/Admin/addUser'); // This should match your routing path
  };
  const handleEdit = (user) => {
    navigate(`/Admin/updateUser/${user.id}`); // This should match your routing path

  };

 const handleToggleStatus = async(user) => {
    const dataToSend = {
        is_active: !user.is_active, // Toggle the is_active status
        id: user.id, // Send the vendorId as a separate field
    };
    let update_obj = { update_obj: dataToSend };
    try {
        const response = await axiosInstance.post(
            `${process.env.REACT_APP_IP}/updateClientUser/`,
            update_obj,
            {
                headers: {
                    'Content-Type': 'application/json', // Ensuring the data is sent as JSON
                },
            }
        );
        console.log('Toggle status API Response:', response.data); // Debug log
        
        if (response.status === 200 || response.status === 201) {
            fetchUsers(""); // Fetch all users again
            Swal.fire('Success!', 'User status updated successfully.', 'success').then(() => {
                navigate('/Admin/users');
            });
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        Swal.fire('Error!', 'Failed to update a user status. Please try again.', 'error');
    }
};
  return (
    <div>
    {loading && (
      <div className="loader-overlay">
        <div className="spinner"></div> {/* Custom spinner */}
      </div>
    )}
    <div className="User-management-container">
      <div className="brand-header">
      <div className="brand-header-info" style={{marginTop:'2px'}}>
          <h1 className="user-title"> {userRole === 'admin' ? 'User Management' : userRole === 'superadmin' ? 'Client Management' : ''} </h1>
          {/* <div className="brand-count-container">
            <span className="total-brands-text">Total Brands:</span>
            <span className="brand-count">{brandCount}</span>
          </div> */}
        </div>
        <div className="button-row-user">
        <div className="search-input-container-brand" style={{ paddingRight:'15px',marginTop: '21px', }}>
              <input
                type="text"
                autoComplete="off"
                placeholder={userRole === 'admin' ? 'Search Users' : userRole === 'superadmin' ? 'Search Clients' : 'Search'}
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  width:'50px',
                  paddingRight: '30px',  // Give space on the right side for the icon
                  width: '100%',         // Make input field full width
                }}
              />
              {searchQuery.length > 0 && (
               <CloseIcon
                onClick={handleSearchClear}
                style={{ cursor: 'pointer',color:'grey',fontSize:'21px',right: '20px',  }}
              /> )}
   {searchQuery.length === 0 && (
              <SearchIcon 
                style={{
                  position: 'absolute',
                  right: '20px',         // Position the icon on the right side
                  top: '50%',
                  transform: 'translateY(-50%)',  // Center vertically
                  cursor: 'pointer',    // Show pointer cursor
                  color: '#888'          // Icon color (optional)
                }}
              /> )}
            </div>
            <div className="brand-actions-container" style={{margin:'20px 0px 0px 0px'}}>
  <div className="button-row">
  <button
    className="add-product-btn-container import-btn"
    onClick={() =>
      userRole === 'admin'
        ? handleAddUser()
        : navigate('/Admin/addClientUser') // Superadmin route
    }
  >
    <AddOutlinedIcon style={{ cursor: 'pointer' }} className="add-product-btn" />
    <span className="button-text" style={{ width: '63px' }}>
      {userRole === 'admin' ? 'Add User' : 'Add Client'}
    </span>
  </button>
    {/* <div className="count-vendor" style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
      <span className="total-brands-text" style={{ marginRight: '5px' }}>Total Brands:</span>
      <span className="brand-count">{brandCount}</span>
    </div> */}
  </div>
</div>
</div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      {userRole === 'admin' ? (
  // Admin Table
  <table className="min-w-full text-sm text-left whitespace-nowrap">
    <thead className="bg-gray-100 text-gray-700 font-medium">
      <tr>
        <th className="p-4 cursor-pointer select-none flex items-center gap-1" onClick={toggleSortUser}>
                    <div className="flex items-center gap-1">
                      User Name
                      {sortAscUser ? <FaArrowUp size={14} style={{margin:'0px 0px 2px 5px', verticalAlign:'text-bottom'}}/> : <FaArrowDown size={14} style={{margin:'0px 0px 2px 5px', verticalAlign:'text-bottom'}} />}
                    </div>
                  </th>
        <th className="p-4">Email</th>
        <th className="p-4">Phone</th>
        <th className="p-4 cursor-pointer select-none flex items-center gap-1" onClick={toggleSortRole}>
                    <div className="flex items-center gap-1">
                      Role Access
                      {sortAscRole ? <FaArrowUp size={14} style={{margin:'0px 0px 2px 5px', verticalAlign:'text-bottom'}}/> : <FaArrowDown size={14} style={{margin:'0px 0px 2px 5px', verticalAlign:'text-bottom'}} />}
                    </div>
                  </th>
        <th className="p-4 cursor-pointer select-none flex items-center gap-1" onClick={toggleSort}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortAsc ? <FaArrowUp size={14} style={{margin:'0px 0px 2px 5px', verticalAlign:'text-bottom'}}/> : <FaArrowDown size={14} style={{margin:'0px 0px 2px 5px', verticalAlign:'text-bottom'}} />}
                    </div>
                  </th>
        <th className="p-4">Added By</th>
        <th className="p-4">Date Added</th>
        <th className="p-4 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {users?.map((user, index) => (
        <tr key={index} className="border-t">
          <td className="p-4"  onClick={() => handleEdit(user)} style={{cursor:'pointer'}} >{user.user_name}</td>
          <td className="p-4 text-blue-600"  onClick={() => handleEdit(user)} style={{cursor:'pointer'}} >{user.email || 'N/A'}</td>
          <td className="p-4"  onClick={() => handleEdit(user)} style={{cursor:'pointer'}} >{user.phone || 'N/A'}</td>
          <td className="p-4">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                user.role === "Client-admin"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
              onClick={() => handleEdit(user)} style={{cursor:'pointer'}} >
              {user.role}
            </span>
          </td>
          <td className="p-4">{user.is_active ? "Active" : "Inactive"}</td>
          <td className="p-4">{user.added_by || 'N/A'}</td>
          <td className="p-4">{user.last_updated || 'N/A'}</td>
          <td className="p-4">
                <button
                  className="three-dot-button"
                  onClick={(e) => handleThreeDotClick(e, index)}
                >
                  <EllipsisVertical className="text-gray-500" size={18} />
                </button>
              </td>
        </tr>
      ))}
      {users.length === 0 && (
        <tr>
          <td colSpan="7" className="text-center p-4 text-gray-400">
            {loading ? 'Loading users...' : 'No users found'}
          </td>
        </tr>
      )}
    </tbody>
  </table>
) : userRole === 'superadmin' ? (
  // Superadmin Table
  <table className="min-w-full text-sm text-left whitespace-nowrap">
    <thead className="bg-gray-100 text-gray-700 font-medium">
      <tr>
        <th className="p-4">Logo</th>
        <th className="p-4">Client Name</th>
        <th className="p-4">Location</th>
      </tr>
    </thead>
    <tbody>
      {users?.map((user, index) => (
        <tr key={index} className="border-t">
          <td className="p-4">
          <img
              src={user.logo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOBl1B_Kz4RdrOR6_WgaITKDcS10PGoL7jVA&s'}
              alt={`${user.name} Logo`}
              className="brand-logo-image"
            />
          </td>
          <td className="p-4 text-blue-600">{user.name}</td>
          <td className="p-4">{user.location || 'N/A'}</td>
        </tr>
      ))}
      {users.length === 0 && (
        <tr>
          <td colSpan="4" className="text-center p-4 text-gray-400">
            {loading ? 'Loading clients...' : 'No clients found'}
          </td>
        </tr>
      )}
    </tbody>
  </table>
) : null}
{activeMenuIndex !== null && (
        <div
          ref={dropdownRef}
          className="dropdown-menu"
          style={{
            position: "fixed",
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <button
            onClick={() => {
              handleEdit(users[activeMenuIndex]);
              setActiveMenuIndex(null);
            }}
            className="dropdown-button"
          >
            Edit
          </button>
          <button
            onClick={() => {
              handleToggleStatus(users[activeMenuIndex]);
              setActiveMenuIndex(null);
            }}
            className="dropdown-button"
          >
            {users[activeMenuIndex]?.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      )}
      </div>
    </div>
    </div>
  );
};

export default User;
