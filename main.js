const { exec } = require("child_process");
const { PerformanceObserver, performance } = require('perf_hooks');
const fs = require("fs");

function sanitizeInput(d) {
    d = d.split("$").join("")
    d = d.split('"').join("")
    return d
}

function main(url, options, cb) {
	if (!url.startsWith("http")) return cb({
		error: true,
		message: "URL formatted incorrectly"
	});
    url = sanitizeInput(url)
	if (typeof options == "function") {
		cb = options;
	}
	var vop = false;
	try {
		_ = JSON.stringify(options)
		vop = true;
	} catch { }
    cmdname = 'curl-win.exe'
	if (process.platform != 'win32') {
		cmdname = 'curl'
	}
	scmd = __dirname + '\\' + cmdname
	if (!fs.existsSync(__dirname + '\\' + cmdname)) {
		scmd = 'curl'
	}
	cmdBldr = [scmd];
	cmdBldr.push('"' + url + '"')
	if (vop) {
		try {
			if (options["headers"]) {
				for (i=0; i<Object.keys(options["headers"]).length; i++) {
					key = sanitizeInput(Object.keys(options["headers"])[i])
					val = sanitizeInput(options["headers"][Object.keys(options["headers"])[i]]);
					cmdBldr.push('-H "' + key + ': ' + val + '"')
				}
			}
		} catch { }
		if (!options["method"]) {
			options["method"] = "GET"
		}
		if (!options["nohead"]) {
			options["nohead"] = false
		}
		options["method"] = options["method"].toUpperCase();
		if (options["body"] && options["method"] !== "GET") {
			cmdBldr.push('--data-raw "' + options["body"] + '"')
		}
	}
	if (!options['nohead'])
		cmdBldr.push('-i')
	cmdBldr.push('-X ' + options["method"])
	console.log(cmdBldr.join(' '))
	exec(cmdBldr.join(' '), (error, stdout, stderr) => {
		if (!options['nohead']) {
			var raw = stdout.split('\r').join('')
			var resSpl = raw.split('\r').join('').split(/\n\s*\n/)
			var offset = 0
            console.log(resSpl)
			if (resSpl[1].split('\n')[0].includes('HTTP/')) {
				offset = 1
			}
			var headers = resSpl[0 + offset]
			var body = raw.split(resSpl[0 + offset])[1]
			var httpType = 'HTT' + headers.split('HTT')[1].split(' ')[0]
			var resCode = parseInt(headers.split('HTT')[1].split(' ')[1])
			var resCodeStatus = headers.split('HTT')[1].split(' ')[1] + headers.split(resCode)[1].split('\n')[0]
			var headersNoHTTP = headers.split(httpType + " " + resCodeStatus)[1]
			var setCookieJar = {}
			var headersFormatted = {}
			var methodRes = {}
			
			for (i=0; i<headersNoHTTP.split('\n').length; i++) {
				key = headersNoHTTP.split('\n')[i].split(': ')[0].split('-').join('')
				val = headersNoHTTP.split('\n')[i].split(': ')[1]
				if (key != "") {
					if (key == "SetCookie") {
						setCookieJar[val.split('=')[0]] = val.split(val.split('=')[0] + "=")[1].split(' ')[0].replace(';', '')
					} else {
						headersFormatted[key] = val
					}
				}
			}
			
			headersFormatted['SetCookie'] = setCookieJar
			headersFormatted['Status'] = resCodeStatus
			methodRes['headers'] = headersFormatted
			methodRes['body'] = body
			methodRes['statusCode'] = resCode
			methodRes['statusStr'] = resCodeStatus
			methodRes['offset'] = offset
			
			cb(methodRes)
		} else {
			cb({'body': stdout})
			console.log(cmdBldr.join(' '))
		}
	});
}

module.exports = main;
