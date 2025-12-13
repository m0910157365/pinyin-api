const mongoose = require('mongoose');

// 🚨 您的 MongoDB 連線字串 (已嵌入您提供的最新網址和憑證)
const MONGO_URI = 'mongodb+srv://m0910157365_db_user:m729421@cluster0.stpndej.mongodb.net/pinyin_db?retryWrites=true&w=majority&appName=Cluster0';

// 函數 A：連線到 MongoDB
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB 連線成功！資料庫已準備就緒。');
    } catch (error) {
        console.error('❌ MongoDB 連線失敗:', error.message);
        throw error; // 拋出錯誤讓伺服器知道連線失敗
    }
}

// ----------------------------------------
// Mongoose 綱要 (Schema) 和模型 (Model) 定義
// ----------------------------------------

const questionSchema = new mongoose.Schema({
    question_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    word: {
        type: String,
        required: true
    },
    correct_pinyin: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    difficulty_score: {
        type: Number,
        default: 0.5
    }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

// ----------------------------------------
// 資料庫操作 (CRUD 函數)
// ----------------------------------------

async function getAllQuestions() {
    const questions = await Question.find({}); 
    return questions;
}

async function createQuestion(questionData) {
    try {
        const newQuestion = await Question.create(questionData);
        return newQuestion;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error(`題目新增失敗：question_id '${questionData.question_id}' 已存在。`);
        }
        console.error("❌ 新增題目失敗:", error);
        throw new Error("無法新增題目。");
    }
}

async function updateQuestion(id, updates) {
    if (!id || !updates || Object.keys(updates).length === 0) {
        throw new Error("請提供要更新的 question_id 和更新數據。");
    }

    const result = await Question.findOneAndUpdate(
        { question_id: id },
        { $set: updates },
        { new: true }
    );

    if (!result) {
        throw new Error(`找不到 question_id 為 ${id} 的題目。`);
    }
    
    return result;
}

async function deleteQuestion(id) {
    if (!id) {
        throw new Error("請提供要刪除的 question_id。");
    }

    const result = await Question.findOneAndDelete({ question_id: id });

    if (!result) {
        throw new Error(`找不到 question_id 為 ${id} 的題目，刪除失敗。`);
    }

    return { message: `question_id ${id} 刪除成功。`, deletedData: result };
}


// 導出函數
module.exports = {
    connectDB,
    getAllQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
};