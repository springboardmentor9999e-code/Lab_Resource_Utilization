import { useState, useCallback } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

/**
 * useConfirm — replaces window.confirm() with a beautiful modal.
 *
 * Usage:
 *   const { confirmModal, confirm } = useConfirm();
 *   // In JSX: {confirmModal}
 *   // To trigger: const ok = await confirm({ title, message, confirmText, variant });
 */
export default function useConfirm() {
  const [options, setOptions] = useState(null);
  const [resolver, setResolver] = useState(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    resolver?.(true);
    setOptions(null);
    setResolver(null);
  };

  const handleCancel = () => {
    resolver?.(false);
    setOptions(null);
    setResolver(null);
  };

  const confirmModal = options ? (
    <ConfirmModal
      isOpen={true}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText || 'Confirm'}
      cancelText={options.cancelText || 'Cancel'}
      variant={options.variant || 'danger'}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, confirmModal };
}
