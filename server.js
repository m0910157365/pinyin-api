const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. Middleware 設定 ---
app.use(cors()); // 務必在路由之前，允許 GitHub Pages 存取
app.use(express.json());

// --- 2. 連線設定 ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://m0910157365_db_user:m729421@cluster0.stpndej.mongodb.net/?appName=Cluster0";
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB 連線成功'))
  .catch((err) => {
    console.error('❌ MongoDB 連線失敗:', err.message);
    process.exit(1); 
  });

// --- 3. 資料庫模型 (使用保護機制防止重複定義) ---
const pinyinSchema = new mongoose.Schema({
  chinese_char: { type: String, required: true, unique: true },
  pinyin: { type: String, required: true }
});

const Pinyin = mongoose.models.Pinyin || mongoose.model('Pinyin', pinyinSchema);

// --- 4. API 路由 ---

// 健康檢查
app.get('/', (req, res) => {
  res.status(200).send('Pinyin API 服務運行中！');
});

// 遊戲題目 API (隨機 15 題)
app.get('/api/questions', async (req, res) => {
  try {
    const data = await Pinyin.aggregate([{ $sample: { size: 15 } }]);
    const formatted = data.map(item => {
      const distractors = ["ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ"].filter(d => d !== item.pinyin);
      const shuffled = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
      return {
        _id: item._id,
        w: item.chinese_char,
        t: item.chinese_char[0],
        c: item.pinyin,
        o: [item.pinyin, ...shuffled].sort(() => 0.5 - Math.random()) // 打亂選項順序
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: '無法獲獲題目' });
  }
});

// 啟動
app.listen(PORT, () => {
  console.log(`✅ 伺服器監聽中: ${PORT}`);
});