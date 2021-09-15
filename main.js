const { exec } = require("child_process");

function main(url, options, cb) {
	if (typeof options == "function") {
		cb = options;
	}
	var vop = false;
	try {
		_ = JSON.stringify(options)
		vop = true;
	} catch { }
	cmdBldr = [__dirname + '\\curl'];
	cmdBldr.push('"' + url + '"')
	if (vop) {
		if (options["headers"]) {
			for (i=0; i<Object.keys(options["headers"]).length; i++) {
				key = Object.keys(options["headers"])[i]
				val = options["headers"][Object.keys(options["headers"])[i]];
				cmdBldr.push('-H "' + key + ': ' + val + '"')
			}
		}
		if (!options["method"]) {
			options["method"] = "GET"
		}
		options["method"] = options["method"].toUpperCase();
		if (options["body"] && options["method"] !== "GET") {
			cmdBldr.push('--data-raw "' + options["body"] + '"')
		}
	}
	cmdBldr.push('-i')
	cmdBldr.push('-X ' + options["method"])
	exec(cmdBldr.join(' '), (error, stdout, stderr) => {
		var raw = stdout.split('\r').join('')
		var resSpl = raw.split('\r').join('').split(/\n\s*\n/)
		var offset = 0
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
	});
}

module.exports = main;