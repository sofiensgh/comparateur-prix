"use client";
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-100 via-white-500 to-white-500 min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-bold text-center md:text-left mb-4 text-gray-800">À Propos de Nous</h1>
            <p className="text-lg text-gray-600 text-center md:text-left">
              Notre site est un comparateur de prix qui compare les prix des produits de toutes les boutiques en Tunisie.
              Nous nous efforçons de vous fournir des informations précises et actualisées pour vous aider à prendre des décisions d'achat éclairées.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <img
              src="/assets/icons/logo.svg"
              alt="À Propos de Nous Image"
              className="w-48 h-48 rounded-full object-cover shadow-lg transition-transform duration-300 hover:scale-105"
            />
            
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notre Mission</h2>
          <p className="text-lg text-gray-600">
            Notre mission est de simplifier votre expérience d'achat en vous offrant un accès facile à une comparaison de prix exhaustive.
            Nous visons à vous aider à trouver les meilleurs prix pour les produits que vous recherchez, en vous donnant les informations nécessaires pour faire des choix éclairés.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap justify-center">
          <a
            href="/contact"
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 mx-4 my-2"
          >
            Contactez-nous
          </a>
         
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
