var express = require("express");
var bodyParser = require("body-parser")
var jwt = require('express-jwt');
var cors = require('cors');


app = express();
//app.use(cors());

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests


var jwtCheck = jwt({
    secret: new Buffer('ZpaWrfMvvdNUzPRig_BFjpoe9yc_0uFirSwkk4IGFOy6__sdJljR6Eoc-XLz4_3B', 'base64'),
    audience: 'wdmblf1y6arqF3gKuYP90ZAPVxeMoFsK'
});

//app.use(express.logger());
app.use(bodyParser());
app.use(express.static(__dirname + '/app'));
app.use('/*', jwtCheck);
app.use(function(req, res, next) {
	 req.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});


var recipes_map = {
    '1': {
        "id": "1",
        "title": "Cookies",
        "description": "Delicious, crisp on the outside, chewy on the outside, oozing with chocolatey goodness cookies. The best kind",
        "ingredients": [{
            "amount": "1",
            "amountUnits": "packet",
            "ingredientName": "Chips Ahoy"
        }],
        "instructions": "1. Go buy a packet of Chips Ahoy\n2. Heat it up in an oven\n3. Enjoy warm cookies\n4. Learn how to bake cookies from somewhere else"
    },
    '2': {
        id: 2,
        'title': 'Recipe 2',
        'description': 'Description 2',
        'instructions': 'Instruction 2',
        ingredients: [{
            amount: 13,
            amountUnits: 'pounds',
            ingredientName: 'Awesomeness'
        }]
    }
};

var next_id = 3;
app.get('/recipes', function(req, res) {
    //console.log('Requesting all recipes');
    var recipes = [];
    for (var key in recipes_map) {
        recipes.push(recipes_map[key]);
    }

    //simulate delay on server
    setTimeout(function() {
        res.send(recipes);
    }, 500);
});

app.get('/recipes/:id', function(req, res) {
    //console.log('Requesting recipe with id: ' req.params.id);
    res.send(recipes_map[req.params.id]);
});

app.post('/recipes', function(req, res) {
    var recipe = {};
    recipe.id = next_id++;
    recipe.title = req.body.title;
    recipe.description = req.body.description;
    recipe.ingredients = req.body.ingredients;
    recipe.instructions = req.body.instructions;

    recipes_map[recipe.id] = recipe;
    res.send(recipe);
});

app.post('/recipes/:id', function(req, res) {
    var recipe = {};
    recipe.id = req.body.id;
    recipe.title = req.body.title;
    recipe.description = req.body.description;
    recipe.ingredients = req.body.ingredients;
    recipe.instructions = req.body.instructions;

    recipes_map[recipe.id] = recipe;
    res.send(recipe);

});

app.get('/*', function(req, res) {
    res.sendfile(__dirname + '/app/index.html')
});

app.listen(3001);
console.log('Now server is listening at http://localhost:' + 3001 + '/');
