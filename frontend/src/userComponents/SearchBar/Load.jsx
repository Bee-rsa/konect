import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const itemWeights = {
  car: 1500,
  bike: 15,
  fridge: 80,
  sofa: 120,
  // Add more items here (50+)
  television: 25,
  washingmachine: 70,
  laptop: 2,
  table: 40,
  chair: 10,
  mattress: 30,
  box: 5,
  lamp: 3,
  guitar: 4,
  piano: 300,
  bicycle: 12,
  microwave: 15,
  suitcase: 20,
  dogcrate: 8,
  toolbox: 18,
  printer: 12,
  fan: 6,
  bookshelf: 45,
  carpet: 25,
  drumset: 60,
  surfboard: 10,
  scooter: 20,
  kayak: 30,
  treadmill: 90,
  wardrobe: 80,
  fridgefreezer: 90,
  cooker: 50,
  dishwasher: 70,
  heater: 15,
  vacuum: 5,
  blender: 3,
  guitaramp: 10,
  camera: 1,
  speaker: 12,
  toolboxlarge: 25,
  suitcaselarge: 35,
  mattressking: 40,
  pillow: 2,
  blankets: 5,
  coolerbox: 10,
  fishingrod: 4,
  skateboard: 8,
  snowboard: 7,
  suitcasecarryon: 7,
  chainsaw: 8,
  lawnmower: 35,
};

const commonItems = Object.keys(itemWeights).sort();

const Load = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('Loose Cargo');
  const [query, setQuery] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState(null);

  const getProgressLeft = () => {
    switch (selected) {
      case 'Loose Cargo':
        return '0%';
      case 'Containers':
        return '33.33%';
      case 'General Cargo':
        return '66.66%';
      default:
        return '0%';
    }
  };

  const handleSearch = (text) => {
    setQuery(text);
    const weight = itemWeights[text.toLowerCase()];
    setEstimatedWeight(weight ?? null);
  };

  const handleScan = () => {
    alert('Camera access placeholder – integrate AI scanner logic here.');
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white min-h-screen flex flex-col sm:hidden relative">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-gray-800">Load</h1>
        <button
          aria-label="Close"
          onClick={() => navigate('/user-home')}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      <p className="text-gray-600">Where are you shipping?</p>

      <div className="mt-4 relative">
        <div className="flex text-left text-sm font-medium text-gray-800 border-b border-gray-300">
          {['Loose Cargo', 'Containers', 'General Cargo'].map((type) => (
            <div
              key={type}
              className="w-1/3 text-center cursor-pointer py-2"
              onClick={() => setSelected(type)}
            >
              <span className={selected === type ? 'text-blue-600' : ''}>
                {type}
              </span>
            </div>
          ))}
        </div>

        <div
          className="absolute bottom-0 left-0 h-1 bg-blue-800 rounded-full transition-all duration-300"
          style={{
            width: '33.33%',
            left: getProgressLeft(),
          }}
        />
      </div>

      {selected === 'General Cargo' && (
        <div className="mt-6">
          <h2 className="text-md font-semibold text-gray-800 mb-2">
            📦 Smart AI-Driven Weight Estimator
          </h2>

          <input
            type="text"
            placeholder="Type an item (e.g., car)"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          {estimatedWeight !== null && (
            <p className="text-sm text-blue-700 mb-4">
              Estimated Weight: {estimatedWeight} kg
            </p>
          )}

          <h3 className="text-sm font-medium text-gray-700 mb-2">Common Cargo Items:</h3>
          <div className="max-h-40 overflow-y-scroll text-sm border border-gray-200 p-2 rounded mb-4">
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {commonItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleScan}
            className="w-full bg-blue-800 text-white py-2 px-4 rounded shadow hover:bg-blue-900 transition duration-300"
          >
            📷 Scan Cargo with AI
          </button>
        </div>
      )}
    </div>
  );
};

export default Load;
