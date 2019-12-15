'use strict'

let users = [];

let findUserToken = (token, name) => {
    console.log(name);
    console.log(token);
    const result = users.find(user => user.name === name)
    if (result === undefined) {
        return false;
    }
    if (result.token === token) {
        return true;
    } else {
        return false;
    }
    //console.log("Result: " + result.token);
};

let addUser = (user) => {
    users.push(user);
    console.log(users);
};

let deleteUser = (user) => {
    users.splice(users.indexOf(user), 1);   
};

exports.addUser = addUser;
exports.deleteUser = deleteUser;
exports.findUserToken = findUserToken;