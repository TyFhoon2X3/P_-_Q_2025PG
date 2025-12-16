const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/ContactController");

// Public route to send message
router.post("/", sendMessage);

// Admin route to view messages (Optional for now, but good to have)
// You might want to protect this with ensureAuthenticated later
router.get("/", getMessages);

module.exports = router;
