const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

// ✅ 1. 開放跨網域存取 (解決連線失敗)
app.use(cors()); 

app.use(express.json());

// ✅ 2. 修正路由路徑：這行對應前端的 /api/quiz
// 如果前端連線 https://.../api/quiz，後端就會進到 quizRoutes 處理
app.use("/api/quiz", quizRoutes);

// ✅ 3. 讀取 Render 環境變數 (請確保您已修正為 m0910157365_db_user)
const mongoURI = process.env.MONGODB_URI; 

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    family: 4 // 強制使用 IPv4 避免雲端解析錯誤
})
.then(() => {
    console.log("✅ 成功連接到 MongoDB 星空資料庫"); //
})
.catch((err) => {
    console.error("❌ MongoDB 連接失敗:", err.message); //
});

// ✅ 4. 根目錄測試（方便您檢查伺服器是否活著）
app.get("/", (req, res) => {
    res.send("🚀 拼音星空 API 伺服器正在運作中！");
});

// ✅ 5. 讓 Render 自動分配 Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 伺服器運行於埠號 ${PORT}`);
});