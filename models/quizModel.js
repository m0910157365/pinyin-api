const mongoose = require("mongoose");
const quizSchema = new mongoose.Schema({
    word: { type: String, required: true },
    pinyin: { type: String, required: true }
});
// 這裡會自動對應到資料庫中的 quizzes 集合
module.exports = mongoose.model("Quiz", quizSchema);