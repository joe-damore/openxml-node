/**
 * Open XML document package.
 *
 * Contains part, content type, and relationship data that forms an OpenXML
 * package. Also provides utilities with which to retrieve and manipulate this
 * data.
 */
class OpenXmlPackage {

  /**
   * Constructor.
   */
  constructor() {
    this.contentTypes = {};
    this.parts = {};
    this.relationships = [];
  }

  /**
   * Determines whether the given part exists in this package.
   *
   * @param {Object} part - OpenXmlPart instance for which to check existence.
   *
   * @returns {boolean} True if part exists, false otherwise.
   */
  partExists(part) {
    return this.partExistsWithUri(part.uri);
  }

  /**
   * Determines whether a part with the given URI exists in this package.
   *
   * @param {string} uri - URI of OpenXmlPart instance for which to check existence.
   *
   * @returns {boolean} True if part exists, false otherwise.
   */
  partExistsWithUri(uri) {
    return (!!this.parts[uri]);
  }

  /**
   * Adds the given part to this package.
   *
   * If a part already exists whose URI matches `part.uri`, an error is thrown.
   *
   * @param {Object} part - OpenXmlPart instance to add.
   */
  addPart(part) {
    if (this.partExists(part)) {
      // TODO Accept `options.replace` param to allow this operation.`
      // TODO Throw more specific error.
      throw new Error(`Part with URI ${part.uri} already exists`);
    }
    this.parts[part.uri] = part;
  }

  /**
   * Removes the given part from this package.
   *
   * If a part does not already exist whose URI matches `part.uri`, an error is
   * thrown.
   *
   * @param {Object} part - OpenXmlPart instance to remove.
   */
  removePart(part) {
    this.removePartWithUri(part.uri);
  }

  /**
   * Removes the part with the given URI from this package.
   *
   * If a part does not already exist whose URI matches `uri`, an error is
   * thrown.
   *
   * @param {string} uri - URI of OpenXmlPart instance to remove.
   */
  removePartWithUri(uri) {
    if (!this.partExistsWithUri(uri)) {
      // TODO Throw more specific error.
      throw new Error(`Part with URI ${part.uri} does not exist`);
    }
    this.parts[uri] = undefined;
  }

}

module.exports = OpenXmlPackage;
