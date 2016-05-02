var GitHubApi = require('github');
var _ = require('lodash');

var input = require('./input');
var fs = require('fs');
var Q = require('q');
var ncp = require("copy-paste");

var gist = require('./gist')(new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    timeout: 5000,
    headers: {
        "user-agent": "Svalka-App"
    }
}));

var content = ncp.paste()

if(content){
    auth().then(function(){

        return gist.appendGist(content).then(function(gist){
            console.log('---SUCCESFULY SAVED---',gist)
        });
    });
}


function auth(){
    var defer = Q.defer();
    var tokenFileName = './token';
    fs.exists(tokenFileName, function(exists) {
        if(exists){
            var token = fs.readFileSync(tokenFileName,{encoding:'utf8'});
            gist.auth(token);
            defer.resolve();
        }else{
            input.getCredentials()
                .then(function(credentials){
                    return gist.restoreToken(credentials.name, credentials.password);
                })
                .then(function(token){
                    fs.writeFileSync(tokenFileName, then);
                    return token;
                }) 
                .then(function(token){
                    gist.auth(token);
                    defer.resolve();
                });       
        }

    });

    return defer.promise;
}