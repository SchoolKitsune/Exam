// '/logout' som redirecter til '/' med melding i lenken
app.get('/logout', function (req, res) {
   req.session.destroy();
   res.redirect('/?msg=logout');
})

// '/' med meldinger som kommer opp hvis det er gitt en '?msg=melding' i lenken
app.get('/', function (req, res) {
   if (req.query.msg) { console.log('req.query.msg ', req.query.msg) }
   if (req.query.msg === 'deletedacc') { 
      message = 'Account was deleted'
   } if (req.query.msg === 'logout') { 
      message = 'Logged out of account'
   } else {message = null}
   
   if(req.session.userid){
      res.render('home.ejs', {
      userid: req.session.userid
   });
   } else {
      res.render('index.ejs', { message: message });
   }
})


// kode i '/signup' som sjekker om bruker eksisterer
var sqlCheck = 'SELECT * FROM user WHERE username = ?';

con.query(sqlCheck, [username], (error, result) => {
   if (error) {
      res.status(500).send('Internal Server Error');
   } else if (result.length != 0) {
      res.redirect('/signup?error=exists'); // redirect with error message
   } else {}
      // insert new user into database
})

// '/signup' som viser error melding hvis gitt
app.get('/signup', function (req, res) {
   if (req.query.error) { console.log('req.query.error ', req.query.error) }
   if (req.query.error === 'exists') { 
      message = 'User already exists' 
   } else {message = null}

   res.render('signup.ejs', { message: message });
})


/* html som viser meldingen på sidene
<h3 id="message"><%= message %></h3> 
*/