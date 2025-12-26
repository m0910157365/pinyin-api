const express = require("express");
const router = express.Router();
const Quiz = require("../models/quizModel"); // ✅ 連結剛建立的 Model

// 取得所有題目資料
router.get("/", async (req, res) => {
    try {
        const questions = await Quiz.find(); // 從 MongoDB 抓取
        res.json(questions);
    } catch (err) {
        console.error("抓取題目失敗:", err);
        res.status(500).json({ message: "伺服器抓取資料失敗" });
    }
});

module.exports = router;