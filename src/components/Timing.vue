<template>
  <div>
    <v-dialog v-model="dialog" persistent max-width="290">
        <template v-slot:activator="{ on : dialog }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on : tooltip }">
              <v-btn color="primary" dark v-on="{ ...tooltip, ...dialog}">
                <v-icon>timer</v-icon>
              </v-btn>
            </template>
            <span>Timing</span>
          </v-tooltip>
        </template>
        <v-card>
          <v-card-title class="headline">Use Google's location service?</v-card-title>
          <v-card-text>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click="save">Agree</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dialog: false
    }
  },
  methods: {
    save: function () {
      this.dialog = false
    }
  }
}
</script>
