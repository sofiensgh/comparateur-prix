// src/app/not-found.tsx
"use client"
import Link from 'next/link';
import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-6 text-gray-800">Page Introuvable</h1>
        <p className="text-lg text-gray-600 mb-8">Oups ! La page que vous recherchez n'existe pas.</p>
        <Link href="/" passHref className="px-6 py-3 bg-red-500 text-white rounded-lg text-lg hover:bg-red-600 transition duration-300">Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;