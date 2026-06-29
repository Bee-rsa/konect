import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../../components/Common/Navbar';
import { fetchCaseStudies } from '../../redux/slices/caseStudySlice';
import { trackAnalyticsEvent } from "../../utils/analytics";

const PACKAGE_TYPES = ['pallets', 'boxes/crates'];
const WEIGHT_UNITS = ['kg', 'lbs'];
const DIMENSION_UNITS = ['cm', 'in'];

const FREIGHT_OPTIONS = [
  { label: 'Ocean Freight', value: 'ocean', ratio: '1:1000', divisor: 1000 },
  { label: 'Truck Freight', value: 'truck', ratio: '1:3000', divisor: 3000 },
  { label: 'Courier Freight', value: 'express', ratio: '1:5000', divisor: 5000 },
  { label: 'Air Freight', value: 'air', ratio: '1:6000', divisor: 6000 }
];

const createEmptyPackage = () => ({
  packageType: 'pallets',
  numUnits: '',
  length: '',
  width: '',
  height: '',
  weight: '',
  weightUnit: 'kg',
  dimensionUnit: 'cm'
});

const getFreightDivisor = (selectedFreight) => {
  return FREIGHT_OPTIONS.find((item) => item.value === selectedFreight)?.divisor || 6000;
};

const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  return Number(value) || 0;
};

const convertWeightToKg = (weight, unit) => {
  const numericWeight = toNumber(weight);
  return unit === 'lbs' ? numericWeight * 0.45359237 : numericWeight;
};

const convertKgToLbs = (weightKg) => {
  return weightKg * 2.2046226218;
};

const convertDimensionToCm = (dimension, unit) => {
  const numericDimension = toNumber(dimension);
  return unit === 'in' ? numericDimension * 2.54 : numericDimension;
};

const getVolumetricWeightKgFromCbm = (volumeCbm, selectedFreight) => {
  const divisor = getFreightDivisor(selectedFreight);
  return (volumeCbm * 1000000) / divisor;
};

const getFreightClass = (densityKgPerCbm) => {
  if (densityKgPerCbm <= 0) return '';

  if (densityKgPerCbm < 50) return 'Class 500';
  if (densityKgPerCbm < 100) return 'Class 400';
  if (densityKgPerCbm < 150) return 'Class 300';
  if (densityKgPerCbm < 200) return 'Class 250';
  if (densityKgPerCbm < 250) return 'Class 200';
  if (densityKgPerCbm < 300) return 'Class 175';
  if (densityKgPerCbm < 400) return 'Class 125';
  return 'Class 100';
};

const formatCaseStudyDate = (dateValue) => {
  if (!dateValue) return 'Recent Case Study';

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'Recent Case Study';

  return parsedDate.toLocaleDateString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const InputField = ({ value, onChange, ...props }) => {
  return (
    <input
      {...props}
      value={value}
      onChange={onChange}
      onFocus={(e) => {
        if (e.target.value === '0') {
          onChange({ target: { value: '' } });
        }
      }}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:ring-4 focus:ring-blue-100"
    />
  );
};

InputField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired
};

const PackageInputGroup = ({
  index,
  pkg,
  packageCount,
  updatePackage,
  deletePackage
}) => {

  useEffect(() => {
  trackAnalyticsEvent({
    eventType: "page_view",
    page: "weight-calculator",
  });
}, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Package {index + 1}</h3>
        </div>

        {packageCount > 1 && (
          <button
            type="button"
            onClick={() => deletePackage(index)}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Package Type</label>
          <div className="grid grid-cols-2 gap-2">
            {PACKAGE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updatePackage(index, 'packageType', type)}
                className={`h-10 rounded-xl border text-sm font-medium transition ${
                  pkg.packageType === type
                    ? 'border-custom-blue bg-custom-blue text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-3">
            <label className="mb-2 block text-sm font-medium text-slate-600">Units</label>
            <InputField
              type="number"
              min="1"
              placeholder="0"
              value={pkg.numUnits}
              onChange={(e) => updatePackage(index, 'numUnits', e.target.value)}
            />
          </div>

          <div className="md:col-span-9">
            <label className="mb-2 block text-sm font-medium text-slate-600">Weight</label>

            <div className="grid grid-cols-1 gap-2 items-end sm:grid-cols-12">
              <div className="sm:col-span-8">
                <InputField
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={pkg.weight}
                  onChange={(e) => updatePackage(index, 'weight', e.target.value)}
                />
              </div>

              <div className="sm:col-span-4">
                <div className="flex h-11 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {WEIGHT_UNITS.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => updatePackage(index, 'weightUnit', unit)}
                      className={`w-1/2 text-xs font-semibold transition ${
                        pkg.weightUnit === unit
                          ? 'bg-custom-blue text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {unit.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Dimensions</label>

          <div className="grid grid-cols-1 gap-2 items-end sm:grid-cols-12">
            <div className="sm:col-span-3">
              <InputField
                type="number"
                min="0"
                step="0.01"
                placeholder="Length"
                value={pkg.length}
                onChange={(e) => updatePackage(index, 'length', e.target.value)}
              />
            </div>

            <div className="sm:col-span-3">
              <InputField
                type="number"
                min="0"
                step="0.01"
                placeholder="Width"
                value={pkg.width}
                onChange={(e) => updatePackage(index, 'width', e.target.value)}
              />
            </div>

            <div className="sm:col-span-3">
              <InputField
                type="number"
                min="0"
                step="0.01"
                placeholder="Height"
                value={pkg.height}
                onChange={(e) => updatePackage(index, 'height', e.target.value)}
              />
            </div>

            <div className="sm:col-span-3">
              <div className="flex h-11 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                {DIMENSION_UNITS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => updatePackage(index, 'dimensionUnit', unit)}
                    className={`w-1/2 text-xs font-semibold transition ${
                      pkg.dimensionUnit === unit
                        ? 'bg-custom-blue text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {unit.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PackageInputGroup.propTypes = {
  index: PropTypes.number.isRequired,
  packageCount: PropTypes.number.isRequired,
  pkg: PropTypes.shape({
    packageType: PropTypes.oneOf(['pallets', 'boxes/crates']).isRequired,
    numUnits: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    weightUnit: PropTypes.oneOf(['kg', 'lbs']).isRequired,
    dimensionUnit: PropTypes.oneOf(['cm', 'in']).isRequired,
    length: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  updatePackage: PropTypes.func.isRequired,
  deletePackage: PropTypes.func.isRequired
};

const TotalShipmentCalculation = ({
  packageData,
  totalVolume,
  totalShipmentWeight,
  updatePackage,
  setTotalVolume,
  setTotalShipmentWeight,
  totalShipmentWeightUnit,
  setTotalShipmentWeightUnit
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-800">Total Shipment Details</h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Number of Units</label>
          <InputField
            type="number"
            min="1"
            placeholder="0"
            value={packageData.numUnits}
            onChange={(e) => updatePackage(0, 'numUnits', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Total Volume (CBM)</label>
          <InputField
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={totalVolume}
            onChange={(e) => setTotalVolume(e.target.value === '' ? '' : e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">Total Weight</label>

          <div className="grid grid-cols-1 gap-2 items-end sm:grid-cols-12">
            <div className="sm:col-span-9">
              <InputField
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={totalShipmentWeight}
                onChange={(e) => setTotalShipmentWeight(e.target.value === '' ? '' : e.target.value)}
              />
            </div>

            <div className="sm:col-span-3">
              <div className="flex h-11 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                {WEIGHT_UNITS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setTotalShipmentWeightUnit(unit)}
                    className={`w-1/2 text-xs font-semibold transition ${
                      totalShipmentWeightUnit === unit
                        ? 'bg-custom-blue text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {unit.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TotalShipmentCalculation.propTypes = {
  packageData: PropTypes.shape({
    numUnits: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  totalVolume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  totalShipmentWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  updatePackage: PropTypes.func.isRequired,
  setTotalVolume: PropTypes.func.isRequired,
  setTotalShipmentWeight: PropTypes.func.isRequired,
  totalShipmentWeightUnit: PropTypes.oneOf(['kg', 'lbs']).isRequired,
  setTotalShipmentWeightUnit: PropTypes.func.isRequired
};

const ResultCard = ({ label, value, unit, dark = false }) => (
  <div
    className={`rounded-xl border p-4 ${
      dark ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'
    }`}
  >
    <div className={`text-xs font-medium ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
      {label}
    </div>
    <div className="mt-2 flex items-end gap-2">
      <span className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
        {value}
      </span>
      {unit && (
        <span className={`pb-1 text-xs ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
          {unit}
        </span>
      )}
    </div>
  </div>
);

ResultCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  dark: PropTypes.bool
};

const CalculationResults = ({
  totalVolume,
  totalShipmentWeight,
  actualWeight,
  density,
  dimWeight,
  freightClass,
  chargeableWeight,
  showChargeableWeight,
  weightUnit
}) => {
  const dimIsHigher = Number(dimWeight) > Number(actualWeight);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ResultCard label="Total Volume" value={Number(totalVolume).toFixed(3)} unit="CBM" />
        <ResultCard
          label="Total Weight"
          value={Number(totalShipmentWeight).toFixed(2)}
          unit={weightUnit.toUpperCase()}
        />
        <ResultCard label="Density" value={Number(density).toFixed(2)} unit="kg/CBM" />
        <ResultCard
          label="DIM Weight"
          value={Number(dimWeight).toFixed(2)}
          unit={weightUnit.toUpperCase()}
        />

        {showChargeableWeight && (
          <div className="sm:col-span-2">
            <ResultCard
              label="Chargeable Weight"
              value={Number(chargeableWeight).toFixed(2)}
              unit={weightUnit.toUpperCase()}
            />
          </div>
        )}

        <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-xs font-medium text-slate-500">Actual Weight vs DIM Weight</div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Actual Weight</span>
                <span className="font-semibold text-slate-800">
                  {Number(actualWeight).toFixed(2)} {weightUnit.toUpperCase()}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-custom-sage"
                  style={{
                    width: `${Math.max(
                      8,
                      (Number(actualWeight) / Math.max(Number(actualWeight), Number(dimWeight), 1)) * 100
                    )}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">DIM Weight</span>
                <span className="font-semibold text-slate-800">
                  {Number(dimWeight).toFixed(2)} {weightUnit.toUpperCase()}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-custom-blue"
                  style={{
                    width: `${Math.max(
                      8,
                      (Number(dimWeight) / Math.max(Number(actualWeight), Number(dimWeight), 1)) * 100
                    )}%`
                  }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Charged by: <span className="font-semibold">{dimIsHigher ? 'DIM Weight' : 'Actual Weight'}</span>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <ResultCard label="Freight Class" value={freightClass || '-'} dark />
        </div>
      </div>
    </div>
  );
};

CalculationResults.propTypes = {
  totalVolume: PropTypes.number.isRequired,
  totalShipmentWeight: PropTypes.number.isRequired,
  actualWeight: PropTypes.number.isRequired,
  density: PropTypes.number.isRequired,
  dimWeight: PropTypes.number.isRequired,
  freightClass: PropTypes.string.isRequired,
  chargeableWeight: PropTypes.number.isRequired,
  showChargeableWeight: PropTypes.bool.isRequired,
  weightUnit: PropTypes.oneOf(['kg', 'lbs']).isRequired
};

const CaseStudyFeed = () => {
  const dispatch = useDispatch();
  const { caseStudies = [], loading: caseStudiesLoading } = useSelector(
    (state) => state.caseStudies
  );

  useEffect(() => {
    dispatch(fetchCaseStudies(true));
  }, [dispatch]);

  const mostViewedCaseStudies = [...(caseStudies || [])]
    .sort((a, b) => (b.views || b.viewCount || 0) - (a.views || a.viewCount || 0))
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Most Viewed Case Studies</h3>

      <div className="space-y-3">
        {caseStudiesLoading ? (
          [...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 animate-pulse"
            >
              <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="mb-2 h-3 w-24 rounded bg-slate-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-200" />
              </div>
            </div>
          ))
        ) : mostViewedCaseStudies.length > 0 ? (
          mostViewedCaseStudies.map((post) => (
            <Link
              key={post._id}
              to={`/case-studies/${post.slug}`}
              className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-white hover:shadow-sm"
            >
              {post.featuredImage ? (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-slate-200" />
              )}

              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                    {post.category || 'Case Study'}
                  </span>
                  <span>{formatCaseStudyDate(post.publishDate)}</span>
                </div>

                <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                  {post.title}
                </p>

                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {post.description || 'Explore this maritime and logistics case study.'}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-600">No case studies available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

const WeightCalculator = () => {
  const [calculationType, setCalculationType] = useState('unit');
  const [packages, setPackages] = useState([createEmptyPackage()]);
  const [selectedFreight, setSelectedFreight] = useState('air');

  const [actualWeight, setActualWeight] = useState(0);
  const [chargeableWeight, setChargeableWeight] = useState(0);
  const [totalVolume, setTotalVolume] = useState('');
  const [totalShipmentWeight, setTotalShipmentWeight] = useState('');
  const [totalShipmentWeightUnit, setTotalShipmentWeightUnit] = useState('kg');
  const [density, setDensity] = useState(0);
  const [dimWeight, setDimWeight] = useState(0);
  const [freightClass, setFreightClass] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);

  const isTotalShipment = calculationType === 'shipment';

  const resultWeightUnit = isTotalShipment
    ? totalShipmentWeightUnit
    : packages[0]?.weightUnit || 'kg';

  const displayActualWeight =
    resultWeightUnit === 'lbs'
      ? convertKgToLbs(Number(actualWeight))
      : Number(actualWeight);

  const displayTotalWeight =
    resultWeightUnit === 'lbs'
      ? convertKgToLbs(Number(totalShipmentWeight))
      : Number(totalShipmentWeight);

  const displayDimWeight =
    resultWeightUnit === 'lbs'
      ? convertKgToLbs(Number(dimWeight))
      : Number(dimWeight);

  const displayChargeableWeight =
    resultWeightUnit === 'lbs'
      ? convertKgToLbs(Number(chargeableWeight))
      : Number(chargeableWeight);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const addPackage = () => {
    setPackages((prev) => [...prev, createEmptyPackage()]);
  };

  const updatePackage = (index, field, value) => {
    setPackages((prev) =>
      prev.map((pkg, i) => {
        if (i !== index) return pkg;
        return { ...pkg, [field]: value };
      })
    );
  };

  const deletePackage = (index) => {
    setPackages((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const updateCalculatedMetrics = useCallback(
    (weightKg, volumeCbm, calculatedChargeableKg = 0) => {
      const densityKgPerCbm = volumeCbm > 0 ? weightKg / volumeCbm : 0;
      const dimWeightKg = getVolumetricWeightKgFromCbm(volumeCbm, selectedFreight);

      setActualWeight(weightKg);
      setTotalShipmentWeight(weightKg);
      setTotalVolume(volumeCbm);
      setDensity(densityKgPerCbm);
      setDimWeight(dimWeightKg);
      setChargeableWeight(calculatedChargeableKg);
      setFreightClass(getFreightClass(densityKgPerCbm));
      setHasCalculated(true);
    },
    [selectedFreight]
  );

  const calculateChargeableWeight = useCallback(() => {
    let totalActualWeightKg = 0;
    let totalVolumeCbm = 0;

    packages.forEach((pkg) => {
      const numUnits = toNumber(pkg.numUnits);
      const weightKg = convertWeightToKg(pkg.weight, pkg.weightUnit);

      const lengthCm = convertDimensionToCm(pkg.length, pkg.dimensionUnit);
      const widthCm = convertDimensionToCm(pkg.width, pkg.dimensionUnit);
      const heightCm = convertDimensionToCm(pkg.height, pkg.dimensionUnit);

      const unitVolumeCbm = (lengthCm * widthCm * heightCm) / 1000000;

      totalActualWeightKg += weightKg * numUnits;
      totalVolumeCbm += unitVolumeCbm * numUnits;
    });

    const totalDimWeightKg = getVolumetricWeightKgFromCbm(totalVolumeCbm, selectedFreight);
    const totalChargeableKg = Math.max(totalActualWeightKg, totalDimWeightKg);

    updateCalculatedMetrics(totalActualWeightKg, totalVolumeCbm, totalChargeableKg);
  }, [packages, selectedFreight, updateCalculatedMetrics]);

  const calculateTotalShipment = useCallback(() => {
    const volumeCbm = toNumber(totalVolume);
    const weightInput = toNumber(totalShipmentWeight);
    const weightKg = totalShipmentWeightUnit === 'lbs' ? weightInput * 0.45359237 : weightInput;

    const dimWeightKg = getVolumetricWeightKgFromCbm(volumeCbm, selectedFreight);
    const chargeableWeightKg = Math.max(weightKg, dimWeightKg);

    updateCalculatedMetrics(weightKg, volumeCbm, chargeableWeightKg);
  }, [
    totalVolume,
    totalShipmentWeight,
    totalShipmentWeightUnit,
    selectedFreight,
    updateCalculatedMetrics
  ]);

  useEffect(() => {
    if (isTotalShipment) {
      const hasValues = toNumber(totalVolume) > 0 || toNumber(totalShipmentWeight) > 0;

      if (hasValues) {
        calculateTotalShipment();
      } else {
        setHasCalculated(false);
        setActualWeight(0);
        setChargeableWeight(0);
        setDensity(0);
        setDimWeight(0);
        setFreightClass('');
      }
    }
  }, [isTotalShipment, totalVolume, totalShipmentWeight, calculateTotalShipment]);

  useEffect(() => {
    if (!isTotalShipment) {
      const hasValues = packages.some(
        (pkg) =>
          toNumber(pkg.numUnits) > 0 ||
          toNumber(pkg.weight) > 0 ||
          toNumber(pkg.length) > 0 ||
          toNumber(pkg.width) > 0 ||
          toNumber(pkg.height) > 0
      );

      if (hasValues) {
        calculateChargeableWeight();
      } else {
        setHasCalculated(false);
        setActualWeight(0);
        setChargeableWeight(0);
        setDensity(0);
        setDimWeight(0);
        setFreightClass('');
        setTotalVolume('');
        setTotalShipmentWeight('');
      }
    }
  }, [isTotalShipment, packages, calculateChargeableWeight]);

  return (
    <div className="min-h-screen bg-slate-50 font-poppins">
      <Navbar />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
            Volumetric Weight Calculator
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Calculation Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'byUnitType', label: 'By Unit Type', value: 'unit' },
                  { id: 'byShipment', label: 'Total Shipment', value: 'shipment' }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setCalculationType(option.value)}
                    className={`h-11 rounded-xl border text-sm font-medium transition ${
                      calculationType === option.value
                        ? 'border-custom-blue bg-custom-blue text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {isTotalShipment ? (
              <TotalShipmentCalculation
                packageData={packages[0]}
                totalVolume={totalVolume}
                totalShipmentWeight={totalShipmentWeight}
                updatePackage={updatePackage}
                setTotalVolume={setTotalVolume}
                setTotalShipmentWeight={setTotalShipmentWeight}
                totalShipmentWeightUnit={totalShipmentWeightUnit}
                setTotalShipmentWeightUnit={setTotalShipmentWeightUnit}
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-slate-800">Package Information</h2>
                </div>

                <div className="space-y-4">
                  {packages.map((pkg, index) => (
                    <PackageInputGroup
                      key={index}
                      index={index}
                      pkg={pkg}
                      packageCount={packages.length}
                      updatePackage={updatePackage}
                      deletePackage={deletePackage}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={addPackage}
                    className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 text-sm font-semibold text-blue-800 transition hover:border-blue-400 hover:bg-blue-100"
                  >
                    Add Another Package
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">Transportation Type</h2>

              <div className="grid grid-cols-2 gap-2">
                {FREIGHT_OPTIONS.map((freight) => (
                  <button
                    key={freight.value}
                    type="button"
                    onClick={() => setSelectedFreight(freight.value)}
                    className={`flex min-h-[48px] items-center justify-between rounded-xl border px-3 text-left transition ${
                      selectedFreight === freight.value
                        ? 'border-custom-blue bg-custom-blue text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{freight.label}</span>
                    <span
                      className={`text-[10px] ${
                        selectedFreight === freight.value ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {freight.ratio}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={isTotalShipment ? calculateTotalShipment : calculateChargeableWeight}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-custom-blue to-indigo-900 px-6 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
            >
              {isTotalShipment ? 'Calculate Shipment' : 'Calculate Chargeable Weight'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-800">Results</h2>

              {hasCalculated ? (
                <CalculationResults
                  totalVolume={Number(totalVolume)}
                  totalShipmentWeight={displayTotalWeight}
                  actualWeight={displayActualWeight}
                  density={density}
                  dimWeight={displayDimWeight}
                  freightClass={freightClass}
                  chargeableWeight={displayChargeableWeight}
                  showChargeableWeight={true}
                  weightUnit={resultWeightUnit}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-sm font-medium text-slate-600">Results will appear here</p>
                </div>
              )}
            </div>

            <CaseStudyFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightCalculator;