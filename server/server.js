require("dotenv").config();
const express = require("express");
const db = require("./db");
const cors = require("cors");
//const morgan = require("morgan");

const port = process.env.PORT || 4040;

const app = express();

//Middleware//

// custom middleware
// app.use((req, res, next) => {
// 	console.log("middleware here");
// 	next();
// });

// 3rd party middle ware
//app.use(morgan("dev"));

// express middleware
app.use(cors());
app.use(express.json());

//ROUTES//

// Get all restaurants

app.get("/api/v1/restaurants", async (req, res) => {
	try {
		// const allRestaurants = await db.query("SELECT * FROM restaurants");
		const restaurantsRatingData = await db.query(
			"select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;"
		);
		// console.log("result :", allRestaurants);
		// console.log(restaurantsRatingData);
		res.status(200).json({
			status: "success",
			results: restaurantsRatingData.rows.length,
			data: {
				restaurants: restaurantsRatingData.rows,
			},
		});
	} catch (err) {
		console.error(err.message);
	}
});

// Get one restaurants

app.get("/api/v1/restaurants/:id", async (req, res) => {
	try {
		// console.log(req.params);
		const restaurants = await db.query(
			"select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id WHERE id = $1;",
			[req.params.id]
		);

		const reviews = await db.query(
			"SELECT * FROM reviews WHERE restaurant_id = $1",
			[req.params.id]
		);

		res.status(200).json({
			status: "success",
			data: {
				restaurants: restaurants.rows,
				reviews: reviews.rows,
			},
		});
	} catch (err) {
		console.error(err.message);
	}
});

// Create restaurants

app.post("/api/v1/restaurants/", async (req, res) => {
	// console.log(req.body);
	try {
		const createRestaurants = await db.query(
			"INSERT INTO restaurants (name, location, price_range) values ($1, $2, $3) RETURNING *",
			[req.body.name, req.body.location, req.body.price_range]
		);

		// console.log(createRestaurants);
		res.status(201).json({
			status: "success",
			data: {
				restaurants: createRestaurants.rows[0],
			},
		});
	} catch (err) {
		console.error(err.message);
	}
});

// Update restaurants

app.put("/api/v1/restaurants/:id", async (req, res) => {
	// console.log(req.params.id);
	// console.log(req.body);
	try {
		const updateRestaurants = await db.query(
			"UPDATE restaurants SET name = $1, location = $2, price_range = $3 Where id = $4 RETURNING *",
			[req.body.name, req.body.location, req.body.price_range, req.params.id]
		);
		// console.log(updateRestaurants);
		res.status(200).json({
			status: "success",
			data: {
				restaurants: updateRestaurants.rows,
			},
		});
	} catch (err) {
		console.error(err.message);
	}
});

// Delete restaurants

app.delete("/api/v1/restaurants/:id", async (req, res) => {
	try {
		const deleteRestaurants = await db.query(
			"DELETE FROM restaurants WHERE id = $1 RETURNING *",
			[req.params.id]
		);
		console.log(deleteRestaurants);
		res.status(204).json({
			status: "success",
		});
	} catch (err) {
		console.error(err.message);
	}
});

// Add Review

app.post("/api/v1/restaurants/:id/add-review", async (req, res) => {
	try {
		const newReview = await db.query(
			"INSERT INTO reviews (restaurant_id, name, review, rating) VALUES ($1, $2, $3, $4) RETURNING *",
			[req.params.id, req.body.name, req.body.review, req.body.rating]
		);

		console.log(newReview);
		res.status(201).json({
			status: "success",
			data: {
				review: newReview.rows[0],
			},
		});
	} catch (err) {
		console.error(err.message);
	}
});

app.listen(port, () => {
	console.log(`listening to port ${port}`);
});
