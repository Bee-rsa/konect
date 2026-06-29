import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-custom-blue text-white py-4 w-full font-poppins">
      <div className="max-w-screen-xl mx-auto px-6 flex flex-col items-start">
        <div className="text-2xl text-white font-extrabold tracking-tight mb-4">
          <Link to="/" className="hover:text-custom-sage transition-colors duration-200">Cargo Konect</Link>
        </div>

        {/* Footer Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full">
          {/* Products Section */}
          <div>
            <h2 className="font-bold mb-4 inline-block border-b border-white pb-2">User</h2>
            <ul>
              <li><a href="register" className="hover:text-custom-sage transition-colors duration-200">Register</a></li>
              <li><a href="login" className="hover:text-custom-sage transition-colors duration-200">Login In</a></li>
              <li><a href="profile" className="hover:text-custom-sage transition-colors duration-200">Profile</a></li>
            </ul>
          </div>

          {/* Business Hub Section */}
          <div>
            <h2 className="font-bold mb-4 inline-block border-b border-white pb-2">Terminals</h2>
            <ul>
              <li><a href="/terminal-berthing" className="hover:text-custom-sage transition-colors duration-200">Berthing Schedule</a></li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h2 className="font-bold mb-4 inline-block border-b border-white pb-2">Resources</h2>
            <ul>
              <li><a href="/market-forecast" className="hover:text-custom-sage transition-colors duration-200">Market Updates</a></li>
              <li><a href="/case-study" className="hover:text-custom-sage transition-colors duration-200">Case Study</a></li>
              <li><a href="/weight-calculator" className="hover:text-custom-sage transition-colors duration-200">Weight Calculator</a></li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h2 className="font-bold mb-4 inline-block border-b border-white pb-2">Company</h2>
            <ul>
              <li><a href="/about-cargo-konect" className="hover:text-custom-sage transition-colors duration-200">About Us</a></li>
              <li><a href="/privacy-policy" className="hover:text-custom-sage transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="/terms-and-conditions" className="hover:text-custom-sage transition-colors duration-200">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4 mt-8">
          <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://img.icons8.com/?size=100&id=118467&format=png&color=FFFFFF" 
              alt="Facebook" 
              className="h-8 w-8 hover:opacity-80" 
            />
          </a>
          <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://img.icons8.com/?size=100&id=37326&format=png&color=FFFFFF" 
              alt="YouTube" 
              className="h-8 w-8 hover:opacity-80" 
            />
          </a>
          <a href="https://www.linkedin.com/company/cargo-konect" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" 
              alt="LinkedIn" 
              className="h-8 w-8 hover:opacity-80" 
            />
          </a>
          <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://img.icons8.com/?size=100&id=32292&format=png&color=FFFFFF" 
              alt="Instagram" 
              className="h-8 w-8 hover:opacity-80" 
            />
          </a>
        </div>

        {/* Copyright and Trademark Notice */}
        <p className="text-sm text-white mt-4 font-poppins">
          © {new Date().getFullYear()} Cargo Konect ™. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;