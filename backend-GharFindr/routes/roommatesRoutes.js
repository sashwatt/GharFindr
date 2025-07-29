const express = require('express');
const router = express.Router();
const Roommate = require('../models/roommatesModel');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const roommatesController = require('../controllers/roommatesController');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Get all roommates
router.get('/', verifyToken, async (req, res) => {
  try {
    const show = req.query.show || false; // Optional query parameter to show all roommates
    const roommates = !show ? await Roommate.where('user_id', req.user.id).find() : await Roommate.find();
    res.json(roommates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new roommate with image
router.post('/', verifyToken, upload.single('roommateImage'), async (req, res) => {
  try {
    const data = req.body;
    data.user_id = req.user.id; // Set user_id from the authenticated user
    if (req.file) {
      data.roommateImage = req.file.path;
    }
    const roommate = new Roommate(data);
    await roommate.save();
    res.status(201).json(roommate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single roommate by ID
router.get('/:id', async (req, res) => {
  try {
    const roommate = await Roommate.findById(req.params.id);
    if (!roommate) {
      return res.status(404).json({ error: 'Roommate not found' });
    }
    res.json(roommate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", verifyToken, upload.single("roommateImage"), async (req, res) => {
  try {
    const roomMateId = req.params.id; // Get the room ID from the URL parameter

    const data = req.body;
    data.user_id = req.user.id; // Set user_id from the authenticated user
    if (req.file) {
      data.roommateImage = req.file.path;
    }
    // Find the room by ID and update it
    console.log(data?.gender?.toLowerCase());
    const updatedRoom = await Roommate.findByIdAndUpdate(
      roomMateId,
      {
        ...data,
        gender: data?.gender?.toLowerCase(),
        roomImage: req.file ? req.file.path : undefined, // Update the image if a new image is provided
        user_id: req.user.id 
      },
      { new: true } // This will return the updated room document
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Room updated successfully", room: updatedRoom });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Failed to update room" });
  }
});

// Delete a roommate by ID
router.delete('/:id', verifyToken, roommatesController.deleteRoommate);

module.exports = router;