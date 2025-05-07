import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Image as ImageIcon, Video as VideoIcon, X, Plus, Send, Type, FileText, Loader } from 'lucide-react';
import SideBar from '../../Components/SideBar/SideBar';
import './AddNewPost.css';

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const userID = localStorage.getItem('userID');
  const [isLoading, setIsLoading] = useState(false);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024;

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            return;
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }

      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      return;
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      return;
    }

    setMedia(files);
    setMediaPreviews(previews);
  };

  const removeMedia = (index) => {
    const newMedia = [...media];
    const newPreviews = [...mediaPreviews];
    
    newMedia.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setMedia(newMedia);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    media.forEach((file) => formData.append('mediaFiles', file));

    try {
      setIsLoading(true);
      await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Failed to create post.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-post-container">
      <SideBar />
      <div className="add-post-content">
        <div className="add-post-card">
          <div className="add-post-header">
            <Plus size={24} />
            <h1>Create New Post</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="add-post-form">
            <div className="form-group">
              <label className="form-label">
                <Type size={18} />
                Post Title
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter an engaging title for your post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <FileText size={18} />
                Description
              </label>
              <textarea
                className="form-textarea"
                placeholder="Write your post content here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
              />
            </div>

            <div className="media-upload-section">
              <label className="media-upload-label" htmlFor="media-upload">
                <Upload size={24} />
                <div className="media-upload-text">
                  <strong>Click to upload</strong> or drag and drop
                  <br />
                  Images or videos (max 5 files)
                </div>
              </label>
              <input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                style={{ display: 'none' }}
              />

              {mediaPreviews.length > 0 && (
                <div className="media-preview-grid">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="media-preview-item">
                      {preview.type.startsWith('image/') ? (
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                        />
                      ) : (
                        <video
                          src={preview.url}
                          muted
                          loop
                          onMouseOver={e => e.target.play()}
                          onMouseOut={e => e.target.pause()}
                        />
                      )}
                      <button
                        type="button"
                        className="media-remove-btn"
                        onClick={() => removeMedia(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="form-btn form-btn-secondary"
                onClick={() => window.location.href = '/allPost'}
              >
                <X size={18} />
                Cancel
              </button>
              <button 
                type="submit" 
                className={`form-btn form-btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={18} />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddNewPost;