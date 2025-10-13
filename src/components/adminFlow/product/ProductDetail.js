import React, { useState, useEffect,useRef } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './ProductDetail.css';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft,faTrash } from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill'; // Import the Quill editor
import 'react-quill/dist/quill.snow.css'; // Import Quill's styles
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete Icon from Material UI
import EditIcon from '@mui/icons-material/Edit'; // Import the Edit icon
import 'font-awesome/css/font-awesome.min.css'; // Ensure to import FontAwesome
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Unauthorized from "../../../Unauthorized";

const ProductDetail = ({ isSidebarOpen, toggleSidebar }) => {
    // State variables
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
  const location = useLocation();
    const [editMode, setEditMode] = useState({
      short_description: false,
      personalized_short_description: false,
      long_description: false,
      personalized_long_description: false
    });
  
        const handleToggleEditMode = (event,section) => {
          event.preventDefault();
          setEditMode((prevMode) => ({
            ...prevMode,
            [section]: !prevMode[section] // Toggle edit mode for the clicked section
          }));
        };
        const [unauthorized, setUnauthorized] = useState(false);

    const [loading, setLoading] = useState(false); // Add loading state
    const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const { productId } = useParams();    
    const [formData, setFormData] = useState({ product_id: productId, mpn: '',  sku: '',  upc: '',  ean: '',  gtin: '',  unspc: '',  model: '', config_id:'',category_group_list:[], category_id: '',  breadcrumb: '',  name: '',  short_description: '',  personalized_short_description: '',  long_description: '',  personalized_long_description: '',  feature_list: [],  attribute_list: [], global_attribute_list: [], brand_attribute_list: [], category_attribute_list: [],  related_products: [],  application: '',  certifications: '',  Compliance: '',  Prop65: '',  esg: '',  Hazardous: '',  service_warranty: '',  product_warranty: '',  country_of_origin: '',  currency: '',  msrp: 0,  selling_price: 0,  discount_price: 0,  attachment_list: [],  image_list: [],  video_list: [],  vendor_id: '',  brand_id: '',  manufacturer_id: '',variants: [],
});
    const [originalData, setOriginalData] = useState({});
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [companyOptions, setCompanyOptions] = useState([]); 
    const [activeTab, setActiveTab] = useState('basic-info');
    const [countries, setCountries] = useState([]);
    const inputRef = useRef(null);
    const [minHeight, setMinHeight] = useState("125vh");  // Set initial min-height to 125vh
    const [minHeightText, setMinHeighttext] = useState("100px");  // Set initial min-height to 125vh
    const [minHeightTextforPShort, setMinHeighttextPshort] = useState("100px");  // Set initial min-height to 125vh
    const [minHeightTextforPlong, setMinHeighttextPlong] = useState("100px");  // Set initial min-height to 125vh
    const [minHeightTextforShort, setMinHeighttextshort] = useState("100px");  // Set initial min-height to 125vh
    const [minHeightTextforfeature, setMinHeighttextfeature] = useState("100px");  // Set initial min-height to 125vh
    const [minHeightTextforfeatureforOverview, setMinHeighttextfeatureforOverview] = useState("100");  // Set initial min-height to 125vh

    const resetInputValue = () => {
        if (inputRef.current) {
            inputRef.current.value = "";  // Reset the input value using ref
        }
    };
    
    const calculateContentHeight = (content) => {
      const lines = content.split('\n').length;
      return Math.max(100, lines * 30); // 30px per line as an estimate
    };
  // Adjust the height of the textarea dynamically based on content
const adjustTextareaHeight = (textarea) => {
  if (textarea) {
    const lineCount = textarea.split('.').reduce((count, sentence) => {
      return count + (sentence.trim() !== "" ? 1 : 0);
    }, 0);    
    let minHeights = 100 + lineCount * 20;
    setMinHeighttext(`${minHeights+15}px`);

  }
};
const adjustTextareaHeightp = (textarea) => {
  if (textarea) {
    const lineCount = textarea.split('.').reduce((count, sentence) => {
      return count + (sentence.trim() !== "" ? 1 : 0);
    }, 0); 
    let minHeights = 100 + lineCount * 20;
    setMinHeighttextPshort(`${minHeights+15}px`);
  }
};
const adjustTextareaHeightPL = (textarea) => {
  if (textarea) {
    const lineCount = textarea.split('.').reduce((count, sentence) => {
      return count + (sentence.trim() !== "" ? 1 : 0);
    }, 0);    
    let minHeights = 100 + lineCount * 20;
    setMinHeighttextPlong(`${minHeights+15}px`);
  }
};
const adjustTextareaHeightS = (textarea) => {
  if (textarea) {
    const lineCount = textarea.split('.').reduce((count, sentence) => {
      return count + (sentence.trim() !== "" ? 1 : 0);
    }, 0);    
    let minHeights = 100 + lineCount * 20;
    console.log(minHeights,'minHeight');
    setMinHeighttextshort(`${minHeights+5}px`);
  }
};
const adjustTextareaHeightFeature = (textarea) => {  
  if (textarea.length > 0) {
    const lineCount = textarea.split('\n').length;    
    let minHeights = 100 + lineCount * 15;
    console.log(minHeights,'minHeight');
    setMinHeighttextfeatureforOverview(minHeights);
    setMinHeighttextfeature(`${minHeights}px`);
  }
};
useEffect(() => {
  // Select the textareas by their names (matching formData fields)
  adjustTextareaHeightp(formData.personalized_short_description);
  adjustTextareaHeight(formData.long_description);
  adjustTextareaHeightPL(formData.personalized_long_description);
  adjustTextareaHeightS(formData.short_description);
  adjustTextareaHeightFeature(formData.feature_list);
}, [formData]);

    useEffect(() => {
      // Dynamically adjust the height based on content length
      const shortDescriptionHeight = calculateContentHeight(formData.short_description);
      const personalizedShortDescriptionHeight = calculateContentHeight(formData.personalized_short_description);
      const longDescriptionHeight = calculateContentHeight(formData.long_description);
      const personalizedLongDescriptionHeight = calculateContentHeight(formData.personalized_long_description);
      // Calculate the minimum height dynamically for the container
      setMinHeight(
        activeTab === 'attribute'
          ? '210vh' // Fixed height for 'attribute' tab
          : activeTab === 'description'
          ? `${Math.max(255, shortDescriptionHeight + personalizedShortDescriptionHeight + longDescriptionHeight + personalizedLongDescriptionHeight + minHeightTextforfeatureforOverview + 20)}vh` // Dynamic height for 'description' tab
          : '125vh' // Default height for any other tabs
      );
    }, [formData, activeTab]);
    // State for dropdowns
    const [inputStyle, setInputStyle] = useState({
      color: 'transparent', // Initially set to transparent
      textAlign: 'center',
      background: 'none',
      cursor: 'pointer',
    });
    const [manufacturers, setManufacturers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [parentCategoryId, setParentCategoryId] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [selectedCategories, setSelectedCategories] = useState({});
    const [showAll, setShowAll] = useState(false); // Toggle for displaying all categories
    const [isInitialLoad, setIsInitialLoad] = useState(true); // State to track initial load
    useEffect(() => {
                 if (newCategoryName.trim()) {
                   checkDuplicateCategory(newCategoryName);
                 } else {
                   setCategoryError("");
                 }
               }, [newCategoryName]);
    const modules = {
        toolbar: [
          [{ 'font': ['sans-serif', 'serif', 'monospace'] }],
          [{ size: [] }],
          [{ 'header': '1' }, { 'header': '2' }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'image', 'video', 'formula'],
          ['clean']
        ]
      };
      const formats = [
        'font', 'size', 'header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'script',
        'blockquote', 'code-block', 'list', 'bullet', 'indent', 'align', 'link', 'image', 'video', 'formula'
      ];
      
const handleAddAttribute = (event) => {
    event.preventDefault();
    // Initial value container to keep track of added attribute values
    let attributeValues = [];

    Swal.fire({
        title: 'Add Attribute',
        html: `
            <div>
                <input id="name" class="swal2-input" autocomplete="off" placeholder="Attribute name" style="margin: 0px 0px 10px 0px; font-size: 16px;width:100%;" required>
                <select id="type" class="swal2-input select-back" style="margin: 0px 0px 10px 0px; font-size: 16px; border-color: #c5c5c5; border-radius: 3px; color:#c5c5c5;width:100%;">
                    <option value="text">Text</option>
                    <option value="integer">Integer</option>
                    <option value="decimal">Decimal</option>
                    <option value="boolean">Boolean</option>
                    <option value="multiselect">Multiselect</option>
                </select>
                <input id="attribute-value" class="swal2-input" autocomplete="off" placeholder="Enter attribute value" style="margin: 10px 0px 10px 0px; font-size: 16px;width: 100%;" />
                <button id="add-value-btn" style="font-size: 16px; background-color: #a52be4; color: white;float: right;border-radius: 5px; padding: 8px 16px; border: none; cursor: pointer; margin-top: 10px;">
                Add Value
                </button>
                <div id="added-values-tags" style="margin-top: 15px;"></div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        reverseButtons:true,
        cancelButtonText: 'Cancel',



          preConfirm: async () => {
            const name = document.getElementById('name').value;
            const type = document.getElementById('type').value;

            // Get all the attribute values
            const allValues = attributeValues;

            // Validation check
            if (!name || !type || allValues.length === 0) {
                Swal.showValidationMessage('Please fill all fields and add at least one attribute value');
                return false;
            }

            try {
                // Sending data to API using axios
                const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createAttribute/`, {
                    name,
                    type,
                    module_id:[productId],
                    values: allValues,
                    module_name:'product', // Send the values as an array
                });

                console.log('Create attribute API Response:', response.data); // Debug log
                
                // Check the response from the API
                if (response.data.is_created === true) { // Remove the extra .data layer
                    Swal.fire('Success!', 'New attribute added successfully.', 'success');
                    fetchProductDetails();
                } else if (response.data.is_created === false) { // Remove the extra .data layer
                    Swal.fire({ title: 'Warning!', text: 'This attribute is already present.', icon: 'warning', confirmButtonText: 'OK'  });
                    fetchProductDetails();
                } else {
                    Swal.fire('Error!', 'Failed to add the attribute. Please try again.', 'error');
                }
            } catch (error) {
                Swal.fire('Error!', 'An error occurred while adding the attribute. Please try again.', 'error');
                console.error('Error adding attribute:', error);
            }
        },
    });
      
        // Add a click event to the "Add Value" button
        document.getElementById('add-value-btn').addEventListener('click', () => {
          const valueInput = document.getElementById('attribute-value');
          const newValue = valueInput.value.trim();
          // Only add if the value is non-empty and not already added
          if (newValue && !attributeValues.includes(newValue)) {
            // Add the new value to the array
            attributeValues.push(newValue);
            // Create a tag for the added value
            const tag = document.createElement('span');
            tag.textContent = newValue;
            // Style the tag
            tag.style.backgroundColor = '#e2e2e2';
            tag.style.padding = '5px 10px';
            tag.style.margin = '5px';
            tag.style.borderRadius = '5px';
            tag.style.display = 'inline-block';
            tag.style.fontSize = '14px';
            tag.style.cursor = 'pointer';
            // Create a remove icon
            const removeIcon = document.createElement('span');
            removeIcon.textContent = ' X';
            removeIcon.style.color = 'red';
            removeIcon.style.cursor = 'pointer';
            removeIcon.style.marginLeft = '10px';
            // Append the remove icon to the tag
            tag.appendChild(removeIcon);
            // Append the tag to the display area
            document.getElementById('added-values-tags').appendChild(tag);
            // Clear the input field
            valueInput.value = '';
            // Add event listener to the remove icon
            removeIcon.addEventListener('click', () => {
              // Remove the tag and value from the array
              tag.remove();
              attributeValues = attributeValues.filter(val => val !== newValue);
            });
          }else if (attributeValues.includes(newValue)) {
            // If the value already exists, show a warning popup
            Swal.fire('Warning!', 'This value already exists.', 'warning');
          } else {
            // If the input is empty, show a validation message
            Swal.fire('Error!', 'Please enter a valid attribute value.', 'error');
          }
        });
      };

   
const handleAddValue = async (attributeName) => {
    // Show SweetAlert2 input pop-up
    const { value: newValue } = await Swal.fire({
        title: 'New Attribute Value',
        input: 'text',
        inputPlaceholder: 'Enter value',
        showCancelButton: true,
        confirmButtonText: 'Add',
        cancelButtonText: 'Cancel',
        reverseButtons:true,
        inputAttributes: {
            autocomplete: 'off' 
        },
        inputValidator: (value) => {
            if (!value) {
                return 'Please enter a value!';
            }
        },
    });

    if (newValue) {
        try {
            // Send the new value to the backend API
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createAttribute/`, {
                module_id: [productId],
                module_name:'product',
                name: attributeName,
                new:newValue,
            });

            console.log('Add attribute value API Response:', response.data); // Debug log

            if (response.data.is_created === true) { // Remove the extra .data layer
                fetchProductDetails();
                // If the value is successfully added, update the UI
                Swal.fire('Success!', 'New value added successfully.', 'success');
                // Optionally, you can update the attribute values here
                // For example, call a function to update the state or reload attributes.
            } else if (response.data.is_created === false) { // Remove the extra .data layer
                Swal.fire({ title: 'Warning!', text: 'This attribute value is already present.', icon: 'warning', confirmButtonText: 'OK'  });
                fetchProductDetails();
            }
        } catch (error) {
            console.error('Error adding value:', error);
            Swal.fire('Error!', 'There was an issue adding the value. Please try again later.', 'error');
        }
    }
};

 const fetchCategories = async () => {
    try {
        const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/obtainCategory/`, { level: 0 });
        console.log('Categories API Response:', response.data); // Debug log
        setCategories(response.data.category_levels || []); // Remove the extra .data layer
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};
       useEffect(() => {
            fetchCategories();
        }, []);
    // Handle Tab Change
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainb2cCompany/`);                
                if (response.data) {
                    const companies = response.data.b2cCompany_list.map((company) => ({                        
                        value: company.id,
                        label: company.name,
                    }));
                    setCompanyOptions(companies);                    
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        fetchCompanies();
    }, []);

    const handleTabClick = (tab) => {
        if (unsavedChanges) {
            const shouldNavigate = window.confirm("You have some unsaved changes, do you want to continue?");
            if (!shouldNavigate)   return; // Don't change the view
           setFormData(originalData);  
           fetchProductDetails(); 
           setUnsavedChanges(false); 
          }
        setActiveTab(tab);
    };
    
    const toggleExpand = (event, id) => {
        event.preventDefault();
        setExpanded(prev => {
            const updated = { ...prev, [id]: !prev[id] };
            updateMinHeight(updated);
            return updated;
        });
    };
    const updateMinHeight = (expanded) => {
        const expandedCount = Object.values(expanded).filter(Boolean).length;
        const height = expandedCount > 0 ? `${125 + expandedCount * 10}vh` : "125vh";
        setMinHeight(height);
    };
    // const toggleSelect = (config_id) => {
    //     setUnsavedChanges(true); 
    //     setFormData(prev => ({
    //         ...prev,
    //         category_id: prev.category_id.includes(config_id) 
    //             ? prev.category_id.filter(item => item !== config_id) // Remove config_id if already selected
    //             : [...prev.category_id, config_id] // Add config_id to the list if not already selected
    //     }));
    //     setSelectedCategories(prev => ({ ...prev, [config_id]: !prev[config_id] }));
    // };
    const toggleSelect = (config_id, parent_level_ids = [], children = []) => {
      setUnsavedChanges(true);
  
      setFormData(prev => {
          const isSelected = prev.category_id.includes(config_id);
          let updatedCategories;
  
          if (isSelected) {
              // Unchecking a category
              const remainingSelected = prev.category_id.filter(id => id !== config_id);
  
              // Check if any sibling remains checked under the same parent
              const isAnotherChildChecked = children.some(child => remainingSelected.includes(child.config_id));
  
              if (!isAnotherChildChecked) {
                  // If no other child is checked, remove the parent categories too
                  updatedCategories = remainingSelected.filter(id => !parent_level_ids.includes(id));
              } else {
                  // If another child is checked, only remove the current category
                  updatedCategories = remainingSelected;
              }
          } else {
              // Checking a category: add category and ensure parents are checked
              updatedCategories = [...prev.category_id, config_id];
  
              parent_level_ids.forEach(parent_id => {
                  if (!updatedCategories.includes(parent_id)) {
                      updatedCategories.push(parent_id);
                  }
              });
          }
  
          return { ...prev, category_id: updatedCategories };
      });
  
      setSelectedCategories(prev => {
          const updatedState = { ...prev };
          const isCurrentlySelected = prev[config_id];
  
          if (isCurrentlySelected) {
              // Unchecking a category
              delete updatedState[config_id];
  
              // Check if any sibling remains checked
              const isAnotherChildChecked = children.some(child => updatedState[child.config_id]);
  
              if (!isAnotherChildChecked) {
                  // If no other sibling is checked, uncheck the parent
                  parent_level_ids.forEach(parent_id => delete updatedState[parent_id]);
              }
          } else {
              // Checking a category: ensure parents are checked
              updatedState[config_id] = true;
              parent_level_ids.forEach(parent_id => updatedState[parent_id] = true);
          }
  
          return updatedState;
      });
  };
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
    // Fetch product details on load

const fetchProductDetails = async () => {
    setLoading(true);
    try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainProductDetails/?id=${productId}`);
        console.log('Product details API Response:', response.data); // Debug log
        const productData = response.data || {}; // Remove the extra .data layer
        setFormData(productData);
        setLoading(false)
        setOriginalData(productData);
        if (response.status === 401) {
            setUnauthorized(true);
        } 
    } catch (error) {
        setLoading(false);
        if (error.status === 401) {
            setUnauthorized(true);
        } else {
            console.error('Error fetching ProductDetails:', error);
            Swal.fire({ title: 'Error!', text: 'Failed to load ProductDetails.', icon: 'error', confirmButtonText: 'OK' });
        }
    }
};
    useEffect(() => {
        fetchProductDetails();
    }, [productId]);
   
    useEffect(() => {
        if (formData.category_id && Array.isArray(formData.category_id)) {
            // Ensure category_id is an array and exists
            setSelectedCategories(
                formData.category_id.reduce((acc, id) => {
                    acc[id] = true; // Pre-select categories that match formData.category_id
                    return acc;
                }, {})
            );
        }
    }, [formData]);
  
    const hasSelectedDescendant = (category) => {
      if (selectedCategories[category.config_id]) return true;
      return category.children.some(hasSelectedDescendant);
  };
  
  const renderCategories = (category) => {
      if (!showAll && !hasSelectedDescendant(category)) {
          return null;
      }
      return (
          <div key={category.id} style={{ marginLeft: category.children.length > 0 ? "10px" : "39px", marginBottom: "3px" }}>
              <div>
                  {category.children.length > 0 && (
                      <button onClick={(event) => toggleExpand(event, category.id)} style={{ margin: "0px 5px 4px 0px" }}>
                          {expanded[category.id] ? "−" : "+"}
                      </button>
                  )}
                  <input
                      type="checkbox" className='category_checkbox'
                      checked={!!selectedCategories[category.config_id]}
                      onChange={() => toggleSelect(category.config_id, category.parent_level_ids, category.children)}
                      style={{ marginRight: "5px" }}
                  />
                  <span>{category.name}</span>
              </div>
              {expanded[category.id] && category.children.map(renderCategories)}
          </div>
      );
  };
    // Fetch other dropdown data (vendors, categories, etc.)
useEffect(() => {
    const fetchDropdownData = async () => {
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainVendor/?search=`);
            console.log('Vendors API Response:', response.data); // Debug log
            setVendors(response.data.vendor_list || []); // Remove the extra .data layer
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainManufacture/`);
            console.log('Manufacturers API Response:', response.data); // Debug log
            setManufacturers(response.data.manufacture_list || []); // Remove the extra .data layer
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
        }
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBrand/?search=`);
            console.log('Brands API Response:', response.data); // Debug log
            setBrands(response.data.brand_list || []); // Remove the extra .data layer
        } catch (error) {
            console.error('Error fetching brands:', error);
        }

        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/obtainCategory/`, { level: 0 });
            console.log('Categories API Response (dropdown):', response.data); // Debug log
            setCategories(response.data.category_levels || []); // Remove the extra .data layer
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    fetchDropdownData();
}, []);

    const handleTextareaChange = (e, fieldName) => {
      const { name, value } = e.target;
      // If it's the first line and no bullet exists, prepend the bullet point
      if (e.key !== 'Enter' && !value.startsWith('•') && value.trim()) {
          handleChange({
              target: { name, value: '•' + value },
          });
          return;
      }
      // Handling space key press (to add a space after the word)
      if (e.key === ' ') {
          e.preventDefault(); // Prevent default space action
          const cursorPosition = e.target.selectionStart;
          const updatedValue = value.slice(0, cursorPosition) + ' ' + value.slice(cursorPosition);
          handleChange({ target: { name, value: updatedValue } });
      } 
      // Handling enter key press (inserting list item)
      else if (e.key === 'Enter') {
          e.preventDefault(); // Prevent default Enter action
          const cursorPosition = e.target.selectionStart;
          const updatedValue = value.slice(0, cursorPosition) + '\n•' + value.slice(cursorPosition);
          handleChange({ target: { name, value: updatedValue } });
      }
  };
  const handlePaste = (e, fieldName) => {
    const { name, value } = e.target;
    e.preventDefault(); // Prevent the default paste behavior
    const pastedText = e.clipboardData.getData('text');
    const pastedLines = pastedText.split('\n').map(line => line.trim());  // Split the pasted text by newlines and trim each line

    const cursorPosition = e.target.selectionStart;
    const currentTextBeforeCursor = value.slice(0, cursorPosition);
    const currentTextAfterCursor = value.slice(cursorPosition);

    // Prepend '*' to each pasted line and join them back with newline
    const formattedText = pastedLines.map(line => `•${line}`).join('\n');

    // Update the textarea with the formatted pasted content
    const updatedValue = currentTextBeforeCursor + '\n' + formattedText + currentTextAfterCursor;
    handleChange({ target: { name, value: updatedValue } });
};
    
    // Handle form changes
    const handleChange = (e, index) => {
        const { name, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [name]: value, // Dynamically update the field based on name
            }));
            setUnsavedChanges(true);  // Mark that there are unsaved changes
    };
    const handleChangefordescription = (value, name) => {
        if (isInitialLoad) {
          setIsInitialLoad(false); // Mark that we are no longer in the initial load state
          setUnsavedChanges(false); // Initially, no changes, so false
        } else {
          // After initial load, check if data has changed
          if (JSON.stringify(formData) !== JSON.stringify(originalData)) {
            setUnsavedChanges(true); // Mark as unsaved if there are changes
          }
        }
        // 
        setFormData((prevData) => ({
          ...prevData,
          [name]: value, // Dynamically update the field based on name
        }));
      };
      const handleQuillChange = (value, field) => {
        handleChangefordescription(value, field);
        // Adjust height dynamically based on content
        const editor = document.querySelector(`.quill-${field}`);
        if (editor) {
          const height = editor.scrollHeight; // Get the scroll height of the editor
          editor.style.minHeight = `${Math.max(100, height)}px`; // Set minHeight dynamically
        }
      };
const handleDeleteFile = async (type, index, fileName) => {
    // Trigger a confirmation popup before deleting
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete this ${type}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        reverseButtons:true,
        confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // Make the POST request to delete the file from the backend
                const response = await axiosInstance.get(
                    `${process.env.REACT_APP_IP}/removemedia/?name=${fileName}&&id=${productId}&&action=${type}`
                );
                
                console.log('Delete file API Response:', response.data); // Debug log
                
                if (response.data.is_delete === true) { // Remove the extra .data layer
                    // Update formData state based on the type of file being deleted
                    if (type === 'image') {
                        setFormData((prevData) => ({
                            ...prevData,
                            image_list: prevData.image_list.filter((_, i) => i !== index), // Remove specific image from image_list
                        }));
                    } else if (type === 'video') {
                        setFormData((prevData) => ({
                            ...prevData,
                            video_list: prevData.video_list.filter((_, i) => i !== index), // Remove specific video from video_list
                        }));
                    } else if (type === 'document') {
                        setFormData((prevData) => ({
                            ...prevData,
                            attachment_list: prevData.attachment_list.filter((_, i) => i !== index), // Remove specific document from attachment_list
                        }));
                    }
                    if (unsavedChanges === false) {
                        resetInputValue();
                        fetchProductDetails();
                    }
                    resetInputValue();
                    // Show success alert
                    Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
                } else {
                    Swal.fire('Error!', 'Failed to delete file.', 'error');
                }
            } catch (error) {
                console.error('Error deleting file:', error);
                Swal.fire('Error!', 'Failed to delete file.', 'error');
            }
        }
    });
};
    
      const handleFileUpload = (e) => {
        const { files } = e.target;
      
        // Loop through all selected files
        Array.from(files).forEach((file) => {
          const fileType = file.type.split('/')[0];  // Get the type (image, video, etc.)
          const fileExtension = file.name.split('.').pop().toLowerCase();  // Get file extension (for documents)
          if (fileType === 'image') {
            // If the file is an image, add it to the image list
            setFormData((prevData) => ({
              ...prevData,
              image_list: prevData.image_list ? [...prevData.image_list, file] : [file],
            }));
          } else if (fileType === 'video') {
            // If the file is a video, add it to the video list
            setFormData((prevData) => ({
              ...prevData,
              video_list: prevData.video_list ? [...prevData.video_list, file] : [file],
            }));
          } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension)) {
            // If the file is a document, add it to the document list
            setFormData((prevData) => ({
              ...prevData,
              attachment_list: prevData.attachment_list ? [...prevData.attachment_list, file] : [file],
            }));
          }
        });
        setInputStyle({
          color: 'black', // Change text color to black when files are selected
          textAlign: 'center',
          background: 'none',
          cursor: 'pointer',
        });
        setUnsavedChanges(true);  // Mark that there are unsaved changes
      };
     const handleFileUploadSubmit = async () => {
    const formDataToSend = new FormData();

    // Append images, videos, and documents to FormData if available
    if (formData.image_list && formData.image_list.length > 0) {
        formData.image_list.forEach((file) => {
            formDataToSend.append('images', file);
        });
    }
    if (formData.video_list && formData.video_list.length > 0) {
        formData.video_list.forEach((file) => {
            formDataToSend.append('videos', file);
        });
    }
    if (formData.attachment_list && formData.attachment_list.length > 0) {
        formData.attachment_list.forEach((file) => {
            formDataToSend.append('documents', file);
        });
    }
    formDataToSend.append('id', formData.id);
    // If there are any files selected, trigger the API request
    if (formDataToSend.has('images') || formDataToSend.has('videos') || formDataToSend.has('documents')) {
        setLoading(true);
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/updateFilesIntoProduct/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('File upload API Response:', response.data); // Debug log

            if (response.data.is_upload === true) { // Remove the extra .data layer
                setInputStyle({
                    color: 'transparent', 
                    textAlign: 'center',
                    background: 'none',
                    cursor: 'pointer',
                });
                resetInputValue();
                Swal.fire({
                    title: 'Success!',
                    text: 'Product updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
                fetchProductDetails();
                setUnsavedChanges(false);
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update product.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
             console.error('Error updating product:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update product.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    } else {
        Swal.fire({
            title: 'No Files Selected!',
            text: 'Please select at least one file to upload.',
            icon: 'warning',
            confirmButtonText: 'OK',
        });
    }
};
    const handleSubmit = async (event) => { 
    event.preventDefault();    
    if (unsavedChanges === false) {
        Swal.fire({
            title: 'Info!',
            text: 'No changes were made to save.',
            icon: 'info',
            confirmButtonText: 'OK',
        });
        return;
    }
    if (activeTab === 'images-videos') {
        return;
    }
    if (!formData.name || !formData.sku || !formData.brand_id || formData.category_id.length === 0) {
        // If required fields are missing, show an error
        Swal.fire({ title: 'Error!', text: 'Please fill all required fields.', icon: 'error', confirmButtonText: 'OK' });
    } else {
        setEditMode({
            short_description: false,
            personalized_short_description: false,
            long_description: false,
            personalized_long_description: false
        });
        // If no files are selected, submit regular product data without files
        const productData = {
            update_obj: {
                id: productId,// Assuming formData.id contains the product ID
                ...formData,  // Spread formData to include all updated fields
            }
        };
    
            try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/productUpdate/`, productData);
            
            console.log('Product update API Response:', response.data); // Debug log
            
            if (response.data.is_updated === true) { // Remove the extra .data layer
                Swal.fire({
                    title: 'Success!',
                    text: 'Product updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'swal-popup',
                        overlay: 'swal-overlay'
                    },
                    willOpen: () => {
                        // Apply the background color with transparency when the modal opens
                        document.body.style.zIndex = '9999';
                        document.body.style.overflow = 'hidden';  // Optional: Disable scrolling when the modal is open
                    },
                    willClose: () => {
                        // Remove the blur effect when Swal modal is closed
                        document.body.style.filter = '';
                    }
                });
                fetchProductDetails();
                setUnsavedChanges(false); 
            } else {
                Swal.fire({ title: 'Error!', text: 'Failed to update product.', icon: 'error', confirmButtonText: 'OK' });
            }
        } catch (error) {
            console.error('Error updating product:', error);
            Swal.fire({ title: 'Error!', text: 'Failed to update product.', icon: 'error', confirmButtonText: 'OK' });
        }
    }
}; 
    const addVariant = () => {
        setFormData((prevData) => ({
            ...prevData,
            variants: [...prevData.variants, { name: '', value: '' }],  // Add a new empty variant object
        }));
    };
    
 const handleCancel = (event) => {
        // Open confirmation popup
        event.preventDefault();
        Swal.fire({
            title: 'Are you sure you want to leave?',
            text: 'Any unsaved changes will be lost.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, leave',
            cancelButtonText: 'No, stay',
            reverseButtons:true,
        }).then((result) => {
            if (result.isConfirmed) {
                navigate(`/Admin/products`);
            }
        });
    };
    const handleBackToProductList = () => {
      const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get('page') || 1;  // Get the current page from the query params
  navigate(`/Admin/products?page=${currentPage}`);
      };
    
const checkDuplicateCategory = async (categoryName) => {
    if (!categoryName) return; 
    try {
        const response = await axiosInstance.get(
            `${process.env.REACT_APP_IP}/findDuplicateCategory/?search=${encodeURIComponent(categoryName)}`
        );
        console.log('Duplicate category API Response:', response.data); // Debug log
        if (response.data.error) { // Remove the extra .data layer
            setCategoryError("Category name must be unique within the same parent.");
        } else {
            setCategoryError("");
        }
    } catch (error) {
        console.error("Error checking for duplicate category:", error);
    }
}; 
    const handleAddCategoryClick = (event) => {
        event.preventDefault();
        setIsAddCategoryPopupOpen(true);
    };
    const handleCategoryNameBlur = async() => {
        await checkDuplicateCategory();
    };
    const createCategory = async (event) => {
        event.preventDefault();
        if (!newCategoryName.trim()) {
            setCategoryError("Category name is required");
            return;
        }
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createCategory/`, {
                name: newCategoryName,
                category_config_id: parentCategoryId || '',
            });

            if (response.data) {
                Swal.fire({ title: 'Success!', text: 'Category created successfully.', icon: 'success' });
                fetchCategories();
            }
            setIsAddCategoryPopupOpen(false);
            setNewCategoryName('');
            setParentCategoryId('');
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };
    
const fetchParentCategories = async (inputValue) => {
    if (!inputValue) return [];
    try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainCategoryList/?search=${inputValue}`);
        console.log('Parent categories API Response:', response.data); // Debug log
        const options = response.data.map(category => ({ // Remove the extra .data layer
            id: category.id,
            name: category.name,
            level_str: category.level_str
        }));
        setSuggestions(options);
    } catch (error) {
        console.error('Error fetching parent categories:', error);
        setSuggestions([]);
    }
};


    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        if (!query) {
            setSuggestions([]);
        } else {
            fetchParentCategories(query);
        }
    };
    const handleCancelCategory = (event) => {
        event.preventDefault();
        setIsAddCategoryPopupOpen(false);
        setNewCategoryName("");
        setParentCategoryId("");
        setCategoryError("");
    };
  const handleSuggestionSelect = async (suggestion) => {
    setParentCategoryId(suggestion.id);
    setSuggestions([]);
    setSearchQuery(suggestion.name);
    try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/findDuplicateCategory/?search=${newCategoryName}&category_config_id=${suggestion.id}`);
        console.log('Duplicate check with suggestion API Response:', response.data); // Debug log
        if (response.data.error === true) { // Remove the extra .data layer
            setCategoryError('Category name must be unique within the same parent.');
        }
        else {
            setCategoryError('');  // Clear error if no duplicate is found
        }
    } catch (error) {
        console.error('Error checking for duplicate category with selected suggestion:', error);
    }
};
    // Render form based on active tab
    const handleCompanyChange = (selectedOption, index) => {
        const updatedRows = [...formData.category_group_list];
        updatedRows[index].b2c_company_id = selectedOption ? selectedOption.value : null;
        setFormData({ ...formData, category_group_list: updatedRows });
      };
      const addRow = () => {
        setFormData({
          ...formData,
          category_group_list: [
            ...formData.category_group_list,
            { b2c_company_id: null, category_levels: [] }
          ]
        });
      };
 const removeCategoryGroup = async (b2c_company_id) => {
    try {
        const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/removeCategoryGroup/`, {
            b2c_company_id,   // Company ID
            product_id:productId,
        });
        
        console.log('Remove category group API Response:', response.data); // Debug log
        
        if (response.data.is_deleted === true) { // Remove the extra .data layer
            Swal.fire({ title: 'Success!', text: 'Category Removed Successfully.', icon: 'success', confirmButtonText: 'OK' });
        }
        console.log('Category group removed successfully:', response.data);
    } catch (error) {
        console.error('Error removing category group:', error);
    }
};
      const removeRow = async (index, b2c_company_id) => {
        // Show confirmation dialog
        const { isConfirmed } = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to delete this category group?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel',
          reverseButtons: true,
        });
        // If the user confirms, proceed with removing the row
        if (isConfirmed) {      
          // Send only the relevant data to the API (b2c_company_id, product_id, category info)
          await removeCategoryGroup(b2c_company_id);
          // Create an updated list of category groups by removing the selected index
          const updatedRows = formData.category_group_list.filter((_, i) => i !== index);
          // Update the form data state with the new category_group_list
          setFormData({ ...formData, category_group_list: updatedRows });
        }
      };
      
      const openCategoryPopup = (index) => {
        if (!formData.category_group_list[index].b2c_company_id) {
          Swal.fire('Error!', 'Please select a company before adding a category.', 'error');
          return;
        }
        setSelectedRowIndex(index);
        setShowCategoryPopup(true);
      };
      
  const addCategory = async () => {
    if (!newCategoryName.trim()) {
        Swal.fire('Error!', 'Category name cannot be empty.', 'error');
        return;
    }

    const row = formData.category_group_list[selectedRowIndex];
    const b2c_company_id = row.b2c_company_id;

    try {
        const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/updateCategoryGroup/`, {
            b2c_company_id,
            category_name: newCategoryName,
            product_id:productId,
        });

        console.log('Add category API Response:', response.data); // Debug log

        if (response.data.is_created === true) { // Remove the extra .data layer
            const updatedRows = [...formData.category_group_list];
            updatedRows[selectedRowIndex].category_levels.push({
                id: response.data.category_id,
                name: newCategoryName,
            });
            Swal.fire({ title: 'Success!', text: 'Category Created Successfully.', icon: 'success', confirmButtonText: 'OK' });
            setFormData({ ...formData, category_group_list: updatedRows });
            setShowCategoryPopup(false);
            setNewCategoryName('');
        } else {
            Swal.fire('Error!', 'Failed to add category.', 'error');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        Swal.fire('Error!', 'Failed to add category.', 'error');
    }
};


      if (unauthorized) {
        navigate(`/unauthorized`);
      }
    return (
        <div>
          {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div> {/* Custom spinner */}
        </div>
      )}
        <div className="create-product">
            <div className="sidebar_for_product">
                <ul>
                <li className="product-back-button" onClick={handleBackToProductList}><FontAwesomeIcon icon={faArrowLeft} /> Product List</li>
                    <li className={activeTab === 'basic-info' ? 'active' : ''} onClick={() => handleTabClick('basic-info')}>Basic Information</li>
                    <li className={activeTab === 'description' ? 'active' : ''} onClick={() => handleTabClick('description')}>Overview</li>
                    {/* <li className={activeTab === 'custom-fields' ? 'active' : ''} onClick={() => handleTabClick('custom-fields')} > Custom Fields </li> */}
                    <li className={activeTab === 'images-videos' ? 'active' : ''}  onClick={() => handleTabClick('images-videos')} >  Digital Assets </li>
                    <li className={activeTab === 'group-of-category' ? 'active' : ''}  onClick={() => handleTabClick('group-of-category')} >  Mapped Category </li>
                    {/* <li className={activeTab === 'variations' ? 'active' : ''} onClick={() => handleTabClick('variations')} > Variations </li> */}
                    <li className={activeTab === 'attribute' ? 'active' : ''} onClick={() => handleTabClick('attribute')} > Attributes </li>
                    <li className={activeTab === 'pricing' ? 'active' : ''} onClick={() => handleTabClick('pricing')} > Pricing </li>
                    <li className={activeTab === 'warranty' ? 'active' : ''} onClick={() => handleTabClick('warranty')} > Warranty </li>
                    <li className={activeTab === 'others' ? 'active' : ''} onClick={() => handleTabClick('others')} > Others </li>

                </ul>
            </div>

            <div className="right-container-product"  style={{
        minHeight: minHeight, // Dynamically adjusted minHeight
      }}>
                <form onSubmit={handleSubmit}>
                    {activeTab === 'basic-info' && (
                        <section className="basic-info-section">
                            <h2 style={{marginTop:'-3px', paddingBottom:'2px'}}>Basic Information</h2>
                            <div className="two-column-layout">
                                <div className="form-group">
                                    <label htmlFor="product_name">Product Name *</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="product_name"
                                        className="input_pdps"
                                        name="name"
                                        value={formData.name ? formData.name.toLowerCase().replace(/^(\w)/, (match) => match.toUpperCase()) : ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="mpn">MPN</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="mpn"
                                        className="input_pdps"
                                        name="mpn"
                                        value={formData.mpn || ''}
                                        onChange={handleChange}  />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sku">SKU *</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="sku"
                                        className="input_pdps"
                                        name="sku"
                                        value={formData.sku || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sku">UPC</label>
                                    <input
                                    autoComplete="off"
                                        type="text"
                                        id="sku"
                                        className="input_pdps"
                                        name="upc"
                                        value={formData.upc || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label>Product ID</label>
                                    <input   type="text"  
                                     name="product_id" 
                                     autoComplete="off"
                                     className="input_pdps"
                                    value={formData.product_id || ''}   
                                    onChange={handleChange}  />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ean">EAN</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="ean"
                                        className="input_pdps"
                                        name="ean"
                                        value={formData.ean || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="unspc">UNSPC</label>
                                    <input
                                        type="text"
                                        id="unspc"
                                        autoComplete="off"
                                        className="input_pdps"
                                        name="unspc"
                                        value={formData.unspc || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="model">Model</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="model"
                                        className="input_pdps"
                                        name="model"
                                        value={formData.model || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="vendor">Vendor</label>
                                    <select
                                        id="vendor"
                                        name="vendor_id"
                                        value={String(formData.vendor_id || '')}
                                        onChange={handleChange}
                                        className="product_detail_select input_pdps select-back"  >
                                        <option value="">Select Vendor</option>
                                        {vendors.map((vendorOption) => (
                                            <option key={vendorOption.id} value={vendorOption.id}>
                                                {vendorOption.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="brand">Brand *</label>
                                    <select
                                        id="brand"
                                        name="brand_id"
                                        value={String(formData.brand_id || '')}
                                        onChange={handleChange}
                                        className="product_detail_select input_pdps select-back"    >
                                        <option value="">Select Brand</option>
                                        {brands.map((brandOption) => (
                                            <option key={brandOption.id} value={brandOption.id}>
                                                {brandOption.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin:'0px 0px 6px 0px' }}>
                <label>Categories *</label>
                {/* <div className="breadcrumb-container">
    {formData.breadcrumb && (
        <div className="breadcrumb-text" >
            {formData.breadcrumb || ''}
        </div>
    )}
    {formData.breadcrumb && (
        <div className="breadcrumb-hover">
            {formData.breadcrumb || ''}
        </div>
    )}
</div>    */}
<div style={{ marginLeft: "auto", display: "flex", alignItems: "center", position: "relative" }}>
  <button
    className='btnforeyeicon edit-button'
    onClick={(event) => {
      event.preventDefault();
      setShowAll((prev) => !prev);
    }}
    style={{ marginRight: "10px", position: "relative" }}
  >
    <ModeEditIcon style={{ verticalAlign: "bottom" }} />
    <span className={`${isSidebarOpen ? 'mapcategoriesopen' : 'mapcategories'}`}>Map to other categories</span>
  </button>
  <button onClick={(event) => handleAddCategoryClick(event)} className="add-category-btn">Add</button>
</div>
            </div>
            <div className="category-tree">
            {categories.length > 0 ? (
        categories.map(renderCategories)  
      ) : (
        <p>No categories found</p>  
      )}
            </div>
            {isAddCategoryPopupOpen && (
                <div className="popup">
                    <div className="popup-content" style={{ position: 'relative', padding: '22px 22px 15px 22px' }}>
                              <button
                                onClick={(event) => handleCancelCategory(event)}
                                style={{  position: 'absolute',  top: '12px',  right: '20px',  minWidth: 'unset',  padding: 0,  fontSize: '30px',  color: '#888',  border: 'none',  background: 'transparent',  cursor: 'pointer'
                                }}  >
                                &times;  </button>
                        <label htmlFor="categoryName">Category Name:</label>
                        <input
                            type="text"
                            autoComplete="off"
                            id="categoryName"
                            placeholder="Enter category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onBlur={handleCategoryNameBlur}
                        />
                        {categoryError && <div className="error-message-category">{categoryError}</div>}

                        <label htmlFor="parentCategory">Select Parent Category (Optional):</label>
                        <input
                            type="text"
                            autoComplete="off"
                            id="parentCategory"
                            placeholder="Search for Parent Category"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />

                        {suggestions.length > 0 && (
                            <div className="suggestions-list">
                                {suggestions.map((suggestion) => (
                                    <div
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionSelect(suggestion)} >
                                        <div className="suggestion-name">{suggestion.name}</div>
                                        <div className="suggestion-level">{suggestion.level_str}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'space-between', margin: '0 auto', width:'26%',padding:'10px 0px 0px 0px'  }}>
                            <button onClick={(event) => createCategory(event)} className='category_btn' disabled={categoryError}  style={{ flex: 1, borderRadius:'20px'}} >
                                Create
                            </button>
                            </div>
                    </div>
                </div>
            )}
        </div>
                                </div>
                                    <div className="form-group">
                                        <label htmlFor="manufacturer">Manufacturer</label>
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            id="manufacturer"
                                            name="manufacturer_id"
                                            value={formData.manufacturer_id || ''}
                                            onChange={handleChange}
                                            className="product_detail_input input_pdps"
                                            placeholder="Enter Manufacturer Name"
                                        />
                                    </div>

                            </div>
                        </section>
                    )}
                      {activeTab === 'description' && (
                            <section>
                            <h2 style={{marginTop:'-3px'}}>Overview</h2>

                            {/* Features */}
                            <section>
                            {/* <h2>Custom Fields</h2> */}
                  <div>
                    <label>Features</label>
                    <textarea
                      name="feature_list"
                      className="input_pdps"
                      style={{
                        marginBottom: '15px',
                        minHeight: minHeightTextforfeature, // Start with a minimum height
                        maxHeight: 'none', // Remove maxHeight so it can grow
                        overflowY: 'hidden',
                        fontFamily:'Arial, sans-serif'
                      }}
                      value={(formData.feature_list || '')
                        .split('\n')
                        .map(line => (line.trim() ? (line.startsWith('•') ? line : `•${line.trim()}`) : '')) // Replace * with dot (•)
                        .join('\n')}
                      onChange={(e) => handleChange(e)} // Using handleChange to update features value
                      onKeyDown={(e) => handleTextareaChange(e, 'feature_list')} // Handling space and enter keys
                      onPaste={(e) => handlePaste(e, 'feature_list')} // Handling paste functionality
                      rows="4"
                    ></textarea>
                  </div>
                            {/* <div>
                                <label>Attributes</label>
                                <textarea
                                    name="attributes" 
                                    className="input_pdps" 
                                    value={formData.attributes || ''}
                                    onChange={handleChange}
                                    rows="4"
                                ></textarea>
                            </div> */}
                        </section>
                      
                            {/* Short Description Section */}
                            <div>
                              <h3  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><span>Short Description</span>   <button className='edit-btn' style={{border:'none'}} onClick={(event) => handleToggleEditMode(event,'short_description')}><EditIcon  style={{ fontSize: '22px', verticalAlign: 'middle' }}/> </button>
                              </h3>
                              {editMode.short_description ? (
                                <>
                                  <ReactQuill
                                    //  style={{
                                    //    marginBottom: '15px',
                                    //    minHeight: '100px',
                                    //    maxHeight: '300px',
                                    //    overflowY: 'auto',
                                    //    overflowX: 'auto'
                                    //  }}
                                    style={{
                                      marginBottom: '15px',
                                      minHeight: '100px', // Start with a minimum height
                                      maxHeight: 'none', // Remove maxHeight so it can grow
                                    }}
                                    name="short_description"
                                    value={formData.short_description}
                                    //  onChange={(value) => handleChangefordescription(value, 'short_description')}
                                    onChange={(value) => handleQuillChange(value, 'short_description')}
                                    theme="snow"
                                    placeholder="Enter short description"
                                    modules={modules}
                                    formats={formats}
                                  />
                                  {/* <button onClick={() => handleToggleEditMode('short_description')}>Save</button> */}
                                </>
                              ) : (
                                <>
                                  <div><textarea
                                    name="short_description"
                                    style={{
                                      marginBottom: '15px',
                                      minHeight: minHeightTextforShort, // Start with a minimum height
                                      maxHeight: 'none', // Remove maxHeight so it can grow
                                      overflowY: 'hidden',
                                      fontFamily:'Arial, sans-serif'
                                    }}
                        className="input_pdps"
                        value={formData.short_description || 'Enter details'}
                        rows="4"
                      ></textarea></div>
                                </>
                              )}
                            </div>
                      
                            {/* Personalized Short Description Section */}
                            <div>
                      <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span>Personalized Short Description</span>
                        <span
                          className='edit-btn'
                          style={{  border: 'none',  background: 'transparent',  cursor: 'pointer',  padding: '0',  margin: '0'   }}
                          onClick={(event) => handleToggleEditMode(event, 'personalized_short_description')}  >
                          <EditIcon style={{ fontSize: '22px', verticalAlign: 'middle' }}/>
                        </span>
                      </h3>

                              {editMode.personalized_short_description ? (
                                <>
                                  <ReactQuill
                                    style={{
                                      marginBottom: '15px',
                                      minHeight: '100px', // Start with a minimum height
                                      maxHeight: 'none', // Remove maxHeight so it can grow
                                    }}
                                    name="personalized_short_description"
                                    value={formData.personalized_short_description}
                                    //  onChange={(value) => handleChangefordescription(value, 'personalized_short_description')}
                                    onChange={(value) => handleQuillChange(value, 'personalized_short_description')}
                                    theme="snow"
                                    placeholder="Enter personalized short description"
                                    modules={modules}
                                    formats={formats}
                                  />
                                  {/* <button onClick={() => handleToggleEditMode('personalized_short_description')}>Save</button> */}
                                </>
                              ) : (
                                <>
                                  <div><textarea
                                   name="long_description"
                                   style={{
                                     marginBottom: '15px',
                                     minHeight: minHeightTextforPShort, // Start with a minimum height
                                     maxHeight: 'none', // Remove maxHeight so it can grow
                                     overflowY: 'hidden',
                                     fontFamily:'Arial, sans-serif'
                                   }}
                        className="input_pdps"
                        value={formData.personalized_short_description || 'Enter details'}
                        rows="4"
                      ></textarea></div>
                                  {/* <button onClick={() => handleToggleEditMode('personalized_short_description')}>Edit</button> */}
                                </>
                              )}
                            </div>
                      
                            {/* Long Description Section */}
                            <div>
                              <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <span>Long Description</span> <span className='edit-btn' style={{border:'none'}} onClick={(event) => handleToggleEditMode(event,'long_description')}><EditIcon style={{ fontSize: '22px', verticalAlign: 'middle' }}/> </span></h3>
                              {editMode.long_description ? (
                                <>
                                  <ReactQuill
                                    style={{
                                      marginBottom: '15px',
                                      minHeight: '100px', // Start with a minimum height
                                      maxHeight: 'none', // Remove maxHeight so it can grow
                                    }}
                                    name="long_description"
                                    value={formData.long_description}
                                    //  onChange={(value) => handleChangefordescription(value, 'long_description')}.
                                    onChange={(value) => handleQuillChange(value, 'long_description')}
                                    theme="snow"
                                    placeholder="Enter long description"
                                    modules={modules}
                                    formats={formats}
                                  />
                                  {/* <button onClick={() => handleToggleEditMode('long_description')}>Save</button> */}
                                </>
                              ) : (
                                <>
                                  <div> <textarea
                                    name="long_description"
                                    style={{
                                      marginBottom: '15px',
                                      minHeight: minHeightText, // Start with a minimum height
                                      maxHeight: 'none', // Remove maxHeight so it can grow
                                      overflowY: 'hidden',
                                      fontFamily:'Arial, sans-serif'
                                    }}
                        className="input_pdps"
                        value={ formData.long_description || 'Enter details'}
                        rows="4"
                      ></textarea></div>
                                  {/* <button onClick={() => handleToggleEditMode('long_description')}>Edit</button> */}
                                </>
                              )}
                            </div>
                      
                            {/* Personalized Long Description Section */}
                            <div>
                              <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <span>Personalized Long Description </span><span className='edit-btn' style={{border:'none'}} onClick={(event) => handleToggleEditMode(event,'personalized_long_description')}><EditIcon style={{ fontSize: '22px', verticalAlign: 'middle' }}/></span>
                              </h3>
                              {editMode.personalized_long_description ? (
                                <>
                                  <ReactQuill
                                    style={{
                                      marginBottom: '15px',
                                      minHeight: '100px', // Start with a minimum height
                                      maxHeight: 'none', // Remove maxHeight so it can grow
                                    }}
                                    name="personalized_long_description"
                                    value={formData.personalized_long_description}
                                    //  onChange={(value) => handleChangefordescription(value, 'personalized_long_description')}
                                    onChange={(value) => handleQuillChange(value, 'personalized_long_description')}
                                    theme="snow"
                                    placeholder="Enter personalized long description"
                                    modules={modules}
                                    formats={formats}
                                  />
                                  {/* <button onClick={() => handleToggleEditMode('personalized_long_description')}>Save</button> */}
                                </>
                              ) : (
                                <>
                                  <div>  <textarea
                                   style={{
                                    marginBottom: '15px',
                                    minHeight: minHeightTextforPlong, // Start with a minimum height
                                    maxHeight: 'none', // Remove maxHeight so it can grow
                                    overflowY: 'hidden',
                                    fontFamily:'Arial, sans-serif'
                                  }}
                        className="input_pdps"
                        value={formData.personalized_long_description || 'Enter details'}
                        rows="4"
                      ></textarea></div>
                                </>
                              )}
                            </div>


                            {/* Custom feilds */}


                          
                          </section>
                      )}
                    {activeTab === 'custom-fields' && (
                        <section>
                            <h2>Custom Fields</h2>
                  <div>
                    <label>Features</label>
                    <textarea
                      name="feature_list"
                      className="input_pdps"
                      style={{
                        marginBottom: '15px',
                        minHeight: minHeightTextforfeature, // Start with a minimum height
                        maxHeight: 'none', // Remove maxHeight so it can grow
                        overflowY: 'hidden',
                        fontFamily:'Arial, sans-serif'
                      }}
                      value={(formData.feature_list || '')
                        .split('\n')
                        .map(line => (line.trim() ? (line.startsWith('•') ? line : `•${line.trim()}`) : '')) // Replace * with dot (•)
                        .join('\n')}
                      onChange={(e) => handleChange(e)} // Using handleChange to update features value
                      onKeyDown={(e) => handleTextareaChange(e, 'feature_list')} // Handling space and enter keys
                      onPaste={(e) => handlePaste(e, 'feature_list')} // Handling paste functionality
                      rows="4"
                    ></textarea>
                  </div>
                            {/* <div>
                                <label>Attributes</label>
                                <textarea
                                    name="attributes" 
                                    className="input_pdps" 
                                    value={formData.attributes || ''}
                                    onChange={handleChange}
                                    rows="4"
                                ></textarea>
                            </div> */}
                        </section>
                    )}
                    {activeTab === 'warranty' && (
    <section>
        <h2 style={{marginTop:'-3px'}}>Warranty</h2>
        <div className="form-group">
            <label>Service Warranty</label>
            <textarea
                className="input_pdps"
                name="serviceWarranty"  // Added name attribute for formData handling
                value={formData.service_warranty || ''}  // Using formData
                onChange={handleChange}  // Using common handleChange for formData updates
                rows="4"
            ></textarea>
        </div>
        <div className="form-group">
            <label>Product Warranty</label>
            <textarea
                className="input_pdps"
                name="productWarranty"  // Added name attribute for formData handling
                value={formData.product_warranty || ''}  // Using formData
                onChange={handleChange}  // Using common handleChange for formData updates
                rows="4"
            ></textarea>
        </div>
    </section>
)}

{activeTab === 'images-videos' && (
  <section>
    <h2 style={{marginTop:'-3px'}}>Digital Assets</h2>

    {/* Upload Images Section */}
    <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'space-between' }}>
      <label style={{ width: '30%' }}>Choose Files</label>
      <div style={{ width: '25%' }}>
        <input
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"  // Accepting all types (images, videos, documents)
          name="files"
          onChange={handleFileUpload}
          ref={inputRef}
          style={inputStyle}
        />
      </div>
    </div>
    {/* Display All Uploaded Files at the end */}
    <div>
      <h3>Uploaded Files</h3>

      {/* Display Uploaded Images with Horizontal Scroll only if more than 4 images */}
      {formData.image_list && formData.image_list.length > 0 && (
        <div
        style={{
            display: 'flex',
            flexDirection: 'row',
            maxHeight: formData.image_list.length > 4 ? '240px' : 'auto', // Vertical scroll condition
            overflowY: formData.image_list.length > 4 ? 'auto' : 'hidden', // Vertical scroll condition
            marginBottom: '20px',
          }}
          className={`${isSidebarOpen ? 'product-detail-open-images-videos' : 'product-detail-closed-images-videos'}`}
        >
          {formData.image_list.map((file, index) => (
            <div key={index} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px', width: '100px' }}>
              <img
                src={file.url ? file.url : URL.createObjectURL(file)}  // Display local file URL or Cloudinary URL
                alt={`new-image-${index}`}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  transition: '0.3s',
                }}
              />
              {/* Delete Icon (appears on hover) */}
              <span
                onClick={() => handleDeleteFile('image', index, file.name)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '5px',
                  cursor: 'pointer',
                  transition: '0.3s',
                }}
                className="delete-icon"
              >
                <DeleteIcon />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Display Uploaded Videos with Horizontal Scroll only if more than 4 videos */}
      {formData.video_list && formData.video_list.length > 0 && (
        <div
        style={{
            display: 'flex',
            flexDirection: 'row',
            maxHeight: formData.video_list.length > 4 ? '240px' : 'auto', // Vertical scroll condition
            overflowY: formData.video_list.length > 4 ? 'auto' : 'hidden', // Vertical scroll condition
            marginBottom: '20px',
            maxHeight: '100px',
          }}
          className={`${isSidebarOpen ? 'product-detail-open-images-videos' : 'product-detail-closed-images-videos'}`}
        >
          {formData.video_list.map((video, index) => (
            <div key={index} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px', width: '200px' }}>
              <video
                src={video.url ? video.url : URL.createObjectURL(video)}  // Display local file URL or Cloudinary URL
                controls
                style={{ width: '170px', height: 'auto' }}
              />
              {/* Delete Icon (appears on hover) */}
              <span
                onClick={() => handleDeleteFile('video', index, video.name)}
                style={{
                  position: 'absolute',
                  top: '3px',
                  right: '32px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '5px',
                  cursor: 'pointer',
                  transition: '0.3s',
                }}
                className="delete-icon"
              >
                <DeleteIcon />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Display Uploaded Documents with Vertical Scroll only if more than 4 documents */}
      {formData.attachment_list && formData.attachment_list.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: formData.attachment_list.length > 4 ? '212px' : 'auto', // Vertical scroll condition
            overflowY: formData.attachment_list.length > 4 ? 'auto' : 'hidden', // Vertical scroll condition
            marginBottom: '103px',
          }}
        >
          {formData.attachment_list.map((attachment, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ marginRight: '10px' }}>
                {attachment.name}
              </span>
              <span
                onClick={() => handleDeleteFile('document', index, attachment.name)}
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px',
                  margin: '0px 4px 0px 0px',
                  cursor: 'pointer',
                  transition: '0.3s',
                }}
                className="delete-icon"
              >
                <DeleteIcon />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)}

{/* {activeTab === 'group-of-category' && (
  <section>
    <h2>Group of Category</h2>
    <table className="category-table">
      <thead>
        <tr>
          <th>Channels</th>
          <th>Categories</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {formData.category_group_list.map((row, index) => (
          <tr key={index}>
            <td>
              <Select
                className="company-select select-back"
                options={companyOptions} // Company options fetched from API
                value={companyOptions.find(option => option.value === row.b2c_company_id) || null}
                onChange={(selectedOption) => handleCompanyChange(selectedOption, index)}
                placeholder="Select a Company"
                isClearable
              />
            </td>
            <td>
              <div className="category-tags">
                {row.category_levels.map((category) => (
                  <span  className="category-tag">
                    {category.name}
                  </span>
                ))}
                <button type="button" className="add-groupcategory-btn" onClick={() => openCategoryPopup(index)}>  + </button>
              </div>
            </td>
            <td>
            <button type="button" onClick={() => removeRow(index, row.b2c_company_id)} className="remove-btn">
            <FontAwesomeIcon icon={faTrash} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <button type="button" onClick={addRow} className="add-btn">+ Add</button>
    {showCategoryPopup && (
  <div className="popup-overlay-group">
    <div className="popup-content-group">
      <h3>Add New Category</h3>
      <input
        type="text"
        autoComplete="off"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        placeholder="Enter category name"
      />
      <div className="popup-buttons-group">
        <button onClick={() => setShowCategoryPopup(false)}>Cancel</button>
        <button onClick={addCategory}>Add</button>
      </div>
    </div>
  </div>
)}
  </section>
)} */}
{activeTab === 'group-of-category' && (
  <section>
    <h2 style={{marginTop:'-3px'}}>  Mapped Category</h2>
    <table className="category-table">
      <thead>
        <tr>
          <th>Channel</th>
          <th>PIM taxonomy</th>
          <th>Channel taxonomy</th>
        </tr>
      </thead>
      <tbody>
  {formData.category_group_list && formData.category_group_list.length > 0 ? (
    formData.category_group_list.map((row, index) => (
      <tr key={index}>
         <td>
          {/* Display channel name */}
          {row.channel_name ? row.channel_name.charAt(0).toUpperCase() + row.channel_name.slice(1).toLowerCase() : 'N/A'} </td>
        <td>
          {/* Display category taxonomy level */}
          {row.category_taxonomy_level}
        </td>
        <td>
          {/* Display taxonomy channel */}
          {row.taxonomy_level}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" style={{ textAlign: 'center' }}>
        No Mapped category
      </td>
    </tr>
  )}
</tbody>

    </table>
    </section>
)}
{activeTab === 'attribute' && (
                            <section>
                                <h2 style={{marginTop:'-3px'}}>Attributes</h2>
                              <div>  <h3>Product</h3>
                              <button style={{marginTop:'-45px'}} className="add-attribute-btn" onClick={(event) => handleAddAttribute(event)}>
                                    Add
                                </button>
                                </div>
                                <div style={{
                                           padding: '10px',
                                           border: '2px solid #ccc',
                                           borderRadius: '10px',
                                           margin:' 0px 0px 5px 0px'
                                         }}
                                //  style={{ maxHeight: '250px',  overflowY: 'auto',  padding: '10px',border: '1px solid #ccc', borderRadius: '10px' }}
        >
                                  <form>
                                  {formData.attribute_list && formData.attribute_list.length > 0 ? (
        formData.attribute_list.map((attribute) => (
          <div key={attribute.id} style={{margin: '5px 0px 5px 0px'}}>
            <h4 style={{margin:'0px 0px 7px 0px', display: 'inline', marginRight: '10px'}}>{attribute.name}</h4>
            <div className="category-tags" style={{
              // display: 'inline-flex', 
              // flexWrap: 'wrap', 
              // gap: '10px'
              display: 'inline',
            }}>
              {attribute.values.map((value, index) => (
                <span key={index} className="category-tag" style={{
                  padding: '4px 8px', 
                  borderRadius: '5px', 
                  backgroundColor: '#a52be4', 
                  border: '1px solid #ddd',
                  margin:'0px 10px 5px 0px'
                }}>
                  {value}
                </span>
              ))}
              <button
                type="button"
                className="add-groupcategory-btn"
                onClick={() => handleAddValue(attribute.name)}
                style={{
                  backgroundColor: '#a52be4',
                  color: 'white',
                  border: 'none',
                  padding: '4px 7px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  marginLeft: '3px' // Add some space between the values and the button
                }}
              >
                +
              </button>
            </div>
          </div>
        ))
      ) : (
          <div> <p>No attributes in Product</p>
          </div>
        )}
      </form>
    </div>

    {/* Brand Section */}
    <section>
      <h3>Brand</h3>
      <div
        style={{
          padding: '10px',
          border: '2px solid #ccc',
          borderRadius: '10px',
          margin: '0px 0px 5px 0px'
        }}
      >
        {formData.brand_attribute_list && formData.brand_attribute_list.length > 0 ? (
          formData.brand_attribute_list.map((attribute) => (
            <div key={attribute.id} style={{ margin: '5px 0px 5px 0px' }}>
              <h4 style={{ margin: '0px 0px 7px 0px',display: 'inline', marginRight: '10px' }}>{attribute.name}</h4>
              <div className="brand-tags" style={{ display: 'inline' }}>
                {attribute.values.map((value, index) => (
                  <span
                    key={index}
                    className="brand-tag"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      backgroundColor: '#a52be4',
                      border: '1px solid #ddd',
                      margin:'0px 10px 5px 0px'
                    }}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div>
            <p>No attributes in Brand</p>
          </div>
        )}
      </div>
    </section>

    {/* Category Attributes Section */}
    <section>
      <h3>Category</h3>
      <div
        style={{
          padding: '10px',
          border: '2px solid #ccc',
          borderRadius: '10px',
          margin: '0px 0px 5px 0px'
        }}
      >
        {formData.category_attribute_list && formData.category_attribute_list.length > 0 ? (
          formData.category_attribute_list.map((attribute) => (
            <div key={attribute.id} style={{ margin: '5px 0px 5px 0px' }}>
              <h4 style={{ margin: '0px 0px 7px 0px',display: 'inline', marginRight: '10px' }}>{attribute.name}</h4>
              <div className="category-tags" style={{ display: 'inline',}}>
                {attribute.values.map((value, index) => (
                  <span
                    key={index}
                    className="category-tag"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      backgroundColor: '#a52be4',
                      border: '1px solid #ddd',
                      margin:'0px 10px 5px 0px'
                    }}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div>
            <p>No attributes in Category</p>
          </div>
        )}
      </div>
    </section>

    {/* Global Section */}
    <section>
      <h3>Global</h3>
      <div
        style={{
          padding: '10px',
          border: '2px solid #ccc',
          borderRadius: '10px',
          margin: '0px 0px 5px 0px'
        }}
      >
        {formData.global_attribute_list && formData.global_attribute_list.length > 0 ? (
          formData.global_attribute_list.map((attribute) => (
            <div key={attribute.id} style={{ margin: '5px 0px 5px 0px' }}>
              <h4 style={{ margin: '0px 0px 7px 0px',display: 'inline', marginRight: '10px' }}>{attribute.name}</h4>
              <div className="category-tags" style={{ display: 'inline'}}>
                {attribute.values.map((value, index) => (
                  <span
                    key={index}
                    className="category-tag"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      backgroundColor: '#a52be4',
                      border: '1px solid #ddd',
                      margin:'0px 10px 5px 0px'
                    }}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div>
            <p>No attributes in Global</p>
          </div>
        )}
      </div>
    </section>
  </section>
)}

                    {activeTab === 'pricing' && (
                        <section>
                            <h2 style={{marginTop:'-3px'}}>Pricing</h2>
                            <div>
                                <label>Selling Price</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    name="selling_price"
                                    value={formData.selling_price || ''}
                                    onChange={handleChange} 
                                />
                            </div>
                            <div>
                                <label>Discount Price</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    name="discount_price"
                                    value={formData.discount_price || ''}
                                    onChange={handleChange} 
                                />
                            </div>
                            <div>
                                <label>MSRP</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    name="msrp"
                                    value={formData.msrp || ''}
                                    onChange={handleChange} 
                                />
                            </div>
                            <div>
                                <label>Currency</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    name="currency"
                                    value={formData.currency || ''}
                                    onChange={handleChange} 
                                />
                            </div>
                        </section>
                    )}
                   {/* {activeTab === 'variations' && (
            <section>
                <h2>Variations</h2> */}
                {/* {formData.variants.map((variant, index) => (
                    <div key={index}>
                        <label>Variant Name</label>
                        <input
                            type="text"
                            name={`name-${index}`}  // Ensures the correct variant is updated
                            value={variant.name || ''}  // Access the name property of each variant
                            onChange={(e) => handleChange(e, index)}  // Pass the index to handleChan
                        />
                        <label>Variant Value</label>
                        <input
                            type="text"
                            name={`value-${index}`}  // Ensures the correct variant is updated
                            value={variant.value || ''}  // Access the value property of each variant
                            onChange={(e) => handleChange(e, index)}  // Pass the index to handleChange
                        />
                    </div>
                ))} */}
                {/* <button type="button" className="add_variant_btn" onClick={addVariant}>
                    Add Variant
                </button>
            </section>
        )} */}
                    {activeTab === 'others' && (
                        <section>
                            <h2 style={{marginTop:'-3px'}}>Others</h2>
                            <div>
                                <label>Certifications</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    name="certifications"
                                    value={formData.certifications || ''}
                                    onChange={handleChange} 
                                />
                            </div>
                            <div>
                                <label>Application</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    name="application"
                                    value={formData.application || ''}
                                    onChange={handleChange} 
                                />
                            </div>
                            <div>
                                    <label>GTIN</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className='input_pdps'
                                        value={formData.gtin || ''}
                                        onChange={handleChange}   />
                                </div>
                            <div>
                                <label>ESG</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    name="esg"
                                    className="input_pdps"
                                    value={formData.esg || ''}
                                    onChange={handleChange} 
                                />
                            </div>
                            <div>
                                <label>Hazardous</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    name="Hazardous"
                                    value={formData.Hazardous || ''}
                                    onChange={handleChange}  />
                            </div>
                            <div>
                                <label>Compliance</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    name="Compliance"
                                    value={formData.Compliance || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label>Prop65</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    name="Prop65"
                                    value={formData.Prop65 || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label>Country Of Origin</label>
                                <select  className='create_product_select input_pdps select-back'
                                    id="country"
                                    name="country_of_origin"
                                    value={formData.country_of_origin || ''}
                                    onChange={handleChange}  >
                                    <option value="">Select a country</option>
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </section>
                    )}
                    <div className={`create-product-submit-button ${isSidebarOpen ? 'product-detail-open' : 'product-detail-closed'}`}>
                    <button type="submit" className='cancel_btn' onClick={(event) => handleCancel(event)} > Cancel  </button>
                        <button type="submit" className="submit_btn"  onClick={activeTab === 'images-videos' ? handleFileUploadSubmit : undefined}>Save</button>
                    </div>
                </form>
            </div>
        </div>
        </div>
    );
};

export default ProductDetail;
