import * as postcss from 'postcss';
import { uniq, map, filter } from 'lodash';

// This PostCSS plugin allows the inlining of traits.
// It allows for the writing of CSS such as:
// .foo {
//   trait: fancyTrait from 'fancy[.css]'
// }
// The css file-ending is optional. Fancy is assumed to be located in a traits directory.
// The values of fancyTrait will replace the trait declaration.
class Trait {
  constructor(getFileText, traitPath) {
    this.plugin = this.plugin.bind(this);
    this._traitPath = traitPath;

    if (getFileText) {
      this._getFileText = getFileText;
    }
  }

  plugin(css) {
    const promises = [];
    const traitDataList = [];

    // Record all trait: ... declarations in the given CSS file.
    css.walkDecls('trait', (decl) => {
      traitDataList.push(this._getTraitData(decl));
    });

    // Figure out which other files need to be imported.
    const uniqueTraitPaths = uniq(map(traitDataList, 'traitPath'));

    for (const traitPath of uniqueTraitPaths) {
      // Load the CSS file through whatever method was provided (i.e. SystemJS)
      const promise = this._getFileText(traitPath, css.source.input.from)
        .then((importedCssText) => {
          // Find all trait declarations which need information from the imported CSS file.
          const traitDataListForPath = filter(traitDataList, (traitData) => {
            return traitData.traitPath === traitPath;
          });

          for (const traitData of traitDataListForPath) {
            for (const traitName of traitData.traitNames) {
              // Replace the trait declaration with the imported values.
              const trait = this._getTrait(traitName, traitData.traitPath, importedCssText);
              this._insertTrait(traitData.decl, trait);
            }
          }
        });

      promises.push(promise);
    }

    return Promise.all(promises);
  }

  // This method will be overidden during construction
  _getFileText() {
    throw new Error('Expected getFileText to be provided as option to constructor');
  }

  _getTraitData(decl) {
    // Look for declarations similiar to:
    // trait: exampleTrait from 'foo';
    const matchImports = /^(.+?)\s+from\s+("[^"]*"|'[^']*'|[\w-]+)$/;
    const regexpResult = matchImports.exec(decl.value);

    if (!regexpResult) {
      throw new Error(`Trait ${decl.value} didn't match the form: "trait: foo from 'traitFile'"`);
    }

    const rawFileName = this._removeWrappingQuotes(regexpResult[2]);
    let traitPath = `${this._traitPath}${rawFileName}`;

    // Assume CSS file if file extension is missing.
    if (!traitPath.includes('.css')) {
      traitPath = `${traitPath}.css`;
    }

    return {
      traitNames: regexpResult[1].split(' '),
      traitPath,
      decl
    };
  }

  _removeWrappingQuotes(string) {
    return string.replace(/^["']|["']$/g, '');
  }

  _getTrait(traitName, traitPath, importedCssText) {
    let trait = null;
    const parsedCss = postcss.parse(importedCssText);

    parsedCss.walkRules(`.${traitName}`, (rule) => {
      if (trait === null) {
        trait = rule;
      } else {
        throw new Error(`Ambiguous trait name: ${traitName} at ${traitPath}`);
      }
    });

    if (trait === null) {
      throw new Error(`Failed to find trait: ${traitName} at ${traitPath}`);
    }

    return trait;
  }

  _insertTrait(decl, trait) {
    for (const node of trait.nodes) {
      decl.parent.insertBefore(decl, node);
    }
    decl.remove();
  }
}

export default postcss.plugin('trait', (options = {}) => {
  return new Trait(options.getFileText, options.traitPath).plugin;
});