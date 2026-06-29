const Berthing = require("../models/Berthing");

const PREFIX = "BDURS";
const START_SEQUENCE = 1869038;

const generateBerthingNumber = async () => {
  const lastBerthing = await Berthing.findOne({
    berthingNumber: { $regex: `^${PREFIX}` },
  })
    .sort({ berthingSequence: -1, createdAt: -1 })
    .select("berthingNumber berthingSequence")
    .lean();

  let nextSequence = START_SEQUENCE;

  if (lastBerthing) {
    if (typeof lastBerthing.berthingSequence === "number") {
      nextSequence = lastBerthing.berthingSequence + 1;
    } else if (lastBerthing.berthingNumber) {
      const numericPart = parseInt(
        lastBerthing.berthingNumber.replace(PREFIX, ""),
        10
      );

      if (!Number.isNaN(numericPart)) {
        nextSequence = numericPart + 1;
      }
    }
  }

  return {
    berthingNumber: `${PREFIX}${nextSequence}`,
    berthingSequence: nextSequence,
  };
};

module.exports = generateBerthingNumber;

