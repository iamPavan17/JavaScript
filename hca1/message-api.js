
(function () {
  var unirest = require("unirest");

  var req = unirest("GET", "https://www.fast2sms.com/dev/bulk");
  
  req.query({
    "authorization": "j4qN5V68iwZp7ScGLEyoUFduJ3kCtTrQAhIMsx1l2afWnOKeYD5ciXK1swQSL2WvkYaCquRA8gd0ZIoH",
    "sender_id": "FSTSMS",
    "message": "Test",
    "language": "english",
    "route": "p",
    "numbers": 8553562168,
  });
  
  req.headers({
    "cache-control": "no-cache"
  });
  

  req.end(function (res) {
    if (res.error) throw new Error(res.error);
  
    console.log(res.body);
  });
})();
