const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. Middleware 設定 ---
// 務必放在路由之前，確保前端 GitHub Pages 可以跨網域存取
app.use(cors()); 
app.use(express.json());

// --- 2. 連線設定 ---
// 優先讀取 Render 環境變數，本地測試則使用備用字串
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://m0910157365_db_user:m729421@cluster0.stpndej.mongodb.net/?appName=Cluster0";
const PORT = process.env.PORT || 3000;

// 連線到 MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB 連線成功'))
  .catch((err) => {
    console.error('❌ MongoDB 連線失敗:', err.message);
    process.exit(1); 
  });

// --- 3. 資料庫 Schema 與 Model 定義 ---
const pinyinSchema = new mongoose.Schema({
  chinese_char: { type: String, required: true, unique: true },
  pinyin: { type: String, required: true }
});

// 檢查是否已定義模型，避免在某些環境下重複定義報錯
const Pinyin = mongoose.models.Pinyin || mongoose.model('Pinyin', pinyinSchema);

// --- 4. API 路由定義 ---

// 根路徑：供 Render 健康檢查使用
app.get('/', (req, res) => {
  res.status(200).send('Pinyin API 服務運行中！');
});

// 遊戲專用 API：隨機抓取 15 題並轉換格式
app.get('/api/questions', async (req, res) => {
  try {
    // 隨機抽選 15 筆資料
    const data = await Pinyin.aggregate([{ $sample: { size: 15 } }]);
    
    const formattedQuestions = data.map(item => {
      // 生成干擾選項 (隨機注音)
      const distractors = ["ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ", "ㄏ"];
      const shuffledDistractors = distractors
        .filter(d => d !== item.pinyin) // 確保干擾項不與正確答案重複
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      return {
        _id: item._id,
        w: item.chinese_char,      // 完整詞彙
        t: item.chinese_char[0],   // 目標字
        c: item.pinyin,            // 正確答案
        o: [item.pinyin, ...shuffledDistractors] // 合併選項
      };
    });
    
    res.json(formattedQuestions);
  } catch (error) {
    console.error('API 錯誤:', error);
    res.status(500).json({ error: '無法獲取題目' });
  }
});

// 題目回報 API (佔位邏輯)
app.post('/api/report', async (req, res) => {
  const { questionId } = req.body;
  console.log(`收到回報題目 ID: ${questionId}`);
  res.status(200).json({ message: "已收到回報" });
});

// --- 5. 啟動伺服器 ---
app.listen(PORT, () => {
  console.log(`✅ 伺服器已啟動，監聽連接埠: ${PORT}`);
});