// File: UpdateUser.jsx

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../../utils/axiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './UpdateUser.css'; // Link your CSS here
import ChevronDownIcon from '@mui/icons-material/ExpandMore';

const UpdateUser = ({ selectuserId, onCloseUpdate }) => {
  const [form, setForm] = useState({
    email: '',
    user_name: '',
    phone: '',
    country_code:'',
    role: 'client-user',
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const { userId } = useParams();  // Get the userId from the URL
const [countryCodes, setCountryCodes] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [countryCode, setCountryCode] = useState('');
  const dropdownRef = useRef(null);
// Fetch country codes from API
const fetchCountryCodes = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    const codes = data
      .map((country) => {
        // const name = country.name?.common ?? 'Unknown';
        const code =
          country.idd?.root && country.idd?.suffixes
            ? country.idd.root + country.idd.suffixes[0]
            : '';
        return { code };
      })
      .filter((c) => c.code);
    setCountryCodes(codes);
  } catch (error) {
    console.error('Error fetching country codes:', error);
  }
};

useEffect(() => {
  fetchCountryCodes();
}, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };
  const handleSearchChange = (e) => {
    const inputEl = e.target;
  const value = inputEl.value;

  // Save current cursor position
  const start = inputEl.selectionStart;
  const end = inputEl.selectionEnd;

  setSearchQuery(value);
  setIsDropdownOpen(false); // Close dropdown
  // Delay re-opening to allow DOM to update
  setTimeout(() => {
    setIsDropdownOpen(true);
    // Use setTimeout again to ensure DOM is updated before restoring focus
    setTimeout(() => {
      const input = document.querySelector('input[type="text"][placeholder="Search"]');
      if (input) {
        input.focus();
        input.setSelectionRange(start, end);
      }
    }, 0); // Next tick
  }, 50); 
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {setIsDropdownOpen(!isDropdownOpen); setSearchQuery('');  };
  const handleSelect = (code) => {
    setCountryCode(code);
    setIsDropdownOpen(false);
  };
  useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
            setSearchQuery('');
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  const filteredCountryCodes = countryCodes.filter(({ code }) => {
    if (!searchQuery.trim()) return true;
    return code.replace(/^\+/, '').includes(searchQuery.replace(/^\+/, ''));
  });
  useEffect(() => {
    if (!selectuserId) {
      console.error('User ID is missing');
      return;
    }
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainClientuserForAdmin/?client_id=${userId}&&id=${selectuserId}&&search=`);
        console.log(response.data,'data');
        
        if (response.data && response.data.data) {
          const userData = response.data.data.user_list[0];
          setForm({
            email: userData.email,
            user_name: userData.user_name,
            phone: userData.phone,
            role: userData.role,
            country_code: userData.country_code,
          });
        }
        setLoading(true);
        if (response.status === 401) setUnauthorized(true);
      } catch (error) {
        if (error.status === 401) setUnauthorized(true);
        console.error('Error fetching user data:', error);
        onCloseUpdate();
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (unauthorized) {
    navigate(`/unauthorized`);
  }

  const handleSubmit = async () => {
    const { user_name } = form;
    if (!user_name) {
      Swal.fire('Error!', 'Please fill all required fields', 'error');
      return;
    }

    const dataToSend = {
      ...form,
      id: selectuserId,
     country_code: countryCode,
    };
    let update_obj = { update_obj: dataToSend };

    try {
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_IP}/updateClientUser/`,
        update_obj,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200 || response.status === 201) {
        onCloseUpdate();
        Swal.fire('Success!', 'User updated successfully!', 'success').then(() => {
          onCloseUpdate();
        });
      }
    } catch (error) {
        onCloseUpdate();
      Swal.fire('Error!', 'Failed to update user. Please try again.', 'error');
    }
  };

  return (
    <>
      {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="modal-overlay">
        <div className="update-user-modal">
          <div className="modal-header">
            <h2>User Details</h2>
            <button className="modal-close" onClick={onCloseUpdate}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="add-user-form">
            <div className="user-form-column">
              <div className="user-form-group">
                <label htmlFor="user_name" className="user-label">Username *</label>
                <input
                  type="text"
                  id="user_name"
                  placeholder="Username"
                  value={form.user_name}
                  onChange={handleChange}
                  className="user-input"
                  autoComplete="off"
                />
              </div>

              <div className="user-form-group">
                <label htmlFor="email" className="user-label">Email *</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="user-input"
                  autoComplete="off"
                />
              </div>

              <div className="user-form-group">
                <label htmlFor="role" className="user-label">User Role *</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={handleChange}
                  className="user-input"
                >
                  <option value="client-user">Client-user</option>
                  <option value="admin">Client-admin</option>
                </select>
              </div>
            </div>
            <div className="user-form-group">
            <label htmlFor="role" className="user-label">Phone Number</label>
            <div style={{ display: 'flex', marginBottom: '15px',height:'50px' }}>
  <div
        ref={dropdownRef}
    style={{
      position: 'relative',
      width: '80px',
      border: '1px solid #ccc',
      borderRadius: '5px 0 0 5px',
      textAlign: 'center',
      background: '#fff',
      cursor: 'pointer',
      margin:'5px 0px 5px 0px'
    }}
    onClick={toggleDropdown}
  >
    <div style={{ padding: '10px 5px', fontSize: '13px' }}>
      {form.country_code || 'Select'} <ChevronDownIcon style={{ fontSize: 18, float: "right" }} />
    </div>
    {isDropdownOpen && (
      <div
        style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', backgroundColor: '#fff', zIndex: 999, }} >
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e)}
          onClick={(e) => e.stopPropagation()} // prevent closing on click
          onFocus={() => setIsDropdownOpen(true)}
          style={{ width: '100%', padding: '5px', fontSize: '13px',border:'1px solid rgb(204, 204, 204)', borderRadius:'4px' }}
        />
        {filteredCountryCodes.map((country) => (
          <div
            key={country.code}
            onClick={() => handleSelect(country.code)}
            style={{
              padding: '5px',
              fontSize: '13px',
              backgroundColor: form.country_code === country.code ? '#eee' : '#fff',
              cursor: 'pointer',
            }}
            onMouseDown={(e) => e.preventDefault()} // prevent focus loss

          >    {country.code}   </div>
        ))}
      </div>
    )}
  </div>
  <input
    type="text"
    id="phone"
    placeholder="Phone Number"
    value={form.phone}
    onChange={handleChange}
    className="user-input"
    style={{
      borderRadius: '0 5px 5px 0',
      width: '80%',
      padding: '10px',
    }}
  />
</div>
</div>
          </div>

          <div className="create-button-container">
            <button onClick={handleSubmit} className="create-button">
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateUser;
