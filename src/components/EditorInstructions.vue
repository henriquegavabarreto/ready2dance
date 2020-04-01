<template>
  <v-container fluid>
    <v-layout row wrap class="scroll-y" style="height: 85vh;">
      <v-flex xs12>
        <v-card style="border-radius: 10px;">
          <v-card-title class="justify-center yellow darken-1 headline font-weight-medium pa-2">
            Shortcuts
          </v-card-title>
          <v-card-text>
            <div class="text-xs-center pt-2 pb-2 mb-3" style="text-decoration: underline; border: 2px solid black;">
              <p><span class="font-weight-black">Attention:</span> The editor must be selected for the shortcuts to work</p>
              <p>If you notice any unexpected behaviour, refresh the page and send us an <a href="mailto:ready2dancegame@gmail.com">email</a>.</p>
            </div>
            <table>
              <tr>
                <td :class="command">z</td>
                <td :class="description">create move for left hand</td>
              </tr>
              <tr>
                <td :class="command">x</td>
                <td :class="description">create move for right hand</td>
              </tr>
              <tr>
                <td :class="command">a</td>
                <td :class="description">create a node for left moves (Hold and Motion)</td>
              </tr>
              <tr>
                <td :class="command">s</td>
                <td :class="description">create a node for right moves (Hold and Motion)</td>
              </tr>
              <tr>
                <td :class="command">q</td>
                <td :class="description">delete left hand move</td>
              </tr>
              <tr>
                <td :class="command">w</td>
                <td :class="description">delete right hand move</td>
              </tr>
              <tr>
                <td :class="command">c</td>
                <td :class="description">copy</td>
              </tr>
              <tr>
                <td :class="command">v</td>
                <td :class="description">paste</td>
              </tr>
              <tr>
                <td :class="command">p</td>
                <td :class="description">play / pause video</td>
              </tr>
              <tr>
                <td :class="command">up (↑)</td>
                <td :class="description">move back a quarter of a beat</td>
              </tr>
              <tr>
                <td :class="command">down (↓)</td>
                <td :class="description">move forward a quarter of a beat</td>
              </tr>
              <tr>
                <td :class="command">left (←)</td>
                <td :class="description">move back a beat</td>
              </tr>
              <tr>
                <td :class="command">right (→)</td>
                <td :class="description">move forward a beat</td>
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
                <td :class="command">Load Video By Video Id</td>
                <td :class="description">Video Id found at the end of the youtube video link - after watch?v=</td>
              </tr>
              <tr>
                <td :class="command">Video Starting Point</td>
                <td :class="description">Value in seconds that the video should start at</td>
              </tr>
              <tr>
                <td :class="command">Video Ending Point</td>
                <td :class="description">Value in seconds that the video should end at (you can leave it at 0 if you want the whole video)</td>
              </tr>
              <tr>
                <td :class="command">Song Offset</td>
                <td :class="description">Value in seconds of the first beat of the song's intro</td>
              </tr>
              <tr>
                <td :class="command">Song BPM</td>
                <td :class="description">Beats Per Minute of the song (You can the external tool of your choice to find that out - I use <a href="http://www.beatsperminuteonline.com/">Tap BPM</a> to get an estimate and <a href="https://www.imusic-school.com/en/tools/online-metronome/">online metronome</a> to confirm it)</td>
              </tr>
              <tr>
                <td :class="command">Song Title</td>
                <td :class="description">Title of the song</td>
              </tr>
              <tr>
                <td :class="command">Artist</td>
                <td :class="description">Who performs the song</td>
              </tr>
            </table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 class="mt-4">
        <v-card style="border-radius: 10px;">
          <v-card-title class="justify-center yellow darken-1 headline font-weight-medium pa-2">
            Usage
          </v-card-title>
          <v-card-text class="subheading">
            <ol>
              <li>Select a video on youtube and get the id</li>
              <li>Fill all the information on Song Settings</li>
              <li>Start inserting moves on the chart:
                <ul>
                  <li>For a Sharp Move:</li>
                  <ol>
                    <li>This move will be checked just one time in the game at the specific beat that it was inserted on - press and release on the same beat Z to create a left hand move or X to create a right hand move</li>
                    <li>Select the position on which the move should be checked clicking in one of the circles</li>
                  </ol>
                  <li>For a Hold Move or Motion Move:</li>
                  <ol>
                    <li>These moves will be checked two times or more - hold Z for left hand or X for right hand on the beat on which the move starts and press the arrows until you get to the beat on which the move should end. After that, release Z or X.</li>
                    <li>Now it will be necessary that you select two positions on the circle grid. Selecting two times the same position will create a Hold Move and selecting different positions will create a Motion Move</li>
                  </ol>
                </ul>
              </li>
              <li>If you have created a Hold Move or Motion Move, you can create nodes by selecting a beat and pressing A for left hand or S for right hand. Nodes are a way to create one more detection. Hold nodes will create a new detection on that note considering the same position as the start and end previously created. Motion nodes will require you to select a position, so there are no restriction to Motion Moves - after you create it, you can change the start, end or add nodes in different positions.</li>
              <li>If you want to delete a move, press Q to delete a left hand move or W to delete a right hand move</li>
            </ol>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      command: 'subheading font-weight-black text-xs-center',
      description: 'body-2'
    }
  }
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
  border-bottom: 1px solid #ddd;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 30px;
  vertical-align: middle;
}
li {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
