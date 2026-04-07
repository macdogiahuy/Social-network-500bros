import { cn } from '@/lib/utils';
import React from 'react';
import Image from 'next/image';
import { USER_AVATAR_PLACEHOLDER } from '@/constant';

//-------------------------------------------------------------------------

interface AvatarProps {
  size?: number;
  src?: string;
  alt: string;
  className?: string;
}

function isValidImageUrl(url?: string): boolean {
  if (!url) return false;
  if (url.includes('localhost')) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size, className }) => {
  const [imgSrc, setImgSrc] = React.useState(
    isValidImageUrl(src) ? src! : USER_AVATAR_PLACEHOLDER
  );

  React.useEffect(() => {
    setImgSrc(isValidImageUrl(src) ? src! : USER_AVATAR_PLACEHOLDER);
  }, [src]);

  return (
    <div className="relative">
      <Image
        width={size ?? 44}
        height={size ?? 44}
        src={imgSrc}
        alt={alt}
        style={{
          minHeight: size ?? 44,
          maxHeight: size ?? 44,
          minWidth: size ?? 44,
        }}
        loading="lazy"
        onError={() => setImgSrc(USER_AVATAR_PLACEHOLDER)}
        unoptimized={imgSrc === USER_AVATAR_PLACEHOLDER}
        className={cn('rounded-full object-cover bg-neutral-100', className)}
      />
    </div>
  );
};

export default Avatar;
