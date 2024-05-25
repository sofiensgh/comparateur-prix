"use client"
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPen } from '@fortawesome/free-solid-svg-icons';

interface AvisProps {
  productId: string;
}

const Avis: React.FC<AvisProps> = ({ productId }) => {
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setEmail(value);
    setEmailError('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }
    // Send the feedback and email to your backend or handle it as needed
    console.log(feedback, email);
    setFeedback('');
    setEmail('');
    setShowFeedback(false);
  };

  const validateEmail = (email: string) => {
    // Email format validation logic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="relative">
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
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
            <h2 className="text-lg font-bold mb-2">Give your feedback</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300"
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>
              <textarea
                value={feedback}
                onChange={handleFeedbackChange}
                placeholder="Write your feedback here..."
                className="w-full h-40 border border-gray-300 rounded-md p-2 transition-all duration-300"
              />
              <button type="submit" className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avis;
