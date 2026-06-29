import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendarAlt } from 'react-icons/fa';

const customBlue = '#000042';

const Goods = () => {
  const navigate = useNavigate();
  const [selectedOriginType, setSelectedOriginType] = useState(null);
  const [goodsValue, setGoodsValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(null); 
  const [open, setOpen] = useState(false);

  const options = [
    { label: 'Pick own date' },
    { label: 'Yes, my goods are ready for collection' },
    { label: 'My goods will be ready within two weeks' },
    { label: 'My goods will be ready in more than two weeks' },
  ];

  const handleDone = () => {
    console.log({
      goodsValue,
      mode: selectedOriginType,
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
    });
    navigate('/user-home');
  };

  const isDoneEnabled =
    goodsValue &&
    selectedOriginType &&
    (selectedOriginType !== 'Pick own date' || selectedDate);

  return (
    <div className="max-w-md mx-auto font-poppins p-4 bg-white min-h-screen flex flex-col sm:hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-gray-800">Goods</h1>
        <button
          aria-label="Close"
          onClick={() => navigate('/user-home')}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-600 mt-0">Tell us about your goods?</p>

      {/* Progress Indicator */}
      <div className="mt-6 mb-4">
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-600">
          <span className={`${goodsValue ? 'text-custom-blue font-semibold' : ''}`}>
            {goodsValue ? `R${goodsValue}` : 'Amount'}
          </span>
          <span className="text-gray-400">{'>'}</span>
          <span className={`${selectedOriginType ? 'text-custom-blue font-semibold' : ''}`}>
            {selectedOriginType || 'Goods Type'}
          </span>
          {selectedOriginType === 'Pick own date' && selectedDate && (
            <>
              <span className="text-gray-400">{'>'}</span>
              <span className="text-custom-blue font-semibold">
                {selectedDate.toLocaleDateString()}
              </span>
            </>
          )}
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
          <div
            className="h-full bg-custom-blue rounded-full transition-all duration-500"
            style={{
              width:
                goodsValue && selectedOriginType && (selectedOriginType !== 'Pick own date' || selectedDate)
                  ? '100%'
                  : goodsValue || selectedOriginType
                  ? '50%'
                  : '0%',
            }}
          ></div>
        </div>
      </div>

      {/* Goods Value Input */}
      <div className="mt-4">
        <label htmlFor="goodsValue" className="block text-sm font-medium text-gray-700 mb-1">
          Goods Value
        </label>
        <input
          type="number"
          id="goodsValue"
          name="goodsValue"
          value={goodsValue}
          onChange={(e) => setGoodsValue(e.target.value)}
          placeholder="Enter amount"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
        />
      </div>

      {/* Goods Type Selection */}
      <div className="mt-3">
  <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Select Mode</p>
  <div className="flex flex-col space-y-3 w-full">
    {options.map(({ label }) => (
      <div key={label} className="w-full">
        <button
          onClick={() => {
            setSelectedOriginType(label);
            if (label !== 'Pick own date') setSelectedDate(null);
          }}
          className={`w-full flex items-center space-x-3 py-3 px-4 rounded-md border transition-colors duration-200 text-left ${
            selectedOriginType === label ? 'border-blue-900' : 'border-gray-300'
          } hover:border-blue-900`}
          style={{
            borderColor: selectedOriginType === label ? customBlue : undefined,
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
          <span className="text-gray-700">{label}</span>
        </button>

        {/* Show date picker directly below "Pick own date" */}
        {label === 'Pick own date' && selectedOriginType === 'Pick own date' && (
          <div className="mt-3 w-full">
            <label htmlFor="pickDate" className="block text-sm font-medium text-gray-700 mb-1">
              What date will your goods be ready?
            </label>

            <div className="relative flex">
              <DatePicker
                id="pickDate"
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                onClickOutside={() => setOpen(false)}
                open={open}
                onInputClick={() => setOpen(true)}
                minDate={new Date()}
                placeholderText="Select a date"
                className="flex-grow px-3 py-2 border border-gray-300 border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
                calendarClassName="rounded-md shadow-lg"
                dateFormat="MMMM d, yyyy"
              />
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center px-3 border border-gray-300 border-l-0 rounded-r-md text-gray-400 hover:text-custom-blue focus:outline-none"
                aria-label="Toggle calendar"
                tabIndex={-1}
              >
                <FaRegCalendarAlt size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
</div>


      {/* Done Button */}
      {isDoneEnabled && (
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

Goods.propTypes = {
  onClose: PropTypes.func,
};

export default Goods;
