import React, { useState } from 'react';
import { IoMdAdd } from "react-icons/io";
import styles from './UserRegister.module.css';

function UserRegister() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        skills: [],
    });
    const [skillInput, setSkillInput] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (!formData.email) {
            alert("Email is required");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert("Email is invalid");
            isValid = false;
        }

        if (formData.skills.length < 2) {
            alert("Please add at least two skills.");
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch('http://localhost:8080/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert('User registered successfully!');
                setFormData({ fullname: '', email: '', password: '', phone: '', skills: [] });
                window.location.href = '/';
            } else if (response.status === 409) {
                alert('Email already exists!');
            } else {
                alert('Failed to register user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authInnerContainer}>
                <div className={styles.authHero}>
                    <div className={styles.authHeroImage}></div>
                </div>
                <div className={styles.authFormContainer}>
                    <div className={styles.authLogo}></div>
                    <div className={styles.authHeader}>
                        <h1 className={styles.authTitle}>Create your account!</h1>
                    </div>
                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Full Name</label>
                            <input
                                className={styles.formInput}
                                type="text"
                                name="fullname"
                                placeholder="Full Name"
                                value={formData.fullname}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Email Address</label>
                            <input
                                className={styles.formInput}
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Password</label>
                            <input
                                className={styles.formInput}
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Phone</label>
                            <input
                                className={styles.formInput}
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
                            <label className={styles.formLabel}>Skills</label>
                            <div className={styles.skillsDisplay}>
                                {formData.skills.map((skill, index) => (
                                    <span className={styles.skillTag} key={index}>{skill}</span>
                                ))}
                            </div>
                            <div className={styles.skillInputContainer}>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="Add Skill"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                />
                                <IoMdAdd 
                                    onClick={handleAddSkill} 
                                    className={styles.addSkillButton} 
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.submitButton}>Register</button>
                        <p className={styles.authFooter}>
                            Already have an account?{' '}
                            <a href="/" className={styles.authLink}>Sign in</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UserRegister;