import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserLogin.module.css';
import GoogleLogo from './img/glogo.png';

function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), 
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userID', data.id); 
        alert('Login successful!');
        navigate('/learningSystem/allLearningPost'); 
      } else if (response.status === 401) {
        alert('Invalid credentials!'); 
      } else {
        alert('Failed to login!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.heroImage}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Let the journey begin!</h1>
            <p className={styles.heroSubtitle}>
              Unlock a world of education with a single click! Please login to your account.
            </p>
            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <span>24/7 Support</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <span>Secure Platform</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome Back!</h1>
            <p className={styles.subtitle}>Please enter your credentials to login</p>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordContainer}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
                <span className={styles.passwordToggle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </span>
              </div>
            </div>
            <button type="submit" className={styles.button}>Login</button>
            
            <div className={styles.socialLogin}>
              <div className={styles.divider}>or continue with</div>
              <button
                onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                className={styles.googleButton}
              >
                <img src={GoogleLogo} alt="Google logo" className={styles.googleIcon} />
                Sign in with Google
              </button>
            </div>
            
            <p className={styles.footer}>
              Don't have an account?{' '}
              <a href="/register" className={styles.link}>Sign up for free</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;