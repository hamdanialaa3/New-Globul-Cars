/**
 * 🎭 Globul Cars Design System - Animations
 * الرسوم المتحركة المتلاشية والانتقالات
 */

export const animations = {
  // Car-specific animations
  car: {
    // Car image fade-in with zoom
    imageFadeIn: {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { duration: 0.6, ease: "easeOut" }
    },

    // Car card hover effect
    cardHover: {
      initial: { scale: 1, y: 0 },
      hover: { 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.3, ease: "easeOut" }
      }
    },

    // Car slide animations
    slideInLeft: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, ease: "easeOut" }
    },

    slideInRight: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, ease: "easeOut" }
    },

    // Car wheel rotation
    wheelRotation: {
      animate: { rotate: 360 },
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },

    // Car speed lines
    speedLines: {
      initial: { opacity: 0, scaleX: 0 },
      animate: { opacity: 1, scaleX: 1 },
      transition: { duration: 0.8, ease: "easeOut" }
    }
  },

  // UI animations
  ui: {
    // Fade in from bottom
    fadeInUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: "easeOut" }
    },

    // Fade in from top
    fadeInDown: {
      initial: { opacity: 0, y: -30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: "easeOut" }
    },

    // Scale in
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, ease: "easeOut" }
    },

    // Stagger animation for lists
    staggerContainer: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    },

    staggerItem: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: "easeOut" }
    },

    // Button animations
    buttonPress: {
      tap: { scale: 0.95 },
      transition: { duration: 0.1 }
    },

    buttonHover: {
      hover: { scale: 1.05 },
      transition: { duration: 0.2 }
    },

    // Loading animations
    spin: {
      animate: { rotate: 360 },
      transition: { duration: 1, repeat: Infinity, ease: "linear" }
    },

    pulse: {
      animate: { scale: [1, 1.05, 1] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },

    // Progress bar
    progressBar: {
      initial: { width: 0 },
      animate: { width: "100%" },
      transition: { duration: 1, ease: "easeOut" }
    }
  },

  // Page transitions
  page: {
    // Page enter animation
    pageEnter: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.4, ease: "easeInOut" }
    },

    // Modal animations
    modal: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { duration: 0.3, ease: "easeOut" }
    },

    // Drawer animations
    drawer: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  },

  // Glassmorphism effects
  glass: {
    // Glass card hover
    glassHover: {
      initial: { backdropFilter: "blur(10px)", backgroundColor: "rgba(255, 255, 255, 0.1)" },
      hover: { 
        backdropFilter: "blur(20px)", 
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        transition: { duration: 0.3 }
      }
    },

    // Glass morphing
    glassMorph: {
      initial: { borderRadius: "16px" },
      hover: { borderRadius: "24px" },
      transition: { duration: 0.3, ease: "easeOut" }
    }
  },

  // Loading states
  loading: {
    // Skeleton loading
    skeleton: {
      animate: {
        backgroundPosition: ["200% 0", "-200% 0"],
        transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
      }
    },

    // Shimmer effect
    shimmer: {
      animate: {
        backgroundPosition: ["200% 0", "-200% 0"],
        transition: { duration: 2, repeat: Infinity, ease: "linear" }
      }
    },

    // Dots loading
    dotsLoading: {
      animate: {
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      },
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    }
  },

  // Micro-interactions
  micro: {
    // Icon bounce
    iconBounce: {
      hover: { scale: 1.2 },
      tap: { scale: 0.9 },
      transition: { duration: 0.2, ease: "easeOut" }
    },

    // Text highlight
    textHighlight: {
      initial: { backgroundColor: "transparent" },
      hover: { backgroundColor: "rgba(255, 121, 0, 0.1)" },
      transition: { duration: 0.2 }
    },

    // Border glow
    borderGlow: {
      initial: { boxShadow: "0 0 0 0 rgba(255, 121, 0, 0.4)" },
      hover: { boxShadow: "0 0 20px rgba(255, 121, 0, 0.6)" },
      transition: { duration: 0.3 }
    }
  }
} as const;

export type AnimationConfig = typeof animations;
export default animations;
