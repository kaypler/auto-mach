<template>
  <div id="app">
    <keep-alive>
       <router-view/>
    </keep-alive>
  </div>
</template>

<style lang="less">
#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
