/**
 * Name Validation Utility
 * 
 * Validates Ethiopian naming conventions where users must provide
 * at least two names: first name and father's name.
 * Supports both Latin and Amharic scripts.
 */

export interface NameValidationResult {
  isValid: boolean;
  error?: string;      // English error message
  errorAm?: string;    // Amharic error message
}

/**
 * Validates that a full name contains at least two parts (first name + father's name)
 * and that each part meets minimum length requirements.
 * 
 * @param name - The full name to validate
 * @returns NameValidationResult with validation status and bilingual error messages
 */
export const validateFullName = (name: string): NameValidationResult => {
  const trimmed = name.trim();
  
  // Check if empty
  if (!trimmed) {
    return {
      isValid: false,
      error: "Name is required",
      errorAm: "ስም ያስፈልጋል"
    };
  }
  
  // Split by whitespace (handles both Latin and Amharic)
  // This regex matches one or more whitespace characters
  const parts = trimmed.split(/\s+/);
  
  // Must have at least 2 parts (first name + father's name)
  if (parts.length < 2) {
    return {
      isValid: false,
      error: "Please enter your full name (first name and father's name)",
      errorAm: "እባክዎ ሙሉ ስምዎን ያስገቡ (ስም እና የአባት ስም)"
    };
  }
  
  // Each part must have at least 2 characters
  const hasShortPart = parts.some(part => part.length < 2);
  if (hasShortPart) {
    return {
      isValid: false,
      error: "Each name part must be at least 2 characters",
      errorAm: "እያንዳንዱ የስም ክፍል ቢያንስ 2 ፊደላት ሊኖረው ይገባል"
    };
  }
  
  return { isValid: true };
};
