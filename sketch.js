var PLAY = 1;
var END = 0;
var END1 = 2;
var gameState = PLAY;

var trex, trex_running, trex_collided;
var ground, invisibleGround, groundImage;

var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6;
var bird, birdMoving;
var bullet;

var score, highScore;

var gameOverImg,restartImg
var jumpSound , checkPointSound, dieSound
var level

function preload(){
  trex_running = loadAnimation("trex1.png","trex3.png","trex4.png");
  trex_collided = loadAnimation("trex_collided.png");
  
  groundImage = loadImage("ground2.png");
  
  cloudImage = loadImage("cloud.png");
  
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png"); 
  obstacle6 = loadImage("obstacle6.png");
  
  birdMoving = loadAnimation("birdupimage.png","birddownimage.png");
  birdCollided = loadAnimation("birddownimage.png");
  
  restartImg = loadImage("restart.png")
  gameOverImg = loadImage("gameOver.png")
  
  jumpSound = loadSound("jump.mp3")
  dieSound = loadSound("die.mp3")
  checkPointSound = loadSound("checkPoint.mp3")
}

function setup() {
  createCanvas(windowWidth,windowHeight);
  
  trex = createSprite(50,height-130,20,50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided" ,trex_collided);
  trex.scale = 0.5;
  
  ground = createSprite(width/2,height-100,width,20);
  ground.addImage("ground",groundImage);
  ground.x = width /2;
  
   gameOver = createSprite(width/2,height/2- 50);
  gameOver.addImage(gameOverImg);
  
  restart = createSprite(width/2,height/2);
  restart.addImage(restartImg);
  
  gameOver.scale = 0.7;
  restart.scale = 0.7;
  
  invisibleGround = createSprite(0,height-90,400,10);
  invisibleGround.visible = false;
  
  //create Obstacle and Cloud Groups
  obstaclesGroup = createGroup();
  cloudsGroup = createGroup();
  birdsGroup = createGroup();  
  bulletsGroup = createGroup();
  
  console.log("Hello" + 5);
  
  trex.setCollider("circle",0,0,40);
  //trex.debug = true

  score = 0;
  highScore = 0;
  level = 0;
}

function draw() {
  
  background("white");
  
  if(score>800) {
    background("black");
  }
  
  //displaying score
  textSize(30)
  text("Score: "+ score, width/2,height/2-300);
  text("high score: "+ highScore, width/2-500, height/2-300)
  text("LEVEL: "+ level, 200, 50)

  // console.log("this is ",gameState)
  
  
  if(gameState === PLAY){
    gameOver.visible = false
    restart.visible = false
    //move the ground
    ground.velocityX = -6-score/100;
    //scoring
    score = score + Math.round(getFrameRate()/60);
    if(score%100===0&&score>0) {
      checkPointSound.play();
    }
    if (ground.x < width/2-100){
      ground.x = width/2;
    }
    
    if (highScore<score) {
      highScore=score;
    }
    console.log(ground.y);
    
    //jump when the space key is pressed
    if(touches.length>0||keyDown("space")&& trex.y >= height-125) {
        trex.velocityY = -12;
      jumpSound.play();
      touches=[];
    }
    
    
      
   if(score%1000===0&&score>0) {
     level=level+1
   gameState=END1
   }
  

    if(bulletsGroup.isTouching(birdsGroup)) {
       birdsGroup[0].destroy();
     }
      
   if(birdsGroup.isTouching(trex)) {
     gameState=END;
   }
    
    //add gravity
    trex.velocityY = trex.velocityY + 0.8
  
    //spawn the clouds
    spawnClouds();
  
    //spawn obstacles on the ground
    spawnObstacles();
    
    //spawn the birds
    if(score>500) {
     spawnBirds();
     if(keyDown("w")||touches.length>0) {
      bullets();
      touches=[];
     }
    }
    if(obstaclesGroup.isTouching(trex)){
       gameState = END;
      dieSound.play();
    }   
  }
   else if (gameState === END) { 
     // console.log("hey")s
      gameOver.visible = true;
      restart.visible = true;
     
      ground.velocityX = 0;
      trex.velocityY = 0;
      birdsGroup.setVelocityXEach(0);
      birdsGroup.setLifetimeEach(-1);
      if(score>800){
        bird.addAnimation("still", birdCollided);
        bird.changeAnimation("still",birdCollided);
      }
      //change the trex animation
      trex.changeAnimation("collided", trex_collided);
     
     if(mousePressedOver(restart)||touches.length>0) {
      reset();
      touches=[];
     }
     
      //set lifetime of the game objects so that they are never destroyed
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);
     
     obstaclesGroup.setVelocityXEach(0);
     cloudsGroup.setVelocityXEach(0);
   }
   if(gameState===END1) {
     text("completed level " +level,200,80)
     text("press 1 to continue", 150,100);
    ground.velocityX = 0;
    trex.velocityY = 0;
    birdsGroup.setVelocityXEach(0);
    birdsGroup.setLifetimeEach(-1);
    if(score>800){
      bird.addAnimation("still", birdCollided);
      bird.changeAnimation("still",birdCollided);
    }
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);
  
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);
   //change the trex animation
    trex.changeAnimation("collided", trex_collided);
   }
   if(keyDown("1")&& gameState === END1) {
    gameState=PLAY;
    obstaclesGroup.destroyEach();
    cloudsGroup.destroyEach();
    birdsGroup.destroyEach();
    trex.changeAnimation("running", trex_running);
  }

 
  //stop trex from falling down
  trex.collide(invisibleGround);
  
  
  
  drawSprites();
}

function spawnObstacles(){
 if (frameCount % 100 === 0){
   var obstacle = createSprite(width+20,height-120,10,40);
   obstacle.velocityX = -6-score/100;
   console.log(obstacle.velocityX);
   
    //generate random obstacles
    var rand = Math.round(random(1,6));
    switch(rand) {
      case 1: obstacle.addImage(obstacle1);
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      case 3: obstacle.addImage(obstacle3);
              break;
      case 4: obstacle.addImage(obstacle4);
              break;
      case 5: obstacle.addImage(obstacle5);
              break;
      case 6: obstacle.addImage(obstacle6);
              break;
      default: break;
    }
   
    //assign scale and lifetime to the obstacle           
    obstacle.scale = 0.5;
    obstacle.lifetime = 2000;
   
   //add each obstacle to the group
    obstaclesGroup.add(obstacle);
 }
}

function spawnClouds() {
  //write code here to spawn the clouds
  if (frameCount % 60 === 0) {
    cloud = createSprite(width+20,height-300,40,10);
    cloud.y = Math.round(random(height-600,height-400));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    
     //assign lifetime to the variable
    cloud.lifetime = 2000;
    
    //adjust the depth
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //adding cloud to the group
   cloudsGroup.add(cloud);
    }
}

function spawnBirds() {
  //write the code to spawn the birds
  if (frameCount%120 === 0&&score>50) {
    bird = createSprite(width+20,height-300,40,10);
    bird.y = Math.round(random(height-300,height-100));
    bird.addAnimation("birdflying", birdMoving);
    bird.setCollider("rectangle",0,0,200,200);
    bird.scale = 0.05;
    bird.velocityX = -3;
   // bird.debug=true;
   
     //assign lifetime to the variable
    bird.lifetime = 2000;
    
    
    
    birdsGroup.add(bird)
  }
}

function reset() {
   gameState=PLAY;
   obstaclesGroup.destroyEach();
   cloudsGroup.destroyEach();
   birdsGroup.destroyEach();
   score=0;
   trex.changeAnimation("running", trex_running);
   level = 0;
}

function bullets() {
   bullet=createSprite(trex.x,trex.y,7,5);
   bullet.velocityX=3;
   bullet.lifetime=50;
   bulletsGroup.add(bullet);
}