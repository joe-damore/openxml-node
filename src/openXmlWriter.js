const fs = require('fs');
const path = require('path');

const AdmZip = require('adm-zip');
const xml = require('xml-js');

/**
 * Collection of functions to write OpenXML packages to various destinations.
 */
const OpenXmlWriter = {

  /**
   * Outpts an OpenXmlPackage instance as a buffer containing OpenXML data.
   *
   * @param {Object} package - OpenXmlPackage instance.
   *
   * @returns {Buffer} Buffer containing OpenXML package binary data.
   */
  toBuffer: (package) => {
    const zip = new AdmZip();
    Object.keys(package.parts).forEach((key) => {
      const part = package.parts[key];

      // TODO Replace 'xml' string with OpenXmlPartType enum member.
      let data = part.data;
      if (part.type === 'xml') {
        // TODO Handle stringify errors.
        data = Buffer.from(xml.js2xml(part.data, { compact: false }), 'utf8');
      }

      zip.addFile(part.uri, data)
    });

    return zip.toBuffer();
  },

  /**
   * Outputs an OpenXmlPackage instance as a file.
   *
   * Data is written to disk asynchronously.
   *
   * @param {Object} package - OpenXmlPackage instance.
   * @param {string} filepath - Output OpenXML package filepath.
   */
  toFile: async (package, filepath) => {
    const buffer = OpenXmlWriter.toBuffer(package);
    await fs.promises.writeFile(filepath, buffer);
  },

  /**
   * Outputs an OpenXmlPackage instance as a file.
   *
   * Data is written to disk synchronously.
   *
   * @param {Object} package - OpenXmlPackage instance.
   * @param {string} filepath - Output OpenXML package filepath.
   */
  toFileSync: (package, filepath) => {
    const buffer = OpenXmlWriter.toBuffer(package);
    fs.writeFileSync(filepath, buffer);
  },

};

module.exports = OpenXmlWriter;
