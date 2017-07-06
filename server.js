	var express = require('express');
	var mysql = require('mysql');
	var multer = require('multer');
	var fs = require('fs');

	var app = new express();

	app.use(express.static('public'));

	var connection = mysql.createConnection({
		host:'localhost',
		user:'root',
		password:'vrentin',
		database:'practice'
	});
	connection.connect();

	var storage = multer.diskStorage({
	    destination: function (req, file, cb) {
	        cb(null, './public/uploads')
	    },
	    filename: function (req, file, cb) {
	    	// console.log(file)
	        cb(null, file.originalname)
	  }
	})
	 
	var upload = multer({ storage: storage })

	var createUser = function(req, res){
		var body = req.body;
		var file = req.file;
		connection.query('SELECT * FROM userdetails', function(err, result){
			if(!err){
				connection.query('INSERT into userdetails set ?',{username: body.username, age: +body.age, dob: body.dob ,profilepicture: file.path}, function(err, result){
					if(!err){
						return res.redirect("/");
					}
				});
			}else{
				connection.query('CREATE TABLE userdetails ( id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, username VARCHAR(255), age INT(11), dob DATE, profilepicture VARCHAR(1000),PRIMARY KEY (id))', function(err, result){
					if(!err){
						connection.query('INSERT into userdetails set ?',{username: body.username, age: +body.age, dob: body.dob ,profilepicture: file.path}, function(err, result){
							if(!err){
								return res.redirect("/");
							}
							else{
								res.send(err);
							}
						});
					}
					else{
						console.log(err);
					}
				});
				// res.send(err);
			}
		});
	};

	var allUsers = function(req, res){
		connection.query('SELECT * FROM userdetails', function(err, result, fields){
			if(!err){
				// console.log(result);
				res.send(result);
			}
			else{
				res.send(err);
			}
		});
	};

	var update = function(req, res){
		var file = req.file;
		var body = req.body;
		if(req.file == undefined){
			connection.query('UPDATE userdetails set username = ?, age = ?, dob = ? WHERE id = ?',[body.username, +body.age, body.dob, +body.id],function(err, result){
				if(!err){

					return res.redirect("/");
				}else{
					res.send(err);
				}
			});
		}
		else{
			connection.query('UPDATE userdetails set username = ?, age = ?, dob = ?, profilepicture = ? WHERE id = ?',[body.username, +body.age, body.dob, file.path, +body.id],function(err, result){
				if(!err){
					return res.redirect("/");
				}else{
					res.send(err);
				}
			});
		}
		
	};

	var deleteUser = function(req, res){
		var id = req.query.id;
		var src = req.query.src;
		src = 'public'+src;
		src = src.replace(/\\/g,"/");
		connection.query('DELETE FROM userdetails WHERE id= ?', +id, function(err, result){
			if(!err){
				fs.unlink(src, function(err){
					if(err){
						return console.error(err);
					}
				});
			}
			res.send(err);
		});
		// fs.unlink();
	};

	/* GET home page. */
	app.get('/profile', function(req, res, next) {
	  	res.send("GET /profile");
	});

	app.post('/profile', upload.single('profileImage'),function(req, res) {
		createUser(req, res);
	});
	 
	app.get('/allusers', function(req, res){
		allUsers(req, res);
	});

	app.post('/update', upload.single('profileImage'), function(req, res){
		update(req, res);
	});

	app.get('/deleteuser', function(req, res){
		deleteUser(req, res);
	});

	app.get('/test', function(req, res){
		fs.unlink('public\\uploads\\99.jpg', function(err){
			if(!err){
				res.send("Hurray");
			}
			else{
				res.send(err);
			}
		});
	})
	// app.post('/deleteuser', function(req, res){
	// 	deleteUser(req, res);
	// });

	app.listen('1337');