<template>
  <div id="app">
    <div id="canvas"></div>
  </div>
</template>

<script>
  import CONFIG from '../assets/js/fcBee'

  export default {
  name: "FCbee",
  data() {
    return {
    title: 'fcBee',
    loadCompleted: false,
    isLandscape: false,
    scaleSize: 0
    }
  },
  created() {
    //created是实例创建后则调用
    //修改创建完成标志，为游戏添加title
    window.onload = () => {
      this.loadCompleted = true
      document.title = this.title
    }
  },
  mounted() {
    //每次挂载调用事件监听
    this.listenEvent()
  },
  methods: {
    // 事件监听函数中监听屏幕尺寸的变化，一旦变化就重新初始化
    listenEvent() {
      this.init()
      window.addEventListener('resize', () => {
        this.init()
      })
    },
    // 考虑适配
    getCanvasSize() {
      let winW = document.body.clientWidth
      let winH = document.body.clientHeight
      let layoutWidth = 414, layoutHeight = 736
      let ratio = layoutWidth / layoutHeight
      let canvasWidth, canvasHeight
      // 竖屏
      if (winW < winH) {
        this.isLandscape = false
        // 需要保证高度可见
        if (winW / winH > ratio) {
        this.scaleSize = winH / layoutHeight
        canvasHeight = layoutHeight
        layoutWidth = layoutHeight * winW / winH
        }
        // 需要保证宽度可见
        else {
        this.scaleSize = winW / layoutWidth
        canvasWidth = layoutWidth
        canvasHeight = layoutWidth * winH / winW
        }
      }
      // // 横屏（暂不支持）
      // else {
      //   this.isLandscape = true
      //   if (winH / winW > ratio) {
      //   canvasWidth = layoutHeight
      //   canvasHeight = layoutHeight * winH / winW
      //   } else {
      //   canvasHeight = layoutWidth
      //   canvasWidth = layoutWidth * winW / winH
      //   }
      // }
      console.log(`%c canvasWidth:${~~canvasWidth} | canvasHeight:${~~canvasHeight} `, 'background:#4682B4color:whiteline-height:18px')
      return {canvasWidth, canvasHeight}
    },
    init() {
      // this的变换真是神奇！！！
      //TODO
      // 关于this的研究
      const self = this
      // 获取画布的尺寸
      let {canvasWidth, canvasHeight} = this.getCanvasSize()
      let centerX = canvasWidth / 2
      let centerY = canvasHeight / 2
      // 寻找中心点坐标，建立绝对坐标系
      const _config = {
        width: canvasWidth,
        height: canvasHeight,
        render: Phaser.CANVAS,
        parent: 'canvas'
      }
      if (this.game && this.game.hasOwnProperty('property')) {
        this.game.destroy()
      }
      // 定义一个游戏
      let game = new Phaser.Game(_config)
      this.game = {}
      this.game.destroy = () => {
        game.destroy(true)
      }
      let states = {
        PRELOAD: function () {
          this.init = function () {
            game.pageAlignHorizontally = true
            game.pageAlignVertically = true
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
          }
          this.preload = () => {
            game.load.image('bg_img', CONFIG.ia_10001)
            game.load.image('small_bees', CONFIG.ia_10002)
            game.load.image('big_bee', CONFIG.ia_10003)
            game.load.onLoadComplete.add(() => {
            self.loadCompleted = true
            game.states.start('PLAY')
            })
          }
        },
        PLAY: function () {
          game.create = function () {
            // 创建小蜜蜂group
            this.small_bees = {}
            this.small_bees_group = game.add.group()
            this.small_bees_group
            // 添加背景
            let bg_img1 = game.add.sprite(0,0,'bg_img')
            bg_img1.height = canvasHeight
            bg_img1.width = canvasWidth
            let bg_img2 = game.add.sprite(0,-canvasHeight,'bg_img')
            bg_img2.height = canvasHeight
            bg_img2.width = canvasWidth
            // 添加大蜜蜂
            let bigBee = game.add.sprite(0,0,'big_bee')
            // bigBee.scaleX = this.scaleSize
            // bigBee.scaleY = this.scaleSize
            bigBee.x = centerX
            bigBee.y = canvasHeight - 30
            this.bigBee = bigBee
          }
        }
      }
      Object.keys(states).map((key) => {
        game.state().add(key, states[key])
      });
      game.state.start('PRELOAD');
    }
  }
}
</script>

<style scoped>

</style>
