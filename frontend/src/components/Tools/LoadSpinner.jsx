import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 to-custom-blue">
      <div className="flex flex-col items-center gap-6">
        
        {/* Spinner */}
        <div className="relative flex items-center justify-center font-poppins">
          <div className="h-20 w-20 rounded-full border-4 border-white/20" />

          <motion.div
            className="absolute h-20 w-20 rounded-full border-4 border-transparent border-t-white"
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

      </div>
    </div>
  );
};

export default LoadingSpinner;