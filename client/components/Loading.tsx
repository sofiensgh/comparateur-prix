"use client"
import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define animation keyframes
const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled loading spinner
const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #333;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spinAnimation} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 20px;
  font-size: 18px;
`;

const LoadingComponent: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <LoadingSpinner>
    <Spinner />
    <LoadingText>{text}</LoadingText>
  </LoadingSpinner>
);

export default LoadingComponent;
