const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.post('/get-quiz', quizController.getAICountDownQuiz);

module.exports = router;