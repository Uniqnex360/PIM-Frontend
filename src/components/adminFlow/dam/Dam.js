import React, { useState, useEffect, useRef } from 'react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import './Dam.css'; // Create your own styling for the DAM page
import DownloadIcon from '@mui/icons-material/Download';  // Importing Download Icon
import CircularProgress from '@mui/material/CircularProgress';
import Swal from 'sweetalert2';
import { Modal, Box, Typography, IconButton, Button, LinearProgress,Grid2 } from "@mui/material";
import { Close as CloseIcon, CloudUpload as CloudUploadIcon, PictureAsPdf, Description } from "@mui/icons-material";
import { styled } from "@mui/system";
import * as XLSX from 'xlsx';
const Dam = ({ isSidebarOpen, toggleSidebar }) => {
  // States for file uploads and API response
  useEffect(() => {
          if (isSidebarOpen) {
            const timer = setTimeout(() => {
              toggleSidebar();  // Close the sidebar after 10 seconds
            }, 2000);  // 10 seconds timeout
           return () => clearTimeout(timer);
          }
        }, [isSidebarOpen, toggleSidebar]);
  const [formData, setFormData] = useState({
    image_list: [],
    video_list: [],
    attachment_list: [],
  });
  const [newFiles, setNewFiles] = useState({
    image_list: [],
    video_list: [],
    attachment_list: [],
  });
    const navigate = useNavigate();
    const modalStyle = {
      position: "relative",  // Make sure the modal is positioned correctly
      zIndex: 2000,  
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };
  const [open, setOpen] = useState(false);
  const [loadingdam, setLoadingdam] = useState(false);
  const [loadingdams, setLoadingdamloader] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClosedam = () => {
    setOpen(false);
    setNewFiles({
      image_list: [],
      video_list: [],
      attachment_list: [],
    });
  };
  const [fileCounts, setFileCounts] = useState({
    image_count: 0,
    video_count: 0,
    document_count: 0,
    product_count:0,
  });
      const fetchAssetsCount = async () => {
        setLoadingdamloader(true);
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainCountForUserWiseFiles/`);            
            if (response.status === 401) { setUnauthorized(true); } 
            setLoadingdamloader(false);
            setFileCounts({
              image_count: response.data.image_count || 0,
              video_count: response.data.video_count || 0,
              document_count: response.data.document_count || 0,
              product_count:response.data.product_count || 0,
            });
        } catch (error) {
          setLoadingdamloader(false);
          if (error.status === 401) {
            setUnauthorized(true);
          } else{
            console.error('Error fetching Counts:', error);
            Swal.fire({ title: 'Error!', text: 'Failed to load Assets Counts.', icon: 'error', confirmButtonText: 'OK' });
          }
        }
    };
 const [showImportModal, setShowImportModal] = useState(false);
 const [selectedFile, setSelectedFile] = useState(null);
 const [loading, setLoading] = useState(false);
 const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileFormat, setSelectedFileFormat] = useState('XLSX');
    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setSelectedFile(file);
  };
  useEffect(() => {    
    fetchAssetsCount();
  }, []);
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
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
        const uploadPromise = axiosInstance.post(`${process.env.REACT_APP_IP}/importDAM/`,
            formData,
            { headers: {   'Content-Type': 'multipart/form-data',  }, }  );   
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
        const processedRecords = response.data.total_dam; // Update this value if needed
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
        fetchAssetsCount();
        closeImportModal();
      } else if (response.data.status === true && response.data.is_error === false) {
        const processedRecords = response.data.total_dam; // Update this value if needed
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
        fetchAssetsCount();
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
        const processedRecords = response.data.total_dam; // Update this value if needed
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
        fetchAssetsCount();
        setSelectedFile(null);
        closeImportModal();
      } else {
        setSelectedFile(null);
        fetchAssetsCount();
        closeImportModal();
        Swal.fire({ title: 'Error!', text: 'Failed to import file.', icon: 'error' });
      }
    } catch (error) {
      closeImportModal();
      fetchAssetsCount();
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
  setSelectedFile(null);
  setSelectedFileFormat('XLSX');
};
const handleFileUpload = (e) => {
  const { files } = e.target;  // Get the selected files

  // Loop through all selected files and categorize them based on type
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
};


  const handleDeleteFile = (type, index, fileName) => {
    setFormData(prevState => {
      const updatedList = prevState[`${type}_list`].filter((_, i) => i !== index);
      return {
        ...prevState,
        [`${type}_list`]: updatedList,
      };
    });
  };
  const handleExport = async () => {
    try {
        // Make the API call to export the brand with 'blob' response type for file download
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/exportDAM/`, {
            responseType: 'blob', // Ensures the response is treated as binary data (e.g., Excel file)
        });

        // Create a URL for the file data
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'DAM_export.xlsx');  // Set the default filename for download
        document.body.appendChild(link);
        link.click();  // Trigger the download
        link.parentNode.removeChild(link);  // Clean up the link element

        window.URL.revokeObjectURL(url);  // Release the object URL

        // Display success notification
        Swal.fire({
            title: 'Success!',
            text: 'DAM list exported successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
        });
    } catch (error) {
        console.error('Error exporting DAM:', error);
        
        // Display error notification if the export fails
        Swal.fire({
            title: 'Export Failed!',
            text: 'An error occurred while exporting the DAM data.',
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
const handleFileChangedam = (event, filesselected) => {
  const files = filesselected ? Array.from(filesselected) : Array.from(event.target.files);
  // If droppedFiles is provided, use it, otherwise use event.target.files
  
  if (files.length === 0) return;
  // Filter out already uploaded files
  const newImageFiles = files.filter((file) => file.type.startsWith("image"));
  const newVideoFiles = files.filter((file) => file.type.startsWith("video"));
  const newAttachmentFiles = files.filter(
    (file) => !file.type.startsWith("image") && !file.type.startsWith("video")
  );

  // Update newFiles with new categorized files
  setNewFiles((prev) => ({
    image_list: [...prev.image_list, ...newImageFiles],
    video_list: [...prev.video_list, ...newVideoFiles],
    attachment_list: [...prev.attachment_list, ...newAttachmentFiles],
  }));  
};

const handleFileDrop = (event) => {
  event.preventDefault();
  if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    handleFileChangedam(event, event.dataTransfer.files);
  }
};

const handleRemoveFile = (file, type) => {
  console.log(type, 'check here');
  
  // Set the correct type in Swal based on the value of 'type'
  let swalText = type === 'application' ? 'document' : type; // If type is 'application', show 'document'
  
  Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to delete this ${swalText}?`,  // Displaying document for 'application' or type as it is
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    reverseButtons: true,
    confirmButtonText: 'Yes, delete it!',
    didOpen: () => {
      // Manually set a higher z-index for the SweetAlert container
      const swalContainer = document.querySelector('.swal2-container');
      if (swalContainer) {
        swalContainer.style.zIndex = '9999'; // Ensure SweetAlert appears above
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Remove from newFiles list if confirmed
      setNewFiles((prevFiles) => ({
        image_list: prevFiles.image_list.filter((f) => f !== file),
        video_list: prevFiles.video_list.filter((f) => f !== file),
        attachment_list: prevFiles.attachment_list.filter((f) => f !== file),
      }));
      Swal.fire({
        title: 'Deleted!',
        text: `The ${swalText} has been deleted.`,
        icon: 'success',
        didOpen: () => {
          // Manually set a higher z-index for the SweetAlert container
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999'; // Ensure SweetAlert appears above
          }
        }
      });
      
    }
  });
};

const handleUploaddam = async () => {
  setLoadingdamloader(true);
  if (newFiles.length === 0) {
    Swal.fire({
      title: "No New Files!",
      text: "Please add new files to upload.",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }
console.log(newFiles.length,'newFiles');

  const formDataToSend = new FormData();
  newFiles.image_list.forEach((file) => {
    const fileType = file.type.split('/')[0];  // Get the type (image, video, etc.)
    const fileExtension = file.name.split('.').pop().toLowerCase();  // Get file extension for documents
    console.log(fileType, 'fileType');
    if (fileType === 'image') {
      // If the file is an image, add it to the image list
      formDataToSend.append('images', file);
    }
  });
  
  newFiles.video_list.forEach((file) => {
    const fileType = file.type.split('/')[0];  // Get the type (image, video, etc.)
    const fileExtension = file.name.split('.').pop().toLowerCase();  // Get file extension for documents
    console.log(fileType, 'fileType');
   if (fileType === 'video') {
      // If the file is a video, add it to the video list
      formDataToSend.append('videos', file);
    }
  });
  
  newFiles.attachment_list.forEach((file) => {
    const fileType = file.type.split('/')[0];  // Get the type (image, video, etc.)
    const fileExtension = file.name.split('.').pop().toLowerCase();  // Get file extension for documents
    console.log(fileType, 'fileType');
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension)) {
      // If the file is a document, add it to the document list
      formDataToSend.append('documents', file);
    }
  });
  setLoadingdam(true);  
  try {
    const response = await axiosInstance.post(
      `${process.env.REACT_APP_IP}/updateFilesIntoProduct/`,
      formDataToSend,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    setLoadingdamloader(false);
    if (response.data.data.is_upload === true && !response.data.data.error_list) {
      Swal.fire({
        title: "Success!",
        text: "Files uploaded successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
      setNewFiles([]); // Clear new files after successful upload
      handleClosedam();
    } else if (response.data.data.is_upload === true && response.data.data.error_list) {
      // Create an HTML table from the error_list
      const errorList = response.data.data.error_list || []; // Array of errors
      const tableStyle = errorList.length > 3 ? 
      `max-height: 200px; overflow-y: auto; display: block;` : '';
      const errorListHTML = `
        <table style="width: 100%; border-collapse: collapse;${tableStyle}">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Row</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Error</th>
            </tr>
          </thead>
          <tbody>
            ${response.data.data.error_list.map((error, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${error}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    
      // Show SweetAlert with the error table
      Swal.fire({
        title: "Warning!",
        html: errorListHTML, // Use the HTML table here
        icon: "warning",
        confirmButtonText: "OK",
      });
    
      // Clear new files after showing the error message
      setNewFiles([]); // Clear new files after successful upload
      handleClosedam();
    } else if(response.data.data.is_upload === false && response.data.data.error){
      Swal.fire({
        title: "Warning!",
        text: response.data.data.error,
        icon: "warning",
        confirmButtonText: "OK",
      });
      setNewFiles([]); // Clear new files after successful upload
      handleClosedam();
    }
    else if(response.data.data.is_upload === false) {
      Swal.fire({
        title: "Warning!",
        text: "Files failed to upload. Please check the file format or size and try again.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      setNewFiles([]); // Clear new files after successful upload
      handleClosedam();

    } else {
      handleClosedam()
      Swal.fire({
        title: "Error!",
        text: "File upload failed.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    handleClosedam();
    setLoadingdamloader(false);
    console.error("Error uploading files:", error);
    Swal.fire({
      title: "Error!",
      text: "File upload failed.",
      icon: "error",
      confirmButtonText: "OK",
    });
  } finally {
    setLoadingdam(false);
  }
};


  return (
    <div>
    {loadingdams && (
  <div className="loader-overlay">
    <div className="spinner"></div> {/* Custom spinner */}
  </div>
)}
    <div className="dam-container">

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '40px' }}>
  <h2 className="products_header" style={{ margin: '0 0 22px 0' , fontSize:'21px'}}>
    Digital Assets
  </h2>
  {/* Uncomment and adjust the following span if you need it */}
  {/* 
  <span style={{ fontSize: '16px', color: '#666' }}>
    <span className="total-brands-text">Total Products:</span>
    <span className="brand-count">{productCount}</span>
  </span> 
  */}
</div>

      <div className="addbrandcontainer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' , marginTop:'-50px' }}>
        {/* Import Button */}
        <div
            className="add-product-btn-container import-btn"
          >
            <AddOutlinedIcon style={{ cursor: 'pointer' }} className="add-product-btn" onClick={handleOpen}/>
               <span className="button-text" style={{width:'77px'}}>Upload Assets</span>
            
          </div>
        <button 
          className="import-btn" 
          onClick={openImportModal} 
          style={{ marginLeft: '12px' }}
        >
          <DownloadIcon />
          <span className="button-text">Import</span> {/* Tooltip-like text shown on hover */}
        </button>

        {/* Export Button */}
        {/* <button 
          className="import-btn download-btn" 
          onClick={handleExport} 
          style={{ marginLeft: '12px' }}
        >
          <UploadIcon />
          <span className="button-text">Export</span>
        </button> */}
      </div>
      <section>
        {/* <h2>Digital Assets</h2> */}
        {/* Upload Images Section */}
       {/* Upload Images Section */}
    {/* <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'space-between' }}>
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
    </div> */}

        {/* Display All Uploaded Files */}
        {/* <div>
          <h3>Uploaded Files</h3> */}

          {/* Display Uploaded Images */}
          {/* {formData.image_list.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                maxHeight: formData.image_list.length > 4 ? '240px' : 'auto',
                overflowY: formData.image_list.length > 4 ? 'auto' : 'hidden',
                marginBottom: '20px',
              }}
            >
              {formData.image_list.map((file, index) => (
                <div key={index} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px', width: '100px' }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`new-image-${index}`}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      transition: '0.3s',
                    }}
                  />
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
          )} */}

          {/* Display Uploaded Videos */}
          {/* {formData.video_list.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                maxHeight: '100px',
                overflowY: 'auto',
                marginBottom: '20px',
              }}
            >
              {formData.video_list.map((video, index) => (
                <div key={index} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px', width: '200px' }}>
                  <video
                    src={URL.createObjectURL(video)}
                    controls
                    style={{ width: '170px', height: '85px' }}
                  />
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
          )} */}

          {/* Display Uploaded Documents */}
          {/* {formData.attachment_list.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxHeight: formData.attachment_list.length > 4 ? '212px' : 'auto',
                overflowY: formData.attachment_list.length > 4 ? 'auto' : 'hidden',
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
          )} */}
        {/* </div> */}
        <div className="card-container" style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)', // 2 cards in each row
  gap: '20px',
  marginTop: '20px',
  border: '1px solid #c1bdbd', // Adding border
  borderRadius: '5px', // Adding border-radius
  padding: '18px' // Adding padding
}}>

  {/* Image Card */}
  <div className="card" style={{
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>

    <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Images</h3>
    <span style={{ fontSize: '16px', color: '#666' }}>{fileCounts.image_count} Items</span>
  </div>

  {/* Video Card */}
  <div className="card" style={{
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>

    <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Videos</h3>
    <span style={{ fontSize: '16px', color: '#666' }}>{fileCounts.video_count} Items</span>
  </div>

  {/* Document Card */}
  <div className="card" style={{
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>

    <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Documents</h3>
    <span style={{ fontSize: '16px', color: '#666' }}>{fileCounts.document_count} Items</span>
  </div>

  {/* Product Card */}
  <div className="card" style={{
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>

    <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Products</h3>
    <span style={{ fontSize: '16px', color: '#666' }}>{fileCounts.product_count} Items</span>
  </div>
</div>

      </section>
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
                href={`/importDam.${selectedFileFormat.toLowerCase()}`}
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

  <Modal open={open} onClose={handleClosedam}>
  <Box sx={{ ...modalStyle, width: 600, maxWidth: "90vw", height:'500px' }}> {/* Wider Modal */}
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6">Upload Files</Typography>
      <IconButton onClick={handleClosedam}>
        <CloseIcon />
      </IconButton>
    </Box>

    {/* Drag & Drop Section */}
    <Box
      mt={2}
      textAlign="center"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={handleFileDrop}
      
      sx={{ border: "2px dashed gray", p: 2, cursor: "pointer", borderRadius: 2 }}
    >
      <CloudUploadIcon fontSize="large" color="primary"   onClick={() => document.getElementById("file-upload").click()} // Opens file dialog on click
      />
      <Typography>Drag & Drop Files Here</Typography>
      <input
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        onChange={handleFileChangedam}
        style={{ display: "none" }}
        id="file-upload"
      />
      <label htmlFor="file-upload" style={{ cursor: "pointer", color: "blue" }}>
        Select Files
      </label>
    </Box>

    {/* Selected Files Preview */}
    <Box mt={2} sx={{ maxHeight: 350, overflowY: "auto", padding: 1 }}>
      <Typography variant="subtitle1" color="primary">
      {newFiles.image_list.length + newFiles.video_list.length + newFiles.attachment_list.length} Files Selected
      </Typography>
      <Grid2 container spacing={2}>
      {[...newFiles.image_list, ...newFiles.video_list, ...newFiles.attachment_list].map((file, index) => {
          const fileURL = URL.createObjectURL(file);
          const fileType = file.type.split("/")[0];

          return (
            <Grid2 item xs={4} key={index}>
              <Box sx={{ position: "relative", border: "1px solid #ddd", borderRadius: 2, p: 1 }}>
                {fileType === "image" ? (
                  <img
                    src={fileURL}
                    alt="Preview"
                    style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: 5 }}
                  />
                ) : fileType === "video" ? (
                  <video
                    src={fileURL}
                    controls
                    style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: 5 }}
                  />
                ) : file.type.includes("pdf") ? (
                  <Box textAlign="center" style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: 5 }}>
                    <PictureAsPdf fontSize="large" color="error" />
                    <Typography variant="body2">PDF File</Typography>
                    <Button size="small" onClick={() => window.open(fileURL, "_blank")}>
                      Preview
                    </Button>
                  </Box>
                ) : (
                  <Box textAlign="center" style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: 5 }}>
                    <Description fontSize="large" color="primary" />
                    <Typography variant="body2">Document</Typography>
                    <Button size="small" onClick={() => window.open(fileURL, "_blank")}>
                      Preview
                    </Button>
                  </Box>
                )}

                <IconButton
                  onClick={() => handleRemoveFile(file, fileType)}
                  sx={{ position: "absolute", top: 5, right: 5, background: "#fff" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid2>
          );
        })}
      </Grid2>
    </Box>

    {/* Buttons */}
    <Box mt={2} display="flex" justifyContent="flex-end">
      <Button onClick={handleClosedam} variant="outlined" sx={{ marginRight: 1 }} disabled={loadingdam}>
        Cancel
      </Button>
      <Button variant="contained" color="primary" onClick={() => handleUploaddam(formData)} disabled={loadingdam}>
        Upload {newFiles.image_list.length + newFiles.video_list.length + newFiles.attachment_list.length} Files
      </Button>
    </Box>
  </Box>
</Modal>

    </div>  
    </div>
  );
};

export default Dam;
