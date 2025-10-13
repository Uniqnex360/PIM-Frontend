import React, { useState, useEffect } from 'react'; 
import './Logs.css';
import axiosInstance from '../../../utils/axiosConfig';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useNavigate} from 'react-router-dom';

const Logs = ({ isSidebarOpen, toggleSidebar }) => {
  const [activeTab, setActiveTab] = useState('supplier');
  const [activeImportTab, setActiveImportTab] = useState('product_import'); // Default import tab
  const [activeExportTab, setActiveExportTab] = useState('product_export'); // Default export tab
  const [activevendorTab, setActiveVendorTab] = useState('supplier'); // Default export tab
  const [activebrandTab, setActiveBrandTab] = useState('brand'); // Default export tab
  const [activecategoryTab, setActiveCategoryTab] = useState('category'); // Default export tab
  const [activeattributeTab, setActiveAttributeTab] = useState('attribute'); // Default export tab
  const [unauthorized, setUnauthorized] = useState(false);
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
 const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        toggleSidebar();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, toggleSidebar]);

  useEffect(() => {
    setLogs([]);
    setLoader(true);
    setActiveImportTab('product_import'); 
setActiveExportTab('product_export'); 
setActiveVendorTab('supplier');
setActiveBrandTab('brand');
setActiveCategoryTab('category');
setActiveAttributeTab('attribute');
    fetchLogs(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setLoader(true);
    setLogs([]);
    if (activeTab === 'import') {
      fetchImportLogs(activeImportTab);
    } else if (activeTab === 'export') {
      fetchExportLogs(activeExportTab);
    }else if (activeTab === 'supplier') {
        console.log('inside useeffect if');
        fetchVendorLogs(activevendorTab);
      }else if (activeTab === 'brand') {
        fetchBrandLogs(activebrandTab);
      } else if (activeTab === 'category') {
        fetchCategoryLogs(activecategoryTab);
      } else if (activeTab === 'attribute') {
        fetchAttributeLogs(activeattributeTab);
      } 
  }, [activeImportTab, activeExportTab,activevendorTab,activebrandTab,activecategoryTab,activeattributeTab]);
const fetchLogs = async (tab) => {
    let apiEndpoint = {
        brand: 'obtainBrandLog',
        supplier: 'obtainVendorLog',
        category: 'obtainCategoryLog',
        product: 'obtainProductLog',
        attribute:'obtainAttributeLog',
    }[tab] || 'obtainVendorLog';
    
    if (tab === 'import') {
        fetchImportLogs(activeImportTab);
        return;
    }
    if (tab === 'export') {
        fetchExportLogs(activeExportTab);
        return;
    }
    if (tab === 'supplier') {
        fetchVendorLogs(activevendorTab);
        return;
    }
    if (tab === 'brand') {
        fetchBrandLogs(activebrandTab);
        return;
    }
    if (tab === 'category') {
        fetchCategoryLogs(activecategoryTab);
        return;
    }
    if (tab === 'attribute') {
        fetchAttributeLogs(activeattributeTab);
        return;
    }
    
    try {
     const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/${apiEndpoint}/`);
        console.log(`${tab} logs API Response:`, response.data); // Debug log
        
        if (response.status === 401) {
            setUnauthorized(true);
        } 
        const logKey = `${tab}_log_list`;
        setLoader(false);
        setLogs(response.data[logKey] || []); // Remove the extra .data layer
    } catch (error) {
        setLoader(false);
        if (error.response?.status === 401) {
            setUnauthorized(true);
        }
        console.error(`Error fetching ${tab} logs`, error);
    }
};

  const fetchImportLogs = async (importType) => {
    let apiEndpoint = 'obtainImportLog';

    let actionParam = {
        product_import: 'product',
        channel_import: 'channel',
        dam_import: 'dam',
    }[importType] || 'product';

    try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/${apiEndpoint}/?action=${actionParam}`);
        console.log(`${importType} import logs API Response:`, response.data); // Debug log
        
        setLoader(false);
        setLogs(response.data.import_log_list || []); // Remove the extra .data layer
        if (response.status === 401) {
            setUnauthorized(true);
        } 
    } catch (error) {
        setLoader(false);
        if (error.response?.status === 401) {
            setUnauthorized(true);
        }
        console.error(`Error fetching ${importType} logs`, error);
    }
};
const fetchVendorLogs = async (importType) => {
    console.log(importType,'importType supplier');
    let apiEndpoint = '';
    if (importType === 'import') {
        apiEndpoint = 'obtainImportLog';
    }
    if (importType === 'export') {
        apiEndpoint = 'obtainExportLog';
    }
    let actionParam = 'supplier';
    
    if (importType === 'supplier') {
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainVendorLog/`);
            console.log('Vendor logs API Response:', response.data); // Debug log
            
            if (response.status === 401) {
                setUnauthorized(true);
            } 
            setLoader(false);
            setLogs(response.data.vendor_log_list || []); // Remove the extra .data layer
        } catch (error) {
            setLoader(false);
            if (error.response?.status === 401) {
                setUnauthorized(true);
            } 
            console.error(`Error fetching ${importType} logs`, error);
        }
    } else {
       try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/${apiEndpoint}/?action=${actionParam}`);
            console.log(`Vendor ${importType} logs API Response:`, response.data); // Debug log
            
            if (response.status === 401) {
                setUnauthorized(true);
            } 
            setLoader(false);
            if (importType === 'import') {
                setLogs(response.data.import_log_list || []); // Remove the extra .data layer
            } else if (importType === 'export') {
                setLogs(response.data.export_log_list || []); // Remove the extra .data layer
            }
        } catch (error) {
            setLoader(false);
            if (error.response?.status === 401) {
                setUnauthorized(true);
            }
            console.error(`Error fetching ${importType} logs`, error);
        }
    }
};
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
  const fetchBrandLogs = async (importType) => {
    console.log(importType,'importType brand');
    let apiEndpoint = '';
    if (importType === 'import') {
        apiEndpoint = 'obtainImportLog';
    }
    if (importType === 'export') {
        apiEndpoint = 'obtainExportLog';
    }
    let actionParam = 'brand';
    
    if (importType === 'brand') {
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBrandLog/`);
            console.log('Brand logs API Response:', response.data); // Debug log
            
            const logKey = `${importType}_log_list`;
            setLoader(false);
            setLogs(response.data[logKey] || []); // Remove the extra .data layer
        } catch (error) {
            setLoader(false);
            if (error.response?.status === 401) {
                setUnauthorized(true);
            }
            console.error(`Error fetching ${importType} logs`, error);
        }
    } else {
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/${apiEndpoint}/?action=${actionParam}`);
            console.log(`Brand ${importType} logs API Response:`, response.data); // Debug log
            
            setLoader(false);
            if (importType === 'import') {
                setLogs(response.data.import_log_list || []); // Remove the extra .data layer
            } else if (importType === 'export') {
                setLogs(response.data.export_log_list || []); // Remove the extra .data layer
            }
        } catch (error) {
            setLoader(false);
            if (error.response?.status === 401) {
                setUnauthorized(true);
            }
            console.error(`Error fetching ${importType} logs`, error);
        }
    }
};
 
const fetchCategoryLogs = async (importType) => {
    console.log(importType,'importType Category');
    let apiEndpoint = '';
    if (importType === 'import') {
        apiEndpoint = 'obtainImportLog';
    }
    if (importType === 'export') {
        apiEndpoint = 'obtainExportLog';
    }
    let actionParam = 'category';
    
    if (importType === 'category') {
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainCategoryLog/`);
            console.log('Category logs API Response:', response.data); // Debug log
            
            const logKey = `${importType}_log_list`;
            setLogs(response.data[logKey] || []); // Remove the extra .data layer
            setLoader(false);
        } catch (error) {
            setLoader(false);
            if (error.response?.status === 401) {
                setUnauthorized(true);
            }
            console.error(`Error fetching ${importType} logs`, error);
        }
    } else {
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/${apiEndpoint}/?action=${actionParam}`);
            console.log(`Category ${importType} logs API Response:`, response.data); // Debug log
            
            setLoader(false);
            if (importType === 'import') {
                setLogs(response.data.import_log_list || []); // Remove the extra .data layer
            } else if (importType === 'export') {
                setLogs(response.data.export_log_list || []); // Remove the extra .data layer
            }
        } catch (error) {
            setLoader(false);
            if (error.response?.status === 401) {
                setUnauthorized(true);
            }
            console.error(`Error fetching ${importType} logs`, error);
        }
    }
};
const fetchAttributeLogs = async (importType) => {
    console.log(importType,'importType attribute');
    let apiEndpoint = '';
    if (importType === 'import') {
        apiEndpoint = 'obtainImportLog';
    }
    if (importType === 'export') {
        apiEndpoint = 'obtainExportLog';
    }
    let actionParam = 'attribute';
    
    if (importType === 'attribute') {
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainAttributeLog/`);
            console.log('Attribute logs API Response:', response.data); // Debug log
            
            const logKey = `${importType}_log_list`;
            setLogs(response.data[logKey] || []); // Remove the extra .data layer
            setLoader(false);
        } catch (error) {
            setLoader(false);
            if (error.response?.status === 401) {
                setUnauthorized(true);
            }
            console.error(`Error fetching ${importType} logs`, error);
        }
    } else {
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/${apiEndpoint}/?action=${actionParam}`);
            console.log(`Attribute ${importType} logs API Response:`, response.data); // Debug log
            
            setLoader(false);
            if (importType === 'import') {
                setLogs(response.data.import_log_list || []); // Remove the extra .data layer
            } else if (importType === 'export') {
                setLogs(response.data.export_log_list || []); // Remove the extra .data layer
            }
        } catch (error) {
            setLoader(false);
            if (error.response?.status === 401) {
                setUnauthorized(true);
            }
            console.error(`Error fetching ${importType} logs`, error);
        }
    }
};
const fetchExportLogs = async (exportType) => {
    let apiEndpoint = 'obtainExportLog';
    let actionParam = {
        product_export: 'product',
        channel_export: 'channel',
        // other_import: 'other',
    }[exportType] || 'product';

    try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/${apiEndpoint}/?action=${actionParam}`);
        console.log(`${exportType} export logs API Response:`, response.data); // Debug log
        
        setLoader(false);
        setLogs(response.data.export_log_list || []); // Remove the extra .data layer
    } catch (error) {
        setLoader(false);
        if (error.response?.status === 401) {
            setUnauthorized(true);
        }
        console.error(`Error fetching ${exportType} logs`, error);
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
  return (
    <div>
          {loader && (
        <div className="loader-overlay">
          <div className="spinner"></div> {/* Custom spinner */}
        </div>
      )}
    <div className="logs-container">
      <h1 className="logs-title">Logs</h1>
      
      <div className='oh-tabs'>
        <div className="tabs">
          {['supplier', 'brand', 'category', 'product','attribute', 'import','export'].map((tab) => ( 
            <button
              key={tab}
              className={`tab-button-log ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        {activeTab === 'import' && (
          <div className="tabs-one">
            {[ 
              { key: 'product_import', label: 'Product' },
              // { key: 'channel_import', label: 'Channel' },
              { key: 'dam_import', label: 'Dam' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`tab-button-log ${activeImportTab === key ? 'active' : ''}`}
                onClick={() => setActiveImportTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
{activeTab === 'supplier' && (
          <div className="tabs-one">
            {[ 
              { key: 'supplier', label: 'supplier' },
              { key: 'import', label: 'Import' },
              { key: 'export', label: 'Export' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`tab-button-log ${activevendorTab === key ? 'active' : ''}`}
                onClick={() => setActiveVendorTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {activeTab === 'brand' && (
          <div className="tabs-one">
            {[ 
              { key: 'brand', label: 'Brand' },
              { key: 'import', label: 'Import' },
              { key: 'export', label: 'Export' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`tab-button-log ${activebrandTab === key ? 'active' : ''}`}
                onClick={() => setActiveBrandTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {activeTab === 'category' && (
          <div className="tabs-one">
            {[ 
              { key: 'category', label: 'Category' },
              { key: 'import', label: 'Import' },
              { key: 'export', label: 'Export' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`tab-button-log ${activecategoryTab === key ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {activeTab === 'attribute' && (
          <div className="tabs-one">
            {[ 
              { key: 'attribute', label: 'Attribute' },
              { key: 'import', label: 'Import' },
              { key: 'export', label: 'Export' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`tab-button-log ${activeattributeTab === key ? 'active' : ''}`}
                onClick={() => setActiveAttributeTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {activeTab === 'export' && (
          <div className="tabs-one">
            {[ 
              { key: 'product_export', label: 'Product' },
              { key: 'channel_export', label: 'Channel' },
            //   { key: 'other_export', label: 'Other Export' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`tab-button-log ${activeExportTab === key ? 'active' : ''}`}
                onClick={() => setActiveExportTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="logs-content">
          <table className="logs-table">
            <thead>
              <tr>
                {activeTab === 'import' ? (
                  <>
                   <th>User</th>
                    <th>Sku(s)</th>
                    <th>{activeImportTab === 'channel_import'?'Total Records':' Total Products'} </th>
                    <th>{activeImportTab === 'dam_import' ?'Images/Videos/Documents':' Create/Update'} </th>
                    <th>In-Progress/Completed</th>
                    <th>Valid/Invalid</th>
                    <th>Status</th>
                    <th>Date/Time</th> 
                  </>
                ) : activeTab === 'export' ? (
                    <>
                      <th>User</th>
                      <th>Total Records</th>
                      <th>Date/Time</th>
                    </>
                  ):(activevendorTab === 'export' || activebrandTab === 'export' || activeattributeTab=== 'export' || activecategoryTab === 'export') ? (
                    <>
                      <th>User</th>
                      <th>Total Records</th>
                      <th>Date/Time</th>
                    </>
                  ):(activevendorTab === 'import' || activebrandTab === 'import' || activeattributeTab=== 'import' || activecategoryTab === 'import') ? (
                        <>
                         <th>User</th>
                    {activecategoryTab !== 'import' && (
  <th>{activeTab !== 'import' ? 'Name' : 'Sku(s)'}</th>
)}
                    <th>{activevendorTab === 'import' ? 'Total Suppliers': activebrandTab === 'import' ? 'Total Brands' : activecategoryTab === 'import' ? 'Total Records':activeattributeTab === 'import' ? 'Total Attributes' : 'Total Products'}</th>
                    <th>{activecategoryTab === 'import'?'Create':'Create/Update'}</th>
                    <th>In-Progress/Completed</th>
                    <th>Valid/Invalid</th>
                    <th>Status</th>
                    <th>Date/Time</th> 
                        </>
                      ):(
                  <>
                    <th>User</th>
                    <th>Action</th>
                    {activeTab === 'attribute' && (
                    <th>Module</th>
                    )}
                    <th>{activevendorTab === 'import' ? 'Total Suppliers':'Name'}</th>
                    {/* <th>{activeTab === 'brand' ? 'Brand Name' :
                      activeTab === 'vendor' ? 'Vendor Name' :
                      activeTab === 'category' ? 'Category Name' : 'Product Name'}</th> */}
                    <th>Date</th>
                    <th>Time</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
            {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr key={index}>
                    {activeTab === 'import' ? (
                                     <>
                                <td>{log.user_name}</td>
                                <td>
                                    {Array.isArray(log.created_id_list) && log.created_id_list.length > 0 ? (
                                        <>
                                            {/* Display first 2 SKUs */}
                                            {log.created_id_list.slice(0, 2).join(', ')}
                                            {/* Show +more if more than 2 items */}
                                            {log.created_id_list.length > 2 && (
                                                <span className="more-text"> +more</span>
                                            )}
                                            {/* Hover effect: Show full list of SKUs on hover */}
                                            <div className="sku-tooltip">
                                                {log.created_id_list.length > 2 && (
                                                    <div className="sku-tooltip-content">
                                                        {log.created_id_list.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        'No SKU(s)'
                                    )}
                                </td>
                                <td>{log.total_count}</td>
                                <td>{activeImportTab === 'dam_import' ?`${log.image_count}/${log.video_count}/${log.document_count}`:`${log.created_count}/${log.updated_count}`} </td>
                                <td>{log.inprogress_count}/{log.completed_count}</td> {/* Assuming this refers to In-Progress/Completed */}
                                <td>
 {log.un_error_count}  / <span  style={{ color: 'blue', cursor: 'pointer' }} onClick={() => downloadErrorList(log.data.error_list)} >  {log.error_count} </span> </td>
 <td>{log.status ? log.status.charAt(0).toUpperCase() + log.status.slice(1) : ''}</td>
                                <td>{log.date}|{log.time} </td>
                                  </>
                    ) : activeTab === 'export' ? (
                        <>
                                    <td>{log.user_name}</td>
                                    <td>{log.total_count}</td>
                                    {/* <td>{log.skus}</td>
                        <td>{log.total_products}</td>
                        <td>{log.error_unerror}</td> */}
                                <td>{log.date}|{log.time}</td>
                                </>
                            ) : (activevendorTab === 'export' || activebrandTab === 'export' || activeattributeTab=== 'export' || activecategoryTab === 'export') ? (
                                <>
                                            <td>{log.user_name}</td>
                                            <td>{log.total_count}</td>
                                            {/* <td>{log.skus}</td>
                                <td>{log.total_products}</td>
                                <td>{log.error_unerror}</td> */}
                                <td>{log.date}|{log.time}</td>
                                </>
                                    ) :(activevendorTab === 'import' || activebrandTab === 'import' || activeattributeTab=== 'import' || activecategoryTab === 'import' ) ? (
                                <>
                                    <td>{log.user_name}</td>
                                    {activecategoryTab !== 'import' && (
 <td className='fes'>
  {Array.isArray(log.created_id_list) && log.created_id_list.length > 0 ? (
    <>
      {/* Display first 2 SKUs */}
      {log.created_id_list.slice(0, 2).join(', ')}
      {/* Show +more if more than 2 items */}
      {log.created_id_list.length > 2 && (
        <span className="more-text"> +more</span>
      )}
      {/* Tooltip content that shows full SKUs on hover */}
      {log.created_id_list.length > 2 && (
        <div className="sku-tooltip">
          <div className="sku-tooltip-content">
            {log.created_id_list.join(', ')}
          </div>
        </div>
      )}
    </>
  ) : (
    'No SKU(s)'
  )}
</td>)}
                                    <td>{log.total_count}</td>
                                    <td>{activecategoryTab === 'import'  ? log.created_count : `${log.created_count}/${log.updated_count}`}</td>
                                    <td>{log.inprogress_count}/{log.completed_count}</td> {/* Assuming this refers to In-Progress/Completed */}
                                    <td> {log.un_error_count}/<span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => downloadErrorList(log.data.error_list)} >{log.error_count} </span></td>
                                    <td>{log.status ? log.status.charAt(0).toUpperCase() + log.status.slice(1) : ''}</td>
                                    <td>{log.date}|{log.time}</td>
                                    </>
                      ):(
                        <>
                        <td>{log.user_name}</td>
                        <td>{log.action}</td>
                        {activeTab === 'attribute' && (
                    <td>{log.module_name || 'N/A'}</td>
                    )}
                        <td>{log.brand_name || log.vendor_name || log.category_name || log.product_name|| log.attribute_name}</td>
                        <td>{log.date}</td>
                        <td>{log.time}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  {loader && (
                  <td colSpan={(activeTab === 'import'|| activevendorTab === 'import' || activebrandTab === 'import' || activeattributeTab=== 'import' || activecategoryTab === 'import' ) ? "8":(activeTab === 'export'|| activevendorTab === 'import' || activebrandTab === 'import' || activeattributeTab=== 'import' || activecategoryTab === 'import' ) ? "6" : "5"} className="no-logs">Loading logs</td>
                    
                  )}
                    {!loader && (
                      <td colSpan={(activeTab === 'import'|| activevendorTab === 'import' || activebrandTab === 'import' || activeattributeTab=== 'import' || activecategoryTab === 'import' ) ? "8":(activeTab === 'export'|| activevendorTab === 'import' || activebrandTab === 'import' || activeattributeTab=== 'import' || activecategoryTab === 'import' ) ? "6" : "5"} className="no-logs">No logs available.</td>
                    )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Logs;