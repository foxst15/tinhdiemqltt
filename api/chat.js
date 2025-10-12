// Nội dung của file /api/chat.js

// Vercel sẽ tự động hiểu đây là một serverless function
export default async function handler(request, response) {
  // Chỉ chấp nhận yêu cầu bằng phương thức POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Phương thức không được phép' });
  }

  try {
    // 1. Lấy câu hỏi từ request mà frontend gửi lên
    const { query } = request.body;
    if (!query) {
      return response.status(400).json({ error: 'Câu hỏi bị thiếu' });
    }

    // 2. Lấy API key một cách BÍ MẬT từ Biến Môi trường trên Vercel
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return response.status(500).json({ error: 'API key chưa được cấu hình trên server' });
    }
    
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    // 3. Gửi yêu cầu đến API của Google từ server
    const geminiResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: query }] }] })
    });

    const responseData = await geminiResponse.json();

    if (!geminiResponse.ok) {
        console.error("Lỗi từ Google API:", responseData);
        throw new Error(responseData.error?.message || 'Lỗi không xác định từ Google API');
    }
    
    // 4. Gửi kết quả thành công trở lại cho frontend
    response.status(200).json(responseData);

  } catch (error) {
    console.error("Lỗi trong serverless function:", error);
    // 5. Nếu có lỗi, gửi thông báo lỗi về cho frontend
    response.status(500).json({ error: error.message });
  }
}