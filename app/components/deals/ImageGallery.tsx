'use client';

import React from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: Array<{ url: string }>;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  return (
    <div 
      className="w-full h-[250px] rounded-lg overflow-hidden shadow-md"
      style={{
        boxShadow: '0 1px 5.84px rgba(179, 185, 196, 0.15)'
      }}
    >
      <div className="flex flex-row items-start justify-start gap-x-1 h-full">
        <div className="w-1/2 h-[270px]">
          {images[0]?.url && (
            <img
              src={images[0].url}
              alt="Gallery image 1"
              width={500}
              height={270}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          )}
        </div>
        <div className="w-1/2 flex flex-col items-start justify-start gap-y-1">
          <div className="h-[125px] w-full">
            {images[1]?.url && (
              <img
                src={images[1].url}
                alt="Gallery image 2"
                width={500}
                height={125}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            )}
          </div>
          <div className="h-[125px] w-full">
            {images[2]?.url && (
              <img
                src={images[2].url}
                alt="Gallery image 3"
                width={500}
                height={125}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;