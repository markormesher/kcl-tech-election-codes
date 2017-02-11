var crypto = require('crypto');
var https = require('https');
var emails = require('./emails');
var secrets = require('./secrets');

// SHA-256 helper
function sha256(data) {
	return crypto.createHash('sha256').update(data).digest('hex');
}

// array shuffle helper (Fisher-Yates shuffle algorithm)
function shuffle(arr) {
	for (var i = arr.length - 1; i > 0; --i) {
		var j = Math.floor(Math.random() * (i + 1));
		var tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
}

// generate unique codes
console.log('Generating codes...');
var codes = [];
while (codes.length != emails.length) {
	var candidate = sha256('' + Math.random()).substr(0, 16);
	if (codes.indexOf(candidate) == -1) {
		codes.push(candidate);
	}
}

// print code list
console.log(JSON.stringify(codes, null, 4));

// shuffle codes before sending
shuffle(codes);

// boring email options
var sendgridOptions = {
	'host': 'api.sendgrid.com',
	'path': '/v3/mail/send',
	'method': 'POST',
	'headers': {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + secrets.SENDGRID_API_KEY
	}
};

// static email data
var data = {
	'personalizations': [],
	'from': {
		'name': 'Mark Ormesher',
		'email': 'me@markormesher.co.uk'
	},
	'content': [{
		'type': 'text/plain',
		'value': 'Your code is %code%'
	}]
};

// populate email data
for (var i = 0; i < emails.length; ++i) {
	data['personalizations'].push({
		'to': [ { 'email': emails[i] } ],
		'substitutions': { '%code%': codes[i] },
		'subject': 'Your KCL Tech election code'
	});
}

// make the request
console.log('Sending emails...');
var req = https.request(sendgridOptions, function(res) {
	console.log('Emails sent!');
});
req.write(JSON.stringify(data));
req.end();
