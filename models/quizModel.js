const mongoose = require("mongoose");

// 定義題目資料結構
const quizSchema = new mongoose.Schema({
    word: { type: String, required: true },   // 中文字詞
    pinyin: { type: String, required: true }, // 拼音
    category: { type: String }                // 分類 (選填)
});

// 這裡的 "Quiz" 對應到資料庫中的 quizzes 集合
module.exports = mongoose.model("Quiz", quizSchema);