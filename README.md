# Community Plugins for Yarn v2 (Berry)

This is a community maintained repository with various Yarn v2 [plugins](https://yarnpkg.com/features/plugins).

#### :rocket: `plugin-bundle` ([source](./plugin-bundle), [history](../../commits/main/plugin-bundle/bundles/@yarnpkg/plugin-bundle.js))

#### :rocket: `plugin-deduplicate` ([source](https://github.com/eps1lon/yarn-plugin-deduplicate), [history](https://github.com/eps1lon/yarn-plugin-deduplicate/commits/latest/bundles/@yarnpkg/plugin-deduplicate.js))

#### :rocket: `plugin-push` ([source](./plugin-push), [history](../../commits/main/plugin-push/bundles/@yarnpkg/plugin-push.js))

#### :rocket: `plugin-echo-execute` ([source](https://github.com/leaumar/yarn-plugin-echo-execute), [history](https://github.com/leaumar/yarn-plugin-echo-execute/commits/master/bundles/%40yarnpkg/plugin-echo-execute.js))

### How to Install

Ensure that you're using the latest version of Yarn v2 then install any plugin from the list above by running:

```
$ yarn plugin import https://yarnplugins.com/{name}
```

Where `{name}` is the name of the plugin you want to install (_without_ `plugin-`). For example:

```bash
$ yarn plugin import https://yarnplugins.com/bundle
```

### References

- [Yarn Plugin Tutorial](https://yarnpkg.com/advanced/plugin-tutorial)

### How to join

Open an issue on this repository and ask to be onboarded. Provide relevant information about your plugin like its purpose and sources URL.

Your repo may be merged into this one (like `plugin-bundle`), or may stay separate (like `plugin-deduplicate`). Having your repo on GitHub is preferred but not strictly necessary, discussion can be had.

yarn-plugins.com works by HTTP-redirecting\* an enduser's Yarn from the site's convenient URLs (`https://yarnplugins.com/x`) to the plugin script file hosted within each repo (`https://raw.githubusercontent.com/user/repo/.../plugin-x.js`). For this reason, you need to be able to permalink your "latest" runnable script. You may be able to achieve this with a build job artifact or release package, but for simpler plugins it might be more proportional to simply commit your artifact next to its sources and use its live repo link.

\*Redirections are managed privately outside this repository. If your plugin is located outside of this repository, give your permalink to the project maintainer.
