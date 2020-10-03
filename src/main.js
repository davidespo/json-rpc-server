const { nanoid } = require('nanoid');
const rpcService = require('./RpcService.js').instance;

require('./methods/utils.js').init(rpcService);
require('./methods/modules.js').init(rpcService);

(async function (rpc) {
  console.log(rpc.list());

  let request = {
    jsonrpc: '2.0',
    method: 'modules.load:v0.1',
    params: {
      content: `
const NOOP_SPEC = {
  key: 'testing.noop:v1.0',
  description: 'test message',
  dependencies: [],
  tags: [
    { context: 'category', value: 'Noop' },
    { context: 'scope', value: 'Testing' },
  ],
  input: {
    type: 'null',
  },
  output: {
    type: null,
  },
  handle() {
    console.log('IT WORKED!!!!!');
  },
};

const methodSpecs = [NOOP_SPEC];
module.exports = {
  init(rpcService) {
    methodSpecs.forEach((spec) => rpcService.register(spec));
    return methodSpecs.map(({ key }) => key);
  },
  shutdown(rpcService) {
    methodSpecs.map(({ key }) => key).forEach(rpcService.remove(key));
  },
};

    `,
    },
    id: nanoid(8),
  };
  console.log('Request:', request);
  let res = await rpc.handle(request);
  console.log('Response:', res);

  request = {
    jsonrpc: '2.0',
    method: 'testing.noop:v1.0',
    params: null,
    id: nanoid(8),
  };
  console.log('Request:', request);
  res = await rpc.handle(request);
  console.log('Response:', res);

  console.log(rpc.list());
})(rpcService).catch((err) => console.error(err));

// (async function (rpc) {
//   console.log(rpc.list());

//   const request = {
//     jsonrpc: '2.0',
//     method: 'utils.logger',
//     params: { message: 'Hello, World!' },
//     id: nanoid(8),
//   };
//   console.log('Request:', request);
//   const res = await rpc.handle(request);
//   console.log('Response:', res);
// })(rpcService).catch((err) => console.error(err));
