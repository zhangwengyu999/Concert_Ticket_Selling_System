// LIU Minghao, ZHANG Wengyu
import express from 'express';
import session from 'express-session';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res, next) => {
  console.log(req.session.logged);
  if (req.session.logged == true) {
    res.redirect('/account-page.html');
  } else {
    res.redirect('/login.html');
  }
  next();
});

router.use('/', express.static('static'));

export default router;
