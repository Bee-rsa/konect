const express = require("express");
const CompanyRate = require("../models/CompanyRate");

const router = express.Router();

const cityDistances = {
  "Durban-Johannesburg": 570,
  "Johannesburg-Durban": 570,
  "Durban-Cape Town": 1630,
  "Cape Town-Durban": 1630,
  "Johannesburg-Cape Town": 1400,
  "Cape Town-Johannesburg": 1400,
  "Durban-Pretoria": 630,
  "Pretoria-Durban": 630,
  "Johannesburg-Pretoria": 60,
  "Pretoria-Johannesburg": 60,
};

const getDistance = (pickupCity, dropoffCity) => {
  const key = `${pickupCity}-${dropoffCity}`;
  return cityDistances[key] || 100;
};

const getZone = (pickupCity, dropoffCity) => {
  if (pickupCity.toLowerCase() === dropoffCity.toLowerCase()) return "local";

  const localRegionalMap = {
    Durban: "KwaZulu-Natal",
    Johannesburg: "Gauteng",
    Pretoria: "Gauteng",
    "Cape Town": "Western Cape",
  };

  const pickupProvince = localRegionalMap[pickupCity];
  const dropoffProvince = localRegionalMap[dropoffCity];

  if (pickupProvince && dropoffProvince && pickupProvince === dropoffProvince) {
    return "regional";
  }

  return "national";
};

const getVolumetricWeight = (lengthCm, widthCm, heightCm, divisor = 5000) => {
  if (!lengthCm || !widthCm || !heightCm) return 0;
  return Number(((lengthCm * widthCm * heightCm) / divisor).toFixed(2));
};

router.post("/search", async (req, res) => {
  try {
    const {
      serviceType,
      pickupCity,
      dropoffCity,
      weight,
      lengthCm,
      widthCm,
      heightCm,
      serviceLevel,
      loadType,
      vehicleType,
      fragile,
      dangerousGoods,
      refrigerated,
    } = req.body;

    if (!serviceType || !pickupCity || !dropoffCity || !weight) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const distance = getDistance(pickupCity, dropoffCity);
    const zone = getZone(pickupCity, dropoffCity);

    const companyProfiles = await CompanyRate.find({
      isActive: true,
      serviceModes: serviceType,
    });

    const results = [];

    for (const company of companyProfiles) {
      if (dangerousGoods && !company.dangerousGoodsSupported) continue;
      if (refrigerated && !company.temperatureControlled) continue;
      if (fragile && !company.fragileGoodsSupported) continue;

      if (serviceType === "courier") {
        const matchedCourierRate = company.courierRates.find(
          (rate) =>
            rate.zone === zone &&
            rate.serviceLevel === (serviceLevel || "economy")
        );

        if (!matchedCourierRate) continue;

        if (
          matchedCourierRate.maxLengthCm > 0 &&
          Number(lengthCm || 0) > matchedCourierRate.maxLengthCm
        )
          continue;
        if (
          matchedCourierRate.maxWidthCm > 0 &&
          Number(widthCm || 0) > matchedCourierRate.maxWidthCm
        )
          continue;
        if (
          matchedCourierRate.maxHeightCm > 0 &&
          Number(heightCm || 0) > matchedCourierRate.maxHeightCm
        )
          continue;

        const actualWeight = Number(weight);
        const volumetricWeight = getVolumetricWeight(
          Number(lengthCm || 0),
          Number(widthCm || 0),
          Number(heightCm || 0),
          matchedCourierRate.volumetricDivisor || 5000
        );

        const chargeableWeight = Math.max(actualWeight, volumetricWeight);
        const extraKg = Math.max(
          0,
          chargeableWeight - Number(matchedCourierRate.includedWeightKg)
        );

        const extraWeightCost =
          extraKg * Number(matchedCourierRate.extraKgRate);
        const fragileFee = fragile ? 20 : 0;

        const subtotal =
          Number(matchedCourierRate.basePrice) + extraWeightCost + fragileFee;

        const finalPrice = Math.max(
          subtotal,
          Number(matchedCourierRate.minimumCharge || 0)
        );

        results.push({
          companyId: company.user,
          companyName: company.companyName,
          logoUrl: company.logoUrl,
          serviceType: "courier",
          pickupCity,
          dropoffCity,
          zone,
          distance,
          actualWeight,
          volumetricWeight,
          chargeableWeight,
          serviceLevel: matchedCourierRate.serviceLevel,
          estimatedDays:
            matchedCourierRate.serviceLevel === "same-day"
              ? "Same day"
              : zone === "local"
              ? matchedCourierRate.serviceLevel === "express"
                ? "1 day"
                : "1-2 days"
              : zone === "regional"
              ? matchedCourierRate.serviceLevel === "express"
                ? "1-2 days"
                : "2-3 days"
              : matchedCourierRate.serviceLevel === "express"
              ? "2-4 days"
              : "3-5 days",
          basePrice: matchedCourierRate.basePrice,
          includedWeightKg: matchedCourierRate.includedWeightKg,
          extraKgRate: matchedCourierRate.extraKgRate,
          minimumCharge: matchedCourierRate.minimumCharge,
          fragileFee,
          finalPrice: Number(finalPrice.toFixed(2)),
          trackingAvailable: company.trackingAvailable,
          weekendDelivery: company.weekendDelivery,
          insuranceIncluded: company.insuranceIncluded,
        });
      }

      if (serviceType === "truck") {
        const selectedLoadType = loadType || "FTL";

        const matchedTruckRate = company.truckRates.find((rate) => {
          const loadTypeMatch = rate.loadType === selectedLoadType;
          const vehicleMatch = vehicleType
            ? rate.vehicleType === vehicleType
            : true;
          return loadTypeMatch && vehicleMatch;
        });

        if (!matchedTruckRate) continue;

        const shipmentWeight = Number(weight);

        if (
          matchedTruckRate.capacityKg > 0 &&
          shipmentWeight > matchedTruckRate.capacityKg
        ) {
          continue;
        }

        let distanceCharge = 0;
        let weightCharge = 0;

        if (matchedTruckRate.loadType === "FTL") {
          const billableKm = Math.max(
            0,
            distance - Number(matchedTruckRate.includedKm || 0)
          );
          distanceCharge = billableKm * Number(matchedTruckRate.ratePerKm || 0);
        }

        if (matchedTruckRate.loadType === "LTL") {
          weightCharge =
            shipmentWeight * Number(matchedTruckRate.ratePerKg || 0);
        }

        const handlingFee = Number(matchedTruckRate.handlingFee || 0);
        const baseSubtotal = Math.max(
          distanceCharge + weightCharge + handlingFee,
          Number(matchedTruckRate.minimumCharge)
        );

        const fuelSurcharge =
          baseSubtotal *
          (Number(matchedTruckRate.fuelSurchargePercent || 0) / 100);

        const fragileFee = fragile ? 75 : 0;
        const refrigeratedFee = refrigerated ? 150 : 0;

        const finalPrice =
          baseSubtotal + fuelSurcharge + fragileFee + refrigeratedFee;

        results.push({
          companyId: company.user,
          companyName: company.companyName,
          logoUrl: company.logoUrl,
          serviceType: "truck",
          pickupCity,
          dropoffCity,
          distance,
          weight: shipmentWeight,
          loadType: matchedTruckRate.loadType,
          vehicleType: matchedTruckRate.vehicleType,
          estimatedDays: matchedTruckRate.estimatedDays || "1-3 days",
          ratePerKm: matchedTruckRate.ratePerKm,
          ratePerKg: matchedTruckRate.ratePerKg,
          includedKm: matchedTruckRate.includedKm,
          minimumCharge: matchedTruckRate.minimumCharge,
          fuelSurchargePercent: matchedTruckRate.fuelSurchargePercent,
          handlingFee,
          fragileFee,
          refrigeratedFee,
          finalPrice: Number(finalPrice.toFixed(2)),
          trackingAvailable: company.trackingAvailable,
          weekendDelivery: company.weekendDelivery,
          insuranceIncluded: company.insuranceIncluded,
        });
      }
    }

    const sortedResults = results.sort((a, b) => a.finalPrice - b.finalPrice);

    res.json(sortedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch quote results" });
  }
});

module.exports = router;