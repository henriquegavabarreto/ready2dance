<template>
  <div>
    <v-toolbar
      color="primary"
      dark
      tabs
    >
      <v-text-field
        prepend-icon="search"
        append-icon="mic"
        label="Search"
        solo-inverted
        class="mx-3"
        flat
      ></v-text-field>
      <v-btn>EDITOR</v-btn>
      <v-btn>LOGOUT</v-btn>
    </v-toolbar>
    <v-container>
      <v-layout row wrap>
        <v-flex xs6 class="blue">
          {{ allCharts }}
        </v-flex>
        <v-flex xs6 class="red">
          BBBBBBBB
        </v-flex>
      </v-layout>

    </v-container>
  </div>
</template>

<script>

export default {
  data () {
    return {
      //
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
  },
  computed: {
    allCharts: function () {
      return this.$store.state.charts
    }
  }
}
</script>
