const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 中間件設定
app.use(cors());
app.use(express.json());

// 1. 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ 成功連接到 MongoDB 星空資料庫'))
    .catch(err => console.error('❌ MongoDB 連接失敗:', err));

// 2. 定義資料模型 (包含 word 欄位)
const pinyinSchema = new mongoose.Schema({
    word: String,          // 完整詞語，例如：友誼
    chinese_char: String,  // 目標單字，例如：誼
    pinyin: String         // 正確注音，例如：ㄧˋ
});

const Pinyin = mongoose.model('Pinyin', pinyinSchema);

// 3. 輔助函數：生成亂序注音選項
function generateOptions(correctPinyin) {
    const allPinyins = [
        "ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ", "ㄏ",
        "ㄐ", "ㄑ", "ㄒ", "ㄓ", "ㄔ", "ㄕ", "ㄖ", "ㄗ", "ㄘ", "ㄙ", "ㄚ",
        "ㄛ", "ㄜ", "ㄝ", "ㄞ", "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ", "ㄤ", "ㄥ",
        "ㄦ", "ㄧ", "ㄨ", "ㄩ", "ˊ", "ˇ", "ˋ", "˙"
    ];
    
    let options = new Set([correctPinyin]);
    while (options.size < 4) {
        const randomPinyin = allPinyins[Math.floor(Math.random() * allPinyins.length)];
        options.add(randomPinyin);
    }
    return Array.from(options);
}

// 4. API 路由：獲取題目
app.get('/api/questions', async (req, res) => {
    try {
        // 從資料庫隨機抽取 15 筆資料
        const pinyins = await Pinyin.aggregate([{ $sample: { size: 15 } }]);
        
        if (pinyins.length === 0) {
            return res.status(404).json({ error: "資料庫內沒有題目，請先新增資料" });
        }

        const questions = pinyins.map(p => ({
            _id: p._id,
            w: p.word || p.chinese_char, // 傳送完整詞語 (友誼)
            t: p.chinese_char,           // 傳送目標字 (誼)
            c: p.pinyin,                 // 正確答案
            o: generateOptions(p.pinyin) // 亂序生成的四個選項
        }));

        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: "伺服器內部錯誤，無法獲取題目" });
    }
});

// 5. API 路由：題目回報 (佔位功能)
app.post('/api/report', async (req, res) => {
    console.log('收到題目回報 ID:', req.body.questionId);
    res.json({ message: "回報已收到" });
});

// 啟動伺服器
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 後端伺服器運行於埠號 ${PORT}`);
});