import { useState } from "react";
import freightImage from "../../assets/Top View.jpg";
import additionalImage from "../../assets/20241012_010803.jpg";
import newsletterImage from '../../assets/fun-delivery-concept-with-variety-elements.png';
import { 
    FaTruck, 
    FaShippingFast, 
    FaShip, 
    FaWarehouse, 
    FaGlobeAmericas,
    FaBalanceScale
} from 'react-icons/fa';

const AboutCargoConnect = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const downloadCEOLetter = () => {
    const pdfUrl = '/ceo-letter.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'CargoConnect-CEO-Letter.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="bg-white w-full overflow-hidden"> 
      {/* Hero Section */}
      <div className="pt-8 md:pt-10"></div>
      <div className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-12 py-6 lg:py-12">
        <div className="w-full lg:w-1/2 mb-8 lg:mb-0 px-4 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-poppins mb-4 leading-tight tracking-wide">
            To establish an open logistics network that enhances the efficiency and speed of freight delivery worldwide.
          </h1>
        </div>
        <div className="w-full lg:w-1/2 px-4 lg:px-8">
          <img 
            src={freightImage} 
            alt="Freight iT Logistics"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* LogisticsFuture Component */}
      <div className="px-4 sm:px-6">
        
      </div>

      {/* Journey Section */}
      <div className="bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-12 my-12">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Left Column - Journey */}
          <div className="lg:w-2/3">
            <div className="relative mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 font-poppins">
                Cargo Connect Journey
              </h1>
              <p className="mt-2 text-blue-600">This is just the first chapter.</p>
            </div>

            <div className="relative pl-6 md:pl-12 border-l-2 border-blue-200 space-y-6">
              {/* Timeline dots */}
              <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-blue-900 -ml-[7px]"></div>
              <div className="absolute left-0 top-1/4 w-3 h-3 rounded-full bg-blue-700 -ml-[7px]"></div>
              <div className="absolute left-0 top-1/2 w-3 h-3 rounded-full bg-blue-500 -ml-[7px]"></div>
              <div className="absolute left-0 top-3/4 w-3 h-3 rounded-full bg-blue-400 -ml-[7px]"></div>
              <div className="absolute left-0 bottom-0 w-3 h-3 rounded-full bg-blue-300 -ml-[7px]"></div>

              {/* Story paragraphs */}
              <div className="relative bg-white p-4 rounded-lg shadow-xs">
                <p className="text-base text-gray-800">
                  <span className="font-semibold text-blue-700">Every business has its spark </span> — that moment when a simple idea refuses to leave your mind. The journey of Cargo Connect started as just that: a vision born from curiosity, a passion for logistics, and a desire to make freight movement easier and more accessible for everyone.
                </p>
              </div>

              <div className="relative bg-white p-4 rounded-lg shadow-xs">
                <p className="text-base text-gray-800">
                  <span className="font-medium text-blue-600">Why does booking freight still feel like guesswork?</span> Why isn&apos;t there a simple way for customers to compare, calculate, and confirm freight services in real time? Cargo Connect was developed to fill the gap as a missing platform to connect customers to hundreds of rates in seconds — one that brings customers and logistics providers together in a clear, user-friendly way.
                </p>
              </div>

              <div className="relative bg-white p-4 rounded-lg shadow-xs">
                <p className="text-base text-gray-800">
                  What makes us different? We&apos;re <span className="italic">operator-built</span>. Every feature was forged from actual pain points in Africa&apos;s supply chains.
                </p>
              </div>

              {/* Founder quote */}
              <div className="relative bg-blue-700 text-white p-4 rounded-lg">
                <svg className="w-5 h-5 absolute -top-2 -left-2 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-m italic">
                &quot;Success in logistics isn&apos;t just about moving goods — it&apos;s about moving ideas forward, connecting people, and creating systems that make complexity feel simple.&quot;
                </p>
                <p className="mt-1 text-m font-semibold">— Brendan, Founder & CEO</p>
              </div>

              <div className="relative bg-white p-4 rounded-lg shadow-xs">
                <p className="text-base text-gray-800">
                  Today, what began as scribbles is revolution in the freight industry. We&apos;re engineering the future of African logistics—where distance is no barrier to opportunity, and every entrepreneur has access to world-class supply chain tools.
                </p>
              </div>

              <div className="relative bg-white p-4 rounded-lg shadow-xs">
                <p className="text-base text-gray-800">
                  <span className="font-semibold text-blue-700">Cargo Connect isn&apos;t the end of the journey</span> — it&apos;s the beginning. The mission is to empower others, simplify freight management, and contribute to the growth of small and large businesses alike. It&apos;s proof that an idea, when nurtured with intention and persistence, can turn into something real.
                </p>
              </div>

              {/* Call to action */}
              <div className="text-center mt-6">
                <p className="text-base font-large text-blue-800 mb-3">Ready to be part of the movement?</p>
              </div>
            </div>
          </div>

          {/* Right Column - Products */}
          <div className="lg:w-1/3 mt-8 lg:mt-24 lg:pl-12">
            <div className="bg-gray-100 rounded-lg shadow-md p-6 h-full">
              <h3 className="text-xl font-bold text-blue-900 mb-6 font-poppins">Our Services</h3>
              
              {/* Trucking */}
              <a href="/trucking" className="block mb-6 group">
                <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <FaTruck className="text-2xl text-blue-500 mr-3" />
                    <h4 className="font-semibold text-blue-700 group-hover:text-blue-600">Trucking</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Reliable road freight solutions with real-time tracking and competitive rates.
                  </p>
                </div>
              </a>

              {/* Courier Services */}
              <a href="/courier" className="block mb-6 group">
                <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <FaShippingFast className="text-2xl text-blue-500 mr-3" />
                    <h4 className="font-semibold text-blue-700 group-hover:text-blue-600">Courier Services</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Fast, secure parcel delivery for businesses and individuals.
                  </p>
                </div>
              </a>

              {/* Ocean Freight */}
              <a href="/ocean-freight" className="block mb-6 group">
                <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <FaShip className="text-2xl text-blue-500 mr-3" />
                    <h4 className="font-semibold text-blue-700 group-hover:text-blue-600">Ocean Freight</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Cost-effective international shipping with full container and LCL options.
                  </p>
                </div>
              </a>

              {/* Volumetric Weight Calculator */}
              <a href="/volumetric-calculator" className="block mb-6 group">
                <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <FaBalanceScale className="text-2xl text-blue-500 mr-3" />
                    <h4 className="font-semibold text-blue-700 group-hover:text-blue-600">Volumetric Calculator</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Calculate shipping costs based on package dimensions and weight to optimize your freight expenses.
                  </p>
                </div>
              </a>

              {/* Warehousing */}
              <a href="/warehousing" className="block mb-6 group">
                <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <FaWarehouse className="text-2xl text-blue-500 mr-3" />
                    <h4 className="font-semibold text-blue-700 group-hover:text-blue-600">Warehousing</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Secure storage solutions with inventory management and distribution.
                  </p>
                </div>
              </a>

              {/* Freight Forwarder */}
              <a href="/freight-forwarding" className="block group">
                <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <FaGlobeAmericas className="text-2xl text-blue-500 mr-3" />
                    <h4 className="font-semibold text-blue-700 group-hover:text-blue-600">Freight Forwarding</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    End-to-end logistics management for complex supply chains.
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CEO Letter Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-12 py-6 lg:py-12">
        <div className="w-full lg:w-1/2 mb-8 lg:mb-0 px-4 lg:px-8">
          <img 
            src={additionalImage} 
            alt="Letter from Founder"
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="w-full lg:w-1/2 text-left lg:ml-8 px-4 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-poppins mb-4">A Letter from the Founder and CEO</h2>
          <p className="text-lg lg:text-xl font-poppins mb-6">
            Welcome to Cargo Connect! Our mission is to revolutionize the logistics industry through innovation and excellence. We are committed to providing the highest quality services and ensuring your freight needs are met efficiently.
          </p>
          <button 
            onClick={downloadCEOLetter}
            className="text-blue-600 hover:underline focus:outline-none font-medium"
          >
            Read the full letter from our CEO
          </button>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-12">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-poppins font-bold text-center mb-8 lg:mb-12">Meet the Team</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Team Member 1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 sm:h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Team Member Image</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-poppins font-semibold mb-2">John Doe</h3>
              <p className="text-gray-600 text-sm sm:text-base">Chief Executive Officer</p>
              <p className="mt-2 sm:mt-4 text-gray-700 text-sm sm:text-base">Visionary leader with 15+ years in logistics innovation.</p>
              <div className="mt-3 sm:mt-4 space-y-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:john@cargoconnect.com" className="text-gray-600 hover:text-blue-600 transition text-sm sm:text-base">
                    john@cargoconnect.com
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+15551234567" className="text-gray-600 hover:text-blue-600 transition text-sm sm:text-base">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 sm:h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Team Member Image</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-poppins font-semibold mb-2">Jane Smith</h3>
              <p className="text-gray-600 text-sm sm:text-base">Chief Operations Officer</p>
              <p className="mt-2 sm:mt-4 text-gray-700 text-sm sm:text-base">Operations expert ensuring seamless logistics worldwide.</p>
              <div className="mt-3 sm:mt-4 space-y-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:jane@cargoconnect.com" className="text-gray-600 hover:text-blue-600 transition text-sm sm:text-base">
                    jane@cargoconnect.com
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+15559876543" className="text-gray-600 hover:text-blue-600 transition text-sm sm:text-base">
                    +1 (555) 987-6543
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 sm:h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Team Member Image</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-poppins font-semibold mb-2">Mike Johnson</h3>
              <p className="text-gray-600 text-sm sm:text-base">Chief Technology Officer</p>
              <p className="mt-2 sm:mt-4 text-gray-700 text-sm sm:text-base">Tech innovator driving our digital transformation.</p>
              <div className="mt-3 sm:mt-4 space-y-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:mike@cargoconnect.com" className="text-gray-600 hover:text-blue-600 transition text-sm sm:text-base">
                    mike@cargoconnect.com
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+15554567890" className="text-gray-600 hover:text-blue-600 transition text-sm sm:text-base">
                    +1 (555) 456-7890
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Team Member 4 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 sm:h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Team Member Image</span>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-poppins font-semibold mb-2">Sarah Williams</h3>
              <p className="text-gray-600 text-sm sm:text-base">Customer Experience Director</p>
              <p className="mt-2 sm:mt-4 text-gray-700 text-sm sm:text-base">Ensuring exceptional service for all our clients.</p>
              <div className="mt-3 sm:mt-4 space-y-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:sarah@cargoconnect.com" className="text-gray-600 hover:text-blue-600 transition text-sm sm:text-base">
                    sarah@cargoconnect.com
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+15557890123" className="text-gray-600 hover:text-blue-600 transition text-sm sm:text-base">
                    +1 (555) 789-0123
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="my-8 lg:my-16 px-4 sm:px-6 lg:px-12 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-center gap-8 bg-gray-50">
        {/* Left Image (visible only on larger screens) */}
        <div className="hidden lg:block lg:w-1/3">
          <img
            src={newsletterImage}
            alt="Newsletter"
            className="w-full max-w-md object-cover rounded-lg"
          />
        </div>
  
        {/* Right Text and Form */}
        <div className="w-full lg:w-2/3 text-center max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-poppins mb-4 lg:mb-6 text-gray-900 tracking-tight">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-base lg:text-lg text-gray-600 mb-6 lg:mb-10 font-poppins leading-relaxed">
            Get exclusive insights, industry trends, and Cargo Connect updates delivered straight to your inbox.
          </p>
          <form 
            onSubmit={handleSubscribe} 
            className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow p-3 sm:p-4 border border-gray-200 rounded-lg text-sm sm:text-base font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-poppins font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg transition-colors duration-300"
            >
              Subscribe
            </button>
          </form>
          {isSubscribed && (
            <p className="mt-4 lg:mt-6 text-green-600 font-poppins font-medium flex items-center justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Thank you for subscribing!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutCargoConnect;