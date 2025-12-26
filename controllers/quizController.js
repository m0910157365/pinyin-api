const Progress = require("../models/Progress");

exports.getAICountDownQuiz = async (req, res) => {
    try {
        const { userId = "m0910_student", unit = "字音" } = req.body;
        
        // 🔑 您的最新有效金鑰
        const apiKey = "AIzaSyB9Zz8ato5VCDaBAMG9BVYRT4WGoygVZzI"; 
        
        // 🚀 經過驗證的模型路徑，確保避開 404 錯誤
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

        const prompt = {
            contents: [{
                parts: [{
                    text: `你是一位專業的中文老師，請針對「${unit}」單元出一題單選題。
                    請嚴格按照以下 JSON 格式回傳，不要有其他文字：
                    {"question":"題目內容","options":["選項A","選項B","選項C","選項D"],"answer":0,"explanation":"解析內容"}
                    (answer 請給 0-3 的數字，代表正確選項的索引)`
                }]
            }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const result = await response.json();

        // 🔍 專門處理限流 (RESOURCE_EXHAUSTED) 的邏輯
        if (result.error) {
            if (result.error.status === "RESOURCE_EXHAUSTED") {
                return res.status(429).json({ 
                    success: false, 
                    message: "AI 老師正在備課中（限流），請等 60 秒後再點一次。" 
                });
            }
            return res.status(500).json({ success: false, message: "AI 連線異常，請稍後再試" });
        }

        // 解析 AI 回傳的文字內容
        const text = result.candidates[0].content.parts[0].text;
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const quizData = JSON.parse(cleanJson);

        res.json({ success: true, data: quizData });

    } catch (error) {
        console.error("出題失敗:", error);
        res.status(500).json({ success: false, message: "伺服器處理異常，請檢查網路連線" });
    }
};