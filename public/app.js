(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var DEFAULT_VALUES = {
    emitDelay: 10,
    strictMode: false
};

/**
 * @typedef {object} EventEmitterListenerFunc
 * @property {boolean} once
 * @property {function} fn
 */

/**
 * @class EventEmitter
 *
 * @private
 * @property {Object.<string, EventEmitterListenerFunc[]>} _listeners
 * @property {string[]} events
 */

var EventEmitter = function () {

    /**
     * @constructor
     * @param {{}}      [opts]
     * @param {number}  [opts.emitDelay = 10] - Number in ms. Specifies whether emit will be sync or async. By default - 10ms. If 0 - fires sync
     * @param {boolean} [opts.strictMode = false] - is true, Emitter throws error on emit error with no listeners
     */

    function EventEmitter() {
        var opts = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_VALUES : arguments[0];

        _classCallCheck(this, EventEmitter);

        var emitDelay = void 0,
            strictMode = void 0;

        if (opts.hasOwnProperty('emitDelay')) {
            emitDelay = opts.emitDelay;
        } else {
            emitDelay = DEFAULT_VALUES.emitDelay;
        }
        this._emitDelay = emitDelay;

        if (opts.hasOwnProperty('strictMode')) {
            strictMode = opts.strictMode;
        } else {
            strictMode = DEFAULT_VALUES.strictMode;
        }
        this._strictMode = strictMode;

        this._listeners = {};
        this.events = [];
    }

    /**
     * @protected
     * @param {string} type
     * @param {function} listener
     * @param {boolean} [once = false]
     */

    _createClass(EventEmitter, [{
        key: '_addListenner',
        value: function _addListenner(type, listener, once) {
            if (typeof listener !== 'function') {
                throw TypeError('listener must be a function');
            }

            if (this.events.indexOf(type) === -1) {
                this._listeners[type] = [{
                    once: once,
                    fn: listener
                }];
                this.events.push(type);
            } else {
                this._listeners[type].push({
                    once: once,
                    fn: listener
                });
            }
        }

        /**
         * Subscribes on event type specified function
         * @param {string} type
         * @param {function} listener
         */

    }, {
        key: 'on',
        value: function on(type, listener) {
            this._addListenner(type, listener, false);
        }

        /**
         * Subscribes on event type specified function to fire only once
         * @param {string} type
         * @param {function} listener
         */

    }, {
        key: 'once',
        value: function once(type, listener) {
            this._addListenner(type, listener, true);
        }

        /**
         * Removes event with specified type. If specified listenerFunc - deletes only one listener of specified type
         * @param {string} eventType
         * @param {function} [listenerFunc]
         */

    }, {
        key: 'off',
        value: function off(eventType, listenerFunc) {
            var _this = this;

            var typeIndex = this.events.indexOf(eventType);
            var hasType = eventType && typeIndex !== -1;

            if (hasType) {
                if (!listenerFunc) {
                    delete this._listeners[eventType];
                    this.events.splice(typeIndex, 1);
                } else {
                    (function () {
                        var removedEvents = [];
                        var typeListeners = _this._listeners[eventType];

                        typeListeners.forEach(
                        /**
                         * @param {EventEmitterListenerFunc} fn
                         * @param {number} idx
                         */
                        function (fn, idx) {
                            if (fn.fn === listenerFunc) {
                                removedEvents.unshift(idx);
                            }
                        });

                        removedEvents.forEach(function (idx) {
                            typeListeners.splice(idx, 1);
                        });

                        if (!typeListeners.length) {
                            _this.events.splice(typeIndex, 1);
                            delete _this._listeners[eventType];
                        }
                    })();
                }
            }
        }

        /**
         * Applies arguments to specified event type
         * @param {string} eventType
         * @param {*[]} eventArguments
         * @protected
         */

    }, {
        key: '_applyEvents',
        value: function _applyEvents(eventType, eventArguments) {
            var typeListeners = this._listeners[eventType];

            if (!typeListeners || !typeListeners.length) {
                if (this._strictMode) {
                    throw 'No listeners specified for event: ' + eventType;
                } else {
                    return;
                }
            }

            var removableListeners = [];
            typeListeners.forEach(function (eeListener, idx) {
                eeListener.fn.apply(null, eventArguments);
                if (eeListener.once) {
                    removableListeners.unshift(idx);
                }
            });

            removableListeners.forEach(function (idx) {
                typeListeners.splice(idx, 1);
            });
        }

        /**
         * Emits event with specified type and params.
         * @param {string} type
         * @param eventArgs
         */

    }, {
        key: 'emit',
        value: function emit(type) {
            var _this2 = this;

            for (var _len = arguments.length, eventArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                eventArgs[_key - 1] = arguments[_key];
            }

            if (this._emitDelay) {
                setTimeout(function () {
                    _this2._applyEvents.call(_this2, type, eventArgs);
                }, this._emitDelay);
            } else {
                this._applyEvents(type, eventArgs);
            }
        }

        /**
         * Emits event with specified type and params synchronously.
         * @param {string} type
         * @param eventArgs
         */

    }, {
        key: 'emitSync',
        value: function emitSync(type) {
            for (var _len2 = arguments.length, eventArgs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                eventArgs[_key2 - 1] = arguments[_key2];
            }

            this._applyEvents(type, eventArgs);
        }

        /**
         * Destroys EventEmitter
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this._listeners = {};
            this.events = [];
        }
    }]);

    return EventEmitter;
}();

var index$1 = EventEmitter;

/**
 * Simple Naive "Immutable" Todo Store.
 * @author Gilles Coomans
 */

var Todos = new index$1();
var proto = {
	todos: [],
	route: 'all',
	ID: 0,
	methods: {
		append: function append(title) {
			this.todos = this.todos.concat({
				title: title || '',
				id: this.ID++,
				completed: false
			});
			this.emit('update', this);
		},
		prepend: function prepend(title) {
			this.todos = [{
				title: title || '',
				id: this.ID++,
				completed: false
			}].concat(this.todos);
			this.emit('update', this);
		},
		delete: function _delete(id) {
			this.todos = this.todos.filter(function (todo) {
				return todo.id !== id;
			});
			this.emit('update', this);
		},
		toggleComplete: function toggleComplete(id) {
			this.todos = this.todos.map(function (todo) {
				if (todo.id === id) {
					todo = Object.assign({}, todo);
					todo.completed = !todo.completed;
				}
				return todo;
			});
			this.emit('update', this);
		},
		updateTitle: function updateTitle(id, title) {
			this.todos = this.todos.map(function (todo) {
				if (todo.id === id && todo.title !== title) {
					todo = Object.assign({}, todo);
					todo.title = title;
				}
				return todo;
			});
			this.emit('update', this);
		},
		clearCompleted: function clearCompleted() {
			this.todos = this.todos.filter(function (todo) {
				return !todo.completed;
			});
			this.emit('update', this);
		},
		toggleAll: function toggleAll() {
			this.todos = this.todos.map(function (todo) {
				todo = Object.assign({}, todo);
				todo.completed = !todo.completed;
				return todo;
			});
			this.emit('update', this);
		}
	}
};

// copy proto
for (var i in proto) {
	Todos[i] = proto[i];
} // bind all methods to root
for (var _i in Todos.methods) {
	Todos.methods[_i] = Todos.methods[_i].bind(Todos);
}

//

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck$$1 = function classCallCheck$$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass$$1 = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits$$1 = function inherits$$1(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn$$1 = function possibleConstructorReturn$$1(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
};

// removed in production

/**
 * Lexem class : a lexem is just an object containing 3 properties { lexicon:String, name:String, args:Arguments|Array }
 * You should never construct them directly (but if you do babelute's plugins). And it should never be extended.
 * @protected
 */
var Lexem =

/**
 * construct a new lexem instance
 * @param  {String} lexicon the lexicon's name of the lexem
 * @param  {String} name    the lexem's name
 * @param  {Array|arguments} args  the lexem's arguments (an array or the "callee arguments" object) 
 */
function Lexem(lexicon, name, args) {
  classCallCheck$$1(this, Lexem);

  /**
   * the lexicon name from where the lexem comes
   * @type {String}
   */
  this.lexicon = lexicon;

  /**
   * the lexem's name
   * @type {String}
   */
  this.name = name;

  /**
   * The lexem's arguments array (or arguments object)
   * @type {Array|arguments}
   */
  this.args = args;
};

/**
 * Babelute subclass(es) instances : for holding array of lexems (i.e. a sentence) written through the DSL's API.
 *
 * Will be the base class for all DSLs handlers.
 *
 * Babelute API and lexems Naming Conventions : 
 * 
 * - any "meta-language" method (aka any method that handle the sentence it self - appending new lexem, changing current lexicon, sentences translations, ...) 
 * must start with and underscore : e.g. _append, _lexicon, _if,  _each, _eachLexem, _translate...
 * - any "pragmatics output related" method should start with a '$' and should be named with followed format : e.g. .$myLexiconToMyOutputType(...)
 * - any DSL lexems (so any other "api"'s method) should start with a simple alphabetic char : e.g. .myLexem(), .description(), .title(), ...
 * 		
 * @public
 */
/**
 * Babelute core
 *
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

var Babelute = function () {

  /**
   * construct a babelute instance
   * @param  {?Array} lexems array of lexems for init. (only for internal use)
   */
  function Babelute() {
    var lexems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    classCallCheck$$1(this, Babelute);

    /**
     * the array where lexems are stored
     * @type {Array}
     */
    this._lexems = lexems || [];

    /**
     * useful marker for fast instanceof replacement (frame/multiple-js-runtime friendly)
     * @type {Boolean}
     */
    this.__babelute__ = true;
  }

  /**
   * The absolute Babelute atom method : add a lexem to babelute's array
   * @public
   * @param  {String} lexiconName the current lexicon name
   * @param  {String} name      the lexem's name
   * @param  {Array|arguments} args   the lexem's arguments (either an array or maybe directly the arguments object from when lexem is called)
   * @return {Babelute} 	the current Babelute instance
   */

  createClass$$1(Babelute, [{
    key: '_append',
    value: function _append(lexiconName, name, args) {

      this._lexems.push(new Lexem(lexiconName, name, args));

      return this;
    }

    /**
     * conditional sentences concatenation.
     *
     * Apply modification at sentence writing time (aka the babelute does not contains the _if lexems. _if has immediatly been applied).
     * 
     * @public
     * @param  {*} condition any value that will be casted to Boolean (!!)
     * @param  {Babelute} babelute  which sentence to insert if !!condition === true
     * @param  {?Babelute} elseBabelute  which sentence to insert if !!condition === false
     * @return {Babelute}     the current Babelute instance
     */

  }, {
    key: '_if',
    value: function _if(condition, babelute) {
      var elseBabelute = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (condition) this._lexems = this._lexems.concat(babelute._lexems);else if (elseBabelute) this._lexems = this._lexems.concat(elseBabelute._lexems);
      return this;
    }

    /**
     * For each item from array : execute function and concatenate returned babelute sentence to current one. 
     * Provided function must return a babelute.
     *
     * Apply modification at sentence writing time (aka the babelute does not contains the _each lexems. _each has immediatly been applied).
     * 
     * @public
     * @param  {Array} array  the array to iterate on
     * @param  {Function} func the function to handle each item. it must return a babelute.
     * @return {Babelute}     the current Babelute instance
     */

  }, {
    key: '_each',
    value: function _each(array, func) {
      var _this = this;

      array.forEach(function (item, index) {
        var b = func(item, index);

        _this._lexems.push.apply(_this._lexems, b._lexems);
      });
      return this;
    }

    /**
     * Use a babelute (another sentence) at this point in the current sentence
     * @public
     * @param  {string|Babelute} babelute Either a string formatted as 'mylexicon:myMethod' (which gives the lexem's method to call), or a Babelute instance (which will be inserted in current sentence)
     * @param  {?...args} args the optional arguments to use when calling lexem (only if first argument is a string)
     * @return {Babelute} the current Babelute instance
     * @throws {Error} If lexicon not found (when first arg is string)
     * @throws {Error} If method not found in lexicon (when first arg is string)
     */

  }, {
    key: '_use',
    value: function _use(babelute) {} // eslint-disable-line no-unused-vars
    // will be implemented in lexicon


    /**
     * Change current lexicon for next lexems
     * @public
     * @param  {string} lexiconName the lexicon to use
     * @return {Babelute}  a new Babelute from lexicon (i.e. with lexicon's API)
     * @throws {Error} If lexicon not found with lexiconName
     */

  }, {
    key: '_lexicon',
    value: function _lexicon(lexiconName) {} // eslint-disable-line no-unused-vars
    // will be implemented in lexicon


    /**
     * Create Babelute subclass
     * @param  {Babelute} BaseClass the class to be extended
     * @param  {?Object} api an object containing methods to add to prototype
     * @return {Babelute}   The subclass
     * @throws {AssertionError} (only in dev mode) If BaseClass is not a Babelute Subclass (or Babelute)
     */

  }], [{
    key: 'extends',
    value: function _extends(BaseClass) {
      var api = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var B = function B(lexems) {
        BaseClass.call(this, lexems);
      };
      B.prototype = Object.create(BaseClass.prototype);
      B.prototype.constructor = B;
      for (var i in api) {
        // Object.assign seems to bug when used on prototype (not investigate enough : so use plain old for-in syntax)
        B.prototype[i] = api[i];
      }return B;
    }
  }]);
  return Babelute;
}();

/**
 * deserialize json to babelute
 * @param  {String} json the json string
 * @return {Babelute}      the deserialized babelute
 * @throws {Error} If json is badly formated
 */
function fromJSON(json) {
  return JSON.parse(json, function (k, v) {
    if (v && v.__babelute__) return new Babelute(v._lexems.map(function (lexem) {
      return new Lexem(lexem.lexicon, lexem.name, lexem.args);
    }));
    return v;
  });
}

// removed in production
/**
 * A FirstLevel is a Babelute that has exactly same api than its corresponding Babelute (from a DSL) but where every compounds methods has been replaced by its "atomic" equivalent.
 * (Same concept than 'first-level of understanding', as if we where stupid by always understanding only first literal sens of words.)
 * 
 * It provides sentences and lexems without any interpretation, and that could be really useful : e.g.
 * - to see sentence as "editable document" and/or for allowing meta-writing of sentences
 * - to obtain the full AST of babelute sentences 
 * 
 * @access protected
 */
/**
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */

var FirstLevel = function (_Babelute) {
  inherits$$1(FirstLevel, _Babelute);

  /**
   * construct a firstlevel babelute instance
   * @param  {?Array} lexems array of lexems for init. (only for internal use)
   */
  function FirstLevel(lexems) {
    classCallCheck$$1(this, FirstLevel);

    var _this = possibleConstructorReturn$$1(this, (FirstLevel.__proto__ || Object.getPrototypeOf(FirstLevel)).call(this, lexems));

    _this.__first_level_babelute__ = true;
    return _this;
  }

  /**
   * return a FirstLevelMethod aka a method that only append an atom (lexicon, name, args)
   * @param  {String} lexiconName the lexicon name of the appended atom
   * @param  {String} lexemName  the lexem name of the appended atom
   * @return {Function}           a function that append the atom
   */

  createClass$$1(FirstLevel, null, [{
    key: 'getFirstLevelMethod',
    value: function getFirstLevelMethod(lexiconName, lexemName) {
      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        this._lexems.push(new Lexem(lexiconName, lexemName, args));
        return this;
      };
    }
  }]);
  return FirstLevel;
}(Babelute);

// removed in production

/**
 * Initializer Class
 * @protected
 */
/*
* @Author: Gilles Coomans
* @Date:   2017-03-10 13:25:25
* @Last Modified by:   Gilles Coomans
* @Last Modified time: 2017-04-03 13:49:36
*/

var Initializer = function () {
  function Initializer() {
    classCallCheck$$1(this, Initializer);
  }

  createClass$$1(Initializer, null, [{
    key: 'extends',

    /**
     * extends Initializer
     * @param  {[type]} BaseInitializer [description]
     * @return {[type]}                 [description]
     */
    value: function _extends(BaseInitializer) {

      var Class = function Class() {};
      Class.prototype = Object.create(BaseInitializer.prototype);
      Class.prototype.constructor = Class;
      return Class;
    }
  }]);
  return Initializer;
}();

/**
 * create a Initializer (based on a Babelute subclass) and instanciate it
 * @param  {Babelute} BabeluteClass   a Babelute subclass from where create initializer
 * @param  {?Initializer} BaseInitializer a parent initializer to be extended (optional)
 * @return {Initializer}               the Initializer instance
 * @protected
 */

function createInitializer(BabeluteClass) {
  var BaseInitializer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var Init = BabeluteClass.Initializer = BaseInitializer ? Initializer.extends(BaseInitializer) : Initializer;
  BabeluteClass.initializer = new Init();
  BabeluteClass.initializer._empty = function () {
    return new BabeluteClass();
  };
  BabeluteClass.initializer.BabeluteClass = BabeluteClass;
  Object.keys(BabeluteClass).forEach(function (i) {
    addToInitializer(Init, i);
  });
  return BabeluteClass.initializer;
}

/**
 * add method to initializer
 * @protected
 * @param {Initializer} Initializer Initializer class where add methods in proto
 * @param {string} methodName  the name of method to add
 */
function addToInitializer(Initializer, methodName) {
  Initializer.prototype[methodName] = function () {
    return this.BabeluteClass.prototype[methodName].apply(new this.BabeluteClass(), arguments);
  };
}

// add base Babelute's api
['_use', '_each', '_if', '_append', '_lexicon'].forEach(function (methodName) {
  addToInitializer(Initializer, methodName);
});

// removed in production
/**
 * Lexicons dico : where to store public lexicon
 * @type {Object}
 * @private
 */
var lexicons = {};

/**
 * Lexicon class : helpers to store and manage DSL's API.
 * 
 * A __Lexicon__ is just an object aimed to handle, store and construct easily a DSL (its lexic - i.e. the bunch of words that compose it)
 * and its related Atomic/FirstLevel/SecondLevel Babelute subclasses, and their initializers.
 *
 * One DSL = One lexicon.
 *
 * A lexicon could extend another lexicon to manage dialects.
 *
 * You should never use frontaly the constructor (aka never use new Lexicon in  your app). Use createLexicon in place.
 * 
 * @public
 */

var Lexicon = function () {

  /**
   * @param  {string} name   the lexicon name
   * @param  {?Lexicon} parent an optional parent lexicon to be extended here
   */
  function Lexicon(name) {
    var _this = this;

    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    classCallCheck$$1(this, Lexicon); // all assertions will be removed in production

    /**
     * the parent lexicon (if any)
     * @type {Lexicon}
     * @public
     */
    this.parent = parent;
    parent = parent || {};

    /**
     * the lexicon's name
     * @type {String}
     */
    this.name = name;

    // the three APIs :
    /**
     * interpretable sentences API (finally always made from syntactical atoms (aka last level))
     * @type {Babelute}
     * @protected
     */
    this.Atomic = initClass(parent.Atomic || Babelute);
    /**
     * "document" sentences API (first level : aka all methods has been replaced by fake atomic methods)
     * @type {Babelute}
     * @protected
     */
    this.FirstLevel = initClass(parent.FirstLevel || FirstLevel);
    /**
     * AST-provider API aka the whole tree between first level and last level. Never use it directly : its used under the hood by {@link developOneLevel} method.
     * @type {Babelute}
     * @protected
     */
    this.SecondLevel = Babelute.extends(parent.SecondLevel || Babelute);

    /**
     * the secondLevel instance
     * @type {Babelute}
     * @protected
     */
    this.secondLevel = new this.SecondLevel();

    if (parent.Atomic) Object.keys(parent.Atomic.initializer).forEach(function (key) {
      addToInitializer(_this.Atomic.Initializer, key);
      addToInitializer(_this.FirstLevel.Initializer, key);
    });
  }

  /**
   * add atomic lexem (atoms) to lexicon
   * @param {string[]} atomsArray array of atoms name (as string)
   * @return {Lexicon} the lexicon itself
   */

  createClass$$1(Lexicon, [{
    key: 'addAtoms',
    value: function addAtoms(atomsArray) {
      var _this2 = this;

      atomsArray.forEach(function (name) {
        return addAtom(_this2, name);
      });

      return this;
    }

    /**
     * add compounds lexems to lexicon
     * @param {Function} producer a function that take a babelute initializer as argument and that return an object containing methods (lexems) to add to lexicon
     * @return {Lexicon} the lexicon itself
     */

  }, {
    key: 'addCompounds',
    value: function addCompounds(producer) {
      var _this3 = this;

      // Atomic API is produced with Atomic initializer
      var atomicMethods = producer(this.Atomic.initializer);

      for (var i in atomicMethods) {
        this.Atomic.prototype[i] = atomicMethods[i];
      } // SecondLevel API is simply produced with the related FirstLevel initializer. 
      // (so same producer method, same api, but different handler for inner composition)
      // is the only thing to do to gain capability to handle full AST. (see docs)
      var secondLevelCompounds = producer(this.FirstLevel.initializer);
      for (var j in secondLevelCompounds) {
        this.SecondLevel.prototype[j] = secondLevelCompounds[j];
      }Object.keys(atomicMethods).forEach(function (key) {
        _this3.FirstLevel.prototype[key] = FirstLevel.getFirstLevelMethod(_this3.name, key);
        addToInitializer(_this3.Atomic.Initializer, key);
        addToInitializer(_this3.FirstLevel.Initializer, key);
      });
      return this;
    }

    /**
     * add aliases lexems to lexicon (aliases are like shortcuts : they are added as this to Atomic, FirstLevel and SecondLevel API)
     * @param {Object} methods an object containing methods (lexems) to add to lexicon
     * @return {Lexicon} the lexicon itself
     */

  }, {
    key: 'addAliases',
    value: function addAliases(methods) {
      var _this4 = this;

      Object.keys(methods).forEach(function (key) {
        _this4.Atomic.prototype[key] = _this4.FirstLevel.prototype[key] = _this4.SecondLevel.prototype[key] = methods[key];
        addToInitializer(_this4.Atomic.Initializer, key);
        addToInitializer(_this4.FirstLevel.Initializer, key);
      });
      return this;
    }

    /**
     * @protected
     */

  }, {
    key: 'use',
    value: function use(babelute, name, args, firstLevel) {

      var instance = firstLevel ? this.FirstLevel.instance : this.Atomic.instance;

      if (!instance[name]) throw new Error('Babelute (' + this.name + ') : method not found : ' + name);
      instance[name].apply(babelute, args);
    }

    /**
     * @protected
     */

  }, {
    key: 'translateToAtomic',
    value: function translateToAtomic(babelute, targets) {
      return translate(babelute, this.Atomic, targets || this.targets);
    }

    /**
     * @protected
     */

  }, {
    key: 'translateToFirstLevel',
    value: function translateToFirstLevel(babelute, targets) {
      return translate(babelute, this.FirstLevel, targets || this.targets);
    }

    /**
     * return lexicon's initializer instance. (atomic or firstlevel depending on argument)
     * @public
     * @param  {Boolean} firstLevel true if you want firstLevel initializer, false overwise.
     * @return {Initializer}           the needed initializer instance
     */

  }, {
    key: 'initializer',
    value: function initializer(firstLevel) {
      return firstLevel ? this.FirstLevel.initializer : this.Atomic.initializer;
    }
  }, {
    key: 'createDialect',
    value: function createDialect(name) {
      return new Lexicon(name, this);
    }
  }]);
  return Lexicon;
}();

/**
 *  Add syntactical atom lexem to lexicon (actually to inner classes that reflect API). A syntactical Atom method is a function that only add one lexem.
 *  @private
 */

function addAtom(lexicon, name) {

  lexicon.Atomic.prototype[name] = lexicon.FirstLevel.prototype[name] = lexicon.SecondLevel.prototype[name] = FirstLevel.getFirstLevelMethod(lexicon.name, name);
  addToInitializer(lexicon.Atomic.Initializer, name);
  addToInitializer(lexicon.FirstLevel.Initializer, name);
}

/**
 * babelute lexicon's Classes initialisation
 * @private
 */
function initClass(BaseClass) {
  var Class = Babelute.extends(BaseClass);
  createInitializer(Class, BaseClass.Initializer);
  Class.instance = new Class();
  return Class;
}

/**
 * Way to create lexicon instances
 * @public
 * @param  {string} name   the name of the lexicon
 * @param  {Lexicon} parent a lexicon instance as parent for this one (optional)
 * @return {Lexicon}      a lexicon instance
 */
function createLexicon(name) {
  var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  return new Lexicon(name, parent);
}

/**
 * getLexicon registred lexicon by name
 * 
 * @param  {string} lexiconName the lexicon's name
 * @return {Lexicon}      the lexicon
 * @throws {Error} If lexicon not found with lexiconName
 */
function getLexicon(lexiconName) {

  var lexicon = lexicons[lexiconName];
  if (!lexicon) throw new Error('lexicon not found : ' + lexiconName);
  return lexicon;
}

/**
 * registerLexicon lexicon by name
 * @param  {Lexicon} lexicon the lexicon instance to registerLexicon
 * @param  {?string} name    lexicon name (optional : if not provided : use the one from lexicon itself)
 */
function registerLexicon(lexicon) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  lexicons[name || lexicon.name] = lexicon;
}

/*
 * _lexicon handeling
 */

// implementation of already declared method in Babelute's proto
Babelute.prototype._lexicon = function (lexiconName) {
  return new (getLexicon(lexiconName).Atomic)(this._lexems);
};

FirstLevel.prototype._lexicon = function (lexiconName) {
  return new (getLexicon(lexiconName).FirstLevel)(this._lexems);
};

/**
 * _use handeling
 */

// implementation of already declared method in Babelute's proto
Babelute.prototype._use = function (babelute /* could be a string in "lexiconName:methodName" format */) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return babelute ? use(this, babelute, args, false) : this;
};

// implementation of already declared method in Babelute's proto
FirstLevel.prototype._use = function (babelute /* could be a string in "lexiconName:methodName" format */ /*, ...args */) {
  return babelute ? use(this, babelute, [].slice.call(arguments, 1), true) : this;
};

function use(self, babelute, args, firstLevel) {
  if (typeof babelute === 'string') {
    var splitted = babelute.split(':');
    getLexicon(splitted[0]).use(self, splitted[1], args, firstLevel);
  } else if (babelute.__babelute__) self._lexems = self._lexems.concat(babelute._lexems);
  return self;
}

/**
 * Translation
 */
function translate(babelute, BabeluteClass, targets) {
  var b = new BabeluteClass();
  babelute._lexems.forEach(function (lexem) {
    if (targets && !targets[lexem.lexicon] || this[lexem.name]) // simply forwards lexem (copy) if not in targets
      this._lexems.push(new Lexem(lexem.lexicon, lexem.name, lexem.args));else this[lexem.name].apply(this, lexem.args.map(function (value) {
      if (!value || !value.__babelute__) return value;
      return translate(value, BabeluteClass, targets);
    }));
  }, b);
  return b;
}

/**
 * return a new babelute from needed lexicon
 * @param  {string} lexiconName             the lexicon from where to take api
 * @param  {Boolean} asFirstLevel  True if it needs to return a FirstLevel instance. False or ommitted : returns an Atomic instance.
 * @return {[type]}                  the babelute instance (either an Atomic or a FirstLevel)
 * @throws {Error} If lexicon not found with lexiconName
 */
function init(lexiconName, asFirstLevel) {
  if (lexiconName) return new (getLexicon(lexiconName)[asFirstLevel ? 'FirstLevel' : 'Atomic'])();else if (asFirstLevel) return new FirstLevel();
  return new Babelute();
}

/**
 * develop a FirstLevel compounds-words-lexem through SecondLevel API. It returns the FirstLevel sentence corresponding to lexem's semantic developement.
 * @param  {Lexem} lexem the lexem to develop
 * @param {?Lexicon} lexicon the optional lexicon to use
 * @return {FirstLevel} the developed sentence
 * @throws {Error} If lexicon not found with lexem.lexicon
 * @throws {Error} If method not found in lexicon
 */
function developOneLevel(lexem) {
  var lexicon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  lexicon = lexicon || getLexicon(lexem.lexicon);

  return lexicon.secondLevel[lexem.name].apply(new lexicon.FirstLevel(), lexem.args);
}

/**
 * develop a FirstLevel lexem through Atomic API. Return the atomic representation of the lexem (in its own language).
 * @param  {Lexem} lexem the lexem to develop
 * @param {?Lexicon} lexicon the optional lexicon to use
 * @return {Babelute} the developed sentence
 * @throws {Error} If lexicon not found with lexem.lexicon
 * @throws {Error} If method not found in lexicon
 */
function developToAtoms(lexem) {
  var lexicon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  lexicon = lexicon || getLexicon(lexem.lexicon);

  return lexicon.Atomic.prototype[lexem.name].apply(new lexicon.Atomic(), lexem.args);
}

/**
 * Provide Babelute Subclass "initializer" object (the one with all the flattened shortcut api for starting sentences easily)
 * @param  {string} lexiconName The lexiconName where catch the Babelute Class from where getLexicon or create the initializer object.
 * @param  {boolean} asFirstLevel true if should return a first-level instance. false to return an atomic instance.
 * @return {Object}   An initializer object with shortcuted API from lexicon's Atomic prototype
 * @throws {Error} If lexicon not found with lexiconName
 */
function initializer(lexiconName, asFirstLevel) {
  if (!asFirstLevel) return getLexicon(lexiconName).Atomic.initializer;
  return getLexicon(lexiconName).FirstLevel.initializer;
}

// removed in production

/**
 * Base class to provide homogeneous Pragmatics interface. You should never instanciate a Pragmatics directly with new. use {@link createPragmatics}.
 */
var Pragmatics = function () {

  /**
   * @param  {Object} targets initial targets object
   * @param  {Object} pragmas pragmatics methods to add
   */
  function Pragmatics() {
    var targets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var pragmas = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck$$1(this, Pragmatics);

    /**
     * targets holder object
     * @type {Object}
     * @public
     */
    this._targets = targets;

    if (pragmas) this.addPragmas(pragmas);
  }

  /**
   * add methods to pragmatics instance
   * @param {Object} pragmas an object containing methods to add
   */

  createClass$$1(Pragmatics, [{
    key: 'addPragmas',
    value: function addPragmas(pragmas) {

      for (var i in pragmas) {
        /**
         * @ignore
         */
        this[i] = pragmas[i];
      }
    }

    /* istanbul ignore next */
    /**
     * the method used to output a babelute through this pragmatics instance
     * @abstract
     */

  }, {
    key: '$output',
    value: function $output() /* ... */{
      // to be overridden
      throw new Error('pragmatics.$output should be implemented in subclasses');
    }
  }]);
  return Pragmatics;
}();

/**
 * return a new Pragmatics instance. Do not forget to implement $output before usage.
 * @param  {Object} targets initial targets object
 * @param  {Object} pragmas pragmatics methods to add
 * @return {Pragmatics}   the Pragmatics instance
 */
/**
 * Pragmatics Class : minimal abstract class for homogeneous pragmatics.
 *
 * This is the minimal contract that a pragmatics should satisfy.
 *
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */

function createPragmatics() {
  var targets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var pragmas = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return new Pragmatics(targets, pragmas);
}

// removed in production
/**
 * FacadePragmatics : a facade oriented Pragmatics subclass. You should never instanciate a FacadePragmatics directly with new. use {@link createFacadePragmatics}.
 * @example
 * // Remarque : any lexem's method will be of the following format : 
 * function(subject, args, ?percolator){
 * 	// return nothing
 * }
 */
var FacadePragmatics = function (_Pragmatics) {
  inherits$$1(FacadePragmatics, _Pragmatics);

  /**
   * @param  {Object} targets initial targets object
   * @param  {?Object} pragmas pragmatics methods to add
   */
  function FacadePragmatics(targets) {
    var pragmas = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    classCallCheck$$1(this, FacadePragmatics);
    return possibleConstructorReturn$$1(this, (FacadePragmatics.__proto__ || Object.getPrototypeOf(FacadePragmatics)).call(this, targets, pragmas));
  }

  /**
   * "each" facade implementation
   * @param  {Object} subject the handled subject
   * @param  {Array|arguments} args  the lexem's args : [ collection:Array, itemHandler:Function ]
   * @param  {?Object} percolator  the sentence's percolator instance
   * @return {void}         nothing
   */

  createClass$$1(FacadePragmatics, [{
    key: 'each',
    value: function each(subject, args /* collection, itemHandler */, percolator) {

      var collec = args[0],
          itemHandler = args[1];

      if (collec && collec.length) // no supputation on collection kind : use "for"
        for (var i = 0, len = collec.length, item, templ; i < len; ++i) {
          item = collec[i];
          templ = itemHandler(item, i);
          if (templ) this.$output(subject, templ, percolator);
        }
    }

    /**
     * "if" facade implementation 
     * @param  {Object} subject the handled subject
     * @param  {Array|arguments} args  the lexem's args : [ conditionIsTrue:Babelute, conditionIsFalse:Babelute ]
     * @param  {?Object} percolator  the sentence's percolator instance
     * @return {void}         nothing
     */

  }, {
    key: 'if',
    value: function _if(subject, args /* trueBabelute, falseBabelute */, percolator) {

      if (args[0]) this.$output(subject, args[1], percolator);else if (args[2]) this.$output(subject, args[2], percolator);
    }

    /**
     *
     * @override
     * @param  {Object} subject  the subject handle through interpretation
     * @param  {Babelute} babelute the babelute "to interpret on" subject
     * @param  {Scope} percolator   the sentence percolator instance (optional)
     * @return {Object}        the subject
     */

  }, {
    key: '$output',
    value: function $output(subject, babelute) {
      var percolator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      for (var i = 0, lexem, len = babelute._lexems.length; i < len; ++i) {
        lexem = babelute._lexems[i];
        if (this._targets[lexem.lexicon] && this[lexem.name]) this[lexem.name](subject, lexem.args, percolator);
      }
      return subject;
    }
  }]);
  return FacadePragmatics;
}(Pragmatics);

/**
 * create a facade-ready-to-run initializer function.
 * @param  {Lexicon} lexicon    the lexicon from where take the api
 * @param  {Object} pragmatics   the pragmatics object where to find interpretation method to fire immediatly
 * @return {Function}            the facade initializer function
 * @example
 *
 * import babelute from 'babelute';
 * const myLexicon = babelute.createLexicon('my-lexicon');
 * myLexicon.addAtoms(['foo', 'bar']);
 * 
 * const myPragmas = babelute.createFacadePragmatics({
 * 	'my-lexicon':true
 * }, {
 * 	foo(subject, args, percolator){
 * 		// do something
 * 	},
 * 	bar(subject, args, percolator){
 * 		// do something
 * 	}
 * });
 *
 * const mlp = babelute.createFacadeInitializer(myLexicon, myPragmas);
 *
 * mlp(mySubject).foo(...).bar(...); // apply pragmas immediatly on subject through lexicon api's
 *
 */
function createFacadeInitializer(lexicon, pragmatics) {
  var Facade = function Facade(subject) {
    var percolator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    lexicon.Atomic.call(this);
    this._subject = subject;
    this._percolator = percolator;
  };

  Facade.prototype = Object.create(lexicon.Atomic.prototype);
  Facade.prototype.constructor = Facade;
  Facade.prototype._lexicon = null;
  Facade.prototype._append = function (lexiconName, name, args) {
    if ((!pragmatics._targets || pragmatics._targets[lexiconName]) && pragmatics[name]) pragmatics[name](this._subject, args, this._percolator);
    return this;
  };
  return function (subject) {
    var percolator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    return new Facade(subject, percolator);
  };
}

/**
 * create a FacadePragmatics instance
 * @param  {Object} targets the pragmatics targets DSL
 * @param  {?Object} pragmas the methods to add
 * @return {FacadePragmatics}     the facade pragmatics instance
 * @example
 * const myPragmas = babelute.createFacadePragmatics({
 * 	'my-lexicon':true
 * }, {
 * 	foo(subject, args, percolator){
 * 		// do something
 * 	},
 * 	bar(subject, args, percolator){
 * 		// do something
 * 	}
 * });
 */
function createFacadePragmatics(targets) {
  var pragmas = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  return new FacadePragmatics(targets, pragmas);
}

/*
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016 Gilles Coomans
 */

var index$2 = {
  createLexicon: createLexicon,
  createPragmatics: createPragmatics,
  createFacadeInitializer: createFacadeInitializer,
  createFacadePragmatics: createFacadePragmatics,
  init: init,
  initializer: initializer,
  getLexicon: getLexicon,
  registerLexicon: registerLexicon,
  developOneLevel: developOneLevel,
  developToAtoms: developToAtoms,
  fromJSON: fromJSON,
  Babelute: Babelute,
  Lexem: Lexem,
  FirstLevel: FirstLevel,
  Pragmatics: Pragmatics,
  FacadePragmatics: FacadePragmatics,
  Lexicon: Lexicon,
  lexicons: lexicons
};

/*
 * @Author: Gilles Coomans
 */

/**
 * parse and insert html string in node and return created nodes
 * @param  {[type]} content     [description]
 * @param  {[type]} node        [description]
 * @param  {[type]} nextSibling [description]
 * @return {[type]}             [description]
 */
/**
 * cast inner nod value depending on node value
 * @param  {DomElement} node [description]
 * @param  {String} type the needed type of the value
 * @return {*}     the casted value
 */
function castNodeValueTo(node, type) {
	switch (type) {
		case 'text':
			return node.textContent;
		case 'integer':
			return parseInt(node.textContent, 10);
		case 'html':
			return node.innerHTML;
		default:
			throw new Error('content editable casting fail : unrecognised rule : ', type);
	}
}

/**
 * ***** Babelute HTML5 DSL lexicon *****
 *
 * 
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016-2017 Gilles Coomans
 */
/**
 * @external {Lexicon} https://github.com/nomocas/babelute
 */
/**
 * html lexicon
 * @type {Lexicon}
 * @public
 * @see  https://github.com/nomocas/babelute-html
 */
var htmlLexicon = index$2.createLexicon('html');

/*******
 *******	LANGUAGE ATOMS
 *******/
htmlLexicon.addAtoms(['tag', 'attr', 'prop', 'data', 'class', 'classes', 'id', 'style', 'text', 'onDom', 'onString', 'if', 'each', 'keyedEach', 'html', 'component', 'ref', 'container', 'client', 'server']);

/*******
 *******	COMPOUNDS WORDS (based on language atoms)
 *******/
// simple tags (made with .tag) (list should be completed if needed)
htmlLexicon.tagsList = ['body', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'section', 'span', 'button', 'main', 'article', 'hr', 'header', 'footer', 'label', 'ul', 'li', 'p', 'small', 'b', 'strong', 'i', 'u', 'title', 'meta', 'table', 'tr', 'td', 'tbody', 'form', 'br'];
// events (made with .on) (list should be completed if needed)
htmlLexicon.eventsList = ['click', 'blur', 'focus', 'submit', 'mouseover', 'mousedown', 'mouseup', 'mouseout', 'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove', 'drop', 'dragover', 'dragstart'];

htmlLexicon.addAliases({
	execute: function execute(method) {
		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		return this._append('html', 'execute', [method, args]);
	},
	switchUse: function switchUse(lexemRef) {
		for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
			args[_key2 - 1] = arguments[_key2];
		}

		return this._append('html', 'switchUse', [lexemRef, args]);
	},
	on: function on(eventName, callback) {
		for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
			args[_key3 - 2] = arguments[_key3];
		}

		return this._append('html', 'on', [eventName, callback, args]);
	}
}).addCompounds(function () {
	var methods = {};
	htmlLexicon.tagsList.forEach(function (tagName) {
		methods[tagName] = function () {
			return this._append('html', 'tag', [tagName, arguments]);
		};
	});
	htmlLexicon.eventsList.forEach(function (eventName) {
		methods[eventName] = function (callback) {
			for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
				args[_key4 - 1] = arguments[_key4];
			}

			return this._append('html', 'on', [eventName, callback, args]);
		};
	});
	return methods;
}).addCompounds(function (h) {
	return {
		select: function select(selected, options) {
			var babelute = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

			if (arguments.length === 1) // use a simple tag that receive a babelute as child (first arg)
				return this.tag('select', [selected]);
			return this.tag('select', [h.each(options, function (option) {
				return h.option(option.value, option.label, option.value === selected);
			}), babelute]);
		},
		link: function link(href, rel, babelute) {
			return this.tag('link', [h.attr('href', href).attr('rel', rel), babelute]);
		},
		linkCSS: function linkCSS(href) {
			return this.link(href, 'stylesheet', h.attr('type', 'text/css'));
		},
		input: function input(type, val, babelute) {
			return this.tag('input', [h.attr('type', type).prop('value', val), babelute]);
		},
		textInput: function textInput(val, babelute) {
			return this.input('text', val, babelute);
		},
		passwordInput: function passwordInput(val, babelute) {
			return this.input('password', val, babelute);
		},
		checkbox: function checkbox(checked, babelute) {
			return this.tag('input', [h.attr('type', 'checkbox').prop('checked', !!checked), babelute]);
		},
		radio: function radio(checked, babelute) {
			return this.tag('input', [h.attr('type', 'radio').prop('checked', !!checked), babelute]);
		},
		option: function option(value, content, selected) {
			return this.tag('option', [h.attr('value', value).prop('selected', !!selected), content]);
		},
		script: function script(src, content) {
			return this.tag('script', [h.attr('src', src).attr('type', 'text/javascript'), content]);
		},
		a: function a() {
			arguments[0] = h.attr('href', arguments[0]);
			return this.tag('a', arguments);
		},
		img: function img() {
			arguments[0] = h.attr('src', arguments[0]);
			return this.tag('img', arguments);
		},
		nbsp: function nbsp() {
			return this.text('\xA0');
		},
		visible: function visible(yes) {
			return this.style('visibility', yes ? 'visible' : 'hidden');
		},
		display: function display(flag) {
			return this.style('display', typeof flag === 'string' ? flag : flag ? 'block' : 'none');
		},
		disabled: function disabled(flag) {
			return this.prop('disabled', !!flag);
		},
		contentEditable: function contentEditable(opt /*{ value, updateHandler, valueType = "text"[|"html"|"integer"], updateOnEvent = "blur", isEditable = true, placeholder = '...' } */) {
			var contentProperty = opt.valueType === 'html' ? 'innerHTML' : 'textContent';
			return this.prop('contentEditable', !!opt.isEditable).prop(contentProperty, opt.value || opt.placeholder || '').on(opt.updateOnEvent || 'blur', function (e) {
				var val = castNodeValueTo(e.currentTarget, opt.valueType || 'text');
				if (val !== opt.value) opt.updateHandler(val);else if (val === '') e.currentTarget[contentProperty] = opt.placeholder || '';
			}).click(function (e) {
				if (opt.isEditable) {
					if (opt.placeholder && e.currentTarget[contentProperty] === opt.placeholder) e.currentTarget[contentProperty] = '';
				}
			});
		}
	};
});

/**
 * Todomvc html lexicon (aka web components)
 * @author Gilles Coomans
 */

var todomvcLexicon = index$2.createLexicon('todomvc', htmlLexicon);

todomvcLexicon.addCompounds(function (h) {
	return {
		// main entry point
		todomvc: function todomvc(todos, route, methods) {

			var visibleTodos = route !== 'all' ? todos.filter(function (todo) {
				return route === 'completed' ? todo.completed : !todo.completed;
			}) : todos;

			return this.div(h.class('todomvc-wrapper').section(h.id('todoapp').class('todoapp').todomvcHeader(methods).mainSection(visibleTodos, todos.length, methods).statsSection(todos, route, methods)).todomvcFooter());
		},
		mainSection: function mainSection(visibleTodos, todosLength, methods) {
			return this.section(h.id('main').class('main').visible(todosLength).toggleAllButton(methods).ul(h.id('todo-list').class('todo-list').each(visibleTodos, function (todo) {
				return h.todoItem(todo, methods);
			})));
		},
		todomvcHeader: function todomvcHeader(methods) {
			return this.header(h.id('header').class('header').h1('Todos').textInput('', h.id('new-todo').class('new-todo').attr('placeholder', 'What needs to be done?').on('keydown', function (e) {
				if (e.keyCode === 13 && e.target.value) {
					methods.append(e.target.value);
					e.target.value = '';
				}
			})));
		},
		toggleAllButton: function toggleAllButton(methods) {
			return this.checkbox(false, h.id('toggle-all').class('toggle-all').attr('name', 'toggle').on('click', methods.toggleAll)).label(h.attr('for', 'toggle-all'), 'Mark all as complete');
		},
		todoLabel: function todoLabel(methods, title, id) {
			return this.label(title, h.prop('contentEditable', true).on('keyup', function (e) {
				if (e.keyCode === 27) // escape 
					methods.updateTitle(id, title);else //if (e.keyCode === 13 && e.target.value)
					methods.updateTitle(id, e.target.textContent);
			}));
		},
		todoItem: function todoItem(todo, methods) {
			return this.li(h.class('completed', todo.completed).div(h.class('view').checkbox(todo.completed, h.class('toggle').click(function () {
				return methods.toggleComplete(todo.id);
			})).todoLabel(methods, todo.title, todo.id).button(h.class('destroy').click(function () {
				return methods.delete(todo.id);
			}))));
		},
		todomvcFooter: function todomvcFooter() {
			return this.footer(h.id('info').class('info').p('Written by ', h.a('https://github.com/nomocas', 'nomocas')).p('Part of ', h.a('http://todomvc.com', 'TodoMVC')));
		},
		statsSectionNav: function statsSectionNav(route) {
			return this.ul(h.id('filters').class('filters').li(h.a('#/', h.class('selected', route === 'all'), 'All')).li(h.a('#/active', h.class('selected', route === 'active'), 'Active')).li(h.a('#/completed', h.class('selected', route === 'completed'), 'Completed')));
		},
		clearCompletedButton: function clearCompletedButton(todosCompleted, methods) {
			return this.button(h.id('clear-completed').class('clear-completed').visible(todosCompleted > 0).on('dblclick', methods.clearCompleted), 'Clear completed (' + todosCompleted + ')');
		},
		statsSection: function statsSection(todos, route, methods) {
			var todosLeft = todos.filter(function (todo) {
				return !todo.completed;
			}).length,
			    todosCompleted = todos.length - todosLeft;

			return this.footer(h.id('footer').class('footer').visible(todos.length).span(h.id('todo-count').class('todo-count').strong(todosLeft), (todosLeft === 1 ? ' item' : ' items') + ' left').statsSectionNav(route).clearCompletedButton(todosCompleted, methods));
		}
	};
});

/*
 * @Author: Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */

var _targets = {
	html: true
};

/*
 * @Author: Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */
/**
 * @external {Pragmatics} https://github.com/nomocas/babelute
 */

var removeActions = {
	attr: function attr($tag, lexem) {
		$tag.removeAttribute(lexem.args[0]);
	},
	class: function _class($tag, lexem) {
		if (lexem.args[0]) $tag.classList.remove(lexem.args[0]);
	},
	classes: function classes($tag, lexem) {
		var splitted = lexem.args[0].split(/\s+/);
		splitted.forEach(function (cl) {
			if (cl) $tag.classList.remove(cl);
		});
	},
	prop: function prop($tag, lexem) {
		delete $tag[lexem.args[0]];
	},
	data: function data($tag, lexem) {
		delete $tag.dataset[lexem.args[0]];
	},
	style: function style($tag, lexem) {
		delete $tag.style[lexem.args[0]];
	},
	id: function id($tag) {
		delete $tag.id;
	},
	on: function on($tag, lexem) {
		$tag.removeEventListener(lexem.args[0], lexem.listener);
	},
	onDom: function onDom($tag, lexem /* render, dif, remove */, component) {
		var remove = lexem.args[2];
		if (remove) remove($tag, lexem, component);
	},
	html: function html($tag, lexem) {
		if (lexem.html) lexem.html.forEach(function (child) {
			return $tag.removeChild(child);
		});
	},
	text: function text($tag, lexem) {
		$tag.removeChild(lexem.child);
	},
	each: function each($tag, lexem, component) {
		lexem.children.forEach(function (child) {
			return remove($tag, child, component);
		});
	},
	tag: function tag($tag, lexem) {
		var babelutes = lexem.args[1],
		    len = babelutes.length;
		for (var i = 0; i < len; ++i) {
			seekAndUnmountComponent(babelutes[i]);
		}$tag.removeChild(lexem.child);
	}
};

function remove($tag, babelute, component) {
	for (var i = 0, lexems = babelute._lexems, lexem, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targets[lexem.lexicon]) continue;
		if (removeActions[lexem.name]) // class, attr, id, prop, data, each, text, tag, html, component and .on
			removeActions[lexem.name]($tag, lexem, component);else if (lexem.developed) // compounds and if
			remove($tag, lexem.developed, component);

		if (lexem.witness) // if, each, component
			$tag.removeChild(lexem.witness);
	}
}

function seekAndUnmountComponent(babelute) {
	var instance = void 0;
	for (var i = 0, lexems = babelute._lexems, lexem, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (_targets[lexem.lexicon]) {
			if (lexem.children) // each
				seekAndUnmountComponentInArray(lexem.children);else if (lexem.name === 'tag') seekAndUnmountComponentInArray(lexem.args[1]);else if (lexem.name === 'onDom') removeActions.onDom(lexem.$tag, lexem /*, component*/);else if (lexem.instance) {
				// component, postalComponent and container
				instance = lexem.instance;
				seekAndUnmountComponent(instance.developed);
				instance.componentWillUnmount && (instance.componentWillUnmount(), instance.componentDidUnmount()); // if we have one we have both
			} else if (lexem.developed) // compounds and if, router 
				seekAndUnmountComponent(lexem.developed);
		}
	}
}

/*
	TODO : manage onDom third method while seeking
 */

function seekAndUnmountComponentInArray(babelutes) {
	var lenB = babelutes.length;
	for (var j = 0; j < lenB; ++j) {
		seekAndUnmountComponent(babelutes[j]);
	}
}

/*
	For optimisation : component should keep its parent reference

	if compoenent has a componentWillUnmount (or did)
	==> this.parent.childNeedUnmount++; 
	which should be forwarded to its own parent, etc
	==> then on unmount
		this.parent.childNeedUnmout--;
		which should be forwarded to its own parent, etc

	when seeking for unmountable component : when encounter a component : check childNeedUnmout count.
	If 0 : don't recurse
 */

/*
 * @Author: Gilles Coomans
 */

/**
 * parse and insert html string in node and return created nodes
 * @param  {[type]} content     [description]
 * @param  {[type]} node        [description]
 * @param  {[type]} nextSibling [description]
 * @return {[type]}             [description]
 */
function insertHTML(content, node) {
	var nextSibling = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	if (!content) return;

	// TODO: use this in place : still to catch iserted elements and manage buggy text nodes (when html start with text node)
	// if(nextSibling)
	// 	nextSibling.insertAdjacentHTML('beforebegin', content);
	// else
	// 	node.insertAdjacentHTML('beforeend', content)

	var div = document.createElement('div'),
	    elems = [];
	var wrapped = void 0;
	if (content[0] !== '<') {
		// to avoid bug of text node that disapear
		content = '<p>' + content + '</p>';
		wrapped = true;
	}
	div.innerHTML = content;
	var parent = wrapped ? div.firstChild : div,
	    childNodes = [].slice.call(parent.childNodes);
	var frag = void 0;
	if (nextSibling) frag = document.createDocumentFragment();
	for (var i = 0, len = childNodes.length, el; i < len; ++i) {
		el = childNodes[i];
		elems.push(el);
		(frag || node).appendChild(el);
	}
	if (nextSibling) node.insertBefore(frag, nextSibling);
	return elems;
}

var toConsumableArray$1 = function toConsumableArray(arr) {
	if (Array.isArray(arr)) {
		for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
			arr2[i] = arr[i];
		}return arr2;
	} else {
		return Array.from(arr);
	}
};

/*
 * @Author: Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 * @external {Pragmatics} https://github.com/nomocas/babelute
 */

var renderActions = {
	// Atoms rendering
	class: function _class($tag, lexem) {
		var args = lexem.args; /* className */
		if (args[0] && (args.length === 1 || args[1])) $tag.classList.add(args[0]);
	},
	classes: function classes($tag, lexem /* args : classes */) {
		var splitted = lexem.args[0].split(/\s+/);
		splitted.forEach(function (cl) {
			if (cl) $tag.classList.add(cl);
		});
	},
	attr: function attr($tag, lexem) {
		var args = lexem.args; /* name, value */
		$tag.setAttribute(args[0], args[1]);
	},
	prop: function prop($tag, lexem) {
		var args = lexem.args; /* name, value */
		$tag[args[0]] = args[1];
	},
	data: function data($tag, lexem) {
		var args = lexem.args; /* name, value */
		$tag.dataset[args[0]] = args[1];
	},
	style: function style($tag, lexem) {
		var args = lexem.args; /* name, value */
		$tag.style[args[0]] = args[1];
	},
	id: function id($tag, lexem) {
		$tag.id = lexem.args[0];
	},
	on: function on($tag, lexem) {
		var args = lexem.args,


		/* eventName, callback */
		closure = lexem.closure = { handler: args[1], args: args[2] };
		lexem.listener = function (e) {
			closure.handler.apply(closure, [e].concat(toConsumableArray$1(closure.args)));
		};
		$tag.addEventListener(args[0], lexem.listener);
	},

	// structural render actions
	tag: function tag($tag, lexem, component, frag) {
		lexem.child = document.createElement(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
		var babelutes = lexem.args[1];
		for (var i = 0, len = babelutes.length, babelute; i < len; ++i) {
			babelute = babelutes[i];
			if (typeof babelute === 'undefined') // cast undefined to '' to keep track of node for diffing
				babelute = '';
			if (!babelute || !babelute.__babelute__) // text node
				babelute = babelutes[i] = new index$2.Babelute()._append('html', 'text', [babelute]);
			render(lexem.child, babelute, component);
		}
	},
	text: function text($tag, lexem, component, frag) {
		lexem.child = document.createTextNode(lexem.args[0]);
		(frag || $tag).appendChild(lexem.child);
	},
	if: function _if($tag, lexem, component, frag) {
		var toRender = lexem.args[0] ? lexem.args[1] : lexem.args[2] ? lexem.args[2] : null;
		if (toRender) {
			lexem.developed = typeof toRender === 'function' ? toRender(lexem.args[0]) : toRender;
			render($tag, lexem.developed, component, frag);
		}
		lexem.witness = document.createComment('if');
		$tag.appendChild(lexem.witness);
	},
	each: function each($tag, lexem, component, frag) {
		var args = lexem.args,
		    collection = args[0] = args[0] || [],
		    itemRender = args[1];
		lexem.children = [];
		for (var i = 0, len = collection.length, developed; i < len; ++i) {
			developed = itemRender(collection[i], i);
			lexem.children.push(developed);
			render($tag, developed, component, frag);
		}
		lexem.witness = document.createComment('each');
		$tag.appendChild(lexem.witness);
	},

	// custom output
	onDom: function onDom($tag, lexem, component, frag /* args = render, dif, remove */) {
		var onRender = lexem.args[0];
		lexem.$tag = $tag;
		if (onRender) onRender($tag, lexem, component, frag);
	},
	html: function html($tag, lexem) {
		lexem.html = insertHTML(lexem.args[0], $tag);
		lexem.witness = document.createComment('html');
		$tag.appendChild(lexem.witness);
	},
	execute: function execute($tag, lexem) {
		lexem.args[0].apply(null, lexem.args[1]);
	},
	ref: function ref($tag, lexem, component) {
		component && (component[lexem.args[0]] = $tag);
	},
	switchUse: function switchUse($tag, lexem, component, frag) {
		var _ref;

		lexem.developed = (_ref = new index$2.FirstLevel())._use.apply(_ref, [lexem.args[0]].concat(toConsumableArray$1(lexem.args[1])));
		render($tag, lexem.developed, component, frag);
		lexem.witness = document.createComment('switchUse');
		$tag.appendChild(lexem.witness);
	}
};

function render($tag, babelute, component, frag) {
	for (var i = 0, lexem, lexems = babelute._lexems, len = lexems.length; i < len; ++i) {
		lexem = lexems[i];
		if (!_targets[lexem.lexicon]) continue;
		if (renderActions[lexem.name]) renderActions[lexem.name]($tag, lexem, component, frag);else {
			// no actions means it's a compound lexem.
			if (!lexem.args || !lexem.args.length) // if lexem has receive no arguments : bypass level-by-level developpement
				lexem.developed = index$2.developToAtoms(lexem, _targets[lexem.lexicon]);else // or develop just next level and recurse.
				lexem.developed = index$2.developOneLevel(lexem, _targets[lexem.lexicon]);
			lexem.developed && render($tag, lexem.developed, component, frag);
		}
	}
}

/*
 * @Author: Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */
/**
 * @external {Pragmatics} https://github.com/nomocas/babelute
 */

/**
 * difActions
 * @public
 * @type {Object}
 */
var difActions = {
	// structurals
	if: function _if($tag, lexem, olexem, component) {
		lexem.witness = olexem.witness;
		var args = lexem.args,
		    oargs = olexem.args;
		var toRender = void 0;
		if (!args[0] !== !oargs[0]) {
			// condition has change
			if (!args[0] || oargs[2]) // if condition was true (there is a success babelute that was developed) OR it was false and there is an elseBabelute in olexem that was developed
				remove($tag, olexem.developed, component); // remove old babelute (either "success or else" babelute)
			toRender = args[0] ? args[1] : args[2]; // if condition is true take "success babelute", else take "else babelute"
			if (toRender) {
				// render : add children tags to fragment then add to $tag + add attributes (and co) directly to $tag.
				var frag = document.createDocumentFragment();
				lexem.developed = typeof toRender === 'function' ? toRender() : toRender;
				render($tag, lexem.developed, component, frag);
				$tag.insertBefore(frag, lexem.witness);
			}
		} else {
			// no change so dif developed babelutes
			toRender = args[0] ? args[1] : args[2];
			if (toRender) {
				lexem.developed = typeof toRender === 'function' ? toRender() : toRender;
				dif($tag, lexem.developed, olexem.developed, component);
			}
		}
	},
	each: function each($tag, lexem, olexem, component) {
		var collection = lexem.args[0] || [],
		    renderItem = lexem.args[1],
		    ochildren = olexem.children,
		    len = collection.length,
		    olen = ochildren.length,
		    children = lexem.children = new Array(len);

		var developed = void 0,
		    frag = void 0,
		    item = void 0,
		    i = 0;

		lexem.witness = olexem.witness; // keep track of witness

		if (len > olen) // create fragment for new items
			frag = document.createDocumentFragment();
		for (; i < len; ++i) {
			// for all items (from new lexem)
			item = collection[i];
			developed = renderItem(item, i); // render firstdegree item
			children[i] = developed; // keep new developed for next diffing
			if (i < olen) // dif existing children
				dif($tag, developed, ochildren[i], component);else // full render new item and place produced tags in fragment 
				render($tag, developed, component, frag); // ($tag is forwarded for first level non-tags atoms lexems (aka class, attr, ...))
		}
		for (; i < olen; ++i) {
			// remove not diffed old children
			remove($tag, ochildren[i], component);
		}if (frag) // insert new children fragment (if any)
			$tag.insertBefore(frag, lexem.witness);
	},

	/*
 	keyedEach are almost workable.
 	still only reinsert logic (tag displacement) 
  */

	// keyedEach($tag, lexem, olexem, component, frag) {
	// 	const items = lexem.args[1],
	// 		keyName = lexem.args[1],
	// 		renderer = lexem.args[2],
	// 		newDico = lexem.dico = {},
	// 		oDico = olexem.dico,
	// 		oChildren = olexem.children,
	// 		children = lexem.children = [];

	// 	let lastdeveloped, seenIndex = 0,
	// 		i = 0,
	// 		key, olddeveloped, newdeveloped;

	// 	for (let len = items.length, item; i < len; ++i) {
	// 		// dif then displace : displace mean reinserting child (tag(s)) at current index
	// 		key = item[keyName];
	// 		olddeveloped = oDico[key];
	// 		newdeveloped = renderer(item);

	// 		children.push(newdeveloped);

	// 		if (olddeveloped) {
	// 			dif($tag, newdeveloped, olddeveloped, component);
	// 			if (i !== olddeveloped.index)
	// 				reinsert($tag, newdeveloped, lastChild(lastdeveloped)); // (displace tags after last developed)

	// 			// reorder oldChildren by swapping (for catching notSeens at the end of ochildren)
	// 			if (seenIndex !== olddeveloped.index) {
	// 				const temp = oChildren[seenIndex];
	// 				oChildren[seenIndex] = oChildren[olddeveloped.index];
	// 				oChildren[olddeveloped.index] = temp;
	// 			}
	// 			seenIndex++;
	// 		} else if (i < oChildren.length) {
	// 			// render in fragment then insertBefore lastdeveloped.nextSibling
	// 			const frag = document.createDocumentFragment();
	// 			render(frag, newdeveloped, component);
	// 			$tag.insertBefore(frag, lastChild(lastdeveloped).nextSibling);
	// 		} else {
	// 			render($tag, newdeveloped, component, frag);
	// 		}
	// 		newDico[key] = lastdeveloped = newdeveloped;
	// 		newdeveloped.index = i;
	// 	}

	// 	// remove rest of oldChildren (so unseens if any)
	// 	for (; i < oChildren.length; ++i)
	// 		remove($tag, oChildren[i], component);
	// },

	tag: function tag($tag, lexem, olexem, component) {
		lexem.child = olexem.child; // keep track of elementNode
		var babelutes = lexem.args[1],
		    obabelutes = olexem.args[1];

		var babelute = void 0,
		    obabelute = void 0;
		for (var i = 0, len = babelutes.length; i < len; i++) {
			// render all children's babelutes
			babelute = babelutes[i];
			obabelute = obabelutes[i];
			if (babelute === obabelute) continue;
			if (typeof babelute === 'undefined') // cast undefined to empty string
				babelute = '';
			if (!babelute || !babelute.__babelute__) babelute = babelutes[i] = new index$2.Babelute()._append('html', 'text', [babelute]);
			dif(lexem.child, babelute, obabelute, component);
		}
	},
	text: function text($tag, lexem, olexem) {

		var newText = lexem.args[0];

		lexem.child = olexem.child; // keep track of textnode
		if (newText !== olexem.args[0]) lexem.child.nodeValue = newText;
	},

	// html simple atoms diffing
	class: function _class($tag, lexem, olexem) {

		var name = lexem.args[0],

		// new class name
		oname = olexem.args[0],

		// old class name
		flag = lexem.args[1],

		// new class flag
		oflag = olexem.args[1]; // old class flag

		if (name !== oname) {
			if (oname) $tag.classList.remove(oname);
			if (name && (lexem.args.length === 1 || flag)) $tag.classList.add(name);
		} else if (name && lexem.args.length > 1 && !flag !== !oflag) $tag.classList.toggle(name);
	},
	classes: function classes() {
		// do nothing
	},
	attr: function attr($tag, lexem, olexem) {
		var name = lexem.args[0],
		    value = lexem.args[1],
		    oname = olexem.args[0],
		    ovalue = olexem.args[1];

		if (name !== oname) {
			$tag.removeAttribute(oname);
			$tag.setAttribute(name, value);
		} else if (value !== ovalue) $tag.setAttribute(name, value);
	},
	prop: function prop($tag, lexem, olexem) {

		var name = lexem.args[0],
		    value = lexem.args[1],
		    oname = olexem.args[0];

		if (name !== oname) {
			delete $tag[oname];
			$tag[name] = value;
		} else if (value !== $tag[name] /*olexem.args[1]*/) // look diectly in element : for "checked" bug (or other properties that change on native interaction with element)
			$tag[name] = value;
	},
	data: function data($tag, lexem, olexem) {

		var name = lexem.args[0],
		    value = lexem.args[1],
		    oname = olexem.args[0],
		    ovalue = olexem.args[1];

		if (name !== oname) {
			delete $tag.dataset[oname];
			$tag.dataset[name] = value;
		} else if (value !== ovalue) $tag.dataset[name] = value;
	},
	style: function style($tag, lexem, olexem) {
		var name = lexem.args[0],
		    value = lexem.args[1],
		    oname = olexem.args[0],
		    ovalue = olexem.args[1];

		if (name !== oname) {
			delete $tag.style[oname];
			$tag.style[name] = value;
		} else if (value !== ovalue) $tag.style[name] = value;
	},
	id: function id($tag, lexem, olexem) {
		var id = lexem.args[0];
		if (id !== olexem.args[0]) $tag.id = id;
	},
	on: function on($tag, lexem, olexem) {
		var name = lexem.args[0],
		    oname = olexem.args[0];
		if (name !== oname) {
			$tag.removeEventListener(oname, olexem.listener);
			renderActions.on($tag, lexem);
		} else {
			var closure = lexem.closure = olexem.closure;
			lexem.listener = olexem.listener;
			closure.handler = lexem.args[1];
			closure.args = lexem.args[2];
		}
	},
	onDom: function onDom($tag, lexem, olexem /* args = render, dif, remove */, component) {
		var dif = lexem.args[1];
		lexem.$tag = $tag;
		if (dif) dif($tag, lexem, olexem, component);
	},
	html: function html($tag, lexem, olexem) {
		var newHTML = lexem.args[0];
		lexem.witness = olexem.witness;
		if (olexem.args[0] !== newHTML) {
			olexem.html && olexem.html.forEach(function (child) {
				return $tag.removeChild(child);
			});
			lexem.html = insertHTML(newHTML, $tag, lexem.witness);
		}
	},
	execute: function execute($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0] || !argsChanged(lexem.args[1], olexem.args[1])) return;
		lexem.args[0].apply(null, lexem.args[1]);
	},
	component: function component($tag, lexem, olexem) {
		if (lexem.args[0] !== olexem.args[0]) throw new Error('You must not change component\'s class when rerendering');
		lexem.instance = olexem.instance;
		lexem.witness = olexem.witness;
		lexem.instance.setProps(lexem.args[1]);
	},
	switchUse: function switchUse($tag, lexem, olexem, component) {
		var val = lexem.args[0],
		    args = lexem.args[1];
		lexem.witness = olexem.witness;
		if (val !== olexem.args[0]) {
			var _ref;

			remove($tag, olexem.developed, component);
			lexem.developed = (_ref = new index$2.FirstLevel())._use.apply(_ref, [val].concat(toConsumableArray$1(args)));
			var frag = document.createDocumentFragment();
			render($tag, lexem.developed, component, frag);
			$tag.insertBefore(frag, lexem.witness);
		} else if (argsChanged(args, olexem.args[1])) {
			var _ref2;

			lexem.developed = (_ref2 = new index$2.FirstLevel())._use.apply(_ref2, [val].concat(toConsumableArray$1(args)));
			dif($tag, lexem.developed, olexem.developed, component);
		} else lexem.developed = olexem.developed;
	}
};

function dif($tag, babelute, oldb, component) {
	for (var lexem, olexem, i = 0, len = babelute._lexems.length; i < len; ++i) {
		lexem = babelute._lexems[i];
		if (!_targets[lexem.lexicon]) continue;
		olexem = oldb._lexems[i];
		if (!lexem.args.length) // wathever lexem is : no args implies never change, so keep old developed
			lexem.developed = olexem.developed;else {
			if (difActions[lexem.name]) // let strategy action do the job
				difActions[lexem.name]($tag, lexem, olexem, component);else if (argsChanged(lexem.args, olexem.args)) {
				// no action means compounds first degree lexem. so check args dif...
				lexem.developed = index$2.developOneLevel(lexem, _targets[lexem.lexicon]);
				dif($tag, lexem.developed, olexem.developed, component);
			} else // keep old developed (compounds args haven't changed : so nothing to do)
				lexem.developed = olexem.developed;
		}
	}
}

function argsChanged(args, oargs) {
	for (var i = 0, len = args.length; i < len; ++i) {
		if (args[i] !== oargs[i]) // simple reference check : need "immutables"
			return true;
	}return false;
}

/*
 * @Author: Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */

// lexem : .component(Component, props)

renderActions.component = function ($tag, lexem, parent, frag) {
	var instance = lexem.instance = new lexem.args[0](lexem.args[1], parent);
	mountComponentInstance($tag, instance, true, frag);
};

difActions.component = function ($tag, lexem, olexem) {
	if (lexem.args[0] !== olexem.args[0]) throw new Error('You must not change component\'s class when rerendering');
	lexem.instance = olexem.instance;
	if (lexem.args[1]) lexem.instance.setProps(lexem.args[1]);
};

removeActions.component = function ($tag, lexem) {
	lexem.instance.unmount();
	$tag.removeChild(lexem.instance.witness);
};

function mountComponentInstance($tag, instance, addWitness, frag) {
	instance._render = function () {
		// update
		var developed = this.render(true);
		if (this.developed) dif($tag, developed, this.developed, this);else render($tag, developed, this);
		this.developed = developed;
	};

	instance._remove = function () {
		// unmount
		seekAndUnmountComponent(this.developed); // depth-first
		remove($tag, this.developed, instance);
	};

	// first render (mounting)
	instance.componentWillMount();
	instance.developed = instance.render(true);
	render($tag, instance.developed, instance, frag);
	if (addWitness) {
		instance.witness = document.createComment('component');
		$tag.appendChild(instance.witness);
	}
	instance.componentDidMount();
}

/*
 * @Author: Gilles Coomans
 *
 * Simple stateless unmountable container.
 *
 * Useful for closable dialogs, or small widgets that don't need full state logic.
 */

// lexem : .container((container) => h.div('click me to unmount !', h.click(container.unmount)))

renderActions.container = function ($tag, lexem, component, frag) {
	var container = lexem.instance = {};
	container.unmount = function () {
		seekAndUnmountComponent(this.developed); // depth-first
		remove($tag, this.developed, component);
	}.bind(container);
	container.developed = lexem.args[0](container);
	render($tag, container.developed, component, frag);
};

difActions.container = function ($tag, lexem, olexem, component) {
	var container = lexem.instance = olexem.instance,
	    developed = lexem.args[0](container);
	dif($tag, developed, container.developed, component);
	container.developed = developed;
};

removeActions.container = function ($tag, lexem) {
	lexem.instance.unmount();
};

/**
 * Babelute HTML Dom Diffing Pragmatics
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2017 Gilles Coomans
 */
/**
 * @external {Pragmatics} https://github.com/nomocas/babelute
 */

// import './postal-component';
htmlLexicon.addAliases({
	$render: function $render(domElement) {
		var oldBabelute = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

		if (oldBabelute) return dif(domElement, this, oldBabelute);
		return render(domElement, this);
	},
	$remove: function $remove(domElement) {
		return remove(domElement, this);
	}
});

/**
 * DomDiffing Pragmatics instance
 * @public
 * @type {Pragmatics}
 * @todo  addTargetLexicon(lexicon) => catch name for _targets + store lexicon reference for one level developement : no more need to register lexicons globally
 * @example
 * import difPragmas from 'babelute-html-dom-diffing-pragmatics';
 * import htmlLexicon from 'babelute-hstml/src/html-lexicon.js';
 *
 * const h = htmlLexicon.initializer(true); // FirtsLevel initializer
 * const $root = document.getElementById('foo');
 * let oldRendered, // for diffing tracking
 * 	animFrame;
 *
 * function render(){
 * 	return h.div(state.intro).section(h.class('my-section').h1(state.title));
 * }
 *
 * function update(state) {
 * 	if (animFrame)
 * 		cancelAnimationFrame(animFrame);
 * 	animFrame = requestAnimationFrame(() => {
 * 		const newRendered = render(state);
 * 		oldRendered = difPragmas.$output($root, newRendered, oldRendered);
 * 	});
 * }
 * 
 * update(myState);
 */
var difPragmas = index$2.createPragmatics(_targets, {
	$output: function $output($tag, babelute, oldBabelute) {
		var component = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

		oldBabelute ? dif($tag, babelute, oldBabelute, component) : render($tag, babelute, component);
		return babelute;
	},
	addLexicon: function addLexicon(lexicon, name) {
		this._targets[name || lexicon.name] = lexicon;
		while (lexicon.parent) {
			lexicon = lexicon.parent;
			this._targets[lexicon.name] = lexicon;
		}
	},

	mountComponentInstance: mountComponentInstance,
	render: render,
	dif: dif,
	remove: remove,
	renderActions: renderActions,
	difActions: difActions,
	removeActions: removeActions,
	seekAndUnmountComponent: seekAndUnmountComponent,
	seekAndUnmountComponentInArray: seekAndUnmountComponentInArray
});

/**s
 * Todomvc : Browser Side Launcher
 * 
 * @author Gilles Coomans
 */

var h = todomvcLexicon.initializer(true);
var $root = document.getElementById('todoapp'); // where rendering take place

// don't forget to add your lexicon(s) name to differ (only for FirstLevel diffing - not needed for dom or string output)
difPragmas.addLexicon(todomvcLexicon);

// ---------- render ----------

var oldRendered = void 0;
var animFrame = void 0;

// bind todos update to main render
Todos.on('update', function (state) {
	if (animFrame) cancelAnimationFrame(animFrame);
	animFrame = requestAnimationFrame(function () {
		oldRendered = difPragmas.$output($root, h.todomvc(state.todos, state.route, state.methods), oldRendered);
	});
});

// -------- routes ----------

// simple hashchange binding for routing
function hashChange() {
	Todos.route = window.location.hash.substring(2) || 'all';
	Todos.emit('update', Todos);
}
window.onhashchange = hashChange;

hashChange(); // set current route and launch

})));
//# sourceMappingURL=app.js.map
