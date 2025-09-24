import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './VendorList.css';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { LinearProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import * as XLSX from 'xlsx';
import {Tooltip} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
const VendorList = ({ isSidebarOpen, toggleSidebar }) => {
   useEffect(() => {
      if (isSidebarOpen) {
        const timer = setTimeout(() => {
          toggleSidebar();  // Close the sidebar after 10 seconds
        }, 2000);  // 10 seconds timeout
  
        // Cleanup the timer if the component is unmounted before the timer ends
        return () => clearTimeout(timer);
      }
    }, [isSidebarOpen, toggleSidebar]);
  const [vendors, setVendors] = useState([]);
  const [selectedFileFormat, setSelectedFileFormat] = useState('XLSX');
  const [vendorCount, setVendorCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Items per page for pagination
  const navigate = useNavigate();
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loader, setLoader] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Fetch the vendor data from the backend
  const fetchVendors = async (searchQuery = "", page = 1) => {
    try {
      setLoading(true);
      setLoader(true);
      const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainVendor/`, {
        params: {
          search: searchQuery,  // Send the search query to the API
        },
      });      
      if (response.status === 401) {
        setUnauthorized(true);
      } 
      setVendors(response.data.data.vendor_list || []);
      setVendorCount(response.data.data.vendor_count || 0);
      setLoader(false);
    } catch (error) {
      setLoader(false);
      if (error.status === 401) {
        setUnauthorized(true);
      } else{
        console.error('Error fetching suppliers:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch supplier data.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
      
    } finally {
      setLoader(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(searchQuery, currentPage);
  }, [currentPage, searchQuery]); // fetch vendors when currentPage or searchQuery changes

  const openImportModal = () => {
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setSelectedFileFormat('XLSX');
  };
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
  const handleSearchChange = (e) => {
    const query = e.target.value;
    fetchVendors(query, 1); 
    setSearchQuery(query);
    setCurrentPage(1); // Reset to page 1 when search is changed
  };

  const handleSearchClear = () => {
    setSearchQuery(""); // Clear the search query
    setCurrentPage(1);  // Reset to page 1 when clearing search
    fetchVendors("", 1); // Trigger API call with an empty search query and page 1
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
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const uploadPromise = axiosInstance.post(`${process.env.REACT_APP_IP}/importVendor/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
        const processedRecords = response.data.total_vendor; // Update this value if needed
        const validRecords = response.data.added_count;
        const errorRecords = response.data.error_count;
        const errorList = response.data.error_list || []; // Array of errors
        // Separate the correct and error data from the response
        // Create a table for error data
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
      
        // Clear file and reload data
        setSelectedFile(null);
        fetchVendors(searchQuery, currentPage);
        closeImportModal();
      } else if (response.data.status === true && response.data.is_error === false) {
        const processedRecords = response.data.total_vendor; // Update this value if needed
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
          // text: 'File imported successfully.',
          icon: 'success',
          html: additionalInfo, // Insert the additional info in the modal
          showCloseButton: true, // Show the close button in the top-right corner
          allowOutsideClick: false, // Disable closing by clicking outside
          showConfirmButton: true, // Optionally hide the confirm button
          customClass: {
            icon: 'custom-icon-margin' // Custom class for icon styling
          }
        });
        setSelectedFile(null);
        fetchVendors(searchQuery, currentPage);
        closeImportModal();
      }
       else if (response.data.status === false) {     
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
        const processedRecords = response.data.total_vendor; // Update this value if needed
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
          confirmButtonText: 'OK',
          showCloseButton: true, // Show the close button in the top-right corner
          allowOutsideClick: false, // Disable closing by clicking outside
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
        fetchVendors(searchQuery, currentPage);
        closeImportModal();
      }
       else {
        Swal.fire({ title: 'Error!', text: 'Failed to import file.', icon: 'error' });
        setSelectedFile(null);
        closeImportModal();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
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
    // Generate the worksheet from the formatted data
    const ws = XLSX.utils.json_to_sheet(formattedErrors);
    // Set the alignment for both columns
    ws['A1'].s = { alignment: { horizontal: 'left' } }; // Row column (A)
    ws['B1'].s = { alignment: { horizontal: 'left' } }; // Errors column (B)

    // Set alignment for every row in the worksheet
    for (let row = 2; row <= ws['!ref'].split(':')[1].slice(1); row++) {
        ws[`A${row}`].s = { alignment: { horizontal: 'left' } }; // Row column (A)
        ws[`B${row}`].s = { alignment: { horizontal: 'left' } }; // Errors column (B)
    }

    // Create a new workbook and append the sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Error List");

    // Generate and trigger the download link for the Excel file
    XLSX.writeFile(wb, "error_list.xlsx");
    Swal.fire({
      title: 'Success!',
      text: 'The error list has been successfully downloaded.',
      icon: 'success'
  });
};


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddVendor = async () => {
    navigate(`/Admin/vendors/add`);  // Make sure brandId is correctly passed here
  };

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/exportVendor/`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'supplier_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      window.URL.revokeObjectURL(url);

      Swal.fire({
        title: 'Success!',
        text: 'Supplier list exported successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Error exporting supplier:', error);

      Swal.fire({
        title: 'Export Failed!',
        text: 'An error occurred while exporting the supplier data.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleVendorClick = (vendorId) => {
    navigate(`/Admin/vendor/${vendorId}`);  // Make sure brandId is correctly passed here
  };
  const handleImportDownload = async () => {
    if (selectedFileFormat === 'ODS') {
        // For ODS, no API call is needed, just use the static download link
        return;
    }

    try {
        const response = await axiosInstance.get(
            `${process.env.REACT_APP_IP}/sampleVendorImport${selectedFileFormat}/`, 
            { responseType: 'blob' }
        );

        // Create a link element to trigger the download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `importSupplier.${selectedFileFormat.toLowerCase()}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);  // Clean up the link element
    } catch (error) {
        console.error("Error downloading file", error);
    }
};

  // Pagination logic
  const totalPages = Math.ceil(vendorCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVendors = vendors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
          {loader && (
        <div className="loader-overlay">
          <div className="spinner"></div> {/* Custom spinner */}
        </div>
      )}
    <div className="vendor-list-container">
   <div>
   <div className="brand-header">
        <div className="brand-header-info" >
          <h1 className="brand-title"> Suppliers</h1>
        </div>
        <div className="addbrandcontainer" style={{  display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%',}}>
          {/* {searchOpen && ( */}
   
<div className="search-input-container-brand" style={{ marginTop: '20px', paddingRight: '15px', position: 'relative' }}>
  <input
    type="text"
    autoComplete="off"
    placeholder="Search Suppliers"
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
          {/* )}  */}
          {/* <div className="search-icon-container" onClick={toggleSearchField} style={{ marginTop:'40px', margin: '30px 14px 28px' }}>
            <SearchIcon style={{ cursor: 'pointer', fontSize: '33px' }} />
            <span className="search-hover-text" style={{width:'40px'}}>Search</span>
          </div> */}
          <div className="brand-actions-container">
          <div className="button-row" style={{ marginTop: '-15px'}}>
          <button onClick={handleAddVendor} className="add-product-btn-container import-btn"  style={{ marginRight: '5px' }}>
          <AddOutlinedIcon style={{ cursor: 'pointer' }} className="add-product-btn" />
          <span className="button-text" style={{width:'75px'}}>Add Supplier</span>
          </button>
          <button className="import-btn" onClick={openImportModal} style={{ marginRight: '5px' }}>
            <DownloadIcon />
            <span className="button-text">Import</span>
          </button>
          <button className="import-btn download-btn" onClick={handleExport}>
            <UploadIcon />
            <span className="button-text">Export</span>
          </button>
          {/* <div className="brand-count-container"> */}
           {/* Total Vendors with inline CSS */}
    <div className="count-vendor" style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
      <span className="total-brands-text" style={{ marginRight: '5px' }}>Total Suppliers:</span>
      <span className="brand-count">{vendorCount}</span>
    </div>

          </div>
         
</div>
         </div>
      </div>    
    
        </div>
          {/* <div className="vendor-table-container">
            <table className="vendor-table">
              <thead>
                <tr>
                  <th>Vendor Logo</th>
                  <th>Vendor Name</th>
                  <th>Business type</th>
                  <th>Industries Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentVendors.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      No vendors found
                    </td>
                  </tr>
                ) : (
                  currentVendors.map((vendor) => {
                    return (
                      <tr key={vendor.id} onClick={() => handleVendorClick(vendor.id)}>
                        <td>
                          <img src={vendor.logo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOBl1B_Kz4RdrOR6_WgaITKDcS10PGoL7jVA&s'} alt={`${vendor.name} Logo`} className="brand-logo-image" />
                        </td>
                        <td><span className="vendor_name brand_name">{vendor.name}</span></td>
                        <td><span className="vendor_name brand_name">{vendor.business_type_name || 'N/A'}</span></td>
                        <td><span className="vendor_name brand_name">{vendor.industry_info || 'N/A'}</span></td>

                        <td>
                          <button onClick={() => navigate(`/vendor/${vendor.id}`)} className="view-details-btn">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div> */}


<div className="vendor-table-container">
 
  <table className="vendor-table" >
  <thead>
    <tr>
      <th>Logo</th>
      <th>Name</th>
      <th>Business type</th>
      <th>Website</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
    <tbody>
                {currentVendors.length === 0 ? (
                  <tr>
                     {loader && (
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      Loading suppliers
                    </td>
                  )}
                    {!loader && (
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        No suppliers found
                      </td>
                    )}
                  </tr>
                ) : (
                  currentVendors.map((vendor) => {
                    return (
                      <tr key={vendor.id} onClick={() => handleVendorClick(vendor.id)}>
                        <td>
                          <img src={vendor.logo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOBl1B_Kz4RdrOR6_WgaITKDcS10PGoL7jVA&s'} alt={`${vendor.name} Logo`} className="brand-logo-image" />
                        </td>
                        <td><span className="vendor_name brand_name">{vendor.name}</span></td>
                        <td><span className="vendor_name brand_name">{vendor.business_type_name || 'N/A'}</span></td>
                        <td>{vendor.website ? (<a href={vendor.website} target="_blank" rel="noopener noreferrer" className="brand_name">  {vendor.website}  </a> ) : (  "N/A" )} </td>
                        <td><span className="vendor_name brand_name">{vendor.email || 'N/A'}</span></td>
                        <td>
  <Tooltip title="Edit Supplier Details" arrow>
    <button
      onClick={() => navigate(`/vendor/${vendor.id}`)}
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
</div>    

      

      {totalPages > 1 && (
        <div className="pagination-container">
          {currentPage > 1 && (
            <button onClick={() => handlePageChange(currentPage - 1)} className="pagination-button">&laquo; Prev</button>
          )}
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          {currentPage < totalPages && (
            <button onClick={() => handlePageChange(currentPage + 1)} className="pagination-button">Next &raquo;</button>
          )}
        </div>
      )}

      {/* Import Modal */}
      <Modal open={showImportModal} onClose={closeImportModal}>
    <div className="import-modal">
        {/* Cancel Button as X at Top-Right Corner */}
        <Button
            variant="text"
            color="default"
            onClick={closeImportModal}
            className="cancel-button"
        >
            &times; {/* Using &times; for an "X" symbol */}
        </Button>

        <h2>Import Supplier File</h2>
        <p>Upload a file to import supplier data into the system.</p>

        {/* Container for Download Sample File and Format Selector */}
        <div className="download-sample-container">
            {/* Download Sample File Link */}
            <a
                href={selectedFileFormat === 'ODS' 
                    ? '/importSupplier.ods' // Static file link for ODS
                    : undefined} // No link for non-ODS formats, handled by API function
                onClick={selectedFileFormat !== 'ODS' ? handleImportDownload : undefined}
                className="download-sample"
                style={{cursor:'pointer'}}
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
        
        {/* Actions Section with Upload Button on the Right */}
        <div className="actionsbtn">
            <Button
                variant="contained"
                color="success"
                onClick={handleUpload}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                className="upload-button"
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

export default VendorList;
