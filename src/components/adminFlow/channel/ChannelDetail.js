import React, { useEffect, useState, useRef  } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import './ChannelDetail.css'; // Add your styling for this page
import UploadIcon from '@mui/icons-material/Upload'; 
import amazonLogo from '../../../assets/Amazon.png'; // Add your Amazon logo here
import shopifyLogo from '../../../assets/Shopify.jpg'; // Add your Shopify logo here
import bigcommerceLogo from '../../../assets/Bigcommerce.jpg';
import axiosInstance from '../../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import DownloadIcon from '@mui/icons-material/Download'; 
import CircularProgress from '@mui/material/CircularProgress';
import { Modal, Button, LinearProgress } from "@mui/material";
import * as XLSX from 'xlsx';
import Unauthorized from "../../../Unauthorized";

const ChannelDetail = ({ isSidebarOpen, toggleSidebar }) => {
  const { channelName } = useParams(); // Get the channel name from the URL
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
  // Sample content for each channel
  const channelInfo = {
    amazon: {
      title: 'Amazon Channel',
      // description: 'Sell your products on Amazon with a global audience. Manage listings, orders, and more.',
      image: amazonLogo, // Add image path for Amazon (if required)
    },
    shopify: {
      title: 'Shopify Channel',
      // description: 'Build your online store with Shopify and reach customers worldwide. Create your own branded store.',
      image: shopifyLogo, // Add image path for Shopify (if required)
    },
    bigcommerce: {
      title: 'BigCommerce Channel',
      // description: 'Build and scale your online business with BigCommerce. Customize your store and optimize for growth.',
      image: bigcommerceLogo, // Add image path for BigCommerce
    },
    // Add more channels here as they come, dynamically!
  };
  const [unauthorized, setUnauthorized] = useState(false);
   const [loading, setLoading] = useState(false);
  const [selectedFileFormat, setSelectedFileFormat] = useState('XLSX');
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [brands, setBrands] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [channelwise, setChannels] = useState([]);
  const [loader, setLoader] = useState(false);
  const [categories, setCategories] = useState([]);
  let [selectedBrands, setSelectedBrands] = useState([]);
  let [selectedVendors, setSelectedVendors] = useState([]);
  let [selectedCategories, setSelectedCategories] = useState([]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
};
  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchVendors();
    fetchChannelWise();
  }, []);

const fetchBrands = async () => {
    try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBrand/?search=`);
        console.log('Brands API Response:', response.data); // Debug log
        setBrands(response.data.brand_list || []); // Remove the extra .data layer
    } catch (error) {
        console.error('Error fetching brands', error);
    }
};

const fetchVendors = async () => {
    try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainVendor/?search=`);
        console.log('Vendors API Response:', response.data); // Debug log
        setVendors(response.data.vendor_list || []); // Remove the extra .data layer
    } catch (error) {
        console.error('Error fetching vendors', error);
    }
};

const fetchCategories = async () => {
    try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainCategory/?search=`);
        console.log('Categories API Response:', response.data); // Debug log
        setCategories(response.data.category_levels || []); // Remove the extra .data layer
    } catch (error) {
        console.error('Error fetching categories', error);
    }
};

  // Fallback content if the channel is not found
  const channel = channelInfo[channelName] || {
    title: 'Channel Not Found',
    description: 'The selected channel does not exist.',
  };
    const triggerDownload = (response) => {
      // Create a URL for the file and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Product_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    
      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: 'Channel list exported successfully.',
        icon: 'success'
      });
    };
const fetchChannelWise = async () => {
    setLoader(true);
    try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainChannelwiseTaxonomy/?channel_name=${channelName}`);
        console.log('Channel wise API Response:', response.data); // Debug log
        
        setLoader(false);
        if (response.status === 401) {
            setUnauthorized(true);
        } 
        // Fix: Remove the extra .data layer - the API returns data directly
        setChannels(response.data.category_group_list || []);
    } catch (error) {
        setLoader(false);
        if (error.response?.status === 401) {
            setUnauthorized(true);
        } else {
            console.error('Error fetching Counts:', error);
            Swal.fire({ 
                title: 'Error!', 
                text: 'Failed to load channel taxonomy data.', 
                icon: 'error', 
                confirmButtonText: 'OK' 
            });
        }
    }
};
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
    const handleExport = () => {
      // Trigger the filter dialog to allow users to select filters
      handleFilterClick();
    };
const handleBacktoChannelList = () => {
    navigate('/Admin/channel');
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      closeImportModal();
        Swal.fire({ title: 'Error!', text: 'Please select a file to upload.', icon: 'error' });
        return;
    }

    setLoading(true);
    const formData = new FormData();
    const channelType = channelName.toLowerCase(); // This will be either 'amazon' or 'shopify'

    formData.append('file', selectedFile);
    formData.append('channel_name', channelType);

    try {
        const uploadPromise = axiosInstance.post(`${process.env.REACT_APP_IP}/importCategoryForChannel/`,
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
        const processedRecords = response.data.total_category; // Update this value if needed
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
        fetchChannelWise();
        closeImportModal();
      } else if (response.data.status === true && response.data.is_error === false) {
        const processedRecords = response.data.total_category; // Update this value if needed
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
        fetchChannelWise();
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
        const processedRecords = response.data.total_category; // Update this value if needed
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
              
        fetchChannelWise();
        setSelectedFile(null);
        closeImportModal();
      } else {
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
  const openImportModal = () => {
    setShowImportModal(true);
  };
  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFileFormat('XLSX');
  };
 const handleFilterClick = () => {
   Swal.fire({
        title: 'Export By',
        html: `
          <div class="filter-tags" style="display: flex; gap: 10px; margin-bottom: 10px;">
            <button id="brand-btn" class="filter-tab active" style="padding: 5px 10px; border: none; cursor: pointer; background: #a52be4; color: white; border-radius: 4px;">
              Brand${selectedBrands.length > 0 ? ` (${selectedBrands.length})` : ''}
            </button>
            <button id="vendor-btn" class="filter-tab" style="padding: 5px 10px; border: none; cursor: pointer; background: #6c757d; color: white; border-radius: 4px;">
              Vendor${selectedVendors.length > 0 ? ` (${selectedVendors.length})` : ''}
            </button>
            <button id="category-btn" class="filter-tab" style="padding: 5px 10px; border: none; cursor: pointer; background: #6c757d; color: white; border-radius: 4px;">
              Category${selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ''}
            </button>
            <!-- Add Refresh Icon after Category -->
            <button id="refresh-btn" class="filter-tab" style="padding: 5px 10px; border: none; cursor: pointer; color: white; border-radius: 4px;">
              <i class="fa fa-refresh" style="font-size: 16px;color:grey;"></i>
            </button>
          </div>
          <div id="filter-content" class="filter-content" style="max-height: 230px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 7px 10px 4px 0px; text-align: left;"></div>
        `,
        showCancelButton: false,
        showCloseButton: true,
        showDenyButton: true,
        denyButtonText: 'Export All',
        confirmButtonText: 'Export Selected',
        reverseButtons: true,
        didOpen: () => {
          // Close button should be styled as 'X' at the top right
          const closeButton = document.querySelector('.swal2-close');
          if (closeButton) {
            closeButton.innerHTML = '×'; // Replace with 'X'
            closeButton.style.fontSize = '40px'; // Make it larger
            closeButton.style.top = '10px'; // Position it at the top
            closeButton.style.right = '10px'; // Position it at the top-right corner
          }
          // Event listener for the refresh button to clear filters
          document.getElementById('refresh-btn').addEventListener('click', handleFiltersClear);
          const refreshBtn = document.getElementById('refresh-btn');
          refreshBtn.addEventListener('click', handleFiltersClear);
          
          const denyButton = document.querySelector('.swal2-deny');
          if (denyButton) {
            denyButton.style.fontSize = '15px'; // Make it larger
          }
    
          // Add event listeners to buttons for switching tabs
          document.getElementById('brand-btn').addEventListener('click', () => switchTab('brand'));
          document.getElementById('vendor-btn').addEventListener('click', () => switchTab('vendor'));
          document.getElementById('category-btn').addEventListener('click', () => switchTab('category'));
          switchTab('brand'); // Default tab
          const refreshButton = document.getElementById('refresh-btn');
          refreshButton.addEventListener('mouseenter', () => {
            const span = document.createElement('span');
            span.id = 'clear-all-text';
            span.style.color = 'grey';
            span.style.marginLeft = '5px';
            span.style.fontSize = '14px';
            span.textContent = 'Clear All';
            refreshButton.appendChild(span);
          });
          refreshButton.addEventListener('mouseleave', () => {
            const span = document.getElementById('clear-all-text');
            if (span) {
              span.remove();
            }
          });    
        },
        preConfirm: () => {          
          if (selectedBrands.length === 0 && selectedVendors.length === 0 && selectedCategories.length === 0) {
            Swal.showValidationMessage('Please select at least one option from Brand, Vendor, or Category.');
            return false; // Prevent confirmation until a selection is made
          }
          return { selectedBrands, selectedVendors, selectedCategories };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Apply filters
          setSelectedBrands([...selectedBrands]);
          setSelectedVendors([...selectedVendors]);
          setSelectedCategories([...selectedCategories]);
    
          // After filters are confirmed, trigger the export with the selected filters
          triggerExportWithFilters();
        } else if (result.isDenied) {
          // Export all data
          triggerExportWithOutFilters();
        }
      });
 };
 const triggerExportWithFilters = async () => {
  try {
    const channelType = channelName.toLowerCase(); 
    const payload = {
      action: channelType,
      brand_id: selectedBrands,
      vendor_id: selectedVendors,
      category_id: selectedCategories
    };

    const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/exportProduct/`, payload, {
      responseType: 'blob'
    });

    triggerDownload(response);
  } catch (error) {
    console.error('Error exporting filtered products:', error);
    Swal.fire({
      title: 'Export Failed!',
      text: 'An error occurred while exporting the filtered product data.',
      icon: 'error'
    });
  }
};

const triggerExportWithOutFilters = async () => {
  try {
    const channelType = channelName.toLowerCase(); 
    const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/exportProduct/`, {
      action: channelType
    }, {
      responseType: 'blob'
    });

    triggerDownload(response);
  } catch (error) {
    console.error('Error exporting all products:', error);
    Swal.fire({
      title: 'Export Failed!',
      text: 'An error occurred while exporting all product data.',
      icon: 'error'
    });
  }
};

 const switchTab = (type) => {
   document.querySelectorAll('.filter-tab').forEach(button => {
     button.style.background = '#6c757d';
   });
   document.getElementById(`${type}-btn`).style.background = '#a52be4';
   loadList(type);
 };
 
 const updateSelection = (type, id, isChecked) => {
   if (type === 'brand') {
     selectedBrands = isChecked
       ? [...selectedBrands, id]
       : selectedBrands.filter(brand => brand !== id);
   } else if (type === 'vendor') {
     selectedVendors = isChecked
       ? [...selectedVendors, id]
       : selectedVendors.filter(vendor => vendor !== id);
   } else if (type === 'category') {
     selectedCategories = isChecked
       ? [...selectedCategories, id]
       : selectedCategories.filter(category => category !== id);
   }
   updateFilterTagsCount();
  };
  
  const updateFilterTagsCount = () => {
    document.getElementById('brand-btn').innerText = `Brand${selectedBrands.length > 0 ? ` (${selectedBrands.length})` : ''}`;
    document.getElementById('vendor-btn').innerText = `Vendor${selectedVendors.length > 0 ? ` (${selectedVendors.length})` : ''}`;
    document.getElementById('category-btn').innerText = `Category${selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ''}`;
  };
 const loadList = (type) => {
   let data = type === 'brand' ? brands : type === 'vendor' ? vendors : categories;
   let selected = type === 'brand' ? selectedBrands : type === 'vendor' ? selectedVendors : selectedCategories;
 
   document.getElementById('filter-content').innerHTML =
     type === 'category' && data.length > 0
       ? renderCategoryList(data)
       : data.length > 0
       ? data
           .map(
             (item) => `
           <div class="filter-item" data-id="${item.id}" style="margin-bottom: 5px;">
             <label for="${type}-${item.id}">
               <input type="checkbox" class="filter-checkbox" 
                      style="margin-right: 10px; width: 3%;" 
                      id="${type}-${item.id}" 
                      data-type="${type}" 
                      data-id="${item.id}" 
                      ${selected.includes(item.id) ? 'checked' : ''}>
               ${item.name}
             </label>
           </div>
         `
           )
           .join('')
       : `<p style="text-align: center;">No ${type} found.</p>`;
 
   document.querySelectorAll('.filter-checkbox').forEach((checkbox) => {
     checkbox.addEventListener('change', (event) => {
       const type = event.target.dataset.type;
       const id = event.target.dataset.id;
       const isChecked = event.target.checked;
       updateSelection(type, id, isChecked);
     });
   });
 
   if (type === 'category') {
     attachCategoryEvents();
   }
 };
 
 const renderCategoryList = (categories) => {
   return categories.map(renderCategories).join('');
 };
 
 const renderCategories = (category) => {
   const children = Array.isArray(category.children) ? category.children : [];
 
   return `
     <div key="${category.id}" class="category" 
          style="margin-left: ${children.length > 0 ? '20px' : '54px'}; margin-bottom: 5px;">
       <div>
         ${children.length > 0 ? `
           <button class="toggle-expand" data-id="${category.id}" 
                   style="margin-right: 5px; margin-bottom: 2px; cursor: pointer;">
             ${expandedCategories[category.id] ? '−' : '+'}
           </button>` : ''}
         <input type="checkbox" value="${category.config_id}" 
                ${selectedCategories.includes(category.config_id) ? 'checked' : ''} 
                style="margin-right: 5px; width: 4%;" 
                class="toggle-select-category" data-id="${category.config_id}">
         <span>${category.name}</span>
       </div>
       ${expandedCategories[category.id] ? children.map(renderCategories).join('') : ''}
     </div>
   `;
 };
 
 const attachCategoryEvents = () => {
   document.querySelectorAll('.toggle-expand').forEach((button) => {
     button.addEventListener('click', (event) => {
       const categoryId = event.target.dataset.id;
       expandedCategories[categoryId] = !expandedCategories[categoryId];
       loadList('category');
     });
   });
 
   document.querySelectorAll('.toggle-select-category').forEach((checkbox) => {
     checkbox.addEventListener('change', (event) => {
       updateSelection('category', event.target.dataset.id, event.target.checked);
     });
   });
 };
 
 // Initialize expanded state for categories
 let expandedCategories = {};
 const handleFiltersClear = async () => {  
  if (selectedBrands.length === 0 && selectedVendors.length === 0 && selectedCategories.length === 0) {
        Swal.showValidationMessage('There is no selected options from Brand, Vendor, or Category to clear.');
        return false; 
      }
   setSelectedCategories([]);
   setSelectedVendors([]);
   setSelectedBrands([]);
   selectedCategories='';
   selectedVendors='';
   selectedBrands='';
   Swal.fire({
     icon: 'success',
     title: 'Success!',
     text: 'All filters are cleared successfully.',
     confirmButtonText: 'OK',
   });
  }
  return (
    <div>
          {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div> {/* Custom spinner */}
        </div>
      )}
    <div className="channel-page-container">
       <div className="addbrandcontainer" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
  {/* Left side: Arrow button */}
  <button
    onClick={handleBacktoChannelList}
    className="back-button"
    style={{ marginRight: '10px', marginBottom:'10px', display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: '23px' }}
  >
    <FontAwesomeIcon icon={faArrowLeft} />
    <span className="back-vendor-text"> Back to Channel List</span>
  </button>

  {/* Centered Channel Title */}
  <h2 className="channel-page-header" style={{ flexGrow: 1, textAlign: 'center',margin:'0px' }}>
    {channel.title}
  </h2>

  {/* Right side: Filter, Import, Export buttons */}
  <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
    {/* Filter Button */}
    {/* Import Button */}
    <button className="import-btn" onClick={openImportModal} style={{ marginRight: '5px' }}>
      <DownloadIcon />
      <span className="button-text">Import</span>
    </button>

    {/* Export Button */}
    <button
      className="import-btn download-btn"
      onClick={handleExport}
      style={{ marginLeft: '8px' }}
    >
      <UploadIcon />
      <span className="button-text">Export</span>
    </button>
  </div>
</div>
      <div className="channel-info">
  <div className="right-side">
    <table className="taxonomy-table">
      <thead>
        <tr>
          <th style={{width:'50%'}}>PIM taxonomy</th>
          <th style={{width:'50%'}}>Channel taxonomy</th>
        </tr>
      </thead>
      <tbody>
        {channelwise && channelwise.length > 0 ? (
          channelwise.map((group, index) => (
            <tr key={index}>
              <td>{group.taxonomy_level}</td>
              <td>{group.category_taxonomy_level}</td>
            </tr>
          ))
        ) : (
          <tr>
            {loader && ( <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}> Loading categories... </td> )}
            {!loader && (<td colSpan="2" style={{ textAlign: 'center'}}> No category wise taxonomy </td> )}
          </tr>
        )}
      </tbody>
    </table>
  </div>
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
        <div className="download-sample-container">
            <a
                href={`/importChannelCategory.${selectedFileFormat.toLowerCase()}`}
                download
                className="download-sample"
            >
                Download Sample File
            </a>

            {/* Dropdown for selecting file format */}
            <select
                id="file-format"
                value={selectedFileFormat}
                onChange={(e) => setSelectedFileFormat(e.target.value)}
                className="file-format-select select-back"
            >
                <option value="XLSX">XLSX</option>
                <option value="ODS">ODS</option>
                <option value="CSV">CSV</option>
            </select>
        </div>

        <input
            type="file"
            id="file-input"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
        />
        
        <div className="file-upload-section">
            <Button
                variant="contained"
                color="primary"
                className="selectFile_btn"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
                Select File
            </Button>
            {selectedFile && <span className="file-name">{selectedFile.name}</span>}
        </div>
        
        <div className="actionsbtn">
            <Button
                variant="contained"
                color="success"
                onClick={handleUpload}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
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

export default ChannelDetail;
