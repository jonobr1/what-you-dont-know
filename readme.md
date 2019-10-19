# What You Don't Know
A interactive music video made for VR only on [WITHIN](http://with.in/) in partnership with [Ghostly International](http://ghostly.com/). With music by [Matthew Dear](https://ghostly.com/artists/matthew-dear).

Experience it for yourself here: [http://with.in/watch/what-you-dont-know/](http://with.in/watch/what-you-dont-know/)

## Project Environment

There are three main resources for this project:
+ [/inspiration](./inspiration): Visual inspiration links for the project
+ [/release](./release): The current stable build for the project
+ [/staging](./staging): The latest build for the project
+ [/editor](./editor): A WYSIWYG timeline editor for the project
+ [/prototypes](./prototypes): All interaction prototypes

These folders all require you run a local server on your computer. A good cross-platform way to get that started is by installing [Node.js](https://nodejs.org/en/), opening up a command line prompt, and typing `npm install -g http-server`. Once you have that, point your command line to this project's root directory and type `http-server`. This will create a local server at `http://localhost:8080`. The following instructions will use this local server's details as the example.

Below are more details for each of the pages and how to use them.

### /release
[http://within-unlimited.github.io/what-you-dont-know/release/](http://within-unlimited.github.io/what-you-dont-know/release/) is the most current place to see our current build of the project.

### /staging
[http://within-unlimited.github.io/what-you-dont-know/staging/](http://within-unlimited.github.io/what-you-dont-know/release/) is the build used for WITHIN's staging website.

### /editor
[http://within-unlimited.github.io/what-you-dont-know/editor/](http://within-unlimited.github.io/what-you-dont-know/editor/) gives you an empty viewport to see and manipulate how we're choreographing _What You Don't Know_. Once this is open in your web browser go to `File > Reset` to insure the a clean version of the project is loaded. When doing this, the editor loads `/release/experience.json` into the editor, insuring that what you're working with is the published version of the project. Similar to video editing software you can hit the spacebar to play and pause the video with some additional controls to see how animations are laid out.

### /prototypes
[http://within-unlimited.github.io/what-you-dont-know/prototypes/](http://within-unlimited.github.io/what-you-dont-know/prototypes/) is a list of one off HTML5 webpages exploring different interactions, graphics, interfaces, and previous builds.

### Roadmap

- [ ] Exiting VR Bug in Oculus Browser
- [x] Fix Animation Skipping on Sped up Tracks
- [x] ~~Choreograph Multiple Camera Angles for non VR Contexts~~
- [x] Account for Portrait Screen Sizes on Page Load (Design)
- [x] Make UI Text All Same Size
- [x] Update to r107
- [x] Add Polar Spheres ([Reference 1](https://www.are.na/block/2122848) • [Reference 2](https://www.are.na/block/2122776))
- [x] Add Title Page (UX)
- [x] Make Playhead First Read (UX)
- [x] Add Arrows to Compass to Guide Dragging
- [x] Add Global Reset Button
- [x] Add Zen Mode (Hide UI)
- [x] Add Random Parameterizer
- [x] Add Custom Sound / Noise When Scrubbing
- [x] ~~Create Clear UI for EQ Changes~~
- [x] Spatialize Audio Tracks
- [x] Choreograph Polar Spheres
  - [x] Separate Blob (vertex) Animation and Liquid (fragment) Animation
  - [x] Rotate and Position in Relation to the Ring
  - [x] ~~Place Initial Position at Normal Viewing Position~~
  - [x] Set Lyrics and Credits via the `polarSpheres.userData.setTexture` method
- [x] Choreograph Lyrics
  - [x] Opacity Animation Based on Vocals
- [x] ~~Choreograph Debris~~
  - [x] ~~Experiment with amount of visible Debris~~
  - [x] ~~Experiment with regions of Debris~~
  - [x] ~~Experiment with size through FFT~~
  - [x] ~~Experiment with Field Movement~~
  - [x] ~~Experiment with Turbulence~~
- [x] Choreograph Ring
  - [x] ~~Experiment with Changing x / z Rotation~~
  - [x] ~~Experiment with x / z Position~~
  - [x] Choreograph Alpha Map Texture Repeat on "Oh" Vocals
  - [x] Opacity Inversely Tied to SFX - Alpha Map Intensity
  - [x] ~~Y Position Oscillation Tied to Instrumental~~
- [x] ~~Choreograph Backdrop~~
- [x] Choreograph Boids
  - [x] ~~Diversify Geometries~~
  - [x] ~~Animate / Oscillate Distance from Ring~~
  - [x] Three Part Melody Should Trigger Boids
  - [x] Tie `TWEEN` of Boids to `player.currentTime` not `requestAnimationFrame`
- [x] ~~Add Custom `THREE.LightProbe`~~
- [x] Remove `playbackRate` Change on Playhead (keep it simple)
- [x] ~~Make Text Geometry Based Instead of Based out of a Texture~~
- [x] Add Lyrics
- [x] Add Meta-Lines around Lyrics
- [x] Add Child Shapes to Ring
- [x] ~~Add Lyric Interaction~~
- [x] Hide Controller on Leaving VR
- [x] Add Ghostly Logo
- [x] ~~Instance Green Buttons~~
- [x] Add `renderer.initMaterial( material )` to All Materials on Setup
- [x] ~~Add Reset Button to Each filter~~
- [x] Add Label to Each Filter
- [x] Add Compass to Orient the World Based on Audio Time
- [x] Fix Orientation Offset by Compass on Playhead + Lights Animations
- [x] Remove Twist `CatmullRomCurve3` Calculations on Boids
- [x] Match Lighting on Boids
- [x] Create Secondary Instance of `TWEEN` Bound to Frame.Player.currentTime
- [x] `playbackRate` Persists on `loop`, but Colors Reset to Gray (default)
- [x] Improve Scheduler on Audio Sequencing
- [x] Increase Height of Playhead.Cylinder
- [x] Make Debris a Sphere
- [x] Make Biquad Filter More Apparent (audio & visual)
- [x] Add Color Palette Changes on Speed Modification
- [x] Modify OrbitControls to Ease Rotation
- [x] ~~Modify Materials on Buttons to be from Pixar 130~~
- [x] Fix Multiple VR Controllers
- [x] Fix Safari Playback Issues
- [x] Fix touch events for Paddles
- [x] Remove `THREE.VRController` Dependency
- [x] Update to r101
