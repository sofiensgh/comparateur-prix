import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={`max-w-screen-xl mx-auto py-2 px-4 lg:px-0 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
