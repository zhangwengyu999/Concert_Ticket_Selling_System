// LIU Minghao, ZHANG Wengyu
import { Router } from 'express';
import { fetch_user_orders, add_order_to_user } from './userdb.js';
import { modify_seat, fetch_seat_map } from './venuedb.js';
import bodyParser from 'body-parser';
import multer from 'multer';

const router = Router();
const form = multer();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true}));
router.use(form.none());

// Endpoint to fetch orders of a specific user or all users
router.get('/:username?', async (req, res) => {
  const username = req.params.username;
  try {
    const userTransactions = await fetch_user_orders(username);
    if (userTransactions) {
      res.json(userTransactions);
    } else {
      res.status(404).send('No transactions found');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/placeOrder', async (req, res) => {
  var { username, eventID, seatRow, seatCol, price } = req.body;
  eventID = parseInt(eventID);
  seatRow = parseInt(seatRow);
  seatCol = parseInt(seatCol);
  price = parseInt(price);
  try {
    // Fetch the current seat map for the venue
    const seatMap = await fetch_seat_map(eventID);

    // Check if the selected seat is available
    if (seatMap[seatRow][seatCol] === 1) {
      return res.status(400).send('Seat already taken');
    }

    // Update the seat status in the venue's seat map
    await modify_seat(eventID, seatRow, seatCol, 1);

    // Create a new order object
    const newOrder = {
      eventID,
      time: new Date().toISOString(),
      seatCoord: [seatRow, seatCol],
      price
    };

    // Add the order to the user's transaction history
    const orderAdded = await add_order_to_user(username, newOrder);

    if (orderAdded) {
      res.status(201).send('Order placed successfully');
    } else {
      res.status(500).send('Error placing order');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
