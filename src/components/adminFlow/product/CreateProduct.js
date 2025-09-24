import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './CreateProduct.css';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill'; // Import the Quill editor
import 'react-quill/dist/quill.snow.css'; // Import Quill's styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete Icon from Material UI
const CreateProduct = ({ isSidebarOpen, toggleSidebar }) => {
    // State variables
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
    const inputRef = useRef(null);
     const [inputStyle, setInputStyle] = useState({
          color: 'transparent', // Initially set to transparent
          textAlign: 'center',
          background: 'none',
          cursor: 'pointer',
        });
            const [loading, setLoading] = useState(false); // Add loading state
        
    const [attributeList, setAttributeList] = useState([]);
    const [activeTab, setActiveTab] = useState('basic-info');
    const [productid, setProductid] = useState('');
    const [productName, setProductName] = useState('');
    const [sku, setSku] = useState('');
    const [upc, setUPC] = useState('');
    const [mpn, setMpn] = useState('');
    const [ean, setEan] = useState('');
    const [unspc, setUnspc] = useState('');
    const [model, setModel] = useState('');
    const [gtin, setGtin] = useState('');
    const [brand, setBrand] = useState('');
    const [vendor, setVendor] = useState('');
    const [category, setCategory] = useState('');
    const [expanded, setExpanded] = useState({});
    const [selectedCategories, setSelectedCategories] = useState({});
    const [selectedCategoriesids, setSelectedCategoriesIds] = useState({});
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState("");
    const [manufacturer, setManufacturer] = useState('');
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState([]);
    const [attachment, setAttachment] = useState([]);
    const [brands, setBrands] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [shortDescription, setShortDescription] = useState('');
    const [personalizedShortDescription, setPersonalizedShortDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');
    const [personalizedLongDescription, setPersonalizedLongDescription] = useState('');
    const [features, setFeatures] = useState('');
    const [attributes, setAttributes] = useState('');
    const [serviceWarranty, setServiceWarranty] = useState('');
    const [productWarranty, setProductWarranty] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [msrp, setMSRP] = useState('');
    const [currency, setCurrency] = useState('');
    const [certifications, setCertifications] = useState('');
    const [application, setApplication] = useState('');
    const [esg, setESG] = useState('');
    const [hazardous, setHazardous] = useState('');
    const [compliance, setCompliance] = useState('');
    const [prop65, setProp65] = useState('');
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [variants, setVariants] = useState([{ name: '', value: '' }]);
    const [parentCategoryId, setParentCategoryId] = useState("");
    const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [categoryError, setCategoryError] = useState("");
        const [minHeight, setMinHeight] = useState("125vh");  // Set initial min-height to 125vh
     const [formData, setFormData] = useState({  attachment_list: [],  image_list: [],  video_list: []});
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
      const handleTextareaChange = (e) => {
        const { value } = e.target;
    
        // If the first line does not start with '*' (on typing), prepend the bullet point.
        if (e.key !== 'Enter' && !value.startsWith('•') && value.trim()) {
            setFeatures('•' + value);
            return;
        }
    
        // Handling space key press (to add a space after the word)
        if (e.key === ' ') {
            e.preventDefault(); // Prevent default space action
            const cursorPosition = e.target.selectionStart;
            const updatedValue = value.slice(0, cursorPosition) + ' ' + value.slice(cursorPosition);
            setFeatures(updatedValue);
        }
        // Handling enter key press (inserting list item)
        else if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default Enter action
            const cursorPosition = e.target.selectionStart;
            const updatedValue = value.slice(0, cursorPosition) + '\n•' + value.slice(cursorPosition);
            setFeatures(updatedValue);
        }
    };
    const handlePaste = (e) => {
        e.preventDefault();  // Prevent the default paste behavior
        const pastedText = e.clipboardData.getData('text');
        const pastedLines = pastedText.split('\n').map(line => line.trim());  // Split the pasted text by newlines and trim each line
    
        const cursorPosition = e.target.selectionStart;
        const currentTextBeforeCursor = e.target.value.slice(0, cursorPosition);
        const currentTextAfterCursor = e.target.value.slice(cursorPosition);
    
        // Prepend '*' to each pasted line and join them back with newline
        const formattedText = pastedLines.map(line => `•${line}`).join('\n');
    
        // Update the textarea with the formatted pasted content
        const updatedValue = currentTextBeforeCursor + '\n' + formattedText + currentTextAfterCursor;
        setFeatures(updatedValue);
    };
        
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
    const handleCountryChange = (event) => {
        setSelectedCountry(event.target.value);
      };
    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { name: '', value: '' }]);
    };
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/obtainCategory/`, { level: 0 });
            setCategories(response.data.data.category_levels);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
       useEffect(() => {
            fetchCategories();
        }, []);
    
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
    const toggleSelect = (id, name, config_id) => {
        setSelectedCategories(prev => {
            const updatedSelectedCategories = { ...prev };

            if (updatedSelectedCategories[id]) {
                delete updatedSelectedCategories[id]; // Unselect
            } else {
                updatedSelectedCategories[id] = { name, config_id }; // Select with _ids
            }

            return updatedSelectedCategories;
        });

        // Extract selected category ids and names
        const selectedIds = Object.values(selectedCategories).flatMap(cat => cat.config_id);
        const selectedNames = Object.values(selectedCategories).map(cat => cat.name);

        setSelectedCategoriesIds(config_id);
        setSelectedCategoryName(name);

        console.log("Selected Categories:", {
            category_config_id_list: selectedIds,
            category_config_name: selectedNames
        });
    };

    const handleAddCategoryClick = (event) => {
        event.preventDefault();
        setIsAddCategoryPopupOpen(true);
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

    const handleCancelCategory = (event) => {
        event.preventDefault();
        setIsAddCategoryPopupOpen(false);
        setNewCategoryName("");
        setParentCategoryId("");
        setCategoryError("");
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
    // const checkDuplicateCategory = async () => {
    //     if (newCategoryName.trim()) {
    //         try {
    //             const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/findDuplicateCategory/?search=${newCategoryName}`);
    //             if (response.data.data.error === true) {
    //                 setCategoryError('Category name must be unique within the same parent.');
    //             } else {
    //                 setCategoryError('');
    //             }
    //         } catch (error) {
    //             console.error('Error checking for duplicate category:', error);
    //         }
    //     } else if (newCategoryName.length === 0) {
    //         setCategoryError('');
    //     }
    // };
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
    const handleCategoryNameBlur = async() => {
        await checkDuplicateCategory();
    };

    const renderCategories = (category) => (
        <div key={category.id} style={{ marginLeft: category.children.length > 0 ? "20px" : "49px", marginBottom:'3px' }}>
            <div>
                {category.children.length > 0 && (
                    <button onClick={(event) => toggleExpand(event, category.id)} style={{ marginRight: "5px" }}>
                        {expanded[category.id] ? "−" : "+"}
                    </button>
                )}
                <input
                    type="checkbox"
                    className="category_checkbox"
                    checked={!!selectedCategories[category.id]}
                    onChange={() => toggleSelect(category.id, category.name, category.config_id)}
                    style={{ marginRight: "5px" }}
                />
                <span>{category.name}</span>
            </div>
            {expanded[category.id] && category.children.map(renderCategories)}
        </div>
    );
    
    
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
               const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainVendor/?search=`);
                setVendors(response.data.data.vendor_list || []);
            } catch (error) {
                console.error('Error fetching Vendors :', error);
                Swal.fire({ title: 'Error!', text: 'Failed to load brands.', icon: 'error', confirmButtonText: 'OK', });
                return; // Exit if the business types cannot be fetched
            }
            try {
                const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBrand/?search=`);
                setBrands(response.data.data.brand_list || []);
            } catch (error) {
                console.error('Error fetching brands:', error);
                Swal.fire({ title: 'Error!', text: 'Failed to load brands.', icon: 'error', confirmButtonText: 'OK', });
                return; // Exit if the business types cannot be fetched
            }
            try {
                const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainManufacture/`);
                setManufacturers(response.data.data.manufacture_list || []);
             } catch (error) {
                 console.error('Error fetching Manufactures :', error);
                 Swal.fire({ title: 'Error!', text: 'Failed to load Manufactures.', icon: 'error', confirmButtonText: 'OK', });
                 return; // Exit if the business types cannot be fetched
             }
        };
        fetchDropdownData();
    }, []);
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
      const clearProductData = () => {
        setProductid('');
        setProductName('');
        setSku('');
        setUPC('');
        setMpn('');
        setEan('');
        setUnspc('');
        setModel('');
        setGtin('');
        setBrand('');
        setVendor('');
        setCategory('');
        setManufacturer('');
        setImages([]);
        setVideo([]);
        setAttachment([]);
        setShortDescription('');
        setPersonalizedShortDescription('');
        setLongDescription('');
        setPersonalizedLongDescription('');
        setFeatures('');
        setAttributes('');
        setServiceWarranty('');
        setProductWarranty('');
        setSellingPrice('');
        setDiscountPrice('');
        setMSRP('');
        setCurrency('');
        setCertifications('');
        setApplication('');
        setESG('');
        setHazardous('');
        setCompliance('');
        setProp65('');
        setCountries([]);
        setSelectedCountry('');
        setVariants([{ name: '', value: '' }]);
        setSelectedCategoryName('');
        setSelectedCategoriesIds('');
    };
    const handleCancel = (event) => {
        // Open confirmation popup
        event.preventDefault();
        Swal.fire({
            title: 'Are you sure you want to leave?',
            text: 'Without creating a product.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, leave',
            cancelButtonText: 'No, stay',
            reverseButtons:true
        }).then((result) => {
            if (result.isConfirmed) {
                navigate(`/Admin/products`);
            }
        });
    };
      const handleSubmit = async (event) => {
        setLoading(true);
        event.preventDefault();
        if (!productName || !sku || !brand || Object.keys(selectedCategories).length === 0) {     
            setLoading(false);       
            Swal.fire({
            title: 'Error!',
            text: 'Product name, SKU, Brand and category selection cannot be empty.',
            icon: 'error',
            confirmButtonText: 'OK'
        })
        return; // Prevent form submission if validation fails
    }    
    const productData = new FormData();
     console.log(formData,'formData');
     
    // Append all the form data fields to FormData
    productData.append('product_id', productid);
    productData.append('mpn', mpn);
    productData.append('sku', sku);
    productData.append('upc', upc);
    productData.append('ean', ean);
    productData.append('gtin', gtin);
    productData.append('unspc', unspc);
    productData.append('model', model);
    productData.append('config_id', selectedCategoriesids);
    productData.append('category_config_name', selectedCategoryName);
    productData.append('breadcrumb', '');
    productData.append('name', productName);
    productData.append('short_description', shortDescription);
    productData.append('personalized_short_description', personalizedShortDescription);
    productData.append('long_description', longDescription);
    productData.append('personalized_long_description', personalizedLongDescription);
    productData.append('feature_list', features);
    productData.append('attribute_list', JSON.stringify(attributeList));
    productData.append('related_products', []);  // This can be handled differently if needed
    productData.append('application', application);
    productData.append('certifications', certifications);
    productData.append('Compliance', compliance);
    productData.append('Prop65', prop65);
    productData.append('esg', esg);
    productData.append('Hazardous', hazardous);
    productData.append('service_warranty', serviceWarranty);
    productData.append('product_warranty', productWarranty);
    productData.append('country_of_origin', selectedCountry);
    productData.append('currency', currency);
    productData.append('msrp', msrp);
    productData.append('selling_price', sellingPrice);
    productData.append('discount_price', discountPrice);
    
    if (formData.attachment_list.length > 0) {
        formData.attachment_list.forEach(file => productData.append('documents', file));
    }
    
    // Append images
    if (formData.image_list.length > 0) {
        formData.image_list.forEach(file => productData.append('images', file));
    }
    
    // Append videos
    if (formData.video_list.length > 0) {
        formData.video_list.forEach(file => productData.append('videos', file));
    }
  
    // Add vendor and brand information
    productData.append('vendor_id', vendor);
    productData.append('brand_id', brand);
    productData.append('manufacture_id', manufacturer);
        try {
            const response = await axiosInstance.post(`${process.env.REACT_APP_IP}/createProduct/`, productData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Make sure the correct content-type is set
                }
            });
                        if ( response.data.data.is_created === true) {
                            setInputStyle({
                                color: 'transparent', 
                                textAlign: 'center',
                                background: 'none',
                                cursor: 'pointer',
                              });
                              setLoading(false);
                Swal.fire({
                    title: 'Product Created!',
                    text: 'The product has been successfully created.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                })
                    .then((result) => {
                        clearProductData();
                        if (result.isConfirmed) {
                            navigate(`/Admin/products/`);
                        }
                    });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'There was an error creating the product. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                }).then(() => {
                    clearProductData();
                });
            }
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };
    const handleBackToProductList = () => {
        navigate('/Admin/products');  // Adjust the path to match your brand list route
      };
      
    // Trigger Swal popup for adding attributes
    const openAddAttributePopup = (event) => {
        event.preventDefault();
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
                    <button id="add-value-btn" style="font-size: 16px; background-color: #a52be4; color: white; float: right; border-radius: 5px; padding: 8px 16px; border: none; cursor: pointer; margin-top: 10px;">
                        Add Value
                    </button>
                    <div id="added-values-tags" style="margin-top: 15px;"></div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            reverseButtons: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Save',
            didOpen: () => {
                document.getElementById('add-value-btn').addEventListener('click', () => {
                    const valueInput = document.getElementById('attribute-value');
                    const newValue = valueInput.value.trim();

                    if (newValue && !attributeValues.includes(newValue)) {
                        attributeValues.push(newValue);
                        const tag = document.createElement('span');
                        tag.textContent = newValue;
                        tag.style.backgroundColor = '#e2e2e2';
                        tag.style.padding = '5px 10px';
                        tag.style.margin = '5px';
                        tag.style.borderRadius = '5px';
                        tag.style.display = 'inline-block';
                        tag.style.fontSize = '14px';
                        tag.style.cursor = 'pointer';

                        const removeIcon = document.createElement('span');
                        removeIcon.textContent = ' X';
                        removeIcon.style.color = 'red';
                        removeIcon.style.cursor = 'pointer';
                        removeIcon.style.marginLeft = '10px';
                        tag.appendChild(removeIcon);
                        document.getElementById('added-values-tags').appendChild(tag);
                        valueInput.value = '';
                        removeIcon.addEventListener('click', () => {
                            tag.remove();
                            attributeValues = attributeValues.filter(val => val !== newValue);
                        });
                    } else if (attributeValues.includes(newValue)) {
                        Swal.fire('Warning!', 'This value already exists.', 'warning');
                    } else {
                        Swal.fire('Error!', 'Please enter a valid attribute value.', 'error');
                    }
                });
            },
            preConfirm: () => {
                const name = document.getElementById('name').value.trim();
                const type = document.getElementById('type').value.trim();
                if (!name || !type || attributeValues.length === 0) {
                    Swal.showValidationMessage('Please fill all fields and add at least one attribute value');
                    return false;
                }
                setAttributeList(prevAttributes => [...prevAttributes, { name, values: attributeValues }]);
            }
        });
    };
    const handleAddValue = async (attributeName) => {
        if (!attributeName) return;
    
        const { value: newValue } = await Swal.fire({
            title: "New Attribute Value",
            input: "text",
            inputPlaceholder: "Enter value",
            showCancelButton: true,
            confirmButtonText: "Add",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            inputAttributes: {
                autocomplete: "off",
            },
            inputValidator: (value) => {
                if (!value) {
                    return "Please enter a value!";
                }
            },
        });
    
        if (newValue) {
            setAttributeList((prevAttributes) =>
                prevAttributes.map((attr) =>
                    attr.name === attributeName
                        ? {
                              ...attr,
                              values: attr.values.includes(newValue) ? attr.values : [...attr.values, newValue], // Retain old values and append new one
                          }
                        : attr
                )
            );
        }
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
              // Make the POST request to delete the file from the backend
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
                setInputStyle({
                    color: 'transparent', 
                    textAlign: 'center',
                    background: 'none',
                    cursor: 'pointer',
                  });        // Show success alert
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
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
                    <li className="product-back-button" onClick={handleBackToProductList}><FontAwesomeIcon icon={faArrowLeft} /> Product List</li>
                    <li  className={activeTab === 'basic-info' ? 'active' : ''}  onClick={() => handleTabClick('basic-info')} >  Basic Information  </li>
                    <li className={activeTab === 'description' ? 'active' : ''}  onClick={() => handleTabClick('description')} > Overview </li>
                    {/* <li className={activeTab === 'custom-fields' ? 'active' : ''} onClick={() => handleTabClick('custom-fields')} > Custom Fields </li> */}
                    <li className={activeTab === 'images-videos' ? 'active' : ''}  onClick={() => handleTabClick('images-videos')} >  Digital Assets </li>
                    <li className={activeTab === 'attribute' ? 'active' : ''} onClick={() => handleTabClick('attribute')} > Attributes </li>

                    {/* <li className={activeTab === 'variations' ? 'active' : ''} onClick={() => handleTabClick('variations')} > Variations </li> */}
                    <li className={activeTab === 'pricing' ? 'active' : ''} onClick={() => handleTabClick('pricing')} > Pricing </li>
                    <li className={activeTab === 'warranty' ? 'active' : ''} onClick={() => handleTabClick('warranty')} > Warranty </li>
                    <li className={activeTab === 'others' ? 'active' : ''} onClick={() => handleTabClick('others')} > Others </li>
                </ul>
            </div>

            <div className="right-container-product" style={{ minHeight: activeTab === 'description' ? '255vh' : minHeight  }}>
                <form onSubmit={handleSubmit}>
                    {activeTab === 'basic-info' && (
                        <section className="basic-info-section">
                            <h2>Basic Information</h2>
                            <div className="two-column-layout">
                                <div>
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="input_pdps"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>MPN </label>
                                    <input
                                     className="input_pdps"
                                     autoComplete="off"
                                        type="text"
                                        value={mpn}
                                        onChange={(e) => setMpn(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>SKU *</label>
                                    <input
                                    autoComplete="off"
                                       className="input_pdps"
                                        type="text"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>UPC</label>
                                    <input
                                    autoComplete="off"
                                    className="input_pdps"
                                        type="text"
                                        value={upc}
                                        onChange={(e) => setUPC(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>Product ID</label>
                                    <input
                                    autoComplete="off"
                                    className="input_pdps"
                                        type="text"
                                        value={productid}
                                        onChange={(e) => setProductid(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>EAN</label>
                                    <input
                                    autoComplete="off"
                                    className="input_pdps"
                                        type="text"
                                        value={ean}
                                        onChange={(e) => setEan(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>UNSPC</label>
                                    <input
                                    autoComplete="off"
                                    className="input_pdps"
                                        type="text"
                                        value={unspc}
                                        onChange={(e) => setUnspc(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>Model</label>
                                    <input
                                    autoComplete="off"
                                    className="input_pdps"
                                        type="text"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>Vendor</label>
                                    <select className='create_product_select input_pdps select-back'
                                        value={vendor}
                                        onChange={(e) => setVendor(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Vendor</option>
                                        {vendors.map((vendorOption, index) => (
                                            <option key={index} value={vendorOption.id}>
                                                {vendorOption.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Brand *</label>
                                    <select className='create_product_select input_pdps select-back'
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((brandOption, index) => (
                                            <option key={index} value={brandOption.id}>
                                                {brandOption.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",margin:'0px 0px 6px 0px'  }}>
                <label>Categories *</label>
                
                <button onClick={(event) => handleAddCategoryClick(event)} className="add-category-btn">Add</button>
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
                            id="categoryName"
                            autoComplete="off"
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

                        <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'space-between', margin: '0 auto', width:'26%',padding:'10px 0px 0px 0px'  }}>
                            <button onClick={(event) => createCategory(event)} className='category_btn' disabled={categoryError} style={{ flex: 1, borderRadius:'20px'}}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
                                <div>
                                    <label>Manufacturer</label>
                                    <input
                                            type="text"
                                            autoComplete="off"
                                            id="manufacturer"
                                            name="manufacturer_id"
                                            value={manufacturer}
                                            onChange={(e) => setManufacturer(e.target.value)}
                                            className="product_detail_input input_pdps"
                                            placeholder="Enter Manufacturer Name"
                                        />
                                </div>
                            </div>
                        </section>
                    )}
                    {activeTab === 'description' && (
                        <section>
                        <h2>Overview</h2>
                        <div>
                                <label>Features</label>
                                <textarea
                                className="input_pdps"
                                    value={features}
                                    onChange={(e) => setFeatures(e.target.value)}
                                    onKeyDown={(e) => handleTextareaChange(e)}    // Handle key press (space, enter) for bullet points
                                    onPaste={(e) => handlePaste(e)}        
                                    rows="4"
                                    required
                                ></textarea>
                            </div>
                        {/* Short Description */}
                        <div>
                          <label>Short Description</label>
                          <ReactQuill style={{  marginBottom: '15px',   minHeight: '100px',  maxHeight: '300px',  overflowY: 'auto', overflowX: 'auto',  }}
                                name="short_description"
                                className={`${isSidebarOpen ? 'product-detail-open-desc' : 'product-detail-closed-desc'}`}
                            value={shortDescription}
                            onChange={setShortDescription}
                            theme="snow"
                            placeholder="Enter short description"
                            modules={modules}
                            formats={formats}
                          />
                        </div>
                
                        {/* Personalized Short Description */}
                        <div>
                          <label>Personalized Short Description</label>
                          <ReactQuill style={{  marginBottom: '15px',   minHeight: '100px',  maxHeight: '300px',  overflowY: 'auto',   overflowX: 'auto', }}
                                name="personalized_short_description"
                            className={`${isSidebarOpen ? 'product-detail-open-desc' : 'product-detail-closed-desc'}`}
                            value={personalizedShortDescription}
                            onChange={setPersonalizedShortDescription}
                            theme="snow"
                            placeholder="Enter personalized short description"
                            modules={modules}
                            formats={formats}
                          />
                        </div>
                
                        {/* Long Description */}
                        <div>
                          <label>Long Description</label>
                          <ReactQuill style={{  marginBottom: '15px',   minHeight: '100px',  maxHeight: '300px',  overflowY: 'auto',   overflowX: 'auto',  }}
                                name="long_description"
                                className={`${isSidebarOpen ? 'product-detail-open-desc' : 'product-detail-closed-desc'}`}
                            value={longDescription}
                            onChange={setLongDescription}
                            theme="snow"
                            placeholder="Enter long description"
                            modules={modules}
                            formats={formats}
                          />
                        </div>
                
                        {/* Personalized Long Description */}
                        <div>
                          <label>Personalized Long Description</label>
                          <ReactQuill  style={{  marginBottom: '15px',   minHeight: '100px',  maxHeight: '300px',  overflowY: 'auto',   overflowX: 'auto',  }}
                                name="personalized_long_description"
                                className={`${isSidebarOpen ? 'product-detail-open-desc' : 'product-detail-closed-desc'}`}
                            value={personalizedLongDescription}
                            onChange={setPersonalizedLongDescription}
                            theme="snow"
                            placeholder="Enter personalized long description"
                            modules={modules}
                            formats={formats}
                          />
                        </div>
                      </section>
                    )}
                    {activeTab === 'custom-fields' && (
                        <section>
                            <h2>Custom Fields</h2>
                            <div>
                                <label>Attributes</label>
                                <textarea
                                className="input_pdps"
                                    value={attributes}
                                    onChange={(e) => setAttributes(e.target.value)}
                                    rows="4"
                                    required
                                ></textarea>
                            </div>
                        </section>
                    )}
                    {activeTab === 'images-videos' && (
  <section>
    <h2>Digital Assets</h2>

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
                     {activeTab === 'attribute' && (
                 <section>
                 <h2>Attributes  <button className="add-attribute-btn" onClick={(event) => openAddAttributePopup(event)} > Add   </button></h2>
                 {attributeList.map((attribute, index) => (
                    <div   style={{  padding: '10px',  border: '2px solid #ccc',  borderRadius: '10px',  margin:' 0px 0px 5px 0px' }}>
                    <div key={index} >
                        <h4 style={{margin:'0px 0px 7px 0px'}}> {attribute.name}</h4>
                        <div className="category-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {attribute.values.map((value, valueIndex) => (
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
                    </div>
                ))}
             </section>
            )}
                    {activeTab === 'warranty' && (
                        <section>
                            <h2>Warranty</h2>
                            <div>
                                <label>Service Warranty</label>
                                <textarea
                                className="input_pdps"
                                    value={serviceWarranty}
                                    onChange={(e) => setServiceWarranty(e.target.value)}
                                    rows="4"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label>Product Warranty</label>
                                <textarea
                                className="input_pdps"
                                    value={productWarranty}
                                    onChange={(e) => setProductWarranty(e.target.value)}
                                    rows="4"
                                    required
                                ></textarea>
                            </div>
                        </section>
                    )}

                    {activeTab === 'pricing' && (
                        <section>
                            <h2>Pricing</h2>
                            <div>
                                <label>Selling Price</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Discount Price</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={discountPrice}
                                    onChange={(e) => setDiscountPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>MSRP</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={msrp}
                                    onChange={(e) => setMSRP(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Currency</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                />
                            </div>
                        </section>
                    )}
                    {/* {activeTab === 'variations' && (
                        <section>
                            <h2>Variations</h2>
                            {variants.map((variant, index) => (
                                <div key={index}>
                                    <label>Variant Name</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="input_pdps"
                                        value={variant.name}
                                        onChange={(e) =>
                                            handleVariantChange(index, 'name', e.target.value)
                                        }
                                        required
                                    />
                                    <label>Variant Value</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="input_pdps"
                                        value={variant.value}
                                        onChange={(e) =>
                                            handleVariantChange(index, 'value', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            ))}
                            <button type="button" className='add_variant_btn' onClick={addVariant}>
                                Add Variant
                            </button>
                        </section>
                    )} */}
                     {activeTab === 'others' && (
                        <section>
                            <h2>Others</h2>
                            <div>
                                <label>Certifications</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={certifications}
                                    onChange={(e) => setCertifications(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Application</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={application}
                                    onChange={(e) => setApplication(e.target.value)}
                                />
                            </div>
                            <div>
                                    <label>GTIN</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="input_pdps"
                                        value={gtin}
                                        onChange={(e) => setGtin(e.target.value)}
                                    />
                                </div>
                            <div>
                                <label>ESG</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={esg}
                                    onChange={(e) => setESG(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Hazardous</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={hazardous}
                                    onChange={(e) => setHazardous(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Compliance</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={compliance}
                                    onChange={(e) => setCompliance(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Prop65</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="input_pdps"
                                    value={prop65}
                                    onChange={(e) => setProp65(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Country Of Origin</label>
                                <select  className='create_product_select input_pdps select-back'
                                    id="country"
                                    value={selectedCountry}
                                    onChange={handleCountryChange}
                                    required
                                >
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
                    <button type="submit" className='cancel_btn' onClick={(event) => handleCancel(event)} >  Cancel  </button>
                        <button type="submit" className='submit_btn' onClick={handleSubmit} > Create </button>
                    </div>
                </form>
            </div>
        </div>
        </div>
    );
};

export default CreateProduct;
