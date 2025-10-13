import axiosInstance from '../../../utils/axiosConfig';
import React, { useState, useEffect,useRef } from 'react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import './CategoryList.css';
import Swal from 'sweetalert2';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { LinearProgress } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import UploadIcon from '@mui/icons-material/Upload'; // for Import
import DownloadIcon from '@mui/icons-material/Download';  // Importing Download Icon
import * as XLSX from 'xlsx';
const CategoryList = ({ isSidebarOpen, toggleSidebar }) => {
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
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({}); // Track expanded categories
    const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [parentCategoryId, setParentCategoryId] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingforCategory, setLoadingforCategory] = useState(false);
    const [loader, setLoader] = useState(false);
    const [unauthorized, setUnauthorized] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    // Fetch categories on page load
    useEffect(() => {
        if (newCategoryName.trim()) {
          checkDuplicateCategory(newCategoryName);
        } else {
          setCategoryError("");
        }
      }, [newCategoryName]);
    const fetchCategories = async () => {
      setLoader(true);
        setLoadingforCategory(true);
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/obtainCategory/`, { level: 0 });
            if (response.status === 401) {
              setUnauthorized(true);
            } 
            setCategories(response.data.category_levels || []);
            setLoadingforCategory(false);
            setLoader(false);
        } catch (error) {
          setLoader(false);
          if (error.status === 401) {
            setUnauthorized(true);
          }else{
            Swal.fire({
              title: 'Error!',
              text: 'Failed to fetch categories data.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
        console.error('Error fetching categories:', error);
          }
          
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);
    if (unauthorized) {
      navigate(`/unauthorized`);
    }
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
            const uploadPromise = axiosInstance.post(`${process.env.REACT_APP_IP}/importCategory/`,
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
                      fetchCategories();
                      closeImportModal();
                    } else if (response.data.status === true && response.data.is_error === false) {
                      const processedRecords = response.data.total_category; // Update this value if needed
                      const validRecords = response.data.added_count;
                      const errorRecords = response.data.error_count;
                             // Creating the content for the Swal message
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
                            fetchCategories();
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
                                  setSelectedFile(null);
                            fetchCategories();
                            closeImportModal();
                                }  else {
                setSelectedFile(null);
                closeImportModal();
                Swal.fire({ title: 'Error!', text: 'Failed to import file.', icon: 'error' });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            Swal.fire({ title: 'Error!', text: 'Something went wrong. Try again.', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };const downloadErrorList = (errorList) => {
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
    const handleCategoryClick = (categoryId) => {
        navigate(`/Admin/category/edit/${categoryId}`);  // Navigate to the category edit page
    };
    // Toggle category expansion/collapse
    const handleCategoryToggle = (categoryId) => {
        setExpandedCategories(prevState => ({
            ...prevState,
            [categoryId]: !prevState[categoryId]  // Toggle the expanded state of the clicked category
        }));
    };

    // Render subcategory rows recursively
    const renderCategoryChildren = (category, level = 1) => {
        if (!category.children || category.children.length === 0) {
            return null;
        }
    
        return category.children.map((child) => {
            let marginLeft;
    
            // Adjust the marginLeft based on the level and whether an expand icon exists
            if (level === 2) {
                marginLeft = child.children && child.children.length > 0 ? '45px' : '73px';
            } else if (level === 3) {
                marginLeft = child.children && child.children.length > 0 ? '90px' : '110px';
            } else {
                marginLeft = level * 45 + 'px'; // Default margin for other levels
            }
            const handleArrowClick = (categoryId) => {
                // Navigate to products page with the category ID as a query parameter
                navigate(`/Admin/products?category_id=${categoryId}`);
            };
            const handleArrowIdsClick = (name,categoryId) => {
            localStorage.setItem('sub_category_id',JSON.stringify(categoryId));
                // Navigate to products page with the category ID as a query parameter
                navigate(`/Admin/products?sub_category_name=${name}`);
            };
            return (
                <React.Fragment key={child.id}>
                    <tr className={`subcategory-row level-${level}`}>
                        <td className="category_name_td">
                            <div className="category-item" style={{ marginLeft: marginLeft }}>
                                {child.children && child.children.length > 0 && (
                                    <span className="expand-icon" onClick={() => handleCategoryToggle(child.id)}>
                                        {expandedCategories[child.id] ? (
                                            <ArrowDropDownIcon />
                                        ) : (
                                            <ArrowRightIcon />
                                        )}
                                    </span>
                                )} {child.name} <AddCircleOutlineIcon style={{margin:'0px 0px 0px 5px', fontSize:'17px', color:'#b330e6'}} onClick={(e) => handleAddCategoryClickIcon(e, child.config_id)} /> <RemoveCircleOutlineIcon style={{margin:'0px 0px 0px 5px', fontSize:'17px', color:'#f05353'}}/></div>
                        </td>
                        {/* <td>{child.product_count}</td> */}
                        <td className='td_herechild'>
                        {child.product_count > 0 ? (
                            <>
                             <a
                             href="#"
                             className='product-count-btn'
                             onClick={() => handleArrowClick(child.config_id)}  // Handle click event
                             style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer', padding:'0px 0px 0px 100px' }}  >
                             {child.product_count}
                         </a>
                         <span className="viewproducts" style={{width:'80px'}}>View Products</span> </> ) : (  child.product_count )}
                    </td>
                        {/* <td>{child.sub_cat_product_count}</td> */}
                        <td>{child.sub_cat_product_count > 0 ? (
                            <>
                             <a
                             href="#"
                            className='product-count-btn'
                             onClick={() =>handleArrowIdsClick(child.name,child._ids)}  // Handle click event
                             style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer',padding:'0px 0px 0px 100px' }} >
                             {child.sub_cat_product_count}
                         </a>
                         <span className="viewproducts" style={{width:'80px'}}>View Products</span>
                         </>
                             ) : (  child.sub_cat_product_count )}</td>
                        {/* <td><button  onClick={() => handleCategoryClick(child.id)}  style={{borderRadius: '5px', cursor: 'pointer', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none',fontSize: '14px',transition: 'background-color 0.3s ease'  }}    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'} onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'} >   View  </button> </td> */}
                    </tr>
                    {expandedCategories[child.id] && renderCategoryChildren(child, level + 1)}  {/* Recursive call for deeper subcategories */}
                </React.Fragment>
            );
        });
    };
    
    
    // Render a category and its children (if expanded)
    const renderCategoryItem = (category) => {
        const handleArrowClick = (categoryId) => {
            // Navigate to products page with the category ID as a query parameter
            navigate(`/Admin/products?category_id=${categoryId}`);
        };
        const handleArrowIdsClick = (name,categoryId) => {
            localStorage.setItem('sub_category_id',JSON.stringify(categoryId));
            // Navigate to products page with the category ID as a query parameter
            navigate(`/Admin/products?sub_category_name=${name}`);
        };
        return (
            <React.Fragment key={category.id}>
                <tr>
                    <td className='category_name_td'>
                        <div className="category-item" onClick={() => handleCategoryToggle(category.id)}>
                            {category.children && category.children.length > 0 && (
                                <span className="expand-icon">
                                    {expandedCategories[category.id] ? (
                                        <ArrowDropDownIcon />
                                    ) : (
                                        <ArrowRightIcon />
                                    )}
                                </span>
                            )}  {category.name} <AddCircleOutlineIcon style={{margin:'0px 0px 0px 5px', fontSize:'17px',color:'#b330e6'}}  onClick={(e) => handleAddCategoryClickIcon(e, category.config_id)} /> <RemoveCircleOutlineIcon style={{margin:'0px 0px 0px 5px', fontSize:'17px',color:'#f05353'}}/> </div>
                    </td>
                    {/* <td>{category.product_count}</td> */}
                    <td className='td_here'>
                        {category.product_count > 0 ? (
                            <>
                            <a
                            href="#"
                            className='product-count-btn'
                            onClick={() => handleArrowClick(category.config_id)}  // Handle click event
                            style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer',padding:'0px 0px 0px 100px' }}  >
                            {category.product_count}
                        </a> <span className="viewproducts" style={{width:'80px'}}>View Products</span>
                         </>) : (  category.product_count )}
                    </td>
                    {/* <td>{category.sub_cat_product_count}</td> */}
                    <td>{category.sub_cat_product_count > 0 ? (
                        <>
                           <a
                           href="#"
                           className='product-count-btn'
                           onClick={() => handleArrowIdsClick(category.name,category._ids)}  // Handle click event
                           style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer',padding:'0px 0px 0px 100px' }}  >
                           {category.sub_cat_product_count}
                       </a> <span className="viewproducts" style={{width:'80px'}}>View Products</span>
                         </> ) : (  category.sub_cat_product_count )}</td>

                    {/* <td> <button   onClick={() => handleCategoryClick(category.id)}  style={{ borderRadius: '5px',  cursor: 'pointer',  padding: '5px 10px',  backgroundColor: '#007bff',  color: 'white',  border: 'none', fontSize: '14px', transition: 'background-color 0.3s ease' }} onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'} onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'} >  View </button></td> */}
                </tr>
                {expandedCategories[category.id] && renderCategoryChildren(category)}  {/* Render children only if expanded */}
            </React.Fragment>
        );
    };

    const handleAddCategoryClick = () => {
        setIsAddCategoryPopupOpen(true);
    };
    const handleExport = async () => {
        try {
            // Make the API call to export the brand with 'blob' response type for file download
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/exportCategory/`, {
                responseType: 'blob', // Ensures the response is treated as binary data (e.g., Excel file)
            });
    
            // Create a URL for the file data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'category_export.xlsx');  // Set the default filename for download
            document.body.appendChild(link);
            link.click();  // Trigger the download
            link.parentNode.removeChild(link);  // Clean up the link element
    
            window.URL.revokeObjectURL(url);  // Release the object URL
    
            // Display success notification
            Swal.fire({
                title: 'Success!',
                text: 'Category list exported successfully.',
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
            console.error('Error exporting category:', error);
            
            // Display error notification if the export fails
            Swal.fire({
                title: 'Export Failed!',
                text: 'An error occurred while exporting the category data.',
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
        }
    };
    const handleAddCategoryClickIcon = (e, category_config_id) => {
        e.preventDefault();
    Swal.fire({
        title: 'Category Name',
        input: 'text',
        inputPlaceholder: 'Enter the category name',
        showCancelButton: true,
        confirmButtonText: 'Create',
        cancelButtonText: 'Cancel',
        reverseButtons:true,
        inputAttributes: {
            autocomplete: 'off' 
        },
        inputValidator: (value) => {
            if (!value) {
                return 'Please enter a category name';
            }
        },
    }).then((result) => {
        if (result.isConfirmed && result.value) {                        
            createCategory(result.value, category_config_id);
        }
    });
    };

    const createCategory = async (newCategoryNameForPlus, configId) => {
        if (newCategoryNameForPlus && typeof newCategoryNameForPlus === 'object') {
            // If the object is a DOM element (e.g., HTMLButtonElement), extract its text content or value
            if (newCategoryNameForPlus.textContent) {
                newCategoryNameForPlus = newCategoryNameForPlus.textContent.trim();
            } else if (newCategoryNameForPlus.value) {
                newCategoryNameForPlus = newCategoryNameForPlus.value.trim();
            } else {
                // Fallback to an empty string if no useful property exists
                newCategoryNameForPlus = '';
            }
        }
    
        // Ensure the value is now a string
        newCategoryNameForPlus = String(newCategoryNameForPlus || '').trim();
        console.log('newCategoryNameForPlus:', newCategoryNameForPlus);
        
        if (!newCategoryName.trim() && !newCategoryNameForPlus) {
            console.log('Category name is required');
            setCategoryError("Category name is required");
            return;
        }   
        try {            
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createCategory/`, {
                name: newCategoryName || newCategoryNameForPlus,
                category_config_id: parentCategoryId || configId || '',
            });            
            if (response.data.is_created === true) {
                Swal.fire({ title: 'Success!', text: 'Category created successfully.', icon: 'success' });
                fetchCategories();
                resetForm();
            }
            setIsAddCategoryPopupOpen(false);
            setNewCategoryName('');
            setParentCategoryId('');
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const resetForm = () => {
        setNewCategoryName('');
        setSearchQuery('');
        setParentCategoryId('');
        setCategoryError(null);
        setSuggestions([]);
    };

    const handleCancel = () => {
        resetForm();
        setIsAddCategoryPopupOpen(false);
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

    const handleSuggestionSelect = async (suggestion) => {
        setParentCategoryId(suggestion.id);
        setSuggestions([]);
        setSearchQuery(suggestion.name);
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/findDuplicateCategory/?search=${newCategoryName}&category_config_id=${suggestion.id}`);
            if (response.data.data.error === true) {
                setCategoryError('Category name must be unique within the same parent.');
            }
            else {
                setCategoryError('');  // Clear error if no duplicate is found
            }
        } catch (error) {
            console.error('Error checking for duplicate category with selected suggestion:', error);
        }
    };

    const fetchParentCategories = async (inputValue) => {
        if (!inputValue) return [];
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainCategoryList/?search=${inputValue}`);
            const options = response.data.data.map(category => ({
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
    const checkDuplicateCategory = async (categoryName) => {
        if (!categoryName) return; 
        try {
          const response = await axiosInstance.get(
            `${process.env.REACT_APP_IP}/findDuplicateCategory/?search=${encodeURIComponent(categoryName)}`
          );
          if (response.data.data.error) {
            setCategoryError("Category name must be unique within the same parent.");
          } else {
            setCategoryError("");
          }
        } catch (error) {
          console.error("Error checking for duplicate category:", error);
        }
      };
    const handleCategoryNameBlur = async () => {
        await checkDuplicateCategory();
    };

    return (
      <div>
          {loader && (
        <div className="loader-overlay">
          <div className="spinner"></div> {/* Custom spinner */}
        </div>
      )}
        <div className="category-schema">
            <div className="CategoryTable-header">
    <h1 style={{fontSize:'21px'}}>Categories</h1>
    <div className="header-buttons-container">
  <div   className="add-product-btn-container import-btn"  onClick={handleAddCategoryClick}>
    <AddOutlinedIcon   />
    <span className="button-text" style={{width:'75px'}}>Add Category</span>
  </div>

  <button 
    className="import-btn"  onClick={openImportModal}  style={{ marginLeft: '4px', position: 'relative' }} >
    <DownloadIcon />
    <span className="button-text">Import</span> {/* Tooltip-like text */}
  </button>

  <button  className="import-btn download-btn"  onClick={handleExport}  style={{ marginLeft: '4px', position: 'relative' }} >
    <UploadIcon />
    <span className="button-text">Export</span> {/* Tooltip-like text */}
  </button>
</div>
</div>
            <div className="CategoryContainer">
                <div className="CategoryListContainer">
                    <table className="category-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Products</th>
                                <th>In Subcategories</th>
                                {/* <th> Action</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? (
                                categories.map((category) => renderCategoryItem(category))
                            ) : (
                                <tr>
                                  {loader && ( <td colSpan="5" style={{ textAlign: 'center'}}> loading categories </td>  )}
                              {!loader && ( <td colSpan="5" style={{textAlign:'center'}}>No categories found</td>  )}
                                </tr>
                            )}
                        </tbody>
 
                    </table>
                   
                </div>
            </div>

            {/* Add Category Popup */}
            {isAddCategoryPopupOpen && (
  <div className="popup">
    <div className="popup-content" style={{ position: 'relative', padding: '22px 22px 15px 22px' }}>
      {/* Close "X" button at the top right corner */}
      <button
        onClick={handleCancel}
        style={{
          position: 'absolute',
          top: '12px',
          right: '20px',
          minWidth: 'unset',
          padding: 0,
          fontSize: '30px',
          color: '#888',
          border: 'none',
          background: 'transparent',
          cursor:'pointer'
        }}
      >
        &times;
      </button>
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
              key={suggestion.id}
              className="suggestion-item"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="suggestion-name">{suggestion.name}</div>
              <div className="suggestion-level">{suggestion.level_str}</div>
            </div>
          ))}
        </div>
      )}

      {/* Buttons Section */}
      <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'space-between', margin: '0 auto', width:'26%',padding:'10px 0px 0px 0px'  }}>
        {/* Create Category Button */}
        <button
          onClick={createCategory}
          className="category_btn"
          disabled={categoryError}
          style={{ flex: 1, borderRadius:'20px'}} >
          Create
        </button>
      </div>
    </div>
  </div>
)}


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

        <h2>Import Category File</h2>
        <p>Upload a file to import category data into the system.</p>

        {/* Container for Download Sample File and Format Selector */}
        <div className="download-sample-container">
            {/* Download Sample File Link */}
            <a
                href={`/importCategory.${selectedFileFormat.toLowerCase()}`}
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

export default CategoryList;
