import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MessageCircle, Edit, Trash2, ThumbsUp, Plus, 
  User, MessageSquare, X, Save, Heart, Share, Clock, UserCheck, UserPlus
} from 'lucide-react';
import SideBar from '../../Components/SideBar/SideBar';
import Modal from 'react-modal';
import './PostManagement.css'; 
import ChatBot from '../../Components/ChatBot/Chatbot'// Updated CSS file path

Modal.setAppElement('#root');

function AllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]); // For filtering posts
  const [postOwners, setPostOwners] = useState({}); // Map of userID to fullName
  const [showMyPosts, setShowMyPosts] = useState(false); // Toggle for "My Posts"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]); // State to track followed users
  const [newComment, setNewComment] = useState({}); // State for new comments
  const [editingComment, setEditingComment] = useState({}); // State for editing comments
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID'); // Get the logged-in user's ID

  useEffect(() => {
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        setPosts(response.data);
        setFilteredPosts(response.data); // Initially show all posts

        // Fetch post owners' names
        const userIDs = [...new Set(response.data.map((post) => post.userID))]; // Get unique userIDs
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              console.error(`Error fetching user details for userID ${userID}:`, error);
              return { userID, fullName: 'Anonymous' }; 
            })
        );
        const owners = await Promise.all(ownerPromises);
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        console.log('Post Owners Map:', ownerMap); // Debug log to verify postOwners map
        setPostOwners(ownerMap);
      } catch (error) {
        console.error('Error fetching posts:', error); // Log error for fetching posts
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem('userID');
      if (userID) {
        try {
          const response = await axios.get(`http://localhost:8080/user/${userID}/followedUsers`);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error('Error fetching followed users:', error);
        }
      }
    };

    fetchFollowedUsers();
  }, []);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      alert('Post deleted successfully!');
      setPosts(posts.filter((post) => post.id !== postId)); // Remove the deleted post from the UI
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId)); // Update filtered posts
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`); // Navigate to the UpdatePost page with the post ID
  };

  const handleMyPostsToggle = () => {
    if (showMyPosts) {
      // Show all posts
      setFilteredPosts(posts);
    } else {
      // Filter posts by logged-in user ID
      setFilteredPosts(posts.filter((post) => post.userID === loggedInUserID));
    }
    setShowMyPosts(!showMyPosts); // Toggle the state
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID },
      });

      // Update the specific post's likes in the state
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

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to follow/unfollow users.');
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        // Unfollow logic
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, { unfollowUserID: postOwnerID });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
      } else {
        // Follow logic
        await axios.put(`http://localhost:8080/user/${userID}/follow`, { followUserID: postOwnerID });
        setFollowedUsers([...followedUsers, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow state:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to comment.');
      return;
    }
    const content = newComment[postId] || ''; // Get the comment content for the specific post
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/comment`, {
        userID,
        content,
      });

      // Update the specific post's comments in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userID = localStorage.getItem('userID');
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        params: { userID },
      });

      // Update state to remove the deleted comment
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSaveComment = async (postId, commentId, content) => {
    try {
      const userID = localStorage.getItem('userID');
      await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        userID,
        content,
      });

      // Update the comment in state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId ? { ...comment, content } : comment
                ),
              }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId ? { ...comment, content } : comment
                ),
              }
            : post
        )
      );

      setEditingComment({}); // Clear editing state
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  console.log('Filtered Posts:', filteredPosts); // Debug log to verify filtered posts

  return (
    <div className="posts-container">
      
        <SideBar />
      <main>
        <div className="posts-header">
          <div className="posts-header-title">
            <MessageSquare size={24} />
            <h1>BoostPost</h1>
          </div>
          <div className="posts-actions">
            <button
              className="posts-btn posts-btn-primary"
              onClick={() => navigate('/addNewPost')}
            >
              <Plus size={18} />
              <span>Create Post</span>
            </button>
            <button
              className="posts-btn posts-btn-secondary"
              onClick={handleMyPostsToggle}
            >
              {showMyPosts ? (
                <>
                  <MessageSquare size={18} />
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

          {filteredPosts.length === 0 ? (
          <div className="posts-empty">
            <div className="posts-empty-icon">
              <MessageSquare size={32} />
            </div>
            <h3>No Posts Found</h3>
            <p>Be the first to share with the community!</p>
              <button 
              className="posts-btn posts-btn-primary"
                onClick={() => navigate('/addNewPost')}
              >
              <Plus size={18} />
              <span>Create New Post</span>
              </button>
            </div>
          ) : (
          <div className="posts-feed">
            {filteredPosts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <div className="post-avatar">
                      {postOwners[post.userID]?.charAt(0) || 'U'}
                    </div>
                    <div className="post-user-info">
                      <div className="post-user-name">{postOwners[post.userID] || 'Anonymous'}</div>
                      <div className="post-date">
                        <Clock size={14} />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="post-actions">
                    {post.userID !== loggedInUserID && (
                      <button
                        className={`post-follow-btn ${followedUsers.includes(post.userID) ? 'following' : ''}`}
                        onClick={() => handleFollowToggle(post.userID)}
                      >
                        {followedUsers.includes(post.userID) ? (
                          <>
                            <UserCheck size={16} />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    {post.userID === loggedInUserID && (
                      <>
                        <button 
                          onClick={() => handleUpdate(post.id)}
                          className="post-action-btn"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="post-action-btn danger"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="post-content">
                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-description">{post.description}</p>

                  {post.media && post.media.length > 0 && (
                    <div className="post-media-grid">
                      {post.media.map((url, index) => {
                        const fullUrl = url.startsWith('http') ? url : `http://localhost:8080${url}`;
                        const isVideo = url.includes('.mp4');
                        
                        return (
                          <div key={index} className="post-media-item">
                            {isVideo ? (
                              <video 
                                src={fullUrl}
                                controls
                                muted 
                              />
                            ) : (
                              <img 
                                src={fullUrl} 
                                alt={`Post media ${index + 1}`}
                                onClick={() => openModal(fullUrl)}
                                onError={(e) => {
                                  console.error("Image failed to load:", fullUrl);
                                  e.target.src = "https://via.placeholder.com/200?text=Image+Error";
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="post-actions">
                  <div className="post-action-buttons">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`post-action-btn ${post.likes?.[loggedInUserID] ? 'liked' : ''}`}
                    >
                      <Heart size={18} fill={post.likes?.[loggedInUserID] ? "#493D9E" : "none"} />
                      <span>{Object.values(post.likes || {}).filter(Boolean).length}</span>
                    </button>
                    
                    <button className="post-action-btn">
                      <MessageCircle size={18} />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                    
                    <button className="post-action-btn">
                      <Share size={18} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
                
                <div className="post-comments-section">
                  <div className="post-comments-header">
                    Comments ({post.comments?.length || 0})
                  </div>
                  
                  <div className="post-comments-list">
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className="post-comment">
                        <div className="post-comment-avatar">
                          {comment.userFullName?.charAt(0) || 'U'}
                        </div>
                        <div className="post-comment-content">
                          <div className="post-comment-user">
                            {comment.userFullName || 'Anonymous'}
                          </div>
                          {editingComment[comment.id] ? (
                            <div className="post-comment-edit-form">
                              <input
                                type="text"
                                className="post-comment-input"
                                value={editingComment[comment.id]}
                                onChange={(e) => setEditingComment({
                                  ...editingComment,
                                  [comment.id]: e.target.value
                                })}
                              />
                              <div className="post-comment-actions">
                                <button 
                                  onClick={() => setEditingComment({ ...editingComment, [comment.id]: undefined })}
                                  className="post-action-btn"
                                >
                                  <X size={16} />
                                </button>
                                <button 
                                  onClick={() => handleSaveComment(post.id, comment.id, editingComment[comment.id])}
                                  className="post-action-btn"
                                >
                                  <Save size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="post-comment-text">{comment.content}</div>
                              {comment.userID === loggedInUserID && (
                                <div className="post-comment-actions">
                                  <button 
                                    onClick={() => setEditingComment({ ...editingComment, [comment.id]: comment.content })}
                                  >
                                    <Edit size={14} />
                                    <span>Edit</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    className="danger"
                                  >
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="post-add-comment">
                    <input
                      type="text"
                      className="post-comment-input"
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id);
                        }
                      }}
                    />
                    <button 
                      className="post-comment-submit"
                      onClick={() => handleAddComment(post.id)}
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

        {/* Modal for displaying media */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
          className="posts-modal-content"
          overlayClassName="posts-modal"
          >
            {selectedMedia && (
            <>
              {selectedMedia.includes('.mp4') ? (
                <video
                  className="posts-modal-video"
                  src={selectedMedia}
                  controls
                  autoPlay
                />
              ) : (
                <img
                  className="posts-modal-image"
                  src={selectedMedia}
                  alt="Post media"
                />
              )}
              <button className="posts-modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </>
            )}
          </Modal>
      </main>
      <ChatBot />
    </div>
  );
}

export default AllPost;
