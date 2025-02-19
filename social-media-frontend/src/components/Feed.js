import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Card, CardContent, Typography, Button, TextField, IconButton, Divider, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const userId = localStorage.getItem("userId");

  const [comments, setComments] = useState({});
const [showComments, setShowComments] = useState({});
const [newComment, setNewComment] = useState({});



  
const toggleComments = async (postId) => {
  if (showComments[postId]) {
      // Hide comments
      setShowComments(prev => ({ ...prev, [postId]: false }));
  } else {
      // Fetch & Show comments
      const res = await axios.get(`http://localhost:5000/comments/${postId}`);
      setComments(prev => ({ ...prev, [postId]: res.data }));
      setShowComments(prev => ({ ...prev, [postId]: true }));
  }
};



  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await axios.get("http://localhost:5000/posts");
    setPosts(res.data);
  };

  

  const handleLike = async (postId, liked) => {
    const user_id = localStorage.getItem("userId");
    const res = await axios.post("http://localhost:5000/posts/like", { post_id: postId, user_id });

    setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: liked ? post.likes - 1 : post.likes + 1, likedByUser: !liked } : post
    ));
};

const fetchSortedPosts = async (type) => {
  const res = await axios.get(`http://localhost:5000/posts/sorted/${type}`);
  setPosts(res.data);
};




  const handleCreatePost = async () => {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("content", content);
    if (image) formData.append("image", image);

    if (editingPost) {
      await axios.put(`http://localhost:5000/posts/${editingPost}`, { content });
      setEditingPost(null);
    } else {
      await axios.post("http://localhost:5000/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
    }

    setContent("");
    setImage(null);
    fetchPosts();
  };

  

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setContent(post.content);
  };

  const handleDeletePost = async (postId) => {
    await axios.delete(`http://localhost:5000/posts/${postId}`);
    fetchPosts();
  };

  const sortByLikes = () => {
    setPosts([...posts].sort((a, b) => b.likes - a.likes));
};

// const [comments, setComments] = useState({});
// const [newComment, setNewComment] = useState("");

const fetchComments = async (postId) => {
    const res = await axios.get(`http://localhost:5000/comments/${postId}`);
    setComments(prev => ({ ...prev, [postId]: res.data }));
};



const handleAddComment = async (postId) => {
  const user_id = localStorage.getItem("userId");
  await axios.post("http://localhost:5000/comments", { post_id: postId, user_id, comment: newComment[postId] });

  // Clear only the comment input for this post
  setNewComment(prev => ({ ...prev, [postId]: "" }));

  // Refresh comments for this post
  toggleComments(postId);
};





return (
  <Container maxWidth="md" sx={{ bgcolor: "background.default", color: "text.primary", padding: 3, borderRadius: 2 }}>

    <Typography variant="h4" sx={{ marginY: 3, textAlign: "center", fontWeight: "bold" }}>
      Social Media Feed
    </Typography>
    

    {/* Post Creation Form */}
    <Card sx={{ marginBottom: 3, padding: 2 }}>
      <CardContent>
        <TextField 
          label="Write a post..." 
          fullWidth 
          multiline 
          rows={2} 
          variant="outlined" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          sx={{ marginBottom: 2 }}
        />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ marginBottom: "10px" }} />
        <Button variant="contained" color="primary" fullWidth onClick={handleCreatePost}>
          {editingPost ? "Update Post" : "Post"}
        </Button>
      </CardContent>
    </Card>

    {/* Sorting Options */}
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 3 }}>
      <Button variant="contained" onClick={() => fetchPosts()}>Latest Posts</Button>
      <Button variant="contained" onClick={() => fetchSortedPosts("likes")}>Sort by Likes</Button>
      <Button variant="contained" onClick={() => fetchSortedPosts("comments")}>Sort by Comments</Button>
      <Button variant="contained" onClick={() => fetchSortedPosts("images")}>Sort by Images</Button>
    </Box>

    {/* Displaying Posts */}
    {posts.map(post => (
      <Card key={post.id} sx={{ marginBottom: 3, padding: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">{post.name}</Typography>
          {post.image && <img src={post.image} alt="Post" width="100%" style={{ borderRadius: "5px", marginTop: "10px" }} />}
          <Typography variant="body1" sx={{ marginTop: 1 }}>{post.content}</Typography>
          <Typography variant="body2" sx={{ color: "gray" }}>Likes: {post.likes} {/*| Comments: {post.comment_count=8 */} </Typography>

          {/* Like/Unlike Button */}
          <Button 
            variant="contained" 
            color={post.likedByUser ? "secondary" : "primary"} 
            startIcon={<ThumbUpIcon />}
            sx={{ marginTop: 2 }}
            onClick={() => handleLike(post.id, post.likedByUser)}
          >
            {post.likedByUser ? "Dislike" : "Like"}
          </Button>

          {/* Toggle Comments */}
          <Button 
            variant="contained" 
            color="info" 
            startIcon={<CommentIcon />}
            sx={{ marginLeft: 2, marginTop: 2 }}
            onClick={() => toggleComments(post.id)}
          >
            {showComments[post.id] ? "Hide Comments" : "View Comments"}
          </Button>

          {/* Show Edit & Delete Buttons Only for Post Owner */}
          {post.user_id === Number(userId) && (
            <>
              <IconButton onClick={() => handleEditPost(post)} sx={{ marginLeft: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeletePost(post.id)}>
                <DeleteIcon />
              </IconButton>
            </>
          )}

          {/* Comment Section */}
          {showComments[post.id] && (
            <>
              <Divider sx={{ marginY: 2 }} />
              {comments[post.id]?.map(comment => (
                <Typography key={comment.id} variant="body2" sx={{ paddingLeft: 2 }}>
                  <strong>{comment.name}:</strong> {comment.comment}
                </Typography>
              ))}
              <TextField 
                label="Add a comment" 
                fullWidth 
                variant="outlined" 
                value={newComment[post.id] || ""} 
                onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))} 
                sx={{ marginTop: 2 }}
              />
              <Button 
                variant="contained" 
                color="success" 
                fullWidth 
                sx={{ marginTop: 1 }} 
                onClick={() => handleAddComment(post.id)}
              >
                Comment
              </Button>
            </>
          )}
        </CardContent>
        <Typography variant="body2" color="text.secondary">
        Post created on {post.formatted_date}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Post updated on {post.updated_date}
            </Typography>
      </Card>
    ))}
  </Container>
);
};

export default Feed;
