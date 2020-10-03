const LOGGER_SPEC = {
  key: 'utils.logger:v1.0',
  description: '`console.log`',
  dependencies: [],
  tags: [
    { context: 'category', value: 'Utility' },
    { context: 'scope', value: 'Testing' },
  ],
  input: {
    type: 'object',
    properties: {
      message: {
        type: ['string', 'null'],
      },
    },
    requied: ['message'],
  },
  output: {
    type: null,
  },
  handle({ message }) {
    console.log(message);
  },
};

const methodSpecs = [LOGGER_SPEC];
module.exports = {
  init(rpcService) {
    methodSpecs.forEach((spec) => rpcService.register(spec));
    return methodSpecs.map(({ key }) => key);
  },
  shutdown(rpcService) {
    methodSpecs.map(({ key }) => key).forEach(rpcService.remove(key));
  },
};
