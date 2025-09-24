// File: UpdateClientUser.jsx

import React, { useEffect, useState,useRef  } from "react";
import { useParams, useNavigate  } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../../utils/axiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft,faEdit } from '@fortawesome/free-solid-svg-icons';
import './UpdateClientUser.css';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import validator from 'validator';
import { FaBox, FaTags, FaUserTie, FaSitemap } from "react-icons/fa";
import SearchIcon from '@mui/icons-material/Search';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { EllipsisVertical } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import AddUser from './AddUser';
import UpdateUser from "./UpdateUser";
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
const UpdateClientUser = ({ isSidebarOpen, toggleSidebar }) => {
   const [form, setForm] = useState({
      name: '',
      location: '',
      designation: '',
      is_active: true, // true = Active, false = Inactive
      website_url: '',
      logo: null,
    });

  const navigate = useNavigate();
  const { userId } = useParams();  // Get the userId from the URL
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [isEditingWebsite, setIsEditingWebsite] = useState(false); // State to toggle between view and edit mode for website
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [userData, setUserData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left:0 });
  const dropdownRef = useRef(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUpdateUserModal, setShowUpdateUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
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
        `${process.env.REACT_APP_IP}/obtainClientuserForAdmin/?sort_by=is_active&sort=${sortAsc}&&client_id=${userId}&&search=`,
      );
      setUserData(response.data.data.user_list || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
    setLoading(false);
  };
  const fetchsortOrderRole = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${process.env.REACT_APP_IP}/obtainClientuserForAdmin/?sort_by=role&sort=${sortAscRole}&&client_id=${userId}&&search=`,
      );
      setUserData(response.data.data.user_list || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
    setLoading(false);
  };
  const fetchsortOrderUser = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${process.env.REACT_APP_IP}/obtainClientuserForAdmin/?sort_by=user_name&&sort=${sortAscUser}&&client_id=${userId}&&search=`,
      );
      setUserData(response.data.data.user_list || []);
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
  const TabButton = ({ tabId, label }) => (
    <button
      className={`tab-button-client ${activeTab === tabId ? 'active-tab-client' : ''}`}
      onClick={() => {
        setActiveTab(tabId);
        setIsEditing(false);
      }}
    >
      {label}
    </button>
  );
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const fetchDashboard = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainClientWiseDetailsForAdmin/?id=${userId}`);
          setDashboardData(response.data.data.data);
          setLoading(false);
          console.log("Dashboard API Response:", response.data.data.data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        }
      };
  
      fetchDashboard();
    }
  }, [activeTab, form.client_id]);
  const fetchUser = async (searchQuery = "") => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${process.env.REACT_APP_IP}/obtainClientuserForAdmin/`,
        {
          params: {
            client_id: userId,
            search: searchQuery,
          },
        }
      );
      setLoading(false);
      setUserData(response.data.data.user_list);
      console.log("Dashboard API Response:", response.data.data.user_list);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching dashboard data:', error);
    }
  };
  
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUser(); // Trigger API call on mount or tab change
    }
  }, [activeTab, form.client_id]);
  
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchUser(query); // Trigger API call with updated query
  };
  const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuIndex(null);
      }
    };
  
    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        toggleSidebar();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, toggleSidebar]);

  const handleSearchClear = () => {
    setSearchQuery('');
    fetchUser('');
  };
const handleCloseUser = () => {
  setShowAddUserModal(false);
  fetchUser(); // Refresh the user list after closing the modal
};
const handleCloseUserUpdate = () => {
  setShowUpdateUserModal(false);
  fetchUser(); // Refresh the user list after closing the modal
};
  const handleAddUser = () => {
    console.log(showAddUserModal,'showAddUserModal');
    setShowAddUserModal(true);
    console.log('Add user clicked');
  };

  const handleUpdateUser = (user) => {
    console.log('Edit user:', user);
    // Navigate or open modal
    setSelectedUserId(user); // Set the selected user ID
    console.log(showUpdateUserModal,'showAddUserModal');
    setShowUpdateUserModal(true);
  };
  const handleUpdateUsertoggle = (user) => {
    console.log('Edit user:', user);
    // Navigate or open modal
    setSelectedUserId(user.id); // Set the selected user ID
    console.log(showUpdateUserModal,'showAddUserModal');
    setShowUpdateUserModal(true);
  };
  const handleThreeDotClick = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setActiveMenuIndex(index);
  };

  const handleToggleStatusUser = () => {
    // Call your API to activate/deactivate
    setForm((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };
  useEffect(() => {
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainClientForAdmin/?id=${userId}&&search=`);
        if (response.data && response.data.data) {            
          const userData = response.data.data.client_list[0];  
          setForm({
            logo: userData.logo,
            website_url: userData.website_url,
            designation: userData.designation,
            is_active: userData.is_active,
            location: userData.location,
            name: userData.name,
          });          
        }
        if (response.status === 401) {
          setUnauthorized(true);
        } 
        setLoading(false);
      } catch (error) {
        if (error.status === 401) {
          setUnauthorized(true);
        }
        setLoading(false);
        console.error('Error fetching vendor data:', error);
      }
    };

    fetchUserData();
  }, [userId]);
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
  const handleSubmit = async () => {
    const {name } = form;
    if (!name) {
      Swal.fire('Error!', 'Please fill all required fields', 'error');
      return;
    }
    const dataToSend = {
        ...form,
        id: userId, // Send the vendorId as a separate field

      };
    let update_obj = { update_obj: dataToSend };
    try {
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_IP}/updateClient/`,
        update_obj,
        {
            headers: {
              'Content-Type': 'application/json', // Ensuring the data is sent as JSON
            },
          }
      );
      if (response.status === 200 || response.status === 201) {
        Swal.fire('Success!', 'Client updated successfully!', 'success').then(() => {
          navigate('/SuperAdmin/users');
        });
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to create user. Please try again.', 'error');
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    if (file) {
      // Create a FormData object to send the file as part of a POST request
      const formDataToSend = new FormData();
      formDataToSend.append('logo', file);  // Append file to FormData

      try {
        // Make the API request to upload the logo
        const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/brandUpdateLogo/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Assuming the response contains the updated logo URL or base64 string
        const updatedLogo = response.data.data.logo;  // Modify this based on the actual response structure
        if ( response.data.data.is_updated === true) {
        // Update the formData with the new logo (this can be base64 string or URL from API)
        setForm((prev) => ({
          ...prev,
          logo: updatedLogo,  // The updated logo from API response
        }));
        setLoading(false);
        }
        
        // Optionally, you can display a success message here
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Error uploading logo.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
  };
  const maxLength = 50;
 // Function to render website
 const renderWebsite = () => {
  
   let isValidUrl = false;
   let truncatedWebsite = form.website_url || "";
   // Ensure the URL starts with https:// if missing
   if (truncatedWebsite && !/^https?:\/\//i.test(truncatedWebsite)) {
    truncatedWebsite = `https://${truncatedWebsite}`;
  }
   // Check if the website is a valid URL using validator
   if (truncatedWebsite.trim() !== "") {
     isValidUrl = validator.isURL(truncatedWebsite);
   }
 
   // Truncate website text if it exceeds maxLength
   const websiteDisplay =
     truncatedWebsite.length > maxLength
       ? `${truncatedWebsite.substring(0, maxLength)}...`
       : truncatedWebsite;
 
   return (
     <div style={{ display: "flex", alignItems: "center" }}>
       {isEditingWebsite ? (
         // Show input field when editing
         <input
           type="url"
           autoComplete="off"
           id="website_url"
           name="website_url"
           value={form.website_url || ""}
           onChange={handleWebsiteChange}
           placeholder="Enter Website URL"
           className="input-field"
           onBlur={() => setIsEditingWebsite(false)} // Close input when focus is lost
         />
       ) : (
         // Display hyperlink if valid, otherwise plain text
         <div>
           {truncatedWebsite.trim() !== "" ? (
             isValidUrl ? (
               <a
                 href={truncatedWebsite}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="website-link"
                 title={truncatedWebsite} // Show full URL on hover
               >
                 {websiteDisplay}
               </a>
             ) : (
               <span title={truncatedWebsite}>{websiteDisplay}</span>
             )
           ) : (
             <span>No website added</span>
           )}
         </div>
       )}
 
       {/* Always show edit button, but it will function based on whether a website exists */}
       <button
         type="button"
         onClick={() => setIsEditingWebsite(true)}
         className="edit-button"
         style={{ marginLeft: "10px", padding: "5px 10px" }}
         disabled={isEditingWebsite} // Disable button while editing
       >
         <ModeEditIcon style={{ verticalAlign: "bottom" }} />
       </button>
     </div>
   );
 };
 
 // Handle change for website input
 const handleWebsiteChange = (e) => {
   handleChange(e); // Use the existing handleChange function
 };
 
const handleToggleStatus = async(user) => {
  console.log('Toggle status:', user);
  const { contact_info_phone, ...rest } = user;

  const dataToSend = {
    ...rest,
    is_active: !user.is_active, // Toggle the is_active status
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
  if (response.status === 200 || response.status === 201) {
    fetchUser(); // Refresh the user list after closing the modal

    Swal.fire('Success!', 'Client status updated successfully!', 'success').then(() => {
    });
  }
} catch (error) {
  Swal.fire('Error!', 'Failed to update client status. Please try again.', 'error');
}
};
  return (
    <div>
    {loading && (
      <div className="loader-overlay">
        <div className="spinner"></div> {/* Custom spinner */}
      </div>
    )}
    <div className="add-user-container">
      <div className="back-button-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => navigate('/SuperAdmin/users')} className="back-button" style={{ marginRight: '10px', display: 'flex', alignItems: 'center', padding:'8px 12px', borderRadius:'23px' }}  >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span className="back-vendor-text"> Back to Client List</span>
        </button>
        <h2 className="add-user-title" style={{ flexGrow: 1, textAlign: 'center', margin:'0px' }}>Client Details</h2>
      </div>

      <div className="tabs-wrapper" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        <TabButton tabId="details" label="Client Details" />
        <TabButton tabId="dashboard" label="Client Dashboard" />
        <TabButton tabId="users" label="Client Users" />
      </div>
<div className="tab-content" style={{
    marginTop: '30px',
    width: activeTab === 'details' ? '40%' : 'auto',
  }}>
{activeTab === 'details' && (
        <div style={{ position: 'relative' }}>
          {/* Edit icon inside tab content */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                position: 'absolute',
                top: '-49px',
                right: 0,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '10px'
              }}
              title="Edit"
            >
              <FontAwesomeIcon icon={faEdit} size="lg" />
            </button>
          )}

          {isEditing ? (
            <>
              <div className="addclientuser-form">
                <div className="addclientuser-column">
                  <div className="addclientuser-group">
                    <label htmlFor="name" className="addclientuser-label">Name *</label>
                    <input type="text" id="name" placeholder="Name" value={form.name} onChange={handleChange} autoComplete="off" className="addclientuser-input" />
                  </div>
                  <div className="addclientuser-group">
                    <label htmlFor="website" className="addclientuser-label">Website</label>
                    {renderWebsite()}
                  </div>
                  <div className="addclientuser-group">
                    <label htmlFor="designation" className="addclientuser-label">Industry </label>
                    <input type="text" id="designation" placeholder="Designation" value={form.designation} onChange={handleChange} className="addclientuser-input" />
                  </div>
                </div>

                <div className="addclientuser-column">
                  <div className="addclientuser-group">
                    <label htmlFor="location" className="addclientuser-label">Location</label>
                    <input type="text" id="location" placeholder="Location" value={form.location} onChange={handleChange} className="addclientuser-input" />
                  </div>
                  <div className="addclientuser-group">
                    <label className="addclientuser-label">Client Status</label>
                    <div className="addclientuser-toggle-wrapper">
                      <label className="addclientuser-switch">
                        <input type="checkbox" checked={form.is_active} onChange={handleToggleStatusUser} />
                        <span className="addclientuser-slider"></span>
                      </label>
                      <span style={{ marginLeft: '10px' }}>{form.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="addclientuser-group">
                    <label className="addclientuser-label">Logo</label>
                    <input type="file" name="vendorLogo" onChange={handleFileChange} style={{ padding: '7px' }} className="input-file" />
                    {form.logo && <img src={form.logo} alt="Logo Preview" className="logo-preview" />}
                  </div>
                </div>
              </div>
              <div className="create-button-container">
                <button onClick={handleSubmit} className="create-button">Save</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'left', marginTop: '40px' }}>
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Industry:</strong> {form.designation}</p>
              <p><strong>Website:</strong> {form.website_url}</p>
              <p><strong>Location:</strong> {form.location}</p>
              <p><strong>Status:</strong> {form.is_active ? 'Active' : 'Inactive'}</p>
              {form.logo && <img src={form.logo} alt="Logo" style={{ width: '100px', marginTop: '10px' }} />}
            </div>
          )}
        </div>
      )}
        {activeTab === 'dashboard' && (
  <div style={{ textAlign: 'center', margin: '20px 0px' }}>
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon"><FaBox /></div>
        <div className="stat-content">
          <h3>Total Products</h3>
          <p>{dashboardData?.product_count ?? 0}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon"><FaTags /></div>
        <div className="stat-content">
          <h3>Total Brands</h3>
          <p>{dashboardData?.brand_count ?? 0}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon"><FaUserTie /></div>
        <div className="stat-content">
          <h3>Total Vendors</h3>
          <p>{dashboardData?.vendor_count ?? 0}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon"><FaSitemap /></div>
        <div className="stat-content">
          <h3>Total Categories</h3>
          <p>{dashboardData?.category?.total ?? 0}</p>
          <div style={{ fontSize: '13px', marginTop: '8px' }}>
            <div>Level 1: {dashboardData?.category?.level1 ?? 0}</div>
            <div>Level 2: {dashboardData?.category?.level2 ?? 0}</div>
            <div>End Level: {dashboardData?.category?.end_level ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        {activeTab === 'users' && (
          <div style={{ textAlign: 'center', margin: '0px' }}>
            <div >
      <div className="brand-header">
        <div className="brand-header-info" style={{ marginTop: '2px' }}>
          <h1 className="user-title">  User Management </h1>
        </div>

        <div className="button-row-user">
          <div className="search-input-container-brand" style={{ paddingRight: '15px', marginTop: '21px', position: 'relative' }}>
            <input
              type="text"
              autoComplete="off"
              placeholder='Search Users' 
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                paddingRight: '30px',
                width: '100%',
              }}
            />
            {searchQuery.length > 0 ? (
              <CloseIcon
                onClick={handleSearchClear}
                style={{ cursor: 'pointer', color: 'grey', fontSize: '21px', position: 'absolute', right: '22px', top: '50%', transform: 'translateY(-50%)' }}
              />
            ) : (
              <SearchIcon
                style={{ position: 'absolute', right: '22px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888' }}
              />
            )}
          </div>

          <div className="brand-actions-container" style={{ margin: '20px 0px 0px 0px' }}>
            <div className="button-row">
              <button
                className="add-product-btn-container import-btn"
                onClick={() => handleAddUser()  }
              >
                <AddOutlinedIcon style={{ cursor: 'pointer' }} className="add-product-btn" />
                <span className="button-text" style={{ width: '63px' }}> Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
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
            {userData.map((user, index) => (
              <tr key={index} className="border-t">
                <td className="p-4" onClick={() => handleUpdateUser(user.id)} style={{ cursor: 'pointer' }}>{user.user_name}</td>
                <td className="p-4 text-blue-600" onClick={() => handleUpdateUser(user.id)} style={{ cursor: 'pointer' }}>{user.email || 'N/A'}</td>
                <td className="p-4" onClick={() => handleUpdateUser(user.id)} style={{ cursor: 'pointer' }}>{user.cc_phone || 'N/A'}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === "Client-admin" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}
                    onClick={() => handleUpdateUser(user.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4">{user.is_active ? "Active" : "Inactive"}</td>
                <td className="p-4">{user.added_by || 'N/A'}</td>
                <td className="p-4">{user.last_updated || 'N/A'}</td>
                <td className="p-4">
                  <button className="three-dot-button" onClick={(e) => handleThreeDotClick(e, index)}>
                    <EllipsisVertical className="text-gray-500" size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {userData.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-400">
                  {loading ? 'Loading users...' : 'No matching users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {activeMenuIndex !== null && (
          <div
            ref={dropdownRef}
            className="dropdown-menu"
            style={{
              position: "fixed",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left - 150}px`,
              zIndex: 1000,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '5px',
            }}
          >
            <button
              onClick={() => {
                handleUpdateUsertoggle(userData[activeMenuIndex]);
                setActiveMenuIndex(null);
              }}
              className="dropdown-button"
            >
              Edit
            </button>
            <button
              onClick={() => {
                handleToggleStatus(userData[activeMenuIndex]);
                setActiveMenuIndex(null);
              }}
              className="dropdown-button"
            >
              {userData[activeMenuIndex]?.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        )}
      </div>
    </div>
          </div>
        )}
      </div>
      
    </div>
    {showAddUserModal && (
  <AddUser onClose={() => handleCloseUser()} />
)}
{showUpdateUserModal && (
  <UpdateUser selectuserId={selectedUserId} onCloseUpdate={() => handleCloseUserUpdate()} />
)}
    </div>
    
  );
};

export default UpdateClientUser;
