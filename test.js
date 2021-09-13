const curl = require('./main.js')

curl('https://www.google.com', r => {
	if (r.headers.statusCode == 200) {
		console.log("Simple Google ping test passed")
	}
})