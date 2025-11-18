import React from 'react';

const AquaBeaconLogo = ({ 
  width = 240, 
  height = 70, 
  className = "",
  showText = true,
  variant = "default" // "default", "white", "compact"
}) => {
  // Color schemes for different variants
  const getColors = () => {
    switch (variant) {
      case "white":
        return {
          text: "text-white",
          tagline: "text-white",
          droplet: "#60A5FA", // Light blue droplet for dark backgrounds
          highlight: "#DBEAFE"
        };
      case "compact":
        return {
          text: "text-gray-900",
          tagline: "text-gray-600",
          droplet: "#3B82F6", // Always blue droplet
          highlight: "#DBEAFE"
        };
      default:
        return {
          text: "text-gray-900",
          tagline: "text-gray-600", 
          droplet: "#3B82F6", // Always blue droplet
          highlight: "#DBEAFE"
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Water Droplet Icon - Consistent Blue Design */}
        <div className="flex-shrink-0">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main water droplet */}
            <path 
              d="M12 2C8 8 5 12 5 16C5 19.866 8.134 23 12 23C15.866 23 19 19.866 19 16C19 12 16 8 12 2Z" 
              fill={colors.droplet}
            />
            {/* Light reflection - For shine effect */}
            <ellipse 
              cx="9.5" 
              cy="14" 
              rx="1.5" 
              ry="2" 
              fill={colors.highlight} 
              fillOpacity="0.7"
            />
            {/* Additional small highlight for premium look */}
            <circle 
              cx="10" 
              cy="12" 
              r="1" 
              fill="#FFFFFF" 
              fillOpacity="0.4"
            />
          </svg>
        </div>

        {/* Logo Text */}
        <div className="flex flex-col">
          {/* AquaBeacon - One word, large and prominent */}
          <div className="flex items-center">
            <span 
              className={`font-bold leading-none`}
              style={{
                fontFamily: 'Georgia, "Brush Script MT", "Lucida Handwriting", cursive',
                fontSize: '32px',
                fontStyle: 'italic',
                letterSpacing: '1px',
                textShadow: variant === "white" ? '1px 1px 2px rgba(0,0,0,0.3)' : '1px 1px 2px rgba(0,0,0,0.1)',
                color: variant === "white" ? 'white' : (variant === "compact" || variant === "default") ? '#1f2937' : '#1f2937',
                backgroundColor: variant === "white" ? 'transparent' : undefined
              }}
            >
              AquaBeacon
            </span>
          </div>
          
          {/* Tagline - Clear and visible */}
          {showText && (
            <span 
              className={`font-semibold uppercase tracking-widest leading-none`}
              style={{ 
                fontSize: '11px',
                letterSpacing: '2.5px',
                marginTop: '2px',
                color: variant === "white" ? 'white' : (variant === "compact" || variant === "default") ? '#6b7280' : '#6b7280'
              }}
            >
              Water Bottling Intelligence
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AquaBeaconLogo;