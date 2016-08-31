var MyOpenRecipes = angular.module('myOpenRecipes', ['elasticsearch', 'ngAnimate', 'ngRoute', 'ui.materialize']);

//elasticsearch service
 MyOpenRecipes.service('es', function (esFactory) {
  return esFactory({
    host: 'http://readonly:elasticsearch@5483a9ea4e388ef915897a5f32c43023.ap-southeast-1.aws.found.io:9200'
  });
});

 MyOpenRecipes
    .service('authentication', authentication);

  authentication.$inject = ['$http', '$window'];
  function authentication ($http, $window) {

    var saveToken = function (token) {
      $window.localStorage['recipe-token'] = token;
    };

    var getToken = function () {
      return $window.localStorage['recipe-token'];
    };

    var isLoggedIn = function() {
      var token = getToken();
      var payload;

      if(token){
        payload = token.split('.')[1];
        payload = $window.atob(payload);
        payload = JSON.parse(payload);

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    var currentUser = function() {
      if(isLoggedIn()){
        var token = getToken();
        var payload = token.split('.')[1];
        payload = $window.atob(payload);
        payload = JSON.parse(payload);
        return {
          email : payload.email,
          name : payload.name
        };
      }
    };

    register = function(user) {
      return $http.post('http://search-engine-upwork-jsisgod.c9users.io:8081/api/register', user).success(function(data){
        saveToken(data.token);
      });
    };

    login = function(user) {
      return $http.post('http://search-engine-upwork-jsisgod.c9users.io:8081/api/login', user).success(function(data) {
        saveToken(data.token);
      });
    };

    logout = function() {
      $window.localStorage.removeItem('recipe-token');
    };

    return {
      currentUser : currentUser,
      saveToken : saveToken,
      getToken : getToken,
      isLoggedIn : isLoggedIn,
      register : register,
      login : login,
      logout : logout
    };
  }
 
 
MyOpenRecipes.controller('loginController', function($scope, authentication, $location) {
    
    $scope.credentials = {
      email : "",
      password : ""
    };

    $scope.onSubmit = function () {
      authentication
        .login($scope.credentials)
        .error(function(err){
          alert(err);
        })
        .then(function(){
          $location.path('/');
        });
    };
});

MyOpenRecipes.controller('signupCtrl', function($scope, authentication, $location) {

    $scope.credentials = {
      name : "",
      email : "",
      password : ""
    };

    $scope.onSubmit = function () {
      console.log('Submitting registration');
      authentication
        .register($scope.credentials)
        .error(function(err){
          alert(err);
        })
        .then(function(){
          $location.path('/profile');
        });
    };
});

MyOpenRecipes.controller('profileCtrl', function($scope, authentication, $location) {

    $scope.isLoggedIn = authentication.isLoggedIn();
    if(!$scope.isLoggedIn){
      $location.path('/login');
    }
    else{
    $scope.user = authentication.currentUser();
    $scope.logout = function(){
      authentication.logout();
      $location.path('/');
    }
    }
    
});


MyOpenRecipes.controller('recipeCtrl', function($scope, es, authentication){
     
        
        console.log(authentication);

        
        // Initialize the scope defaults.
        $scope.userDetails = authentication.currentUser();
        $scope.isLoggedIn = authentication.isLoggedIn();
        
        console.log($scope.userDetails);
        
        $scope.recipes = [];        // An array of recipe results to display
        $scope.page = 0;            // A counter to keep track of our current page
        $scope.allResults = false;  // Whether or not all results have been found.
        $scope.my = { isSearched: false };
        $scope.footerStyle = "absolute";

        $scope.checkEnter = function($event){
            var key = $event.which || $event.key;
            //console.log(key);
            if(key === 13)
                $scope.searchnow();
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
            $scope.footerStyle = "relative";
            console.log($scope.footerStyle);
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
        controller : 'signupCtrl'
    })
    .when("/profile", {
        templateUrl : "profile.html",
        controller : 'profileCtrl'
    });
});

$(document).ready(function(){
  $(".button-collapse").sideNav();
});
