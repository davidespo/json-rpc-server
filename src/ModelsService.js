const Ajv = require('ajv');
const REQUEST_SCHEMA = require('./models/request.schema.json');
const METHOD_SPEC_SCHEMA = require('./models/methodSpec.schema.json');

// https://github.com/ajv-validator/ajv/blob/master/KEYWORDS.md

const ajv = new Ajv({ allErrors: true });
const validateRequest = ajv.compile(REQUEST_SCHEMA);
const validateMethodSpec = ajv.compile(METHOD_SPEC_SCHEMA);

function withValidator(validator, data) {
  const valid = validator(data);
  if (!valid) {
    const error = new Error('failed validation');
    error.validation = validator.errors;
    throw error;
  }
}

class ModelsService {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }
  validateRequest(req) {
    withValidator(validateRequest, req);
  }
  validateMethodSpec(methodSpec) {
    // TODO: joi validation for functions
    withValidator(validateMethodSpec, methodSpec);
  }
  validate(schema, data) {
    const valid = this.ajv.validate(schema, data);
    if (!valid) {
      const error = new Error('failed validation');
      error.validation = this.ajv.errors;
      console.error(error.validation);
      throw error;
    }
  }
}

module.exports = {
  default: ModelsService,
  instance: new ModelsService(),
};
