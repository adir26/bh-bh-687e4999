export const FEATURES = {
  PAYMENTS_ENABLED: true,
  CHANGE_ORDERS_ENABLED: true,
  SELECTIONS_ENABLED: true,
  BUDGET_ENABLED: true,
};

export type FeatureFlag = keyof typeof FEATURES;

export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return FEATURES[flag] ?? false;
};