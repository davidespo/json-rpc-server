const { nanoid } = require('nanoid');
const rpcService = require('./RpcService.js').instance;

require('./methods/utils.js').init(rpcService);

(async function (rpc) {
  console.log(rpc.list());

  const request = {
    jsonrpc: '2.0',
    method: 'utils.logger',
    params: { message: `Hello, World!` },
    id: nanoid(8),
  };
  console.log('Request:', request);
  console.log('Response:', await rpc.handle(request));
})(rpcService);
