import React, { useEffect, useState, useRef } from "react";
import './ProductList.css';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useNavigate, Link,useLocation } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig'; 
import UploadIcon from '@mui/icons-material/Upload'; 
import DownloadIcon from '@mui/icons-material/Download'; 
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Swal from "sweetalert2";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, Paper, Alert } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { Sort } from '@mui/icons-material';
import FilterListIcon from '@mui/icons-material/FilterList'; // Import the filter icon from Material UI
import EditIcon from '@mui/icons-material/Edit'; // Import the Edit icon
import * as XLSX from 'xlsx';
import Snackbar from '@mui/material/Snackbar';
import RefreshIcon from "@mui/icons-material/Refresh";
import Unauthorized from "../../../Unauthorized";
import CloseIcon from '@mui/icons-material/Close';
const ProductList = ({ isSidebarOpen, toggleSidebar }) => {
  useEffect(() => {
          if (isSidebarOpen) {
            const timer = setTimeout(() => {
              toggleSidebar();  // Close the sidebar after 10 seconds
            }, 2000);  // 10 seconds timeout
      
            // Cleanup the timer if the component is unmounted before the timer ends
            return () => clearTimeout(timer);
          }
        }, [isSidebarOpen, toggleSidebar]);
  const [products, setProducts] = useState([]);
  const [selectedFileFormat, setSelectedFileFormat] = useState('XLSX');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingforpagination, setLoadingforPagination] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState(false); // Sort option state
  const [sortvalue, setSortvalue] = useState(true); // Sort option state
  const [brands, setBrands] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  let [selectedBrands, setSelectedBrands] = useState([]);
  let [selectedVendors, setSelectedVendors] = useState([]);
  let [selectedCategories, setSelectedCategories] = useState([]);
  let [selectedexportBrands, setSelectedexportBrands] = useState([]);
  let [selectedexportVendors, setSelectedexportVendors] = useState([]);
  let [selectedexportCategories, setSelectedexportCategories] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const sortChanged = useRef(false); // Tracking if sort option is changed
  const itemsPerPage = 20; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [productCount, setProductCounts] = useState([]);
    const [filterLetter, setFilterLetter] = useState(''); // State for letter filter
    const queryParams = new URLSearchParams(location.search);
    const category_id = queryParams.get("category_id");
    const sub_category_name = queryParams.get("sub_category_name");
    const [unauthorized, setUnauthorized] = useState(false);
    useEffect(() => {
      fetchBrands();
      fetchCategories();
      fetchVendors();
    }, []);
    let totalPages= Math.ceil(productCount / itemsPerPage);  // Calculate total pages based on brand count
    let currentProducts = products.slice(0, itemsPerPage);  // Get the products for the current page
    const fetchBrands = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBrand/?search=`);
        setBrands(response.data.data.brand_list || []);
      } catch (error) {
        console.error('Error fetching brands', error);
      }
    };
  
    const fetchVendors = async () => {
      try {
       const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainVendor/?search=`);
       setVendors(response.data.data.vendor_list || []);
      } catch (error) {
        console.error('Error fetching vendors', error);
      }
    };
  
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainCategory/?search=`);
        setCategories(response.data.data.category_levels || []);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
  
  // Fetch products based on search query
  const fetchProducts = async (sortOption,searchQuery = "", page=1) => {
setLoadingforPagination(true);
setProducts([]);
    const payload = {
      page:page,
      search: searchQuery,
      filter: sortOption,
      brand_id: selectedBrands,
      vendor_id: selectedVendors,
      category_id: selectedCategories
  };
  if (category_id) {
      payload.category_id = [category_id]; // Send category_id in array format
  }
  else if (sub_category_name) {
    const subcategories = JSON.parse(localStorage.getItem('sub_category_id'));
    payload.category_id = subcategories; // Send category_id in array format
  }
    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/obtainAllProductList/`, payload);
      if (response.status === 401) {
        setUnauthorized(true);
      } 
      setProductCounts(response.data.data.product_count || 0);
      setProducts(response.data.data.product_list);
      let filteredBrands = filterLetter
      ? products.filter((product) => product.name[0].toUpperCase() === filterLetter.toUpperCase())
      : products;
       totalPages = Math.ceil(productCount / itemsPerPage);  // Calculate total pages based on brand count
      let startIndex = (currentPage - 1) * itemsPerPage;
       currentProducts = filteredBrands.slice(startIndex, startIndex + itemsPerPage);
       setLoader(false);
       setLoadingforPagination(false);
      setIsLoading(false);
    } catch (err) {
      setLoader(false);
      if (err.status === 401) {
        setUnauthorized(true);
      }else{
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load products data.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        console.error("Error fetching products:", err);
      }
   
      setIsLoading(false);
    }
  };
  const handleSortChange = (e) => {
    setLoader(true);
    const selectedOption = e.target.value;
    if (selectedOption) {
      setSortOption(selectedOption);
    const filter = selectedOption === 'newest' ? true : false;
    setSortvalue(filter);
    fetchProducts(filter, "", 1); // Trigger API call with the updated search query
    sortChanged.current = true; // Mark that sort option has changed
  }
      else{  setSortOption('');     sortChanged.current = false; // Reset the sort change flag
      }    
  };
  const handleSearchClear = () => {
    setSearchQuery(""); // Clear the search query
    fetchProducts("","",1); // Trigger API call with an empty search query
    setSearchOpen(false); // Close the search field
  };

  const pageFromUrl = parseInt(queryParams.get('page')) || 1; // Ensuring it's treated as an integer, default to 1 if invalid
  useEffect(() => {
  if (!sortChanged.current) {
    setLoader(true);
    setProducts([]);
    fetchProducts("", searchQuery, pageFromUrl); // Fetch products based on the page or search query
  } else {
    sortChanged.current = false; // Reset after the first render
  }
}, [pageFromUrl, sortOption, searchQuery]); // M

  const handlePageChange = (page) => {
    navigate(`/Admin/products?page=${page}`);
    setCurrentPage(page);
    fetchProducts("",searchQuery, page);  // Fetch brands for the selected page with current search query
  };
  const openImportModal = () => {
    setShowImportModal(true);
  };
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setSelectedFileFormat('XLSX');
  };

  const toggleFilterField = () => {
    if (searchOpen) {
      setSearchOpen(false);
    }
      setSortOption(!sortOption); // Toggle the search field visibility
    setSearchQuery(""); // Clear the search query if closed
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close the snackbar
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);  // Reset to first page when search changes
    fetchProducts( "",query, 1); // Trigger API call with the updated search query
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
      const uploadPromise = axiosInstance.post(`${process.env.REACT_APP_IP}/importProduct/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
                      const processedRecords = response.data.total_product; // Update this value if needed
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
                      fetchProducts(); // Re-fetch products after successful import
                      fetchBrands();
                      fetchCategories();
                      fetchVendors();
                      closeImportModal();
                    } else if (response.data.status === true && response.data.is_error === false) {
                      const processedRecords = response.data.total_product; // Update this value if needed
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
        fetchProducts(); // Re-fetch products after successful import
        fetchBrands();
      fetchCategories();
      fetchVendors();
        closeImportModal();
      }  else if (response.data.status === false) {
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
        const processedRecords = response.data.total_product; // Update this value if needed
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
      fetchProducts(); 
      fetchBrands();
      fetchCategories();
      fetchVendors();
      setSelectedFile(null);
      closeImportModal();
     } else {
        fetchProducts(); 
        fetchBrands();
      fetchCategories();
      fetchVendors();
        setSelectedFile(null);
        closeImportModal();
        Swal.fire({ title: 'Error!', text: 'Failed to import file.', icon: 'error' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setSelectedFile(null);
       closeImportModal();
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
  const handleAddProductClick = () => {
    navigate(`/Admin/products/add`); 
  };

  const handleProductDetailClick = (productId) => {
    navigate(`/Admin/product/${productId}?page=${currentPage}`);
  };  

  if (error) {
    return <div  style={{
      //  height: "100vh", // Full page height
       display: "flex",
       justifyContent: "center",
       alignItems: "center",
       marginTop:'10%'
     }}>{error}</div>;
  }

  const handleExport = () => {
    // Trigger the filter dialog to allow users to select filters
    handleExportFilterClick();
  };
  
  const handleExportFilterClick = () => {
    Swal.fire({
      title: 'Export By',
      html: `
        <div class="filter-tags" style="display: flex; gap: 10px; margin-bottom: 10px;">
          <button id="brand-btn" class="filter-tab active" style="padding: 5px 10px; border: none; cursor: pointer; background: #a52be4; color: white; border-radius: 4px;">
            Brand${selectedexportBrands.length > 0 ? ` (${selectedexportBrands.length})` : ''}
          </button>
          <button id="vendor-btn" class="filter-tab" style="padding: 5px 10px; border: none; cursor: pointer; background: #6c757d; color: white; border-radius: 4px;">
            Vendor${selectedexportVendors.length > 0 ? ` (${selectedexportVendors.length})` : ''}
          </button>
          <button id="category-btn" class="filter-tab" style="padding: 5px 10px; border: none; cursor: pointer; background: #6c757d; color: white; border-radius: 4px;">
            Category${selectedexportCategories.length > 0 ? ` (${selectedexportCategories.length})` : ''}
          </button>
          <!-- Add Refresh Icon after Category -->
          <button id="refresh-btn" class="filter-tab" style="padding: 5px 10px; border: none; cursor: pointer; background: #28a745; color: white; border-radius: 4px;">
            <i class="fa fa-refresh" style="font-size: 16px;color: grey;"></i> 
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
        document.getElementById('refresh-btn').addEventListener('click', handleExportFiltersClear);
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.addEventListener('click', handleFiltersClear);
        
        const denyButton = document.querySelector('.swal2-deny');
        if (denyButton) {
          denyButton.style.fontSize = '15px'; // Make it larger
        }
  
        // Add event listeners to buttons for switching tabs
        document.getElementById('brand-btn').addEventListener('click', () => switchexportTab('brand'));
        document.getElementById('vendor-btn').addEventListener('click', () => switchexportTab('vendor'));
        document.getElementById('category-btn').addEventListener('click', () => switchexportTab('category'));
        switchexportTab('brand'); // Default tab
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
        console.log('inside preconfirm',selectedexportBrands.length);
        
        if (selectedexportBrands.length === 0 && selectedexportVendors.length === 0 && selectedexportCategories.length === 0) {
          Swal.showValidationMessage('Please select at least one option from Brand, Vendor, or Category.');
          return false; // Prevent confirmation until a selection is made
        }
        return { selectedexportBrands, selectedexportVendors, selectedexportCategories };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Apply filters
        setSelectedexportBrands([...selectedexportBrands]);
        setSelectedexportVendors([...selectedexportVendors]);
        setSelectedexportCategories([...selectedexportCategories]);
  
        // After filters are confirmed, trigger the export with the selected filters
        triggerExportWithFilters();
      } else if (result.isDenied) {
        // Export all data
        triggerExportWithOutFilters();
      }
    });
  };
  
  // Function to handle clearing filters
  const handleExportFiltersClear = () => {
    // Clear all selected filters
    if (selectedexportBrands.length === 0 && selectedexportVendors.length === 0 && selectedexportCategories.length === 0) {
      Swal.showValidationMessage('There is no selected options from Brand, Vendor, or Category to clear.');
      return false; 
    }
    setSelectedBrands([]);
    setSelectedVendors([]);
    setSelectedCategories([]);
    selectedexportCategories='';
    selectedexportVendors='';
    selectedexportBrands='';
    // Optionally, update the UI for the filter buttons or tags (e.g., remove any selected filter counts)
    document.getElementById('brand-btn').textContent = 'Brand';
    document.getElementById('vendor-btn').textContent = 'Vendor';
    document.getElementById('category-btn').textContent = 'Category';
    fetchProducts();
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'All Export filters are cleared successfully.',
      confirmButtonText: 'OK',
    });
    // Close the Swal dialog (optional)
    // Swal.close();
  };
  
  
  const triggerExportWithFilters = async () => {
    try {
      const payload = {
        action: 'pim',
        brand_id: selectedexportBrands,
        vendor_id: selectedexportVendors,
        category_id: selectedexportCategories
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
      const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/exportProduct/`, {
        action: 'pim'
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
      text: 'Product list exported successfully.',
      icon: 'success'
    });
  };
  

  const handleImportDownload = async () => {
    if (selectedFileFormat === 'ODS' || selectedFileFormat === 'CSV') {
              // For ODS, no API call is needed, just use the static download link
        return;
    }

    try {
        const response = await axiosInstance.get(
            `${process.env.REACT_APP_IP}/sampleProductImportExcel/`, 
            { responseType: 'blob' }
        );
        // Create a link element to trigger the download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sampleProductImport.${selectedFileFormat.toLowerCase()}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);  // Clean up the link element
    } catch (error) {
        console.error("Error downloading file", error);
    } finally {
        setLoading(false);
    }
};
const handleFilterClick = () => {
  Swal.fire({
    title: 'Filter By',
    html: `
      <div class="filter-tags" style="display: flex; gap: 10px; margin-bottom: 10px;">
        <button id="brand-btn" class="filter-tab active" style="padding: 5px 10px; border: none; cursor: pointer; background: #a52be4; color: white; border-radius: 4px;">Brand${selectedBrands.length > 0 ? ` (${selectedBrands.length})` : ''}</button>
        <button id="vendor-btn" class="filter-tab" style="padding: 5px 10px; border: none; cursor: pointer; background: #6c757d; color: white; border-radius: 4px;">Vendor${selectedVendors.length > 0 ? ` (${selectedVendors.length})` : ''}</button>
        <button id="category-btn" class="filter-tab" style="padding: 5px 10px; border: none; cursor: pointer; background: #6c757d; color: white; border-radius: 4px;">Category${selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ''}</button>
      </div>
      <div id="filter-content" class="filter-content" style="max-height: 230px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 7px 10px 4px 0px; text-align: left;"></div>
    `,
    showCancelButton: true,
    cancelButtonText: 'Close',
    confirmButtonText: 'Apply',
    reverseButtons: true,
    didOpen: () => {
      document.getElementById('brand-btn').addEventListener('click', () => switchTab('brand'));
      document.getElementById('vendor-btn').addEventListener('click', () => switchTab('vendor'));
      document.getElementById('category-btn').addEventListener('click', () => switchTab('category'));
      switchTab('brand'); // Default tab
    },
    preConfirm: () => {
       if (  selectedBrands.length === 0 &&  selectedVendors.length === 0 &&  selectedCategories.length === 0  ) {
              Swal.showValidationMessage('Please select at least one option from Brand, Vendor, or Category.');
              return false; // Prevent confirmation until a selection is made
            }
      return {
        selectedBrands,
        selectedVendors,
        selectedCategories
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      setSelectedBrands([...selectedBrands]);
      setSelectedVendors([...selectedVendors]);
      setSelectedCategories([...selectedCategories]);
      fetchProducts();
      setOpenSnackbar(true); 
    }
  });
};

const switchTab = (type) => {
  document.querySelectorAll('.filter-tab').forEach(button => {
    button.style.background = '#6c757d';
  });
  document.getElementById(`${type}-btn`).style.background = '#a52be4';
  loadList(type);
};
const switchexportTab = (type) => {
  document.querySelectorAll('.filter-tab').forEach(button => {
    button.style.background = '#6c757d';
  });
  document.getElementById(`${type}-btn`).style.background = '#a52be4';
  exportloadList(type);
};
const updateexportSelection = (type, id, isChecked) => {
  if (type === 'brand') {
    selectedexportBrands = isChecked
      ? [...selectedexportBrands, id]
      : selectedexportBrands.filter(brand => brand !== id);
  } else if (type === 'vendor') {
    selectedexportVendors = isChecked
      ? [...selectedexportVendors, id]
      : selectedexportVendors.filter(vendor => vendor !== id);
  } else if (type === 'category') {
    selectedexportCategories = isChecked
      ? [...selectedexportCategories, id]
      : selectedexportCategories.filter(category => category !== id);
  }
  updateexportFilterTagsCount();
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
const updateexportFilterTagsCount = () => {
  document.getElementById('brand-btn').innerText = `Brand${selectedexportBrands.length > 0 ? ` (${selectedexportBrands.length})` : ''}`;
  document.getElementById('vendor-btn').innerText = `Vendor${selectedexportVendors.length > 0 ? ` (${selectedexportVendors.length})` : ''}`;
  document.getElementById('category-btn').innerText = `Category${selectedexportCategories.length > 0 ? ` (${selectedexportCategories.length})` : ''}`;
};
const updateFilterTagsCount = () => {
  document.getElementById('brand-btn').innerText = `Brand${selectedBrands.length > 0 ? ` (${selectedBrands.length})` : ''}`;
  document.getElementById('vendor-btn').innerText = `Vendor${selectedVendors.length > 0 ? ` (${selectedVendors.length})` : ''}`;
  document.getElementById('category-btn').innerText = `Category${selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ''}`;
};

const exportloadList = (type) => {
  let data = type === 'brand' ? brands : type === 'vendor' ? vendors : categories;
  let selected = type === 'brand' ? selectedexportBrands : type === 'vendor' ? selectedexportVendors : selectedexportCategories;

  document.getElementById('filter-content').innerHTML =
    type === 'category' && data.length > 0
      ? exportrenderCategoryList(data)
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
      updateexportSelection(type, id, isChecked);
    });
  });

  if (type === 'category') {
    exportattachCategoryEvents();
  }
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

const exportrenderCategoryList = (categories) => {
  return categories.map(exportrenderCategories).join('');
};
const renderCategoryList = (categories) => {
  return categories.map(renderCategories).join('');
};
const exportrenderCategories = (category) => {
  const children = Array.isArray(category.children) ? category.children : [];

  return `
    <div key="${category.id}" class="category" 
         style="margin-left: ${children.length > 0 ? '20px' : '54px'}; margin-bottom: 5px;">
      <div>
        ${children.length > 0 ? `
          <button class="toggle-expand" data-id="${category.id}" 
                  style="margin-right: 5px; margin-bottom: 2px; cursor: pointer;">
            ${exportexpandedCategories[category.id] ? '−' : '+'}
          </button>` : ''}
        <input type="checkbox" value="${category.config_id}" 
               ${selectedCategories.includes(category.config_id) ? 'checked' : ''} 
               style="margin-right: 5px; width: 4%;" 
               class="toggle-select-category" data-id="${category.config_id}">
        <span>${category.name}</span>
      </div>
      ${exportexpandedCategories[category.id] ? children.map(exportrenderCategories).join('') : ''}
    </div>
  `;
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

const exportattachCategoryEvents = () => {
  document.querySelectorAll('.toggle-expand').forEach((button) => {
    button.addEventListener('click', (event) => {
      const categoryId = event.target.dataset.id;
      exportexpandedCategories[categoryId] = !exportexpandedCategories[categoryId];
      exportloadList('category');
    });
  });

  document.querySelectorAll('.toggle-select-category').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      updateexportSelection('category', event.target.dataset.id, event.target.checked);
    });
  });
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
let exportexpandedCategories = {};

const handleFiltersClear = async () => {  
  console.log('Clear all');
  setSelectedCategories([]);
  setSelectedVendors([]);
  setSelectedBrands([]);
  selectedCategories='';
  selectedVendors='';
  selectedBrands='';
  fetchProducts();
  Swal.fire({
    icon: 'success',
    title: 'Success!',
    text: 'All filters are cleared successfully.',
    confirmButtonText: 'OK',
  });
 }
  return (
    <div>
          {loader && (
        <div className="loader-overlay">
          <div className="spinner"></div> {/* Custom spinner */}
        </div>
      )}
    <div className="product-list-container" style={{marginTop: '-17px'}}>
      <div className="product_table_header">
        <div>
        <h1 className="products_header" style={{fontSize:'21px', margin: '24px 0px 22px 0px' }}>Products</h1>
    {/* <span style={{ fontSize: '16px', color: '#666' }}>
    <span className="total-brands-text">Total Products:</span><span className="brand-count">{productCount}</span>
    </span> */}
  </div>
        <div className="addbrandcontainer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
          {/* Search Icon Container */}
      
          {/* {searchOpen && ( */}
            <div  className="search-input-container-brand search-icon-product"   style={{marginTop: '26px', paddingRight:'5px',    margin: '28px 0px 27px 0px' }}>

            <input
                type="text"
                autoComplete="off"
                placeholder="Search Products"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  width:'50px',
                  paddingRight: '30px',  // Give space on the right side for the icon
                  width: '100%',         // Make input field full width
                }}
                
              />
              {searchQuery.length > 0 && (
               <CloseIcon
                onClick={handleSearchClear}
                style={{ cursor: 'pointer',color:'grey',fontSize:'21px' }}
              /> )}
               {searchQuery.length === 0 && (
              <SearchIcon 
                style={{
                  position: 'absolute',
                  right: '10px',         // Position the icon on the right side
                  top: '50%',
                  transform: 'translateY(-50%)',  // Center vertically
                  cursor: 'pointer',    // Show pointer cursor
                  color: '#888'          // Icon color (optional)
                }}
              /> )}
              {/* <input
                type="text"
                autoComplete="off"
                placeholder="Search Products"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <CloseIcon
                onClick={handleSearchClear}
                style={{ cursor: 'pointer' }}
              /> */}
            </div>
          {/* )} */}
           {sortOption && (
          <div className="sort-dropdown-container" style={{ margin: '0px 0px 28px 0px' ,     marginTop: '30px'    }}>
       <select
  onChange={handleSortChange}
  value={sortOption}
  className="sort-dropdown select-back"
  style={{
    cursor: "pointer",
    padding: "5px 10px",
    fontSize: "16px",
  }}>
  {/* <option value="" style={{ color: "gray" }}>Sort by Products</option> */}
  <option value="newest">New to Old</option>
  <option value="oldest">Old to New</option>
</select>

      </div>
          )}
          {/* <div className="search-icon-container" onClick={toggleSearchField} style={{ margin: '6px 10px 30px 10px' }}>
            <SearchIcon style={{ cursor: 'pointer', fontSize: '33px' }} />
            <span className="search-hover-text" style={{width:'40px'}}>Search</span>

          </div> */}
         
          <div className="search-icon-container" onClick={toggleFilterField} style={{  margin: '42px 10px 37px'}}>
            <Sort style={{ cursor: 'pointer', fontSize: '33px' }} />
            <span className="search-hover-text" style={{width:'74px'}}>Sort By Order</span>
          </div>
          <div className="search-icon-container" onClick={handleFilterClick} style={{ margin: '41px 10px 37px' }}>
          <FilterListIcon style={{ cursor: 'pointer', fontSize: '33px' }} />
          <span className="search-hover-text" style={{width:'34px'}}>Filters</span>
          </div>
          <div className="brand-actions-container">
          <div className="button-row">
          <div
            className="add-product-btn-container import-btn"
            onClick={handleAddProductClick}
            style={{ marginRight: '6px' }}
          >
            <AddOutlinedIcon style={{ cursor: 'pointer' }} className="add-product-btn" />
               <span className="button-text" style={{width:'85px'}}>Create Product</span>
            
          </div>

          {/* Import Button */}
          <button className="import-btn" onClick={openImportModal}>
            <DownloadIcon />
            <span className="button-text">Import</span>
          </button>

          {/* Export Button */}
          <button className="import-btn download-btn" onClick={handleExport} style={{ marginLeft: '6px' }}>
            <UploadIcon />
            <span className="button-text">Export</span>
          </button>

          {/* {(selectedBrands.length > 0 || selectedVendors.length > 0 || selectedCategories.length > 0) && (
      <button onClick={handleFiltersClear} >
        Clear all
      </button>
      )} */}

          {(selectedBrands.length > 0 || selectedVendors.length > 0 || selectedCategories.length > 0) && (

<button className="import-btn download-btn" onClick={handleFiltersClear} style={{ marginLeft: '6px' }}>
<RefreshIcon />
<span className="button-text">Clear</span>
</button>
// </Tooltip>
      )}
          <div className="count-vendor" style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
      <span className="total-brands-text" style={{ marginRight: '5px' }}>Total Products:</span>
      <span className="brand-count">{productCount}</span>
    </div>
          </div>
</div>
        </div>
      </div>
<>
      {/* <TableContainer component={Paper}>
        <Table>
          <TableHead >
            <TableRow className="productlistheader">
              <TableCell sx={{ textAlign: "center", padding: "5px" , height: '40px'  }}>Image</TableCell>
              <TableCell sx={{ textAlign: "center", padding: "5px" , height: '40px'}}>SKU</TableCell>

              <TableCell sx={{ textAlign: "center", padding: "5px" , height: '40px'}}>Product Name</TableCell>
              <TableCell sx={{ textAlign: "center", padding: "5px" , height: '40px'}}>Brand</TableCell>
              <TableCell sx={{ textAlign: "center", padding: "5px" , height: '40px'}}>Vendor</TableCell>
  
              
                          <TableCell sx={{ textAlign: "center", padding: "5px", height: '40px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ fontSize: "14px", color: "#888" }}>
                  No Products Found
                </TableCell>
              </TableRow>
            ) : (
              currentProducts.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{ "&:hover": { backgroundColor: "#6fb6fc38" } }}
                  onClick={() => handleProductDetailClick(product.id)}  >
                  <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                    <img
                      src={product.image_list && product.image_list[0] ? product.image_list[0].url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOBl1B_Kz4RdrOR6_WgaITKDcS10PGoL7jVA&s"}
                      alt={product.name}
                      style={{ width: '30px', height: '30px', borderRadius: "50%", objectFit: "cover" }}
                    />
                  </TableCell>

                  <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                    {product.sku || "N/A"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                    <Link to={`/manufacturer/products/details/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                    {product.brand_name || "N/A"}
                  </TableCell>
                
 <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                    {product.vendor_name || "N/A"}
                  </TableCell>

             
                  <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                    <button
                      className="action-btn edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductDetailClick(product.id);
                      }}
                    >
                      <EditIcon /> 
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer> */}
<TableContainer component={Paper} sx={{ maxHeight: '400px', overflow: 'auto',  overflowY: "overlay",
    overflowX: "overlay",
    "&::-webkit-scrollbar": {
      height: "2px",
      width: "2px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#888",
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#555",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#f1f1f1",
      borderRadius: "10px",
    }, }}>
  <Table>
    <TableHead sx={{ position: 'sticky', top: -1, zIndex: 1 }}>
      <TableRow className="productlistheader">
        <TableCell sx={{ textAlign: "center", padding: "5px" }}>Image</TableCell>
        <TableCell sx={{ textAlign: "center", padding: "5px" }}>SKU</TableCell>
        <TableCell sx={{ textAlign: "center", padding: "5px" }}> Name</TableCell>
        <TableCell sx={{ textAlign: "center", padding: "5px" }}>Brand</TableCell>
        <TableCell sx={{ textAlign: "center", padding: "5px" }}>Vendor</TableCell>
        <TableCell sx={{ textAlign: "center", padding: "5px" }}>Completeness</TableCell>
        <TableCell sx={{ textAlign: "center", padding: "5px"}}>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {currentProducts.length === 0 ? (
        <TableRow>
          {loader && (
                   <TableCell colSpan={7} align="center" sx={{ fontSize: "14px", color: "#888" }}>
                   Loading Products
                 </TableCell>
                  )}
                    {!loader && (
                       <TableCell colSpan={7} align="center" sx={{ fontSize: "14px", color: "#888" }}>
                       No Products Found
                     </TableCell>
                    )}
         
        </TableRow>
      ) : (
        currentProducts.map((product) => (
          <TableRow
            key={product.id}
            sx={{ "&:hover": { backgroundColor: "#6fb6fc38" } }}
            onClick={() => handleProductDetailClick(product.id)}
          >
            <TableCell sx={{ textAlign: "center",padding: "5px" }}>
              <img
                src={product.image_list && product.image_list[0] ? product.image_list[0].url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOBl1B_Kz4RdrOR6_WgaITKDcS10PGoL7jVA&s"}
                alt={product.name}
                style={{ width: '30px', height: '30px', borderRadius: "50%", objectFit: "cover", verticalAlign:'middle' }}
              />
            </TableCell>
            <TableCell sx={{ textAlign: "center", fontSize:'14px', padding: "5px" }}>
              {product.sku || "N/A"}
            </TableCell>
            <TableCell sx={{ textAlign: "center", padding: "5px" }}>
              <Link to={`/manufacturer/products/details/${product.id}`} style={{ fontSize:'14px', textDecoration: "none", color: "inherit" }}>
                {product.name}
              </Link>
            </TableCell>
            <TableCell sx={{ textAlign: "center",fontSize:'14px', padding: "5px" }}>
              {product.brand_name || "N/A"}
            </TableCell>
            <TableCell sx={{ textAlign: "center",fontSize:'14px', padding: "5px" }}>
              {product.vendor_name || "N/A"}
            </TableCell>
            <TableCell sx={{ textAlign: "center", fontSize: '14px', padding: "5px" }}>
            <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${product.completeness_percentage || 0}%`,
                  backgroundColor: product.completeness_percentage >= 75 ? 'green' : product.completeness_percentage >= 50 ? 'orange' : 'red',
                  height: '10px',
                }}
              />
            </div>
            <span>{product.completeness_percentage || 0}%</span>
          </TableCell>
            <TableCell sx={{ textAlign: "center",fontSize:'14px', padding: "5px" }}>
              <button
                className="action-btn edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductDetailClick(product.id);
                }}
              >
                <EditIcon />
              </button>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</TableContainer>

      <div className="pagination-container">
            {totalPages > 1 && pageFromUrl > 1 && (
              <button className="pagination-button prev-button" onClick={() => handlePageChange(pageFromUrl - 1)}>
                &laquo; Prev
              </button>
            )}
            {totalPages > 1 && (
              Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, pageFromUrl - 3), pageFromUrl + 2)
                .map((page) => (
                  <button key={page} className={`pagination-button ${page === pageFromUrl ? 'active' : ''}`} onClick={() => handlePageChange(page)}>
                    {page}
                  </button>
                ))
            )}
            {totalPages > 1 && pageFromUrl < totalPages && (
              <button className="pagination-button next-button" onClick={() => handlePageChange(pageFromUrl + 1)}>
                Next &raquo;
              </button>
            )}
          </div>
</>
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
        <h2>Import Product File</h2>
        <p>Upload a file to import product data into the system.</p>

        {/* Container for Download Sample File and Format Selector */}
        <div className="download-sample-container">
            {/* Download Sample File Link */}
            <a
                        href={selectedFileFormat === 'ODS' 
                            ? '/importProduct.ods' // Static file link for ODS
                            : selectedFileFormat === 'CSV' 
                            ? '/importProduct.csv' // Static file link for CSV
                            : undefined} // No link for non-ODS/CSV formats, handled by API function
                        onClick={selectedFileFormat === 'ODS' || selectedFileFormat === 'CSV' ? undefined : handleImportDownload}
                        className="download-sample"
                        style={{ cursor: 'pointer' }}
                        download
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

    <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: 'top',   // Top of the screen
          horizontal: 'right' // Right side of the screen
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Filter Applied Successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductList;
