/**
 * Enum-like structure to classify OpenXmlPart instances.
 */
const OpenXmlPartType = {
  // TODO Add 'BINARY' part type.
  UNKNOWN: 'unknown',
  XML: 'xml',

  /**
   * Determines the part type that corresponds to a given content type string.
   *
   * If the given content type string is unknown or unaccounted for, then
   * `OpenXmlPartType.UNKNOWN` is returned.
   *
   * @param {string} contentType - OpenXML content type string.
   *
   * @returns {string} Part type which corresponds to `contentType`.
   */
  fromContentType: (contentType) => {
    // TODO Account for 'BINARY' part type once it gets added.
    // Short-circuit if `contentType` is falsy.
    if (!contentType) {
      return OpenXmlPartType.UNKNOWN;
    }
    // Return XML part type if content type string ends in 'xml'.
    if (contentType.slice(-3).toLowerCase() === 'xml') {
      return OpenXmlPartType.XML;
    }
    // Default to UNKNOWN part type.
    return OpenXmlPartType.UNKNOWN;
  },
};

module.exports = OpenXmlPartType;
