const generateUserId = async ({
  companyName,
  companyId,
  countryCode = "ZA",
  branchCode = "MB",
  User,
}) => {
  // Prefix from company name
  const prefix = companyName
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, "X");

  // Count users ONLY in this company
  const count = await User.countDocuments({ company: companyId });

  const sequence = String(count + 1).padStart(4, "0");

  return `${prefix}-${countryCode}-${branchCode}-${sequence}`;
};

module.exports = generateUserId;