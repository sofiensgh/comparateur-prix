"use client"

import { MdFavorite } from "react-icons/md";
import Image from 'next/image';
import Link from 'next/link';

import React, { useState } from 'react';

const FavoritesSidebar = () => {
    return (
<div className="fixed top-60 right-3 z-0">
    <Link href={"/favoris"}
    className="bg-gray-100 w-16 h-[70px] rounded-md flex flex-col items-center justify-center shadow-lg overflow-hidden group cursor-pointer">
        <div className="flex justify-center items-center">
            <MdFavorite className="text-2xl text-[#33475b] -translate-x-12 group-hover:translate-x-3 transition-transform duration-200" />
            <MdFavorite className="text-2xl text-[#33475b] -translate-x-3 group-hover:translate-x-12 transition-transform duration-200" />
        </div>
        <p className="text-sm font-semibold mt-1 text-[#33475b]">Favoris</p>
        <p className="absolute top-1 right-2 bg-gray-600 text-white text-xs w-4 h-4 rounded-full items-center justify-center">0</p>
        </Link>
    </div>



    );
};

export default FavoritesSidebar;
