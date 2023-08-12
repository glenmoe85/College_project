const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require ('cookie-parser');
const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require("mysql");

const db = mysql.createPool({
	host: "localhost",
	user: "root",
	password: "password",
	database: "arewethereyet",
});

app.use(cors({
	origin: ["http://localhost:3000"],
	methods: ["POST", "GET","DELETE", "PUT"],
	credentials: true

	}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		maxAge: 1000 * 60 * 60 *24
	}
}))
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/get', (req, res) => {
	const sqlSelect = "SELECT e.*, o.business_name FROM event e left join organizer o on e.organizer_id = o.organizer_id";
	db.query(sqlSelect, (err, result) => {
		res.send(result);		
	});
});

app.post('/api/getOrgEvents', (req, res) => {
	const organizer_id = req.body.organizer_id;
	const sqlSelect = "SELECT * FROM event WHERE organizer_id = ?";
	db.query(sqlSelect, [organizer_id], (err, result) => {
		res.send(result);		
	});
});

app.post('/api/login', (req, res) => {
	 const email = req.body.email;
     const password = req.body.password;
	 const sqlSelect = "SELECT organizer_id FROM organizer WHERE email = ? AND password = ?";
	db.query(sqlSelect, [email, password], (err, result) => {
		if(err) return res.json({Message: "Error inside server"});
		if(result && result.length) {
			req.session.userID = result[0].organizer_id;
			req.session.save();
			return res.json({Login: true})
		}
		else {
			return res.json({Login: false})
			console.log(result);
		}
	});
});

app.get('/api/userDashboard', (req, res) => {
	if(req.session.userID) {		
		const sqlSelect = "SELECT * FROM event WHERE organizer_id = ?";
		const orgID = req.session.userID;
	db.query(sqlSelect, [orgID], (err, result) => {
		return res.json({valid: true, userID: req.session.userID, data: result})
	})
	}
	else {
		return res.json({valid: false})
	}
})

app.delete('/api/delete/:id', (req, res) => {
	const event_id = req.params.id;
	console.log(event_id)		
		const sqlDelete = "DELETE FROM event WHERE event_id = ?";
	db.query(sqlDelete, event_id, (err, result) => {
		if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
	})
})

app.post("/api/new_register", (req, res) => {
	const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const busName = req.body.business_name;
    const email = req.body.email;
    const contactNo = req.body.contact_number;
    const password = req.body.password;
    const sqlInsert = "INSERT INTO organizer (first_name, last_name, business_name, email, contact_number, password) VALUES (?,?,?,?,?,?)";
	db.query(sqlInsert, [firstName, lastName, busName, email, contactNo, password ], (err, result) => {
	});
});

app.put("/api/update_event/:id", (req, res) => {
	const event_id = req.params.id;
    const title = req.body.title;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const county = req.body.county;
    const city = req.body.city;
    const formUrl = req.body.formUrl;
    const formDescription = req.body.description;
    const age_group = req.body.formAge;
    const price = req.body.price;
    const image = req.body.image;
	const sqlUpdate = "UPDATE event SET `title` = ?, `county` = ?, `city` = ?, `url` = ?, `description` = ?, `age_group` = ?, `price` = ?, `image` = ? WHERE `event_id` = ?";
	db.query(sqlUpdate, [title, county, city, formUrl, formDescription, age_group, price, image, event_id], (err, result) => {
	});
});

app.post("/api/new_event", (req, res) => {
	const organizer_id = req.body.organizer_id;
    const title = req.body.title;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const county = req.body.county;
    const city = req.body.city;
    const formUrl = req.body.formUrl;
    const formDescription = req.body.description;
    const age_group = req.body.formAge;
    const price = req.body.price;
    const image = req.body.image;
	const sqlInsert = "INSERT INTO event (organizer_id, title, start_date, end_date, county, city, url, description, age_group, price, image) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
	db.query(sqlInsert, [organizer_id, title, start_date, end_date, county, city, formUrl, formDescription, age_group, price, image], (err, result) => {
	});
});

app.listen(3001, () => {
	console.log("running on port 3001")
	});
