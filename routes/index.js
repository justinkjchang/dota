/* GET home page. */
exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

// need route middleware to ensure user is logged in