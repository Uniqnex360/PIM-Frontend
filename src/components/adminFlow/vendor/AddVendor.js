import React, { useState,useRef, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosConfig'; // Assuming you're using axiosInstance for API calls
import './AddVendor.css'; // Make sure the path is correct
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft,faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ChevronDownIcon from '@mui/icons-material/ExpandMore';
const AddVendor = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        toggleSidebar();  // Close the sidebar after 10 seconds
      }, 2000);  // 10 seconds timeout

      // Cleanup the timer if the component is unmounted before the timer ends
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, toggleSidebar]);
    const [countryCodes, setCountryCodes] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [vendorDetails, setVendorDetails] = useState({
    name: '',
    contact_info_email: '',
    contact_info_phone:'',
    business_type: '',
    website: '',
    description: '',
    address: '',
    city: '',
    industry_info: '',
    tax_info: '',
    country_code:'',
    departments: [{ department_name: '', email: '', phone_number: '',country_code:'' }], // Initialize with one department
    logo: null,
  });
    const [searchQuery, setSearchQuery] = useState('');
  const [searchQueriesDept, setSearchQueriesDept] = useState({});
    const fetchCountryCodes = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();        
    const codes = data
    .map(country => {
      // Ensure the properties exist before accessing them
      const name = country.name && country.name.common ? country.name.common : 'Unknown';
      const code = country.idd && country.idd.root
        ? country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '')
        : '';

      return {
        name: name,
        code: code,
      };
    })
    .filter(country => country.code); // Only countries with a code

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
  setIsOpen(false); // Close dropdown
  // Delay re-opening to allow DOM to update
  setTimeout(() => {
    setIsOpen(true);

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
  const handleSearchChangeDept = (e, index) => {
    updateSearchQueryDept(index, e.target.value); // Pass index and new value
    fetchCountryCodes(); // If this is relevant, you can debounce this too
  };
  const updateSearchQueryDept = (index, value) => {
    const input = document.querySelector(`input[data-dept-index="${index}"]`);
  
    // Save cursor position
    const start = input?.selectionStart || 0;
    const end = input?.selectionEnd || 0;
  
    // Close dropdown
    setOpenDeptDropdownIndex(null);
    setSearchQueriesDept(prev => ({
      ...prev,
      [index]: value
    }));
    setTimeout(() => {
      setOpenDeptDropdownIndex(index);
      // Wait for DOM to update, then restore cursor
      setTimeout(() => {
        const updatedInput = document.querySelector(`input[data-dept-index="${index}"]`);
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.setSelectionRange(start, end);
        }
      }, 0);
    }, 50);
  };
  
  const filteredCountryCodes = countryCodes.filter(({ code }) => {
    if (!searchQuery.trim()) return true;
  
    const normalizedSearch = searchQuery.replace(/^\+/, ''); // remove leading +
    const normalizedCode = code.replace(/^\+/, '');          // remove leading +
  
    return normalizedCode.includes(normalizedSearch);
  });
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBusinessType/`);
        setBusinessTypes(response.data.data || []);
      } catch (error) {
        console.error('Error fetching business types:', error);
      }
    };

    fetchBusinessTypes();
  }, []);
 const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownRefsForDept = useRef({});
  const [openDeptDropdownIndex, setOpenDeptDropdownIndex] = useState(null);
  const toggleDropdown = () => {setIsOpen(!isOpen); setSearchQuery('');  };
  const toggleDropdownForDept = (index) => {
    setOpenDeptDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
  };
    const handleSelect = (code) => {
    setVendorDetails({
      ...vendorDetails,
      country_code: code
    });
    setIsOpen(false);
  };
  const handleSelectDept = (field, index, code) => {
    // Check if field and index are valid to update the department fields
    if (field !== null && index !== null) {
      // Update the department fields dynamically
      const updatedDepartments = [...vendorDetails.departments];
      updatedDepartments[index][field] = code;  // Assuming 'code' is the value you're updating for the specific field
      setVendorDetails({ ...vendorDetails, departments: updatedDepartments });
    } else {
      // If no field or index is provided, update the country code
      setVendorDetails({ ...vendorDetails, country_code: code });
    }
    setSearchQueriesDept(prev => ({
      ...prev,
      [index]: '' // Clear the search query after selection
    }));
    setOpenDeptDropdownIndex(null);
  };
  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
      const currentDropdown = dropdownRefsForDept.current[openDeptDropdownIndex];
      if (currentDropdown && !currentDropdown.contains(event.target)) {
        setOpenDeptDropdownIndex(null);
        setSearchQueriesDept(prev => ({
          ...prev,
          [openDeptDropdownIndex]: '' // Reset search query for the clicked outside index
        }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDeptDropdownIndex]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVendorDetails({
      ...vendorDetails,
      [name]: value,
    });
  };
// Handle country code selection
  const handleDepartmentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDepartments = [...vendorDetails.departments];
    updatedDepartments[index][name] = value;
    setVendorDetails({
      ...vendorDetails,
      departments: updatedDepartments,
    });
  };

  const handleAddDepartment = () => {
    setVendorDetails({
      ...vendorDetails,
      departments: [...vendorDetails.departments, { department_name: '', email: '', phone_number: '',country_code:'' }], // Add a new department object
    });
  };

  const handleRemoveDepartment = (index) => {
    const updatedDepartments = vendorDetails.departments.filter((_, i) => i !== index);
    setVendorDetails({
      ...vendorDetails,
      departments: updatedDepartments,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVendorDetails({
        ...vendorDetails,
        logo: file, // Store the selected logo file
        logoPreview: URL.createObjectURL(file), // Create and store the image preview URL
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     if (!vendorDetails.name) {
          Swal.fire({
            icon: 'warning',
            title: 'Please fill the vendor name!',
          });
          return;
        }
if (vendorDetails.contact_info_email) {        
        const emailValue = vendorDetails.contact_info_email;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;    
        if (emailValue && !emailRegex.test(emailValue)) {
          // Email is not valid, show popup message
          Swal.fire({ title: 'Info!', text: 'Kindly enter a proper email format.', icon: 'info', confirmButtonText: 'OK',});
          return; // Don't update the form data until the email is correct
        }
      }
      for (let department of vendorDetails.departments) {
        const departmentEmail = department.email;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;    
        if (departmentEmail && !emailRegex.test(departmentEmail)) {
          // Email is not valid for this department, show popup message
          Swal.fire({
            title: 'Info!',
            text: `Kindly enter a proper email format for the department ${department.department_name} .`,
            icon: 'info',
            confirmButtonText: 'OK',
          });
          return; // Don't update the form data until the email is correct
        }
      }
    // Prepare departments list
    const departments = vendorDetails.departments
      .filter(department => department.department_name && department.email && department.phone_number)
      .map(department => ({
        department_name: department.department_name,
        email: department.email,
        phone_number: department.phone_number,
        country_code: department.country_code,
      }));

    // const sendPostRequest = async (VendorLogoBase64) => {
      try {
        const formData = new FormData();
        formData.append('name', vendorDetails.name);
        formData.append('country_code', vendorDetails.country_code);
        formData.append('contact_info_phone', vendorDetails.contact_info_phone);
        formData.append('contact_info_email', vendorDetails.contact_info_email);
        formData.append('business_type', vendorDetails.business_type);
        formData.append('website', vendorDetails.website);
        formData.append('description', vendorDetails.description);
        formData.append('address', vendorDetails.address);
        formData.append('city', vendorDetails.city);
        formData.append('industry_info', vendorDetails.industry_info);
        formData.append('tax_info', vendorDetails.tax_info);
        formData.append('departments', JSON.stringify(departments)); // If departments is an array, convert it to JSON
        formData.append('logo', vendorDetails.logo); // Send the logo as base64 string
    
        // Post request to server with formData
        const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createVendor/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important to set the correct header for FormData
          },
        });

        if (response.data.data.is_created === true) {
          Swal.fire({
            title: 'Success!',
            text: 'Supplier added successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            navigate(`/Admin/vendors`);
          });
        }else if(response.data.data.is_created === false){
                  Swal.fire({
                    title: 'Warning!',
                    text: response.data.data.error,
                    icon: 'warning',
                    confirmButtonText: 'OK',
                  });
                } else {
                  Swal.fire({
                              icon: 'error',
                              title: 'Error adding supplier!',
                              text: response.data.data.message,
                            });
        }
      } catch (error) {
        console.error('Error adding supplier:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to add supplier!',
          text: error,
        });
      }
    // };

    // Convert logo to base64 if it's provided
    // if (vendorDetails.logo) {
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     const VendorLogoBase64 = reader.result.split(',')[1]; // Remove data URI prefix
    //     sendPostRequest(VendorLogoBase64);
    //   };
    //   reader.readAsDataURL(vendorDetails.logo);
    // } else {
    //   sendPostRequest(''); // If no logo, send empty string for the logo
    // }
  };
  const handleBackToVendorList = () => {
    navigate('/Admin/vendors');  // Adjust the path to match your brand list route
  };
  return (
    <div className="add-vendor-page">
      <h2 style={{margin:'15px 0px 20px 0px'}}></h2>
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button  onClick={handleBackToVendorList}  className="back-button" style={{ marginRight: '10px', display: 'flex', alignItems: 'center', padding:'8px 12px', borderRadius:'23px' }} >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span className="back-vendor-text"> Back to Supplier List</span>
        </button>
        <h2 style={{ flexGrow: 1, textAlign: 'center', margin:'0px' }}>Add New Supplier</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label> Name *</label>
          <input  type="text"  name="name"  value={vendorDetails.name}  onChange={handleInputChange}  placeholder=" Name"   autoComplete="off"   required
          />
        </div>
        <div>
          <label> Address</label>
          <input
            type="text"
            name="address"
            autoComplete="off"
            value={vendorDetails.address}
            onChange={handleInputChange}
            placeholder="Address"   />
        </div>
        <div>
          <label>Business Type</label>
          <select style={{color:'#6a6a6a'}}
            name="business_type"
            className='select-back'
            value={vendorDetails.business_type}
            onChange={handleInputChange}
          >
            <option value="">Select Business Type</option>
            {businessTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>City</label>
          <input
            type="text"
            name="city"
            autoComplete="off"
            value={vendorDetails.city}
            onChange={handleInputChange}
            placeholder="City"
          />
        </div>
        <div>
          <label> Website</label>
          <input
            type="url"
            name="website"
            autoComplete="off"
            value={vendorDetails.website}
            onChange={handleInputChange}
            placeholder=" Website"
          />
        </div>
        <div>
          <label>Tax Information</label>
          <input
            type="text"
            name="tax_info"
            autoComplete="off"
            value={vendorDetails.tax_info}
            onChange={handleInputChange}
            placeholder="Tax Information"
          />
        </div>
        <div>
          <label> Description</label>
           <input
            type="text"
            name="description"
            autoComplete="off"
            value={vendorDetails.description}
            onChange={handleInputChange}
            placeholder="Description"
          />
        </div>
        <div>
      <label>Contact Information</label>
      <div style={{ display: 'flex', gap: '10px' }}>
      <input
          type="text"
          name="contact_info_email"
          autoComplete="off"
          value={vendorDetails.contact_info_email}
          onChange={handleInputChange}
          placeholder="Email"
          style={{ width: '50%' }}
        />
        <div style={{ display: 'flex', width: '49%' }}>
          <div
      ref={dropdownRef}
      className="custom-country-dropdown"
      style={{
        position: 'relative',
        width: '70px',
        border: '1px solid #e0d3d3',
        borderRadius: '5px 0 0 5px',
        textAlign: 'center',
        background: '#fff',
        cursor: 'pointer',
        margin:'0px 0px 5px 0px'
      }}
    >
      <div
        onClick={toggleDropdown}
        style={{
          padding: '10px 0px 0px 0px',
          userSelect: 'none',
          fontSize: '13px',
        }}
      >
        {vendorDetails.country_code || 'Select'}
        <ChevronDownIcon style={{ fontSize: 18, float: "right" }} />
      </div>

      {isOpen && (
        <div
          className="dropdown-options"
          style={{  position: 'absolute',  top: '100%',  left: 0,  right: 0,  maxHeight: '30vh',  overflowY: 'auto',  border: '1px solid #ccc',  borderRadius: '0 0 5px 5px', overflowX:'hidden',  backgroundColor: '#fff',  zIndex: 999,  }}>
          <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e)}
              style={{
                width: '100%',
                padding: '5px 4px',
                marginBottom: '5px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
         {filteredCountryCodes.map((country) => (
            <div
              key={country.code}
              id={`country-option-${country.code}`}
              onClick={() => handleSelect(country.code)}
              style={{
                padding: '4px 0px',
                cursor: 'pointer',
                fontSize: '13px',
                backgroundColor:
                vendorDetails.country_code === country.code ? '#f0f0f0' : 'white',
              }}
              onMouseDown={(e) => e.preventDefault()} // prevent focus loss
            >
              {country.code}
            </div>
          ))}
        </div>
      )}
    </div>
          <input
            type="text"
            name="contact_info_phone"
            value={vendorDetails.contact_info_phone}
            onChange={handleInputChange}
            autoComplete="off"
            placeholder="Phone Number"
            style={{
              width: '70%',
              border: '1px solid #e0d3d3',
              borderRadius: '0 5px 5px 0',
              padding: '10px',
            }}
          />
        </div>
      </div>
    </div>
        <div>
          <label>Industry Information</label>
          <input
            type="text"
            name="industry_info"
            autoComplete="off"
            value={vendorDetails.industry_info}
            onChange={handleInputChange}
            placeholder="Industry Information"
          />
        </div>
       
    <div>
  <label>Logo</label>
  <div style={{ display: 'inline-block'}}>
    <input
      type="file"
      accept="image/*"
      style={{ padding: '7px', }}
      onChange={handleFileChange}
    />
  </div>
  {/* Conditionally render the logo preview if it exists */}
  {vendorDetails.logoPreview && (
  <div style={{ marginTop: '10px', display: 'inline-block' }}>
    <img
      src={vendorDetails.logoPreview}
      alt="Logo Preview"
      className="logo-preview"
    />
  </div>
)}

</div>
        <div className="input-file-wrapper">
          <h3 style={{margin:'0px 0px 5px 0px'}}>Departments</h3>
          {vendorDetails.departments.map((department, index) => {
             const searchQuery = searchQueriesDept[index] || '';
             const filteredCodesDept = countryCodes.filter(({ code }) => {
               if (!searchQuery.trim()) return true;
         
               const normalizedSearch = searchQuery.replace(/^\+/, ''); // Remove the "+" for search
               const normalizedCode = code.replace(/^\+/, ''); // Remove the "+" for matching
         
               // Match the beginning of the code and anywhere after the "+" symbol
               return normalizedCode.startsWith(normalizedSearch) || normalizedCode.includes(normalizedSearch);
             });
             return(
            <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
              <input
                type="text"
                name="department_name"
                autoComplete="off"
                value={department.department_name}
                onChange={(e) => handleDepartmentChange(index, e)}
                placeholder="Department Name"
                style={{ width: '37%' }}
              />
              <input
                type="text"
                name="email"
                autoComplete="off"
                value={department.email}
                onChange={(e) => handleDepartmentChange(index, e)}
                placeholder="Email ID"
                style={{ width: '37%', marginLeft: '10px' }}
              />
              <div style={{ display: 'flex', width: '49%' }}>
          <div
      ref={(el) => (dropdownRefsForDept.current[index] = el)}
      className="custom-country-dropdown"
      style={{
        position: 'relative',
        width: '70px',
        border: '1px solid #e0d3d3',
        borderRadius: '5px 0 0 5px',
        textAlign: 'center',
        background: '#fff',
        cursor: 'pointer',
         margin: '0px 0px 5px 10px'
      }}
    >
      <div
          onClick={() => toggleDropdownForDept(index)}
          style={{
          padding: '10px 0px 0px 0px',
          userSelect: 'none',
          fontSize: '13px',
        }}
      >
        {department.country_code || 'Select'}
        <ChevronDownIcon style={{ fontSize: 18, float: "right" }} />
      </div>

      {openDeptDropdownIndex === index && (
        <div
          className="dropdown-options"
          style={{  position: 'absolute',  top: '100%',  left: 0,  right: 0,  maxHeight: '22vh',  overflowY: 'auto',  border: '1px solid #ccc',  borderRadius: '0 0 5px 5px', overflowX:'hidden',  backgroundColor: '#fff',  zIndex: 999,  }}>
           <input
              type="text"
              placeholder="Search"
              value={searchQueriesDept[index] || ''}
              data-dept-index={index}
              onChange={(e) => handleSearchChangeDept(e, index)} // pass index
              style={{
                width: '100%',
                padding: '5px 4px',
                marginBottom: '5px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
         {filteredCodesDept.map((country) => (
            <div
              key={country.code}
              id={`country-option-${country.code}`}
              onClick={(e) => handleSelectDept("country_code",index,country.code)}
              style={{
                padding: '4px 0px',
                cursor: 'pointer',
                fontSize: '13px',
                backgroundColor:
                department.country_code === country.code ? '#f0f0f0' : 'white',
              }}
              onMouseDown={(e) => e.preventDefault()} // prevent focus loss
            >
              {country.code}
            </div>
          ))}
        </div>
      )}
    </div>
              <input
                type="text"
                name="phone_number"
                autoComplete="off"
                value={department.phone_number}
                onChange={(e) => handleDepartmentChange(index, e)}
                placeholder="Phone Number"
                style={{ width: '80%', borderRadius: '0 5px 5px 0', }}
              />
              </div>
              <button type="button" onClick={() => handleRemoveDepartment(index)} className="remove-btn-add-page">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
             );
})}
          <div className='input-file-wrapper addvendordiv'>
          <a onClick={handleAddDepartment} className="hyperlink-department-add" style={{ float: 'right' }}>
            + Add
          </a>
          </div>
        </div>
        <div className='input-file-wrapper addvendordiv' style={{padding:'7px 0px 0px 0px'}}>
          <button type="submit" className="add-vendor-btn">Add</button>
        </div>
      </form>
    </div>
  );
};

export default AddVendor;
