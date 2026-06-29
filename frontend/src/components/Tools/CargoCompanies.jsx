import { useRef, useEffect } from "react";
import logo1 from "../../assets/Companies/logo1.png";
import logo2 from "../../assets/Companies/logo2.png";
import logo3 from "../../assets/Companies/logo3.png";
import logo4 from "../../assets/Companies/logo4.png";
import logo5 from "../../assets/Companies/logo5.png";
import logo6 from "../../assets/Companies/logo6.png";
import logo7 from "../../assets/Companies/logo7.png";
import logo8 from "../../assets/Companies/logo8.png";
import logo9 from "../../assets/Companies/logo9.png";

const CargoCompanies = () => {
  const logos = [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9];
  const duplicatedLogos = [...logos, ...logos];
  const scrollRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const container = scrollRef.current;
    let scrollSpeed = 0.5;

    const animateScroll = () => {
      if (container) {
        container.scrollLeft += scrollSpeed;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl p-6 shadow-xl mt-4">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-900 to-white mb-8 text-transparent bg-clip-text">
        Cargo Connect Partner Network
      </h1>

      <div
        ref={scrollRef}
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <img
            key={index}
            src={logo}
            alt={`Company logo ${index + 1}`}
            style={{
              height: "5.5rem", // Increased from 3rem
              width: "auto",
              marginRight: "1.5rem",
              
              transition: "filter 0.3s ease",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CargoCompanies;
