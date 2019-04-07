function message(phone, messBody) {
    var unirest = require("unirest");

var req = unirest("GET", "https://www.fast2sms.com/dev/bulk");

req.query({
  "authorization": "j4qN5V68iwZp7ScGLEyoUFduJ3kCtTrQAhIMsx1l2afWnOKeYD5ciXK1swQSL2WvkYaCquRA8gd0ZIoH",
  "sender_id": "FSTSMS",
  "message": `
    <h2>${messBody.name}</h2>
    <h3>${messBody.text}</h3>
  `,
  "language": "english",
  "route": "p",
  "numbers": phone,
});

req.headers({
  "cache-control": "no-cache"
});


req.end(function (res) {
  if (res.error) throw new Error(res.error);

  console.log(res.body);
});
}

messBody = {
    name: 'Pavan',
    text: 'Test message'
}
message(8553562168, messBody);