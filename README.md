npm install
npm run build
npm link

use shop to see all available commands

Do not remove the #!/usr/bin/env node line from the index.
If you want to create more commands, you can do so by following the inquirer and commander documentations. 
Make sure you run npm run build after every change to your typescript files.
You don't have to run the npm link command again, for example after a build. If you want to unlink it, you can run npm unlink -g.