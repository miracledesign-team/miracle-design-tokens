import StyleDictionary from "style-dictionary";
import {
  fileHeader,
  formattedVariables
} from 'style-dictionary/utils';
import { commentStyles, transformGroups, propertyFormatNames, transforms } from 'style-dictionary/enums';

export default function generateStyleDictionaryConfig(
  source,
  theme
) {
  registerAllFileHeader()
  registerAllTransform()
  return {
    hooks: {
      transforms: {
        cssFontFamilyTransform: {
          type: "value",
          transitive: true,
          matcher: (token) => token.$type === "fontFamily",
          transformer: (token) => {
            if (typeof token.$value !== "string") return token.$value;

            const families = token.$value
              .split(",")
              .map(v => v.trim());

            if (!families[0].startsWith('"')) {
              families[0] = `"${families[0]}"`;
            }

            return families.join(", ");
          }
        }
      },
      formats: {
        cssGlobalFormat: async({ dictionary, file, options }) => {
          const { outputReferences, usesDtcg } = options;
          const header = await fileHeader({ file });
          const globalTokens = dictionary.allTokens.filter(token =>
            token.filePath.includes('global')
          );
          return (
            header +
            ':root {\n' +
            formattedVariables({
              format: propertyFormatNames.css,
              dictionary: { ...dictionary, allTokens: globalTokens },
              outputReferences,
              usesDtcg
            }) +
            '\n}\n'
          );
        },
        cssAliasFormat: async({ dictionary, file, options }) => {
          const { outputReferences, usesDtcg } = options;
          const header = await fileHeader({ file });
          const aliasTokens = dictionary.allTokens.filter(token =>
            token.filePath.includes(theme)
          );
          const selector = theme === "dark" ?  '[data-theme="dark"] {' : ':root {'
          return (
            header +
            `${selector}\n` +
            formattedVariables({
              format: propertyFormatNames.css,
              dictionary: { ...dictionary, allTokens: aliasTokens },
              outputReferences,
              usesDtcg
            }) +
            '\n}\n'
          );
        }
      }
    },
    source: source,
    platforms: {
      "css": { 
        transformGroup: transformGroups.css,
        transforms: [
          "size/px",
          "cssFontFamilyTransfrom"
        ],
        prefix: "m",
        buildPath: `dist/web/css/`,
        files: [
          {
            destination: `global-tokens.css`,
            format: "cssGlobalFormat",
            options: {
              fileHeader: "miracleFileHeader",
              outputReferences: false,
              usesDtcg: true
            }
          },
          {
            destination: `alias-${theme}-tokens.css`,
            format: "cssAliasFormat",
            options: {
              fileHeader: "miracleFileHeader",
              outputReferences: false,
              usesDtcg: true
            }
          }
        ]
      }
    }
  }
}

function registerAllFileHeader() {
  StyleDictionary.registerFileHeader({
    name: "miracleFileHeader",
    fileHeader: async (defaultMessages = []) => [
      "+-------------------------------------------------------------+",
      "|                     MIRACLE DESIGN TOKENS                   |",
      "+-------------------------------------------------------------+",
      "⚠️ WARNING: Don't edit directly, this file was auto-generated.",
      "Update the source tokens instead.",
      "If you find some errors, please contact Miracle Team ✨.",
      "",
      `Generated on ${new Date().toLocaleString()}`,
    ]
  });
}

function registerAllTransform() {
  StyleDictionary.registerTransform({
    name: "cssFontFamilyTransfrom",
    type: "value",
    transitive: true,
    filter: (token) => token.$type === "fontFamily",
    transform: (token) => {
      if (typeof token.$value !== "string") return token.$value;

      const families = token.$value
        .split(",")
        .map(v => v.trim());

      if (families.length > 0 && !families[0].startsWith('"')) {
        families[0] = `"${families[0]}"`;
      }

      return families.join(", ");
    }
  });
}