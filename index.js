const express = require('express');
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
// DB config
const db = require('./config/keys').mongoURI;

// get routes
const users = require('./routers/api/users');
const profile = require('./routers/api/profile');
const posts = require('./routers/api/posts');

// Initialize app
const app = express();


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// DB Connection
mongoose.connect(db,{ useNewUrlParser: true })
    .then(() => console.log("database connected"))
    .catch(err => console.log(err));


// passport middleware
app.use(passport.initialize());
// passport config
require('./config/passport')(passport);


// Use Routers
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts); 


app.listen(port);
console.log(`app running on port ${port}`);