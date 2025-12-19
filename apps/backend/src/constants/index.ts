// German state transfer tax rates (Grunderwerbsteuer)
export const GRUNDERWERBSTEUER_RATES: Record<string, number> = {
  BADEN_WUERTTEMBERG: 0.05,
  BAYERN: 0.035,
  BERLIN: 0.06,
  BRANDENBURG: 0.065,
  BREMEN: 0.05,
  HAMBURG: 0.055,
  HESSEN: 0.06,
  MECKLENBURG_VORPOMMERN: 0.06,
  NIEDERSACHSEN: 0.05,
  NORDRHEIN_WESTFALEN: 0.065,
  RHEINLAND_PFALZ: 0.05,
  SAARLAND: 0.065,
  SACHSEN: 0.055,
  SACHSEN_ANHALT: 0.05,
  SCHLESWIG_HOLSTEIN: 0.065,
  THUERINGEN: 0.065,
};

// Fixed purchase cost rates
export const NOTARY_FEE_RATE = 0.015;
export const GRUNDBUCH_FEE_RATE = 0.005;

// Depreciation rates (AfA)
export const AFA_RATES: Record<string, number> = {
  LINEAR_2: 0.02,
  LINEAR_2_5: 0.025,
  LINEAR_3: 0.03,
  LINEAR_4: 0.04,
  DEGRESSIVE_5: 0.05,
};

// Default values
export const DEFAULTS = {
  VACANCY_RATE: 0.02,
  HOUSE_APPRECIATION: 0.02,
  RENT_INCREMENT: 0.02,
  RENT_INCREMENT_FREQUENCY_YEARS: 1,
  LAND_VALUE_PERCENT: 0.2,
};
