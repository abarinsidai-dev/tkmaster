const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { GoogleGenAI } = require('@google/genai');

// @route   POST /api/recommend
// @desc    Get an AI event recommendation based on user prompt
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 1. Fetch all events from DB to use as context
    const events = await Event.find().lean();
    
    // Map events to a concise format for the AI
    const availableEvents = events.map(e => ({
      id: e._id.toString(),
      title: e.title,
      category: e.category,
      venue: e.venue,
      price: e.price,
      date: e.date,
      description: e.description
    }));

    // 2. Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY; 
    const ai = new GoogleGenAI({ apiKey });

    // 3. Build the prompt
    const systemPrompt = `
      You are an expert event concierge for 'tickt', a ticketing platform.
      Your goal is to recommend the single best event from the provided list based on the user's request.
      
      Available Events (JSON format):
      ${JSON.stringify(availableEvents, null, 2)}
      
      User Request: "${prompt}"
      
      Respond ONLY with a valid JSON object in the following format, nothing else (no markdown blocks, no extra text):
      {
        "eventId": "the_id_of_the_best_event",
        "reason": "A short, exciting 1-2 sentence explanation of why this is perfect for them."
      }
      If no event matches even slightly, return the ID of the most popular event (e.g. Taylor Swift or The Weeknd) and explain why it's a great alternative.
    `;

    // 4. Generate content
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });

    const responseText = response.text.trim();
    
    // Parse the JSON (strip markdown if the model accidentally included it)
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '');
    const recommendation = JSON.parse(cleanJson);

    // 5. Look up the full event object
    const matchedEvent = events.find(e => e._id.toString() === recommendation.eventId);

    if (!matchedEvent) {
       return res.status(404).json({ error: 'No match found' });
    }

    // Map _id to id
    matchedEvent.id = matchedEvent._id.toString();

    res.json({
      event: matchedEvent,
      reason: recommendation.reason
    });

  } catch (err) {
    console.error('AI Recommendation Error:', err);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

module.exports = router;
