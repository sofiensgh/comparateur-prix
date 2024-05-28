"use client"
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface SuccessMessageProps {
  onClose: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onClose }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 3000); // Close the success message after 3 seconds
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white py-2 px-4 rounded-md shadow-md text-center">
      <FontAwesomeIcon icon={faCheckCircle} className="text-4xl mb-2" />
      <p>Message envoyé avec succès!</p>
    </div>
  );
};

export default SuccessMessage;
