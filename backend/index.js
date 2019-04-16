var express = require("express")
var app = express()
let arp = require('node-arp')

app.listen(80, '0.0.0.0', () => {
  console.log("Server running on port 80")
})

app.use(express.static('../portal/build'))

app.get("/mac", (req, res, next) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  arp.getMAC(ip, function(err, mac) {
    res.json({"ip": ip, "mac": mac})
  })
})

let interval = setInterval(() => console.log("Check expired MAC address connections ... TODO"), 5000)
