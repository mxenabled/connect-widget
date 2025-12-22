export function isWellsFargoInstitution(institution: InstitutionResponseType): boolean {
  const wellsFargoGuids = [
    'INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867', // Wells Fargo PROD guid
    'INS-f9e8d5f6-b953-da63-32e4-6e88fbe8b250', // Wells Fargo SAND guid for testing
  ]

  return wellsFargoGuids.includes(institution.guid) || institution.name === 'Wells Fargo'
}

export function getInstitutionBrandColor(
  institution: InstitutionResponseType,
  defaultColor: string,
): string {
  const rawColor = institution?.brand_color_hex_code
  const configuredInstitutionColor =
    rawColor && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(rawColor) ? rawColor : null

  if (isWellsFargoInstitution(institution)) {
    return configuredInstitutionColor || '#B22222' // Default Wells Fargo red
  }

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
