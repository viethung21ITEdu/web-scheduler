import React, { forwardRef } from 'react';

/**
 * Custom Scrollbar component cho phép tùy chỉnh thanh cuộn
 * @param {Object} props - Props của component
 * @param {React.ReactNode} props.children - Nội dung bên trong thanh cuộn
 * @param {string} props.className - Classes CSS bổ sung
 * @param {string} props.thumbColor - Màu của thumb scrollbar
 * @param {string} props.trackColor - Màu của track scrollbar
 * @param {string} props.width - Chiều rộng của scrollbar
 * @param {boolean} props.autoHide - Tự động ẩn scrollbar khi không sử dụng
 * @param {string} props.height - Chiều cao của container (100%, 100vh, 500px,...)
 * @param {Object} ref - Ref được forward đến phần tử container
 */
const Scrollbar = forwardRef((props, ref) => {
  const {
    children,
    className = '',
    thumbColor = 'rgba(155, 155, 155, 0.7)',
    trackColor = 'rgba(235, 235, 235, 0.7)',
    width = '6px',
    autoHide = true,
    height = '100%',
    ...rest
  } = props;
  // CSS cho scrollbar tùy chỉnh
  const scrollbarStyles = {
    height,
    overflow: 'auto',
    scrollbarWidth: 'thin', // Firefox
    scrollbarColor: `${thumbColor} ${trackColor}`, // Firefox
  };

  // CSS cho webkit browsers (Chrome, Safari, Edge)
  const webkitStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: ${width};
      height: ${width};
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: ${trackColor};
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: ${thumbColor};
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: ${thumbColor === 'rgba(155, 155, 155, 0.7)' 
        ? 'rgba(155, 155, 155, 0.9)' 
        : thumbColor};
    }
    ${autoHide ? `
      .custom-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .custom-scrollbar:hover::-webkit-scrollbar {
        display: block;
      }
    ` : ''}
  `;

  return (
    <>
      <style>{webkitStyles}</style>
      <div
        ref={ref}
        className={`custom-scrollbar ${className}`}
        style={scrollbarStyles}
        {...rest}
      >
        {children}
      </div>
    </>
  );
});

// Thêm displayName để dễ debug trong React DevTools
Scrollbar.displayName = 'Scrollbar';

// Bỏ đi phần propTypes vì không import PropTypes
// Nếu cần validate props trong tương lai, hãy cài đặt: npm install prop-types

export default Scrollbar;
