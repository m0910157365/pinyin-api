const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

// ✅ 1. 開放跨網域存取 (解決您截圖中的連線失敗問題)
app.use(cors()); 

app.use(express.json());

// ✅ 2. 靜態檔案設定 (如果您以後有 public 資料夾可用)
app.use(express.static(path.join(__dirname, "public")));

// ✅ 3. 讀取 Render 環境變數中的 MONGODB_URI
const mongoURI = process.env.MONGODB_URI; 

// ✅ 4. 設定資料庫連線選項
const connectOptions = {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    family: 4 // 強制使用 IPv4 避免 DNS 解析錯誤
};

mongoose.connect(mongoURI, connectOptions)
    .then(() => {
        console.log("✅ 成功連接到 MongoDB 星空資料庫"); //
    })
    .catch((err) => {
        console.error("❌ 資料庫連線失敗:", err.message);
    });

// ✅ 5. 路由設定 (確保路徑與前端一致)
app.use("/api/quiz", quizRoutes);

// ✅ 6. 讓 Render 自動分配 Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 雲端伺服器運行於埠號 ${PORT}`); //
});