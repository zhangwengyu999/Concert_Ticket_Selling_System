// LIU Minghao, ZHANG Wengyu
import client from './dbclient.js';

const dbName = "eie4432_concert_db";

async function insert_event(eventIDIn, datetime, title, venueIDIn, description, image, pricesIn, statusIN) {
  try {
    const events = client.db(dbName).collection('events');
    const eventID = parseInt(eventIDIn);
    const venueID = parseInt(venueIDIn);
    const pricesJson = JSON.parse(pricesIn);
    const prices = [parseInt(pricesJson.firstClass), parseInt(pricesJson.secondClass)];  
    const status = parseInt(statusIN);
    const newEvent = {
      eventID, datetime, title, venueID, description, image, prices, status
    };
    const result = await events.insertOne(newEvent);
    console.log(`Added event with ID: ${result.insertedId}`);
    return true;
  } catch (err) {
    console.log("Unable to insert event into database!");
    return false;
  }
}

async function fetch_event(eventID) {
  try {
    const events = client.db(dbName).collection('events');
    if (eventID) {
      const eventIdNumber = parseInt(eventID);
      const event = await events.findOne({ eventID: eventIdNumber });
      return event;
    } else {
      const allEvents = await events.find({}).toArray();
      return allEvents;
    }
  } catch (err) {
    console.log("Unable to fetch event from database!", err);
  }
}


async function update_event(eventID, updates) {
  try {
    const events = client.db(dbName).collection('events');
    updates.venueID = parseInt(updates.venueID);
    const pricesJson = JSON.parse(updates.prices);
    updates.prices = [parseInt(pricesJson.firstClass), parseInt(pricesJson.secondClass)];  
    updates.status = parseInt(updates.status);
    const result = await events.updateOne({ eventID: eventID }, { $set: updates });
    if (result.matchedCount === 0) {
      console.log("No matching event found to update.");
    } else {
      console.log(`Updated event with ID: ${eventID}`);
    }
    return result.modifiedCount > 0;
  } catch (err) {
    console.log("Unable to update event in database!");
    return false;
  }
}

async function delete_event(eventID) {
  try {
    const events = client.db(dbName).collection('events');
    const result = await events.deleteOne({ eventID: eventID });
    if (result.deletedCount === 0) {
      console.log("No matching event found to delete.");
      return false;
    } else {
      console.log(`Deleted event with ID: ${eventID}`);
      return true;
    }
  } catch (err) {
    console.log("Unable to delete event from database!");
    return false;
  }
}

export { insert_event, fetch_event, update_event, delete_event };
