import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosConfig'; // Assuming you're using axiosInstance for API calls
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const AddAttribute = ({ isSidebarOpen, toggleSidebar }) => {
  useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        toggleSidebar();  // Close the sidebar after 10 seconds
      }, 2000);  // 10 seconds timeout

      // Cleanup the timer if the component is unmounted before the timer ends
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, toggleSidebar]);
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [module, setModule] = useState('select');
  const [attributeValue, setAttributeValue] = useState('');
  const [attributeValues, setAttributeValues] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]); // To hold selected brands
  const [moduleData, setModuleData] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); // Store selected category IDs
  const [selectedCategoryConfigId, setSelectedCategoryConfigId] = useState([]); // Track a single selected category
    const navigate = useNavigate();    

  // Function to fetch module data
  const fetchModuleData = async () => {
    if (!module) return;

    setLoading(true);
    let endpoint = '';

    switch (module) {
      case 'brand':
        endpoint = '/obtainBrand/?search=';
        break;
      case 'category':
        endpoint = '/obtainCategory/?search=';
        break;
      default:
        setModuleData([]);
        setLoading(false);
        return;
    }

    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_IP}${endpoint}`);
      if (module === 'brand') {
        setModuleData(response.data.data.brand_list || []);
      } else if (module === 'category') {
        setModuleData(response.data.data.category_levels || []);
      }
      else if (module === 'select') {
        setModuleData([]);
      }
    } catch (error) {
      console.error('Error fetching module data:', error);
      Swal.fire('Error!', 'An error occurred while fetching data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetching data when module changes
  useEffect(() => {
    fetchModuleData();
  }, [module]);

  const handleAddValue = () => {
    const trimmedValue = attributeValue.trim();
    
    if (trimmedValue) {
      // Normalize both the input and the existing values to lowercase for case-insensitive comparison
      const lowerCaseValues = attributeValues.map(value => value.toLowerCase());
  
      if (!lowerCaseValues.includes(trimmedValue.toLowerCase())) {
        // If the value doesn't already exist, add it to the list
        setAttributeValues([...attributeValues, trimmedValue]);
        setAttributeValue('');
      } else {
        // If the value already exists (case-insensitive), show a warning
        setAttributeValue('');
        Swal.fire('Warning!', 'This value already exists.', 'warning');
      }
    } else {
      // If the input is empty, show a validation message
      Swal.fire('Error!', 'Please enter a valid attribute value.', 'error');
    }
  };
  
  const handleRemoveValue = (valueToRemove) => {
    setAttributeValues(attributeValues.filter(value => value !== valueToRemove));
  };

  // Updated handleSelectionChange for checkboxes
  const handleSelectionChange = (e) => {
    const selectedValues = Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    setSelectedBrands(selectedValues);
  };

  // Handle category expansion
  const toggleExpand = (event, categoryId) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };
  const toggleSelectCategory = (categoryId, parentLevelIds = []) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(categoryId);
  
      let updatedCategories = isSelected
        ? prev.filter((id) => id !== categoryId) // Remove the category if already selected
        : [
            ...prev,
            categoryId, 
            ...parentLevelIds.filter((id) => !prev.includes(id)), // Add the parent categories if not selected
          ];
  
      return updatedCategories;
    });
    setSelectedCategoryConfigId((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId) // Remove category if already selected
        : [...prev, categoryId] // Add category if not selected
    );
  }
  // Function to render categories in a tree structure
  const renderCategories = (category) => {
    const children = Array.isArray(category.children) ? category.children : [];

    return (
      <div key={category.id} style={{ marginLeft: children.length > 0 ? '20px' : '49px', marginBottom: '3px' }}>
        <div>
          {children.length > 0 && (
            <button onClick={(event) => toggleExpand(event, category.id)} style={{ marginRight: '5px', marginBottom:'2px' }}>
              {expanded[category.id] ? '−' : '+'}
            </button>
          )}
          <input
            type="checkbox"
            checked={selectedCategories.includes(category.config_id)} // Check if category is selected
            onChange={() => toggleSelectCategory(category.config_id, category.parent_level_ids)} // Toggle category selection
            style={{ marginRight: '5px', width:'3%' }}
          />
          <span>{category.name}</span>
        </div>
        {expanded[category.id] && children.map(renderCategories)}
      </div>
    );
  };
  

  const handleSubmit = async () => {
    if (!name || !type || !module || attributeValues.length === 0) {
      Swal.fire('Error!', 'Please fill all fields and add at least one attribute value', 'error');
      return;
    }

    let payload = {
      name,
      type,
      module_id: module === 'brand' ? selectedBrands : selectedCategoryConfigId, // Send selected brands or categories based on the module
      values: attributeValues,
      module_name: module,
    };

    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createAttribute/`, payload);      
      if (response.data.data.is_created === true) {
        setName('');
        setType('text');
        setModule('');
        setAttributeValues([]);
        setSelectedBrands([]); // Clear selected brands/categories
        setSelectedCategories([]); // Clear selected categories
        Swal.fire({
          title: 'Success!',
          text: 'New attribute added successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          allowOutsideClick: false, // Disable closing by clicking outside
        }).then((result) => {
          if (result.isConfirmed) {
            handleBackToAttributeList(module);
          }
        });
        
      }else if (response.data.data.is_created === false) {
                      Swal.fire({ title: 'Warning!', text: 'This attribute is already present.', icon: 'warning', confirmButtonText: 'OK'  }); 
                  } else {
        Swal.fire('Error!', 'Failed to add the attribute. Please try again.', 'error');
      }
    } catch (error) {
      Swal.fire('Error!', 'An error occurred while adding the attribute. Please try again.', 'error');
      console.error('Error adding attribute:', error);
    }
  };
  const handleBackToAttributeList = (module) => {
    if (module.length > 0) {
      navigate(`/Admin/attributes?module=${module}`);
    }
    else{
      navigate(`/Admin/attributes`);
    }
  };
  return (

    <div style={{ padding: '25px 20px 20px 20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', position: 'relative' }}>
<div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <button  onClick={handleBackToAttributeList}  className="back-button" style={{ marginRight: '10px', display: 'flex', alignItems: 'center', padding:'8px 12px', borderRadius:'23px' }} >
           <FontAwesomeIcon icon={faArrowLeft} />
           <span className="back-vendor-text"> Back to Attribute List</span>
         </button>
      </div>     
      <div style={{ flex: '1', margin: '15px 20px 0px 0px' }}>
        <h2>Create Attribute</h2>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            autoComplete="off"
            placeholder="Attribute Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <select
            value={type}
            className='select-back'
            onChange={(e) => setType(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="text">Text *</option>
            <option value="integer">Integer *</option>
            <option value="decimal">Decimal *</option>
            <option value="boolean">Boolean *</option>
            <option value="multiselect">Multiselect *</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <select
            value={module}
            className='select-back'
            onChange={(e) => setModule(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="select">Select a module *</option>
            <option value="global">Global</option>
            <option value="brand">Brand</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            autoComplete="off"
            placeholder="Enter attribute value *"
            value={attributeValue}
            onChange={(e) => setAttributeValue(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button
            onClick={handleAddValue}
            style={{
              backgroundColor: '#a52be4', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', border: 'none', marginLeft: '10px', float: 'right',
            }}>
            Add Value
          </button>
        </div>

        <div style={{ padding: '20px 0px 20px 0px' }}>
          {attributeValues.map((value, index) => (
            <span
              key={index}
              style={{ backgroundColor: '#e2e2e2', padding: '5px 10px', margin: '5px', borderRadius: '5px', fontSize: '14px', cursor: 'pointer' }} >
              {value}
              <span
                onClick={() => handleRemoveValue(value)}
                style={{ color: 'red', cursor: 'pointer', marginLeft: '10px' }}>
                X
              </span>
            </span>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          style={{ backgroundColor: 'rgb(165, 43, 228)', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer',float:'right' }}>
          Create
        </button>
      </div>

      {/* Right Side - Module Data (for selecting brands or categories) */}
      <div style={{ flex: '1', borderLeft: '1px solid #ddd', paddingLeft: '20px',  margin: '15px 20px 0px 0px' }}>
        <h2>List </h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{maxHeight:'230px', overflowY:'auto', border:'1px solid #ddd', borderRadius:'4px', padding:'7px 10px 4px 0px'}}>
            {moduleData.length > 0 ? (
              module === 'category' ? (
                moduleData.map(renderCategories) // Render categories as a tree
              ) : (
                moduleData.map((item, index) => (
                  <label key={index} style={{ display: 'block', marginBottom: '5px' }}>
                    <input
                      type="checkbox"
                      value={item.id}
                      onChange={handleSelectionChange}
                      style={{ marginRight: '10px', width:'3%' }}
                    />
                    {item.name || item.title || item.product_name}
                  </label>
                ))
              )
            ) : (
              // <p>No {module} found.</p>    //previous
              <div style={{ textAlign: 'center' }}>
              {module === 'select' && <p>Select a module to view its data.</p>}
              {module === 'global' && <p>No list available for Global module.</p>}
              {module === 'brand' && <p>No list available for the selected module.</p>}
              {module === 'category' && <p>No list available for the selected module.</p>}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAttribute;
