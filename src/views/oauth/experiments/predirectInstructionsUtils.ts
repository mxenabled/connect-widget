export function getInstitutionBrandColor(
  institution: InstitutionResponseType,
  defaultColor: string,
): string {
  const rawColor = institution?.brand_color_hex_code
  const configuredInstitutionColor =
    rawColor && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(rawColor) ? rawColor : null

  return configuredInstitutionColor || defaultColor
}

// These values are expected values from the backend
export const OAUTH_PREDIRECT_INSTRUCTION = {
  ACCOUNT_AND_TRANSACTIONS_INSTRUCTION: 0,
  ACCOUNT_NUMBERS_INSTRUCTION: 1,
  PROFILE_INFORMATION_INSTRUCTION: 2,
  STATEMENTS_INSTRUCTION: 3,
  TAX_INSTRUCTION: 4,
}
