const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 確保 app 只有在此處宣告一次
const app = express();

// --- 1. Middleware 設定 ---
app.use(cors()); 
app.use(express.json());

// --- 2. 連線設定 ---
// 這裡會自動讀取 Render 的 MONGO_URI 環境變數，本地則用備用字串
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://m0910157365_db_user:m729421@cluster0.stpndej.mongodb.net/?appName=Cluster0";
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB 連線成功'))
  .catch((err) => {
    console.error('❌ MongoDB 連線失敗:', err.message);
    process.exit(1); 
  });

// --- 3. 資料庫 Schema 定義 ---
// 使用 mongoose.models 檢查，避免重複定義模型
const pinyinSchema = new mongoose.Schema({
  chinese_char: { type: String, required: true, unique: true },
  pinyin: { type: String, required: true }
});

const Pinyin = mongoose.models.Pinyin || mongoose.model('Pinyin', pinyinSchema);

// --- 4. API 路由定義 ---

// 根路徑：供 Render 健康檢查
app.get('/', (req, res) => {
  res.status(200).send('Pinyin API 服務運行中！');
});

// 遊戲題目 API：隨機抽取 15 題
app.get('/api/questions', async (req, res) => {
  try {
    const data = await Pinyin.aggregate([{ $sample: { size: 15 } }]);
    
    const formattedQuestions = data.map(item => {
      const distractors = ["ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ", "ㄏ"];
      const shuffledDistractors = distractors
        .filter(d => d !== item.pinyin)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      return {
        _id: item._id,
        w: item.chinese_char,
        t: item.chinese_char[0],
        c: item.pinyin,
        o: [item.pinyin, ...shuffledDistractors].sort(() => 0.5 - Math.random())
      };
    });
    
    res.json(formattedQuestions);
  } catch (error) {
    console.error('API 錯誤:', error);
    res.status(500).json({ error: '無法獲取題目' });
  }
});

// --- 5. 啟動伺服器 ---
app.listen(PORT, () => {
  console.log(`✅ 伺服器已啟動，監聽連接埠: ${PORT}`);
});