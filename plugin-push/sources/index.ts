import os from "os";
import spawn from "cross-spawn";
import { createRequire, createRequireFromPath } from "module";
import { Configuration, Project, CommandContext, Plugin } from "@yarnpkg/core";
import { PortablePath, ppath, npath, xfs } from "@yarnpkg/fslib";
import { Command, UsageError } from "clipanion";

import { sanitizeBucket, parseSource } from "./utils";

export class PushCommand extends Command<CommandContext> {
  static usage = Command.Usage({
    description: "Uploads packages to a cloud storage bucket.",
  });

  @Command.String("-r,--require")
  require?: string;

  @Command.String("--bucket")
  bucket?: string;

  @Command.String("--version")
  version: string = os.userInfo().username;

  @Command.Rest()
  files: PortablePath[] = [];

  @Command.Path(`push`)
  async execute(): Promise<number | undefined> {
    const { cwd } = this.context;
    const configuration = await Configuration.find(cwd, null);
    const { project } = await Project.find(configuration, cwd);

    //
    // Allows to load environment variables from a Node.js module
    // -------------------------------------------------------------------------

    if (this.require) {
      const dynamicRequire = (createRequire || createRequireFromPath)(cwd);
      const topLevelCwd = project.topLevelWorkspace.cwd;
      const pnpFilenames = ["./.pnp.js", "./.pnp.cjs"];

      if (project.topLevelWorkspace.manifest.type === "module") {
        pnpFilenames.reverse();
      }

      for (const pnpFilename of pnpFilenames) {
        const pnpPath = ppath.resolve(topLevelCwd, pnpFilename as PortablePath);
        if (await xfs.existsPromise(pnpPath)) {
          dynamicRequire(pnpPath).setup();
          break;
        }
      }

      dynamicRequire(dynamicRequire.resolve(this.require, { paths: [cwd] }));
    }

    if (!this.bucket) {
      this.bucket = process.env.PKG_BUCKET;
    }

    //
    // Validates and sanitizes user input
    // -------------------------------------------------------------------------

    if (!this.bucket) {
      throw new UsageError(
        "Need to pass a cloud storage bucket, e.g. --bucket=gs://pkg.example.com",
      );
    }

    if (this.files.length === 0) {
      throw new UsageError("Need to pass the list of files.");
    }

    const bucket = sanitizeBucket(this.bucket);

    //
    // Uploads source files to a cloud storage bucket
    // -------------------------------------------------------------------------

    for (const file of this.files) {
      const [source, target] = parseSource(file, this.version);
      const sourcePath = ppath.resolve(cwd, source as PortablePath);
      const targetPath = `${bucket}${target}`;
      const exists = await xfs.existsPromise(sourcePath);

      if (!exists) {
        throw new Error(`File not found: ${source}`);
      }

      this.context.stdout.write(`${source} -> ${targetPath}${os.EOL}`);

      const exitCode = await new Promise<number>((resolve, reject) => {
        spawn("gsutil", ["cp", source, targetPath], {
          cwd: npath.fromPortablePath(cwd),
          stdio: [this.context.stdin, this.context.stdout, this.context.stderr],
        })
          .on("error", (err: Error) => {
            reject(err);
          })
          .on("close", (exitCode: number) => {
            resolve(exitCode);
          });
      });

      if (exitCode !== 0) {
        return exitCode;
      }
    }
  }
}

const plugin: Plugin = {
  commands: [PushCommand],
};

export default plugin;
