# What You Don't Know
A WebVR interactive music video only on WITHIN. With music by Matthew Dear.

## Environment

There are three main resources for this project:
+ [/inspiration](./inspiration): Visual inspiration links for the project
+ [/release](./release): The current build for the project
+ [/editor](./editor): A WYSIWYG timeline editor for the project
+ [/prototypes](./prototypes): All interaction prototypes

These folders all require you run a local server on your computer. A good cross-platform way to get that started is by installing [Node.js](https://nodejs.org/en/), opening up a command line prompt, and typing `npm install -g http-server`. Once you have that, point your command line to this project's root directory and type `http-server`. This will create a local server at `http://localhost:8080`. The following instructions will use this local server's details as the example.

Below are more details for each of the pages and how to use them.

### /release
[http://localhost:8080/release/](http://localhost:8080/release/) is the most current place to see our current build of the project.

### /editor
[http://localhost:8080/editor/](http://localhost:8080/editor/) gives you an empty viewport to see and manipulate how we're choreographing What You Don't Know. Once this is open in your web browser go to `File > New` to make a blank project. Then drag `/release/what-you-dont-know.json` over the window to load timeline data to the project. Similar to video editing software you can hit the spacebar to play and pause the video with some additional controls to see how animations are laid out.

### Roadmap

- [x] Add Lyrics
- [x] Add Meta-Lines around Lyrics
- [x] Add Child Shapes to Ring
- [ ] Add Polar Spheres ([Reference](https://www.are.na/block/2122848))
- [ ] ~~Add Lyric Interaction~~
- [x] Hide Controller on Leaving VR
- [x] Add Ghostly Logo
- [ ] Add Title Page (UX)
- [ ] ~~Instance Green Buttons~~
- [ ] Add `renderer.initMaterial( material )` to All Materials on Setup
- [ ] Add Reset Button to Each filter
- [ ] Add Label to Each Filter
- [ ] Add Compass to Orient the World Based on Audio Time
- [ ] Remove Twist `CatmullRomCurve3` Calculations
- [x] `playbackRate` Persists on `loop`, but Colors Reset to Gray (default)
- [x] Improve Scheduler on Audio Sequencing
- [x] Increase Height of Playhead.Cylinder
- [x] Make Debris a Sphere
- [x] Make Biquad Filter More Apparent (audio & visual)
- [x] Add Color Palette Changes on Speed Modification
- [x] Modify OrbitControls to Ease Rotation
- [ ] Modify Materials on Buttons to be from Pixar 130
- [ ] Choreograph Lyrics
- [ ] Choreograph Particles
- [ ] Choreograph Ring
- [ ] Choreograph Backdrop
- [ ] Choreograph Multiple Camera Angles for non VR Contexts
- [ ] Choreograph Boids
  - [ ] Diversify Geometries
- [x] Fix Multiple VR Controllers
- [x] Fix Safari Playback Issues
- [x] Fix touch events for Paddles
- [x] Remove `THREE.VRController` Dependency
- [x] Update to r101
