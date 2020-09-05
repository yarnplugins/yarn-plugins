import getStream from "get-stream";
import { CommandContext, PluginConfiguration } from "@yarnpkg/core";
import { PortablePath, ppath } from "@yarnpkg/fslib";
import { PassThrough } from "stream";
import { Cli } from "clipanion";
import { PushCommand } from ".";

async function run(args: string[] = []) {
  const stream = new PassThrough();
  const cli = Cli.from<CommandContext>([PushCommand]);

  const exitCode = await cli.run(args, {
    cwd: ppath.resolve(__dirname as PortablePath),
    plugins: {} as PluginConfiguration,
    quiet: false,
    stdin: process.stdin,
    stdout: stream,
    stderr: stream,
  });

  stream.end();

  const output = await getStream(stream);

  if (exitCode !== 0) {
    throw new Error(output);
  }

  return output;
}

// TODO: Add more tests

it("Throws an error when no bucket was provided", async () => {
  expect.assertions(1);
  try {
    await run([]);
  } catch (error) {
    expect(error.message).toMatchSnapshot();
  }
});
