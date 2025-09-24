import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import './AddBrand.css'; // Ensure the correct path to the CSS file
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
const AddBrand = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
   useEffect(() => {
            if (isSidebarOpen) {
              const timer = setTimeout(() => {
                toggleSidebar();  // Close the sidebar after 10 seconds
              }, 2000);  // 10 seconds timeout
        
              // Cleanup the timer if the component is unmounted before the timer ends
              return () => clearTimeout(timer);
            }
          }, [isSidebarOpen, toggleSidebar]);
  const [brandDetails, setBrandDetails] = useState({
    name: '',
    country_of_origin: '',
    status: '',
    website: '',
    description: '',
    warranty_details: '',
    warranty_details_based: '',
    logo: null,
  });

  useEffect(() => {
    const fetchCountries = async () => {
        try {
          const response = await fetch('https://restcountries.com/v3.1/all');
          const data = await response.json();
          const countryList = data.map((country) => ({
            code: country.cca2, // Using 'cca2' as the country code
            name: country.name.common // Using 'common' name
          }));
          setCountries(countryList);
        } catch (error) {
          console.error('Error fetching countries:', error);
        }
      };

    fetchCountries();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBrandDetails({
      ...brandDetails,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setBrandDetails({
      ...brandDetails,
      logo: e.target.files[0],
      logoPreview: URL.createObjectURL( e.target.files[0]), // Create and store the image preview URL

    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation check
    if (!brandDetails.name) {
      Swal.fire({
        icon: 'warning!',
        title: 'Please fill the brand name.',
      });
      return;
    }
    
    // Send request after logo conversion
    // const sendPostRequest = async () => {
      try {
        const formData = new FormData();
        // Append form data fields to FormData
        formData.append('name', brandDetails.name);
        formData.append('country_of_origin', brandDetails.country_of_origin);
        formData.append('status', brandDetails.status);
        formData.append('website', brandDetails.website);
        formData.append('description', brandDetails.description);
        formData.append('warranty_details', brandDetails.warranty_details);
        formData.append('warranty_details_based', brandDetails.warranty_details_based);
          formData.append('logo', brandDetails.logo);
        const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createBrand/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important to set the correct header for FormData
          },
        });

        if (response.data.data.is_created === true) {
          Swal.fire({
            title: 'Success!',
            text: 'Brand added successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            navigate(`/Admin/brands`);
          });
        } else if(response.data.data.is_created === false){
          Swal.fire({
            title: 'Warning!',
            text: response.data.data.error,
            icon: 'warning',
            confirmButtonText: 'OK',
          });
        }else {
          Swal.fire({
            icon: 'error',
            title: 'Error adding brand!',
            text: response.data.data.message,
          });
        }
      } catch (error) {
        console.error('Error adding brand:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to add brand!',
        });
        
      }
    // };

    // Convert logo to base64 if provided
    // if (brandDetails.logo) {
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     const logoBase64 = reader.result.split(',')[1]; // Remove data URI prefix
    //     sendPostRequest(logoBase64);
    //   };
    //   reader.readAsDataURL(brandDetails.logo);
    // } else {
    //   sendPostRequest(''); // If no logo, send empty string for the logo
    // }
  };
  const handleBackToBrandList = () => {
    navigate('/Admin/brands');
  };
  return (
    <div className="add-brand-page">
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop:'10px' }}>
              <button onClick={handleBackToBrandList} className="back-button" style={{ marginRight: '10px', display: 'flex', alignItems: 'center', padding:'8px 12px', borderRadius:'23px' }}>
                <FontAwesomeIcon icon={faArrowLeft} />  <span className="back-vendor-text"> Back to Brand List</span>  </button>
              <h2 style={{ flexGrow: 1, textAlign: 'center', margin: '0px' }}>Add New Brand</h2>
            </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name *</label>
          <input
            type="text"
            autoComplete="off"
            name="name"
            value={brandDetails.name}
            onChange={handleInputChange}
            placeholder=" Name"
          />
        </div>
        <div>
          <label>Country of Origin</label>
          <select style={{color:'#6a6a6a'}}
            name="country_of_origin"
            className='select-back'
            value={brandDetails.country_of_origin}
            onChange={handleInputChange}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Status</label>
          <select style={{color:'#6a6a6a'}}
            name="status"
            className='select-back'
            value={brandDetails.status}
            onChange={handleInputChange}
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label>Website</label>
          <input
            type="url"
            autoComplete="off"
            name="website"
            value={brandDetails.website}
            onChange={handleInputChange}
            placeholder="Website"
          />
        </div>
        <div>
          <label>Description</label>
          <input
            type="text"
            autoComplete="off"
            name="description"
            value={brandDetails.description}
            onChange={handleInputChange}
            placeholder="Description"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center',width: '98%', flexDirection:'row' }}>
  <label style={{ marginRight: '10px',width: '33%' }}>Warranty</label>
  {/* <div className="warranty-container"> */}
    <input
      type="number"
      autoComplete="off"
      name="warranty_details"
      value={brandDetails.warranty_details}
      onChange={handleInputChange}
      onWheel={(e) => e.target.blur()}
      placeholder="Enter number"
      className="warranty-input"
      style={{ marginRight: '8px',width: '33%', border:'1px solid #ccc', borderRadius:'4px' }} 
    />
    <select
      name="warranty_details_based"
      className='select-back'
      value={brandDetails.warranty_details_based}
      onChange={handleInputChange}  style={{ margin: '0px 8px 5px 0px',width: '33%', padding:'9px', border:'1px solid #ccc', borderRadius:'4px' }}
    >      <option value="">Select Warranty</option>
     <option value="years">Year(s)</option>
    <option value="months">Month(s)</option>
    <option value="weeks">Week(s)</option>
    <option value="days">Day(s)</option>
    </select>
  {/* </div> */}
</div>
        <div>
          <label>Logo</label>
          <input type="file" accept="image/*"  style={{padding:'7px'}} onChange={handleFileChange} />
          {brandDetails.logoPreview && (
  <div style={{ marginTop: '10px', display: 'inline-block' }}>
    <img
      src={brandDetails.logoPreview}
      alt="Logo Preview"
      className="logo-preview"
    />
  </div>
)}

        </div>
        <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '20px', padding:'0px 0px 0px 24px' }} className='addvendordiv'>
      <button type="submit" className="add-brand-btn" style={{width:'10%', padding:'9px'}}>Add</button>
    </div>
      </form>
    </div>
  );
};

export default AddBrand;
