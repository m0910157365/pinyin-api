const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // 引入跨來源資源共享套件

const app = express();

// --- 設置 Middleware ---
app.use(cors()); // 啟動 CORS，允許 GitHub Pages 跨網域存取
app.use(express.json()); // 解析 JSON 格式的請求體

// --- 環境變數與連線設定 ---
// 優先使用 Render 環境變數，若無則使用您提供的連線字串
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://m0910157365_db_user:m729421@cluster0.stpndej.mongodb.net/?appName=Cluster0";
const PORT = process.env.PORT || 3000;

// 連線到 MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB 連線成功');
  })
  .catch((err) => {
    console.error('❌ MongoDB 連線失敗:', err.message);
    process.exit(1); // 部署時連線失敗則停止服務
  });

// --- 資料庫 Schema 定義 ---
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

// 1. 根路由：用於 Render 健康檢查 (Health Check)
app.get('/', (req, res) => {
  res.status(200).send('Pinyin API 服務正在運行中！');
});

// 2. 獲取遊戲題目 (轉換格式以符合前端 w, t, c, o 需求)
app.get('/api/questions', async (req, res) => {
  try {
    // 從資料庫隨機抓取 15 筆資料 (這裡使用樣本隨機取樣)
    const data = await Pinyin.aggregate([{ $sample: { size: 15 } }]);
    
    // 轉換資料結構以符合遊戲邏輯
    const formattedQuestions = data.map(item => {
      // 簡單的選項生成邏輯：正確答案 + 三個隨機注音（建議未來可從資料庫抓取更多真實選項）
      const distractors = ["ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ"];
      const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      return {
        _id: item._id,
        w: item.chinese_char,     // 詞彙 (例如: 滑稽)
        t: item.chinese_char[0],  // 目標字 (取第一個字)
        c: item.pinyin,           // 正確拼音/注音
        o: [item.pinyin, ...shuffledDistractors] // 選項組合
      };
    });
    
    res.json(formattedQuestions);
  } catch (error) {
    console.error('獲取題目失敗:', error);
    res.status(500).json({ error: '無法從資料庫獲取題目' });
  }
});

// 3. 查詢單個字 (保留原本功能)
app.get('/api/pinyin', async (req, res) => {
  try {
    const char = req.query.char;
    if (!char) return res.status(400).json({ error: '請提供要查詢的中文字' });

    const result = await Pinyin.findOne({ chinese_char: char });
    if (result) {
      res.json({ chinese_char: result.chinese_char, pinyin: result.pinyin });
    } else {
      res.status(404).json({ error: `找不到字 '${char}' 的資料` });
    }
  } catch (error) {
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
});

// 4. 題目回報 (API 節點佔位，可根據需求擴充邏輯)
app.post('/api/report', async (req, res) => {
  const { questionId } = req.body;
  console.log(`收到題目回報 ID: ${questionId}`);
  // 這裡可加入存入資料庫或計數邏輯
  res.status(200).json({ message: "回報成功" });
});

// --- 啟動伺服器 ---
app.listen(PORT, () => {
  console.log(`✅ 伺服器已啟動，正在監聽連接埠: ${PORT}`);
});