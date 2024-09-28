import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import "./style.scss";

interface baseButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  cn?: string;
}

const BaseButton: FC<baseButton> = ({ children, cn, ...props }) => {
  return (
    <button className={"baseButton" + " " + cn} {...props}>
      {children}
    </button>
  );
};

export default BaseButton;
