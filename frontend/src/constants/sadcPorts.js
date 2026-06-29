export const SADC_PORTS = [
  { country: "South Africa", portCode: "ZADUR", portName: "Durban" },
  { country: "South Africa", portCode: "ZACPT", portName: "Cape Town" },
  { country: "South Africa", portCode: "ZANGQ", portName: "Ngqura" },
  { country: "South Africa", portCode: "ZAPE", portName: "Port Elizabeth" },
  { country: "South Africa", portCode: "ZARCB", portName: "Richards Bay" },

  { country: "Mozambique", portCode: "MZMPM", portName: "Maputo" },
  { country: "Mozambique", portCode: "MZBEW", portName: "Beira" },
  { country: "Mozambique", portCode: "MZMNC", portName: "Nacala" },

  { country: "Namibia", portCode: "NAWVB", portName: "Walvis Bay" },
  { country: "Namibia", portCode: "NALUD", portName: "Luderitz" },

  { country: "Tanzania", portCode: "TZDAR", portName: "Dar es Salaam" },
  { country: "Tanzania", portCode: "TZTGT", portName: "Tanga" },
  { country: "Tanzania", portCode: "TZMYW", portName: "Mtwara" },

  { country: "Angola", portCode: "AOLAD", portName: "Luanda" },
  { country: "Angola", portCode: "AOLOB", portName: "Lobito" },

  { country: "Madagascar", portCode: "MGTNR", portName: "Toamasina" },
  { country: "Mauritius", portCode: "MUPLU", portName: "Port Louis" },
  { country: "Democratic Republic of the Congo", portCode: "CDMAT", portName: "Matadi" },
  { country: "Zambia", portCode: "ZMMPB", portName: "Mpulungu" },
];

export const SADC_COUNTRIES = [...new Set(SADC_PORTS.map((port) => port.country))];