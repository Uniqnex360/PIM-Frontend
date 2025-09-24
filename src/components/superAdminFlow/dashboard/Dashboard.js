import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Pie } from 'react-chartjs-2'; // Import Doughnut chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement, // ArcElement is required for Doughnut chart
  Title,
  Tooltip,
  Legend, 
} from 'chart.js';
import { Box, Typography, CircularProgress } from "@mui/material";
import './Dashboard.css'; // Add your custom styles here
import axiosInstance from '../../../../src/utils/axiosConfig';
import { useNavigate} from 'react-router-dom';
import Modal from '@mui/material/Modal'; // Correct Modal import
import { FaBox, FaTags, FaUserTie } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement, // Register ArcElement
  Title,
  Tooltip,
  Legend
);

function Dashboard({ isSidebarOpen, toggleSidebar }) {
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
  const [distributionData, setDistributionData] = useState(null);
  const [completenessChartData, setCompletenessChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
   const [loader, setLoader] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [categoryTotal, setCategoryTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [parentCategories, setParentCategories] = useState([]); // Parent categories state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isModalOpenvendor, setIsModalOpenVendor] = useState(false); // Modal state
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    animation: {
      duration: 1500, // Duration for the chart animation
      easing: 'easeInOutQuad',
    },
  };

  useEffect(() => {
    setLoader(true);
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainDashboard/`);
        if (response.status === 401) {
          setUnauthorized(true);
        } else if (response.data) {
          const categories = response.data.data.parent_level_category_list;
          // setParentCategories(categories); // Set parent categories
          setDashboardData(response.data.data);
          setLoader(false);
          const { end_level, level1, level2, total } = response.data.data.category;
          setCategoryTotal(total); // Set total categories count
          // Set total to show in the UI        
          // Prepare chart data
          setDistributionData({
            labels: ['Level 1', 'Level 2', 'End Level'],
            datasets: [
              {
                label: 'Products by Level 1 Category',
                data: [level1, level2, end_level],
                backgroundColor: ['#4F8DFD', '#A0AEC0', '#4DC7B7'], // Add nice colors
                borderWidth: 1,
              },
            ],
          });
          const completenessData = response.data.data.product_completeness;

const completenessCounts = {};

completenessData.forEach(item => {
  const completeness = item.completeness;
  completenessCounts[completeness] = (completenessCounts[completeness] || 0) + 1;
});

// Sort completeness levels numerically
const sortedCompletenessKeys = Object.keys(completenessCounts)
  .map(Number)
  .sort((a, b) => a - b);

// Map each completeness level to a color
const colorMap = {
  25: '#FF4C4C',     // Red
  50: '#e8ac3f',     // Orange
  75: '#e8cb2c',     // Yellow
  100: '#4CAF50',    // Green
};

const completenessLabels = sortedCompletenessKeys.map(k => `${k}%`);
const completenessValues = sortedCompletenessKeys.map(k => completenessCounts[k]);

// Assign backgroundColor based on each completeness level
const backgroundColor = sortedCompletenessKeys.map(k => colorMap[k] || '#CCCCCC'); // fallback gray

setCompletenessChartData({
  labels: completenessLabels,
  datasets: [{
    label: 'Product Count By Completeness',
    data: completenessValues,
    backgroundColor,
    borderWidth: 1,
  }]
});

          const rawCategoryList = response.data.parent_category_list;

          // Clean, filter, and sort
          const filteredSortedList = rawCategoryList
            .filter(item => item.product_count > 0 && item.name && item.name !== '[Object Object]')
            .sort((a, b) => b.product_count - a.product_count);
          
          const labels = filteredSortedList.map(item => item.name);
          const values = filteredSortedList.map(item => item.product_count);
          
          // Set chart data
          setBarChartData({
            labels,
            datasets: [
              {
                label: 'Products by Parent Category',
                data: values,
                backgroundColor: '#42A5F5',
              },
            ],
          });
        }
      } catch (error) {
        setLoader(false);
        if (error.response && error.response.status === 401) {
          setUnauthorized(true);
        } else console.error('Error fetching dashboard data:', error);
      } finally {
        setLoader(false);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  const fetchVendors = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_IP}/obtainBrand/`);
      if (response.data) {
        setVendors(response.data.data.brand_list); // Adjust based on the actual structure of the response
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const handleVendorClick = () => {
    setIsModalOpenVendor(true);
    fetchVendors(); // Fetch vendors when the section is being displayed
  };
  const closeVendorModal = () => {
    setIsModalOpenVendor(false);
  };
  if (unauthorized) {
    navigate(`/unauthorized`);
  }
  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
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
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FaBox /></div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p>{dashboardData?.product_count ?? 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FaTags /></div>
          <div className="stat-content">
            <h3>Total Brands</h3>
            <p>{dashboardData?.brand_count ?? 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FaUserTie /></div>
          <div className="stat-content">
            <h3>Total Vendors</h3>
            <p>{dashboardData?.vendor_count ?? 0}</p>
          </div>
        </div>
      </div>
      {/* <div className="charts-section">
        <div className="chart-card">
          <h3>End Level Category - Products Count</h3>
          <Doughnut data={categoryData} options={options} />
        </div>
      </div> */}
 {/* Top Row: Product Data Completeness & Products by Parent Category */}
<Box
  sx={{
    display: 'flex',  
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: '21px',
    mt: 4,
  }}
>
  {/* Chart 1: Product Data Completeness */}
  <Box
    className="chart-box"
    sx={{
      maxWidth:  320,
      flex: `1 1 320px`,
    }}
  >
    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
      Product Data Completeness
    </Typography>

    {completenessChartData ? (
      <div
        style={{
          width: `320px`,
          height: `320px`,
        }}
      >
        <Pie
          data={completenessChartData}
          options={{
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 18,    
                  boxHeight: 18,   
                  borderRadius: 0, 
                },
              },
            },
          }}
        />
      </div>
    ) : (
      loader ? (
        <Typography sx={{ textAlign: 'center' }}>Loading data...</Typography>
      ) : (
        <Typography sx={{ textAlign: 'center' }}>No data available</Typography>
      )
    )}
  </Box>

  {/* Chart 2: Products by Parent Category */}
  <Box
    className="chart-box"
    sx={{
      maxWidth: isSidebarOpen? 500: 702,
      flex: `1 1 ${isSidebarOpen ? 500 : 702}px`,
    }}
  >
    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
      Products by Parent Category
    </Typography>

    {barChartData ? (
      <Bar
        data={barChartData}
        options={{
          indexAxis: 'x',
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              mode: 'nearest',
              intersect: false,
              callbacks: {
                label: function (context) {
                  return `Count: ${context.raw}`;
                },
              },
            },
          },
          hover: {
            mode: 'nearest',
            intersect: false,
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
              grid: {
                display: false,
              },
            },
          },
        }}
      />
    ) : (
      loader ? (
        <Typography sx={{ textAlign: 'center' }}>Loading data...</Typography>
      ) : (
        <Typography sx={{ textAlign: 'center' }}>No data available</Typography>
      )    )}
  </Box>
</Box>

{/* Bottom Row: Category Distribution */}
<Box
  className="chart-box"
  sx={{
    maxWidth: 320,
    margin: '32px 0',
    position: 'relative',
  }}
>
  <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
    Category Level Insights
  </Typography>

  {loading ? (
    <CircularProgress />
  ) : distributionData ? (
    <Doughnut
      data={distributionData}
      options={{
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw;
                return `${label}: ${value}`;
              },
            },
          },
          legend: {
            position: 'bottom',
             labels: {
            boxWidth: 18,    
            boxHeight: 18,   
            borderRadius: 0, 
          },
          },
         
        },
      }}
    />
  ) : (
    loader ? (
      <Typography sx={{ textAlign: 'center' }}>Loading data...</Typography>
    ) : (
      <Typography sx={{ textAlign: 'center' }}>No data available</Typography>
    )
  )}
</Box>

      <Modal open={isModalOpen} className="modal-content-dashboard" onClose={closeModal}>
        <div className="modal-container">
          <h2>Parent Level Categories</h2>
          <ul className="ulliclass">
            {parentCategories.length > 0 ? (
              parentCategories.map((category) => (
                <li key={category.id} className="ulliclass">
                  {category.name}
                </li>
              ))
            ) : (
              <p>No categories found.</p>
            )}
          </ul>
          <button onClick={closeModal} className="btn_dash">Close</button>
        </div>
      </Modal>
      <Modal open={isModalOpenvendor} className="modal-content-dashboard" onClose={closeVendorModal}>
        <div className="modal-container">
          <h2>Total Vendors</h2>
          <ul className="ulliclass">
            {vendors.length > 0 ? (
              vendors.map((vendor) => (
                <li key={vendor.id} className="ulliclass">
                  <div className="vendor-name">
                    <span>{vendor.name}</span>
                    <span className="product-count"> ({vendor.product_count} products)</span>
                  </div>
                </li>
              ))
            ) : (
              <p>No vendors found.</p>
            )}
          </ul>
          <button onClick={closeVendorModal} className="btn_dash">Close</button>
        </div>
      </Modal>
    </div>
    </div>
  );
}
export default Dashboard;