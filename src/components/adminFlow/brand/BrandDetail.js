import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import './BrandDetail.css';  // Import custom CSS for styling
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import validator from 'validator';
import Unauthorized from "../../../Unauthorized";

const BrandDetail = ({ isSidebarOpen, toggleSidebar }) => {
  const { brandId } = useParams();  // Get the brandId from the URL
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
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingforLogo, setLoadingforLogo] = useState(false);
  const [countries, setCountries] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country_of_origin: '',
    status: '',
    website: '',
    description: '',
    warranty_details: '',
    warranty_details_based: '',
    logo: '',
  });
  const [isEditingWebsite, setIsEditingWebsite] = useState(false); // State to toggle between view and edit mode for website

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setLoadingforLogo(true);
    if (file) {
      // Create a FormData object to send the file as part of a POST request
      const formDataToSend = new FormData();
      formDataToSend.append('logo', file);  // Append file to FormData
      formDataToSend.append('brand_id', brandId);  // Append file to FormData

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
          setUnsavedChanges(true);
        // Update the formData with the new logo (this can be base64 string or URL from API)
        setFormData({
          ...formData,
          logo: updatedLogo,  // The updated logo from API response
        });
        setLoadingforLogo(false);
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

  const handleChange = (e) => {
    setUnsavedChanges(true);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        const countryList = data.map((country) => ({
          code: country.cca2, 
          name: country.name.common 
        }));
        setCountries(countryList);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch brand data
  const fetchBrandData = async () => {
    setLoadingforLogo(true);
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBrand/?id=${brandId}&&search=`);
      if (response.data && response.data.data) {
        const brandData = response.data.data.brand_list[0];
        setFormData({
          name: brandData.name,
          country_of_origin: brandData.country_of_origin,
          status: brandData.status,
          website: brandData.website,
          description: brandData.description,
          warranty_details: brandData.warranty_details,
          warranty_details_based: brandData.warranty_details_based,
          logo: brandData.logo,
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
      console.error('Error fetching brand data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!brandId) {
      console.error('Brand ID is missing');
      return;
    }
    fetchBrandData();
  }, [brandId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (unsavedChanges === false) {
      Swal.fire({
        title: 'Info!',
        text: 'No changes were made to save.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const dataToSend = {
        ...formData,
        id: brandId,
      };
      let update_obj = { update_obj: dataToSend };
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_IP}/brandUpdate/`,
        update_obj,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll smoothly to the top
      }, 100);
      if (response.data.data.is_updated === true) {
        Swal.fire({
          title: 'Success!',
          text: 'Brand updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => { navigate('/Admin/brands'); });
        setUnsavedChanges(false);
        fetchBrandData();
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Brand update failed.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error('Error updating brand:', error);
    }
  };

  const handleBackToBrandList = () => {
    navigate('/Admin/brands');
  };

  const maxLength = 50;
  // Function to render website
  const renderWebsite = () => {
   
    let isValidUrl = false;
    let truncatedWebsite = formData.website || "";
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

if (unauthorized) {
  navigate(`/unauthorized`);
}
  if (loading) return <div style={{margin:'20px 0px 0px 0px'}}>Loading brands...</div>;

  return (
    <div>
      {loadingforLogo && (
        <div className="loader-overlay">
          <div className="spinner"></div> {/* Custom spinner */}
        </div>
      )}
    <div className="brand-details-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          onClick={handleBackToBrandList}
          className="back-button"
          style={{ marginRight: '10px', display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: '23px' }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span className="back-vendor-text"> Back to Brand List</span>
        </button>
        <h2 style={{ flexGrow: 1, textAlign: 'center', margin: '0px' }}>Brand Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="brand-form" style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column */}
        <div className="form-section">
          <label>Brand Name *</label>
          <input
            type="text"
            name="name"
            autoComplete="off"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Brand Name"
            required
            className="input-field"
          />
        </div>

        <div className="form-section">
          <label>Country of Origin</label>
          <select
            name="country_of_origin"
            value={formData.country_of_origin}
            onChange={handleChange}
            className="input-field select-field select-back"
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input-field select-field select-back"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

  <div className="form-section">
    <label>Website</label>
    {renderWebsite()}
  </div>
        {/* Right Column */}
        <div className="form-section">
          <label>Description</label>
          <input
            type="text"
            name="description"
            autoComplete="off"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="input-field"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center',width: '100%' }}>
  <label style={{ marginRight: '10px',width: '33%' }}>Warranty</label>
  <input
    type="number"
    autoComplete="off"
    name="warranty_details"
    value={formData.warranty_details}
    onChange={handleChange}
    onWheel={(e) => e.target.blur()}
    placeholder="Enter number"
    className="warranty-input"
    style={{ marginRight: '8px',width: '33%', border:'1px solid #ccc', borderRadius:'4px' }}  // Adds space between input and dropdown
  />
  <select
    name="warranty_details_based"
    value={formData.warranty_details_based}
    onChange={handleChange}
    className='select-back'
    style={{ margin: '0px 0px 5px 0px',width: '33%', padding:'9px', border:'1px solid #ccc', borderRadius:'4px' }}  // Adjust width as needed
  >
    <option value="">Select Warranty</option>
    <option value="years">Year(s)</option>
    <option value="months">Month(s)</option>
    <option value="weeks">Week(s)</option>
    <option value="days">Day(s)</option>
  </select>
</div>


        <div className="form-section">
          <label>Logo</label>
          <input
            type="file"
            name="logo"
            autoComplete="off"
            onChange={handleFileChange}
            style={{ padding: '7px' }}
            className="input-file-brand"
          />
            {formData.logo && (
            <img src={formData.logo} alt="Logo Preview" className="logo-preview" />
          )}
        </div>

        <div className="form-section addvendordiv" style={{ gridColumn: 'span 2' }}>
          <button type="submit" className="submit-btn ">Save</button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default BrandDetail;
