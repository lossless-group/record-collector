'use client';

import { useState, useEffect } from 'react';
import { Database, Upload, Zap, Download, RotateCcw } from 'lucide-react';

// Developer toggle - set to false to skip splash screen
const SHOW_SPLASH_SCREEN = false;

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(SHOW_SPLASH_SCREEN);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // If splash screen is disabled, immediately complete
    if (!SHOW_SPLASH_SCREEN) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, 6000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    // Only run animations if splash screen is enabled
    if (!SHOW_SPLASH_SCREEN) return;

    const phases = [0, 1, 2, 3];
    phases.forEach((phase, index) => {
      setTimeout(() => {
        setAnimationPhase(phase);
      }, index * 1000);
    });
  }, []);

  // If splash screen is disabled, don't render anything
  if (!SHOW_SPLASH_SCREEN) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex items-center justify-center animate-fadeOut">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white animate-slideOutUp">
            Welcome, Laerdal
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-indigo-500/20 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-pink-500/20 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="text-center relative z-10">
        {/* Welcome text with staggered animation */}
        <h1 className={`text-6xl md:text-8xl font-bold text-white mb-8 transition-all duration-1000 ${
          animationPhase >= 0 ? 'animate-slideInDown opacity-100' : 'opacity-0 translate-y-[-50px]'
        }`}>
          Welcome, Laerdal
        </h1>

        {/* Tagline with icon animations */}
        <div className={`flex items-center justify-center gap-6 mb-8 transition-all duration-1000 delay-300 ${
          animationPhase >= 1 ? 'animate-slideInUp opacity-100' : 'opacity-0 translate-y-[50px]'
        }`}>
          <div className="flex items-center gap-3 text-2xl md:text-3xl font-semibold text-blue-200">
            <Upload className={`w-8 h-8 transition-all duration-700 delay-500 ${
              animationPhase >= 1 ? 'animate-bounceIn' : 'scale-0'
            }`} />
            <span>Import</span>
          </div>
          
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          
          <div className="flex items-center gap-3 text-2xl md:text-3xl font-semibold text-purple-200">
            <Zap className={`w-8 h-8 transition-all duration-700 delay-700 ${
              animationPhase >= 2 ? 'animate-bounceIn' : 'scale-0'
            }`} />
            <span>Augment</span>
          </div>
          
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          
          <div className="flex items-center gap-3 text-2xl md:text-3xl font-semibold text-indigo-200">
            <Download className={`w-8 h-8 transition-all duration-700 delay-900 ${
              animationPhase >= 2 ? 'animate-bounceIn' : 'scale-0'
            }`} />
            <span>Export</span>
          </div>
          
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          
          <div className="flex items-center gap-3 text-2xl md:text-3xl font-semibold text-pink-200">
            <RotateCcw className={`w-8 h-8 transition-all duration-700 delay-1100 ${
              animationPhase >= 3 ? 'animate-spinIn' : 'scale-0'
            }`} />
            <span>Repeat</span>
          </div>
        </div>

        {/* Subtitle */}
        <p className={`text-xl md:text-2xl text-gray-300 transition-all duration-1000 delay-600 ${
          animationPhase >= 3 ? 'animate-fadeIn opacity-100' : 'opacity-0'
        }`}>
          Your Ultimate Record Management Solution
        </p>

        {/* Loading indicator */}
        <div className={`mt-12 transition-all duration-1000 delay-800 ${
          animationPhase >= 3 ? 'animate-fadeIn opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>

      {/* Floating database icon */}
      <div className={`absolute bottom-8 right-8 transition-all duration-1000 delay-1000 ${
        animationPhase >= 3 ? 'animate-float opacity-100' : 'opacity-0 translate-y-[20px]'
      }`}>
        <Database className="w-16 h-16 text-white/30" />
      </div>
    </div>
  );
} 