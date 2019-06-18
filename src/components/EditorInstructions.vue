<template>
  <v-container fluid>
    <v-layout row wrap class="scroll-y" style="height: 85vh;">
      <v-flex xs12>
        <v-card style="border-radius: 10px;">
          <v-card-title class="justify-center yellow darken-1 headline font-weight-medium pa-2">
            Shortcuts
          </v-card-title>
          <v-card-text>
            <table>
              <tr>
                <td>z</td>
                <td>create move for left hand</td>
              </tr>
              <tr>
                <td>x</td>
                <td>create move for right hand</td>
              </tr>
              <tr>
                <td>a</td>
                <td>create a node for left moves (Hold and Motion)</td>
              </tr>
              <tr>
                <td>s</td>
                <td>create a node for right moves (Hold and Motion)</td>
              </tr>
              <tr>
                <td>q</td>
                <td>delete left hand move</td>
              </tr>
              <tr>
                <td>w</td>
                <td>delete right hand move</td>
              </tr>
              <tr>
                <td>c</td>
                <td>copy</td>
              </tr>
              <tr>
                <td>v</td>
                <td>paste</td>
              </tr>
              <tr>
                <td>p</td>
                <td>play / pause video</td>
              </tr>
              <tr>
                <td>up</td>
                <td>move back a quarter of a beat</td>
              </tr>
              <tr>
                <td>down</td>
                <td>move forward a quarter of a beat</td>
              </tr>
              <tr>
                <td>left</td>
                <td>move back a beat</td>
              </tr>
              <tr>
                <td>right</td>
                <td>move forward a beat</td>
              </tr>
            </table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 class="mt-4">
        <v-card style="border-radius: 10px;">
          <v-card-title class="justify-center yellow darken-1 headline font-weight-medium pa-2">
            Load, Timing and Song
          </v-card-title>
          <v-card-text>
            <table>
              <tr>
                <td>Load By Video Id</td>
                <td>Video Id found at the end of the youtube video link after watch?v=</td>
              </tr>
              <tr>
                <td>Video Starting Point</td>
                <td>Value in seconds that the video should start at</td>
              </tr>
              <tr>
                <td>Video Ending Point</td>
                <td>Value in seconds that the video should end at</td>
              </tr>
              <tr>
                <td>Song Offset</td>
                <td>Value in seconds of the first beat of the song's intro</td>
              </tr>
              <tr>
                <td>Song BPM</td>
                <td>Beats Per Minute of the song (You can use any external tool like Tap BPM and online metronome to assist you with this)</td>
              </tr>
              <tr>
                <td>Song Title</td>
                <td>Title of the song</td>
              </tr>
              <tr>
                <td>Artist</td>
                <td>Who performs the song</td>
              </tr>
            </table>
            Usage
            Select a video on youtube and get the id
            Fill all the necessary information on Song Options
            Fill all the necessary information on Timing
            Start inserting moves on the chart
            For a Sharp Move, that will be checked just one time in the game at the specific beat that it was inserted on, press Z to create a left hand move or X to create a right hand move

            Select the position on which the move should be checked clicking in one of the circles on the top of the video

            For a Hold Move or Motion Move, that can be checked two times or more, hold Z for left hand or X for right hand on the beat on which the move starts and press the down arrow until the beat which the move should end. After that, release Z or X.

            Now it will be necessary that you select two positions on the circle grid. Selecting two times the same position will create a Hold Move and selecting different positions will create a Motion Move

            If you have created a Hold Move or Motion Move, you can create nodes by selecting the beat and pressing A for left hand or S for right hand. Nodes are a way to create one more detection. Hold nodes will create a new detection on that note considering the same position as the start and end previously created. Motion nodes will require you to select a position, so there are no restriction to Motion Moves (beside that thay can't start and end at the same position).
            If you want to delete a move, press Q to delete a left hand move or W to delete a right hand move
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
}
</script>

<style scoped>

table {
  width: 100%;
}

tr {
  padding-top: 20px;
  padding-bottom: 20px;
}

td {
  border: none;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 30px;
  vertical-align: middle;
}
</style>
