// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const exec = require('child_process').exec;
// https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
const { spawnSync } = require('child_process');

const EXEC_SPEC = {
  key: 'cli.exec:v0.1',
  description: 'Run a shell script',
  dependencies: [],
  tags: [
    { context: 'category', value: 'Utility' },
    { context: 'scope', value: 'Testing' },
  ],
  input: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
      },
    },
    // TODO: timeout with default
    requied: ['command'],
  },
  output: {
    type: 'object',
    properties: {
      stdout: { type: 'string' },
      stderr: { type: 'string' },
      status: { type: 'string' },
    },
  },
  async handle({ command }) {
    const parts = command.split(/\s+/);
    const exe = spawnSync(parts[0], parts.slice(1));

    const stdout = exe.stdout.toString();
    const stderr = exe.stderr.toString();
    const status = exe.status;

    return { stdout, stderr, status };
  },
};

const methodSpecs = [EXEC_SPEC];
module.exports = {
  init(rpcService) {
    methodSpecs.forEach((spec) => rpcService.register(spec));
    return methodSpecs.map(({ key }) => key);
  },
  shutdown(rpcService) {
    methodSpecs.map(({ key }) => key).forEach(rpcService.remove(key));
  },
};
