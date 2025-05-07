import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MessageCircle,
  Edit,
  Trash2,
  ThumbsUp,
  Plus,
  User,
  MessageSquare,
  X,
  Save,
  Heart,
  Share,
  Clock,
  UserCheck,
  UserPlus,
} from "lucide-react";
import SideBar from "../../Components/SideBar/SideBar";
import Modal from "react-modal";
import "./PostManagement.css";
import ChatBot from "../../Components/ChatBot/Chatbot"; // Updated CSS file path

Modal.setAppElement("#root");

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
  const loggedInUserID = localStorage.getItem("userID"); // Get the logged-in user's ID

  useEffect(() => {
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:8080/posts");
        setPosts(response.data);
        setFilteredPosts(response.data); // Initially show all posts

        // Fetch post owners' names
        const userIDs = [...new Set(response.data.map((post) => post.userID))]; // Get unique userIDs
        const ownerPromises = userIDs.map((userID) =>
          axios
            .get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              console.error(
                `Error fetching user details for userID ${userID}:`,
                error
              );
              return { userID, fullName: "Anonymous" };
            })
        );
        const owners = await Promise.all(ownerPromises);
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        console.log("Post Owners Map:", ownerMap); // Debug log to verify postOwners map
        setPostOwners(ownerMap);
      } catch (error) {
        console.error("Error fetching posts:", error); // Log error for fetching posts
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem("userID");
      if (userID) {
        try {
          const response = await axios.get(
            `http://localhost:8080/user/${userID}/followedUsers`
          );
          setFollowedUsers(response.data);
        } catch (error) {
          console.error("Error fetching followed users:", error);
        }
      }
    };

    fetchFollowedUsers();
  }, []);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      alert("Post deleted successfully!");
      setPosts(posts.filter((post) => post.id !== postId)); // Remove the deleted post from the UI
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId)); // Update filtered posts
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`); // Navigate to the UpdatePost page with the post ID
  };
}
