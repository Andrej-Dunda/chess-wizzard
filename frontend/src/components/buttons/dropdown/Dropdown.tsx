import React, { useEffect, useRef, useState } from 'react'
import './Dropdown.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

type DropdownProps = {
  dropdownItems: string[];
  selectedItem: string;
  setSelectedItem: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  label?: string;
}

const Dropdown = ({ dropdownItems, selectedItem, setSelectedItem, className, label }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        itemsRef.current &&
        buttonRef.current &&
        !itemsRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: string) => {
    setSelectedItem(item)
    setIsOpen(false)
  }

  return (
    <div className='dropdown'>
      {label && <span className='label'>{label}</span>}
      <button className={`dropdown-button ${className}`} onClick={() => setIsOpen(!isOpen)} ref={buttonRef}>
        <span className='selected-item-label'>{selectedItem}</span>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} color={grayscale900} />
      </button>
      <div className={`dropdown-items-wrapper ${isOpen ? 'open' : ''}`} ref={itemsRef}>
        <div className="dropdown-items">
          {dropdownItems.map((item, index) => {
            return (
              <div key={index} className="dropdown-item" onClick={() => handleItemClick(item)}>
                {item}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dropdown
