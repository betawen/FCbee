<template>
  <div id="fcbee">
    <div id="canvas">
    </div>
  </div>
</template>

<script>
  import config from '../assets/config'
export default {
  name: 'fcbee',
  data () {
    return {
      onloadComplete: false,
      title: 'fcbee',
      isLandscape: false,
    }
  },
  created() {
    window.onload = () => {
      this.onloadComplete = true;
      document.title = this.title;
    }
  },
  mounted() {
    this.listenEvent();
  },
  methods: {
    listenEvent() {
      this.init();
      window.addEventListener('resize', () => {
        this.init();
      })
    },
    // if needed this should be a common func
    getCanvasSize() {
      let w = document.body.clientWidth;
      let h = document.body.clientHeight;
      // init as iphone 6/7
      let layoutWidth = 414, layoutHeight = 736;
      let gameRatio = layoutWidth / layoutHeight;
      let canvasWidth, canvasHeight;
      if (w <= h) {
        this.isLandscape = false;
        //  竖版
        if (w / h >= gameRatio) {
          //保证高度上全部可见
          canvasHeight = layoutHeight, canvasWidth = layoutHeight * w / h;
        } else {
          //保证宽度上全部可见
          canvasHeight = layoutWidth / w * h, canvasWidth = layoutWidth;
        }
      } else {
        this.isLandscape = true;
        // 横版
        if (h / w >= gameRatio) {
          //保证宽度上全部可见
          canvasWidth = layoutHeight, canvasHeight = layoutHeight / w * h;
        } else {
          //保证高度上全部可见
          canvasWidth = layoutWidth / h * w, canvasHeight = layoutWidth;
        }
      }
      console.log(`%c canvasWidth:${~~canvasWidth} | canvasHeight:${~~canvasHeight} `, 'background:#4682B4;color:white;line-height:18px');
      return {canvasWidth, canvasHeight}
    },
    init() {
      const self = this;
      let {canvasWidth, canvasHeight} = this.getCanvasSize();
      let CENTER_X = canvasWidth / 2, CENTER_Y = canvasHeight / 2;
      let player;
      let aliens;
      let bullets;
      let cursors;
      let fireButton;
      let explosions;
      let starfield;
      let score = 0;
      let scoreString = 'Score : ';
      let scoreText;
      let stateText;
      let lives;
      let enemyBullet;
      let enemyBullets;
      let firingTimer = 0;
      let bulletTime = 0;
      let livingEnemies = [];
      // let _config = {
      //   height: canvasHeight,
      //   width: canvasHeight,
      //   render: Phaser.CANVAS,
      //   parent: 'canvas',
      // };
      if(this.game && this.game.hasOwnProperty('destory')) {
        this.game.destory();
      }
      /**
       * <canvas> 元素是由框架自动生成的。我们是通过 Phaser.Game 创建一个对象并赋给了 game 变量来完成初始化的。参数的含义是：
       width 和 height 设置了 <canvas> 宽高.
       渲染方式。有三个选项分别是 AUTO，CANVAS 和 WEBGL。我们可以指定使用 Canvas 还是 WebGL 来渲染，如果使用了 Auto 则优先使用 WebGL，如果浏览器不支持则会选择 Canvas。
       <canvas> 的 id。如果该参数有值，则使用该值作为 canvas 标签的 id，我们传入 null，则 phaser 会决定 canvas 的 id 值。
       第四个参数指定了 phaser 的三个生命周期所对应的函数。我们使用相同的名字来让程序更清晰
       preload 进行资源的加载。
       create 会在资源加载完成后执行一次。
       update 会一直循环执行来处理每一帧动画。*/
      let game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, 'canvas', {
        preload: preload,
        create: create,
        update: update,
        render: render
      });
      this.game = {};
      this.game.destroy = () => {
        game.destroy(true);
      };
      function preload () {
          this.init = function () {
            // 水平和垂直居中画布
            game.pageAlignHorizontally = true;
            game.pageAlignVertically = true;
            /** scaleMode 有几个不同的选项来指定 Canvas 应该如何缩放：
             * NO_SCALE — 不进行任何缩放。
             * EXACT_FIT — 拉伸，填充屏幕，不保留长宽比。
             * SHOW_ALL — 等比缩放，填充屏幕，保留长宽比，剩余空间用黑色填充。
             * RESIZE — 动态，每次都会根据屏幕生成画布，所以你需要在游戏运行时动态的放置游戏元素。这是一种进阶的模式。
             * USER_SCALE — 自定义，允许您自己计算大小和比例。这也是一种进阶的模式。
             */
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
          };
          // this.preload = () => {
            game.load.image('bullet', config.bullet);
            game.load.image('enemyBullet', config["enemy-bullet"]);
            game.load.spritesheet('invader', config.invader32x32x4, 32, 32);
            game.load.image('ship', config.player);
            game.load.spritesheet('kaboom', config.explode, 128, 128);
            game.load.image('starfield', config.starfield);
            game.load.image('background', config.invader);
          // }
        };
      function create () {
          // Phaser与三个不同的物理引擎（Arcade Physics，P2和Ninja Physics）捆绑在一起，第四个选项Box2D可作为商业插件使用。
          // 对于像我们这样的简单游戏，我们可以使用Arcade Physics引擎。我们不需要任何重的几何计算 - 毕竟只是一个球从墙壁和砖块弹起来。
          // 首先，让我们在游戏中初始化Arcade Physics引擎。physics.startSystem()在create函数开头添加方法（使其成为函数内的第一行），如下所示：
          game.physics.startSystem(Phaser.Physics.Arcade);

          //  The scrolling starfield background
          // A TileSprite is a Sprite that has a repeating texture.
          // The texture can be scrolled and scaled independently of the TileSprite itself.
          starfield = game.add.tileSprite(0, 0, canvasWidth, canvasHeight, 'starfield');

          bullets = game.add.group();
          /**
           * If true all Sprites created with #create or {@link #createMulitple} will have a physics body created on them.
           * Change the body type with #physicsBodyType.*/
          bullets.enabledBody = true;
          bullets.physicsBodyType = Phaser.Physics.Arcade;
          bullets.createMultiple(30, 'bullet');
          // set all childs
          bullets.setAll('anchor.x', 0.5);
          bullets.setAll('anchor.y', 1);
          bullets.setAll('outOfBoundsKill', true);
          bullets.setAll('checkWorldBounds', true);

          // The enemy's bullets
          enemyBullets = game.add.group();
          enemyBullets.enableBody = true;
          enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
          enemyBullets.createMultiple(30, 'enemyBullet');
          enemyBullets.setAll('anchor.x', 0.5);
          enemyBullets.setAll('anchor.y', 1);
          enemyBullets.setAll('outOfBoundsKill', true);
          enemyBullets.setAll('checkWorldBounds', true);

          //  The hero!
          player = game.add.sprite(400, 500, 'ship');
          player.anchor.setTo(0.5, 0.5);
          game.physics.enable(player, Phaser.Physics.ARCADE);

          //  The baddies!
          aliens = game.add.group();
          aliens.enableBody = true;
          aliens.physicsBodyType = Phaser.Physics.ARCADE;

          // 左右移动敌人
          function createAliens() {
            for (let x = 0; x < 10; x ++) {
              for (let y = 0; y < 4; y ++) {
                let alien = aliens.create(x * 48, y * 50, 'invader');
                alien.anchor.setTo(0.5, 0.5);
                alien.animation.add('fly', [1, 2, 3, 4], 20, true);
                alien.play('fly');
                alien.body.moves = false;
              }
            }

            aliens.x = 100;
            aliens.y = 50;

            // func to: dest as object, duration, ease, austart, delay, repeate, reverse
            let tween = game.add.tween(aliens).to({x: 200}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
            tween.onLoop.add(() => {
              aliens.y += 10;
            }, self);
          }
        createAliens();

          //  The score
          scoreText = game.add.text(10, 10, scoreString + score, { font: '24px Arial', fill: '#fff' });

          //  Lives
          lives = game.add.group();
          // show lives
          game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '24px Arial', fill: '#fff' });

          // add lives icon
          for (var i = 0; i < 3; i++)
          {
            var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
            ship.anchor.setTo(0.5, 0.5);
            ship.angle = 90;
            ship.alpha = 0.6;
          }

          //  Text
          stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
          stateText.anchor.setTo(0.5, 0.5);
          stateText.visible = false;

          //  An explosion pool
          explosions = game.add.group();
          explosions.createMultiple(30, 'kaboom');
          explosions.forEach((invader) => {
            invader.anchor.x = 0.5;
            invader.anchor.y = 0.5;
            invader.animations.add('kaboom');
          }, self);
          //  And some controls to play the game with
          cursors = game.input.keyboard.createCursorKeys();
          fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      };

      function update () {
        // update by frame
          starfield.tilePositionY += 2;

          if (player.alive) {

            player.body.velocity.setTo(0, 0);

            if (cursors.left.isDown) {
              player.x -= 200;
            }else if (cursors.right.isDown) {
              player.y += 200;
            }

            if (fireButton.isDown) {
              // fire bullet
              fireBullet();
            }

            if (game.time.now > firingTimer) {
              // enermy fires
              enemyFires();
            }

            //  Run collision
            //  Checks for overlaps between two game objects.
            game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, self);
            game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, self);
          }
      };

      function render () {};

      function fireBullet() {
        if (game.time.now > bulletTime) {
          // If true, find the first existing child;
          // otherwise find the first non-existing child.
          bullet = bullets.getFirstExists(false);
          if (bullet) {
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 150;
          }
        }
      };

      function enemyFires() {
        enemyBullet = enemyBullets.getFirstExists(false);
        livingEnemies.length = 0;
        aliens.forEachAlive(function (alien) {
          livingEnemies.push(alien);
        });
        if (enemyBullet && livingEnemies.length > 0) {
          let random = game.rnd.integerInRange(0, livingEnemies.length - 1 );
          let shooter = livingEnemies[random];
          enemyBullet.reset(shooter.body.x, shooter.body.y);
          // Move the given display object towards the destination object at a steady velocity.
          game.physics.arcade.moveToObject(enemyBullet, player, 150);
          firingTimer = game.time.now + 2000;
        }
      };

      function collisionHandler (bullet, alien) {

        //  When a bullet hits an alien we kill them both
        bullet.kill();
        alien.kill();

        //  Increase the score
        score += 20;
        scoreText.text = scoreString + score;

        //  And create an explosion :)
        var explosion = explosions.getFirstExists(false);
        explosion.reset(alien.body.x, alien.body.y);
        explosion.play('kaboom', 30, false, true);

        // how to win
        if (aliens.countLiving() == 0)
        {
          score += 1000;
          scoreText.text = scoreString + score;

          enemyBullets.callAll('kill',this);
          stateText.text = " You Won, \n Click to restart";
          stateText.visible = true;

          //the "click to restart" handler
          game.input.onTap.addOnce(restart,this);
        }

      }

      function enemyHitsPlayer (player,bullet) {

        bullet.kill();

        live = lives.getFirstAlive();

        if (live)
        {
          live.kill();
        }

        //  And create an explosion :)
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x, player.body.y);
        explosion.play('kaboom', 30, false, true);

        // When the player dies
        // how to lose
        if (lives.countLiving() < 1)
        {
          player.kill();
          enemyBullets.callAll('kill');

          stateText.text=" GAME OVER \n Click to restart";
          stateText.visible = true;

          //the "click to restart" handler
          game.input.onTap.addOnce(restart,this);
        }

      }

    }

  }
}
</script>

<style>
  * {
    margin: 0;
    padding: 0;
  }

  html, body, #fcbee, #canvas {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    width: 100%;
    height: 100%;
    -webkit-user-select: none;
    user-select: none;
    overflow: hidden;
    /*background-color: green;*/
  }

  #canvas {
    width: 100%;
    height: 100%;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  canvas {
    position: absolute;
    left: 0;
    top: 0;
    /* width: 100%!important;
    height: 100%!important; */
  }
</style>
