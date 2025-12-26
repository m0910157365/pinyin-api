const express = require("express");
const router = express.Router();
const Quiz = require("../models/quizModel");

// 這裡寫 "/"，對應到 app.js 的 "/api/quiz"
router.get("/", async (req, res) => {
    try {
        const questions = await Quiz.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;