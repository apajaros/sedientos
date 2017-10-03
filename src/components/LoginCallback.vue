<template>
  <h1></h1>
</template>

<script>
export default {
  data () {
    return {}
  },
  created () {
    console.log('callback called')
    this.$auth.handleAuthentication().then(() => {
      this.$router.replace('/')
    })
  }
}
</script>