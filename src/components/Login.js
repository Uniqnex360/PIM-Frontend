import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import Swal from 'sweetalert2';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
const Login = () => {
  const [user_name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}/loginUser/`, {
        user_name,
        password,
      });

      if (response.data.data.valid) {
        localStorage.setItem('user_login_id', response.data.data.user_login_id);
        localStorage.setItem('user_role', response.data.data.user_role);
        localStorage.setItem('user_name', response.data.data.name);
        if (response.data.data.user_role === "admin" || response.data.data.user_role === "client-user"){
        navigate("/Admin");}
        else if (response.data.data.user_role === "superadmin"){
        navigate("/SuperAdmin");}
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Invalid name or password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password submit
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (newPassword !== confirmPassword) {
      setOtpError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}/resetPassword/`, {
        otp,
        email,
        newPassword,
      });

      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Password updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        setShowForgotPassword(false);
        setOtpSent(false);
      } else if (response.data.error === 'Invalid Verification Code') {
        setOtpError('Invalid Verification Code. Please try again.');
      } else if (response.data.error === 'Verification Code has expired') {
        setOtpError('Code has expired. Please request a new one.');
      } else {
        setOtpError('An error occurred while resetting your password');
      }
    } catch (err) {
      setOtpError('An error occurred while resetting your password');
      console.error(err);
    }
  };

  // Handle email submission to send Verification Code
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setLoadingEmail(true);

    if (!email) {
      setEmailError('Please enter a valid email');
      setLoadingEmail(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}/sendOtp/`, { email });
      if (response.data.status) {
        setOtpSent(true);
      } else {
        setEmailError('Failed to send Verification Code, please try again');
      }
    } catch (err) {
      setEmailError('An error occurred while sending Verification Code');
      console.error(err);
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
          {/* <img 
            src="https://kmdigicommerce.com/wp-content/uploads/2024/08/KM-2048x1976.png" 
            alt="KM Digi Commerce" 
            className="logo" 
          /> */}
        <h2 className="login-h2">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="one">
            <label className="label-login" htmlFor="email">User Name</label>
            <input
              className="label-input"
              type="text"
              id="email"
              autoComplete="off"
              value={user_name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="one">
      <label className="label-login" htmlFor="password">
        Password
      </label>
      <div className="password-input-container">
        <input
          className="label-input"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </span>
      </div>
    </div>
          <button className="button-login" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="forgot-password" onClick={() => setShowForgotPassword(true)}>
          Forgot Password?
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="forgot-password-modal">
          <div className="modal-content-reset-password">
            <button
              className="close-x-modal"
              onClick={() => {
                setShowForgotPassword(false);
                setOtpSent(false);
              }}
            >
              &times;
            </button>

            {!otpSent ? (
              <>
                <h3>Enter Your Email</h3>
                <form onSubmit={handleEmailSubmit}>
                  <div className="one">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button className="button" type="submit" disabled={loadingEmail}>
                    {loadingEmail ? 'Sending...' : 'Send Verification Code'}
                  </button>
                  {emailError && <p className="error-message">{emailError}</p>}
                </form>
              </>
            ) : (
              <>
                <h3>Reset Your Password</h3>
                <form onSubmit={handleForgotPasswordSubmit}>
                  <div className="one">
                    <label htmlFor="otp">Verification Code</label>
                    <input
                      type="text"
                      id="otp"
                      autoComplete="off"
                      value={otp || ''}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="one">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      autoComplete="off"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="one">
                    <label htmlFor="confirmPassword">Re-enter Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      autoComplete="off"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button className="button" type="submit">
                    Submit
                  </button>
                  {otpError && <p className="error-message">{otpError}</p>}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
