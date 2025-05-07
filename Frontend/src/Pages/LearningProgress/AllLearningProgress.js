import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import SideBar from '../../Components/SideBar/SideBar';
import { FaUserCircle } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";
import styles from './AllLearningProgress.module.css';

function AllLearningProgress() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showMyPosts, setShowMyPosts] = useState(false); // Track filter mode
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/learningProgress')
      .then((response) => response.json())
      .then((data) => {
        setProgressData(data);
        setFilteredData(data); // Initially show all data
      })
      .catch((error) => console.error('Error fetching learning progress data:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this learning progress?')) {
      try {
        const response = await fetch(`http://localhost:8080/learningProgress/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Learning Progress deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Learning Progress.');
        }
      } catch (error) {
        console.error('Error deleting learning progress:', error);
      }
    }
  };

  const toggleFilter = () => {
    if (showMyPosts) {
      setFilteredData(progressData); // Show all posts
    } else {
      const myPosts = progressData.filter((progress) => progress.postOwnerID === userId);
      setFilteredData(myPosts); // Show only user's posts
    }
    setShowMyPosts(!showMyPosts); // Toggle filter mode
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebarWrapper}>
        <SideBar />
      </div>
      <div className={styles.contentSection}>
        <button
          className={styles.actionButtonAdd}
          onClick={() => (window.location.href = '/addLearningProgress')}
        >
          create post
        </button>
        <button className={styles.actionButtonMy} onClick={toggleFilter}>
          {showMyPosts ? 'Show All Posts' : 'Show My Posts'}
        </button>
        <div className={styles.postCardContainer}>
          {filteredData.length === 0 ? (
            <div className={styles.notFoundBox}>
              <div className={styles.notFoundImg}></div>
              <p className={styles.notFoundMsg}>No posts found. Please create a new post.</p>
              <button
                className={styles.notFoundBtn}
                onClick={() => (window.location.href = '/addLearningProgress')}
              >
                Create New Post
              </button>
            </div>
          ) : (
            filteredData.map((progress) => (
              <div key={progress.id} className={styles.postCard}>
                <div className={styles.userDetailsCard}>
                  <div className={styles.nameSectionPost}>
                    <p className={styles.nameSectionPostOwnerName}><FaUserCircle />{progress.postOwnerName}</p>
                  </div>
                  {progress.postOwnerID === userId && (
                    <div>
                      <div className={styles.actionBtnIconPost}>
                        <FaEdit
                          onClick={() => (window.location.href = `/updateLearningProgress/${progress.id}`)} className={styles.actionBtnIcon} />
                        <RiDeleteBin6Fill
                          onClick={() => handleDelete(progress.id)}
                          className={styles.actionBtnIcon} />
                      </div>
                    </div>
                  )}
                </div>
                <p className={styles.topicCont}>{progress.skillTitle}{" "}<span className={styles.topicContB}>{progress.field}{" "}</span><span className={styles.topicContB}>{progress.level}%</span></p>
                <div className={styles.disCon}>
                  <p className={styles.disConTopic}>Description</p>
                  <p className={styles.disConPera} style={{ whiteSpace: "pre-line" }}>{progress.description}</p>
                </div>
                <div className={styles.dateCard}>
                  <p className={styles.dateCardDte}><HiCalendarDateRange /> {progress.startDate} to {progress.endDate}</p>
                </div>
                <p></p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AllLearningProgress;
