import { useParams, useNavigate } from 'react-router-dom'; 
import { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import './CategoryDetail.css';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
const CategoryDetail = () => {
    const { id } = useParams();  // Get the category id from the URL
    const navigate = useNavigate(); // Initialize navigate function
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attributes, setAttributes] = useState([]); // For storing attributes list
    const [selectedAttributes, setSelectedAttributes] = useState([]); // For storing selected attributes
    const [configId, setConfigId]= useState([]);
    // Fetch attributes for checkbox options
    const fetchCategoryDetails = async () => {
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/obtainCategory/`, { level: 0 });
            if (response.data && response.data.data && response.data.data.category_levels) {
                const categoryLevels = response.data.data.category_levels;

                // Recursive function to search for the category in children or deeper levels
                const findCategory = (categories, categoryId) => {
                    for (let category of categories) {
                        if (category.id === categoryId) {
                            return category;
                        }
                        if (category.children && category.children.length > 0) {
                            const foundCategory = findCategory(category.children, categoryId);
                            if (foundCategory) return foundCategory;
                        }
                    }
                    return null;
                };
                const foundCategory = findCategory(categoryLevels, id);
                console.log(foundCategory,'foundCategory');
                
                console.log(foundCategory.config_id,'foundCategory');
                setConfigId(foundCategory.config_id);
                // try {
                //     const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainAttribute/?module=category&&id=${foundCategory.config_id}`);
                //     if (response.data && response.data.data && response.data.data.attribute_list) {
                //         setAttributes(response.data.data.attribute_list);
                //     }
                // } catch (error) {
                //     console.error('Error fetching attribute data:', error);
                // }
                if (foundCategory) {
                    setCategory(foundCategory);
                      
                    // Preselect the attributes if they exist in the category's attribute_list
                    // const preselectedAttributes = foundCategory.attribute_list.map(attr => attr.id);
                    // setSelectedAttributes(preselectedAttributes); // Set previously selected attributes
                } else {
                    console.error('Category not found!');
                }
            } else {
                console.error('Invalid response structure:', response.data);
            }
        } catch (error) {
            console.error('Error fetching category details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAttribute = () => {
        // Initial value container to keep track of added attribute values
        let attributeValues = [];

        Swal.fire({
          title: 'Add Attribute',
          html: `
            <div>
              <input id="name" class="swal2-input" autocomplete="off" placeholder="Attribute name" style="margin: 0px 0px 10px 0px; font-size: 16px;width:100%;" required>
              <input id="code" class="swal2-input" autocomplete="off" placeholder="Attribute code" style="margin: 0px 0px 10px 0px; font-size: 16px; width:100%;">
              <select id="type" class="swal2-input" style="margin: 0px 0px 10px 0px; font-size: 16px; border-color: #c5c5c5; border-radius: 3px; color:#c5c5c5;width:100%;">
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
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
          cancelButtonText: 'Cancel',
          preConfirm: async () => {
            const name = document.getElementById('name').value;
            const code = document.getElementById('code').value;
            const type = document.getElementById('type').value;

            // Get all the attribute values
            const allValues = attributeValues;

            // Validation check
            if (!name || !code || !type || allValues.length === 0) {
              Swal.showValidationMessage('Please fill all fields and add at least one attribute value');
              return false;
            }

            try {
              // Sending data to API using axios
              const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createAttribute/`, {
                id: configId,
                name,
                code,
                type,
                values: allValues,
                module_name:'category', // Send the values as an array
              });

              // Check the response from the API
              if (response.data.data.is_created === true) {
                Swal.fire('Success!', 'New attribute added successfully.', 'success');
                fetchCategoryDetails();
              } else if (response.data.data.is_created === false) {
                Swal.fire({ title: 'Warning!', text: 'This attribute is already present.', icon: 'warning', confirmButtonText: 'OK'  });  
                 fetchCategoryDetails();
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
          title: 'Enter New Value',
          input: 'text',
          inputLabel: 'New Attribute Value',
          inputPlaceholder: 'Enter value',
          showCancelButton: true,
          confirmButtonText: 'Add Value',
          cancelButtonText: 'Cancel',
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
              id: configId,
              module_name:'category',
              name: attributeName,
              new:newValue,
            });
      
            if (response.status === 200) {
              // If the value is successfully added, update the UI
              Swal.fire('Success!', 'New value added successfully.', 'success');
              // For example, call a function to update the state or reload attributes.
            }
          } catch (error) {
            console.error('Error adding value:', error);
            Swal.fire('Error!', 'There was an issue adding the value. Please try again later.', 'error');
          }
        }
      };
    // Fetch category details by matching the category id
   

    // Handle category update and send selected attributes to categoryUpdate API
    const handleCategoryUpdate = async () => {
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/categoryUpdate/`, {
                update_obj: {
                    id: id,
                    config_id: category.config_id,
                    name: category.name,
                    attribute_list: selectedAttributes,
                }
            });
            if (response.data.data.is_updated === true) {
              Swal.fire({
                          title: 'Success!',
                          text: 'Category updated successfully.',
                          icon: 'success',
                          confirmButtonText: 'OK',
                        })
            }
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    // UseEffect for loading category data
    useEffect(() => {
        fetchCategoryDetails();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!category) {
        return <div>Category not found.</div>;
    }
    const handleBackToCategoryList = () => {
        navigate('/Admin/categories');
      };
    return (
        <div className="category-detail">
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop:'10px' }}>
              <button onClick={handleBackToCategoryList} className="back-button" style={{ marginRight: '10px', display: 'flex', alignItems: 'center', padding:'8px 12px', borderRadius:'23px' }}>
                <FontAwesomeIcon icon={faArrowLeft} />  <span className="back-vendor-text">Category List</span>  </button>
              <h2 style={{ flexGrow: 1, textAlign: 'center', margin: '0px' }}> {category.name}</h2>
            </div>
            <div className="panels-container">
                <div className="left-panel">
                    <h4>Taxonomy: {category.levels_str}</h4>
                    <form onSubmit={(e) => { e.preventDefault(); handleCategoryUpdate(); }}>
                        <label>
                            Category Name:
                            <input
                                type="text"
                                autoComplete="off"
                                value={category.name}
                                onChange={(e) => setCategory({ ...category, name: e.target.value })}
                            />
                        </label>

                        <button type="submit">Save Changes</button>
                    </form>
                </div>

                <div className="right-panel">
                    {/* <h3>Category Attributes <button className="add-attribute-btn" onClick={handleAddAttribute}>Add Attribute</button></h3>
                    <form>
    {attributes.map((attribute) => (
      <div
        key={attribute.id}
        style={{
          padding: '10px',
          border: '2px solid #ccc',
          borderRadius: '10px',
        }}
      >
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
  </form> */}
                </div>
            </div>
        </div>
    );
};

export default CategoryDetail;
