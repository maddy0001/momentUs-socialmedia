require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "social_media_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

// Cloudinary Setup for Image Uploads
cloudinary.config({
    cloud_name: "bluenote",
    api_key: "474127374914975",
    api_secret: "5cp5yfQJDLFrQi75nfMFwtsyhbc"
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "social_media_posts",
        allowed_formats: ["jpg", "png", "jpeg"]
    }
});
const upload = multer({ storage });

// User Registration
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send("User Registered Successfully");
    });
});

// User Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(401).send("User Not Found");

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send("Invalid Credentials");

        const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
        res.json({ token, userId: user.id, name: user.name });
    });
});

// Create Post (With Image)
app.post("/posts", upload.single("image"), (req, res) => {
    const { user_id, content } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    const sql = "INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)";
    db.query(sql, [user_id, content, imageUrl], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send("Post Created Successfully");
    });
});



// // Get All Posts (Latest First)
// app.get("/posts", (req, res) => {
//     db.query("SELECT posts.*, users.name FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC", (err, result) => {
//         if (err) return res.status(500).send(err);
//         res.json(result);
//     });
// });

// Get All Posts (Latest First)
app.get("/posts", (req, res) => {
    db.query(
        "SELECT posts.*, users.name, DATE_FORMAT(posts.created_at, '%M %d, %Y at %h:%i %p') AS formatted_date ,DATE_FORMAT(posts.updated_at, '%M %d, %Y at %h:%i %p') AS updated_date FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC",
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json(result);
        }
    );
});




// Like or Unlike Post
app.post("/posts/like", (req, res) => {
    const { post_id, user_id } = req.body;

    const checkSql = "SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?";
    db.query(checkSql, [post_id, user_id], (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.length > 0) {
            // Unlike
            const unlikeSql = "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?";
            db.query(unlikeSql, [post_id, user_id], (err, result) => {
                if (err) return res.status(500).send(err);
                db.query("UPDATE posts SET likes = likes - 1 WHERE id = ?", [post_id]);
                res.json({ liked: false });
            });
        } else {
            // Like
            const likeSql = "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)";
            db.query(likeSql, [post_id, user_id], (err, result) => {
                if (err) return res.status(500).send(err);
                db.query("UPDATE posts SET likes = likes + 1 WHERE id = ?", [post_id]);
                res.json({ liked: true });
            });
        }
    });
});


// Get All Posts (Sorted by Popularity - Most Liked First)
app.get("/posts", (req, res) => {
    db.query("SELECT posts.*, users.name FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.likes DESC", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});



// Comment on a Post
app.post("/comments", (req, res) => {
    const { post_id, user_id, comment } = req.body;
    const sql = "INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)";
    db.query(sql, [post_id, user_id, comment], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send("Comment Added Successfully");
    });
});

// Get Comments for a Post
app.get("/comments/:post_id", (req, res) => {
    const sql = "SELECT comments.*, users.name FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ?";
    db.query(sql, [req.params.post_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Update Post
app.put("/posts/:post_id", (req, res) => {
    const { content } = req.body;
    const sql = "UPDATE posts SET content = ? WHERE id = ?";
    db.query(sql, [content, req.params.post_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send("Post Updated Successfully");
    });
});


// Delete Post
app.delete("/posts/:post_id", (req, res) => {
    const sql = "DELETE FROM posts WHERE id = ?";
    db.query(sql, [req.params.post_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send("Post Deleted Successfully");
    });
});


// Change Password
app.post("/change-password", async (req, res) => {
    const { user_id, currentPassword, newPassword } = req.body;

    // Check if user exists
    db.query("SELECT password FROM users WHERE id = ?", [user_id], async (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(400).send("User not found");

        const user = result[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).send("Incorrect Current Password");

        // Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user_id], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send("Password Changed Successfully");
        });
    });
});

// Get Sorted Posts
app.get("/posts/sorted/:type", (req, res) => {
    let sql;
    if (req.params.type === "likes") {
        sql = "SELECT posts.*, users.name FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.likes DESC";
    } else if (req.params.type === "comments") {
        sql = "SELECT posts.*, users.name FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.comment_count DESC";
    } else if (req.params.type === "images") {
        sql = "SELECT posts.*, users.name FROM posts JOIN users ON posts.user_id = users.id WHERE posts.image IS NOT NULL";
    } else {
        sql = "SELECT posts.*, users.name FROM posts JOIN users ON posts.user_id = users.id";
    }

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Add Comment
app.post("/comments", (req, res) => {
    const { post_id, user_id, comment } = req.body;
    const sql = "INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)";
    
    db.query(sql, [post_id, user_id, comment], (err, result) => {
        if (err) return res.status(500).send(err);
        
        // Update comment count in posts
        db.query("UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?", [post_id]);

        res.send("Comment Added Successfully");
    });
});

// Get Comments for a Post
app.get("/comments/:post_id", (req, res) => {
    const sql = "SELECT comments.*, users.name FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ?";
    db.query(sql, [req.params.post_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});





// Start Server
app.listen(5000, () => console.log("Server running on port 5000"));







