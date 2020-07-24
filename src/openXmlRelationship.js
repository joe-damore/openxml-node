/**
 * Describes an individual OpenXML relationship.
 */
class OpenXmlRelationship {

  /**
   * Constructor.
   *
   * Optionally assigns relationship ID, type, target, and context.
   *
   * @param {string=} id - OpenXML relationship identifier
   * @param {string=} type - URL to OpenXML relationship type schema
   * @param {string=} target - URI of OpenXML part targeted by relationship.
   * @param {string=} context - URI to relationship parent directory, or null if root.
   */
  constructor(id = null, type = null, target = null, context = null) {
    this.id = id;
    this.type = type;
    this.target = target;
    this.context = context;
  }
}

module.exports = OpenXmlRelationship;
