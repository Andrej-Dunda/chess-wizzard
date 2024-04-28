import './EllipsisMenuButton.scss'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';

type MenuOption = {
  name: string;
  onClick?: () => void;
  icon?: any;
}

type EllipsisMenuButtonProps = {
  menuOptions: MenuOption[];
  primaryColor?: string;
  secondaryColor?: string;
  onClick?: (e: any) => void;
  light?: boolean;
  className?: string;
}

const EllipsisMenuButton: React.FC<EllipsisMenuButtonProps> = ({ menuOptions, onClick, light, className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue(light ? '--grayscale-100' : '--grayscale-900').trim();
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue(light ? '--grayscale-900' : '--grayscale-100').trim();
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = (e: any) => {
    onClick && onClick(e);
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={`ellipsis-menu-button ${className}`} style={{ '--primary-color': primaryColor, '--secondary-color': secondaryColor } as React.CSSProperties}>
      <button
        type='button'
        onClick={toggleMenu}
        className='ellipsis-button'
        ref={buttonRef}
      >
        <FontAwesomeIcon icon={faEllipsis} color={primaryColor} width={'16px'} height={'16px'} />
      </button>
      {
        isMenuOpen && (
          <div className="popup-menu" ref={menuRef} onClick={() => setIsMenuOpen(false)}>
            {
              menuOptions.map((option: MenuOption, index: number) => {
                return (
                  <div
                    key={index}
                    className="menu-item"
                    onClick={option.onClick && option.onClick}
                  >
                    {option.icon && <FontAwesomeIcon icon={option.icon} color={grayscale900} width={'16px'} height={'16px'} />}
                    {option.name}
                  </div>
                )
              })
            }
          </div>
        )
      }
      
    </div>
  );
};

export default EllipsisMenuButton;