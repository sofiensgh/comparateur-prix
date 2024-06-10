"use client";
import React, { useState } from 'react';
import axios from 'axios';
import SuccessMessage from '@/components/SuccessMessage'; // Import the SuccessMessage component

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false); // State variable for success message

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/nodemailer/send', { name, email, message });
      console.log(response.data);
      setName('');
      setEmail('');
      setMessage('');
      setError('');
      setShowSuccess(true); // Show success message on successful form submission
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-200 via-white-500 to-white-500 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Contactez-nous
</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
              Votre Nom
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              Votre E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
              Message (Avis)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
          >
            Envoyer
          </button>
        </form>
        {showSuccess && <SuccessMessage onClose={() => setShowSuccess(false)} />} {/* Show success message */}
      </div>
    </div>
  );
};

export default ContactPage;
