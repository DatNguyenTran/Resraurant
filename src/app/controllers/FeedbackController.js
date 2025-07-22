//1
// feedbackController.js

// Giả sử dùng Express.js
// const feedbackController = {
//   submitFeedback: (req, res) => {
//     const { name, email, message } = req.body;

//     // Kiểm tra dữ liệu đơn giản
//     if (!name || !email || !message) {
//       return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin phản hồi.' });
//     }

//     // Log feedback ra console (có thể thay bằng lưu vào DB)
//     console.log('Feedback nhận được:', {
//       name,
//       email,
//       message,
//       submittedAt: new Date().toISOString()
//     });

//     // Phản hồi thành công
//     res.status(200).json({ message: 'Cảm ơn bạn đã gửi phản hồi!' });
//   }
// };

// module.exports = feedbackController;


