### How to setup the CLI:

- Run `npm install`
- Run `npm run build`
- Run `npm link`

You can now use the CLI on any local directory. Use `mockify` to see all available commands.

### Important notes

- Do not remove the `#!/usr/bin/env node` line from the index.
- If you want to create more commands, you can do so by following the `inquirer` and `commander` documentations.
- Make sure you run `npm run build` after every change in your TypeScript files.
- You don't have to run the `npm link` command again, for example after a build. If you want to unlink it, you can run `npm unlink -g`.
