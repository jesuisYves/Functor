'use strict';

const maybe = (x) => {
  const map = (fn) => maybe(x ? fn(x) : null);
  map.ap = (target) => target(x);
  return map;
};

// Usage

const config = {
  coords: {
    x: 0,
    y: 5,
  },
  velocity: {
    x: 1,
    y: 1,
  },
};

const addVelocity = (velocity) => (coords) => {
  coords.x += velocity.x;
  coords.y += velocity.y;
  return coords;
};

const coords = maybe(config.coords);
const velocity = maybe(config.velocity);

maybe(addVelocity).ap(velocity).ap(coords)(console.log);
velocity(addVelocity).ap(coords)(console.log);
