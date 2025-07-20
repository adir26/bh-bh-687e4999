import React from 'react';

interface TopBannerProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

export const TopBanner: React.FC<TopBannerProps> = ({ 
  title, 
  subtitle, 
  backgroundImage 
}) => {
  return (
    <div className="w-full relative min-h-[300px] mb-6">
      <img 
        src={backgroundImage}
        alt={title}
        className="w-full h-[300px] object-cover"
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white px-4">
        <h1 className="text-2xl font-bold mb-2 text-center">{title}</h1>
        <p className="text-sm mb-4 text-center">{subtitle}</p>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400 text-lg">★</span>
          ))}
        </div>
      </div>
    </div>
  );
};