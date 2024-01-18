// LIU Minghao, ZHANG Wengyu
import { Router } from 'express';
import { insert_venue, fetch_venue, update_venue, delete_venue, create_seat_map, modify_seat, get_seat_availability, fetch_seat_map } from './venuedb.js';
import bodyParser from 'body-parser';
import multer from 'multer';

const router = Router();
const form = multer();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true}));
router.use(form.none());

// For venue related APIs
router.get('/:venueID?', async (req, res) => {
  try {
    const venueID = req.params.venueID;
    const venues = await fetch_venue(venueID); // Fetch all venues
    if (venues) {
      res.json(venues);
    } else {
      res.status(404).send('Venue not found');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  var { venueID, venueName, rows, cols } = req.body;
  try {
    rows = parseInt(rows);
    cols = parseInt(cols);
    const seatMap = Array.from({ length: rows }, () => Array(cols).fill(0)); // 0 for empty, 1 for occupied
    await insert_venue(venueID, venueName, seatMap);
    res.status(201).send('Venue created successfully');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seatmap', async (req, res) => {
  const { venueID, rows, cols } = req.body;
  try {
    await create_seat_map(venueID, rows, cols);
    res.status(201).send('Seat map created/updated successfully');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/seat', async (req, res) => {
  const { venueID, row, col, value } = req.body;
  try {
    await modify_seat(venueID, row, col, value);
    res.status(200).send('Seat modified successfully');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/availability/:venueID', async (req, res) => {
  try {
    const seatInfo = await get_seat_availability(req.params.venueID);
    if (seatInfo) {
      res.json(seatInfo);
    } else {
      res.status(404).send('Venue not found or seat map unavailable');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/seatmap/:venueID', async (req, res) => {
  try {
    const seatMap = await fetch_seat_map(req.params.venueID);
    if (seatMap) {
      res.json(seatMap);
    } else {
      res.status(404).send('Seat map not found');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;