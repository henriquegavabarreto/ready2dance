<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    full-width
    style="width: 100vw;"
    persistent
    transition="slide-x-transition"
  >
    <v-container>
      <v-layout row wrap class="align-center justify-center" style="height: 100vh;">
        <v-flex xs3 class="align-center">
          <v-card
            style="border-radius: 10px;"
            dark
          >
            <v-card-text>
              Loading
              <v-progress-linear
                indeterminate
                color="white"
                class="mb-0"
              ></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-dialog>
</template>

<script>
export default {
  props: ['dialog']
}
</script>

<style lang="css" scoped>
.loader {
  border: 10px solid #f3f3f3;
  border-radius: 50%;
  border-top: 10px solid #3498db;
  width: 120px;
  height: 120px;
  -webkit-animation: spin 1s linear infinite; /* Safari */
  animation: spin 1s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  60% { -webkit-transform: rotate(300deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  60% { transform: rotate(300deg); }
  100% { transform: rotate(360deg); }
}
</style>
