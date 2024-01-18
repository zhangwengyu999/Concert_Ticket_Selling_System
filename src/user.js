// LIU Minghao, ZHANG Wengyu
import { Router } from 'express';
import { create_user, validate_user, fetch_user, username_exist, update_user, fetch_user_orders, fetch_all_users} from './userdb.js';
import bodyParser from 'body-parser';
import path from 'path';
import multer from 'multer';

const router = Router();

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

router.post('/update', upload.single('image'), async (req, res) => {
  const username = req.body.username;
  const image = req.file
  if (image) {
    req.body.image = image.path;
  }
  try {
    const updateResult = await update_user(username, req.body);
    if (updateResult) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(200).json({ message: 'User updated successfully (Nothing updated)' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', async (req, res) => {
    try {
        const users = await fetch_all_users();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/details/:username', async (req, res) => {
  const username = req.params.username;
  try {
    const user = await fetch_user(username);
    if (user) {
      res.status(200).json({ status: 'success', user });
    } else {
      res.status(404).json({ status: 'failed', message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/transactions/:username', async (req, res) => {
  const username = req.params.username;
  try {
    const transactions = await fetch_user_orders(username);
    if (transactions) {
      res.status(200).json({ status: 'success', transactions: transactions.transactions });
    } else {
      res.status(404).json({ status: 'failed', message: 'Transactions not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/alltransactions/', async (req, res) => {

  try {
    const data = await fetch_user_orders();
    if (data) {
      res.status(200).json({ status: 'success', data: data });
    } else {
      res.status(404).json({ status: 'failed', message: 'Transactions not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;