angular.module("bookbuilder2")
  .controller("educationController", function ($scope, $ionicPlatform, $timeout, $http, _, $rootScope) {

    console.log("educationController loaded!");
    $scope.rootDir = window.localStorage.getItem("rootDir");
    $scope.selectedLesson = JSON.parse(window.localStorage.getItem("selectedLesson"));
    $scope.book = JSON.parse(window.localStorage.getItem("book"));
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
        src: $scope.rootDir + "data/assets/education_background_image.png"
      }));

      imageLoader.load();

      /*IMAGE LOADER COMPLETED*/
      imageLoader.on("complete", function (r) {

        console.log("Image Loaded...");

        /*Creating Bitmap Background for Canvas*/
        var background = new createjs.Bitmap($scope.rootDir + "data/assets/education_background_image.png");

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

        /*Every time the user selects a letter, it will be added to the following array*/
        $scope.selectedLettersArray = [];
        /* ------------------------------------------ MAIN CONTAINER ---------------------------------------------- */
        $scope.mainContainer = new createjs.Container();
        $scope.mainContainer.width = background.image.width;
        $scope.mainContainer.height = background.image.height;
        $scope.mainContainer.scaleX = $scope.mainContainer.scaleY = $scope.scale;
        $scope.mainContainer.x = backgroundPosition.x;
        $scope.mainContainer.y = backgroundPosition.y;
        $scope.stage.addChild($scope.mainContainer);

        //mainContainer Background
        var mainContainerGraphic = new createjs.Graphics().beginFill("green").drawRect(0, 0, $scope.mainContainer.width, $scope.mainContainer.height);
        var mainContainerBackground = new createjs.Shape(mainContainerGraphic);
        mainContainerBackground.alpha = 0.5;

        $scope.mainContainer.addChild(mainContainerBackground);


        /* ------------------------------------------ MENU BUTTON ---------------------------------------------- */

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
              createjs.Tween.removeAllTweens();
              menuButton.gotoAndPlay("normal");
              $scope.stage.update();
              $rootScope.navigate("lessonNew");
            });

            menuButton.scaleX = menuButton.scaleY = $scope.scale * ($scope.book.headMenuButtonScale ? $scope.book.headMenuButtonScale : 1);
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

          console.warn("There is no activity...Getting the json through $http.get()");

          console.log("selectedLesson.id: ", $scope.selectedLesson.id);
          console.log("activityFolder: ", $scope.activityFolder);

          $http.get($scope.rootDir + "data/lessons/" + $scope.selectedLesson.id + "/" + $scope.activityFolder + "/education.json")
            .success(function (response) {
              console.log("Success on getting json for the url. The response object is: ", response);

              //Assigning configured response to activityData
              $scope.activityData = response;
              $scope.activityData.attempts = 0;
              $scope.activityData.newGame = true;
              $scope.activityData.questionIndex = 0;

              /*Adding the userChoices array attribute to response object before assigning it to activityData*/
              _.each($scope.activityData.questions, function (question, key, value) {
                $scope.activityData.questions[key].userChoices = [];
                $scope.activityData.questions[key].questionCompleted = false;
                $scope.activityData.questions[key].questionIsRight = false;
              });

              init();

              //Saving it to localStorage
              window.localStorage.setItem(activityNameInLocalStorage, JSON.stringify($scope.activityData));
              console.warn("Saving to local storage...");
            })
            .error(function (error) {
              console.error("Error on getting json for the url...:", error);
            });
        }

        /******************************************* INIT *****************************************/
        function init() {

          //1. Finding the length of question and divide game into questions/2 steps
          console.log("Number of questions: ", $scope.activityData.questions.length);
          console.log("Questions: ", $scope.activityData.questions);

          //Initializing general score
          $scope.activityData.score = 0;
          save();
          //2. Building the questionWords sprites

          async.waterfall([
              //Page description
              function (questionWaterfallCallback) {
                /*Adding page title and description*/
                $scope.pageTitle = new createjs.Text($scope.selectedLesson.lessonTitle + " - " + $scope.selectedLesson.title, "22px Arial", "white");
                $scope.pageTitle.x = 120;
                $scope.pageTitle.y = 8;
                $scope.pageTitle.maxWidth = 500;
                $scope.mainContainer.addChild($scope.pageTitle);

                /*Adding page title and description $scope.activityData.title*/
                $scope.pageActivity = new createjs.Text(_.findWhere($scope.selectedLesson.activitiesMenu, {
                    activityFolder: $scope.activityFolder
                  }).name + " " + ($scope.activityData.revision ? "- " + $scope.activityData.revision : ""), "20px Arial", "white");
                $scope.pageActivity.x = 85;
                $scope.pageActivity.y = 620;
                $scope.pageActivity.maxWidth = 550;
                $scope.mainContainer.addChild($scope.pageActivity);

                /*Adding page title and description*/
                $scope.pageDescription = new createjs.Text($scope.activityData.description, "20px Arial", "white");
                $scope.pageDescription.x = 85;
                $scope.pageDescription.y = 640;
                $scope.pageDescription.maxWidth = 250;
                $scope.mainContainer.addChild($scope.pageDescription);
                questionWaterfallCallback(null);
              },

              //Creating the backgrounds
              function (questionWaterfallCallback) {
                var questionWordImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                  src: $scope.rootDir + "data/assets/education_question_background.png"
                }));
                questionWordImageLoader.load();

                questionWordImageLoader.on("complete", function (r) {

                  /*Creating Image background for word A*/
                  $scope.questionWordBackground = new createjs.Bitmap($scope.rootDir + "data/assets/education_question_background.png");
                  $scope.questionWordBackground.x = 70;
                  $scope.questionWordBackground.y = 80;
                  $scope.mainContainer.addChild($scope.questionWordBackground);

                  questionWaterfallCallback(null);

                });

              },

              /*Adding the score Text element*/
              function (questionWaterfallCallback) {
                $scope.scoreText = new createjs.Text("Score: " + "0" + " / " + $scope.activityData.questions.length, "30px Arial", "white");
                $scope.scoreText.x = 390;
                $scope.scoreText.y = 560;
                $scope.mainContainer.addChild($scope.scoreText);

                updateScore();

                questionWaterfallCallback(null);
              },
              function (initWaterfallCallback) {

                $http.get($scope.rootDir + "data/assets/lesson_end_button_sprite.json")
                  .success(function (response) {
                    response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];
                    var resultsButtonSpriteSheet = new createjs.SpriteSheet(response);
                    $scope.resultsButton = new createjs.Sprite(resultsButtonSpriteSheet, "normal");
                    $scope.resultsButton.x = 790;
                    $scope.resultsButton.y = 635;
                    $scope.resultsButton.scaleX = $scope.resultsButton.scaleY = 0.6;
                    $scope.mainContainer.addChild($scope.resultsButton);

                    $scope.endText = new createjs.Text("RESULTS", "25px Arial", "white");
                    $scope.endText.x = 820;
                    $scope.endText.y = 625;
                    $scope.mainContainer.addChild($scope.endText);

                    $scope.resultsButton.visible = false;
                    $scope.endText.visible = false;

                    $scope.resultsButton.addEventListener("mousedown", function (event) {
                      console.log("mousedown event on a button !");
                      $scope.resultsButton.gotoAndPlay("onSelection");
                      $scope.stage.update();
                    });
                    $scope.resultsButton.addEventListener("pressup", function (event) {
                      console.log("pressup event!");
                      $scope.resultsButton.gotoAndPlay("normal");
                      $scope.stage.update();
                      $rootScope.navigate("results");
                    });

                    initWaterfallCallback();
                  })
                  .error(function (error) {
                    console.error("Error on getting json for results button...", error);
                    initWaterfallCallback();
                  });
              },
              /*Adding the nextActivity button*/
              function (questionWaterfallCallback) {

                console.warn("Adding nextActivity button");

                $http.get($scope.rootDir + "data/assets/next_activity_drag_and_drop_sprite.json")
                  .success(function (response) {
                    response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];
                    var nextButtonSpriteSheet = new createjs.SpriteSheet(response);
                    $scope.nextButton = new createjs.Sprite(nextButtonSpriteSheet, "normal");

                    $scope.nextButton.addEventListener("mousedown", function (event) {
                      console.log("Mouse down event on a button !", !$scope.activityData.newGame);
                      if (!$scope.activityData.newGame) {
                        $scope.nextButton.gotoAndPlay("selected");
                      }
                      $scope.stage.update();
                    });
                    $scope.nextButton.addEventListener("pressup", function (event) {
                      console.log("Press up event!");

                      if (!$scope.activityData.newGame) {
                        $scope.nextButton.gotoAndPlay("onSelection");
                        $scope.stage.update();
                        $rootScope.nextActivity($scope.selectedLesson, $scope.activityFolder);
                      }
                    });
                    $scope.nextButton.x = 830;
                    $scope.nextButton.y = 640;
                    $scope.mainContainer.addChild($scope.nextButton);
                    questionWaterfallCallback(null);
                  })
                  .error(function (error) {
                    console.log("Error on getting json data for check button...", error);
                    questionWaterfallCallback(true, error);
                  });
              },

              //Creating the question texts
              function (questionWaterfallCallback) {

                /*Adding the first question text*/
                $scope.questionText = new createjs.Text("", "30px Arial", "white");
                $scope.questionText.x = 100;
                $scope.questionText.y = 100;
                $scope.questionText.maxWidth = 315;
                $scope.mainContainer.addChild($scope.questionText);

                questionWaterfallCallback(null);

              },

              //Loading the puzzle sprite for each letter
              function (questionWaterfallCallback) {
                $http.get($scope.rootDir + "data/assets/education_puzzle.json")
                  .success(function (response) {
                    console.log("Success on getting json for the letter's puzzle sprite!");
                    response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];

                    //Exposing letter puzzle spriteSheet to $scope so it can be accessible by the next function
                    $scope.letterPuzzleSpriteSheet = new createjs.SpriteSheet(response);

                    questionWaterfallCallback(null);
                  })
                  .error(function (error) {

                    console.error("Error on getting json data for the letter's puzzle sprite: ", error);
                    questionWaterfallCallback(true, error);
                  });
              },

              //Next Question button
              function (questionWaterfallCallback) {
                $http.get($scope.rootDir + "data/assets/education_next_questions.json")
                  .success(function (response) {
                    console.log("Success on getting json for the next question button sprite!");
                    response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];

                    //Exposing letter puzzle spriteSheet to $scope so it can be accessible by the next function
                    var nextQuestionButtonSpriteSheet = new createjs.SpriteSheet(response);

                    $scope.nextQuestionButton = new createjs.Sprite(nextQuestionButtonSpriteSheet, "normal");

                    $scope.nextQuestionButton.addEventListener("mousedown", function (event) {
                      console.log("Mouse down event on Menu button !");
                      $scope.nextQuestionButton.gotoAndPlay("onSelection");
                      $scope.stage.update();
                    });

                    $scope.nextQuestionButton.addEventListener("pressup", function (event) {
                      console.log("Press up event on Menu event!");
                      $scope.nextQuestionButton.gotoAndPlay("normal");
                      $scope.stage.update();
                      nextQuestion();
                    });

                    $scope.nextQuestionButton.x = 840;
                    $scope.nextQuestionButton.y = 505;
                    $scope.mainContainer.addChild($scope.nextQuestionButton);
                    questionWaterfallCallback(null);
                  })
                  .error(function (error) {
                    console.error("Error on getting json data for the next button sprite: ", error);
                    questionWaterfallCallback(true, error);
                  });
              },

              //Previous button
              function (questionWaterfallCallback) {
                $http.get($scope.rootDir + "data/assets/education_previous_questions.json")
                  .success(function (response) {
                    console.log("Success on getting json for the previous question button sprite!");
                    response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];

                    //Exposing letter puzzle spriteSheet to $scope so it can be accessible by the previous function
                    var previousButtonSpriteSheet = new createjs.SpriteSheet(response);

                    $scope.previousButton = new createjs.Sprite(previousButtonSpriteSheet, "normal");
                    $scope.previousButton.visible = false;

                    $scope.previousButton.addEventListener("mousedown", function (event) {
                      console.log("Mouse down event on Menu button !");
                      $scope.previousButton.gotoAndPlay("onSelection");
                      $scope.stage.update();
                    });

                    $scope.previousButton.addEventListener("pressup", function (event) {
                      console.log("Press up event on Menu event!");
                      $scope.previousButton.gotoAndPlay("normal");
                      $scope.stage.update();
                      previousQuestion();
                    });

                    $scope.previousButton.x = 780;
                    $scope.previousButton.y = 505;
                    $scope.mainContainer.addChild($scope.previousButton);
                    questionWaterfallCallback(null);
                  })
                  .error(function (error) {
                    console.error("Error on getting json data for the previous button sprite: ", error);
                    questionWaterfallCallback(true, error);
                  });
              },

              //Building the user answers array
              function (questionWaterfallCallback) {

                $scope.answerWordLettersContainers = {};
                $scope.answerWordBackgroundImages = {};

                async.waterfall([

                    //First loading the background image of each container
                    function (answerWordWaterfallCallback) {
                      var answerWordBackgroundImageLoader = new createjs.ImageLoader(new createjs.LoadItem().set({
                        src: $scope.rootDir + "data/assets/education_letter_placeholder.png"
                      }));

                      answerWordBackgroundImageLoader.load();
                      answerWordBackgroundImageLoader.on("complete", function (r) {

                        /*Creating Bitmap Background for continue button*/
                        $scope.answerWordBackground = new createjs.Bitmap($scope.rootDir + "data/assets/education_letter_placeholder.png");
                        $scope.answerWordBackground.x = 0;
                        $scope.answerWordBackground.y = 0;

                        answerWordWaterfallCallback(null);
                      });
                    },

                    //Next populating the answerWordLetters
                    function (answerWordWaterfallCallback) {

                      //It will be a 18 sized pre-build word
                      for (var i = 0; i < 16; i++) {

                        //Creating a letter container
                        $scope.answerWordLettersContainers[i] = new createjs.Container();
                        $scope.answerWordLettersContainers[i].width = $scope.answerWordBackground.getBounds().width;
                        $scope.answerWordLettersContainers[i].height = $scope.answerWordBackground.getBounds().height;
                        $scope.answerWordLettersContainers[i].x = i === 0 ? 60
                          : $scope.answerWordLettersContainers[0].x + i * 53;
                        $scope.answerWordLettersContainers[i].y = 145;
                        $scope.mainContainer.addChild($scope.answerWordLettersContainers[i]);


                        //Make it invisible
                        $scope.answerWordLettersContainers[i].visible = false;


                        //Adding the background
                        $scope.answerWordBackgroundImages[i] = $scope.answerWordBackground.clone();
                        $scope.answerWordBackgroundImages[i].scaleX = $scope.answerWordBackgroundImages[i].scaleY = 1.2;
                        $scope.answerWordLettersContainers[i].addChild($scope.answerWordBackgroundImages[i]);

                        // var answerWordLettersContainersGraphic = new createjs.Graphics().beginFill("red").drawRect(0, 0, $scope.answerWordLettersContainers[i].width, $scope.answerWordLettersContainers[i].height);
                        // var answerWordLettersContainersBackground = new createjs.Shape(answerWordLettersContainersGraphic);
                        // answerWordLettersContainersBackground.alpha = 0.5;
                        // $scope.answerWordLettersContainers[i].addChild(answerWordLettersContainersBackground);
                      }

                      answerWordWaterfallCallback(null);
                    }
                  ],
                  //General callback
                  function (error, result) {
                    if (error) {
                      console.error("There was an error on building answers array...");
                      questionWaterfallCallback(true, result);
                    } else {
                      console.log("Success on building answers array!");
                      questionWaterfallCallback(null);
                    }
                  });
              },

              //Building the right letters
              function (questionWaterfallCallback) {

                console.log("Building right letters array...");

                $scope.rightLettersSprites = {};
                $scope.rightLettersTexts = {};
                $scope.rightLettersContainers = {};

                async.waterfall([

                    //Next populating the answerWordLetters
                    function (rightLettersWaterfallCallback) {

                      _.each(new Array(16), function (element, key, list) {
                        //Adding a sprite for the right letter
                        $scope.rightLettersSprites[key] = new createjs.Sprite($scope.letterPuzzleSpriteSheet, "red_puzzle");
                        $scope.rightLettersSprites[key].x = 0;
                        $scope.rightLettersSprites[key].y = 0;

                        //Creating a container for the right letter
                        $scope.rightLettersContainers[key] = new createjs.Container();
                        $scope.rightLettersContainers[key].width = $scope.rightLettersSprites[key].getBounds().width;
                        $scope.rightLettersContainers[key].height = $scope.rightLettersSprites[key].getBounds().height;
                        $scope.rightLettersContainers[key].x = key === 0 ? 60
                          : $scope.rightLettersContainers[0].x + key * 53;
                        $scope.rightLettersContainers[key].y = key === 0 ? 200
                          : 200;

                        //Finally adding text for the right letter
                        $scope.rightLettersTexts[key] = new createjs.Text("", "30px Arial", "white");
                        $scope.rightLettersTexts[key].x = $scope.rightLettersContainers[key].width / 2.3;
                        $scope.rightLettersTexts[key].y = $scope.rightLettersContainers[key].height / 3.5;

                        $scope.rightLettersContainers[key].addChild($scope.rightLettersSprites[key]);
                        $scope.rightLettersContainers[key].addChild($scope.rightLettersTexts[key]);
                        $scope.rightLettersContainers[key].visible = false;
                        $scope.mainContainer.addChild($scope.rightLettersContainers[key]);

                      });

                      rightLettersWaterfallCallback(null);
                    }
                  ],
                  //General callback
                  function (error, result) {
                    if (error) {
                      console.error("There was an error on building right letters array...");
                      questionWaterfallCallback(true, result);
                    } else {
                      console.log("Success on building right letters array!");
                      questionWaterfallCallback(null);
                    }
                  });
              },

              //Building the scrambled english word arrays
              function (questionWaterfallCallback) {

                //Containers for each letter
                $scope.scrambledEnglishLetterContainers = {};
                //Puzzle sprites for each letter
                $scope.scrambledEnglishLetterSprites = {};
                //Text for each letter
                $scope.scrambledEnglishLetterTexts = {};

                _.each(new Array(16), function (element, key, list) {

                  //Adding a sprite for the letter
                  $scope.scrambledEnglishLetterSprites[key] = new createjs.Sprite($scope.letterPuzzleSpriteSheet, "normal");
                  $scope.scrambledEnglishLetterSprites[key].x = 0;
                  $scope.scrambledEnglishLetterSprites[key].y = 0;

                  //Creating a container for the letter
                  $scope.scrambledEnglishLetterContainers[key] = new createjs.Container();
                  $scope.scrambledEnglishLetterContainers[key].width = $scope.scrambledEnglishLetterSprites[key].getBounds().width;
                  console.log("bounds: ", $scope.scrambledEnglishLetterSprites[0].getBounds());
                  $scope.scrambledEnglishLetterContainers[key].height = $scope.scrambledEnglishLetterSprites[key].getBounds().height;
                  $scope.scrambledEnglishLetterContainers[key].x = key === 0 ? 60
                    : $scope.scrambledEnglishLetterContainers[0].x + key * 53;
                  $scope.scrambledEnglishLetterContainers[key].y = key === 0 ? 370
                    : 370;

                  $scope.scrambledEnglishLetterContainers[key].startingPointX = $scope.scrambledEnglishLetterContainers[key].x;
                  $scope.scrambledEnglishLetterContainers[key].startingPointY = $scope.scrambledEnglishLetterContainers[key].y;


                  /*Mouse down event*/
                  $scope.scrambledEnglishLetterContainers[key].on("mousedown", function (evt) {
                    //Check if completed
                    if (!$scope.activityData.newGame) {
                      console.warn("Activity completed cannot move!");
                      return;
                    }
                    if ($scope.activityData.questions[$scope.activityData.questionIndex].questionCompleted) {
                      console.warn("Current question completed cannot move!");
                      return;
                    }
                    var global = $scope.mainContainer.localToGlobal(this.x, this.y);
                    this.offset = {
                      'x': global.x - evt.stageX,
                      'y': global.y - evt.stageY
                    };
                    this.global = {
                      'x': global.x,
                      'y': global.y
                    };

                    return true;
                  });

                  /*Press move event*/
                  $scope.scrambledEnglishLetterContainers[key].on("pressmove", function (evt) {
                    //Check if completed
                    if (!$scope.activityData.newGame) {
                      console.warn("Activity completed cannot move!");
                      return;
                    }
                    if ($scope.activityData.questions[$scope.activityData.questionIndex].questionCompleted) {
                      console.warn("Current question completed cannot move!");
                      return;
                    }
                    var local = $scope.mainContainer.globalToLocal(evt.stageX + this.offset.x, evt.stageY + this.offset.y);
                    this.x = local.x;
                    this.y = local.y;

                    return true;
                  });

                  /*Press up event*/
                  $scope.scrambledEnglishLetterContainers[key].on("pressup", function (evt) {

                    //Check if completed
                    if (!$scope.activityData.newGame) {
                      console.warn("Activity completed cannot move!");
                      return;
                    }
                    if ($scope.activityData.questions[$scope.activityData.questionIndex].questionCompleted) {
                      console.warn("Current question completed cannot move!");
                      return;
                    }

                    console.log("Press up event while dropping the letter!");

                    var collisionDetectedQuestion = collision(evt.stageX / $scope.scale - $scope.mainContainer.x / $scope.scale, evt.stageY / $scope.scale - $scope.mainContainer.y / $scope.scale);

                    if (collisionDetectedQuestion !== -1) {

                      //There is collision
                      console.log("There is collision! : ", collisionDetectedQuestion);

                      this.x = $scope.answerWordLettersContainers[collisionDetectedQuestion].x;
                      this.y = $scope.answerWordLettersContainers[collisionDetectedQuestion].y;

                      //Adding the selected word to current userChoices
                      $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[collisionDetectedQuestion] = $scope.scrambledEnglishLetterTexts[key].text;
                      console.log("Updated userChoices : ", $scope.activityData.questions[$scope.activityData.questionIndex].userChoices);

                      //Saving it to localStorage
                      window.localStorage.setItem(activityNameInLocalStorage, JSON.stringify($scope.activityData));
                      console.warn("Saving to local storage...");

                    } else {

                      /*No collision going back to start point*/
                      createjs.Tween.get(this, {loop: false})
                        .to({
                          x: this.startingPointX,
                          y: this.startingPointY
                        }, 200, createjs.Ease.getPowIn(2));

                      //If the user deselects a letter it has to be removed from the userChoices array
                    }

                    return true;
                  });//end of press up event


                  //Make it invisible
                  $scope.scrambledEnglishLetterContainers[key].visible = false;
                  $scope.scrambledEnglishLetterContainers[key].addChild($scope.scrambledEnglishLetterSprites[key]);

                  //Finally adding text for the letter
                  $scope.scrambledEnglishLetterTexts[key] = new createjs.Text("", "30px Arial", "white");
                  $scope.scrambledEnglishLetterTexts[key].x = $scope.scrambledEnglishLetterContainers[key].width / 2.3;
                  $scope.scrambledEnglishLetterTexts[key].y = $scope.scrambledEnglishLetterContainers[key].height / 3.5;
                  $scope.scrambledEnglishLetterContainers[key].addChild($scope.scrambledEnglishLetterTexts[key]);
                  $scope.mainContainer.addChild($scope.scrambledEnglishLetterContainers[key]);
                });

                questionWaterfallCallback(null);
              },

              //Creating Help button
              function (questionWaterfallCallback) {

                $http.get($scope.rootDir + "data/assets/education_help.json")
                  .success(function (response) {

                    //Reassigning images with the rest of resource
                    response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];

                    var helpButtonSpriteSheet = new createjs.SpriteSheet(response);
                    var helpButton = new createjs.Sprite(helpButtonSpriteSheet, "normal");

                    helpButton.addEventListener("mousedown", function (event) {
                      console.log("Mouse down event on Help button event!");
                      helpButton.gotoAndPlay("onSelection");
                    });

                    helpButton.addEventListener("pressup", function (event) {
                      console.log("Press up event on Help button event!");
                      helpButton.gotoAndPlay("normal");

                      var englishWordLettersArray = getEnglishWordLettersArray();

                      //Finding and positioning the first and the last letter
                      var firstLetterIndex = _.findKey($scope.scrambledEnglishLetterTexts, {"text": englishWordLettersArray[0]});
                      var lastLetterIndex = _.findKey($scope.scrambledEnglishLetterTexts, {"text": englishWordLettersArray[englishWordLettersArray.length - 1]});

                      console.log(firstLetterIndex);
                      console.log(lastLetterIndex);

                      //Positioning the found letters
                      createjs.Tween.get($scope.scrambledEnglishLetterContainers[firstLetterIndex], {loop: false})
                        .to({
                          x: $scope.answerWordLettersContainers[0].x,
                          y: $scope.answerWordLettersContainers[0].y
                        }, 200, createjs.Ease.getPowIn(2));

                      createjs.Tween.get($scope.scrambledEnglishLetterContainers[lastLetterIndex], {loop: false})
                        .to({
                          x: $scope.answerWordLettersContainers[englishWordLettersArray.length - 1].x,
                          y: $scope.answerWordLettersContainers[englishWordLettersArray.length - 1].y
                        }, 200, createjs.Ease.getPowIn(2));

                      $scope.stage.update();

                      //Adding the first and the last letter, auto-selected by Help button, in userChoices!
                      $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[0] = $scope.scrambledEnglishLetterTexts[firstLetterIndex].text;
                      $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[englishWordLettersArray.length - 1] = $scope.scrambledEnglishLetterTexts[lastLetterIndex].text;
                      console.log("Updated userChoices : ", $scope.activityData.questions[$scope.activityData.questionIndex].userChoices);

                      //Saving it to localStorage
                      console.warn("Saving to local storage...");
                      window.localStorage.setItem(activityNameInLocalStorage, JSON.stringify($scope.activityData));

                    });

                    helpButton.x = 500;
                    helpButton.y = 110;

                    $scope.mainContainer.addChild(helpButton);
                    questionWaterfallCallback(null);

                  })
                  .error(function (error) {
                    console.error("Error on getting json for Help button...", error);
                    questionWaterfallCallback(true, error);
                  });

              },

              //Creating Restart button
              function (questionWaterfallCallback) {
                $http.get($scope.rootDir + "data/assets/education_restart.json")
                  .success(function (response) {

                    //Reassigning images with the rest of resource
                    response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];

                    var restartButtonSpriteSheet = new createjs.SpriteSheet(response);
                    var restartButton = new createjs.Sprite(restartButtonSpriteSheet, "normal");

                    restartButton.addEventListener("mousedown", function (event) {
                      console.log("Mouse down event on Restart event!");
                      restartButton.gotoAndPlay("onSelection");
                      $scope.stage.update()

                    });

                    restartButton.addEventListener("pressup", function (event) {
                      console.log("Press up event on Restart event!");
                      restartButton.gotoAndPlay("normal");

                      /** NOTE: Restarting question process is a distinct function now
                       * because Next question and Previous question share the same code **/
                      restartQuestion();
                      $scope.stage.update()

                    });

                    restartButton.x = 600;
                    restartButton.y = 115;

                    $scope.mainContainer.addChild(restartButton);
                    questionWaterfallCallback(null);

                  })
                  .error(function (error) {
                    console.error("Error on getting json for Restart button...", error);
                    questionWaterfallCallback(true, error);
                  });
              },
              //Creating Check button
              function (questionWaterfallCallback) {
                $http.get($scope.rootDir + "data/assets/education_check.json")
                  .success(function (response) {

                    //Reassigning images with the rest of resource
                    response.images[0] = $scope.rootDir + "data/assets/" + response.images[0];

                    var checkButtonSpriteSheet = new createjs.SpriteSheet(response);
                    var checkButton = new createjs.Sprite(checkButtonSpriteSheet, "normal");

                    checkButton.addEventListener("mousedown", function (event) {
                      console.log("Mouse down event on Check button event!");
                      checkButton.gotoAndPlay("onSelection");
                      $scope.stage.update()

                    });

                    checkButton.addEventListener("pressup", function (event) {
                      console.log("Press up event on Check button event!");


                      if (!$scope.activityData.questions[$scope.activityData.questionIndex].questionCompleted) {
                        checkButton.gotoAndPlay("normal");
                        checkQuestion();
                        $scope.stage.update()
                      }


                    });

                    checkButton.x = 700;
                    checkButton.y = 115;

                    $scope.mainContainer.addChild(checkButton);
                    questionWaterfallCallback(null);

                  })
                  .error(function (error) {
                    console.error("Error on getting json for check button...", error);
                    questionWaterfallCallback(true, error);
                  });
              }
            ],
            //General callback
            function (error, result) {

              if (error) {
                console.error("There was an error on building waterfall during init(): ", error);
              } else {
                console.log("Success on building waterfall during init() process!");
                buildQuestion($scope.activityData.questionIndex);
              }

            });

        }//end of function init()


        /******************************************* PLAYING GAME - LOADING QUESTIONS *****************************************/

        /*Function that build the questions according to the question step*/
        function buildQuestion() {

          //Updating the question texts. Index that is printed along with question text has to be index + 1 to avoid 0
          $scope.questionText.text = $scope.activityData.questionIndex + 1 + ". " + $scope.activityData.questions[$scope.activityData.questionIndex].greekWord;

          //If Check has pushed in other question or Restart has been pushed, eliminating any Check effect
          _.each($scope.scrambledEnglishLetterSprites, function (sprite, key, list) {
            $scope.scrambledEnglishLetterSprites[key].gotoAndPlay("normal");
            $scope.scrambledEnglishLetterContainers[key].visible = false;
          });
          _.each($scope.scrambledEnglishLetterContainers, function (letter, key, list) {
            createjs.Tween.get($scope.scrambledEnglishLetterContainers[key], {loop: false})
              .to({
                x: $scope.scrambledEnglishLetterContainers[key].startingPointX,
                y: $scope.scrambledEnglishLetterContainers[key].startingPointY
              }, 200, createjs.Ease.getPowIn(2));
          });
          _.each($scope.rightLettersTexts, function (text, key, list) {
            $scope.rightLettersTexts[key].text = "";
          });
          _.each($scope.rightLettersContainers, function (text, key, list) {
            $scope.rightLettersContainers[key].visible = false;
          });


          //------------- STARTING QUESTION BUILDING -------------
          $scope.englishWordArray = getEnglishWordLettersArray();

          //English word letters array
          console.log("English word: ", $scope.englishWordArray);

          //Building the answerWordLettersContainers
          _.each($scope.answerWordLettersContainers, function (letter, key, list) {
            $scope.answerWordLettersContainers[key].visible = false;
          });
          _.each($scope.englishWordArray, function (letter, key, list) {
            $scope.answerWordLettersContainers[key].visible = $scope.englishWordArray[key] !== "_";
          });

          //Shuffling englishWordArray...
          $scope.englishWordArray = _.shuffle($scope.englishWordArray);
          console.log("Scrambled english word: ", $scope.englishWordArray);

          //moving empty letters to the end
          $scope.englishWordArray = _.without($scope.englishWordArray, '_').concat(_.filter($scope.englishWordArray, function (item) {
            return item === "_";
          }));
          console.log("After dealing with gap element: ", $scope.englishWordArray);

          _.each($scope.englishWordArray, function (letter, key, list) {
            //Assigning the letters and if there is a gap it makes it invisible
            $scope.scrambledEnglishLetterContainers[key].visible = $scope.englishWordArray[key] !== "_";
            $scope.scrambledEnglishLetterTexts[key].text = $scope.englishWordArray[key];
            $scope.scrambledEnglishLetterTexts[key].chosen = false;
          });


          $timeout(function () {
            //Checking if the user has completed the question
            if ($scope.activityData.questions[$scope.activityData.questionIndex].questionCompleted) {

              console.log("The answer has been already completed!!!");

              //1. Fill the letters
              _.each($scope.activityData.questions[$scope.activityData.questionIndex].userChoices, function (selectedLetter, key, list) {
                if ($scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key] !== "" && $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key]) {


                  var letterIndex = _.findKey($scope.scrambledEnglishLetterTexts, {
                    "text": $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key],
                    "chosen": false
                  });

                  createjs.Tween.get($scope.scrambledEnglishLetterContainers[letterIndex], {loop: false})
                    .to({
                      x: $scope.answerWordLettersContainers[key].x,
                      y: $scope.answerWordLettersContainers[key].y
                    }, 200, createjs.Ease.getPowIn(2));

                  $scope.scrambledEnglishLetterTexts[letterIndex].chosen = true;
                }
              });

              //2. Check the automatically filled question
              $timeout(function () {
                checkQuestion();
              }, 300);


              // Checking if the user has already chosen letters
            } else if ($scope.activityData.questions[$scope.activityData.questionIndex].userChoices.length > 0) {
              console.log("There are letters already selected! ", $scope.activityData.questions[$scope.activityData.questionIndex].userChoices);

              _.each($scope.activityData.questions[$scope.activityData.questionIndex].userChoices, function (selectedLetter, key, list) {
                if ($scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key] !== "" && $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key]) {

                  console.log("The chosen letter : ", $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key]);

                  var letterIndex = _.findKey($scope.scrambledEnglishLetterTexts, {
                    "text": $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key],
                    "chosen": false
                  });

                  console.log("The index of chosen letter that found: ", letterIndex);

                  createjs.Tween.get($scope.scrambledEnglishLetterContainers[letterIndex], {loop: false})
                    .to({
                      x: $scope.answerWordLettersContainers[key].x,
                      y: $scope.answerWordLettersContainers[key].y
                    }, 200, createjs.Ease.getPowIn(2));

                  $scope.scrambledEnglishLetterTexts[letterIndex].chosen = true;

                }
              });
            }
            else {
              console.log("No chosen letters in userChoices!");
            }
          }, 300);


        }//end of build function


        //Function that increments the question step
        function nextQuestion() {
          if ($scope.activityData.questionIndex < $scope.activityData.questions.length - 1) {
            $scope.activityData.questionIndex++;
            buildQuestion();
          } else {
            console.warn("Maximum question index reached!");
          }

          if ($scope.activityData.questionIndex === $scope.activityData.questions.length - 1) {
            $scope.previousButton.visible = true;
            $scope.nextQuestionButton.visible = false;
          } else {
            $scope.nextQuestionButton.visible = true;
            $scope.previousButton.visible = true;
          }
        }


        //Function that decrements the question step
        function previousQuestion() {
          if ($scope.activityData.questionIndex > 0) {
            $scope.activityData.questionIndex--;
            buildQuestion();
          } else {
            console.warn("Minimum question index reached!");
          }

          if ($scope.activityData.questionIndex === 0) {
            $scope.nextQuestionButton.visible = true;
            $scope.previousButton.visible = false;
          } else {
            $scope.previousButton.visible = true;
            $scope.nextQuestionButton.visible = true;
          }
        }


        /*Function that handles collision*/
        function collision(x, y) {

          console.log("Collision stageX: ", x);
          console.log("Collision stageY: ", y);

          var emptyAnswerWordLetterContainer = true;

          for (var i = 0; i < $scope.englishWordArray.length; i++) {
            if (ionic.DomUtil.rectContains(
                x,
                y,
                $scope.answerWordLettersContainers[i].x,
                $scope.answerWordLettersContainers[i].y,
                $scope.answerWordLettersContainers[i].x + $scope.answerWordLettersContainers[i].width,
                $scope.answerWordLettersContainers[i].y + $scope.answerWordLettersContainers[i].height)) {

              //Checking if there is already a letter
              _.each($scope.englishWordArray, function (letter, key, list) {
                if ($scope.scrambledEnglishLetterContainers[key].x === $scope.answerWordLettersContainers[i].x
                  && $scope.scrambledEnglishLetterContainers[key].y === $scope.answerWordLettersContainers[i].y) {
                  emptyAnswerWordLetterContainer = false;
                }
              });

              //Last check if there is already a letter in the container collision happened
              if (!emptyAnswerWordLetterContainer) {
                console.warn("There is collision but there is already a letter in this position...");
                return -1;

                //There is collision but the container is deactivated, probably a gap...
              } else if (!$scope.answerWordLettersContainers[i].visible) {
                console.warn("There is collision but the container is deactivated, probably a gap...");
                return -1;

              } else {
                //There is collision
                console.log("Collision returns: ", i);
                return i;
              }
            }
          }
          //No collision
          return -1;
        }

        /*Function that updates the score*/
        function getEnglishWordLettersArray() {
          //Creating the english word letters array for the current question
          var lettersOfTheWord = $scope.activityData.questions[$scope.activityData.questionIndex].englishWord.split("");
          _.each(lettersOfTheWord, function (letter, key, list) {
            if (lettersOfTheWord[key] === " ") {
              lettersOfTheWord[key] = "_";
            }
          });
          return lettersOfTheWord;
        }


        //Function for restarting a question array
        function restartQuestion() {
          //1. Re-positioning all puzzle pieces back

          _.each($scope.scrambledEnglishLetterContainers, function (letter, key, list) {
            createjs.Tween.get($scope.scrambledEnglishLetterContainers[key], {loop: false})
              .to({
                x: $scope.scrambledEnglishLetterContainers[key].startingPointX,
                y: $scope.scrambledEnglishLetterContainers[key].startingPointY
              }, 200, createjs.Ease.getPowIn(2));
            $scope.stage.update()
          });

          //2. Making everything invisible again
          _.each($scope.scrambledEnglishLetterContainers, function (letter, key, list) {
            $scope.scrambledEnglishLetterContainers[key].visible = false;
          });
          _.each($scope.answerWordLettersContainers, function (letter, key, list) {
            $scope.answerWordLettersContainers[key].visible = false;
          });
          _.each($scope.rightLettersContainers, function (letter, key, list) {
            $scope.rightLettersContainers[key].visible = false;
          });
          //3. Erasing any saved letters the user chose
          // _.each($scope.activityData.questions[$scope.activityData.questionIndex].userChoices, function (chosenLetter, key, list) {
          //     $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key] = "";
          // });
          $scope.activityData.questions[$scope.activityData.questionIndex].userChoices = [];

          //5. Change activityCompleted property to false
          $scope.activityData.questions[$scope.activityData.questionIndex].questionCompleted = false;
          $scope.activityData.questions[$scope.activityData.questionIndex].questionIsRight = false;
          $scope.activityData.newGame = true;
          $scope.nextButton.gotoAndPlay("normal");

          //Saving it to localStorage
          console.warn("Saving to local storage...");
          window.localStorage.setItem(activityNameInLocalStorage, JSON.stringify($scope.activityData));

          //7. Update score again
          updateScore();

          // Re-build the selected question
          buildQuestion($scope.activityData.questionIndex);
        }


        //Function for checking question
        function checkQuestion() {

          console.log("userChoices that it will be checked: ", $scope.activityData.questions[$scope.activityData.questionIndex].userChoices);
          var userChoicesWord = _.compact($scope.activityData.questions[$scope.activityData.questionIndex].userChoices).join("");
          console.log("The userChoices word: ", userChoicesWord);
          console.log("The right word: ", _.without($scope.activityData.questions[$scope.activityData.questionIndex].englishWord, ' ').join(""));

          //Checking if it's correct
          if (userChoicesWord === _.without($scope.activityData.questions[$scope.activityData.questionIndex].englishWord, ' ').join("")) {
            //--CORRECT--

            //Make all sprites green
            _.each($scope.scrambledEnglishLetterSprites, function (sprite, key, list) {
              $scope.scrambledEnglishLetterSprites[key].gotoAndPlay("green_puzzle");
            });

            //Mark the question as right
            $scope.activityData.questions[$scope.activityData.questionIndex].questionIsRight = true;

            //Update score
            updateScore();

          } else {
            //--WRONG--, checking and indicating mistakes

            //Checking selected letters one by one, if there is an unfilled letter or a wrong letter the right letter appears beneath.
            var englishWordLettersArray = getEnglishWordLettersArray();
            _.each(englishWordLettersArray, function (chosenLetter, key, list) {
              if ($scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key] !== englishWordLettersArray[key] && englishWordLettersArray[key] !== "_") {
                //For every wrong letter the right letter appears
                $scope.rightLettersContainers[key].visible = true;
                $scope.rightLettersTexts[key].text = $scope.activityData.questions[$scope.activityData.questionIndex].userChoices[key];
              }
            });

            //Moving the letters to the right position building the right word
            var tempScrambledEnglishLetterTexts = $scope.englishWordArray;
            _.each(englishWordLettersArray, function (chosenLetter, key, list) {
              var rightLetterIndex = _.indexOf(tempScrambledEnglishLetterTexts, chosenLetter);
              tempScrambledEnglishLetterTexts[rightLetterIndex] = "";
              createjs.Tween.get($scope.scrambledEnglishLetterContainers[rightLetterIndex], {loop: false})
                .to({
                  x: $scope.answerWordLettersContainers[key].x,
                  y: $scope.answerWordLettersContainers[key].y
                }, 200, createjs.Ease.getPowIn(2));
            });
          }

          //Mark question as completed
          $scope.activityData.questions[$scope.activityData.questionIndex].questionCompleted = true;

          //Checking if all questions are completed for enabling nextActivity button
          if (!_.findWhere($scope.activityData.questions, {"questionCompleted": false})) {
            //Updating score
            $scope.activityData.completed = true;

            if (_.findIndex($scope.selectedLesson.activitiesMenu, {
                activityFolder: $scope.activityFolder
              }) + 1 === $scope.selectedLesson.activitiesMenu.length) {

              $scope.resultsButton.visible = true;
              $scope.endText.visible = true;
              $scope.nextButton.visible = false;
            }

            if ($scope.activityData.newGame) {
              $scope.activityData.attempts += 1;
              $scope.activityData.newGame = false;
            }

            $scope.nextButton.gotoAndPlay("onSelection");
          }

          save();

        }


        function save() {
          window.localStorage.setItem(activityNameInLocalStorage, JSON.stringify($scope.activityData));
        }


        /*Function that updates the score*/
        function updateScore() {
          console.log("Updating Score!");
          var rightAnswers = 0;
          _.each($scope.activityData.questions, function (question, key, list) {
            if ($scope.activityData.questions[key].questionIsRight) {
              rightAnswers++;
            }
          });
          //Finally updating the text
          $scope.scoreText.text = "Score: " + rightAnswers + " / " + $scope.activityData.questions.length;
          $scope.activityData.score = rightAnswers;
          $scope.stage.update();
          save();
        }

      });//end of image on complete
    }, 500);//end of timeout
  });
