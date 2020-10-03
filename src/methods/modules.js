const fs = require('fs');
const { nanoid } = require('nanoid');

const MODULES_PREFIX = process.env.MODULES_DIR || `${__dirname}/../tmpsec`;
console.log(`Using modules directory: "${MODULES_PREFIX}"`);
if (!fs.existsSync(MODULES_PREFIX)) {
  console.log(`Creating modules directory: "${MODULES_PREFIX}"`);
  fs.mkdirSync(MODULES_PREFIX);
}

const LOAD_MODULE_SPEC = {
  key: 'modules.load:v0.1',
  description: '',
  dependencies: [
    { package: 'fs', version: '' },
    { package: 'nanoid', version: '^3.1.12' },
  ],
  tags: [
    { context: 'category', value: 'Modules' },
    { context: 'scope', value: 'Dynamic Functionality' },
    { context: 'impact', value: 'HIGH' },
  ],
  input: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
      },
      dependencies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            package: {
              type: 'string',
            },
            version: {
              type: 'string',
            },
          },
        },
      },
    },
    requied: ['content'],
  },
  output: {
    type: 'object',
    properties: {
      success: 'boolean',
      methods: {
        type: 'array',
        items: 'string',
      },
    },
  },
  async handle({ content, dependencies }) {
    // TODO: dependencies
    const filename = `${nanoid(12)}.module.js`;
    const path = `${MODULES_PREFIX}/${filename}`;
    fs.writeFileSync(path, content);
    const methods = require(path).init(LOAD_MODULE_SPEC._state.rpcService);
    fs.unlinkSync(path);
    return { success: true, methods };
  },
};

const methodSpecs = [LOAD_MODULE_SPEC];
module.exports = {
  init(rpcService) {
    methodSpecs.forEach((spec) => rpcService.register(spec));
    LOAD_MODULE_SPEC._state = {
      rpcService,
    };
    return methodSpecs.map(({ key }) => key);
  },
  shutdown(rpcService) {
    methodSpecs.map(({ key }) => key).forEach(rpcService.remove(key));
  },
};
