var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ldap = require("ldapjs")

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const e = require('express');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var client = ldap.createClient({
    url : 'ldap://127.0.0.1:10389'
    // url : 'ldap://10.250.200.176:389'
})

function authenticateDN(username, password) {
    client.bind(username, password, function(err){
        if (err) {
            console.log("Error in Connection",{
                name : err.name,
                code : err.code,
                message : err.message
            });
        } else {
            console.log("Success");
            searchUser()
            // addUser()
            // deleteUser()
            // addToGroup('cn=Administrators,ou=groups,ou=system')
            // deleteUserFromGroup('cn=Administrators,ou=groups,ou=system')
            // updateUserFromGroup('cn=foo,ou=users,ou=system')
            // compare('cn=foo,ou=users,ou=system')
            // modifyDN('cn=jane,ou=users,ou=system')
        }
    })
}

function searchUser(){
    const opts = {
        // filter: '(&(cn=*)(sn=john))',
        filter: '(cn=*)',
        scope: 'sub',
        attributes: ['sn', 'cn']
    };

    client.search('ou=users,ou=system', opts, (err, res) => {
        if (err) {
            console.log("Error in Search",{
                name : err.name,
                code : err.code,
                message : err.message
            });
        } 
        res.on('searchRequest', (searchRequest) => {
          console.log('searchRequest: ', searchRequest.messageID);
        });
        res.on('searchEntry', (entry) => {
          console.log('entry: ' + JSON.stringify(entry.object));
        });
        res.on('searchReference', (referral) => {
          console.log('referral: ' + referral.uris.join());
        });
        res.on('error', (err) => {
          console.error('error: ' + err.message);
        });
        res.on('end', (result) => {
          console.log('status: ' + result.status);
        });
      });
}


function addUser(){
    const entry = {
        // cn: 'foo',
        sn: 'bar',
        // email: ['foo@bar.com', 'foo1@bar.com'],
        objectclass: 'inetOrgPerson'
      };
      client.add('cn=foo,ou=users,ou=system', entry, (err) => {
        if (err) {
            console.log("error in user:", err);
        } else {
            console.log("Success Add User");
        }
      });
}

function deleteUser(){
    client.del('cn=foo,ou=users,ou=system', (err) => {
        if (err) {
            console.log("error from delete user", {
                code : err.code,
                name : err.name,
                message : err.message
            });
        } else {
            console.log("Success Delete User");
        }
    });
}

function addToGroup(groupname) {
    const change = new ldap.Change({
        operation: 'add',
        modification: {
          uniqueMember : 'cn=foo,ou=users,ou=system'
        }
      });
      
      client.modify(groupname, change, (err) => {
        if (err) {
            console.log("error from add user to a group", {
                code : err.code,
                name : err.name,
                message : err.message
            });
        } else {
            console.log("Success add User to a group");
        }
      });
}


function deleteUserFromGroup(groupname){
    const change = new ldap.Change({
        operation: 'delete',
        modification: {
          uniqueMember : 'cn=foo,ou=users,ou=system'
        }
      });
      
      client.modify(groupname, change, (err) => {
        if (err) {
            console.log("error from delete user from a group", {
                code : err.code,
                name : err.name,
                message : err.message
            });
        } else {
            console.log("Success delete User from a group");
        }
      });
}

function updateUserFromGroup(dn){
    const change = new ldap.Change({
        operation: 'replace',
        // operation: 'add',
        modification: {
          displayName : '521'
        }
      });
      
      client.modify(dn, change, (err) => {
        if (err) {
            console.log("error from update group", {
                code : err.code,
                name : err.name,
                message : err.message
            });
        } else {
            console.log("Success update group");
        }
      });
}

function compare(dn){
    client.compare(dn, 'sn', 'bar', (err, matched) => {
        if (err) {
            console.log("error from compare", {
                code : err.code,
                name : err.name,
                message : err.message
            });
        } else {
            console.log('matched: ' + matched);
        }
      });
}

function modifyDN(dn){
    client.modifyDN(dn, 'cn=jill', (err) => {
        if (err) {
            console.log("error from modifyDN", {
                code : err.code,
                name : err.name,
                message : err.message
            });
        } else {
            console.log("success modifyDN");
        }
    });
}

authenticateDN("uid=admin,ou=system","secret")

module.exports = app;
