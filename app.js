const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const quizRoutes = require("./routes/quizRoutes"); // ✅ 連結您的路由檔案

const app = express();

// ✅ 1. 開放跨網域存取 (解決 index.html 的連線失敗)
app.use(cors()); 

app.use(express.json());

// ✅ 2. 定義 API 路由路徑 (解決 404 錯誤)
// 這會讓 https://您的網址/api/quiz 能夠對應到 quizRoutes.js
app.use("/api/quiz", quizRoutes);

// ✅ 3. 讀取 Render 環境變數 (請確保您在 Render 設定了 MONGODB_URI)
const mongoURI = process.env.MONGODB_URI; 

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    family: 4 // 強制使用 IPv4 以確保雲端連線穩定
})
.then(() => {
    console.log("✅ 成功連接到 MongoDB 星空資料庫"); //
})
.catch((err) => {
    // 如果出現 bad auth，代表帳號或密碼填錯了
    console.error("❌ MongoDB 連接失敗:", err.message); 
});

// ✅ 4. 基礎檢查路徑
app.get("/", (req, res) => {
    res.send("🚀 拼音星空伺服器已啟動，請嘗試從 index.html 練習！");
});

// ✅ 5. 設定通訊埠 (Render 專用)
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 伺服器運行於埠號 ${PORT}`);
});