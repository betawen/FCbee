<template>
    <div id="fc-bee">
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
          this.loadCompleted = true;
          document.title = this.title;
        }
      },
      mounted() {
        //每次挂载调用事件监听
        this.listenEvent();
      },
      methods: {
          // 事件监听函数中监听屏幕尺寸的变化，一旦变化就重新初始化
          listenEvent() {
            this.init();
            window.addEventListener('resize', () => {
              this.init();
            })
          },
        // 考虑适配
        getCanvasSize() {
            let winW = document.body.clientWidth;
            let winH = document.body.clientHeight;
            let layoutWidth = 414, layoutHeight = 736;
            let ratio = layoutWidth / layoutHeight;
            let canvasWidth, canvasHeight;
            // 竖屏
            if (winW < winH) {
              this.isLandscape = false;
              // 需要保证高度可见
              if (winW / winH > ratio) {
                this.scaleSize = winH / layoutHeight;
                canvasHeight = layoutHeight;
                layoutWidth = layoutHeight * winW / winH;
              }
              // 需要保证宽度可见
              else {
                this.scaleSize = winW / layoutWidth;
                canvasWidth = layoutWidth;
                canvasHeight = layoutWidth * winH / winW;
              }
            }
            // 横屏
            else {
              this.isLandscape = true;
              if (winH / winW > ratio) {
                canvasWidth = layoutHeight;
                canvasHeight = layoutHeight * winH / winW;
              } else {
                canvasHeight = layoutWidth;
                canvasWidth = layoutWidth * winW / winH;
              }
            }
          console.log(`%c canvasWidth:${~~canvasWidth} | canvasHeight:${~~canvasHeight} `, 'background:#4682B4;color:white;line-height:18px');
          return {canvasWidth, canvasHeight}
        },
        init() {
            // this的变换真是神奇！！！
            //TODO
            // 关于this的研究
            const self = this;
            // 获取画布的尺寸
          let {canvasWidth, canvasHeight} = this.getCanvasSize();
          // 寻找中心点坐标，建立绝对坐标系
        }
      }
    }
</script>

<style scoped>

</style>
