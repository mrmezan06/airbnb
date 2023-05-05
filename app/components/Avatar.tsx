import Image from 'next/image';
import React from 'react';

const Avatar = () => {
  return (
    <Image
      src="/images/placeholder.jpg"
      width={40}
      height={40}
      className="rounded-full"
      alt="Avatar"
    />
  );
};

export default Avatar;
