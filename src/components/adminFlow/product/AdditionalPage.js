import React, { useState, useEffect,useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft,faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import Select from 'react-select';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete Icon from Material UI

const AdditionalPage = ({ isSidebarOpen, toggleSidebar })  => {
        const [loading, setLoading] = useState(false); // Add loading state
        useEffect(() => {
          if (isSidebarOpen) {
            const timer = setTimeout(() => {
              toggleSidebar();  // Close the sidebar after 10 seconds
            }, 2000);  // 10 seconds timeout
      
            // Cleanup the timer if the component is unmounted before the timer ends
            return () => clearTimeout(timer);
          }
        }, [isSidebarOpen, toggleSidebar]);
    const [activeTab, setActiveTab] = useState('attribute');
    const navigate = useNavigate();    
    const { productId } = useParams();
    const [companyOptions, setCompanyOptions] = useState([]);  
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);  
    const [selectedRowIndex, setSelectedRowIndex] = useState(null); 
    const [newCategoryName, setNewCategoryName] = useState("");

    const [formData, setFormData] = useState({
        category_id: [], // This will hold the selected categories
        attribute_list: [],
        category_group_list:[],
        attachment_list: [],  image_list: [],  video_list: [], 
        // Other form fields...
    });
  const inputRef = useRef(null);
  const [inputStyle, setInputStyle] = useState({
        color: 'transparent', // Initially set to transparent
        textAlign: 'center',
        background: 'none',
        cursor: 'pointer',
      });
    const fetchProductDetails = async () => {
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainProductDetails/?id=${productId}`);
            const productData = response.data.data || {};
            console.log('productData',productData);
            
            setFormData(productData);
        } catch (error) {
            console.error('Error fetching ProductDetails:', error);
            Swal.fire({ title: 'Error!', text: 'Failed to load ProductDetails.', icon: 'error', confirmButtonText: 'OK' });
        }
    };
    useEffect(() => {
        fetchProductDetails();
    }, [productId]);
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
    const resetInputValue = () => {
        if (inputRef.current) {
            inputRef.current.value = "";  // Reset the input value using ref
        }
    };
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleSubmit = async (event) => { 
        event.preventDefault();
    console.log(formData,'formData');
    
        // Prepare the data object for the API request
        const formDataToSend = new FormData();
    
        // Append all images to FormData if available
        if (formData.image_list && formData.image_list.length > 0) {
          formData.image_list.forEach((file) => {
            formDataToSend.append('images', file);  // Using 'images[]' for array-like submission
          });
        }
      
        // Append all videos to FormData if available
        if (formData.video_list && formData.video_list.length > 0) {
          formData.video_list.forEach((file) => {
            formDataToSend.append('videos', file);  // Using 'videos[]' for array-like submission
          });
        }
      
        // Append all documents to FormData if available
        if (formData.attachment_list && formData.attachment_list.length > 0) {
          formData.attachment_list.forEach((file) => {
            formDataToSend.append('documents', file);  // Using 'documents[]' for array-like submission
          });
        }
        // Append the product ID
        formDataToSend.append('id', formData.id);  // Include product ID
    
        // Check if any files (images, videos, or documents) are selected
        if (formDataToSend.has('images') || formDataToSend.has('videos') || formDataToSend.has('documents')) {
            // If there are files, call updateFilesIntoProduct API
            setLoading(true);
            try {
                const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/updateFilesIntoProduct/`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });                
                if (response.data.data.is_upload === true) {
                  setInputStyle({
                    color: 'black', // Change text color to black when files are selected
                    textAlign: 'center',
                    background: 'none',
                    cursor: 'pointer',
                  });
                    resetInputValue();
                    Swal.fire({ title: 'Success!', text: 'Product updated successfully.', icon: 'success', confirmButtonText: 'OK' }).then(() => {  navigate('/Admin/products'); });
                    fetchProductDetails();
                    // setUnsavedChanges(false); 
                } else {
                    Swal.fire({ title: 'Error!', text: 'Failed to update product.', icon: 'error', confirmButtonText: 'OK' });
                }
            } catch (error) {
                console.error('Error updating product:', error);
                Swal.fire({ title: 'Error!', text: 'Failed to update product.', icon: 'error', confirmButtonText: 'OK' });
            } finally {
                setLoading(false);
            }
        } else if (!formData.name || !formData.sku || !formData.mpn || formData.category_id.length === 0) {
            // If required fields are missing, show an error
            Swal.fire({ title: 'Error!', text: 'Please fill all required fields.', icon: 'error', confirmButtonText: 'OK' });
        } else {
            // If no files are selected, submit regular product data without files
            const productData = {
                update_obj: {
                    id: productId,// Assuming formData.id contains the product ID
                    ...formData,  // Spread formData to include all updated fields
                }
            };
    
            try {
                const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/productUpdate/`, productData);
                if (response.data.data.is_updated === true) {
                    Swal.fire({ title: 'Success!', text: 'Product updated successfully.', icon: 'success', confirmButtonText: 'OK' }).then(() => {  navigate('/Admin/products'); });
                } else {
                    Swal.fire({ title: 'Error!', text: 'Failed to update product.', icon: 'error', confirmButtonText: 'OK' });
                }
            } catch (error) {
                console.error('Error updating product:', error);
                Swal.fire({ title: 'Error!', text: 'Failed to update product.', icon: 'error', confirmButtonText: 'OK' });
            }
        }
    };
    const handleAddAttribute = (event) => {
        event.preventDefault();
        // Initial value container to keep track of added attribute values
        let attributeValues = [];
      
        Swal.fire({
          title: 'Add Attribute',
          html: `
            <div>
              <input id="name" class="swal2-input" autocomplete="off" placeholder="Attribute name" style="margin: 0px 0px 10px 0px; font-size: 16px;width:100%;" required>
              <select id="type" class="swal2-input" style="margin: 0px 0px 10px 0px; font-size: 16px; border-color: #c5c5c5; border-radius: 3px; color:#c5c5c5;width:100%;">
            <option value="text">Text</option>
            <option value="integer">Integer</option>
            <option value="string">String</option>
            <option value="decimal">Decimal</option>
            <option value="boolean">Boolean</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="json">Json</option>
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
          reverseButtons:true,
          showCancelButton: true, 
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
      
              // Check the response from the API
              if (response.data.data.is_created === true) {
                Swal.fire('Success!', 'New attribute added successfully!', 'success');
                fetchProductDetails();
              } else if (response.data.data.is_created === false) {
                Swal.fire({ title: 'Warning!', text: 'This attribute is already present.', icon: 'warning', confirmButtonText: 'OK'  }); fetchProductDetails();
            }else {
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
      
            if (response.data.data.is_created === true) {
              Swal.fire('Success!', 'New value added successfully!', 'success');
              fetchProductDetails();
            } else if (response.data.data.is_created === false) {
             Swal.fire({ title: 'Warning!', text: 'This attribute value is already present.', icon: 'warning', confirmButtonText: 'OK'  });  fetchProductDetails(); 
                        }
          } catch (error) {
            console.error('Error adding value:', error);
            Swal.fire('Error!', 'There was an issue adding the value. Please try again later.', 'error');
          }
        }
      };
      const openCategoryPopup = (index) => {
              if (!formData.category_group_list[index].b2c_company_id) {
                Swal.fire('Error', 'Please select a company before adding a category.', 'error');
                return;
              }
              setSelectedRowIndex(index);
              setShowCategoryPopup(true);
            };
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
          if (response.data.data.is_deleted === true) {
            Swal.fire({ title: 'Success!', text: 'Category Removed Successfully.', icon: 'success', confirmButtonText: 'OK' });
          }
          console.log('Category group removed successfully:', response.data);
        } catch (error) {
          console.error('Error removing category group:', error);
        }
      };
      const removeRow = async (index, b2c_company_id) => {
        // Show confirmation dialog
        const isConfirmed = window.confirm("Are you sure you want to delete this category group?");
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
      const addCategory = async (event) => {
        event.preventDefault();
        if (!newCategoryName.trim()) {
          Swal.fire('Error', 'Category name cannot be empty.', 'error');
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
      
          if (response.data.data.is_created === true) {
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
            Swal.fire('Error', 'Failed to add category.', 'error');
          }
        } catch (error) {
          console.error('Error adding category:', error);
          Swal.fire('Error', 'Failed to add category.', 'error');
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
          confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              // Make the POST request to delete the file from the backend
              const response = await axiosInstance.get(
                `${process.env.REACT_APP_IP}/removemedia/?name=${fileName}&&id=${productId}&&action=${type}`
              );      
              if (response.data.data.is_delete === true) {
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
      };
    const handleBackToProductList = () => {
        navigate('/Admin/products');  // Adjust the path to match your brand list route
    };
    const handleCancel = (event) => {
        // Open confirmation popup
        event.preventDefault();
        Swal.fire({
            title: 'Are you sure you want to leave?',
            text: 'Cancel without creating attributes, group of category or images, videos.',
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
                    <li className="product-back-button" onClick={handleBackToProductList}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Product List
                    </li>
                    <li className={activeTab === 'images-videos' ? 'active' : ''} onClick={() => handleTabClick('images-videos')}>Digital Assets</li>
                    <li className={activeTab === 'group-of-category' ? 'active' : ''} onClick={() => handleTabClick('group-of-category')}>Group Of Category</li>
                    <li className={activeTab === 'attribute' ? 'active' : ''} onClick={() => handleTabClick('attribute')}>Attribute</li>
                   
                   
                </ul>
            </div>

            <div className="right-container-product" style={{ minHeight:  activeTab === 'description'   ? '255vh'   : activeTab === 'images-videos'  ? '135vh'  : 'auto',}} >
                <form onSubmit={handleSubmit}>
                {activeTab === 'attribute' && (
                            <section>
                                <h2>Attributes <button className="add-attribute-btn" onClick={(event) => handleAddAttribute(event)}> Add </button></h2>
                                <div>
                                    <form>
                                    {formData.attribute_list.map((attribute) => (
                                         <div
                                         key={attribute.id}
                                         style={{  padding: '10px',  border: '2px solid #ccc',  borderRadius: '10px',  margin:' 0px 0px 5px 0px' }} >
                               <h4 style={{margin:'0px 0px 7px 0px'}}>{attribute.name}</h4>
                        <div className="category-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                {attribute.values.map((value, index) => (
                                                    <span key={index} className="category-tag" style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#a52be4', border: '1px solid #ddd' }}>
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
                                                    }}
   >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </form>

                            </div>
                        </section>
                    )}
{activeTab === 'group-of-category' && (
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
        <button onClick={(event) => addCategory(event)}>Add</button>
      </div>
    </div>
  </div>
)}
  </section>
)}
                  {activeTab === 'images-videos' && (
  <section>
    <h2>Digital Assets</h2>

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
                    <div className={`create-product-submit-button ${isSidebarOpen ? 'product-detail-open' : 'product-detail-closed'}`}>
                        <button type="button" className='cancel_btn'  onClick={(event) => handleCancel(event)} >Cancel</button>
                        <button type="submit" className='submit_btn'>Update</button>
                    </div>
                </form>
            </div>
        </div>
        </div>
    );
};

export default AdditionalPage;
