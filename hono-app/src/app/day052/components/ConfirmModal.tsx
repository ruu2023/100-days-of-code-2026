import { AlertTriangle } from "lucide-react";

interface Props {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ title, description, onConfirm, onCancel }: Props) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <div className="confirm-icon">
          <AlertTriangle size={28} />
        </div>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-description">{description}</p>
        <div className="confirm-actions">
          <button onClick={onCancel} className="confirm-btn-cancel">
            キャンセル
          </button>
          <button onClick={onConfirm} className="confirm-btn-delete">
            削除する
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;