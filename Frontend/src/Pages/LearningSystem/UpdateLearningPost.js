import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Tag, FileText, Globe, X, Loader, AlertCircle } from 'lucide-react';
import './LearningSystem.css';
import SideBar from '../../Components/SideBar/SideBar';

function UpdateLearningPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/learningSystem/${id}`);
        const { title, description, contentURL, tags } = response.data;
        setTitle(title);
        setDescription(description);
        setContentURL(contentURL);
        setTags(tags || []);
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to load post data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      if (errors.tags) {
        setErrors({...errors, tags: ''});
      }
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!contentURL.trim()) newErrors.contentURL = 'Content URL is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (tags.length === 0) newErrors.tags = 'At least one tag is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    const updatedPost = { title, description, contentURL, tags };
    
    try {
      await axios.put(`http://localhost:8080/learningSystem/${id}`, updatedPost);
      alert('Post updated successfully!');
      navigate('/learningSystem/allLearningPost');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading && !title) {
    return (
      <div className="learning-container">
        <SideBar />
        <main>
          <div className="learning-loading">
            <Loader size={36} className="learning-loading-spinner" />
            <p>Loading post data...</p>
          </div>
        </main>
      </div>
    );
  }

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
            <h1 className="learning-title">Update Learning Post</h1>
            <p className="learning-subtitle">Refine your content and make it even better</p>
          </div>
        </div>
        
        <div className="learning-form">
          <form onSubmit={handleSubmit} className="learning-form-content">
            <div className="learning-form-group">
              <label className="learning-label">
                <FileText size={18} />
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
                placeholder="Enter post title"
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
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {errors.tags && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.tags}
                </div>
              )}
              <div className="learning-tags-input">
                <input
                  type="text"
                  className="learning-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
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
                rows={5}
                placeholder="Write a detailed description of this learning resource"
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
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Update Post</span>
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

export default UpdateLearningPost;