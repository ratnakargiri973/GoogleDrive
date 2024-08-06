import React, { useState } from 'react';
import appGuide1 from '../assets/appGuide1.jpeg';
import appGuide2 from '../assets/appGuide2.jpeg';
import appGuide3 from '../assets/appGuide3.jpeg';
import appGuide4 from '../assets/appGuide4.jpeg';
import appGuide5 from '../assets/appGuide5.jpeg';
import appGuide6 from '../assets/appGuide6.jpeg';

function AppGuide() {
  const images = [appGuide1, appGuide2, appGuide3, appGuide4, appGuide5, appGuide6];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className='w-full flex justify-center items-center p-8'>
      <div className='relative w-full'>
        <img
          src={images[currentIndex]}
          alt={`Guide ${currentIndex + 1}`}
          className='w-full h-auto object-cover'
        />
        <button
          onClick={prevSlide}
          className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 bg-cyan-500 p-2 rounded-full'
          disabled={currentIndex===0}
        >
          &lt;
        </button>
        <button
          onClick={nextSlide}
          className='absolute right-4 top-1/2 transform -translate-y-1/2  text-gray-500 bg-cyan-500 p-2 rounded-full'
          disabled={currentIndex===images.length-1}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default AppGuide;
