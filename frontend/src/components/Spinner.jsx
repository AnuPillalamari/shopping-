import React from 'react';

const Spinner = ({ size = 'medium' }) => {
  const spinnerSize = size === 'small' ? '24px' : size === 'large' ? '72px' : '48px';
  const borderSize = size === 'small' ? '2px' : '4px';

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div
        className="pulse-loader"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderWidth: borderSize,
        }}
      ></div>
    </div>
  );
};

export default Spinner;
