var express = require('express');
var app = express();
var mysql = require('mysql');
var fs = require('fs');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
// const nodemailer = require('nodemailer');

// links
app.use(express.static(__dirname));


// This connects the script to the database, without this, the database wouldn't be updated or anything at all
function connection(){
   var con=mysql.createConnection({host:"jons-sql.mysql.database.azure.com",
   user:"Jons", password:"Passord1", database:"fitness_db", port:3306,
   ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});
   return con;
}


// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


const oneDay = 1000 * 60 * 60 * 24; // calculate one day


// express app should use sessions
app.use(sessions({
   secret: "Passord1",
   saveUninitialized: true,
   cookie: {maxAge: oneDay},
   resave: false
}))


// set the view engine to ejs
app.set('view engine', 'ejs');


// a variable to save a session
var session;


// Get the index site. If not logged in, send to login.ejs. If logged in, send to index.ejs
app.get('/', function (req, res) {
   session=req.session;
   if(session.userid){
      con = connection();
      var person_nr = session.userid;
      var sql = "SELECT * FROM user WHERE person_nr = ?"
      con.query(sql, person_nr, function (err, result, fields){

         if (err) throw err;
         console.log(result);
         var innhold = "";
         res.render('index.ejs', {
            userid: session.userid,
            data: result,
            innhold: innhold
         });
      });   

   }
   else {
      res.render('login.ejs',{});
   }
})


// Destroys the session and sends you to the login.ejs
app.get('/logout', function(req, res) {
   req.session.destroy();
   res.render('login.ejs', {
   });
})


// Get's the /login and renders login.ejs
app.get('/login', function(req, res) {
   res.render('login.ejs',{});
})

// Posts the login.ejs file. Without this the login.ejs wouldn't be able to connect to the database
app.post('/login', function(req, res) {
   
   // hent brukernavn og passord fra skjema på login
   var email = req.body.email
   var passord = req.body.passord
   
   console.log(email, passord);
   
   // perform the MySQL query to check if the user exists
   var sql = 'SELECT * FROM user WHERE email =? AND passord =?';
   
   con = connection();
   con.query(sql, [email, passord], (error,results) => {
      if(error) {
         res.status(500).send('Internal Server Error');
      } else if(results.length === 1){
         session = req.session;
         session.userid = results[0].person_nr; // set session userid til person_nr
         console.log('Logged In');
         res.redirect('/');
                  
      } else {
         res.redirect('/login?erre=invalid'); // redirect med error beskjed i GET
         console.log('Error');
      }
   });
})


// Gets the /signup and renders the signup.ejs file.
app.get('/signup', function(req, res) {
   res.render('signup.ejs',{});
})

// The same as post login. This posts the signup and connects the various inputs within the signup.ejs to the database
app.post('/signup', (req, res) => {

   con = connection();

   var fornavn = req.body.fornavn;
   var mellomnavn = req.body.mellomnavn || '';
   var email = req.body.email;
   var passord = req.body.passord;
   var etternavn = req.body.etternavn;
   var tlf = req.body.tlf;
   var adresse = req.body.adresse || '';

   tlf = tlf ? parseInt(tlf) : null;

   // Step 1: Email Address Validation
   // Perform basic email address validation using a regex pattern
   var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) {
      return res.status(400).send('Invalid email address');
   }

   // Step 2: Unique Email Check
   // Check if the email already exists in the database
   var uniqueEmailCheckQuery = 'SELECT * FROM user WHERE email = ?';
   con.query(uniqueEmailCheckQuery, [email], (err, results) => {
      if (err) {
         console.error('Error checking email uniqueness:', err);
         return res.status(500).send('Internal Server Error');
      }

      if (results.length > 0) {
         return res.status(409).send('Email address already registered');
      }

      // Step 3: Case Insensitivity
      // Convert the email address to lowercase before storing it
      email = email.toLowerCase();
      
      var sql = `INSERT INTO user (fornavn, mellomnavn, etternavn, email, passord, tlf, adresse) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      var values = [fornavn, mellomnavn, etternavn, email, passord, tlf, adresse];

      con.query(sql, values, (err, result) => {
         if (err) {
            console.error('Error inserting user into database:', err);
            return res.status(500).send('Internal Server Error');
         }

         console.log('User inserted into database');
         res.render('login.ejs');
      });
   });
})


// This is made to actually delete the account from the database once the user has made the decision to terminate his account
app.post('/delete-account', (req, res) => {
   // Get the authenticated user's ID or any identifier for the account
   const person_nr = session.userid; // Assuming you have implemented authentication and stored user information in req.user
   const passord = req.body.passord;

   console.log('Recieved person_nr: ', person_nr);
  
   // Connect to the database
   con = connection();
   
   // Perform the delete operation
   const sql = "DELETE FROM user WHERE person_nr = ? AND passord = ?";
   con.query(sql, [person_nr, passord], (err, result) => {
      if (err) {
         console.error('Error deleting account:', err);
         return res.status(500).send('Error deleting account. Please try again.');  
      }
      console.log(`Account with ID ${person_nr} deleted`);
      // Redirect or render a response indicating successful deletion
      res.redirect('/logout'); // Redirect to home page or any other desired page
   });
})


// Posts the /user, connecting this to the database. It checks if the credentials are correct before sending you to the index.ejs file
app.post('/user', (req, res) => {
   "SELECT * FROM user WHERE person_nr = req.body.person_nr"

   if(req.body.person_nr == person_nr && req.body.password == passord){
      session=req.session;
      session.userid=req.body.person_nr;
      console.log(req.session);
      con = connection();
      con.query("SELECT * FROM user WHERE person_nr = req.body.person_nr", function (err, result, fields){
         
         if (err) throw err;
         console.log(result);

         var innhold = "";

         res.render('index.ejs', {
            data: result,
            innhold: innhold
         });
      });

   }
   else{
      res.send('invalid username or password');
   }
})


// This enables the user to edit his account after creating one, so they don't have to delete and remake their account if the typed something wrong
app.get('/update-user/:person_nr', function (req, res) {

   var con = connection();

   var UserId = req.params.person_nr;
   var sql = 'SELECT * FROM user WHERE person_nr = ?';
   con.query(sql,[UserId], function (err, result, data) {
      if (err) throw err;
      console.log(result);

      var innhold = "";

      res.render('editUser.ejs', { data: result, innhold: innhold, title: 'User List', editData: data[0]});
   });
});

app.post('/update-user/:person_nr', (req, res) => {
   
   var con = connection();

   var id = req.body.person_nr;
   var fornavn = req.body.fornavn;
   var mellomnavn = req.body.mellomnavn || '';
   var email = req.body.email;
   var passord = req.body.passord;
   var etternavn = req.body.etternavn;
   var tlf = req.body.tlf;
   var adresse = req.body.adresse || '';
   
   tlf = tlf ? parseInt(tlf) : null;

   var sql = 'UPDATE user SET fornavn = ?, mellomnavn = ?, etternavn = ?, email = ?, passord = ?, tlf = ?, adresse = ? WHERE person_nr = ?';
   var values = [fornavn, mellomnavn, etternavn, email, passord, tlf, adresse, id];
   con.query(sql, values, (err, data) => {
      if (err) {
         console.error('Error updating user in database:', err);
         return res.status(500).send('Internal Server Error');
      } else {
         res.redirect('/')
      }
   console.log(data.affectedRows + " record(s) updated");
   });
});


// This enables the user to edit his account after creating one, so they don't have to delete and remake their account if the typed something wrong
app.get('/update-exercise/:name', function (req, res) {

   var con = connection();

   var UserId = req.params.name;
   var sql = 'SELECT * FROM exercise WHERE name = ?';
   con.query(sql,[UserId], function (err, result, data) {
      if (err) throw err;
      console.log(result);

      var innhold = "";

      res.render('editExercise.ejs', { data: result, innhold: innhold, title: 'User List', editData: data[0]});
   });
});

app.post('/update-exercise/:name', (req, res) => {
   
   var con = connection();

   var name = req.body.name;
   var sets = req.body.sets;
   var reps = req.body.reps;
   var max_rep = req.body.max_rep;
   var weight_kg = req.body.weight_kg;

   var sql = 'UPDATE exercise SET name = ?, sets = ?, reps = ?, max_rep = ?, weight_kg = ? WHERE name = ?';
   var values = [sets, reps, max_rep, weight_kg, name];
   con.query(sql, values, (err, data) => {
      if (err) {
         console.error('Error updating exercise in database:', err);
         return res.status(500).send('Internal Server Error');
      } else {
         res.redirect('/')
      }
   console.log(data.affectedRows + " record(s) updated");
   });
});


// This gets the /exercise and checks if the credentials are correct, if not it sends you to the login.ejs
app.get('/exercise', function(req, res) {
   session=req.session;
   if(session.userid){
      con = connection();
      var person_nr = session.userid;
      var sql = "SELECT * FROM exercise"
      con.query(sql, person_nr, function (err, result, fields){

         if (err) throw err;
         console.log(result);
         var innhold = "";
         res.render('exercise.ejs', {
            userid: session.userid,
            data: result,
            innhold: innhold
         });
      });
   }
   else {
      res.render('login.ejs',{});
   }

})

// Just as deleting your account from the database, this will properly delete the exercise from the database
app.post('/delete-exercise', (req, res) => {
   var exerciseId = req.body.deleteExercise; // Assuming the exercise ID is sent in the request body

   con = connection();
   var sql = "DELETE FROM exercise WHERE id_exercise = ?";
   con.query(sql, [exerciseId], (err, result) => {
      if (err) {
         console.error('Error deleting exercise:', err);
         return res.status(500).send('Error deleting exercise. Please try again.');
      }

      console.log(`Exercise with ID ${exerciseId} deleted`);
      res.redirect('/exercise');
   });
});


// This will get the /create-exercise and render the createExercise.ejs
app.get('/create-exercise', function(req, res) {
   res.render('createExercise.ejs',{});
})

// This will create a new exercise within the database
app.post('/create-exercise', (req, res) => {

   con = connection();

   var name = req.body.name;
   var sets = req.body.sets;
   var reps = req.body.reps;
   var max_rep = req.body.max_rep;
   var weight_kg = req.body.weight_kg;

   // Unique Name Check
   // Check if the name already exists in the database
   var uniqueNameCheckQuery = 'SELECT * FROM exercise WHERE name = ?';
   con.query(uniqueNameCheckQuery, [name], (err, results) => {
      if (err) {
         console.error('Error checking name uniqueness: ', err);
         return res.status(500).send('Internal Server Error');
      }

      if (results.length > 0) {
         return res.status(409).send('Name already registered');
      }

      // Convert the name to lowercase before storing it
      name = name.toLowerCase();

      var sql = 'INSERT INTO exercise (name, sets, reps, max_rep, weight_kg) VALUES (?, ?, ?, ?, ?)';
      var values = [name, sets, reps, max_rep, weight_kg];

      con.query(sql, values, (err, result) => {
         if (err) {
            console.error('Error inserting exercise into database: ', err);
            return res.status(500).send('Internal Server Error');
         }
         
         console.log('Exercise inserted into database');
         res.redirect('/exercise');
      })
   })
})


// This is so when writing in the localhost:8081 you will get to this website
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})