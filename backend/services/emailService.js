const nodemailer = require('nodemailer');

// Cấu hình email transporter
const createTransporter = () => {
  // Sử dụng Gmail SMTP (có thể thay đổi theo nhu cầu)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Template email thông báo sự kiện - phiên bản chuyên nghiệp
const createEventNotificationTemplate = (eventData, groupData, customContent = null) => {
  const { name, venue, time } = eventData;
  const { name: groupName } = groupData;
  
  // Sử dụng custom content nếu có, ngược lại dùng mặc định
  const emailSubject = customContent?.subject || `Sự kiện mới: ${name}`;
  const emailSubtitle = customContent?.subtitle || 'Nhóm trưởng vừa tạo một sự kiện mới. Hãy xem thông tin chi tiết và chuẩn bị tham gia!';
  const customMessage = customContent?.customMessage || '';
  
  // Tạo mã đơn hàng giả
  const eventCode = `EV${Date.now().toString().slice(-8)}`;
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  return {
    subject: emailSubject,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 680px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px 40px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .content { padding: 40px; }
          .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; }
          .event-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 20px 0; }
          .event-title { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .info-table td:first-child { font-weight: 600; color: #374151; background: #f9fafb; width: 30%; }
          .info-table td:last-child { color: #6b7280; }
          .info-table tr:last-child td { border-bottom: none; }
          .subtitle { font-size: 16px; line-height: 1.6; color: #4b5563; margin: 20px 0; text-align: center; }
          .custom-message { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .custom-message-title { font-weight: 600; color: #92400e; margin-bottom: 8px; }
          .custom-message-content { color: #92400e; line-height: 1.5; white-space: pre-line; }
          .cta-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); border: 2px solid transparent; }
          .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6); }
          .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
          .contact-info { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .contact-info p { color: #6b7280; font-size: 14px; line-height: 1.5; margin: 4px 0; }
          .contact-info .hotline { font-weight: 600; color: #1f2937; font-size: 16px; }
          .footer { background: #1f2937; color: #9ca3af; padding: 24px 40px; text-align: center; font-size: 14px; line-height: 1.5; }
          .footer p { margin: 4px 0; }
          .footer .brand { color: white; font-weight: 600; }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .info-table td { padding: 8px 12px; font-size: 13px; }
            .info-table td:first-child { width: 40%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Sự Kiện Mới Được Tạo!</h1>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Chào bạn,
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Nhóm trưởng của nhóm <strong>${groupName}</strong> vừa tạo một sự kiện mới. 
              Dưới đây là thông tin chi tiết về sự kiện:
            </p>

            <!-- Event Details -->
            <div class="event-details">
              <div class="event-title">${name}</div>
              
              <table class="info-table">
                <tr>
                  <td>Mã sự kiện:</td>
                  <td><strong>${eventCode}</strong></td>
                </tr>
                <tr>
                  <td>Ngày tạo:</td>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <td>Nhóm:</td>
                  <td>${groupName}</td>
                </tr>
                <tr>
                  <td>Thời gian:</td>
                  <td><strong>${time}</strong></td>
                </tr>
                <tr>
                  <td>Địa điểm:</td>
                  <td>${venue || 'Sẽ được thông báo sau'}</td>
                </tr>
              </table>
            </div>

            <div class="subtitle">
              ${emailSubtitle}
            </div>

            ${customMessage ? `
            <div class="custom-message">
              <div class="custom-message-title">Thông tin bổ sung:</div>
              <div class="custom-message-content">${customMessage}</div>
            </div>
            ` : ''}

            <!-- CTA Button -->
            <div class="cta-container">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/groups/${groupData.group_id}" class="cta-button">
                Xem sự kiện trong nhóm
              </a>
            </div>

            <div class="divider"></div>

            <!-- Contact Info -->
            <div class="contact-info">
              <p>Hãy theo dõi thông tin cập nhật về sự kiện này từ nhóm trưởng.</p>
              <p>Thời gian và địa điểm cụ thể sẽ được thông báo sớm.</p>
              <br>
              <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline:</p>
              <p class="hotline">1900 XXXX</p>
              <p hoặc liên hệ trưởng nhóm.</p>
              <br>
              <p><strong>Hãy sắp xếp thời gian để tham gia sự kiện nhé!</strong></p>
            </div>

            <p style="color: #6b7280; font-size: 16px; margin-top: 32px;">
              Trân trọng,<br>
              <strong style="color: #1f2937;">Nhóm ${groupName}</strong>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
            <p class="brand">© 2025 Hệ thống Quản lý Sự kiện. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Gửi email thông báo sự kiện đến danh sách người dùng
const sendEventNotification = async (eventData, groupData, recipients, customContent = null) => {
  try {
    const transporter = createTransporter();
    const template = createEventNotificationTemplate(eventData, groupData, customContent);
    
    // Gửi email đến từng người nhận
    const emailPromises = recipients.map(async (recipient) => {
      if (!recipient.email) {
        console.warn(`Người dùng ${recipient.username} không có email`);
        return { success: false, email: null, error: 'No email' };
      }
      
      try {
        const mailOptions = {
          from: `"${process.env.EMAIL_SENDER_NAME || 'Hệ thống Quản lý Sự kiện'}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
          to: recipient.email,
          subject: template.subject,
          html: template.html
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${recipient.email}:`, result.messageId);
        
        return { 
          success: true, 
          email: recipient.email, 
          messageId: result.messageId 
        };
      } catch (error) {
        console.error(`❌ Failed to send email to ${recipient.email}:`, error);
        return { 
          success: false, 
          email: recipient.email, 
          error: error.message 
        };
      }
    });
    
    const results = await Promise.all(emailPromises);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`📧 Email notification summary: ${successCount} sent, ${failCount} failed`);
    
    return {
      success: true,
      totalRecipients: recipients.length,
      successCount,
      failCount,
      results
    };
    
  } catch (error) {
    console.error('❌ Error in sendEventNotification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Template email xác nhận tham gia sự kiện
const createEventParticipationConfirmationTemplate = (userData, eventData, groupData) => {
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  return {
    subject: `Xác nhận tham gia sự kiện: ${eventData.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận tham gia sự kiện</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 680px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 40px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .content { padding: 40px; }
          .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; }
          .confirmation-details { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 24px; margin: 20px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .info-table td:first-child { font-weight: 600; color: #374151; background: #f9fafb; width: 30%; }
          .info-table td:last-child { color: #6b7280; }
          .info-table tr:last-child td { border-bottom: none; }
          .success-message { background: #d1fae5; border-left: 4px solid #10b981; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .success-message-title { font-weight: 600; color: #047857; margin-bottom: 8px; }
          .success-message-content { color: #047857; line-height: 1.5; }
          .cta-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); border: 2px solid transparent; }
          .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6); }
          .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
          .contact-info { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .contact-info p { color: #6b7280; font-size: 14px; line-height: 1.5; margin: 4px 0; }
          .contact-info .hotline { font-weight: 600; color: #1f2937; font-size: 16px; }
          .footer { background: #1f2937; color: #9ca3af; padding: 24px 40px; text-align: center; font-size: 14px; line-height: 1.5; }
          .footer p { margin: 4px 0; }
          .footer .brand { color: white; font-weight: 600; }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }  
            .header h1 { font-size: 24px; }
            .info-table td { padding: 8px 12px; font-size: 13px; }
            .info-table td:first-child { width: 40%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Xác Nhận Tham Gia Thành Công!</h1>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Chào ${userData.full_name || userData.username},
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Bạn đã xác nhận tham gia sự kiện <strong>"${eventData.name}"</strong> trong nhóm <strong>${groupData.name}</strong> thành công!
              Dưới đây là thông tin chi tiết:
            </p>

                         <!-- Confirmation Details -->
             <div class="confirmation-details">
               <table class="info-table">
                 <tr>
                   <td>Ngày xác nhận:</td>
                   <td>${currentDate}</td>
                 </tr>
                <tr>
                  <td>Sự kiện:</td>
                  <td><strong>${eventData.name}</strong></td>
                </tr>
                <tr>
                  <td>Nhóm:</td>
                  <td>${groupData.name}</td>
                </tr>
                <tr>
                  <td>Thời gian:</td>
                  <td>${eventData.time || 'Sẽ được thông báo sau'}</td>
                </tr>
                <tr>
                  <td>Địa điểm:</td>
                  <td>${eventData.venue || 'Sẽ được thông báo sau'}</td>
                </tr>
              </table>
            </div>

            <div class="success-message">
              <div class="success-message-title">🎉 Tuyệt vời!</div>
              <div class="success-message-content">
                Bạn đã chính thức trở thành thành viên tham gia sự kiện này. 
                Chúng tôi sẽ gửi thông tin cập nhật và nhắc nhở về sự kiện qua email.
              </div>
            </div>

            <!-- CTA Button -->
            <div class="cta-container">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/groups/${groupData.group_id}" class="cta-button">
                Xem chi tiết sự kiện
              </a>
            </div>

            <div class="divider"></div>

            <!-- Contact Info -->
            <div class="contact-info">
              <p>Hãy theo dõi thông tin cập nhật về sự kiện từ nhóm trưởng.</p>
              <p>Chúng tôi sẽ thông báo nếu có thay đổi về thời gian hoặc địa điểm.</p>
              <br>
              <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline:</p>
              <p class="hotline">1900 XXXX</p>
              <p>hoặc liên hệ trưởng nhóm.</p>
              <br>
              <p><strong>Cảm ơn bạn đã tham gia!</strong></p>
            </div>

            <p style="color: #6b7280; font-size: 16px; margin-top: 32px;">
              Trân trọng,<br>
              <strong style="color: #1f2937;">Nhóm ${groupData.name}</strong>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
            <p class="brand">© 2025 Hệ thống Quản lý Sự kiện. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Template email thông báo đặt chỗ được duyệt
const createBookingApprovedTemplate = (eventData, groupData, enterpriseData, bookingData) => {
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  return {
    subject: `Đặt chỗ đã duyệt - Sự kiện: ${eventData.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt chỗ được duyệt</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 680px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 40px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .content { padding: 40px; }
          .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; }
          .booking-details { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 24px; margin: 20px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .info-table td:first-child { font-weight: 600; color: #374151; background: #f9fafb; width: 30%; }
          .info-table td:last-child { color: #6b7280; }
          .info-table tr:last-child td { border-bottom: none; }
          .success-message { background: #d1fae5; border-left: 4px solid #10b981; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .success-message-title { font-weight: 600; color: #047857; margin-bottom: 8px; }
          .success-message-content { color: #047857; line-height: 1.5; }
          .cta-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); border: 2px solid transparent; }
          .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6); }
          .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
          .contact-info { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .contact-info p { color: #6b7280; font-size: 14px; line-height: 1.5; margin: 4px 0; }
          .contact-info .hotline { font-weight: 600; color: #1f2937; font-size: 16px; }
          .footer { background: #1f2937; color: #9ca3af; padding: 24px 40px; text-align: center; font-size: 14px; line-height: 1.5; }
          .footer p { margin: 4px 0; }
          .footer .brand { color: white; font-weight: 600; }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }  
            .header h1 { font-size: 24px; }
            .info-table td { padding: 8px 12px; font-size: 13px; }
            .info-table td:first-child { width: 40%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Đặt Chỗ Đã Duyệt!</h1>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Chào các thành viên nhóm ${groupData.name},
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Tin vui! Doanh nghiệp <strong>"${enterpriseData.name}"</strong> đã chấp nhận đặt chỗ cho sự kiện <strong>"${eventData.name}"</strong>.
              Dưới đây là thông tin chi tiết:
            </p>

            <!-- Booking Details -->
            <div class="booking-details">
              <table class="info-table">
                <tr>
                  <td>Ngày duyệt:</td>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <td>Sự kiện:</td>
                  <td><strong>${eventData.name}</strong></td>
                </tr>
                <tr>
                  <td>Nhóm:</td>
                  <td>${groupData.name}</td>
                </tr>
                <tr>
                  <td>Doanh nghiệp:</td>
                  <td><strong>${enterpriseData.name}</strong></td>
                </tr>
                <tr>
                  <td>Địa điểm:</td>
                  <td>${enterpriseData.address}</td>
                </tr>
                <tr>
                  <td>Thời gian:</td>
                  <td><strong>${bookingData.booking_time}</strong></td>
                </tr>
                <tr>
                  <td>Số người:</td>
                  <td>${bookingData.number_of_people} người</td>
                </tr>
                ${bookingData.notes ? `
                <tr>
                  <td>Ghi chú:</td>
                  <td>${bookingData.notes}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="success-message">
              <div class="success-message-title">Chúc mừng!</div>
              <div class="success-message-content">
                Đặt chỗ của nhóm đã được xác nhận. Hãy chuẩn bị và đến đúng giờ để có trải nghiệm tuyệt vời nhất!
              </div>
            </div>

            <!-- CTA Button -->
            <div class="cta-container">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/groups/${groupData.group_id}" class="cta-button">
                Xem chi tiết nhóm
              </a>
            </div>

            <div class="divider"></div>

            <!-- Contact Info -->
            <div class="contact-info">
              <p>Vui lòng đến đúng giờ để tham dự sự kiện.</p>
              <p>Nếu có thay đổi, hãy liên hệ với nhóm trưởng sớm.</p>
              <br>
              <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline:</p>
              <p class="hotline">1900 XXXX</p>
              <p>hoặc liên hệ trưởng nhóm.</p>
              <br>
              <p><strong>Chúc các bạn có những khoảnh khắc đáng nhớ!</strong></p>
            </div>

            <p style="color: #6b7280; font-size: 16px; margin-top: 32px;">
              Trân trọng,<br>
              <strong style="color: #1f2937;">Nhóm ${groupData.name}</strong>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
            <p class="brand">© 2025 Hệ thống Quản lý Sự kiện. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Template email xác nhận đăng ký - phiên bản chuyên nghiệp  
const createRegistrationConfirmationTemplate = (userData, groupData) => {
  const confirmationCode = `REG${Date.now().toString().slice(-8)}`;
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  return {
    subject: `✅ Xác nhận đăng ký thành công - ${groupData.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận đăng ký thành công</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 680px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px 40px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .content { padding: 40px; }
          .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; }
          .registration-details { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; margin: 20px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .info-table td:first-child { font-weight: 600; color: #374151; background: #f9fafb; width: 30%; }
          .info-table td:last-child { color: #6b7280; }
          .info-table tr:last-child td { border-bottom: none; }
          .welcome-message { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .welcome-message-title { font-weight: 600; color: #1e40af; margin-bottom: 8px; }
          .welcome-message-content { color: #1e40af; line-height: 1.5; }
          .cta-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-2px); }
          .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
          .next-steps { background: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .next-steps h3 { color: #92400e; margin-bottom: 12px; font-size: 16px; }
          .next-steps ul { color: #92400e; padding-left: 20px; line-height: 1.6; }
          .next-steps li { margin: 8px 0; }
          .footer { background: #1f2937; color: #9ca3af; padding: 24px 40px; text-align: center; font-size: 14px; line-height: 1.5; }
          .footer p { margin: 4px 0; }
          .footer .brand { color: white; font-weight: 600; }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }  
            .header h1 { font-size: 24px; }
            .info-table td { padding: 8px 12px; font-size: 13px; }
            .info-table td:first-child { width: 40%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Đăng Ký Thành Công!</h1>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Chào ${userData.username || 'bạn'},
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Chúc mừng! Bạn đã đăng ký thành công vào hệ thống quản lý sự kiện của chúng tôi. 
              Dưới đây là thông tin tài khoản của bạn:
            </p>

            <!-- Registration Details -->
            <div class="registration-details">
              <table class="info-table">
                <tr>
                  <td>Mã xác nhận:</td>
                  <td><strong>${confirmationCode}</strong></td>
                </tr>
                <tr>
                  <td>Ngày đăng ký:</td>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <td>Tên đăng nhập:</td>
                  <td><strong>${userData.username}</strong></td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>${userData.email}</td>
                </tr>
                <tr>
                  <td>Nhóm tham gia:</td>
                  <td><strong>${groupData.name}</strong></td>
                </tr>
              </table>
            </div>

            <div class="welcome-message">
              <div class="welcome-message-title">Chào mừng bạn đến với cộng đồng!</div>
              <div class="welcome-message-content">
                Bạn hiện đã là thành viên của nhóm "${groupData.name}". 
                Hãy khám phá các tính năng và tham gia vào những hoạt động thú vị sắp tới!
              </div>
            </div>

            <!-- CTA Button -->
            <div class="cta-container">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="cta-button">
                Đăng nhập ngay
              </a>
            </div>

            <div class="divider"></div>

            <!-- Next Steps -->
            <div class="next-steps">
              <h3>Bước tiếp theo của bạn:</h3>
              <ol>
                <li>Đăng nhập vào hệ thống bằng tài khoản đã tạo</li>
                <li>Cập nhật thông tin cá nhân trong phần Hồ sơ</li>
                <li>Tham gia các sự kiện do nhóm tổ chức</li>
                <li>Kết nối với các thành viên khác trong nhóm</li>
                <li>Theo dõi thông báo về các hoạt động mới</li>
              </ol>
            </div>

            <p style="color: #6b7280; font-size: 16px; margin-top: 32px;">
              Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.<br><br>
              Trân trọng,<br>
              <strong style="color: #1f2937;">Đội ngũ Hệ thống Quản lý Sự kiện</strong>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
            <p class="brand">© 2025 Hệ thống Quản lý Sự kiện. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Gửi email xác nhận tham gia sự kiện
const sendEventParticipationConfirmation = async (userData, eventData, groupData) => {
  try {
    if (!userData.email) {
      console.warn(`Người dùng ${userData.username} không có email`);
      return { success: false, error: 'No email' };
    }

    const transporter = createTransporter();
    const template = createEventParticipationConfirmationTemplate(userData, eventData, groupData);
    
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME || 'Hệ thống Quản lý Sự kiện'}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: userData.email,
      subject: template.subject,
      html: template.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Event participation confirmation email sent to ${userData.email}:`, result.messageId);
    
    return { 
      success: true, 
      email: userData.email, 
      messageId: result.messageId 
    };
    
  } catch (error) {
    console.error(`❌ Failed to send event participation confirmation to ${userData.email}:`, error);
    return { 
      success: false, 
      email: userData.email, 
      error: error.message 
    };
  }
};

// Gửi email thông báo đặt chỗ được duyệt
const sendBookingApprovedNotification = async (eventData, groupData, enterpriseData, bookingData, participantEmails) => {
  try {
    if (!participantEmails || participantEmails.length === 0) {
      console.log('No participants to notify');
      return { success: false, error: 'No participants' };
    }

    const transporter = createTransporter();
    const template = createBookingApprovedTemplate(eventData, groupData, enterpriseData, bookingData);
    
    // Send to all participants
    const sendPromises = participantEmails.map(async (email) => {
      try {
        const mailOptions = {
          from: `"${process.env.EMAIL_SENDER_NAME || 'Hệ thống Quản lý Sự kiện'}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
          to: email,
          subject: template.subject,
          html: template.html
        };

        const result = await transporter.sendMail(mailOptions);
        return { email, success: true, messageId: result.messageId };
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
        return { email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`✅ Booking approved notification emails sent to ${successCount}/${participantEmails.length} participants`);
    
    return {
      success: true,
      totalEmails: participantEmails.length,
      successCount,
      results
    };
    
  } catch (error) {
    console.error('❌ Failed to send booking approved notification emails:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Gửi email xác nhận đăng ký
const sendRegistrationConfirmation = async (userData, groupData) => {
  try {
    if (!userData.email) {
      console.warn(`Người dùng ${userData.username} không có email`);
      return { success: false, error: 'No email' };
    }

    const transporter = createTransporter();
    const template = createRegistrationConfirmationTemplate(userData, groupData);
    
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME || 'Hệ thống Quản lý Sự kiện'}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: userData.email,
      subject: template.subject,
      html: template.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Registration confirmation email sent to ${userData.email}:`, result.messageId);
    
    return { 
      success: true, 
      email: userData.email, 
      messageId: result.messageId 
    };
    
  } catch (error) {
    console.error(`❌ Failed to send registration confirmation to ${userData.email}:`, error);
    return { 
      success: false, 
      email: userData.email, 
      error: error.message 
    };
  }
};

// Template email reset password
const createPasswordResetTemplate = (userData, resetCode) => {
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  return {
    subject: `🔐 Mã khôi phục mật khẩu - ${process.env.EMAIL_SENDER_NAME || 'Hệ thống Quản lý Sự kiện'}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mã khôi phục mật khẩu</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 680px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px 40px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .content { padding: 40px; }
          .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; }
          .reset-code-section { background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center; }
          .reset-code-title { font-size: 20px; font-weight: 600; color: #dc2626; margin-bottom: 16px; }
          .reset-code { font-size: 36px; font-weight: 800; color: #dc2626; letter-spacing: 8px; background: white; padding: 16px 24px; border-radius: 8px; border: 2px dashed #dc2626; margin: 16px 0; font-family: 'Courier New', monospace; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .info-table td:first-child { font-weight: 600; color: #374151; background: #f9fafb; width: 30%; }
          .info-table td:last-child { color: #6b7280; }
          .info-table tr:last-child td { border-bottom: none; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .warning-title { font-weight: 600; color: #92400e; margin-bottom: 8px; }
          .warning-content { color: #92400e; line-height: 1.5; }
          .instructions { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .instructions-title { font-weight: 600; color: #0369a1; margin-bottom: 12px; }
          .instructions-list { color: #0369a1; }
          .instructions-list li { margin: 8px 0; }
          .contact-info { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .contact-info p { color: #6b7280; font-size: 14px; line-height: 1.5; margin: 4px 0; }
          .footer { background: #1f2937; color: #9ca3af; padding: 24px 40px; text-align: center; font-size: 14px; line-height: 1.5; }
          .footer p { margin: 4px 0; }
          .footer .brand { color: white; font-weight: 600; }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .reset-code { font-size: 28px; letter-spacing: 4px; padding: 12px 16px; }
            .info-table td { padding: 8px 12px; font-size: 13px; }
            .info-table td:first-child { width: 40%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>🔐 Mã Khôi Phục Mật Khẩu</h1>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Chào ${userData.full_name || userData.username},
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Sử dụng mã khôi phục bên dưới để đặt lại mật khẩu.
            </p>

            <!-- Reset Code Section -->
            <div class="reset-code-section">
              <div class="reset-code-title">Mã khôi phục của bạn</div>
              <div class="reset-code">${resetCode}</div>
              
              <table class="info-table">
                <tr>
                  <td>Tài khoản:</td>
                  <td><strong>${userData.username}</strong></td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>${userData.email}</td>
                </tr>
                <tr>
                  <td>Thời gian yêu cầu:</td>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <td>Hiệu lực:</td>
                  <td><strong>15 phút</strong></td>
                </tr>
              </table>
            </div>

            <!-- Instructions -->
            <div class="instructions">
              <div class="instructions-title">📋 Hướng dẫn sử dụng:</div>
              <ol class="instructions-list">
                <li>Quay lại trang web và chọn "Đã có mã khôi phục"</li>
                <li>Nhập mã <strong>${resetCode}</strong> vào ô "Mã khôi phục"</li>
                <li>Nhập mật khẩu mới và xác nhận</li>
                <li>Nhấn "Đặt lại mật khẩu" để hoàn tất</li>
              </ol>
            </div>

            <div class="warning">
              <div class="warning-title">⚠️ Lưu ý quan trọng:</div>
              <div class="warning-content">
                Mã khôi phục này chỉ có hiệu lực trong <strong>15 phút</strong> kể từ thời điểm gửi email. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
              </div>
            </div>

            <!-- Contact Info -->
            <div class="contact-info">
              <p>Nếu bạn gặp vấn đề, vui lòng liên hệ support để được hỗ trợ.</p>
            </div>

            <p style="color: #6b7280; font-size: 16px; margin-top: 32px;">
              Trân trọng,<br>
              <strong style="color: #1f2937;">Đội ngũ hỗ trợ</strong>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
            <p class="brand">© 2025 Hệ thống Quản lý Sự kiện. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Gửi email reset password
const sendPasswordResetEmail = async (userData, resetCode) => {
  try {
    if (!userData.email) {
      console.warn(`Người dùng ${userData.username} không có email`);
      return { success: false, error: 'No email' };
    }

    const transporter = createTransporter();
    const template = createPasswordResetTemplate(userData, resetCode);
    
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME || 'Hệ thống Quản lý Sự kiện'}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: userData.email,
      subject: template.subject,
      html: template.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${userData.email}:`, result.messageId);
    
    return { 
      success: true, 
      email: userData.email, 
      messageId: result.messageId 
    };
    
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${userData.email}:`, error);
    return { 
      success: false, 
      email: userData.email, 
      error: error.message 
    };
  }
};

// Template email thông báo đặt chỗ mới cho doanh nghiệp
const createNewBookingNotificationTemplate = (bookingData, eventData, groupData, leaderData) => {
  const bookingCode = `BK${Date.now().toString().slice(-8)}`;
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  return {
    subject: `🔔 Đơn đặt chỗ mới - ${eventData.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đơn đặt chỗ mới</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 680px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 40px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .content { padding: 40px; }
          .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; }
          .booking-details { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 24px; margin: 20px 0; }
          .booking-title { font-size: 20px; font-weight: 600; color: #92400e; margin-bottom: 16px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .info-table td:first-child { font-weight: 600; color: #374151; background: #f9fafb; width: 30%; }
          .info-table td:last-child { color: #6b7280; }
          .info-table tr:last-child td { border-bottom: none; }
          .status-pending { background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .action-needed { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .action-needed-title { font-weight: 600; color: #dc2626; margin-bottom: 8px; }
          .action-needed-content { color: #b91c1c; line-height: 1.5; }
          .cta-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
          .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6); }
          .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
          .contact-info { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .contact-info p { color: #6b7280; font-size: 14px; line-height: 1.5; margin: 4px 0; }
          .footer { background: #1f2937; color: #9ca3af; padding: 24px 40px; text-align: center; font-size: 14px; line-height: 1.5; }
          .footer p { margin: 4px 0; }
          .footer .brand { color: white; font-weight: 600; }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .info-table td { padding: 8px 12px; font-size: 13px; }
            .info-table td:first-child { width: 40%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Đơn Đặt Chỗ Mới!</h1>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Chào bạn,
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Bạn vừa nhận được một đơn đặt chỗ mới từ khách hàng.
            </p>

            <!-- Booking Details -->
            <div class="booking-details">
              <div class="booking-title">Chi tiết đơn đặt chỗ</div>
              
              <table class="info-table">
                <tr>
                  <td>Mã đặt chỗ:</td>
                  <td><strong>${bookingCode}</strong></td>
                </tr>
                <tr>
                  <td>Ngày đặt:</td>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <td>Trạng thái:</td>
                  <td><span class="status-pending">CHỜ DUYỆT</span></td>
                </tr>
                <tr>
                  <td>Sự kiện:</td>
                  <td><strong>${eventData.name}</strong></td>
                </tr>
                <tr>
                  <td>Nhóm:</td>
                  <td>${groupData.name}</td>
                </tr>
                <tr>
                  <td>Người đặt:</td>
                  <td>${leaderData.full_name || leaderData.username}</td>
                </tr>
                <tr>
                  <td>Số lượng người:</td>
                  <td><strong>${bookingData.number_of_people} người</strong></td>
                </tr>
                <tr>
                  <td>Thời gian:</td>
                  <td>${bookingData.booking_time}</td>
                </tr>
                ${bookingData.notes ? `
                <tr>
                  <td>Ghi chú:</td>
                  <td>${bookingData.notes}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="action-needed">
              <div class="action-needed-title">⚠️ Cần xử lý:</div>
              <div class="action-needed-content">
                Đơn đặt chỗ này đang chờ bạn duyệt. Vui lòng đăng nhập vào hệ thống để xem chi tiết và phê duyệt đơn đặt chỗ.
              </div>
            </div>

            <!-- CTA Button -->
            <div class="cta-container">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/enterprise/bookings" class="cta-button">
                Xem và duyệt đơn đặt chỗ
              </a>
            </div>

            <div class="divider"></div>

            <!-- Contact Info -->
            <div class="contact-info">
              <p>Bạn có thể liên hệ trực tiếp với người đặt chỗ nếu cần thông tin thêm.</p>
              <p><strong>Thông tin liên hệ:</strong></p>
              <p>Email: ${leaderData.email || 'Chưa cập nhật'}</p>
              <p>SĐT: ${leaderData.phone || 'Chưa cập nhật'}</p>
            </div>

            <p style="color: #6b7280; font-size: 16px; margin-top: 32px;">
              Trân trọng,<br>
              <strong style="color: #1f2937;">Hệ thống Quản lý Sự kiện</strong>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
            <p class="brand">© 2025 Hệ thống Quản lý Sự kiện. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Gửi email thông báo đặt chỗ mới cho doanh nghiệp
const sendNewBookingNotification = async (bookingData, eventData, groupData, leaderData, enterpriseEmail) => {
  try {
    if (!enterpriseEmail) {
      console.warn('Enterprise không có email');
      return { success: false, error: 'No enterprise email' };
    }

    const transporter = createTransporter();
    const template = createNewBookingNotificationTemplate(bookingData, eventData, groupData, leaderData);
    
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME || 'Hệ thống Quản lý Sự kiện'}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: enterpriseEmail,
      subject: template.subject,
      html: template.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ New booking notification email sent to ${enterpriseEmail}:`, result.messageId);
    
    return { 
      success: true, 
      email: enterpriseEmail, 
      messageId: result.messageId 
    };
    
  } catch (error) {
    console.error(`❌ Failed to send new booking notification to ${enterpriseEmail}:`, error);
    return { 
      success: false, 
      email: enterpriseEmail, 
      error: error.message 
    };
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    console.log('🔍 Testing email connection...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured in .env file');
      return false;
    }
    
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.error('❌ Full error:', error);
    return false;
  }
};

// Gửi lời mời tham gia nhóm qua email
const sendGroupInvite = async (recipientEmail, groupName, inviteCode, inviterName) => {
  try {
    const transporter = createTransporter();
    
    // Tạo link tham gia
    const joinLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${inviteCode}`;
    
    // Template email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@webscheduler.com',
      to: recipientEmail,
      subject: `Lời mời tham gia nhóm "${groupName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">Lời mời tham gia nhóm</h2>
          
          <p>Xin chào!</p>
          
          <p><strong>${inviterName}</strong> đã mời bạn tham gia nhóm <strong>"${groupName}"</strong> trên Web Scheduler.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;">
              Nhấn vào nút bên dưới để tham gia nhóm:
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${joinLink}" 
               style="background-color: #8B5CF6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;
                      display: inline-block;">
              Tham gia nhóm
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">
            Hoặc copy link sau vào trình duyệt:<br>
            <a href="${joinLink}" style="color: #8B5CF6;">${joinLink}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #6B7280; font-size: 12px;">
            Link này sẽ hết hạn sau 7 ngày. Nếu bạn không muốn nhận email này, 
            vui lòng bỏ qua.
          </p>
          
          <p style="color: #6B7280; font-size: 12px;">
            © 2024 Web Scheduler. All rights reserved.
          </p>
        </div>
      `
    };
    
    // Gửi email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Template email xác thực đăng ký
const createEmailVerificationTemplate = (userData, verificationCode) => {
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  return {
    subject: `🔐 Mã xác thực email - ${process.env.EMAIL_SENDER_NAME || 'Hệ thống Quản lý Sự kiện'}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực email đăng ký</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 680px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 40px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .content { padding: 40px; }
          .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; }
          .verification-code-section { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center; }
          .verification-code-title { font-size: 20px; font-weight: 600; color: #059669; margin-bottom: 16px; }
          .verification-code { font-size: 36px; font-weight: 800; color: #059669; letter-spacing: 8px; background: white; padding: 16px 24px; border-radius: 8px; border: 2px dashed #059669; margin: 16px 0; font-family: 'Courier New', monospace; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .info-table td:first-child { font-weight: 600; color: #374151; background: #f9fafb; width: 30%; }
          .info-table td:last-child { color: #6b7280; }
          .info-table tr:last-child td { border-bottom: none; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .warning-title { font-weight: 600; color: #92400e; margin-bottom: 8px; }
          .warning-content { color: #92400e; line-height: 1.5; }
          .instructions { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .instructions-title { font-weight: 600; color: #0369a1; margin-bottom: 12px; }
          .instructions-list { color: #0369a1; }
          .instructions-list li { margin: 8px 0; }
          .contact-info { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .contact-info p { color: #6b7280; font-size: 14px; line-height: 1.5; margin: 4px 0; }
          .footer { background: #1f2937; color: #9ca3af; padding: 24px 40px; text-align: center; font-size: 14px; line-height: 1.5; }
          .footer p { margin: 4px 0; }
          .footer .brand { color: white; font-weight: 600; }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .verification-code { font-size: 28px; letter-spacing: 4px; padding: 12px 16px; }
            .info-table td { padding: 8px 12px; font-size: 13px; }
            .info-table td:first-child { width: 40%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>🎉 Chào mừng bạn đến với hệ thống!</h1>
            <p>Xác thực email để hoàn tất đăng ký</p>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Chào <strong>${userData.username}</strong>!
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Cảm ơn bạn đã đăng ký tài khoản! Để hoàn tất quá trình đăng ký và kích hoạt tài khoản, vui lòng sử dụng mã xác thực bên dưới.
            </p>

            <!-- Verification Code Section -->
            <div class="verification-code-section">
              <div class="verification-code-title">Mã xác thực của bạn</div>
              <div class="verification-code">${verificationCode}</div>
              
              <table class="info-table">
                <tr>
                  <td>Tài khoản:</td>
                  <td><strong>${userData.username}</strong></td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>${userData.email}</td>
                </tr>
                <tr>
                  <td>Thời gian đăng ký:</td>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <td>Hiệu lực:</td>
                  <td><strong>15 phút</strong></td>
                </tr>
              </table>
            </div>

            <!-- Instructions -->
            <div class="instructions">
              <div class="instructions-title">📋 Hướng dẫn xác thực:</div>
              <ol class="instructions-list">
                <li>Quay lại trang đăng ký trên website</li>
                <li>Nhập mã xác thực <strong>${verificationCode}</strong> vào ô được yêu cầu</li>
                <li>Nhấn "Xác thực email" để hoàn tất đăng ký</li>
                <li>Bạn có thể đăng nhập ngay sau khi xác thực thành công</li>
              </ol>
            </div>

            <div class="warning">
              <div class="warning-title">⚠️ Lưu ý quan trọng:</div>
              <div class="warning-content">
                Mã xác thực này chỉ có hiệu lực trong <strong>15 phút</strong> kể từ thời điểm gửi email. Nếu mã hết hạn, bạn có thể yêu cầu gửi lại mã mới.
              </div>
            </div>

            <!-- Contact Info -->
            <div class="contact-info">
              <p>Nếu bạn gặp vấn đề, vui lòng liên hệ support để được hỗ trợ.</p>
            </div>

            <p style="color: #6b7280; font-size: 16px; margin-top: 32px;">
              Trân trọng,<br>
              <strong style="color: #1f2937;">Đội ngũ hỗ trợ</strong>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
            <p class="brand">© 2025 Hệ thống Quản lý Sự kiện. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Gửi email xác thực đăng ký
const sendEmailVerification = async (userData, verificationCode) => {
  try {
    if (!userData.email) {
      console.warn(`Người dùng ${userData.username} không có email`);
      return { success: false, error: 'No email' };
    }

    const transporter = createTransporter();
    const template = createEmailVerificationTemplate(userData, verificationCode);
    
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME || 'Hệ thống Quản lý Sự kiện'}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: userData.email,
      subject: template.subject,
      html: template.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email verification sent to ${userData.email}:`, result.messageId);
    
    return { 
      success: true, 
      email: userData.email, 
      messageId: result.messageId 
    };
    
  } catch (error) {
    console.error(`❌ Failed to send email verification to ${userData.email}:`, error);
    return { 
      success: false, 
      email: userData.email, 
      error: error.message 
    };
  }
};

module.exports = {
  sendEventNotification,
  sendEventParticipationConfirmation,
  sendRegistrationConfirmation,
  sendBookingApprovedNotification,
  testEmailConnection,
  sendGroupInvite,
  sendNewBookingNotification,
  sendPasswordResetEmail,
  sendEmailVerification
}; 