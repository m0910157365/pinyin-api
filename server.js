const express = require('express');
const mongoose = require('mongoose');

// **修正點：只有這行宣告 express 模組**
const app = express();

// 從 Render 環境變數中獲取 MongoDB 連線字串和連接埠
// Render 會自動注入 MONGO_URI 和 PORT (或使用 Render 自動分配的 Port)
const MONGO_URI = process.env.MONGO_URI; 
const PORT = process.env.PORT || 3000; // 在 Render 上使用 process.env.PORT

// 連線到 MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB 連線成功');
  })
  .catch((err) => {
    console.error('❌ MongoDB 連線失敗:', err.message);
    // 部署時，如果連線失敗，讓應用程式退出
    process.exit(1);
  });

// 設置 middleware
app.use(express.json()); // 處理 JSON 格式的請求體

// --- 資料庫 Schema 定義 (請確保您的 Schema 內容是正確的) ---
const pinyinSchema = new mongoose.Schema({
  chinese_char: {
    type: String,
    required: true,
    unique: true
  },
  pinyin: {
    type: String,
    required: true
  }
});

const Pinyin = mongoose.model('Pinyin', pinyinSchema);

// --- API 路由定義 ---

// 根路由：用於 Render 健康檢查 (Health Check)
app.get('/', (req, res) => {
  res.status(200).send('Pinyin API 服務正在運行中！');
});

// 查詢單個字
// 範例: GET /api/pinyin?char=你
app.get('/api/pinyin', async (req, res) => {
  try {
    const char = req.query.char;

    if (!char) {
      return res.status(400).json({ error: '請提供要查詢的中文字 (char 參數)' });
    }

    const result = await Pinyin.findOne({ chinese_char: char });

    if (result) {
      res.json({ chinese_char: result.chinese_char, pinyin: result.pinyin });
    } else {
      res.status(404).json({ error: `找不到字 '${char}' 的拼音資料` });
    }
  } catch (error) {
    console.error('查詢失敗:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`✅ 伺服器已啟動，正在監聽連接埠: ${PORT}`);
});