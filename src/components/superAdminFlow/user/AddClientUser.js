// File: AddClientUser.js

import React, { useState,useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../../utils/axiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './AddClientUser.css';

const AddClientUser = ({ isSidebarOpen, toggleSidebar }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    location: '',
    designation: '',
    status: true, // true = Active, false = Inactive
    website_url: '',
    logo: null,
  });
useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        toggleSidebar();  // Close the sidebar after 10 seconds
      }, 2000);  // 10 seconds timeout

      // Cleanup the timer if the component is unmounted before the timer ends
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, toggleSidebar]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        logo: file, // Store the selected logo file
        logoPreview: URL.createObjectURL(file), // Create and store the image preview URL
      }));
    }
  };
  const handleToggleStatus = () => {
    setForm((prev) => ({ ...prev, status: !prev.status }));
  };

  const handleSubmit = async () => {
    const { name } = form;
    if (!name) {
      Swal.fire('Error!', 'Please fill all required fields', 'error');
      return;
    }
    console.log(form.logo,'formData');
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('website_url', form.website_url);
    formData.append('location', form.location);
    formData.append('status', form.status);
    formData.append('designation', form.designation);
    formData.append('logo', form.logo);

    try {
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_IP}/createClientForAdmin/`,
        formData
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire('Success!', 'Client created successfully!', 'success').then(() => {
          navigate('/SuperAdmin/users');
        });
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to create client. Please try again.', 'error');
    }
  };

  return (
    <div className="addclientuser-container">
        <div className="back-button-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={() => navigate('/SuperAdmin/users')} className="back-button" style={{ marginRight: '10px', display: 'flex', alignItems: 'center', padding:'8px 12px', borderRadius:'23px' }}  >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <span className="back-vendor-text"> Back to Client List</span>
                </button>
                <h2 className="add-user-title" style={{ flexGrow: 1, textAlign: 'center', margin:'0px' }}>Add New Client</h2>
              </div>
      <div className="addclientuser-form">
        {/* Column 1 */}
        <div className="addclientuser-column">
          <div className="addclientuser-group">
            <label htmlFor="name" className="addclientuser-label">Name *</label>
            <input
              type="text"
              id="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="addclientuser-input"
              autoComplete="off"
            />
          </div>
          <div className="addclientuser-group">
          <label htmlFor="website" className="addclientuser-label">Website</label>
          <input
            type="url"
            name="website_url"
            autoComplete="off"
            className="addclientuser-input"
            value={form.website_url}
            onChange={handleInputChange}
            placeholder=" Website"
          />
        </div>
          {/* <div className="addclientuser-group">
            <label htmlFor="email" className="addclientuser-label">Email Address *</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="addclientuser-input"
            />
          </div> */}

          <div className="addclientuser-group">
            <label htmlFor="designation" className="addclientuser-label">Industry</label>
            <input
              type="text"
              id="designation"
              placeholder="Industry"
              autoComplete="off"
              value={form.designation}
              onChange={handleChange}
              className="addclientuser-input"
            />
          </div>
        </div>

        {/* Column 2 */}
        <div className="addclientuser-column">
          <div className="addclientuser-group">
            <label htmlFor="location" className="addclientuser-label">Location</label>
            <input
              type="text"
              id="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="addclientuser-input"
            />
          </div>

          <div className="addclientuser-group">
            <label className="addclientuser-label">Client Status</label>
            <div className="addclientuser-toggle-wrapper">
              <label className="addclientuser-switch">
                <input
                  type="checkbox"
                  checked={form.status}
                  onChange={handleToggleStatus}
                />
                <span className="addclientuser-slider"></span>
              </label>
              <span style={{ marginLeft: '10px' }}>
                {form.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="addclientuser-group">
          <label className="addclientuser-label">Logo</label>
    <input
      type="file"
      accept="image/*"
      style={{ padding: '7px',border:'1px solid #ccc', borderRadius:'4px', width: '100%', cursor: 'pointer' }}
      onChange={handleFileChange}
    />

  {/* Conditionally render the logo preview if it exists */}
  {form.logoPreview && (
  <div style={{ marginTop: '10px', display: 'inline-block' }}>
    <img
      src={form.logoPreview}
      alt="Logo Preview"
      className="logo-preview"
    />
  </div>
)}
</div>
        </div>
      </div>

      <div className="create-button-container">
        <button onClick={handleSubmit} className="create-button">
          Add
        </button>
      </div>
    </div>
  );
};

export default AddClientUser;
