import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, X, FileText, Tag, Globe, AlertCircle, Loader, ArrowLeft, BookOpen } from 'lucide-react';
import './LearningSystem.css';
import SideBar from '../../Components/SideBar/SideBar';

function AddLeariningPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      if (errors.tags) setErrors({...errors, tags: ''});
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');
    
    // Validate form
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!contentURL.trim()) newErrors.contentURL = 'Content URL is required';
    if (tags.length < 2) newErrors.tags = 'Please add at least two tags';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/'); 
      return;
    }
    
    setIsSubmitting(true);
    const newPost = { title, description, contentURL, tags, postOwnerID, postOwnerName }; 
    
    try {
      await axios.post('http://localhost:8080/learningSystem', newPost);
      navigate('/learningSystem/allLearningPost');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="learning-container">
      <SideBar />
      <main>
        <div className="learning-header">
          <div className="learning-header-content">
            <button 
              className="learning-back-btn" 
              onClick={() => navigate('/learningSystem/allLearningPost')}
            >
              <ArrowLeft size={18} />
              Back to Posts
            </button>
            <h1 className="learning-title">Create Learning Post</h1>
            <p className="learning-subtitle">Share your knowledge with the community</p>
          </div>
        </div>
        
        <div className="learning-form">
          <div className="learning-form-header">
            <h2 className="learning-form-title">New Learning Post</h2>
            <p className="learning-form-subtitle">Share valuable resources with your peers</p>
          </div>
          
          <form onSubmit={handleSubmit} className="learning-form-content">
            <div className="learning-form-group">
              <label className="learning-label">
                <BookOpen size={18} />
                Title
              </label>
              <input
                type="text"
                className={`learning-input ${errors.title ? 'error' : ''}`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({...errors, title: ''});
                }}
                placeholder="Enter a descriptive title for your post"
                required
              />
              {errors.title && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.title}
                </div>
              )}
            </div>

            <div className="learning-form-group">
              <label className="learning-label">
                <Globe size={18} />
                Content URL
              </label>
              <input
                type="url"
                className={`learning-input ${errors.contentURL ? 'error' : ''}`}
                value={contentURL}
                onChange={(e) => {
                  setContentURL(e.target.value);
                  if (errors.contentURL) setErrors({...errors, contentURL: ''});
                }}
                placeholder="https://example.com/article"
                required
              />
              {errors.contentURL && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.contentURL}
                </div>
              )}
              <small className="learning-input-help">YouTube links will be embedded automatically</small>
            </div>

            <div className="learning-form-group">
              <label className="learning-label">
                <Tag size={18} />
                Tags
              </label>
              <div className={`learning-tags ${errors.tags ? 'error' : ''}`}>
                {tags.map((tag, index) => (
                  <div key={index} className="learning-tag">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(index)} 
                      className="learning-tag-remove"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="learning-tags-input">
                <input
                  type="text"
                  className="learning-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button 
                  type="button" 
                  onClick={handleAddTag} 
                  className="learning-btn-secondary"
                >
                  Add
                </button>
              </div>
              {errors.tags && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.tags}
                </div>
              )}
              <small className="learning-input-help">Add at least 2 tags to categorize your post</small>
            </div>

            <div className="learning-form-group">
              <label className="learning-label">
                <FileText size={18} />
                Description
              </label>
              <textarea
                className={`learning-textarea ${errors.description ? 'error' : ''}`}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({...errors, description: ''});
                }}
                placeholder="Write a detailed description of this learning resource"
                rows={5}
                required
              />
              {errors.description && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.description}
                </div>
              )}
            </div>

            <div className="learning-form-actions">
              <button 
                type="button" 
                className="learning-btn learning-btn-secondary"
                onClick={() => navigate('/learningSystem/allLearningPost')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="learning-btn learning-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="learning-loading-spinner" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Create Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddLeariningPost;