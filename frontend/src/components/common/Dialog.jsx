import React from 'react';
import Modal from './Modal';

export const Dialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'OK',
  cancelText = 'Hủy',
  type = 'alert' // 'alert' or 'confirm'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const useDialog = () => {
  const [dialog, setDialog] = React.useState({ isOpen: false });

  const showDialog = (options) => {
    setDialog({ isOpen: true, ...options });
  };

  const hideDialog = () => {
    setDialog({ isOpen: false });
  };

  const DialogComponent = () => (
    <Dialog
      {...dialog}
      isOpen={dialog.isOpen}
      onClose={hideDialog}
    />
  );

  return {
    showDialog,
    hideDialog,
    DialogComponent
  };
};
