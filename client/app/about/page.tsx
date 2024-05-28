"use client";
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-100 via-white-500 to-white-500 min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-bold text-center md:text-left mb-4 text-gray-800">About Us</h1>
            <p className="text-lg text-gray-600 text-center md:text-left">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum,
              nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <img
              src="/path/to/your/image.jpg"
              alt="About Us Image"
              className="w-48 h-48 rounded-full object-cover shadow-lg transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600">
            Maecenas nisl est, ultrices nec congue eget, auctor vitae massa. Fusce luctus vestibulum augue ut aliquet.
            Nunc sagittis dictum nisi, sed ullamcorper ipsum dignissim ac.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap justify-center">
          <a
            href="/contact"
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 mx-4 my-2"
          >
            Contact Us
          </a>
         
        </div>
      </div>
    </div>
  );
};

export default AboutPage;