import { Command } from "clipanion";
import {
  Configuration,
  Project,
  CommandContext,
  StreamReport,
  Plugin,
} from "@yarnpkg/core";
import { WorkspaceRequiredError } from "@yarnpkg/cli";
import {
  Filename,
  PortablePath,
  ZipFS,
  JailFS,
  ppath,
  xfs,
} from "@yarnpkg/fslib";
import { getLibzipPromise } from "@yarnpkg/libzip";

class BundleCommand extends Command<CommandContext> {
  @Command.Path("bundle")
  async execute(): Promise<0 | 1> {
    const configuration = await Configuration.find(
      this.context.cwd,
      this.context.plugins,
    );
    const { project, workspace } = await Project.find(
      configuration,
      this.context.cwd,
    );

    if (!workspace) {
      throw new WorkspaceRequiredError(project.cwd, this.context.cwd);
    }

    const target = ppath.resolve(workspace.cwd, "package.zip" as Filename);

    const report = await StreamReport.start(
      {
        configuration,
        stdout: this.context.stdout,
      },
      async (report) => {
        report.reportJson({ base: workspace.cwd });

        const libzip = await getLibzipPromise();
        const zipFs = new ZipFS(target, { create: true, libzip });
        const cwdFs = new JailFS(workspace.cwd);

        const yarnRc = ".yarnrc.yml" as PortablePath;
        const yarnPath = configuration.get("yarnPath");
        const yarnPathRel = ppath.relative(project.cwd, yarnPath);

        report.reportInfo(null, yarnPathRel);
        report.reportJson({ location: yarnPathRel });
        zipFs.mkdirSync(".yarn" as PortablePath);
        zipFs.mkdirSync(".yarn/releases" as PortablePath);
        const yarnContent = xfs.readFileSync(yarnPath as PortablePath);
        zipFs.writeFileSync(yarnPathRel, yarnContent);

        const entries = ["lib", "package.json"];

        while (entries.length > 0) {
          const entry = entries.shift() as PortablePath;
          const stat = cwdFs.lstatSync(entry);

          if (stat.isDirectory()) {
            zipFs.mkdirSync(entry);
            cwdFs.readdirSync(entry).forEach((file) => {
              entries.unshift(ppath.join(entry, file));
            });
          } else {
            report.reportInfo(null, entry);
            report.reportJson({ location: entry });
            const file = ppath.resolve(workspace.cwd, entry);

            if (entry === "package.json") {
              const pkg = JSON.parse(xfs.readFileSync(file, "utf8"));
              delete pkg.devDependencies;
              delete pkg.peerDependencies;
              delete pkg.bundledDependencies;
              delete pkg.jest;
              Object.keys(pkg)
                .filter((key) => key.endsWith("Config"))
                .forEach((key) => {
                  delete pkg[key];
                });
              if (pkg.main && pkg.scripts?.start) {
                pkg.scripts.start = `node ${pkg.main}`;
              }
              Object.keys(pkg.scripts || {}).forEach((key) => {
                if (!(key === "start" || key === "postinstall")) {
                  delete pkg.scripts[key];
                }
              });
              const content = JSON.stringify(pkg, null, "  ");
              zipFs.writeFileSync(entry, content, "utf8");
            } else {
              const content = xfs.readFileSync(file);
              zipFs.writeFileSync(entry, content);
            }
          }
        }

        report.reportInfo(null, yarnRc);
        report.reportJson({ location: yarnRc });
        zipFs.writeFileSync(yarnRc, `yarnPath: ${yarnPathRel}\n`, "utf8");

        zipFs.saveAndClose();
      },
    );

    return report.exitCode();
  }
}

const plugin: Plugin = {
  commands: [BundleCommand],
};

export default plugin;
