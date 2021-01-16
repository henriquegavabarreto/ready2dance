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
                <td :class="command">p or space</td>
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
                <td :class="description">Video Id found at the end of the youtube video link - after watch?v= . In https://www.youtube.com/watch?v=SUwd0W1U3e8 the video Id would be SUwd0W1U3e8 .
                </td>
              </tr>
              <tr>
                <td :class="command">Video Starting Point</td>
                <td :class="description">Value in seconds that the video should start at When the game loads the song, it would start at this point.</td>
              </tr>
              <tr>
                <td :class="command">Video Ending Point</td>
                <td :class="description">Value in seconds that the video should end at (you can leave it at 0 if you want the video to go until the end)</td>
              </tr>
              <tr>
                <td :class="command">Song Offset</td>
                <td :class="description">Value in seconds of the first beat of the song's intro</td>
              </tr>
              <tr>
                <td :class="command">Song BPM</td>
                <td :class="description">Beats Per Minute of the song (You can the external tool of your choice to find that out - I use <a href="http://www.beatsperminuteonline.com/">Tap BPM</a> to get an estimate and confirm using the now built in metronome)</td>
              </tr>
              <tr>
                <td :class="command">Enable Metronome</td>
                <td :class="description">Plays a metronome using the offset and BPM information. Changes need to be applied to take effect, so make sure you applied if you add new information. If it sounds off, offset and BPM are the only informations that you would need to change. You can toggle it to turn it on or off at anytime. </td>
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
            Positions
          </v-card-title>
          <v-card-text>
            The silly drawing below shows roughly how the positions are defined by the player's body parts.
            <svg width="335" height="256" viewBox="0 0 335 256" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="169.125" y1="0.5" x2="169.125" y2="255.249" stroke="#00C2FF"/>
              <line x1="137.985" y1="116.5" x2="202.985" y2="114.5" stroke="black"/>
              <line x1="202.655" y1="114.638" x2="267.655" y2="52.6382" stroke="black"/>
              <line x1="138.462" y1="115.19" x2="117.462" y2="166.19" stroke="black"/>
              <line x1="116.705" y1="165.596" x2="190.205" y2="126.596" stroke="black"/>
              <line x1="170.998" y1="104.049" x2="161.498" y2="200.049" stroke="black"/>
              <line x1="161.494" y1="200.076" x2="152.985" y2="255.325" stroke="black"/>
              <line x1="161.497" y1="199.941" x2="168.122" y2="255.941" stroke="black"/>
              <path d="M185.5 82C185.5 87.9774 183.682 93.3697 180.767 97.2563C177.852 101.143 173.864 103.5 169.5 103.5C165.136 103.5 161.148 101.143 158.233 97.2563C155.318 93.3697 153.5 87.9774 153.5 82C153.5 76.0226 155.318 70.6303 158.233 66.7437C161.148 62.8571 165.136 60.5 169.5 60.5C173.864 60.5 177.852 62.8571 180.767 66.7437C183.682 70.6303 185.5 76.0226 185.5 82Z" stroke="black"/>
              <line x1="0.25" y1="83.5" x2="335" y2="83.5" stroke="#FF0000"/>
              <line x1="123.5" y1="0.5" x2="123.5" y2="256" stroke="#FF0000"/>
              <line x1="214.5" y1="0.5" x2="214.5" y2="256" stroke="#FF0000"/>
              <line x1="0.25" y1="158" x2="335" y2="158" stroke="#FF0000"/>
              <rect x="0.75" y="1" width="333.75" height="254.5" stroke="black"/>
            </svg>
            <div>
              <p>Top - Above nose</p>
              <p>Middle - Between nose and stomach</p>
              <p>Bottom - Below stomach</p>

              <p>Right - To the right side of the nose</p>
              <p>Center - Between the shoulders</p>
              <p>Left - To the left side of the nose</p>
            </div>
            <div class="mt-5">
              <p>Considering the above, the player's left hand could be considered in middle + center position or middle + right position.</p>
              <p>The right hand would be on the top + right.</p>
            </div>
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
              <li>Fill all the information in the Song Settings Tab and test with the metronome to see if the BPM and offset sound right. You can change the playback settings at the youtube player to make things easier</li>
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
              <li>You can test your chart at anytime in the save/load tab. Press ESC during the test to go back to the editor</li>
              <li>If you're not finished but need to stop leave the web application, you can save your chart selecting a difficulty and the draft option</li>
              <li>You can load a previous saved chart by clicking in the song difficulty and then load in the save/load tab. Red are for charts not created by you, so you won't be able to load them, yellow for drafts created by you and green for charts you already published</li>
              <li>In case you are finished, make sure you leave the draft option unselected so everyone can play!</li>
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
