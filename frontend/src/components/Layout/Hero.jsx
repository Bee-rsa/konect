import PropTypes from "prop-types";
import RideHero from "./RideHero";
import CargoHero from "./CargoHero";

const Hero = ({ mode }) => {
  return (
    <div className="bg-custom-blue text-white min-h-screen font-poppins">
      
      <div className="-mt-0.5">
        {mode === "ride" && <RideHero />}
        {mode === "cargo" && <CargoHero />}
      </div>

    </div>
  );
};

Hero.propTypes = {
  mode: PropTypes.string.isRequired,
};

export default Hero;