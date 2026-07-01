/**
 * Generate Strapi runtime types from backend schemas
 *
 * Parses the JSON schema files from the Strapi backend and generates
 * TypeScript runtime types for type-safe API consumption.
 *
 * Usage: node scripts/copyTypes.js
 */

const fs = require('fs');
const path = require('path');

const BACKEND_PATH = path.join(__dirname, '../../backend');
const OUTPUT_FILE = path.join(__dirname, '../src/types/generated/index.ts');

// =============================================================================
// SCHEMA PARSING
// =============================================================================

function loadComponentSchemas() {
  const componentsDir = path.join(BACKEND_PATH, 'src/components');
  const schemas = {};

  const categories = fs.readdirSync(componentsDir).filter(f => 
    fs.statSync(path.join(componentsDir, f)).isDirectory()
  );

  for (const category of categories) {
    const categoryDir = path.join(componentsDir, category);
    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const name = file.replace('.json', '');
      const uid = `${category}.${name}`;
      const content = JSON.parse(fs.readFileSync(path.join(categoryDir, file), 'utf8'));
      schemas[uid] = {
        uid,
        category,
        name,
        displayName: content.info?.displayName || name,
        attributes: content.attributes || {},
      };
    }
  }

  return schemas;
}

function loadContentTypeSchemas() {
  const apiDir = path.join(BACKEND_PATH, 'src/api');
  const schemas = {};

  const apis = fs.readdirSync(apiDir).filter(f => {
    const stat = fs.statSync(path.join(apiDir, f));
    return stat.isDirectory() && f !== '.gitkeep';
  });

  for (const api of apis) {
    const schemaPath = path.join(apiDir, api, 'content-types', api, 'schema.json');
    if (fs.existsSync(schemaPath)) {
      const content = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      schemas[`api::${api}.${api}`] = {
        uid: `api::${api}.${api}`,
        name: api,
        displayName: content.info?.displayName || api,
        kind: content.kind,
        attributes: content.attributes || {},
      };
    }
  }

  return schemas;
}

// =============================================================================
// TYPE GENERATION
// =============================================================================

function toPascalCase(str) {
  return str.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function toTypeName(category, name) {
  const pascalName = toPascalCase(name);
  if (category === 'sections') return `${pascalName}Section`;
  if (category === 'shared') return `${pascalName}Block`;
  return pascalName;
}

function attributeToTsType(attr, attrName, componentSchemas) {
  const { type, component, components, target, relation, multiple, repeatable, required } = attr;
  let tsType;
  let isOptional = ['seo', 'notificationBanner'].includes(attrName) || required !== true;

  switch (type) {
    case 'string':
    case 'text':
    case 'richtext':
    case 'email':
    case 'password':
    case 'uid':
      tsType = 'string';
      break;
    case 'integer':
    case 'biginteger':
    case 'float':
    case 'decimal':
      tsType = 'number';
      break;
    case 'boolean':
      tsType = 'boolean';
      break;
    case 'datetime':
    case 'date':
    case 'time':
    case 'timestamp':
      tsType = 'string';
      break;
    case 'json':
      tsType = 'unknown';
      break;
    case 'enumeration':
      tsType = attr.enum?.map(v => `'${v}'`).join(' | ') || 'string';
      break;
    case 'media':
      tsType = multiple ? 'StrapiMedia[]' : 'StrapiMedia';
      break;
    case 'component':
      if (component && componentSchemas[component]) {
        const comp = componentSchemas[component];
        const typeName = toTypeName(comp.category, comp.name);
        tsType = repeatable ? `${typeName}[]` : typeName;
      } else {
        tsType = 'unknown';
      }
      break;
    case 'dynamiczone':
      if (components?.length) {
        const types = components
          .map(c => componentSchemas[c] ? toTypeName(componentSchemas[c].category, componentSchemas[c].name) : null)
          .filter(Boolean);
        tsType = types.length ? `(${types.join(' | ')})[]` : 'unknown[]';
      } else {
        tsType = 'unknown[]';
      }
      break;
    case 'relation':
      if (target) {
        const match = target.match(/api::([\w-]+)\.([\w-]+)/);
        if (match) {
          const typeName = toPascalCase(match[1]);
          const isToMany = relation?.includes('ToMany') || relation === 'oneToMany';
          tsType = isToMany ? `${typeName}[]` : typeName;
        } else {
          tsType = 'unknown';
        }
      } else {
        tsType = 'unknown';
      }
      break;
    default:
      tsType = 'unknown';
  }

  return { tsType, isOptional };
}

function generateInterface(schema, componentSchemas, isContentType = false) {
  const { attributes, category, name } = schema;
  const typeName = isContentType ? toPascalCase(schema.name) : toTypeName(category, name);

  const lines = [];
  
  if (!isContentType && category) {
    lines.push(`  __component: '${category}.${name}';`);
  }

  for (const [attrName, attr] of Object.entries(attributes)) {
    if (['createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'publishedAt', 'localizations', 'locale'].includes(attrName)) {
      continue;
    }
    const { tsType, isOptional } = attributeToTsType(attr, attrName, componentSchemas);
    lines.push(`  ${attrName}${isOptional ? '?' : ''}: ${tsType};`);
  }

  const ext = isContentType ? ' extends StrapiBaseEntity' : ' extends BaseComponent';
  return { typeName, code: `export interface ${typeName}${ext} {\n${lines.join('\n')}\n}` };
}

function generateOutput(componentSchemas, contentTypeSchemas) {
  const groups = { sections: [], shared: [], links: [], layout: [], elements: [], meta: [] };
  const contentTypes = [];

  for (const schema of Object.values(componentSchemas)) {
    const { typeName, code } = generateInterface(schema, componentSchemas);
    if (groups[schema.category]) {
      groups[schema.category].push({ typeName, code });
    }
  }

  for (const schema of Object.values(contentTypeSchemas)) {
    const { typeName, code } = generateInterface(schema, componentSchemas, true);
    contentTypes.push({ typeName, code });
  }

  return `/**
 * Strapi Runtime Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated by scripts/copyTypes.js from backend schemas
 * Run 'npm run types:sync' to update
 */

// =============================================================================
// BASE TYPES
// =============================================================================

export interface StrapiBaseEntity {
  id: number;
  documentId: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

interface BaseComponent {
  id: number;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption?: string | null;
  name?: string;
  width?: number;
  height?: number;
}

// =============================================================================
// LINK COMPONENTS
// =============================================================================

${groups.links.map(t => t.code).join('\n\n')}

// =============================================================================
// META COMPONENTS
// =============================================================================

${groups.meta.map(t => t.code).join('\n\n')}

// =============================================================================
// ELEMENT COMPONENTS
// =============================================================================

${groups.elements.map(t => t.code).join('\n\n')}

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

${groups.layout.map(t => t.code).join('\n\n')}

// =============================================================================
// CONTENT TYPES
// =============================================================================

${contentTypes.map(t => t.code).join('\n\n')}

// =============================================================================
// PAGE SECTIONS
// =============================================================================

${groups.sections.map(t => t.code).join('\n\n')}

export type PageSection = ${groups.sections.map(t => t.typeName).join(' | ') || 'never'};

// =============================================================================
// ARTICLE BLOCKS
// =============================================================================

${groups.shared.map(t => t.code).join('\n\n')}

export type ArticleBlock = ${groups.shared.map(t => t.typeName).join(' | ') || 'never'};

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
`;
}

// =============================================================================
// MAIN
// =============================================================================

console.log('Generating Strapi types from backend schemas...\n');

const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const componentSchemas = loadComponentSchemas();
const contentTypeSchemas = loadContentTypeSchemas();

console.log(`  Parsed ${Object.keys(componentSchemas).length} components`);
console.log(`  Parsed ${Object.keys(contentTypeSchemas).length} content types`);

const output = generateOutput(componentSchemas, contentTypeSchemas);
fs.writeFileSync(OUTPUT_FILE, output);

console.log(`\n✓ Generated: src/types/generated/index.ts`);
console.log('\nDone!');
