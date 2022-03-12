// shipitfile.js

// Ejemplo de comando
// npx shipit staging deploy --name=athoz-backend --type=<react || node> --repo=git@github.com:htorohn/athoz-backend.git
// --branch=main --server=deploy@e8cb74f.online-server.cloud

module.exports = (shipit) => {
	// Load shipit-deploy tasks
	require('shipit-deploy')(shipit)
	require('shipit-shared')(shipit)
	const parseArg = require('./parseArgs')
	const params = parseArg(process.argv)

	console.log('params: ', params)

	shipit.initConfig({
		default: {
			deployTo: `/var/www/${params.name}`,
			repositoryUrl: params.repo, //'git@github.com:htorohn/athoz-backend.git',
			branch: params.branch, //'main',
			keepReleases: 3,
			shared: {
				dirs: ['node_modules'],
				overwrite: true,
			},
		},
		staging: {
			servers: params.server, //'deploy@e8cb74f.online-server.cloud',
		},
	})

	//hacemos el install de los modulos del proyecto
	shipit.blTask('npm:install', async () => {
		if (params.type === 'node')
			await shipit.remote(
				`cd ${shipit.releasePath} && npm install --production`
			)
		if (params.type === 'react') {
			await shipit.remote(
				`cd ${shipit.releasePath} && npm install --production && npm run build`
			)
		}
	})

	//reiniciamos el proceso para que tome la nueva version
	shipit.blTask('server:restart', async () => {
		// const command = 'forever restartall'
		// await shipit.remote(`cd ${shipit.config.deployTo} && ${command}`)
		await shipit.remote(`pm2 restart ${params.name}`)
	})

	shipit.on('updated', () => {
		shipit.start('npm:install')
	})

	shipit.on('published', () => {
		shipit.start('server:restart')
	})
}
