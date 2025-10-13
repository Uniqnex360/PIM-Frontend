import React, { useEffect,useRef, useState } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import { useParams, useNavigate  } from 'react-router-dom';
import './VendorDetail.css';  // Import custom CSS for styling
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft,faTrash } from '@fortawesome/free-solid-svg-icons';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import validator from 'validator';
import Unauthorized from "../../../Unauthorized";
import ChevronDownIcon from '@mui/icons-material/ExpandMore';

const VendorDetail = ({ isSidebarOpen, toggleSidebar }) => {
  const { vendorId } = useParams();  // Get the vendorId from the URL
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
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loadingforLogo, setLoadingforLogo] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);  // For storing business types
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_info_phone:'',
    contact_info_email: '',
    country_code: '',
    business_type: '',
    website: '',
    description: '',
    address: '',
    city: '',
    industry_info: '',
    tax_info: '',
    departments:[{ department_name: "", email: "", phone_number: "",country_code: '' }], // Initialize with one department
    phoneNumber: '',
    logo: null,  // logo will be base64 encoded string
  });
  const [isEditingWebsite, setIsEditingWebsite] = useState(false); // State to toggle between view and edit mode for website
  const [countryCodes, setCountryCodes] = useState([]);
  useEffect(() => {
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

    fetchCountryCodes();
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueriesDept, setSearchQueriesDept] = useState({});
  const [openDeptDropdownIndex, setOpenDeptDropdownIndex] = useState(null);
  const dropdownRef = useRef(null);
  const dropdownRefsForDept = useRef({});

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleDropdownForDept = (index) => {
    setOpenDeptDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
  };
  const updateSearchQuery = (e) => {
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
  const updateSearchQueryDept = (index, value) => {
    // Get the input element
    const input = document.querySelector(`input[data-dept-index="${index}"]`);
  
    // Save cursor position
    const start = input?.selectionStart || 0;
    const end = input?.selectionEnd || 0;
  
    // Close dropdown
    setOpenDeptDropdownIndex(null);
  
    // Update search text
    setSearchQueriesDept(prev => ({
      ...prev,
      [index]: value
    }));
  
    // Reopen dropdown after a short delay
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
  
    const handleSelect = (code) => {
    setUnsavedChanges(true);
    setFormData((prev) => ({ ...prev, country_code: code }));
    setIsOpen(false);
    setSearchQuery('');
  };
  const handleSelectDept = (field, index, code) => {
    setUnsavedChanges(true);  // Mark changes as unsaved
    // Check if field and index are valid to update the department fields
    if (field !== null && index !== null) {
      // Update the department fields dynamically
      const updatedDepartments = [...formData.departments];
      updatedDepartments[index][field] = code;  // Assuming 'code' is the value you're updating for the specific field
      setFormData({ ...formData, departments: updatedDepartments });
    } else {
      // If no field or index is provided, update the country code
      setFormData({ ...formData, country_code: code });
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

  const filteredCodes = countryCodes.filter(({ code }) => {
    if (!searchQuery.trim()) return true;
  
    const normalizedSearch = searchQuery.replace(/^\+/, ''); // remove leading +
    const normalizedCode = code.replace(/^\+/, '');          // remove leading +
  
    return normalizedCode.includes(normalizedSearch);
  });
  console.log(filteredCodes,'filteredCodes');
  
//   const filteredCodesDept = countryCodes.filter(({ code }) => {
//     if (!searchQueryDept.trim()) return true;
  
//     const normalizedSearchDept = searchQueryDept.replace(/^\+/, '');
//     const normalizedCodeDept = code.replace(/^\+/, '');
  
//     return normalizedCodeDept.startsWith(normalizedSearchDept);
//   });
// console.log(filteredCodesDept,'filteredCodesDept');
  
  // Convert file to base64 when it is selected
  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  setLoadingforLogo(true);
  if (file) {
    // Create a FormData object to send the file as part of a POST request
    const formDataToSend = new FormData();
    formDataToSend.append('logo', file);  // Append file to FormData
    formDataToSend.append('brand_id', vendorId);  // Append file to FormData

    try {
      // Make the API request to upload the logo
      const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/brandUpdateLogo/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Logo Upload Response:', response.data); // Debug log


 const updatedLogo = response.data.logo || response.data.data?.logo;  // Try both paths
      const isUpdated = response.data.is_updated || response.data.data?.is_updated;
      
      if (isUpdated === true && updatedLogo) {
        setUnsavedChanges(true);
        // Update the formData with the new logo
        setFormData(prevFormData => ({
          ...prevFormData,
          logo: updatedLogo,  // The updated logo from API response
        }));
        setLoadingforLogo(false);
        Swal.fire({
          title: 'Success!',
          text: 'Logo updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        setLoadingforLogo(false);
        Swal.fire({
          title: 'Warning!',
          text: 'Logo upload completed but may not have been updated.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
      }
      
    } catch (error) {
      setLoadingforLogo(false);
      console.error('Error uploading logo:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Error uploading logo.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  } else {
    setLoadingforLogo(false);
  }
};

  // Update formData when text fields change
  const handleChange = (e, index = null, field = null) => {
    setUnsavedChanges(true);
    if (field !== null && index !== null) {
      // Updating department fields dynamically
      const updatedDepartments = [...formData.departments];
      updatedDepartments[index][field] = e.target.value;
      setFormData({ ...formData, departments: updatedDepartments });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };
  const addDepartment = () => {
    setUnsavedChanges(true);
    setFormData({
      ...formData,
      departments: [...formData.departments, { department_name: "", email: "", phone_number: "",country_code: '' }], // Add a new department row
    });
  };

  // Remove a department row
  const removeDepartment = (index) => {
    const updatedDepartments = formData.departments.filter((_, i) => i !== index);
    setFormData({ ...formData, departments: updatedDepartments });
  };
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBusinessType/`);
        if (response.data && response.data.data) {
          setBusinessTypes(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching business types:', error);
      }
    };

    fetchBusinessTypes();
  }, []);
  // Fetch vendor data
  useEffect(() => {
    if (!vendorId) {
      console.error('Vendor ID is missing');
      return;
    }

    const fetchVendorData = async () => {
      setLoadingforLogo(true);
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainVendor/?id=${vendorId}&&search=`);
        if (response.data && response.data.data) {            
          const vendorData = response.data.data.vendor_list[0];        
          setFormData({
            name: vendorData.name,
            contact_info_email: vendorData.contact_info_email,
            contact_info_phone: vendorData.contact_info_phone,
            business_type: vendorData.business_type_id,
            website: vendorData.website,
            description: vendorData.description,
            address: vendorData.address,
            city: vendorData.city,
            industry_info: vendorData.industry_info,
            tax_info: vendorData.tax_info,
            departments: vendorData.departments,
            phoneNumber: vendorData.phoneNumber,
            country_code: vendorData.country_code,
            logo: vendorData.logo,  // Assuming logo might be a base64 string already
          });          
        }
        if (response.status === 401) {
          setUnauthorized(true);
        } 
        setLoadingforLogo(false);
        setLoading(false);
      } catch (error) {
        if (error.status === 401) {
          setUnauthorized(true);
        }
        setLoadingforLogo(false);
        console.error('Error fetching vendor data:', error);
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId]);
  useEffect(() => {
    if (formData.departments.length === 0) {
      addDepartment(); // Add a default department row if empty
    }
  }, [formData.departments.length]);
  // Submit form data as JSON (including base64 logo) with vendorId as a new field
const handleSubmit = async (e) => {
  e.preventDefault();
  if (unsavedChanges === false) {
    Swal.fire({ title: 'Info!', text: 'No changes were made to save.', icon: 'info', confirmButtonText: 'OK',});
      return;
}
  try {
    const dataToSend = {
      ...formData,
      id: vendorId, // Send the vendorId as a separate field
    };        
    if(formData.country_code === undefined || formData.country_code === '') {
      dataToSend.country_code = ''; // Default to +1 if no country code is selected
    }    
    if (dataToSend.contact_info_email) {        
      const emailValue = dataToSend.contact_info_email;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;    
      if (emailValue && !emailRegex.test(emailValue)) {
        // Email is not valid, show popup message
        Swal.fire({ title: 'Info!', text: 'Kindly enter a proper email format.', icon: 'info', confirmButtonText: 'OK',});
        return; // Don't update the form data until the email is correct
      }
    }
    if (dataToSend.departments && dataToSend.departments.length > 0) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;  // Use regex to validate emails
      for (let department of dataToSend.departments) {
        const departmentEmail = department.email;
        if (departmentEmail && !emailRegex.test(departmentEmail)) {
          // Invalid department email, show popup message
          Swal.fire({ 
            title: 'Info!', 
            text: `Kindly enter a proper email format for the department ${department.department_name}.`, 
            icon: 'info', 
            confirmButtonText: 'OK' 
          });
          return; // Don't proceed with invalid department emails
        }
      }
    }  
     let update_obj = { update_obj: dataToSend };
    // Send data as JSON
    const response = await axiosInstance.post(
      `${process.env.REACT_APP_IP}/vendorUpdate/`,
      update_obj, // JSON payload
      {
        headers: {
          'Content-Type': 'application/json', // Ensuring the data is sent as JSON
        },
      }
    );
            console.log('API Response:', response.data); 
        
        // Fix: Change from response.data.data.is_updated to response.data.is_updated
    if (response.data && response.data.is_updated === true) {
      setUnsavedChanges(false);
      Swal.fire({ 
        title: 'Success!', 
        text: 'Vendor updated successfully.', 
        icon: 'success', 
        confirmButtonText: 'OK',
      }).then(() => { 
        navigate('/Admin/vendors'); 
      });  // Redirect to vendor list after successful update
    } else if (response.data && response.data.is_updated === false) {
      Swal.fire({ 
        title: 'Warning!', 
        text: 'Vendor update failed - no changes detected.', 
        icon: 'warning', 
        confirmButtonText: 'OK',
      });
    } else {
      Swal.fire({ 
        title: 'Error!', 
        text: 'Vendor update failed.', 
        icon: 'error', 
        confirmButtonText: 'OK',
      });
    }
  } catch (error) {
    console.error('Error updating vendor:', error);
    Swal.fire({ 
      title: 'Error!', 
      text: 'An error occurred while updating the vendor. Please try again.', 
      icon: 'error', 
      confirmButtonText: 'OK',
    });
  }
};
  const handleBackToVendorList = () => {
    navigate('/Admin/vendors');  // Adjust the path to match your brand list route
  };
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
  if (loading) return <div style={{margin:'20px 0px 0px 0px'}}>Loading Supplier...</div>;
 // Limit website URL length
 const maxLength = 50;
 // Function to render website
 const renderWebsite = () => {
  
   let isValidUrl = false;
   let truncatedWebsite = formData.website || "";
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
           name="website"
           value={formData.website || ""}
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
   setUnsavedChanges(true); // Track that changes have been made
   handleChange(e); // Use the existing handleChange function
 };
 
 <div className="form-section">
   <label>Website</label>
   {isEditingWebsite ? (
     <input
       type="url"
       autoComplete="off"
       name="website"
       value={formData.website || ''}
       onChange={handleWebsiteChange}
       placeholder="Website"
       className="input-field"
     />
   ) : (
     renderWebsite()  // This will render either the website link or input field based on the condition
   )}
 </div>
   // Handle country code selection
  return (
    <div>
    {loadingforLogo && (
      <div className="loader-overlay">
        <div className="spinner"></div> {/* Custom spinner */}
      </div>
    )}
    <div className="vendor-details-container">
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <button  onClick={handleBackToVendorList}  className="back-button" style={{ marginRight: '10px', display: 'flex', alignItems: 'center', padding:'8px 12px', borderRadius:'23px' }} >
    <FontAwesomeIcon icon={faArrowLeft} />
    <span className="back-vendor-text"> Back to Supplier List</span>
  </button>
  <h2 style={{ flexGrow: 1, textAlign: 'center', margin:'0px' }}>Supplier Details</h2>
</div>

      <form onSubmit={handleSubmit} className="vendor-form">
        <div className="form-section">
          <label> Name *</label>
          <input  type="text"  autoComplete="off" name="name"  value={formData.name}  onChange={handleChange}  placeholder="Enter  Name"  required  className=" input-field-vendor"
          />
        </div>
        <div className="form-section">
          <label>Address</label>
          <input  type="text" autoComplete="off" name="address"  value={formData.address}  onChange={handleChange}  placeholder="Enter  Address"  className=" input-field-vendor"  />
        </div>
        <div className="form-section">
          <label>Business Type</label>
          <select
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            className=" input-field-vendor select-field-vendor select-back"
          >
            <option value="">Select Business Type</option>
            {businessTypes.map((businessType) => (
              <option key={businessType.id} value={businessType.id}>
                {businessType.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-section">
          <label>City</label>
          <input  type="text"  autoComplete="off" name="city"  value={formData.city}  onChange={handleChange}  placeholder="Enter City"  className=" input-field-vendor"  />
        </div>
        <div className="form-section">
    <label>Website</label>
    {renderWebsite()}
  </div>
        <div className="form-section">
          <label>Tax Information</label>
          <input  type="text"  name="tax_info" autoComplete="off" value={formData.tax_info}  onChange={handleChange}  placeholder="Enter Tax Info"  className=" input-field-vendor" />
        </div>
        <div className="form-section">
          <label>Description</label>
          <input  type="text"  name="description"  autoComplete="off" value={formData.description}  onChange={handleChange}  placeholder="Enter  Description"  className=" input-field-vendor"  />
        </div>
        <div className="form-section">
      <label>Contact Information</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* Email Input */}
        <input
          type="text"
          autoComplete="off"
          name="contact_info_email"
          value={formData.contact_info_email}
          onChange={handleChange}
          placeholder="Email"
          style={{
            width: '49%',
            border: '1px solid #e0d3d3',
            borderRadius: '5px',
            padding: '10px',
          }}
        />
        
        {/* Phone Number Input with Country Code */}
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
        {formData.country_code || 'Select'}
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
              onChange={(e) => updateSearchQuery(e)}
              style={{
                width: '100%',
                padding: '5px 4px',
                marginBottom: '5px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
         {filteredCodes.map((country) => (
            <div
              key={country.code}
              id={`country-option-${country.code}`}
              onClick={() => handleSelect(country.code)}
              style={{
                padding: '4px 0px',
                cursor: 'pointer',
                fontSize: '13px',
                backgroundColor:
                  formData.country_code === country.code ? '#f0f0f0' : 'white',
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
            value={formData.contact_info_phone}
            onChange={handleChange}
            placeholder="Phone Number"
            style={{
              width: '74%',
              border: '1px solid #e0d3d3',
              borderRadius: '0 5px 5px 0',
              padding: '7px 8px 5px 8px',
            }}
          />
        </div>
      </div>
    </div>
        <div className="form-section">
          <label>Industry Information</label>
          <input  type="text"  name="industry_info" autoComplete="off" value={formData.industry_info}  onChange={handleChange}  placeholder="Enter Industry Info"  className=" input-field-vendor" />
        </div>
        <div className="form-section">
          <label> Logo</label>
          <input type="file" name="vendorLogo" onChange={handleFileChange}  style={{padding:'7px'}} className="input-file" />
          {formData.logo && (
            <img src={formData.logo} alt="Logo Preview" className="logo-preview" />
          )}
        </div>
        <div className="form-section input-file-wrapper-vendor">
  <label> Departments</label>
  <div className="departments-container">
    {/* {formData.departments.map((department, index) => (
      <div key={index} className="department-row">
        <input   type="text"  autoComplete="off" placeholder="Department Name"   value={department.department_name}   onChange={(e) => handleChange(e, index, "department_name")}   className=" input-field department-input" 
        />
        <input   type="text"  autoComplete="off" placeholder="Email"   value={department.email}   onChange={(e) => handleChange(e, index, "email")}   className=" input-field department-input" 
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
          style={{  position: 'absolute',  top: '100%',  left: 0,  right: 0,  maxHeight: '30vh',  overflowY: 'auto',  border: '1px solid #ccc',  borderRadius: '0 0 5px 5px', overflowX:'hidden',  backgroundColor: '#fff',  zIndex: 999,  }}>
            <input
              type="text"
              placeholder="Search"
              value={searchQueryDept}
              onChange={(e) => setSearchQueryDept(e.target.value)}
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
              onClick={() => handleSelectDept("country_code",index,country.code)}
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
        <input type="tel" autoComplete="off" placeholder="Contact Number"  value={department.phone_number}  onChange={(e) => handleChange(e, index, "phone_number")}   className=" input-field department-input countryinput" />
        </div>
        <button type="button" onClick={() => removeDepartment(index)} className="remove-btn"> <FontAwesomeIcon icon={faTrash} /> </button>
      </div>
    ))} */}
    {formData.departments.map((department, index) => {
    const searchQuery = searchQueriesDept[index] || '';
    const filteredCodesDept = countryCodes.filter(({ code }) => {
      if (!searchQuery.trim()) return true;

      const normalizedSearch = searchQuery.replace(/^\+/, ''); // Remove the "+" for search
      const normalizedCode = code.replace(/^\+/, ''); // Remove the "+" for matching

      // Match the beginning of the code and anywhere after the "+" symbol
      return normalizedCode.startsWith(normalizedSearch) || normalizedCode.includes(normalizedSearch);
    });
        return (
          <div key={index} className="department-row">
            <input
              type="text"
              autoComplete="off"
              placeholder="Department Name"
              value={department.department_name}
              onChange={(e) => handleChange(e, index, "department_name")}
              className="input-field department-input"
            />
            <input
              type="text"
              autoComplete="off"
              placeholder="Email"
              value={department.email}
              onChange={(e) => handleChange(e, index, "email")}
              className="input-field department-input"
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
                  <ChevronDownIcon style={{ fontSize: 18, float: 'right' }} />
                </div>

                {openDeptDropdownIndex === index && (
                  <div
                    className="dropdown-options"
                    style={{  position: 'absolute',  top: '100%',  left: 0,  right: 0,  maxHeight: '22vh',  overflowY: 'auto',  border: '1px solid #ccc',  borderRadius: '0 0 5px 5px',  overflowX: 'hidden',  backgroundColor: '#fff',  zIndex: 999,
                    }}  >
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQueriesDept[index] || ''}
                      data-dept-index={index}
                      onChange={(e) => updateSearchQueryDept(index, e.target.value)}
                      style={{  width: '100%',  padding: '5px 4px',  marginBottom: '5px',  fontSize: '13px',  borderRadius: '4px',
                        border: '1px solid #ccc', }}  />
                    {filteredCodesDept.map((country) => (
                      <div
                        key={country.code}
                        id={`country-option-${country.code}`}
                        onClick={() => handleSelectDept('country_code', index, country.code)}
                        style={{  padding: '4px 0px',  cursor: 'pointer',  fontSize: '13px',
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
                type="tel"
                autoComplete="off"
                placeholder="Contact Number"
                value={department.phone_number}
                onChange={(e) => handleChange(e, index, "phone_number")}
                className="input-field department-input countryinput"
              />
            </div>
            <button
              type="button"
              onClick={() => removeDepartment(index)}
              className="remove-btn"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        );
      })}
  </div>
  <div className='input-file-wrapper addvendordiv'>
<a  onClick={addDepartment} className="hyperlink-department" style={{ textDecoration: 'none' }}> + Add</a>
</div>
</div>

        <div className="input-file-wrapper-vendor  vendorsavebtn"  style={{marginTop:'10px'}}>
          <button type="submit" className="submit-btn">Save</button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default VendorDetail;
