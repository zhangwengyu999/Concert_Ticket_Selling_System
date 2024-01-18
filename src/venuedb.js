// LIU Minghao, ZHANG Wengyu
import client from './dbclient.js';

const dbName = "eie4432_concert_db";

async function insert_venue(venueID, venueName, seatMap) {
  try {
    const venues = client.db(dbName).collection('venues');
    const newVenue = { venueID, venueName, seatMap };
    const result = await venues.insertOne(newVenue);
    console.log(`Added venue with ID: ${result.insertedId}`);
    return true;
  } catch (err) {
    console.log("Unable to insert venue into database!", err);
    return false;
  }
}

async function fetch_venue(venueID) {
  try {
    const venues = client.db(dbName).collection('venues');
    if (venueID) {
      const venueIDNumber = parseInt(venueID);
      const venue = await venues.findOne({ venueID: venueIDNumber });
      return venue;
    } else {
      const allVenues = await venues.find({}).toArray();
      return allVenues;
    }
  } catch (err) {
    console.log("Unable to fetch venue from database!", err);
  }
}

async function update_venue(venueID, updates) {
  try {
    const venues = client.db(dbName).collection('venues');
    const result = await venues.updateOne({ venueID: venueID }, { $set: updates });
    if (result.matchedCount === 0) {
      console.log("No matching venue found to update.");
      return false;
    } else {
      console.log(`Updated venue with ID: ${venueID}`);
      return true;
    }
  } catch (err) {
    console.log("Unable to update venue in database!", err);
    return false;
  }
}

async function delete_venue(venueID) {
  try {
    const venues = client.db(dbName).collection('venues');
    const result = await venues.deleteOne({ venueID: venueID });
    if (result.deletedCount === 0) {
      console.log("No matching venue found to delete.");
      return false;
    } else {
      console.log(`Deleted venue with ID: ${venueID}`);
      return true;
    }
  } catch (err) {
    console.log("Unable to delete venue from database!", err);
    return false;
  }
}


async function create_seat_map(venueID, rows, cols) {
  venueID = parseInt(venueID);
  rows = parseInt(rows);
  cols = parseInt(cols);
  const seatMap = Array.from({ length: rows }, () => Array(cols).fill(0)); // 0 for empty, 1 for occupied
  try {
    const venues = client.db(dbName).collection('venues');
    const result = await venues.updateOne({ venueID: venueID }, { $set: { seatMap: seatMap } }, { upsert: true });
    if (result.upsertedCount > 0) {
      console.log(`Created new venue with ID: ${venueID} and seat map`);
    } else {
      console.log(`Updated venue with ID: ${venueID} with new seat map`);
    }
    return true;
  } catch (err) {
    console.log("Error creating/updating seat map:", err);
    return false;
  }
}

// Modify a specific seat in the seat map
async function modify_seat(venueID, row, col, value) {
  try {
    const venues = client.db(dbName).collection('venues');
    venueID = parseInt(venueID);
    const query = { venueID: venueID };
    const updateDocument = { $set: { [`seatMap.${row}.${col}`]: value } };
    const result = await venues.updateOne(query, updateDocument);
    if (result.modifiedCount === 0) {
      console.log("No changes made to the seat map.");
      return false;
    } else {
      console.log(`Seat at row ${row}, col ${col} modified in venue ID: ${venueID}`);
      return true;
    }
  } catch (err) {
    console.log("Error modifying seat:", err);
    return false;
  }
}

async function get_seat_availability(venueID) {
  try {
    const venues = client.db(dbName).collection('venues');
    venueID = parseInt(venueID);
    const venue = await venues.findOne({ venueID: venueID });
    if (!venue) {
      console.log("Venue not found.");
      return null;
    } 
    if (!venue.seatMap) {
      console.log("seat map is unavailable.");
      return { totalSeats: 0, availableSeats: 0}
    }

    let totalSeats = 0;
    let availableSeats = 0;
    venue.seatMap.forEach(row => {
      totalSeats += row.length;
      availableSeats += row.filter(seat => seat === 0).length;
    });

    return { totalSeats, availableSeats };
  } catch (err) {
    console.log("Error fetching seat availability:", err);
    return null;
  }
}

async function fetch_seat_map(venueID) {
  try {
    const venues = client.db(dbName).collection('venues');
    venueID = parseInt(venueID);
    const venue = await venues.findOne({ venueID: venueID });
    if (!venue || !venue.seatMap) {
      console.log("Venue not found or seat map is unavailable.");
      return null;
    }

    return venue.seatMap;
  } catch (err) {
    console.log("Error fetching seat map:", err);
    return null;
  }
}

export { insert_venue, fetch_venue, update_venue, delete_venue, create_seat_map, modify_seat, get_seat_availability, fetch_seat_map };
