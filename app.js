//jshint esversion:6

const express = require("express");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const ejs = require("ejs");
// Load the full build.
var _ = require('lodash');

const mongoose = require("mongoose");

const homeStartingContent = "Unleash your thoughts, share your stories, and let your creativity flow. This is a space where your words matter. Whether it’s a random thought, a creative idea, or a story you’ve been waiting to share, this is your platform to connect with others and express yourself freely.";
const aboutContent = "At The Insightful Blog , we believe everyone has a story to tell, an idea to share, or a thought worth exploring. Our platform is a space where creativity meets community—a place where users can post freely, discover diverse perspectives, and connect with like-minded individuals. Whether you're here to share a random thought, pen a short story, or simply browse what others have to say, The Insightful Blog is your digital diary and creative canvas rolled into one.";
const contactContent = "We’d love to hear from you! Whether you have questions, feedback, or just want to say hello, feel free to reach out to us.";

const app = express();

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); 

mongoose.connect("mongodb://localhost:27017/blogDB");

// create collection Schema
const postSchema = {
  title : String,
  content: String
}


// create collection
const Post = mongoose.model("Post", postSchema);




app.get("/home", function(req, res) {
  Post.find()
    .then((posts) => {
      if (posts.length === 0) {
        res.render("home" ,{startingContent: homeStartingContent, posts:[]})
      }
      else {
        res.render("home", {startingContent: homeStartingContent, posts:posts});
      }

    })
    .catch((err) => {
      console.log(err);
    })
});

app.get("/about", function(req, res) {
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res) {
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res) {
  res.render("compose");
})

app.post("/compose", function(req, res) {
  const post = new Post({ 
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save();
  res.redirect("/");
});



app.route("/posts/:postName")
  .get(function(req,res) {
    let postTitle = req.params.postName;

    Post.findOne({title: postTitle})
      .then((post) => {
        if(post) {
          res.render("post", {title:post.title, body:post.content});
        }
        else {
          res.redirect("/");
        }
      })
      .catch((err) => {
        console.log(err);
      })
  })
  .put(function(req, res) {
    let postTitle = req.params.postName;
    Post.findOneAndUpdate(
      { title: postTitle },
      { title: req.body.postTitle, content: req.body.postBody },
      { new: true }
    )
      .then((updatedPost) => {
        res.render("post", { title: updatedPost.title, body: updatedPost.content });
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .delete(function(req, res) {
    let postTitle = req.params.postName;
    Post.findOneAndDelete({ title: postTitle })
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
    });



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
