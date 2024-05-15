"use client"
import React from "react";
import Slider, { Settings } from "react-slick";
import Container from "./Container";
import ProductCard from "./ProductCard";
import { data } from "@/app/utils/data";
import "slick-carousel/slick/slick.css";
import NextArrow from "./NextArrow";
import PrevArrow from "./PrevArrow";


const { products } = data;


const Trending: React.FC = () => 
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
                    {products.map((product) => (
                        <div key={product.id} className="px-2">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </Slider>
            </div>
        </Container>
        </>
    );
};

export default Trending ;
