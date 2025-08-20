'use client';

import { useState, useEffect } from 'react';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Splash screen will be visible for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // Use a different state to unmount the component after the animation
  const [isMounted, setIsMounted] = useState(true);
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setIsMounted(false), 500); // Corresponds to fadeOut animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={isVisible ? 'splash-screen' : 'splash-screen splash-screen-hidden'}>
      <h1 className="splash-text">
        Welcome to Chennai Institute of Technology
      </h1>
    </div>
  );
}
