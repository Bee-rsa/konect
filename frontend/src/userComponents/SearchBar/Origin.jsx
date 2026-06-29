import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AddressAutocomplete from '../../components/Autocomplete';

const customBlue = '#000042'; // Tailwind custom blue

const icons = {
  world: 'https://img.icons8.com/?size=100&id=3685&format=png&color=000000',
  port: 'https://img.icons8.com/?size=100&id=WZJSvqLGKd2q&format=png&color=000000',
  warehouse: 'https://img.icons8.com/?size=100&id=20156&format=png&color=000000',
  business: 'https://img.icons8.com/?size=100&id=9166&format=png&color=000000',
  residential: 'https://img.icons8.com/?size=100&id=veP8TuXA23ip&format=png&color=000000',
};

const Origin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('originType');
  const [selectedOriginType, setSelectedOriginType] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');


  const countries = [
    { name: 'Botswana', flag: 'https://flagcdn.com/bw.svg' },
    { name: 'Lesotho', flag: 'https://flagcdn.com/ls.svg' },
    { name: 'Mozambique', flag: 'https://flagcdn.com/mz.svg' },
    { name: 'Namibia', flag: 'https://flagcdn.com/na.svg' },
    { name: 'South Africa', flag: 'https://flagcdn.com/za.svg' },
    { name: 'Zimbabwe', flag: 'https://flagcdn.com/zw.svg' },
  ];

  const options = [
    { label: 'Port or Airport', icon: icons.port },
    { label: 'Factory or Warehouse', icon: icons.warehouse },
    { label: 'Business Address', icon: icons.business },
    { label: 'Residential Address', icon: icons.residential },
  ];

  const handleOriginTypeSelect = (label) => {
    setSelectedOriginType(label);
    setActiveTab('world');
  };

  const handleCountrySelect = (name) => {
    setSelectedCountry(name);
    setActiveTab('address');
  };

  const handleDone = () => {
    console.log({
      originType: selectedOriginType,
      country: selectedCountry,
      address,
    });
    navigate('/user-home');
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'originType':
        return (
          <>
            <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Select type</p>
            <div className="flex flex-col space-y-3">
              {options.map(({ label, icon }) => (
                <button
                  key={label}
                  onClick={() => handleOriginTypeSelect(label)}
                  className={`flex items-center space-x-3 py-3 px-4 rounded-md border transition-colors duration-200 text-left ${
                    selectedOriginType === label
                      ? `border-[${customBlue}]`
                      : 'border-gray-300'
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
          </>
        );

      case 'world':
        return (
          <div className="mt-4 text-gray-700">
            <h2 className="text-sm font-medium text-gray-700 mt-4 mb-2">Country</h2>
            <input
              type="text"
              placeholder="Enter Country Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <ul className="max-h-96 overflow-auto">
              {filteredCountries.map(({ name, flag }, index) => (
                <li key={name} className="pb-2 cursor-pointer" onClick={() => handleCountrySelect(name)}>
                  {name === 'Botswana' && <hr className="border-gray-300 mb-2" />}
                  <div className="flex items-center space-x-3 py-2 mb-2">
                    <img
                      src={flag}
                      alt={`${name} flag`}
                      className="w-6 h-6 object-cover rounded-full border"
                    />
                    <span>{name}</span>
                  </div>
                  {name === 'Zimbabwe' && <hr className="border-gray-300 mt-2" />}
                  {index < filteredCountries.length - 1 && name !== 'Zimbabwe' && (
                    <hr className="border-gray-300" />
                  )}
                </li>
              ))}
              {filteredCountries.length === 0 && (
                <p className="text-sm text-gray-500">No country found.</p>
              )}
            </ul>
          </div>
        );

      case 'address':
        return (
          <div className="mt-4 text-gray-700">
  <AddressAutocomplete 
    value={address} 
    onChange={setAddress} 
  />

  {address && (
    <button
      onClick={handleDone}
      className="mt-4 w-full bg-gradient-to-r from-blue-700 to-custom-blue text-white py-2 rounded-md hover:bg-blue-700 transition"
    >
      Done
    </button>
  )}
</div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white min-h-screen flex flex-col sm:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-gray-800">Origin</h1>
        <button
          aria-label="Close"
          onClick={() => navigate('/user-home')}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      <p className="text-gray-600">Where are you shipping from?</p>

      <div className="relative mt-3">
        <div className="flex items-center space-x-2 pb-2">
          {selectedOriginType ? (
  <button
    onClick={() => setActiveTab('originType')}
    style={{ color: customBlue }}
    className="text-sm flex items-center space-x-2"
  >
    <img
      src={options.find((opt) => opt.label === selectedOriginType)?.icon}
      alt={`${selectedOriginType} icon`}
      className="inline w-5 h-5"
    />
    <span>{selectedOriginType}</span>
  </button>
) : (
  <button
    onClick={() => setActiveTab('originType')}
    style={{ color: activeTab === 'originType' ? customBlue : 'black' }}
    className="text-sm"
  >
    Origin Type
  </button>
)}

          <span className="text-gray-400">{'>'}</span>

          <button
            onClick={() => setActiveTab('world')}
            style={{ color: activeTab === 'world' ? customBlue : 'black' }}
            className="text-m font-medium"
            aria-label="World tab"
            >
            {selectedCountry ? (
                <img
                src={countries.find((c) => c.name === selectedCountry)?.flag}
                alt={`${selectedCountry} flag`}
                className="inline w-6 h-6 "
                />
            ) : (
                <img src={icons.world} alt="World icon" className="inline w-6 h-6" />
            )}
            </button>


          <span className="text-gray-400">{'>'}</span>

          <button
            onClick={() => setActiveTab('address')}
            style={{ color: activeTab === 'address' ? customBlue : 'black' }}
            className="text-sm"
          >
            Address
          </button>
        </div>
      <div className="relative w-full h-1 mt-1">
  {/* Background Line */}
  <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-full" />
  
  {/* Progress Line */}
  <div
    className="absolute bottom-0  left-0 h-1 rounded-full"
    style={{
      backgroundColor: "#1e3a8a",
      width:
        activeTab === 'originType'
          ? '33.33%'
          : activeTab === 'world'
          ? '66.66%'
          : '100%',
      transition: 'width 0.3s ease-in-out',
    }}
  />
</div>

      </div>

      <div className="flex-grow overflow-auto">{renderContent()}</div>
    </div>
  );
};

Origin.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Origin;
