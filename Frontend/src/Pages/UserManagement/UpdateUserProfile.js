import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../../Components/SideBar/SideBar';
import { Plus, X } from 'lucide-react'; // Importing Lucide icons
import styles from './UpdateUserProfile.module.css';

function UpdateUserProfile() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8080/user/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => setFormData(data))
      .catch((error) => console.error('Error:', error));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput('');
    }
  };

  const handleDeleteSkill = (index) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: updatedSkills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Profile updated successfully!');
        window.location.reload();
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <SideBar />
      <div className={styles.contentSection}>
        <div className={styles.formContainer}>
          <h1 className={styles.heading}>Update User Profile</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                className={styles.input}
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <input
                className={styles.input}
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => {
                  const re = /^[0-9\b]{0,10}$/;
                  if (re.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                maxLength="10"
                pattern="[0-9]{10}"
                title="Please enter exactly 10 digits."
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Skills</label>
              <div className={styles.skillsContainer}>
                {formData.skills.map((skill, index) => (
                  <span className={styles.skillTag} key={index}>
                    {skill}
                    <X 
                      className={styles.deleteSkill} 
                      onClick={() => handleDeleteSkill(index)}
                      size={16} // Lucide icon size prop
                    />
                  </span>
                ))}
              </div>
              <div className={styles.skillInputContainer}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Add Skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
                <Plus 
                  className={styles.addButton} 
                  onClick={handleAddSkill}
                  size={20} // Lucide icon size prop
                />
              </div>
            </div>
            <button type="submit" className={styles.submitButton}>
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUserProfile;