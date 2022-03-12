module.exports = (args) => {
	var obj = {}
	args.filter((arg) => arg.substring(0, 2) === '--').forEach(
		(arg) => (obj[arg.split('=')[0].replace('--', '')] = arg.split('=')[1])
	)
	return obj
}
