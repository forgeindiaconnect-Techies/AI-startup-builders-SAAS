import express from 'express';

const router = express.Router();

// Mock notification endpoint
router.post('/', (req, res) => {
  const { title, message, type } = req.body;
  
  // In a real app, save to MongoDB Notification collection
  console.log(`🔔 Notification Created: [${type}] ${title} - ${message}`);

  res.status(201).json({
    success: true,
    message: 'Notification created successfully'
  });
});

export default router;
