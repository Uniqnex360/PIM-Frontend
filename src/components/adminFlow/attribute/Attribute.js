import React, { useEffect, useState, useRef } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import './Attribute.css';
import axiosInstance from '../../../utils/axiosConfig'; // Assuming you're using axiosInstance for API calls
import Swal from 'sweetalert2';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Import Material UI icons
import UploadIcon from '@mui/icons-material/Upload'; 
import DownloadIcon from '@mui/icons-material/Download';  // Importing Download Icon
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { LinearProgress } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import * as XLSX from 'xlsx';
import Unauthorized from "../../../Unauthorized";
const Attribute = ({ isSidebarOpen, toggleSidebar }) => {
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
  const [selectedFileFormat, setSelectedFileFormat] = useState('XLSX');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [moduleData, setModuleData] = useState([]);
  const location = useLocation();
  const [unauthorized, setUnauthorized] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const currentModule = queryParams.get('module') || 'global'; // Ensuring it's treated as an integer, default to 1 if invalid
  const [selectedTag, setSelectedTag] = useState(currentModule); // Set default to 'global'
  const [activeTab, setActiveTab] = useState('attributes');
  const [attributes, setAttributes] = useState([]);
  const [attributeGroups, setAttributeGroups] = useState([]);
  // Sample static data for each tab (this can later be updated dynamically)
  const fetchAttributeData = async (tag) => {
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainAttribute/?module=${tag}`);
      if (response.status === 401) {
        setUnauthorized(true);
      } 
      if (response.data && response.data.data.attribute_list) {
        setLoader(false);
        setAttributes(response.data.data.attribute_list); // Storing the attribute list
      }
    } catch (error) {
      setLoader(false);
      if (error.status === 401) {
        setUnauthorized(true);
      }else{
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch attribute data.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    
      console.error('Error fetching attribute data:', error);
    }
  };

  useEffect(() => {
    fetchAttributeData(currentModule); // Initially load "global" data
    // fetchAttributeDataGroup();
  }, []); // Runs once when component mounts
  useEffect(() => {
    fetchModuleData();
  }, [selectedTag]);
  // const fetchAttributeDataGroup = async () => {
  //   try {
  //     const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainAttributeGroup/`);
  //     console.log('response', response);
      
  //     if (response.data && response.data.data.attribute_list) {
  //       setAttributeGroups(response.data.data.attribute_list); // Storing the attribute list
  //     }
  //   } catch (error) {
  //     console.error('Error fetching attribute data:', error);
  //   }
  // };
  // Function to handle tag clicks
  const handleTagClick = (tag) => {
    navigate(`/Admin/attributes?module=${tag}`);
    setSelectedTag(tag); // Set the selected tag
    fetchAttributeData(tag); // Call API with the selected tag
  };
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
  // State to handle active tab selection

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddAttribute = () => {
    navigate('/Admin/attribute/add');  // Adjust the path to match your brand list route
  };
  
  const handleAddAttributeGroup = () => {
    Swal.fire({
      title: 'Add Attribute Group',
      html: `
        <div>
          <input id="groupName" class="swal2-input" autocomplete="off" placeholder="Group Name" style="margin: 0px 0px 10px 0px; font-size: 16px;width:100%;" required>
          <input id="groupDescription" class="swal2-input" autocomplete="off" placeholder="Group Code" style="margin: 0px 0px 10px 0px; font-size: 16px;width:100%;" required>
          <select id="attributeDropdown" class="swal2-input" style="margin: 0px 0px 10px 0px; font-size: 16px; width:100%;" required>
            <option value="">Select an Attribute</option>
            ${attributes.map(attr => `<option value="${attr.id}">${attr.name}</option>`)}
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      preConfirm: async () => {
        const groupName = document.getElementById('groupName').value;
        const groupDescription = document.getElementById('groupDescription').value;
        const selectedAttribute = document.getElementById('attributeDropdown').value;

        if (!groupName || !groupDescription || !selectedAttribute) {
          Swal.showValidationMessage('Please fill all fields and select an attribute');
          return false;
        }

        try {
          const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createAttributeGroup/`, {
            name: groupName,
            code: groupDescription,
            attributes: [selectedAttribute], // Send the selected attribute ID
          });

          if (response.data.data.is_created === true) {
            Swal.fire('Success!', 'New attribute group added successfully.', 'success');
            // fetchAttributeDataGroup();
          } else {
            Swal.fire('Error!', 'Failed to add the attribute group. Please try again.', 'error');
          }
        } catch (error) {
          Swal.fire('Error!', 'An error occurred while adding the attribute group. Please try again.', 'error');
          console.error('Error adding attribute group:', error);
        }
      },
    });
  };
      const fetchModuleData = async () => {
        if (!selectedTag) return;
        setLoader(true);
        setLoading(true);
        let endpoint = '';
      
        switch (selectedTag) {
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
          
          if (selectedTag === 'brand') {
            setModuleData(response.data.data.brand_list || []);
            setLoader(false);
          } else if (selectedTag === 'category') {
            setLoader(false);
            setModuleData(response.data.data.category_levels || []);
            console.log(response.data.data.category_levels, 'response.data.data.category_levels');        
          }
        }
       catch (error) {
        setLoader(false);
          console.error('Error fetching module data:', error);
          Swal.fire('Error!', 'An error occurred while fetching data. Please try again.', 'error');
        } finally {
          setLoading(false);
        }
      };
      
      const handleAddBrand = async (attributeName, module_id) => {
        console.log(module_id, 'module_id'); // Checking the module_id being passed
        // Declare variables to store selected category IDs and states
        let selectedCategoryIds = [];
        let expanded = {}; // Track expanded categories
        let selectedCategories = module_id||[]; // Track selected categories
      
        // Function to render categories dynamically with state management
        const renderCategories = (category) => {
          const children = Array.isArray(category.children) ? category.children : [];
      
          return `
            <div key="${category.id}" class="category" style="margin-left: ${children.length > 0 ? '20px' : '54px'}; margin-bottom: 5px;">
              <div>
                ${children.length > 0 ? `
                  <button class="toggle-expand" data-id="${category.id}" style="margin-right: 5px; margin-bottom: 2px;">
                    ${expanded[category.id] ? '−' : '+'}
                  </button>
                ` : ''}
                <input
                  type="checkbox"
                  value="${category.config_id}"
                  ${selectedCategories.includes(category.config_id) ? 'checked' : ''}
                  style="margin-right: 5px; width: 4%;"
                  class="toggle-select-category"
                  data-id="${category.config_id}"
                />
                <span>${category.name}</span>
              </div>
              ${expanded[category.id] ? children.map(renderCategories).join('') : ''}
            </div>
          `;
        };
      
        // Toggle the category expansion
        function toggleExpand(categoryId) {
          // Toggle the expansion of the category
          expanded[categoryId] = !expanded[categoryId];
          updateSwalContent(); // Update SweetAlert content after toggling
        }
      
        // Toggle the category selection
        function toggleSelectCategory(categoryId) {
          if (selectedCategories.includes(categoryId)) {
            selectedCategories = selectedCategories.filter(id => id !== categoryId);
          } else {
            selectedCategories.push(categoryId);
          }
          updateSwalContent(); // Update SweetAlert content after selecting/deselecting
        }
      
        // Function to update the content of the Swal popup
        function updateSwalContent() {
          const categoryHTML = moduleData.length > 0
            ? selectedTag === 'category'
              ? moduleData.map((category) => renderCategories(category)).join('')
              : moduleData.map((item, index) => {
                  const isChecked = module_id && module_id.includes(item.id) ? 'checked' : '';
                  return `
                    <label key="${index}" style="display: block; margin-bottom: 5px;">
                      <input
                        type="checkbox"
                        value="${item.id}"
                        style="margin-right: 10px; width: 3%;"
                        ${isChecked}
                      />
                      ${item.name || item.title || item.product_name}
                    </label>
                  `;
                }).join('')
            : `<p>No ${selectedTag} found.</p>`;
      
          Swal.update({
            html: `
              <div style="max-height: 230px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 7px 10px 4px 0px; text-align: left;">
                ${categoryHTML}
              </div>
            `
          });
      
          // Reattach event listeners after updating the content
          attachEventListeners();
        }
      
        // Attach event listeners for category expansion and selection
        function attachEventListeners() {
          // Add event listener for expanding categories
          document.querySelectorAll('.toggle-expand').forEach(button => {
            button.addEventListener('click', (event) => {
              const categoryId = event.target.getAttribute('data-id');
              toggleExpand(categoryId); // Toggle expand/collapse
            });
          });
      
          // Add event listener for selecting categories
          document.querySelectorAll('.toggle-select-category').forEach(input => {
            input.addEventListener('change', (event) => {
              const categoryId = event.target.getAttribute('data-id');
              toggleSelectCategory(categoryId); // Toggle selection
            });
          });
        }
      
        // Show SweetAlert after data is fetched
        Swal.fire({ title : selectedTag === 'category'  ? 'Select Categories'  : `Select ${selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1)}s`,
          html: `
            <div style="max-height: 230px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 7px 10px 4px 0px; text-align: left;">
              ${moduleData.length > 0
                ? selectedTag === 'category'
                  ? moduleData.map((category) => renderCategories(category)).join('')
                  : moduleData.map((item, index) => {
                      const isChecked = module_id && module_id.includes(item.id) ? 'checked' : '';
                      return `
                        <label key="${index}" style="display: block; margin-bottom: 5px;">
                          <input
                            type="checkbox"
                            value="${item.id}"
                            style="margin-right: 10px; width: 3%;"
                            ${isChecked}
                          />
                          ${item.name || item.title || item.product_name}
                        </label>
                      `;
                    }).join('')
                : `<p>No ${selectedTag} found.</p>`
              }
            </div>
          `,
          showCloseButton: true,
          showCancelButton: true,
          cancelButtonText: 'Close',
          confirmButtonText: 'Add',
          reverseButtons:true,
          didOpen: () => {
            // Attach event listeners once SweetAlert is open
            attachEventListeners();
          },
          preConfirm: async () => {
            // Collect selected category IDs when the "Select" button is clicked
            const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            checkboxes.forEach((checkbox) => {
              selectedCategoryIds.push(checkbox.value); // Store the selected category IDs
            });
      
            console.log('Selected Category IDs:', selectedCategoryIds); // You can now use this variable to process the selected IDs
      
            // API Call to create the attribute
            try {
              const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createAttribute/`, {
                module_id: selectedCategoryIds,
                module_name: selectedTag, // Dynamically set based on selectedTag (brand/category)
                name: attributeName,
              });
      
              if (response.data.data.is_created === true) {
                Swal.fire('Success!', 'Category updated successfully.', 'success');
                fetchAttributeData(selectedTag); // Call API with the selected tag
              } else if (response.data.data.is_created === false) {
                Swal.fire('Warning!', 'This attribute is already present.', 'warning');
              } else {
                Swal.fire('Error!', 'There was an error updating the categories. Please try again.', 'error');
              }
              // Handle the response, for example, show success message
              console.log('API Response:', response.data);
            } catch (error) {
              console.error('Error creating attribute:', error);
              Swal.fire('Error!', 'There was an error creating the attribute. Please try again.', 'error');
            }
          },
        });
      };


  const handleAddValue = async (attributeName, module_id) => {
    // Show SweetAlert2 input pop-up
    const { value: newValue } = await Swal.fire({
      title: 'Enter New Value',
      input: 'text',
      inputPlaceholder: 'Enter value',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
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
        const moduleName = selectedTag; 
        const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createAttribute/`, {
          module_id: module_id,
          module_name: moduleName, // Dynamically set based on selectedTag
          name: attributeName,
          new:newValue,
        });
  
        if (response.data.data.is_created === true) {
          fetchAttributeData(moduleName);
          // If the value is successfully added, update the UI
          Swal.fire('Success!', 'New value added successfully.', 'success');
          // Optionally, you can update the attribute values here
          // For example, call a function to update the state or reload attributes.
        } else if (response.data.data.is_created === false) {
                        Swal.fire({ title: 'Warning!', text: 'This attribute value is already present.', icon: 'warning', confirmButtonText: 'OK'  });          
                        //  fetchAttributes();
                    }
      } catch (error) {
        console.error('Error adding value:', error);
        Swal.fire('Error!', 'There was an issue adding the value. Please try again later.', 'error');
      }
    }
  };
  
  const handleVisibilityToggle = async (attributeId, currentVisibility) => {
    // Ask for confirmation before proceeding with the visibility toggle
    const isConfirmed = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${currentVisibility ? 'inactive' : 'active'} this attribute?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true, // For the buttons' order to be 'Yes' on the left and 'No' on the right
    });
  
    // If the user confirms the action
    if (isConfirmed.isConfirmed) {
      try {
        // Prepare the payload based on the current visibility state
        const payload = {
          id: attributeId,
          is_visible: !currentVisibility, // Toggle the visibility state
        };
  
        // Make the API request to update visibility
        const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/updateVisibilityForattribute/`, payload);
        console.log(response, 'response');
  
        // If visibility is updated successfully
        if (response.data.data.is_update  === true) {
          fetchAttributeData(selectedTag);
          Swal.fire('Success!', 'Visibility updated successfully.', 'success');
        } else {
          Swal.fire('Oops!', 'Visibility update failed.', 'error');
        }
      } catch (error) {
        console.error("Error updating visibility:", error);
        Swal.fire('Error!', 'Something went wrong while updating visibility.', 'error');
      }
    } else {
      // If the user cancels, no changes will be made
      console.log('Visibility update cancelled.');
    }
  };
  const openImportModal = () => {
    setShowImportModal(true);
};

const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setSelectedFileFormat('XLSX');
};

const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
};

const handleUpload = async () => {
    if (!selectedFile) {
      closeImportModal();
        Swal.fire({ title: 'Error!', text: 'Please select a file to upload.', icon: 'error' });
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const uploadPromise = axiosInstance.post(`${process.env.REACT_APP_IP}/importAttribute/`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        localStorage.setItem('status', true);
        // Concurrently, start the progress polling once the upload starts
        const progressPromise = new Promise((resolve) => {
          const interval = setInterval(async () => {     
            const status = localStorage.getItem('status') === null || localStorage.getItem('status') === 'undefined' 
            ? true 
            : JSON.parse(localStorage.getItem('status'));
                  const res = await axiosInstance.get(`${process.env.REACT_APP_IP}/import-progress/?is_first=${status}`);
            const { percentage } = res.data;
            const { is_first } = res.data;
           localStorage.setItem('status', JSON.stringify(is_first));
            setUploadProgress(percentage);
            if (percentage >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 1000);
        });
        // Wait for both the upload and the progress to finish
        await Promise.all([uploadPromise, progressPromise]);
        // Handle success or failure based on the upload response
        const response = await uploadPromise;
        if (response.data.status === true && response.data.is_error === true) {
                              // Separate the correct and error data from the response
                              const errorList = response.data.error_list || []; // Array of errors
                              // Create a table for error data
                              const flattenedErrorList = response.data.error_list.reduce((acc, errorObject) => {
                                // Add each error message from errorObject.error_list to the accumulator
                                return [...acc, ...errorObject.error_list.map(errorMessage => ({
                                    row: errorObject["error-row"],
                                    error: errorMessage
                                }))];
                            }, []);
                            
                            // Limit to first 10 errors
                            const errorListTable = flattenedErrorList.slice(0, 15);
                            // Create the table rows for the first 10 errors
                            const errorRows = errorListTable.map(error => {
                                return `<tr><td style="padding: 5px;">${error.row}</td><td style="font-size: 15px;padding: 5px;">${error.error}</td></tr>`;
                            }).join('');
          const processedRecords = response.data.total_attribute; // Update this value if needed
          const validRecords = response.data.added_count;
          const errorRecords = response.data.error_count;
                              const tableStyle = errorList.length > 3 ? 
                              `max-height: 200px; overflow-y: auto;` : '';
                              const tableHTML = `
                              <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                                <div>
                                  <p style="margin: 0px; text-align: left;"><strong>Validated records:</strong> ${processedRecords}</p>
                                  <p style="margin: 0px; text-align: left;"><strong>Valid Records:</strong> ${validRecords}</p>
                                  <p style="margin: 0px; text-align: left;"><strong>Invalid Records:</strong> ${errorRecords}</p>
                                </div>
                                <!-- Download Icon and Hover Effect -->
                                 <div class="download-icon-container" style="cursor: pointer;width: 0%;" id="downloadErrorList">
                                <i class="fas fa-download" style="font-size: 24px; color: #923be3;float:right;" ></i>
                                <span class="download-text" >Download Error List</span>
                              </div>
                              </div>
                              
                              <table style="width: 100%; border-collapse: collapse; ${tableStyle}">
                                <thead>
                                  <tr>
                                    <th style="border: 1px solid #ccc; padding: 8px; text-align: center;width: 14%;font-size: 16px;">Row</th>
                                    <th style="border: 1px solid #ccc; padding: 8px; text-align: center;font-size: 16px;">Error</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${errorRows}
                                </tbody>
                              </table>
                              
                              <br>
                              <p style="font-weight: bold;margin: 0px;">Showing the first 15 errors. Download error list for more details and retry after fixing issues.</p>
                              <!-- Add the Font Awesome link in the head of your HTML (if not already added) -->
                              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
                              <style>
                                .download-icon-container:hover .download-text {
                                  visibility: visible;
                                  opacity: 1;
                                }
                                          /* Custom styles for the info icon and text in one row */
              .swal-title-custom {
                display: flex;
                align-items: center;
                font-size: 18px;
                font-size: 27px;
                flex-direction: row;
          justify-content: center;
              }

              .swal-title-custom i {
                font-size: 40px;
                margin-right: 10px; /* Space between icon and text */
                color: skyblue;
              }

              .swal-title-custom span {
                font-weight: bold;
              }
                              </style>
                            `;
                              // Displaying results using Swal with HTML table format for both success and errors
          Swal.fire({
            title: '<div class="swal-title-custom"><i class="fas fa-info-circle"></i><span>Import Results</span></div>', // Info icon and text in the same row
            html: tableHTML,
            // icon: 'info',
            showCancelButton: false,
            showCloseButton: true, // Show the close button in the top-right corner
            allowOutsideClick: false, // Disable closing by clicking outside
            confirmButtonText: 'OK',
            customClass: {
              popup: 'swal-popup-custom',
              title: 'swal-title-custom',
            },
            width: '550px', // Reduce width of the popup
            didOpen: () => {
              document.getElementById('downloadErrorList')?.addEventListener('click', () => downloadErrorList(errorList));
            },
          });
                             setSelectedFile(null);
                             fetchAttributeData(currentModule); // Initially load "global" data
                              closeImportModal();
        } else if (response.data.status === true && response.data.is_error === false) {
          const processedRecords = response.data.total_attribute; // Update this value if needed
          const validRecords = response.data.added_count;
          const errorRecords = response.data.error_count;
           const additionalInfo = `
                                                         <div>
                                                           <p style="margin: 0px; text-align: left;"><strong>Validated records:</strong> ${processedRecords}</p>
                                                           <p style="margin: 0px; text-align: left;"><strong>Valid Records:</strong> ${validRecords}</p>
                                                           <p style="margin: 0px; text-align: left;"><strong>Invalid Records:</strong> ${errorRecords}</p>
                                                         </div>
                                                       `;
                           // Display the success message with the additional information
                           Swal.fire({
                             title: 'File imported successfully!',
                             icon: 'success',
                             html: additionalInfo, // Insert the additional info in the modal
                             showCloseButton: true, // Show the close button in the top-right corner
                             allowOutsideClick: false, // Disable closing by clicking outside
                             showConfirmButton: false, // Optionally hide the confirm button
                             customClass: {
                               icon: 'custom-icon-margin' // Custom class for icon styling
                             }
                           });
            setSelectedFile(null);
            fetchAttributeData(currentModule); // Initially load "global" data
            closeImportModal();
        } else if (response.data.status === false) {
          const flattenedErrorList = response.data.error_list.reduce((acc, errorObject) => {
            // Add each error message from errorObject.error_list to the accumulator
            return [...acc, ...errorObject.error_list.map(errorMessage => ({
                row: errorObject["error-row"],
                error: errorMessage
            }))];
        }, []);
        
        // Limit to first 10 errors
        const errorListTable = flattenedErrorList.slice(0, 15);
        // Create the table rows for the first 10 errors
        const errorRows = errorListTable.map(error => {
            return `<tr><td style="padding: 5px;">${error.row}</td><td style="font-size: 15px;padding: 5px;">${error.error}</td></tr>`;
        }).join('');
          const processedRecords = response.data.total_attribute; // Update this value if needed
          const validRecords = response.data.added_count;
          const errorRecords = response.data.error_count;
                const errorList = response.data.error_list || []; // Array of errors
                const tableStyle = errorList.length > 3 ? 
                `max-height: 200px; overflow-y: auto;` : '';
                const tableHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <p style="margin: 0px; text-align: left;"><strong>Validated records:</strong> ${processedRecords}</p>
              <p style="margin: 0px; text-align: left;"><strong>Valid Records:</strong> ${validRecords}</p>
              <p style="margin: 0px; text-align: left;"><strong>Invalid Records:</strong> ${errorRecords}</p>
            </div>
            <!-- Download Icon and Hover Effect -->
             <div class="download-icon-container" style="cursor: pointer;width: 0%;" id="downloadErrorList">
            <i class="fas fa-download" style="font-size: 24px; color: #923be3;float:right;" ></i>
            <span class="download-text" >Download Error List</span>
          </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; ${tableStyle}">
            <thead>
              <tr>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: center;width: 14%;font-size: 16px;">Row</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: center;font-size: 16px;">Error</th>
              </tr>
            </thead>
            <tbody>
              ${errorRows}
            </tbody>
          </table>
          
          <br>
          <p style="font-weight: bold;margin: 0px;">Showing the first 15 errors. Download error list for more details and retry after fixing issues.</p>
          <!-- Add the Font Awesome link in the head of your HTML (if not already added) -->
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
          <style>
            .download-icon-container:hover .download-text {
              visibility: visible;
              opacity: 1;
            }
               /* Custom styles for the warning icon and text in one row */
                                  .swal-title-custom-import {
                                    display: flex;
                                    align-items: center;
                                    font-size: 27px;
                                    flex-direction: row;
                              justify-content: center;
                                  }

                                  .swal-title-custom-import i {
                                    font-size: 40px;
                                    margin-right: 10px; /* Space between icon and text */
                                    color: orange;
                                  }

                                  .swal-title-custom-import span {
                                    font-weight: bold;
                                  }
          </style>
        `;   
          Swal.fire({
            title: '<div class="swal-title-custom-import"><i class="fas fa-exclamation-circle"></i><span>Warning</span></div>', // Icon and text in the same row
            html: tableHTML,
            // icon: 'warning',
            showCancelButton: false,
            showCloseButton: true, // Show the close button in the top-right corner
            allowOutsideClick: false, // Disable closing by clicking outside
            confirmButtonText: 'OK',
            customClass: {
              popup: 'swal-popup-custom',
              title: 'swal-title-custom-import', // Apply the custom class for title
            },
            width: '550px', // Reduce width of the popup
            didOpen: () => {
              document.getElementById('downloadErrorList')?.addEventListener('click', () => downloadErrorList(errorList));
            },
          });
          setSelectedFile(null);
          fetchAttributeData(currentModule); // Initially load "global" data
          closeImportModal();
      }
        else {
            setSelectedFile(null);
            closeImportModal();
            Swal.fire({ title: 'Error!', text: 'Failed to import file.', icon: 'error' });
        }
    } catch (error) {
      closeImportModal();
        console.error('Error uploading file:', error);
        Swal.fire({ title: 'Error!', text: 'Something went wrong. Try again.', icon: 'error' });
    } finally {
        setLoading(false);
    }
};
const downloadErrorList = (errorList) => {
    if (!errorList || errorList.length === 0) {
      Swal.fire({ title: 'Error!', text: 'No errors to export.', icon: 'error' });
      return;
    }
    // Create an array to hold the formatted error data
    const formattedErrors = [];
    errorList.forEach(errorObject => {
        // Create a new object for each row
        const rowData = {
            Row: errorObject["error-row"]
        };
        // Add each error as a separate "Errors" column
        errorObject.error_list.forEach((error, index) => {
            rowData[`Errors ${index + 1}`] = error;  // Errors 1, Errors 2, Errors 3, etc.
        });
        formattedErrors.push(rowData);
    });
    // Generate the worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(formattedErrors);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Error List");
  
    // Generate a download link
    XLSX.writeFile(wb, "error_list.xlsx");
    Swal.fire({
      title: 'Success!',
      text: 'The error list has been successfully downloaded.',
      icon: 'success'
  });
  };
const downloadSampleFile = async () => {
  try {
    const fileExtension = selectedFileFormat.toLowerCase();  // 'xlsx', 'ods', 'csv'
    // Replace the URL with the actual API endpoint that serves the sample file.
    const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/sample_ots_file/?file_format=${fileExtension}`, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/vnd.oasis.opendocument.spreadsheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sampleAttribute.${fileExtension}`;  // Dynamically changes based on dropdown
    link.click();
  } catch (error) {
    console.error('Error downloading sample file:', error);
      Swal.fire({
              icon: 'error',
              title: 'Failed to download the sample file.',
            });
  }
};
const handleExport = async () => {
  setLoading(true);
  // Show a Swal pop-up with options for active, inactive, and all attributes
  const { value: formValues } = await Swal.fire({
    title: 'Export Options',
    html: `<div style="font-size: 16px; padding-bottom: 10px;">
            <label for="activeAttributes" style="display: block;margin-right: 13px;">
                <input type="radio" id="activeAttributes" style="width: 4%;" name="attributeStatus" /> Active Attributes
            </label>
            <label for="inactiveAttributes" style="display: block;">
                <input type="radio" id="inactiveAttributes" style="width: 4%;" name="attributeStatus" /> Inactive Attributes
            </label>
            <label for="allAttributes" style="display: block;margin-right: 38px;">
                <input type="radio" id="allAttributes" style="width: 4%;" name="attributeStatus" checked /> All Attributes
            </label>
        </div>`,
    showCancelButton: true,
    confirmButtonText: 'Export',
    cancelButtonText: 'Cancel',
    focusCancel: true,
    customClass: {
      container: 'swal-custom-container',
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      confirmButton: 'swal-custom-confirm export-custom',
      cancelButton: 'swal-custom-cancel',
    },
    preConfirm: () => {
      const isActiveAttributes = document.getElementById('activeAttributes').checked;
      const isInactiveAttributes = document.getElementById('inactiveAttributes').checked;
      const isAllAttributes = document.getElementById('allAttributes').checked;
      return { isActiveAttributes, isInactiveAttributes, isAllAttributes };
    }
  });

  if (formValues) {
    try {
      // Make the API call with parameters based on selected options
      const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/exportAttribute/`, {
        responseType: 'blob',
        params: {
          // If 'All Attributes' is selected, don't send is_active filter
          is_active: formValues.isAllAttributes ? undefined : (formValues.isActiveAttributes ? true : (formValues.isInactiveAttributes ? false : undefined)),
        }
      });

      // Create a URL for the file and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attribute_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show a success notification
      Swal.fire({
        title: 'Success!',
        text: 'Attribute list exported successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          container: 'swal-custom-container',
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm',
          cancelButton: 'swal-custom-cancel',
        }
      });
    } catch (error) {
      console.error('Error exporting Attribute:', error);

      // Show an error notification if the export fails
      Swal.fire({
        title: 'Export Failed!',
        text: 'An error occurred while exporting the attribute data.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          container: 'swal-custom-container',
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm',
          cancelButton: 'swal-custom-cancel',
        },
      });
    } finally {
      setLoading(false);
    }
  }
};
  return (
    <div>
          {loader && (
        <div className="loader-overlay">
          <div className="spinner"></div> {/* Custom spinner */}
        </div>
      )}
    <div className="attribute-page" sx={{marginTop:'30px'}}>
      <h1 style={{fontSize:'21px', margin:'18px 0px 5px 0px'}}> Attributes </h1>

      {/* Add Attribute Button (only visible in the 'attributes' tab) */}
      {activeTab === 'attributes' && (
  <div className="addbrandcontainer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' ,marginTop:'-34px'}}>
    {/* Add Attribute Button */}
    <button className="add-attribute-butn import-btn" onClick={handleAddAttribute}>
    <AddOutlinedIcon style={{ cursor: 'pointer' }} className="add-product-btn" />
    <span className="button-text" style={{width:'75px'}}>Add Attribute</span>
    </button>

    {/* Import Button */}
    <button 
      className="import-btn" 
      onClick={openImportModal} 
      style={{ marginLeft: '12px' }}
    >
      <DownloadIcon />
      <span className="button-text">Import</span> {/* Tooltip-like text shown on hover */}
    </button>

    {/* Export Button */}
    <button 
      className="import-btn download-btn" 
      onClick={handleExport} 
      style={{ marginLeft: '12px' }}
    >
      <UploadIcon />
      <span className="button-text">Export</span> {/* Tooltip-like text shown on hover */}
    </button>
  </div>
)}

      {activeTab === 'attributes-group' && (
        <button className="add-attribute-butn" onClick={handleAddAttributeGroup}>
          Add Attribute Group
        </button>
      )}
      
      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-button ${activeTab === 'attributes' ? 'active' : ''}`}
          onClick={() => handleTabChange('attributes')} >
          Attributes
        </button>
        <button
          className={`tab-button ${activeTab === 'attributes-group' ? 'active' : ''}`}
          onClick={() => handleTabChange('attributes-group')} >
          Attribute Group
        </button>
      </div>

      {/* Tag Navigation */}
      <div className="tag-nav" style={{ marginBottom: '20px' }}>
        <button
          className={`tag-btn ${selectedTag === 'global' ? 'active' : ''}`}
          onClick={() => handleTagClick('global')}>
          Global
        </button>
        <button
          className={`tag-btn ${selectedTag === 'brand' ? 'active' : ''}`}
          onClick={() => handleTagClick('brand')}>
          Brands
        </button>
        <button
          className={`tag-btn ${selectedTag === 'category' ? 'active' : ''}`}
          onClick={() => handleTagClick('category')}>
          Categories
        </button>
        {/* <button
          className={`tag-btn ${selectedTag === 'product' ? 'active' : ''}`}
          onClick={() => handleTagClick('product')}>
          Products
        </button> */}
      </div>

      {/* Content based on selected tab */}
      <div className="tab-content">
      {activeTab === 'attributes' && (
  <div>
    <h3 style={{margin:'0px 0px 17px 0px'}}>Attributes List</h3>
    <table>
      <thead>
        <tr>
          <th>S.No</th>
          <th>Name</th>
          <th>Type</th>
          <th>Values</th> {/* New column for values */}
          {selectedTag !== 'global' && <th>Applicable Module</th>}
          <th>Action</th> {/* Action column */}
        </tr>
      </thead>
      <tbody>
      {attributes.length === 0 ? (
                  <tr>
                     {loader && (
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      Loading attributes
                    </td>
                  )}
                    {!loader && (
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        No attributes found
                      </td>
                    )}
                  </tr>
                ) : (
      attributes.map((attribute, index) => (
          <tr key={attribute.id}>
            <td>{index + 1}</td> {/* Session No - based on row number */}
            <td>{attribute.name}</td>
            <td>{attribute.type}</td>
            <td>
              {/* Render the values as tags */}
              {attribute.values && attribute.values.length > 0 ? (
                attribute.values.map((value, valueIndex) => (
                  <span
                    key={valueIndex}
                    style={{
                      backgroundColor: '#e2e2e2',
                      padding: '5px 10px',
                      margin: '5px',
                      borderRadius: '5px',
                      fontSize: '13px',
                      display: 'inline-block'
                    }}
                  >
                    {value}
                  </span>
                ))
              ) : (
                <span>No values</span> // If no values exist
              )}
              <button
                type="button"
                className="add-groupcategory-btn"
                onClick={() => {
                  // Collect all module ids into a list
                  const moduleIds = attribute.module_name.map(module => module.id);
                  // Send the list of module ids along with the attribute name
                  handleAddValue(attribute.name, moduleIds); // Pass attribute name and list of module ids
                }}
                style={{
                  backgroundColor: '#e2e2e2',
                  color: 'black',
                  border: 'none',
                  padding: '4px 7px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  marginLeft: '10px', // Space between values and button
                }}
              >
                +
              </button>
            </td>
            {selectedTag !== 'global' && (
            <td>
              {/* Render module names as tags */}
              {attribute.module_name && attribute.module_name.length > 0 ? (
                attribute.module_name.map((module, moduleIndex) => (
                  <span
                    key={moduleIndex}
                    style={{
                      backgroundColor: '#e2e2e2',
                      padding: '5px 10px',
                      margin: '5px',
                      borderRadius: '5px',
                      fontSize: '13px',
                      display: 'inline-block'
                    }}
                  >
                    {module.name}
                  </span>
                ))
              ) : (
                <span>No modules</span> // If no modules exist
              )}
              <button
                type="button"
                className="add-groupcategory-btn"
                onClick={() => {
                  // Collect all module ids into a list
                  const moduleIds = attribute.module_name.map(module => module.id);
                  // Send the list of module ids along with the attribute name
                  handleAddBrand(attribute.name, moduleIds); // Pass attribute name and list of module ids
                }}
                style={{
                  backgroundColor: '#e2e2e2',
                  color: 'black',
                  border: 'none',
                  padding: '4px 7px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  marginLeft: '10px', // Space between values and button
                }}
              >
                +
              </button>
            </td>
          )}
           <td>
      {/* Display Material UI icons for visibility */}
      <span
        style={{
          cursor: 'pointer',
          display: 'inline-block',
          transition: 'transform 0.3s',
        }}
        onClick={() => handleVisibilityToggle(attribute.id, attribute.is_visible)}
        className={`visibility-icon ${attribute.is_visible ? 'active' : 'inactive'}`}
      >
        {attribute.is_visible ? (
          <>
            <Visibility
              style={{
                color: '#9400cc',
              }}
              title="Visible"
              className="visibility-icon-active"
            />
            <span className="status-text">Active</span>
          </>
        ) : (
          <>
            <VisibilityOff
              style={{
                color: 'red',
              }}
              title="Not Visible"
              className="visibility-icon-inactive"
            />
            <span className="status-text inactivetext">Inactive</span>
          </>
        )}
      </span>
    </td>
          </tr>
        ))
      )}
      </tbody>
    </table>
  </div>
)}
        {activeTab === 'attributes-group' && (
          <div>
            <h3>Attribute Groups List</h3>
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Code</th>
                </tr>
              </thead>
              <tbody>
                {attributeGroups.map((group, index) => (
                  <tr key={group.Attribute_group_id}>
                    <td>{index + 1}</td> {/* Session No - based on row number */}
                    <td>{group.name}</td>
                    <td>{group.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
     <Modal open={showImportModal} onClose={closeImportModal}>
    <div className="import-modal">
    <Button
            variant="text"
            color="default"
            onClick={closeImportModal}
            className="cancel-button"
        >
            &times; {/* Using &times; for an "X" symbol */}
        </Button>
        <h2>Import File</h2>
        <p>Upload a file to import data into the system.</p>

        {/* Download Sample File Link */}
        <a
            href="#!"
            className="download-sample"
            onClick={downloadSampleFile}
            style={{ cursor: 'pointer', color: '#1a73e8', textDecoration: 'underline' }}  >
            Download Sample File
        </a>
        <select
                id="file-format"
                value={selectedFileFormat}
                onChange={(e) => setSelectedFileFormat(e.target.value)}
                className="file-format-select select-back"   >
                <option value="XLSX">XLSX</option>
                <option value="ODS">ODS</option>
                <option value="CSV">CSV</option>
            </select>
        <input
            type="file"
            id="file-input"
            autoComplete="off"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}  />
        
        <div className="file-upload-section">
            <Button
                variant="contained"
                color="primary"
                className="selectFile_btn"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}  >
                Select File
            </Button>
            {selectedFile && <span className="file-name">{selectedFile.name}</span>}
        </div>

        <div className="actionsbtn">
            <Button
                variant="contained"
                color="success"
                onClick={handleUpload}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}  >
                {loading ? 'Uploading...' : 'Upload'}
            </Button>
        </div>
        
        {loading && (
            <div style={{ marginTop: '10px' }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <p style={{ textAlign: 'center', marginTop: '5px' }}>{uploadProgress}%</p>
            </div>
        )}
    </div>
</Modal>
    </div>
    </div>
  );
};

export default Attribute;
