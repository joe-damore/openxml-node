const path = require('path');

/**
 * Tracks MIME-like content types of files within an OpenXML package.
 */
class OpenXmlContentTypes {

  /**
   * Constructor.
   *
   * Optionally assigns `defaults` and `overrides` properties.
   *
   * @param {Object=} defaults - Map of file extension and their corresponding content types.
   * @param {Object=} overrides - Map of part URIs and their corresponding content types.
   */
  constructor(defaults = {}, overrides = {}) {
    this.defaults = defaults;
    this.overrides = overrides;
  }

  /**
   * Returns the content type for the given part URI.
   *
   * If no rule exists for this URI within `defaults` or `overrides`, then
   * `null` is returned.
   *
   * @param {string} uri - URI of part for which to determine content type.
   *
   * @returns {string|null} Content type for `uri`, or `null` if not applicable.
   */
  getContentType(uri) {
    if (this.overrides[uri]) {
      return this.overrides[uri];
    }
    const ext = path.extname(uri).slice(1);
    if (this.defaults[ext]) {
      return this.defaults[ext];
    }
    return null;
  }

  /**
   * Returns the content type for the given part.
   *
   * If no rule exists for this part within `defaults` or `override`, then
   * `null` is returned.
   *
   * @param {Object} part - OpenXmlPart instance for which to determine content type.
   *
   * @returns {string|null} Content type for `part`, or `null` if not applicable.
   */
  getContentTypeForPart(part) {
    return this.getContentType(part.uri);
  }

}

module.exports = OpenXmlContentTypes;
