import Phaser from 'phaser';

import ScoreLabel from '../ui/ScoreLabel';

const ballKey = 'ball';
const paddleKey = 'paddle';
const brickKey = 'brick';
const paddeHitKey = 'paddlehit';
const brickHitKey = 'brickhit';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene');

    this.ball = undefined;
    this.paddle = undefined;
    this.canvas = undefined;
    this.cursors = undefined;
    this.bricks = undefined;
    this.scoreLabel = undefined;

    // physics variables
    this.velocity = 0;
    this.acceleration = 12.8;
    this.maxVelocity = 180;
    this.drag = 8;
  }

  preload() {
    this.load.image(ballKey, 'assets/ball.png');
    this.load.image(paddleKey, 'assets/paddle.png');
    this.load.image(brickKey, 'assets/brick.png');

    // load audio
    this.load.audio(paddeHitKey, 'assets/114187__edgardedition__thud17.wav');
    this.load.audio(brickHitKey, 'assets/478284__joao-janz__finger-tap-2-2.wav');

    this.canvas = this.sys.game.canvas;
  }

  create() {
    this.ball = this.createBall();
    this.paddle = this.createPaddle();
    this.bricks = this.createBricks();
    this.scoreLabel = this.createScoreLabel(5, 5, 0);

    this.physics.add.collider(this.ball, this.paddle, this.ballHitPaddle, null, this);
    this.physics.add.collider(this.ball, this.bricks, this.ballHitBrick, null, this);

    this.setBallVelocity(this.ball);

    this.physics.world.on("worldbounds", this.detectBounds, this);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // check for paddle movement
    if (this.cursors.left.isDown) {
      this.velocity -= this.acceleration;
    } else if (this.cursors.right.isDown) {
      this.velocity += this.acceleration;
    } else {
      if (this.velocity > 0) {
        this.velocity -= this.drag;
      } else {
        this.velocity += this.drag;
      }
    }
    if (Math.abs(this.velocity) > this.maxVelocity) {
      if (this.velocity < 0) {
        this.velocity = this.maxVelocity * -1;
      } else {
        this.velocity = this.maxVelocity;
      }
    }
    this.paddle.setVelocityX(this.velocity);
  }

  setBallVelocity(ball) {
    ball.setVelocity(150, -150);
  }

  createBall() {
    const ball = this.physics.add.sprite(this.canvas.width * 0.5, this.canvas.height - 25, ballKey).setOrigin(0.5);
    ball.setCollideWorldBounds(true);
    ball.setBounce(1);
    ball.body.onWorldBounds = true;
    return ball;
  }

  createPaddle() {
    const paddle = this.physics.add.sprite(this.canvas.width * 0.5, this.canvas.height - 5, paddleKey).setOrigin(0.5, 1);
    paddle.setCollideWorldBounds(true);
    paddle.body.immovable = true;

    return paddle;
  }

  createBricks() {
    const bricks = this.physics.add.staticGroup();
    const brickInfo = {
      width: 50,
      height: 20,
      count: {
          row: 3,
          col: 7
      },
      offset: {
          top: 50,
          left: 60
      },
      padding: 10
    };
    for (let column = 0; column < brickInfo.count.col; column++) {
      for (let row = 0; row < brickInfo.count.row; row++) {
        let brickX = (column * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
        let brickY = (row * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;;

        bricks.create(brickX, brickY, brickKey);
      }
    }
    return bricks;
  }

  createScoreLabel(x, y, score) {
    const style = { fontSize: '20px', fontFamily: 'Arial', stokeThickness: 0.6, fill: '#EEE' };
    const label = new ScoreLabel(this, x, y, score, style);

    this.add.existing(label);

    return label;
  }

  ballHitBrick(ball, brick) {
    brick.disableBody(true, true);
    this.sound.play(brickHitKey);

    this.scoreLabel.add(50);
  }

  ballHitPaddle(ball, paddle) {
    this.sound.play(paddeHitKey);
  }

  detectBounds(body, blockedUp, blockedDown, blockedLeft, blockedRight) {
    if (blockedDown) {
      alert('game over!');
      location.reload();
    }
  }
}