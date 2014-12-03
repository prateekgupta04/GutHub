'use strict';

var app = angular.module('guthub',
  ['guthub.services', 'guthub.directives','auth0' ,'angular-storage', 'angular-jwt']);

app.config(['$routeProvider','authProvider', '$httpProvider','$locationProvider','jwtInterceptorProvider', 
	function($routeProvider, authProvider, $httpProvider, $locationProvider,jwtInterceptorProvider) {
	$routeProvider.
		when('/', {
			controller: 'ListController',
			requiresLogin: true,
			resolve: {
				recipes: ['MultiRecipeLoader', function(MultiRecipeLoader) {
					return MultiRecipeLoader();
				}]
			},
			templateUrl: '/views/list.html'
		}).when('/edit/:recipeId', {
			controller: 'EditContoller',
			requiresLogin: true,
			resolve: {
				recipe: ['RecipeLoader', function(RecipeLoader) {
					return RecipeLoader();
				}]
			},
			templateUrl: '/views/recipeForm.html'
		}).when('/view/:recipeId', {
			controller: 'ViewController',
			requiresLogin: true,
			resolve: {
				recipe: ["RecipeLoader", function(RecipeLoader) {
					return RecipeLoader();
				}]
			},
			templateUrl: '/views/viewRecipe.html'
		}).when('/new', {
			controller: 'NewController',
			requiresLogin: true,
			templateUrl: '/views/recipeForm.html'
		}).when('/login', {
			controller:'LoginController',
			templateUrl: '/views/login.html'
		}).otherwise({redirectTo:'/'});


	authProvider.init({
    domain: 'beerandbacon.auth0.com',
    clientID: 'wdmblf1y6arqF3gKuYP90ZAPVxeMoFsK',
    loginUrl: '/login'
  });

 jwtInterceptorProvider.tokenGetter = function(store) {
    return store.get('token');

     // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might
  // want to check the delegation-token example
  $httpProvider.interceptors.push('jwtInterceptor');
		
}}]).run(function($rootScope, auth, store, jwtHelper, $location) {
  $rootScope.$on('$locationChangeStart', function() {
    if (!auth.isAuthenticated) {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          auth.authenticate(store.get('profile'), token);
        } else {
          $location.path('/login');
        }
      }
    }

  });
});


app.controller('ListController', ['$scope', 'recipes', function($scope, recipes) {
	$scope.recipes = recipes;
}]);

app.controller('ViewController', ['$scope', '$location', 'recipe', function($scope, $location, recipe) {
	$scope.recipe = recipe;

	$scope.edit = function() {
		$location.path('/edit/' + recipe.id);

	};
}]);

app.controller('EditContoller', ['$scope', '$location', 'recipe', function($scope, $location, recipe) {
	$scope.recipe = recipe;

	$scope.save = function(){
		$scope.recipe.$save(function(recipe) {
			$location.path('/view/' + recipe.id);
		});
	};

	$scope.remove = function() {
    delete $scope.recipe;
    $location.path('/');
  };

}]);

app.controller('NewController', ['$scope', '$location', 'Recipe', function($scope, $location, Recipe) {
	$scope.recipe = new Recipe({
		ingredients:[{}]
	});

	$scope.save = function() {
		$scope.recipe.$save(function(recipe) {
			$location.path('/view/'+recipe.id);
		});
	};
}]);

app.controller('IngredientsController', ['$scope',
    function($scope) {
  $scope.addIngredient = function() {
    var ingredients = $scope.recipe.ingredients;
    ingredients[ingredients.length] = {};
  };
  $scope.removeIngredient = function(index) {
    $scope.recipe.ingredients.splice(index, 1);
  };
}]);

app.controller('LoginController', ['$scope','auth','$location','store', function($scope, auth, $location, store) {
	$scope.login = function() {
		auth.signin({}, function(profile, token){
			store.set('profile', profile);
			store.set('token', token);
			$location.path('/');
		}, function(error) {
			console.log('There was an error logging in', error);		
		});
	}
}]);