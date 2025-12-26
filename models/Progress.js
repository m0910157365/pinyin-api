const mongoose = require('mongoose');

/**
 * 學生進度模型 (Progress Model)
 * 用於記錄不同學生在各個單元的掌握度與等級
 */
const progressSchema = new mongoose.Schema({
  // 學生 ID (例如：student_test_user)
  userId: { 
    type: String, 
    required: true 
  },
  // 單元名稱 (例如：字音、字形)
  unit: { 
    type: String, 
    default: "字音" 
  },
  // 掌握度 (0-100)，會影響 AI 出題難度
  mastery: { 
    type: Number, 
    default: 10 
  },
  // 程度等級 (例如：基礎、進階、精熟)
  currentLevel: { 
    type: String, 
    default: "基礎" 
  },
  // 最後更新時間
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// 設定索引以便快速查詢
progressSchema.index({ userId: 1, unit: 1 });

// 將模型匯出，讓 Controller 可以使用 Progress.findOne 等功能
module.exports = mongoose.model('Progress', progressSchema);