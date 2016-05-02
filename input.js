var readline = require('readline');
var Q = require('q');

module.exports = {
  getCredentials: getCredentials
}

function getCredentials(){
  var defer = Q.defer();
  var credentials = {};

  var rl = readline.createInterface(process.stdin, process.stdout);

  rl.setPrompt('GitHub auth login: ');
  rl.prompt();

  rl.on('line', (line) => {
    if(!credentials.name){
      credentials.name = line.trim();
      rl.setPrompt('password: ');
      rl.prompt(false);
    } else if(!credentials.password){
      credentials.password = line.trim();
      defer.resolve(credentials);
      rl.close();
    }
  }).on('close', () => {
    defer.reject();
  });

  return defer.promise;
}

