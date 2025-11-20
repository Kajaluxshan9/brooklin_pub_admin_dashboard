// Enhanced animations for the admin dashboard

export const animations = {
  // Fade animations
  fadeIn: {
    animation: "fadeIn 0.3s ease-in-out",
    "@keyframes fadeIn": {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },

  fadeInUp: {
    animation: "fadeInUp 0.5s ease-out",
    "@keyframes fadeInUp": {
      from: {
        opacity: 0,
        transform: "translateY(20px)",
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
  },

  fadeInDown: {
    animation: "fadeInDown 0.5s ease-out",
    "@keyframes fadeInDown": {
      from: {
        opacity: 0,
        transform: "translateY(-20px)",
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
  },

  // Scale animations
  scaleIn: {
    animation: "scaleIn 0.3s ease-out",
    "@keyframes scaleIn": {
      from: {
        opacity: 0,
        transform: "scale(0.9)",
      },
      to: {
        opacity: 1,
        transform: "scale(1)",
      },
    },
  },

  pulseGlow: {
    animation: "pulseGlow 2s ease-in-out infinite",
    "@keyframes pulseGlow": {
      "0%, 100%": {
        boxShadow: "0 0 20px rgba(200, 121, 65, 0.3)",
      },
      "50%": {
        boxShadow: "0 0 30px rgba(200, 121, 65, 0.5)",
      },
    },
  },

  // Slide animations
  slideInRight: {
    animation: "slideInRight 0.4s ease-out",
    "@keyframes slideInRight": {
      from: {
        opacity: 0,
        transform: "translateX(30px)",
      },
      to: {
        opacity: 1,
        transform: "translateX(0)",
      },
    },
  },

  slideInLeft: {
    animation: "slideInLeft 0.4s ease-out",
    "@keyframes slideInLeft": {
      from: {
        opacity: 0,
        transform: "translateX(-30px)",
      },
      to: {
        opacity: 1,
        transform: "translateX(0)",
      },
    },
  },

  // Float animation
  float: {
    animation: "float 3s ease-in-out infinite",
    "@keyframes float": {
      "0%, 100%": {
        transform: "translateY(0px)",
      },
      "50%": {
        transform: "translateY(-10px)",
      },
    },
  },

  // Rotate animation
  rotate: {
    animation: "rotate 2s linear infinite",
    "@keyframes rotate": {
      from: {
        transform: "rotate(0deg)",
      },
      to: {
        transform: "rotate(360deg)",
      },
    },
  },

  // Shimmer animation
  shimmer: {
    animation: "shimmer 2s infinite",
    "@keyframes shimmer": {
      "0%": {
        backgroundPosition: "-1000px 0",
      },
      "100%": {
        backgroundPosition: "1000px 0",
      },
    },
  },

  // Bounce animation
  bounce: {
    animation: "bounce 1s ease infinite",
    "@keyframes bounce": {
      "0%, 100%": {
        transform: "translateY(0)",
      },
      "50%": {
        transform: "translateY(-5px)",
      },
    },
  },

  // Shake animation
  shake: {
    animation: "shake 0.5s ease",
    "@keyframes shake": {
      "0%, 100%": {
        transform: "translateX(0)",
      },
      "10%, 30%, 50%, 70%, 90%": {
        transform: "translateX(-5px)",
      },
      "20%, 40%, 60%, 80%": {
        transform: "translateX(5px)",
      },
    },
  },

  // Gradient animation
  gradientShift: {
    animation: "gradientShift 3s ease infinite",
    "@keyframes gradientShift": {
      "0%, 100%": {
        backgroundPosition: "0% 50%",
      },
      "50%": {
        backgroundPosition: "100% 50%",
      },
    },
  },
};

// Transition presets
export const transitions = {
  smooth: "all 0.3s ease",
  fast: "all 0.15s ease",
  slow: "all 0.5s ease",
  bouncy: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  elastic: "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

// Stagger animation delays (for use with lists)
export const staggerDelay = (index: number, baseDelay: number = 50) => ({
  animationDelay: `${index * baseDelay}ms`,
});
