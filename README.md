# Phaser 3 physics Example

Based on: https://github.com/photonstorm/phaser3-project-template

## Features used
Below is a list of the features used, followed by explanations for their usages.

* Matter composite physics
* Matter compound bodies
* Phaser3 "Graphics" module
* Phaser3 container objects

### Matter composite physics
Used to combine the 3 wheels with the truck body.
The vehicle is only controlled by turning the wheels

### Matter compound bodies
Two rectangle objects are combined - the front part of the truck and the lower part of the truck

### Phaser3 "Graphics" module
This is used to draw the terrain shapes

### Phaser3 container objects
This is used to combine all the truck sprites into one object
The truck is made of many sprites to enable custom colours for each part.