const express = require('express');
// 導入所有資料庫操作函數
const { 
    connectDB, 
    getAllQuestions, 
    createQuestion, 
    updateQuestion, 
    deleteQuestion 
} = require('./db'); 
const express = require('express');
const cors = require('cors'); 

// 導入所有資料庫操作函數
const { 
    connectDB, 
    getAllQuestions, 
    createQuestion, 
    updateQuestion, 
    deleteQuestion 
} = require('./db'); 

// 初始化 Express 應用程式
const app = express();
const PORT = 3000;

// ----------------------------------------
// 中間件 (Middleware)
// ----------------------------------------
app.use(cors()); 
app.use(express.json());

// ----------------------------------------
// 路由 (Routes)
// ----------------------------------------

// 1. GET /api/questions - 獲取所有題目
app.get('/api/questions', async (req, res, next) => {
    try {
        const questions = await getAllQuestions();
        res.status(200).json({ 
            success: true, 
            count: questions.length,
            data: questions 
        });
    } catch (error) {
        next(error); 
    }
});

// 2. POST /api/questions - 新增題目
app.post('/api/questions', async (req, res, next) => {
    try {
        const newQuestion = await createQuestion(req.body);
        res.status(201).json({ 
            success: true, 
            data: newQuestion 
        });
    } catch (error) {
        next(error);
    }
});

// 3. PUT /api/questions/:id - 更新題目
app.put('/api/questions/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "請提供要更新的數據。"
            });
        }

        const updatedQuestion = await updateQuestion(id, updates);
        
        res.status(200).json({
            success: true,
            message: `question_id ${id} 更新成功。`,
            data: updatedQuestion
        });
    } catch (error) {
        if (error.message.includes('找不到 question_id')) {
            error.statusCode = 404;
        }
        next(error);
    }
});

// 4. DELETE /api/questions/:id - 刪除題目
app.delete('/api/questions/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await deleteQuestion(id);
        
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        if (error.message.includes('找不到 question_id')) {
            error.statusCode = 404;
        }
        next(error);
    }
});

// ----------------------------------------
// 集中式錯誤處理中間件
// ----------------------------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message;
    
    if (statusCode === 500) {
        message = '伺服器內部錯誤，請檢查伺服器日誌。';
    }
    
    if (err.type === 'entity.parse.failed' || err.message.includes('SyntaxError')) {
        message = '請求主體 (JSON body) 格式錯誤，請檢查 JSON 語法。';
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
    });
});

// ----------------------------------------
// 啟動伺服器 (已復原)
// ----------------------------------------

// 啟動資料庫連線，成功後才啟動 Express 伺服器
connectDB()
    .then(() => {
        // Render 會自動分配 PORT，但您的程式碼需要一個 PORT 來監聽
        // Render 的環境會自動設置 PORT 環境變數，但您的程式碼中必須使用 process.env.PORT
        // 我們將您的 PORT 變數改為使用環境變數或預設 3000
        const serverPort = process.env.PORT || PORT;
        
        app.listen(serverPort, () => {
            console.log(`✅ 伺服器已啟動，正在監聽 http://localhost:${serverPort}`);
        });
    })
    .catch((error) => {
        console.error('❌ 伺服器啟動失敗，原因:', error.message);
        process.exit(1);
    });
// 初始化 Express 應用程式
const app = express();
const PORT = 3000;

// ----------------------------------------
// 中間件 (Middleware)
// ----------------------------------------

// 解析 JSON 格式的請求主體 (body)
app.use(express.json());

// ----------------------------------------
// 路由 (Routes)
// ----------------------------------------

// 1. GET /api/questions - 獲取所有題目
app.get('/api/questions', async (req, res, next) => {
    try {
        const questions = await getAllQuestions();
        res.status(200).json({ 
            success: true, 
            count: questions.length,
            data: questions 
        });
    } catch (error) {
        // 將錯誤傳遞給集中式錯誤處理中間件
        next(error); 
    }
});

// 2. POST /api/questions - 新增題目
app.post('/api/questions', async (req, res, next) => {
    try {
        const newQuestion = await createQuestion(req.body);
        res.status(201).json({ 
            success: true, 
            data: newQuestion 
        });
    } catch (error) {
        // 將錯誤傳遞給集中式錯誤處理中間件
        next(error);
    }
});

// 3. PUT /api/questions/:id - 更新題目
app.put('/api/questions/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // 確保請求主體不為空，否則會更新失敗
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "請提供要更新的數據。"
            });
        }

        const updatedQuestion = await updateQuestion(id, updates);
        
        res.status(200).json({
            success: true,
            message: `question_id ${id} 更新成功。`,
            data: updatedQuestion
        });
    } catch (error) {
        // 根據錯誤類型設置 HTTP 狀態碼
        if (error.message.includes('找不到 question_id')) {
            error.statusCode = 404;
        }
        next(error);
    }
});

// 4. DELETE /api/questions/:id - 刪除題目
app.delete('/api/questions/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await deleteQuestion(id);
        
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        // 根據錯誤類型設置 HTTP 狀態碼
        if (error.message.includes('找不到 question_id')) {
            error.statusCode = 404;
        }
        next(error);
    }
});

// ----------------------------------------
// 集中式錯誤處理中間件 (Error Handler Middleware)
// ----------------------------------------
// 這是 Express 識別錯誤處理中間件的特殊格式：必須有四個參數 (err, req, res, next)
app.use((err, req, res, next) => {
    console.error(err.stack); // 打印錯誤堆棧到伺服器控制台 (僅供除錯)
    
    // 設置狀態碼
    // 優先使用我們在路由中設定的 statusCode (例如 404)，否則使用 500
    const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
    
    // 設置響應訊息
    let message = err.message;
    
    // 如果是 500 錯誤，為了安全，我們可以提供一個更通用的訊息
    if (statusCode === 500) {
        message = '伺服器內部錯誤，請檢查伺服器日誌。';
    }
    
    // 特別處理 JSON 語法錯誤 (例如您之前遇到的 SyntaxError)
    if (err.type === 'entity.parse.failed' || err.message.includes('SyntaxError')) {
        message = '請求主體 (JSON body) 格式錯誤，請檢查 JSON 語法。';
        statusCode = 400;
    }


    res.status(statusCode).json({
        success: false,
        message: message,
    });
});

// ----------------------------------------
// 啟動伺服器
// ----------------------------------------

// 啟動資料庫連線，成功後才啟動 Express 伺服器
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ 伺服器已啟動，正在監聽 http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ 伺服器啟動失敗，原因:', error.message);
        process.exit(1); // 連線失敗則退出程序
    });