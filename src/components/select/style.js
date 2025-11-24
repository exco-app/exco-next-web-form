import "./style.css";

export const Wrapper = ({ children, className = "", style = {}, ...props }) => {
  return (
    <div className={`select-wrapper ${className}`} style={style} {...props}>
      {children}
    </div>
  );
};
