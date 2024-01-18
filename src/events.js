// LIU Minghao, ZHANG Wengyu
import { Router } from 'express';
import { insert_event, fetch_event, update_event, delete_event } from './eventdb.js';
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

// Fetch all events or a specific event based on the provided eventID
router.get('/:eventID?', async (req, res) => {
  try {
    const eventID = req.params.eventID;
    const events = await fetch_event(eventID); 

    if (events) {
      res.json(events);
    } else {
      res.status(404).send('Event not found');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insert a new event
router.post('/', upload.single('image'), async (req, res) => {
  const { eventID, title, datetime, venueID, description, prices, status } = req.body;
  const image = req.file; 
  try {
    await insert_event(eventID, datetime, title, venueID, description, image.path, prices, status);
    res.status(201).send('Event created successfully');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing event
router.put('/:eventID', upload.single('image'), async (req, res) => {
  const eventID = parseInt(req.params.eventID);
  const { datetime, title, venueID, description, prices, status } = req.body;
  const image = req.file ? req.file.path : null;
  try {
    const updates = { datetime, title, venueID, description, prices, status };
    if (image) {
      updates.image = image;
    }
    const updated = await update_event(eventID, updates);
    if (updated) {
      res.status(200).send('Event updated successfully');
    } else {
      res.status(404).send('Event not found');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;