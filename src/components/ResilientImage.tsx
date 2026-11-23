import { useState } from 'react';
import { LotusMark } from './LotusMark';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: ResilientImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-[#23101E] via-[#150912] to-[#2B1224] text-[#F4A5C0]/70"
        role="img"
        aria-label={alt}
      >
        <LotusMark className="w-12 h-9 text-[#E5C185]/70" />
        <span className="text-xs tracking-wide text-[#B89EA9] text-center">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
