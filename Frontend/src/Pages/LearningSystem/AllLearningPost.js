import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SideBar from '../../Components/SideBar/SideBar';
import { 
  Edit3, 
  Trash2, 
  ThumbsUp, 
  Plus, 
  List, 
  User, 
  BookOpen, 
  FileText, 
  X, 
  Link, 
  Tag, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUp, 
  ExternalLink,
  Loader
} from 'lucide-react';
import './LearningSystem.css';

function AllLearningPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showingMyPosts, setShowingMyPosts] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    contentURL: '',
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() || selectedFilter !== "all") {
      filterPosts();
    } else if (showingMyPosts) {
      const myPosts = posts.filter((post) => post.postOwnerID === userId);
      setFilteredPosts(myPosts);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, selectedFilter, posts, showingMyPosts]);

    const fetchPosts = async () => {
    setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8080/learningSystem');
        setPosts(response.data);
      setFilteredPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    let result = posts;
    
    // Filter by owner if showing my posts
    if (showingMyPosts) {
      result = result.filter((post) => post.postOwnerID === userId);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        post => 
          post.title.toLowerCase().includes(query) || 
          post.description.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply tag filter
    if (selectedFilter !== "all") {
      result = result.filter(post => 
        post.tags && post.tags.some(tag => 
          tag.toLowerCase() === selectedFilter.toLowerCase()
        )
      );
    }
    
    setFilteredPosts(result);
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/learningSystem/${id}`);
        setPosts(posts.filter((post) => post.id !== id));
        setFilteredPosts(filteredPosts.filter((post) => post.id !== id));
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const handleUpdate = (id) => {
    window.location.href = `/learningSystem/updateLearningPost/${id}`;
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/learningSystem/${postId}/like`, null, {
        params: { userID },
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const filterMyPosts = () => {
    setShowingMyPosts(!showingMyPosts);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newPost.title.trim()) newErrors.title = 'Title is required';
    if (!newPost.description.trim()) newErrors.description = 'Description is required';
    if (newPost.tags.length === 0) newErrors.tags = 'At least one tag is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const postData = {
        ...newPost,
        postOwnerID: userId,
        postOwnerName: localStorage.getItem('userName'),
        createdAt: new Date().toISOString(),
        likes: {}
      };

      const response = await axios.post('http://localhost:8080/learningSystem', postData);
      setPosts([response.data, ...posts]);
      setFilteredPosts([response.data, ...filteredPosts]);
      setShowAddForm(false);
      setNewPost({ title: '', description: '', contentURL: '', tags: [] });
      setErrors({});
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !newPost.tags.includes(currentTag.trim())) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, currentTag.trim()]
      });
      setCurrentTag('');
      if (errors.tags) {
        setErrors({...errors, tags: ''});
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get all unique tags for filtering
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="learning-container">
          <SideBar />
      <main>
        <div className="learning-header">
          <div className="learning-header-content">
            <h1 className="learning-title">
              <BookOpen size={24} />
              Learning Resources
            </h1>
            <p className="learning-subtitle">
              Discover and share valuable learning materials with your team
            </p>
          </div>
          <div className="learning-actions">
            <button
              className="learning-btn learning-btn-secondary"
              onClick={filterMyPosts}
            >
              {showingMyPosts ? (
                <>
                  <List size={18} />
                  <span>All Posts</span>
                </>
              ) : (
                <>
                  <User size={18} />
                  <span>My Posts</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="learning-filters">
          <div className="learning-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by title, description or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="learning-search-input"
            />
            {searchQuery && (
          <button
                className="learning-search-clear" 
                onClick={() => setSearchQuery("")}
          >
                <X size={16} />
          </button>
            )}
          </div>
          
          <div className="learning-filter-dropdown">
            <label className="learning-filter-label">
              <Filter size={14} />
              <span>Filter by tag:</span>
            </label>
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="learning-filter-select"
            >
              <option value="all">All tags</option>
              {allTags.map((tag, index) => (
                <option key={index} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {showAddForm && (
          <div className="learning-form-overlay">
            <div className="learning-form">
              <div className="learning-form-header">
                <h2 className="learning-form-title">Create New Learning Post</h2>
                <p className="learning-form-subtitle">Share your knowledge with the community</p>
          <button
                  className="learning-close-btn"
                  onClick={() => setShowAddForm(false)}
                  aria-label="Close form"
          >
                  <X size={20} />
          </button>
              </div>
              <form onSubmit={handleAddPost} className="learning-form-content">
                <div className="learning-form-group">
                  <label className="learning-label">
                    <BookOpen size={18} />
                    Title
                  </label>
                  <input
                    type="text"
                    className={`learning-input ${errors.title ? 'error' : ''}`}
                    value={newPost.title}
                    onChange={(e) => {
                      setNewPost({ ...newPost, title: e.target.value });
                      if (errors.title) setErrors({...errors, title: ''});
                    }}
                    placeholder="Enter post title"
                    required
                  />
                  {errors.title && (
                    <div className="error-message">
                      <FileText size={16} />
                      {errors.title}
                    </div>
                  )}
                </div>

                <div className="learning-form-group">
                  <label className="learning-label">
                    <FileText size={18} />
                    Description
                  </label>
                  <textarea
                    className={`learning-textarea ${errors.description ? 'error' : ''}`}
                    value={newPost.description}
                    onChange={(e) => {
                      setNewPost({ ...newPost, description: e.target.value });
                      if (errors.description) setErrors({...errors, description: ''});
                    }}
                    placeholder="Write your post description"
                    required
                  />
                  {errors.description && (
                    <div className="error-message">
                      <FileText size={16} />
                      {errors.description}
                    </div>
                  )}
                </div>

                <div className="learning-form-group">
                  <label className="learning-label">
                    <Link size={18} />
                    Content URL
                  </label>
                  <input
                    type="url"
                    className="learning-input"
                    value={newPost.contentURL}
                    onChange={(e) => setNewPost({ ...newPost, contentURL: e.target.value })}
                    placeholder="Enter content URL (YouTube, article, etc.)"
                  />
                  <small className="learning-input-help">YouTube links will be embedded automatically</small>
                </div>

                <div className="learning-form-group">
                  <label className="learning-label">
                    <Tag size={18} />
                    Tags
                  </label>
                  <div className={`learning-tags-input ${errors.tags ? 'error' : ''}`}>
                    <input
                      type="text"
                      className="learning-input"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add tags (press Enter)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      type="button"
                      className="learning-btn-secondary"
                      onClick={handleAddTag}
                    >
                      Add
                    </button>
                  </div>
                  {errors.tags && (
                    <div className="error-message">
                      <Tag size={16} />
                      {errors.tags}
                    </div>
                  )}
                  <div className="learning-tags">
                    {newPost.tags.map((tag, index) => (
                      <span key={index} className="learning-tag">
                        {tag}
                        <button
                          type="button"
                          className="learning-tag-remove"
                          onClick={() => handleRemoveTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="learning-form-actions">
                  <button
                    type="button"
                    className="learning-btn learning-btn-secondary"
                    onClick={() => setShowAddForm(false)}
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
          </div>
        )}

        {isLoading ? (
          <div className="learning-loading">
            <Loader size={36} className="learning-loading-spinner" />
            <p>Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="learning-empty">
            <div className="learning-empty-icon">
              <FileText size={28} />
            </div>
            <h3>No posts found</h3>
            <p>{searchQuery || selectedFilter !== "all" ? 
                "Try adjusting your search or filters" : 
                "Be the first to share your knowledge!"}
            </p>
            <div className="learning-empty-actions">
              {(searchQuery || selectedFilter !== "all") && (
                <button 
                  className="learning-btn learning-btn-secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                  }}
                >
                  <X size={18} />
                  <span>Clear Filters</span>
                </button>
              )}
              <button 
                className="learning-btn learning-btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={18} />
                <span>Create New Post</span>
              </button>
            </div>
              </div>
            ) : (
          <>
            <div className="learning-results-info">
              <span>Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}</span>
              {(searchQuery || selectedFilter !== "all" || showingMyPosts) && (
                <button 
                  className="learning-btn-text"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                    setShowingMyPosts(false);
                  }}
                >
                  <X size={16} />
                  <span>Clear all filters</span>
                </button>
              )}
            </div>
            
            <div className="learning-grid">
              {filteredPosts.map((post) => (
                <article key={post.id} className="learning-card">
                  <header className="learning-card-header">
                    <div className="learning-author">
                      <div className="learning-avatar">
                        {post.postOwnerName ? post.postOwnerName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="learning-author-info">
                        <div className="learning-author-name">{post.postOwnerName}</div>
                        <time className="learning-time">
                          <Calendar size={14} />
                          {formatDate(post.createdAt)}
                        </time>
                      </div>
                    </div>
                    
                    {post.postOwnerID === userId && (
                      <div className="learning-actions-compact">
                        <button 
                          onClick={() => handleUpdate(post.id)} 
                          className="learning-btn-update"
                          aria-label="Update post"
                        >
                          <Edit3 size={16} />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="learning-btn-delete"
                          aria-label="Delete post"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </header>

                  <div className="learning-card-content">
                    <h2 className="learning-card-title">{post.title}</h2>
                    <p className="learning-card-description">{post.description}</p>
                    
                    {post.tags?.length > 0 && (
                      <div className="learning-tags">
                        {post.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="learning-tag"
                            onClick={() => setSelectedFilter(tag)}
                            style={{ cursor: 'pointer' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {post.contentURL && (
                    <div className="learning-media">
                      {post.contentURL.includes('youtube') ? (
                      <iframe
                        src={getEmbedURL(post.contentURL)}
                        title={post.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                        <a 
                          href={post.contentURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="learning-content-link"
                        >
                          <ExternalLink size={16} />
                          View Resource
                        </a>
                      )}
                    </div>
                  )}

                  <footer className="learning-card-footer">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`learning-like-btn ${post.likes?.[userId] ? 'liked' : ''}`}
                      aria-label={post.likes?.[userId] ? "Unlike post" : "Like post"}
                    >
                      <ThumbsUp size={18} />
                      <span>{Object.values(post.likes || {}).filter(Boolean).length}</span>
                    </button>
                  </footer>
                </article>
              ))}
                  </div>
          </>
        )}

        <button
          className="learning-fab"
          onClick={() => setShowAddForm(true)}
          aria-label="Create new post"
        >
          <Plus size={24} />
        </button>

        <button 
          className="learning-scroll-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      </main>
    </div>
  );
}

export default AllLearningPost;