/**
 * Create the module. Set it up to use html5 mode.
 */
var MyOpenRecipes = angular.module('myOpenRecipes', ['elasticsearch', 'ngAnimate', 'ngRoute'],
    ['$locationProvider', function($locationProvider){
        $locationProvider.html5Mode({enabled : true, requireBase: false});
    }]
);

/**
 * Create a service to power calls to Elasticsearch. We only need to
 * use the _search endpoint.
 */
MyOpenRecipes.factory('recipeService',
    ['$q', 'esFactory', '$location', function($q, elasticsearch, $location){
        var client = elasticsearch({
            host: "https://readonly:elasticsearch@5483a9ea4e388ef915897a5f32c43023.ap-southeast-1.aws.found.io:9200"

        });

        /**
         * Given a term and an offset, load another round of 10 recipes.
         *
         * Returns a promise.
         */
        var search = function(term, offset){

            var deferred = $q.defer();
            var query = {
                "match": {
                    "_all": term
                }
            };

            client.search({
                "index": 'recipes',
                "type": 'recipe',
                "body": {
                    "size": 10,
                    "from": (offset || 0) * 10,
                    "query": query
                }
            }).then(function(result) {
                var ii = 0, hits_in, hits_out = [];
                hits_in = (result.hits || {}).hits || [];
                for(;ii < hits_in.length; ii++){
                    hits_out.push(hits_in[ii]._source);
                }
                deferred.resolve(hits_out);
            }, deferred.reject);

            return deferred.promise;
        };


        return {
            "search": search
        };
    }]
);

/**
 * Create a controller to interact with the UI.
 */
MyOpenRecipes.controller('recipeCtrl',
    ['recipeService', '$scope', '$location', function(recipes, $scope, $location){


        // Initialize the scope defaults.
        $scope.recipes = [];        // An array of recipe results to display
        $scope.page = 0;            // A counter to keep track of our current page
        $scope.allResults = false;  // Whether or not all results have been found.
        $scope.my = { isSearched: false };

        // And, a random search term to start if none was present on page load.
       // $scope.searchTerm = $location.search().q;

        /**
         * A fresh search. Reset the scope variables to their defaults, set
         * the q query parameter, and load more results.
         */
        $scope.checkEnter = function($event){
            var key = $event.which || $event.key;
            //console.log(key);
            if(key === 13)
                $scope.search();
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


        $scope.search = function(){
            $scope.my.isSearched = true;
            $scope.recipes.length=0;
            var elementOnce = angular.element(document.querySelector('#once'));
            elementOnce.addClass('ng-hide');
            $scope.page = 0;
            $scope.recipes = [];
            $scope.allResults = false;
            console.log($scope.searchTerm);
            $location.search({'q': $scope.searchTerm});
           
        };
    }]
);

MyOpenRecipes.config(function($routeProvider){
    $routeProvider
    .when("/", {
        templateUrl : "root.html",
        controller : 'recipeCtrl'
    })
    .when("/login", {
        templateUrl : "login.html"
    })
    .when("/signup", {
        templateUrl : "signup.html"
    });
});
