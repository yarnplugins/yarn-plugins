import os from "os";
import spawn from "cross-spawn";
import { Configuration, Project, CommandContext, Plugin } from "@yarnpkg/core";
import { PortablePath, ppath, xfs } from "@yarnpkg/fslib";
import { Command, UsageError } from "clipanion";

type Location = {
  name: PortablePath;
  source: PortablePath;
  target: string;
};

export class PushCommand extends Command<CommandContext> {
  static usage = Command.Usage({
    description: "Uploads packages to a cloud storage bucket.",
  });

  @Command.String(`--bucket`)
  bucket: string = process.env.PKG_BUCKET || "";

  @Command.String(`--version`)
  version: string = os.userInfo().username;

  @Command.Rest()
  files: PortablePath[] = [];

  @Command.Path(`push`)
  async execute(): Promise<number | undefined> {
    const { cwd } = this.context;
    const configuration = await Configuration.find(cwd, null);
    const { workspace } = await Project.find(configuration, this.context.cwd);

    if (!this.bucket) {
      throw new UsageError(
        "Need to pass a cloud storage bucket, e.g. --bucket=gs://pkg.example.com",
      );
    }

    const bucket = this.bucket.includes("://")
      ? this.bucket.endsWith("/")
        ? this.bucket
        : `${this.bucket}/`
      : this.bucket.endsWith("/")
      ? `gs://${this.bucket}`
      : `gs://${this.bucket}/`;

    if (!bucket.startsWith("gs://")) {
      throw new Error(
        "Only Google Cloud Storage buckets are supported at this moment.",
      );
    }

    if (this.files.length === 0) {
      throw new UsageError("Need to pass the list of files.");
    }

    const files: Location[] = [];

    for (const file of this.files) {
      const source = ppath.resolve(file);
      const exists = await xfs.existsPromise(source);

      if (!exists) {
        throw new Error(`File not found: ${source}`);
      }

      if (!workspace || !workspace.manifest.name) {
        throw new Error("Failed to read package.json");
      }

      const extname = ppath.extname(file);
      const basename = ppath.basename(file).slice(0, -extname.length);
      const target =
        this.files.length === 1
          ? `${workspace.manifest.name.name}_${this.version}${extname}`
          : `${workspace.manifest.name.name}_${basename}_${this.version}${extname}`;

      files.push({ name: file, source, target: `${bucket}${target}` });
    }

    for (const { name, source, target } of files) {
      this.context.stdout.write(`${name} -> ${target}${os.EOL}`);

      const exitCode = await new Promise<number>((resolve, reject) => {
        spawn("gsutil", ["cp", source, target], {
          cwd: this.context.cwd,
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
