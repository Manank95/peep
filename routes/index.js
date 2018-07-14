const data = require("../data");
global.fetch = require('node-fetch');
// const sendMail = require('../email');

const constructorMethod = app => {

    // authenticate middleware
    app.use(async function (req, res, next) {
        let sid = req.cookies.AuthCookie;
        if (sid) {
            try {
                let userId = await data.getUidBySessionId(sid);
                if (userId) req.uid = userId;
            }
            catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        }
        next();
    });

    app.get("/", function (req, res) {
        if (req.uid) res.redirect('/dashboard/newsfeed');
        else res.render("test/login",{title:"Login to Peep"});
    });

    app.post("/login", async function (req, res) {
        try {
            if (!req.body.username) throw 'post /login: no username is provided';
            if (!req.body.password) throw 'post /login: no password is provided';
            let info = await data.checkHashPass(req.body.username, req.body.password);
            if (info.err == 'no user') {
                let userEror = "<div class=\"form-group\" id=\"error-container\"><div class=\"alert alert-danger text-goes-here\">Username doesn't exist!</div></div>";
                res.render("test/login", { title: "No such user exists!", info: userEror });
            }
            else if (info.err == 'wrong password') {
                let passEror = "<div class=\"form-group\" id=\"error-container\"><div class=\"alert alert-danger text-goes-here\">Incorrect Password! Try again.</div></div>";
                res.render("test/login", { title: "Incorrect Password", info: passEror });
            }
            else {
                res.cookie('AuthCookie', info.sessionId);
                req.uid = info._id;
                res.redirect('/dashboard/newsfeed');
            }
        }
        catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    });

    app.get("/signup", function (req, res) {
        res.render("test/register", { title: "Sign Up for Peep" })
    });

    app.get("/dashboard/newsfeed", async function (req, res) {
        if (!req.uid) {
            res.status(403);
            res.render('test/403', { title: "Restricted Access." });
            return;
        }
        // Logic to render the things on newsfeed page.
        let info = await data.getUserById(req.uid);
        console.log(info);
        res.render('test/dashboard', info);
    });
    
    app.post("/register", async function (req, res) {
        try {
            let args = ['username', 'fname', 'lname', 'password', 'email'];
            for (let s of args) {
                if (!req.body[s] || req.body[s] == '')
                    throw 'post /register: argument ' + s + ' is not provided';
            }
            let info = await data.addUser(req.body.username, req.body.email, req.body.password, req.body.fname, req.body.lname);
            if (info.err == 'user exist') {
                let userEror = "<div class=\"form-group\" id=\"error-container\"><div class=\"alert alert-danger text-goes-here\">Username already exists!</div></div>";
                res.render("test/register", { title: "Username exists!", info: userEror });
            }
            else if (info.err == 'email exist') {
                let emailEror = "<div class=\"form-group\" id=\"error-container\"><div class=\"alert alert-danger text-goes-here\">Email already exists! Try again.</div></div>";
                res.render("test/register", { title: "Email already exists", info: emailEror });
            }
            else {
                res.cookie('AuthCookie', info.sessionId).redirect('/dashboard/newsfeed');
            }
        }
        catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
        //send them an email for varification
        //if varified =>  make the variable true.
    });

    app.get("/logout", function (req, res) {
        //expire the authcookie and informing the user
        res.clearCookie("AuthCookie");
        res.render("test/logout", { title: "Logged Out !" })
    });

    app.get('/profile', async function (req, res) {
        if (!req.uid) {
            res.status(403);
            res.render('test/403', { title: "Restricted Access." });
            return;
        }
        let info = await data.getUserById(req.uid);
        res.render('test/profile', {
            username: info.username,
            email: info.email,
            fname: info.profile.firstName,
            lname: info.profile.lastName,
            title: "Profile of "+info.profile.firstName
        });
    });

    app.post('/profile', async function (req, res) {
        if (!req.uid) {
            res.status(403);
            res.render('test/403', { title: "Restricted Access." });
            return;
        }
        try {
            let args = ['fname', 'lname', 'password'];
            for (let s of args) {
                if (!req.body[s] || req.body[s] == '')
                    throw 'post /profile: argument ' + s + ' is not provided';
            }
            await data.updateUser(req.uid, req.body.fname, req.body.lname, req.body.password);
            res.redirect('/profile');
        }
        catch (e) {
            console.log(e);
            res.sendStatus(500);
        }

    });

    app.post('/newsfeed', async (req, res) => {
        if (!req.uid) {
            res.status(403);
            res.render('test/403', { title: "Restricted Access." });
            return;
        }

        // Logic related to databse update.

        // change portfolio
        res.status(200).send("success");
    });

};

module.exports = constructorMethod;