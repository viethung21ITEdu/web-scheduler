import React, { useState, useEffect } from 'react';
import './EmailCustomizationModal.css';

const EmailCustomizationModal = ({ 
  isOpen, 
  onClose, 
  onSend, 
  eventData, 
  groupData,
  isLoading 
}) => {
  const [emailContent, setEmailContent] = useState({
    subject: '',
    subtitle: '',
    customMessage: ''
  });

  // Khởi tạo nội dung mặc định khi modal mở
  useEffect(() => {
    if (isOpen && eventData) {
      setEmailContent({
        subject: `Sự kiện mới: ${eventData.name}`,
        subtitle: 'Nhóm trưởng vừa tạo một sự kiện mới. Hãy xem thông tin chi tiết và chuẩn bị tham gia!',
        customMessage: ''
      });
    }
  }, [isOpen, eventData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(emailContent);
  };

  const handleReset = () => {
    if (eventData) {
      setEmailContent({
        subject: `Sự kiện mới: ${eventData.name}`,
        subtitle: 'Nhóm trưởng vừa tạo một sự kiện mới. Hãy xem thông tin chi tiết và chuẩn bị tham gia!',
        customMessage: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="email-modal-overlay">
      <div className="email-modal-container">
        <div className="email-modal-header">
          <h2>Tùy chỉnh nội dung email</h2>
          <button 
            className="email-modal-close-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="email-modal-form">
          {/* Thông tin cố định */}
          <div className="email-fixed-info">
            <h3>Thông tin sự kiện (không thể chỉnh sửa)</h3>
            <div className="fixed-info-grid">
              <div className="info-item">
                <strong>Tên nhóm:</strong> {groupData?.name}
              </div>
              <div className="info-item">
                <strong>Tên sự kiện:</strong> {eventData?.name}
              </div>
              <div className="info-item">
                <strong>Thời gian:</strong> {eventData?.time || 'Sẽ được thông báo sau'}
              </div>
              <div className="info-item">
                <strong>Địa điểm:</strong> {eventData?.venue || 'Sẽ được thông báo sau'}
              </div>
            </div>
          </div>

          {/* Nội dung có thể chỉnh sửa */}
          <div className="email-editable-content">
            <h3>Nội dung có thể tùy chỉnh</h3>
            
            <div className="form-group">
              <label htmlFor="subject">Tiêu đề email:</label>
              <input
                type="text"
                id="subject"
                value={emailContent.subject}
                onChange={(e) => setEmailContent(prev => ({
                  ...prev,
                  subject: e.target.value
                }))}
                placeholder="Nhập tiêu đề email..."
                maxLength={100}
                required
              />
              <small>{emailContent.subject.length}/100 ký tự</small>
            </div>

            <div className="form-group">
              <label htmlFor="subtitle">Phụ đề/Mô tả ngắn:</label>
              <textarea
                id="subtitle"
                value={emailContent.subtitle}
                onChange={(e) => setEmailContent(prev => ({
                  ...prev,
                  subtitle: e.target.value
                }))}
                placeholder="Nhập phụ đề hoặc mô tả ngắn..."
                rows={3}
                maxLength={300}
                required
              />
              <small>{emailContent.subtitle.length}/300 ký tự</small>
            </div>

            <div className="form-group">
              <label htmlFor="customMessage">Nội dung bổ sung (tùy chọn):</label>
              <textarea
                id="customMessage"
                value={emailContent.customMessage}
                onChange={(e) => setEmailContent(prev => ({
                  ...prev,
                  customMessage: e.target.value
                }))}
                placeholder="Thêm thông tin bổ sung, lưu ý đặc biệt, yêu cầu chuẩn bị..."
                rows={5}
                maxLength={500}
              />
              <small>{emailContent.customMessage.length}/500 ký tự</small>
            </div>
          </div>

          {/* Preview */}
          <div className="email-preview">
            <h3>Xem trước email</h3>
            <div className="preview-container">
              <div className="preview-subject">
                <strong>Tiêu đề:</strong> {emailContent.subject}
              </div>
              <div className="preview-content">
                <h4>{emailContent.subject.replace('📅 Sự kiện mới: ', '')}</h4>
                <div className="event-info">
                  <p><strong>Nhóm:</strong> {groupData?.name}</p>
                  <p><strong>Thời gian:</strong> {eventData?.time || 'Sẽ được thông báo sau'}</p>
                  <p><strong>Địa điểm:</strong> {eventData?.venue || 'Sẽ được thông báo sau'}</p>
                </div>
                <p className="subtitle">{emailContent.subtitle}</p>
                {emailContent.customMessage && (
                  <div className="custom-message">
                    <p><strong>Thông tin bổ sung:</strong></p>
                    <p>{emailContent.customMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="email-modal-actions">
            <button 
              type="button" 
              className="btn-reset"
              onClick={handleReset}
              disabled={isLoading}
            >
              Đặt lại mặc định
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-send"
              disabled={isLoading}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailCustomizationModal; 