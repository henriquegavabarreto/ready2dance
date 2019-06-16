<template>
  <div>
    Shortcuts (editor must be selected for them to work)
z - create move for left hand
x - create move for right hand
a - create a node for left moves (Hold and Motion)
s - create a node for right moves (Hold and Motion)
q - delete left hand move
w - delete right hand move
c - copy
v - paste
p - play / pause video
up - move forward a quarter of a beat
down - move back a quarter of a beat
right - move forward one beat
left - move back one beat

Menus
Timing
Video Starting Point - Value in seconds that the video should start at
Video Ending Point - Value in seconds that the video should end at
Song Offset - Value in seconds of the first beat that will get a movement
Song BPM - Beats Per Minute of the song (You can use any external counter like BPM COUNTER)
Song Options
Song Title - Title of the song
Artist - Who performs the song
Youtube Video Id - Video Id found at the end of the video link after watch?v= (as eN31qe-Hvzo in https://www.youtube.com/watch?v=eN31qe-Hvzo)
Menu
Show numbers every 4, 2 or 1 beats - Change the numbers that are shown at the side of the chart
Save Dance Chart - Save chart to the database (to be implemented)
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
  </div>
</template>

<script>
export default {
}
</script>
