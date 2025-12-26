const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 中間件設定 ---
app.use(cors());
app.use(express.json());

// --- 1. 連接 MongoDB ---
// 優先讀取 Render 後台設定的 MONGODB_URI 環境變數
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
// 根據你的資料庫結構定義
const pinyinSchema = new mongoose.Schema({
    word: String,          // 完整詞語 (如: 開心)
    chinese_char: String,  // 目標單字 (如: 開)
    pinyin: String         // 正確注音 (如: ㄎㄞ)
});

const Pinyin = mongoose.model('Pinyin', pinyinSchema, 'pinyins');

// --- 3. 輔助函數：生成注音選項 ---
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
    return Array.from(options).sort(() => Math.random() - 0.5);
}

// --- 4. API 路由：獲取題目 ---
app.get('/api/questions', async (req, res) => {
    try {
        // 從資料庫隨機抽取 15 筆資料
        const data = await Pinyin.aggregate([{ $sample: { size: 15 } }]);
        
        if (data.length === 0) {
            return res.status(404).json({ error: "資料庫內沒有題目" });
        }

        const questions = data.map(p => ({
            _id: p._id,
            w: p.word || p.chinese_char, // 詞語
            t: p.chinese_char,           // 目標字
            c: p.pinyin,                 // 正確答案
            o: generateOptions(p.pinyin) // 隨機生成的四個選項
        }));

        res.json(questions);
    } catch (err) {
        console.error('API 錯誤:', err);
        res.status(500).json({ error: "伺服器內部錯誤" });
    }
});

// 根目錄測試路由
app.get('/', (req, res) => {
    res.send('注音 API 伺服器正在運行中！');
});

// --- 5. 啟動伺服器 ---
// Render 會自動分配 PORT，若本地執行則預設使用 10000
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 伺服器已啟動，網址：https://pinyin-api-h76b.onrender.com`);
});