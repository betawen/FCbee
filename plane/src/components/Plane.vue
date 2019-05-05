<template>
<div id="canvas"></div>
</template>

<script>
    export default {
        name: "Plane",
      data() {
          return {
            title: 'Plane Game',
            onLoadComplete: false,
            isLandScape: false,
          }
      },
      created() {
          window.onload = () => {
            this.onLoadComplete = true;
            document.title = this.title;
          }
      },
      mounted() {

      },
      methods: {
          listenEvent() {
            this.init()
            window.addEventListener('resize', () => {
              this.init()
            })
          },
        getCanvasSize() {
            let h = window.innerHeight, w = window.innerWidth;
            let canvasW = 414, canvasH = 716;
            let ratio = canvasW / canvasH ;
            this.isLandScape = ( w > h);
            let ratioWH = (w / h) > ( h / w) ? (w / h) : ( h / w)
            if(ratioWH > ratio) {
              canvasH = h * w / canvasW;
            }else {
              canvasW = w * h / canvasH;
            }
            if (this.isLandScape) {
              let tmp = canvasH;
              canvasH = canvasW;
              canvasW = tmp;
            }
            return {canvasW, canvasH};
        },
        init() {

        }
      }
    }
</script>

<style scoped>

</style>
