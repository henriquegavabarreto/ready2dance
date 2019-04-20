<template>
  <div>
    <v-toolbar dark>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark v-on="on">
            <v-icon>timer</v-icon>
          </v-btn>
        </template>
        <span class="body-2">Timing</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark v-on="on">
            <v-icon>audiotrack</v-icon>
          </v-btn>
        </template>
        <span class="body-2">Song Info</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark v-on="on">
            <v-icon>video_library</v-icon>
          </v-btn>
        </template>
        <span class="body-2">Load Video</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark v-on="on">
            <v-icon>done_outline</v-icon>
          </v-btn>
        </template>
        <span class="body-2">Save Chart</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark v-on="on">
            <v-icon>info</v-icon>
          </v-btn>
        </template>
        <span class="body-2">About this editor</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark v-on="on">
            <v-icon>exit_to_app</v-icon>
          </v-btn>
        </template>
        <span class="body-2">Back to Song Selection</span>
      </v-tooltip>

    </v-toolbar>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //
    }
  }
}
</script>
