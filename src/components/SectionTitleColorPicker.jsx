import React, { useState, useEffect } from 'react';

const SectionTitleColorPicker = () => {
  const [titleBlockColor, setTitleBlockColor] = useState('#000000');
  const [isOpen, setIsOpen] = useState(false);

  // Update CSS variables when color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--section-title-background', titleBlockColor);
    
    // Calculate text color based on background brightness
    const brightness = getBrightness(titleBlockColor);
    const textColor = brightness > 128 ? '#000000' : '#ffffff';
    document.documentElement.style.setProperty('--section-title-text', textColor);
    
    // Update all section headers with the new color
    updateSectionHeaderColors(titleBlockColor, textColor);
  }, [titleBlockColor]);

  // Calculate brightness of a hex color
  const getBrightness = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  // Update all section header colors
  const updateSectionHeaderColors = (bgColor, textColor) => {
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
      header.style.backgroundColor = bgColor;
      header.style.color = textColor;
    });
  };

  // Handle hex input change
  const handleHexChange = (e) => {
    const value = e.target.value;
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      setTitleBlockColor(value);
    }
  };

  // Handle hex input blur
  const handleHexBlur = (e) => {
    const value = e.target.value;
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      setTitleBlockColor(value);
    } else {
      e.target.value = titleBlockColor;
    }
  };

  // Handle key press in hex input
  const handleHexKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div className="section-title-color-picker" style={{ 
      position: 'relative',
      zIndex: 1000,
      padding: '10px',
      borderRadius: '8px',
      border: 'none'
    }}>
      <button
        className="color-picker-toggle"
        onClick={() => {
          console.log('Color picker button clicked! Current state:', { isOpen, titleBlockColor });
          setIsOpen(!isOpen);
        }}
        title="Change Section Title Colors"
        style={{
          backgroundColor: titleBlockColor,
          color: getBrightness(titleBlockColor) > 128 ? '#000000' : '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
      >
        <div 
          className="color-preview-circle"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: titleBlockColor,
            border: '2px solid #e5e7eb',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        Title Colors
      </button>

      {isOpen && (
        <div className="color-picker-panel" style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '250px'
        }}>
          <div className="panel-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: 0, color: '#374151' }}>Section Title Colors</h4>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>

          <div className="color-input-section" style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Background Color:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="text"
                value={titleBlockColor}
                onChange={handleHexChange}
                onBlur={handleHexBlur}
                onKeyPress={handleHexKeyPress}
                placeholder="#f8fafc"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
                title="Enter hex color code (e.g., #f8fafc)"
              />
              <input
                type="color"
                value={titleBlockColor}
                onChange={(e) => setTitleBlockColor(e.target.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="Pick color from color picker"
              />
            </div>
          </div>

          <div className="color-preview-section" style={{
            padding: '16px',
            backgroundColor: titleBlockColor,
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              color: getBrightness(titleBlockColor) > 128 ? '#000000' : '#ffffff',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Sample Title Text
            </div>
            <div style={{
              color: getBrightness(titleBlockColor) > 128 ? '#000000' : '#ffffff',
              fontSize: '12px',
              opacity: 0.8,
              marginTop: '4px'
            }}>
              This is how your section titles will look
            </div>
          </div>

          <div className="preset-colors" style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Quick Colors:
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {['#f8fafc', '#fef3c7', '#dbeafe', '#d1fae5', '#f3e8ff', '#fecaca', '#fed7aa', '#fde68a'].map((color) => (
                <button
                  key={color}
                  onClick={() => setTitleBlockColor(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: color,
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  title={`Use ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="info-text" style={{
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Changes apply to all section titles and will be included in XML export
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionTitleColorPicker;