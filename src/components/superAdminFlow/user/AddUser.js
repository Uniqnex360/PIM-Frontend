import React, { useState,useRef, useEffect  } from "react";
import { useParams  } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../../utils/axiosConfig';
import './AddUser.css';
import ChevronDownIcon from '@mui/icons-material/ExpandMore';

const AddUser = ({onClose}) => {
  const [form, setForm] = useState({
    email: '',
    user_name: '',
    phone: '',
    country_code:'',
    role: 'client-user',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };
  const { userId } = useParams();  // Get the userId from the URL
const [countryCodes, setCountryCodes] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [countryCode, setCountryCode] = useState('');
  const dropdownRef = useRef(null);
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
  const handleSubmit = async () => {
    const { user_name } = form;
    if ( !user_name) {
      Swal.fire('Error!', 'Please fill all required fields', 'error');
      return;
    }
    try {
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_IP}/createClientUserApiSuperAdmin/`,
        {
          ...form,
          client_id: userId, 
          country_code: countryCode,
          // <-- Replace with actual client_id
        }
      );
      if (response.status === 200 || response.status === 201) {
        onClose(); // Close the modal after success
        Swal.fire('Success!', 'User created successfully!', 'success').then(() => {
          onClose(); // Close the modal after success
        });
      }
    } catch (error) {
      onClose(); // Close the modal after success
      Swal.fire('Error!', 'Failed to create user. Please try again.', 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-user-modal">
        <div className="modal-header">
          <h2>Add New User</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <div className="add-user-form">
          <div className="user-form-column">
            <div className="user-form-group">
              <label htmlFor="user_name" className="user-label">Username *</label>
              <input
                type="text"
                id="user_name"
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

          <div className="user-form-column">      
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
      {countryCode || 'Select'} <ChevronDownIcon style={{ fontSize: 18, float: "right" }} />
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
              backgroundColor: countryCode === country.code ? '#eee' : '#fff',
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
        </div>

        <div className="create-button-container">
          <button onClick={handleSubmit} className="create-button">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
