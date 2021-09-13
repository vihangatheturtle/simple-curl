# simple-curl
A simple fetch-like CURL wrapper for NodeJS.

## Usage
```javascript
const curl = require('simple-curl')

curl('https://google.com', {
	headers: {
		'test': 'working'
	},
}, r => {
	console.log(r.headers)
	console.log(r.body)
});
```

If a body is provided, it won't be considered unless the method has been set as `POST`
```javascript
const curl = require('simple-curl')

curl('https://google.com', {
	method: 'POST',
	headers: {
		'test': 'working'
	},
	body: 'test'
}, r => {
	console.log(r.headers)
	console.log(r.body)
});
```