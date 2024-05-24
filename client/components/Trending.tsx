"use client"
import React from "react";
import { useState, useEffect } from 'react';

import Slider, { Settings } from "react-slick";
import Container from "./Container";
import ProductCards from "./ProductCards";
import { data } from "@/app/utils/data";
import "slick-carousel/slick/slick.css";
import NextArrow from "./NextArrow";
import PrevArrow from "./PrevArrow";
import axios from "axios";

const [products, setProducts] = useState<Product[]>([]);
const [searchQuery, setSearchQuery] = useState("");
const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>('http://localhost:5000/api/products');
      console.log(response.data);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  fetchProducts();
}, []);


interface ProductCardProps {
    product: Product;
  }
const Trending: React.FC<ProductCardProps> = ({product}) => 
  {  const settings: Settings = {
        infinite: true, 
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,

        responsive: [
            {
                breakpoint: 1025,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                },
            },
            {
                breakpoint: 769,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: true,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                },
            },
        ],
    };

    return (
        <>
        <Container>
            <div>
                <Slider {...settings}>
                {filteredProducts.map((product) => (
                        <ProductCards key={product._id} product={product} />
                        
                    ))}
                </Slider>
            </div>
        </Container>
        </>
    );
};

export default Trending ;
