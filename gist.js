"use strict";

var Q = require('q');
var _ = require('lodash');

var TOKEN_NOTE = 'this token for SVALKA app';
var GIST_DESCRIPTION = 'UNIQUE DUMP DESCRIPTION';
var GIST_DEFAULT_FILE_NAME = 'svalka.txt'; 

var github;

module.exports = function(_github){
	github = _github;

	return {
		auth: auth,
		authBasic: authBasic,
		createToken: createToken,
		getAllTokens: getAllTokens,
		deleteToken: deleteToken,
		restoreToken: restoreToken,
		getList: getList,
		createGist: createGist,
		appendGist: appendGist
	};
};

function auth(token){
	return github.authenticate({
	    type: "oauth",
	    token: token
	});
}

function authBasic(name, password){
	return github.authenticate({
	    type: "basic",
        username: name,
        password: password
	});
}

function getAllTokens(github){
	var defer = Q.defer();
	github.authorization.getAll({},function(err, data){
		if(err){
            console.log('err', err)
            defer.reject(err)
        }else{
        	defer.resolve(data);
        }
    });
	return defer.promise;
}

function createToken(github){
	var defer = Q.defer();
	github.authorization.create({
		    scopes: ["gist"],
		    note: TOKEN_NOTE,
		    headers: {
		        "X-GitHub-OTP": "two-factor-code"
		    }
		},function(err, data){
		if(err){
            console.log('err', err)
            defer.reject(err)
        }else{
        	defer.resolve(data.token);
        }
    });
	return defer.promise;
}

function deleteToken(id){
	var defer = Q.defer();
	github.authorization.delete({id:id},function(err, data){
		defer.resolve();
	})
	return defer.promise;
}

function restoreToken(name, password){
	authBasic(name, password)

	return getAllTokens(github)
	    .then(function(data){
	        var token = _.find(data,{note: TOKEN_NOTE});
	        return token;
	    })
	    .then(function(token){
	        if(token && token.id){
	            return deleteToken(token.id);
	        }
	    })
	    .then(function(){
	        return createToken(github);
	    });
}


function getList(github){
	var defer = Q.defer();
	github.gists.getAll({},function(err, list) {
        if(err){
            console.log('err', err)
            defer.reject(err)
        }else{
        	defer.resolve(list);
        }
    });
	return defer.promise;
}

function createGist(content, fileName){
	var defer = Q.defer();
	fileName = fileName || GIST_DEFAULT_FILE_NAME;
	var files = {};
	files[fileName] = {content: content};
	github.gists.create({
		description: GIST_DESCRIPTION,
		public: false,
		files:files
	}, function(err, data){
		if(err){
            console.log('err', err)
            defer.reject(err)
        }else{
        	defer.resolve(content);
        }
	});
	return defer.promise;
}

function getGist(id){
	var defer = Q.defer();
	github.gists.get({id:id}, function(err, data){
		if(err){
            console.log('err', err)
            defer.reject(err)
        }else{
        	defer.resolve(data);
        }
	});
	return defer.promise;
}

function editGist(msg){
	var defer = Q.defer();
	github.gists.edit(msg, function(err, data){
		if(err){
            console.log('err', err)
            defer.reject(err)
        }else{
        	defer.resolve(data);
        }
	});
	return defer.promise;
}

function appendGist(content, fileName){

	fileName = fileName || GIST_DEFAULT_FILE_NAME;
	return getList(github)
		.then(function(list){
		    var one = _.find(list, {description: GIST_DESCRIPTION});
		    return one;
		})
		.then(function(gist){
		    if(gist && gist.id){
		        return getGist(gist.id)
			        .then(function(gist){
					    var files = {};
					    content = gist.files[fileName].content + '\n\n' + content;
					    files[fileName] = {content: content};

					    return editGist({
					        id: gist.id,
					        description:GIST_DESCRIPTION,
					        public: false,
					        files:files
					    });
					});
		    }else{
		        return createGist(content, fileName);
		    }
		});
}