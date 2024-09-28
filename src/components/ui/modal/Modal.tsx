import { FC, ReactNode } from "react";
import "./style.scss";

interface IModal {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: FC<IModal> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="popup" onClick={onClose}>
      <div className="popup__content" onClick={(e) => e.stopPropagation()}>
        <div className="popup__closeButton" onClick={onClose}></div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
