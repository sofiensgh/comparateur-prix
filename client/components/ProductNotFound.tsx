"use client"
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { RiErrorWarningLine } from 'react-icons/ri';

// Define animation keyframes
const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-3px); }
  100% { transform: translateX(0); }
`;

// Styled "Product Not Found" container
const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

// Styled error icon
const ErrorIcon = styled(RiErrorWarningLine)`
  font-size: 48px;
  color: #ff4d4f;
`;

// Styled text message
const ErrorMessage = styled.p`
  margin-top: 20px;
  font-size: 24px;
  color: #333;
  animation: ${shakeAnimation} 0.5s ease infinite;
`;

const ProductNotFound: React.FC<{ message?: string }> = ({ message = "Produit non trouvé." }) => (
  <NotFoundContainer>
    <ErrorIcon />
    <ErrorMessage>{message}</ErrorMessage>
  </NotFoundContainer>
);

export default ProductNotFound;
