// File: AddClientUser.js

import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../../utils/axiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './AddClientUser.css';

const AddClientUser = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    designation: '',
    client_status: true, // true = Active, false = Inactive
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleToggleStatus = () => {
    setForm((prev) => ({ ...prev, client_status: !prev.client_status }));
  };

  const handleSubmit = async () => {
    const { full_name, email, designation } = form;
    if (!full_name || !email || !designation) {
      Swal.fire('Error!', 'Please fill all required fields', 'error');
      return;
    }

    try {
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_IP}/createClientForAdmin/`,
        form
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire('Success!', 'Client created successfully!', 'success').then(() => {
          navigate('/Admin/users');
        });
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to create client. Please try again.', 'error');
    }
  };

  return (
    <div className="addclientuser-container">
        <div className="back-button-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={() => navigate('/Admin/users')} className="back-button" style={{ marginRight: '10px', display: 'flex', alignItems: 'center', padding:'8px 12px', borderRadius:'23px' }}  >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <span className="back-vendor-text"> Back to Client List</span>
                </button>
                <h2 className="add-user-title" style={{ flexGrow: 1, textAlign: 'center', margin:'0px' }}>Add New Client</h2>
              </div>
      <div className="addclientuser-form">
        {/* Column 1 */}
        <div className="addclientuser-column">
          <div className="addclientuser-group">
            <label htmlFor="full_name" className="addclientuser-label">Full Name *</label>
            <input
              type="text"
              id="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
              className="addclientuser-input"
            />
          </div>

          <div className="addclientuser-group">
            <label htmlFor="email" className="addclientuser-label">Email Address *</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="addclientuser-input"
            />
          </div>

          <div className="addclientuser-group">
            <label htmlFor="designation" className="addclientuser-label">Designation *</label>
            <input
              type="text"
              id="designation"
              placeholder="Designation"
              value={form.designation}
              onChange={handleChange}
              className="addclientuser-input"
            />
          </div>
        </div>

        {/* Column 2 */}
        <div className="addclientuser-column">
          <div className="addclientuser-group">
            <label htmlFor="phone_number" className="addclientuser-label">Phone Number</label>
            <input
              type="text"
              id="phone_number"
              placeholder="Phone Number"
              value={form.phone_number}
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
                  checked={form.client_status}
                  onChange={handleToggleStatus}
                />
                <span className="addclientuser-slider"></span>
              </label>
              <span style={{ marginLeft: '10px' }}>
                {form.client_status ? 'Active' : 'Inactive'}
              </span>
            </div>
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
