"use client"
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="max-w-3xl px-6 py-12 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
        <div className="flex justify-center items-center mb-8">
          <img
            src="/path/to/your/image.jpg"
            alt="About Us Image"
            className="w-32 h-32 rounded-full object-cover mr-4"
          />
          <div>
            <h2 className="text-2xl font-semibold">Company Name</h2>
            <p className="text-gray-700">A brief description of your company or team.</p>
          </div>
        </div>
        <p className="text-lg text-gray-800 mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum,
          nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec
          congue eget, auctor vitae massa.
        </p>
        <div className="flex justify-center">
          <a href="/contact" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
