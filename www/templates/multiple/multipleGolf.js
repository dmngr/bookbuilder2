angular.module("bookbuilder2")
  .controller("MultipleGolfController", function ($scope,$rootScope, $ionicPlatform, $timeout, $http, _, Toast) {

    console.log("MultipleGolfController loaded!");
    $scope.rootDir = window.localStorage.getItem("rootDir");
    $scope.selectedLesson = JSON.parse(window.localStorage.getItem("selectedLesson"));
    $scope.activityFolder = window.localStorage.getItem("activityFolder");
    $scope.activityName = window.localStorage.getItem("activityName");

    $scope.backgroundView = {
      "background": "url(" + $scope.rootDir + "data/assets/lesson_background_image.png) no-repeat center top",
      "-webkit-background-size": "cover",
      "-moz-background-size": "cover",
      "background-size": "cover"
    };


    $ionicPlatform.on('pause', function () {
      console.log('pause');
      createjs.Ticker.framerate = 0;
      ionic.Platform.exitApp();
    });
    $ionicPlatform.on('resume', function () {
      createjs.Ticker.framerate = 10;
    });

    $scope.$on('$destroy', function () {
      createjs.Ticker.removeEventListener("tick", handleTick);
      createjs.Tween.removeAllTweens();
      $timeout.cancel(timeout);
      $scope.stage.removeAllEventListeners();
      $scope.stage.removeAllChildren();
      $scope.stage = null;
    });

    var handleTick = function () {
      if ($scope.stage) {
        $scope.stage.update();
      }
    };

    /*Name of activity in localStorage*/
    var activityNameInLocalStorage = $scope.selectedLesson.id + "_" + $scope.activityFolder;
    console.log("Name of activity in localStorage: ", activityNameInLocalStorage);

    var timeout = $timeout(function () {

      var PIXEL_RATIO = (function () {
        var ctx = document.getElementById("canvas").getContext("2d"),
          dpr = window.devicePixelRatio || 1,
          bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
      })();
      var createHiDPICanvas = function (w, h, ratio) {
        if (!ratio) {
          ratio = PIXEL_RATIO;
        }
        console.log("ratio", PIXEL_RATIO);
        var can = document.getElementById("canvas");
        can.width = w * ratio;
        can.height = h * ratio;
        can.style.width = w + "px";
        can.style.height = h + "px";
        can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
        return can;
      };
      $scope.stage = new createjs.Stage(createHiDPICanvas(window.innerWidth, window.innerHeight));
      $scope.stage.enableDOMEvents(false);
      createjs.MotionGuidePlugin.install();
      createjs.Touch.enable($scope.stage);
      $scope.stage.enableMouseOver(0);
      $scope.stage.mouseMoveOutside = false;

      createjs.Ticker.framerate = 20;
      createjs.Ticker.addEventListener("tick", handleTick);

      /*Image Loader*/
      var imageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
        src: $scope.rootDir + "data/assets/golf_background_image.png"
      }));

      imageLoader.load();

      /*IMAGE LOADER COMPLETED*/
      imageLoader.on("complete", function (r) {

        console.log("Image Loaded...");

        /*Creating Bitmap Background for Canvas*/
        var background = new createjs.Bitmap($scope.rootDir + "data/assets/golf_background_image.png");

        /**** CALCULATING SCALING ****/
        var scaleY = $scope.stage.canvas.height / background.image.height;
        scaleY = scaleY.toFixed(2);
        var scaleX = $scope.stage.canvas.width / background.image.width;
        scaleX = scaleX.toFixed(2);
        $scope.scale = 1;
        if (scaleX >= scaleY) {
          $scope.scale = scaleY;
        } else {
          $scope.scale = scaleX;
        }
        console.log("GENERAL SCALING FACTOR: ", $scope.scale);

        background.scaleX = $scope.scale;
        background.scaleY = $scope.scale;
        background.regX = background.image.width / 2;
        background.regY = background.image.height / 2;
        background.x = $scope.stage.canvas.width / 2;
        background.y = $scope.stage.canvas.height / 2;
        $scope.stage.addChild(background);
        var backgroundPosition = background.getTransformedBounds();
        console.log("backgroundPosition: ", backgroundPosition);


        /* ------------------------------------------ GENERAL INITIALIZATION ---------------------------------------------- */
        $scope.activeQuestionIndex = 0;


        /* ------------------------------------------ MAIN CONTAINER ---------------------------------------------- */
        $scope.mainContainer = new createjs.Container();
        $scope.mainContainer.width = background.image.width;
        $scope.mainContainer.height = background.image.height;
        $scope.mainContainer.scaleX = $scope.mainContainer.scaleY = $scope.scale;
        $scope.mainContainer.x = backgroundPosition.x;
        $scope.mainContainer.y = backgroundPosition.y;
        $scope.stage.addChild($scope.mainContainer);

        //mainContainer Background
        /*var mainContainerGraphic = new createjs.Graphics().beginFill("green").drawRect(0, 0, $scope.mainContainer.width, $scope.mainContainer.height);
         var mainContainerBackground = new createjs.Shape(mainContainerGraphic);
         mainContainerBackground.alpha = 0.5;

         $scope.mainContainer.addChild(mainContainerBackground);*/


        /* ------------------------------------------ PLAY CONTAINER ---------------------------------------------- */
        $scope.playContainer = new createjs.Container();
        $scope.playContainer.width = $scope.mainContainer.width;
        $scope.playContainer.height = 480;
        $scope.playContainer.x = 0;
        $scope.playContainer.y = 190;
        $scope.mainContainer.addChild($scope.playContainer);

        //mainContainer Background
        /*var playContainerGraphic = new createjs.Graphics().beginFill("blue").drawRect(0, 0, $scope.playContainer.width, $scope.playContainer.height);
         var playContainerBackground = new createjs.Shape(playContainerGraphic);
         playContainerBackground.alpha = 0.5;

         $scope.playContainer.addChild(playContainerBackground);*/


        /* ------------------------------------------ QUESTION CONTAINER ---------------------------------------------- */
        $scope.questionContainer = new createjs.Container();
        $scope.questionContainer.width = 610;
        $scope.questionContainer.height = 100;
        $scope.questionContainer.startingPointY = 0;
        $scope.questionContainer.x = 0;
        $scope.questionContainer.y = -500;
        $scope.mainContainer.addChild($scope.questionContainer);

        //mainContainer Background
        /*var questionContainerGraphic = new createjs.Graphics().beginFill("red").drawRect(0, 0, $scope.questionContainer.width, $scope.questionContainer.height);
         var questionContainerBackground = new createjs.Shape(questionContainerGraphic);
         questionContainerBackground.alpha = 0.5;

         $scope.questionContainer.addChild(questionContainerBackground);*/


        /* ------------------------------------------ ANSWERS CONTAINER ---------------------------------------------- */
        $scope.answersContainer = new createjs.Container();
        $scope.answersContainer.width = 260;
        $scope.answersContainer.height = 300;
        $scope.answersContainer.startingPointX = 610;
        $scope.answersContainer.x = 1300;
        $scope.answersContainer.y = 40;
        $scope.mainContainer.addChild($scope.answersContainer);

        //mainContainer Background
        /*var answersContainerGraphic = new createjs.Graphics().beginFill("red").drawRect(0, 0, $scope.answersContainer.width, $scope.answersContainer.height);
         var answersContainerBackground = new createjs.Shape(answersContainerGraphic);
         answersContainerBackground.alpha = 0.5;

         $scope.answersContainer.addChild(answersContainerBackground);*/


        /* ------------------------------------------ OPTIONS CONTAINER ---------------------------------------------- */
        $scope.optionsContainer = new createjs.Container();
        $scope.optionsContainer.width = 350;
        $scope.optionsContainer.height = 75;
        $scope.optionsContainer.x = 477;
        $scope.optionsContainer.y = 591;
        $scope.mainContainer.addChild($scope.optionsContainer);

        //mainContainer Background
        /*var optionsContainerGraphic = new createjs.Graphics().beginFill("red").drawRect(0, 0, $scope.optionsContainer.width, $scope.optionsContainer.height);
         var optionsContainerBackground = new createjs.Shape(optionsContainerGraphic);
         optionsContainerBackground.alpha = 0.5;

         $scope.optionsContainer.addChild(optionsContainerBackground);*/


        /* ------------------------------------------ RESULTS CONTAINER ---------------------------------------------- */
        $scope.resultsContainer = new createjs.Container();
        $scope.resultsContainer.width = 740;
        $scope.resultsContainer.height = 500;
        $scope.resultsContainer.x = 90;
        $scope.resultsContainer.y = 120;
        $scope.mainContainer.addChild($scope.resultsContainer);

        //mainContainer Background
        /*var resultsContainerGraphic = new createjs.Graphics().beginFill("orange").drawRect(0, 0, $scope.resultsContainer.width, $scope.resultsContainer.height);
         var resultsContainerBackground = new createjs.Shape(resultsContainerGraphic);
         resultsContainerBackground.alpha = 0.5;

         $scope.resultsContainer.addChild(resultsContainerBackground);*/


        /* ------------------------------------------ TOTAL RESULTS CONTAINER ---------------------------------------------- */
        $scope.resultsTotalContainer = new createjs.Container();
        $scope.resultsTotalContainer.width = $scope.mainContainer.width;
        $scope.resultsTotalContainer.height = $scope.mainContainer.height;
        $scope.resultsTotalContainer.x = 0;
        $scope.resultsTotalContainer.y = 0;
        $scope.mainContainer.addChild($scope.resultsTotalContainer);

        //mainContainer Background
        /*var resultsTotalContainerGraphic = new createjs.Graphics().beginFill("pink").drawRect(0, 0, $scope.resultsTotalContainer.width, $scope.resultsTotalContainer.height);
         var resultsTotalContainerBackground = new createjs.Shape(resultsTotalContainerGraphic);
         resultsTotalContainerBackground.alpha = 0.5;

         $scope.resultsTotalContainer.addChild(resultsTotalContainerBackground);*/


        $http.get($scope.rootDir + "data/assets/head_menu_button_sprite.json")
          .success(function (response) {

            //Reassigning images with the rest of resource
            response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];

            var menuButtonSpriteSheet = new createjs.SpriteSheet(response);
            var menuButton = new createjs.Sprite(menuButtonSpriteSheet, "normal");

            menuButton.addEventListener("mousedown", function (event) {
              console.log("Mouse down event on Menu button !");
              menuButton.gotoAndPlay("onSelection");
              $scope.stage.update();
            });

            menuButton.addEventListener("pressup", function (event) {
              console.log("Press up event on Menu event!");
              menuButton.gotoAndPlay("normal");
              $scope.stage.update();
              $rootScope.navigate("lessonNew");
            });

            menuButton.scaleX = menuButton.scaleY = $scope.scale;
            menuButton.x = 0;
            menuButton.y = -menuButton.getTransformedBounds().height / 5;

            $scope.stage.addChild(menuButton);
          })
          .error(function (error) {
            console.error("Error on getting json for results button...", error);
          });//end of get menu button

        /************************************** Initializing Page **************************************/

        console.log("Searching in localStorage fo activity: ", activityNameInLocalStorage);
        if (window.localStorage.getItem(activityNameInLocalStorage)) {

          $scope.activityData = JSON.parse(window.localStorage.getItem(activityNameInLocalStorage));
          console.log("activityData: ", $scope.activityData);

          init();

        } else {

          console.log("There is no activity...Getting the json through get");

          console.log("selectedLesson.id: ", $scope.selectedLesson.id);
          console.log("activityFolder: ", $scope.activityFolder);

          $http.get($scope.rootDir + "data/lessons/" + $scope.selectedLesson.id + "/" + $scope.activityFolder + "/multiple.json")
            .success(function (response) {
              console.log("Success on getting json for the url. The response object is: ", response);

              //Assigning configured response to activityData
              $scope.activityData = response;
              $scope.activityData.attempts = 1;

              /*Adding the userAnswer attribute to response object before assigning it to activityData*/
              _.each($scope.activityData.questions, function (question, key, value) {
                $scope.activityData.questions[key].userAnswer = "";
              });

              init();

              //Saving it to localStorage
              window.localStorage.setItem(activityNameInLocalStorage, JSON.stringify($scope.activityData));
            })
            .error(function (error) {
              console.log("Error on getting json for the url...:", error);
            });
        }


        function init() {

          console.log("Starting init process!");
          async.waterfall([
              /*Questions and Answers*/
              function (initWaterfallCallback) {

                var questionsAndAnswersParallelFunctions = [];

                //Question background bitmap
                questionsAndAnswersParallelFunctions.push(function (questionsAndAnswersCallback) {

                  /*Creating the questionTextBackground bitmap*/
                  var questionTextBackgroundImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                    src: $scope.rootDir + "data/assets/question_bubble_image.png"
                  }));
                  questionTextBackgroundImageLoader.load();

                  questionTextBackgroundImageLoader.on("complete", function (r) {

                    /*Creating Bitmap Background for answerHolder background image*/
                    $scope.questionBackground = new createjs.Bitmap($scope.rootDir + "data/assets/question_bubble_image.png");
                    $scope.questionBackground.x = 0;
                    $scope.questionBackground.y = 0;
                    $scope.questionBackground.scaleX = $scope.questionBackground.scaleY = 0.75;
                    $scope.questionContainer.addChild($scope.questionBackground);

                    /*Adding a container for the question text*/
                    $scope.questionTextContainer = new createjs.Container();
                    $scope.questionTextContainer.width = 570;
                    $scope.questionTextContainer.height = 60;
                    $scope.questionTextContainer.x = 20;
                    $scope.questionTextContainer.y = 35;
                    $scope.questionContainer.addChild($scope.questionTextContainer);

                    //mainContainer Background
                    /* var questionTextContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.questionTextContainer.width, $scope.questionTextContainer.height);
                     var questionTextContainerBackground = new createjs.Shape(questionTextContainerGraphic);
                     questionTextContainerBackground.alpha = 0.5;
                     $scope.questionTextContainer.addChild(questionTextContainerBackground);*/

                    /*Adding the Text that holds the question*/
                    $scope.questionText = new createjs.Text("", "25px Arial", "black");
                    $scope.questionText.x = $scope.questionTextContainer.x;
                    $scope.questionText.y = 20;
                    $scope.questionText.maxWidth = $scope.questionTextContainer.width;
                    $scope.questionTextContainer.addChild($scope.questionText);

                    questionsAndAnswersCallback(null);

                  });//end of questionTextBackgroundImageLoader
                });


                //Loading A answer bitmap
                questionsAndAnswersParallelFunctions.push(function (questionsAndAnswersCallback) {
                  /*Creating the questionTextBackground bitmap*/
                  var answerABackgroundImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                    src: $scope.rootDir + "data/assets/soccer_a_choice.png"
                  }));
                  answerABackgroundImageLoader.load();

                  answerABackgroundImageLoader.on("complete", function (r) {

                    /*Creating Bitmap Background for answerHolder background image*/
                    $scope.answerABackground = new createjs.Bitmap($scope.rootDir + "data/assets/golf_choice_button_blue.png");
                    $scope.answerABackground.x = 0;
                    $scope.answerABackground.y = 0;
                    $scope.answerABackground.addEventListener("mousedown", function (event) {
                      if (!$scope.selectionInProgress) {
                        $scope.answerABackground.alpha = 0.5;
                        $scope.stage.update();
                      }
                    });

                    $scope.answerABackground.addEventListener("pressup", function (event) {
                      console.log("Press up event on A button!");
                      if (!$scope.selectionInProgress) {
                        $scope.answerABackground.alpha = 1;
                        $scope.stage.update();
                        check($scope.activeQuestionIndex, "aChoice");
                      }
                    });
                    $scope.answersContainer.addChild($scope.answerABackground);

                    /*Adding a container for the answer A text*/
                    $scope.answerATextContainer = new createjs.Container();
                    $scope.answerATextContainer.width = 125;
                    $scope.answerATextContainer.height = 50;
                    $scope.answerATextContainer.x = 50;
                    $scope.answerATextContainer.y = 20;
                    $scope.answersContainer.addChild($scope.answerATextContainer);

                    //mainContainer Background
                    /*var answerATextContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.answerATextContainer.width, $scope.answerATextContainer.height);
                     var answerATextContainerBackground = new createjs.Shape(answerATextContainerGraphic);
                     answerATextContainerBackground.alpha = 0.5;
                     $scope.answerATextContainer.addChild(answerATextContainerBackground);*/

                    /*Adding the Text that holds the question*/
                    $scope.answerAText = new createjs.Text("CHOICE A", "23px Arial", "white");
                    $scope.answerAText.x = $scope.questionTextContainer.x;
                    $scope.answerAText.y = 9;
                    $scope.answerAText.maxWidth = $scope.answerATextContainer.width;
                    $scope.answerATextContainer.addChild($scope.answerAText);

                    questionsAndAnswersCallback(null);

                  });//end of questionTextBackgroundImageLoader
                });


                //Loading B answer bitmap
                questionsAndAnswersParallelFunctions.push(function (questionsAndAnswersCallback) {
                  /*Creating the questionTextBackground bitmap*/
                  var answerBBackgroundImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                    src: $scope.rootDir + "data/assets/soccer_b_choice.png"
                  }));
                  answerBBackgroundImageLoader.load();

                  answerBBackgroundImageLoader.on("complete", function (r) {

                    /*Creating Bitmap Background for answerHolder background image*/
                    $scope.answerBBackground = new createjs.Bitmap($scope.rootDir + "data/assets/golf_choice_button_green.png");
                    $scope.answerBBackground.x = 0;
                    $scope.answerBBackground.y = $scope.answersContainer.height / 3;
                    $scope.answerBBackground.addEventListener("mousedown", function (event) {
                      if (!$scope.selectionInProgress) {
                        $scope.answerBBackground.alpha = 0.5;
                        $scope.stage.update();
                      }
                    });

                    $scope.answerBBackground.addEventListener("pressup", function (event) {
                      console.log("Press up event on B button!");
                      if (!$scope.selectionInProgress) {
                        $scope.answerBBackground.alpha = 1;
                        $scope.stage.update();
                        check($scope.activeQuestionIndex, "bChoice");
                      }
                    });
                    $scope.answersContainer.addChild($scope.answerBBackground);

                    /*Adding a container for the answer A text*/
                    $scope.answerBTextContainer = new createjs.Container();
                    $scope.answerBTextContainer.width = 125;
                    $scope.answerBTextContainer.height = 50;
                    $scope.answerBTextContainer.x = 50;
                    $scope.answerBTextContainer.y = $scope.answersContainer.height / 3 + 20;
                    $scope.answersContainer.addChild($scope.answerBTextContainer);

                    //mainContainer Background
                    /*var answerBTextContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.answerBTextContainer.width, $scope.answerBTextContainer.height);
                     var answerBTextContainerBackground = new createjs.Shape(answerBTextContainerGraphic);
                     answerBTextContainerBackground.alpha = 0.5;
                     $scope.answerBTextContainer.addChild(answerBTextContainerBackground);*/

                    /*Adding the Text that holds the question*/
                    $scope.answerBText = new createjs.Text("CHOICE B", "23px Arial", "white");
                    $scope.answerBText.x = $scope.questionTextContainer.x;
                    $scope.answerBText.y = 9;
                    $scope.answerBText.maxWidth = $scope.answerBTextContainer.width;
                    $scope.answerBTextContainer.addChild($scope.answerBText);

                    questionsAndAnswersCallback(null);

                  });//end of questionTextBackgroundImageLoader
                });


                /** Checking if there is C answer first **/
                if ($scope.activityData.questions[$scope.activeQuestionIndex].cChoice !== "") {
                  //Loading C answer bitmap
                  questionsAndAnswersParallelFunctions.push(function (questionsAndAnswersCallback) {
                    /*Creating the questionTextBackground bitmap*/
                    var answerCBackgroundImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                      src: $scope.rootDir + "data/assets/soccer_c_choice.png"
                    }));
                    answerCBackgroundImageLoader.load();

                    answerCBackgroundImageLoader.on("complete", function (r) {

                      /*Creating Bitmap Background for answerHolder background image*/
                      $scope.answerCBackground = new createjs.Bitmap($scope.rootDir + "data/assets/soccer_c_choice.png");
                      $scope.answerCBackground.x = 0;
                      $scope.answerCBackground.y = $scope.answersContainer.height / 1.5;
                      $scope.answerCBackground.scaleX = $scope.answerCBackground.scaleY = 0.45;
                      $scope.answerCBackground.addEventListener("mousedown", function (event) {
                        if (!$scope.selectionInProgress) {
                          $scope.answerCBackground.alpha = 0.5;
                          $scope.stage.update();
                        }
                      });

                      $scope.answerCBackground.addEventListener("pressup", function (event) {
                        if (!$scope.selectionInProgress) {
                          $scope.answerCBackground.alpha = 1;
                          $scope.stage.update();
                          check($scope.activeQuestionIndex, "cChoice");
                        }
                      });
                      $scope.answersContainer.addChild($scope.answerCBackground);

                      /*Adding a container for the answer A text*/
                      $scope.answerCTextContainer = new createjs.Container();
                      $scope.answerCTextContainer.width = 125;
                      $scope.answerCTextContainer.height = 50;
                      $scope.answerCTextContainer.x = 50;
                      $scope.answerCTextContainer.y = $scope.answersContainer.height / 1.5 + 20;
                      $scope.answersContainer.addChild($scope.answerCTextContainer);

                      //mainContainer Background
                      /* var answerCTextContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.answerCTextContainer.width, $scope.answerCTextContainer.height);
                       var answerCTextContainerBackground = new createjs.Shape(answerCTextContainerGraphic);
                       answerCTextContainerBackground.alpha = 0.5;
                       $scope.answerCTextContainer.addChild(answerCTextContainerBackground);*/

                      /*Adding the Text that holds the question*/
                      $scope.answerCText = new createjs.Text("CHOICE C", "23px Arial", "white");
                      $scope.answerCText.x = $scope.questionTextContainer.x;
                      $scope.answerCText.y = 9;
                      $scope.answerCText.maxWidth = $scope.answerCTextContainer.width;
                      $scope.answerCTextContainer.addChild($scope.answerCText);

                      questionsAndAnswersCallback(null);

                    });//end of questionTextBackgroundImageLoader
                  });
                }

                /** Checking if there is D answer first **/


                /*Loading and creating bitmaps for question and answers*/
                async.waterfall(questionsAndAnswersParallelFunctions, function (err, results) {
                  if (!err) {
                    console.log("Success on loading the Q+A bitmaps!");
                    initWaterfallCallback(null);
                  } else {
                    console.error("There was an error on parallel process that loads the Q+A bitmaps: ", err);
                  }
                });

              },

              /*Golf game*/
              function (initWaterfallCallback) {

                var createSoccerGameParallelFunctions = [];

                //parallel function for getting the soccer ball
                createSoccerGameParallelFunctions.push(function (parallelCallback) {
                  $http.get($scope.rootDir + "data/assets/golf_ball.json")
                    .success(function (response) {
                      console.log("Success on getting json for soccer ball!");
                      response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];
                      var golfBallSpriteSheet = new createjs.SpriteSheet(response);
                      $scope.golfBall = new createjs.Sprite(golfBallSpriteSheet, "normal");
                      /*$scope.golfBall.framerate = 100;*/
                      $scope.golfBall.x = 365;
                      $scope.golfBall.y = 385;
                      $scope.golfBall.scaleX = $scope.golfBall.scaleY = 2.2;
                      $scope.golfBall.gotoAndPlay("normal");
                      $scope.playContainer.addChild($scope.golfBall);

                      parallelCallback(null);

                    })
                    .error(function (error) {

                      console.log("Error on getting json data for soccer ball: ", error);
                      parallelCallback(true, error);
                    });
                });

                //parallel function for getting the golf player
                createSoccerGameParallelFunctions.push(function (parallelCallback) {
                  $http.get($scope.rootDir + "data/assets/golf_boy_striking_sprite.json")
                    .success(function (response) {
                      console.log("Success on getting json for soccer player!");
                      response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];
                      var golfPlayerSpriteSheet = new createjs.SpriteSheet(response);
                      $scope.golfPlayer = new createjs.Sprite(golfPlayerSpriteSheet, "normal");
                      $scope.golfPlayer.x = 320;
                      $scope.golfPlayer.y = 350;
                      $scope.golfPlayer.scaleX = $scope.golfPlayer.scaleY = 0.9;
                      $scope.playContainer.addChild($scope.golfPlayer);

                      parallelCallback(null);
                    })
                    .error(function (error) {
                      console.error("Error on getting json data for soccer player: ", error);
                      parallelCallback(true, error);
                    });
                });

                //parallel function for getting ball splash
                createSoccerGameParallelFunctions.push(function (parallelCallback) {
                  $http.get($scope.rootDir + "data/assets/golf_ball_splash.json")
                    .success(function (response) {
                      console.log("Success on getting json for ball splash!");
                      response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];
                      var ballSplashSpriteSheet = new createjs.SpriteSheet(response);
                      $scope.ballSplash = new createjs.Sprite(ballSplashSpriteSheet, "normal");

                      $scope.ballSplash.x = 80;
                      $scope.ballSplash.y = 85;
                      /*$scope.ballSplash.scaleX = $scope.ballSplash.scaleY = 1;*/
                      $scope.playContainer.addChild($scope.ballSplash);

                      //Creating a second one for the other hole
                      $scope.ballSplashRight = $scope.ballSplash.clone();
                      $scope.ballSplashRight.x = 435;
                      $scope.ballSplashRight.y = 85;
                      $scope.playContainer.addChild($scope.ballSplashRight);


                      parallelCallback(null);
                    })
                    .error(function (error) {
                      console.error("Error on getting json data for soccer player: ", error);
                      parallelCallback(true, error);
                    });
                });

                async.waterfall(createSoccerGameParallelFunctions, function (err, results) {

                  if (!err) {
                    console.log("Success on creating soccer game! Adding elements to mainContainer!");
                    initWaterfallCallback(null);

                  } else {
                    console.error("Fail on creating soccer game. Error: ", err)
                  }
                });
              },

              /*Titles and general buttons*/
              function (initWaterfallCallback) {
                async.waterfall([
                  /*Adding title*/
                  function (generalButtonsWaterfallCallback) {

                    $scope.pageDescription = new createjs.Text($scope.activityData.description, "23px Arial", "white");
                    $scope.pageDescription.x = 90;
                    $scope.pageDescription.y = 685;
                    $scope.mainContainer.addChild($scope.pageDescription);

                    generalButtonsWaterfallCallback(null);
                  },

                  /*Adding Skip Button*/
                  function (generalButtonsWaterfallCallback) {
                    $http.get($scope.rootDir + "data/assets/skip_one_answer_button_sprite.json")
                      .success(function (response) {
                        console.log("Success on getting json for skipAnswer button!");
                        response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];

                        var skipAnswerSpriteSheet = new createjs.SpriteSheet(response);
                        $scope.skipAnswerButton = new createjs.Sprite(skipAnswerSpriteSheet, "normal");


                        /*Mouse down event*/
                        $scope.skipAnswerButton.addEventListener("mousedown", function (event) {
                          /*If question index already reached maximum, disabling skip button*/
                          if ($scope.activeQuestionIndex >= $scope.activityData.questions.length - 1) {
                            console.warn("Maximun question index reached!");
                            return;
                          }

                          /*Selection process in progress, disabling skip button*/
                          if ($scope.selectionInProgress) {
                            console.warn("Selection in progress!");
                            return;
                          }
                          $scope.skipAnswerButton.alpha = 0.5;
                          $scope.stage.update();
                        });


                        /*Press up event*/
                        $scope.skipAnswerButton.addEventListener("pressup", function (event) {

                          /*If question index already reached maximum, disabling skip button*/
                          if ($scope.activeQuestionIndex >= $scope.activityData.questions.length - 1) {
                            console.warn("Maximun question index reached!");
                            return;
                          }

                          /*Selection process in progress, disabling skip button*/
                          if ($scope.selectionInProgress) {
                            console.warn("Selection in progress!");
                            return;
                          }

                          $scope.skipAnswerButton.alpha = 1;
                          $scope.stage.update();

                          $scope.activeQuestionIndex++;

                          /*First hiding the question and answers elements*/
                          createjs.Tween.get($scope.questionContainer, {loop: false})
                            .to({
                              x: 150,
                              y: -500
                            }, 700, createjs.Ease.getPowIn(2));
                          createjs.Tween.get($scope.answersContainer, {loop: false})
                            .to({
                              x: $scope.answersContainer.x + 500,
                              y: 130
                            }, 700, createjs.Ease.getPowIn(2));


                          /*Tween question and answers back to stage again with the question text and answers text updated*/
                          $timeout(function () {

                            loadQuestion($scope.activeQuestionIndex);

                            //Tween elements back
                            createjs.Tween.get($scope.questionContainer, {loop: false})
                              .to({
                                x: 150,
                                y: $scope.questionContainer.startingPointY
                              }, 700, createjs.Ease.getPowIn(2));

                            createjs.Tween.get($scope.answersContainer, {loop: false})
                              .to({
                                x: $scope.answersContainer.startingPointX,
                                y: 130
                              }, 700, createjs.Ease.getPowIn(2));

                          }, 300);
                        });

                        $scope.skipAnswerButton.x = 90;
                        $scope.skipAnswerButton.y = 30;

                        generalButtonsWaterfallCallback(null);
                      })
                      .error(function (error) {

                        console.error("Error on getting json data for skipAnswer button: ", error);
                        generalButtonsWaterfallCallback(true, error);
                      });
                  },

                  /*Adding GoToResults Button*/
                  function (generalButtonsWaterfallCallback) {
                    $http.get($scope.rootDir + "data/assets/go_to_results_button_sprite.json")
                      .success(function (response) {
                        console.log("Success on getting json for goToResults button!");
                        response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];

                        var goToResultsSpriteSheet = new createjs.SpriteSheet(response);
                        $scope.goToResultsButton = new createjs.Sprite(goToResultsSpriteSheet, "normal");

                        /*Mouse down event*/
                        $scope.goToResultsButton.addEventListener("mousedown", function (event) {
                          if (!$scope.resultsContainer.visible) {
                            $scope.goToResultsButton.alpha = 0.5;
                            $scope.stage.update();
                          }
                        });

                        /*Press up event*/
                        $scope.goToResultsButton.addEventListener("pressup", function (event) {

                          /*Active only when resultsContainer is invisible*/
                          if (!$scope.resultsContainer.visible) {

                            $scope.goToResultsButton.alpha = 1;
                            $scope.stage.update();
                            updateResultsTotalQuestions();
                            //Make some element in soccer game disappear and make resultsTotal page visible again
                            createjs.Tween.get($scope.questionContainer, {loop: false})
                              .to({
                                x: 150,
                                y: -500
                              }, 700, createjs.Ease.getPowIn(2));

                            createjs.Tween.get($scope.answersContainer, {loop: false})
                              .to({
                                x: $scope.answersContainer.x + 500,
                                y: 130
                              }, 700, createjs.Ease.getPowIn(2));

                            //While making resultsTotalContainer visible, description and Next activity button have to hide
                            $scope.resultsTotalContainer.visible = true;
                          }
                        });

                        $scope.goToResultsButton.x = 250;
                        $scope.goToResultsButton.y = 30;

                        generalButtonsWaterfallCallback(null);
                      })
                      .error(function (error) {
                        console.error("Error on getting json data for goToResults button: ", error);
                        generalButtonsWaterfallCallback(true, error);
                      });
                  },

                  /*Adding Next Activity button*/
                  function (generalButtonsWaterfallCallback) {

                    $http.get($scope.rootDir + "data/assets/next_activity_drag_and_drop_sprite.json")
                      .success(function (response) {
                        response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];
                        var nextButtonSpriteSheet = new createjs.SpriteSheet(response);
                        $scope.nextButton = new createjs.Sprite(nextButtonSpriteSheet, "normal");
                        $scope.nextButton.alpha = 0.5;

                        $scope.nextButton.addEventListener("mousedown", function (event) {
                          if ($scope.activityData.completed) {
                            $scope.nextButton.alpha = 0.5;
                            $scope.nextButton.gotoAndPlay("onSelection");
                            $scope.stage.update();
                          }
                          $scope.stage.update();
                        });
                        $scope.nextButton.addEventListener("pressup", function (event) {
                          if ($scope.activityData.completed) {
                            $scope.nextButton.alpha = 1;
                            $scope.nextButton.gotoAndPlay("normal");
                            $scope.stage.update();
                            $rootScope.nextActivity($scope.selectedLesson, $scope.activityFolder);
                          }
                        });
                        $scope.nextButton.x = 730;
                        $scope.nextButton.y = 710;
                        $scope.mainContainer.addChild($scope.nextButton);
                        $scope.stage.update();
                        generalButtonsWaterfallCallback(null);
                      })
                      .error(function (error) {
                        console.log("Error on getting json data for check button...", error);
                        generalButtonsWaterfallCallback(true, error);
                      });
                  }

                ], function (err, results) {

                  if (!err) {
                    console.log("Success on adding Page description and Skip, goToResults Buttons!");

                    //Adding to page
                    $scope.optionsContainer.addChild($scope.skipAnswerButton);
                    $scope.optionsContainer.addChild($scope.goToResultsButton);
                    $scope.optionsContainer.addChild();

                    initWaterfallCallback(null);
                  } else {
                    initWaterfallCallback(true, err);
                  }
                });
              },

              /*Results table*/
              function (initWaterfallCallback) {
                async.waterfall([
                  /*Adding background image in result table */
                  function (resultWaterfallCallback) {

                    console.log("Adding results background...");
                    /*Creating the questionTextBackground bitmap*/
                    var resultsBackgroundImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                      src: $scope.rootDir + "data/assets/soccer_results_table_image.png"
                    }));
                    resultsBackgroundImageLoader.load();

                    resultsBackgroundImageLoader.on("complete", function (r) {

                      /*Creating Bitmap Background for answerHolder background image*/
                      $scope.resultsBackground = new createjs.Bitmap($scope.rootDir + "data/assets/soccer_results_table_image.png");
                      $scope.resultsBackground.x = 0;
                      $scope.resultsBackground.y = 0;
                      $scope.resultsContainer.addChild($scope.resultsBackground);

                      $scope.resultsContainer.visible = false;

                      /*/!*Adding a container for the question text*!/
                       $scope.questionTextContainer = new createjs.Container();
                       $scope.questionTextContainer.width = 570;
                       $scope.questionTextContainer.height = 60;
                       $scope.questionTextContainer.x = 5;
                       $scope.questionTextContainer.y = 30;
                       $scope.questionContainer.addChild($scope.questionTextContainer);

                       //mainContainer Background
                       var questionTextContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.questionTextContainer.width, $scope.questionTextContainer.height);
                       var questionTextContainerBackground = new createjs.Shape(questionTextContainerGraphic);
                       questionTextContainerBackground.alpha = 0.5;
                       $scope.questionTextContainer.addChild(questionTextContainerBackground);

                       /!*Adding the Text that holds the question*!/
                       $scope.questionText = new createjs.Text("", "20px Arial", "black");
                       $scope.questionText.x = $scope.questionTextContainer.x;
                       $scope.questionText.y = 20;
                       $scope.questionText.maxWidth = $scope.questionTextContainer.width;
                       $scope.questionTextContainer.addChild($scope.questionText);*/

                      resultWaterfallCallback(null);

                    });//end of questionTextBackgroundImageLoader
                  },

                  /*Results Question*/
                  function (resultWaterfallCallback) {

                    //Creating container for results question
                    $scope.resultQuestionContainer = new createjs.Container();
                    $scope.resultQuestionContainer.width = 630;
                    $scope.resultQuestionContainer.height = 80;
                    $scope.resultQuestionContainer.x = 30;
                    $scope.resultQuestionContainer.y = 85;
                    $scope.resultsContainer.addChild($scope.resultQuestionContainer);

                    //resultQuestionContainer Background
                    /* var resultQuestionContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.resultQuestionContainer.width, $scope.resultQuestionContainer.height);
                     var resultQuestionContainerBackground = new createjs.Shape(resultQuestionContainerGraphic);
                     resultQuestionContainerBackground.alpha = 0.5;
                     $scope.resultQuestionContainer.addChild(resultQuestionContainerBackground);*/

                    /*Creating the text elements for the result question*/
                    //Pretext
                    $scope.resultQuestionPreText = new createjs.Text(" ", "25px Arial", "black");
                    $scope.resultQuestionPreText.x = 0;
                    $scope.resultQuestionPreText.y = 15;
                    $scope.resultQuestionContainer.addChild($scope.resultQuestionPreText);

                    //Underline
                    $scope.resultQuestionUnderline = new createjs.Text(" ", "25px Arial", "black");
                    $scope.resultQuestionUnderline.x = $scope.resultQuestionPreText.x + $scope.resultQuestionPreText.getBounds().width;
                    $scope.resultQuestionUnderline.y = 19;
                    $scope.resultQuestionContainer.addChild($scope.resultQuestionUnderline);

                    //Answer
                    $scope.resultQuestionAnswer = new createjs.Text(" ", "25px Arial", "black");
                    $scope.resultQuestionAnswer.x = $scope.resultQuestionPreText.x + $scope.resultQuestionPreText.getBounds().width;
                    $scope.resultQuestionAnswer.y = 15;
                    $scope.resultQuestionAnswer.textAlign = "center";
                    $scope.resultQuestionContainer.addChild($scope.resultQuestionAnswer);

                    //MidText
                    $scope.resultQuestionMidText = new createjs.Text(" ", "25px Arial", "black");
                    $scope.resultQuestionMidText.x = 0;
                    $scope.resultQuestionMidText.y = 15;
                    $scope.resultQuestionContainer.addChild($scope.resultQuestionMidText);

                    //PosText
                    $scope.resultQuestionPostText = new createjs.Text(" ", "25px Arial", "black");
                    $scope.resultQuestionPostText.x = $scope.resultQuestionUnderline.x + $scope.resultQuestionUnderline.getBounds().width;
                    $scope.resultQuestionPostText.y = 15;
                    $scope.resultQuestionContainer.addChild($scope.resultQuestionPostText);

                    resultWaterfallCallback(null);
                  },

                  /*Results Answer*/
                  function (resultWaterfallCallback) {

                    //Creating container for results answer
                    $scope.resultAnswerContainer = new createjs.Container();
                    $scope.resultAnswerContainer.width = 200;
                    $scope.resultAnswerContainer.height = 70;
                    $scope.resultAnswerContainer.x = 320;
                    $scope.resultAnswerContainer.y = 195;
                    $scope.resultsContainer.addChild($scope.resultAnswerContainer);

                    //resultAnswerContainer Background
                    /*var resultAnswerContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.resultAnswerContainer.width, $scope.resultAnswerContainer.height);
                     var resultAnswerContainerBackground = new createjs.Shape(resultAnswerContainerGraphic);
                     resultAnswerContainerBackground.alpha = 0.5;
                     $scope.resultAnswerContainer.addChild(resultAnswerContainerBackground);*/

                    //Creating the text element for the result answer
                    $scope.resultAnswerText = new createjs.Text("", "20px Arial", "red");
                    $scope.resultAnswerText.x = 0;
                    $scope.resultAnswerText.y = 10;
                    $scope.resultAnswerText.maxWidth = $scope.resultAnswerContainer.width;
                    $scope.resultAnswerContainer.addChild($scope.resultAnswerText);

                    resultWaterfallCallback(null);
                  }
                ], function (err, results) {

                  if (!err) {
                    console.log("Success on adding Page description and Skip, goToResults Buttons!");
                    initWaterfallCallback(null);
                  } else {
                    console.log("Error on creating results page: ", err);
                    initWaterfallCallback(true, err);
                  }
                });
              },

              /*resultsTotal table*/
              function (initWaterfallCallback) {
                async.waterfall([
                  /*Adding background image in result table */
                  function (resultWaterfallCallback) {

                    console.log("Adding results background...");
                    /*Creating the questionTextBackground bitmap*/
                    var resultsTotalBackgroundImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                      src: $scope.rootDir + "data/assets/results_table_image.png"
                    }));
                    resultsTotalBackgroundImageLoader.load();

                    resultsTotalBackgroundImageLoader.on("complete", function (r) {

                      /*Creating Bitmap Background for answerHolder background image*/
                      $scope.resultsTotalBackground = new createjs.Bitmap($scope.rootDir + "data/assets/results_table_image.png");
                      $scope.resultsTotalBackground.x = 10;
                      $scope.resultsTotalBackground.y = 0;
                      $scope.resultsTotalContainer.addChild($scope.resultsTotalBackground);

                      /*Adding Score Text*/
                      $scope.scoreText = new createjs.Text("Score: " + "0" + " / " + $scope.activityData.questions.length, "30px Arial", "white");
                      $scope.scoreText.x = 590;
                      $scope.scoreText.y = 580;
                      $scope.resultsTotalContainer.addChild($scope.scoreText);

                      $scope.activityData.score = 0;
                      window.localStorage.setItem(activityNameInLocalStorage, JSON.stringify($scope.activityData));


                      /*Adding container in resultsTotalContainer to create a working space in background image frame*/
                      $scope.resultsTotalBackgroundContainer = new createjs.Container();
                      $scope.resultsTotalBackgroundContainer.width = 820;
                      $scope.resultsTotalBackgroundContainer.height = 480;
                      $scope.resultsTotalBackgroundContainer.x = 25;
                      $scope.resultsTotalBackgroundContainer.y = 85;
                      $scope.resultsTotalContainer.addChild($scope.resultsTotalBackgroundContainer);

                      //mainContainer Background
                      /*var resultsTotalBackgroundContainerGraphic = new createjs.Graphics().beginFill("green").drawRect(0, 0, $scope.resultsTotalBackgroundContainer.width, $scope.resultsTotalBackgroundContainer.height);
                       var resultsTotalBackgroundContainerBackground = new createjs.Shape(resultsTotalBackgroundContainerGraphic);
                       resultsTotalBackgroundContainerBackground.alpha = 0.5;
                       $scope.resultsTotalBackgroundContainer.addChild(resultsTotalBackgroundContainerBackground);*/

                      //Making it invisible
                      $scope.resultsTotalContainer.visible = false;

                      /*Adding each question container an initializing various data*/
                      $scope.resultsTotalRowContainers = {};
                      $scope.resultsTotalRowQuestionsContainers = {};
                      $scope.resultsTotalRowAnswersContainers = {};
                      $scope.resultsTotalRowQuestionsTexts = {};
                      $scope.resultsTotalRowAnswersTexts = {};
                      $scope.resultsAnswersTableContainerA = {};
                      $scope.resultsAnswersTableContainerB = {};
                      $scope.resultsAnswersTableContainerC = {};
                      $scope.answerResultsATexts = {};
                      $scope.answerResultsBTexts = {};
                      $scope.answerResultsCTexts = {};


                      //Creating the little answersTable
                      var resultsAnswersOptionsTableImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                        src: $scope.rootDir + "data/assets/soccer_results_answers.png"
                      }));
                      resultsAnswersOptionsTableImageLoader.load();

                      resultsAnswersOptionsTableImageLoader.on("complete", function (r) {

                        /*Creating Bitmap for results*/
                        $scope.resultsAnswersOptionsTable = new createjs.Bitmap($scope.rootDir + "data/assets/soccer_results_answers.png");
                        $scope.resultsAnswersOptionsTable.x = 640;
                        $scope.resultsAnswersOptionsTable.y = -10;
                        $scope.resultsAnswersOptionsTable.visible = false;

                        /*A container for the answers options table that holds the answers every time it opens*/
                        $scope.resultsAnswersOptionsTableContainer = new createjs.Container();
                        $scope.resultsAnswersOptionsTableContainer.width = 176;
                        $scope.resultsAnswersOptionsTableContainer.height = 145;
                        $scope.resultsAnswersOptionsTableContainer.x = $scope.resultsAnswersOptionsTable.x;
                        $scope.resultsAnswersOptionsTableContainer.y = $scope.resultsAnswersOptionsTable.y + 20;
                        $scope.resultsAnswersOptionsTableContainer.visible = false;

                        /*var resultsAnswersOptionsTableContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.resultsAnswersOptionsTableContainer.width, $scope.resultsAnswersOptionsTableContainer.height);
                         var resultsAnswersOptionsTableContainerBackground = new createjs.Shape(resultsAnswersOptionsTableContainerGraphic);
                         resultsAnswersOptionsTableContainerBackground.alpha = 0.5;
                         $scope.resultsAnswersOptionsTableContainer.addChild(resultsAnswersOptionsTableContainerBackground);*/

                        //-------Containers

                        /** After resultsAnswerOptionsTable loads the rest of the game builds **/

                        /*Creating the page's restart and check buttons*/

                        /*Check Button*/
                        $http.get($scope.rootDir + "data/assets/check_answers_drag_and_drop_sprite.json")
                          .success(function (response) {
                            console.log("Success on getting json for check button!");
                            response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];
                            var checkButtonSpriteSheet = new createjs.SpriteSheet(response);
                            $scope.checkButton = new createjs.Sprite(checkButtonSpriteSheet, "normal");

                            /*Mouse down event*/
                            $scope.checkButton.addEventListener("mousedown", function (event) {
                              $scope.checkButton.alpha = 0.5;
                              $scope.stage.update();
                            });

                            /*Press up event*/
                            $scope.checkButton.addEventListener("pressup", function (event) {
                              $scope.checkButton.alpha = 1;
                              $scope.stage.update();
                              var rightQuestions = 0;
                              _.each($scope.activityData.questions, function (question, key, list) {
                                if ($scope.activityData.questions[key].userAnswer === $scope.activityData.questions[key].answerChoice) {

                                  /** Right Answer **/
                                  rightQuestions++;
                                  $scope.resultsTotalRowQuestionsTexts[key].color = "green";
                                  /*During score check the answer text becomes green or red if the user answer is right or wrong*/
                                  $scope.resultsTotalRowAnswersTexts[key].color = "green";

                                } else {

                                  /** Wrong Answer **/
                                  /*During score check the question text becomes green and changes to right answer*/

                                  //!!!!!!! has to find the right answer from answers
                                  $scope.resultsTotalRowQuestionsTexts[key].text = $scope.activityData.questions[key][$scope.activityData.questions[key].answerChoice];
                                  $scope.resultsTotalRowQuestionsTexts[key].color = "green";

                                  /*During score check the answer text becomes green or red if the user answer is right or wrong*/
                                  $scope.resultsTotalRowAnswersTexts[key].color = "red";
                                }
                              });

                              //Activity has completed
                              $scope.activityData.completed = true;
                              $scope.nextButton.gotoAndPlay("onSelection");

                              //Updating the Score text
                              $scope.scoreText.text = "Score: " + rightQuestions + " / " + $scope.activityData.questions.length;


                              $scope.activityData.score = rightQuestions;
                              window.localStorage.setItem(activityNameInLocalStorage, JSON.stringify($scope.activityData));

                            });

                            $scope.checkButton.x = 45;
                            $scope.checkButton.y = 575;
                            $scope.checkButton.gotoAndPlay("normal");
                            $scope.resultsTotalContainer.addChild($scope.checkButton);

                          })
                          .error(function (error) {
                            console.log("Error on getting json data for check button: ", error);
                          });


                        /*Restart Button for totalResults frame !!!*/
                        $http.get($scope.rootDir + "data/assets/restart_button_drag_and_drop_sprite.json")
                          .success(function (response) {
                            console.log("Success on getting json for restartTotal button!");
                            response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];
                            var restartTotalButtonSpriteSheet = new createjs.SpriteSheet(response);
                            $scope.restartTotalButton = new createjs.Sprite(restartTotalButtonSpriteSheet, "normal");

                            /*Mouse down event*/
                            $scope.restartTotalButton.addEventListener("mousedown", function (event) {
                              $scope.restartTotalButton.alpha = 0.5;
                              $scope.stage.update();
                            });


                            /*Press up event*/
                            $scope.restartTotalButton.addEventListener("pressup", function (event) {
                              console.log("Click on RestartTotal button!");
                              $scope.restartTotalButton.alpha = 1;
                              $scope.stage.update();

                              async.waterfall([
                                function (restartWaterfallCallback) {
                                  //Erase all saved answers and restarts all elements
                                  _.each($scope.activityData.questions, function (question, key, list) {
                                    $scope.activityData.questions[key].userAnswer = "";
                                    $scope.resultsTotalRowQuestionsTexts[key].text = "";
                                    $scope.resultsTotalRowQuestionsTexts[key].color = "black";
                                    $scope.resultsTotalRowAnswersTexts[key].text = "-";
                                    $scope.resultsTotalRowAnswersTexts[key].color = "black";
                                  });

                                  $timeout(function () {
                                    restartWaterfallCallback(null);
                                  }, 200);
                                },
                                function (restartWaterfallCallback) {

                                  //Hide resultsTotal container and making pageDescription and nextButton visible again
                                  $scope.resultsTotalContainer.visible = false;
                                  $scope.pageDescription.visible = true;
                                  $scope.nextButton.visible = true;

                                  $timeout(function () {
                                    restartWaterfallCallback(null);
                                  }, 200);
                                }
                              ], function (err, results) {

                                //Restarting activity so the completed property has to be false
                                $scope.activityData.completed = false;

                                //Next button playing normal animation
                                $scope.nextButton.gotoAndPlay("normal");

                                _.each($scope.activityData.questions, function (question, key, list) {
                                  $scope.activityData.questions[key].userAnswer = "";
                                });

                                $scope.activityData.completed = false;
                                $scope.activeQuestionIndex = 0;
                                loadQuestion(0);
                                $scope.scoreText.text = "Score: " + "0" + " / " + $scope.activityData.questions.length;


                                $scope.activityData.score = 0;
                                window.localStorage.setItem(activityNameInLocalStorage, JSON.stringify($scope.activityData));

                              });
                            });//End of press up element

                            $scope.restartTotalButton.x = 280;
                            $scope.restartTotalButton.y = 590;
                            $scope.restartTotalButton.gotoAndPlay("normal");
                            $scope.resultsTotalContainer.addChild($scope.restartTotalButton);

                          })
                          .error(function (error) {
                            console.log("Error on getting json data for check button: ", error);
                          });

                        /*Creating Row containers*/
                        _.each($scope.activityData.questions, function (question, key, list) {

                          $scope.resultsTotalRowContainers[key] = new createjs.Container();
                          $scope.resultsTotalRowContainers[key].width = $scope.resultsTotalBackgroundContainer.width - 10;
                          $scope.resultsTotalRowContainers[key].height = 43;
                          $scope.resultsTotalRowContainers[key].x = 5;
                          $scope.resultsTotalRowContainers[key].y = 5 + 48 * key;
                          $scope.resultsTotalBackgroundContainer.addChild($scope.resultsTotalRowContainers[key]);

                          /*var resultsTotalRowContainersGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.resultsTotalRowContainers[key].width, $scope.resultsTotalRowContainers[key].height);
                           var resultsTotalRowContainersBackground = new createjs.Shape(resultsTotalRowContainersGraphic);
                           resultsTotalRowContainersBackground.alpha = 0.5;
                           $scope.resultsTotalRowContainers[key].addChild(resultsTotalRowContainersBackground);*/

                          /*Creating Row Questions containers*/
                          $scope.resultsTotalRowQuestionsContainers[key] = new createjs.Container();
                          $scope.resultsTotalRowQuestionsContainers[key].width = 630;
                          $scope.resultsTotalRowQuestionsContainers[key].height = $scope.resultsTotalRowContainers[key].height;
                          $scope.resultsTotalRowQuestionsContainers[key].x = 0;
                          $scope.resultsTotalRowQuestionsContainers[key].y = 0;
                          $scope.resultsTotalRowContainers[key].addChild($scope.resultsTotalRowQuestionsContainers[key]);

                          var resultsTotalRowQuestionsContainersGraphic = new createjs.Graphics().beginFill("azure").drawRect(0, 0, $scope.resultsTotalRowQuestionsContainers[key].width, $scope.resultsTotalRowQuestionsContainers[key].height);
                          var resultsTotalRowQuestionsContainersBackground = new createjs.Shape(resultsTotalRowQuestionsContainersGraphic);
                          resultsTotalRowQuestionsContainersBackground.alpha = 0.5;
                          $scope.resultsTotalRowQuestionsContainers[key].addChild(resultsTotalRowQuestionsContainersBackground);


                          //Question index
                          var indexNumber = new createjs.Text((key + 1) + ". ", "19px Arial", "black");
                          indexNumber.x = 0;
                          indexNumber.y = 0;
                          $scope.resultsTotalRowQuestionsContainers[key].addChild(indexNumber);

                          //Pretext
                          var pretext = new createjs.Text($scope.activityData.questions[key].pretext, "19px Arial", "black");
                          pretext.x = indexNumber.x + indexNumber.getBounds().width;
                          pretext.y = 0;
                          $scope.resultsTotalRowQuestionsContainers[key].addChild(pretext);

                          //Underline
                          var questionUnderline = new createjs.Text("__________", "19px Arial", "black");
                          questionUnderline.x = pretext.x + pretext.getBounds().width;
                          questionUnderline.y = pretext.y;
                          $scope.resultsTotalRowQuestionsContainers[key].addChild(questionUnderline);

                          //Answer
                          $scope.resultsTotalRowQuestionsTexts[key] = new createjs.Text(" ", "19px Arial", "black");
                          $scope.resultsTotalRowQuestionsTexts[key].x = questionUnderline.x + questionUnderline.getBounds().width / 2;
                          $scope.resultsTotalRowQuestionsTexts[key].y = questionUnderline.y;
                          $scope.resultsTotalRowQuestionsTexts[key].textAlign = "center";
                          $scope.resultsTotalRowQuestionsTexts[key].maxWidth = 110;
                          $scope.resultsTotalRowQuestionsContainers[key].addChild($scope.resultsTotalRowQuestionsTexts[key]);

                          if ($scope.activityData.questions[key].postext) {

                            var postexts = $scope.activityData.questions[key].postext.split("\n");
                            console.log("Postexts: ", postexts.length);
                            var currentPostexts = {};

                            if (postexts.length > 1) {
                              if (!postexts[0]) {
                                postexts[0] = " ";
                              }

                              currentPostexts[0] = new createjs.Text(postexts[0], "19px Arial", "black");
                              currentPostexts[0].x = questionUnderline.x + questionUnderline.getBounds().width;
                              currentPostexts[0].y = 0;
                              $scope.resultsTotalRowQuestionsContainers[key].addChild(currentPostexts[0]);

                              currentPostexts[1] = new createjs.Text(postexts[1], "19px Arial", "black");
                              currentPostexts[1].x = pretext.x;
                              currentPostexts[1].y = currentPostexts[0].y + 28;
                              $scope.resultsTotalRowQuestionsContainers[key].addChild(currentPostexts[1]);

                            } else {

                              currentPostexts[0] = new createjs.Text(postexts[0], "19px Arial", "black");
                              currentPostexts[0].x = questionUnderline.x + questionUnderline.getBounds().width;
                              currentPostexts[0].y = 0;
                              $scope.resultsTotalRowQuestionsContainers[key].addChild(currentPostexts[0]);
                            }
                          }

                          /*Creating Row Answers containers*/
                          $scope.resultsTotalRowAnswersContainers[key] = new createjs.Container();
                          $scope.resultsTotalRowAnswersContainers[key].width = 170;
                          $scope.resultsTotalRowAnswersContainers[key].height = $scope.resultsTotalRowContainers[key].height;
                          $scope.resultsTotalRowAnswersContainers[key].x = $scope.resultsTotalRowQuestionsContainers[key].x
                            + $scope.resultsTotalRowQuestionsContainers[key].width
                            + 10;
                          $scope.resultsTotalRowAnswersContainers[key].y = 0;
                          $scope.resultsTotalRowContainers[key].addChild($scope.resultsTotalRowAnswersContainers[key]);

                          var resultsTotalRowAnswersContainersGraphic = new createjs.Graphics().beginFill("azure").drawRect(0, 0, $scope.resultsTotalRowAnswersContainers[key].width, $scope.resultsTotalRowAnswersContainers[key].height);
                          var resultsTotalRowAnswersContainersBackground = new createjs.Shape(resultsTotalRowAnswersContainersGraphic);
                          resultsTotalRowAnswersContainersBackground.alpha = 0.5;
                          $scope.resultsTotalRowAnswersContainers[key].addChild(resultsTotalRowAnswersContainersBackground);

                          /*Answer Text*/
                          //Resolving if it'a already has an answer
                          $scope.resultsTotalRowAnswersTexts[key] = new createjs.Text($scope.activityData.questions[key].userAnswer === "" ? "-" : $scope.activityData.questions[key][$scope.activityData.questions[key].userAnswer], "25px Arial", "black");
                          $scope.resultsTotalRowAnswersTexts[key].textAlign = "center";
                          $scope.resultsTotalRowAnswersTexts[key].x = $scope.resultsTotalRowAnswersContainers[key].width / 2;
                          $scope.resultsTotalRowAnswersTexts[key].y = 5;
                          $scope.resultsTotalRowAnswersTexts[key].maxWidth = $scope.resultsTotalRowAnswersContainers[key].width;
                          $scope.resultsTotalRowAnswersContainers[key].addChild($scope.resultsTotalRowAnswersTexts[key]);


//**********

                          //Adding three mini containers that will hold the answers making click selection easier
                          //Answer Container A
                          $scope.resultsAnswersTableContainerA[key] = new createjs.Container();
                          $scope.resultsAnswersTableContainerA[key].width = 176;
                          $scope.resultsAnswersTableContainerA[key].height = 45;
                          $scope.resultsAnswersTableContainerA[key].x = 0;
                          $scope.resultsAnswersTableContainerA[key].y = 0;
                          $scope.resultsAnswersTableContainerA[key].visible = false;

                          var resultsAnswersTableContainerAGraphic = new createjs.Graphics().beginFill("azure").drawRect(0, 0, $scope.resultsAnswersTableContainerA[key].width, $scope.resultsAnswersTableContainerA[key].height);
                          var resultsAnswersTableContainerABackground = new createjs.Shape(resultsAnswersTableContainerAGraphic);
                          resultsAnswersTableContainerABackground.alpha = 0.5;
                          $scope.resultsAnswersTableContainerA[key].addChild(resultsAnswersTableContainerABackground);


                          //Answer Container B
                          $scope.resultsAnswersTableContainerB[key] = new createjs.Container();
                          $scope.resultsAnswersTableContainerB[key].width = 176;
                          $scope.resultsAnswersTableContainerB[key].height = 45;
                          $scope.resultsAnswersTableContainerB[key].x = 0;
                          $scope.resultsAnswersTableContainerB[key].y = 50;
                          $scope.resultsAnswersTableContainerB[key].visible = false;

                          var resultsAnswersTableContainerBGraphic = new createjs.Graphics().beginFill("azure").drawRect(0, 0, $scope.resultsAnswersTableContainerB[key].width, $scope.resultsAnswersTableContainerB[key].height);
                          var resultsAnswersTableContainerBBackground = new createjs.Shape(resultsAnswersTableContainerBGraphic);
                          resultsAnswersTableContainerBBackground.alpha = 0.5;
                          $scope.resultsAnswersTableContainerB[key].addChild(resultsAnswersTableContainerBBackground);


                          /** Checking if the question has answer C first!**/
                          if ($scope.activityData.questions[key].cChoice !== "") {
                            //Answer Container C
                            $scope.resultsAnswersTableContainerC[key] = new createjs.Container();
                            $scope.resultsAnswersTableContainerC[key].width = 176;
                            $scope.resultsAnswersTableContainerC[key].height = 45;
                            $scope.resultsAnswersTableContainerC[key].x = 0;
                            $scope.resultsAnswersTableContainerC[key].y = 100;
                            $scope.resultsAnswersTableContainerC[key].visible = false;

                            var resultsAnswersTableContainerCGraphic = new createjs.Graphics().beginFill("azure").drawRect(0, 0, $scope.resultsAnswersTableContainerC[key].width, $scope.resultsAnswersTableContainerC[key].height);
                            var resultsAnswersTableContainerCBackground = new createjs.Shape(resultsAnswersTableContainerCGraphic);
                            resultsAnswersTableContainerCBackground.alpha = 0.5;
                            $scope.resultsAnswersTableContainerC[key].addChild(resultsAnswersTableContainerCBackground);
                          }

                          /** Checking if the question has answer D first!**/
                          if ($scope.activityData.questions[key].dChoice !== "") {

                          }
//**********


                          /** A Choice **/
                          $scope.answerResultsATexts[key] = new createjs.Text($scope.activityData.questions[key].aChoice, "23px Arial", "black");
                          $scope.answerResultsATexts[key].x = $scope.resultsAnswersTableContainerA[key].width / 2;
                          $scope.answerResultsATexts[key].regX = $scope.answerResultsATexts[key].getBounds().width / 2;
                          $scope.answerResultsATexts[key].y = 6;
                          $scope.answerResultsATexts[key].visible = false;

                          /*Click event for the option A*/
                          $scope.resultsAnswersTableContainerA[key].addEventListener("pressup", function (event) {
                            console.log("Click on answer A!");
                            $scope.resultsAnswersOptionsTableContainer.visible = false;
                            $scope.resultsAnswersOptionsTable.visible = false;
                            $scope.activityData.questions[key].userAnswer = "aChoice";
                            //make the text of answerContainers
                            $scope.resultsTotalRowQuestionsTexts[key].text = $scope.activityData.questions[key][$scope.activityData.questions[key].userAnswer];
                            $scope.resultsTotalRowAnswersTexts[key].text = $scope.activityData.questions[key][$scope.activityData.questions[key].userAnswer];
                            $scope.resultsAnswersTableContainerA[key].visible = false;
                            $scope.answerResultsATexts[key].visible = false;
                            $scope.stage.update();


                          });


                          /** B Choice **/
                          $scope.answerResultsBTexts[key] = new createjs.Text($scope.activityData.questions[key].bChoice, "23px Arial", "black");
                          $scope.answerResultsBTexts[key].x = $scope.resultsAnswersTableContainerB[key].width / 2;
                          $scope.answerResultsBTexts[key].regX = $scope.answerResultsBTexts[key].getBounds().width / 2;
                          $scope.answerResultsBTexts[key].y = 6;
                          $scope.answerResultsBTexts[key].visible = false;

                          /*Click event for the option B*/
                          $scope.resultsAnswersTableContainerB[key].addEventListener("pressup", function (event) {
                            console.log("Click on answer B!");
                            $scope.resultsAnswersOptionsTableContainer.visible = false;
                            $scope.resultsAnswersOptionsTable.visible = false;
                            $scope.activityData.questions[key].userAnswer = "bChoice";
                            //make the text of answerContainers
                            $scope.resultsTotalRowQuestionsTexts[key].text = $scope.activityData.questions[key][$scope.activityData.questions[key].userAnswer];
                            $scope.resultsTotalRowAnswersTexts[key].text = $scope.activityData.questions[key][$scope.activityData.questions[key].userAnswer];
                            $scope.resultsAnswersTableContainerB[key].visible = false;
                            $scope.answerResultsBTexts[key].visible = false;
                            $scope.stage.update();
                          });


                          /** Checking if the question has answer C first!**/
                          if ($scope.activityData.questions[key].cChoice !== "") {
                            /** C Choice **/
                            $scope.answerResultsCTexts[key] = new createjs.Text($scope.activityData.questions[key].cChoice, "23px Arial", "black");
                            $scope.answerResultsCTexts[key].x = $scope.resultsAnswersTableContainerA[key].width / 2;
                            $scope.answerResultsCTexts[key].regX = $scope.answerResultsCTexts[key].getBounds().width / 2;
                            $scope.answerResultsCTexts[key].y = 6;
                            $scope.answerResultsCTexts[key].visible = false;

                            /*Click event for the option C*/
                            $scope.resultsAnswersTableContainerC[key].addEventListener("pressup", function (event) {
                              console.log("Click on answer C!");
                              $scope.resultsAnswersOptionsTableContainer.visible = false;
                              $scope.resultsAnswersOptionsTable.visible = false;
                              $scope.activityData.questions[key].userAnswer = "cChoice";
                              $scope.resultsTotalRowQuestionsTexts[key].text = $scope.activityData.questions[key][$scope.activityData.questions[key].userAnswer];
                              $scope.resultsTotalRowAnswersTexts[key].text = $scope.activityData.questions[key][$scope.activityData.questions[key].userAnswer];
                              $scope.resultsAnswersTableContainerC[key].visible = false;
                              $scope.answerResultsCTexts[key].visible = false;
                              $scope.stage.update();
                            });
                          }

                          /** Checking if the question has answer D first!**/
                          if ($scope.activityData.questions[key].dChoice !== "") {

                          }


                          /*Click event on resultsTotalRowAnswersContainers for choosing an option*/
                          $scope.resultsTotalRowAnswersContainers[key].addEventListener("pressup", function (event) {

                            //Making containers in choices invisible
                            _.each($scope.resultsAnswersTableContainerA, function (answer, key, list) {
                              $scope.resultsAnswersTableContainerA[key].visible = false;
                              $scope.resultsAnswersTableContainerB[key].visible = false;
                              /** Checking if the question has answer C first!**/
                              if ($scope.activityData.questions[key].cChoice !== "") {
                                $scope.resultsAnswersTableContainerC[key].visible = false;
                              }
                              /** Checking if the question has answer D first!**/
                              if ($scope.activityData.questions[key].dChoice !== "") {

                              }

                            });

                            //Making texts in choices invisible
                            _.each($scope.answerResultsATexts, function (answer, key, list) {
                              $scope.answerResultsATexts[key].visible = false;
                              $scope.answerResultsBTexts[key].visible = false;
                              /** Checking if the question has answer C first!**/
                              if ($scope.activityData.questions[key].cChoice !== "") {
                                $scope.answerResultsCTexts[key].visible = false;
                              }
                              /** Checking if the question has answer D first!**/
                              if ($scope.activityData.questions[key].dChoice !== "") {

                              }
                            });

                            console.log("Press up event on resultsTotalRowAnswersContainers with index: ", key);
                            $scope.resultsAnswersOptionsTable.y = $scope.resultsTotalRowContainers[key].y - 10;
                            $scope.resultsAnswersOptionsTableContainer.y = $scope.resultsAnswersOptionsTable.y + 20;

                            /*Making the background and the resultsAnswersOptionsTableContainer visible and dynamically appear on the y of clicked answer*/
                            if ($scope.activityData.completed) {
                              console.log("The activity has completed! Cannot select an answer...");
                            } else {
                              $scope.resultsAnswersOptionsTable.visible = true;
                              $scope.resultsAnswersOptionsTableContainer.visible = true;
                            }

                            /*Appearing only the choices of the selected answer, the disappearing is handled in choice's event*/
                            $scope.resultsAnswersTableContainerA[key].visible = true;
                            $scope.resultsAnswersTableContainerB[key].visible = true;
                            /** Checking if the question has answer C first!**/
                            if ($scope.activityData.questions[key].cChoice !== "") {
                              $scope.resultsAnswersTableContainerC[key].visible = true;
                            }
                            /** Checking if the question has answer D first!**/
                            if ($scope.activityData.questions[key].dChoice !== "") {

                            }

                            $scope.answerResultsATexts[key].visible = true;
                            $scope.answerResultsBTexts[key].visible = true;
                            /** Checking if the question has answer C first!**/
                            if ($scope.activityData.questions[key].cChoice !== "") {
                              $scope.answerResultsCTexts[key].visible = true;
                            }
                            /** Checking if the question has answer D first!**/
                            if ($scope.activityData.questions[key].dChoice !== "") {

                            }


                            $scope.stage.update();
                          });//end of click on resultsTotalRowAnswersContainers for choosing an answer


                          /*After all elements are loaded finally the resultsAnswersOptionsTable is loaded to get higher index*/
                          $scope.resultsTotalBackgroundContainer.addChild($scope.resultsAnswersOptionsTable);
                          $scope.resultsTotalBackgroundContainer.addChild($scope.resultsAnswersOptionsTableContainer);
                          $scope.resultsAnswersOptionsTableContainer.addChild($scope.resultsAnswersTableContainerA[key]);
                          $scope.resultsAnswersOptionsTableContainer.addChild($scope.resultsAnswersTableContainerB[key]);
                          /** Checking if the question has answer C first!**/
                          if ($scope.activityData.questions[key].cChoice !== "") {
                            $scope.resultsAnswersOptionsTableContainer.addChild($scope.resultsAnswersTableContainerC[key]);
                          }
                          /** Checking if the question has answer D first!**/
                          if ($scope.activityData.questions[key].dChoice !== "") {

                          }

                          $scope.resultsAnswersTableContainerA[key].addChild($scope.answerResultsATexts[key]);
                          $scope.resultsAnswersTableContainerB[key].addChild($scope.answerResultsBTexts[key]);
                          /** Checking if the question has answer C first!**/
                          if ($scope.activityData.questions[key].cChoice !== "") {
                            $scope.resultsAnswersTableContainerC[key].addChild($scope.answerResultsCTexts[key]);
                          }
                          /** Checking if the question has answer D first!**/
                          if ($scope.activityData.questions[key].dChoice !== "") {

                          }
                        });//end of each

                      });//end of resultsAnswersOptionsTableImageLoader

                      resultWaterfallCallback(null);

                    });//end of questionTextBackgroundImageLoader
                  },

                  /*Results Question*/
                  function (resultWaterfallCallback) {

                    //Creating container for results question
                    $scope.resultQuestionContainer = new createjs.Container();
                    $scope.resultQuestionContainer.width = 630;
                    $scope.resultQuestionContainer.height = 80;
                    $scope.resultQuestionContainer.x = 30;
                    $scope.resultQuestionContainer.y = 85;
                    $scope.resultsContainer.addChild($scope.resultQuestionContainer);

                    //resultQuestionContainer Background
                    /*var resultQuestionContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.resultQuestionContainer.width, $scope.resultQuestionContainer.height);
                     var resultQuestionContainerBackground = new createjs.Shape(resultQuestionContainerGraphic);
                     resultQuestionContainerBackground.alpha = 0.5;
                     $scope.resultQuestionContainer.addChild(resultQuestionContainerBackground);*/

                    //Creating the text element for the result question
                    $scope.resultQuestionText = new createjs.Text("", "25px Arial", "black");
                    $scope.resultQuestionText.x = 0;
                    $scope.resultQuestionText.y = 10;
                    $scope.resultQuestionText.maxWidth = $scope.resultQuestionContainer.width;
                    $scope.resultQuestionContainer.addChild($scope.resultQuestionText);

                    resultWaterfallCallback(null);
                  },

                  /*Results Answer*/
                  function (resultWaterfallCallback) {

                    //Creating container for results answer
                    $scope.resultAnswerContainer = new createjs.Container();
                    $scope.resultAnswerContainer.width = 200;
                    $scope.resultAnswerContainer.height = 70;
                    $scope.resultAnswerContainer.x = 320;
                    $scope.resultAnswerContainer.y = 195;
                    $scope.resultsContainer.addChild($scope.resultAnswerContainer);

                    //resultAnswerContainer Background
                    /*var resultAnswerContainerGraphic = new createjs.Graphics().beginFill("grey").drawRect(0, 0, $scope.resultAnswerContainer.width, $scope.resultAnswerContainer.height);
                     var resultAnswerContainerBackground = new createjs.Shape(resultAnswerContainerGraphic);
                     resultAnswerContainerBackground.alpha = 0.5;
                     $scope.resultAnswerContainer.addChild(resultAnswerContainerBackground);*/

                    //Creating the text element for the result answer
                    $scope.resultAnswerText = new createjs.Text("", "25px Arial", "red");
                    $scope.resultAnswerText.textAlign = "center";
                    $scope.resultAnswerText.x = $scope.resultAnswerContainer.width / 2;
                    $scope.resultAnswerText.y = $scope.resultAnswerContainer.height / 3.3;
                    $scope.resultAnswerText.maxWidth = $scope.resultAnswerContainer.width;
                    $scope.resultAnswerContainer.addChild($scope.resultAnswerText);

                    resultWaterfallCallback(null);
                  },

                  /*Results and Restart Buttons*/
                  function (resultWaterfallCallback) {

                    /*Waterfall for creating the Results and Restart buttons in results page*/
                    async.waterfall([
                      function (resultsButtonsWaterfallCallback) {

                        /*Creating the continue button*/
                        var continueButtonImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                          src: $scope.rootDir + "data/assets/soccer_results_continue.png"
                        }));
                        continueButtonImageLoader.load();

                        continueButtonImageLoader.on("complete", function (r) {

                          /*Creating Bitmap Background for continue button*/
                          $scope.continueButton = new createjs.Bitmap($scope.rootDir + "data/assets/soccer_results_continue.png");
                          $scope.continueButton.x = 40;
                          $scope.continueButton.y = 303;
                          $scope.resultsContainer.addChild($scope.continueButton);

                          /*Mouse down event*/
                          $scope.continueButton.addEventListener("mousedown", function (event) {
                            $scope.continueButton.alpha = 0.5;
                            $scope.stage.update();
                          });

                          /*Press up event*/
                          $scope.continueButton.addEventListener("pressup", function (event) {
                            $scope.continueButton.alpha = 1;
                            $scope.activeQuestionIndex++;
                            $scope.stage.update();
                            loadQuestion($scope.activeQuestionIndex);

                          });

                          resultsButtonsWaterfallCallback(null);
                        });//end of continueButtonImageLoader

                      },
                      function (resultsButtonsWaterfallCallback) {

                        /*Creating the restart button*/
                        var restartButtonImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                          src: $scope.rootDir + "data/assets/soccer_results_restart.png"
                        }));
                        restartButtonImageLoader.load();

                        restartButtonImageLoader.on("complete", function (r) {

                          /*Creating Bitmap Background for restart button*/
                          $scope.restartButton = new createjs.Bitmap($scope.rootDir + "data/assets/soccer_results_restart.png");
                          $scope.restartButton.x = 385;
                          $scope.restartButton.y = 303;
                          $scope.resultsContainer.addChild($scope.restartButton);

                          /*Mouse down event*/
                          $scope.restartButton.addEventListener("mousedown", function (event) {
                            $scope.restartButton.alpha = 0.5;
                            $scope.stage.update();
                          });

                          /*Press up event*/
                          $scope.restartButton.addEventListener("pressup", function (event) {
                            $scope.nextButton.gotoAndPlay("normal");
                            $scope.restartButton.alpha = 1;
                            $scope.activityData.completed = false;
                            $scope.stage.update();
                            loadQuestion($scope.activeQuestionIndex);
                          });

                          resultsButtonsWaterfallCallback(null);
                        });//end of restartButtonImageLoader

                      }
                    ], function (err, result) {
                      if (!err) {
                        console.log("Success in creating Continue and Restart buttons in results page!");
                        /*After waterfall for creating the result buttons finishes resultWaterfallCallback is called*/
                        resultWaterfallCallback(null);
                      } else {
                        console.error("Fail in creating Continue and Restart buttons in results page: ", err);
                        resultWaterfallCallback(true, err);
                      }
                    });
                  }

                ], function (err, results) {

                  if (!err) {
                    console.log("Success on adding Page description and Skip, goToResults Buttons!");
                    initWaterfallCallback(null);
                  } else {
                    console.log("Error on creating results page: ", err);
                    initWaterfallCallback(true, err);
                  }
                });
              }
            ],//end of functions

            /*init function's waterfall general callback*/
            function (err, result) {
              if (!err) {
                console.log("Success on init waterfall process!");
                loadQuestion($scope.activeQuestionIndex);
              } else {
                console.error("Error on init waterfall process: ", err);
              }
            });
        }

        /******************************************* PLAYING GAME - LOADING QUESTION *****************************************/

        /*Function that loads question according to $scope.activeQuestionIndex*/
        function loadQuestion(questionIndex) {

          if ($scope.activeQuestionIndex > $scope.activityData.questions.length - 1) {

            /*Question will not load...*/
            $scope.skipAnswerButton.alpha = 0.5;
            console.log("Question will not load! " + "activeQuestionIndex: " + $scope.activeQuestionIndex);
            return;

          } else {

            /*Question loads!*/

            //Making skipButton visible
            $scope.skipAnswerButton.alpha = 1;
            if ($scope.activeQuestionIndex === $scope.activityData.questions.length - 1) {
              console.log("Last element!");
              $scope.skipAnswerButton.alpha = 0.5;
            }
          }

          console.log("Question loads! " + "activeQuestionIndex: " + $scope.activeQuestionIndex);
          //Flag that secures no multiple animation will occur when user selects a choice
          $scope.userSelectedChoice = false;

          //Removing previous question before adding a new one
          $scope.questionTextContainer.removeAllChildren();


          async.waterfall([
              /*Loading question and answers*/
              function (loadQuestionWaterfallCallback) {
                /* 1. Loading Question Text*/
                console.log("Loading question for index: ", questionIndex);

                //Question index
                var indexNumber = new createjs.Text((questionIndex + 1) + ". ", "19px Arial", "black");
                indexNumber.x = 0;
                indexNumber.y = 0;
                $scope.questionTextContainer.addChild(indexNumber);

                //Pretext
                var pretext = new createjs.Text($scope.activityData.questions[questionIndex].pretext, "19px Arial", "black");
                pretext.x = indexNumber.x + indexNumber.getBounds().width;
                pretext.y = 0;
                $scope.questionTextContainer.addChild(pretext);


                //Underline
                var questionUnderline = new createjs.Text("__________", "19px Arial", "black");
                questionUnderline.x = pretext.x + pretext.getBounds().width;
                questionUnderline.y = pretext.y;
                $scope.questionTextContainer.addChild(questionUnderline);

                //Answer
                $scope.questionAnswer = new createjs.Text(" ", "19px Arial", "black");
                $scope.questionAnswer.x = questionUnderline.x + questionUnderline.getBounds().width / 2;
                $scope.questionAnswer.y = questionUnderline.y - 10;
                $scope.questionAnswer.textAlign = "center";
                $scope.questionTextContainer.addChild($scope.questionAnswer);


                if ($scope.activityData.questions[questionIndex].postext) {

                  var postexts = $scope.activityData.questions[questionIndex].postext.split("\n");
                  console.log("Postexts: ", postexts.length);
                  var currentPostexts = {};

                  if (postexts.length > 1) {
                    if (!postexts[0]) {
                      postexts[0] = " ";
                    }

                    currentPostexts[0] = new createjs.Text(postexts[0], "19px Arial", "black");
                    currentPostexts[0].x = questionUnderline.x + questionUnderline.getBounds().width;
                    currentPostexts[0].y = 0;
                    $scope.questionTextContainer.addChild(currentPostexts[0]);

                    currentPostexts[1] = new createjs.Text(postexts[1], "19px Arial", "black");
                    currentPostexts[1].x = pretext.x;
                    currentPostexts[1].y = currentPostexts[0].y + 28;
                    $scope.questionTextContainer.addChild(currentPostexts[1]);

                  } else {

                    currentPostexts[0] = new createjs.Text(postexts[0], "19px Arial", "black");
                    currentPostexts[0].x = questionUnderline.x + questionUnderline.getBounds().width;
                    currentPostexts[0].y = 0;
                    $scope.questionTextContainer.addChild(currentPostexts[0]);
                  }
                }


                /* 2. Loading Answers Texts*/
                $scope.answerAText.text = $scope.activityData.questions[questionIndex].aChoice;
                $scope.answerBText.text = $scope.activityData.questions[questionIndex].bChoice;

                if ($scope.activityData.questions[questionIndex].cChoice) {
                  $scope.answerCText.text = $scope.activityData.questions[questionIndex].cChoice;
                }

                loadQuestionWaterfallCallback(null);

              }
            ],
            //General callback
            function (err, results) {

              /*0. If resultsContainer is visible, make it invisible again AND make pageDescription and next button appear*/
              if ($scope.resultsContainer.visible) {
                $scope.resultsContainer.visible = false;
              }

              /*1. tween questionContainer back to stage*/
              createjs.Tween.get($scope.questionContainer, {loop: false})
                .to({
                  x: 150,
                  y: $scope.questionContainer.startingPointY
                }, 700, createjs.Ease.getPowIn(2));

              /*2. tween answerContainer back to stage*/
              createjs.Tween.get($scope.answersContainer, {loop: false})
                .to({
                  x: $scope.answersContainer.startingPointX,
                  y: 130
                }, 700, createjs.Ease.getPowIn(2));

              /*3. If playContainer is invisible make it visible again*/
              if (!$scope.playContainer.visible) {
                $scope.playContainer.visible = true;
              }
            });
        }//end of loadQuestion function


        //Flag that indicates selection is in progress
        $scope.selectionInProgress = false;

        /*Function for checking if answer was correct*/
        function check(questionIndex, userAnswer) {

          $scope.selectionInProgress = true;
          console.log("Checking if user answered right...Question Index: " + questionIndex + ", user answered: ", userAnswer);

          /* 0. Play strike */
          async.waterfall([
              function (goalWaterfallCallback) {
                $scope.golfPlayer.gotoAndPlay("striking");
                console.log("Player strikes the ball!");
                $timeout(function () {
                  goalWaterfallCallback(null);
                }, 1000);

              },
              /* 1. ball travelling */
              function (goalWaterfallCallback) {
                console.log("Ball's animation!");

                if (userAnswer === "aChoice") {
                  //The answer was right!
                  $scope.golfBall.gotoAndPlay("left");
                  $timeout(function () {
                    goalWaterfallCallback(null);
                  }, 4000);
                } else {
                  //The answer was wrong...
                  $scope.golfBall.gotoAndPlay("right");
                  $timeout(function () {
                    goalWaterfallCallback(null);
                  }, 3000);
                }
              },
              /* 2. Splash animation */
              function (goalWaterfallCallback) {
                if (userAnswer === "aChoice") {
                  //The answer was right!
                  $scope.ballSplash.gotoAndPlay("splash");
                  $timeout(function () {
                    goalWaterfallCallback(null);
                  }, 1000);
                } else {
                  //The answer was wrong...
                  $scope.ballSplashRight.gotoAndPlay("splash");
                  $timeout(function () {
                    goalWaterfallCallback(null);
                  }, 700);
                }
              }
            ],
            function (err, result) {

              $scope.stage.update();

              /* 1. Tween Question Container*/
              createjs.Tween.get($scope.questionContainer, {loop: false})
                .to({
                  x: 150,
                  y: -500
                }, 700, createjs.Ease.getPowIn(2));

              /* 2. Tween Answers Container*/
              createjs.Tween.get($scope.answersContainer, {loop: false})
                .to({
                  x: $scope.answersContainer.x + 500,
                  y: 130
                }, 700, createjs.Ease.getPowIn(2));

              /* 3. Disappear playContainer and making resultsContainer visible again*/
              $scope.playContainer.visible = false;
              $scope.resultsContainer.visible = true;

              //Removing previous elements
              $scope.resultQuestionContainer.removeAllChildren();

              /*------------------------------------------- POSTEXT TESTING --------------------------------------*/
              //Question index
              var indexNumber = new createjs.Text(($scope.activeQuestionIndex + 1) + ". ", "19px Arial", "black");
              indexNumber.x = 0;
              indexNumber.y = 0;
              $scope.resultQuestionContainer.addChild(indexNumber);


              //Pretext
              var pretext = new createjs.Text($scope.activityData.questions[$scope.activeQuestionIndex].pretext, "19px Arial", "black");
              pretext.x = indexNumber.x + indexNumber.getBounds().width;
              pretext.y = 0;
              $scope.resultQuestionContainer.addChild(pretext);


              //Underline
              var questionUnderline = new createjs.Text("__________", "19px Arial", "black");
              questionUnderline.x = pretext.x + pretext.getBounds().width;
              questionUnderline.y = pretext.y;
              $scope.resultQuestionContainer.addChild(questionUnderline);


              //Answer
              $scope.resultQuestionAnswer = new createjs.Text($scope.activityData.questions[$scope.activeQuestionIndex][$scope.activityData.questions[$scope.activeQuestionIndex].answerChoice], "19px Arial", "green");
              $scope.resultQuestionAnswer.x = questionUnderline.x + questionUnderline.getBounds().width / 2;
              $scope.resultQuestionAnswer.y = questionUnderline.y;
              $scope.resultQuestionAnswer.textAlign = "center";
              $scope.resultQuestionContainer.addChild($scope.resultQuestionAnswer);


              if ($scope.activityData.questions[$scope.activeQuestionIndex].postext) {

                var postexts = $scope.activityData.questions[$scope.activeQuestionIndex].postext.split("\n");
                console.log("Postexts: ", postexts.length);
                var currentPostexts = {};

                if (postexts.length > 1) {
                  if (!postexts[0]) {
                    postexts[0] = " ";
                  }

                  currentPostexts[0] = new createjs.Text(postexts[0], "19px Arial", "black");
                  currentPostexts[0].x = questionUnderline.x + questionUnderline.getBounds().width;
                  currentPostexts[0].y = 0;
                  $scope.resultQuestionContainer.addChild(currentPostexts[0]);

                  currentPostexts[1] = new createjs.Text(postexts[1], "19px Arial", "black");
                  currentPostexts[1].x = pretext.x;
                  currentPostexts[1].y = currentPostexts[0].y + 28;
                  $scope.resultQuestionContainer.addChild(currentPostexts[1]);

                } else {

                  currentPostexts[0] = new createjs.Text(postexts[0], "19px Arial", "black");
                  currentPostexts[0].x = questionUnderline.x + questionUnderline.getBounds().width;
                  currentPostexts[0].y = 0;
                  $scope.resultQuestionContainer.addChild(currentPostexts[0]);
                }
              }

              /*------------------------------------------- POSTEXT TESTING --------------------------------------*/

              //Saving user answer
              $scope.activityData.questions[questionIndex].userAnswer = userAnswer;

              console.log("User answered: ", userAnswer);
              $scope.resultAnswerText.text = $scope.activityData.questions[$scope.activeQuestionIndex][userAnswer];
              //Checking if the answer is right and changes the color
              if ($scope.activityData.questions[questionIndex].answerChoice === userAnswer) {
                $scope.resultAnswerText.color = "green";
              } else {
                $scope.resultAnswerText.color = "red";
              }

              //Selection process ended
              $scope.selectionInProgress = false;

            });

        }//end of check function

        /*Function for checking if there are already answered questions*/
        function updateResultsTotalQuestions() {
          _.each($scope.activityData.questions, function (question, key, list) {
            if ($scope.activityData.questions[key].userAnswer !== "") {
              //The question has been answered updating question text and answer text
              $scope.resultsTotalRowQuestionsTexts[key].text = $scope.activityData.questions[key][$scope.activityData.questions[key].userAnswer];
              $scope.resultsTotalRowAnswersTexts[key].text = $scope.activityData.questions[key][$scope.activityData.questions[key].userAnswer];
            }
          });
          $scope.stage.update();
          console.warn("Has it already answer: ", $scope.activityData.questions);
        }
      });//end of image on complete
    }, 500);//end of timeout
  });
