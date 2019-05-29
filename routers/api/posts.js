const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

// load Post Model
const Post = require('../../models/Posts');
// load Profile Model
const Profile = require('../../models/Profile');
// Load user profile
// const User = require('../../models/Users');
const validatePostInput = require('../../validation/post');
const validatePostCommentInput = require('../../validation/comment');

// @route GET api/posts/test
// @desc Test Posts route
// @access Public
router.get('/test', (req, res) =>
    res.json({ msg: "test post" })
)

// @route GET api/posts/
// @desc shows all post route
// @access Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(post => res.json(post))
        .catch(err => res.status(404).json(nopost = "There are no posts!"))
})

// @route GET api/posts/:post_id
// @desc shows post by Id route
// @access Public
router.get('/:post_id', (req, res) => {
    Post.findById(req.params.post_id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json(nopost = "There is no such post!"))
})

// @route POST api/posts/
// @desc Add post route
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
    })

    newPost.save()
        .then(post => res.json(post))
        .catch(err => res.status(400).json(nopost = "Problem while saving the post!"))
})

// @route POST api/posts/like/:post_id
// @desc Add like to post by id route
// @access Private
router.post('/like/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findOne({ user: req.user.id })
        // Post.findById(req.params.id)
        .then(post => {
            if (post.like.filter(like=> like.user.toString() === req.user.id).length > 0) {
                res.status(400).json(msg = "You already liked this post!")
            }
            post.like.unshift({user: req.user.id});

            post.save()
                .then(post => res.json(post))
                .catch(err => res.status(400).json(msg = "problem while saving post!"))
        })
        .catch(err => res.status(400).json(msg = "No such post found!"))        
})

// @route POST api/posts/unlike/:post_id
// @desc unlike post by id route
// @access Private
router.post('/unlike/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findOne({ user: req.user.id })
        .then(post => {

            // check for post like existence for this user
            if (post.like.filter(like=>like.user.toString() === req.user.id).length === 0) {
                res.status(400).json(msg = "You have not yet liked this post!")
            }
            const removeIndex = post.like
                .map(item => item.id)
                .indexOf(req.user.id)

            post.like.splice(removeIndex, 1);

            post.save()
                .then(post => res.json(post))
                .catch(err => res.status(400).json(msg = "problem while saving post!"))
        })
        .catch(err => res.status(400).json(msg = "No such post found!"))
})

// @route POST api/posts/comment/:post_id
// @desc Add comment to post by id route
// @access Private
router.post('/comment/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {errors, isValid} = validatePostCommentInput(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }
    Post.findOne({ user: req.user.id })
        // Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                user: req.user.id,
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar
            }
            post.comments.unshift(newComment);

            post.save()
                .then(post => res.json(post))
                .catch(err => res.status(400).json(msg = "Problem while saving post comment!"))
        })
        .catch(err => res.status(400).json(msg = "No such post found!"))
})

// @route DELETE api/posts/:post_id
// @desc Delete post by id route
// @access Private
router.delete('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.post_id)
                .then(post => {
                    // check for post owner
                    if (post.user.toString() !== req.user.id) {
                        res.status(400).json(authorize = "You are not authorize to perform this action!")
                    }

                    post.remove()
                        .then(post=>res.json(msg = "Post deleted successfully!"))
                        .catch(err =>res.status(404).json(msg="Problem with deleteing the post!"))
                })
                .catch(err =>res.status(404).json(msg="No such post found!"));
        })
})

// @route DELETE api/posts/comment/:post_id/:comment_id
// @desc Delete comment from post by id route
// @access Private
router.delete('/comment/:post_id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.post_id)
                .then(post => {
                    // check for post comment exists 
                    if (post.comments.filter(comment=>comment._id.toString() === req.params.comment_id).length === 0) {
                        res.status(400).json(authorize = "You have not commented on this post!")
                    }

                    const removeIndex = post.comments
                        .map(item => item.id)
                        .indexOf(req.user.id);

                    post.comments.splice(removeIndex,1);

                    post.save().then(post=>res.json(post)).catch(err=>res.status(400).json(msg="not able to delete comment"))
                })
                .catch(err =>res.status(404).json(msg="No such post found!"));
        })
})


module.exports = router;