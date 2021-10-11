const fs = require("fs");
const ospath = require("os");

module.exports = {
  devServer: {
    https: {
      cert: fs.readFileSync(`${ospath.homedir()}/web-certs/localhost-cert.pem`),
      key: fs.readFileSync(`${ospath.homedir()}/web-certs/localhost-key.pem`),
    },
    port: 8080,
  },
};
