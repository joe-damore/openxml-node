const fs = require('fs');
const path = require('path');

const AdmZip = require('adm-zip');
const xml = require('xml-js');

const OpenXmlContentTypes = require('./openXmlContentTypes.js');
const OpenXmlPartType = require('./openXmlPartType.js');
const OpenXmlPart = require('./openXmlPart.js');
const OpenXmlPackage = require('./openXmlPackage.js');
const OpenXmlRelationship = require('./openXmlRelationship.js');

// Xml-js parsing options to be used throughout this module.
const xmlParseOptions = {
  compact: false,
};

/**
 * Returns an AdmZip instance from the given buffer of data.
 *
 * @param {Buffer} data - Buffer of data from which to retrieve zip instance.
 *
 * @returns {Object} AdmZip instance containing zip file data.
 */
const _zipFromBuffer = (data) => {
  // TODO Error management related to zip parse errors.
  return new AdmZip(data);
};

/**
 * Returns an OpenXmlContentType instance from an array of Adm-Zip entries.
 *
 * The file named `[Content_Types].xml` is used to construct the
 * returned OpenXmlContentType instance.
 *
 * @param {Object[]} zipEntries - Array of ZipEntry instances.
 *
 * @returns {Object} OpenXmlContentType instance.
 */
const _contentTypeFromEntries = (zipEntries) => {
  // TODO Throw exception if `find()` call fails (which indicates that document is invalid).
  const contentTypeEntry = zipEntries
    .find((entry) => {
      return entry.entryName === '[Content_Types].xml';
    });

  const contentTypeXml = contentTypeEntry.getData().toString('utf8');
  const contentTypeData = xml.xml2js(contentTypeXml, { compact: false });

  const contentTypeDefaults = contentTypeData.elements
    .filter((element) => {
      return element.name === 'Default';
    })
    .reduce((acc, cur) => {
      const ext = cur.attributes['Extension'];
      const contentTypeString = cur.attributes['ContentType'];

      acc[ext] = contentTypeString;
      return acc;
    }, {});

  const contentTypeOverrides = contentTypeData.elements
    .filter((element) => {
      return element.name === 'Override';
    })
    .reduce((acc, cur) => {
      const uri = cur.attributes['PartName'];
      const contentTypeString = cur.attributes['ContentType'];

      acc[uri] = contentTypeString;
      return acc;
    }, {});

  return new OpenXmlContentTypes(contentTypeDefaults, contentTypeOverrides);
};

/**
 * Returns OpenXmlRelationship instances from an array of Adm-Zip entries.
 *
 * Any files named '.rels' or with the extension '.rels' are used to populate
 * the returned array.
 *
 * @param {Object[]} zipEntries - Array of ZipEntry instances.
 *
 * @returns {Object[]} Array of OpenXmlRelationship instances.
 */
const _relationshipsFromEntries = (zipEntries) => {
  return zipEntries
    .filter((entry) => {
      // Filter out zip entries that do not have '.rels' filename extension.
      const hasRelsExtension = path.extname(entry.entryName).toLowerCase() === '.rels';
      const hasRelsBasename = path.basename(entry.entryName).toLowerCase() === '.rels';

      return (hasRelsExtension || hasRelsBasename);
    })
    .map((entry) => {
      // Parse relationship entry XML.
      // TODO Handle XML parse errors.
      const data = xml.xml2js(entry.getData().toString('utf8'), xmlParseOptions);

      // Determine context for relationship.
      const context = (() => {
        let dirname = path.join(path.dirname(entry.entryName), '..');
        if (dirname === '.') {
          return null;
        }
        return dirname;
      })();

      return {
        data,
        context,
      };
    })
    .reduce((acc, cur) => {
      // Add each relationship from the parsed zipEntry to a single array.
      cur.data.elements[0].elements
        .filter((element) => {
          return element.name === 'Relationship'
        })
        .forEach((element) => {
          const id = element.attributes['Id'];
          const type = element.attributes['Type'];
          const target = element.attributes['Target'];
          const context = cur.context;

          acc.push(new OpenXmlRelationship(id, type, target, context));
        });

      return acc;
    }, []);
};

/**
 * Returns an array of OpenXmlPart instances for the given zip entries.
 *
 * Requires an OpenXmlContentTypes instance to be passed in order to determine
 * the `type` property for each output OpenXmlPart instance.
 *
 * @param {Object[]} zipEntries - Array of ZipEntry instances.
 * @parma {Object} contentTypes - OpenXmlContentTypes instance for package.
 *
 * @returns {Array} Array of OpenXmlPart instances from zip entries.
 */
const _partsFromEntries = (zipEntries, contentTypes) => {
  return zipEntries.map((entry) => {
    const contentTypeString = contentTypes.getContentType(entry.entryName);
    const partTypeString = OpenXmlPartType.fromContentType(contentTypeString);

    // Get part data, automatically parsing XML if applicable.
    const data = (() => {
      if (partTypeString === OpenXmlPartType.XML) {
        // TODO Handle XML parse errors.
        return xml.xml2js(entry.getData().toString('utf8'), xmlParseOptions);
      }
      return entry.getData();
    })();

    return new OpenXmlPart(entry.entryName, data, partTypeString);
  });
};

/**
 * Returns a map-like structure of OpenXmlPart instances.
 *
 * Each OpenXmlPart instance can be accessed by using its `uri` property as
 * a key.
 *
 * @param {Object[]} partsArray - Array of OpenXmlPart instances.
 *
 * @returns {Object} Map of OpenXmlPart instances.
 */
const _partsArrayToMap = (partsArray) => {
  return partsArray.reduce((acc, cur) => {
    acc[cur.uri] = cur;
    return acc;
  }, {});
};

/**
 * Collection of functions to create OpenXmlPackage instances.
 *
 * Supports loading packages from disk and from memory.
 */
const OpenXmlReader = {

  /**
   * Create an OpenXmlPackage instance from a buffer.
   *
   * @param {Buffer} data - OpenXML package data.
   *
   * @returns {Object} OpenXmlPackage instance.
   */
  fromBuffer: (data) => {
    const package = new OpenXmlPackage();

    const zip = _zipFromBuffer(data);
    const entries = zip.getEntries();

    const contentTypes = _contentTypeFromEntries(entries);
    const parts = _partsFromEntries(entries, contentTypes);
    const relationships = _relationshipsFromEntries(entries);

    package.contentTypes = contentTypes;
    package.parts = _partsArrayToMap(parts);
    package.relationships = relationships;

    return package;
  },

  /**
   * Create an OpenXmlPackage instance by asynchronously reading a file.
   *
   * @param {string} filepath - Path to OpenXML package file.
   *
   * @returns {Promise} Promise that resolves to OpenXmlPackage instance.
   */
  fromFile: async (filepath) => {
    const data = await fs.readFile(filepath);
    return OpenXmlReader.fromBuffer(data);
  },

  /**
   * Create an OpenXmlPackage instance by synchronously reading a file.
   *
   * @param {string} filepath - Path to OpenXML package file.
   *
   * @returns {Object} OpenXmlPackage instance.
   */
  fromFileSync: (filepath) => {
    const data = fs.readFileSync(filepath);
    return OpenXmlReader.fromBuffer(data);
  },

};

module.exports = OpenXmlReader;
