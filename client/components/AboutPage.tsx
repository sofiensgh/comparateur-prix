import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 min-h-screen flex justify-center items-center">
      <div className="max-w-4xl mx-auto p-6 bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg shadow-xl rounded-xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-center md:text-left mb-4 text-teal-600 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-teal-700">About Us</h1>
            <p className="text-lg md:text-xl text-gray-700 text-center md:text-left">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum,
              nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="w-64 h-64 bg-white rounded-lg p-2 shadow-lg">
              <img
                src="/path/to/your/image.jpg"
                alt="About Us Image"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-teal-600 mb-4">Our Mission</h2>
          <p className="text-lg md:text-xl text-gray-700">
            Maecenas nisl est, ultrices nec congue eget, auctor vitae massa. Fusce luctus vestibulum augue ut aliquet.
            Nunc sagittis dictum nisi, sed ullamcorper ipsum dignissim ac.
          </p>
        </div>
        <div className="mt-12 flex justify-center">
          <a
            href="/contact"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
