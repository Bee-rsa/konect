import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const customBlue = '#000042';

const icons = {
  courier: 'https://img.icons8.com/?size=100&id=T29P7mgpLcWy&format=png&color=000000',
  truck: 'https://img.icons8.com/?size=100&id=3562&format=png&color=000000',
  ship: 'https://img.icons8.com/?size=100&id=Ymoq4rCzDSiH&format=png&color=000000',
  warehousing: 'https://img.icons8.com/?size=100&id=20156&format=png&color=000000',
};

const Mode = () => {
  const navigate = useNavigate();
  const [selectedOriginType, setSelectedOriginType] = useState(null);

  const options = [
    { label: 'Courier Services', icon: icons.courier },
    { label: 'Trucking', icon: icons.truck },
    { label: 'Ship', icon: icons.ship },
    { label: 'Warehousing', icon: icons.warehousing },
  ];

  const handleDone = () => {
    console.log({ mode: selectedOriginType });
    navigate('/user-home');
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white min-h-screen flex flex-col sm:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-gray-800">Mode</h1>
        <button
          aria-label="Close"
          onClick={() => navigate('/user-home')}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      <p className="text-gray-600">How would you like to transport your goods?</p>

      {/* Mode Type Heading with Underline */}
      <div className="mt-6">
        <h2 className="text-sm font-medium text-gray-700 -mt-4 mb-2">
          {selectedOriginType || 'Mode Type'}
        </h2>
        <div className="h-1 w-full bg-gray-300 rounded">
          <div
            className="h-full bg-blue-900 rounded transition-all duration-300"
            style={{
              width: selectedOriginType ? '100%' : '0%',
            }}
          ></div>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Select Mode</p>
        <div className="flex flex-col space-y-3">
          {options.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setSelectedOriginType(label)}
              className={`flex items-center space-x-3 py-3 px-4 rounded-md border transition-colors duration-200 text-left ${
                selectedOriginType === label ? `border-[${customBlue}]` : 'border-gray-300'
              } hover:border-[${customBlue}]`}
              style={{
                borderColor: selectedOriginType === label ? customBlue : undefined,
                cursor: 'pointer',
                backgroundColor: 'white',
              }}
            >
              <span
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: selectedOriginType === label ? customBlue : '#d1d5db',
                }}
              >
                {selectedOriginType === label && (
                  <span
                    className="rounded-full"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: customBlue,
                    }}
                  />
                )}
              </span>
              <span className="text-gray-700 flex gap-2 items-center space-x-2">
                <img src={icon} alt={`${label} icon`} className="w-6 h-6" />
                <span>{label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedOriginType && (
        <button
          onClick={handleDone}
          className="mt-6 w-full bg-gradient-to-r from-blue-700 to-custom-blue text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Done
        </button>
      )}
    </div>
  );
};

Mode.propTypes = {
  onClose: PropTypes.func,
};

export default Mode;
