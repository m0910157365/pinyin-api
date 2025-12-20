const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 中間件設定 ---
app.use(cors());
app.use(express.json());

// --- 1. 連接 MongoDB ---
// 在 Render 部署時，請在後台設定 MONGODB_URI 環境變數
const dbURI = process.env.MONGODB_URI || "mongodb+srv://m0910157365_db_user:m729421@cluster0.stpndej.mongodb.net/pinyin_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbURI)
    .then(() => {
        console.log('------------------------------------------');
        console.log('✅ 成功連接到 MongoDB 雲端資料庫');
        console.log('------------------------------------------');
    })
    .catch(err => {
        console.error('❌ MongoDB 連接失敗:');
        console.error(err.message);
    });

// --- 2. 定義資料模型 ---
const pinyinSchema = new mongoose.Schema({
    word: String,          // 完整詞語，例如：開心
    chinese_char: String,  // 目標單字，例如：開
    pinyin: String         // 正確注音，例如：ㄎㄞ
});

const Pinyin = mongoose.model('Pinyin', pinyinSchema, 'pinyins');

// --- 3. 輔助函數：生成亂序注音選項 ---
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
    // 將 Set 轉換成陣列並隨機打亂順序
    return Array.from(options).sort(() => Math.random() - 0.5);
}

// --- 4. API 路由：獲取題目 ---
app.get('/api/questions', async (req, res) => {
    try {
        // 從資料庫隨機抽取 15 筆資料
        const pinyins = await Pinyin.aggregate([{ $sample: { size: 15 } }]);
        
        if (pinyins.length === 0) {
            return res.status(404).json({ error: "資料庫內沒有題目" });
        }

        const questions = pinyins.map(p => ({
            _id: p._id,
            w: p.word || p.chinese_char, // 完整詞語
            t: p.chinese_char,           // 目標字
            c: p.pinyin,                 // 正確答案
            o: generateOptions(p.pinyin) // 隨機選項
        }));

        res.json(questions);
    } catch (err) {
        console.error('獲取題目失敗:', err);
        res.status(500).json({ error: "伺服器內部錯誤" });
    }
});

// --- 5. API 路由：題目回報 ---
app.post('/api/report', async (req, res) => {
    console.log('收到題目回報 ID:', req.body.questionId);
    res.json({ message: "回報已收到" });
});

// --- 啟動伺服器 ---
// Render 會自動分配 PORT，若本地執行則預設使用 10000
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 伺服器已啟動，監聽埠號：${PORT}`);
});