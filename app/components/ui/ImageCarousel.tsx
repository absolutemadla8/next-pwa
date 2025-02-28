import React from 'react';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt = 'Image' }) => {
  return (
    <div className="relative w-full h-40 overflow-hidden">
      <div className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide">
        {images.map((image, index) => (
          <div key={index} className="snap-start flex-none w-full h-40">
            <img
              src={image}
              alt={`${alt} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-white opacity-60"
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;