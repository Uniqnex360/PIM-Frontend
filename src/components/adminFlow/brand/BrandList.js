import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import Swal from 'sweetalert2';
import './BrandList.css';
import { useNavigate } from 'react-router-dom';
import UploadIcon from '@mui/icons-material/Upload'; 
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { LinearProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';  // Importing Download Icon
import SearchIcon from '@mui/icons-material/Search';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import * as XLSX from 'xlsx';
import {Tooltip} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
const BrandList = ({ isSidebarOpen, toggleSidebar }) => {
   useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        toggleSidebar();  // Close the sidebar after 10 seconds
      }, 2000);  // 10 seconds timeout

      // Cleanup the timer if the component is unmounted before the timer ends
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, toggleSidebar]);
  const [loader, setLoader] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedFileFormat, setSelectedFileFormat] = useState('XLSX');
  const [brandCount, setBrandCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterLetter, setFilterLetter] = useState(''); // State for letter filter
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const itemsPerPage = 15; // Number of items per page
  const navigate = useNavigate();
 const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [unauthorized, setUnauthorized] = useState(false);
  const fetchBrands = async (searchQuery = "", page = 1) => {
    try {
      setLoading(true);
      setLoader(true);
      const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBrand/`,{ params: {
        search: searchQuery,  // Send the search query to the API
      },});
      if (response.status === 401) {
        setUnauthorized(true);
      } 
 setBrandCounts(response.data.brand_count || 0);
const brandList = response.data.brand_list || [];
      setBrands(brandList);
      setLoader(false);
    } catch (error) {
      setLoader(false);
      if (error.status === 401) {        
        setUnauthorized(true);
      } else{
        console.error('Error fetching Brands:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch Brands.',
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
     
    } finally {
      setLoading(false);
      setLoader(false);
    }
  };
  useEffect(() => {
    fetchBrands();
  }, []);
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
  const filteredBrands = filterLetter
    ? brands.filter((brand) => brand.name[0].toUpperCase() === filterLetter.toUpperCase())
    : brands;

    const openImportModal = () => {
      setShowImportModal(true);
  };
  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setSelectedFileFormat('XLSX');
};


const handleSearchChange = (e) => {
  const query = e.target.value;
  setSearchQuery(query);
  setCurrentPage(1);  // Reset to first page when search changes
  fetchBrands(query, 1); // Trigger API call with the updated search query
};

const handleSearchClear = () => {
  setSearchQuery(""); // Clear the search query
  fetchBrands("",1); // Trigger API call with an empty search query
  setSearchOpen(false); // Close the search field
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
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', selectedFile);
   

    try {
      const uploadPromise = axiosInstance.post(`${process.env.REACT_APP_IP}/importBrand/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // onUploadProgress: (progressEvent) => {
        //   const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        //   setUploadProgress(percentage);
        // },
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
          console.log(is_first,'is_first');
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
                const processedRecords = response.data.total_brand; // Update this value if needed
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
                <p style="font-weight: bold;">Showing the first 15 errors. Download error list for more details and retry after fixing issues.</p>
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
              
                // Clear file and reload data
                setSelectedFile(null);
                fetchBrands();
                closeImportModal();
              } else if (response.data.status === true && response.data.is_error === false) {
                const processedRecords = response.data.total_brand; // Update this value if needed
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
            fetchBrands();
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
          const processedRecords = response.data.total_brand; // Update this value if needed
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
                  fetchBrands();
                  closeImportModal();
        } else {
            setSelectedFile(null);
            closeImportModal();
            Swal.fire({ title: 'Error!', text: 'Failed to import file.', icon: 'error' });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        closeImportModal();
        Swal.fire({ title: 'Error!', text: 'Something went wrong. Try again.', icon: 'error' });
    } finally {
        setLoading(false);
    }
};
  // Function to generate Excel and trigger download
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
       // Generate the worksheet from the formatted data
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
    const handleAddBrand = async () => { 
      navigate(`/Admin/brands/add`);  // Make sure brandId is correctly passed here
    };
    const handleExport = async () => {
      try {
          // Make the API call to export the brand with 'blob' response type for file download
          const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/exportBrand/`, {
              responseType: 'blob', // Ensures the response is treated as binary data (e.g., Excel file)
          });
  
          // Create a URL for the file data
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'brand_export.xlsx');  // Set the default filename for download
          document.body.appendChild(link);
          link.click();  // Trigger the download
          link.parentNode.removeChild(link);  // Clean up the link element
  
          window.URL.revokeObjectURL(url);  // Release the object URL
  
          // Display success notification
          Swal.fire({
              title: 'Success!',
              text: 'Brand list exported successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
          });
      } catch (error) {
          console.error('Error exporting brand:', error);
          
          // Display error notification if the export fails
          Swal.fire({
              title: 'Export Failed!',
              text: 'An error occurred while exporting the brand data.',
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

  const handleBrandClick = (brandId) => {
    navigate(`/Admin/brand/${brandId}`);  // Make sure brandId is correctly passed here
  };
  
  const totalPages = Math.ceil(brandCount / itemsPerPage);  // Calculate total pages based on brand count
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBrands = filteredBrands.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBrands(searchQuery, page);  // Fetch brands for the selected page with current search query
  };


  if (!brands) {
    return (
      <div className="superAdmin-error-message">
        <p>Error loading Brand data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
          {loader && (
        <div className="loader-overlay">
          <div className="spinner"></div> {/* Custom spinner */}
        </div>
      )}
    <div className="brand-page">
      <div className="brand-header">
        <div className="brand-header-info" style={{marginTop:'2px'}}>
          <h1 className="brand-title">Brands</h1>
          {/* <div className="brand-count-container">
            <span className="total-brands-text">Total Brands:</span>
            <span className="brand-count">{brandCount}</span>
          </div> */}
        </div>
  
        <div className="addbrandcontainer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%',     marginTop: '5px' }}>
        {/* {searchOpen && ( */}
            <div className="search-input-container-brand" style={{ paddingRight:'15px',marginTop: '21px', }}>
              <input
                type="text"
                autoComplete="off"
                placeholder="Search Brands"
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
                style={{ cursor: 'pointer',color:'grey',fontSize:'21px',right: '20px',  }}
              /> )}
   {searchQuery.length === 0 && (
              <SearchIcon 
                style={{
                  position: 'absolute',
                  right: '20px',         // Position the icon on the right side
                  top: '50%',
                  transform: 'translateY(-50%)',  // Center vertically
                  cursor: 'pointer',    // Show pointer cursor
                  color: '#888'          // Icon color (optional)
                }}
              /> )}
            </div>
          {/* )} */}
          {/* <div className="search-icon-container" onClick={toggleSearchField}  style={{ marginTop:'40px', margin: '24px 14px 28px' }}>
            <SearchIcon style={{ cursor: 'pointer', fontSize: '33px' }} />
            <span className="search-hover-text" style={{width:'40px'}}>Search</span>
          </div> */}
  <div className="brand-actions-container">
  <div className="button-row">
    <button className="add-product-btn-container import-btn" onClick={handleAddBrand}>
      <AddOutlinedIcon style={{ cursor: 'pointer' }} className="add-product-btn" />
      <span className="button-text" style={{ width: '65px' }}>Add Brand</span>
    </button>
    <button 
      className="import-btn" 
      onClick={openImportModal} 
      style={{ marginLeft: '5px' }}>
      <DownloadIcon />
      <span className="button-text">Import</span>
    </button>
    <button 
      className="import-btn download-btn" 
      onClick={handleExport} 
      style={{ marginLeft: '5px' }}>
      <UploadIcon />
      <span className="button-text">Export</span>
    </button>

    <div className="count-vendor" style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
      <span className="total-brands-text" style={{ marginRight: '5px' }}>Total Brands:</span>
      <span className="brand-count">{brandCount}</span>
    </div>
  </div>
  <div className="brand-count-container">
    {/* <span className="total-brands-text">Total Brands:</span>
    <span className="brand-count">{brandCount}</span> */}
  </div>
</div>

</div>
      </div>        
        <table className="brand-table"  stickyHeader sx={{ minWidth: 800,  }}>
  <thead>
    <tr>
      <th>Logo</th>
      <th>Name</th>
      <th>Website</th>
      <th>Country of Origin</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
  {currentBrands.length === 0 ? (
    <tr>
      {loader && (
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      Loading brands
                    </td>
                  )}
                    {!loader && (
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                       No brands found
                      </td>
                    )}
    </tr>
  ) : (
    currentBrands.map((brand) => {
      // Construct the base64 string or use the fallback URL
      return (
        <tr key={brand.id} onClick={() => handleBrandClick(brand.id)}>
          <td>
            <img
              src={brand.logo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOBl1B_Kz4RdrOR6_WgaITKDcS10PGoL7jVA&s'}
              alt={`${brand.name} Logo`}
              className="brand-logo-image"
            />
          </td>
          <td><span className='brand_name'>{brand.name}</span></td>
          <td>
  {brand.website ? (
    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="brand_name">
      {brand.website}
    </a>
  ) : (
    "N/A"
  )}
</td>


          <td>{brand.country_of_origin || 'N/A'}</td>
          <td>{brand.status || 'N/A'}</td>
    

                    <td>
            <Tooltip title="Edit Brand Details" arrow>
            <button onClick={() => handleBrandClick(brand.id)} 
                style={{
                  background: 'none',  // Remove background
                  border: 'none',      // Remove border
                  padding: 0,          // Remove padding
                  cursor: 'pointer',   // Change cursor to pointer
                }}
              >
                   <EditIcon sx={{ color: "#923be3" ,fontSize: 20 }} />
             
              </button>
            </Tooltip>
          </td>
        </tr>
      );
    })
  )}
</tbody>
</table>

          <div className="pagination-container">
            {totalPages > 1 && currentPage > 1 && (
              <button className="pagination-button prev-button" onClick={() => handlePageChange(currentPage - 1)}>
                &laquo; Prev
              </button>
            )}
            {totalPages > 1 && (
              Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), currentPage + 2)
                .map((page) => (
                  <button key={page} className={`pagination-button ${page === currentPage ? 'active' : ''}`} onClick={() => handlePageChange(page)}>
                    {page}
                  </button>
                ))
            )}
            {totalPages > 1 && currentPage < totalPages && (
              <button className="pagination-button next-button" onClick={() => handlePageChange(currentPage + 1)}>
                Next &raquo;
              </button>
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
        <div className="download-sample-container">
            <a
                href={`/BrandImport.${selectedFileFormat.toLowerCase()}`}
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

export default BrandList;
