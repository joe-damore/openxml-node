const path = require('path');

/**
 * Tracks MIME-like content types of files within an OpenXML package.
 *
 * This object is used to determine the content types of parts within
 * the `OpenXmlPackage` instance to which this `OpenXmlContentTypes` instance
 * belongs.
 *
 * Modifying a package's `OpenXmlContentTypes` affects how content types are
 * determined for the remainder of the `OpenXmlPackage` instance's lifetime.
 *
 * This contents of this object are not serialized when a package is written.
 * To persist changes to a package's content types, modify the package's
 * corresponding `OpenXmlPart` instance whose `uri` is `[Content_Types].xml`.
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
