import React, { useMemo } from 'react';

// ============================================================
// Constants
// ============================================================
const DEFAULT_SEPARATOR_COLOR = 'bg-gray-700';
const DEFAULT_TEXT_COLOR = 'text-gray-500';
const DEFAULT_HIGHLIGHT_COLOR = 'text-gray-700';

// ============================================================
// Title Component
// ============================================================
export const Title = ({
  text1,
  text2,
  separator = true,
  separatorColor = DEFAULT_SEPARATOR_COLOR,
  separatorWidth = 'w-8 sm:w-12',
  separatorHeight = 'h-[1px] sm:h-[2px]',
  textColor = DEFAULT_TEXT_COLOR,
  highlightColor = DEFAULT_HIGHLIGHT_COLOR,
  className = '',
  textClassName = '',
  highlightClassName = '',
  align = 'left',
  size = 'base',
  as: Component = 'div',
  ...props
}) => {
  // --- Memoized Styles ---
  const alignmentClasses = useMemo(() => {
    switch (align) {
      case 'center':
        return 'justify-center text-center';
      case 'right':
        return 'justify-end text-right';
      default:
        return 'justify-start text-left';
    }
  }, [align]);

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-2xl sm:text-3xl';
      case 'xl':
        return 'text-3xl sm:text-4xl';
      case '2xl':
        return 'text-4xl sm:text-5xl';
      default:
        return 'text-base sm:text-lg';
    }
  }, [size]);

  // --- Render ---
  return (
    <Component 
      className={`inline-flex gap-2 items-center ${alignmentClasses} ${className}`}
      {...props}
    >
      <p className={`${textColor} ${sizeClasses} ${textClassName}`}>
        {text1}
        <span className={`${highlightColor} font-medium ${highlightClassName}`}>
          {text2}
        </span>
      </p>
      
      {separator && (
        <span 
          className={`
            ${separatorColor} 
            ${separatorWidth} 
            ${separatorHeight} 
            rounded-full
            transition-all duration-300
          `}
          aria-hidden="true"
        />
      )}
    </Component>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Title;

// ============================================================
// Optional: Title with Icon
// ============================================================
export const TitleWithIcon = ({
  icon,
  iconPosition = 'left',
  iconSize = 'w-5 h-5',
  ...props
}) => {
  const iconElement = icon && (
    <span className={`flex-shrink-0 ${iconSize}`}>
      {icon}
    </span>
  );

  return (
    <div className="flex items-center gap-2">
      {iconPosition === 'left' && iconElement}
      <Title {...props} />
      {iconPosition === 'right' && iconElement}
    </div>
  );
};

// ============================================================
// Optional: Animated Title
// ============================================================
export const AnimatedTitle = ({
  text1,
  text2,
  animation = 'fade',
  delay = 0,
  ...props
}) => {
  const animationClasses = useMemo(() => {
    switch (animation) {
      case 'slide':
        return 'animate-slideIn';
      case 'bounce':
        return 'animate-bounceIn';
      case 'fade':
      default:
        return 'animate-fadeIn';
    }
  }, [animation]);

  return (
    <div 
      className={`${animationClasses}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Title text1={text1} text2={text2} {...props} />
    </div>
  );
};

// ============================================================
// Optional: Section Title with Subtitle
// ============================================================
export const SectionTitle = ({
  title,
  subtitle,
  subtitleColor = 'text-gray-400',
  ...props
}) => {
  return (
    <div className="text-center">
      <Title {...props} text1={title} text2="" />
      {subtitle && (
        <p className={`mt-2 text-sm ${subtitleColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

// ============================================================
// Optional: Badge Title
// ============================================================
export const BadgeTitle = ({
  badge,
  badgeColor = 'bg-black',
  badgeTextColor = 'text-white',
  ...props
}) => {
  return (
    <div className="flex items-center gap-3">
      <Title {...props} />
      {badge && (
        <span className={`
          px-2 py-0.5 text-xs font-medium rounded-full
          ${badgeColor} ${badgeTextColor}
        `}>
          {badge}
        </span>
      )}
    </div>
  );
};

// ============================================================
// CSS Animations (Add to your global CSS or Tailwind config)
// ============================================================
/*
Add these to your global CSS or tailwind.config.js:

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-slideIn {
  animation: slideIn 0.5s ease-out forwards;
}

.animate-bounceIn {
  animation: bounceIn 0.6s ease-out forwards;
}
*/