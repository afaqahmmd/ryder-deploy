const str =
  "{'code': 'ABC123', 'expired_at': '23-02-2026', 'percentage_off': '30', 'fixed_amount_off': None}";

/**
 * Converts a Python dictionary string (Django representation) into a valid JSON object.
 */
function parsePythonDict(dictStr) {
  try {
    // Sanitize the string to make it JSON-compliant
    const jsonStr = dictStr
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/\bNone\b/g, "null") // Python None -> null
      .replace(/\bTrue\b/g, "true") // Python True -> true
      .replace(/\bFalse\b/g, "false"); // Python False -> false

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Parsing error:", error.message);
    return null;
  }
}

const obj = parsePythonDict(str);
console.log(obj);
