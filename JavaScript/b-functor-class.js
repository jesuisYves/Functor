'use strict';

const NOTHING = null;

class Functor {
	constructor(value) {
		this._value = value;
	};

	static of(value) {
		return new Functor(value);
	}

	map(fn) {
		const Category = Object.getPrototypeOf(this).constructor;
		return Category.of(fn(this._value));
	}
}

class ApplicativeFunctor extends Functor {
	constructor(value) {
		super(value);
	};

	static of(value) {
		return new ApplicativeFunctor(value);
	}

	ap(target) {
		return target.map(this._value);
	}
}

class Maybe extends ApplicativeFunctor {
	constructor(value) {
		super(value)
	};

	static of(value) {
		return new Maybe(value);
	}

	join() {
		return this._value;
	}

	isNothing() {
		const defaultProcessor = (value) => !Boolean(value);
		const alwaysTruthy = () => false;

		const processors = {
			number: (value) => Number.isNaN(value),
			bigint: alwaysTruthy,
			string: defaultProcessor,
			boolean: alwaysTruthy,
			object: defaultProcessor,
      // an empty object/array handling should be done either here or inside the function applied to `Maybe` instance
			undefined: defaultProcessor,
			symbol: defaultProcessor,
		};
    
		const value = this.join();
		return processors[typeof value](value);
	}

	map(fn = () => NOTHING) {
		return this.isNothing()
			? this
			: Maybe.of(fn(this.join()));
	}

	orElse(defaultValue, fn) {
		return (this.isNothing()
			? new Functor(defaultValue)
			: this
		).map(fn);
	}
}

// Usage example #1
const curry = (fn, ...par) => {
  const curried = (...args) => (
    fn.length > args.length ?
      curry(fn.bind(null, ...args)) :
      fn(...args)
  );
  return par.length ? curried(...par) : curried;
};

const augend = Maybe.of(1);
const summand = Maybe.of(2);
const sum = (x, y) => x + y;

Maybe.of(curry(sum)).ap(augend).ap(summand).map(console.log);
augend.map(curry(sum)).ap(summand).map(console.log);

// Usage example #2

const { readFile } = require('node:fs');

const findNestedProperty = (data, path) => {
	const prop = path.split('.').reduce(
		(prev, key) => (prev[key] || {}),
		data
	);
  return Object.keys(prop).length === 0
    ? undefined
    : prop;
};

const nestedPropertyFunctor = Maybe.of(curry(findNestedProperty));
const config = Maybe.of({
  server: {
    host: {
      ip: '10.0.0.1',
      port: 3000
    },
    ssl: {
      key: {
        filename: './8-path.js'
      }
    }
  }
});
const path = Maybe.of('server.ssl.key.filename');

nestedPropertyFunctor.ap(config).ap(path)
	.orElse('./5-proto-ap.js', (file) =>
    readFile(file, 'utf8', (err, data) => {
    	console.log(new Maybe(data.length).join());
  	})
  );
