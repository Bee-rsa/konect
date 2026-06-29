import { Link } from "react-router-dom";
import { FiMap, FiUsers, FiTruck, FiClock,FiArrowRight, FiShield, FiClipboard, FiDollarSign } from 'react-icons/fi';
import Ride from "../userComponents/RideSearchBar";

const UserHome = () => {
  return (
    <div
      className="w-full h-auto min-h-screen -mt-0.5 flex flex-col items-center p-2 pt-20 bg-stone-200"
    >
      
      <div className="w-full -mt-12">
        <Ride />
      </div>

      

      {/* RIDE FEATURES - HORIZONTAL SCROLL */}
<div className="w-full mt-10 px-6">
  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">

    <div className="min-w-[220px] snap-center bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition">
      <FiUsers className="text-4xl text-blue-600 mb-3" />
      <h3 className="font-semibold">Work Travel Groups</h3>
      <p className="text-sm text-gray-500 mt-1">
        Shared corporate and team travel
      </p>
    </div>

    <div className="min-w-[220px] snap-center bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition">
      <FiMap className="text-4xl text-blue-600 mb-3" />
      <h3 className="font-semibold">Long Distance Trips</h3>
      <p className="text-sm text-gray-500 mt-1">
        Intercity and cross-country rides
      </p>
    </div>

    <div className="min-w-[220px] snap-center bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition">
      <FiTruck className="text-4xl text-blue-600 mb-3" />
      <h3 className="font-semibold">Cargo Mobility</h3>
      <p className="text-sm text-gray-500 mt-1">
        Transport goods and equipment
      </p>
    </div>

    <div className="min-w-[220px] snap-center bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition">
      <FiClock className="text-4xl text-blue-600 mb-3" />
      <h3 className="font-semibold">On-Demand Dispatch</h3>
      <p className="text-sm text-gray-500 mt-1">
        Fast pickup scheduling
      </p>
    </div>

  </div>
</div>

      {/* Main Content with three containers */}
      <div className="flex flex-col md:flex-row justify-around px-6 w-full max-w-6xl mt-24 space-y-8 md:space-y-0 md:space-x-12">
        {/* Cargo Connect Insurance */}
        <Link to="/insurance" className="w-full md:w-1/3 group">
          <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition duration-300 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Cargo Insurance</h2>
            <div className="border-b border-gray-200 mb-4"></div>
            <p className="text-gray-700 mb-4">
              Ensure your cargo is fully protected during transit. Our insurance gives you confidence from pickup to delivery.
            </p>
            <div className="border-b border-gray-200 mb-4"></div>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>Protection against loss or damage</li>
              <li>Quick claims processing</li>
              <li>Applies to local and international freight</li>
            </ul>
            <div className="mt-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 group-hover:from-blue-700 group-hover:to-blue-500 transition-colors">
                <FiShield className="w-5 h-5" />
                <span>Get Insured</span>
                <FiArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>

        {/* Transportation Tenders */}
        <Link to="/terms-and-conditions-tenders" className="w-full md:w-1/3 group">
          <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition duration-300 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Transportation Tenders</h2>
            <div className="border-b border-gray-200 mb-4"></div>
            <p className="text-gray-700 mb-4">
              Need multiple freight options for large scale or long duration? Submit a tender and receive competitive quotes from top-rated logistics companies.
            </p>
            <div className="border-b border-gray-200 mb-4"></div>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>Post your shipping needs</li>
              <li>Compare prices and services</li>
              <li>Select the best offer for your business</li>
            </ul>
            <div className="mt-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 group-hover:from-blue-700 group-hover:to-blue-500 transition-colors">
                <FiClipboard className="w-5 h-5" />
                <span>Create Tender</span>
                <FiArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>

        {/* Cargo Connect Credit */}
        <Link to="/credit" className="w-full md:w-1/3 group">
          <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition duration-300 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Cargo Connect Credit</h2>
            <div className="border-b border-gray-200 mb-4"></div>
            <p className="text-gray-700 mb-4">
              Spread your logistics costs over time with flexible payment options. Available for qualified businesses.
            </p>
            <div className="border-b border-gray-200 mb-4"></div>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>Available in South Africa, Namibia, and Botswana</li>
              <li>No upfront fees</li>
              <li>Easy application process</li>
            </ul>
            <div className="mt-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 group-hover:from-blue-700 group-hover:to-blue-500 transition-colors">
                <FiDollarSign className="w-5 h-5" />
                <span>Apply Now</span>
                <FiArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default UserHome;