var MyOpenRecipes = angular.module('myOpenRecipes', ['elasticsearch', 'ngAnimate', 'ngRoute', 'ui.materialize']);

//elasticsearch service
 MyOpenRecipes.service('es', function (esFactory) {
  return esFactory({
    host: 'http://readonly:elasticsearch@5483a9ea4e388ef915897a5f32c43023.ap-southeast-1.aws.found.io:9200'
  });
});
 
 
MyOpenRecipes.controller('loginController', function($scope) {
    $scope.emailAdd = "someone@domain.com";
    $scope.pass = "secureText";
});


MyOpenRecipes.controller('recipeCtrl', function($scope, es){
    
        
        console.log(es);

        // Initialize the scope defaults.
        $scope.recipes = [];        // An array of recipe results to display
        $scope.page = 0;            // A counter to keep track of our current page
        $scope.allResults = false;  // Whether or not all results have been found.
        $scope.my = { isSearched: false };

        $scope.checkEnter = function($event){
            var key = $event.which || $event.key;
            //console.log(key);
            if(key === 13)
                $scope.searchnow();
        }

        $scope.doLogin = function(){
            console.log("works");
        }
        $scope.noResult = function(){
            if($scope.my.isSearched){
                if($scope.recipes.length>0)
                    return true;
                else return false;
            }
            else return true;
        }
        $scope.searchnow = function(){
            $scope.my.isSearched = true;
            $scope.recipes.length=0;
            var elementOnce = angular.element(document.querySelector('#once'));
            elementOnce.addClass('ng-hide');
            $scope.page = 0;
            $scope.recipes = [];
            $scope.allResults = false;
            console.log($scope.searchTerm);
            es.search({
                'index': 'recipes',
                'type': 'recipe',
                'body': {
                    'size': 10,
                    'from': 0,
                    'query': {
                        'match' : {
                            '_all':$scope.searchTerm
                            
                        }
                        
                    }
                }
            }, function(error, response){
                if(error) console.log(error);
                else
                {
                    console.log(response);
                
                $scope.recipes = response.hits.hits;
                }
            });
        };
});

MyOpenRecipes.config(function($routeProvider){
    $routeProvider
    .when("/", {
        templateUrl : "root.html",
        controller : 'recipeCtrl'
    })
    .when("/login", {
        templateUrl : "login.html",
        controller : 'loginController'
    })
    .when("/signup", {
        templateUrl : "signup.html",
        controller : 'recipeCtrl'
    });
});

