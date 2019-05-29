const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
// data validator
const validateProfileInput = require('../../validation/profile');
const validateEducationInput = require('../../validation/education');
const validateExperienceInput = require('../../validation/experience');



// Load Profile model
const Profile = require('../../models/Profile');

// Load user profile
const User = require('../../models/Users');

// @route GET api/profile/
// @desc user Profile route
// @access Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    let errors = {};
    Profile.findOne({ user: req.user.id })
        .populate('user',['name','avatar']) // performing join with users table
        .then(profile => {
            if (!profile) {
                errors.profile = "There is no profile for this user!"
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err))
})

// @route GET api/profile/all
// @desc All profiles route
// @access Public
router.get('/all', (req, res) => {
    Profile.find()
        .then(profile => {
            if (!profile) {
                errors.profile = "There are no profiles!"
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({no_profile:"There are no profiles!"}))
})

// @route GET api/profile/handle/:handle
// @desc find user experience by handle route
// @access Public
router.get('/handle/:handle', (req, res) => {
    Profile.findOne({handle:req.params.handle})
        .then(profile => {
            if (!profile) {
                errors.profile = "There is no profile for this user!"
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({no_profile:"There is no profile for this user!"}))
})

// @route GET api/profile/user/:user_id
// @desc find user experience by user_id route
// @access Public
router.get('/user/:user_id', (req, res) => {
    Profile.findOne({user:req.params.user_id})
        .then(profile => {
            if (!profile) {
                errors.profile = "There is no profile for this user!"
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({no_profile:"There is no profile for this user!"}))
})

// @route POST api/profile/
// @desc create/edit user Profile route
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    // validating data
    const {errors, isValid} = validateProfileInput(req.body);
    if(!isValid){
        console.log("got errors")
        return res.status(400).json(errors);
    }
    // get fields
    let profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    // skills - splites skills into array
    if (typeof req.body.skills !== undefined) {
        profileFields.skills = req.body.skills.split(',');
    }
    // socials
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (profile) {
                // updating profile
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set : profileFields },
                    { new: true }
                )
                    .then(profile => res.json(profile))
                    .catch(err => res.status(404).json(err))
            }else{
                // check handle
                Profile.findOne({handle:profileFields.handle})
                    .then(profile=>{
                        if(profile){
                            errors.handle = "This handle already exists!"
                            res.status(400).json(errors)
                        }
                    })

                // save profile
                new Profile(profileFields).save().then(profile=>res.json(profile))
            }
        })
})

// @route POST api/profile/education
// @desc create user education route
// @access Private
router.post('/education',passport.authenticate('jwt',{session:false}),(req,res)=>{

    const {errors, isValid} = validateEducationInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            const newEducation={
                school:req.body.school,
                degree:req.body.degree,
                fieldofstudy:req.body.fieldofstudy,
                from:req.body.from,
                to:req.body.to,
                current:req.body.current,
                description:req.body.description
            }

            // Add to education array
            profile.education.unshift(newEducation);

            // saving education details 
            profile.save()
                .then(profile=>res.json(profile));
        })
})

// @route POST api/profile/experience
// @desc create user experience route
// @access Private
router.post('/experience',passport.authenticate('jwt',{session:false}),(req,res)=>{
    // data validation
    const {errors, isValid} = validateExperienceInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            const newExperience={
                title:req.body.title,
                company:req.body.company,
                location:req.body.location,
                from:req.body.from,
                to:req.body.to,
                current:req.body.current,
                description:req.body.description
            }

            // Add to experience array
            profile.experience.unshift(newExperience);

            // saving experience details 
            profile.save()
                .then(profile=>res.json(profile));
        })
})

// @route DELETE api/profile/experience/:exp_id
// @desc create user experience route
// @access Private
router.delete('/experience/:exp_id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            const removeIndex = profile.experience // return all experiences
                .map(item => item.id) // returns all experiences ids
                .indexOf(req.params.exp_id) // returns index of experience id
            
            console.log(removeIndex);

            // splice the current experience from the experiences array
            profile.experience.splice(removeIndex,1);

            // save
            profile.save().then(profile =>res.json(profile))
        })
})

// @route DELETE api/profile/education/:edu_id
// @desc create user education route
// @access Private
router.delete('/education/:edu_id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            const removeIndex = profile.education // return all education
                .map(item => item.id) // returns all education ids
                .indexOf(req.params.edu_id) // returns index of education id
            
            console.log(removeIndex);

            // splice the current education from the experiences array
            profile.education.splice(removeIndex,1);

            // save
            profile.save().then(profile =>res.json(profile))
        })
})
module.exports = router;