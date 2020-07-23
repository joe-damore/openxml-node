const OpenXmlPartType = require('./openXmlPartType.js');

/**
 * Represents an individual file within an OpenXML package.
 */
class OpenXmlPart {

  /**
   * Constructor.
   *
   * Optionally assigns `uri`, `data`, and `type` properties. If `type` is
   * 'xml', then `data` should contain the deserialized data retrieved by
   * parsing the XML content.
   *
   * @param {string=} uri - URI for part, relative to package root.
   * @param {Buffer|Object} data - Part data.
   * @param {string} type - Part type.
   */
  constructor(uri = null, data = null, type = OpenXmlPartType.UNKNOWN) {
    this.uri = uri;
    this.data = data;
    this.type = type;
  }

}

module.exports = OpenXmlPart;
