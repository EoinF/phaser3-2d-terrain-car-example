import Phaser from "phaser";


var Matter = Phaser.Physics.Matter.Matter;

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'matter',
    matter: {
        debug: false
    }
  }
};

const game = new Phaser.Game(config);
let truckSprites;
let truck;

function preload() {
  truckSprites = loadTruckAsset.call(this, "basic");
}

function create() {
  createRoadSection.call(this);
  truck = createTruck.call(this, truckSprites, 400, 100);
  // truck.setMass(10);
  
  this.cameras.main.startFollow(truck.container);
  this.cameras.main.setBackgroundColor('#3366ff')
}

function update() {
  const cursors = this.input.keyboard.createCursorKeys();
  if (cursors.left.isDown) {
    const newSpeed = Math.max(-0.9, -truck.wheelA.angularSpeed - 0.01);
    Matter.Body.setAngularVelocity(truck.wheelA, newSpeed);
    Matter.Body.setAngularVelocity(truck.wheelB, newSpeed);
  } else if (cursors.right.isDown) {
    const newSpeed = Math.min(0.9, truck.wheelA.angularSpeed + 0.01);
    Matter.Body.setAngularVelocity(truck.wheelA, newSpeed);
    Matter.Body.setAngularVelocity(truck.wheelB, newSpeed);
  }
}

function createRoadSection() {
  const numPoints = 200;
  const pointsStep = 50;
  const pointsTop = Array(numPoints)
    .fill()
    .map((_, i) => ({
      x: i * pointsStep,
      y: (100 * Math.abs(Math.sin(i / 3))) + (100 * Math.abs(Math.cos(i / 5))) + (100 * Math.abs(Math.cos(i / 7)))
    }));

  Array(11).fill().forEach((_, i) => {
    pointsTop[i + 1].y = 200;
  })
  const pointsBottom = Array(numPoints)
    .fill()
    .map((_, i) => ({x: (numPoints - (i + 1)) * pointsStep, y: 700}));

  const points = [...pointsTop, ...pointsBottom];
  points[0] = {x: 0, y: 0};

  const maxValues = points.reduce((previous, current) => {
    previous.x = Math.max(previous.x, current.x);
    previous.y = Math.max(previous.y, current.y);
    return previous;
  }, {x: points[0].x, y: points[0].y});

  const graphics = this.add.graphics(
    {
      fillStyle: {
        color: 0x441205,
        alpha: 1
      }
    }
  );

  graphics.fillPoints(points, true);
  graphics.generateTexture('roadShape', maxValues.x, maxValues.y);
  graphics.destroy();
  
  const road = this.matter.add.sprite(0, 0, 'roadShape', null, {
    shape: {
      type: 'fromVertices',
      verts: points
    },
    // friction: 0.1
  });
  console.log(road);
  road.setStatic(true);
  road.setPosition(road.centerOfMass.x, config.height)// + road.centerOfMass.y);
}

function createTruck(spriteKeys, x, y) {
  const children = spriteKeys.map(key => this.add.image(0, 0, key));
  children[0].setTint(0x33ff88);
  children[1].setTint(0x33ff88);
  children[2].setTint(0x888888);
  children[3].setTint(0x111111);
  
  const wheelAOffset = -40, wheelBOffset = -27, wheelCOffset = 12;
  const wheelYOffset = 18;
  const frontBodyHeight = 30, frontBodyWidth = 32;
  const lowerBodyHeight = 10;
  const frontBodyXOffset = 18;
  const lowerBodyYOffset = frontBodyHeight / 2 + lowerBodyHeight / 2;
  const wheelSize = 7;
  const width = children[0].width;
  const height = children[0].height;
  const container = this.add.container(x, y, children);
  container.setSize(children[0].width, children[0].height);
  this.matter.add.gameObject(container, {friction: 0});

  // Create a collision group to prevent the truck parts colliding with each other
  var group = this.matter.world.nextGroup(true);
  const frontBody = Matter.Bodies.rectangle(frontBodyXOffset, 0, frontBodyWidth, frontBodyHeight, {
    collisionFilter: {
        group: group
    },
    chamfer: {
        radius: 5
    },
    density: 0.0002
  });
  const lowerBody = Matter.Bodies.rectangle(0, lowerBodyYOffset, width, lowerBodyHeight, { 
    collisionFilter: {
        group: group
    },
    chamfer: {
        radius: 5
    },
    density: 0.0002
  });

  var mainBody = Matter.Body.create({
    collisionFilter: {
      group: group
    },
    parts: [lowerBody, frontBody],
  });

  container.setExistingBody(mainBody);
  container.setPosition(x, y);

  const wheelA = this.matter.add.circle(x + wheelAOffset, y + wheelYOffset, wheelSize);
  wheelA.collisionFilter.group = group;
  wheelA.friction = 0.8;
  wheelA.density = 0.001;

  var wheelB = this.matter.add.circle(x + wheelBOffset, y + wheelYOffset, wheelSize);
  wheelB.collisionFilter.group = group;
  wheelB.friction = 0.8;
  wheelB.density = 0.001;

  var wheelC = this.matter.add.circle(x + wheelCOffset, y + wheelYOffset, wheelSize);
  wheelC.collisionFilter.group = group;
  wheelC.friction = 0.8;
  wheelC.density = 0.001;

  var axelA = this.matter.add.constraint(
    mainBody,
    wheelA,
    0, 0.2, {
      pointA: { x: wheelAOffset, y: wheelYOffset }
    }
  );
                  
  var axelB = this.matter.add.constraint(
    mainBody,
    wheelB,
    0, 0.2, {
      pointA: { x: wheelBOffset, y: wheelYOffset }
    }
  );
  var axelC = this.matter.add.constraint(
    mainBody,
    wheelC,
    0, 0.2, {
      pointA: { x: wheelCOffset, y: wheelYOffset }
    }
  );

  container.list.forEach(image => {
    image.setPosition(width / 2 - container.centerOfMass.x, height - (lowerBodyHeight + frontBodyHeight) / 2 - container.centerOfMass.y);
  });

  return {
    container,
    mainBody,
    wheelA,
    wheelB,
    wheelC
  };
}

function loadTruckAsset(type) {
  const truckBase = "./assets";
  const truckParts = [
      "front",
      "back",
      "wheels",
      "tyres"
  ];

  const _truckSprites = truckParts.map(part => `truck-${part}-${type}`);

  _truckSprites.forEach(sprite => {
    const filePath = `${truckBase}/${sprite}.png`;
    this.load.spritesheet(sprite, 
        filePath,
        { frameWidth: 72, frameHeight: 48 }
    );
  })
  return _truckSprites;
}