<template>
  <gmap-marker
  :clickable="true"
  :draggable="false"
  :position="position"
  @click="onClick"
  >

</gmap-marker>
</template>

<script>
  export default {
    data () {
      return {
      }
    },
    props: {
      position: {
        type: Object,
        twoWay: true
      },
      info: {
        type: Object
      }
    },
    methods: {
      onClick ($event) {
        $event.info = this.info
        this.$emit('click', $event)
      }
    }
  }
</script>