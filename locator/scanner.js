/**
 * scanner.js - Traverses the DOM to locate and classify elements for recording.
 * Exports methods to parse nodes into classification hashes with locator paths.
 *
 * Global dependencies: builder, locator, classifier, Node
 */
 /* global builder locator classifier Node */

const scanner = {
  limit: 1000,

  /**
   * Recursively traverse the DOM starting at 'root', classify matching elements,
   * and build locator paths up to a specified limit.
   *
   * @param {Array<Object>} array - Collector for classification hashes.
   * @param {Node} root - Root element to start parsing from.
   * @param {Array<string>} attributesArray - Attributes list for path construction.
   * @returns {Array<Object>} Array of classification hashes with locator paths.
   */
  parseNodes(array, root, attributesArray) {
    this.limit = this.limit - 1;
    if ((this.limit <= 0) || (root === undefined)) {
      return array;
    }

    const hash = classifier(root);

    if (hash !== null) {
      const tree = builder.build(root, attributesArray, []);
      Object.assign(hash, {
        path: locator.build(tree, root, hash.type, attributesArray)
      });
      array.push(hash);
    }

    const children = root.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeType === Node.ELEMENT_NODE) {
        this.parseNodes(array, children[i], attributesArray);
      }
    }
    return array;
  },

  /**
   * Parse a single node into a classification hash and locator path.
   *
   * @param {string} time - Timestamp for the event.
   * @param {Node} node - The DOM node to parse.
   * @param {Array<string>} attributesArray - Attributes list for path construction.
   * @returns {Object} Classification hash including time and locator path.
   */
  parseNode(time, node, attributesArray) {
    /* FIXME: add handling for if hasattribute shadowroot */
    if (node !== undefined) {
      const hash = classifier(node) || { type: 'default' };

      const tree = builder.build(node, attributesArray, []);

      Object.assign(hash, {
        time,
        path: locator.build(tree, node, hash.type)
      });
      return hash;
    }
    return {};
  }
};

if (typeof exports !== 'undefined') module.exports.scanner = scanner;
