// get login page
exports.login = function(req, res){
	res.render('login', { title : 'Login'});
};