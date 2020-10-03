const _ = require('lodash');
const modelsService = require('./ModelsService.js').instance;

/*
 * https://www.jsonrpc.org/specification
 * `{"jsonrpc": "2.0", "method": "subtract", "params": [42, 23], "id": 1}`
 * `{"jsonrpc": "2.0", "result": 19, "id": 1}`
 * `{"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "1"}`
 *
 */
const e = (code, message, description) => ({
  code,
  message,
  data: { description },
});
const ERROR_PARSE_ERROR = e(
  -32700,
  'Parse error',
  'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
);
const ERROR_INVALID_REQUEST = e(
  -32600,
  'Invalid Request',
  'The JSON sent is not a valid Request object.',
);
const ERROR_METHOD_NOT_FOUND = e(
  -32601,
  'Method not found',
  'The method does not exist / is not available.',
);
const ERROR_INVALID_PARAMS = e(
  -32602,
  'Invalid params',
  'Invalid method parameter(s).',
);
const ERROR_INTERNAL_ERROR = e(
  -32603,
  'Internal error',
  'Internal JSON - RPC error.',
);

class RpcService {
  constructor() {
    this.methods = {};
  }
  register(methodSpec) {
    // TODO: validation
    modelsService.validateMethodSpec(methodSpec);
    this.methods[methodSpec.key] = methodSpec;
  }
  remove(key) {
    delete this.methods[key];
  }
  list() {
    return Object.values(this.methods).map((methodSpec) => {
      const ms = _.cloneDeep(methodSpec);
      delete ms.handle;
      return ms;
    });
  }
  async handle(req) {
    try {
      modelsService.validateRequest(req);
    } catch (error) {
      const invalidRequestError = _.cloneDeep(ERROR_INVALID_REQUEST);
      invalidRequestError.data.validation = _.get(error, 'validation', null);
      return withError(invalidRequestError, _.get(req, 'id'));
    }
    const { method, params, id = null } = req;
    const methodSpec = this.methods[method];
    if (!!methodSpec) {
      try {
        modelsService.validate(methodSpec.input, params);
      } catch (error) {
        const invalidParamsError = _.cloneDeep(ERROR_INVALID_PARAMS);
        invalidParamsError.data.validation = _.get(error, 'validation', null);
        return withError(invalidParamsError, _.get(req, 'id'));
      }
      try {
        const result = await methodSpec.handle(params);
        return toRes(result, id);
      } catch (err) {
        return toErr(500, err.message, null, id);
      }
    } else {
      return withError(ERROR_METHOD_NOT_FOUND, id);
    }
  }
}

const toRes = (result, id) => ({ jsonrpc: '2.0', result, id });

const toErr = (code, message, data, id) => ({
  jsonrpc: '2.0',
  error: { code, message, data },
  id,
});
const withError = (error, id) => ({ jsonrpc: '2.0', error, id });

module.exports = {
  ERROR_PARSE_ERROR,
  ERROR_INVALID_REQUEST,
  ERROR_METHOD_NOT_FOUND,
  ERROR_INVALID_PARAMS,
  ERROR_INTERNAL_ERROR,
  default: RpcService,
  instance: new RpcService(),
};
