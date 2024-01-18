// LIU Minghao, ZHANG Wengyu
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { Router } from 'express';
import bodyParser from 'body-parser';
import { validate_user, create_user, fetch_user, username_exist } from './userdb.js';
import path from 'path';

const router = Router();
const form = multer();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'static/uploads/');
  },
  filename: function(req, file, cb) {
    // Generate a unique filename with extension
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true}));

router.post('/login', form.none(), async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = await validate_user(username, password);
    req.session.logged = false;
    if (user) {
        const isValid = user.enabled;
        if (!isValid) {
            res.status(401).json({ "status": "failed", "reason": "User `" + username + "` is disabled" });
        } else {
            req.session.username = username;
            req.session.role = user.role;
            req.session.logged = true;
            req.session.timestamp = Date.now();
            res.status(200).json({ status: "success", user:{username: username, role: user.role} });
        }
    } else {
        req.session.logged = false;
        res.status(401).json({ "status": "failed", "reason": "Incorrect username and password" });
    }

});

router.post('/register', upload.single('image'),async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = "user";
    const nickname = req.body.nickname;
    const email = req.body.email;
    const gender = req.body.gender;
    const birthDate = req.body.birthDate;
    const image = req.file ? req.file.path : null;

    if (username && password) {
        // check whether the username and password satisfy the requirement
        // Username must be at least 3 characters
        if (username.length < 3) {
            res.status(400).json({ status: 'failed', message: 'Username must be at least 3 characters' });
            return;
        }
        const exist = await username_exist(username);
        if (exist) {
            console.log(username_exist(username));
            res.status(400).json({ status: 'failed', message: 'Username ' + username + ' already exists' });
            return;
        }
        // Password must be at least 8 characters 
        if (password.length < 8) {
            res.status(400).json({ status: 'failed', message: 'Password must be at least 8 characters' });
            return;
        }

        //  insert a new user to the user database using create_user()
        const result = await create_user(username, password, role, true, 
                                          nickname, email, gender, birthDate, image);
        
        console.log(result);
        if (result) {
            res.status(200).json({ status: 'success', user: { username: username, role: role } });
        } else {
            res.status(500).json({ status: 'failed', message: 'Account created but unable to save into the database' });
        }

    } else {
        res.status(400).json({ status: 'failed', message: 'Missing fields' });
    }
});

router.post('/logout', (req, res) => {
    if (req.session.logged) {
        // req.session.destroy();
        req.session.username = null;
        req.session.role = null;
        req.session.logged = false;
        req.session.timestamp = null;
        res.end();
    } else {
        res.status(401).json({ status: "failed", message: "Unauthorized" });
    }
});

router.get('/me', (req, res) => {
    if (req.session.logged) {
        var timeElapsed = Date.now() - req.session.timestamp; // calculate the time elapsed since the last login
        if (timeElapsed > 1000 * 60 * 10) { // expire in 10 minutes
            req.session.username = null;
            req.session.role = null;
            req.session.logged = false;
            req.session.timestamp = null;
            res.status(401).json({ status: "failed", message: "Unauthorized" });
        } else {
            res.status(200).json({ "status": "success", "user": { "username": req.session.username, "role": req.session.role } });
        }
    } else {
        res.status(401).json({ status: "failed", message: "Unauthorized" });
    }
});


export default router;