import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/tournaments - Fetch all tournaments
router.get('/', async (req, res) => {
  const q = "SELECT * FROM tournaments ORDER BY start_date DESC";
  try {
    const [data] = await db.query(q);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching tournaments:", err);
    return res.status(500).json({ error: "Failed to fetch tournaments" });
  }
});

export default router;