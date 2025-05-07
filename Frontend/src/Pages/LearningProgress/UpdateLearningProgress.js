import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../../Components/SideBar/SideBar';
import styles from './UpdateLearningProgress.module.css';

function UpdateLearningProgress() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    skillTitle: '',
    description: '',
    field: '',
    startDate: '',
    endDate: '',
    level: '',
    postOwnerID: '',
    postOwnerName: ''
  });

  useEffect(() => {
    fetch(`http://localhost:8080/learningProgress/${id}`)
      .then((response) => response.json())
      .then((data) => setFormData(data))
      .catch((error) => console.error('Error fetching learning progress data:', error));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/learningProgress/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Learning Progress updated successfully!');
        window.location.href = '/allLearningProgress';
      } else {
        alert('Failed to update Learning Progress.');
      }
    } catch (error) {
      console.error('Error updating learning progress:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebarWrapper}>
        <SideBar />
      </div>
      <div className={styles.contentSection}>
        <div className={styles.formContainer}>
          <p className={styles.heading}>Update Learning Progress</p>
          <form
            onSubmit={(e) => {
              handleSubmit(e);
              setFormData({
                skillTitle: '',
                description: '',
                field: '',
                startDate: '',
                endDate: '',
                level: '',
                postOwnerID: formData.postOwnerID,
                postOwnerName: formData.postOwnerName,
              });
            }}
            className={styles.form}
          >
            <div className={styles.formGroup}>
              <label className={styles.label}>Title</label>
              <input
                className={styles.input}
                name="skillTitle"
                placeholder="Skill Title"
                value={formData.skillTitle}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Field</label>
              <select
                className={styles.select}
                name="field"
                value={formData.field}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Field</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Programming Language">Programming Language</option>
                <option value="Backend Development">Backend Development</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Quality Assurance">Quality Assurance</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Start Date</label>
              <input
                className={styles.input}
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>End Date</label>
              <input
                className={styles.input}
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  const { name, value } = e.target;
                  if (new Date(value) < new Date(formData.startDate)) {
                    alert("End date cannot be earlier than start date.");
                    return;
                  }
                  handleChange(e);
                }}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Level</label>
              <input
                type='number'
                className={styles.input}
                name="level"
                placeholder="Level"
                value={formData.level}
                onChange={(e) => {
                  const { name, value } = e.target;
                  if (value < 0 || value > 100) {
                    alert("Level must be between 0 and 100.");
                    return;
                  }
                  handleChange(e);
                }}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Update</button>
          </form >
        </div >
      </div >
    </div >
  );
}

export default UpdateLearningProgress;
