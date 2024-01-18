// LIU Minghao, ZHANG Wengyu
/* eslint-disable no-undef */
import client from './dbclient.js'; 
import crypto from 'crypto';


const dbName = "eie4432_concert_db"

async function sha256(input) {
  // Ensure input is a string
  if (typeof input !== 'string') {
    input = input.toString();
  }
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function validate_user(username, password) {
  if (!username || !password) {
    return false;
  } else {
    const users = client.db(dbName).collection('users');
    try {
      const user = await users.findOne({ username: username });
      if (!user) {
        return false;
      }
      inc_login_attempts(username); // increase login attempts
      const hashedPassword = await sha256(password);
      if (user.password.toString() === hashedPassword.toString()) {
        return user;
      } else {
        return false;
      }
    } catch (err) {
      console.log("Unable to fetch from database!");
      console.log(err);
      return false;
    }
  }
}


async function create_user(username, password, role, enabled, nickname, email, gender, birthDate, image) {
  const users = client.db(dbName).collection('users');
  // Update the user profile if found a matched username; otherwise insert a new record
  const isMatched = await validate_user(username, password);
  const hashedPassword = await sha256(password);
  try {
    users.updateOne(
      { username: username },
        { $set: { 
        password: hashedPassword, 
        role: role, 
        enabled: enabled, 
        nickname: nickname,
        email: email,
        gender: gender,
        birthDate: birthDate,
        image: image
      } },
        { upsert: true });

    if (isMatched == false) {
      console.log("Added 1 user");
    } else {
      console.log("Added 0 user");
    }
    return true;

  } catch(err) {
    console.log("Unable to update the database!");
    return false;
  }
}

async function update_user(username, updates) {
  const users = client.db(dbName).collection('users');

  // Create an object to store the fields to be updated
  let updateFields = {};

  // Hash the password if it is provided
  if (updates.password) {
    const hashedPassword = await sha256(updates.password);
    updateFields.password = hashedPassword;
  }

  // Add other fields to the updateFields object if they are provided
  if (updates.role) updateFields.role = updates.role;
  if (updates.enabled) updateFields.enabled = updates.enabled;
  if (updates.nickname) updateFields.nickname = updates.nickname;
  if (updates.email) updateFields.email = updates.email;
  if (updates.gender) updateFields.gender = updates.gender;
  if (updates.birthDate) updateFields.birthDate = updates.birthDate;
  if (updates.image) updateFields.image = updates.image;

  try {
    // Check if the user exists and the password is changed
    const user = await fetch_user(username);
    if (user && updates.password && user.password !== updateFields.password) {
      inc_password_change_attempts(username); // increase password change attempts
    }
    
    // Update the user in the database
    const result = await users.updateOne({ username: username }, { $set: updateFields });
    if (result.modifiedCount > 0) {
      inc_profile_change_attempts(username); // increase profile change attempts
    }
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("Error updating user:", err);
    return false;
  }
}


async function fetch_user(username) {
  try {
    const users = client.db(dbName).collection('users');
    const user = await users.findOne({ username: username }, { projection: { password: 0 } }); // no need password 
    return user;
  } catch (err) {
    console.log("Unable to fetch from database!", err);
    return null;
  }
}

async function fetch_all_users() {
    const users = client.db(dbName).collection('users');
    try {
        return await users.find({}, { projection: { password: 0 } }).toArray();
    } catch (err) {
        console.error("Error fetching all users:", err);
        return [];
    }
}


async function username_exist(username) {
  try {
    const result = await fetch_user(username);
    console.log(result);
    if (result == null) {
      console.log(result);
      return false;
    } else {
      return true;
    }
  } catch(err) {
    console.log("Unable to fetch from database!");
  }
}

async function fetch_user_orders(username) {
  try {
    const users = client.db(dbName).collection('users');
    if (username) {
      const userTransactions = await users.findOne(
        { username: username },
        { projection: { transactions: 1 } }
        );
        return userTransactions;
    } else {
      const allUsersTransactions = await users.find({},
        { projection: { 
          username: 1,
          transactions: 1 } }
        ).toArray();
        return allUsersTransactions; 
    }
  } catch (err) {
    console.error("Error fetching user orders:", err);
    return [];
  }
}

async function add_order_to_user(username, newOrder) {
  try {
    const users = client.db(dbName).collection('users');
    const result = await users.updateOne(
      { username: username },
      { $push: { transactions: newOrder } }
    );
    
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("Error adding order to user:", err);
    return false;
  }
}

async function inc_login_attempts(username) {
  try {
    const users = client.db(dbName).collection('users');
    const result = await users.updateOne(
      { username: username },
      { $inc: { loginAttempts: 1 } }
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("Error increasing login attempts:", err);
    return false;
  }
}

async function inc_password_change_attempts(username) {
  try {
    const users = client.db(dbName).collection('users');
    const result = await users.updateOne(
      { username: username },
      { $inc: { passwordChangeAttempts: 1 } }
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("Error increasing password change attempts:", err);
    return false;
  }
}

async function inc_profile_change_attempts(username) {
  try {
    const users = client.db(dbName).collection('users');
    const result = await users.updateOne(
      { username: username },
      { $inc: { profileChangeAttempts: 1 } }
    );
      return result.modifiedCount > 0;
    } catch (err) {
      console.error("Error increasing profile change attempts:", err);
      return false;
    }
}

console.log(Date() + '\nServer started at http://127.0.0.1:8080');
// init_db().catch(console.dir);

export { validate_user, create_user, fetch_user, username_exist, fetch_user_orders, 
        add_order_to_user, update_user, fetch_all_users, inc_login_attempts, 
        inc_password_change_attempts, inc_profile_change_attempts };