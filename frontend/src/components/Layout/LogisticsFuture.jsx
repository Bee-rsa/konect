import { HiArrowPathRoundedSquare, HiOutlineTruck, HiClock, HiChartBar } from "react-icons/hi2";

const LogisticsFuture = () => {
  return (
    <div className="w-full">
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-custom-sage text-left font-poppins w-full min-h-[50vh] sm:min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl px-4 sm:px-6 font-bold text-custom-blue mt-4 sm:mt-0 mb-8 sm:mb-12 text-left">
            Experience the Future of Logistics
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
            {/* Feature 1 */}
            <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-lg shadow-lg h-full transition-transform hover:scale-[1.02]">
              <div className="p-4 sm:p-6 rounded-full mb-3 sm:mb-4 bg-gray-100 shadow-lg">
                <HiArrowPathRoundedSquare className="text-3xl sm:text-4xl text-custom-blue" />
              </div>
              <h4 className="tracking-tighter mb-2 font-semibold text-xl sm:text-2xl text-center">Instant Rates</h4>
              <p className="text-gray-600 text-center text-sm sm:text-base mb-0">
                Across all modes of transportation, Cargo Connect eliminates the need to call several freight or courier companies. Get instant, accurate quotes to make your shipping decisions faster and easier.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-lg shadow-lg h-full transition-transform hover:scale-[1.02]">
              <div className="p-4 sm:p-6 rounded-full mb-3 sm:mb-4 bg-gray-100 shadow-lg">
                <HiOutlineTruck className="text-3xl sm:text-4xl text-custom-blue" />
              </div>
              <h4 className="tracking-tighter mb-2 font-semibold text-xl sm:text-2xl text-center">Real-time Tracking</h4>
              <p className="text-gray-600 text-center text-sm sm:text-base mb-0">
                Stay in control with real-time tracking. Monitor your cargo&apos;s movement from start to finish, ensuring you&apos;re always up to date with the delivery progress. No more guesswork about the status of your shipment.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-lg shadow-lg h-full transition-transform hover:scale-[1.02]">
              <div className="p-4 sm:p-6 rounded-full mb-3 sm:mb-4 bg-gray-100 shadow-lg">
                <HiClock className="text-3xl sm:text-4xl text-custom-blue" />
              </div>
              <h4 className="tracking-tighter mb-2 font-semibold text-xl sm:text-2xl text-center">Faster Delivery</h4>
              <p className="text-gray-600 text-center text-sm sm:text-base mb-0">
                Enjoy faster delivery times with optimized routes and smarter logistics. Cargo Connect ensures that your shipments arrive in the shortest possible time, saving you both time and money.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-lg shadow-lg h-full transition-transform hover:scale-[1.02]">
              <div className="p-4 sm:p-6 rounded-full mb-3 sm:mb-4 bg-gray-100 shadow-lg">
                <HiChartBar className="text-3xl sm:text-4xl text-custom-blue" />
              </div>
              <h4 className="tracking-tighter mb-2 font-semibold text-xl sm:text-2xl text-center">User Friendly</h4>
              <p className="text-gray-600 text-center text-sm sm:text-base mb-0">
                Booking freight doesn&apos;t have to be complicated. With Cargo Connect&apos;s easy-to-understand interface and streamlined features, you can quickly and efficiently book freight with just a few clicks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LogisticsFuture;