"use client"
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPen } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import SuccessMessage from './SuccessMessage'; // Import the SuccessMessage component

interface AvisProps {
  productId: string;
}

const Avis: React.FC<AvisProps> = ({ productId }) => {
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setEmail(value);
    setEmailError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/nodemailer/send', { name: feedback, email, message: feedback });
      console.log(response.data);
      setFeedback('');
      setEmail('');
      setShowFeedback(false);
      setShowSuccess(true); // Show success message
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateEmail = (email: string) => {
    // Email format validation logic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  return (
    <div className="relative">
      <button
        className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
        onClick={() => setShowFeedback(true)}
      >
        <FontAwesomeIcon icon={faPen} className="mr-2" />
        Donnez votre avis
      </button>
      {showFeedback && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white shadow-md rounded-lg p-4 md:p-6 w-full max-w-md relative transform transition-transform duration-300">
            <div className="absolute top-0 right-0 cursor-pointer" onClick={() => setShowFeedback(false)}>
              <FontAwesomeIcon icon={faTimes} className="text-gray-500 hover:text-gray-700" />
            </div>
            <h2 className="text-lg font-bold mb-2">Donnez votre avis</h2>
            <form onSubmit={handleSubmit} className={isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Votre E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-300"
                  disabled={isSubmitting}
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>
              <textarea
                value={feedback}
                onChange={handleFeedbackChange}
                placeholder="vos commentaires ici..."
                className="w-full h-40 border border-gray-300 rounded-md p-2 resize-none transition-all duration-300"
              />
              <button type="submit" className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                Envoyer
              </button>
            </form>
          </div>
        </div>
      )}
      {showSuccess && <SuccessMessage onClose={handleSuccessClose} />}
    </div>
  );
};

export default Avis;
