var express = require('express');
var app = require('../app');

// get signup page
exports.signup = function(req, res){
	res.render('signup', { title : 'Create Account'});

};
