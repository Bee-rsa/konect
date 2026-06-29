import step1Image from '../../assets/Freight iT_20240926_155145_0001.png';
import step2Image from '../../assets/Freight iT_20240926_154924_0001.png';
import step3Image from '../../assets/Freight iT_20240926_154659_0001.png';

const steps = [
  {
    img: step1Image,
    title: "Register",
    number: "01",
    desc: "Create an account by providing your email and a secure password. Manage your shipments and access all platform features in one place.",
  },
  {
    img: step2Image,
    title: "Get Instant Quotes",
    number: "02",
    desc: "Input your cargo dimensions and weight. Our system instantly returns quotes from verified carriers so you can find the best price and service.",
  },
  {
    img: step3Image,
    title: "Book & Track",
    number: "03",
    desc: "Select your preferred carrier, pay securely, and track your shipment in real-time until it arrives at its destination.",
  },
];

const HowItWorks = () => {
  return (
    <section className="w-full font-poppins -mt-4">

      {/* Header */}
      <div className="mb-12">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
          Getting started
        </p>
        <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: "#000042" }}>
          How to transport your cargo with{" "}
          <span style={{ color: "#2E7D32" }}>Konect</span>
        </h2>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col">

            {/* Image */}
            <div className="rounded-2xl overflow-hidden h-56 mb-5">
              <img
                src={step.img}
                alt={step.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Step number + divider */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-4xl font-bold leading-none"
                style={{ color: "#e2e8f0" }}
              >
                {step.number}
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Text */}
            <h3 className="text-base font-bold mb-2" style={{ color: "#000042" }}>
              {step.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {step.desc}
            </p>

          </div>
        ))}
      </div>

    </section>
  );
};

export default HowItWorks;