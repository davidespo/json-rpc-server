const { nanoid } = require('nanoid');
const rpcService = require('./RpcService.js').instance;

require('./methods/utils.js').init(rpcService);

(async function (rpc) {
  console.log(rpc.list());

  const request = {
    jsonrpc: '2.0',
    method: 'utils.logger',
    params: { message: 'Hello, World!' },
    id: nanoid(8),
  };
  console.log('Request:', request);
  const res = await rpc.handle(request);
  console.log('Response:', res);
})(rpcService).catch((err) => console.error(err));
