// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 *
 * @provideGoog
 */


/**
 * @define {boolean} Overridden to true by the compiler when --closure_pass
 *     or --mark_as_compiled is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is already
 * defined in the current scope before assigning to prevent clobbering if
 * base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {};


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;

/**
 * A hook for overriding the define values in uncompiled mode.
 *
 * In uncompiled mode, {@code CLOSURE_DEFINES} may be defined before loading
 * base.js.  If a key is defined in {@code CLOSURE_DEFINES}, {@code goog.define}
 * will use the value instead of the default value.  This allows flags to be
 * overwritten without compilation (this is normally accomplished with the
 * compiler's "define" flag).
 *
 * Example:
 * <pre>
 *   var CLOSURE_DEFINES = {'goog.DEBUG', false};
 * </pre>
 *
 * @type {Object.<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_DEFINES;


/**
 * Builds an object structure for the provided namespace path, ensuring that
 * names that already exist are not overwritten. For example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && opt_object !== undefined) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Defines a named value. In uncompiled mode, the value is retreived from
 * CLOSURE_DEFINES if the object is defined and has the property specified,
 * and otherwise used the defined defaultValue. When compiled, the default
 * can be overridden using compiler command-line options.
 *
 * @param {string} name The distinguished name to provide.
 * @param {string|number|boolean} defaultValue
 */
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    if (goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(
        goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name];
    }
  }
  goog.exportPath_(name, value);
};


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.DEBUG = true;


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.define('goog.LOCALE', 'en');  // default to en


/**
 * @define {boolean} Whether this code is running on trusted sites.
 *
 * On untrusted sites, several native functions can be defined or overridden by
 * external libraries like Prototype, Datejs, and JQuery and setting this flag
 * to false forces closure to use its own implementations when possible.
 *
 * If your JavaScript can be loaded by a third party site and you are wary about
 * relying on non-standard implementations, specify
 * "--define goog.TRUSTED_SITE=false" to the JSCompiler.
 */
goog.define('goog.TRUSTED_SITE', true);


/**
 * Creates object stubs for a namespace.  The presence of one or more
 * goog.provide() calls indicate that the file defines the given
 * objects/namespaces.  Build tools also scan for provide/require statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 * @see goog.require
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice. This is intended
    // to teach new developers that 'goog.provide' is effectively a variable
    // declaration. And when JSCompiler transforms goog.provide into a real
    // variable declaration, the compiled JS should work the same as the raw
    // JS--even when the raw JS uses goog.provide incorrectly.
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name);
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 *
 * In the case of unit tests, the message may optionally be an exact namespace
 * for the test (e.g. 'goog.stringTest'). The linter will then ignore the extra
 * provide (if not explicitly defined in the code).
 *
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                opt_message ? ': ' + opt_message : '.');
  }
};


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return !goog.implicitNamespaces_[name] && !!goog.getObjectByName(name);
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares that 'goog' and
   * 'goog.events' must be namespaces.
   *
   * @type {Object}
   * @private
   */
  goog.implicitNamespaces_ = {};
}


/**
 * Returns an object based on its fully qualified external name.  If you are
 * using a compilation pass that renames property names beware that using this
 * function will not find renamed properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 *                         this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 *                         this file requires.
 */
goog.addDependency = function(relPath, provides, requires) {
  if (goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};




// NOTE(nnaze): The debug DOM loader was included in base.js as an original way
// to do "debug-mode" development.  The dependency system can sometimes be
// confusing, as can the debug DOM loader's asynchronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the script
// will not load until some point after the current script.  If a namespace is
// needed at runtime, it needs to be defined in a previous script, or loaded via
// require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// http://code.google.com/closure/library/docs/depswriter.html
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.define('goog.ENABLE_DEBUG_LOADER', true);


/**
 * Implements a system for the dynamic resolution of dependencies that works in
 * parallel with the BUILD system. Note that all calls to goog.require will be
 * stripped by the JSCompiler when the --closure_pass option is used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide()) in
 *     the form "goog.package.part".
 */
goog.require = function(name) {

  // If the object already exists we do not need do do anything.
  // TODO(arv): If we start to support require based on file name this has to
  //            change.
  // TODO(arv): If we allow goog.foo.* this has to change.
  // TODO(arv): If we implement dynamic load after page load we should probably
  //            not remove this code for the compiled output.
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }

    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }

    var errorMessage = 'goog.require could not find: ' + name;
    if (goog.global.console) {
      goog.global.console['error'](errorMessage);
    }


      throw Error(errorMessage);

  }
};


/**
 * Path for included scripts.
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default, the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * The identity function. Returns its first argument.
 *
 * @param {*=} opt_returnValue The single value that will be returned.
 * @param {...*} var_args Optional trailing arguments. These are ignored.
 * @return {?} The first argument. We can't know the type -- just pass it along
 *      without type.
 * @deprecated Use goog.functions.identity instead.
 */
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue;
};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error will be thrown
 * when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as an argument
 * because that would make it more difficult to obfuscate our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always returns the same
 * instance object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the {@code goog.testing.singleton} module. The compiler
 * removes this variable if unused.
 * @type {!Array.<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


/**
 * True if goog.dependencies_ is available.
 * @const {boolean}
 */
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;


if (goog.DEPENDENCIES_ENABLED) {
  /**
   * Object used to keep track of urls that have already been added. This record
   * allows the prevention of circular dependencies.
   * @type {Object}
   * @private
   */
  goog.included_ = {};


  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts.
   * @private
   * @type {Object}
   */
  goog.dependencies_ = {
    pathToNames: {}, // 1 to many
    nameToPath: {}, // 1 to 1
    requires: {}, // 1 to many
    // Used when resolving dependencies to prevent us from visiting file twice.
    visited: {},
    written: {} // Used to keep track of script files we have written.
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != 'undefined' &&
           'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of base.js script that bootstraps Closure.
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('script');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   */
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script source.
   * @return {boolean} True if the script was imported, false otherwise.   
   * @private
   */
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;

      // If the user tries to require a new symbol after document load,
      // something has gone terribly wrong. Doing a document.write would
      // wipe out the page.
      if (doc.readyState == 'complete') {
        // Certain test frameworks load base.js multiple times, which tries
        // to write deps.js each time. If that happens, just fail silently.
        // These frameworks wipe the page between each load of base.js, so this
        // is OK.
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }

      doc.write(
          '<script type="text/javascript" src="' + src + '"></' + 'script>');
      return true;
    } else {
      return false;
    }
  };


  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @private
   */
  goog.writeScripts_ = function() {
    // The scripts we need to write this time.
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // We have already visited this one. We can get here if we have cyclic
      // dependencies.
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error('Undefined script input');
      }
    }
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}



//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case.
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }

    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox typeof
    // behaves similarly for HTML{Applet,Embed,Object}, Elements and RegExps. We
    // would like to return object for those and we can detect an invalid
    // function by making sure that the function object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is not undefined.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.  Additionally, this function assumes that the global
 * undefined variable has not been redefined.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  return val !== undefined;
};


/**
 * Returns true if the specified value is null.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like the
 * value needs to be an object and have a getFullYear() function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays and
 * functions.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. The unique ID is
 * guaranteed to be unique across the current session amongst objects that are
 * passed into {@code getUid}. There is no guarantee that the ID is unique or
 * consistent across sessions. It is unsafe to generate unique ID for function
 * prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In IE, DOM nodes are not instances of Object and throw an exception if we
  // try to delete.  Instead we try to use removeAttribute.
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure JavaScript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind is
 *     deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of this 'pre-specified'.
 *
 * Remaining arguments specified at call-time are appended to the pre-specified
 * ones.
 *
 * Also see: {@link #partial}.
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @template T
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default Chrome
      // extension environment. This means that for Chrome extensions, they get
      // the implementation of Function.prototype.bind that calls goog.bind
      // instead of the native one. Even worse, we don't want to introduce a
      // circular dependency between goog.bind and Function.prototype.bind, so
      // we have to hack this to make sure it works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * target function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = (goog.TRUSTED_SITE && Date.now) || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals JavaScript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _et_ = 1;');
      if (typeof goog.global['_et_'] != 'undefined') {
        delete goog.global['_et_'];
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @type {Object|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a hyphen and
 * passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which these
 * mappings are used. In the BY_PART style, each part (i.e. in between hyphens)
 * of the passed in css name is rewritten according to the map. In the BY_WHOLE
 * style, the full css name is looked up in the map directly. If a rewrite is
 * not specified by the map, the compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls to
 * goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x= 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed only the
 * modifier will be processed, as it is assumed the first argument was generated
 * as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --closure_pass flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {Object|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Gets a localized message.
 *
 * This function is a compiler primitive. If you give the compiler a localized
 * message bundle, it will replace the string at compile-time with a localized
 * version, and expand goog.getMsg call to a concatenated string.
 *
 * Messages must be initialized in the form:
 * <code>
 * var MSG_NAME = goog.getMsg('Hello {$placeholder}', {'placeholder': 'world'});
 * </code>
 *
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object=} opt_values Map of place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ('' + values[key]).replace(/\$/g, '$$$$');
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), value);
  }
  return str;
};


/**
 * Gets a localized message. If the message does not have a translation, gives a
 * fallback message.
 *
 * This is useful when introducing a new message that has not yet been
 * translated into all languages.
 *
 * This function is a compiler primtive. Must be used in the form:
 * <code>var x = goog.getMsgWithFallback(MSG_A, MSG_B);</code>
 * where MSG_A and MSG_B were initialized with goog.getMsg.
 *
 * @param {string} a The preferred message.
 * @param {string} b The fallback message.
 * @return {string} The best translated message.
 */
goog.getMsgWithFallback = function(a, b) {
  return a;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated, unless they are
 * exported in turn via this function or goog.exportProperty.
 *
 * Also handy for making public items that are defined in anonymous closures.
 *
 * ex. goog.exportSymbol('public.path.Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction', Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is goog.global.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   goog.base(this, a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked as
 * follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // Other code here.
 * };
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contsructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass the name of the
 * method as the second argument to this function. If you do not, you will get a
 * runtime error. This calls the superclass' method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express inheritance
 * relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the compiler will do
 * macro expansion to remove a lot of the extra overhead that this function
 * introduces. The compiler will also enforce a lot of the assumptions that this
 * function makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;

  if (goog.DEBUG) {
    if (!caller) {
      throw Error('arguments.caller not defined.  goog.base() expects not ' +
                  'to be running in strict mode. See ' +
                  'http://www.ecma-international.org/ecma-262/5.1/#sec-C');
    }
  }

  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain, then one of two
  // things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the aliases
 * applied.  In uncompiled code the function is simply run since the aliases as
 * written are valid JavaScript.
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *     (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};


// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// This file has been auto-generated by GenJsDeps, please do not edit.

goog.addDependency('../../third_party/closure/goog/caja/string/html/htmlparser.js', ['goog.string.html.HtmlParser', 'goog.string.html.HtmlParser.EFlags', 'goog.string.html.HtmlParser.Elements', 'goog.string.html.HtmlParser.Entities', 'goog.string.html.HtmlSaxHandler'], []);
goog.addDependency('../../third_party/closure/goog/caja/string/html/htmlsanitizer.js', ['goog.string.html.HtmlSanitizer', 'goog.string.html.HtmlSanitizer.AttributeType', 'goog.string.html.HtmlSanitizer.Attributes', 'goog.string.html.htmlSanitize'], ['goog.string.StringBuffer', 'goog.string.html.HtmlParser', 'goog.string.html.HtmlParser.EFlags', 'goog.string.html.HtmlParser.Elements', 'goog.string.html.HtmlSaxHandler']);
goog.addDependency('../../third_party/closure/goog/dojo/dom/query.js', ['goog.dom.query'], ['goog.array', 'goog.dom', 'goog.functions', 'goog.string', 'goog.userAgent']);
goog.addDependency('../../third_party/closure/goog/jpeg_encoder/jpeg_encoder_basic.js', ['goog.crypt.JpegEncoder'], ['goog.crypt.base64']);
goog.addDependency('../../third_party/closure/goog/loremipsum/text/loremipsum.js', ['goog.text.LoremIpsum'], ['goog.array', 'goog.math', 'goog.string', 'goog.structs.Map', 'goog.structs.Set']);
goog.addDependency('../../third_party/closure/goog/mochikit/async/deferred.js', ['goog.async.Deferred', 'goog.async.Deferred.AlreadyCalledError', 'goog.async.Deferred.CanceledError'], ['goog.array', 'goog.asserts', 'goog.debug.Error', 'goog.functions']);
goog.addDependency('../../third_party/closure/goog/mochikit/async/deferredlist.js', ['goog.async.DeferredList'], ['goog.async.Deferred']);
goog.addDependency('../../third_party/closure/goog/osapi/osapi.js', ['goog.osapi'], []);
goog.addDependency('a11y/aria/announcer.js', ['goog.a11y.aria.Announcer'], ['goog.Disposable', 'goog.a11y.aria', 'goog.a11y.aria.LivePriority', 'goog.a11y.aria.State', 'goog.dom', 'goog.object']);
goog.addDependency('a11y/aria/aria.js', ['goog.a11y.aria'], ['goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.a11y.aria.datatables', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.object', 'goog.string']);
goog.addDependency('a11y/aria/attributes.js', ['goog.a11y.aria.AutoCompleteValues', 'goog.a11y.aria.CheckedValues', 'goog.a11y.aria.DropEffectValues', 'goog.a11y.aria.ExpandedValues', 'goog.a11y.aria.GrabbedValues', 'goog.a11y.aria.InvalidValues', 'goog.a11y.aria.LivePriority', 'goog.a11y.aria.OrientationValues', 'goog.a11y.aria.PressedValues', 'goog.a11y.aria.RelevantValues', 'goog.a11y.aria.SelectedValues', 'goog.a11y.aria.SortValues', 'goog.a11y.aria.State'], []);
goog.addDependency('a11y/aria/datatables.js', ['goog.a11y.aria.datatables'], ['goog.a11y.aria.State', 'goog.object']);
goog.addDependency('a11y/aria/roles.js', ['goog.a11y.aria.Role'], []);
goog.addDependency('array/array.js', ['goog.array', 'goog.array.ArrayLike'], ['goog.asserts']);
goog.addDependency('asserts/asserts.js', ['goog.asserts', 'goog.asserts.AssertionError'], ['goog.debug.Error', 'goog.string']);
goog.addDependency('async/animationdelay.js', ['goog.async.AnimationDelay'], ['goog.Disposable', 'goog.events', 'goog.functions']);
goog.addDependency('async/conditionaldelay.js', ['goog.async.ConditionalDelay'], ['goog.Disposable', 'goog.async.Delay']);
goog.addDependency('async/delay.js', ['goog.Delay', 'goog.async.Delay'], ['goog.Disposable', 'goog.Timer']);
goog.addDependency('async/nexttick.js', ['goog.async.nextTick'], ['goog.debug.entryPointRegistry', 'goog.functions']);
goog.addDependency('async/throttle.js', ['goog.Throttle', 'goog.async.Throttle'], ['goog.Disposable', 'goog.Timer']);
goog.addDependency('base.js', ['goog'], []);
goog.addDependency('color/alpha.js', ['goog.color.alpha'], ['goog.color']);
goog.addDependency('color/color.js', ['goog.color'], ['goog.color.names', 'goog.math']);
goog.addDependency('color/names.js', ['goog.color.names'], []);
goog.addDependency('crypt/aes.js', ['goog.crypt.Aes'], ['goog.asserts', 'goog.crypt.BlockCipher']);
goog.addDependency('crypt/arc4.js', ['goog.crypt.Arc4'], ['goog.asserts']);
goog.addDependency('crypt/base64.js', ['goog.crypt.base64'], ['goog.crypt', 'goog.userAgent']);
goog.addDependency('crypt/basen.js', ['goog.crypt.baseN'], []);
goog.addDependency('crypt/blobhasher.js', ['goog.crypt.BlobHasher', 'goog.crypt.BlobHasher.EventType'], ['goog.asserts', 'goog.crypt', 'goog.crypt.Hash', 'goog.events.EventTarget', 'goog.fs', 'goog.log']);
goog.addDependency('crypt/blockcipher.js', ['goog.crypt.BlockCipher'], []);
goog.addDependency('crypt/cbc.js', ['goog.crypt.Cbc'], ['goog.array', 'goog.crypt']);
goog.addDependency('crypt/cbc_test.js', ['goog.crypt.CbcTest'], ['goog.crypt', 'goog.crypt.Aes', 'goog.crypt.Cbc', 'goog.testing.jsunit']);
goog.addDependency('crypt/crypt.js', ['goog.crypt'], ['goog.array']);
goog.addDependency('crypt/hash.js', ['goog.crypt.Hash'], []);
goog.addDependency('crypt/hash32.js', ['goog.crypt.hash32'], ['goog.crypt']);
goog.addDependency('crypt/hashtester.js', ['goog.crypt.hashTester'], ['goog.array', 'goog.crypt', 'goog.testing.PerformanceTable', 'goog.testing.PseudoRandom', 'goog.testing.asserts']);
goog.addDependency('crypt/hmac.js', ['goog.crypt.Hmac'], ['goog.asserts', 'goog.crypt.Hash']);
goog.addDependency('crypt/md5.js', ['goog.crypt.Md5'], ['goog.crypt.Hash']);
goog.addDependency('crypt/pbkdf2.js', ['goog.crypt.pbkdf2'], ['goog.asserts', 'goog.crypt', 'goog.crypt.Hmac', 'goog.crypt.Sha1']);
goog.addDependency('crypt/sha1.js', ['goog.crypt.Sha1'], ['goog.crypt.Hash']);
goog.addDependency('crypt/sha2.js', ['goog.crypt.Sha2'], ['goog.array', 'goog.asserts', 'goog.crypt.Hash']);
goog.addDependency('crypt/sha224.js', ['goog.crypt.Sha224'], ['goog.crypt.Sha2']);
goog.addDependency('crypt/sha256.js', ['goog.crypt.Sha256'], ['goog.crypt.Sha2']);
goog.addDependency('cssom/cssom.js', ['goog.cssom', 'goog.cssom.CssRuleType'], ['goog.array', 'goog.dom']);
goog.addDependency('cssom/iframe/style.js', ['goog.cssom.iframe.style'], ['goog.cssom', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classes', 'goog.string', 'goog.style', 'goog.userAgent']);
goog.addDependency('datasource/datamanager.js', ['goog.ds.DataManager'], ['goog.ds.BasicNodeList', 'goog.ds.DataNode', 'goog.ds.Expr', 'goog.string', 'goog.structs', 'goog.structs.Map']);
goog.addDependency('datasource/datasource.js', ['goog.ds.BaseDataNode', 'goog.ds.BasicNodeList', 'goog.ds.DataNode', 'goog.ds.DataNodeList', 'goog.ds.EmptyNodeList', 'goog.ds.LoadState', 'goog.ds.SortedNodeList', 'goog.ds.Util', 'goog.ds.logger'], ['goog.array', 'goog.log']);
goog.addDependency('datasource/expr.js', ['goog.ds.Expr'], ['goog.ds.BasicNodeList', 'goog.ds.EmptyNodeList', 'goog.string']);
goog.addDependency('datasource/fastdatanode.js', ['goog.ds.AbstractFastDataNode', 'goog.ds.FastDataNode', 'goog.ds.FastListNode', 'goog.ds.PrimitiveFastDataNode'], ['goog.ds.DataManager', 'goog.ds.EmptyNodeList', 'goog.string']);
goog.addDependency('datasource/jsdatasource.js', ['goog.ds.JsDataSource', 'goog.ds.JsPropertyDataSource'], ['goog.ds.BaseDataNode', 'goog.ds.BasicNodeList', 'goog.ds.DataManager', 'goog.ds.EmptyNodeList', 'goog.ds.LoadState']);
goog.addDependency('datasource/jsondatasource.js', ['goog.ds.JsonDataSource'], ['goog.Uri', 'goog.dom', 'goog.ds.DataManager', 'goog.ds.JsDataSource', 'goog.ds.LoadState', 'goog.ds.logger']);
goog.addDependency('datasource/jsxmlhttpdatasource.js', ['goog.ds.JsXmlHttpDataSource'], ['goog.Uri', 'goog.ds.DataManager', 'goog.ds.FastDataNode', 'goog.ds.LoadState', 'goog.ds.logger', 'goog.events', 'goog.log', 'goog.net.EventType', 'goog.net.XhrIo']);
goog.addDependency('datasource/xmldatasource.js', ['goog.ds.XmlDataSource', 'goog.ds.XmlHttpDataSource'], ['goog.Uri', 'goog.dom.NodeType', 'goog.dom.xml', 'goog.ds.BasicNodeList', 'goog.ds.DataManager', 'goog.ds.LoadState', 'goog.ds.logger', 'goog.net.XhrIo', 'goog.string']);
goog.addDependency('date/date.js', ['goog.date', 'goog.date.Date', 'goog.date.DateTime', 'goog.date.Interval', 'goog.date.month', 'goog.date.weekDay'], ['goog.asserts', 'goog.date.DateLike', 'goog.i18n.DateTimeSymbols', 'goog.string']);
goog.addDependency('date/datelike.js', ['goog.date.DateLike'], []);
goog.addDependency('date/daterange.js', ['goog.date.DateRange', 'goog.date.DateRange.Iterator', 'goog.date.DateRange.StandardDateRangeKeys'], ['goog.date.Date', 'goog.date.Interval', 'goog.iter.Iterator', 'goog.iter.StopIteration']);
goog.addDependency('date/relative.js', ['goog.date.relative'], ['goog.i18n.DateTimeFormat']);
goog.addDependency('date/utcdatetime.js', ['goog.date.UtcDateTime'], ['goog.date', 'goog.date.Date', 'goog.date.DateTime', 'goog.date.Interval']);
goog.addDependency('db/cursor.js', ['goog.db.Cursor'], ['goog.async.Deferred', 'goog.db.Error', 'goog.debug', 'goog.events.EventTarget']);
goog.addDependency('db/db.js', ['goog.db'], ['goog.async.Deferred', 'goog.db.Error', 'goog.db.IndexedDb', 'goog.db.Transaction']);
goog.addDependency('db/error.js', ['goog.db.Error', 'goog.db.Error.ErrorCode', 'goog.db.Error.ErrorName', 'goog.db.Error.VersionChangeBlockedError'], ['goog.debug.Error']);
goog.addDependency('db/index.js', ['goog.db.Index'], ['goog.async.Deferred', 'goog.db.Cursor', 'goog.db.Error', 'goog.debug']);
goog.addDependency('db/indexeddb.js', ['goog.db.IndexedDb'], ['goog.async.Deferred', 'goog.db.Error', 'goog.db.Error.VersionChangeBlockedError', 'goog.db.ObjectStore', 'goog.db.Transaction', 'goog.db.Transaction.TransactionMode', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget']);
goog.addDependency('db/keyrange.js', ['goog.db.KeyRange'], []);
goog.addDependency('db/objectstore.js', ['goog.db.ObjectStore'], ['goog.async.Deferred', 'goog.db.Cursor', 'goog.db.Error', 'goog.db.Index', 'goog.debug', 'goog.events']);
goog.addDependency('db/transaction.js', ['goog.db.Transaction', 'goog.db.Transaction.TransactionMode'], ['goog.async.Deferred', 'goog.db.Error', 'goog.db.ObjectStore', 'goog.events.EventHandler', 'goog.events.EventTarget']);
goog.addDependency('debug/console.js', ['goog.debug.Console'], ['goog.debug.LogManager', 'goog.debug.Logger.Level', 'goog.debug.TextFormatter']);
goog.addDependency('debug/debug.js', ['goog.debug'], ['goog.array', 'goog.string', 'goog.structs.Set', 'goog.userAgent']);
goog.addDependency('debug/debugwindow.js', ['goog.debug.DebugWindow'], ['goog.debug.HtmlFormatter', 'goog.debug.LogManager', 'goog.debug.Logger', 'goog.structs.CircularBuffer', 'goog.userAgent']);
goog.addDependency('debug/devcss/devcss.js', ['goog.debug.DevCss', 'goog.debug.DevCss.UserAgent'], ['goog.cssom', 'goog.dom.classes', 'goog.events', 'goog.events.EventType', 'goog.string', 'goog.userAgent']);
goog.addDependency('debug/devcss/devcssrunner.js', ['goog.debug.devCssRunner'], ['goog.debug.DevCss']);
goog.addDependency('debug/divconsole.js', ['goog.debug.DivConsole'], ['goog.debug.HtmlFormatter', 'goog.debug.LogManager', 'goog.style']);
goog.addDependency('debug/entrypointregistry.js', ['goog.debug.EntryPointMonitor', 'goog.debug.entryPointRegistry'], ['goog.asserts']);
goog.addDependency('debug/error.js', ['goog.debug.Error'], []);
goog.addDependency('debug/errorhandler.js', ['goog.debug.ErrorHandler', 'goog.debug.ErrorHandler.ProtectedFunctionError'], ['goog.asserts', 'goog.debug', 'goog.debug.EntryPointMonitor', 'goog.debug.Trace']);
goog.addDependency('debug/errorhandlerweakdep.js', ['goog.debug.errorHandlerWeakDep'], []);
goog.addDependency('debug/errorreporter.js', ['goog.debug.ErrorReporter', 'goog.debug.ErrorReporter.ExceptionEvent'], ['goog.asserts', 'goog.debug', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.log', 'goog.net.XhrIo', 'goog.object', 'goog.string', 'goog.uri.utils', 'goog.userAgent']);
goog.addDependency('debug/fancywindow.js', ['goog.debug.FancyWindow'], ['goog.debug.DebugWindow', 'goog.debug.LogManager', 'goog.debug.Logger', 'goog.dom.DomHelper', 'goog.object', 'goog.string', 'goog.userAgent']);
goog.addDependency('debug/formatter.js', ['goog.debug.Formatter', 'goog.debug.HtmlFormatter', 'goog.debug.TextFormatter'], ['goog.debug.RelativeTimeProvider', 'goog.string']);
goog.addDependency('debug/fpsdisplay.js', ['goog.debug.FpsDisplay'], ['goog.asserts', 'goog.async.AnimationDelay', 'goog.ui.Component']);
goog.addDependency('debug/gcdiagnostics.js', ['goog.debug.GcDiagnostics'], ['goog.debug.Trace', 'goog.log', 'goog.userAgent']);
goog.addDependency('debug/logbuffer.js', ['goog.debug.LogBuffer'], ['goog.asserts', 'goog.debug.LogRecord']);
goog.addDependency('debug/logger.js', ['goog.debug.LogManager', 'goog.debug.Logger', 'goog.debug.Logger.Level'], ['goog.array', 'goog.asserts', 'goog.debug', 'goog.debug.LogBuffer', 'goog.debug.LogRecord']);
goog.addDependency('debug/logrecord.js', ['goog.debug.LogRecord'], []);
goog.addDependency('debug/logrecordserializer.js', ['goog.debug.logRecordSerializer'], ['goog.debug.LogRecord', 'goog.debug.Logger.Level', 'goog.json', 'goog.object']);
goog.addDependency('debug/reflect.js', ['goog.debug.reflect'], []);
goog.addDependency('debug/relativetimeprovider.js', ['goog.debug.RelativeTimeProvider'], []);
goog.addDependency('debug/tracer.js', ['goog.debug.Trace'], ['goog.array', 'goog.iter', 'goog.log', 'goog.structs.Map', 'goog.structs.SimplePool']);
goog.addDependency('disposable/disposable.js', ['goog.Disposable', 'goog.dispose'], ['goog.disposable.IDisposable']);
goog.addDependency('disposable/idisposable.js', ['goog.disposable.IDisposable'], []);
goog.addDependency('dom/a11y.js', ['goog.dom.a11y', 'goog.dom.a11y.Announcer', 'goog.dom.a11y.LivePriority', 'goog.dom.a11y.Role', 'goog.dom.a11y.State'], ['goog.a11y.aria', 'goog.a11y.aria.Announcer', 'goog.a11y.aria.LivePriority', 'goog.a11y.aria.Role', 'goog.a11y.aria.State']);
goog.addDependency('dom/abstractmultirange.js', ['goog.dom.AbstractMultiRange'], ['goog.array', 'goog.dom', 'goog.dom.AbstractRange']);
goog.addDependency('dom/abstractrange.js', ['goog.dom.AbstractRange', 'goog.dom.RangeIterator', 'goog.dom.RangeType'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.SavedCaretRange', 'goog.dom.TagIterator', 'goog.userAgent']);
goog.addDependency('dom/annotate.js', ['goog.dom.annotate'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.string']);
goog.addDependency('dom/browserfeature.js', ['goog.dom.BrowserFeature'], ['goog.userAgent']);
goog.addDependency('dom/browserrange/abstractrange.js', ['goog.dom.browserrange.AbstractRange'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeEndpoint', 'goog.dom.TagName', 'goog.dom.TextRangeIterator', 'goog.iter', 'goog.math.Coordinate', 'goog.string', 'goog.string.StringBuffer', 'goog.userAgent']);
goog.addDependency('dom/browserrange/browserrange.js', ['goog.dom.browserrange', 'goog.dom.browserrange.Error'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.browserrange.GeckoRange', 'goog.dom.browserrange.IeRange', 'goog.dom.browserrange.OperaRange', 'goog.dom.browserrange.W3cRange', 'goog.dom.browserrange.WebKitRange', 'goog.userAgent']);
goog.addDependency('dom/browserrange/geckorange.js', ['goog.dom.browserrange.GeckoRange'], ['goog.dom.browserrange.W3cRange']);
goog.addDependency('dom/browserrange/ierange.js', ['goog.dom.browserrange.IeRange'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeEndpoint', 'goog.dom.TagName', 'goog.dom.browserrange.AbstractRange', 'goog.log', 'goog.string']);
goog.addDependency('dom/browserrange/operarange.js', ['goog.dom.browserrange.OperaRange'], ['goog.dom.browserrange.W3cRange']);
goog.addDependency('dom/browserrange/w3crange.js', ['goog.dom.browserrange.W3cRange'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeEndpoint', 'goog.dom.browserrange.AbstractRange', 'goog.string']);
goog.addDependency('dom/browserrange/webkitrange.js', ['goog.dom.browserrange.WebKitRange'], ['goog.dom.RangeEndpoint', 'goog.dom.browserrange.W3cRange', 'goog.userAgent']);
goog.addDependency('dom/bufferedviewportsizemonitor.js', ['goog.dom.BufferedViewportSizeMonitor'], ['goog.asserts', 'goog.async.Delay', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType']);
goog.addDependency('dom/bufferedviewportsizemonitor_test.js', ['goog.dom.BufferedViewportSizeMonitorTest'], ['goog.dom.BufferedViewportSizeMonitor', 'goog.dom.ViewportSizeMonitor', 'goog.events', 'goog.events.EventType', 'goog.math.Size', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit']);
goog.addDependency('dom/classes.js', ['goog.dom.classes'], ['goog.array']);
goog.addDependency('dom/classes_test.js', ['goog.dom.classes_test'], ['goog.dom', 'goog.dom.classes', 'goog.testing.jsunit']);
goog.addDependency('dom/classlist.js', ['goog.dom.classlist'], ['goog.array', 'goog.asserts']);
goog.addDependency('dom/classlist_test.js', ['goog.dom.classlist_test'], ['goog.dom', 'goog.dom.classlist', 'goog.testing.jsunit']);
goog.addDependency('dom/controlrange.js', ['goog.dom.ControlRange', 'goog.dom.ControlRangeIterator'], ['goog.array', 'goog.dom', 'goog.dom.AbstractMultiRange', 'goog.dom.AbstractRange', 'goog.dom.RangeIterator', 'goog.dom.RangeType', 'goog.dom.SavedRange', 'goog.dom.TagWalkType', 'goog.dom.TextRange', 'goog.iter.StopIteration', 'goog.userAgent']);
goog.addDependency('dom/dataset.js', ['goog.dom.dataset'], ['goog.string']);
goog.addDependency('dom/dom.js', ['goog.dom', 'goog.dom.Appendable', 'goog.dom.DomHelper', 'goog.dom.NodeType'], ['goog.array', 'goog.dom.BrowserFeature', 'goog.dom.TagName', 'goog.dom.classes', 'goog.math.Coordinate', 'goog.math.Size', 'goog.object', 'goog.string', 'goog.userAgent']);
goog.addDependency('dom/dom_test.js', ['goog.dom.dom_test'], ['goog.dom', 'goog.dom.BrowserFeature', 'goog.dom.DomHelper', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.object', 'goog.string.Unicode', 'goog.testing.asserts', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('dom/fontsizemonitor.js', ['goog.dom.FontSizeMonitor', 'goog.dom.FontSizeMonitor.EventType'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.userAgent']);
goog.addDependency('dom/forms.js', ['goog.dom.forms'], ['goog.structs.Map']);
goog.addDependency('dom/fullscreen.js', ['goog.dom.fullscreen', 'goog.dom.fullscreen.EventType'], ['goog.dom', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('dom/iframe.js', ['goog.dom.iframe'], ['goog.dom', 'goog.userAgent']);
goog.addDependency('dom/iter.js', ['goog.dom.iter.AncestorIterator', 'goog.dom.iter.ChildIterator', 'goog.dom.iter.SiblingIterator'], ['goog.iter.Iterator', 'goog.iter.StopIteration']);
goog.addDependency('dom/multirange.js', ['goog.dom.MultiRange', 'goog.dom.MultiRangeIterator'], ['goog.array', 'goog.dom.AbstractMultiRange', 'goog.dom.AbstractRange', 'goog.dom.RangeIterator', 'goog.dom.RangeType', 'goog.dom.SavedRange', 'goog.dom.TextRange', 'goog.iter.StopIteration', 'goog.log']);
goog.addDependency('dom/nodeiterator.js', ['goog.dom.NodeIterator'], ['goog.dom.TagIterator']);
goog.addDependency('dom/nodeoffset.js', ['goog.dom.NodeOffset'], ['goog.Disposable', 'goog.dom.TagName']);
goog.addDependency('dom/pattern/abstractpattern.js', ['goog.dom.pattern.AbstractPattern'], ['goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/allchildren.js', ['goog.dom.pattern.AllChildren'], ['goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/callback/callback.js', ['goog.dom.pattern.callback'], ['goog.dom', 'goog.dom.TagWalkType', 'goog.iter']);
goog.addDependency('dom/pattern/callback/counter.js', ['goog.dom.pattern.callback.Counter'], []);
goog.addDependency('dom/pattern/callback/test.js', ['goog.dom.pattern.callback.Test'], ['goog.iter.StopIteration']);
goog.addDependency('dom/pattern/childmatches.js', ['goog.dom.pattern.ChildMatches'], ['goog.dom.pattern.AllChildren', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/endtag.js', ['goog.dom.pattern.EndTag'], ['goog.dom.TagWalkType', 'goog.dom.pattern.Tag']);
goog.addDependency('dom/pattern/fulltag.js', ['goog.dom.pattern.FullTag'], ['goog.dom.pattern.MatchType', 'goog.dom.pattern.StartTag', 'goog.dom.pattern.Tag']);
goog.addDependency('dom/pattern/matcher.js', ['goog.dom.pattern.Matcher'], ['goog.dom.TagIterator', 'goog.dom.pattern.MatchType', 'goog.iter']);
goog.addDependency('dom/pattern/nodetype.js', ['goog.dom.pattern.NodeType'], ['goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/pattern.js', ['goog.dom.pattern', 'goog.dom.pattern.MatchType'], []);
goog.addDependency('dom/pattern/repeat.js', ['goog.dom.pattern.Repeat'], ['goog.dom.NodeType', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/sequence.js', ['goog.dom.pattern.Sequence'], ['goog.dom.NodeType', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/starttag.js', ['goog.dom.pattern.StartTag'], ['goog.dom.TagWalkType', 'goog.dom.pattern.Tag']);
goog.addDependency('dom/pattern/tag.js', ['goog.dom.pattern.Tag'], ['goog.dom.pattern', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType', 'goog.object']);
goog.addDependency('dom/pattern/text.js', ['goog.dom.pattern.Text'], ['goog.dom.NodeType', 'goog.dom.pattern', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/range.js', ['goog.dom.Range'], ['goog.dom', 'goog.dom.AbstractRange', 'goog.dom.ControlRange', 'goog.dom.MultiRange', 'goog.dom.NodeType', 'goog.dom.TextRange', 'goog.userAgent']);
goog.addDependency('dom/rangeendpoint.js', ['goog.dom.RangeEndpoint'], []);
goog.addDependency('dom/savedcaretrange.js', ['goog.dom.SavedCaretRange'], ['goog.array', 'goog.dom', 'goog.dom.SavedRange', 'goog.dom.TagName', 'goog.string']);
goog.addDependency('dom/savedrange.js', ['goog.dom.SavedRange'], ['goog.Disposable', 'goog.log']);
goog.addDependency('dom/selection.js', ['goog.dom.selection'], ['goog.string', 'goog.userAgent']);
goog.addDependency('dom/tagiterator.js', ['goog.dom.TagIterator', 'goog.dom.TagWalkType'], ['goog.dom.NodeType', 'goog.iter.Iterator', 'goog.iter.StopIteration']);
goog.addDependency('dom/tagname.js', ['goog.dom.TagName'], []);
goog.addDependency('dom/textrange.js', ['goog.dom.TextRange'], ['goog.array', 'goog.dom', 'goog.dom.AbstractRange', 'goog.dom.RangeType', 'goog.dom.SavedRange', 'goog.dom.TagName', 'goog.dom.TextRangeIterator', 'goog.dom.browserrange', 'goog.string', 'goog.userAgent']);
goog.addDependency('dom/textrangeiterator.js', ['goog.dom.TextRangeIterator'], ['goog.array', 'goog.dom.NodeType', 'goog.dom.RangeIterator', 'goog.dom.TagName', 'goog.iter.StopIteration']);
goog.addDependency('dom/vendor.js', ['goog.dom.vendor'], ['goog.userAgent']);
goog.addDependency('dom/viewportsizemonitor.js', ['goog.dom.ViewportSizeMonitor'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Size']);
goog.addDependency('dom/xml.js', ['goog.dom.xml'], ['goog.dom', 'goog.dom.NodeType']);
goog.addDependency('editor/browserfeature.js', ['goog.editor.BrowserFeature'], ['goog.editor.defines', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('editor/clicktoeditwrapper.js', ['goog.editor.ClickToEditWrapper'], ['goog.Disposable', 'goog.asserts', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field.EventType', 'goog.editor.range', 'goog.events.BrowserEvent.MouseButton', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.log']);
goog.addDependency('editor/command.js', ['goog.editor.Command'], []);
goog.addDependency('editor/contenteditablefield.js', ['goog.editor.ContentEditableField'], ['goog.asserts', 'goog.editor.Field', 'goog.log']);
goog.addDependency('editor/defines.js', ['goog.editor.defines'], []);
goog.addDependency('editor/field.js', ['goog.editor.Field', 'goog.editor.Field.EventType'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.array', 'goog.asserts', 'goog.async.Delay', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo', 'goog.editor.node', 'goog.editor.range', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.functions', 'goog.log', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('editor/field_test.js', ['goog.editor.field_test'], ['goog.dom', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.range', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.functions', 'goog.testing.LooseMock', 'goog.testing.MockClock', 'goog.testing.dom', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.recordFunction', 'goog.userAgent']);
goog.addDependency('editor/focus.js', ['goog.editor.focus'], ['goog.dom.selection']);
goog.addDependency('editor/icontent.js', ['goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo'], ['goog.editor.BrowserFeature', 'goog.style', 'goog.userAgent']);
goog.addDependency('editor/link.js', ['goog.editor.Link'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.node', 'goog.editor.range', 'goog.string', 'goog.string.Unicode', 'goog.uri.utils', 'goog.uri.utils.ComponentIndex']);
goog.addDependency('editor/node.js', ['goog.editor.node'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.iter.ChildIterator', 'goog.dom.iter.SiblingIterator', 'goog.iter', 'goog.object', 'goog.string', 'goog.string.Unicode', 'goog.userAgent']);
goog.addDependency('editor/plugin.js', ['goog.editor.Plugin'], ['goog.editor.Command', 'goog.events.EventTarget', 'goog.functions', 'goog.log', 'goog.object', 'goog.reflect']);
goog.addDependency('editor/plugins/abstractbubbleplugin.js', ['goog.editor.plugins.AbstractBubblePlugin'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Plugin', 'goog.editor.style', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.actionEventWrapper', 'goog.functions', 'goog.string.Unicode', 'goog.ui.Component.EventType', 'goog.ui.editor.Bubble', 'goog.userAgent']);
goog.addDependency('editor/plugins/abstractdialogplugin.js', ['goog.editor.plugins.AbstractDialogPlugin', 'goog.editor.plugins.AbstractDialogPlugin.EventType'], ['goog.dom', 'goog.dom.Range', 'goog.editor.Field.EventType', 'goog.editor.Plugin', 'goog.editor.range', 'goog.events', 'goog.ui.editor.AbstractDialog.EventType']);
goog.addDependency('editor/plugins/abstracttabhandler.js', ['goog.editor.plugins.AbstractTabHandler'], ['goog.editor.Plugin', 'goog.events.KeyCodes']);
goog.addDependency('editor/plugins/basictextformatter.js', ['goog.editor.plugins.BasicTextFormatter', 'goog.editor.plugins.BasicTextFormatter.COMMAND'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Link', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.range', 'goog.editor.style', 'goog.iter', 'goog.iter.StopIteration', 'goog.log', 'goog.object', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.ui.editor.messages', 'goog.userAgent']);
goog.addDependency('editor/plugins/blockquote.js', ['goog.editor.plugins.Blockquote'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classes', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.node', 'goog.functions', 'goog.log']);
goog.addDependency('editor/plugins/emoticons.js', ['goog.editor.plugins.Emoticons'], ['goog.dom.TagName', 'goog.editor.Plugin', 'goog.editor.range', 'goog.functions', 'goog.ui.emoji.Emoji', 'goog.userAgent']);
goog.addDependency('editor/plugins/enterhandler.js', ['goog.editor.plugins.EnterHandler'], ['goog.dom', 'goog.dom.NodeOffset', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.plugins.Blockquote', 'goog.editor.range', 'goog.editor.style', 'goog.events.KeyCodes', 'goog.functions', 'goog.object', 'goog.string', 'goog.userAgent']);
goog.addDependency('editor/plugins/equationeditorbubble.js', ['goog.editor.plugins.equation.EquationBubble'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.string.Unicode', 'goog.ui.editor.Bubble', 'goog.ui.equation.ImageRenderer']);
goog.addDependency('editor/plugins/equationeditorplugin.js', ['goog.editor.plugins.EquationEditorPlugin'], ['goog.dom', 'goog.editor.Command', 'goog.editor.plugins.AbstractDialogPlugin', 'goog.editor.range', 'goog.events', 'goog.events.EventType', 'goog.functions', 'goog.log', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.EquationEditorDialog', 'goog.ui.equation.ImageRenderer', 'goog.ui.equation.PaletteManager']);
goog.addDependency('editor/plugins/firststrong.js', ['goog.editor.plugins.FirstStrong'], ['goog.dom.NodeType', 'goog.dom.TagIterator', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.range', 'goog.i18n.bidi', 'goog.i18n.uChar', 'goog.iter', 'goog.userAgent']);
goog.addDependency('editor/plugins/headerformatter.js', ['goog.editor.plugins.HeaderFormatter'], ['goog.editor.Command', 'goog.editor.Plugin', 'goog.userAgent']);
goog.addDependency('editor/plugins/linkbubble.js', ['goog.editor.plugins.LinkBubble', 'goog.editor.plugins.LinkBubble.Action'], ['goog.array', 'goog.dom', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Link', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.editor.range', 'goog.string', 'goog.style', 'goog.ui.editor.messages', 'goog.uri.utils', 'goog.window']);
goog.addDependency('editor/plugins/linkdialogplugin.js', ['goog.editor.plugins.LinkDialogPlugin'], ['goog.array', 'goog.dom', 'goog.editor.Command', 'goog.editor.plugins.AbstractDialogPlugin', 'goog.events.EventHandler', 'goog.functions', 'goog.ui.editor.AbstractDialog.EventType', 'goog.ui.editor.LinkDialog', 'goog.ui.editor.LinkDialog.EventType', 'goog.ui.editor.LinkDialog.OkEvent', 'goog.uri.utils']);
goog.addDependency('editor/plugins/linkshortcutplugin.js', ['goog.editor.plugins.LinkShortcutPlugin'], ['goog.editor.Command', 'goog.editor.Link', 'goog.editor.Plugin', 'goog.string']);
goog.addDependency('editor/plugins/listtabhandler.js', ['goog.editor.plugins.ListTabHandler'], ['goog.dom.TagName', 'goog.editor.Command', 'goog.editor.plugins.AbstractTabHandler']);
goog.addDependency('editor/plugins/loremipsum.js', ['goog.editor.plugins.LoremIpsum'], ['goog.asserts', 'goog.dom', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.node', 'goog.functions']);
goog.addDependency('editor/plugins/removeformatting.js', ['goog.editor.plugins.RemoveFormatting'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.range', 'goog.string', 'goog.userAgent']);
goog.addDependency('editor/plugins/spacestabhandler.js', ['goog.editor.plugins.SpacesTabHandler'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.plugins.AbstractTabHandler', 'goog.editor.range']);
goog.addDependency('editor/plugins/tableeditor.js', ['goog.editor.plugins.TableEditor'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.editor.Plugin', 'goog.editor.Table', 'goog.editor.node', 'goog.editor.range', 'goog.object']);
goog.addDependency('editor/plugins/tagonenterhandler.js', ['goog.editor.plugins.TagOnEnterHandler'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.node', 'goog.editor.plugins.EnterHandler', 'goog.editor.range', 'goog.editor.style', 'goog.events.KeyCodes', 'goog.string', 'goog.style', 'goog.userAgent']);
goog.addDependency('editor/plugins/undoredo.js', ['goog.editor.plugins.UndoRedo'], ['goog.dom', 'goog.dom.NodeOffset', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field.EventType', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.plugins.UndoRedoManager', 'goog.editor.plugins.UndoRedoState', 'goog.events', 'goog.events.EventHandler', 'goog.log']);
goog.addDependency('editor/plugins/undoredomanager.js', ['goog.editor.plugins.UndoRedoManager', 'goog.editor.plugins.UndoRedoManager.EventType'], ['goog.editor.plugins.UndoRedoState', 'goog.events.EventTarget']);
goog.addDependency('editor/plugins/undoredostate.js', ['goog.editor.plugins.UndoRedoState'], ['goog.events.EventTarget']);
goog.addDependency('editor/range.js', ['goog.editor.range', 'goog.editor.range.Point'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.RangeEndpoint', 'goog.dom.SavedCaretRange', 'goog.editor.node', 'goog.editor.style', 'goog.iter', 'goog.userAgent']);
goog.addDependency('editor/seamlessfield.js', ['goog.editor.SeamlessField'], ['goog.cssom.iframe.style', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo', 'goog.editor.node', 'goog.events', 'goog.events.EventType', 'goog.log', 'goog.style']);
goog.addDependency('editor/seamlessfield_test.js', ['goog.editor.seamlessfield_test'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.SeamlessField', 'goog.events', 'goog.functions', 'goog.style', 'goog.testing.MockClock', 'goog.testing.MockRange', 'goog.testing.jsunit']);
goog.addDependency('editor/style.js', ['goog.editor.style'], ['goog.dom', 'goog.dom.NodeType', 'goog.editor.BrowserFeature', 'goog.events.EventType', 'goog.object', 'goog.style', 'goog.userAgent']);
goog.addDependency('editor/table.js', ['goog.editor.Table', 'goog.editor.TableCell', 'goog.editor.TableRow'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.log', 'goog.string.Unicode', 'goog.style']);
goog.addDependency('events/actioneventwrapper.js', ['goog.events.actionEventWrapper'], ['goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.EventWrapper', 'goog.events.KeyCodes']);
goog.addDependency('events/actionhandler.js', ['goog.events.ActionEvent', 'goog.events.ActionHandler', 'goog.events.ActionHandler.EventType', 'goog.events.BeforeActionEvent'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/browserevent.js', ['goog.events.BrowserEvent', 'goog.events.BrowserEvent.MouseButton'], ['goog.events.BrowserFeature', 'goog.events.Event', 'goog.events.EventType', 'goog.reflect', 'goog.userAgent']);
goog.addDependency('events/browserfeature.js', ['goog.events.BrowserFeature'], ['goog.userAgent']);
goog.addDependency('events/event.js', ['goog.events.Event', 'goog.events.EventLike'], ['goog.Disposable']);
goog.addDependency('events/eventhandler.js', ['goog.events.EventHandler'], ['goog.Disposable', 'goog.events', 'goog.object']);
goog.addDependency('events/events.js', ['goog.events', 'goog.events.Key', 'goog.events.ListenableType'], ['goog.array', 'goog.asserts', 'goog.debug.entryPointRegistry', 'goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.events.Listenable', 'goog.events.Listener', 'goog.object']);
goog.addDependency('events/eventtarget.js', ['goog.events.EventTarget'], ['goog.Disposable', 'goog.array', 'goog.asserts', 'goog.events', 'goog.events.Event', 'goog.events.Listenable', 'goog.events.ListenerMap', 'goog.object']);
goog.addDependency('events/eventtargettester.js', ['goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType'], ['goog.array', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.testing.asserts', 'goog.testing.recordFunction']);
goog.addDependency('events/eventtype.js', ['goog.events.EventType'], ['goog.userAgent']);
goog.addDependency('events/eventwrapper.js', ['goog.events.EventWrapper'], []);
goog.addDependency('events/filedrophandler.js', ['goog.events.FileDropHandler', 'goog.events.FileDropHandler.EventType'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.log']);
goog.addDependency('events/focushandler.js', ['goog.events.FocusHandler', 'goog.events.FocusHandler.EventType'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.userAgent']);
goog.addDependency('events/imehandler.js', ['goog.events.ImeHandler', 'goog.events.ImeHandler.Event', 'goog.events.ImeHandler.EventType'], ['goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/inputhandler.js', ['goog.events.InputHandler', 'goog.events.InputHandler.EventType'], ['goog.Timer', 'goog.dom', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/keycodes.js', ['goog.events.KeyCodes'], ['goog.userAgent']);
goog.addDependency('events/keyhandler.js', ['goog.events.KeyEvent', 'goog.events.KeyHandler', 'goog.events.KeyHandler.EventType'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/keynames.js', ['goog.events.KeyNames'], []);
goog.addDependency('events/listenable.js', ['goog.events.Listenable', 'goog.events.ListenableKey'], []);
goog.addDependency('events/listener.js', ['goog.events.Listener'], ['goog.events.ListenableKey']);
goog.addDependency('events/listenermap.js', ['goog.events.ListenerMap'], ['goog.array', 'goog.events.Listener', 'goog.object']);
goog.addDependency('events/listenermap_test.js', ['goog.events.ListenerMapTest'], ['goog.dispose', 'goog.events.EventTarget', 'goog.events.ListenerMap', 'goog.testing.jsunit']);
goog.addDependency('events/mousewheelhandler.js', ['goog.events.MouseWheelEvent', 'goog.events.MouseWheelHandler', 'goog.events.MouseWheelHandler.EventType'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.math', 'goog.style', 'goog.userAgent']);
goog.addDependency('events/onlinehandler.js', ['goog.events.OnlineHandler', 'goog.events.OnlineHandler.EventType'], ['goog.Timer', 'goog.events.BrowserFeature', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.net.NetworkStatusMonitor', 'goog.userAgent']);
goog.addDependency('events/pastehandler.js', ['goog.events.PasteHandler', 'goog.events.PasteHandler.EventType', 'goog.events.PasteHandler.State'], ['goog.Timer', 'goog.async.ConditionalDelay', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.log', 'goog.userAgent']);
goog.addDependency('format/emailaddress.js', ['goog.format.EmailAddress'], ['goog.string']);
goog.addDependency('format/format.js', ['goog.format'], ['goog.i18n.GraphemeBreak', 'goog.string', 'goog.userAgent']);
goog.addDependency('format/htmlprettyprinter.js', ['goog.format.HtmlPrettyPrinter', 'goog.format.HtmlPrettyPrinter.Buffer'], ['goog.object', 'goog.string.StringBuffer']);
goog.addDependency('format/jsonprettyprinter.js', ['goog.format.JsonPrettyPrinter', 'goog.format.JsonPrettyPrinter.HtmlDelimiters', 'goog.format.JsonPrettyPrinter.TextDelimiters'], ['goog.json', 'goog.json.Serializer', 'goog.string', 'goog.string.StringBuffer', 'goog.string.format']);
goog.addDependency('fs/entry.js', ['goog.fs.DirectoryEntry', 'goog.fs.DirectoryEntry.Behavior', 'goog.fs.Entry', 'goog.fs.FileEntry'], []);
goog.addDependency('fs/entryimpl.js', ['goog.fs.DirectoryEntryImpl', 'goog.fs.EntryImpl', 'goog.fs.FileEntryImpl'], ['goog.array', 'goog.async.Deferred', 'goog.fs.DirectoryEntry', 'goog.fs.Entry', 'goog.fs.Error', 'goog.fs.FileEntry', 'goog.fs.FileWriter', 'goog.functions', 'goog.string']);
goog.addDependency('fs/error.js', ['goog.fs.Error', 'goog.fs.Error.ErrorCode'], ['goog.debug.Error', 'goog.string']);
goog.addDependency('fs/filereader.js', ['goog.fs.FileReader', 'goog.fs.FileReader.EventType', 'goog.fs.FileReader.ReadyState'], ['goog.async.Deferred', 'goog.events.Event', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.ProgressEvent']);
goog.addDependency('fs/filesaver.js', ['goog.fs.FileSaver', 'goog.fs.FileSaver.EventType', 'goog.fs.FileSaver.ProgressEvent', 'goog.fs.FileSaver.ReadyState'], ['goog.events.Event', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.ProgressEvent']);
goog.addDependency('fs/filesystem.js', ['goog.fs.FileSystem'], []);
goog.addDependency('fs/filesystemimpl.js', ['goog.fs.FileSystemImpl'], ['goog.fs.DirectoryEntryImpl', 'goog.fs.FileSystem']);
goog.addDependency('fs/filewriter.js', ['goog.fs.FileWriter'], ['goog.fs.Error', 'goog.fs.FileSaver']);
goog.addDependency('fs/fs.js', ['goog.fs'], ['goog.array', 'goog.async.Deferred', 'goog.fs.Error', 'goog.fs.FileReader', 'goog.fs.FileSystemImpl', 'goog.userAgent']);
goog.addDependency('fs/progressevent.js', ['goog.fs.ProgressEvent'], ['goog.events.Event']);
goog.addDependency('functions/functions.js', ['goog.functions'], []);
goog.addDependency('fx/abstractdragdrop.js', ['goog.fx.AbstractDragDrop', 'goog.fx.AbstractDragDrop.EventType', 'goog.fx.DragDropEvent', 'goog.fx.DragDropItem'], ['goog.dom', 'goog.dom.classes', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.fx.Dragger.EventType', 'goog.math.Box', 'goog.math.Coordinate', 'goog.style']);
goog.addDependency('fx/anim/anim.js', ['goog.fx.anim', 'goog.fx.anim.Animated'], ['goog.async.AnimationDelay', 'goog.async.Delay', 'goog.object']);
goog.addDependency('fx/animation.js', ['goog.fx.Animation', 'goog.fx.Animation.EventType', 'goog.fx.Animation.State', 'goog.fx.AnimationEvent'], ['goog.array', 'goog.events.Event', 'goog.fx.Transition', 'goog.fx.Transition.EventType', 'goog.fx.TransitionBase.State', 'goog.fx.anim', 'goog.fx.anim.Animated']);
goog.addDependency('fx/animationqueue.js', ['goog.fx.AnimationParallelQueue', 'goog.fx.AnimationQueue', 'goog.fx.AnimationSerialQueue'], ['goog.array', 'goog.asserts', 'goog.events.EventHandler', 'goog.fx.Transition.EventType', 'goog.fx.TransitionBase', 'goog.fx.TransitionBase.State']);
goog.addDependency('fx/css3/fx.js', ['goog.fx.css3'], ['goog.fx.css3.Transition']);
goog.addDependency('fx/css3/transition.js', ['goog.fx.css3.Transition'], ['goog.Timer', 'goog.fx.TransitionBase', 'goog.style', 'goog.style.transition']);
goog.addDependency('fx/cssspriteanimation.js', ['goog.fx.CssSpriteAnimation'], ['goog.fx.Animation']);
goog.addDependency('fx/dom.js', ['goog.fx.dom', 'goog.fx.dom.BgColorTransform', 'goog.fx.dom.ColorTransform', 'goog.fx.dom.Fade', 'goog.fx.dom.FadeIn', 'goog.fx.dom.FadeInAndShow', 'goog.fx.dom.FadeOut', 'goog.fx.dom.FadeOutAndHide', 'goog.fx.dom.PredefinedEffect', 'goog.fx.dom.Resize', 'goog.fx.dom.ResizeHeight', 'goog.fx.dom.ResizeWidth', 'goog.fx.dom.Scroll', 'goog.fx.dom.Slide', 'goog.fx.dom.SlideFrom', 'goog.fx.dom.Swipe'], ['goog.color', 'goog.events', 'goog.fx.Animation', 'goog.fx.Transition.EventType', 'goog.style', 'goog.style.bidi']);
goog.addDependency('fx/dragdrop.js', ['goog.fx.DragDrop'], ['goog.fx.AbstractDragDrop', 'goog.fx.DragDropItem']);
goog.addDependency('fx/dragdropgroup.js', ['goog.fx.DragDropGroup'], ['goog.dom', 'goog.fx.AbstractDragDrop', 'goog.fx.DragDropItem']);
goog.addDependency('fx/dragger.js', ['goog.fx.DragEvent', 'goog.fx.Dragger', 'goog.fx.Dragger.EventType'], ['goog.dom', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.style', 'goog.style.bidi', 'goog.userAgent']);
goog.addDependency('fx/draglistgroup.js', ['goog.fx.DragListDirection', 'goog.fx.DragListGroup', 'goog.fx.DragListGroup.EventType', 'goog.fx.DragListGroupEvent'], ['goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classes', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.fx.Dragger.EventType', 'goog.math.Coordinate', 'goog.style']);
goog.addDependency('fx/dragscrollsupport.js', ['goog.fx.DragScrollSupport'], ['goog.Disposable', 'goog.Timer', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.style']);
goog.addDependency('fx/easing.js', ['goog.fx.easing'], []);
goog.addDependency('fx/fx.js', ['goog.fx'], ['goog.asserts', 'goog.fx.Animation', 'goog.fx.Animation.EventType', 'goog.fx.Animation.State', 'goog.fx.AnimationEvent', 'goog.fx.Transition.EventType', 'goog.fx.easing']);
goog.addDependency('fx/transition.js', ['goog.fx.Transition', 'goog.fx.Transition.EventType'], []);
goog.addDependency('fx/transitionbase.js', ['goog.fx.TransitionBase', 'goog.fx.TransitionBase.State'], ['goog.events.EventTarget', 'goog.fx.Transition', 'goog.fx.Transition.EventType']);
goog.addDependency('gears/basestore.js', ['goog.gears.BaseStore', 'goog.gears.BaseStore.SchemaType'], ['goog.Disposable']);
goog.addDependency('gears/database.js', ['goog.gears.Database', 'goog.gears.Database.EventType', 'goog.gears.Database.TransactionEvent'], ['goog.array', 'goog.debug', 'goog.events.Event', 'goog.events.EventTarget', 'goog.gears', 'goog.json', 'goog.log']);
goog.addDependency('gears/gears.js', ['goog.gears'], ['goog.string']);
goog.addDependency('gears/httprequest.js', ['goog.gears.HttpRequest'], ['goog.Timer', 'goog.gears', 'goog.net.WrapperXmlHttpFactory', 'goog.net.XmlHttp']);
goog.addDependency('gears/loggerclient.js', ['goog.gears.LoggerClient'], ['goog.Disposable', 'goog.debug', 'goog.debug.Logger']);
goog.addDependency('gears/loggerserver.js', ['goog.gears.LoggerServer'], ['goog.Disposable', 'goog.gears.Worker.EventType', 'goog.log', 'goog.log.Level']);
goog.addDependency('gears/logstore.js', ['goog.gears.LogStore', 'goog.gears.LogStore.Query'], ['goog.async.Delay', 'goog.debug.LogManager', 'goog.gears.BaseStore', 'goog.gears.BaseStore.SchemaType', 'goog.json', 'goog.log', 'goog.log.Level', 'goog.log.LogRecord']);
goog.addDependency('gears/managedresourcestore.js', ['goog.gears.ManagedResourceStore', 'goog.gears.ManagedResourceStore.EventType', 'goog.gears.ManagedResourceStore.UpdateStatus', 'goog.gears.ManagedResourceStoreEvent'], ['goog.events.Event', 'goog.events.EventTarget', 'goog.gears', 'goog.log', 'goog.string']);
goog.addDependency('gears/multipartformdata.js', ['goog.gears.MultipartFormData'], ['goog.asserts', 'goog.gears', 'goog.string']);
goog.addDependency('gears/statustype.js', ['goog.gears.StatusType'], []);
goog.addDependency('gears/urlcapture.js', ['goog.gears.UrlCapture', 'goog.gears.UrlCapture.Event', 'goog.gears.UrlCapture.EventType'], ['goog.Uri', 'goog.events.Event', 'goog.events.EventTarget', 'goog.gears', 'goog.log']);
goog.addDependency('gears/worker.js', ['goog.gears.Worker', 'goog.gears.Worker.EventType', 'goog.gears.WorkerEvent'], ['goog.events.Event', 'goog.events.EventTarget']);
goog.addDependency('gears/workerchannel.js', ['goog.gears.WorkerChannel'], ['goog.Disposable', 'goog.debug', 'goog.events', 'goog.gears.Worker', 'goog.gears.Worker.EventType', 'goog.gears.WorkerEvent', 'goog.json', 'goog.log', 'goog.messaging.AbstractChannel']);
goog.addDependency('gears/workerpool.js', ['goog.gears.WorkerPool', 'goog.gears.WorkerPool.Event', 'goog.gears.WorkerPool.EventType'], ['goog.events.Event', 'goog.events.EventTarget', 'goog.gears', 'goog.gears.Worker']);
goog.addDependency('graphics/abstractgraphics.js', ['goog.graphics.AbstractGraphics'], ['goog.dom', 'goog.graphics.Path', 'goog.math.Coordinate', 'goog.math.Size', 'goog.style', 'goog.ui.Component']);
goog.addDependency('graphics/affinetransform.js', ['goog.graphics.AffineTransform'], ['goog.math']);
goog.addDependency('graphics/canvaselement.js', ['goog.graphics.CanvasEllipseElement', 'goog.graphics.CanvasGroupElement', 'goog.graphics.CanvasImageElement', 'goog.graphics.CanvasPathElement', 'goog.graphics.CanvasRectElement', 'goog.graphics.CanvasTextElement'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.graphics.EllipseElement', 'goog.graphics.GroupElement', 'goog.graphics.ImageElement', 'goog.graphics.Path', 'goog.graphics.PathElement', 'goog.graphics.RectElement', 'goog.graphics.TextElement', 'goog.math', 'goog.string']);
goog.addDependency('graphics/canvasgraphics.js', ['goog.graphics.CanvasGraphics'], ['goog.events.EventType', 'goog.graphics.AbstractGraphics', 'goog.graphics.CanvasEllipseElement', 'goog.graphics.CanvasGroupElement', 'goog.graphics.CanvasImageElement', 'goog.graphics.CanvasPathElement', 'goog.graphics.CanvasRectElement', 'goog.graphics.CanvasTextElement', 'goog.graphics.SolidFill', 'goog.math.Size', 'goog.style']);
goog.addDependency('graphics/element.js', ['goog.graphics.Element'], ['goog.events', 'goog.events.EventTarget', 'goog.events.Listenable', 'goog.graphics.AffineTransform', 'goog.math']);
goog.addDependency('graphics/ellipseelement.js', ['goog.graphics.EllipseElement'], ['goog.graphics.StrokeAndFillElement']);
goog.addDependency('graphics/ext/coordinates.js', ['goog.graphics.ext.coordinates'], ['goog.string']);
goog.addDependency('graphics/ext/element.js', ['goog.graphics.ext.Element'], ['goog.events', 'goog.events.EventTarget', 'goog.functions', 'goog.graphics', 'goog.graphics.ext.coordinates']);
goog.addDependency('graphics/ext/ellipse.js', ['goog.graphics.ext.Ellipse'], ['goog.graphics.ext.StrokeAndFillElement']);
goog.addDependency('graphics/ext/ext.js', ['goog.graphics.ext'], ['goog.graphics.ext.Ellipse', 'goog.graphics.ext.Graphics', 'goog.graphics.ext.Group', 'goog.graphics.ext.Image', 'goog.graphics.ext.Rectangle', 'goog.graphics.ext.Shape', 'goog.graphics.ext.coordinates']);
goog.addDependency('graphics/ext/graphics.js', ['goog.graphics.ext.Graphics'], ['goog.events.EventType', 'goog.graphics.ext.Group']);
goog.addDependency('graphics/ext/group.js', ['goog.graphics.ext.Group'], ['goog.graphics.ext.Element']);
goog.addDependency('graphics/ext/image.js', ['goog.graphics.ext.Image'], ['goog.graphics.ext.Element']);
goog.addDependency('graphics/ext/path.js', ['goog.graphics.ext.Path'], ['goog.graphics.AffineTransform', 'goog.graphics.Path', 'goog.math', 'goog.math.Rect']);
goog.addDependency('graphics/ext/rectangle.js', ['goog.graphics.ext.Rectangle'], ['goog.graphics.ext.StrokeAndFillElement']);
goog.addDependency('graphics/ext/shape.js', ['goog.graphics.ext.Shape'], ['goog.graphics.ext.Path', 'goog.graphics.ext.StrokeAndFillElement', 'goog.math.Rect']);
goog.addDependency('graphics/ext/strokeandfillelement.js', ['goog.graphics.ext.StrokeAndFillElement'], ['goog.graphics.ext.Element']);
goog.addDependency('graphics/fill.js', ['goog.graphics.Fill'], []);
goog.addDependency('graphics/font.js', ['goog.graphics.Font'], []);
goog.addDependency('graphics/graphics.js', ['goog.graphics'], ['goog.graphics.CanvasGraphics', 'goog.graphics.SvgGraphics', 'goog.graphics.VmlGraphics', 'goog.userAgent']);
goog.addDependency('graphics/groupelement.js', ['goog.graphics.GroupElement'], ['goog.graphics.Element']);
goog.addDependency('graphics/imageelement.js', ['goog.graphics.ImageElement'], ['goog.graphics.Element']);
goog.addDependency('graphics/lineargradient.js', ['goog.graphics.LinearGradient'], ['goog.asserts', 'goog.graphics.Fill']);
goog.addDependency('graphics/path.js', ['goog.graphics.Path', 'goog.graphics.Path.Segment'], ['goog.array', 'goog.math']);
goog.addDependency('graphics/pathelement.js', ['goog.graphics.PathElement'], ['goog.graphics.StrokeAndFillElement']);
goog.addDependency('graphics/paths.js', ['goog.graphics.paths'], ['goog.graphics.Path', 'goog.math.Coordinate']);
goog.addDependency('graphics/rectelement.js', ['goog.graphics.RectElement'], ['goog.graphics.StrokeAndFillElement']);
goog.addDependency('graphics/solidfill.js', ['goog.graphics.SolidFill'], ['goog.graphics.Fill']);
goog.addDependency('graphics/stroke.js', ['goog.graphics.Stroke'], []);
goog.addDependency('graphics/strokeandfillelement.js', ['goog.graphics.StrokeAndFillElement'], ['goog.graphics.Element']);
goog.addDependency('graphics/svgelement.js', ['goog.graphics.SvgEllipseElement', 'goog.graphics.SvgGroupElement', 'goog.graphics.SvgImageElement', 'goog.graphics.SvgPathElement', 'goog.graphics.SvgRectElement', 'goog.graphics.SvgTextElement'], ['goog.dom', 'goog.graphics.EllipseElement', 'goog.graphics.GroupElement', 'goog.graphics.ImageElement', 'goog.graphics.PathElement', 'goog.graphics.RectElement', 'goog.graphics.TextElement']);
goog.addDependency('graphics/svggraphics.js', ['goog.graphics.SvgGraphics'], ['goog.Timer', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.graphics.AbstractGraphics', 'goog.graphics.LinearGradient', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.graphics.Stroke', 'goog.graphics.SvgEllipseElement', 'goog.graphics.SvgGroupElement', 'goog.graphics.SvgImageElement', 'goog.graphics.SvgPathElement', 'goog.graphics.SvgRectElement', 'goog.graphics.SvgTextElement', 'goog.math', 'goog.math.Size', 'goog.style', 'goog.userAgent']);
goog.addDependency('graphics/textelement.js', ['goog.graphics.TextElement'], ['goog.graphics.StrokeAndFillElement']);
goog.addDependency('graphics/vmlelement.js', ['goog.graphics.VmlEllipseElement', 'goog.graphics.VmlGroupElement', 'goog.graphics.VmlImageElement', 'goog.graphics.VmlPathElement', 'goog.graphics.VmlRectElement', 'goog.graphics.VmlTextElement'], ['goog.dom', 'goog.graphics.EllipseElement', 'goog.graphics.GroupElement', 'goog.graphics.ImageElement', 'goog.graphics.PathElement', 'goog.graphics.RectElement', 'goog.graphics.TextElement']);
goog.addDependency('graphics/vmlgraphics.js', ['goog.graphics.VmlGraphics'], ['goog.array', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.graphics.AbstractGraphics', 'goog.graphics.LinearGradient', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.graphics.VmlEllipseElement', 'goog.graphics.VmlGroupElement', 'goog.graphics.VmlImageElement', 'goog.graphics.VmlPathElement', 'goog.graphics.VmlRectElement', 'goog.graphics.VmlTextElement', 'goog.math', 'goog.math.Size', 'goog.string', 'goog.style']);
goog.addDependency('history/event.js', ['goog.history.Event'], ['goog.events.Event', 'goog.history.EventType']);
goog.addDependency('history/eventtype.js', ['goog.history.EventType'], []);
goog.addDependency('history/history.js', ['goog.History', 'goog.History.Event', 'goog.History.EventType'], ['goog.Timer', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.history.Event', 'goog.history.EventType', 'goog.memoize', 'goog.string', 'goog.userAgent']);
goog.addDependency('history/history_test.js', ['goog.HistoryTest'], ['goog.History', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('history/html5history.js', ['goog.history.Html5History', 'goog.history.Html5History.TokenTransformer'], ['goog.asserts', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.history.Event', 'goog.history.EventType']);
goog.addDependency('i18n/bidi.js', ['goog.i18n.bidi'], []);
goog.addDependency('i18n/bidiformatter.js', ['goog.i18n.BidiFormatter'], ['goog.i18n.bidi', 'goog.string']);
goog.addDependency('i18n/charlistdecompressor.js', ['goog.i18n.CharListDecompressor'], ['goog.array', 'goog.i18n.uChar']);
goog.addDependency('i18n/charpickerdata.js', ['goog.i18n.CharPickerData'], []);
goog.addDependency('i18n/collation.js', ['goog.i18n.collation'], []);
goog.addDependency('i18n/compactnumberformatsymbols.js', ['goog.i18n.CompactNumberFormatSymbols', 'goog.i18n.CompactNumberFormatSymbols_af', 'goog.i18n.CompactNumberFormatSymbols_af_ZA', 'goog.i18n.CompactNumberFormatSymbols_am', 'goog.i18n.CompactNumberFormatSymbols_am_ET', 'goog.i18n.CompactNumberFormatSymbols_ar', 'goog.i18n.CompactNumberFormatSymbols_ar_001', 'goog.i18n.CompactNumberFormatSymbols_ar_EG', 'goog.i18n.CompactNumberFormatSymbols_bg', 'goog.i18n.CompactNumberFormatSymbols_bg_BG', 'goog.i18n.CompactNumberFormatSymbols_bn', 'goog.i18n.CompactNumberFormatSymbols_bn_BD', 'goog.i18n.CompactNumberFormatSymbols_br', 'goog.i18n.CompactNumberFormatSymbols_br_FR', 'goog.i18n.CompactNumberFormatSymbols_ca', 'goog.i18n.CompactNumberFormatSymbols_ca_AD', 'goog.i18n.CompactNumberFormatSymbols_ca_ES', 'goog.i18n.CompactNumberFormatSymbols_chr', 'goog.i18n.CompactNumberFormatSymbols_chr_US', 'goog.i18n.CompactNumberFormatSymbols_cs', 'goog.i18n.CompactNumberFormatSymbols_cs_CZ', 'goog.i18n.CompactNumberFormatSymbols_cy', 'goog.i18n.CompactNumberFormatSymbols_cy_GB', 'goog.i18n.CompactNumberFormatSymbols_da', 'goog.i18n.CompactNumberFormatSymbols_da_DK', 'goog.i18n.CompactNumberFormatSymbols_de', 'goog.i18n.CompactNumberFormatSymbols_de_AT', 'goog.i18n.CompactNumberFormatSymbols_de_BE', 'goog.i18n.CompactNumberFormatSymbols_de_CH', 'goog.i18n.CompactNumberFormatSymbols_de_DE', 'goog.i18n.CompactNumberFormatSymbols_de_LU', 'goog.i18n.CompactNumberFormatSymbols_el', 'goog.i18n.CompactNumberFormatSymbols_el_GR', 'goog.i18n.CompactNumberFormatSymbols_en', 'goog.i18n.CompactNumberFormatSymbols_en_AS', 'goog.i18n.CompactNumberFormatSymbols_en_AU', 'goog.i18n.CompactNumberFormatSymbols_en_Dsrt_US', 'goog.i18n.CompactNumberFormatSymbols_en_FM', 'goog.i18n.CompactNumberFormatSymbols_en_GB', 'goog.i18n.CompactNumberFormatSymbols_en_GU', 'goog.i18n.CompactNumberFormatSymbols_en_IE', 'goog.i18n.CompactNumberFormatSymbols_en_IN', 'goog.i18n.CompactNumberFormatSymbols_en_MH', 'goog.i18n.CompactNumberFormatSymbols_en_MP', 'goog.i18n.CompactNumberFormatSymbols_en_PR', 'goog.i18n.CompactNumberFormatSymbols_en_PW', 'goog.i18n.CompactNumberFormatSymbols_en_SG', 'goog.i18n.CompactNumberFormatSymbols_en_TC', 'goog.i18n.CompactNumberFormatSymbols_en_UM', 'goog.i18n.CompactNumberFormatSymbols_en_US', 'goog.i18n.CompactNumberFormatSymbols_en_VG', 'goog.i18n.CompactNumberFormatSymbols_en_VI', 'goog.i18n.CompactNumberFormatSymbols_en_ZA', 'goog.i18n.CompactNumberFormatSymbols_es', 'goog.i18n.CompactNumberFormatSymbols_es_419', 'goog.i18n.CompactNumberFormatSymbols_es_EA', 'goog.i18n.CompactNumberFormatSymbols_es_ES', 'goog.i18n.CompactNumberFormatSymbols_es_IC', 'goog.i18n.CompactNumberFormatSymbols_et', 'goog.i18n.CompactNumberFormatSymbols_et_EE', 'goog.i18n.CompactNumberFormatSymbols_eu', 'goog.i18n.CompactNumberFormatSymbols_eu_ES', 'goog.i18n.CompactNumberFormatSymbols_fa', 'goog.i18n.CompactNumberFormatSymbols_fa_IR', 'goog.i18n.CompactNumberFormatSymbols_fi', 'goog.i18n.CompactNumberFormatSymbols_fi_FI', 'goog.i18n.CompactNumberFormatSymbols_fil', 'goog.i18n.CompactNumberFormatSymbols_fil_PH', 'goog.i18n.CompactNumberFormatSymbols_fr', 'goog.i18n.CompactNumberFormatSymbols_fr_BL', 'goog.i18n.CompactNumberFormatSymbols_fr_CA', 'goog.i18n.CompactNumberFormatSymbols_fr_FR', 'goog.i18n.CompactNumberFormatSymbols_fr_GF', 'goog.i18n.CompactNumberFormatSymbols_fr_GP', 'goog.i18n.CompactNumberFormatSymbols_fr_MC', 'goog.i18n.CompactNumberFormatSymbols_fr_MF', 'goog.i18n.CompactNumberFormatSymbols_fr_MQ', 'goog.i18n.CompactNumberFormatSymbols_fr_RE', 'goog.i18n.CompactNumberFormatSymbols_fr_YT', 'goog.i18n.CompactNumberFormatSymbols_gl', 'goog.i18n.CompactNumberFormatSymbols_gl_ES', 'goog.i18n.CompactNumberFormatSymbols_gsw', 'goog.i18n.CompactNumberFormatSymbols_gsw_CH', 'goog.i18n.CompactNumberFormatSymbols_gu', 'goog.i18n.CompactNumberFormatSymbols_gu_IN', 'goog.i18n.CompactNumberFormatSymbols_haw', 'goog.i18n.CompactNumberFormatSymbols_haw_US', 'goog.i18n.CompactNumberFormatSymbols_he', 'goog.i18n.CompactNumberFormatSymbols_he_IL', 'goog.i18n.CompactNumberFormatSymbols_hi', 'goog.i18n.CompactNumberFormatSymbols_hi_IN', 'goog.i18n.CompactNumberFormatSymbols_hr', 'goog.i18n.CompactNumberFormatSymbols_hr_HR', 'goog.i18n.CompactNumberFormatSymbols_hu', 'goog.i18n.CompactNumberFormatSymbols_hu_HU', 'goog.i18n.CompactNumberFormatSymbols_id', 'goog.i18n.CompactNumberFormatSymbols_id_ID', 'goog.i18n.CompactNumberFormatSymbols_in', 'goog.i18n.CompactNumberFormatSymbols_is', 'goog.i18n.CompactNumberFormatSymbols_is_IS', 'goog.i18n.CompactNumberFormatSymbols_it', 'goog.i18n.CompactNumberFormatSymbols_it_IT', 'goog.i18n.CompactNumberFormatSymbols_it_SM', 'goog.i18n.CompactNumberFormatSymbols_iw', 'goog.i18n.CompactNumberFormatSymbols_ja', 'goog.i18n.CompactNumberFormatSymbols_ja_JP', 'goog.i18n.CompactNumberFormatSymbols_kn', 'goog.i18n.CompactNumberFormatSymbols_kn_IN', 'goog.i18n.CompactNumberFormatSymbols_ko', 'goog.i18n.CompactNumberFormatSymbols_ko_KR', 'goog.i18n.CompactNumberFormatSymbols_ln', 'goog.i18n.CompactNumberFormatSymbols_ln_CD', 'goog.i18n.CompactNumberFormatSymbols_lt', 'goog.i18n.CompactNumberFormatSymbols_lt_LT', 'goog.i18n.CompactNumberFormatSymbols_lv', 'goog.i18n.CompactNumberFormatSymbols_lv_LV', 'goog.i18n.CompactNumberFormatSymbols_ml', 'goog.i18n.CompactNumberFormatSymbols_ml_IN', 'goog.i18n.CompactNumberFormatSymbols_mr', 'goog.i18n.CompactNumberFormatSymbols_mr_IN', 'goog.i18n.CompactNumberFormatSymbols_ms', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn_MY', 'goog.i18n.CompactNumberFormatSymbols_mt', 'goog.i18n.CompactNumberFormatSymbols_mt_MT', 'goog.i18n.CompactNumberFormatSymbols_nb', 'goog.i18n.CompactNumberFormatSymbols_nb_NO', 'goog.i18n.CompactNumberFormatSymbols_nl', 'goog.i18n.CompactNumberFormatSymbols_nl_NL', 'goog.i18n.CompactNumberFormatSymbols_no', 'goog.i18n.CompactNumberFormatSymbols_or', 'goog.i18n.CompactNumberFormatSymbols_or_IN', 'goog.i18n.CompactNumberFormatSymbols_pl', 'goog.i18n.CompactNumberFormatSymbols_pl_PL', 'goog.i18n.CompactNumberFormatSymbols_pt', 'goog.i18n.CompactNumberFormatSymbols_pt_BR', 'goog.i18n.CompactNumberFormatSymbols_pt_PT', 'goog.i18n.CompactNumberFormatSymbols_ro', 'goog.i18n.CompactNumberFormatSymbols_ro_RO', 'goog.i18n.CompactNumberFormatSymbols_ru', 'goog.i18n.CompactNumberFormatSymbols_ru_RU', 'goog.i18n.CompactNumberFormatSymbols_sk', 'goog.i18n.CompactNumberFormatSymbols_sk_SK', 'goog.i18n.CompactNumberFormatSymbols_sl', 'goog.i18n.CompactNumberFormatSymbols_sl_SI', 'goog.i18n.CompactNumberFormatSymbols_sq', 'goog.i18n.CompactNumberFormatSymbols_sq_AL', 'goog.i18n.CompactNumberFormatSymbols_sr', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_RS', 'goog.i18n.CompactNumberFormatSymbols_sv', 'goog.i18n.CompactNumberFormatSymbols_sv_SE', 'goog.i18n.CompactNumberFormatSymbols_sw', 'goog.i18n.CompactNumberFormatSymbols_sw_TZ', 'goog.i18n.CompactNumberFormatSymbols_ta', 'goog.i18n.CompactNumberFormatSymbols_ta_IN', 'goog.i18n.CompactNumberFormatSymbols_te', 'goog.i18n.CompactNumberFormatSymbols_te_IN', 'goog.i18n.CompactNumberFormatSymbols_th', 'goog.i18n.CompactNumberFormatSymbols_th_TH', 'goog.i18n.CompactNumberFormatSymbols_tl', 'goog.i18n.CompactNumberFormatSymbols_tr', 'goog.i18n.CompactNumberFormatSymbols_tr_TR', 'goog.i18n.CompactNumberFormatSymbols_uk', 'goog.i18n.CompactNumberFormatSymbols_uk_UA', 'goog.i18n.CompactNumberFormatSymbols_ur', 'goog.i18n.CompactNumberFormatSymbols_ur_PK', 'goog.i18n.CompactNumberFormatSymbols_vi', 'goog.i18n.CompactNumberFormatSymbols_vi_VN', 'goog.i18n.CompactNumberFormatSymbols_zh', 'goog.i18n.CompactNumberFormatSymbols_zh_CN', 'goog.i18n.CompactNumberFormatSymbols_zh_HK', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_CN', 'goog.i18n.CompactNumberFormatSymbols_zh_TW', 'goog.i18n.CompactNumberFormatSymbols_zu', 'goog.i18n.CompactNumberFormatSymbols_zu_ZA'], []);
goog.addDependency('i18n/compactnumberformatsymbols_ext.js', ['goog.i18n.CompactNumberFormatSymbolsExt', 'goog.i18n.CompactNumberFormatSymbols_aa', 'goog.i18n.CompactNumberFormatSymbols_aa_DJ', 'goog.i18n.CompactNumberFormatSymbols_aa_ER', 'goog.i18n.CompactNumberFormatSymbols_aa_ET', 'goog.i18n.CompactNumberFormatSymbols_af_NA', 'goog.i18n.CompactNumberFormatSymbols_agq', 'goog.i18n.CompactNumberFormatSymbols_agq_CM', 'goog.i18n.CompactNumberFormatSymbols_ak', 'goog.i18n.CompactNumberFormatSymbols_ak_GH', 'goog.i18n.CompactNumberFormatSymbols_ar_AE', 'goog.i18n.CompactNumberFormatSymbols_ar_BH', 'goog.i18n.CompactNumberFormatSymbols_ar_DJ', 'goog.i18n.CompactNumberFormatSymbols_ar_DZ', 'goog.i18n.CompactNumberFormatSymbols_ar_EH', 'goog.i18n.CompactNumberFormatSymbols_ar_ER', 'goog.i18n.CompactNumberFormatSymbols_ar_IL', 'goog.i18n.CompactNumberFormatSymbols_ar_IQ', 'goog.i18n.CompactNumberFormatSymbols_ar_JO', 'goog.i18n.CompactNumberFormatSymbols_ar_KM', 'goog.i18n.CompactNumberFormatSymbols_ar_KW', 'goog.i18n.CompactNumberFormatSymbols_ar_LB', 'goog.i18n.CompactNumberFormatSymbols_ar_LY', 'goog.i18n.CompactNumberFormatSymbols_ar_MA', 'goog.i18n.CompactNumberFormatSymbols_ar_MR', 'goog.i18n.CompactNumberFormatSymbols_ar_OM', 'goog.i18n.CompactNumberFormatSymbols_ar_PS', 'goog.i18n.CompactNumberFormatSymbols_ar_QA', 'goog.i18n.CompactNumberFormatSymbols_ar_SA', 'goog.i18n.CompactNumberFormatSymbols_ar_SD', 'goog.i18n.CompactNumberFormatSymbols_ar_SO', 'goog.i18n.CompactNumberFormatSymbols_ar_SY', 'goog.i18n.CompactNumberFormatSymbols_ar_TD', 'goog.i18n.CompactNumberFormatSymbols_ar_TN', 'goog.i18n.CompactNumberFormatSymbols_ar_YE', 'goog.i18n.CompactNumberFormatSymbols_as', 'goog.i18n.CompactNumberFormatSymbols_as_IN', 'goog.i18n.CompactNumberFormatSymbols_asa', 'goog.i18n.CompactNumberFormatSymbols_asa_TZ', 'goog.i18n.CompactNumberFormatSymbols_ast', 'goog.i18n.CompactNumberFormatSymbols_ast_ES', 'goog.i18n.CompactNumberFormatSymbols_az', 'goog.i18n.CompactNumberFormatSymbols_az_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_az_Cyrl_AZ', 'goog.i18n.CompactNumberFormatSymbols_az_Latn', 'goog.i18n.CompactNumberFormatSymbols_az_Latn_AZ', 'goog.i18n.CompactNumberFormatSymbols_bas', 'goog.i18n.CompactNumberFormatSymbols_bas_CM', 'goog.i18n.CompactNumberFormatSymbols_be', 'goog.i18n.CompactNumberFormatSymbols_be_BY', 'goog.i18n.CompactNumberFormatSymbols_bem', 'goog.i18n.CompactNumberFormatSymbols_bem_ZM', 'goog.i18n.CompactNumberFormatSymbols_bez', 'goog.i18n.CompactNumberFormatSymbols_bez_TZ', 'goog.i18n.CompactNumberFormatSymbols_bm', 'goog.i18n.CompactNumberFormatSymbols_bm_ML', 'goog.i18n.CompactNumberFormatSymbols_bn_IN', 'goog.i18n.CompactNumberFormatSymbols_bo', 'goog.i18n.CompactNumberFormatSymbols_bo_CN', 'goog.i18n.CompactNumberFormatSymbols_bo_IN', 'goog.i18n.CompactNumberFormatSymbols_brx', 'goog.i18n.CompactNumberFormatSymbols_brx_IN', 'goog.i18n.CompactNumberFormatSymbols_bs', 'goog.i18n.CompactNumberFormatSymbols_bs_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_bs_Cyrl_BA', 'goog.i18n.CompactNumberFormatSymbols_bs_Latn', 'goog.i18n.CompactNumberFormatSymbols_bs_Latn_BA', 'goog.i18n.CompactNumberFormatSymbols_byn', 'goog.i18n.CompactNumberFormatSymbols_byn_ER', 'goog.i18n.CompactNumberFormatSymbols_cgg', 'goog.i18n.CompactNumberFormatSymbols_cgg_UG', 'goog.i18n.CompactNumberFormatSymbols_ckb', 'goog.i18n.CompactNumberFormatSymbols_ckb_Arab', 'goog.i18n.CompactNumberFormatSymbols_ckb_Arab_IQ', 'goog.i18n.CompactNumberFormatSymbols_ckb_Arab_IR', 'goog.i18n.CompactNumberFormatSymbols_ckb_IQ', 'goog.i18n.CompactNumberFormatSymbols_ckb_IR', 'goog.i18n.CompactNumberFormatSymbols_ckb_Latn', 'goog.i18n.CompactNumberFormatSymbols_ckb_Latn_IQ', 'goog.i18n.CompactNumberFormatSymbols_dav', 'goog.i18n.CompactNumberFormatSymbols_dav_KE', 'goog.i18n.CompactNumberFormatSymbols_de_LI', 'goog.i18n.CompactNumberFormatSymbols_dje', 'goog.i18n.CompactNumberFormatSymbols_dje_NE', 'goog.i18n.CompactNumberFormatSymbols_dua', 'goog.i18n.CompactNumberFormatSymbols_dua_CM', 'goog.i18n.CompactNumberFormatSymbols_dyo', 'goog.i18n.CompactNumberFormatSymbols_dyo_SN', 'goog.i18n.CompactNumberFormatSymbols_dz', 'goog.i18n.CompactNumberFormatSymbols_dz_BT', 'goog.i18n.CompactNumberFormatSymbols_ebu', 'goog.i18n.CompactNumberFormatSymbols_ebu_KE', 'goog.i18n.CompactNumberFormatSymbols_ee', 'goog.i18n.CompactNumberFormatSymbols_ee_GH', 'goog.i18n.CompactNumberFormatSymbols_ee_TG', 'goog.i18n.CompactNumberFormatSymbols_el_CY', 'goog.i18n.CompactNumberFormatSymbols_en_150', 'goog.i18n.CompactNumberFormatSymbols_en_AG', 'goog.i18n.CompactNumberFormatSymbols_en_BB', 'goog.i18n.CompactNumberFormatSymbols_en_BE', 'goog.i18n.CompactNumberFormatSymbols_en_BM', 'goog.i18n.CompactNumberFormatSymbols_en_BS', 'goog.i18n.CompactNumberFormatSymbols_en_BW', 'goog.i18n.CompactNumberFormatSymbols_en_BZ', 'goog.i18n.CompactNumberFormatSymbols_en_CA', 'goog.i18n.CompactNumberFormatSymbols_en_CM', 'goog.i18n.CompactNumberFormatSymbols_en_DM', 'goog.i18n.CompactNumberFormatSymbols_en_Dsrt', 'goog.i18n.CompactNumberFormatSymbols_en_FJ', 'goog.i18n.CompactNumberFormatSymbols_en_GD', 'goog.i18n.CompactNumberFormatSymbols_en_GG', 'goog.i18n.CompactNumberFormatSymbols_en_GH', 'goog.i18n.CompactNumberFormatSymbols_en_GI', 'goog.i18n.CompactNumberFormatSymbols_en_GM', 'goog.i18n.CompactNumberFormatSymbols_en_GY', 'goog.i18n.CompactNumberFormatSymbols_en_HK', 'goog.i18n.CompactNumberFormatSymbols_en_IM', 'goog.i18n.CompactNumberFormatSymbols_en_JE', 'goog.i18n.CompactNumberFormatSymbols_en_JM', 'goog.i18n.CompactNumberFormatSymbols_en_KE', 'goog.i18n.CompactNumberFormatSymbols_en_KI', 'goog.i18n.CompactNumberFormatSymbols_en_KN', 'goog.i18n.CompactNumberFormatSymbols_en_KY', 'goog.i18n.CompactNumberFormatSymbols_en_LC', 'goog.i18n.CompactNumberFormatSymbols_en_LR', 'goog.i18n.CompactNumberFormatSymbols_en_LS', 'goog.i18n.CompactNumberFormatSymbols_en_MG', 'goog.i18n.CompactNumberFormatSymbols_en_MT', 'goog.i18n.CompactNumberFormatSymbols_en_MU', 'goog.i18n.CompactNumberFormatSymbols_en_MW', 'goog.i18n.CompactNumberFormatSymbols_en_NA', 'goog.i18n.CompactNumberFormatSymbols_en_NG', 'goog.i18n.CompactNumberFormatSymbols_en_NZ', 'goog.i18n.CompactNumberFormatSymbols_en_PG', 'goog.i18n.CompactNumberFormatSymbols_en_PH', 'goog.i18n.CompactNumberFormatSymbols_en_PK', 'goog.i18n.CompactNumberFormatSymbols_en_SB', 'goog.i18n.CompactNumberFormatSymbols_en_SC', 'goog.i18n.CompactNumberFormatSymbols_en_SL', 'goog.i18n.CompactNumberFormatSymbols_en_SS', 'goog.i18n.CompactNumberFormatSymbols_en_SZ', 'goog.i18n.CompactNumberFormatSymbols_en_TO', 'goog.i18n.CompactNumberFormatSymbols_en_TT', 'goog.i18n.CompactNumberFormatSymbols_en_TZ', 'goog.i18n.CompactNumberFormatSymbols_en_UG', 'goog.i18n.CompactNumberFormatSymbols_en_VC', 'goog.i18n.CompactNumberFormatSymbols_en_VU', 'goog.i18n.CompactNumberFormatSymbols_en_WS', 'goog.i18n.CompactNumberFormatSymbols_en_ZM', 'goog.i18n.CompactNumberFormatSymbols_en_ZW', 'goog.i18n.CompactNumberFormatSymbols_eo', 'goog.i18n.CompactNumberFormatSymbols_es_AR', 'goog.i18n.CompactNumberFormatSymbols_es_BO', 'goog.i18n.CompactNumberFormatSymbols_es_CL', 'goog.i18n.CompactNumberFormatSymbols_es_CO', 'goog.i18n.CompactNumberFormatSymbols_es_CR', 'goog.i18n.CompactNumberFormatSymbols_es_CU', 'goog.i18n.CompactNumberFormatSymbols_es_DO', 'goog.i18n.CompactNumberFormatSymbols_es_EC', 'goog.i18n.CompactNumberFormatSymbols_es_GQ', 'goog.i18n.CompactNumberFormatSymbols_es_GT', 'goog.i18n.CompactNumberFormatSymbols_es_HN', 'goog.i18n.CompactNumberFormatSymbols_es_MX', 'goog.i18n.CompactNumberFormatSymbols_es_NI', 'goog.i18n.CompactNumberFormatSymbols_es_PA', 'goog.i18n.CompactNumberFormatSymbols_es_PE', 'goog.i18n.CompactNumberFormatSymbols_es_PH', 'goog.i18n.CompactNumberFormatSymbols_es_PR', 'goog.i18n.CompactNumberFormatSymbols_es_PY', 'goog.i18n.CompactNumberFormatSymbols_es_SV', 'goog.i18n.CompactNumberFormatSymbols_es_US', 'goog.i18n.CompactNumberFormatSymbols_es_UY', 'goog.i18n.CompactNumberFormatSymbols_es_VE', 'goog.i18n.CompactNumberFormatSymbols_ewo', 'goog.i18n.CompactNumberFormatSymbols_ewo_CM', 'goog.i18n.CompactNumberFormatSymbols_fa_AF', 'goog.i18n.CompactNumberFormatSymbols_ff', 'goog.i18n.CompactNumberFormatSymbols_ff_SN', 'goog.i18n.CompactNumberFormatSymbols_fo', 'goog.i18n.CompactNumberFormatSymbols_fo_FO', 'goog.i18n.CompactNumberFormatSymbols_fr_BE', 'goog.i18n.CompactNumberFormatSymbols_fr_BF', 'goog.i18n.CompactNumberFormatSymbols_fr_BI', 'goog.i18n.CompactNumberFormatSymbols_fr_BJ', 'goog.i18n.CompactNumberFormatSymbols_fr_CD', 'goog.i18n.CompactNumberFormatSymbols_fr_CF', 'goog.i18n.CompactNumberFormatSymbols_fr_CG', 'goog.i18n.CompactNumberFormatSymbols_fr_CH', 'goog.i18n.CompactNumberFormatSymbols_fr_CI', 'goog.i18n.CompactNumberFormatSymbols_fr_CM', 'goog.i18n.CompactNumberFormatSymbols_fr_DJ', 'goog.i18n.CompactNumberFormatSymbols_fr_DZ', 'goog.i18n.CompactNumberFormatSymbols_fr_GA', 'goog.i18n.CompactNumberFormatSymbols_fr_GN', 'goog.i18n.CompactNumberFormatSymbols_fr_GQ', 'goog.i18n.CompactNumberFormatSymbols_fr_HT', 'goog.i18n.CompactNumberFormatSymbols_fr_KM', 'goog.i18n.CompactNumberFormatSymbols_fr_LU', 'goog.i18n.CompactNumberFormatSymbols_fr_MA', 'goog.i18n.CompactNumberFormatSymbols_fr_MG', 'goog.i18n.CompactNumberFormatSymbols_fr_ML', 'goog.i18n.CompactNumberFormatSymbols_fr_MR', 'goog.i18n.CompactNumberFormatSymbols_fr_MU', 'goog.i18n.CompactNumberFormatSymbols_fr_NC', 'goog.i18n.CompactNumberFormatSymbols_fr_NE', 'goog.i18n.CompactNumberFormatSymbols_fr_PF', 'goog.i18n.CompactNumberFormatSymbols_fr_RW', 'goog.i18n.CompactNumberFormatSymbols_fr_SC', 'goog.i18n.CompactNumberFormatSymbols_fr_SN', 'goog.i18n.CompactNumberFormatSymbols_fr_SY', 'goog.i18n.CompactNumberFormatSymbols_fr_TD', 'goog.i18n.CompactNumberFormatSymbols_fr_TG', 'goog.i18n.CompactNumberFormatSymbols_fr_TN', 'goog.i18n.CompactNumberFormatSymbols_fr_VU', 'goog.i18n.CompactNumberFormatSymbols_fur', 'goog.i18n.CompactNumberFormatSymbols_fur_IT', 'goog.i18n.CompactNumberFormatSymbols_ga', 'goog.i18n.CompactNumberFormatSymbols_ga_IE', 'goog.i18n.CompactNumberFormatSymbols_gd', 'goog.i18n.CompactNumberFormatSymbols_gd_GB', 'goog.i18n.CompactNumberFormatSymbols_guz', 'goog.i18n.CompactNumberFormatSymbols_guz_KE', 'goog.i18n.CompactNumberFormatSymbols_gv', 'goog.i18n.CompactNumberFormatSymbols_gv_GB', 'goog.i18n.CompactNumberFormatSymbols_ha', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn_GH', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn_NE', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn_NG', 'goog.i18n.CompactNumberFormatSymbols_hr_BA', 'goog.i18n.CompactNumberFormatSymbols_hy', 'goog.i18n.CompactNumberFormatSymbols_hy_AM', 'goog.i18n.CompactNumberFormatSymbols_ia', 'goog.i18n.CompactNumberFormatSymbols_ia_FR', 'goog.i18n.CompactNumberFormatSymbols_ig', 'goog.i18n.CompactNumberFormatSymbols_ig_NG', 'goog.i18n.CompactNumberFormatSymbols_ii', 'goog.i18n.CompactNumberFormatSymbols_ii_CN', 'goog.i18n.CompactNumberFormatSymbols_it_CH', 'goog.i18n.CompactNumberFormatSymbols_jgo', 'goog.i18n.CompactNumberFormatSymbols_jgo_CM', 'goog.i18n.CompactNumberFormatSymbols_jmc', 'goog.i18n.CompactNumberFormatSymbols_jmc_TZ', 'goog.i18n.CompactNumberFormatSymbols_ka', 'goog.i18n.CompactNumberFormatSymbols_ka_GE', 'goog.i18n.CompactNumberFormatSymbols_kab', 'goog.i18n.CompactNumberFormatSymbols_kab_DZ', 'goog.i18n.CompactNumberFormatSymbols_kam', 'goog.i18n.CompactNumberFormatSymbols_kam_KE', 'goog.i18n.CompactNumberFormatSymbols_kde', 'goog.i18n.CompactNumberFormatSymbols_kde_TZ', 'goog.i18n.CompactNumberFormatSymbols_kea', 'goog.i18n.CompactNumberFormatSymbols_kea_CV', 'goog.i18n.CompactNumberFormatSymbols_khq', 'goog.i18n.CompactNumberFormatSymbols_khq_ML', 'goog.i18n.CompactNumberFormatSymbols_ki', 'goog.i18n.CompactNumberFormatSymbols_ki_KE', 'goog.i18n.CompactNumberFormatSymbols_kk', 'goog.i18n.CompactNumberFormatSymbols_kk_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_kk_Cyrl_KZ', 'goog.i18n.CompactNumberFormatSymbols_kkj', 'goog.i18n.CompactNumberFormatSymbols_kkj_CM', 'goog.i18n.CompactNumberFormatSymbols_kl', 'goog.i18n.CompactNumberFormatSymbols_kl_GL', 'goog.i18n.CompactNumberFormatSymbols_kln', 'goog.i18n.CompactNumberFormatSymbols_kln_KE', 'goog.i18n.CompactNumberFormatSymbols_km', 'goog.i18n.CompactNumberFormatSymbols_km_KH', 'goog.i18n.CompactNumberFormatSymbols_ko_KP', 'goog.i18n.CompactNumberFormatSymbols_kok', 'goog.i18n.CompactNumberFormatSymbols_kok_IN', 'goog.i18n.CompactNumberFormatSymbols_ks', 'goog.i18n.CompactNumberFormatSymbols_ks_Arab', 'goog.i18n.CompactNumberFormatSymbols_ks_Arab_IN', 'goog.i18n.CompactNumberFormatSymbols_ksb', 'goog.i18n.CompactNumberFormatSymbols_ksb_TZ', 'goog.i18n.CompactNumberFormatSymbols_ksf', 'goog.i18n.CompactNumberFormatSymbols_ksf_CM', 'goog.i18n.CompactNumberFormatSymbols_ksh', 'goog.i18n.CompactNumberFormatSymbols_ksh_DE', 'goog.i18n.CompactNumberFormatSymbols_kw', 'goog.i18n.CompactNumberFormatSymbols_kw_GB', 'goog.i18n.CompactNumberFormatSymbols_ky', 'goog.i18n.CompactNumberFormatSymbols_ky_KG', 'goog.i18n.CompactNumberFormatSymbols_lag', 'goog.i18n.CompactNumberFormatSymbols_lag_TZ', 'goog.i18n.CompactNumberFormatSymbols_lg', 'goog.i18n.CompactNumberFormatSymbols_lg_UG', 'goog.i18n.CompactNumberFormatSymbols_ln_AO', 'goog.i18n.CompactNumberFormatSymbols_ln_CF', 'goog.i18n.CompactNumberFormatSymbols_ln_CG', 'goog.i18n.CompactNumberFormatSymbols_lo', 'goog.i18n.CompactNumberFormatSymbols_lo_LA', 'goog.i18n.CompactNumberFormatSymbols_lu', 'goog.i18n.CompactNumberFormatSymbols_lu_CD', 'goog.i18n.CompactNumberFormatSymbols_luo', 'goog.i18n.CompactNumberFormatSymbols_luo_KE', 'goog.i18n.CompactNumberFormatSymbols_luy', 'goog.i18n.CompactNumberFormatSymbols_luy_KE', 'goog.i18n.CompactNumberFormatSymbols_mas', 'goog.i18n.CompactNumberFormatSymbols_mas_KE', 'goog.i18n.CompactNumberFormatSymbols_mas_TZ', 'goog.i18n.CompactNumberFormatSymbols_mer', 'goog.i18n.CompactNumberFormatSymbols_mer_KE', 'goog.i18n.CompactNumberFormatSymbols_mfe', 'goog.i18n.CompactNumberFormatSymbols_mfe_MU', 'goog.i18n.CompactNumberFormatSymbols_mg', 'goog.i18n.CompactNumberFormatSymbols_mg_MG', 'goog.i18n.CompactNumberFormatSymbols_mgh', 'goog.i18n.CompactNumberFormatSymbols_mgh_MZ', 'goog.i18n.CompactNumberFormatSymbols_mgo', 'goog.i18n.CompactNumberFormatSymbols_mgo_CM', 'goog.i18n.CompactNumberFormatSymbols_mk', 'goog.i18n.CompactNumberFormatSymbols_mk_MK', 'goog.i18n.CompactNumberFormatSymbols_mn', 'goog.i18n.CompactNumberFormatSymbols_mn_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_mn_Cyrl_MN', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn_BN', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn_SG', 'goog.i18n.CompactNumberFormatSymbols_mua', 'goog.i18n.CompactNumberFormatSymbols_mua_CM', 'goog.i18n.CompactNumberFormatSymbols_my', 'goog.i18n.CompactNumberFormatSymbols_my_MM', 'goog.i18n.CompactNumberFormatSymbols_naq', 'goog.i18n.CompactNumberFormatSymbols_naq_NA', 'goog.i18n.CompactNumberFormatSymbols_nd', 'goog.i18n.CompactNumberFormatSymbols_nd_ZW', 'goog.i18n.CompactNumberFormatSymbols_ne', 'goog.i18n.CompactNumberFormatSymbols_ne_IN', 'goog.i18n.CompactNumberFormatSymbols_ne_NP', 'goog.i18n.CompactNumberFormatSymbols_nl_AW', 'goog.i18n.CompactNumberFormatSymbols_nl_BE', 'goog.i18n.CompactNumberFormatSymbols_nl_CW', 'goog.i18n.CompactNumberFormatSymbols_nl_SR', 'goog.i18n.CompactNumberFormatSymbols_nl_SX', 'goog.i18n.CompactNumberFormatSymbols_nmg', 'goog.i18n.CompactNumberFormatSymbols_nmg_CM', 'goog.i18n.CompactNumberFormatSymbols_nn', 'goog.i18n.CompactNumberFormatSymbols_nn_NO', 'goog.i18n.CompactNumberFormatSymbols_nnh', 'goog.i18n.CompactNumberFormatSymbols_nnh_CM', 'goog.i18n.CompactNumberFormatSymbols_nr', 'goog.i18n.CompactNumberFormatSymbols_nr_ZA', 'goog.i18n.CompactNumberFormatSymbols_nso', 'goog.i18n.CompactNumberFormatSymbols_nso_ZA', 'goog.i18n.CompactNumberFormatSymbols_nus', 'goog.i18n.CompactNumberFormatSymbols_nus_SD', 'goog.i18n.CompactNumberFormatSymbols_nyn', 'goog.i18n.CompactNumberFormatSymbols_nyn_UG', 'goog.i18n.CompactNumberFormatSymbols_om', 'goog.i18n.CompactNumberFormatSymbols_om_ET', 'goog.i18n.CompactNumberFormatSymbols_om_KE', 'goog.i18n.CompactNumberFormatSymbols_os', 'goog.i18n.CompactNumberFormatSymbols_os_GE', 'goog.i18n.CompactNumberFormatSymbols_os_RU', 'goog.i18n.CompactNumberFormatSymbols_pa', 'goog.i18n.CompactNumberFormatSymbols_pa_Arab', 'goog.i18n.CompactNumberFormatSymbols_pa_Arab_PK', 'goog.i18n.CompactNumberFormatSymbols_pa_Guru', 'goog.i18n.CompactNumberFormatSymbols_pa_Guru_IN', 'goog.i18n.CompactNumberFormatSymbols_ps', 'goog.i18n.CompactNumberFormatSymbols_ps_AF', 'goog.i18n.CompactNumberFormatSymbols_pt_AO', 'goog.i18n.CompactNumberFormatSymbols_pt_CV', 'goog.i18n.CompactNumberFormatSymbols_pt_GW', 'goog.i18n.CompactNumberFormatSymbols_pt_MO', 'goog.i18n.CompactNumberFormatSymbols_pt_MZ', 'goog.i18n.CompactNumberFormatSymbols_pt_ST', 'goog.i18n.CompactNumberFormatSymbols_pt_TL', 'goog.i18n.CompactNumberFormatSymbols_rm', 'goog.i18n.CompactNumberFormatSymbols_rm_CH', 'goog.i18n.CompactNumberFormatSymbols_rn', 'goog.i18n.CompactNumberFormatSymbols_rn_BI', 'goog.i18n.CompactNumberFormatSymbols_ro_MD', 'goog.i18n.CompactNumberFormatSymbols_rof', 'goog.i18n.CompactNumberFormatSymbols_rof_TZ', 'goog.i18n.CompactNumberFormatSymbols_ru_BY', 'goog.i18n.CompactNumberFormatSymbols_ru_KG', 'goog.i18n.CompactNumberFormatSymbols_ru_KZ', 'goog.i18n.CompactNumberFormatSymbols_ru_MD', 'goog.i18n.CompactNumberFormatSymbols_ru_UA', 'goog.i18n.CompactNumberFormatSymbols_rw', 'goog.i18n.CompactNumberFormatSymbols_rw_RW', 'goog.i18n.CompactNumberFormatSymbols_rwk', 'goog.i18n.CompactNumberFormatSymbols_rwk_TZ', 'goog.i18n.CompactNumberFormatSymbols_sah', 'goog.i18n.CompactNumberFormatSymbols_sah_RU', 'goog.i18n.CompactNumberFormatSymbols_saq', 'goog.i18n.CompactNumberFormatSymbols_saq_KE', 'goog.i18n.CompactNumberFormatSymbols_sbp', 'goog.i18n.CompactNumberFormatSymbols_sbp_TZ', 'goog.i18n.CompactNumberFormatSymbols_se', 'goog.i18n.CompactNumberFormatSymbols_se_FI', 'goog.i18n.CompactNumberFormatSymbols_se_NO', 'goog.i18n.CompactNumberFormatSymbols_seh', 'goog.i18n.CompactNumberFormatSymbols_seh_MZ', 'goog.i18n.CompactNumberFormatSymbols_ses', 'goog.i18n.CompactNumberFormatSymbols_ses_ML', 'goog.i18n.CompactNumberFormatSymbols_sg', 'goog.i18n.CompactNumberFormatSymbols_sg_CF', 'goog.i18n.CompactNumberFormatSymbols_shi', 'goog.i18n.CompactNumberFormatSymbols_shi_Latn', 'goog.i18n.CompactNumberFormatSymbols_shi_Latn_MA', 'goog.i18n.CompactNumberFormatSymbols_shi_Tfng', 'goog.i18n.CompactNumberFormatSymbols_shi_Tfng_MA', 'goog.i18n.CompactNumberFormatSymbols_si', 'goog.i18n.CompactNumberFormatSymbols_si_LK', 'goog.i18n.CompactNumberFormatSymbols_sn', 'goog.i18n.CompactNumberFormatSymbols_sn_ZW', 'goog.i18n.CompactNumberFormatSymbols_so', 'goog.i18n.CompactNumberFormatSymbols_so_DJ', 'goog.i18n.CompactNumberFormatSymbols_so_ET', 'goog.i18n.CompactNumberFormatSymbols_so_KE', 'goog.i18n.CompactNumberFormatSymbols_so_SO', 'goog.i18n.CompactNumberFormatSymbols_sq_MK', 'goog.i18n.CompactNumberFormatSymbols_sq_XK', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_BA', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_ME', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_XK', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_BA', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_ME', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_RS', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_XK', 'goog.i18n.CompactNumberFormatSymbols_ss', 'goog.i18n.CompactNumberFormatSymbols_ss_SZ', 'goog.i18n.CompactNumberFormatSymbols_ss_ZA', 'goog.i18n.CompactNumberFormatSymbols_ssy', 'goog.i18n.CompactNumberFormatSymbols_ssy_ER', 'goog.i18n.CompactNumberFormatSymbols_st', 'goog.i18n.CompactNumberFormatSymbols_st_LS', 'goog.i18n.CompactNumberFormatSymbols_st_ZA', 'goog.i18n.CompactNumberFormatSymbols_sv_AX', 'goog.i18n.CompactNumberFormatSymbols_sv_FI', 'goog.i18n.CompactNumberFormatSymbols_sw_KE', 'goog.i18n.CompactNumberFormatSymbols_sw_UG', 'goog.i18n.CompactNumberFormatSymbols_swc', 'goog.i18n.CompactNumberFormatSymbols_swc_CD', 'goog.i18n.CompactNumberFormatSymbols_ta_LK', 'goog.i18n.CompactNumberFormatSymbols_ta_MY', 'goog.i18n.CompactNumberFormatSymbols_ta_SG', 'goog.i18n.CompactNumberFormatSymbols_teo', 'goog.i18n.CompactNumberFormatSymbols_teo_KE', 'goog.i18n.CompactNumberFormatSymbols_teo_UG', 'goog.i18n.CompactNumberFormatSymbols_tg', 'goog.i18n.CompactNumberFormatSymbols_tg_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_tg_Cyrl_TJ', 'goog.i18n.CompactNumberFormatSymbols_ti', 'goog.i18n.CompactNumberFormatSymbols_ti_ER', 'goog.i18n.CompactNumberFormatSymbols_ti_ET', 'goog.i18n.CompactNumberFormatSymbols_tig', 'goog.i18n.CompactNumberFormatSymbols_tig_ER', 'goog.i18n.CompactNumberFormatSymbols_tn', 'goog.i18n.CompactNumberFormatSymbols_tn_BW', 'goog.i18n.CompactNumberFormatSymbols_tn_ZA', 'goog.i18n.CompactNumberFormatSymbols_to', 'goog.i18n.CompactNumberFormatSymbols_to_TO', 'goog.i18n.CompactNumberFormatSymbols_tr_CY', 'goog.i18n.CompactNumberFormatSymbols_ts', 'goog.i18n.CompactNumberFormatSymbols_ts_ZA', 'goog.i18n.CompactNumberFormatSymbols_twq', 'goog.i18n.CompactNumberFormatSymbols_twq_NE', 'goog.i18n.CompactNumberFormatSymbols_tzm', 'goog.i18n.CompactNumberFormatSymbols_tzm_Latn', 'goog.i18n.CompactNumberFormatSymbols_tzm_Latn_MA', 'goog.i18n.CompactNumberFormatSymbols_ur_IN', 'goog.i18n.CompactNumberFormatSymbols_uz', 'goog.i18n.CompactNumberFormatSymbols_uz_Arab', 'goog.i18n.CompactNumberFormatSymbols_uz_Arab_AF', 'goog.i18n.CompactNumberFormatSymbols_uz_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_uz_Cyrl_UZ', 'goog.i18n.CompactNumberFormatSymbols_uz_Latn', 'goog.i18n.CompactNumberFormatSymbols_uz_Latn_UZ', 'goog.i18n.CompactNumberFormatSymbols_vai', 'goog.i18n.CompactNumberFormatSymbols_vai_Latn', 'goog.i18n.CompactNumberFormatSymbols_vai_Latn_LR', 'goog.i18n.CompactNumberFormatSymbols_vai_Vaii', 'goog.i18n.CompactNumberFormatSymbols_vai_Vaii_LR', 'goog.i18n.CompactNumberFormatSymbols_ve', 'goog.i18n.CompactNumberFormatSymbols_ve_ZA', 'goog.i18n.CompactNumberFormatSymbols_vo', 'goog.i18n.CompactNumberFormatSymbols_vun', 'goog.i18n.CompactNumberFormatSymbols_vun_TZ', 'goog.i18n.CompactNumberFormatSymbols_wae', 'goog.i18n.CompactNumberFormatSymbols_wae_CH', 'goog.i18n.CompactNumberFormatSymbols_wal', 'goog.i18n.CompactNumberFormatSymbols_wal_ET', 'goog.i18n.CompactNumberFormatSymbols_xh', 'goog.i18n.CompactNumberFormatSymbols_xh_ZA', 'goog.i18n.CompactNumberFormatSymbols_xog', 'goog.i18n.CompactNumberFormatSymbols_xog_UG', 'goog.i18n.CompactNumberFormatSymbols_yav', 'goog.i18n.CompactNumberFormatSymbols_yav_CM', 'goog.i18n.CompactNumberFormatSymbols_yo', 'goog.i18n.CompactNumberFormatSymbols_yo_NG', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_HK', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_MO', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_SG', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant_HK', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant_MO', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant_TW'], []);
goog.addDependency('i18n/currency.js', ['goog.i18n.currency', 'goog.i18n.currency.CurrencyInfo', 'goog.i18n.currency.CurrencyInfoTier2'], []);
goog.addDependency('i18n/currencycodemap.js', ['goog.i18n.currencyCodeMap', 'goog.i18n.currencyCodeMapTier2'], []);
goog.addDependency('i18n/datetimeformat.js', ['goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeFormat.Format'], ['goog.asserts', 'goog.i18n.DateTimeSymbols', 'goog.i18n.TimeZone', 'goog.string']);
goog.addDependency('i18n/datetimeparse.js', ['goog.i18n.DateTimeParse'], ['goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeSymbols']);
goog.addDependency('i18n/datetimepatterns.js', ['goog.i18n.DateTimePatterns', 'goog.i18n.DateTimePatterns_af', 'goog.i18n.DateTimePatterns_am', 'goog.i18n.DateTimePatterns_ar', 'goog.i18n.DateTimePatterns_bg', 'goog.i18n.DateTimePatterns_bn', 'goog.i18n.DateTimePatterns_br', 'goog.i18n.DateTimePatterns_ca', 'goog.i18n.DateTimePatterns_chr', 'goog.i18n.DateTimePatterns_cs', 'goog.i18n.DateTimePatterns_cy', 'goog.i18n.DateTimePatterns_da', 'goog.i18n.DateTimePatterns_de', 'goog.i18n.DateTimePatterns_de_AT', 'goog.i18n.DateTimePatterns_de_CH', 'goog.i18n.DateTimePatterns_el', 'goog.i18n.DateTimePatterns_en', 'goog.i18n.DateTimePatterns_en_AU', 'goog.i18n.DateTimePatterns_en_GB', 'goog.i18n.DateTimePatterns_en_IE', 'goog.i18n.DateTimePatterns_en_IN', 'goog.i18n.DateTimePatterns_en_SG', 'goog.i18n.DateTimePatterns_en_US', 'goog.i18n.DateTimePatterns_en_ZA', 'goog.i18n.DateTimePatterns_es', 'goog.i18n.DateTimePatterns_es_419', 'goog.i18n.DateTimePatterns_es_ES', 'goog.i18n.DateTimePatterns_et', 'goog.i18n.DateTimePatterns_eu', 'goog.i18n.DateTimePatterns_fa', 'goog.i18n.DateTimePatterns_fi', 'goog.i18n.DateTimePatterns_fil', 'goog.i18n.DateTimePatterns_fr', 'goog.i18n.DateTimePatterns_fr_CA', 'goog.i18n.DateTimePatterns_gl', 'goog.i18n.DateTimePatterns_gsw', 'goog.i18n.DateTimePatterns_gu', 'goog.i18n.DateTimePatterns_haw', 'goog.i18n.DateTimePatterns_he', 'goog.i18n.DateTimePatterns_hi', 'goog.i18n.DateTimePatterns_hr', 'goog.i18n.DateTimePatterns_hu', 'goog.i18n.DateTimePatterns_id', 'goog.i18n.DateTimePatterns_in', 'goog.i18n.DateTimePatterns_is', 'goog.i18n.DateTimePatterns_it', 'goog.i18n.DateTimePatterns_iw', 'goog.i18n.DateTimePatterns_ja', 'goog.i18n.DateTimePatterns_kn', 'goog.i18n.DateTimePatterns_ko', 'goog.i18n.DateTimePatterns_ln', 'goog.i18n.DateTimePatterns_lt', 'goog.i18n.DateTimePatterns_lv', 'goog.i18n.DateTimePatterns_ml', 'goog.i18n.DateTimePatterns_mo', 'goog.i18n.DateTimePatterns_mr', 'goog.i18n.DateTimePatterns_ms', 'goog.i18n.DateTimePatterns_mt', 'goog.i18n.DateTimePatterns_nb', 'goog.i18n.DateTimePatterns_nl', 'goog.i18n.DateTimePatterns_no', 'goog.i18n.DateTimePatterns_or', 'goog.i18n.DateTimePatterns_pl', 'goog.i18n.DateTimePatterns_pt', 'goog.i18n.DateTimePatterns_pt_BR', 'goog.i18n.DateTimePatterns_pt_PT', 'goog.i18n.DateTimePatterns_ro', 'goog.i18n.DateTimePatterns_ru', 'goog.i18n.DateTimePatterns_sk', 'goog.i18n.DateTimePatterns_sl', 'goog.i18n.DateTimePatterns_sq', 'goog.i18n.DateTimePatterns_sr', 'goog.i18n.DateTimePatterns_sv', 'goog.i18n.DateTimePatterns_sw', 'goog.i18n.DateTimePatterns_ta', 'goog.i18n.DateTimePatterns_te', 'goog.i18n.DateTimePatterns_th', 'goog.i18n.DateTimePatterns_tl', 'goog.i18n.DateTimePatterns_tr', 'goog.i18n.DateTimePatterns_uk', 'goog.i18n.DateTimePatterns_ur', 'goog.i18n.DateTimePatterns_vi', 'goog.i18n.DateTimePatterns_zh', 'goog.i18n.DateTimePatterns_zh_CN', 'goog.i18n.DateTimePatterns_zh_HK', 'goog.i18n.DateTimePatterns_zh_TW', 'goog.i18n.DateTimePatterns_zu'], []);
goog.addDependency('i18n/datetimepatternsext.js', ['goog.i18n.DateTimePatternsExt', 'goog.i18n.DateTimePatterns_af_NA', 'goog.i18n.DateTimePatterns_af_ZA', 'goog.i18n.DateTimePatterns_agq', 'goog.i18n.DateTimePatterns_agq_CM', 'goog.i18n.DateTimePatterns_ak', 'goog.i18n.DateTimePatterns_ak_GH', 'goog.i18n.DateTimePatterns_am_ET', 'goog.i18n.DateTimePatterns_ar_001', 'goog.i18n.DateTimePatterns_ar_AE', 'goog.i18n.DateTimePatterns_ar_BH', 'goog.i18n.DateTimePatterns_ar_DJ', 'goog.i18n.DateTimePatterns_ar_DZ', 'goog.i18n.DateTimePatterns_ar_EG', 'goog.i18n.DateTimePatterns_ar_EH', 'goog.i18n.DateTimePatterns_ar_ER', 'goog.i18n.DateTimePatterns_ar_IL', 'goog.i18n.DateTimePatterns_ar_IQ', 'goog.i18n.DateTimePatterns_ar_JO', 'goog.i18n.DateTimePatterns_ar_KM', 'goog.i18n.DateTimePatterns_ar_KW', 'goog.i18n.DateTimePatterns_ar_LB', 'goog.i18n.DateTimePatterns_ar_LY', 'goog.i18n.DateTimePatterns_ar_MA', 'goog.i18n.DateTimePatterns_ar_MR', 'goog.i18n.DateTimePatterns_ar_OM', 'goog.i18n.DateTimePatterns_ar_PS', 'goog.i18n.DateTimePatterns_ar_QA', 'goog.i18n.DateTimePatterns_ar_SA', 'goog.i18n.DateTimePatterns_ar_SD', 'goog.i18n.DateTimePatterns_ar_SO', 'goog.i18n.DateTimePatterns_ar_SY', 'goog.i18n.DateTimePatterns_ar_TD', 'goog.i18n.DateTimePatterns_ar_TN', 'goog.i18n.DateTimePatterns_ar_YE', 'goog.i18n.DateTimePatterns_as', 'goog.i18n.DateTimePatterns_as_IN', 'goog.i18n.DateTimePatterns_asa', 'goog.i18n.DateTimePatterns_asa_TZ', 'goog.i18n.DateTimePatterns_az', 'goog.i18n.DateTimePatterns_az_Cyrl', 'goog.i18n.DateTimePatterns_az_Cyrl_AZ', 'goog.i18n.DateTimePatterns_az_Latn', 'goog.i18n.DateTimePatterns_az_Latn_AZ', 'goog.i18n.DateTimePatterns_bas', 'goog.i18n.DateTimePatterns_bas_CM', 'goog.i18n.DateTimePatterns_be', 'goog.i18n.DateTimePatterns_be_BY', 'goog.i18n.DateTimePatterns_bem', 'goog.i18n.DateTimePatterns_bem_ZM', 'goog.i18n.DateTimePatterns_bez', 'goog.i18n.DateTimePatterns_bez_TZ', 'goog.i18n.DateTimePatterns_bg_BG', 'goog.i18n.DateTimePatterns_bm', 'goog.i18n.DateTimePatterns_bm_ML', 'goog.i18n.DateTimePatterns_bn_BD', 'goog.i18n.DateTimePatterns_bn_IN', 'goog.i18n.DateTimePatterns_bo', 'goog.i18n.DateTimePatterns_bo_CN', 'goog.i18n.DateTimePatterns_bo_IN', 'goog.i18n.DateTimePatterns_br_FR', 'goog.i18n.DateTimePatterns_brx', 'goog.i18n.DateTimePatterns_brx_IN', 'goog.i18n.DateTimePatterns_bs', 'goog.i18n.DateTimePatterns_bs_Cyrl', 'goog.i18n.DateTimePatterns_bs_Cyrl_BA', 'goog.i18n.DateTimePatterns_bs_Latn', 'goog.i18n.DateTimePatterns_bs_Latn_BA', 'goog.i18n.DateTimePatterns_ca_AD', 'goog.i18n.DateTimePatterns_ca_ES', 'goog.i18n.DateTimePatterns_cgg', 'goog.i18n.DateTimePatterns_cgg_UG', 'goog.i18n.DateTimePatterns_chr_US', 'goog.i18n.DateTimePatterns_cs_CZ', 'goog.i18n.DateTimePatterns_cy_GB', 'goog.i18n.DateTimePatterns_da_DK', 'goog.i18n.DateTimePatterns_dav', 'goog.i18n.DateTimePatterns_dav_KE', 'goog.i18n.DateTimePatterns_de_BE', 'goog.i18n.DateTimePatterns_de_DE', 'goog.i18n.DateTimePatterns_de_LI', 'goog.i18n.DateTimePatterns_de_LU', 'goog.i18n.DateTimePatterns_dje', 'goog.i18n.DateTimePatterns_dje_NE', 'goog.i18n.DateTimePatterns_dua', 'goog.i18n.DateTimePatterns_dua_CM', 'goog.i18n.DateTimePatterns_dyo', 'goog.i18n.DateTimePatterns_dyo_SN', 'goog.i18n.DateTimePatterns_dz', 'goog.i18n.DateTimePatterns_dz_BT', 'goog.i18n.DateTimePatterns_ebu', 'goog.i18n.DateTimePatterns_ebu_KE', 'goog.i18n.DateTimePatterns_ee', 'goog.i18n.DateTimePatterns_ee_GH', 'goog.i18n.DateTimePatterns_ee_TG', 'goog.i18n.DateTimePatterns_el_CY', 'goog.i18n.DateTimePatterns_el_GR', 'goog.i18n.DateTimePatterns_en_150', 'goog.i18n.DateTimePatterns_en_AG', 'goog.i18n.DateTimePatterns_en_AS', 'goog.i18n.DateTimePatterns_en_BB', 'goog.i18n.DateTimePatterns_en_BE', 'goog.i18n.DateTimePatterns_en_BM', 'goog.i18n.DateTimePatterns_en_BS', 'goog.i18n.DateTimePatterns_en_BW', 'goog.i18n.DateTimePatterns_en_BZ', 'goog.i18n.DateTimePatterns_en_CA', 'goog.i18n.DateTimePatterns_en_CM', 'goog.i18n.DateTimePatterns_en_DM', 'goog.i18n.DateTimePatterns_en_FJ', 'goog.i18n.DateTimePatterns_en_FM', 'goog.i18n.DateTimePatterns_en_GD', 'goog.i18n.DateTimePatterns_en_GG', 'goog.i18n.DateTimePatterns_en_GH', 'goog.i18n.DateTimePatterns_en_GI', 'goog.i18n.DateTimePatterns_en_GM', 'goog.i18n.DateTimePatterns_en_GU', 'goog.i18n.DateTimePatterns_en_GY', 'goog.i18n.DateTimePatterns_en_HK', 'goog.i18n.DateTimePatterns_en_IM', 'goog.i18n.DateTimePatterns_en_JE', 'goog.i18n.DateTimePatterns_en_JM', 'goog.i18n.DateTimePatterns_en_KE', 'goog.i18n.DateTimePatterns_en_KI', 'goog.i18n.DateTimePatterns_en_KN', 'goog.i18n.DateTimePatterns_en_KY', 'goog.i18n.DateTimePatterns_en_LC', 'goog.i18n.DateTimePatterns_en_LR', 'goog.i18n.DateTimePatterns_en_LS', 'goog.i18n.DateTimePatterns_en_MG', 'goog.i18n.DateTimePatterns_en_MH', 'goog.i18n.DateTimePatterns_en_MP', 'goog.i18n.DateTimePatterns_en_MT', 'goog.i18n.DateTimePatterns_en_MU', 'goog.i18n.DateTimePatterns_en_MW', 'goog.i18n.DateTimePatterns_en_NA', 'goog.i18n.DateTimePatterns_en_NG', 'goog.i18n.DateTimePatterns_en_NZ', 'goog.i18n.DateTimePatterns_en_PG', 'goog.i18n.DateTimePatterns_en_PH', 'goog.i18n.DateTimePatterns_en_PK', 'goog.i18n.DateTimePatterns_en_PR', 'goog.i18n.DateTimePatterns_en_PW', 'goog.i18n.DateTimePatterns_en_SB', 'goog.i18n.DateTimePatterns_en_SC', 'goog.i18n.DateTimePatterns_en_SL', 'goog.i18n.DateTimePatterns_en_SS', 'goog.i18n.DateTimePatterns_en_SZ', 'goog.i18n.DateTimePatterns_en_TC', 'goog.i18n.DateTimePatterns_en_TO', 'goog.i18n.DateTimePatterns_en_TT', 'goog.i18n.DateTimePatterns_en_TZ', 'goog.i18n.DateTimePatterns_en_UG', 'goog.i18n.DateTimePatterns_en_UM', 'goog.i18n.DateTimePatterns_en_US_POSIX', 'goog.i18n.DateTimePatterns_en_VC', 'goog.i18n.DateTimePatterns_en_VG', 'goog.i18n.DateTimePatterns_en_VI', 'goog.i18n.DateTimePatterns_en_VU', 'goog.i18n.DateTimePatterns_en_WS', 'goog.i18n.DateTimePatterns_en_ZM', 'goog.i18n.DateTimePatterns_en_ZW', 'goog.i18n.DateTimePatterns_eo', 'goog.i18n.DateTimePatterns_es_AR', 'goog.i18n.DateTimePatterns_es_BO', 'goog.i18n.DateTimePatterns_es_CL', 'goog.i18n.DateTimePatterns_es_CO', 'goog.i18n.DateTimePatterns_es_CR', 'goog.i18n.DateTimePatterns_es_CU', 'goog.i18n.DateTimePatterns_es_DO', 'goog.i18n.DateTimePatterns_es_EA', 'goog.i18n.DateTimePatterns_es_EC', 'goog.i18n.DateTimePatterns_es_GQ', 'goog.i18n.DateTimePatterns_es_GT', 'goog.i18n.DateTimePatterns_es_HN', 'goog.i18n.DateTimePatterns_es_IC', 'goog.i18n.DateTimePatterns_es_MX', 'goog.i18n.DateTimePatterns_es_NI', 'goog.i18n.DateTimePatterns_es_PA', 'goog.i18n.DateTimePatterns_es_PE', 'goog.i18n.DateTimePatterns_es_PH', 'goog.i18n.DateTimePatterns_es_PR', 'goog.i18n.DateTimePatterns_es_PY', 'goog.i18n.DateTimePatterns_es_SV', 'goog.i18n.DateTimePatterns_es_US', 'goog.i18n.DateTimePatterns_es_UY', 'goog.i18n.DateTimePatterns_es_VE', 'goog.i18n.DateTimePatterns_et_EE', 'goog.i18n.DateTimePatterns_eu_ES', 'goog.i18n.DateTimePatterns_ewo', 'goog.i18n.DateTimePatterns_ewo_CM', 'goog.i18n.DateTimePatterns_fa_AF', 'goog.i18n.DateTimePatterns_fa_IR', 'goog.i18n.DateTimePatterns_ff', 'goog.i18n.DateTimePatterns_ff_SN', 'goog.i18n.DateTimePatterns_fi_FI', 'goog.i18n.DateTimePatterns_fil_PH', 'goog.i18n.DateTimePatterns_fo', 'goog.i18n.DateTimePatterns_fo_FO', 'goog.i18n.DateTimePatterns_fr_BE', 'goog.i18n.DateTimePatterns_fr_BF', 'goog.i18n.DateTimePatterns_fr_BI', 'goog.i18n.DateTimePatterns_fr_BJ', 'goog.i18n.DateTimePatterns_fr_BL', 'goog.i18n.DateTimePatterns_fr_CD', 'goog.i18n.DateTimePatterns_fr_CF', 'goog.i18n.DateTimePatterns_fr_CG', 'goog.i18n.DateTimePatterns_fr_CH', 'goog.i18n.DateTimePatterns_fr_CI', 'goog.i18n.DateTimePatterns_fr_CM', 'goog.i18n.DateTimePatterns_fr_DJ', 'goog.i18n.DateTimePatterns_fr_DZ', 'goog.i18n.DateTimePatterns_fr_FR', 'goog.i18n.DateTimePatterns_fr_GA', 'goog.i18n.DateTimePatterns_fr_GF', 'goog.i18n.DateTimePatterns_fr_GN', 'goog.i18n.DateTimePatterns_fr_GP', 'goog.i18n.DateTimePatterns_fr_GQ', 'goog.i18n.DateTimePatterns_fr_HT', 'goog.i18n.DateTimePatterns_fr_KM', 'goog.i18n.DateTimePatterns_fr_LU', 'goog.i18n.DateTimePatterns_fr_MA', 'goog.i18n.DateTimePatterns_fr_MC', 'goog.i18n.DateTimePatterns_fr_MF', 'goog.i18n.DateTimePatterns_fr_MG', 'goog.i18n.DateTimePatterns_fr_ML', 'goog.i18n.DateTimePatterns_fr_MQ', 'goog.i18n.DateTimePatterns_fr_MR', 'goog.i18n.DateTimePatterns_fr_MU', 'goog.i18n.DateTimePatterns_fr_NC', 'goog.i18n.DateTimePatterns_fr_NE', 'goog.i18n.DateTimePatterns_fr_PF', 'goog.i18n.DateTimePatterns_fr_RE', 'goog.i18n.DateTimePatterns_fr_RW', 'goog.i18n.DateTimePatterns_fr_SC', 'goog.i18n.DateTimePatterns_fr_SN', 'goog.i18n.DateTimePatterns_fr_SY', 'goog.i18n.DateTimePatterns_fr_TD', 'goog.i18n.DateTimePatterns_fr_TG', 'goog.i18n.DateTimePatterns_fr_TN', 'goog.i18n.DateTimePatterns_fr_VU', 'goog.i18n.DateTimePatterns_fr_YT', 'goog.i18n.DateTimePatterns_ga', 'goog.i18n.DateTimePatterns_ga_IE', 'goog.i18n.DateTimePatterns_gl_ES', 'goog.i18n.DateTimePatterns_gsw_CH', 'goog.i18n.DateTimePatterns_gu_IN', 'goog.i18n.DateTimePatterns_guz', 'goog.i18n.DateTimePatterns_guz_KE', 'goog.i18n.DateTimePatterns_gv', 'goog.i18n.DateTimePatterns_gv_GB', 'goog.i18n.DateTimePatterns_ha', 'goog.i18n.DateTimePatterns_ha_Latn', 'goog.i18n.DateTimePatterns_ha_Latn_GH', 'goog.i18n.DateTimePatterns_ha_Latn_NE', 'goog.i18n.DateTimePatterns_ha_Latn_NG', 'goog.i18n.DateTimePatterns_haw_US', 'goog.i18n.DateTimePatterns_he_IL', 'goog.i18n.DateTimePatterns_hi_IN', 'goog.i18n.DateTimePatterns_hr_BA', 'goog.i18n.DateTimePatterns_hr_HR', 'goog.i18n.DateTimePatterns_hu_HU', 'goog.i18n.DateTimePatterns_hy', 'goog.i18n.DateTimePatterns_hy_AM', 'goog.i18n.DateTimePatterns_id_ID', 'goog.i18n.DateTimePatterns_ig', 'goog.i18n.DateTimePatterns_ig_NG', 'goog.i18n.DateTimePatterns_ii', 'goog.i18n.DateTimePatterns_ii_CN', 'goog.i18n.DateTimePatterns_is_IS', 'goog.i18n.DateTimePatterns_it_CH', 'goog.i18n.DateTimePatterns_it_IT', 'goog.i18n.DateTimePatterns_it_SM', 'goog.i18n.DateTimePatterns_ja_JP', 'goog.i18n.DateTimePatterns_jgo', 'goog.i18n.DateTimePatterns_jgo_CM', 'goog.i18n.DateTimePatterns_jmc', 'goog.i18n.DateTimePatterns_jmc_TZ', 'goog.i18n.DateTimePatterns_ka', 'goog.i18n.DateTimePatterns_ka_GE', 'goog.i18n.DateTimePatterns_kab', 'goog.i18n.DateTimePatterns_kab_DZ', 'goog.i18n.DateTimePatterns_kam', 'goog.i18n.DateTimePatterns_kam_KE', 'goog.i18n.DateTimePatterns_kde', 'goog.i18n.DateTimePatterns_kde_TZ', 'goog.i18n.DateTimePatterns_kea', 'goog.i18n.DateTimePatterns_kea_CV', 'goog.i18n.DateTimePatterns_khq', 'goog.i18n.DateTimePatterns_khq_ML', 'goog.i18n.DateTimePatterns_ki', 'goog.i18n.DateTimePatterns_ki_KE', 'goog.i18n.DateTimePatterns_kk', 'goog.i18n.DateTimePatterns_kk_Cyrl', 'goog.i18n.DateTimePatterns_kk_Cyrl_KZ', 'goog.i18n.DateTimePatterns_kl', 'goog.i18n.DateTimePatterns_kl_GL', 'goog.i18n.DateTimePatterns_kln', 'goog.i18n.DateTimePatterns_kln_KE', 'goog.i18n.DateTimePatterns_km', 'goog.i18n.DateTimePatterns_km_KH', 'goog.i18n.DateTimePatterns_kn_IN', 'goog.i18n.DateTimePatterns_ko_KP', 'goog.i18n.DateTimePatterns_ko_KR', 'goog.i18n.DateTimePatterns_kok', 'goog.i18n.DateTimePatterns_kok_IN', 'goog.i18n.DateTimePatterns_ks', 'goog.i18n.DateTimePatterns_ks_Arab', 'goog.i18n.DateTimePatterns_ks_Arab_IN', 'goog.i18n.DateTimePatterns_ksb', 'goog.i18n.DateTimePatterns_ksb_TZ', 'goog.i18n.DateTimePatterns_ksf', 'goog.i18n.DateTimePatterns_ksf_CM', 'goog.i18n.DateTimePatterns_kw', 'goog.i18n.DateTimePatterns_kw_GB', 'goog.i18n.DateTimePatterns_lag', 'goog.i18n.DateTimePatterns_lag_TZ', 'goog.i18n.DateTimePatterns_lg', 'goog.i18n.DateTimePatterns_lg_UG', 'goog.i18n.DateTimePatterns_ln_AO', 'goog.i18n.DateTimePatterns_ln_CD', 'goog.i18n.DateTimePatterns_ln_CF', 'goog.i18n.DateTimePatterns_ln_CG', 'goog.i18n.DateTimePatterns_lo', 'goog.i18n.DateTimePatterns_lo_LA', 'goog.i18n.DateTimePatterns_lt_LT', 'goog.i18n.DateTimePatterns_lu', 'goog.i18n.DateTimePatterns_lu_CD', 'goog.i18n.DateTimePatterns_luo', 'goog.i18n.DateTimePatterns_luo_KE', 'goog.i18n.DateTimePatterns_luy', 'goog.i18n.DateTimePatterns_luy_KE', 'goog.i18n.DateTimePatterns_lv_LV', 'goog.i18n.DateTimePatterns_mas', 'goog.i18n.DateTimePatterns_mas_KE', 'goog.i18n.DateTimePatterns_mas_TZ', 'goog.i18n.DateTimePatterns_mer', 'goog.i18n.DateTimePatterns_mer_KE', 'goog.i18n.DateTimePatterns_mfe', 'goog.i18n.DateTimePatterns_mfe_MU', 'goog.i18n.DateTimePatterns_mg', 'goog.i18n.DateTimePatterns_mg_MG', 'goog.i18n.DateTimePatterns_mgh', 'goog.i18n.DateTimePatterns_mgh_MZ', 'goog.i18n.DateTimePatterns_mgo', 'goog.i18n.DateTimePatterns_mgo_CM', 'goog.i18n.DateTimePatterns_mk', 'goog.i18n.DateTimePatterns_mk_MK', 'goog.i18n.DateTimePatterns_ml_IN', 'goog.i18n.DateTimePatterns_mn', 'goog.i18n.DateTimePatterns_mn_Cyrl', 'goog.i18n.DateTimePatterns_mn_Cyrl_MN', 'goog.i18n.DateTimePatterns_mr_IN', 'goog.i18n.DateTimePatterns_ms_Latn', 'goog.i18n.DateTimePatterns_ms_Latn_BN', 'goog.i18n.DateTimePatterns_ms_Latn_MY', 'goog.i18n.DateTimePatterns_ms_Latn_SG', 'goog.i18n.DateTimePatterns_mt_MT', 'goog.i18n.DateTimePatterns_mua', 'goog.i18n.DateTimePatterns_mua_CM', 'goog.i18n.DateTimePatterns_my', 'goog.i18n.DateTimePatterns_my_MM', 'goog.i18n.DateTimePatterns_naq', 'goog.i18n.DateTimePatterns_naq_NA', 'goog.i18n.DateTimePatterns_nb_NO', 'goog.i18n.DateTimePatterns_nd', 'goog.i18n.DateTimePatterns_nd_ZW', 'goog.i18n.DateTimePatterns_ne', 'goog.i18n.DateTimePatterns_ne_IN', 'goog.i18n.DateTimePatterns_ne_NP', 'goog.i18n.DateTimePatterns_nl_AW', 'goog.i18n.DateTimePatterns_nl_BE', 'goog.i18n.DateTimePatterns_nl_CW', 'goog.i18n.DateTimePatterns_nl_NL', 'goog.i18n.DateTimePatterns_nl_SR', 'goog.i18n.DateTimePatterns_nl_SX', 'goog.i18n.DateTimePatterns_nmg', 'goog.i18n.DateTimePatterns_nmg_CM', 'goog.i18n.DateTimePatterns_nn', 'goog.i18n.DateTimePatterns_nn_NO', 'goog.i18n.DateTimePatterns_nus', 'goog.i18n.DateTimePatterns_nus_SD', 'goog.i18n.DateTimePatterns_nyn', 'goog.i18n.DateTimePatterns_nyn_UG', 'goog.i18n.DateTimePatterns_om', 'goog.i18n.DateTimePatterns_om_ET', 'goog.i18n.DateTimePatterns_om_KE', 'goog.i18n.DateTimePatterns_or_IN', 'goog.i18n.DateTimePatterns_pa', 'goog.i18n.DateTimePatterns_pa_Arab', 'goog.i18n.DateTimePatterns_pa_Arab_PK', 'goog.i18n.DateTimePatterns_pa_Guru', 'goog.i18n.DateTimePatterns_pa_Guru_IN', 'goog.i18n.DateTimePatterns_pl_PL', 'goog.i18n.DateTimePatterns_ps', 'goog.i18n.DateTimePatterns_ps_AF', 'goog.i18n.DateTimePatterns_pt_AO', 'goog.i18n.DateTimePatterns_pt_CV', 'goog.i18n.DateTimePatterns_pt_GW', 'goog.i18n.DateTimePatterns_pt_MO', 'goog.i18n.DateTimePatterns_pt_MZ', 'goog.i18n.DateTimePatterns_pt_ST', 'goog.i18n.DateTimePatterns_pt_TL', 'goog.i18n.DateTimePatterns_rm', 'goog.i18n.DateTimePatterns_rm_CH', 'goog.i18n.DateTimePatterns_rn', 'goog.i18n.DateTimePatterns_rn_BI', 'goog.i18n.DateTimePatterns_ro_MD', 'goog.i18n.DateTimePatterns_ro_RO', 'goog.i18n.DateTimePatterns_rof', 'goog.i18n.DateTimePatterns_rof_TZ', 'goog.i18n.DateTimePatterns_ru_BY', 'goog.i18n.DateTimePatterns_ru_KG', 'goog.i18n.DateTimePatterns_ru_KZ', 'goog.i18n.DateTimePatterns_ru_MD', 'goog.i18n.DateTimePatterns_ru_RU', 'goog.i18n.DateTimePatterns_ru_UA', 'goog.i18n.DateTimePatterns_rw', 'goog.i18n.DateTimePatterns_rw_RW', 'goog.i18n.DateTimePatterns_rwk', 'goog.i18n.DateTimePatterns_rwk_TZ', 'goog.i18n.DateTimePatterns_saq', 'goog.i18n.DateTimePatterns_saq_KE', 'goog.i18n.DateTimePatterns_sbp', 'goog.i18n.DateTimePatterns_sbp_TZ', 'goog.i18n.DateTimePatterns_seh', 'goog.i18n.DateTimePatterns_seh_MZ', 'goog.i18n.DateTimePatterns_ses', 'goog.i18n.DateTimePatterns_ses_ML', 'goog.i18n.DateTimePatterns_sg', 'goog.i18n.DateTimePatterns_sg_CF', 'goog.i18n.DateTimePatterns_shi', 'goog.i18n.DateTimePatterns_shi_Latn', 'goog.i18n.DateTimePatterns_shi_Latn_MA', 'goog.i18n.DateTimePatterns_shi_Tfng', 'goog.i18n.DateTimePatterns_shi_Tfng_MA', 'goog.i18n.DateTimePatterns_si', 'goog.i18n.DateTimePatterns_si_LK', 'goog.i18n.DateTimePatterns_sk_SK', 'goog.i18n.DateTimePatterns_sl_SI', 'goog.i18n.DateTimePatterns_sn', 'goog.i18n.DateTimePatterns_sn_ZW', 'goog.i18n.DateTimePatterns_so', 'goog.i18n.DateTimePatterns_so_DJ', 'goog.i18n.DateTimePatterns_so_ET', 'goog.i18n.DateTimePatterns_so_KE', 'goog.i18n.DateTimePatterns_so_SO', 'goog.i18n.DateTimePatterns_sq_AL', 'goog.i18n.DateTimePatterns_sq_MK', 'goog.i18n.DateTimePatterns_sr_Cyrl', 'goog.i18n.DateTimePatterns_sr_Cyrl_BA', 'goog.i18n.DateTimePatterns_sr_Cyrl_ME', 'goog.i18n.DateTimePatterns_sr_Cyrl_RS', 'goog.i18n.DateTimePatterns_sr_Latn', 'goog.i18n.DateTimePatterns_sr_Latn_BA', 'goog.i18n.DateTimePatterns_sr_Latn_ME', 'goog.i18n.DateTimePatterns_sr_Latn_RS', 'goog.i18n.DateTimePatterns_sv_AX', 'goog.i18n.DateTimePatterns_sv_FI', 'goog.i18n.DateTimePatterns_sv_SE', 'goog.i18n.DateTimePatterns_sw_KE', 'goog.i18n.DateTimePatterns_sw_TZ', 'goog.i18n.DateTimePatterns_sw_UG', 'goog.i18n.DateTimePatterns_swc', 'goog.i18n.DateTimePatterns_swc_CD', 'goog.i18n.DateTimePatterns_ta_IN', 'goog.i18n.DateTimePatterns_ta_LK', 'goog.i18n.DateTimePatterns_ta_MY', 'goog.i18n.DateTimePatterns_ta_SG', 'goog.i18n.DateTimePatterns_te_IN', 'goog.i18n.DateTimePatterns_teo', 'goog.i18n.DateTimePatterns_teo_KE', 'goog.i18n.DateTimePatterns_teo_UG', 'goog.i18n.DateTimePatterns_th_TH', 'goog.i18n.DateTimePatterns_ti', 'goog.i18n.DateTimePatterns_ti_ER', 'goog.i18n.DateTimePatterns_ti_ET', 'goog.i18n.DateTimePatterns_to', 'goog.i18n.DateTimePatterns_to_TO', 'goog.i18n.DateTimePatterns_tr_CY', 'goog.i18n.DateTimePatterns_tr_TR', 'goog.i18n.DateTimePatterns_twq', 'goog.i18n.DateTimePatterns_twq_NE', 'goog.i18n.DateTimePatterns_tzm', 'goog.i18n.DateTimePatterns_tzm_Latn', 'goog.i18n.DateTimePatterns_tzm_Latn_MA', 'goog.i18n.DateTimePatterns_uk_UA', 'goog.i18n.DateTimePatterns_ur_IN', 'goog.i18n.DateTimePatterns_ur_PK', 'goog.i18n.DateTimePatterns_uz', 'goog.i18n.DateTimePatterns_uz_Arab', 'goog.i18n.DateTimePatterns_uz_Arab_AF', 'goog.i18n.DateTimePatterns_uz_Cyrl', 'goog.i18n.DateTimePatterns_uz_Cyrl_UZ', 'goog.i18n.DateTimePatterns_uz_Latn', 'goog.i18n.DateTimePatterns_uz_Latn_UZ', 'goog.i18n.DateTimePatterns_vai', 'goog.i18n.DateTimePatterns_vai_Latn', 'goog.i18n.DateTimePatterns_vai_Latn_LR', 'goog.i18n.DateTimePatterns_vai_Vaii', 'goog.i18n.DateTimePatterns_vai_Vaii_LR', 'goog.i18n.DateTimePatterns_vi_VN', 'goog.i18n.DateTimePatterns_vun', 'goog.i18n.DateTimePatterns_vun_TZ', 'goog.i18n.DateTimePatterns_xog', 'goog.i18n.DateTimePatterns_xog_UG', 'goog.i18n.DateTimePatterns_yav', 'goog.i18n.DateTimePatterns_yav_CM', 'goog.i18n.DateTimePatterns_yo', 'goog.i18n.DateTimePatterns_yo_NG', 'goog.i18n.DateTimePatterns_zh_Hans', 'goog.i18n.DateTimePatterns_zh_Hans_CN', 'goog.i18n.DateTimePatterns_zh_Hans_HK', 'goog.i18n.DateTimePatterns_zh_Hans_MO', 'goog.i18n.DateTimePatterns_zh_Hans_SG', 'goog.i18n.DateTimePatterns_zh_Hant', 'goog.i18n.DateTimePatterns_zh_Hant_HK', 'goog.i18n.DateTimePatterns_zh_Hant_MO', 'goog.i18n.DateTimePatterns_zh_Hant_TW', 'goog.i18n.DateTimePatterns_zu_ZA'], ['goog.i18n.DateTimePatterns']);
goog.addDependency('i18n/datetimesymbols.js', ['goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_af', 'goog.i18n.DateTimeSymbols_am', 'goog.i18n.DateTimeSymbols_ar', 'goog.i18n.DateTimeSymbols_bg', 'goog.i18n.DateTimeSymbols_bn', 'goog.i18n.DateTimeSymbols_br', 'goog.i18n.DateTimeSymbols_ca', 'goog.i18n.DateTimeSymbols_chr', 'goog.i18n.DateTimeSymbols_cs', 'goog.i18n.DateTimeSymbols_cy', 'goog.i18n.DateTimeSymbols_da', 'goog.i18n.DateTimeSymbols_de', 'goog.i18n.DateTimeSymbols_de_AT', 'goog.i18n.DateTimeSymbols_de_CH', 'goog.i18n.DateTimeSymbols_el', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_en_AU', 'goog.i18n.DateTimeSymbols_en_GB', 'goog.i18n.DateTimeSymbols_en_IE', 'goog.i18n.DateTimeSymbols_en_IN', 'goog.i18n.DateTimeSymbols_en_ISO', 'goog.i18n.DateTimeSymbols_en_SG', 'goog.i18n.DateTimeSymbols_en_US', 'goog.i18n.DateTimeSymbols_en_ZA', 'goog.i18n.DateTimeSymbols_es', 'goog.i18n.DateTimeSymbols_es_419', 'goog.i18n.DateTimeSymbols_es_ES', 'goog.i18n.DateTimeSymbols_et', 'goog.i18n.DateTimeSymbols_eu', 'goog.i18n.DateTimeSymbols_fa', 'goog.i18n.DateTimeSymbols_fi', 'goog.i18n.DateTimeSymbols_fil', 'goog.i18n.DateTimeSymbols_fr', 'goog.i18n.DateTimeSymbols_fr_CA', 'goog.i18n.DateTimeSymbols_gl', 'goog.i18n.DateTimeSymbols_gsw', 'goog.i18n.DateTimeSymbols_gu', 'goog.i18n.DateTimeSymbols_haw', 'goog.i18n.DateTimeSymbols_he', 'goog.i18n.DateTimeSymbols_hi', 'goog.i18n.DateTimeSymbols_hr', 'goog.i18n.DateTimeSymbols_hu', 'goog.i18n.DateTimeSymbols_id', 'goog.i18n.DateTimeSymbols_in', 'goog.i18n.DateTimeSymbols_is', 'goog.i18n.DateTimeSymbols_it', 'goog.i18n.DateTimeSymbols_iw', 'goog.i18n.DateTimeSymbols_ja', 'goog.i18n.DateTimeSymbols_kn', 'goog.i18n.DateTimeSymbols_ko', 'goog.i18n.DateTimeSymbols_ln', 'goog.i18n.DateTimeSymbols_lt', 'goog.i18n.DateTimeSymbols_lv', 'goog.i18n.DateTimeSymbols_ml', 'goog.i18n.DateTimeSymbols_mr', 'goog.i18n.DateTimeSymbols_ms', 'goog.i18n.DateTimeSymbols_mt', 'goog.i18n.DateTimeSymbols_nb', 'goog.i18n.DateTimeSymbols_nl', 'goog.i18n.DateTimeSymbols_no', 'goog.i18n.DateTimeSymbols_or', 'goog.i18n.DateTimeSymbols_pl', 'goog.i18n.DateTimeSymbols_pt', 'goog.i18n.DateTimeSymbols_pt_BR', 'goog.i18n.DateTimeSymbols_pt_PT', 'goog.i18n.DateTimeSymbols_ro', 'goog.i18n.DateTimeSymbols_ru', 'goog.i18n.DateTimeSymbols_sk', 'goog.i18n.DateTimeSymbols_sl', 'goog.i18n.DateTimeSymbols_sq', 'goog.i18n.DateTimeSymbols_sr', 'goog.i18n.DateTimeSymbols_sv', 'goog.i18n.DateTimeSymbols_sw', 'goog.i18n.DateTimeSymbols_ta', 'goog.i18n.DateTimeSymbols_te', 'goog.i18n.DateTimeSymbols_th', 'goog.i18n.DateTimeSymbols_tl', 'goog.i18n.DateTimeSymbols_tr', 'goog.i18n.DateTimeSymbols_uk', 'goog.i18n.DateTimeSymbols_ur', 'goog.i18n.DateTimeSymbols_vi', 'goog.i18n.DateTimeSymbols_zh', 'goog.i18n.DateTimeSymbols_zh_CN', 'goog.i18n.DateTimeSymbols_zh_HK', 'goog.i18n.DateTimeSymbols_zh_TW', 'goog.i18n.DateTimeSymbols_zu'], []);
goog.addDependency('i18n/datetimesymbolsext.js', ['goog.i18n.DateTimeSymbolsExt', 'goog.i18n.DateTimeSymbols_aa', 'goog.i18n.DateTimeSymbols_aa_DJ', 'goog.i18n.DateTimeSymbols_aa_ER', 'goog.i18n.DateTimeSymbols_aa_ET', 'goog.i18n.DateTimeSymbols_af_NA', 'goog.i18n.DateTimeSymbols_af_ZA', 'goog.i18n.DateTimeSymbols_agq', 'goog.i18n.DateTimeSymbols_agq_CM', 'goog.i18n.DateTimeSymbols_ak', 'goog.i18n.DateTimeSymbols_ak_GH', 'goog.i18n.DateTimeSymbols_am_ET', 'goog.i18n.DateTimeSymbols_ar_001', 'goog.i18n.DateTimeSymbols_ar_AE', 'goog.i18n.DateTimeSymbols_ar_BH', 'goog.i18n.DateTimeSymbols_ar_DJ', 'goog.i18n.DateTimeSymbols_ar_DZ', 'goog.i18n.DateTimeSymbols_ar_EG', 'goog.i18n.DateTimeSymbols_ar_EH', 'goog.i18n.DateTimeSymbols_ar_ER', 'goog.i18n.DateTimeSymbols_ar_IL', 'goog.i18n.DateTimeSymbols_ar_IQ', 'goog.i18n.DateTimeSymbols_ar_JO', 'goog.i18n.DateTimeSymbols_ar_KM', 'goog.i18n.DateTimeSymbols_ar_KW', 'goog.i18n.DateTimeSymbols_ar_LB', 'goog.i18n.DateTimeSymbols_ar_LY', 'goog.i18n.DateTimeSymbols_ar_MA', 'goog.i18n.DateTimeSymbols_ar_MR', 'goog.i18n.DateTimeSymbols_ar_OM', 'goog.i18n.DateTimeSymbols_ar_PS', 'goog.i18n.DateTimeSymbols_ar_QA', 'goog.i18n.DateTimeSymbols_ar_SA', 'goog.i18n.DateTimeSymbols_ar_SD', 'goog.i18n.DateTimeSymbols_ar_SO', 'goog.i18n.DateTimeSymbols_ar_SY', 'goog.i18n.DateTimeSymbols_ar_TD', 'goog.i18n.DateTimeSymbols_ar_TN', 'goog.i18n.DateTimeSymbols_ar_YE', 'goog.i18n.DateTimeSymbols_as', 'goog.i18n.DateTimeSymbols_as_IN', 'goog.i18n.DateTimeSymbols_asa', 'goog.i18n.DateTimeSymbols_asa_TZ', 'goog.i18n.DateTimeSymbols_ast', 'goog.i18n.DateTimeSymbols_ast_ES', 'goog.i18n.DateTimeSymbols_az', 'goog.i18n.DateTimeSymbols_az_Cyrl', 'goog.i18n.DateTimeSymbols_az_Cyrl_AZ', 'goog.i18n.DateTimeSymbols_az_Latn', 'goog.i18n.DateTimeSymbols_az_Latn_AZ', 'goog.i18n.DateTimeSymbols_bas', 'goog.i18n.DateTimeSymbols_bas_CM', 'goog.i18n.DateTimeSymbols_be', 'goog.i18n.DateTimeSymbols_be_BY', 'goog.i18n.DateTimeSymbols_bem', 'goog.i18n.DateTimeSymbols_bem_ZM', 'goog.i18n.DateTimeSymbols_bez', 'goog.i18n.DateTimeSymbols_bez_TZ', 'goog.i18n.DateTimeSymbols_bg_BG', 'goog.i18n.DateTimeSymbols_bm', 'goog.i18n.DateTimeSymbols_bm_ML', 'goog.i18n.DateTimeSymbols_bn_BD', 'goog.i18n.DateTimeSymbols_bn_IN', 'goog.i18n.DateTimeSymbols_bo', 'goog.i18n.DateTimeSymbols_bo_CN', 'goog.i18n.DateTimeSymbols_bo_IN', 'goog.i18n.DateTimeSymbols_br_FR', 'goog.i18n.DateTimeSymbols_brx', 'goog.i18n.DateTimeSymbols_brx_IN', 'goog.i18n.DateTimeSymbols_bs', 'goog.i18n.DateTimeSymbols_bs_Cyrl', 'goog.i18n.DateTimeSymbols_bs_Cyrl_BA', 'goog.i18n.DateTimeSymbols_bs_Latn', 'goog.i18n.DateTimeSymbols_bs_Latn_BA', 'goog.i18n.DateTimeSymbols_byn', 'goog.i18n.DateTimeSymbols_byn_ER', 'goog.i18n.DateTimeSymbols_ca_AD', 'goog.i18n.DateTimeSymbols_ca_ES', 'goog.i18n.DateTimeSymbols_cgg', 'goog.i18n.DateTimeSymbols_cgg_UG', 'goog.i18n.DateTimeSymbols_chr_US', 'goog.i18n.DateTimeSymbols_ckb', 'goog.i18n.DateTimeSymbols_ckb_Arab', 'goog.i18n.DateTimeSymbols_ckb_Arab_IQ', 'goog.i18n.DateTimeSymbols_ckb_Arab_IR', 'goog.i18n.DateTimeSymbols_ckb_IQ', 'goog.i18n.DateTimeSymbols_ckb_IR', 'goog.i18n.DateTimeSymbols_ckb_Latn', 'goog.i18n.DateTimeSymbols_ckb_Latn_IQ', 'goog.i18n.DateTimeSymbols_cs_CZ', 'goog.i18n.DateTimeSymbols_cy_GB', 'goog.i18n.DateTimeSymbols_da_DK', 'goog.i18n.DateTimeSymbols_dav', 'goog.i18n.DateTimeSymbols_dav_KE', 'goog.i18n.DateTimeSymbols_de_BE', 'goog.i18n.DateTimeSymbols_de_DE', 'goog.i18n.DateTimeSymbols_de_LI', 'goog.i18n.DateTimeSymbols_de_LU', 'goog.i18n.DateTimeSymbols_dje', 'goog.i18n.DateTimeSymbols_dje_NE', 'goog.i18n.DateTimeSymbols_dua', 'goog.i18n.DateTimeSymbols_dua_CM', 'goog.i18n.DateTimeSymbols_dyo', 'goog.i18n.DateTimeSymbols_dyo_SN', 'goog.i18n.DateTimeSymbols_dz', 'goog.i18n.DateTimeSymbols_dz_BT', 'goog.i18n.DateTimeSymbols_ebu', 'goog.i18n.DateTimeSymbols_ebu_KE', 'goog.i18n.DateTimeSymbols_ee', 'goog.i18n.DateTimeSymbols_ee_GH', 'goog.i18n.DateTimeSymbols_ee_TG', 'goog.i18n.DateTimeSymbols_el_CY', 'goog.i18n.DateTimeSymbols_el_GR', 'goog.i18n.DateTimeSymbols_en_150', 'goog.i18n.DateTimeSymbols_en_AG', 'goog.i18n.DateTimeSymbols_en_AS', 'goog.i18n.DateTimeSymbols_en_BB', 'goog.i18n.DateTimeSymbols_en_BE', 'goog.i18n.DateTimeSymbols_en_BM', 'goog.i18n.DateTimeSymbols_en_BS', 'goog.i18n.DateTimeSymbols_en_BW', 'goog.i18n.DateTimeSymbols_en_BZ', 'goog.i18n.DateTimeSymbols_en_CA', 'goog.i18n.DateTimeSymbols_en_CM', 'goog.i18n.DateTimeSymbols_en_DM', 'goog.i18n.DateTimeSymbols_en_Dsrt', 'goog.i18n.DateTimeSymbols_en_Dsrt_US', 'goog.i18n.DateTimeSymbols_en_FJ', 'goog.i18n.DateTimeSymbols_en_FM', 'goog.i18n.DateTimeSymbols_en_GD', 'goog.i18n.DateTimeSymbols_en_GG', 'goog.i18n.DateTimeSymbols_en_GH', 'goog.i18n.DateTimeSymbols_en_GI', 'goog.i18n.DateTimeSymbols_en_GM', 'goog.i18n.DateTimeSymbols_en_GU', 'goog.i18n.DateTimeSymbols_en_GY', 'goog.i18n.DateTimeSymbols_en_HK', 'goog.i18n.DateTimeSymbols_en_IM', 'goog.i18n.DateTimeSymbols_en_JE', 'goog.i18n.DateTimeSymbols_en_JM', 'goog.i18n.DateTimeSymbols_en_KE', 'goog.i18n.DateTimeSymbols_en_KI', 'goog.i18n.DateTimeSymbols_en_KN', 'goog.i18n.DateTimeSymbols_en_KY', 'goog.i18n.DateTimeSymbols_en_LC', 'goog.i18n.DateTimeSymbols_en_LR', 'goog.i18n.DateTimeSymbols_en_LS', 'goog.i18n.DateTimeSymbols_en_MG', 'goog.i18n.DateTimeSymbols_en_MH', 'goog.i18n.DateTimeSymbols_en_MP', 'goog.i18n.DateTimeSymbols_en_MT', 'goog.i18n.DateTimeSymbols_en_MU', 'goog.i18n.DateTimeSymbols_en_MW', 'goog.i18n.DateTimeSymbols_en_NA', 'goog.i18n.DateTimeSymbols_en_NG', 'goog.i18n.DateTimeSymbols_en_NZ', 'goog.i18n.DateTimeSymbols_en_PG', 'goog.i18n.DateTimeSymbols_en_PH', 'goog.i18n.DateTimeSymbols_en_PK', 'goog.i18n.DateTimeSymbols_en_PR', 'goog.i18n.DateTimeSymbols_en_PW', 'goog.i18n.DateTimeSymbols_en_SB', 'goog.i18n.DateTimeSymbols_en_SC', 'goog.i18n.DateTimeSymbols_en_SL', 'goog.i18n.DateTimeSymbols_en_SS', 'goog.i18n.DateTimeSymbols_en_SZ', 'goog.i18n.DateTimeSymbols_en_TC', 'goog.i18n.DateTimeSymbols_en_TO', 'goog.i18n.DateTimeSymbols_en_TT', 'goog.i18n.DateTimeSymbols_en_TZ', 'goog.i18n.DateTimeSymbols_en_UG', 'goog.i18n.DateTimeSymbols_en_UM', 'goog.i18n.DateTimeSymbols_en_VC', 'goog.i18n.DateTimeSymbols_en_VG', 'goog.i18n.DateTimeSymbols_en_VI', 'goog.i18n.DateTimeSymbols_en_VU', 'goog.i18n.DateTimeSymbols_en_WS', 'goog.i18n.DateTimeSymbols_en_ZM', 'goog.i18n.DateTimeSymbols_en_ZW', 'goog.i18n.DateTimeSymbols_eo', 'goog.i18n.DateTimeSymbols_es_AR', 'goog.i18n.DateTimeSymbols_es_BO', 'goog.i18n.DateTimeSymbols_es_CL', 'goog.i18n.DateTimeSymbols_es_CO', 'goog.i18n.DateTimeSymbols_es_CR', 'goog.i18n.DateTimeSymbols_es_CU', 'goog.i18n.DateTimeSymbols_es_DO', 'goog.i18n.DateTimeSymbols_es_EA', 'goog.i18n.DateTimeSymbols_es_EC', 'goog.i18n.DateTimeSymbols_es_GQ', 'goog.i18n.DateTimeSymbols_es_GT', 'goog.i18n.DateTimeSymbols_es_HN', 'goog.i18n.DateTimeSymbols_es_IC', 'goog.i18n.DateTimeSymbols_es_MX', 'goog.i18n.DateTimeSymbols_es_NI', 'goog.i18n.DateTimeSymbols_es_PA', 'goog.i18n.DateTimeSymbols_es_PE', 'goog.i18n.DateTimeSymbols_es_PH', 'goog.i18n.DateTimeSymbols_es_PR', 'goog.i18n.DateTimeSymbols_es_PY', 'goog.i18n.DateTimeSymbols_es_SV', 'goog.i18n.DateTimeSymbols_es_US', 'goog.i18n.DateTimeSymbols_es_UY', 'goog.i18n.DateTimeSymbols_es_VE', 'goog.i18n.DateTimeSymbols_et_EE', 'goog.i18n.DateTimeSymbols_eu_ES', 'goog.i18n.DateTimeSymbols_ewo', 'goog.i18n.DateTimeSymbols_ewo_CM', 'goog.i18n.DateTimeSymbols_fa_AF', 'goog.i18n.DateTimeSymbols_fa_IR', 'goog.i18n.DateTimeSymbols_ff', 'goog.i18n.DateTimeSymbols_ff_SN', 'goog.i18n.DateTimeSymbols_fi_FI', 'goog.i18n.DateTimeSymbols_fil_PH', 'goog.i18n.DateTimeSymbols_fo', 'goog.i18n.DateTimeSymbols_fo_FO', 'goog.i18n.DateTimeSymbols_fr_BE', 'goog.i18n.DateTimeSymbols_fr_BF', 'goog.i18n.DateTimeSymbols_fr_BI', 'goog.i18n.DateTimeSymbols_fr_BJ', 'goog.i18n.DateTimeSymbols_fr_BL', 'goog.i18n.DateTimeSymbols_fr_CD', 'goog.i18n.DateTimeSymbols_fr_CF', 'goog.i18n.DateTimeSymbols_fr_CG', 'goog.i18n.DateTimeSymbols_fr_CH', 'goog.i18n.DateTimeSymbols_fr_CI', 'goog.i18n.DateTimeSymbols_fr_CM', 'goog.i18n.DateTimeSymbols_fr_DJ', 'goog.i18n.DateTimeSymbols_fr_DZ', 'goog.i18n.DateTimeSymbols_fr_FR', 'goog.i18n.DateTimeSymbols_fr_GA', 'goog.i18n.DateTimeSymbols_fr_GF', 'goog.i18n.DateTimeSymbols_fr_GN', 'goog.i18n.DateTimeSymbols_fr_GP', 'goog.i18n.DateTimeSymbols_fr_GQ', 'goog.i18n.DateTimeSymbols_fr_HT', 'goog.i18n.DateTimeSymbols_fr_KM', 'goog.i18n.DateTimeSymbols_fr_LU', 'goog.i18n.DateTimeSymbols_fr_MA', 'goog.i18n.DateTimeSymbols_fr_MC', 'goog.i18n.DateTimeSymbols_fr_MF', 'goog.i18n.DateTimeSymbols_fr_MG', 'goog.i18n.DateTimeSymbols_fr_ML', 'goog.i18n.DateTimeSymbols_fr_MQ', 'goog.i18n.DateTimeSymbols_fr_MR', 'goog.i18n.DateTimeSymbols_fr_MU', 'goog.i18n.DateTimeSymbols_fr_NC', 'goog.i18n.DateTimeSymbols_fr_NE', 'goog.i18n.DateTimeSymbols_fr_PF', 'goog.i18n.DateTimeSymbols_fr_RE', 'goog.i18n.DateTimeSymbols_fr_RW', 'goog.i18n.DateTimeSymbols_fr_SC', 'goog.i18n.DateTimeSymbols_fr_SN', 'goog.i18n.DateTimeSymbols_fr_SY', 'goog.i18n.DateTimeSymbols_fr_TD', 'goog.i18n.DateTimeSymbols_fr_TG', 'goog.i18n.DateTimeSymbols_fr_TN', 'goog.i18n.DateTimeSymbols_fr_VU', 'goog.i18n.DateTimeSymbols_fr_YT', 'goog.i18n.DateTimeSymbols_fur', 'goog.i18n.DateTimeSymbols_fur_IT', 'goog.i18n.DateTimeSymbols_ga', 'goog.i18n.DateTimeSymbols_ga_IE', 'goog.i18n.DateTimeSymbols_gd', 'goog.i18n.DateTimeSymbols_gd_GB', 'goog.i18n.DateTimeSymbols_gl_ES', 'goog.i18n.DateTimeSymbols_gsw_CH', 'goog.i18n.DateTimeSymbols_gu_IN', 'goog.i18n.DateTimeSymbols_guz', 'goog.i18n.DateTimeSymbols_guz_KE', 'goog.i18n.DateTimeSymbols_gv', 'goog.i18n.DateTimeSymbols_gv_GB', 'goog.i18n.DateTimeSymbols_ha', 'goog.i18n.DateTimeSymbols_ha_Latn', 'goog.i18n.DateTimeSymbols_ha_Latn_GH', 'goog.i18n.DateTimeSymbols_ha_Latn_NE', 'goog.i18n.DateTimeSymbols_ha_Latn_NG', 'goog.i18n.DateTimeSymbols_haw_US', 'goog.i18n.DateTimeSymbols_he_IL', 'goog.i18n.DateTimeSymbols_hi_IN', 'goog.i18n.DateTimeSymbols_hr_BA', 'goog.i18n.DateTimeSymbols_hr_HR', 'goog.i18n.DateTimeSymbols_hu_HU', 'goog.i18n.DateTimeSymbols_hy', 'goog.i18n.DateTimeSymbols_hy_AM', 'goog.i18n.DateTimeSymbols_ia', 'goog.i18n.DateTimeSymbols_ia_FR', 'goog.i18n.DateTimeSymbols_id_ID', 'goog.i18n.DateTimeSymbols_ig', 'goog.i18n.DateTimeSymbols_ig_NG', 'goog.i18n.DateTimeSymbols_ii', 'goog.i18n.DateTimeSymbols_ii_CN', 'goog.i18n.DateTimeSymbols_is_IS', 'goog.i18n.DateTimeSymbols_it_CH', 'goog.i18n.DateTimeSymbols_it_IT', 'goog.i18n.DateTimeSymbols_it_SM', 'goog.i18n.DateTimeSymbols_ja_JP', 'goog.i18n.DateTimeSymbols_jgo', 'goog.i18n.DateTimeSymbols_jgo_CM', 'goog.i18n.DateTimeSymbols_jmc', 'goog.i18n.DateTimeSymbols_jmc_TZ', 'goog.i18n.DateTimeSymbols_ka', 'goog.i18n.DateTimeSymbols_ka_GE', 'goog.i18n.DateTimeSymbols_kab', 'goog.i18n.DateTimeSymbols_kab_DZ', 'goog.i18n.DateTimeSymbols_kam', 'goog.i18n.DateTimeSymbols_kam_KE', 'goog.i18n.DateTimeSymbols_kde', 'goog.i18n.DateTimeSymbols_kde_TZ', 'goog.i18n.DateTimeSymbols_kea', 'goog.i18n.DateTimeSymbols_kea_CV', 'goog.i18n.DateTimeSymbols_khq', 'goog.i18n.DateTimeSymbols_khq_ML', 'goog.i18n.DateTimeSymbols_ki', 'goog.i18n.DateTimeSymbols_ki_KE', 'goog.i18n.DateTimeSymbols_kk', 'goog.i18n.DateTimeSymbols_kk_Cyrl', 'goog.i18n.DateTimeSymbols_kk_Cyrl_KZ', 'goog.i18n.DateTimeSymbols_kkj', 'goog.i18n.DateTimeSymbols_kkj_CM', 'goog.i18n.DateTimeSymbols_kl', 'goog.i18n.DateTimeSymbols_kl_GL', 'goog.i18n.DateTimeSymbols_kln', 'goog.i18n.DateTimeSymbols_kln_KE', 'goog.i18n.DateTimeSymbols_km', 'goog.i18n.DateTimeSymbols_km_KH', 'goog.i18n.DateTimeSymbols_kn_IN', 'goog.i18n.DateTimeSymbols_ko_KP', 'goog.i18n.DateTimeSymbols_ko_KR', 'goog.i18n.DateTimeSymbols_kok', 'goog.i18n.DateTimeSymbols_kok_IN', 'goog.i18n.DateTimeSymbols_ks', 'goog.i18n.DateTimeSymbols_ks_Arab', 'goog.i18n.DateTimeSymbols_ks_Arab_IN', 'goog.i18n.DateTimeSymbols_ksb', 'goog.i18n.DateTimeSymbols_ksb_TZ', 'goog.i18n.DateTimeSymbols_ksf', 'goog.i18n.DateTimeSymbols_ksf_CM', 'goog.i18n.DateTimeSymbols_ksh', 'goog.i18n.DateTimeSymbols_ksh_DE', 'goog.i18n.DateTimeSymbols_kw', 'goog.i18n.DateTimeSymbols_kw_GB', 'goog.i18n.DateTimeSymbols_ky', 'goog.i18n.DateTimeSymbols_ky_KG', 'goog.i18n.DateTimeSymbols_lag', 'goog.i18n.DateTimeSymbols_lag_TZ', 'goog.i18n.DateTimeSymbols_lg', 'goog.i18n.DateTimeSymbols_lg_UG', 'goog.i18n.DateTimeSymbols_ln_AO', 'goog.i18n.DateTimeSymbols_ln_CD', 'goog.i18n.DateTimeSymbols_ln_CF', 'goog.i18n.DateTimeSymbols_ln_CG', 'goog.i18n.DateTimeSymbols_lo', 'goog.i18n.DateTimeSymbols_lo_LA', 'goog.i18n.DateTimeSymbols_lt_LT', 'goog.i18n.DateTimeSymbols_lu', 'goog.i18n.DateTimeSymbols_lu_CD', 'goog.i18n.DateTimeSymbols_luo', 'goog.i18n.DateTimeSymbols_luo_KE', 'goog.i18n.DateTimeSymbols_luy', 'goog.i18n.DateTimeSymbols_luy_KE', 'goog.i18n.DateTimeSymbols_lv_LV', 'goog.i18n.DateTimeSymbols_mas', 'goog.i18n.DateTimeSymbols_mas_KE', 'goog.i18n.DateTimeSymbols_mas_TZ', 'goog.i18n.DateTimeSymbols_mer', 'goog.i18n.DateTimeSymbols_mer_KE', 'goog.i18n.DateTimeSymbols_mfe', 'goog.i18n.DateTimeSymbols_mfe_MU', 'goog.i18n.DateTimeSymbols_mg', 'goog.i18n.DateTimeSymbols_mg_MG', 'goog.i18n.DateTimeSymbols_mgh', 'goog.i18n.DateTimeSymbols_mgh_MZ', 'goog.i18n.DateTimeSymbols_mgo', 'goog.i18n.DateTimeSymbols_mgo_CM', 'goog.i18n.DateTimeSymbols_mk', 'goog.i18n.DateTimeSymbols_mk_MK', 'goog.i18n.DateTimeSymbols_ml_IN', 'goog.i18n.DateTimeSymbols_mn', 'goog.i18n.DateTimeSymbols_mn_Cyrl', 'goog.i18n.DateTimeSymbols_mn_Cyrl_MN', 'goog.i18n.DateTimeSymbols_mr_IN', 'goog.i18n.DateTimeSymbols_ms_Latn', 'goog.i18n.DateTimeSymbols_ms_Latn_BN', 'goog.i18n.DateTimeSymbols_ms_Latn_MY', 'goog.i18n.DateTimeSymbols_ms_Latn_SG', 'goog.i18n.DateTimeSymbols_mt_MT', 'goog.i18n.DateTimeSymbols_mua', 'goog.i18n.DateTimeSymbols_mua_CM', 'goog.i18n.DateTimeSymbols_my', 'goog.i18n.DateTimeSymbols_my_MM', 'goog.i18n.DateTimeSymbols_naq', 'goog.i18n.DateTimeSymbols_naq_NA', 'goog.i18n.DateTimeSymbols_nb_NO', 'goog.i18n.DateTimeSymbols_nd', 'goog.i18n.DateTimeSymbols_nd_ZW', 'goog.i18n.DateTimeSymbols_ne', 'goog.i18n.DateTimeSymbols_ne_IN', 'goog.i18n.DateTimeSymbols_ne_NP', 'goog.i18n.DateTimeSymbols_nl_AW', 'goog.i18n.DateTimeSymbols_nl_BE', 'goog.i18n.DateTimeSymbols_nl_CW', 'goog.i18n.DateTimeSymbols_nl_NL', 'goog.i18n.DateTimeSymbols_nl_SR', 'goog.i18n.DateTimeSymbols_nl_SX', 'goog.i18n.DateTimeSymbols_nmg', 'goog.i18n.DateTimeSymbols_nmg_CM', 'goog.i18n.DateTimeSymbols_nn', 'goog.i18n.DateTimeSymbols_nn_NO', 'goog.i18n.DateTimeSymbols_nnh', 'goog.i18n.DateTimeSymbols_nnh_CM', 'goog.i18n.DateTimeSymbols_nr', 'goog.i18n.DateTimeSymbols_nr_ZA', 'goog.i18n.DateTimeSymbols_nso', 'goog.i18n.DateTimeSymbols_nso_ZA', 'goog.i18n.DateTimeSymbols_nus', 'goog.i18n.DateTimeSymbols_nus_SD', 'goog.i18n.DateTimeSymbols_nyn', 'goog.i18n.DateTimeSymbols_nyn_UG', 'goog.i18n.DateTimeSymbols_om', 'goog.i18n.DateTimeSymbols_om_ET', 'goog.i18n.DateTimeSymbols_om_KE', 'goog.i18n.DateTimeSymbols_or_IN', 'goog.i18n.DateTimeSymbols_os', 'goog.i18n.DateTimeSymbols_os_GE', 'goog.i18n.DateTimeSymbols_os_RU', 'goog.i18n.DateTimeSymbols_pa', 'goog.i18n.DateTimeSymbols_pa_Arab', 'goog.i18n.DateTimeSymbols_pa_Arab_PK', 'goog.i18n.DateTimeSymbols_pa_Guru', 'goog.i18n.DateTimeSymbols_pa_Guru_IN', 'goog.i18n.DateTimeSymbols_pl_PL', 'goog.i18n.DateTimeSymbols_ps', 'goog.i18n.DateTimeSymbols_ps_AF', 'goog.i18n.DateTimeSymbols_pt_AO', 'goog.i18n.DateTimeSymbols_pt_CV', 'goog.i18n.DateTimeSymbols_pt_GW', 'goog.i18n.DateTimeSymbols_pt_MO', 'goog.i18n.DateTimeSymbols_pt_MZ', 'goog.i18n.DateTimeSymbols_pt_ST', 'goog.i18n.DateTimeSymbols_pt_TL', 'goog.i18n.DateTimeSymbols_rm', 'goog.i18n.DateTimeSymbols_rm_CH', 'goog.i18n.DateTimeSymbols_rn', 'goog.i18n.DateTimeSymbols_rn_BI', 'goog.i18n.DateTimeSymbols_ro_MD', 'goog.i18n.DateTimeSymbols_ro_RO', 'goog.i18n.DateTimeSymbols_rof', 'goog.i18n.DateTimeSymbols_rof_TZ', 'goog.i18n.DateTimeSymbols_ru_BY', 'goog.i18n.DateTimeSymbols_ru_KG', 'goog.i18n.DateTimeSymbols_ru_KZ', 'goog.i18n.DateTimeSymbols_ru_MD', 'goog.i18n.DateTimeSymbols_ru_RU', 'goog.i18n.DateTimeSymbols_ru_UA', 'goog.i18n.DateTimeSymbols_rw', 'goog.i18n.DateTimeSymbols_rw_RW', 'goog.i18n.DateTimeSymbols_rwk', 'goog.i18n.DateTimeSymbols_rwk_TZ', 'goog.i18n.DateTimeSymbols_sah', 'goog.i18n.DateTimeSymbols_sah_RU', 'goog.i18n.DateTimeSymbols_saq', 'goog.i18n.DateTimeSymbols_saq_KE', 'goog.i18n.DateTimeSymbols_sbp', 'goog.i18n.DateTimeSymbols_sbp_TZ', 'goog.i18n.DateTimeSymbols_se', 'goog.i18n.DateTimeSymbols_se_FI', 'goog.i18n.DateTimeSymbols_se_NO', 'goog.i18n.DateTimeSymbols_seh', 'goog.i18n.DateTimeSymbols_seh_MZ', 'goog.i18n.DateTimeSymbols_ses', 'goog.i18n.DateTimeSymbols_ses_ML', 'goog.i18n.DateTimeSymbols_sg', 'goog.i18n.DateTimeSymbols_sg_CF', 'goog.i18n.DateTimeSymbols_shi', 'goog.i18n.DateTimeSymbols_shi_Latn', 'goog.i18n.DateTimeSymbols_shi_Latn_MA', 'goog.i18n.DateTimeSymbols_shi_Tfng', 'goog.i18n.DateTimeSymbols_shi_Tfng_MA', 'goog.i18n.DateTimeSymbols_si', 'goog.i18n.DateTimeSymbols_si_LK', 'goog.i18n.DateTimeSymbols_sk_SK', 'goog.i18n.DateTimeSymbols_sl_SI', 'goog.i18n.DateTimeSymbols_sn', 'goog.i18n.DateTimeSymbols_sn_ZW', 'goog.i18n.DateTimeSymbols_so', 'goog.i18n.DateTimeSymbols_so_DJ', 'goog.i18n.DateTimeSymbols_so_ET', 'goog.i18n.DateTimeSymbols_so_KE', 'goog.i18n.DateTimeSymbols_so_SO', 'goog.i18n.DateTimeSymbols_sq_AL', 'goog.i18n.DateTimeSymbols_sq_MK', 'goog.i18n.DateTimeSymbols_sq_XK', 'goog.i18n.DateTimeSymbols_sr_Cyrl', 'goog.i18n.DateTimeSymbols_sr_Cyrl_BA', 'goog.i18n.DateTimeSymbols_sr_Cyrl_ME', 'goog.i18n.DateTimeSymbols_sr_Cyrl_RS', 'goog.i18n.DateTimeSymbols_sr_Cyrl_XK', 'goog.i18n.DateTimeSymbols_sr_Latn', 'goog.i18n.DateTimeSymbols_sr_Latn_BA', 'goog.i18n.DateTimeSymbols_sr_Latn_ME', 'goog.i18n.DateTimeSymbols_sr_Latn_RS', 'goog.i18n.DateTimeSymbols_sr_Latn_XK', 'goog.i18n.DateTimeSymbols_ss', 'goog.i18n.DateTimeSymbols_ss_SZ', 'goog.i18n.DateTimeSymbols_ss_ZA', 'goog.i18n.DateTimeSymbols_ssy', 'goog.i18n.DateTimeSymbols_ssy_ER', 'goog.i18n.DateTimeSymbols_st', 'goog.i18n.DateTimeSymbols_st_LS', 'goog.i18n.DateTimeSymbols_st_ZA', 'goog.i18n.DateTimeSymbols_sv_AX', 'goog.i18n.DateTimeSymbols_sv_FI', 'goog.i18n.DateTimeSymbols_sv_SE', 'goog.i18n.DateTimeSymbols_sw_KE', 'goog.i18n.DateTimeSymbols_sw_TZ', 'goog.i18n.DateTimeSymbols_sw_UG', 'goog.i18n.DateTimeSymbols_swc', 'goog.i18n.DateTimeSymbols_swc_CD', 'goog.i18n.DateTimeSymbols_ta_IN', 'goog.i18n.DateTimeSymbols_ta_LK', 'goog.i18n.DateTimeSymbols_ta_MY', 'goog.i18n.DateTimeSymbols_ta_SG', 'goog.i18n.DateTimeSymbols_te_IN', 'goog.i18n.DateTimeSymbols_teo', 'goog.i18n.DateTimeSymbols_teo_KE', 'goog.i18n.DateTimeSymbols_teo_UG', 'goog.i18n.DateTimeSymbols_tg', 'goog.i18n.DateTimeSymbols_tg_Cyrl', 'goog.i18n.DateTimeSymbols_tg_Cyrl_TJ', 'goog.i18n.DateTimeSymbols_th_TH', 'goog.i18n.DateTimeSymbols_ti', 'goog.i18n.DateTimeSymbols_ti_ER', 'goog.i18n.DateTimeSymbols_ti_ET', 'goog.i18n.DateTimeSymbols_tig', 'goog.i18n.DateTimeSymbols_tig_ER', 'goog.i18n.DateTimeSymbols_tn', 'goog.i18n.DateTimeSymbols_tn_BW', 'goog.i18n.DateTimeSymbols_tn_ZA', 'goog.i18n.DateTimeSymbols_to', 'goog.i18n.DateTimeSymbols_to_TO', 'goog.i18n.DateTimeSymbols_tr_CY', 'goog.i18n.DateTimeSymbols_tr_TR', 'goog.i18n.DateTimeSymbols_ts', 'goog.i18n.DateTimeSymbols_ts_ZA', 'goog.i18n.DateTimeSymbols_twq', 'goog.i18n.DateTimeSymbols_twq_NE', 'goog.i18n.DateTimeSymbols_tzm', 'goog.i18n.DateTimeSymbols_tzm_Latn', 'goog.i18n.DateTimeSymbols_tzm_Latn_MA', 'goog.i18n.DateTimeSymbols_uk_UA', 'goog.i18n.DateTimeSymbols_ur_IN', 'goog.i18n.DateTimeSymbols_ur_PK', 'goog.i18n.DateTimeSymbols_uz', 'goog.i18n.DateTimeSymbols_uz_Arab', 'goog.i18n.DateTimeSymbols_uz_Arab_AF', 'goog.i18n.DateTimeSymbols_uz_Cyrl', 'goog.i18n.DateTimeSymbols_uz_Cyrl_UZ', 'goog.i18n.DateTimeSymbols_uz_Latn', 'goog.i18n.DateTimeSymbols_uz_Latn_UZ', 'goog.i18n.DateTimeSymbols_vai', 'goog.i18n.DateTimeSymbols_vai_Latn', 'goog.i18n.DateTimeSymbols_vai_Latn_LR', 'goog.i18n.DateTimeSymbols_vai_Vaii', 'goog.i18n.DateTimeSymbols_vai_Vaii_LR', 'goog.i18n.DateTimeSymbols_ve', 'goog.i18n.DateTimeSymbols_ve_ZA', 'goog.i18n.DateTimeSymbols_vi_VN', 'goog.i18n.DateTimeSymbols_vo', 'goog.i18n.DateTimeSymbols_vun', 'goog.i18n.DateTimeSymbols_vun_TZ', 'goog.i18n.DateTimeSymbols_wae', 'goog.i18n.DateTimeSymbols_wae_CH', 'goog.i18n.DateTimeSymbols_wal', 'goog.i18n.DateTimeSymbols_wal_ET', 'goog.i18n.DateTimeSymbols_xh', 'goog.i18n.DateTimeSymbols_xh_ZA', 'goog.i18n.DateTimeSymbols_xog', 'goog.i18n.DateTimeSymbols_xog_UG', 'goog.i18n.DateTimeSymbols_yav', 'goog.i18n.DateTimeSymbols_yav_CM', 'goog.i18n.DateTimeSymbols_yo', 'goog.i18n.DateTimeSymbols_yo_NG', 'goog.i18n.DateTimeSymbols_zh_Hans', 'goog.i18n.DateTimeSymbols_zh_Hans_CN', 'goog.i18n.DateTimeSymbols_zh_Hans_HK', 'goog.i18n.DateTimeSymbols_zh_Hans_MO', 'goog.i18n.DateTimeSymbols_zh_Hans_SG', 'goog.i18n.DateTimeSymbols_zh_Hant', 'goog.i18n.DateTimeSymbols_zh_Hant_HK', 'goog.i18n.DateTimeSymbols_zh_Hant_MO', 'goog.i18n.DateTimeSymbols_zh_Hant_TW', 'goog.i18n.DateTimeSymbols_zu_ZA'], ['goog.i18n.DateTimeSymbols']);
goog.addDependency('i18n/graphemebreak.js', ['goog.i18n.GraphemeBreak'], ['goog.structs.InversionMap']);
goog.addDependency('i18n/messageformat.js', ['goog.i18n.MessageFormat'], ['goog.asserts', 'goog.i18n.NumberFormat', 'goog.i18n.ordinalRules', 'goog.i18n.pluralRules']);
goog.addDependency('i18n/mime.js', ['goog.i18n.mime', 'goog.i18n.mime.encode'], ['goog.array']);
goog.addDependency('i18n/numberformat.js', ['goog.i18n.NumberFormat', 'goog.i18n.NumberFormat.CurrencyStyle', 'goog.i18n.NumberFormat.Format'], ['goog.asserts', 'goog.i18n.CompactNumberFormatSymbols', 'goog.i18n.NumberFormatSymbols', 'goog.i18n.currency', 'goog.math']);
goog.addDependency('i18n/numberformatsymbols.js', ['goog.i18n.NumberFormatSymbols', 'goog.i18n.NumberFormatSymbols_af', 'goog.i18n.NumberFormatSymbols_af_ZA', 'goog.i18n.NumberFormatSymbols_am', 'goog.i18n.NumberFormatSymbols_am_ET', 'goog.i18n.NumberFormatSymbols_ar', 'goog.i18n.NumberFormatSymbols_ar_001', 'goog.i18n.NumberFormatSymbols_ar_EG', 'goog.i18n.NumberFormatSymbols_bg', 'goog.i18n.NumberFormatSymbols_bg_BG', 'goog.i18n.NumberFormatSymbols_bn', 'goog.i18n.NumberFormatSymbols_bn_BD', 'goog.i18n.NumberFormatSymbols_br', 'goog.i18n.NumberFormatSymbols_br_FR', 'goog.i18n.NumberFormatSymbols_ca', 'goog.i18n.NumberFormatSymbols_ca_AD', 'goog.i18n.NumberFormatSymbols_ca_ES', 'goog.i18n.NumberFormatSymbols_chr', 'goog.i18n.NumberFormatSymbols_chr_US', 'goog.i18n.NumberFormatSymbols_cs', 'goog.i18n.NumberFormatSymbols_cs_CZ', 'goog.i18n.NumberFormatSymbols_cy', 'goog.i18n.NumberFormatSymbols_cy_GB', 'goog.i18n.NumberFormatSymbols_da', 'goog.i18n.NumberFormatSymbols_da_DK', 'goog.i18n.NumberFormatSymbols_de', 'goog.i18n.NumberFormatSymbols_de_AT', 'goog.i18n.NumberFormatSymbols_de_BE', 'goog.i18n.NumberFormatSymbols_de_CH', 'goog.i18n.NumberFormatSymbols_de_DE', 'goog.i18n.NumberFormatSymbols_de_LU', 'goog.i18n.NumberFormatSymbols_el', 'goog.i18n.NumberFormatSymbols_el_GR', 'goog.i18n.NumberFormatSymbols_en', 'goog.i18n.NumberFormatSymbols_en_AS', 'goog.i18n.NumberFormatSymbols_en_AU', 'goog.i18n.NumberFormatSymbols_en_Dsrt_US', 'goog.i18n.NumberFormatSymbols_en_FM', 'goog.i18n.NumberFormatSymbols_en_GB', 'goog.i18n.NumberFormatSymbols_en_GU', 'goog.i18n.NumberFormatSymbols_en_IE', 'goog.i18n.NumberFormatSymbols_en_IN', 'goog.i18n.NumberFormatSymbols_en_MH', 'goog.i18n.NumberFormatSymbols_en_MP', 'goog.i18n.NumberFormatSymbols_en_PR', 'goog.i18n.NumberFormatSymbols_en_PW', 'goog.i18n.NumberFormatSymbols_en_SG', 'goog.i18n.NumberFormatSymbols_en_TC', 'goog.i18n.NumberFormatSymbols_en_UM', 'goog.i18n.NumberFormatSymbols_en_US', 'goog.i18n.NumberFormatSymbols_en_VG', 'goog.i18n.NumberFormatSymbols_en_VI', 'goog.i18n.NumberFormatSymbols_en_ZA', 'goog.i18n.NumberFormatSymbols_es', 'goog.i18n.NumberFormatSymbols_es_419', 'goog.i18n.NumberFormatSymbols_es_EA', 'goog.i18n.NumberFormatSymbols_es_ES', 'goog.i18n.NumberFormatSymbols_es_IC', 'goog.i18n.NumberFormatSymbols_et', 'goog.i18n.NumberFormatSymbols_et_EE', 'goog.i18n.NumberFormatSymbols_eu', 'goog.i18n.NumberFormatSymbols_eu_ES', 'goog.i18n.NumberFormatSymbols_fa', 'goog.i18n.NumberFormatSymbols_fa_IR', 'goog.i18n.NumberFormatSymbols_fi', 'goog.i18n.NumberFormatSymbols_fi_FI', 'goog.i18n.NumberFormatSymbols_fil', 'goog.i18n.NumberFormatSymbols_fil_PH', 'goog.i18n.NumberFormatSymbols_fr', 'goog.i18n.NumberFormatSymbols_fr_BL', 'goog.i18n.NumberFormatSymbols_fr_CA', 'goog.i18n.NumberFormatSymbols_fr_FR', 'goog.i18n.NumberFormatSymbols_fr_GF', 'goog.i18n.NumberFormatSymbols_fr_GP', 'goog.i18n.NumberFormatSymbols_fr_MC', 'goog.i18n.NumberFormatSymbols_fr_MF', 'goog.i18n.NumberFormatSymbols_fr_MQ', 'goog.i18n.NumberFormatSymbols_fr_RE', 'goog.i18n.NumberFormatSymbols_fr_YT', 'goog.i18n.NumberFormatSymbols_gl', 'goog.i18n.NumberFormatSymbols_gl_ES', 'goog.i18n.NumberFormatSymbols_gsw', 'goog.i18n.NumberFormatSymbols_gsw_CH', 'goog.i18n.NumberFormatSymbols_gu', 'goog.i18n.NumberFormatSymbols_gu_IN', 'goog.i18n.NumberFormatSymbols_haw', 'goog.i18n.NumberFormatSymbols_haw_US', 'goog.i18n.NumberFormatSymbols_he', 'goog.i18n.NumberFormatSymbols_he_IL', 'goog.i18n.NumberFormatSymbols_hi', 'goog.i18n.NumberFormatSymbols_hi_IN', 'goog.i18n.NumberFormatSymbols_hr', 'goog.i18n.NumberFormatSymbols_hr_HR', 'goog.i18n.NumberFormatSymbols_hu', 'goog.i18n.NumberFormatSymbols_hu_HU', 'goog.i18n.NumberFormatSymbols_id', 'goog.i18n.NumberFormatSymbols_id_ID', 'goog.i18n.NumberFormatSymbols_in', 'goog.i18n.NumberFormatSymbols_is', 'goog.i18n.NumberFormatSymbols_is_IS', 'goog.i18n.NumberFormatSymbols_it', 'goog.i18n.NumberFormatSymbols_it_IT', 'goog.i18n.NumberFormatSymbols_it_SM', 'goog.i18n.NumberFormatSymbols_iw', 'goog.i18n.NumberFormatSymbols_ja', 'goog.i18n.NumberFormatSymbols_ja_JP', 'goog.i18n.NumberFormatSymbols_kn', 'goog.i18n.NumberFormatSymbols_kn_IN', 'goog.i18n.NumberFormatSymbols_ko', 'goog.i18n.NumberFormatSymbols_ko_KR', 'goog.i18n.NumberFormatSymbols_ln', 'goog.i18n.NumberFormatSymbols_ln_CD', 'goog.i18n.NumberFormatSymbols_lt', 'goog.i18n.NumberFormatSymbols_lt_LT', 'goog.i18n.NumberFormatSymbols_lv', 'goog.i18n.NumberFormatSymbols_lv_LV', 'goog.i18n.NumberFormatSymbols_ml', 'goog.i18n.NumberFormatSymbols_ml_IN', 'goog.i18n.NumberFormatSymbols_mr', 'goog.i18n.NumberFormatSymbols_mr_IN', 'goog.i18n.NumberFormatSymbols_ms', 'goog.i18n.NumberFormatSymbols_ms_Latn_MY', 'goog.i18n.NumberFormatSymbols_mt', 'goog.i18n.NumberFormatSymbols_mt_MT', 'goog.i18n.NumberFormatSymbols_nb', 'goog.i18n.NumberFormatSymbols_nb_NO', 'goog.i18n.NumberFormatSymbols_nl', 'goog.i18n.NumberFormatSymbols_nl_NL', 'goog.i18n.NumberFormatSymbols_no', 'goog.i18n.NumberFormatSymbols_or', 'goog.i18n.NumberFormatSymbols_or_IN', 'goog.i18n.NumberFormatSymbols_pl', 'goog.i18n.NumberFormatSymbols_pl_PL', 'goog.i18n.NumberFormatSymbols_pt', 'goog.i18n.NumberFormatSymbols_pt_BR', 'goog.i18n.NumberFormatSymbols_pt_PT', 'goog.i18n.NumberFormatSymbols_ro', 'goog.i18n.NumberFormatSymbols_ro_RO', 'goog.i18n.NumberFormatSymbols_ru', 'goog.i18n.NumberFormatSymbols_ru_RU', 'goog.i18n.NumberFormatSymbols_sk', 'goog.i18n.NumberFormatSymbols_sk_SK', 'goog.i18n.NumberFormatSymbols_sl', 'goog.i18n.NumberFormatSymbols_sl_SI', 'goog.i18n.NumberFormatSymbols_sq', 'goog.i18n.NumberFormatSymbols_sq_AL', 'goog.i18n.NumberFormatSymbols_sr', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_RS', 'goog.i18n.NumberFormatSymbols_sv', 'goog.i18n.NumberFormatSymbols_sv_SE', 'goog.i18n.NumberFormatSymbols_sw', 'goog.i18n.NumberFormatSymbols_sw_TZ', 'goog.i18n.NumberFormatSymbols_ta', 'goog.i18n.NumberFormatSymbols_ta_IN', 'goog.i18n.NumberFormatSymbols_te', 'goog.i18n.NumberFormatSymbols_te_IN', 'goog.i18n.NumberFormatSymbols_th', 'goog.i18n.NumberFormatSymbols_th_TH', 'goog.i18n.NumberFormatSymbols_tl', 'goog.i18n.NumberFormatSymbols_tr', 'goog.i18n.NumberFormatSymbols_tr_TR', 'goog.i18n.NumberFormatSymbols_uk', 'goog.i18n.NumberFormatSymbols_uk_UA', 'goog.i18n.NumberFormatSymbols_ur', 'goog.i18n.NumberFormatSymbols_ur_PK', 'goog.i18n.NumberFormatSymbols_vi', 'goog.i18n.NumberFormatSymbols_vi_VN', 'goog.i18n.NumberFormatSymbols_zh', 'goog.i18n.NumberFormatSymbols_zh_CN', 'goog.i18n.NumberFormatSymbols_zh_HK', 'goog.i18n.NumberFormatSymbols_zh_Hans_CN', 'goog.i18n.NumberFormatSymbols_zh_TW', 'goog.i18n.NumberFormatSymbols_zu', 'goog.i18n.NumberFormatSymbols_zu_ZA'], []);
goog.addDependency('i18n/numberformatsymbolsext.js', ['goog.i18n.NumberFormatSymbolsExt', 'goog.i18n.NumberFormatSymbols_aa', 'goog.i18n.NumberFormatSymbols_aa_DJ', 'goog.i18n.NumberFormatSymbols_aa_ER', 'goog.i18n.NumberFormatSymbols_aa_ET', 'goog.i18n.NumberFormatSymbols_af_NA', 'goog.i18n.NumberFormatSymbols_agq', 'goog.i18n.NumberFormatSymbols_agq_CM', 'goog.i18n.NumberFormatSymbols_ak', 'goog.i18n.NumberFormatSymbols_ak_GH', 'goog.i18n.NumberFormatSymbols_ar_AE', 'goog.i18n.NumberFormatSymbols_ar_BH', 'goog.i18n.NumberFormatSymbols_ar_DJ', 'goog.i18n.NumberFormatSymbols_ar_DZ', 'goog.i18n.NumberFormatSymbols_ar_EH', 'goog.i18n.NumberFormatSymbols_ar_ER', 'goog.i18n.NumberFormatSymbols_ar_IL', 'goog.i18n.NumberFormatSymbols_ar_IQ', 'goog.i18n.NumberFormatSymbols_ar_JO', 'goog.i18n.NumberFormatSymbols_ar_KM', 'goog.i18n.NumberFormatSymbols_ar_KW', 'goog.i18n.NumberFormatSymbols_ar_LB', 'goog.i18n.NumberFormatSymbols_ar_LY', 'goog.i18n.NumberFormatSymbols_ar_MA', 'goog.i18n.NumberFormatSymbols_ar_MR', 'goog.i18n.NumberFormatSymbols_ar_OM', 'goog.i18n.NumberFormatSymbols_ar_PS', 'goog.i18n.NumberFormatSymbols_ar_QA', 'goog.i18n.NumberFormatSymbols_ar_SA', 'goog.i18n.NumberFormatSymbols_ar_SD', 'goog.i18n.NumberFormatSymbols_ar_SO', 'goog.i18n.NumberFormatSymbols_ar_SY', 'goog.i18n.NumberFormatSymbols_ar_TD', 'goog.i18n.NumberFormatSymbols_ar_TN', 'goog.i18n.NumberFormatSymbols_ar_YE', 'goog.i18n.NumberFormatSymbols_as', 'goog.i18n.NumberFormatSymbols_as_IN', 'goog.i18n.NumberFormatSymbols_asa', 'goog.i18n.NumberFormatSymbols_asa_TZ', 'goog.i18n.NumberFormatSymbols_ast', 'goog.i18n.NumberFormatSymbols_ast_ES', 'goog.i18n.NumberFormatSymbols_az', 'goog.i18n.NumberFormatSymbols_az_Cyrl', 'goog.i18n.NumberFormatSymbols_az_Cyrl_AZ', 'goog.i18n.NumberFormatSymbols_az_Latn', 'goog.i18n.NumberFormatSymbols_az_Latn_AZ', 'goog.i18n.NumberFormatSymbols_bas', 'goog.i18n.NumberFormatSymbols_bas_CM', 'goog.i18n.NumberFormatSymbols_be', 'goog.i18n.NumberFormatSymbols_be_BY', 'goog.i18n.NumberFormatSymbols_bem', 'goog.i18n.NumberFormatSymbols_bem_ZM', 'goog.i18n.NumberFormatSymbols_bez', 'goog.i18n.NumberFormatSymbols_bez_TZ', 'goog.i18n.NumberFormatSymbols_bm', 'goog.i18n.NumberFormatSymbols_bm_ML', 'goog.i18n.NumberFormatSymbols_bn_IN', 'goog.i18n.NumberFormatSymbols_bo', 'goog.i18n.NumberFormatSymbols_bo_CN', 'goog.i18n.NumberFormatSymbols_bo_IN', 'goog.i18n.NumberFormatSymbols_brx', 'goog.i18n.NumberFormatSymbols_brx_IN', 'goog.i18n.NumberFormatSymbols_bs', 'goog.i18n.NumberFormatSymbols_bs_Cyrl', 'goog.i18n.NumberFormatSymbols_bs_Cyrl_BA', 'goog.i18n.NumberFormatSymbols_bs_Latn', 'goog.i18n.NumberFormatSymbols_bs_Latn_BA', 'goog.i18n.NumberFormatSymbols_byn', 'goog.i18n.NumberFormatSymbols_byn_ER', 'goog.i18n.NumberFormatSymbols_cgg', 'goog.i18n.NumberFormatSymbols_cgg_UG', 'goog.i18n.NumberFormatSymbols_ckb', 'goog.i18n.NumberFormatSymbols_ckb_Arab', 'goog.i18n.NumberFormatSymbols_ckb_Arab_IQ', 'goog.i18n.NumberFormatSymbols_ckb_Arab_IR', 'goog.i18n.NumberFormatSymbols_ckb_IQ', 'goog.i18n.NumberFormatSymbols_ckb_IR', 'goog.i18n.NumberFormatSymbols_ckb_Latn', 'goog.i18n.NumberFormatSymbols_ckb_Latn_IQ', 'goog.i18n.NumberFormatSymbols_dav', 'goog.i18n.NumberFormatSymbols_dav_KE', 'goog.i18n.NumberFormatSymbols_de_LI', 'goog.i18n.NumberFormatSymbols_dje', 'goog.i18n.NumberFormatSymbols_dje_NE', 'goog.i18n.NumberFormatSymbols_dua', 'goog.i18n.NumberFormatSymbols_dua_CM', 'goog.i18n.NumberFormatSymbols_dyo', 'goog.i18n.NumberFormatSymbols_dyo_SN', 'goog.i18n.NumberFormatSymbols_dz', 'goog.i18n.NumberFormatSymbols_dz_BT', 'goog.i18n.NumberFormatSymbols_ebu', 'goog.i18n.NumberFormatSymbols_ebu_KE', 'goog.i18n.NumberFormatSymbols_ee', 'goog.i18n.NumberFormatSymbols_ee_GH', 'goog.i18n.NumberFormatSymbols_ee_TG', 'goog.i18n.NumberFormatSymbols_el_CY', 'goog.i18n.NumberFormatSymbols_en_150', 'goog.i18n.NumberFormatSymbols_en_AG', 'goog.i18n.NumberFormatSymbols_en_BB', 'goog.i18n.NumberFormatSymbols_en_BE', 'goog.i18n.NumberFormatSymbols_en_BM', 'goog.i18n.NumberFormatSymbols_en_BS', 'goog.i18n.NumberFormatSymbols_en_BW', 'goog.i18n.NumberFormatSymbols_en_BZ', 'goog.i18n.NumberFormatSymbols_en_CA', 'goog.i18n.NumberFormatSymbols_en_CM', 'goog.i18n.NumberFormatSymbols_en_DM', 'goog.i18n.NumberFormatSymbols_en_Dsrt', 'goog.i18n.NumberFormatSymbols_en_FJ', 'goog.i18n.NumberFormatSymbols_en_GD', 'goog.i18n.NumberFormatSymbols_en_GG', 'goog.i18n.NumberFormatSymbols_en_GH', 'goog.i18n.NumberFormatSymbols_en_GI', 'goog.i18n.NumberFormatSymbols_en_GM', 'goog.i18n.NumberFormatSymbols_en_GY', 'goog.i18n.NumberFormatSymbols_en_HK', 'goog.i18n.NumberFormatSymbols_en_IM', 'goog.i18n.NumberFormatSymbols_en_JE', 'goog.i18n.NumberFormatSymbols_en_JM', 'goog.i18n.NumberFormatSymbols_en_KE', 'goog.i18n.NumberFormatSymbols_en_KI', 'goog.i18n.NumberFormatSymbols_en_KN', 'goog.i18n.NumberFormatSymbols_en_KY', 'goog.i18n.NumberFormatSymbols_en_LC', 'goog.i18n.NumberFormatSymbols_en_LR', 'goog.i18n.NumberFormatSymbols_en_LS', 'goog.i18n.NumberFormatSymbols_en_MG', 'goog.i18n.NumberFormatSymbols_en_MT', 'goog.i18n.NumberFormatSymbols_en_MU', 'goog.i18n.NumberFormatSymbols_en_MW', 'goog.i18n.NumberFormatSymbols_en_NA', 'goog.i18n.NumberFormatSymbols_en_NG', 'goog.i18n.NumberFormatSymbols_en_NZ', 'goog.i18n.NumberFormatSymbols_en_PG', 'goog.i18n.NumberFormatSymbols_en_PH', 'goog.i18n.NumberFormatSymbols_en_PK', 'goog.i18n.NumberFormatSymbols_en_SB', 'goog.i18n.NumberFormatSymbols_en_SC', 'goog.i18n.NumberFormatSymbols_en_SL', 'goog.i18n.NumberFormatSymbols_en_SS', 'goog.i18n.NumberFormatSymbols_en_SZ', 'goog.i18n.NumberFormatSymbols_en_TO', 'goog.i18n.NumberFormatSymbols_en_TT', 'goog.i18n.NumberFormatSymbols_en_TZ', 'goog.i18n.NumberFormatSymbols_en_UG', 'goog.i18n.NumberFormatSymbols_en_VC', 'goog.i18n.NumberFormatSymbols_en_VU', 'goog.i18n.NumberFormatSymbols_en_WS', 'goog.i18n.NumberFormatSymbols_en_ZM', 'goog.i18n.NumberFormatSymbols_en_ZW', 'goog.i18n.NumberFormatSymbols_eo', 'goog.i18n.NumberFormatSymbols_es_AR', 'goog.i18n.NumberFormatSymbols_es_BO', 'goog.i18n.NumberFormatSymbols_es_CL', 'goog.i18n.NumberFormatSymbols_es_CO', 'goog.i18n.NumberFormatSymbols_es_CR', 'goog.i18n.NumberFormatSymbols_es_CU', 'goog.i18n.NumberFormatSymbols_es_DO', 'goog.i18n.NumberFormatSymbols_es_EC', 'goog.i18n.NumberFormatSymbols_es_GQ', 'goog.i18n.NumberFormatSymbols_es_GT', 'goog.i18n.NumberFormatSymbols_es_HN', 'goog.i18n.NumberFormatSymbols_es_MX', 'goog.i18n.NumberFormatSymbols_es_NI', 'goog.i18n.NumberFormatSymbols_es_PA', 'goog.i18n.NumberFormatSymbols_es_PE', 'goog.i18n.NumberFormatSymbols_es_PH', 'goog.i18n.NumberFormatSymbols_es_PR', 'goog.i18n.NumberFormatSymbols_es_PY', 'goog.i18n.NumberFormatSymbols_es_SV', 'goog.i18n.NumberFormatSymbols_es_US', 'goog.i18n.NumberFormatSymbols_es_UY', 'goog.i18n.NumberFormatSymbols_es_VE', 'goog.i18n.NumberFormatSymbols_ewo', 'goog.i18n.NumberFormatSymbols_ewo_CM', 'goog.i18n.NumberFormatSymbols_fa_AF', 'goog.i18n.NumberFormatSymbols_ff', 'goog.i18n.NumberFormatSymbols_ff_SN', 'goog.i18n.NumberFormatSymbols_fo', 'goog.i18n.NumberFormatSymbols_fo_FO', 'goog.i18n.NumberFormatSymbols_fr_BE', 'goog.i18n.NumberFormatSymbols_fr_BF', 'goog.i18n.NumberFormatSymbols_fr_BI', 'goog.i18n.NumberFormatSymbols_fr_BJ', 'goog.i18n.NumberFormatSymbols_fr_CD', 'goog.i18n.NumberFormatSymbols_fr_CF', 'goog.i18n.NumberFormatSymbols_fr_CG', 'goog.i18n.NumberFormatSymbols_fr_CH', 'goog.i18n.NumberFormatSymbols_fr_CI', 'goog.i18n.NumberFormatSymbols_fr_CM', 'goog.i18n.NumberFormatSymbols_fr_DJ', 'goog.i18n.NumberFormatSymbols_fr_DZ', 'goog.i18n.NumberFormatSymbols_fr_GA', 'goog.i18n.NumberFormatSymbols_fr_GN', 'goog.i18n.NumberFormatSymbols_fr_GQ', 'goog.i18n.NumberFormatSymbols_fr_HT', 'goog.i18n.NumberFormatSymbols_fr_KM', 'goog.i18n.NumberFormatSymbols_fr_LU', 'goog.i18n.NumberFormatSymbols_fr_MA', 'goog.i18n.NumberFormatSymbols_fr_MG', 'goog.i18n.NumberFormatSymbols_fr_ML', 'goog.i18n.NumberFormatSymbols_fr_MR', 'goog.i18n.NumberFormatSymbols_fr_MU', 'goog.i18n.NumberFormatSymbols_fr_NC', 'goog.i18n.NumberFormatSymbols_fr_NE', 'goog.i18n.NumberFormatSymbols_fr_PF', 'goog.i18n.NumberFormatSymbols_fr_RW', 'goog.i18n.NumberFormatSymbols_fr_SC', 'goog.i18n.NumberFormatSymbols_fr_SN', 'goog.i18n.NumberFormatSymbols_fr_SY', 'goog.i18n.NumberFormatSymbols_fr_TD', 'goog.i18n.NumberFormatSymbols_fr_TG', 'goog.i18n.NumberFormatSymbols_fr_TN', 'goog.i18n.NumberFormatSymbols_fr_VU', 'goog.i18n.NumberFormatSymbols_fur', 'goog.i18n.NumberFormatSymbols_fur_IT', 'goog.i18n.NumberFormatSymbols_ga', 'goog.i18n.NumberFormatSymbols_ga_IE', 'goog.i18n.NumberFormatSymbols_gd', 'goog.i18n.NumberFormatSymbols_gd_GB', 'goog.i18n.NumberFormatSymbols_guz', 'goog.i18n.NumberFormatSymbols_guz_KE', 'goog.i18n.NumberFormatSymbols_gv', 'goog.i18n.NumberFormatSymbols_gv_GB', 'goog.i18n.NumberFormatSymbols_ha', 'goog.i18n.NumberFormatSymbols_ha_Latn', 'goog.i18n.NumberFormatSymbols_ha_Latn_GH', 'goog.i18n.NumberFormatSymbols_ha_Latn_NE', 'goog.i18n.NumberFormatSymbols_ha_Latn_NG', 'goog.i18n.NumberFormatSymbols_hr_BA', 'goog.i18n.NumberFormatSymbols_hy', 'goog.i18n.NumberFormatSymbols_hy_AM', 'goog.i18n.NumberFormatSymbols_ia', 'goog.i18n.NumberFormatSymbols_ia_FR', 'goog.i18n.NumberFormatSymbols_ig', 'goog.i18n.NumberFormatSymbols_ig_NG', 'goog.i18n.NumberFormatSymbols_ii', 'goog.i18n.NumberFormatSymbols_ii_CN', 'goog.i18n.NumberFormatSymbols_it_CH', 'goog.i18n.NumberFormatSymbols_jgo', 'goog.i18n.NumberFormatSymbols_jgo_CM', 'goog.i18n.NumberFormatSymbols_jmc', 'goog.i18n.NumberFormatSymbols_jmc_TZ', 'goog.i18n.NumberFormatSymbols_ka', 'goog.i18n.NumberFormatSymbols_ka_GE', 'goog.i18n.NumberFormatSymbols_kab', 'goog.i18n.NumberFormatSymbols_kab_DZ', 'goog.i18n.NumberFormatSymbols_kam', 'goog.i18n.NumberFormatSymbols_kam_KE', 'goog.i18n.NumberFormatSymbols_kde', 'goog.i18n.NumberFormatSymbols_kde_TZ', 'goog.i18n.NumberFormatSymbols_kea', 'goog.i18n.NumberFormatSymbols_kea_CV', 'goog.i18n.NumberFormatSymbols_khq', 'goog.i18n.NumberFormatSymbols_khq_ML', 'goog.i18n.NumberFormatSymbols_ki', 'goog.i18n.NumberFormatSymbols_ki_KE', 'goog.i18n.NumberFormatSymbols_kk', 'goog.i18n.NumberFormatSymbols_kk_Cyrl', 'goog.i18n.NumberFormatSymbols_kk_Cyrl_KZ', 'goog.i18n.NumberFormatSymbols_kkj', 'goog.i18n.NumberFormatSymbols_kkj_CM', 'goog.i18n.NumberFormatSymbols_kl', 'goog.i18n.NumberFormatSymbols_kl_GL', 'goog.i18n.NumberFormatSymbols_kln', 'goog.i18n.NumberFormatSymbols_kln_KE', 'goog.i18n.NumberFormatSymbols_km', 'goog.i18n.NumberFormatSymbols_km_KH', 'goog.i18n.NumberFormatSymbols_ko_KP', 'goog.i18n.NumberFormatSymbols_kok', 'goog.i18n.NumberFormatSymbols_kok_IN', 'goog.i18n.NumberFormatSymbols_ks', 'goog.i18n.NumberFormatSymbols_ks_Arab', 'goog.i18n.NumberFormatSymbols_ks_Arab_IN', 'goog.i18n.NumberFormatSymbols_ksb', 'goog.i18n.NumberFormatSymbols_ksb_TZ', 'goog.i18n.NumberFormatSymbols_ksf', 'goog.i18n.NumberFormatSymbols_ksf_CM', 'goog.i18n.NumberFormatSymbols_ksh', 'goog.i18n.NumberFormatSymbols_ksh_DE', 'goog.i18n.NumberFormatSymbols_kw', 'goog.i18n.NumberFormatSymbols_kw_GB', 'goog.i18n.NumberFormatSymbols_ky', 'goog.i18n.NumberFormatSymbols_ky_KG', 'goog.i18n.NumberFormatSymbols_lag', 'goog.i18n.NumberFormatSymbols_lag_TZ', 'goog.i18n.NumberFormatSymbols_lg', 'goog.i18n.NumberFormatSymbols_lg_UG', 'goog.i18n.NumberFormatSymbols_ln_AO', 'goog.i18n.NumberFormatSymbols_ln_CF', 'goog.i18n.NumberFormatSymbols_ln_CG', 'goog.i18n.NumberFormatSymbols_lo', 'goog.i18n.NumberFormatSymbols_lo_LA', 'goog.i18n.NumberFormatSymbols_lu', 'goog.i18n.NumberFormatSymbols_lu_CD', 'goog.i18n.NumberFormatSymbols_luo', 'goog.i18n.NumberFormatSymbols_luo_KE', 'goog.i18n.NumberFormatSymbols_luy', 'goog.i18n.NumberFormatSymbols_luy_KE', 'goog.i18n.NumberFormatSymbols_mas', 'goog.i18n.NumberFormatSymbols_mas_KE', 'goog.i18n.NumberFormatSymbols_mas_TZ', 'goog.i18n.NumberFormatSymbols_mer', 'goog.i18n.NumberFormatSymbols_mer_KE', 'goog.i18n.NumberFormatSymbols_mfe', 'goog.i18n.NumberFormatSymbols_mfe_MU', 'goog.i18n.NumberFormatSymbols_mg', 'goog.i18n.NumberFormatSymbols_mg_MG', 'goog.i18n.NumberFormatSymbols_mgh', 'goog.i18n.NumberFormatSymbols_mgh_MZ', 'goog.i18n.NumberFormatSymbols_mgo', 'goog.i18n.NumberFormatSymbols_mgo_CM', 'goog.i18n.NumberFormatSymbols_mk', 'goog.i18n.NumberFormatSymbols_mk_MK', 'goog.i18n.NumberFormatSymbols_mn', 'goog.i18n.NumberFormatSymbols_mn_Cyrl', 'goog.i18n.NumberFormatSymbols_mn_Cyrl_MN', 'goog.i18n.NumberFormatSymbols_ms_Latn', 'goog.i18n.NumberFormatSymbols_ms_Latn_BN', 'goog.i18n.NumberFormatSymbols_ms_Latn_SG', 'goog.i18n.NumberFormatSymbols_mua', 'goog.i18n.NumberFormatSymbols_mua_CM', 'goog.i18n.NumberFormatSymbols_my', 'goog.i18n.NumberFormatSymbols_my_MM', 'goog.i18n.NumberFormatSymbols_naq', 'goog.i18n.NumberFormatSymbols_naq_NA', 'goog.i18n.NumberFormatSymbols_nd', 'goog.i18n.NumberFormatSymbols_nd_ZW', 'goog.i18n.NumberFormatSymbols_ne', 'goog.i18n.NumberFormatSymbols_ne_IN', 'goog.i18n.NumberFormatSymbols_ne_NP', 'goog.i18n.NumberFormatSymbols_nl_AW', 'goog.i18n.NumberFormatSymbols_nl_BE', 'goog.i18n.NumberFormatSymbols_nl_CW', 'goog.i18n.NumberFormatSymbols_nl_SR', 'goog.i18n.NumberFormatSymbols_nl_SX', 'goog.i18n.NumberFormatSymbols_nmg', 'goog.i18n.NumberFormatSymbols_nmg_CM', 'goog.i18n.NumberFormatSymbols_nn', 'goog.i18n.NumberFormatSymbols_nn_NO', 'goog.i18n.NumberFormatSymbols_nnh', 'goog.i18n.NumberFormatSymbols_nnh_CM', 'goog.i18n.NumberFormatSymbols_nr', 'goog.i18n.NumberFormatSymbols_nr_ZA', 'goog.i18n.NumberFormatSymbols_nso', 'goog.i18n.NumberFormatSymbols_nso_ZA', 'goog.i18n.NumberFormatSymbols_nus', 'goog.i18n.NumberFormatSymbols_nus_SD', 'goog.i18n.NumberFormatSymbols_nyn', 'goog.i18n.NumberFormatSymbols_nyn_UG', 'goog.i18n.NumberFormatSymbols_om', 'goog.i18n.NumberFormatSymbols_om_ET', 'goog.i18n.NumberFormatSymbols_om_KE', 'goog.i18n.NumberFormatSymbols_os', 'goog.i18n.NumberFormatSymbols_os_GE', 'goog.i18n.NumberFormatSymbols_os_RU', 'goog.i18n.NumberFormatSymbols_pa', 'goog.i18n.NumberFormatSymbols_pa_Arab', 'goog.i18n.NumberFormatSymbols_pa_Arab_PK', 'goog.i18n.NumberFormatSymbols_pa_Guru', 'goog.i18n.NumberFormatSymbols_pa_Guru_IN', 'goog.i18n.NumberFormatSymbols_ps', 'goog.i18n.NumberFormatSymbols_ps_AF', 'goog.i18n.NumberFormatSymbols_pt_AO', 'goog.i18n.NumberFormatSymbols_pt_CV', 'goog.i18n.NumberFormatSymbols_pt_GW', 'goog.i18n.NumberFormatSymbols_pt_MO', 'goog.i18n.NumberFormatSymbols_pt_MZ', 'goog.i18n.NumberFormatSymbols_pt_ST', 'goog.i18n.NumberFormatSymbols_pt_TL', 'goog.i18n.NumberFormatSymbols_rm', 'goog.i18n.NumberFormatSymbols_rm_CH', 'goog.i18n.NumberFormatSymbols_rn', 'goog.i18n.NumberFormatSymbols_rn_BI', 'goog.i18n.NumberFormatSymbols_ro_MD', 'goog.i18n.NumberFormatSymbols_rof', 'goog.i18n.NumberFormatSymbols_rof_TZ', 'goog.i18n.NumberFormatSymbols_ru_BY', 'goog.i18n.NumberFormatSymbols_ru_KG', 'goog.i18n.NumberFormatSymbols_ru_KZ', 'goog.i18n.NumberFormatSymbols_ru_MD', 'goog.i18n.NumberFormatSymbols_ru_UA', 'goog.i18n.NumberFormatSymbols_rw', 'goog.i18n.NumberFormatSymbols_rw_RW', 'goog.i18n.NumberFormatSymbols_rwk', 'goog.i18n.NumberFormatSymbols_rwk_TZ', 'goog.i18n.NumberFormatSymbols_sah', 'goog.i18n.NumberFormatSymbols_sah_RU', 'goog.i18n.NumberFormatSymbols_saq', 'goog.i18n.NumberFormatSymbols_saq_KE', 'goog.i18n.NumberFormatSymbols_sbp', 'goog.i18n.NumberFormatSymbols_sbp_TZ', 'goog.i18n.NumberFormatSymbols_se', 'goog.i18n.NumberFormatSymbols_se_FI', 'goog.i18n.NumberFormatSymbols_se_NO', 'goog.i18n.NumberFormatSymbols_seh', 'goog.i18n.NumberFormatSymbols_seh_MZ', 'goog.i18n.NumberFormatSymbols_ses', 'goog.i18n.NumberFormatSymbols_ses_ML', 'goog.i18n.NumberFormatSymbols_sg', 'goog.i18n.NumberFormatSymbols_sg_CF', 'goog.i18n.NumberFormatSymbols_shi', 'goog.i18n.NumberFormatSymbols_shi_Latn', 'goog.i18n.NumberFormatSymbols_shi_Latn_MA', 'goog.i18n.NumberFormatSymbols_shi_Tfng', 'goog.i18n.NumberFormatSymbols_shi_Tfng_MA', 'goog.i18n.NumberFormatSymbols_si', 'goog.i18n.NumberFormatSymbols_si_LK', 'goog.i18n.NumberFormatSymbols_sn', 'goog.i18n.NumberFormatSymbols_sn_ZW', 'goog.i18n.NumberFormatSymbols_so', 'goog.i18n.NumberFormatSymbols_so_DJ', 'goog.i18n.NumberFormatSymbols_so_ET', 'goog.i18n.NumberFormatSymbols_so_KE', 'goog.i18n.NumberFormatSymbols_so_SO', 'goog.i18n.NumberFormatSymbols_sq_MK', 'goog.i18n.NumberFormatSymbols_sq_XK', 'goog.i18n.NumberFormatSymbols_sr_Cyrl', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_BA', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_ME', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_XK', 'goog.i18n.NumberFormatSymbols_sr_Latn', 'goog.i18n.NumberFormatSymbols_sr_Latn_BA', 'goog.i18n.NumberFormatSymbols_sr_Latn_ME', 'goog.i18n.NumberFormatSymbols_sr_Latn_RS', 'goog.i18n.NumberFormatSymbols_sr_Latn_XK', 'goog.i18n.NumberFormatSymbols_ss', 'goog.i18n.NumberFormatSymbols_ss_SZ', 'goog.i18n.NumberFormatSymbols_ss_ZA', 'goog.i18n.NumberFormatSymbols_ssy', 'goog.i18n.NumberFormatSymbols_ssy_ER', 'goog.i18n.NumberFormatSymbols_st', 'goog.i18n.NumberFormatSymbols_st_LS', 'goog.i18n.NumberFormatSymbols_st_ZA', 'goog.i18n.NumberFormatSymbols_sv_AX', 'goog.i18n.NumberFormatSymbols_sv_FI', 'goog.i18n.NumberFormatSymbols_sw_KE', 'goog.i18n.NumberFormatSymbols_sw_UG', 'goog.i18n.NumberFormatSymbols_swc', 'goog.i18n.NumberFormatSymbols_swc_CD', 'goog.i18n.NumberFormatSymbols_ta_LK', 'goog.i18n.NumberFormatSymbols_ta_MY', 'goog.i18n.NumberFormatSymbols_ta_SG', 'goog.i18n.NumberFormatSymbols_teo', 'goog.i18n.NumberFormatSymbols_teo_KE', 'goog.i18n.NumberFormatSymbols_teo_UG', 'goog.i18n.NumberFormatSymbols_tg', 'goog.i18n.NumberFormatSymbols_tg_Cyrl', 'goog.i18n.NumberFormatSymbols_tg_Cyrl_TJ', 'goog.i18n.NumberFormatSymbols_ti', 'goog.i18n.NumberFormatSymbols_ti_ER', 'goog.i18n.NumberFormatSymbols_ti_ET', 'goog.i18n.NumberFormatSymbols_tig', 'goog.i18n.NumberFormatSymbols_tig_ER', 'goog.i18n.NumberFormatSymbols_tn', 'goog.i18n.NumberFormatSymbols_tn_BW', 'goog.i18n.NumberFormatSymbols_tn_ZA', 'goog.i18n.NumberFormatSymbols_to', 'goog.i18n.NumberFormatSymbols_to_TO', 'goog.i18n.NumberFormatSymbols_tr_CY', 'goog.i18n.NumberFormatSymbols_ts', 'goog.i18n.NumberFormatSymbols_ts_ZA', 'goog.i18n.NumberFormatSymbols_twq', 'goog.i18n.NumberFormatSymbols_twq_NE', 'goog.i18n.NumberFormatSymbols_tzm', 'goog.i18n.NumberFormatSymbols_tzm_Latn', 'goog.i18n.NumberFormatSymbols_tzm_Latn_MA', 'goog.i18n.NumberFormatSymbols_ur_IN', 'goog.i18n.NumberFormatSymbols_uz', 'goog.i18n.NumberFormatSymbols_uz_Arab', 'goog.i18n.NumberFormatSymbols_uz_Arab_AF', 'goog.i18n.NumberFormatSymbols_uz_Cyrl', 'goog.i18n.NumberFormatSymbols_uz_Cyrl_UZ', 'goog.i18n.NumberFormatSymbols_uz_Latn', 'goog.i18n.NumberFormatSymbols_uz_Latn_UZ', 'goog.i18n.NumberFormatSymbols_vai', 'goog.i18n.NumberFormatSymbols_vai_Latn', 'goog.i18n.NumberFormatSymbols_vai_Latn_LR', 'goog.i18n.NumberFormatSymbols_vai_Vaii', 'goog.i18n.NumberFormatSymbols_vai_Vaii_LR', 'goog.i18n.NumberFormatSymbols_ve', 'goog.i18n.NumberFormatSymbols_ve_ZA', 'goog.i18n.NumberFormatSymbols_vo', 'goog.i18n.NumberFormatSymbols_vun', 'goog.i18n.NumberFormatSymbols_vun_TZ', 'goog.i18n.NumberFormatSymbols_wae', 'goog.i18n.NumberFormatSymbols_wae_CH', 'goog.i18n.NumberFormatSymbols_wal', 'goog.i18n.NumberFormatSymbols_wal_ET', 'goog.i18n.NumberFormatSymbols_xh', 'goog.i18n.NumberFormatSymbols_xh_ZA', 'goog.i18n.NumberFormatSymbols_xog', 'goog.i18n.NumberFormatSymbols_xog_UG', 'goog.i18n.NumberFormatSymbols_yav', 'goog.i18n.NumberFormatSymbols_yav_CM', 'goog.i18n.NumberFormatSymbols_yo', 'goog.i18n.NumberFormatSymbols_yo_NG', 'goog.i18n.NumberFormatSymbols_zh_Hans', 'goog.i18n.NumberFormatSymbols_zh_Hans_HK', 'goog.i18n.NumberFormatSymbols_zh_Hans_MO', 'goog.i18n.NumberFormatSymbols_zh_Hans_SG', 'goog.i18n.NumberFormatSymbols_zh_Hant', 'goog.i18n.NumberFormatSymbols_zh_Hant_HK', 'goog.i18n.NumberFormatSymbols_zh_Hant_MO', 'goog.i18n.NumberFormatSymbols_zh_Hant_TW'], ['goog.i18n.NumberFormatSymbols']);
goog.addDependency('i18n/ordinalrules.js', ['goog.i18n.ordinalRules'], []);
goog.addDependency('i18n/pluralrules.js', ['goog.i18n.pluralRules'], []);
goog.addDependency('i18n/timezone.js', ['goog.i18n.TimeZone'], ['goog.array', 'goog.date.DateLike', 'goog.string']);
goog.addDependency('i18n/uchar.js', ['goog.i18n.uChar'], []);
goog.addDependency('i18n/uchar/localnamefetcher.js', ['goog.i18n.uChar.LocalNameFetcher'], ['goog.i18n.uChar', 'goog.i18n.uChar.NameFetcher', 'goog.log']);
goog.addDependency('i18n/uchar/namefetcher.js', ['goog.i18n.uChar.NameFetcher'], []);
goog.addDependency('i18n/uchar/remotenamefetcher.js', ['goog.i18n.uChar.RemoteNameFetcher'], ['goog.Disposable', 'goog.Uri', 'goog.i18n.uChar', 'goog.i18n.uChar.NameFetcher', 'goog.log', 'goog.net.XhrIo', 'goog.structs.Map']);
goog.addDependency('iter/iter.js', ['goog.iter', 'goog.iter.Iterator', 'goog.iter.StopIteration'], ['goog.array', 'goog.asserts']);
goog.addDependency('json/evaljsonprocessor.js', ['goog.json.EvalJsonProcessor'], ['goog.json', 'goog.json.Processor', 'goog.json.Serializer']);
goog.addDependency('json/json.js', ['goog.json', 'goog.json.Serializer'], []);
goog.addDependency('json/nativejsonprocessor.js', ['goog.json.NativeJsonProcessor'], ['goog.asserts', 'goog.json', 'goog.json.Processor']);
goog.addDependency('json/processor.js', ['goog.json.Processor'], ['goog.string.Parser', 'goog.string.Stringifier']);
goog.addDependency('labs/classdef/classdef.js', ['goog.labs.classdef'], []);
goog.addDependency('labs/events/touch.js', ['goog.labs.events.touch', 'goog.labs.events.touch.TouchData'], ['goog.array', 'goog.asserts', 'goog.events.EventType', 'goog.string']);
goog.addDependency('labs/events/touch_test.js', ['goog.labs.events.touchTest'], ['goog.labs.events.touch', 'goog.testing.jsunit']);
goog.addDependency('labs/format/csv.js', ['goog.labs.format.csv', 'goog.labs.format.csv.ParseError', 'goog.labs.format.csv.Token'], ['goog.array', 'goog.asserts', 'goog.debug.Error', 'goog.object', 'goog.string', 'goog.string.newlines']);
goog.addDependency('labs/format/csv_test.js', ['goog.labs.format.csvTest'], ['goog.labs.format.csv', 'goog.labs.format.csv.ParseError', 'goog.object', 'goog.testing.asserts', 'goog.testing.jsunit']);
goog.addDependency('labs/mock/mock.js', ['goog.labs.mock'], ['goog.array', 'goog.debug', 'goog.debug.Error', 'goog.functions', 'goog.json']);
goog.addDependency('labs/net/image.js', ['goog.labs.net.image'], ['goog.events.EventHandler', 'goog.events.EventType', 'goog.net.EventType', 'goog.result.SimpleResult', 'goog.userAgent']);
goog.addDependency('labs/net/image_test.js', ['goog.labs.net.imageTest'], ['goog.events', 'goog.labs.net.image', 'goog.result', 'goog.result.Result', 'goog.string', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('labs/net/webchannel.js', ['goog.net.WebChannel'], ['goog.events', 'goog.events.Event']);
goog.addDependency('labs/net/webchannel/basetestchannel.js', ['goog.labs.net.webChannel.BaseTestChannel'], ['goog.json.EvalJsonProcessor', 'goog.labs.net.webChannel.Channel', 'goog.labs.net.webChannel.WebChannelRequest', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.ServerReachability', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.net.tmpnetwork']);
goog.addDependency('labs/net/webchannel/channel.js', ['goog.labs.net.webChannel.Channel'], []);
goog.addDependency('labs/net/webchannel/requeststats.js', ['goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Event', 'goog.labs.net.webChannel.requestStats.ServerReachability', 'goog.labs.net.webChannel.requestStats.ServerReachabilityEvent', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.labs.net.webChannel.requestStats.StatEvent', 'goog.labs.net.webChannel.requestStats.TimingEvent'], ['goog.events.Event', 'goog.events.EventTarget']);
goog.addDependency('labs/net/webchannel/webchannelbase.js', ['goog.labs.net.webChannel.WebChannelBase'], ['goog.Uri', 'goog.array', 'goog.asserts', 'goog.debug.TextFormatter', 'goog.json', 'goog.json.EvalJsonProcessor', 'goog.labs.net.webChannel.BaseTestChannel', 'goog.labs.net.webChannel.Channel', 'goog.labs.net.webChannel.WebChannelDebug', 'goog.labs.net.webChannel.WebChannelRequest', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.log', 'goog.net.XhrIo', 'goog.net.tmpnetwork', 'goog.string', 'goog.structs', 'goog.structs.CircularBuffer']);
goog.addDependency('labs/net/webchannel/webchannelbase_test.js', ['goog.labs.net.webChannel.webChannelBaseTest'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.functions', 'goog.json', 'goog.labs.net.webChannel.WebChannelBase', 'goog.labs.net.webChannel.WebChannelDebug', 'goog.labs.net.webChannel.WebChannelRequest', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.net.tmpnetwork', 'goog.structs.Map', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('labs/net/webchannel/webchannelbasetransport.js', ['goog.labs.net.webChannel.WebChannelBaseTransport'], ['goog.asserts', 'goog.events.EventTarget', 'goog.labs.net.webChannel.WebChannelBase', 'goog.log', 'goog.net.WebChannel', 'goog.net.WebChannelTransport', 'goog.string.path']);
goog.addDependency('labs/net/webchannel/webchanneldebug.js', ['goog.labs.net.webChannel.WebChannelDebug'], ['goog.json', 'goog.log']);
goog.addDependency('labs/net/webchannel/webchannelrequest.js', ['goog.labs.net.webChannel.WebChannelRequest'], ['goog.Timer', 'goog.async.Throttle', 'goog.events.EventHandler', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.ServerReachability', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XmlHttp', 'goog.object', 'goog.userAgent']);
goog.addDependency('labs/net/webchanneltransport.js', ['goog.net.WebChannelTransport'], []);
goog.addDependency('labs/net/webchanneltransportfactory.js', ['goog.net.createWebChannelTransport'], ['goog.functions', 'goog.labs.net.webChannel.WebChannelBaseTransport']);
goog.addDependency('labs/net/xhr.js', ['goog.labs.net.xhr', 'goog.labs.net.xhr.Error', 'goog.labs.net.xhr.HttpError', 'goog.labs.net.xhr.TimeoutError'], ['goog.debug.Error', 'goog.json', 'goog.net.HttpStatus', 'goog.net.XmlHttp', 'goog.result', 'goog.result.SimpleResult', 'goog.string', 'goog.uri.utils']);
goog.addDependency('labs/object/object.js', ['goog.labs.object'], []);
goog.addDependency('labs/observe/notice.js', ['goog.labs.observe.Notice'], []);
goog.addDependency('labs/observe/observable.js', ['goog.labs.observe.Observable'], ['goog.disposable.IDisposable']);
goog.addDependency('labs/observe/observableset.js', ['goog.labs.observe.ObservableSet'], ['goog.array', 'goog.labs.observe.Observer']);
goog.addDependency('labs/observe/observationset.js', ['goog.labs.observe.ObservationSet'], ['goog.array', 'goog.labs.observe.Observer']);
goog.addDependency('labs/observe/observer.js', ['goog.labs.observe.Observer'], []);
goog.addDependency('labs/observe/simpleobservable.js', ['goog.labs.observe.SimpleObservable'], ['goog.Disposable', 'goog.array', 'goog.asserts', 'goog.labs.observe.Notice', 'goog.labs.observe.Observable', 'goog.labs.observe.Observer', 'goog.object']);
goog.addDependency('labs/structs/map.js', ['goog.labs.structs.Map'], ['goog.array', 'goog.asserts', 'goog.labs.object', 'goog.object']);
goog.addDependency('labs/structs/map_perf.js', ['goog.labs.structs.mapPerf'], ['goog.dom', 'goog.labs.structs.Map', 'goog.structs.Map', 'goog.testing.PerformanceTable', 'goog.testing.jsunit']);
goog.addDependency('labs/structs/multimap.js', ['goog.labs.structs.Multimap'], ['goog.array', 'goog.labs.object', 'goog.labs.structs.Map']);
goog.addDependency('labs/style/pixeldensitymonitor.js', ['goog.labs.style.PixelDensityMonitor', 'goog.labs.style.PixelDensityMonitor.Density', 'goog.labs.style.PixelDensityMonitor.EventType'], ['goog.events', 'goog.events.EventTarget']);
goog.addDependency('labs/style/pixeldensitymonitor_test.js', ['goog.labs.style.PixelDensityMonitorTest'], ['goog.array', 'goog.dom.DomHelper', 'goog.events', 'goog.labs.style.PixelDensityMonitor', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('labs/testing/assertthat.js', ['goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat'], ['goog.asserts', 'goog.debug.Error', 'goog.labs.testing.Matcher']);
goog.addDependency('labs/testing/decoratormatcher.js', ['goog.labs.testing.AnythingMatcher'], ['goog.labs.testing.Matcher']);
goog.addDependency('labs/testing/dictionarymatcher.js', ['goog.labs.testing.HasEntriesMatcher', 'goog.labs.testing.HasEntryMatcher', 'goog.labs.testing.HasKeyMatcher', 'goog.labs.testing.HasValueMatcher'], ['goog.array', 'goog.asserts', 'goog.labs.testing.Matcher', 'goog.string']);
goog.addDependency('labs/testing/logicmatcher.js', ['goog.labs.testing.AllOfMatcher', 'goog.labs.testing.AnyOfMatcher', 'goog.labs.testing.IsNotMatcher'], ['goog.array', 'goog.labs.testing.Matcher']);
goog.addDependency('labs/testing/matcher.js', ['goog.labs.testing.Matcher'], []);
goog.addDependency('labs/testing/numbermatcher.js', ['goog.labs.testing.CloseToMatcher', 'goog.labs.testing.EqualToMatcher', 'goog.labs.testing.GreaterThanEqualToMatcher', 'goog.labs.testing.GreaterThanMatcher', 'goog.labs.testing.LessThanEqualToMatcher', 'goog.labs.testing.LessThanMatcher'], ['goog.asserts', 'goog.labs.testing.Matcher']);
goog.addDependency('labs/testing/objectmatcher.js', ['goog.labs.testing.HasPropertyMatcher', 'goog.labs.testing.InstanceOfMatcher', 'goog.labs.testing.IsNullMatcher', 'goog.labs.testing.IsNullOrUndefinedMatcher', 'goog.labs.testing.IsUndefinedMatcher', 'goog.labs.testing.ObjectEqualsMatcher'], ['goog.labs.testing.Matcher', 'goog.string']);
goog.addDependency('labs/testing/stringmatcher.js', ['goog.labs.testing.ContainsStringMatcher', 'goog.labs.testing.EndsWithMatcher', 'goog.labs.testing.EqualToIgnoringCaseMatcher', 'goog.labs.testing.EqualToIgnoringWhitespaceMatcher', 'goog.labs.testing.EqualsMatcher', 'goog.labs.testing.RegexMatcher', 'goog.labs.testing.StartsWithMatcher', 'goog.labs.testing.StringContainsInOrderMatcher'], ['goog.asserts', 'goog.labs.testing.Matcher', 'goog.string']);
goog.addDependency('labs/useragent/browser.js', ['goog.labs.userAgent.browser'], ['goog.asserts', 'goog.labs.userAgent.util', 'goog.memoize', 'goog.string']);
goog.addDependency('labs/useragent/browser_test.js', ['goog.labs.userAgent.browserTest'], ['goog.labs.userAgent.browser', 'goog.labs.userAgent.testAgents', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('labs/useragent/device.js', ['goog.labs.userAgent.device'], ['goog.labs.userAgent.util']);
goog.addDependency('labs/useragent/device_test.js', ['goog.labs.userAgent.deviceTest'], ['goog.labs.userAgent.device', 'goog.labs.userAgent.testAgents', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('labs/useragent/engine.js', ['goog.labs.userAgent.engine'], ['goog.array', 'goog.labs.userAgent.util', 'goog.memoize', 'goog.string']);
goog.addDependency('labs/useragent/engine_test.js', ['goog.labs.userAgent.engineTest'], ['goog.labs.userAgent.engine', 'goog.labs.userAgent.testAgents', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('labs/useragent/platform.js', ['goog.labs.userAgent.platform'], ['goog.labs.userAgent.util', 'goog.memoize', 'goog.string']);
goog.addDependency('labs/useragent/platform_test.js', ['goog.labs.userAgent.platformTest'], ['goog.labs.userAgent.platform', 'goog.labs.userAgent.testAgents', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('labs/useragent/test_agents.js', ['goog.labs.userAgent.testAgents'], []);
goog.addDependency('labs/useragent/util.js', ['goog.labs.userAgent.util'], ['goog.memoize', 'goog.string']);
goog.addDependency('labs/useragent/util_test.js', ['goog.labs.userAgent.utilTest'], ['goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.jsunit']);
goog.addDependency('locale/countries.js', ['goog.locale.countries'], []);
goog.addDependency('locale/defaultlocalenameconstants.js', ['goog.locale.defaultLocaleNameConstants'], []);
goog.addDependency('locale/genericfontnames.js', ['goog.locale.genericFontNames'], []);
goog.addDependency('locale/genericfontnamesdata.js', ['goog.locale.genericFontNamesData'], []);
goog.addDependency('locale/locale.js', ['goog.locale'], ['goog.locale.nativeNameConstants']);
goog.addDependency('locale/nativenameconstants.js', ['goog.locale.nativeNameConstants'], []);
goog.addDependency('locale/scriptToLanguages.js', ['goog.locale.scriptToLanguages'], ['goog.locale']);
goog.addDependency('locale/timezonedetection.js', ['goog.locale.timeZoneDetection'], ['goog.locale', 'goog.locale.TimeZoneFingerprint']);
goog.addDependency('locale/timezonefingerprint.js', ['goog.locale.TimeZoneFingerprint'], []);
goog.addDependency('locale/timezonelist.js', ['goog.locale.TimeZoneList'], ['goog.locale']);
goog.addDependency('log/log.js', ['goog.log', 'goog.log.Level', 'goog.log.LogRecord', 'goog.log.Logger'], ['goog.debug', 'goog.debug.LogRecord', 'goog.debug.Logger']);
goog.addDependency('log/log_test.js', ['goog.logTest'], ['goog.debug.LogManager', 'goog.log', 'goog.log.Level', 'goog.testing.jsunit']);
goog.addDependency('math/bezier.js', ['goog.math.Bezier'], ['goog.math', 'goog.math.Coordinate']);
goog.addDependency('math/box.js', ['goog.math.Box'], ['goog.math.Coordinate']);
goog.addDependency('math/coordinate.js', ['goog.math.Coordinate'], ['goog.math']);
goog.addDependency('math/coordinate3.js', ['goog.math.Coordinate3'], []);
goog.addDependency('math/exponentialbackoff.js', ['goog.math.ExponentialBackoff'], ['goog.asserts']);
goog.addDependency('math/integer.js', ['goog.math.Integer'], []);
goog.addDependency('math/interpolator/interpolator1.js', ['goog.math.interpolator.Interpolator1'], []);
goog.addDependency('math/interpolator/linear1.js', ['goog.math.interpolator.Linear1'], ['goog.array', 'goog.math', 'goog.math.interpolator.Interpolator1']);
goog.addDependency('math/interpolator/pchip1.js', ['goog.math.interpolator.Pchip1'], ['goog.math', 'goog.math.interpolator.Spline1']);
goog.addDependency('math/interpolator/spline1.js', ['goog.math.interpolator.Spline1'], ['goog.array', 'goog.math', 'goog.math.interpolator.Interpolator1', 'goog.math.tdma']);
goog.addDependency('math/line.js', ['goog.math.Line'], ['goog.math', 'goog.math.Coordinate']);
goog.addDependency('math/long.js', ['goog.math.Long'], []);
goog.addDependency('math/math.js', ['goog.math'], ['goog.array', 'goog.asserts']);
goog.addDependency('math/matrix.js', ['goog.math.Matrix'], ['goog.array', 'goog.math', 'goog.math.Size', 'goog.string']);
goog.addDependency('math/range.js', ['goog.math.Range'], []);
goog.addDependency('math/rangeset.js', ['goog.math.RangeSet'], ['goog.array', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.math.Range']);
goog.addDependency('math/rect.js', ['goog.math.Rect'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size']);
goog.addDependency('math/size.js', ['goog.math.Size'], []);
goog.addDependency('math/tdma.js', ['goog.math.tdma'], []);
goog.addDependency('math/vec2.js', ['goog.math.Vec2'], ['goog.math', 'goog.math.Coordinate']);
goog.addDependency('math/vec3.js', ['goog.math.Vec3'], ['goog.math', 'goog.math.Coordinate3']);
goog.addDependency('memoize/memoize.js', ['goog.memoize'], []);
goog.addDependency('messaging/abstractchannel.js', ['goog.messaging.AbstractChannel'], ['goog.Disposable', 'goog.debug', 'goog.json', 'goog.log', 'goog.messaging.MessageChannel']);
goog.addDependency('messaging/bufferedchannel.js', ['goog.messaging.BufferedChannel'], ['goog.Timer', 'goog.Uri', 'goog.debug.Error', 'goog.events', 'goog.log', 'goog.messaging.MessageChannel', 'goog.messaging.MultiChannel']);
goog.addDependency('messaging/deferredchannel.js', ['goog.messaging.DeferredChannel'], ['goog.Disposable', 'goog.async.Deferred', 'goog.messaging.MessageChannel']);
goog.addDependency('messaging/loggerclient.js', ['goog.messaging.LoggerClient'], ['goog.Disposable', 'goog.debug', 'goog.debug.LogManager', 'goog.debug.Logger']);
goog.addDependency('messaging/loggerserver.js', ['goog.messaging.LoggerServer'], ['goog.Disposable', 'goog.log']);
goog.addDependency('messaging/messagechannel.js', ['goog.messaging.MessageChannel'], []);
goog.addDependency('messaging/messaging.js', ['goog.messaging'], ['goog.messaging.MessageChannel']);
goog.addDependency('messaging/multichannel.js', ['goog.messaging.MultiChannel', 'goog.messaging.MultiChannel.VirtualChannel'], ['goog.Disposable', 'goog.events.EventHandler', 'goog.log', 'goog.messaging.MessageChannel', 'goog.object']);
goog.addDependency('messaging/portcaller.js', ['goog.messaging.PortCaller'], ['goog.Disposable', 'goog.async.Deferred', 'goog.messaging.DeferredChannel', 'goog.messaging.PortChannel', 'goog.messaging.PortNetwork', 'goog.object']);
goog.addDependency('messaging/portchannel.js', ['goog.messaging.PortChannel'], ['goog.Timer', 'goog.array', 'goog.async.Deferred', 'goog.debug', 'goog.dom', 'goog.dom.DomHelper', 'goog.events', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.messaging.AbstractChannel', 'goog.messaging.DeferredChannel', 'goog.object', 'goog.string']);
goog.addDependency('messaging/portnetwork.js', ['goog.messaging.PortNetwork'], []);
goog.addDependency('messaging/portoperator.js', ['goog.messaging.PortOperator'], ['goog.Disposable', 'goog.asserts', 'goog.log', 'goog.messaging.PortChannel', 'goog.messaging.PortNetwork', 'goog.object']);
goog.addDependency('messaging/respondingchannel.js', ['goog.messaging.RespondingChannel'], ['goog.Disposable', 'goog.log', 'goog.messaging.MessageChannel', 'goog.messaging.MultiChannel', 'goog.messaging.MultiChannel.VirtualChannel']);
goog.addDependency('messaging/testdata/portchannel_worker.js', ['goog.messaging.testdata.portchannel_worker'], ['goog.messaging.PortChannel']);
goog.addDependency('messaging/testdata/portnetwork_worker1.js', ['goog.messaging.testdata.portnetwork_worker1'], ['goog.messaging.PortCaller', 'goog.messaging.PortChannel']);
goog.addDependency('messaging/testdata/portnetwork_worker2.js', ['goog.messaging.testdata.portnetwork_worker2'], ['goog.messaging.PortCaller', 'goog.messaging.PortChannel']);
goog.addDependency('module/abstractmoduleloader.js', ['goog.module.AbstractModuleLoader'], []);
goog.addDependency('module/basemodule.js', ['goog.module.BaseModule'], ['goog.Disposable']);
goog.addDependency('module/loader.js', ['goog.module.Loader'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.object']);
goog.addDependency('module/module.js', ['goog.module'], ['goog.array', 'goog.module.Loader']);
goog.addDependency('module/moduleinfo.js', ['goog.module.ModuleInfo'], ['goog.Disposable', 'goog.functions', 'goog.module.BaseModule', 'goog.module.ModuleLoadCallback']);
goog.addDependency('module/moduleloadcallback.js', ['goog.module.ModuleLoadCallback'], ['goog.debug.entryPointRegistry', 'goog.debug.errorHandlerWeakDep']);
goog.addDependency('module/moduleloader.js', ['goog.module.ModuleLoader'], ['goog.Timer', 'goog.array', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.log', 'goog.module.AbstractModuleLoader', 'goog.net.BulkLoader', 'goog.net.EventType', 'goog.net.jsloader', 'goog.userAgent.product']);
goog.addDependency('module/moduleloader_test.js', ['goog.module.ModuleLoaderTest'], ['goog.array', 'goog.dom', 'goog.functions', 'goog.module.ModuleLoader', 'goog.module.ModuleManager', 'goog.module.ModuleManager.CallbackType', 'goog.object', 'goog.testing.AsyncTestCase', 'goog.testing.PropertyReplacer', 'goog.testing.events.EventObserver', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent.product']);
goog.addDependency('module/modulemanager.js', ['goog.module.ModuleManager', 'goog.module.ModuleManager.CallbackType', 'goog.module.ModuleManager.FailureType'], ['goog.Disposable', 'goog.array', 'goog.asserts', 'goog.async.Deferred', 'goog.debug.Trace', 'goog.dispose', 'goog.log', 'goog.module.ModuleInfo', 'goog.module.ModuleLoadCallback', 'goog.object']);
goog.addDependency('module/testdata/modA_1.js', ['goog.module.testdata.modA_1'], []);
goog.addDependency('module/testdata/modA_2.js', ['goog.module.testdata.modA_2'], ['goog.module.ModuleManager']);
goog.addDependency('module/testdata/modB_1.js', ['goog.module.testdata.modB_1'], ['goog.module.ModuleManager']);
goog.addDependency('net/browserchannel.js', ['goog.net.BrowserChannel', 'goog.net.BrowserChannel.Error', 'goog.net.BrowserChannel.Event', 'goog.net.BrowserChannel.Handler', 'goog.net.BrowserChannel.LogSaver', 'goog.net.BrowserChannel.QueuedMap', 'goog.net.BrowserChannel.ServerReachability', 'goog.net.BrowserChannel.ServerReachabilityEvent', 'goog.net.BrowserChannel.Stat', 'goog.net.BrowserChannel.StatEvent', 'goog.net.BrowserChannel.State', 'goog.net.BrowserChannel.TimingEvent'], ['goog.Uri', 'goog.array', 'goog.asserts', 'goog.debug.TextFormatter', 'goog.events.Event', 'goog.events.EventTarget', 'goog.json', 'goog.json.EvalJsonProcessor', 'goog.log', 'goog.net.BrowserTestChannel', 'goog.net.ChannelDebug', 'goog.net.ChannelRequest', 'goog.net.XhrIo', 'goog.net.tmpnetwork', 'goog.string', 'goog.structs', 'goog.structs.CircularBuffer']);
goog.addDependency('net/browsertestchannel.js', ['goog.net.BrowserTestChannel'], ['goog.json.EvalJsonProcessor', 'goog.net.ChannelRequest', 'goog.net.ChannelRequest.Error', 'goog.net.tmpnetwork', 'goog.string.Parser', 'goog.userAgent']);
goog.addDependency('net/bulkloader.js', ['goog.net.BulkLoader'], ['goog.events.EventHandler', 'goog.events.EventTarget', 'goog.log', 'goog.net.BulkLoaderHelper', 'goog.net.EventType', 'goog.net.XhrIo']);
goog.addDependency('net/bulkloaderhelper.js', ['goog.net.BulkLoaderHelper'], ['goog.Disposable', 'goog.log']);
goog.addDependency('net/channeldebug.js', ['goog.net.ChannelDebug'], ['goog.json', 'goog.log']);
goog.addDependency('net/channelrequest.js', ['goog.net.ChannelRequest', 'goog.net.ChannelRequest.Error'], ['goog.Timer', 'goog.async.Throttle', 'goog.events.EventHandler', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XmlHttp', 'goog.object', 'goog.userAgent']);
goog.addDependency('net/cookies.js', ['goog.net.Cookies', 'goog.net.cookies'], []);
goog.addDependency('net/crossdomainrpc.js', ['goog.net.CrossDomainRpc'], ['goog.Uri', 'goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.string', 'goog.userAgent']);
goog.addDependency('net/errorcode.js', ['goog.net.ErrorCode'], []);
goog.addDependency('net/eventtype.js', ['goog.net.EventType'], []);
goog.addDependency('net/filedownloader.js', ['goog.net.FileDownloader', 'goog.net.FileDownloader.Error'], ['goog.Disposable', 'goog.asserts', 'goog.async.Deferred', 'goog.crypt.hash32', 'goog.debug.Error', 'goog.events', 'goog.events.EventHandler', 'goog.fs', 'goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.fs.FileSaver', 'goog.net.EventType', 'goog.net.XhrIo', 'goog.net.XhrIoPool', 'goog.object']);
goog.addDependency('net/httpstatus.js', ['goog.net.HttpStatus'], []);
goog.addDependency('net/iframeio.js', ['goog.net.IframeIo', 'goog.net.IframeIo.IncrementalDataEvent'], ['goog.Timer', 'goog.Uri', 'goog.debug', 'goog.dom', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.reflect', 'goog.string', 'goog.structs', 'goog.userAgent']);
goog.addDependency('net/iframeloadmonitor.js', ['goog.net.IframeLoadMonitor'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.userAgent']);
goog.addDependency('net/imageloader.js', ['goog.net.ImageLoader'], ['goog.array', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.net.EventType', 'goog.object', 'goog.userAgent']);
goog.addDependency('net/ipaddress.js', ['goog.net.IpAddress', 'goog.net.Ipv4Address', 'goog.net.Ipv6Address'], ['goog.array', 'goog.math.Integer', 'goog.object', 'goog.string']);
goog.addDependency('net/jsloader.js', ['goog.net.jsloader', 'goog.net.jsloader.Error', 'goog.net.jsloader.ErrorCode', 'goog.net.jsloader.Options'], ['goog.array', 'goog.async.Deferred', 'goog.debug.Error', 'goog.dom', 'goog.dom.TagName']);
goog.addDependency('net/jsonp.js', ['goog.net.Jsonp'], ['goog.Uri', 'goog.net.jsloader']);
goog.addDependency('net/mockiframeio.js', ['goog.net.MockIFrameIo'], ['goog.events.EventTarget', 'goog.json', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.IframeIo']);
goog.addDependency('net/multiiframeloadmonitor.js', ['goog.net.MultiIframeLoadMonitor'], ['goog.events', 'goog.net.IframeLoadMonitor']);
goog.addDependency('net/networkstatusmonitor.js', ['goog.net.NetworkStatusMonitor'], ['goog.events.Listenable']);
goog.addDependency('net/networktester.js', ['goog.net.NetworkTester'], ['goog.Timer', 'goog.Uri', 'goog.log']);
goog.addDependency('net/testdata/jsloader_test1.js', ['goog.net.testdata.jsloader_test1'], []);
goog.addDependency('net/testdata/jsloader_test2.js', ['goog.net.testdata.jsloader_test2'], []);
goog.addDependency('net/testdata/jsloader_test3.js', ['goog.net.testdata.jsloader_test3'], []);
goog.addDependency('net/testdata/jsloader_test4.js', ['goog.net.testdata.jsloader_test4'], []);
goog.addDependency('net/tmpnetwork.js', ['goog.net.tmpnetwork'], ['goog.Uri', 'goog.net.ChannelDebug']);
goog.addDependency('net/websocket.js', ['goog.net.WebSocket', 'goog.net.WebSocket.ErrorEvent', 'goog.net.WebSocket.EventType', 'goog.net.WebSocket.MessageEvent'], ['goog.Timer', 'goog.asserts', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.log']);
goog.addDependency('net/wrapperxmlhttpfactory.js', ['goog.net.WrapperXmlHttpFactory'], ['goog.net.XmlHttpFactory']);
goog.addDependency('net/xhrio.js', ['goog.net.XhrIo', 'goog.net.XhrIo.ResponseType'], ['goog.Timer', 'goog.array', 'goog.debug.entryPointRegistry', 'goog.events.EventTarget', 'goog.json', 'goog.log', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.net.XmlHttp', 'goog.object', 'goog.string', 'goog.structs', 'goog.structs.Map', 'goog.uri.utils', 'goog.userAgent']);
goog.addDependency('net/xhriopool.js', ['goog.net.XhrIoPool'], ['goog.net.XhrIo', 'goog.structs', 'goog.structs.PriorityPool']);
goog.addDependency('net/xhrmanager.js', ['goog.net.XhrManager', 'goog.net.XhrManager.Event', 'goog.net.XhrManager.Request'], ['goog.Disposable', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XhrIo', 'goog.net.XhrIoPool', 'goog.structs', 'goog.structs.Map']);
goog.addDependency('net/xmlhttp.js', ['goog.net.DefaultXmlHttpFactory', 'goog.net.XmlHttp', 'goog.net.XmlHttp.OptionType', 'goog.net.XmlHttp.ReadyState'], ['goog.net.WrapperXmlHttpFactory', 'goog.net.XmlHttpFactory']);
goog.addDependency('net/xmlhttpfactory.js', ['goog.net.XmlHttpFactory'], []);
goog.addDependency('net/xpc/crosspagechannel.js', ['goog.net.xpc.CrossPageChannel'], ['goog.Disposable', 'goog.Uri', 'goog.async.Deferred', 'goog.async.Delay', 'goog.dom', 'goog.events', 'goog.events.EventHandler', 'goog.json', 'goog.messaging.AbstractChannel', 'goog.net.xpc', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.FrameElementMethodTransport', 'goog.net.xpc.IframePollingTransport', 'goog.net.xpc.IframeRelayTransport', 'goog.net.xpc.NativeMessagingTransport', 'goog.net.xpc.NixTransport', 'goog.net.xpc.Transport', 'goog.userAgent']);
goog.addDependency('net/xpc/crosspagechannelrole.js', ['goog.net.xpc.CrossPageChannelRole'], []);
goog.addDependency('net/xpc/frameelementmethodtransport.js', ['goog.net.xpc.FrameElementMethodTransport'], ['goog.net.xpc', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport']);
goog.addDependency('net/xpc/iframepollingtransport.js', ['goog.net.xpc.IframePollingTransport', 'goog.net.xpc.IframePollingTransport.Receiver', 'goog.net.xpc.IframePollingTransport.Sender'], ['goog.array', 'goog.dom', 'goog.net.xpc', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.userAgent']);
goog.addDependency('net/xpc/iframerelaytransport.js', ['goog.net.xpc.IframeRelayTransport'], ['goog.dom', 'goog.events', 'goog.net.xpc', 'goog.net.xpc.Transport', 'goog.userAgent']);
goog.addDependency('net/xpc/nativemessagingtransport.js', ['goog.net.xpc.NativeMessagingTransport'], ['goog.Timer', 'goog.asserts', 'goog.async.Deferred', 'goog.events', 'goog.events.EventHandler', 'goog.net.xpc', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport']);
goog.addDependency('net/xpc/nixtransport.js', ['goog.net.xpc.NixTransport'], ['goog.net.xpc', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.reflect']);
goog.addDependency('net/xpc/relay.js', ['goog.net.xpc.relay'], []);
goog.addDependency('net/xpc/transport.js', ['goog.net.xpc.Transport'], ['goog.Disposable', 'goog.dom', 'goog.net.xpc']);
goog.addDependency('net/xpc/xpc.js', ['goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.ChannelStates', 'goog.net.xpc.TransportNames', 'goog.net.xpc.TransportTypes', 'goog.net.xpc.UriCfgFields'], ['goog.log']);
goog.addDependency('object/object.js', ['goog.object'], []);
goog.addDependency('positioning/absoluteposition.js', ['goog.positioning.AbsolutePosition'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.positioning', 'goog.positioning.AbstractPosition']);
goog.addDependency('positioning/abstractposition.js', ['goog.positioning.AbstractPosition'], ['goog.math.Box', 'goog.math.Size', 'goog.positioning.Corner']);
goog.addDependency('positioning/anchoredposition.js', ['goog.positioning.AnchoredPosition'], ['goog.math.Box', 'goog.positioning', 'goog.positioning.AbstractPosition']);
goog.addDependency('positioning/anchoredviewportposition.js', ['goog.positioning.AnchoredViewportPosition'], ['goog.math.Box', 'goog.positioning', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus']);
goog.addDependency('positioning/clientposition.js', ['goog.positioning.ClientPosition'], ['goog.asserts', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.positioning', 'goog.positioning.AbstractPosition', 'goog.style']);
goog.addDependency('positioning/clientposition_test.js', ['goog.positioning.clientPositionTest'], ['goog.dom', 'goog.positioning.ClientPosition', 'goog.style', 'goog.testing.jsunit']);
goog.addDependency('positioning/menuanchoredposition.js', ['goog.positioning.MenuAnchoredPosition'], ['goog.math.Box', 'goog.math.Size', 'goog.positioning', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow']);
goog.addDependency('positioning/positioning.js', ['goog.positioning', 'goog.positioning.Corner', 'goog.positioning.CornerBit', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.style', 'goog.style.bidi']);
goog.addDependency('positioning/positioning_test.js', ['goog.positioningTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('positioning/viewportclientposition.js', ['goog.positioning.ViewportClientPosition'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.positioning.ClientPosition']);
goog.addDependency('positioning/viewportposition.js', ['goog.positioning.ViewportPosition'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.positioning.AbstractPosition']);
goog.addDependency('proto/proto.js', ['goog.proto'], ['goog.proto.Serializer']);
goog.addDependency('proto/serializer.js', ['goog.proto.Serializer'], ['goog.json.Serializer', 'goog.string']);
goog.addDependency('proto2/descriptor.js', ['goog.proto2.Descriptor', 'goog.proto2.Metadata'], ['goog.array', 'goog.object', 'goog.proto2.Util']);
goog.addDependency('proto2/fielddescriptor.js', ['goog.proto2.FieldDescriptor'], ['goog.proto2.Util', 'goog.string']);
goog.addDependency('proto2/lazydeserializer.js', ['goog.proto2.LazyDeserializer'], ['goog.proto2.Message', 'goog.proto2.Serializer', 'goog.proto2.Util']);
goog.addDependency('proto2/message.js', ['goog.proto2.Message'], ['goog.proto2.Descriptor', 'goog.proto2.FieldDescriptor', 'goog.proto2.Util', 'goog.string']);
goog.addDependency('proto2/objectserializer.js', ['goog.proto2.ObjectSerializer'], ['goog.proto2.Serializer', 'goog.proto2.Util', 'goog.string']);
goog.addDependency('proto2/package_test.pb.js', ['someprotopackage.TestPackageTypes'], ['goog.proto2.Message', 'proto2.TestAllTypes']);
goog.addDependency('proto2/pbliteserializer.js', ['goog.proto2.PbLiteSerializer'], ['goog.proto2.LazyDeserializer', 'goog.proto2.Util']);
goog.addDependency('proto2/serializer.js', ['goog.proto2.Serializer'], ['goog.proto2.Descriptor', 'goog.proto2.FieldDescriptor', 'goog.proto2.Message', 'goog.proto2.Util']);
goog.addDependency('proto2/test.pb.js', ['proto2.TestAllTypes', 'proto2.TestAllTypes.NestedEnum', 'proto2.TestAllTypes.NestedMessage', 'proto2.TestAllTypes.OptionalGroup', 'proto2.TestAllTypes.RepeatedGroup'], ['goog.proto2.Message']);
goog.addDependency('proto2/textformatserializer.js', ['goog.proto2.TextFormatSerializer', 'goog.proto2.TextFormatSerializer.Parser'], ['goog.array', 'goog.asserts', 'goog.json', 'goog.proto2.Serializer', 'goog.proto2.Util', 'goog.string']);
goog.addDependency('proto2/textformatserializer_test.js', ['goog.proto2.TextFormatSerializerTest'], ['goog.proto2.TextFormatSerializer', 'goog.testing.jsunit', 'proto2.TestAllTypes']);
goog.addDependency('proto2/util.js', ['goog.proto2.Util'], ['goog.asserts']);
goog.addDependency('pubsub/pubsub.js', ['goog.pubsub.PubSub'], ['goog.Disposable', 'goog.array']);
goog.addDependency('reflect/reflect.js', ['goog.reflect'], []);
goog.addDependency('result/deferredadaptor.js', ['goog.result.DeferredAdaptor'], ['goog.async.Deferred', 'goog.result', 'goog.result.Result']);
goog.addDependency('result/dependentresult.js', ['goog.result.DependentResult'], ['goog.result.Result']);
goog.addDependency('result/result_interface.js', ['goog.result.Result'], []);
goog.addDependency('result/resultutil.js', ['goog.result'], ['goog.array', 'goog.result.DependentResult', 'goog.result.Result', 'goog.result.SimpleResult']);
goog.addDependency('result/simpleresult.js', ['goog.result.SimpleResult', 'goog.result.SimpleResult.StateError'], ['goog.debug.Error', 'goog.result.Result']);
goog.addDependency('soy/data.js', ['goog.soy.data', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind'], []);
goog.addDependency('soy/renderer.js', ['goog.soy.InjectedDataSupplier', 'goog.soy.Renderer'], ['goog.asserts', 'goog.dom', 'goog.soy', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind']);
goog.addDependency('soy/soy.js', ['goog.soy'], ['goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.soy.data', 'goog.string']);
goog.addDependency('soy/soy_test.js', ['goog.soy.testHelper'], ['goog.dom', 'goog.dom.TagName', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind', 'goog.string', 'goog.userAgent']);
goog.addDependency('spell/spellcheck.js', ['goog.spell.SpellCheck', 'goog.spell.SpellCheck.WordChangedEvent'], ['goog.Timer', 'goog.events.EventTarget', 'goog.structs.Set']);
goog.addDependency('stats/basicstat.js', ['goog.stats.BasicStat'], ['goog.array', 'goog.iter', 'goog.log', 'goog.object', 'goog.string.format', 'goog.structs.CircularBuffer']);
goog.addDependency('storage/collectablestorage.js', ['goog.storage.CollectableStorage'], ['goog.array', 'goog.asserts', 'goog.iter', 'goog.storage.ErrorCode', 'goog.storage.ExpiringStorage', 'goog.storage.RichStorage.Wrapper', 'goog.storage.mechanism.IterableMechanism']);
goog.addDependency('storage/encryptedstorage.js', ['goog.storage.EncryptedStorage'], ['goog.crypt', 'goog.crypt.Arc4', 'goog.crypt.Sha1', 'goog.crypt.base64', 'goog.json', 'goog.json.Serializer', 'goog.storage.CollectableStorage', 'goog.storage.ErrorCode', 'goog.storage.RichStorage', 'goog.storage.RichStorage.Wrapper', 'goog.storage.mechanism.IterableMechanism']);
goog.addDependency('storage/errorcode.js', ['goog.storage.ErrorCode'], []);
goog.addDependency('storage/expiringstorage.js', ['goog.storage.ExpiringStorage'], ['goog.storage.RichStorage', 'goog.storage.RichStorage.Wrapper', 'goog.storage.mechanism.Mechanism']);
goog.addDependency('storage/mechanism/errorcode.js', ['goog.storage.mechanism.ErrorCode'], []);
goog.addDependency('storage/mechanism/errorhandlingmechanism.js', ['goog.storage.mechanism.ErrorHandlingMechanism'], ['goog.storage.mechanism.Mechanism']);
goog.addDependency('storage/mechanism/html5localstorage.js', ['goog.storage.mechanism.HTML5LocalStorage'], ['goog.storage.mechanism.HTML5WebStorage']);
goog.addDependency('storage/mechanism/html5sessionstorage.js', ['goog.storage.mechanism.HTML5SessionStorage'], ['goog.storage.mechanism.HTML5WebStorage']);
goog.addDependency('storage/mechanism/html5webstorage.js', ['goog.storage.mechanism.HTML5WebStorage'], ['goog.asserts', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.IterableMechanism']);
goog.addDependency('storage/mechanism/ieuserdata.js', ['goog.storage.mechanism.IEUserData'], ['goog.asserts', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.IterableMechanism', 'goog.structs.Map', 'goog.userAgent']);
goog.addDependency('storage/mechanism/iterablemechanism.js', ['goog.storage.mechanism.IterableMechanism'], ['goog.array', 'goog.asserts', 'goog.iter', 'goog.iter.Iterator', 'goog.storage.mechanism.Mechanism']);
goog.addDependency('storage/mechanism/iterablemechanismtester.js', ['goog.storage.mechanism.iterableMechanismTester'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism', 'goog.testing.asserts']);
goog.addDependency('storage/mechanism/mechanism.js', ['goog.storage.mechanism.Mechanism'], []);
goog.addDependency('storage/mechanism/mechanismfactory.js', ['goog.storage.mechanism.mechanismfactory'], ['goog.storage.mechanism.HTML5LocalStorage', 'goog.storage.mechanism.HTML5SessionStorage', 'goog.storage.mechanism.IEUserData', 'goog.storage.mechanism.IterableMechanism', 'goog.storage.mechanism.PrefixedMechanism']);
goog.addDependency('storage/mechanism/mechanismseparationtester.js', ['goog.storage.mechanism.mechanismSeparationTester'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism', 'goog.testing.asserts']);
goog.addDependency('storage/mechanism/mechanismsharingtester.js', ['goog.storage.mechanism.mechanismSharingTester'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism', 'goog.testing.asserts']);
goog.addDependency('storage/mechanism/mechanismtester.js', ['goog.storage.mechanism.mechanismTester'], ['goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.HTML5LocalStorage', 'goog.storage.mechanism.Mechanism', 'goog.testing.asserts', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('storage/mechanism/prefixedmechanism.js', ['goog.storage.mechanism.PrefixedMechanism'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism']);
goog.addDependency('storage/richstorage.js', ['goog.storage.RichStorage', 'goog.storage.RichStorage.Wrapper'], ['goog.storage.ErrorCode', 'goog.storage.Storage', 'goog.storage.mechanism.Mechanism']);
goog.addDependency('storage/storage.js', ['goog.storage.Storage'], ['goog.json', 'goog.json.Serializer', 'goog.storage.ErrorCode']);
goog.addDependency('storage/storage_test.js', ['goog.storage.storage_test'], ['goog.storage.Storage', 'goog.structs.Map', 'goog.testing.asserts']);
goog.addDependency('string/linkify.js', ['goog.string.linkify'], ['goog.string']);
goog.addDependency('string/newlines.js', ['goog.string.newlines', 'goog.string.newlines.Line'], ['goog.array']);
goog.addDependency('string/newlines_test.js', ['goog.string.newlinesTest'], ['goog.string.newlines', 'goog.testing.jsunit']);
goog.addDependency('string/parser.js', ['goog.string.Parser'], []);
goog.addDependency('string/path.js', ['goog.string.path'], ['goog.array', 'goog.string']);
goog.addDependency('string/string.js', ['goog.string', 'goog.string.Unicode'], []);
goog.addDependency('string/string_test.js', ['goog.stringTest'], ['goog.functions', 'goog.object', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('string/stringbuffer.js', ['goog.string.StringBuffer'], []);
goog.addDependency('string/stringformat.js', ['goog.string.format'], ['goog.string']);
goog.addDependency('string/stringifier.js', ['goog.string.Stringifier'], []);
goog.addDependency('structs/avltree.js', ['goog.structs.AvlTree', 'goog.structs.AvlTree.Node'], ['goog.structs.Collection']);
goog.addDependency('structs/circularbuffer.js', ['goog.structs.CircularBuffer'], []);
goog.addDependency('structs/collection.js', ['goog.structs.Collection'], []);
goog.addDependency('structs/heap.js', ['goog.structs.Heap'], ['goog.array', 'goog.object', 'goog.structs.Node']);
goog.addDependency('structs/inversionmap.js', ['goog.structs.InversionMap'], ['goog.array']);
goog.addDependency('structs/linkedmap.js', ['goog.structs.LinkedMap'], ['goog.structs.Map']);
goog.addDependency('structs/map.js', ['goog.structs.Map'], ['goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.object']);
goog.addDependency('structs/node.js', ['goog.structs.Node'], []);
goog.addDependency('structs/pool.js', ['goog.structs.Pool'], ['goog.Disposable', 'goog.structs.Queue', 'goog.structs.Set']);
goog.addDependency('structs/prioritypool.js', ['goog.structs.PriorityPool'], ['goog.structs.Pool', 'goog.structs.PriorityQueue']);
goog.addDependency('structs/priorityqueue.js', ['goog.structs.PriorityQueue'], ['goog.structs.Heap']);
goog.addDependency('structs/quadtree.js', ['goog.structs.QuadTree', 'goog.structs.QuadTree.Node', 'goog.structs.QuadTree.Point'], ['goog.math.Coordinate']);
goog.addDependency('structs/queue.js', ['goog.structs.Queue'], ['goog.array']);
goog.addDependency('structs/set.js', ['goog.structs.Set'], ['goog.structs', 'goog.structs.Collection', 'goog.structs.Map']);
goog.addDependency('structs/simplepool.js', ['goog.structs.SimplePool'], ['goog.Disposable']);
goog.addDependency('structs/stringset.js', ['goog.structs.StringSet'], ['goog.asserts', 'goog.iter']);
goog.addDependency('structs/structs.js', ['goog.structs'], ['goog.array', 'goog.object']);
goog.addDependency('structs/treenode.js', ['goog.structs.TreeNode'], ['goog.array', 'goog.asserts', 'goog.structs.Node']);
goog.addDependency('structs/trie.js', ['goog.structs.Trie'], ['goog.object', 'goog.structs']);
goog.addDependency('style/bidi.js', ['goog.style.bidi'], ['goog.dom', 'goog.style', 'goog.userAgent']);
goog.addDependency('style/cursor.js', ['goog.style.cursor'], ['goog.userAgent']);
goog.addDependency('style/style.js', ['goog.style'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.vendor', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.object', 'goog.string', 'goog.userAgent']);
goog.addDependency('style/style_test.js', ['goog.style_test'], ['goog.array', 'goog.color', 'goog.dom', 'goog.events.BrowserEvent', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.object', 'goog.string', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('style/stylescrollbartester.js', ['goog.styleScrollbarTester'], ['goog.dom', 'goog.style', 'goog.testing.asserts']);
goog.addDependency('style/transition.js', ['goog.style.transition', 'goog.style.transition.Css3Property'], ['goog.array', 'goog.asserts', 'goog.dom.vendor', 'goog.style', 'goog.userAgent']);
goog.addDependency('testing/asserts.js', ['goog.testing.JsUnitException', 'goog.testing.asserts'], ['goog.testing.stacktrace']);
goog.addDependency('testing/async/mockcontrol.js', ['goog.testing.async.MockControl'], ['goog.asserts', 'goog.async.Deferred', 'goog.debug', 'goog.testing.asserts', 'goog.testing.mockmatchers.IgnoreArgument']);
goog.addDependency('testing/asynctestcase.js', ['goog.testing.AsyncTestCase', 'goog.testing.AsyncTestCase.ControlBreakingException'], ['goog.testing.TestCase', 'goog.testing.TestCase.Test', 'goog.testing.asserts']);
goog.addDependency('testing/benchmark.js', ['goog.testing.benchmark'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.PerformanceTable', 'goog.testing.PerformanceTimer', 'goog.testing.TestCase']);
goog.addDependency('testing/continuationtestcase.js', ['goog.testing.ContinuationTestCase', 'goog.testing.ContinuationTestCase.Step', 'goog.testing.ContinuationTestCase.Test'], ['goog.array', 'goog.events.EventHandler', 'goog.testing.TestCase', 'goog.testing.TestCase.Test', 'goog.testing.asserts']);
goog.addDependency('testing/deferredtestcase.js', ['goog.testing.DeferredTestCase'], ['goog.async.Deferred', 'goog.testing.AsyncTestCase', 'goog.testing.TestCase']);
goog.addDependency('testing/dom.js', ['goog.testing.dom'], ['goog.dom', 'goog.dom.NodeIterator', 'goog.dom.NodeType', 'goog.dom.TagIterator', 'goog.dom.TagName', 'goog.dom.classes', 'goog.iter', 'goog.object', 'goog.string', 'goog.style', 'goog.testing.asserts', 'goog.userAgent']);
goog.addDependency('testing/editor/dom.js', ['goog.testing.editor.dom'], ['goog.dom.NodeType', 'goog.dom.TagIterator', 'goog.dom.TagWalkType', 'goog.iter', 'goog.string', 'goog.testing.asserts']);
goog.addDependency('testing/editor/fieldmock.js', ['goog.testing.editor.FieldMock'], ['goog.dom', 'goog.dom.Range', 'goog.editor.Field', 'goog.testing.LooseMock', 'goog.testing.mockmatchers']);
goog.addDependency('testing/editor/testhelper.js', ['goog.testing.editor.TestHelper'], ['goog.Disposable', 'goog.dom', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.node', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.testing.dom']);
goog.addDependency('testing/events/eventobserver.js', ['goog.testing.events.EventObserver'], ['goog.array']);
goog.addDependency('testing/events/events.js', ['goog.testing.events', 'goog.testing.events.Event'], ['goog.Disposable', 'goog.asserts', 'goog.dom.NodeType', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.object', 'goog.style', 'goog.userAgent']);
goog.addDependency('testing/events/matchers.js', ['goog.testing.events.EventMatcher'], ['goog.events.Event', 'goog.testing.mockmatchers.ArgumentMatcher']);
goog.addDependency('testing/events/onlinehandler.js', ['goog.testing.events.OnlineHandler'], ['goog.events.EventTarget', 'goog.net.NetworkStatusMonitor']);
goog.addDependency('testing/expectedfailures.js', ['goog.testing.ExpectedFailures'], ['goog.debug.DivConsole', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.log', 'goog.style', 'goog.testing.JsUnitException', 'goog.testing.TestCase', 'goog.testing.asserts']);
goog.addDependency('testing/fs/blob.js', ['goog.testing.fs.Blob'], ['goog.crypt.base64']);
goog.addDependency('testing/fs/entry.js', ['goog.testing.fs.DirectoryEntry', 'goog.testing.fs.Entry', 'goog.testing.fs.FileEntry'], ['goog.Timer', 'goog.array', 'goog.asserts', 'goog.async.Deferred', 'goog.fs.DirectoryEntry', 'goog.fs.DirectoryEntryImpl', 'goog.fs.Entry', 'goog.fs.Error', 'goog.fs.FileEntry', 'goog.functions', 'goog.object', 'goog.string', 'goog.testing.fs.File', 'goog.testing.fs.FileWriter']);
goog.addDependency('testing/fs/file.js', ['goog.testing.fs.File'], ['goog.testing.fs.Blob']);
goog.addDependency('testing/fs/filereader.js', ['goog.testing.fs.FileReader'], ['goog.Timer', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.FileReader.EventType', 'goog.fs.FileReader.ReadyState', 'goog.testing.fs.File', 'goog.testing.fs.ProgressEvent']);
goog.addDependency('testing/fs/filesystem.js', ['goog.testing.fs.FileSystem'], ['goog.fs.FileSystem', 'goog.testing.fs.DirectoryEntry']);
goog.addDependency('testing/fs/filewriter.js', ['goog.testing.fs.FileWriter'], ['goog.Timer', 'goog.events.Event', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.FileSaver.EventType', 'goog.fs.FileSaver.ReadyState', 'goog.string', 'goog.testing.fs.File', 'goog.testing.fs.ProgressEvent']);
goog.addDependency('testing/fs/fs.js', ['goog.testing.fs'], ['goog.Timer', 'goog.array', 'goog.async.Deferred', 'goog.fs', 'goog.testing.fs.Blob', 'goog.testing.fs.FileSystem']);
goog.addDependency('testing/fs/progressevent.js', ['goog.testing.fs.ProgressEvent'], ['goog.events.Event']);
goog.addDependency('testing/functionmock.js', ['goog.testing', 'goog.testing.FunctionMock', 'goog.testing.GlobalFunctionMock', 'goog.testing.MethodMock'], ['goog.object', 'goog.testing.LooseMock', 'goog.testing.Mock', 'goog.testing.MockInterface', 'goog.testing.PropertyReplacer', 'goog.testing.StrictMock']);
goog.addDependency('testing/graphics.js', ['goog.testing.graphics'], ['goog.graphics.Path.Segment', 'goog.testing.asserts']);
goog.addDependency('testing/i18n/asserts.js', ['goog.testing.i18n.asserts'], ['goog.testing.jsunit']);
goog.addDependency('testing/i18n/asserts_test.js', ['goog.testing.i18n.assertsTest'], ['goog.testing.ExpectedFailures', 'goog.testing.i18n.asserts']);
goog.addDependency('testing/jsunit.js', ['goog.testing.jsunit'], ['goog.testing.TestCase', 'goog.testing.TestRunner']);
goog.addDependency('testing/loosemock.js', ['goog.testing.LooseExpectationCollection', 'goog.testing.LooseMock'], ['goog.array', 'goog.structs.Map', 'goog.testing.Mock']);
goog.addDependency('testing/messaging/mockmessagechannel.js', ['goog.testing.messaging.MockMessageChannel'], ['goog.messaging.AbstractChannel', 'goog.testing.asserts']);
goog.addDependency('testing/messaging/mockmessageevent.js', ['goog.testing.messaging.MockMessageEvent'], ['goog.events.BrowserEvent', 'goog.events.EventType', 'goog.testing.events']);
goog.addDependency('testing/messaging/mockmessageport.js', ['goog.testing.messaging.MockMessagePort'], ['goog.events.EventTarget']);
goog.addDependency('testing/messaging/mockportnetwork.js', ['goog.testing.messaging.MockPortNetwork'], ['goog.messaging.PortNetwork', 'goog.testing.messaging.MockMessageChannel']);
goog.addDependency('testing/mock.js', ['goog.testing.Mock', 'goog.testing.MockExpectation'], ['goog.array', 'goog.object', 'goog.testing.JsUnitException', 'goog.testing.MockInterface', 'goog.testing.mockmatchers']);
goog.addDependency('testing/mockclassfactory.js', ['goog.testing.MockClassFactory', 'goog.testing.MockClassRecord'], ['goog.array', 'goog.object', 'goog.testing.LooseMock', 'goog.testing.StrictMock', 'goog.testing.TestCase', 'goog.testing.mockmatchers']);
goog.addDependency('testing/mockclock.js', ['goog.testing.MockClock'], ['goog.Disposable', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.events.Event']);
goog.addDependency('testing/mockcontrol.js', ['goog.testing.MockControl'], ['goog.array', 'goog.testing', 'goog.testing.LooseMock', 'goog.testing.MockInterface', 'goog.testing.StrictMock']);
goog.addDependency('testing/mockinterface.js', ['goog.testing.MockInterface'], []);
goog.addDependency('testing/mockmatchers.js', ['goog.testing.mockmatchers', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.testing.mockmatchers.IgnoreArgument', 'goog.testing.mockmatchers.InstanceOf', 'goog.testing.mockmatchers.ObjectEquals', 'goog.testing.mockmatchers.RegexpMatch', 'goog.testing.mockmatchers.SaveArgument', 'goog.testing.mockmatchers.TypeOf'], ['goog.array', 'goog.dom', 'goog.testing.asserts']);
goog.addDependency('testing/mockrandom.js', ['goog.testing.MockRandom'], ['goog.Disposable']);
goog.addDependency('testing/mockrange.js', ['goog.testing.MockRange'], ['goog.dom.AbstractRange', 'goog.testing.LooseMock']);
goog.addDependency('testing/mockstorage.js', ['goog.testing.MockStorage'], ['goog.structs.Map']);
goog.addDependency('testing/mockuseragent.js', ['goog.testing.MockUserAgent'], ['goog.Disposable', 'goog.userAgent']);
goog.addDependency('testing/multitestrunner.js', ['goog.testing.MultiTestRunner', 'goog.testing.MultiTestRunner.TestFrame'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.dom.classes', 'goog.events.EventHandler', 'goog.functions', 'goog.string', 'goog.ui.Component', 'goog.ui.ServerChart', 'goog.ui.TableSorter']);
goog.addDependency('testing/net/xhrio.js', ['goog.testing.net.XhrIo'], ['goog.array', 'goog.dom.xml', 'goog.events', 'goog.events.EventTarget', 'goog.json', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.net.XhrIo', 'goog.net.XmlHttp', 'goog.object', 'goog.structs.Map']);
goog.addDependency('testing/net/xhriopool.js', ['goog.testing.net.XhrIoPool'], ['goog.net.XhrIoPool', 'goog.testing.net.XhrIo']);
goog.addDependency('testing/objectpropertystring.js', ['goog.testing.ObjectPropertyString'], []);
goog.addDependency('testing/performancetable.js', ['goog.testing.PerformanceTable'], ['goog.dom', 'goog.testing.PerformanceTimer']);
goog.addDependency('testing/performancetimer.js', ['goog.testing.PerformanceTimer', 'goog.testing.PerformanceTimer.Task'], ['goog.array', 'goog.async.Deferred', 'goog.math']);
goog.addDependency('testing/propertyreplacer.js', ['goog.testing.PropertyReplacer'], ['goog.userAgent']);
goog.addDependency('testing/proto2/proto2.js', ['goog.testing.proto2'], ['goog.proto2.Message', 'goog.testing.asserts']);
goog.addDependency('testing/pseudorandom.js', ['goog.testing.PseudoRandom'], ['goog.Disposable']);
goog.addDependency('testing/recordfunction.js', ['goog.testing.FunctionCall', 'goog.testing.recordConstructor', 'goog.testing.recordFunction'], []);
goog.addDependency('testing/shardingtestcase.js', ['goog.testing.ShardingTestCase'], ['goog.asserts', 'goog.testing.TestCase']);
goog.addDependency('testing/singleton.js', ['goog.testing.singleton'], []);
goog.addDependency('testing/stacktrace.js', ['goog.testing.stacktrace', 'goog.testing.stacktrace.Frame'], []);
goog.addDependency('testing/storage/fakemechanism.js', ['goog.testing.storage.FakeMechanism'], ['goog.storage.mechanism.IterableMechanism', 'goog.structs.Map']);
goog.addDependency('testing/strictmock.js', ['goog.testing.StrictMock'], ['goog.array', 'goog.testing.Mock']);
goog.addDependency('testing/style/layoutasserts.js', ['goog.testing.style.layoutasserts'], ['goog.style', 'goog.testing.asserts', 'goog.testing.style']);
goog.addDependency('testing/style/style.js', ['goog.testing.style'], ['goog.dom', 'goog.math.Rect', 'goog.style']);
goog.addDependency('testing/testcase.js', ['goog.testing.TestCase', 'goog.testing.TestCase.Error', 'goog.testing.TestCase.Order', 'goog.testing.TestCase.Result', 'goog.testing.TestCase.Test'], ['goog.object', 'goog.testing.asserts', 'goog.testing.stacktrace']);
goog.addDependency('testing/testqueue.js', ['goog.testing.TestQueue'], []);
goog.addDependency('testing/testrunner.js', ['goog.testing.TestRunner'], ['goog.testing.TestCase']);
goog.addDependency('testing/ui/rendererasserts.js', ['goog.testing.ui.rendererasserts'], ['goog.testing.asserts']);
goog.addDependency('testing/ui/rendererharness.js', ['goog.testing.ui.RendererHarness'], ['goog.Disposable', 'goog.dom.NodeType', 'goog.testing.asserts', 'goog.testing.dom']);
goog.addDependency('testing/ui/style.js', ['goog.testing.ui.style'], ['goog.array', 'goog.dom', 'goog.dom.classes', 'goog.testing.asserts']);
goog.addDependency('timer/timer.js', ['goog.Timer'], ['goog.events.EventTarget']);
goog.addDependency('tweak/entries.js', ['goog.tweak.BaseEntry', 'goog.tweak.BasePrimitiveSetting', 'goog.tweak.BaseSetting', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.StringSetting'], ['goog.array', 'goog.asserts', 'goog.log', 'goog.object']);
goog.addDependency('tweak/registry.js', ['goog.tweak.Registry'], ['goog.asserts', 'goog.log', 'goog.object', 'goog.string', 'goog.tweak.BaseEntry', 'goog.uri.utils']);
goog.addDependency('tweak/testhelpers.js', ['goog.tweak.testhelpers'], ['goog.tweak', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.Registry', 'goog.tweak.StringSetting']);
goog.addDependency('tweak/tweak.js', ['goog.tweak', 'goog.tweak.ConfigParams'], ['goog.asserts', 'goog.tweak.BaseSetting', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.Registry', 'goog.tweak.StringSetting']);
goog.addDependency('tweak/tweakui.js', ['goog.tweak.EntriesPanel', 'goog.tweak.TweakUi'], ['goog.array', 'goog.asserts', 'goog.dom.DomHelper', 'goog.object', 'goog.style', 'goog.tweak', 'goog.ui.Zippy', 'goog.userAgent']);
goog.addDependency('ui/abstractspellchecker.js', ['goog.ui.AbstractSpellChecker', 'goog.ui.AbstractSpellChecker.AsyncResult'], ['goog.a11y.aria', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classes', 'goog.dom.selection', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.spell.SpellCheck', 'goog.structs.Set', 'goog.style', 'goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.MenuSeparator', 'goog.ui.PopupMenu']);
goog.addDependency('ui/ac/ac.js', ['goog.ui.ac'], ['goog.ui.ac.ArrayMatcher', 'goog.ui.ac.AutoComplete', 'goog.ui.ac.InputHandler', 'goog.ui.ac.Renderer']);
goog.addDependency('ui/ac/arraymatcher.js', ['goog.ui.ac.ArrayMatcher'], ['goog.string']);
goog.addDependency('ui/ac/autocomplete.js', ['goog.ui.ac.AutoComplete', 'goog.ui.ac.AutoComplete.EventType'], ['goog.array', 'goog.asserts', 'goog.events', 'goog.events.EventTarget', 'goog.object']);
goog.addDependency('ui/ac/inputhandler.js', ['goog.ui.ac.InputHandler'], ['goog.Disposable', 'goog.Timer', 'goog.a11y.aria', 'goog.dom', 'goog.dom.selection', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.string', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('ui/ac/remote.js', ['goog.ui.ac.Remote'], ['goog.ui.ac.AutoComplete', 'goog.ui.ac.InputHandler', 'goog.ui.ac.RemoteArrayMatcher', 'goog.ui.ac.Renderer']);
goog.addDependency('ui/ac/remotearraymatcher.js', ['goog.ui.ac.RemoteArrayMatcher'], ['goog.Disposable', 'goog.Uri', 'goog.events', 'goog.json', 'goog.net.EventType', 'goog.net.XhrIo']);
goog.addDependency('ui/ac/renderer.js', ['goog.ui.ac.Renderer', 'goog.ui.ac.Renderer.CustomRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.dispose', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classes', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.fx.dom.FadeInAndShow', 'goog.fx.dom.FadeOutAndHide', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.string', 'goog.style', 'goog.ui.IdGenerator', 'goog.ui.ac.AutoComplete']);
goog.addDependency('ui/ac/renderoptions.js', ['goog.ui.ac.RenderOptions'], []);
goog.addDependency('ui/ac/richinputhandler.js', ['goog.ui.ac.RichInputHandler'], ['goog.ui.ac.InputHandler']);
goog.addDependency('ui/ac/richremote.js', ['goog.ui.ac.RichRemote'], ['goog.ui.ac.AutoComplete', 'goog.ui.ac.Remote', 'goog.ui.ac.Renderer', 'goog.ui.ac.RichInputHandler', 'goog.ui.ac.RichRemoteArrayMatcher']);
goog.addDependency('ui/ac/richremotearraymatcher.js', ['goog.ui.ac.RichRemoteArrayMatcher'], ['goog.json', 'goog.ui.ac.RemoteArrayMatcher']);
goog.addDependency('ui/activitymonitor.js', ['goog.ui.ActivityMonitor'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType']);
goog.addDependency('ui/advancedtooltip.js', ['goog.ui.AdvancedTooltip'], ['goog.events', 'goog.events.EventType', 'goog.math.Box', 'goog.math.Coordinate', 'goog.style', 'goog.ui.Tooltip', 'goog.userAgent']);
goog.addDependency('ui/animatedzippy.js', ['goog.ui.AnimatedZippy'], ['goog.dom', 'goog.events', 'goog.fx.Animation', 'goog.fx.Transition', 'goog.fx.easing', 'goog.ui.Zippy', 'goog.ui.ZippyEvent']);
goog.addDependency('ui/attachablemenu.js', ['goog.ui.AttachableMenu'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classes', 'goog.events.Event', 'goog.events.KeyCodes', 'goog.string', 'goog.style', 'goog.ui.ItemEvent', 'goog.ui.MenuBase', 'goog.ui.PopupBase', 'goog.userAgent']);
goog.addDependency('ui/bidiinput.js', ['goog.ui.BidiInput'], ['goog.dom', 'goog.events', 'goog.events.InputHandler', 'goog.i18n.bidi', 'goog.ui.Component']);
goog.addDependency('ui/bubble.js', ['goog.ui.Bubble'], ['goog.Timer', 'goog.events', 'goog.events.EventType', 'goog.math.Box', 'goog.positioning', 'goog.positioning.AbsolutePosition', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.CornerBit', 'goog.style', 'goog.ui.Component', 'goog.ui.Popup']);
goog.addDependency('ui/button.js', ['goog.ui.Button', 'goog.ui.Button.Side'], ['goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.ui.ButtonRenderer', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.NativeButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/buttonrenderer.js', ['goog.ui.ButtonRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/buttonside.js', ['goog.ui.ButtonSide'], []);
goog.addDependency('ui/charcounter.js', ['goog.ui.CharCounter', 'goog.ui.CharCounter.Display'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.InputHandler']);
goog.addDependency('ui/charpicker.js', ['goog.ui.CharPicker'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom.classes', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.i18n.CharListDecompressor', 'goog.i18n.uChar', 'goog.structs.Set', 'goog.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.ContainerScroller', 'goog.ui.FlatButtonRenderer', 'goog.ui.HoverCard', 'goog.ui.LabelInput', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.Tooltip']);
goog.addDependency('ui/checkbox.js', ['goog.ui.Checkbox', 'goog.ui.Checkbox.State'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.ui.CheckboxRenderer', 'goog.ui.Component.EventType', 'goog.ui.Component.State', 'goog.ui.Control', 'goog.ui.registry']);
goog.addDependency('ui/checkboxmenuitem.js', ['goog.ui.CheckBoxMenuItem'], ['goog.ui.MenuItem', 'goog.ui.registry']);
goog.addDependency('ui/checkboxrenderer.js', ['goog.ui.CheckboxRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom.classes', 'goog.object', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/colorbutton.js', ['goog.ui.ColorButton'], ['goog.ui.Button', 'goog.ui.ColorButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/colorbuttonrenderer.js', ['goog.ui.ColorButtonRenderer'], ['goog.dom.classes', 'goog.functions', 'goog.ui.ColorMenuButtonRenderer']);
goog.addDependency('ui/colormenubutton.js', ['goog.ui.ColorMenuButton'], ['goog.array', 'goog.object', 'goog.ui.ColorMenuButtonRenderer', 'goog.ui.ColorPalette', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.registry']);
goog.addDependency('ui/colormenubuttonrenderer.js', ['goog.ui.ColorMenuButtonRenderer'], ['goog.color', 'goog.dom.classes', 'goog.ui.MenuButtonRenderer', 'goog.userAgent']);
goog.addDependency('ui/colorpalette.js', ['goog.ui.ColorPalette'], ['goog.array', 'goog.color', 'goog.style', 'goog.ui.Palette', 'goog.ui.PaletteRenderer']);
goog.addDependency('ui/colorpicker.js', ['goog.ui.ColorPicker', 'goog.ui.ColorPicker.EventType'], ['goog.ui.ColorPalette', 'goog.ui.Component']);
goog.addDependency('ui/colorsplitbehavior.js', ['goog.ui.ColorSplitBehavior'], ['goog.ui.ColorMenuButton', 'goog.ui.SplitBehavior']);
goog.addDependency('ui/combobox.js', ['goog.ui.ComboBox', 'goog.ui.ComboBoxItem'], ['goog.Timer', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.log', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.ItemEvent', 'goog.ui.LabelInput', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.ui.MenuSeparator', 'goog.ui.registry', 'goog.userAgent']);
goog.addDependency('ui/component.js', ['goog.ui.Component', 'goog.ui.Component.Error', 'goog.ui.Component.EventType', 'goog.ui.Component.State'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.object', 'goog.style', 'goog.ui.IdGenerator']);
goog.addDependency('ui/container.js', ['goog.ui.Container', 'goog.ui.Container.EventType', 'goog.ui.Container.Orientation'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.object', 'goog.style', 'goog.ui.Component', 'goog.ui.ContainerRenderer', 'goog.ui.Control']);
goog.addDependency('ui/containerrenderer.js', ['goog.ui.ContainerRenderer'], ['goog.a11y.aria', 'goog.array', 'goog.asserts', 'goog.dom.NodeType', 'goog.dom.classes', 'goog.string', 'goog.style', 'goog.ui.registry', 'goog.userAgent']);
goog.addDependency('ui/containerscroller.js', ['goog.ui.ContainerScroller'], ['goog.Disposable', 'goog.Timer', 'goog.events.EventHandler', 'goog.style', 'goog.ui.Component', 'goog.ui.Container']);
goog.addDependency('ui/control.js', ['goog.ui.Control'], ['goog.array', 'goog.dom', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.string', 'goog.ui.Component', 'goog.ui.ControlContent', 'goog.ui.ControlRenderer', 'goog.ui.decorate', 'goog.ui.registry', 'goog.userAgent']);
goog.addDependency('ui/controlcontent.js', ['goog.ui.ControlContent'], []);
goog.addDependency('ui/controlrenderer.js', ['goog.ui.ControlRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classes', 'goog.object', 'goog.style', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/cookieeditor.js', ['goog.ui.CookieEditor'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.events.EventType', 'goog.net.cookies', 'goog.string', 'goog.style', 'goog.ui.Component']);
goog.addDependency('ui/css3buttonrenderer.js', ['goog.ui.Css3ButtonRenderer'], ['goog.dom.TagName', 'goog.dom.classes', 'goog.ui.Button', 'goog.ui.ButtonRenderer', 'goog.ui.Component', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry']);
goog.addDependency('ui/css3menubuttonrenderer.js', ['goog.ui.Css3MenuButtonRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.MenuButton', 'goog.ui.MenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/cssnames.js', ['goog.ui.INLINE_BLOCK_CLASSNAME'], []);
goog.addDependency('ui/custombutton.js', ['goog.ui.CustomButton'], ['goog.ui.Button', 'goog.ui.CustomButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/custombuttonrenderer.js', ['goog.ui.CustomButtonRenderer'], ['goog.a11y.aria.Role', 'goog.dom.NodeType', 'goog.dom.classes', 'goog.string', 'goog.ui.ButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME']);
goog.addDependency('ui/customcolorpalette.js', ['goog.ui.CustomColorPalette'], ['goog.color', 'goog.dom', 'goog.dom.classes', 'goog.ui.ColorPalette', 'goog.ui.Component']);
goog.addDependency('ui/datepicker.js', ['goog.ui.DatePicker', 'goog.ui.DatePicker.Events', 'goog.ui.DatePickerEvent'], ['goog.a11y.aria', 'goog.asserts', 'goog.date', 'goog.date.Date', 'goog.date.Interval', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classes', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyHandler', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeSymbols', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.DefaultDatePickerRenderer', 'goog.ui.IdGenerator']);
goog.addDependency('ui/datepickerrenderer.js', ['goog.ui.DatePickerRenderer'], []);
goog.addDependency('ui/decorate.js', ['goog.ui.decorate'], ['goog.ui.registry']);
goog.addDependency('ui/defaultdatepickerrenderer.js', ['goog.ui.DefaultDatePickerRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.ui.DatePickerRenderer']);
goog.addDependency('ui/dialog.js', ['goog.ui.Dialog', 'goog.ui.Dialog.ButtonSet', 'goog.ui.Dialog.ButtonSet.DefaultButtons', 'goog.ui.Dialog.DefaultButtonCaptions', 'goog.ui.Dialog.DefaultButtonKeys', 'goog.ui.Dialog.Event', 'goog.ui.Dialog.EventType'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classes', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.fx.Dragger', 'goog.math.Rect', 'goog.structs', 'goog.structs.Map', 'goog.style', 'goog.ui.ModalPopup', 'goog.userAgent']);
goog.addDependency('ui/dimensionpicker.js', ['goog.ui.DimensionPicker'], ['goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Size', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.DimensionPickerRenderer', 'goog.ui.registry']);
goog.addDependency('ui/dimensionpickerrenderer.js', ['goog.ui.DimensionPickerRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.i18n.bidi', 'goog.style', 'goog.ui.ControlRenderer', 'goog.userAgent']);
goog.addDependency('ui/dragdropdetector.js', ['goog.ui.DragDropDetector', 'goog.ui.DragDropDetector.EventType', 'goog.ui.DragDropDetector.ImageDropEvent', 'goog.ui.DragDropDetector.LinkDropEvent'], ['goog.dom', 'goog.dom.TagName', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.string', 'goog.style', 'goog.userAgent']);
goog.addDependency('ui/drilldownrow.js', ['goog.ui.DrilldownRow'], ['goog.dom', 'goog.dom.classes', 'goog.ui.Component']);
goog.addDependency('ui/editor/abstractdialog.js', ['goog.ui.editor.AbstractDialog', 'goog.ui.editor.AbstractDialog.Builder', 'goog.ui.editor.AbstractDialog.EventType'], ['goog.dom', 'goog.dom.classes', 'goog.events.EventTarget', 'goog.string', 'goog.ui.Dialog']);
goog.addDependency('ui/editor/bubble.js', ['goog.ui.editor.Bubble'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.ViewportSizeMonitor', 'goog.dom.classes', 'goog.editor.style', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.log', 'goog.math.Box', 'goog.object', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.PopupBase', 'goog.userAgent']);
goog.addDependency('ui/editor/defaulttoolbar.js', ['goog.ui.editor.ButtonDescriptor', 'goog.ui.editor.DefaultToolbar'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classes', 'goog.editor.Command', 'goog.style', 'goog.ui.editor.ToolbarFactory', 'goog.ui.editor.messages', 'goog.userAgent']);
goog.addDependency('ui/editor/equationeditordialog.js', ['goog.ui.editor.EquationEditorDialog'], ['goog.editor.Command', 'goog.ui.Dialog', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.EquationEditorOkEvent', 'goog.ui.equation.TexEditor']);
goog.addDependency('ui/editor/equationeditorokevent.js', ['goog.ui.editor.EquationEditorOkEvent'], ['goog.events.Event', 'goog.ui.editor.AbstractDialog']);
goog.addDependency('ui/editor/linkdialog.js', ['goog.ui.editor.LinkDialog', 'goog.ui.editor.LinkDialog.BeforeTestLinkEvent', 'goog.ui.editor.LinkDialog.EventType', 'goog.ui.editor.LinkDialog.OkEvent'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Link', 'goog.editor.focus', 'goog.editor.node', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.string', 'goog.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.LinkButtonRenderer', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.TabPane', 'goog.ui.editor.messages', 'goog.userAgent', 'goog.window']);
goog.addDependency('ui/editor/messages.js', ['goog.ui.editor.messages'], []);
goog.addDependency('ui/editor/tabpane.js', ['goog.ui.editor.TabPane'], ['goog.dom.TagName', 'goog.dom.classes', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.Tab', 'goog.ui.TabBar']);
goog.addDependency('ui/editor/toolbarcontroller.js', ['goog.ui.editor.ToolbarController'], ['goog.editor.Field', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.ui.Component']);
goog.addDependency('ui/editor/toolbarfactory.js', ['goog.ui.editor.ToolbarFactory'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.ui.Component', 'goog.ui.Container', 'goog.ui.Option', 'goog.ui.Toolbar', 'goog.ui.ToolbarButton', 'goog.ui.ToolbarColorMenuButton', 'goog.ui.ToolbarMenuButton', 'goog.ui.ToolbarRenderer', 'goog.ui.ToolbarSelect', 'goog.userAgent']);
goog.addDependency('ui/emoji/emoji.js', ['goog.ui.emoji.Emoji'], []);
goog.addDependency('ui/emoji/emojipalette.js', ['goog.ui.emoji.EmojiPalette'], ['goog.events.EventType', 'goog.net.ImageLoader', 'goog.ui.Palette', 'goog.ui.emoji.Emoji', 'goog.ui.emoji.EmojiPaletteRenderer']);
goog.addDependency('ui/emoji/emojipaletterenderer.js', ['goog.ui.emoji.EmojiPaletteRenderer'], ['goog.a11y.aria', 'goog.dom.NodeType', 'goog.dom.classes', 'goog.style', 'goog.ui.PaletteRenderer', 'goog.ui.emoji.Emoji']);
goog.addDependency('ui/emoji/emojipicker.js', ['goog.ui.emoji.EmojiPicker'], ['goog.log', 'goog.style', 'goog.ui.Component', 'goog.ui.TabPane', 'goog.ui.emoji.Emoji', 'goog.ui.emoji.EmojiPalette', 'goog.ui.emoji.EmojiPaletteRenderer', 'goog.ui.emoji.ProgressiveEmojiPaletteRenderer']);
goog.addDependency('ui/emoji/popupemojipicker.js', ['goog.ui.emoji.PopupEmojiPicker'], ['goog.events.EventType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.ui.Component', 'goog.ui.Popup', 'goog.ui.emoji.EmojiPicker']);
goog.addDependency('ui/emoji/progressiveemojipaletterenderer.js', ['goog.ui.emoji.ProgressiveEmojiPaletteRenderer'], ['goog.style', 'goog.ui.emoji.EmojiPaletteRenderer']);
goog.addDependency('ui/emoji/spriteinfo.js', ['goog.ui.emoji.SpriteInfo'], []);
goog.addDependency('ui/equation/arrowpalette.js', ['goog.ui.equation.ArrowPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/changeevent.js', ['goog.ui.equation.ChangeEvent'], ['goog.events.Event']);
goog.addDependency('ui/equation/comparisonpalette.js', ['goog.ui.equation.ComparisonPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/editorpane.js', ['goog.ui.equation.EditorPane'], ['goog.style', 'goog.ui.Component']);
goog.addDependency('ui/equation/equationeditor.js', ['goog.ui.equation.EquationEditor'], ['goog.events', 'goog.ui.Component', 'goog.ui.TabBar', 'goog.ui.equation.ImageRenderer', 'goog.ui.equation.TexPane']);
goog.addDependency('ui/equation/equationeditordialog.js', ['goog.ui.equation.EquationEditorDialog'], ['goog.dom', 'goog.dom.classes', 'goog.ui.Dialog', 'goog.ui.equation.EquationEditor', 'goog.ui.equation.PaletteManager', 'goog.ui.equation.TexEditor']);
goog.addDependency('ui/equation/greekpalette.js', ['goog.ui.equation.GreekPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/imagerenderer.js', ['goog.ui.equation.ImageRenderer'], ['goog.dom.TagName', 'goog.dom.classes', 'goog.string', 'goog.uri.utils']);
goog.addDependency('ui/equation/mathpalette.js', ['goog.ui.equation.MathPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/menupalette.js', ['goog.ui.equation.MenuPalette', 'goog.ui.equation.MenuPaletteRenderer'], ['goog.math.Size', 'goog.ui.PaletteRenderer', 'goog.ui.equation.Palette', 'goog.ui.equation.PaletteRenderer']);
goog.addDependency('ui/equation/palette.js', ['goog.ui.equation.Palette', 'goog.ui.equation.PaletteEvent', 'goog.ui.equation.PaletteRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.events.Event', 'goog.ui.Palette', 'goog.ui.PaletteRenderer']);
goog.addDependency('ui/equation/palettemanager.js', ['goog.ui.equation.PaletteManager'], ['goog.Timer', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.ui.equation.ArrowPalette', 'goog.ui.equation.ComparisonPalette', 'goog.ui.equation.GreekPalette', 'goog.ui.equation.MathPalette', 'goog.ui.equation.MenuPalette', 'goog.ui.equation.Palette', 'goog.ui.equation.SymbolPalette']);
goog.addDependency('ui/equation/symbolpalette.js', ['goog.ui.equation.SymbolPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/texeditor.js', ['goog.ui.equation.TexEditor'], ['goog.ui.Component', 'goog.ui.equation.ImageRenderer', 'goog.ui.equation.TexPane']);
goog.addDependency('ui/equation/texpane.js', ['goog.ui.equation.TexPane'], ['goog.Timer', 'goog.dom', 'goog.dom.TagName', 'goog.dom.selection', 'goog.events', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.style', 'goog.ui.equation.ChangeEvent', 'goog.ui.equation.EditorPane', 'goog.ui.equation.ImageRenderer', 'goog.ui.equation.Palette', 'goog.ui.equation.PaletteEvent']);
goog.addDependency('ui/filteredmenu.js', ['goog.ui.FilteredMenu'], ['goog.dom', 'goog.events', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.FilterObservingMenuItem', 'goog.ui.Menu', 'goog.userAgent']);
goog.addDependency('ui/filterobservingmenuitem.js', ['goog.ui.FilterObservingMenuItem'], ['goog.ui.FilterObservingMenuItemRenderer', 'goog.ui.MenuItem', 'goog.ui.registry']);
goog.addDependency('ui/filterobservingmenuitemrenderer.js', ['goog.ui.FilterObservingMenuItemRenderer'], ['goog.ui.MenuItemRenderer']);
goog.addDependency('ui/flatbuttonrenderer.js', ['goog.ui.FlatButtonRenderer'], ['goog.a11y.aria.Role', 'goog.dom.classes', 'goog.ui.Button', 'goog.ui.ButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry']);
goog.addDependency('ui/flatmenubuttonrenderer.js', ['goog.ui.FlatMenuButtonRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.FlatButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.MenuRenderer', 'goog.ui.registry']);
goog.addDependency('ui/formpost.js', ['goog.ui.FormPost'], ['goog.array', 'goog.dom.TagName', 'goog.string', 'goog.string.StringBuffer', 'goog.ui.Component']);
goog.addDependency('ui/gauge.js', ['goog.ui.Gauge', 'goog.ui.GaugeColoredRange'], ['goog.a11y.aria', 'goog.asserts', 'goog.events', 'goog.fx.Animation', 'goog.fx.Transition', 'goog.fx.easing', 'goog.graphics', 'goog.graphics.Font', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.math', 'goog.ui.Component', 'goog.ui.GaugeTheme']);
goog.addDependency('ui/gaugetheme.js', ['goog.ui.GaugeTheme'], ['goog.graphics.LinearGradient', 'goog.graphics.SolidFill', 'goog.graphics.Stroke']);
goog.addDependency('ui/hovercard.js', ['goog.ui.HoverCard', 'goog.ui.HoverCard.EventType', 'goog.ui.HoverCard.TriggerEvent'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.ui.AdvancedTooltip', 'goog.ui.PopupBase', 'goog.ui.Tooltip']);
goog.addDependency('ui/hsvapalette.js', ['goog.ui.HsvaPalette'], ['goog.array', 'goog.color.alpha', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.ui.HsvPalette']);
goog.addDependency('ui/hsvpalette.js', ['goog.ui.HsvPalette'], ['goog.color', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.style', 'goog.style.bidi', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/idgenerator.js', ['goog.ui.IdGenerator'], []);
goog.addDependency('ui/idletimer.js', ['goog.ui.IdleTimer'], ['goog.Timer', 'goog.events', 'goog.events.EventTarget', 'goog.structs.Set', 'goog.ui.ActivityMonitor']);
goog.addDependency('ui/iframemask.js', ['goog.ui.IframeMask'], ['goog.Disposable', 'goog.Timer', 'goog.dom', 'goog.dom.iframe', 'goog.events.EventHandler', 'goog.style']);
goog.addDependency('ui/imagelessbuttonrenderer.js', ['goog.ui.ImagelessButtonRenderer'], ['goog.dom.classes', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.CustomButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry']);
goog.addDependency('ui/imagelessmenubuttonrenderer.js', ['goog.ui.ImagelessMenuButtonRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classes', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.MenuButton', 'goog.ui.MenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/inputdatepicker.js', ['goog.ui.InputDatePicker'], ['goog.date.DateTime', 'goog.dom', 'goog.string', 'goog.ui.Component', 'goog.ui.DatePicker', 'goog.ui.PopupBase', 'goog.ui.PopupDatePicker']);
goog.addDependency('ui/itemevent.js', ['goog.ui.ItemEvent'], ['goog.events.Event']);
goog.addDependency('ui/keyboardshortcuthandler.js', ['goog.ui.KeyboardShortcutEvent', 'goog.ui.KeyboardShortcutHandler', 'goog.ui.KeyboardShortcutHandler.EventType'], ['goog.Timer', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyNames', 'goog.object', 'goog.userAgent']);
goog.addDependency('ui/labelinput.js', ['goog.ui.LabelInput'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/linkbuttonrenderer.js', ['goog.ui.LinkButtonRenderer'], ['goog.ui.Button', 'goog.ui.FlatButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/media/flashobject.js', ['goog.ui.media.FlashObject', 'goog.ui.media.FlashObject.ScriptAccessLevel', 'goog.ui.media.FlashObject.Wmodes'], ['goog.asserts', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.log', 'goog.object', 'goog.string', 'goog.structs.Map', 'goog.style', 'goog.ui.Component', 'goog.userAgent', 'goog.userAgent.flash']);
goog.addDependency('ui/media/flickr.js', ['goog.ui.media.FlickrSet', 'goog.ui.media.FlickrSetModel'], ['goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/googlevideo.js', ['goog.ui.media.GoogleVideo', 'goog.ui.media.GoogleVideoModel'], ['goog.string', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/media.js', ['goog.ui.media.Media', 'goog.ui.media.MediaRenderer'], ['goog.style', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/media/mediamodel.js', ['goog.ui.media.MediaModel', 'goog.ui.media.MediaModel.Category', 'goog.ui.media.MediaModel.Credit', 'goog.ui.media.MediaModel.Credit.Role', 'goog.ui.media.MediaModel.Credit.Scheme', 'goog.ui.media.MediaModel.Medium', 'goog.ui.media.MediaModel.MimeType', 'goog.ui.media.MediaModel.Player', 'goog.ui.media.MediaModel.SubTitle', 'goog.ui.media.MediaModel.Thumbnail'], ['goog.array']);
goog.addDependency('ui/media/mp3.js', ['goog.ui.media.Mp3'], ['goog.string', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/photo.js', ['goog.ui.media.Photo'], ['goog.ui.media.Media', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/picasa.js', ['goog.ui.media.PicasaAlbum', 'goog.ui.media.PicasaAlbumModel'], ['goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/vimeo.js', ['goog.ui.media.Vimeo', 'goog.ui.media.VimeoModel'], ['goog.string', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/youtube.js', ['goog.ui.media.Youtube', 'goog.ui.media.YoutubeModel'], ['goog.string', 'goog.ui.Component', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/menu.js', ['goog.ui.Menu', 'goog.ui.Menu.EventType'], ['goog.math.Coordinate', 'goog.string', 'goog.style', 'goog.ui.Component.EventType', 'goog.ui.Component.State', 'goog.ui.Container', 'goog.ui.Container.Orientation', 'goog.ui.MenuHeader', 'goog.ui.MenuItem', 'goog.ui.MenuRenderer', 'goog.ui.MenuSeparator']);
goog.addDependency('ui/menubar.js', ['goog.ui.menuBar'], ['goog.ui.Container', 'goog.ui.MenuBarRenderer']);
goog.addDependency('ui/menubardecorator.js', ['goog.ui.menuBarDecorator'], ['goog.ui.MenuBarRenderer', 'goog.ui.menuBar', 'goog.ui.registry']);
goog.addDependency('ui/menubarrenderer.js', ['goog.ui.MenuBarRenderer'], ['goog.a11y.aria.Role', 'goog.ui.Container', 'goog.ui.ContainerRenderer']);
goog.addDependency('ui/menubase.js', ['goog.ui.MenuBase'], ['goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyHandler', 'goog.ui.Popup']);
goog.addDependency('ui/menubutton.js', ['goog.ui.MenuButton'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.math.Box', 'goog.math.Rect', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.positioning.Overflow', 'goog.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.MenuButtonRenderer', 'goog.ui.registry', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('ui/menubuttonrenderer.js', ['goog.ui.MenuButtonRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.CustomButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.Menu', 'goog.ui.MenuRenderer', 'goog.userAgent']);
goog.addDependency('ui/menuheader.js', ['goog.ui.MenuHeader'], ['goog.ui.Component', 'goog.ui.Control', 'goog.ui.MenuHeaderRenderer', 'goog.ui.registry']);
goog.addDependency('ui/menuheaderrenderer.js', ['goog.ui.MenuHeaderRenderer'], ['goog.ui.ControlRenderer']);
goog.addDependency('ui/menuitem.js', ['goog.ui.MenuItem'], ['goog.array', 'goog.dom', 'goog.dom.classes', 'goog.math.Coordinate', 'goog.string', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.MenuItemRenderer', 'goog.ui.registry']);
goog.addDependency('ui/menuitemrenderer.js', ['goog.ui.MenuItemRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.dom', 'goog.dom.classes', 'goog.ui.Component', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/menurenderer.js', ['goog.ui.MenuRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.ui.ContainerRenderer', 'goog.ui.Separator']);
goog.addDependency('ui/menuseparator.js', ['goog.ui.MenuSeparator'], ['goog.ui.MenuSeparatorRenderer', 'goog.ui.Separator', 'goog.ui.registry']);
goog.addDependency('ui/menuseparatorrenderer.js', ['goog.ui.MenuSeparatorRenderer'], ['goog.dom', 'goog.dom.classes', 'goog.ui.ControlContent', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/mockactivitymonitor.js', ['goog.ui.MockActivityMonitor'], ['goog.events.EventType', 'goog.ui.ActivityMonitor']);
goog.addDependency('ui/mockactivitymonitor_test.js', ['goog.ui.MockActivityMonitorTest'], ['goog.events', 'goog.functions', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.ActivityMonitor', 'goog.ui.MockActivityMonitor']);
goog.addDependency('ui/modalpopup.js', ['goog.ui.ModalPopup'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classes', 'goog.dom.iframe', 'goog.events', 'goog.events.EventType', 'goog.events.FocusHandler', 'goog.fx.Transition', 'goog.style', 'goog.ui.Component', 'goog.ui.PopupBase', 'goog.userAgent']);
goog.addDependency('ui/nativebuttonrenderer.js', ['goog.ui.NativeButtonRenderer'], ['goog.dom.classes', 'goog.events.EventType', 'goog.ui.ButtonRenderer', 'goog.ui.Component']);
goog.addDependency('ui/offlineinstalldialog.js', ['goog.ui.OfflineInstallDialog', 'goog.ui.OfflineInstallDialog.ButtonKeyType', 'goog.ui.OfflineInstallDialog.EnableScreen', 'goog.ui.OfflineInstallDialog.InstallScreen', 'goog.ui.OfflineInstallDialog.InstallingGearsScreen', 'goog.ui.OfflineInstallDialog.ScreenType', 'goog.ui.OfflineInstallDialog.UpgradeScreen', 'goog.ui.OfflineInstallDialogScreen'], ['goog.Disposable', 'goog.dom.classes', 'goog.gears', 'goog.string', 'goog.string.StringBuffer', 'goog.ui.Dialog', 'goog.window']);
goog.addDependency('ui/offlinestatuscard.js', ['goog.ui.OfflineStatusCard', 'goog.ui.OfflineStatusCard.EventType'], ['goog.dom', 'goog.events.EventType', 'goog.gears.StatusType', 'goog.structs.Map', 'goog.style', 'goog.ui.Component', 'goog.ui.ProgressBar']);
goog.addDependency('ui/offlinestatuscomponent.js', ['goog.ui.OfflineStatusComponent', 'goog.ui.OfflineStatusComponent.StatusClassNames'], ['goog.dom.classes', 'goog.events.EventType', 'goog.gears.StatusType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.ui.Component', 'goog.ui.OfflineStatusCard', 'goog.ui.Popup']);
goog.addDependency('ui/option.js', ['goog.ui.Option'], ['goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.registry']);
goog.addDependency('ui/palette.js', ['goog.ui.Palette'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Size', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.PaletteRenderer', 'goog.ui.SelectionModel']);
goog.addDependency('ui/paletterenderer.js', ['goog.ui.PaletteRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.dom', 'goog.dom.NodeIterator', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classes', 'goog.iter', 'goog.style', 'goog.ui.ControlRenderer', 'goog.userAgent']);
goog.addDependency('ui/plaintextspellchecker.js', ['goog.ui.PlainTextSpellChecker'], ['goog.Timer', 'goog.a11y.aria', 'goog.asserts', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.spell.SpellCheck', 'goog.style', 'goog.ui.AbstractSpellChecker', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/popup.js', ['goog.ui.Popup', 'goog.ui.Popup.AbsolutePosition', 'goog.ui.Popup.AnchoredPosition', 'goog.ui.Popup.AnchoredViewPortPosition', 'goog.ui.Popup.ClientPosition', 'goog.ui.Popup.Corner', 'goog.ui.Popup.Overflow', 'goog.ui.Popup.ViewPortClientPosition', 'goog.ui.Popup.ViewPortPosition'], ['goog.math.Box', 'goog.positioning.AbsolutePosition', 'goog.positioning.AnchoredPosition', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.ClientPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.ViewportClientPosition', 'goog.positioning.ViewportPosition', 'goog.style', 'goog.ui.PopupBase']);
goog.addDependency('ui/popupbase.js', ['goog.ui.PopupBase', 'goog.ui.PopupBase.EventType', 'goog.ui.PopupBase.Type'], ['goog.Timer', 'goog.dom', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.fx.Transition', 'goog.style', 'goog.userAgent']);
goog.addDependency('ui/popupcolorpicker.js', ['goog.ui.PopupColorPicker'], ['goog.dom.classes', 'goog.events.EventType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.ui.ColorPicker', 'goog.ui.Component', 'goog.ui.Popup']);
goog.addDependency('ui/popupdatepicker.js', ['goog.ui.PopupDatePicker'], ['goog.events.EventType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.style', 'goog.ui.Component', 'goog.ui.DatePicker', 'goog.ui.Popup', 'goog.ui.PopupBase']);
goog.addDependency('ui/popupmenu.js', ['goog.ui.PopupMenu'], ['goog.events.EventType', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.positioning.ViewportClientPosition', 'goog.structs', 'goog.structs.Map', 'goog.style', 'goog.ui.Component.EventType', 'goog.ui.Menu', 'goog.ui.PopupBase', 'goog.userAgent']);
goog.addDependency('ui/progressbar.js', ['goog.ui.ProgressBar', 'goog.ui.ProgressBar.Orientation'], ['goog.a11y.aria', 'goog.asserts', 'goog.dom', 'goog.dom.classes', 'goog.events', 'goog.events.EventType', 'goog.ui.Component', 'goog.ui.RangeModel', 'goog.userAgent']);
goog.addDependency('ui/prompt.js', ['goog.ui.Prompt'], ['goog.Timer', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.functions', 'goog.ui.Component', 'goog.ui.Dialog', 'goog.userAgent']);
goog.addDependency('ui/rangemodel.js', ['goog.ui.RangeModel'], ['goog.events.EventTarget', 'goog.ui.Component']);
goog.addDependency('ui/ratings.js', ['goog.ui.Ratings', 'goog.ui.Ratings.EventType'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom.classes', 'goog.events.EventType', 'goog.ui.Component']);
goog.addDependency('ui/registry.js', ['goog.ui.registry'], ['goog.dom.classes']);
goog.addDependency('ui/richtextspellchecker.js', ['goog.ui.RichTextSpellChecker'], ['goog.Timer', 'goog.dom', 'goog.dom.NodeType', 'goog.events', 'goog.events.EventType', 'goog.spell.SpellCheck', 'goog.string.StringBuffer', 'goog.ui.AbstractSpellChecker']);
goog.addDependency('ui/roundedpanel.js', ['goog.ui.BaseRoundedPanel', 'goog.ui.CssRoundedPanel', 'goog.ui.GraphicsRoundedPanel', 'goog.ui.RoundedPanel', 'goog.ui.RoundedPanel.Corner'], ['goog.dom', 'goog.dom.classes', 'goog.graphics', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.graphics.Stroke', 'goog.math', 'goog.math.Coordinate', 'goog.style', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/roundedtabrenderer.js', ['goog.ui.RoundedTabRenderer'], ['goog.dom', 'goog.ui.Tab', 'goog.ui.TabBar', 'goog.ui.TabRenderer', 'goog.ui.registry']);
goog.addDependency('ui/scrollfloater.js', ['goog.ui.ScrollFloater', 'goog.ui.ScrollFloater.EventType'], ['goog.array', 'goog.dom', 'goog.dom.classes', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/select.js', ['goog.ui.Select'], ['goog.a11y.aria.Role', 'goog.events.EventType', 'goog.ui.Component', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.SelectionModel', 'goog.ui.registry']);
goog.addDependency('ui/selectionmenubutton.js', ['goog.ui.SelectionMenuButton', 'goog.ui.SelectionMenuButton.SelectionState'], ['goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.registry']);
goog.addDependency('ui/selectionmodel.js', ['goog.ui.SelectionModel'], ['goog.array', 'goog.events.EventTarget', 'goog.events.EventType']);
goog.addDependency('ui/separator.js', ['goog.ui.Separator'], ['goog.a11y.aria', 'goog.asserts', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.MenuSeparatorRenderer', 'goog.ui.registry']);
goog.addDependency('ui/serverchart.js', ['goog.ui.ServerChart', 'goog.ui.ServerChart.AxisDisplayType', 'goog.ui.ServerChart.ChartType', 'goog.ui.ServerChart.EncodingType', 'goog.ui.ServerChart.Event', 'goog.ui.ServerChart.LegendPosition', 'goog.ui.ServerChart.MaximumValue', 'goog.ui.ServerChart.MultiAxisAlignment', 'goog.ui.ServerChart.MultiAxisType', 'goog.ui.ServerChart.UriParam', 'goog.ui.ServerChart.UriTooLongEvent'], ['goog.Uri', 'goog.array', 'goog.asserts', 'goog.events.Event', 'goog.string', 'goog.ui.Component']);
goog.addDependency('ui/slider.js', ['goog.ui.Slider', 'goog.ui.Slider.Orientation'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.dom', 'goog.ui.SliderBase']);
goog.addDependency('ui/sliderbase.js', ['goog.ui.SliderBase', 'goog.ui.SliderBase.AnimationFactory', 'goog.ui.SliderBase.Orientation'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classes', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.events.MouseWheelHandler', 'goog.fx.AnimationParallelQueue', 'goog.fx.Dragger', 'goog.fx.Transition', 'goog.fx.dom.ResizeHeight', 'goog.fx.dom.ResizeWidth', 'goog.fx.dom.Slide', 'goog.math', 'goog.math.Coordinate', 'goog.style', 'goog.style.bidi', 'goog.ui.Component', 'goog.ui.RangeModel']);
goog.addDependency('ui/splitbehavior.js', ['goog.ui.SplitBehavior', 'goog.ui.SplitBehavior.DefaultHandlers'], ['goog.Disposable', 'goog.dispose', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classes', 'goog.events.EventHandler', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.decorate', 'goog.ui.registry']);
goog.addDependency('ui/splitpane.js', ['goog.ui.SplitPane', 'goog.ui.SplitPane.Orientation'], ['goog.dom', 'goog.dom.classes', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.math.Rect', 'goog.math.Size', 'goog.style', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/style/app/buttonrenderer.js', ['goog.ui.style.app.ButtonRenderer'], ['goog.dom.classes', 'goog.ui.Button', 'goog.ui.CustomButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry']);
goog.addDependency('ui/style/app/menubuttonrenderer.js', ['goog.ui.style.app.MenuButtonRenderer'], ['goog.a11y.aria.Role', 'goog.array', 'goog.dom', 'goog.style', 'goog.ui.Menu', 'goog.ui.MenuRenderer', 'goog.ui.style.app.ButtonRenderer']);
goog.addDependency('ui/style/app/primaryactionbuttonrenderer.js', ['goog.ui.style.app.PrimaryActionButtonRenderer'], ['goog.ui.Button', 'goog.ui.registry', 'goog.ui.style.app.ButtonRenderer']);
goog.addDependency('ui/submenu.js', ['goog.ui.SubMenu'], ['goog.Timer', 'goog.dom', 'goog.dom.classes', 'goog.events.KeyCodes', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.style', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.ui.SubMenuRenderer', 'goog.ui.registry']);
goog.addDependency('ui/submenurenderer.js', ['goog.ui.SubMenuRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.classes', 'goog.style', 'goog.ui.Menu', 'goog.ui.MenuItemRenderer']);
goog.addDependency('ui/tab.js', ['goog.ui.Tab'], ['goog.ui.Component', 'goog.ui.Control', 'goog.ui.TabRenderer', 'goog.ui.registry']);
goog.addDependency('ui/tabbar.js', ['goog.ui.TabBar', 'goog.ui.TabBar.Location'], ['goog.ui.Component.EventType', 'goog.ui.Container', 'goog.ui.Container.Orientation', 'goog.ui.Tab', 'goog.ui.TabBarRenderer', 'goog.ui.registry']);
goog.addDependency('ui/tabbarrenderer.js', ['goog.ui.TabBarRenderer'], ['goog.a11y.aria.Role', 'goog.object', 'goog.ui.ContainerRenderer']);
goog.addDependency('ui/tablesorter.js', ['goog.ui.TableSorter', 'goog.ui.TableSorter.EventType'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classes', 'goog.events.EventType', 'goog.functions', 'goog.ui.Component']);
goog.addDependency('ui/tabpane.js', ['goog.ui.TabPane', 'goog.ui.TabPane.Events', 'goog.ui.TabPane.TabLocation', 'goog.ui.TabPane.TabPage', 'goog.ui.TabPaneEvent'], ['goog.dom', 'goog.dom.classes', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.style']);
goog.addDependency('ui/tabrenderer.js', ['goog.ui.TabRenderer'], ['goog.a11y.aria.Role', 'goog.ui.Component', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/textarea.js', ['goog.ui.Textarea', 'goog.ui.Textarea.EventType'], ['goog.dom', 'goog.events.EventType', 'goog.style', 'goog.ui.Control', 'goog.ui.TextareaRenderer', 'goog.userAgent']);
goog.addDependency('ui/textarearenderer.js', ['goog.ui.TextareaRenderer'], ['goog.dom.TagName', 'goog.ui.Component', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/togglebutton.js', ['goog.ui.ToggleButton'], ['goog.ui.Button', 'goog.ui.Component', 'goog.ui.CustomButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbar.js', ['goog.ui.Toolbar'], ['goog.ui.Container', 'goog.ui.ToolbarRenderer']);
goog.addDependency('ui/toolbarbutton.js', ['goog.ui.ToolbarButton'], ['goog.ui.Button', 'goog.ui.ToolbarButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarbuttonrenderer.js', ['goog.ui.ToolbarButtonRenderer'], ['goog.ui.CustomButtonRenderer']);
goog.addDependency('ui/toolbarcolormenubutton.js', ['goog.ui.ToolbarColorMenuButton'], ['goog.ui.ColorMenuButton', 'goog.ui.ToolbarColorMenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarcolormenubuttonrenderer.js', ['goog.ui.ToolbarColorMenuButtonRenderer'], ['goog.dom.classes', 'goog.ui.ColorMenuButtonRenderer', 'goog.ui.MenuButtonRenderer', 'goog.ui.ToolbarMenuButtonRenderer']);
goog.addDependency('ui/toolbarmenubutton.js', ['goog.ui.ToolbarMenuButton'], ['goog.ui.MenuButton', 'goog.ui.ToolbarMenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarmenubuttonrenderer.js', ['goog.ui.ToolbarMenuButtonRenderer'], ['goog.ui.MenuButtonRenderer']);
goog.addDependency('ui/toolbarrenderer.js', ['goog.ui.ToolbarRenderer'], ['goog.a11y.aria.Role', 'goog.ui.Container', 'goog.ui.ContainerRenderer', 'goog.ui.Separator', 'goog.ui.ToolbarSeparatorRenderer']);
goog.addDependency('ui/toolbarselect.js', ['goog.ui.ToolbarSelect'], ['goog.ui.Select', 'goog.ui.ToolbarMenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarseparator.js', ['goog.ui.ToolbarSeparator'], ['goog.ui.Separator', 'goog.ui.ToolbarSeparatorRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarseparatorrenderer.js', ['goog.ui.ToolbarSeparatorRenderer'], ['goog.dom.classes', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.MenuSeparatorRenderer']);
goog.addDependency('ui/toolbartogglebutton.js', ['goog.ui.ToolbarToggleButton'], ['goog.ui.ToggleButton', 'goog.ui.ToolbarButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/tooltip.js', ['goog.ui.Tooltip', 'goog.ui.Tooltip.CursorTooltipPosition', 'goog.ui.Tooltip.ElementTooltipPosition', 'goog.ui.Tooltip.State'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.math.Box', 'goog.math.Coordinate', 'goog.positioning', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.positioning.ViewportPosition', 'goog.structs.Set', 'goog.style', 'goog.ui.Popup', 'goog.ui.PopupBase']);
goog.addDependency('ui/tree/basenode.js', ['goog.ui.tree.BaseNode', 'goog.ui.tree.BaseNode.EventType'], ['goog.Timer', 'goog.a11y.aria', 'goog.asserts', 'goog.events.KeyCodes', 'goog.string', 'goog.string.StringBuffer', 'goog.style', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/tree/treecontrol.js', ['goog.ui.tree.TreeControl'], ['goog.a11y.aria', 'goog.asserts', 'goog.dom.classes', 'goog.events.EventType', 'goog.events.FocusHandler', 'goog.events.KeyHandler', 'goog.log', 'goog.ui.tree.BaseNode', 'goog.ui.tree.TreeNode', 'goog.ui.tree.TypeAhead', 'goog.userAgent']);
goog.addDependency('ui/tree/treenode.js', ['goog.ui.tree.TreeNode'], ['goog.ui.tree.BaseNode']);
goog.addDependency('ui/tree/typeahead.js', ['goog.ui.tree.TypeAhead', 'goog.ui.tree.TypeAhead.Offset'], ['goog.array', 'goog.events.KeyCodes', 'goog.string', 'goog.structs.Trie']);
goog.addDependency('ui/tristatemenuitem.js', ['goog.ui.TriStateMenuItem', 'goog.ui.TriStateMenuItem.State'], ['goog.dom.classes', 'goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.TriStateMenuItemRenderer', 'goog.ui.registry']);
goog.addDependency('ui/tristatemenuitemrenderer.js', ['goog.ui.TriStateMenuItemRenderer'], ['goog.dom.classes', 'goog.ui.MenuItemRenderer']);
goog.addDependency('ui/twothumbslider.js', ['goog.ui.TwoThumbSlider'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.dom', 'goog.ui.SliderBase']);
goog.addDependency('ui/zippy.js', ['goog.ui.Zippy', 'goog.ui.Zippy.Events', 'goog.ui.ZippyEvent'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.classes', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.style']);
goog.addDependency('uri/uri.js', ['goog.Uri', 'goog.Uri.QueryData'], ['goog.array', 'goog.string', 'goog.structs', 'goog.structs.Map', 'goog.uri.utils', 'goog.uri.utils.ComponentIndex', 'goog.uri.utils.StandardQueryParam']);
goog.addDependency('uri/uri_test.js', ['goog.UriTest'], ['goog.Uri', 'goog.testing.jsunit']);
goog.addDependency('uri/utils.js', ['goog.uri.utils', 'goog.uri.utils.ComponentIndex', 'goog.uri.utils.QueryArray', 'goog.uri.utils.QueryValue', 'goog.uri.utils.StandardQueryParam'], ['goog.asserts', 'goog.string', 'goog.userAgent']);
goog.addDependency('useragent/adobereader.js', ['goog.userAgent.adobeReader'], ['goog.string', 'goog.userAgent']);
goog.addDependency('useragent/flash.js', ['goog.userAgent.flash'], ['goog.string']);
goog.addDependency('useragent/iphoto.js', ['goog.userAgent.iphoto'], ['goog.string', 'goog.userAgent']);
goog.addDependency('useragent/jscript.js', ['goog.userAgent.jscript'], ['goog.string']);
goog.addDependency('useragent/picasa.js', ['goog.userAgent.picasa'], ['goog.string', 'goog.userAgent']);
goog.addDependency('useragent/platform.js', ['goog.userAgent.platform'], ['goog.userAgent']);
goog.addDependency('useragent/product.js', ['goog.userAgent.product'], ['goog.userAgent']);
goog.addDependency('useragent/product_isversion.js', ['goog.userAgent.product.isVersion'], ['goog.userAgent.product']);
goog.addDependency('useragent/useragent.js', ['goog.userAgent'], ['goog.string']);
goog.addDependency('vec/float32array.js', ['goog.vec.Float32Array'], []);
goog.addDependency('vec/float64array.js', ['goog.vec.Float64Array'], []);
goog.addDependency('vec/mat3.js', ['goog.vec.Mat3'], ['goog.vec']);
goog.addDependency('vec/mat3d.js', ['goog.vec.mat3d', 'goog.vec.mat3d.Type'], ['goog.vec']);
goog.addDependency('vec/mat3f.js', ['goog.vec.mat3f', 'goog.vec.mat3f.Type'], ['goog.vec']);
goog.addDependency('vec/mat4.js', ['goog.vec.Mat4'], ['goog.vec', 'goog.vec.Vec3', 'goog.vec.Vec4']);
goog.addDependency('vec/mat4d.js', ['goog.vec.mat4d', 'goog.vec.mat4d.Type'], ['goog.vec', 'goog.vec.vec3d', 'goog.vec.vec4d']);
goog.addDependency('vec/mat4f.js', ['goog.vec.mat4f', 'goog.vec.mat4f.Type'], ['goog.vec', 'goog.vec.vec3f', 'goog.vec.vec4f']);
goog.addDependency('vec/matrix3.js', ['goog.vec.Matrix3'], []);
goog.addDependency('vec/matrix4.js', ['goog.vec.Matrix4'], ['goog.vec', 'goog.vec.Vec3', 'goog.vec.Vec4']);
goog.addDependency('vec/quaternion.js', ['goog.vec.Quaternion'], ['goog.vec', 'goog.vec.Vec3', 'goog.vec.Vec4']);
goog.addDependency('vec/ray.js', ['goog.vec.Ray'], ['goog.vec.Vec3']);
goog.addDependency('vec/vec.js', ['goog.vec', 'goog.vec.AnyType', 'goog.vec.ArrayType', 'goog.vec.Float32', 'goog.vec.Float64', 'goog.vec.Number'], ['goog.vec.Float32Array', 'goog.vec.Float64Array']);
goog.addDependency('vec/vec2.js', ['goog.vec.Vec2'], ['goog.vec']);
goog.addDependency('vec/vec2d.js', ['goog.vec.vec2d', 'goog.vec.vec2d.Type'], ['goog.vec']);
goog.addDependency('vec/vec2f.js', ['goog.vec.vec2f', 'goog.vec.vec2f.Type'], ['goog.vec']);
goog.addDependency('vec/vec3.js', ['goog.vec.Vec3'], ['goog.vec']);
goog.addDependency('vec/vec3d.js', ['goog.vec.vec3d', 'goog.vec.vec3d.Type'], ['goog.vec']);
goog.addDependency('vec/vec3f.js', ['goog.vec.vec3f', 'goog.vec.vec3f.Type'], ['goog.vec']);
goog.addDependency('vec/vec4.js', ['goog.vec.Vec4'], ['goog.vec']);
goog.addDependency('vec/vec4d.js', ['goog.vec.vec4d', 'goog.vec.vec4d.Type'], ['goog.vec']);
goog.addDependency('vec/vec4f.js', ['goog.vec.vec4f', 'goog.vec.vec4f.Type'], ['goog.vec']);
goog.addDependency('webgl/webgl.js', ['goog.webgl'], []);
goog.addDependency('window/window.js', ['goog.window'], ['goog.string', 'goog.userAgent']);
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for string manipulation.
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};


/**
 * Case-insensitive equality checker.
 * @param {string} str1 First string to check.
 * @param {string} str2 Second string to check.
 * @return {boolean} True if {@code str1} and {@code str2} are the same string,
 *     ignoring case.
 */
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  var splitParts = str.split('%s');
  var returnString = '';

  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while (subsArguments.length &&
         // Replace up to the last split part. We are inserting in the
         // positions between split parts.
         splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift();
  }

  return returnString + splitParts.join('%s'); // Join unused '%s'
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} True if {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} True if{@code str} is null, undefined, empty, or
 *     whitespace only.
 */
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str));
};


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(
      /^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();

  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Regular expression used for splitting a string into substrings of fractional
 * numbers, integers, and non-numeric characters.
 * @type {RegExp}
 * @private
 */
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;


/**
 * String comparison function that handles numbers in a way humans might expect.
 * Using this function, the string "File 2.jpg" sorts before "File 10.jpg". The
 * comparison is mostly case-insensitive, though strings that are identical
 * except for case are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is significantly slower (about 500x) than either
 * the default or the case-insensitive compare. It should not be used in
 * time-critical code, but should be fast enough to sort several hundred short
 * strings (like filenames) with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {

      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII-betical string
  // comparison to stablize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escape double quote '"' characters in addition to '&', '<', and '>' so that a
 * string can be included in an HTML tag attribute value within double quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * NOTE(user):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, '&amp;')
          .replace(goog.string.ltRe_, '&lt;')
          .replace(goog.string.gtRe_, '&gt;')
          .replace(goog.string.quotRe_, '&quot;');

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.allRe_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.amperRe_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.ltRe_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.gtRe_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, '&quot;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.amperRe_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.ltRe_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.gtRe_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.quotRe_ = /\"/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @type {RegExp}
 * @private
 */
goog.string.allRe_ = /[&<>\"]/;


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one. We use the []
    // notation so that the JSCompiler will not complain about these objects and
    // fields in the case where we have no DOM.
    if ('document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div = document.createElement('div');
  // Match as many valid entity characters as possible. If the actual entity
  // happens to be shorter, it will still work as innerHTML will return the
  // trailing characters unchanged. Since the entity characters do not include
  // open angle bracket, there is no chance of XSS from the innerHTML use.
  // Since no whitespace is passed to innerHTML, whitespace is preserved.
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    // Check for cached entity.
    var value = seen[s];
    if (value) {
      return value;
    }
    // Check for numeric entity.
    if (entity.charAt(0) == '#') {
      // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    // Fall back to innerHTML otherwise.
    if (!value) {
      // Append a non-entity character to avoid a bug in Webkit that parses
      // an invalid entity at the end of innerHTML text as the empty string.
      div.innerHTML = s + ' ';
      // Then remove the trailing character from the result.
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    // Cache and return.
    return seen[s] = value;
  });
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};


/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;


/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @param {number=} opt_trailingChars Optional number of trailing characters to
 *     leave at the end of the string, instead of truncating as close to the
 *     middle as possible.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Special chars that need to be escaped for goog.string.quote.
 * @private
 * @type {Object}
 */
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\\': '\\\\'
};


/**
 * Character mappings used internally for goog.string.escapeChar.
 * @private
 * @type {Object}
 */
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
          ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join('');
  }
};


/**
 * Takes a string and returns the escaped string for that character.
 * @param {string} str The string to escape.
 * @return {string} An escaped string representing {@code str}.
 */
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }

  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }

  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Takes a string and creates a map (Object) in which the keys are the
 * characters in the string. The value for the key is set to true. You can
 * then use goog.object.map or goog.array.map to change the values.
 * @param {string} s The string to build the map from.
 * @return {Object} The map of characters used.
 */
// TODO(arv): It seems like we should have a generic goog.array.toMap. But do
//            we want a dependency on goog.array in goog.string?
goog.string.toMap = function(s) {
  var rv = {};
  for (var i = 0; i < s.length; i++) {
    rv[s.charAt(i)] = true;
  }
  return rv;
};


/**
 * Checks whether a string contains a given substring.
 * @param {string} s The string to test.
 * @param {string} ss The substring to test for.
 * @return {boolean} True if {@code s} contains {@code ss}.
 */
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1;
};


/**
 * Returns the non-overlapping occurrences of ss in s.
 * If either s or ss evalutes to false, then returns zero.
 * @param {string} s The string to look in.
 * @param {string} ss The string to look for.
 * @return {number} Number of occurrences of ss in s.
 */
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 *  Removes the first occurrence of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = function(string, length) {
  return new Array(length + 1).join(string);
};


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
         Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * Maximum value of #goog.string.hashCode, exclusive. 2^32.
 * @type {number}
 * @private
 */
goog.string.HASHCODE_MAX_ = 0x100000000;


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    result = 31 * result + str.charCodeAt(i);
    // Normalize to 4 byte range, 0 ... 2^32.
    result %= goog.string.HASHCODE_MAX_;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Ininity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmpty(str)) {
    return NaN;
  }
  return num;
};


/**
 * Returns whether the given string is lower camel case (e.g. "isFooBar").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is lower camel case.
 */
goog.string.isLowerCamelCase = function(str) {
  return /^[a-z]+([A-Z][a-z]*)*$/.test(str);
};


/**
 * Returns whether the given string is upper camel case (e.g. "FooBarBaz").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is upper camel case.
 */
goog.string.isUpperCamelCase = function(str) {
  return /^([A-Z][a-z]*)+$/.test(str);
};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @return {string} The string in camelCase form.
 */
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, '-$1').toLowerCase();
};


/**
 * Converts a string into TitleCase. First character of the string is always
 * capitalized in addition to the first letter of every subsequent word.
 * Words are delimited by one or more whitespaces by default. Custom delimiters
 * can optionally be specified to replace the default, which doesn't preserve
 * whitespace delimiters and instead must be explicitly included if needed.
 *
 * Default delimiter => " ":
 *    goog.string.toTitleCase('oneTwoThree')    => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three')  => 'One Two Three'
 *    goog.string.toTitleCase('  one   two   ') => '  One   Two   '
 *    goog.string.toTitleCase('one_two_three')  => 'One_two_three'
 *    goog.string.toTitleCase('one-two-three')  => 'One-two-three'
 *
 * Custom delimiter => "_-.":
 *    goog.string.toTitleCase('oneTwoThree', '_-.')       => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three', '_-.')     => 'One two three'
 *    goog.string.toTitleCase('  one   two   ', '_-.')    => '  one   two   '
 *    goog.string.toTitleCase('one_two_three', '_-.')     => 'One_Two_Three'
 *    goog.string.toTitleCase('one-two-three', '_-.')     => 'One-Two-Three'
 *    goog.string.toTitleCase('one...two...three', '_-.') => 'One...Two...Three'
 *    goog.string.toTitleCase('one. two. three', '_-.')   => 'One. two. three'
 *    goog.string.toTitleCase('one-two.three', '_-.')     => 'One-Two.Three'
 *
 * @param {string} str String value in camelCase form.
 * @param {string=} opt_delimiters Custom delimiter character set used to
 *      distinguish words in the string value. Each character represents a
 *      single delimiter. When provided, default whitespace delimiter is
 *      overridden and must be explicitly included if needed.
 * @return {string} String value in TitleCase form.
 */
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ?
      goog.string.regExpEscape(opt_delimiters) : '\\s';

  // For IE8, we need to prevent using an empty character set. Otherwise,
  // incorrect matching will occur.
  delimiters = delimiters ? '|[' + delimiters + ']+' : '';

  var regexp = new RegExp('(^' + delimiters + ')([a-z])', 'g');
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};


/**
 * Parse a string in decimal or hexidecimal ('0xFFFF') form.
 *
 * To parse a particular radix, please use parseInt(string, radix) directly. See
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/parseInt
 *
 * This is a wrapper for the built-in parseInt function that will only parse
 * numbers as base 10 or base 16.  Some JS implementations assume strings
 * starting with "0" are intended to be octal. ES3 allowed but discouraged
 * this behavior. ES5 forbids it.  This function emulates the ES5 behavior.
 *
 * For more information, see Mozilla JS Reference: http://goo.gl/8RiFj
 *
 * @param {string|number|null|undefined} value The value to be parsed.
 * @return {number} The number, parsed. If the string failed to parse, this
 *     will be NaN.
 */
goog.string.parseInt = function(value) {
  // Force finite numbers to strings.
  if (isFinite(value)) {
    value = String(value);
  }

  if (goog.isString(value)) {
    // If the string starts with '0x' or '-0x', parse as hex.
    return /^\s*-?0x/i.test(value) ?
        parseInt(value, 16) : parseInt(value, 10);
  }

  return NaN;
};


/**
 * Splits a string on a separator a limited number of times.
 *
 * This implementation is more similar to Python or Java, where the limit
 * parameter specifies the maximum number of splits rather than truncating
 * the number of results.
 *
 * See http://docs.python.org/2/library/stdtypes.html#str.split
 * See JavaDoc: http://goo.gl/F2AsY
 * See Mozilla reference: http://goo.gl/dZdZs
 *
 * @param {string} str String to split.
 * @param {string} separator The separator.
 * @param {number} limit The limit to the number of splits. The resulting array
 *     will have a maximum length of limit+1.  Negative numbers are the same
 *     as zero.
 * @return {!Array.<string>} The string, split.
 */

goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];

  // Only continue doing this while we haven't hit the limit and we have
  // parts left.
  while (limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--;
  }

  // If there are remaining parts, append them to the end.
  if (parts.length) {
    returnVal.push(parts.join(separator));
  }

  return returnVal;
};

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw goog.debug.Error(msg) directly, Error(msg) is
 * sufficient.
 *
 */

goog.provide('goog.debug.Error');



/**
 * Base class for custom error objects.
 * @param {*=} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {

  // Ensure there is a stack trace.
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    this.stack = new Error().stack || '';
  }

  if (opt_msg) {
    this.message = String(opt_msg);
  }
};
goog.inherits(goog.debug.Error, Error);


/** @override */
goog.debug.Error.prototype.name = 'CustomError';
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo()); goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 */

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');

goog.require('goog.debug.Error');
goog.require('goog.string');


/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
goog.define('goog.asserts.ENABLE_ASSERTS', goog.DEBUG);



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array.<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {goog.debug.Error}
 */
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  // Remove the messagePattern afterwards to avoid permenantly modifying the
  // passed in array.
  messageArgs.shift();

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);


/** @override */
goog.asserts.AssertionError.prototype.name = 'AssertionError';


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {Array.<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {Array.<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 * @private
 */
goog.asserts.doAssertFailure_ =
    function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  throw new goog.asserts.AssertionError('' + message, args || []);
};


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {*} The value of the condition.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_('', null, opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.assert.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} Failure.
 */
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 */
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a string.
 */
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a function.
 */
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {goog.asserts.AssertionError} When the value is not an object.
 */
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',
        [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array} The value, guaranteed to be a non-null array.
 * @throws {goog.asserts.AssertionError} When the value is not an array.
 */
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 *
 * The compiler may tighten the type returned by this function.
 *
 * @param {*} value The value to check.
 * @param {function(new: T, ...)} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the value is not an instance of
 *     type.
 * @return {!T}
 * @template T
 */
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_('instanceof check failed.', null,
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return value;
};


/**
 * Checks that no enumerable keys are present in Object.prototype. Such keys
 * would break most code that use {@code for (var ... in ...)} loops.
 */
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var key in Object.prototype) {
    goog.asserts.fail(key + ' should not be enumerable in Object.prototype.');
  }
};
/**
 * Base namespace for Skulpt. This is the only symbol that Skulpt adds to the
 * global namespace. Other user accessible symbols are noted and described
 * below.
 */

var Sk = Sk || {};

/**
 *
 * Set various customizable parts of Skulpt.
 *
 * output: Replacable output redirection (called from print, etc.).
 * read: Replacable function to load modules with (called via import, etc.)
 * sysargv: Setable to emulate arguments to the script. Should be an array of JS
 * strings.
 * syspath: Setable to emulate PYTHONPATH environment variable (for finding
 * modules). Should be an array of JS strings.
 *
 * Any variables that aren't set will be left alone.
 */
Sk.configure = function (options) {
	'use strict';
    Sk.output = options["output"] || Sk.output;
    goog.asserts.assert(typeof Sk.output === "function");

    Sk.debugout = options["debugout"] || Sk.debugout;
    goog.asserts.assert(typeof Sk.debugout === "function");

    Sk.read = options["read"] || Sk.read;
    goog.asserts.assert(typeof Sk.read === "function");

    Sk.timeoutMsg = options["timeoutMsg"] || Sk.timeoutMsg;
    goog.asserts.assert(typeof Sk.timeoutMsg === "function");
	goog.exportSymbol("Sk.timeoutMsg", Sk.timeoutMsg);

    Sk.sysargv = options["sysargv"] || Sk.sysargv;
    goog.asserts.assert(goog.isArrayLike(Sk.sysargv));

    Sk.python3 = options["python3"] || Sk.python3;
    goog.asserts.assert(typeof Sk.python3 === "boolean");

    Sk.inputfun = options["inputfun"] || Sk.inputfun;
    goog.asserts.assert(typeof Sk.inputfun === "function");

    Sk.throwSystemExit = options["systemexit"] || false;
    goog.asserts.assert(typeof Sk.throwSystemExit === "boolean");
	
	Sk.retainGlobals = options["retainglobals"] || false;
	goog.asserts.assert(typeof Sk.throwSystemExit === "boolean");
	
    if (options["syspath"]) {
        Sk.syspath = options["syspath"];
        goog.asserts.assert(goog.isArrayLike(Sk.syspath));
        // assume that if we're changing syspath we want to force reimports.
        // not sure how valid this is, perhaps a separate api for that.
        Sk.realsyspath = undefined;
        Sk.sysmodules = new Sk.builtin.dict([]);
    }

    Sk.misceval.softspace_ = false;
};
goog.exportSymbol("Sk.configure", Sk.configure);

/*
*	Replaceable message for message timeouts
*/
Sk.timeoutMsg = function () { return "Program exceeded run time limit."; };
goog.exportSymbol("Sk.timeoutMsg", Sk.timeoutMsg);

/*
 * Replacable output redirection (called from print, etc).
 */
Sk.output = function (x) {};

/*
 * Replacable function to load modules with (called via import, etc.)
 * todo; this should be an async api
 */
Sk.read = function (x) { throw "Sk.read has not been implemented"; };

/*
 * Setable to emulate arguments to the script. Should be array of JS strings.
 */
Sk.sysargv = [];

// lame function for sys module
Sk.getSysArgv = function () {
    return Sk.sysargv;
};
goog.exportSymbol("Sk.getSysArgv", Sk.getSysArgv);


/**
 * Setable to emulate PYTHONPATH environment variable (for finding modules).
 * Should be an array of JS strings.
 */
Sk.syspath = [];

Sk.inBrowser = goog.global['document'] !== undefined || typeof goog.global['importScripts'] !== 'undefined';

/**
 * Internal function used for debug output.
 * @param {...} args
 */
Sk.debugout = function(args) {};

(function() {
    // set up some sane defaults based on availability
    if (goog.global['write'] !== undefined) {
		Sk.output = goog.global['write']; 
	} else if (goog.global['console'] !== undefined && goog.global['console']['log'] !== undefined) {
		Sk.output = function (x) {goog.global['console']['log'](x);};
	} else if (goog.global['print'] !== undefined) { 
		Sk.output = goog.global['print'];
	}
    if (goog.global['print'] !== undefined) {
		Sk.debugout = goog.global['print'];
	}
}());

// override for closure to load stuff from the command line.
if (!Sk.inBrowser) {
    goog.global.CLOSURE_IMPORT_SCRIPT = function(src) {
        goog.global['eval'](goog.global['read']("support/closure-library/closure/goog/" + src));
        return true;
    };
}

Sk.python3 = false;
Sk.inputfun = function (args) { return prompt(args); };

goog.exportSymbol("Sk.python3",Sk.python3)
goog.exportSymbol("Sk.inputfun",Sk.inputfun)
goog.require("goog.asserts");
// builtins are supposed to come from the __builtin__ module, but we don't do
// that yet.
Sk.builtin = {};

// todo; these should all be func objects too, otherwise str() of them won't
// work, etc.

Sk.builtin.range = function range(start, stop, step)
{
    var ret = [];
    var i;

    Sk.builtin.pyCheckArgs("range", arguments, 1, 3);
    Sk.builtin.pyCheckType("start", "integer", Sk.builtin.checkInt(start));
    if (stop !== undefined) {
        Sk.builtin.pyCheckType("stop", "integer", Sk.builtin.checkInt(stop));
    }
    if (step !== undefined) {
        Sk.builtin.pyCheckType("step", "integer", Sk.builtin.checkInt(step));
    }

    start = Sk.builtin.asnum$(start);
    stop = Sk.builtin.asnum$(stop);
    step = Sk.builtin.asnum$(step);

    if ((stop === undefined) && (step === undefined)) {
        stop = start;
        start = 0;
        step = 1;
    } else if (step === undefined) {
        step = 1;
    }

    if (step === 0) {
        throw new Sk.builtin.ValueError("range() step argument must not be zero");
    }

    if (step > 0) {
        for (i=start; i<stop; i+=step) {
            ret.push(new Sk.builtin.nmber(i, Sk.builtin.nmber.int$));
        }
    } else {
        for (i=start; i>stop; i+=step) {
            ret.push(new Sk.builtin.nmber(i, Sk.builtin.nmber.int$));
        }
    }

    return new Sk.builtin.list(ret);
};

Sk.builtin.asnum$ = function(a) {
	if (a === undefined) return a;
	if (a === null) return a;
	if (a.constructor === Sk.builtin.none) return null;
	if (a.constructor === Sk.builtin.bool) {
	    if (a.v)
		return 1;
	    return 0;
	}
	if (typeof a === "number") return a;
	if (typeof a === "string") return a;
	if (a.constructor === Sk.builtin.nmber) return a.v;
	if (a.constructor === Sk.builtin.lng) {
	    if (a.cantBeInt())
		return a.str$(10, true);
	    return a.toInt$();
	}
	if (a.constructor === Sk.builtin.biginteger) {
	    if ((a.trueCompare(new Sk.builtin.biginteger(Sk.builtin.lng.threshold$)) > 0)
		|| (a.trueCompare(new Sk.builtin.biginteger(-Sk.builtin.lng.threshold$)) < 0)) {
		return a.toString();
	    }
	    return a.intValue();
	}

	return a;
};

goog.exportSymbol("Sk.builtin.asnum$", Sk.builtin.asnum$);

Sk.builtin.assk$ = function(a, b) {
	return new Sk.builtin.nmber(a, b);
}
goog.exportSymbol("Sk.builtin.assk$", Sk.builtin.assk$);

Sk.builtin.asnum$nofloat = function(a) {
	if (a === undefined) return a;
	if (a === null) return a;
	if (a.constructor === Sk.builtin.none) return null;
	if (a.constructor === Sk.builtin.bool) {
	    if (a.v)
		return 1;
	    return 0;
	}
	if (typeof a === "number") a = a.toString();
	if (a.constructor === Sk.builtin.nmber) a = a.v.toString();
	if (a.constructor === Sk.builtin.lng)   a = a.str$(10, true);
	if (a.constructor === Sk.builtin.biginteger) a = a.toString();

//	Sk.debugout("INITIAL: " + a);

	//	If not a float, great, just return this
	if (a.indexOf('.') < 0 && a.indexOf('e') < 0 && a.indexOf('E') < 0)
		return a;

	var expon=0;
	var mantissa;

	if (a.indexOf('e') >= 0) {
		mantissa = a.substr(0,a.indexOf('e'));
		expon = a.substr(a.indexOf('e')+1);
	} else if (a.indexOf('E') >= 0) {
		mantissa = a.substr(0,a.indexOf('e'));
		expon = a.substr(a.indexOf('E')+1);
	} else {
		mantissa = a;
	}

//	Sk.debugout("e:" + expon);

	expon = parseInt(expon, 10);

//	Sk.debugout("MANTISSA:" + mantissa);
//	Sk.debugout("EXPONENT:" + expon);

	var decimal = mantissa.indexOf('.');

//	Sk.debugout("DECIMAL: " + decimal);

	//	Simplest case, no decimal
	if (decimal < 0) {
		if (expon >= 0) {
			// Just add more zeroes and we're done
			while (expon-- > 0)
				mantissa += "0";
			return mantissa;
		} else {
			if (mantissa.length > -expon)
				return mantissa.substr(0,mantissa.length + expon);
			else
				return 0;
		}
	}

	//	Negative exponent OR decimal (neg or pos exp)
	if (decimal == 0)
		mantissa = mantissa.substr(1);
	else if (decimal < mantissa.length)
		mantissa = mantissa.substr(0,decimal) + mantissa.substr(decimal+1);
	else
		mantissa = mantissa.substr(0,decimal);

//	Sk.debugout("NO DECIMAL: " + mantissa);

	decimal = decimal + expon;

//	Sk.debugout("MOVE DECIM: " + decimal);

	while (decimal > mantissa.length)
		mantissa += "0";

//	Sk.debugout("PADDED    : " + mantissa);

	if (decimal <= 0) {
		mantissa = 0;
	} else {
		mantissa = mantissa.substr(0,decimal);
	}

//	Sk.debugout("LENGTH: " + mantissa.length);
//	Sk.debugout("RETURN: " + mantissa);

	return mantissa;
}
goog.exportSymbol("Sk.builtin.asnum$nofloat", Sk.builtin.asnum$nofloat);

Sk.builtin.round = function round(number, ndigits)
{
    var result, multiplier;

    Sk.builtin.pyCheckArgs("round", arguments, 1, 2);
    if (!Sk.builtin.checkNumber(number)) {
	throw new Sk.builtin.TypeError("a float is required");
    }
    if ((ndigits !== undefined) && !Sk.misceval.isIndex(ndigits)) {
        throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(ndigits) + "' object cannot be interpreted as an index");
    };

    if (ndigits === undefined) {
        ndigits = 0;
    };

    number = Sk.builtin.asnum$(number);
    ndigits = Sk.misceval.asIndex(ndigits);

    multiplier = Math.pow(10, ndigits);
    result = Math.round(number * multiplier) / multiplier;

    return new Sk.builtin.nmber(result, Sk.builtin.nmber.float$);
};

Sk.builtin.len = function len(item)
{
    Sk.builtin.pyCheckArgs("len", arguments, 1, 1);

    if (item.sq$length)
        return new Sk.builtin.nmber(item.sq$length(), Sk.builtin.nmber.int$);

    if (item.mp$length)
        return new Sk.builtin.nmber(item.mp$length(), Sk.builtin.nmber.int$);

    if (item.tp$length)
		return new Sk.builtin.nmber(item.tp$length(), Sk.builtin.nmber.int$);

    throw new Sk.builtin.TypeError("object of type '" + Sk.abstr.typeName(item) + "' has no len()");
};

Sk.builtin.min = function min()
{
    Sk.builtin.pyCheckArgs("min", arguments, 1);

    var args = Sk.misceval.arrayFromArguments(arguments);
    var lowest = args[0];
    for (var i = 1; i < args.length; ++i)
    {
        if (Sk.misceval.richCompareBool(args[i], lowest, 'Lt'))
            lowest = args[i];
    }
    return lowest;
};

Sk.builtin.max = function max()
{
    Sk.builtin.pyCheckArgs("max", arguments, 1);

    var args = Sk.misceval.arrayFromArguments(arguments);
    var highest = args[0];
    for (var i = 1; i < args.length; ++i)
    {
        if (Sk.misceval.richCompareBool(args[i], highest, 'Gt'))
            highest = args[i];
    }
    return highest;
};

Sk.builtin.any = function any(iter)
{
    var it, i;

    Sk.builtin.pyCheckArgs("any", arguments, 1);
    if (!Sk.builtin.checkIterable(iter)) {
		throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(iter)
			+ "' object is not iterable");
    }

    it = iter.tp$iter();
    for (i = it.tp$iternext(); i !== undefined; i = it.tp$iternext()) {
        if (Sk.misceval.isTrue(i)) {
            return Sk.builtin.bool.true$;
        }
    }

    return Sk.builtin.bool.false$;
}

Sk.builtin.all = function all(iter)
{
    var it, i;

    Sk.builtin.pyCheckArgs("all", arguments, 1);
     if (!Sk.builtin.checkIterable(iter)) {
	throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(iter)
				       + "' object is not iterable");
    }

    it = iter.tp$iter();
    for (i = it.tp$iternext(); i !== undefined; i = it.tp$iternext()) {
        if (!Sk.misceval.isTrue(i)) {
            return Sk.builtin.bool.false$;
        }
    }

    return Sk.builtin.bool.true$;
}

Sk.builtin.sum = function sum(iter,start)
{
    var tot;
    var it, i;
    var has_float;

    Sk.builtin.pyCheckArgs("sum", arguments, 1, 2);
    Sk.builtin.pyCheckType("iter", "iterable", Sk.builtin.checkIterable(iter));
    if (start !== undefined && Sk.builtin.checkString(start)) {
	throw new Sk.builtin.TypeError("sum() can't sum strings [use ''.join(seq) instead]");
    };

    if (start === undefined ) {
	tot = new Sk.builtin.nmber(0, Sk.builtin.nmber.int$);
    }
    else {
	tot = start;
    }

    it = iter.tp$iter();
    for (i = it.tp$iternext(); i !== undefined; i = it.tp$iternext()) {
	if (i.skType === Sk.builtin.nmber.float$) {
	    has_float = true;
	    if (tot.skType !== Sk.builtin.nmber.float$) {
		tot = new Sk.builtin.nmber(Sk.builtin.asnum$(tot),
					   Sk.builtin.nmber.float$)
	    }
	} else if (i instanceof Sk.builtin.lng) {
	    if (!has_float) {
		if (!(tot instanceof Sk.builtin.lng)) {
		    tot = new Sk.builtin.lng(tot)
		}
	    }
	}

	if (tot.nb$add(i) !== undefined) {
	    tot = tot.nb$add(i);
	} else {
	    throw new Sk.builtin.TypeError("unsupported operand type(s) for +: '"
					   + Sk.abstr.typeName(tot) + "' and '"
					   + Sk.abstr.typeName(i)+"'");
	}
    }

    return tot;
};

Sk.builtin.zip = function zip()
{
    if (arguments.length === 0)
    {
        return new Sk.builtin.list([]);
    }

    var iters = [];
    for (var i = 0; i < arguments.length; i++)
    {
        if (arguments[i].tp$iter)
        {
            iters.push(arguments[i].tp$iter());
        }
        else
        {
            throw "TypeError: argument " + i + " must support iteration";
        }
    }
    var res = [];
    var done = false;
    while (!done)
    {
        var tup = [];
        for (i = 0; i < arguments.length; i++)
        {
            var el = iters[i].tp$iternext();
            if (el === undefined)
            {
                done = true;
                break;
            }
            tup.push(el);
        }
        if (!done)
        {
            res.push(new Sk.builtin.tuple(tup));
        }
    }
    return new Sk.builtin.list(res);
}

Sk.builtin.abs = function abs(x)
{
    Sk.builtin.pyCheckArgs("abs", arguments, 1, 1);
    Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));

    return new Sk.builtin.nmber(Math.abs(Sk.builtin.asnum$(x)),x.skType);
};

Sk.builtin.ord = function ord(x)
{
    Sk.builtin.pyCheckArgs("ord", arguments, 1, 1);

    if (!Sk.builtin.checkString(x))
    {
        throw new Sk.builtin.TypeError("ord() expected a string of length 1, but " + Sk.abstr.typeName(x) + " found");
    }
    else if (x.v.length !== 1) {
	throw new Sk.builtin.TypeError("ord() expected a character, but string of length " + x.v.length + " found");
    }
    return new Sk.builtin.nmber((x.v).charCodeAt(0), Sk.builtin.nmber.int$);
};

Sk.builtin.chr = function chr(x)
{
    Sk.builtin.pyCheckArgs("chr", arguments, 1, 1);
    if (!Sk.builtin.checkInt(x)) {
	throw new Sk.builtin.TypeError("an integer is required");
    }
	x = Sk.builtin.asnum$(x);


    if ((x < 0) || (x > 255))
    {
        throw new Sk.builtin.ValueError("chr() arg not in range(256)");
    }

    return new Sk.builtin.str(String.fromCharCode(x));
};

Sk.builtin.int2str_ = function helper_(x, radix, prefix)
{
    var str = '';
    if (x instanceof Sk.builtin.lng) {
	var suffix = '';
	if (radix !== 2)
	    suffix = 'L';

	str = x.str$(radix, false);
	if (x.nb$isnegative()) {
	    return new Sk.builtin.str('-'+prefix+str+suffix);
	}
	return new Sk.builtin.str(prefix+str+suffix);
    } else {
	x = Sk.misceval.asIndex(x);
	str = x.toString(radix);
	if (x < 0) {
	    return new Sk.builtin.str('-'+prefix+str.slice(1));
	}
	return new Sk.builtin.str(prefix+str);
    }
};

Sk.builtin.hex = function hex(x)
{
    Sk.builtin.pyCheckArgs("hex", arguments, 1, 1);
    if (!Sk.misceval.isIndex(x)) {
	throw new Sk.builtin.TypeError("hex() argument can't be converted to hex");
    }
    return Sk.builtin.int2str_(x, 16, "0x");
};

Sk.builtin.oct = function oct(x)
{
    Sk.builtin.pyCheckArgs("oct", arguments, 1, 1);
    if (!Sk.misceval.isIndex(x)) {
	throw new Sk.builtin.TypeError("oct() argument can't be converted to hex");
    }
    return Sk.builtin.int2str_(x, 8, "0");
};

Sk.builtin.bin = function bin(x)
{
    Sk.builtin.pyCheckArgs("bin", arguments, 1, 1);
    if (!Sk.misceval.isIndex(x)) {
	throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(x) + "' object can't be interpreted as an index");
    }
    return Sk.builtin.int2str_(x, 2, "0b");
};

Sk.builtin.dir = function dir(x)
{
    Sk.builtin.pyCheckArgs("dir", arguments, 1, 1);

    var getName = function (k) {
        var s = null;
        var internal = ["__bases__", "__mro__", "__class__"];
        if (internal.indexOf(k) !== -1)
            return null;
        if (k.indexOf('$') !== -1)
            s = Sk.builtin.dir.slotNameToRichName(k);
        else if (k.charAt(k.length - 1) !== '_')
            s = k;
        else if (k.charAt(0) === '_')
            s = k;
        return s;
    };

    var names = [];
    var k;
    var s;
    var i;
    var mro;
    var base;
    var prop;

    // Add all object properties
    for (k in x.constructor.prototype)
    {
        s = getName(k);
        if (s)
            names.push(new Sk.builtin.str(s));
    }

    // Add all attributes
    if (x['$d'])
    {
        if (x['$d'].tp$iter)
        {
            // Dictionary
            var it = x['$d'].tp$iter();
            var i;
            for (i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
            {
                s = new Sk.builtin.str(i);
                s = getName(s.v);
                if (s)
                    names.push(new Sk.builtin.str(s));
            }
        }
        else
        {
            // Object
            for (s in x['$d'])
            {
                names.push(new Sk.builtin.str(s));
            }
        }
    }

    // Add all class attributes
    mro = x.tp$mro;
    if (mro)
    {
        mro = x.tp$mro;
        for (i = 0; i < mro.v.length; ++i)
        {
            base = mro.v[i];
            for (prop in base)
            {
                if (base.hasOwnProperty(prop))
                {
                    s = getName(prop);
                    if (s)
                        names.push(new Sk.builtin.str(s));
                }
            }
        }
    }

    // Sort results
    names.sort(function(a, b) { return (a.v > b.v) - (a.v < b.v); });

    // Get rid of duplicates before returning, as duplicates should
    //  only occur when they are shadowed
    var last = function(value, index, self) {
	// Returns true iff the value is not the same as the next value
	return value !== self[index+1];
    };
    return new Sk.builtin.list(names.filter(last));
};

Sk.builtin.dir.slotNameToRichName = function(k)
{
    // todo; map tp$xyz to __xyz__ properly
    return undefined;
};

Sk.builtin.repr = function repr(x)
{
    Sk.builtin.pyCheckArgs("repr", arguments, 1, 1);

    return Sk.misceval.objectRepr(x);
};

Sk.builtin.open = function open(filename, mode, bufsize)
{
    Sk.builtin.pyCheckArgs("open", arguments, 1, 3);
    if (mode === undefined) mode = new Sk.builtin.str("r");
    if (mode.v !== "r" && mode.v !== "rb") throw "todo; haven't implemented non-read opens";
    return new Sk.builtin.file(filename, mode, bufsize);
};

Sk.builtin.isinstance = function isinstance(obj, type)
{
    Sk.builtin.pyCheckArgs("isinstance", arguments, 2, 2);
    if (!Sk.builtin.checkClass(type) && !(type instanceof Sk.builtin.tuple)) {
	throw new Sk.builtin.TypeError("isinstance() arg 2 must be a class, type, or tuple of classes and types");
    }

    if (type === Sk.builtin.int_.prototype.ob$type) {
	if ((obj.tp$name === 'number') && (obj.skType === Sk.builtin.nmber.int$)) {
            return Sk.builtin.bool.true$;
        }
        else {
            return Sk.builtin.bool.false$;
        }
    }

    if (type === Sk.builtin.float_.prototype.ob$type) {
        if ((obj.tp$name === 'number') && (obj.skType === Sk.builtin.nmber.float$)) {
            return Sk.builtin.bool.true$;
        }
        else {
            return Sk.builtin.bool.false$;
        }
    }

    if (type === Sk.builtin.none.prototype.ob$type) {
        if (obj instanceof Sk.builtin.none) {
            return Sk.builtin.bool.true$;
        }
        else {
            return Sk.builtin.bool.false$;
        }
    }

    // Normal case
    if (obj.ob$type === type) return Sk.builtin.bool.true$;

    // Handle tuple type argument
    if (type instanceof Sk.builtin.tuple)
    {
        for (var i = 0; i < type.v.length; ++i)
        {
            if (Sk.misceval.isTrue(Sk.builtin.isinstance(obj, type.v[i])))
                return Sk.builtin.bool.true$;
        }
        return Sk.builtin.bool.false$;
    }

    var issubclass = function(klass, base)
    {
        if (klass === base) return Sk.builtin.bool.true$;
        if (klass['$d'] === undefined) return Sk.builtin.bool.false$;
        var bases = klass['$d'].mp$subscript(Sk.builtin.type.basesStr_);
        for (var i = 0; i < bases.v.length; ++i)
        {
            if (Sk.misceval.isTrue(issubclass(bases.v[i], base)))
                return Sk.builtin.bool.true$;
        }
        return Sk.builtin.bool.false$;
    };

    return issubclass(obj.ob$type, type);
};
Sk.builtin.hashCount = 0;
Sk.builtin.hash = function hash(value)
{
    Sk.builtin.pyCheckArgs("hash", arguments, 1, 1);

    // Useless object to get compiler to allow check for __hash__ property
    var junk = {__hash__: function() {return 0;}}

    if ((value instanceof Object) && (value.tp$hash !== undefined))
    {
        if (value.$savedHash_) return value.$savedHash_;
        value.$savedHash_ = value.tp$hash();
        return value.$savedHash_;
    }
    else if ((value instanceof Object) && (value.__hash__ !== undefined))
    {
        return Sk.misceval.callsim(value.__hash__, value);
    }
    else if (value instanceof Sk.builtin.bool)
    {
	   if (value.v){
	       return new Sk.builtin.nmber(1, Sk.builtin.nmber.int$);
       }
	   return new Sk.builtin.nmber(0, Sk.builtin.nmber.int$);
    }
    else if (value instanceof Sk.builtin.none)
    {
	   return new Sk.builtin.nmber(0, Sk.builtin.nmber.int$);
    }
    else if (value instanceof Object)
    {
        if (value.__id === undefined)
        {
            Sk.builtin.hashCount += 1;
            value.__id = Sk.builtin.hashCount;
        }
        return new Sk.builtin.nmber(value.__id, Sk.builtin.nmber.int$);
    }
    else if (typeof value === "number" || value === null
             || value === true || value === false)
    {
	   throw new Sk.builtin.TypeError("unsupported Javascript type");
    }

    return new Sk.builtin.str((typeof value) + ' ' + String(value));
    // todo; throw properly for unhashable types
};

Sk.builtin.getattr = function getattr(obj, name, default_)
{
    Sk.builtin.pyCheckArgs("getattr", arguments, 2, 3);
    if (!Sk.builtin.checkString(name)) {
	throw new Sk.builtin.TypeError("attribute name must be string");
    }

    var ret = obj.tp$getattr(name.v);
    if (ret === undefined)
    {
        if (default_ !== undefined)
            return default_;
        else
            throw new Sk.builtin.AttributeError("'" + Sk.abstr.typeName(obj) + "' object has no attribute '" + name.v + "'");
    }
    return ret;
};

Sk.builtin.raw_input = function(prompt) {
	prompt = prompt ? prompt.v : "";
	var x = Sk.inputfun(prompt);
    return new Sk.builtin.str(x);
};

Sk.builtin.input = Sk.builtin.raw_input;

Sk.builtin.jseval = function jseval(evalcode)
{
    goog.global['eval'](evalcode);
};

Sk.builtin.jsmillis = function jsmillis()
{
	var now = new Date()
	return now.valueOf();
};

Sk.builtin.superbi =  function superbi()
{
    throw new Sk.builtin.NotImplementedError("super is not yet implemented, please report your use case as a github issue.");
}

Sk.builtin.eval_ =  function eval_()
{
    throw new Sk.builtin.NotImplementedError("eval is not yet implemented");
}

Sk.builtin.map = function map(fun, seq) {
    Sk.builtin.pyCheckArgs("map", arguments, 2);

    if (arguments.length > 2)
    {
        // Pack sequences into one list of Javascript Arrays

        var combined = [];
        var iterables = Array.prototype.slice.apply(arguments).slice(1);
        for (var i in iterables)
        {
            if (!Sk.builtin.checkIterable(iterables[i]))
            {
                var argnum = parseInt(i,10) + 2;
                throw new Sk.builtin.TypeError("argument " + argnum + " to map() must support iteration");
            }
            iterables[i] = iterables[i].tp$iter()
        }

        while(true) 
        {
            var args = [];
            var nones = 0;
            for (var i in iterables)
            {
                var next = iterables[i].tp$iternext()
                if (next === undefined) 
                {
                    args.push(Sk.builtin.none.none$);
                    nones++;
                }
                else
                {
                    args.push(next);
                }
            }
            if (nones !== iterables.length) 
            {
                combined.push(args);
            }
            else 
            {
                // All iterables are done
                break;
            }
        }
        seq = new Sk.builtin.list(combined);
    }

    if (!Sk.builtin.checkIterable(seq))
    {
        throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(seq) + "' object is not iterable");
    }

    var retval = [];
    var iter, item;

    for (iter = seq.tp$iter(), item = iter.tp$iternext();
         item !== undefined;
         item = iter.tp$iternext())
    {
        if (fun === Sk.builtin.none.none$)
        {
            if (item instanceof Array)
            {
                // With None function and multiple sequences, 
                // map should return a list of tuples
                item = new Sk.builtin.tuple(item);
            }
            retval.push(item);
        }
        else
        {
            if (!(item instanceof Array))
            {
                // If there was only one iterable, convert to Javascript
                // Array for call to apply.
                item = [item];
            }
            retval.push(Sk.misceval.apply(fun, undefined, undefined, undefined, item));
        }
    }
    
    return new Sk.builtin.list(retval);
}

Sk.builtin.reduce = function reduce(fun, seq, initializer) {
    Sk.builtin.pyCheckArgs("reduce", arguments, 2, 3);
    if (!Sk.builtin.checkIterable(seq))
    {
	throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(seq) + "' object is not iterable");
    }

    var iter = seq.tp$iter();
    if (initializer === undefined)
    {
	initializer = iter.tp$iternext();
	if (initializer === undefined)
        {
	    throw new Sk.builtin.TypeError('reduce() of empty sequence with no initial value');
	}
    }
    var accum_value = initializer;
    var item;
    for (item = iter.tp$iternext();
         item !== undefined;
         item = iter.tp$iternext())
    {
        accum_value = Sk.misceval.callsim(fun, accum_value, item);
    }

    return accum_value;
}

Sk.builtin.filter = function filter(fun, iterable) { 
    Sk.builtin.pyCheckArgs("filter", arguments, 2, 2);
	
    if (!Sk.builtin.checkIterable(iterable))
    {
	throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(iterable) + "' object is not iterable");
    }
	
    var ctor = function () { return []; }
    var add = function (iter, item) { iter.push(item); return iter; } 
    var ret = function (iter) { return new Sk.builtin.list(iter); }
    
    if (iterable.__class__ === Sk.builtin.str)
    {
	ctor = function () { return new Sk.builtin.str(''); }
	add = function (iter, item) { return iter.sq$concat(item); }
	ret = function (iter) { return iter; }
    } 
    else if (iterable.__class__ === Sk.builtin.tuple) 
    {
	ret = function (iter) { return new Sk.builtin.tuple(iter); }
    }
    
    var retval = ctor();
    var iter, item;
    var result;

    for (iter = iterable.tp$iter(), item = iter.tp$iternext();
         item !== undefined;
         item = iter.tp$iternext())
    {
        if (fun === Sk.builtin.none.none$)
        {
            result = Sk.builtin.bool(item);
        }
        else
        {
            result = Sk.misceval.callsim(fun, item);
        }

        if (Sk.misceval.isTrue(result))
        {
            retval = add(retval, item);
        }
    }

    return ret(retval);
}

Sk.builtin.hasattr = function hasattr(obj,attr) {
    Sk.builtin.pyCheckArgs("hasattr", arguments, 2, 2);
    if (!Sk.builtin.checkString(attr)) {
        throw new Sk.builtin.TypeError('hasattr(): attribute name must be string');
    }

    if (obj.tp$getattr) {
        if (obj.tp$getattr(attr.v)) {
            return Sk.builtin.bool.true$;
        } else
            return Sk.builtin.bool.false$;
    } else
        throw new Sk.builtin.AttributeError('Object has no tp$getattr method')
}


Sk.builtin.pow = function pow(a, b, c) {
    Sk.builtin.pyCheckArgs("pow", arguments, 2, 3);

    if (c instanceof Sk.builtin.none)
        c = undefined;

    var a_num = Sk.builtin.asnum$(a);
    var b_num = Sk.builtin.asnum$(b);
    var c_num = Sk.builtin.asnum$(c);

    if (!Sk.builtin.checkNumber(a) || !Sk.builtin.checkNumber(b))
    {
	if (c === undefined)
	{
	    throw new Sk.builtin.TypeError("unsupported operand type(s) for pow(): '" + Sk.abstr.typeName(a) + "' and '" + Sk.abstr.typeName(b) + "'");
	}
	else
	{
	    throw new Sk.builtin.TypeError("unsupported operand type(s) for pow(): '" + Sk.abstr.typeName(a) + "', '" + Sk.abstr.typeName(b) + "', '" + Sk.abstr.typeName(c) + "'");
	}
    }
    if (a_num < 0 && b.skType === Sk.builtin.nmber.float$)
    {
	throw new Sk.builtin.ValueError("negative number cannot be raised to a fractional power");
    }

    if (c === undefined)
    {
	var res = Math.pow(a_num, b_num);
	if ((a.skType === Sk.builtin.nmber.float$ || b.skType === Sk.builtin.nmber.float$) || (b_num < 0))
	{
	    return new Sk.builtin.nmber(res, Sk.builtin.nmber.float$);
	}
	else if (a instanceof Sk.builtin.lng || b instanceof Sk.builtin.lng)
	{
	    return new Sk.builtin.lng(res);
	}
	else
	{
	    return new Sk.builtin.nmber(res, Sk.builtin.nmber.int$);
	}
    }
    else
    {
	if (!Sk.builtin.checkInt(a) || !Sk.builtin.checkInt(b) || !Sk.builtin.checkInt(c))
	{
	    throw new Sk.builtin.TypeError("pow() 3rd argument not allowed unless all arguments are integers");
	}
	if (b_num < 0)
	{
	    throw new Sk.builtin.TypeError("pow() 2nd argument cannot be negative when 3rd argument specified");
	}

	if ((a instanceof Sk.builtin.lng || b instanceof Sk.builtin.lng || c instanceof Sk.builtin.lng)
            || (Math.pow(a_num, b_num) === Infinity))
	{
	    // convert a to a long so that we can use biginteger's modPowInt method
	    a = new Sk.builtin.lng(a);
	    return a.nb$power(b, c);
	}
	else
	{
	    var ret = new Sk.builtin.nmber(Math.pow(a_num, b_num), Sk.builtin.nmber.int$);
	    return ret.nb$remainder(c);
	}
    }

}

Sk.builtin.quit = function quit(msg) {
    var s = new Sk.builtin.str(msg).v;
    throw new Sk.builtin.SystemExit(s);
}

Sk.builtin.sorted = function sorted(iterable, cmp, key, reverse) {
	var compare_func;
	var list;
	if (key !== undefined && !(key instanceof Sk.builtin.none)) {
		if (cmp instanceof Sk.builtin.none || cmp === undefined) {
			compare_func = function(a,b){
			    return Sk.misceval.richCompareBool(a[0], b[0], "Lt") ? new Sk.builtin.nmber(-1, Sk.builtin.nmber.int$) : new Sk.builtin.nmber(0, Sk.builtin.nmber.int$);
			};
		}
        else {
            compare_func = function(a,b) { return Sk.misceval.callsim(cmp, a[0], b[0]); };
		}
		var iter = iterable.tp$iter();
		var next = iter.tp$iternext();
		var arr = [];
		while (next !== undefined){
			arr.push([Sk.misceval.callsim(key, next), next]);
			next = iter.tp$iternext();
		}
        list = new Sk.builtin.list(arr);
	}
	else {
		if (!(cmp instanceof Sk.builtin.none) && cmp !== undefined) {
			compare_func = cmp;
		}
        list = new Sk.builtin.list(iterable);
	}

	if (compare_func !== undefined) {
		list.list_sort_(list, compare_func);
	}
	else {
		list.list_sort_(list);
	}

	if (reverse) {
		list.list_reverse_(list);
	}

	if (key !== undefined && !(key instanceof Sk.builtin.none)) {
		var iter = list.tp$iter();
		var next = iter.tp$iternext()
		var arr = [];
		while (next !== undefined){
			arr.push(next[1]);
			next = iter.tp$iternext();
		}
		list = new Sk.builtin.list(arr);
	}

	return list;
}
Sk.builtin.sorted.co_varnames = ['cmp', 'key', 'reverse'];
Sk.builtin.sorted.$defaults = [Sk.builtin.none, Sk.builtin.none, false];
Sk.builtin.sorted.co_numargs = 4;

Sk.builtin.issubclass = function issubclass(c1, c2) {
    Sk.builtin.pyCheckArgs("issubclass", arguments, 2, 2);
    if (!Sk.builtin.checkClass(c2) && !(c2 instanceof Sk.builtin.tuple)) {
        throw new Sk.builtin.TypeError("issubclass() arg 2 must be a classinfo, type, or tuple of classes and types");
    }

    //print("c1 name: " + c1.tp$name);

    if (c2 === Sk.builtin.int_.prototype.ob$type) {
        return true;
    }

    if (c2 === Sk.builtin.float_.prototype.ob$type) {
        return true;
    }

    if (c2 === Sk.builtin.none.prototype.ob$type) {
        return true;
    }

    // Normal case
    if (c1.ob$type === c2) return true;

    var issubclass_internal = function(klass, base)
    {
        if (klass === base) return true;
        if (klass['$d'] === undefined) return false;
        if (klass['$d'].mp$subscript) {
            var bases = klass['$d'].mp$subscript(Sk.builtin.type.basesStr_);
        } else {
            return false;
        }
        for (var i = 0; i < bases.v.length; ++i)
        {
            if (issubclass_internal(bases.v[i], base))
                return true;
        }
        return false;
    };

    // Handle tuple type argument
    if (c2 instanceof Sk.builtin.tuple)
    {
        for (var i = 0; i < c2.v.length; ++i)
        {
            if (Sk.builtin.issubclass(c1, c2.v[i]))
                return true;
        }
        return false;
    }

    return issubclass_internal(c1, c2);

 }

Sk.builtin.globals = function globals() { 
    var ret = new Sk.builtin.dict([]);
    for (var i in Sk['globals']) {
        ret.mp$ass_subscript(new Sk.builtin.str(i),Sk['globals'][i])
    }
    
    return ret;

}



Sk.builtin.bytearray = function bytearray() { throw new Sk.builtin.NotImplementedError("bytearray is not yet implemented")}
Sk.builtin.callable = function callable() { throw new Sk.builtin.NotImplementedError("callable is not yet implemented")}
Sk.builtin.complex = function complex() { throw new Sk.builtin.NotImplementedError("complex is not yet implemented")}
Sk.builtin.delattr = function delattr() { throw new Sk.builtin.NotImplementedError("delattr is not yet implemented")}
Sk.builtin.divmod = function divmod() { throw new Sk.builtin.NotImplementedError("divmod is not yet implemented")}
Sk.builtin.execfile = function execfile() { throw new Sk.builtin.NotImplementedError("execfile is not yet implemented")}
Sk.builtin.format = function format() { throw new Sk.builtin.NotImplementedError("format is not yet implemented")}
Sk.builtin.frozenset = function frozenset() { throw new Sk.builtin.NotImplementedError("frozenset is not yet implemented")}

Sk.builtin.help = function help() { throw new Sk.builtin.NotImplementedError("help is not yet implemented")}
Sk.builtin.iter = function iter() { throw new Sk.builtin.NotImplementedError("iter is not yet implemented")}
Sk.builtin.locals = function locals() { throw new Sk.builtin.NotImplementedError("locals is not yet implemented")}
Sk.builtin.memoryview = function memoryview() { throw new Sk.builtin.NotImplementedError("memoryview is not yet implemented")}
Sk.builtin.next_ = function next_() { throw new Sk.builtin.NotImplementedError("next is not yet implemented")}
Sk.builtin.property = function property() { throw new Sk.builtin.NotImplementedError("property is not yet implemented")}
Sk.builtin.reload = function reload() { throw new Sk.builtin.NotImplementedError("reload is not yet implemented")}
Sk.builtin.reversed = function reversed() { throw new Sk.builtin.NotImplementedError("reversed is not yet implemented")}
Sk.builtin.unichr = function unichr() { throw new Sk.builtin.NotImplementedError("unichr is not yet implemented")}
Sk.builtin.vars = function vars() { throw new Sk.builtin.NotImplementedError("vars is not yet implemented")}
Sk.builtin.xrange = Sk.builtin.range;
Sk.builtin.apply_ = function apply_() { throw new Sk.builtin.NotImplementedError("apply is not yet implemented")}
Sk.builtin.buffer = function buffer() { throw new Sk.builtin.NotImplementedError("buffer is not yet implemented")}
Sk.builtin.coerce = function coerce() { throw new Sk.builtin.NotImplementedError("coerce is not yet implemented")}
Sk.builtin.intern = function intern() { throw new Sk.builtin.NotImplementedError("intern is not yet implemented")}


/*
Sk.builtinFiles = {};
Sk.builtin.read = function read(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
};
Sk.builtinFiles = undefined;
*/
/*
 * The filename, line number, and column number of exceptions are
 * stored within the exception object.  Note that not all exceptions
 * clearly report the column number.  To customize the exception
 * message to use any/all of these fields, you can either modify
 * tp$str below to print the desired message, or use them in the
 * skulpt wrapper (i.e., runit) to present the exception message.
 */


/**
 * @constructor
 * @param {...Object|null} args
 */
Sk.builtin.Exception = function(args)
{
    var args = Array.prototype.slice.call(arguments);
    // hackage to allow shorter throws
    for (var i = 0; i < args.length; ++i)
    {
        if (typeof args[i] === "string")
            args[i] = new Sk.builtin.str(args[i]);
    }
    this.args = new Sk.builtin.tuple(args);

    if (Sk.currFilename)
    {
        this.filename = Sk.currFilename;
    }
    else if (this.args.sq$length() >= 3)
    {
        if (this.args.v[1].v)
        {
            this.filename = this.args.v[1].v;
        }
        else
        {
            // Unknown, this is an error, and the exception that causes it
            // probably needs to be fixed.
            this.filename = "<unknown>";
        }
    }
    else
    {
        // Unknown, this is an error, and the exception that causes it
        // probably needs to be fixed.
        this.filename = "<unknown>";
    }
    if (this.args.sq$length() >= 3)
    {
        this.lineno = this.args.v[2];
    }
    else if (Sk.currLineNo > 0) 
    {
        this.lineno = Sk.currLineNo;
    }
    else
    {
        // Unknown, this is an error, and the exception that causes it
        // probably needs to be fixed.
        this.lineno = "<unknown>";
    }

    if (Sk.currColNo > 0)
    {
        this.colno = Sk.currColNo;
    }
    else
    {
        this.colno = "<unknown>";
    }
};
Sk.builtin.Exception.prototype.tp$name = "Exception";

Sk.builtin.Exception.prototype.tp$str = function()
{
    var ret = "";

    ret += this.tp$name;
    if (this.args)
        ret += ": " + (this.args.v.length > 0 ? this.args.v[0].v : '');
    ret += " on line " + this.lineno;

    if (this.args.v.length > 4)
    {
        ret += "\n" + this.args.v[4].v + "\n";
        for (var i = 0; i < this.args.v[3]; ++i) ret += " ";
        ret += "^\n";
    }

    return new Sk.builtin.str(ret);
};

Sk.builtin.Exception.prototype.toString = function()
{
    return this.tp$str().v;
}

goog.exportSymbol("Sk.builtin.Exception", Sk.builtin.Exception);

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.AssertionError = function(args) {
    if (!(this instanceof Sk.builtin.AssertionError)) {
        var o = Object.create(Sk.builtin.AssertionError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.AssertionError, Sk.builtin.Exception);
Sk.builtin.AssertionError.prototype.tp$name = "AssertionError";
goog.exportSymbol("Sk.builtin.AssertionError", Sk.builtin.AssertionError);

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.AttributeError = function(args) {
    if (!(this instanceof Sk.builtin.AttributeError)) {
        var o = Object.create(Sk.builtin.AttributeError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.AttributeError, Sk.builtin.Exception);
Sk.builtin.AttributeError.prototype.tp$name = "AttributeError";

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.ImportError = function(args) {
    if (!(this instanceof Sk.builtin.ImportError)) {
        var o = Object.create(Sk.builtin.ImportError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.ImportError, Sk.builtin.Exception);
Sk.builtin.ImportError.prototype.tp$name = "ImportError";

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.IndentationError = function(args) {
    if (!(this instanceof Sk.builtin.IndentationError)) {
        var o = Object.create(Sk.builtin.IndentationError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.IndentationError, Sk.builtin.Exception);
Sk.builtin.IndentationError.prototype.tp$name = "IndentationError";

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.IndexError = function(args) {
    if (!(this instanceof Sk.builtin.IndexError)) {
        var o = Object.create(Sk.builtin.IndexError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.IndexError, Sk.builtin.Exception);
Sk.builtin.IndexError.prototype.tp$name = "IndexError";

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.KeyError = function(args) {
    if (!(this instanceof Sk.builtin.KeyError)) {
        var o = Object.create(Sk.builtin.KeyError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.KeyError, Sk.builtin.Exception);
Sk.builtin.KeyError.prototype.tp$name = "KeyError";

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.NameError = function(args) {
    if (!(this instanceof Sk.builtin.NameError)) {
        var o = Object.create(Sk.builtin.NameError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.NameError, Sk.builtin.Exception);
Sk.builtin.NameError.prototype.tp$name = "NameError";

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.OverflowError = function(args) {
    if (!(this instanceof Sk.builtin.OverflowError)) {
        var o = Object.create(Sk.builtin.OverflowError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.OverflowError, Sk.builtin.Exception);
Sk.builtin.OverflowError.prototype.tp$name = "OverflowError";


/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.ParseError = function(args) {
    if (!(this instanceof Sk.builtin.ParseError)) {
        var o = Object.create(Sk.builtin.ParseError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.ParseError, Sk.builtin.Exception);
Sk.builtin.ParseError.prototype.tp$name = "ParseError";


/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.SystemExit = function(args) {
    if (!(this instanceof Sk.builtin.SystemExit)) {
        var o = Object.create(Sk.builtin.SystemExit.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.SystemExit, Sk.builtin.Exception);
Sk.builtin.SystemExit.prototype.tp$name = "SystemExit";
goog.exportSymbol("Sk.builtin.SystemExit", Sk.builtin.SystemExit);


/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.SyntaxError = function(args) {
    if (!(this instanceof Sk.builtin.SyntaxError)) {
        var o = Object.create(Sk.builtin.SyntaxError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.SyntaxError, Sk.builtin.Exception);
Sk.builtin.SyntaxError.prototype.tp$name = "SyntaxError";

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.TokenError = function(args) {
    if (!(this instanceof Sk.builtin.TokenError)) {
        var o = Object.create(Sk.builtin.TokenError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.TokenError, Sk.builtin.Exception);
Sk.builtin.TokenError.prototype.tp$name = "TokenError";

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.TypeError = function(args) {
    if (!(this instanceof Sk.builtin.TypeError)) {
        var o = Object.create(Sk.builtin.TypeError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.TypeError, Sk.builtin.Exception);
Sk.builtin.TypeError.prototype.tp$name = "TypeError";
goog.exportSymbol("Sk.builtin.TypeError", Sk.builtin.TypeError);
/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.ValueError = function(args) {
    if (!(this instanceof Sk.builtin.ValueError)) {
        var o = Object.create(Sk.builtin.ValueError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.ValueError, Sk.builtin.Exception);
Sk.builtin.ValueError.prototype.tp$name = "ValueError";
goog.exportSymbol("Sk.builtin.ValueError", Sk.builtin.ValueError);

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.ZeroDivisionError = function(args) {
    if (!(this instanceof Sk.builtin.ZeroDivisionError)) {
        var o = Object.create(Sk.builtin.ZeroDivisionError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.ZeroDivisionError, Sk.builtin.Exception);
Sk.builtin.ZeroDivisionError.prototype.tp$name = "ZeroDivisionError";

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.TimeLimitError = function(args) {
    if (!(this instanceof Sk.builtin.TimeLimitError)) {
        var o = Object.create(Sk.builtin.TimeLimitError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.TimeLimitError, Sk.builtin.Exception);
Sk.builtin.TimeLimitError.prototype.tp$name = "TimeLimitError";
goog.exportSymbol("Sk.builtin.TimeLimitError", Sk.builtin.TimeLimitError);

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.IOError = function(args) {
    if (!(this instanceof Sk.builtin.IOError)) {
        var o = Object.create(Sk.builtin.IOError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.IOError, Sk.builtin.Exception);
Sk.builtin.IOError.prototype.tp$name = "IOError";
goog.exportSymbol("Sk.builtin.IOError", Sk.builtin.IOError);


/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.NotImplementedError = function(args) {
    if (!(this instanceof Sk.builtin.NotImplementedError)) {
        var o = Object.create(Sk.builtin.NotImplementedError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.NotImplementedError, Sk.builtin.Exception);
Sk.builtin.NotImplementedError.prototype.tp$name = "NotImplementedError";
goog.exportSymbol("Sk.builtin.NotImplementedError", Sk.builtin.NotImplementedError);

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.NegativePowerError = function(args) {
    if (!(this instanceof Sk.builtin.NegativePowerError)) {
        var o = Object.create(Sk.builtin.NegativePowerError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.NegativePowerError, Sk.builtin.Exception);
Sk.builtin.NegativePowerError.prototype.tp$name = "NegativePowerError";
goog.exportSymbol("Sk.builtin.NegativePowerError", Sk.builtin.NegativePowerError);

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.OperationError = function(args) {
    if (!(this instanceof Sk.builtin.OperationError)) {
        var o = Object.create(Sk.builtin.OperationError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments);
}
goog.inherits(Sk.builtin.OperationError, Sk.builtin.Exception);
Sk.builtin.OperationError.prototype.tp$name = "OperationError";
goog.exportSymbol("Sk.builtin.OperationError", Sk.builtin.OperationError);

/**
 * @constructor
 * @extends Sk.builtin.Exception
 * @param {...*} args
 */
Sk.builtin.SystemError = function(args) { 
    if (!(this instanceof Sk.builtin.SystemError)) {
        var o = Object.create(Sk.builtin.SystemError.prototype);
        o.constructor.apply(o, arguments);
        return o;
    }
    Sk.builtin.Exception.apply(this, arguments); 
}
goog.inherits(Sk.builtin.SystemError, Sk.builtin.Exception);
Sk.builtin.SystemError.prototype.tp$name = "SystemError";
goog.exportSymbol("Sk.builtin.SystemError", Sk.builtin.SystemError);

Sk.currLineNo = -1;
Sk.currColNo = -1;
Sk.currFilename = '';

goog.exportSymbol("Sk", Sk);
goog.exportProperty(Sk, "currLineNo", Sk.currLineNo);
goog.exportProperty(Sk, "currColNo", Sk.currColNo);
goog.exportProperty(Sk, "currFilename", Sk.currFilename);
/**
 *
 * @constructor
 *
 * @param {*} name name or object to get type of, if only one arg
 *
 * @param {Array.<Object>=} bases
 *
 * @param {Object=} dict
 *
 *
 * This type represents the type of `type'. *Calling* an instance of
 * this builtin type named "type" creates class objects. The resulting
 * class objects will have various tp$xyz attributes on them that allow
 * for the various operations on that object.
 *
 * calling the type or calling an instance of the type? or both?
 */

Sk.builtin.type = function(name, bases, dict)
{
    if (bases === undefined && dict === undefined)
    {
        // 1 arg version of type()
        // the argument is an object, not a name and returns a type object
        var obj = name;
        if (obj.constructor === Sk.builtin.nmber)
        {
	    if (obj.skType === Sk.builtin.nmber.int$)
            {
		return Sk.builtin.int_.prototype.ob$type;
            }
	    else
            {
                return Sk.builtin.float_.prototype.ob$type;
            }
	}
        return obj.ob$type;
    }
    else
    {
        // type building version of type

        // dict is the result of running the classes code object
        // (basically the dict of functions). those become the prototype
        // object of the class).

        /**
         * @constructor
         */
        var klass = (function(kwdict, varargseq, kws, args)
                {
                    if (!(this instanceof klass))
		    {
			return new klass(kwdict, varargseq, kws, args);
		    }

                    args = args || [];
                    this['$d'] = new Sk.builtin.dict([]);

                    var init = Sk.builtin.type.typeLookup(this.ob$type, "__init__");
                    if (init !== undefined)
                    {
                        // return should be None or throw a TypeError otherwise
                        args.unshift(this);
                        Sk.misceval.apply(init, kwdict, varargseq, kws, args);
                    }

                    return this;
                });
        //print("type(nbd):",name,JSON.stringify(dict, null,2));
        for (var v in dict)
        {
            klass.prototype[v] = dict[v];
            klass[v] = dict[v];
        }
        klass['__class__'] = klass;
        klass.sk$klass = true;
        klass.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;
        klass.prototype.tp$setattr = Sk.builtin.object.prototype.GenericSetAttr;
        klass.prototype.tp$descr_get = function() { goog.asserts.fail("in type tp$descr_get"); };
        klass.prototype['$r'] = function()
        {
            var reprf = this.tp$getattr("__repr__");
            if (reprf !== undefined)
                return Sk.misceval.apply(reprf, undefined, undefined, undefined, []);
            var mod = dict.__module__;
            var cname = "";
            if (mod) cname = mod.v + ".";
            return new Sk.builtin.str("<" + cname + name + " object>");
        };
        klass.prototype.tp$str = function()
        {
            var strf = this.tp$getattr("__str__");
            if (strf !== undefined)
                return Sk.misceval.apply(strf, undefined, undefined, undefined, []);
            return this['$r']();
        };
	klass.prototype.tp$length = function()
	{
            var lenf = this.tp$getattr("__len__");
            if (lenf !== undefined)
                return Sk.misceval.apply(lenf, undefined, undefined, undefined, []);
	    var tname = Sk.abstr.typeName(this);
	    throw new Sk.builtin.AttributeError(tname + " instance has no attribute '__len__'");
	};	    
        klass.prototype.tp$call = function(args, kw)
        {
            var callf = this.tp$getattr("__call__");
            /* todo; vararg kwdict */
            if (callf)
                return Sk.misceval.apply(callf, undefined, undefined, kw, args);
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(this) + "' object is not callable");
        };
        klass.prototype.tp$iter = function()
        {
            var iterf = this.tp$getattr("__iter__");
            var tname = Sk.abstr.typeName(this);
            if (iterf)
            {
                 var ret = Sk.misceval.callsim(iterf);
                 // This check does not work for builtin iterators 
                 // if (ret.tp$getattr("next") === undefined)
                 //    throw new Sk.builtin.TypeError("iter() return non-iterator of type '" + tname + "'");
                 return ret;
            }
            throw new Sk.builtin.TypeError("'" + tname + "' object is not iterable");
        };
        klass.prototype.tp$iternext = function()
        {
            var iternextf = this.tp$getattr("next");
            goog.asserts.assert(iternextf !== undefined, "iter() should have caught this");
            return Sk.misceval.callsim(iternextf);
        };
	klass.prototype.tp$getitem = function(key)
	{
	    var getf = this.tp$getattr("__getitem__");
	    if (getf !== undefined)
		return Sk.misceval.apply(getf, undefined, undefined, undefined, [key]);
	    throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(this) + "' object does not support indexing");
	}
	klass.prototype.tp$setitem = function(key, value)
	{
	    var setf = this.tp$getattr("__setitem__");
	    if (setf !== undefined)
		return Sk.misceval.apply(setf, undefined, undefined, undefined, [key,value]);
	    throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(this) + "' object does not support item assignment");
	}

        klass.prototype.tp$name = name;

        if (bases)
        {
            //print("building mro for", name);
            //for (var i = 0; i < bases.length; ++i)
                //print("base[" + i + "]=" + bases[i].tp$name);
            klass['$d'] = new Sk.builtin.dict([]);
            klass['$d'].mp$ass_subscript(Sk.builtin.type.basesStr_, new Sk.builtin.tuple(bases));
            var mro = Sk.builtin.type.buildMRO(klass);
            klass['$d'].mp$ass_subscript(Sk.builtin.type.mroStr_, mro);
            klass.tp$mro = mro;
            //print("mro result", Sk.builtin.repr(mro).v);
        }

        klass.prototype.ob$type = klass;
        Sk.builtin.type.makeIntoTypeObj(name, klass);
	
	// fix for class attributes
	klass.tp$setattr = Sk.builtin.type.prototype.tp$setattr;

        return klass;
    }

};

/**
 *
 */
Sk.builtin.type.makeTypeObj = function(name, newedInstanceOfType)
{
    var t = newedInstanceOfType;
    Sk.builtin.type.makeIntoTypeObj(name, t);
    return newedInstanceOfType;
};

Sk.builtin.type.makeIntoTypeObj = function(name, t)
{
    goog.asserts.assert(name !== undefined);
    goog.asserts.assert(t !== undefined);
    t.ob$type = Sk.builtin.type;
    t.tp$name = name;
    t['$r'] = function()
    {
        var mod = t.__module__;
        var cname = "";
        if (mod) cname = mod.v + ".";
	var ctype = "class";
	if (!mod && !t.sk$klass)
	    ctype = "type";
        return new Sk.builtin.str("<" + ctype + " '" + cname + t.tp$name + "'>");
    };
    t.tp$str = undefined;
    t.tp$getattr = Sk.builtin.type.prototype.tp$getattr;
    t.tp$setattr = Sk.builtin.object.prototype.GenericSetAttr;
    t.tp$richcompare = Sk.builtin.type.prototype.tp$richcompare;
    t.sk$type = true;
    return t;
};

Sk.builtin.type.ob$type = Sk.builtin.type;
Sk.builtin.type.tp$name = "type";
Sk.builtin.type['$r'] = function() { return new Sk.builtin.str("<type 'type'>"); };

//Sk.builtin.type.prototype.tp$descr_get = function() { print("in type descr_get"); };

//Sk.builtin.type.prototype.tp$name = "type";

// basically the same as GenericGetAttr except looks in the proto instead
Sk.builtin.type.prototype.tp$getattr = function(name)
{
    var tp = this;
    var descr = Sk.builtin.type.typeLookup(tp, name);
    var f;
    //print("type.tpgetattr descr", descr, descr.tp$name, descr.func_code, name);
    if (descr !== undefined && descr !== null && descr.ob$type !== undefined)
    {
        f = descr.ob$type.tp$descr_get;
        // todo;if (f && descr.tp$descr_set) // is a data descriptor if it has a set
            // return f.call(descr, this, this.ob$type);
    }

    if (this['$d'])
    {
        var res = this['$d'].mp$lookup(new Sk.builtin.str(name));
        if (res !== undefined)
        {
            return res;
        }
    }

    if (f)
    {
        // non-data descriptor
        return f.call(descr, null, tp);
    }

    if (descr !== undefined)
    {
        return descr;
    }

    return undefined;
};

Sk.builtin.type.prototype.tp$setattr = function(name, value)
{
    // class attributes are direct properties of the object
    this[name] = value;
}

Sk.builtin.type.typeLookup = function(type, name)
{
    var mro = type.tp$mro;
    var pyname = new Sk.builtin.str(name);
    var base;
    var res;
    var i;

    // todo; probably should fix this, used for builtin types to get stuff
    // from prototype
    if (!mro)
        return type.prototype[name];

    for (i = 0; i < mro.v.length; ++i)
    {
        base = mro.v[i];
        if (base.hasOwnProperty(name))
            return base[name];
        res = base['$d'].mp$lookup(pyname);
        if (res !== undefined)
        {
            return res;
        }
    }

    return undefined;
};

Sk.builtin.type.mroMerge_ = function(seqs)
{
    /*
    var tmp = [];
    for (var i = 0; i < seqs.length; ++i)
    {
        tmp.push(new Sk.builtin.list(seqs[i]));
    }
    print(Sk.builtin.repr(new Sk.builtin.list(tmp)).v);
    */
    var res = [];
    for (;;)
    {
        for (var i = 0; i < seqs.length; ++i)
        {
            var seq = seqs[i];
            if (seq.length !== 0)
                break;
        }
        if (i === seqs.length) // all empty
            return res;
        var cands = [];
        for (var i = 0; i < seqs.length; ++i)
        {
            var seq = seqs[i];
            //print("XXX", Sk.builtin.repr(new Sk.builtin.list(seq)).v);
            if (seq.length !== 0)
            {
                var cand = seq[0];
                //print("CAND", Sk.builtin.repr(cand).v);
                OUTER:
                for (var j = 0; j < seqs.length; ++j)
                {
                    var sseq = seqs[j];
                    for (var k = 1; k < sseq.length; ++k)
                        if (sseq[k] === cand)
                            break OUTER;
                }

                // cand is not in any sequences' tail -> constraint-free
                if (j === seqs.length)
                    cands.push(cand);
            }
        }

        if (cands.length === 0)
            throw new Sk.builtin.TypeError("Inconsistent precedences in type hierarchy");

        var next = cands[0];
        // append next to result and remove from sequences
        res.push(next);
        for (var i = 0; i < seqs.length; ++i)
        {
            var seq = seqs[i];
            if (seq.length > 0 && seq[0] === next)
                seq.splice(0, 1);
        }
    }
};

Sk.builtin.type.buildMRO_ = function(klass)
{
    // MERGE(klass + mro(bases) + bases)
    var all = [ [klass] ];

    // Sk.debugout("buildMRO for", klass.tp$name);

    var kbases = klass['$d'].mp$subscript(Sk.builtin.type.basesStr_);
    for (var i = 0; i < kbases.v.length; ++i)
        all.push(Sk.builtin.type.buildMRO_(kbases.v[i]));

    var bases = [];
    for (var i = 0; i < kbases.v.length; ++i)
        bases.push(kbases.v[i]);
    all.push(bases);

    return Sk.builtin.type.mroMerge_(all);
};

/*
 * C3 MRO (aka CPL) linearization. Figures out which order to search through
 * base classes to determine what should override what. C3 does the "right
 * thing", and it's what Python has used since 2.3.
 *
 * Kind of complicated to explain, but not really that complicated in
 * implementation. Explanations:
 * 
 * http://people.csail.mit.edu/jrb/goo/manual.43/goomanual_55.html
 * http://www.python.org/download/releases/2.3/mro/
 * http://192.220.96.201/dylan/linearization-oopsla96.html
 *
 * This implementation is based on a post by Samuele Pedroni on python-dev
 * (http://mail.python.org/pipermail/python-dev/2002-October/029176.html) when
 * discussing its addition to Python.
 */ 
Sk.builtin.type.buildMRO = function(klass)
{
    return new Sk.builtin.tuple(Sk.builtin.type.buildMRO_(klass));
};

Sk.builtin.type.prototype.tp$richcompare = function(other, op)
{
	if (other.ob$type != Sk.builtin.type)
		return undefined;

	if (!this['$r'] || !other['$r'])
		return undefined;

	var r1 = this['$r']();
	var r2 = other['$r']();

	return r1.tp$richcompare(r2, op);
};
/**
 * @constructor
 */
Sk.builtin.object = function()
{
    if (!(this instanceof Sk.builtin.object)) return new Sk.builtin.object();
    this['$d'] = new Sk.builtin.dict([]);
    return this;
};

Sk.builtin.object.prototype.GenericGetAttr = function(name)
{
    goog.asserts.assert(typeof name === "string");

    var tp = this.ob$type;
    goog.asserts.assert(tp !== undefined, "object has no ob$type!");

    //print("getattr", tp.tp$name, name);

    var descr = Sk.builtin.type.typeLookup(tp, name);

    // otherwise, look in the type for a descr
    var f;
    //print("descr", descr);
    if (descr !== undefined && descr !== null && descr.ob$type !== undefined)
    {
        f = descr.ob$type.tp$descr_get;
        // todo;
        //if (f && descr.tp$descr_set) // is a data descriptor if it has a set
            //return f.call(descr, this, this.ob$type);
    }

    // todo; assert? force?
    if (this['$d'])
    {
        var res;
        if  (this['$d'].mp$lookup) {
            res = this['$d'].mp$lookup(new Sk.builtin.str(name));
        }
        else if (this['$d'].mp$subscript) {
            try {
                res = this['$d'].mp$subscript(new Sk.builtin.str(name));
            } catch (x) {
                res = undefined;
            }
        }
        else if (typeof this['$d'] === "object") // todo; definitely the wrong place for this. other custom tp$getattr won't work on object -- bnm -- implemented custom __getattr__ in abstract.js
            res = this['$d'][name];
        if (res !== undefined)
            return res;
    }

    if (f)
    {
        // non-data descriptor
        return f.call(descr, this, this.ob$type);
    }

    if (descr !== undefined)
    {
        return descr;
    }

    return undefined;
};
goog.exportSymbol("Sk.builtin.object.prototype.GenericGetAttr", Sk.builtin.object.prototype.GenericGetAttr);

Sk.builtin.object.prototype.GenericSetAttr = function(name, value)
{
    goog.asserts.assert(typeof name === "string");
    // todo; lots o' stuff
    if (this['$d'].mp$ass_subscript)
        this['$d'].mp$ass_subscript(new Sk.builtin.str(name), value);
    else if (typeof this['$d'] === "object")
        this['$d'][name] = value;
};
goog.exportSymbol("Sk.builtin.object.prototype.GenericSetAttr", Sk.builtin.object.prototype.GenericSetAttr);

Sk.builtin.object.prototype.HashNotImplemented = function()
{
    throw new Sk.builtin.TypeError("unhashable type: '" + Sk.abstr.typeName(this) + "'");
};

Sk.builtin.object.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;
Sk.builtin.object.prototype.tp$setattr = Sk.builtin.object.prototype.GenericSetAttr;
Sk.builtin.object.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('object', Sk.builtin.object);

/**
 * @constructor
 */
Sk.builtin.none = function() {};
Sk.builtin.none.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('NoneType', Sk.builtin.none);
Sk.builtin.none.prototype.tp$name = "NoneType";
Sk.builtin.none.none$ = Object.create(Sk.builtin.none.prototype, {v: {value: null, enumerable: true}});

goog.exportSymbol("Sk.builtin.none", Sk.builtin.none);
Sk.builtin.bool = function(x)
{
    Sk.builtin.pyCheckArgs("bool", arguments, 1);
    if (Sk.misceval.isTrue(x))
    {
	return Sk.builtin.bool.true$;
    }
    else
    {
	return Sk.builtin.bool.false$;
    }
};

Sk.builtin.bool.prototype.tp$name = "bool";
Sk.builtin.bool.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('bool', Sk.builtin.bool);

Sk.builtin.bool.prototype['$r'] = function()
{
    if (this.v)
	return new Sk.builtin.str('True');
    return new Sk.builtin.str('False');
}

Sk.builtin.bool.true$ = Object.create(Sk.builtin.bool.prototype, {v: {value: true, enumerable: true}});
Sk.builtin.bool.false$ = Object.create(Sk.builtin.bool.prototype, {v: {value: false, enumerable: true}});

goog.exportSymbol("Sk.builtin.bool", Sk.builtin.bool);/**
 * Check arguments to Python functions to ensure the correct number of
 * arguments are passed.
 * 
 * @param {string} name the name of the function
 * @param {Object} args the args passed to the function
 * @param {number} minargs the minimum number of allowable arguments
 * @param {number=} maxargs optional maximum number of allowable
 * arguments (default: Infinity)
 * @param {boolean=} kwargs optional true if kwargs, false otherwise
 * (default: false)
 * @param {boolean=} free optional true if free vars, false otherwise
 * (default: false)
 */
Sk.builtin.pyCheckArgs = function (name, args, minargs, maxargs, kwargs, free) {
    var nargs = args.length;
    var msg = "";

    if (maxargs === undefined) { maxargs = Infinity; }
    if (kwargs) { nargs -= 1; }
    if (free) { nargs -= 1; }
    if ((nargs < minargs) || (nargs > maxargs)) {
        if (minargs === maxargs) {
            msg = name + "() takes exactly " + minargs + " arguments";
        } else if (nargs < minargs) {
            msg = name + "() takes at least " + minargs + " arguments";
        } else {
            msg = name + "() takes at most " + maxargs + " arguments";
        }
        msg += " (" + nargs + " given)";
        throw new Sk.builtin.TypeError(msg);
    };
};
goog.exportSymbol("Sk.builtin.pyCheckArgs", Sk.builtin.pyCheckArgs);

/**
 * Check type of argument to Python functions.
 * 
 * @param {string} name the name of the argument
 * @param {string} exptype string of the expected type name
 * @param {boolean} check truthy if type check passes, falsy otherwise
 */

Sk.builtin.pyCheckType = function (name, exptype, check) {
    if (!check) {
        throw new Sk.builtin.TypeError(name + " must be a " + exptype);
    };
};
goog.exportSymbol("Sk.builtin.pyCheckType", Sk.builtin.pyCheckType);

Sk.builtin.checkSequence = function (arg) {
    return (arg !== null && arg.mp$subscript !== undefined);
};
goog.exportSymbol("Sk.builtin.checkSequence", Sk.builtin.checkSequence);

Sk.builtin.checkIterable = function (arg) {
    return (arg !== null && arg.tp$iter !== undefined);
};
goog.exportSymbol("Sk.builtin.checkIterable", Sk.builtin.checkIterable);

Sk.builtin.checkNumber = function (arg) {
    return (arg !== null && (typeof arg === "number"
			     || arg instanceof Sk.builtin.nmber
			     || arg instanceof Sk.builtin.lng
                             || arg instanceof Sk.builtin.bool));
};
goog.exportSymbol("Sk.builtin.checkNumber", Sk.builtin.checkNumber);

Sk.builtin.checkInt = function (arg) {
    return (arg !== null) && ((typeof arg === "number" && arg === (arg|0))
			      || (arg instanceof Sk.builtin.nmber
				  && arg.skType === Sk.builtin.nmber.int$)
			      || arg instanceof Sk.builtin.lng
                              || arg instanceof Sk.builtin.bool);
};
goog.exportSymbol("Sk.builtin.checkInt", Sk.builtin.checkInt);

Sk.builtin.checkString = function (arg) {
    return (arg !== null && arg.__class__ == Sk.builtin.str);
};
goog.exportSymbol("Sk.builtin.checkString", Sk.builtin.checkString);

Sk.builtin.checkClass = function (arg) {
    return (arg !== null && arg.sk$type);
};
goog.exportSymbol("Sk.builtin.checkClass", Sk.builtin.checkClass);

Sk.builtin.checkBool = function (arg) {
    return (arg instanceof Sk.builtin.bool);
};
goog.exportSymbol("Sk.builtin.checkBool", Sk.builtin.checkBool);

Sk.builtin.checkNone = function (arg) {
    return (arg instanceof Sk.builtin.none);
};
goog.exportSymbol("Sk.builtin.checkNone", Sk.builtin.checkNone);

Sk.builtin.checkFunction = function (arg) {
    return (arg !== null && arg.tp$call !== undefined);  
};
goog.exportSymbol("Sk.builtin.checkFunction", Sk.builtin.checkFunction);

/**
 * @constructor
 *
 * @param {Function} code the javascript implementation of this function
 * @param {Object=} globals the globals where this function was defined.
 * Can be undefined (which will be stored as null) for builtins. (is
 * that ok?)
 * @param {Object=} closure dict of free variables
 * @param {Object=} closure2 another dict of free variables that will be
 * merged into 'closure'. there's 2 to simplify generated code (one is $free,
 * the other is $cell)
 *
 * closure is the cell variables from the parent scope that we need to close
 * over. closure2 is the free variables in the parent scope that we also might
 * need to access.
 *
 * NOTE: co_varnames and co_name are defined by compiled code only, so we have
 * to access them via dict-style lookup for closure.
 *
 */
Sk.builtin.func = function(code, globals, closure, closure2)
{
    this.func_code = code;
    this.func_globals = globals || null;
    if (closure2 !== undefined)
    {
        // todo; confirm that modification here can't cause problems
        for (var k in closure2)
            closure[k] = closure2[k];
    }
    this.func_closure = closure;
    return this;
};
goog.exportSymbol("Sk.builtin.func", Sk.builtin.func);


Sk.builtin.func.prototype.tp$name = "function";
Sk.builtin.func.prototype.tp$descr_get = function(obj, objtype)
{
    goog.asserts.assert(obj !== undefined && objtype !== undefined)
    if (obj == null) return this;
    return new Sk.builtin.method(this, obj);
};
Sk.builtin.func.prototype.tp$call = function(args, kw)
{
    var name;

    // note: functions expect 'this' to be globals to avoid having to
    // slice/unshift onto the main args
    if (this.func_closure)
    {
        // todo; OK to modify?
        args.push(this.func_closure);
    }

    var expectskw = this.func_code['co_kwargs'];
    var kwargsarr = [];

    if (this.func_code['no_kw'] && kw) {
        name = (this.func_code && this.func_code['co_name'] && this.func_code['co_name'].v) || '<native JS>';
        throw new Sk.builtin.TypeError(name + "() takes no keyword arguments");
    }

    if (kw)
    {
        // bind the kw args
        var kwlen = kw.length;
        var varnames = this.func_code['co_varnames'];
        var numvarnames = varnames && varnames.length;
        for (var i = 0; i < kwlen; i += 2)
        {
            // todo; make this a dict mapping name to offset
            for (var j = 0; j < numvarnames; ++j)
            {
                if (kw[i] === varnames[j])
                    break;
            }
            if (varnames && j !== numvarnames)
            {
                args[j] = kw[i+1];
            }
            else if (expectskw)
            {
                // build kwargs dict
                kwargsarr.push(new Sk.builtin.str(kw[i]));
                kwargsarr.push(kw[i + 1]);
            }
            else
            {
                name = (this.func_code && this.func_code['co_name'] && this.func_code['co_name'].v) || '<native JS>';
                throw new Sk.builtin.TypeError(name + "() got an unexpected keyword argument '" + kw[i] + "'");
            }
        }
    }
    if (expectskw)
    {
        args.unshift(kwargsarr);
    }

    //print(JSON.stringify(args, null, 2));

    return this.func_code.apply(this.func_globals, args);
};

Sk.builtin.func.prototype.tp$getattr = function(key) {
    return this[key];
}
Sk.builtin.func.prototype.tp$setattr = function(key,value) {
    this[key] = value;
}

//todo; investigate why the other doesn't work
//Sk.builtin.type.makeIntoTypeObj('function', Sk.builtin.func);
Sk.builtin.func.prototype.ob$type = Sk.builtin.type.makeTypeObj('function', new Sk.builtin.func(null, null));

Sk.builtin.func.prototype['$r'] = function()
{
    var name = (this.func_code && this.func_code['co_name'] && this.func_code['co_name'].v) || '<native JS>';
    return new Sk.builtin.str("<function " + name + ">");
};
/*
 * Object to facilitate building native Javascript functions that
 * behave similarly to Python functions.
 *
 * Use:
 * foo = Sk.nativejs.func(function foo(...) {...});
 */
Sk.nativejs = {
    FN_ARGS: /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
    FN_ARG_SPLIT: /,/,
    FN_ARG: /^\s*(_?)(\S+?)\1\s*$/,
    STRIP_COMMENTS: /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
    formalParameterList: function (fn) {
        var fnText,argDecl;
        var args=[];
        fnText = fn.toString().replace(this.STRIP_COMMENTS, '');
        argDecl = fnText.match(this.FN_ARGS); 
        
        var r = argDecl[1].split(this.FN_ARG_SPLIT);
        for(var a in r){
            var arg = r[a];
            arg.replace(this.FN_ARG, function(all, underscore, name) {
                args.push(name);
            });
        }
        return args;
    },
    func: function (code) {
        code['co_name'] = new Sk.builtin.str(code.name);
        code['co_varnames'] = Sk.nativejs.formalParameterList(code);
        return new Sk.builtin.func(code);
    },
    func_nokw: function (code) {
        code['co_name'] = new Sk.builtin.str(code.name);
        code['co_varnames'] = Sk.nativejs.formalParameterList(code);
        code['no_kw'] = true;
        return new Sk.builtin.func(code);
    }
};
goog.exportSymbol("Sk.nativejs.func", Sk.nativejs.func);
goog.exportSymbol("Sk.nativejs.func_nokw", Sk.nativejs.func_nokw);
/**
 * @constructor
 *
 * co_varnames and co_name come from generated code, must access as dict.
 */
Sk.builtin.method = function(func, self)
{
    this.im_func = func;
    this.im_self = self;
    //print("constructing method", this.im_func.tp$name, this.im_self.tp$name);
};
goog.exportSymbol("Sk.builtin.method", Sk.builtin.method);

Sk.builtin.method.prototype.tp$call = function(args, kw)
{
    goog.asserts.assert(this.im_self, "should just be a function, not a method since there's no self?");
    goog.asserts.assert(this.im_func instanceof Sk.builtin.func);

    //print("calling method");
    // todo; modification OK?
    args.unshift(this.im_self);

    if (kw)
    {
        // bind the kw args
        var kwlen = kw.length;
        for (var i = 0; i < kwlen; i += 2)
        {
            // todo; make this a dict mapping name to offset
            var varnames = this.im_func.func_code['co_varnames'];
            var numvarnames = varnames &&  varnames.length;
            for (var j = 0; j < numvarnames; ++j)
            {
                if (kw[i] === varnames[j])
                    break;
            }
            args[j] = kw[i+1];
        }
    }

    // note: functions expect globals to be their 'this'. see compile.js and function.js also
    return this.im_func.func_code.apply(this.im_func.func_globals, args);
};

Sk.builtin.method.prototype['$r'] = function()
{
    var name = (this.im_func.func_code && this.im_func.func_code['co_name'] && this.im_func.func_code['co_name'].v) || '<native JS>';
    return new Sk.builtin.str("<bound method " + this.im_self.ob$type.tp$name + "." + name
            + " of " + this.im_self['$r']().v + ">");
};
Sk.misceval = {};

Sk.misceval.isIndex = function(o)
{
    if (o === null || o.constructor === Sk.builtin.lng || o.tp$index
	|| o === true || o === false) {
        return true;
    }

    return Sk.builtin.checkInt(o);
};
goog.exportSymbol("Sk.misceval.isIndex", Sk.misceval.isIndex);

Sk.misceval.asIndex = function(o)
{
    if (!Sk.misceval.isIndex(o)) return undefined;
    if (o === null) return undefined;
    if (o === true) return 1;
    if (o === false) return 0;
    if (typeof o === "number") return o;
	if (o.constructor === Sk.builtin.nmber) return o.v;
	if (o.constructor === Sk.builtin.lng) return o.tp$index();
    goog.asserts.fail("todo asIndex;");
};

/**
 * return u[v:w]
 */
Sk.misceval.applySlice = function(u, v, w)
{
    if (u.sq$slice && Sk.misceval.isIndex(v) && Sk.misceval.isIndex(w))
    {
        var ilow = Sk.misceval.asIndex(v);
        if (ilow === undefined) ilow = 0;
        var ihigh = Sk.misceval.asIndex(w);
        if (ihigh === undefined) ihigh = 1e100;
        return Sk.abstr.sequenceGetSlice(u, ilow, ihigh);
    }
    return Sk.abstr.objectGetItem(u, new Sk.builtin.slice(v, w, null));
};
goog.exportSymbol("Sk.misceval.applySlice", Sk.misceval.applySlice);

/**
 * u[v:w] = x
 */
Sk.misceval.assignSlice = function(u, v, w, x)
{
    if (u.sq$ass_slice && Sk.misceval.isIndex(v) && Sk.misceval.isIndex(w))
    {
        var ilow = Sk.misceval.asIndex(v) || 0;
        var ihigh = Sk.misceval.asIndex(w) || 1e100;
        if (x === null)
            Sk.abstr.sequenceDelSlice(u, ilow, ihigh);
        else
            Sk.abstr.sequenceSetSlice(u, ilow, ihigh, x);
    }
    else
    {
        var slice = new Sk.builtin.slice(v, w);
        if (x === null)
            return Sk.abstr.objectDelItem(u, slice);
        else
            return Sk.abstr.objectSetItem(u, slice, x);
    }
};
goog.exportSymbol("Sk.misceval.assignSlice", Sk.misceval.assignSlice);

/**
 * Used by min() and max() to get an array from arbitrary input.
 * Note that this does no validation, just coercion.
 */
Sk.misceval.arrayFromArguments = function(args)
{
    // If args is not a single thing return as is
    if ( args.length != 1 )
    {
        return args;
    }
    var arg = args[0];
    if ( arg instanceof Sk.builtin.set )
    {
        // this is a Sk.builtin.set
        arg = arg.tp$iter().$obj;
    }
    else if ( arg instanceof Sk.builtin.dict )
    {
        // this is a Sk.builtin.list
        arg = Sk.builtin.dict.prototype['keys'].func_code(arg);
    }
    else if ( arg instanceof Sk.builtin.str )
    {
        // this is a Sk.builtin.str
        var res = [];
        for (var it = arg.tp$iter(), i = it.tp$iternext();
             i !== undefined; i = it.tp$iternext())
        {
            res.push(i);
        }
        return res;
    }

    // shouldn't else if here as the above may output lists to arg.
    if ( arg instanceof Sk.builtin.list || arg instanceof Sk.builtin.tuple )
    {
        return arg.v;
    }
    return args;
};
goog.exportSymbol("Sk.misceval.arrayFromArguments", Sk.misceval.arrayFromArguments);

/**
 * for reversed comparison: Gt -> Lt, etc.
 */
Sk.misceval.swappedOp_ = {
    'Eq': 'Eq',
    'NotEq': 'NotEq',
    'Lt': 'GtE',
    'LtE': 'Gt',
    'Gt': 'LtE',
    'GtE': 'Lt',
    'Is': 'IsNot',
    'IsNot': 'Is',
    'In_': 'NotIn',
    'NotIn': 'In_'
};


Sk.misceval.richCompareBool = function(v, w, op)
{
    // v and w must be Python objects. will return Javascript true or false for internal use only
    // if you want to return a value from richCompareBool to Python you must wrap as Sk.builtin.bool first

    goog.asserts.assert((v !== null) && (v !== undefined), "passed null or undefined parameter to Sk.misceval.richCompareBool");
    goog.asserts.assert((w !== null) && (w !== undefined), "passed null or undefined parameter to Sk.misceval.richCompareBool");

    var v_type = new Sk.builtin.type(v);
    var w_type = new Sk.builtin.type(w);

    // Python has specific rules when comparing two different builtin types
    // currently, this code will execute even if the objects are not builtin types
    // but will fall through and not return anything in this section
    if ((v_type !== w_type)
        && (op === 'GtE' || op === 'Gt' || op === 'LtE' || op === 'Lt'))
    {
        // note: sets are omitted here because they can only be compared to other sets
        var numeric_types = [Sk.builtin.float_.prototype.ob$type,
                             Sk.builtin.int_.prototype.ob$type,
                             Sk.builtin.lng.prototype.ob$type,
                             Sk.builtin.bool.prototype.ob$type];
        var sequence_types = [Sk.builtin.dict.prototype.ob$type,
                              Sk.builtin.enumerate.prototype.ob$type,
                              Sk.builtin.list.prototype.ob$type,
                              Sk.builtin.str.prototype.ob$type,
                              Sk.builtin.tuple.prototype.ob$type];

        var v_num_type = numeric_types.indexOf(v_type);
        var v_seq_type = sequence_types.indexOf(v_type);
        var w_num_type = numeric_types.indexOf(w_type);
        var w_seq_type = sequence_types.indexOf(w_type);

        // NoneTypes are considered less than any other type in Python
        // note: this only handles comparing NoneType with any non-NoneType.
        // Comparing NoneType with NoneType is handled further down.
        if (v_type === Sk.builtin.none.prototype.ob$type)
        {
            switch (op)
            {
                case 'Lt':  return true;
                case 'LtE': return true;
                case 'Gt':  return false;
                case 'GtE': return false;
            }
        }

        if (w_type === Sk.builtin.none.prototype.ob$type)
        {
            switch (op)
            {
                case 'Lt':  return false;
                case 'LtE': return false;
                case 'Gt':  return true;
                case 'GtE': return true;
            }
        }

        // numeric types are always considered smaller than sequence types in Python
        if (v_num_type !== -1 && w_seq_type !== -1)
        {
            switch (op)
            {
                case 'Lt':  return true;
                case 'LtE': return true;
                case 'Gt':  return false;
                case 'GtE': return false;
            }
        }

        if (v_seq_type !== -1 && w_num_type !== -1)
        {
            switch (op)
            {
                case 'Lt':  return false;
                case 'LtE': return false;
                case 'Gt':  return true;
                case 'GtE': return true;
            }
        }

        // in Python, different sequence types are ordered alphabetically
        // by name so that dict < list < str < tuple
        if (v_seq_type !== -1 && w_seq_type !== -1)
        {
            switch (op)
            {
                case 'Lt':  return v_seq_type < w_seq_type;
                case 'LtE': return v_seq_type <= w_seq_type;
                case 'Gt':  return v_seq_type > w_seq_type;
                case 'GtE': return v_seq_type >= w_seq_type;
            }
        }
    }


    // handle identity and membership comparisons
    if (op === 'Is') {
	if (v instanceof Sk.builtin.nmber && w instanceof Sk.builtin.nmber)
	{
	    return (v.numberCompare(w) === 0) && (v.skType === w.skType);
	}
	else if (v instanceof Sk.builtin.lng && w instanceof Sk.builtin.lng)
	{
	    return v.longCompare(w) === 0;
	}

        return v === w;
    }

    if (op === 'IsNot') {
	if (v instanceof Sk.builtin.nmber && w instanceof Sk.builtin.nmber)
	{
	    return (v.numberCompare(w) !== 0) || (v.skType !== w.skType);
	}
	else if (v instanceof Sk.builtin.lng && w instanceof Sk.builtin.lng)
	{
	    return v.longCompare(w) !== 0;
	}

        return v !== w;
    }

    if (op === "In")
        return Sk.abstr.sequenceContains(w, v);
    if (op === "NotIn")
        return !Sk.abstr.sequenceContains(w, v);


    // use comparison methods if they are given for either object
    var res;
    if (v.tp$richcompare && (res = v.tp$richcompare(w, op)) !== undefined)
    {
        return res;
    }

    if (w.tp$richcompare && (res = w.tp$richcompare(v, Sk.misceval.swappedOp_[op])) !== undefined)
    {
        return res;
    }


    // depending on the op, try left:op:right, and if not, then
    // right:reversed-top:left

    var op2method = {
        'Eq': '__eq__',
        'NotEq': '__ne__',
        'Gt': '__gt__',
        'GtE': '__ge__',
        'Lt': '__lt__',
        'LtE': '__le__'
    };

    var method = op2method[op];
    var swapped_method = op2method[Sk.misceval.swappedOp_[op]];

    if (v[method])
    {
        return Sk.misceval.isTrue(Sk.misceval.callsim(v[method], v, w));
    }
    else if (w[swapped_method])
    {
        return Sk.misceval.isTrue(Sk.misceval.callsim(w[swapped_method], w, v));
    }

    if (v['__cmp__'])
    {
        var ret = Sk.misceval.callsim(v['__cmp__'], v, w);
	ret = Sk.builtin.asnum$(ret);
        if (op === 'Eq') return ret === 0;
        else if (op === 'NotEq') return ret !== 0;
        else if (op === 'Lt') return ret < 0;
        else if (op === 'Gt') return ret > 0;
        else if (op === 'LtE') return ret <= 0;
        else if (op === 'GtE') return ret >= 0;
    }

    if (w['__cmp__'])
    {
        // note, flipped on return value and call
        var ret = Sk.misceval.callsim(w['__cmp__'], w, v);
	ret = Sk.builtin.asnum$(ret);
        if (op === 'Eq') return ret === 0;
        else if (op === 'NotEq') return ret !== 0;
        else if (op === 'Lt') return ret > 0;
        else if (op === 'Gt') return ret < 0;
        else if (op === 'LtE') return ret >= 0;
        else if (op === 'GtE') return ret <= 0;
    }

    // handle special cases for comparing None with None or Bool with Bool
    if (((v instanceof Sk.builtin.none) && (w instanceof Sk.builtin.none))
	|| ((v instanceof Sk.builtin.bool) && (w instanceof Sk.builtin.bool)))
    {
	// Javascript happens to return the same values when comparing null
        // with null or true/false with true/false as Python does when
        // comparing None with None or True/False with True/False

	if (op === 'Eq')
	    return v.v === w.v;
	if (op === 'NotEq')
	    return v.v !== w.v;
	if (op === 'Gt')
	    return v.v > w.v;
	if (op === 'GtE')
	    return v.v >= w.v;
	if (op === 'Lt')
	    return v.v < w.v;
	if (op === 'LtE')
	    return v.v <= w.v;
    }


    // handle equality comparisons for any remaining objects
    if (op === 'Eq')
    {
        if ((v instanceof Sk.builtin.str) && (w instanceof Sk.builtin.str))
            return v.v === w.v;
        return v === w;
    }
    if (op === 'NotEq')
    {
        if ((v instanceof Sk.builtin.str) && (w instanceof Sk.builtin.str))
            return v.v !== w.v;
        return v !== w;
    }

    var vname = Sk.abstr.typeName(v);
    var wname = Sk.abstr.typeName(w);
    throw new Sk.builtin.ValueError("don't know how to compare '" + vname + "' and '" + wname + "'");
};
goog.exportSymbol("Sk.misceval.richCompareBool", Sk.misceval.richCompareBool);

Sk.misceval.objectRepr = function(v)
{
    goog.asserts.assert(v !== undefined, "trying to repr undefined");
    if ((v === null) || (v instanceof Sk.builtin.none))
        return new Sk.builtin.str("None"); // todo; these should be consts
    else if (v === true)
        return new Sk.builtin.str("True");
    else if (v === false)
        return new Sk.builtin.str("False");
    else if (typeof v === "number")
        return new Sk.builtin.str("" + v);
    else if (!v['$r']) {
        if (v.tp$name) {
            return new Sk.builtin.str("<" + v.tp$name + " object>");
        } else {
            return new Sk.builtin.str("<unknown>");
        };
    }
    else if (v.constructor === Sk.builtin.nmber)
    {
        if (v.v === Infinity)
            return new Sk.builtin.str('inf');
        else if (v.v === -Infinity)
            return new Sk.builtin.str('-inf');
        else
            return v['$r']();
    }
    else
        return v['$r']();
};
goog.exportSymbol("Sk.misceval.objectRepr", Sk.misceval.objectRepr);

Sk.misceval.opAllowsEquality = function(op)
{
    switch (op)
    {
        case 'LtE':
        case 'Eq':
        case 'GtE':
            return true;
    }
    return false;
};
goog.exportSymbol("Sk.misceval.opAllowsEquality", Sk.misceval.opAllowsEquality);

Sk.misceval.isTrue = function(x)
{
    if (x === true) return true;
    if (x === false) return false;
    if (x === null) return false;
    if (x.constructor === Sk.builtin.none) return false;
    if (x.constructor === Sk.builtin.bool) return x.v;
    if (typeof x === "number") return x !== 0;
    if (x instanceof Sk.builtin.lng) return x.nb$nonzero();
    if (x.constructor === Sk.builtin.nmber) return x.v !== 0;
    if (x.mp$length) return x.mp$length() !== 0;
    if (x.sq$length) return x.sq$length() !== 0;
    if (x['__nonzero__']) {
        var ret = Sk.misceval.callsim(x['__nonzero__'], x);
        if (!Sk.builtin.checkInt(ret)) {
            throw new Sk.builtin.TypeError ("__nonzero__ should return an int");
        }
        return Sk.builtin.asnum$(ret) !== 0;
    }
    if (x['__len__']) {
        var ret = Sk.misceval.callsim(x['__len__'], x);
        if (!Sk.builtin.checkInt(ret)) {
            throw new Sk.builtin.TypeError ("__len__ should return an int");
        }
        return Sk.builtin.asnum$(ret) !== 0;
    }
    return true;
};
goog.exportSymbol("Sk.misceval.isTrue", Sk.misceval.isTrue);

Sk.misceval.softspace_ = false;
Sk.misceval.print_ = function(x)   // this was function print(x)   not sure why...
{
    if (Sk.misceval.softspace_)
    {
        if (x !== "\n") Sk.output(' ');
        Sk.misceval.softspace_ = false;
    }
    var s = new Sk.builtin.str(x);
    Sk.output(s.v);
    var isspace = function(c)
    {
        return c === '\n' || c === '\t' || c === '\r';
    };
    if (s.v.length === 0 || !isspace(s.v[s.v.length - 1]) || s.v[s.v.length - 1] === ' ')
        Sk.misceval.softspace_ = true;
};
goog.exportSymbol("Sk.misceval.print_", Sk.misceval.print_);

/**
 * @param {string} name
 * @param {Object=} other generally globals
 */
Sk.misceval.loadname = function(name, other)
{
    var v = other[name];
    if (v !== undefined) return v;

    var bi = Sk.builtins[name];
    if (bi !== undefined) return bi;

    name = name.replace('_$rw$', '');
    name = name.replace('_$rn$', '');
    throw new Sk.builtin.NameError("name '" + name + "' is not defined");
};
goog.exportSymbol("Sk.misceval.loadname", Sk.misceval.loadname);

/**
 *
 * Notes on necessity for 'call()':
 *
 * Classes are callable in python to create an instance of the class. If
 * we're calling "C()" we cannot tell at the call site whether we're
 * calling a standard function, or instantiating a class.
 *
 * JS does not support user-level callables. So, we can't use the normal
 * prototype hierarchy to make the class inherit from a 'class' type
 * where the various tp$getattr, etc. methods would live.
 *
 * Instead, we must copy all the methods from the prototype of our class
 * type onto every instance of the class constructor function object.
 * That way, both "C()" and "C.tp$getattr(...)" can still work. This is
 * of course quite expensive.
 *
 * The alternative would be to indirect all calls (whether classes or
 * regular functions) through something like C.$call(...). In the case
 * of class construction, $call could then call the constructor after
 * munging arguments to pass them on. This would impose a penalty on
 * regular function calls unfortunately, as they would have to do the
 * same thing.
 *
 * Note that the same problem exists for function objects too (a "def"
 * creates a function object that also has properties). It just happens
 * that attributes on classes in python are much more useful and common
 * that the attributes on functions.
 *
 * Also note, that for full python compatibility we have to do the $call
 * method because any python object could have a __call__ method which
 * makes the python object callable too. So, unless we were to make
 * *all* objects simply (function(){...}) and use the dict to create
 * hierarchy, there would be no way to call that python user function. I
 * think I'm prepared to sacrifice __call__ support, or only support it
 * post-ECMA5 or something.
 *
 * Is using (function(){...}) as the only object type too crazy?
 * Probably. Better or worse than having two levels of function
 * invocation for every function call?
 *
 * For a class `C' with instance `inst' we have the following cases:
 *
 * 1. C.attr
 *
 * 2. C.staticmeth()
 *
 * 3. x = C.staticmeth; x()
 *
 * 4. inst = C()
 *
 * 5. inst.attr
 *
 * 6. inst.meth()
 *
 * 7. x = inst.meth; x()
 *
 * 8. inst(), where C defines a __call__
 *
 * Because in general these are accomplished by a helper function
 * (tp$getattr/setattr/slice/ass_slice/etc.) it seems appropriate to add
 * a call that generally just calls through, but sometimes handles the
 * unusual cases. Once ECMA-5 is more broadly supported we can revisit
 * and hopefully optimize.
 *
 * @param {Object} func the thing to call
 * @param {Object=} kwdict **kwargs
 * @param {Object=} varargseq **args
 * @param {Object=} kws keyword args or undef
 * @param {...*} args stuff to pass it
 *
 *
 * TODO I think all the above is out of date.
 */

Sk.misceval.call = function(func, kwdict, varargseq, kws, args)
{
    var args = Array.prototype.slice.call(arguments, 4);
    // todo; possibly inline apply to avoid extra stack frame creation
    return Sk.misceval.apply(func, kwdict, varargseq, kws, args);
};
goog.exportSymbol("Sk.misceval.call", Sk.misceval.call);

/**
 * @param {Object} func the thing to call
 * @param {...*} args stuff to pass it
 */
Sk.misceval.callsim = function(func, args)
{
    var args = Array.prototype.slice.call(arguments, 1);
    return Sk.misceval.apply(func, undefined, undefined, undefined, args);
};
goog.exportSymbol("Sk.misceval.callsim", Sk.misceval.callsim);

/**
 * same as Sk.misceval.call except args is an actual array, rather than
 * varargs.
 */
Sk.misceval.apply = function(func, kwdict, varargseq, kws, args)
{
    if (func === null || func instanceof Sk.builtin.none)
    {
        throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(func) + "' object is not callable");
    }
    else if (typeof func === "function")
    {
        // todo; i believe the only time this happens is the wrapper
        // function around generators (that creates the iterator).
        // should just make that a real function object and get rid
        // of this case.
        // alternatively, put it to more use, and perhaps use
        // descriptors to create builtin.func's in other places.

        // This actually happens for all builtin functions (in
        // builtin.js, for example) as they are javascript functions,
        // not Sk.builtin.func objects.

        if (func.sk$klass)
        {
            // klass wrapper around __init__ requires special handling
            return func.apply(null, [kwdict, varargseq, kws, args]);
        }

        if (varargseq)
        {
            for (var it = varargseq.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
            {
                args.push(i);
            }
        }

        if (kwdict)
        {
            goog.asserts.fail("kwdict not implemented;");
        }
        //goog.asserts.assert(((kws === undefined) || (kws.length === 0)));
        //print('kw args location: '+ kws + ' args ' + args.length)
        if(kws !== undefined && kws.length > 0 ) {
            if (!func.co_varnames) {
                throw new Sk.builtin.ValueError("Keyword arguments are not supported by this function")
            }
    
            //number of positionally placed optional parameters
            var numNonOptParams = func.co_numargs - func.co_varnames.length;
            var numPosParams = args.length - numNonOptParams;
            
            //add defaults
            args = args.concat(func.$defaults.slice(numPosParams));
            
            for(var i = 0; i < kws.length; i = i + 2) {
                var kwix = func.co_varnames.indexOf(kws[i]);
                
                if(kwix === -1) {
                    throw new Sk.builtin.TypeError("'" + kws[i] + "' is an invalid keyword argument for this function");
                } 
                
                if (kwix < numPosParams) {
                    throw new Sk.builtin.TypeError("Argument given by name ('" + kws[i] + "') and position (" + (kwix + numNonOptParams + 1) + ")");
                }
                
                args[kwix + numNonOptParams] = kws[i + 1];  
            }  
        }
        //append kw args to args, filling in the default value where none is provided.
        return func.apply(null, args);
    }
    else
    {
        var fcall = func.tp$call;
        if (fcall !== undefined)
        {
            if (varargseq)
            {
                for (var it = varargseq.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
                {
                    args.push(i);
                }
            }
            if (kwdict)
            {
                goog.asserts.fail("kwdict not implemented;");
            }
            return fcall.call(func, args, kws, kwdict);
        }

        // todo; can we push this into a tp$call somewhere so there's
        // not redundant checks everywhere for all of these __x__ ones?
        fcall = func.__call__;
        if (fcall !== undefined)
        {
            // func is actually the object here because we got __call__
            // from it. todo; should probably use descr_get here
            args.unshift(func);
            return Sk.misceval.apply(fcall, kws, args, kwdict, varargseq);
        }
        throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(func) + "' object is not callable");
    }
};
goog.exportSymbol("Sk.misceval.apply", Sk.misceval.apply);

/**
 * Constructs a class object given a code object representing the body
 * of the class, the name of the class, and the list of bases.
 *
 * There are no "old-style" classes in Skulpt, so use the user-specified
 * metaclass (todo;) if there is one, the type of the 0th base class if
 * there's bases, or otherwise the 'type' type.
 *
 * The func code object is passed a (js) dict for its locals which it
 * stores everything into.
 *
 * The metaclass is then called as metaclass(name, bases, locals) and
 * should return a newly constructed class object.
 *
 */
Sk.misceval.buildClass = function(globals, func, name, bases)
{
    // todo; metaclass
    var meta = Sk.builtin.type;

    var locals = {};

    // init the dict for the class
    //print("CALLING", func);
    func(globals, locals, []);

    // file's __name__ is class's __module__
    locals.__module__ = globals['__name__'];

    var klass = Sk.misceval.callsim(meta, name, bases, locals);
    //print("class", klass, JSON.stringify(klass.prototype));
    return klass;
};
goog.exportSymbol("Sk.misceval.buildClass", Sk.misceval.buildClass);
Sk.abstr = {};

//
//
//
//
// Number
//
//
//
//

Sk.abstr.typeName = function(v) {
    var vtypename;
    if (v instanceof Sk.builtin.nmber) {
        vtypename = v.skType;
    } else if (v.tp$name !== undefined) {
        vtypename = v.tp$name;
    } else {
        vtypename = "<invalid type>";
    };
    return vtypename;
};

Sk.abstr.binop_type_error = function(v, w, name)
{
    var vtypename = Sk.abstr.typeName(v);
    var wtypename = Sk.abstr.typeName(w);

    throw new Sk.builtin.TypeError("unsupported operand type(s) for " + name + ": '"
            + vtypename + "' and '" + wtypename + "'");
};

Sk.abstr.boNameToSlotFuncLhs_ = function(obj, name) {
  if (obj === null) {
    return undefined;
  };
  switch (name) {
    case "Add":      return obj.nb$add          ? obj.nb$add :          obj['__add__'];
    case "Sub":      return obj.nb$subtract     ? obj.nb$subtract :     obj['__sub__'];
    case "Mult":     return obj.nb$multiply     ? obj.nb$multiply :     obj['__mul__'];
    case "Div":      return obj.nb$divide       ? obj.nb$divide :       obj['__div__'];
    case "FloorDiv": return obj.nb$floor_divide ? obj.nb$floor_divide : obj['__floordiv__'];
    case "Mod":      return obj.nb$remainder    ? obj.nb$remainder :    obj['__mod__'];
    case "Pow":      return obj.nb$power        ? obj.nb$power :        obj['__pow__'];
    case "LShift":   return obj.nb$lshift       ? obj.nb$lshift :       obj['__lshift__'];
    case "RShift":   return obj.nb$rshift       ? obj.nb$rshift :       obj['__rshift__'];
    case "BitAnd":   return obj.nb$and          ? obj.nb$and :          obj['__and__'];
    case "BitXor":   return obj.nb$xor          ? obj.nb$xor :          obj['__xor__'];
    case "BitOr":    return obj.nb$or           ? obj.nb$or :           obj['__or__'];
  }
};

Sk.abstr.boNameToSlotFuncRhs_ = function(obj, name) {
  if (obj === null) {
    return undefined;
  };
  switch (name) {
    case "Add":      return obj.nb$add          ? obj.nb$add :          obj['__radd__'];
    case "Sub":      return obj.nb$subtract     ? obj.nb$subtract :     obj['__rsub__'];
    case "Mult":     return obj.nb$multiply     ? obj.nb$multiply :     obj['__rmul__'];
    case "Div":      return obj.nb$divide       ? obj.nb$divide :       obj['__rdiv__'];
    case "FloorDiv": return obj.nb$floor_divide ? obj.nb$floor_divide : obj['__rfloordiv__'];
    case "Mod":      return obj.nb$remainder    ? obj.nb$remainder :    obj['__rmod__'];
    case "Pow":      return obj.nb$power        ? obj.nb$power :        obj['__rpow__'];
    case "LShift":   return obj.nb$lshift       ? obj.nb$lshift :       obj['__rlshift__'];
    case "RShift":   return obj.nb$rshift       ? obj.nb$rshift :       obj['__rrshift__'];
    case "BitAnd":   return obj.nb$and          ? obj.nb$and :          obj['__rand__'];
    case "BitXor":   return obj.nb$xor          ? obj.nb$xor :          obj['__rxor__'];
    case "BitOr":    return obj.nb$or           ? obj.nb$or :           obj['__ror__'];
  }
};

Sk.abstr.iboNameToSlotFunc_ = function(obj, name) {
  switch (name) {
    case "Add":      return obj.nb$inplace_add          ? obj.nb$inplace_add          : obj['__iadd__'];
    case "Sub":      return obj.nb$inplace_subtract     ? obj.nb$inplace_subtract     : obj['__isub__'];
    case "Mult":     return obj.nb$inplace_multiply     ? obj.nb$inplace_multiply     : obj['__imul__'];
    case "Div":      return obj.nb$inplace_divide       ? obj.nb$inplace_divide       : obj['__idiv__'];
    case "FloorDiv": return obj.nb$inplace_floor_divide ? obj.nb$inplace_floor_divide : obj['__ifloordiv__'];
    case "Mod":      return obj.nb$inplace_remainder;
    case "Pow":      return obj.nb$inplace_power;
    case "LShift":   return obj.nb$inplace_lshift       ? obj.nb$inplace_lshift       : obj['__ilshift__'];
    case "RShift":   return obj.nb$inplace_rshift       ? obj.nb$inplace_rshift       : obj['__irshift__'];
    case "BitAnd":   return obj.nb$inplace_and;
    case "BitOr":    return obj.nb$inplace_or;
    case "BitXor":   return obj.nb$inplace_xor          ? obj.nb$inplace_xor          : obj['__ixor__'];
  }
};

Sk.abstr.binary_op_ = function(v, w, opname)
{
    var ret;
    var vop = Sk.abstr.boNameToSlotFuncLhs_(v, opname);
    if (vop !== undefined)
    {
        if (vop.call) {
            ret = vop.call(v, w);
        } else {
            ret = Sk.misceval.callsim(vop,v,w)
        }
        if (ret !== undefined) return ret;
    }
    var wop = Sk.abstr.boNameToSlotFuncRhs_(w, opname);
    if (wop !== undefined)
    {
        if (wop.call) {
            ret = wop.call(w, v);
        } else {
            ret = Sk.misceval.callsim(wop,w,v)
        }
        if (ret !== undefined) return ret;
    }
    Sk.abstr.binop_type_error(v, w, opname);
};

Sk.abstr.binary_iop_ = function(v, w, opname)
{
    var ret;
    var vop = Sk.abstr.iboNameToSlotFunc_(v, opname);
    if (vop !== undefined)
    {
    if (vop.call) {
            ret = vop.call(v, w);
    } else {  // assume that vop is an __xxx__ type method
        ret = Sk.misceval.callsim(vop,v,w); //  added to be like not-in-place... is this okay?
        }
        if (ret !== undefined) return ret;
    }
    var wop = Sk.abstr.iboNameToSlotFunc_(w, opname);
    if (wop !== undefined)
    {
    if (wop.call) {
            ret = wop.call(w, v);
    } else { // assume that wop is an __xxx__ type method
        ret = Sk.misceval.callsim(wop,w,v); //  added to be like not-in-place... is this okay?
        }
        if (ret !== undefined) return ret;
    }
    Sk.abstr.binop_type_error(v, w, opname);
};

//
// handle upconverting a/b from number to long if op causes too big/small a
// result, or if either of the ops are already longs
Sk.abstr.numOpAndPromote = function(a, b, opfn)
{
    if (a === null || b === null) {
        return undefined;
    };

    if (typeof a === "number" && typeof b === "number")
    {
        var ans = opfn(a, b);
        // todo; handle float   Removed RNL (bugs in lng, and it should be a question of precision, not magnitude -- this was just wrong)
        if ( (ans > Sk.builtin.lng.threshold$ || ans < -Sk.builtin.lng.threshold$) && Math.floor(ans) === ans) {
            return [Sk.builtin.lng.fromInt$(a), Sk.builtin.lng.fromInt$(b)];
        } else
            return ans;
    }
    else if (a === undefined || b === undefined) {
        throw new Sk.builtin.NameError('Undefined variable in expression')
    }

    if (a.constructor === Sk.builtin.lng) {
//      if (b.constructor == Sk.builtin.nmber)
//          if (b.skType == Sk.builtin.nmber.float$) {
//              var tmp = new Sk.builtin.nmber(a.tp$str(), Sk.builtin.nmber.float$);
//              return [tmp, b];
//          } else
//              return [a, b.v];
        return [a, b];
    } else if (a.constructor === Sk.builtin.nmber) {
        return [a, b];
    } else if (typeof a === "number") {
        var tmp = new Sk.builtin.nmber(a, undefined);
        return [tmp, b];
    } else
        return undefined;
};

Sk.abstr.boNumPromote_ = {
    "Add": function(a, b) { return a + b; },
    "Sub": function(a, b) { return a - b; },
    "Mult": function(a, b) { return a * b; },
    "Mod": function(a, b) { 
        if (b === 0)
            throw new Sk.builtin.ZeroDivisionError("division or modulo by zero");
        var m = a % b; return ((m * b) < 0 ? (m + b) : m); 
    },
    "Div": function(a, b) {
        if (b === 0)
            throw new Sk.builtin.ZeroDivisionError("division or modulo by zero");
        else
            return a / b;
    },
    "FloorDiv": function(a, b) { 
        if (b === 0)
            throw new Sk.builtin.ZeroDivisionError("division or modulo by zero");
        else
            return Math.floor(a / b); // todo; wrong? neg?
    },
    "Pow": Math.pow,
    "BitAnd": function(a, b) { 
        var m = a & b;
        if (m < 0) {
            m = m + 4294967296; // convert back to unsigned
        }
        return m;
    },
    "BitOr": function(a, b) {
        var m = a | b;
        if (m < 0) {
            m = m + 4294967296; // convert back to unsigned
        }
        return m;
    },
    "BitXor": function(a, b) {
        var m = a ^ b;
        if (m < 0) {
            m = m + 4294967296; // convert back to unsigned
        }
        return m;
    },
    "LShift": function(a, b) { 
    if (b < 0) {
        throw new Sk.builtin.ValueError("negative shift count");
    }
    var m = a << b;
    if (m > a) {
        return m; 
    }
    else {
        // Fail, this will get recomputed with longs
        return a * Math.pow(2, b);
    }
    },
    "RShift": function(a, b) { 
        if (b < 0) {
            throw new Sk.builtin.ValueError("negative shift count");
        }
        var m = a >> b;
        if ((a > 0) && (m < 0)) {
            // fix incorrect sign extension
            m = m & (Math.pow(2, 32-b) - 1);
        }
        return m; 
    }
};

Sk.abstr.numberBinOp = function(v, w, op)
{
    var numPromoteFunc = Sk.abstr.boNumPromote_[op];
    if (numPromoteFunc !== undefined)
    {
        var tmp = Sk.abstr.numOpAndPromote(v, w, numPromoteFunc);
        if (typeof tmp === "number")
        {
            return tmp;
        }
        else if (tmp !== undefined &&  tmp.constructor === Sk.builtin.nmber)
        {
            return tmp;
        }
        else if (tmp !== undefined && tmp.constructor === Sk.builtin.lng)
        {
            return tmp;
        }
        else if (tmp !== undefined)
        {
            v = tmp[0];
            w = tmp[1];
        }
    }

    return Sk.abstr.binary_op_(v, w, op);
};
goog.exportSymbol("Sk.abstr.numberBinOp", Sk.abstr.numberBinOp);

Sk.abstr.numberInplaceBinOp = function(v, w, op)
{
    var numPromoteFunc = Sk.abstr.boNumPromote_[op];
    if (numPromoteFunc !== undefined)
    {
        var tmp = Sk.abstr.numOpAndPromote(v, w, numPromoteFunc);
        if (typeof tmp === "number")
        {
            return tmp;
        }
        else if (tmp !== undefined &&  tmp.constructor === Sk.builtin.nmber)
        {
            return tmp;
        }
        else if (tmp !== undefined && tmp.constructor === Sk.builtin.lng)
        {
            return tmp;
        }
        else if (tmp !== undefined)
        {
            v = tmp[0];
            w = tmp[1];
        }
    }

    return Sk.abstr.binary_iop_(v, w, op);
};
goog.exportSymbol("Sk.abstr.numberInplaceBinOp", Sk.abstr.numberInplaceBinOp);

Sk.abstr.numberUnaryOp = function(v, op)
{
    if (op === "Not") return Sk.misceval.isTrue(v) ? Sk.builtin.bool.false$ : Sk.builtin.bool.true$;
    else if (v instanceof Sk.builtin.nmber || v instanceof Sk.builtin.bool) {
    var value = Sk.builtin.asnum$(v);
    if (op === "USub") return new Sk.builtin.nmber(-value, v.skType);
        if (op === "UAdd") return new Sk.builtin.nmber(value, v.skType);
        if (op === "Invert") return new Sk.builtin.nmber(~value, v.skType);
    }
    else
    {
        if (op === "USub" && v.nb$negative) return v.nb$negative();
        if (op === "UAdd" && v.nb$positive) return v.nb$positive();
        if (op === "Invert" && v.nb$invert) return v.nb$invert();
    }

    var vtypename = Sk.abstr.typeName(v);
    throw new Sk.builtin.TypeError("unsupported operand type for " + op + " '" + vtypename + "'");
};
goog.exportSymbol("Sk.abstr.numberUnaryOp", Sk.abstr.numberUnaryOp);

//
//
//
//
// Sequence
//
//
//
//

Sk.abstr.fixSeqIndex_ = function(seq, i)
{
    i = Sk.builtin.asnum$(i);
    if (i < 0 && seq.sq$length)
        i += seq.sq$length();
    return i;
};

Sk.abstr.sequenceContains = function(seq, ob)
{
    if (seq.sq$contains) return seq.sq$contains(ob);

    var seqtypename = Sk.abstr.typeName(seq);
    if (!seq.tp$iter) throw new Sk.builtin.TypeError("argument of type '" + seqtypename + "' is not iterable");
    
    for (var it = seq.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
    {
        if (Sk.misceval.richCompareBool(i, ob, "Eq"))
            return true;
    }
    return false;
};

Sk.abstr.sequenceConcat = function(seq1, seq2) {
    if (seq1.sq$concat) {
            return seq1.sq$concat(seq2)
    }
    var seq1typename = Sk.abstr.typeName(seq1);
    throw new Sk.builtin.TypeError("'" + seq1typename + "' object can't be concatenated");
};

Sk.abstr.sequenceGetIndexOf = function(seq, ob) {
    if (seq.index) {
        return Sk.misceval.callsim(seq.index, seq, ob);
    }

    var seqtypename = Sk.abstr.typeName(seq);
    if (seqtypename === "dict") {
        throw new Sk.builtin.NotImplementedError("looking up dict key from value is not yet implemented (supported in Python 2.6)");
    }
    throw new Sk.builtin.TypeError("argument of type '" + seqtypename + "' is not iterable");
};

Sk.abstr.sequenceGetCountOf = function(seq, ob) {
    if (seq.count) {
        return Sk.misceval.callsim(seq.count, seq, ob);
    }

    var seqtypename = Sk.abstr.typeName(seq);
    throw new Sk.builtin.TypeError("argument of type '" + seqtypename + "' is not iterable");
};

Sk.abstr.sequenceGetItem = function(seq, i) {
    if (seq.mp$subscript) {
        return seq.mp$subscript(i);
    }

    var seqtypename = Sk.abstr.typeName(seq);
    throw new Sk.builtin.TypeError("'" + seqtypename + "' object is unsubscriptable");
};

Sk.abstr.sequenceSetItem = function(seq, i, x) {
    if (seq.mp$ass_subscript) {
        return seq.mp$ass_subscript(i, x);
    }

    var seqtypename = Sk.abstr.typeName(seq);
    throw new Sk.builtin.TypeError("'" + seqtypename + "' object does not support item assignment");
};

Sk.abstr.sequenceDelItem = function(seq, i) {
    if (seq.sq$del_item)
    {
        i = Sk.abstr.fixSeqIndex_(seq, i);
        seq.sq$del_item(i);
        return;
    }

    var seqtypename = Sk.abstr.typeName(seq);
    throw new Sk.builtin.TypeError("'" + seqtypename + "' object does not support item deletion");
};

Sk.abstr.sequenceRepeat = function(f, seq, n)
{
    n = Sk.builtin.asnum$(n);
    var count = Sk.misceval.asIndex(n);
    if (count === undefined)
    {
        var ntypename = Sk.abstr.typeName(n);
        throw new Sk.builtin.TypeError("can't multiply sequence by non-int of type '" + ntypename + "'");
    }
    return f.call(seq, n);
};

Sk.abstr.sequenceGetSlice = function(seq, i1, i2)
{
    if (seq.sq$slice)
    {
        i1 = Sk.abstr.fixSeqIndex_(seq, i1);
        i2 = Sk.abstr.fixSeqIndex_(seq, i2);
        return seq.sq$slice(i1, i2);
    }
    else if (seq.mp$subscript)
    {
        return seq.mp$subscript(new Sk.builtin.slice(i1, i2));
    }

    var seqtypename = Sk.abstr.typeName(seq);
    throw new Sk.builtin.TypeError("'" + seqtypename + "' object is unsliceable");
};

Sk.abstr.sequenceDelSlice = function(seq, i1, i2)
{
    if (seq.sq$del_slice)
    {
        i1 = Sk.abstr.fixSeqIndex_(seq, i1);
        i2 = Sk.abstr.fixSeqIndex_(seq, i2);
        seq.sq$del_slice(i1, i2);
        return;
    }

    var seqtypename = Sk.abstr.typeName(seq);
    throw new Sk.builtin.TypeError("'" + seqtypename + "' doesn't support slice deletion");
};

Sk.abstr.sequenceSetSlice = function(seq, i1, i2, x)
{
    if (seq.sq$ass_slice)
    {
        i1 = Sk.abstr.fixSeqIndex_(seq, i1);
        i2 = Sk.abstr.fixSeqIndex_(seq, i2);
        seq.sq$ass_slice(i1, i2, x);
    }
    else if (seq.mp$ass_subscript)
    {
        seq.mp$ass_subscript(new Sk.builtin.slice(i1, i2), x);
    }
    else
    {
        var seqtypename = Sk.abstr.typeName(seq);
        throw new Sk.builtin.TypeError("'" + seqtypename + "' object doesn't support slice assignment");
    }
};

//
//
//
//
// Object
//
//
//
//

Sk.abstr.objectAdd = function(a, b) {
    if (a.nb$add) {
        return a.nb$add(b);
    }

    var atypename = Sk.abstr.typeName(a);
    var btypename = Sk.abstr.typeName(b);
    throw new Sk.builtin.TypeError("unsupported operand type(s) for +: '" + atypename + "' and '" + btypename + "'");
};

// in Python 2.6, this behaviour seems to be defined for numbers and bools (converts bool to int)
Sk.abstr.objectNegative = function(obj) {
    var obj_asnum = Sk.builtin.asnum$(obj); // this will also convert bool type to int

    if (typeof obj_asnum === 'number') {
        return Sk.builtin.nmber.prototype['nb$negative'].call(obj);
    }

    var objtypename = Sk.abstr.typeName(obj);
    throw new Sk.builtin.TypeError("bad operand type for unary -: '" + objtypename + "'");
};

// in Python 2.6, this behaviour seems to be defined for numbers and bools (converts bool to int)
Sk.abstr.objectPositive = function(obj) {
    var objtypename = Sk.abstr.typeName(obj);
    var obj_asnum = Sk.builtin.asnum$(obj); // this will also convert bool type to int

    if (objtypename === 'bool') {
        return new Sk.builtin.nmber(obj_asnum, 'int');
    }
    if (typeof obj_asnum === 'number') {
        return Sk.builtin.nmber.prototype['nb$positive'].call(obj);
    }

    throw new Sk.builtin.TypeError("bad operand type for unary +: '" + objtypename + "'");
};

Sk.abstr.objectDelItem = function(o, key) {
    if (o !== null)
    {
        if (o.mp$del_subscript) {
            o.mp$del_subscript(key);
            return;
        }
        if (o.sq$ass_item)
        {
            var keyValue = Sk.misceval.asIndex(key);
            if (keyValue === undefined) {
                var keytypename = Sk.abstr.typeName(key);
                throw new Sk.builtin.TypeError("sequence index must be integer, not '" + keytypename + "'");
            }
            Sk.abstr.sequenceDelItem(o, keyValue);
            return;
        }
        // if o is a slice do something else...
    }

    var otypename = Sk.abstr.typeName(o);
    throw new Sk.builtin.TypeError("'" + otypename + "' object does not support item deletion");
};
goog.exportSymbol("Sk.abstr.objectDelItem", Sk.abstr.objectDelItem);

Sk.abstr.objectGetItem = function(o, key)
{
    if (o !== null) 
    {
        if (o.mp$subscript)
            return o.mp$subscript(key);
        else if (Sk.misceval.isIndex(key) && o.sq$item)
            return Sk.abstr.sequenceGetItem(o, Sk.misceval.asIndex(key));
        else if (o.tp$getitem) {
            return o.tp$getitem(key);
        }
    }

    var otypename = Sk.abstr.typeName(o);
    throw new Sk.builtin.TypeError("'" + otypename + "' does not support indexing");
};
goog.exportSymbol("Sk.abstr.objectGetItem", Sk.abstr.objectGetItem);

Sk.abstr.objectSetItem = function(o, key, v)
{
    if (o !== null) 
    {
        if (o.mp$ass_subscript)
            return o.mp$ass_subscript(key, v);
        else if (Sk.misceval.isIndex(key) && o.sq$ass_item)
            return Sk.abstr.sequenceSetItem(o, Sk.misceval.asIndex(key), v);
    else if (o.tp$setitem)
        return o.tp$setitem(key, v);
    }

    var otypename = Sk.abstr.typeName(o);
    throw new Sk.builtin.TypeError("'" + otypename + "' does not support item assignment");
};
goog.exportSymbol("Sk.abstr.objectSetItem", Sk.abstr.objectSetItem);



Sk.abstr.gattr = function(obj, nameJS)
{
    var objname = Sk.abstr.typeName(obj);

    if (obj === null) {
        throw new Sk.builtin.AttributeError("'" + objname + "' object has no attribute '" + nameJS + "'");
    }

    var ret = undefined;

    if (obj['__getattr__']) {
        ret = Sk.misceval.callsim(obj['__getattr__'], obj, nameJS);
    } else if (obj.tp$getattr !== undefined) {
        ret = obj.tp$getattr(nameJS);
    }

    if (ret === undefined) {
        throw new Sk.builtin.AttributeError("'" + objname + "' object has no attribute '" + nameJS + "'");       
    }
 
    return ret;
};
goog.exportSymbol("Sk.abstr.gattr", Sk.abstr.gattr);

Sk.abstr.sattr = function(obj, nameJS, data)
{
    var objname = Sk.abstr.typeName(obj);

    if (obj === null) {
        throw new Sk.builtin.AttributeError("'" + objname + "' object has no attribute '" + nameJS + "'");
    } else if (obj['__setattr__']) {
        Sk.misceval.callsim(obj['__setattr__'], obj, nameJS, data);
    } else if (obj.tp$setattr !== undefined) {
        obj.tp$setattr(nameJS, data);
    } else {
        throw new Sk.builtin.AttributeError("'" + objname + "' object has no attribute '" + nameJS + "'");
    }
};
goog.exportSymbol("Sk.abstr.sattr", Sk.abstr.sattr);

Sk.abstr.iter = function(obj)
{
    if (obj.tp$iter) {
        return obj.tp$iter();
    }
    else {
        throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(obj) + "' object is not iterable");
    }
};
goog.exportSymbol("Sk.abstr.iter", Sk.abstr.iter);

Sk.abstr.iternext = function(it)
{
    return it.tp$iternext();
};
goog.exportSymbol("Sk.abstr.iternext", Sk.abstr.iternext);
/**
 * py sort is guaranteed to be stable, js's is not (and isn't in some
 * browsers). we also have to do cmp/key/rev anyway, so this is a simple
 * mergesort implementation to handle sorting for list (and other stuff
 * eventually).
 *
 * @param {Array.<Object>} arr
 * @param {Sk.builtin.func} cmp
 * @param {Sk.builtin.func=} key
 * @param {boolean=} reverse
 */
Sk.mergeSort = function(arr, cmp, key, reverse)	//	Replaced by quicksort
{
	Sk.quickSort(arr, cmp, key, reverse)
}

Sk.quickSort = function(arr, cmp, key, reverse)
{
    goog.asserts.assert(!key, "todo;");

    if (!cmp)
    {
        cmp = Sk.mergeSort.stdCmp;
    }

    var partition = function(arr, begin, end, pivot, reverse)
	{
		var tmp;
		var piv=arr[pivot];
		
//		swap pivot, end-1
		tmp=arr[pivot];
		arr[pivot]=arr[end-1];
		arr[end-1]=tmp;

		var store=begin;
		var ix;
		for(ix=begin; ix<end-1; ++ix) {
            if ( reverse ) {
			  var cmpresult = Sk.misceval.callsim(cmp, piv, arr[ix]);
            } else {
			  var cmpresult = Sk.misceval.callsim(cmp, arr[ix], piv);
            }
            if( Sk.builtin.asnum$(cmpresult) < 0 ) {
//				swap store, ix
				tmp=arr[store];
				arr[store]=arr[ix];
				arr[ix]=tmp;
				++store;
			}
		}
		
//		swap end-1, store
		tmp=arr[end-1];
		arr[end-1]=arr[store];
		arr[store]=tmp;
	
		return store;
	}
	
	var qsort = function(arr, begin, end, reverse)
	{
		if(end-1>begin) {
			var pivot=begin+Math.floor(Math.random()*(end-begin));
	
			pivot=partition(arr, begin, end, pivot, reverse);
	
			qsort(arr, begin, pivot, reverse);
			qsort(arr, pivot+1, end, reverse);
		}
	}

    qsort(arr, 0, arr.length, reverse);
    return null;
};

Sk.mergeSort.stdCmp = new Sk.builtin.func(function(k0, k1)
{
    //print("CMP", JSON.stringify(k0), JSON.stringify(k1));
    var res = Sk.misceval.richCompareBool(k0, k1, "Lt") ? -1 : 0;
    //print("  ret:", res);
    return res;
});

//	A javascript mergesort from the web

//function merge_sort(arr) {  
//    var l = arr.length, m = Math.floor(l/2);  
//    if (l <= 1) return arr;  
//    return merge(merge_sort(arr.slice(0, m)), merge_sort(arr.slice(m)));  
//}  
//  
//function merge(left,right) {  
//    var result = [];  
//    var ll = left.length, rl = right.length;  
//    while (ll > 0 && rl > 0) {  
//        if (left[0] <= right[0]) {  
//            result.push(left.shift());  
//            ll--;  
//        } else {  
//            result.push(right.shift());  
//            rl--;  
//        }  
//    }  
//    if (ll > 0) {  
//        result.push.apply(result, left);  
//    } else if (rl > 0) {  
//        result.push.apply(result, right);  
//    }  
//    return result;  
//} 

//	Old, original code (doesn't work)
//Sk.mergeSort = function(arr, cmp, key, reverse)
//{
//    goog.asserts.assert(!key, "todo;");
//    goog.asserts.assert(!reverse, "todo;");
//
//    if (!cmp)
//    {
//        cmp = Sk.mergeSort.stdCmp;
//    }
//
//    var mergeInPlace = function(begin, beginRight, end)
//    {
//        for (; begin < beginRight; ++begin)
//        {
//            if (!(Sk.misceval.callsim(cmp, arr[begin], arr[beginRight]) < 0))
//            {
//                var v = arr[begin];
//                arr[begin] = arr[beginRight];
//
//                while (begin + 1 < end && Sk.misceval.callsim(cmp, arr[begin + 1], v) < 0)
//                {
//                    var tmp = arr[begin];
//                    arr[begin] = arr[begin + 1];
//                    arr[begin + 1] = tmp;
//                    begin += 1;
//                }
//                arr[begin] = v;
//            }
//        }
//    };
//
//    var sort = function(begin, end)
//    {
//        var size = end - begin;
//        if (size < 2) return;
//
//        var beginRight = begin + Math.floor(size / 2);
//
//        sort(begin, beginRight);
//        sort(beginRight, end);
//        mergeInPlace(begin, beginRight, end);
//    };
//
//    //print("SORT", JSON.stringify(arr, null, 2));
//    sort(0, arr.length);
//    //print("SORTRES", JSON.stringify(arr, null, 2));
//    return null;
//};
/**
 * @constructor
 * @param {Array.<Object>=} L
 * @extends Sk.builtin.object
 */
Sk.builtin.list = function(L)
{
    if (!(this instanceof Sk.builtin.list)) return new Sk.builtin.list(L);

    if (L === undefined)
    {
            this.v = [];
    }
    else if (Object.prototype.toString.apply(L) === '[object Array]')
    {
        this.v = L;
    }
    else
    {
        if (L.tp$iter)
        {
            this.v = [];
            for (var it = L.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
                this.v.push(i);
        }
        else
            throw new Sk.builtin.ValueError("expecting Array or iterable");
    }

    this.__class__ = Sk.builtin.list;

    this["v"] = this.v;
    return this;
};


Sk.builtin.list.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('list', Sk.builtin.list);

Sk.builtin.list.prototype.list_iter_ = function()
{
    var ret =
    {
        tp$iter: function() { return ret; },
        $obj: this,
        $index: 0,
        tp$iternext: function()
        {
            // todo; StopIteration
            if (ret.$index >= ret.$obj.v.length) return undefined;
            return ret.$obj.v[ret.$index++];
        }
    };
    return ret;
};

Sk.builtin.list.prototype.list_concat_ = function(other)
{
    // other not a list
    if (!other.__class__ || other.__class__ != Sk.builtin.list)
    {
        throw new Sk.builtin.TypeError("can only concatenate list to list");
    }

    var ret = this.v.slice();
    for (var i = 0; i < other.v.length; ++i)
    {
        ret.push(other.v[i]);
    }
    return new Sk.builtin.list(ret);
}

Sk.builtin.list.prototype.list_del_item_ = function(i)
{
    i = Sk.builtin.asnum$(i);
    if (i < 0 || i >= this.v.length)
        throw new Sk.builtin.IndexError("list assignment index out of range");
    this.list_del_slice_(i, i+1);    
};

Sk.builtin.list.prototype.list_del_slice_ = function(ilow, ihigh)
{
    ilow = Sk.builtin.asnum$(ilow);
    ihigh = Sk.builtin.asnum$(ihigh);
    var args = [];
    args.unshift(ihigh - ilow);
    args.unshift(ilow);
    this.v.splice.apply(this.v, args);
};

Sk.builtin.list.prototype.list_ass_item_ = function(i, v)
{
	i = Sk.builtin.asnum$(i);
    if (i < 0 || i >= this.v.length)
        throw new Sk.builtin.IndexError("list assignment index out of range");
    this.v[i] = v;
};

Sk.builtin.list.prototype.list_ass_slice_ = function(ilow, ihigh, v)
{
	ilow = Sk.builtin.asnum$(ilow);
	ihigh = Sk.builtin.asnum$(ihigh);

    // todo; item rather list/null
    var args = v.v.slice(0);
    args.unshift(ihigh - ilow);
    args.unshift(ilow);
    this.v.splice.apply(this.v, args);
};

Sk.builtin.list.prototype.tp$name = "list";
Sk.builtin.list.prototype['$r'] = function()
{
    var ret = [];
    for (var it = this.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
        ret.push(Sk.misceval.objectRepr(i).v);
    return new Sk.builtin.str("[" + ret.join(", ") + "]");
};
Sk.builtin.list.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;
Sk.builtin.list.prototype.tp$hash = Sk.builtin.object.prototype.HashNotImplemented;

Sk.builtin.list.prototype.tp$richcompare = function(w, op)
{
    // todo; can't figure out where cpy handles this silly case (test/run/t96.py)
    // perhaps by trapping a stack overflow? otherwise i'm not sure for more
    // complicated cases. bleh
    //
    // if the comparison allows for equality then short-circuit it here
    if (this === w && Sk.misceval.opAllowsEquality(op))
        return true;

    // w not a list
    if (!w.__class__ || w.__class__ != Sk.builtin.list)
    {
        // shortcuts for eq/not
        if (op === 'Eq') return false;
        if (op === 'NotEq') return true;

        // todo; other types should have an arbitrary order
        return false;
    }

    var v = this.v;
    var w = w.v;
    var vl = v.length;
    var wl = w.length;

    var i;
    for (i = 0; i < vl && i < wl; ++i)
    {
        var k = Sk.misceval.richCompareBool(v[i], w[i], 'Eq');
        if (!k) break;
    }

    if (i >= vl || i >= wl)
    {
        // no more items to compare, compare sizes
        switch (op)
        {
            case 'Lt': return vl < wl;
            case 'LtE': return vl <= wl;
            case 'Eq': return vl === wl;
            case 'NotEq': return vl !== wl;
            case 'Gt': return vl > wl;
            case 'GtE': return vl >= wl;
            default: goog.asserts.fail();
        }
    }

    // we have an item that's different

    // shortcuts for eq/not
    if (op === 'Eq') return false;
    if (op === 'NotEq') return true;

    // or, compare the differing element using the proper operator
    return Sk.misceval.richCompareBool(v[i], w[i], op);
};

Sk.builtin.list.prototype.tp$iter = Sk.builtin.list.prototype.list_iter_;
Sk.builtin.list.prototype.sq$length = function() { return this.v.length; };
Sk.builtin.list.prototype.sq$concat = Sk.builtin.list.prototype.list_concat_;
Sk.builtin.list.prototype.nb$add = Sk.builtin.list.prototype.list_concat_;
Sk.builtin.list.prototype.nb$inplace_add = Sk.builtin.list.prototype.list_concat_;
Sk.builtin.list.prototype.sq$repeat = function(n)
{
    if (!Sk.builtin.checkInt(n)) {
        throw new Sk.builtin.TypeError("can't multiply sequence by non-int of type '" + Sk.abstr.typeName(n) +"'");
    }

    n = Sk.builtin.asnum$(n);
    var ret = [];
    for (var i = 0; i < n; ++i)
        for (var j = 0; j < this.v.length; ++j)
            ret.push(this.v[j]);
    return new Sk.builtin.list(ret);
};
Sk.builtin.list.prototype.nb$multiply = Sk.builtin.list.prototype.sq$repeat;
Sk.builtin.list.prototype.nb$inplace_multiply = Sk.builtin.list.prototype.sq$repeat;
/*
Sk.builtin.list.prototype.sq$item = list_item;
Sk.builtin.list.prototype.sq$slice = list_slice;
*/
Sk.builtin.list.prototype.sq$ass_item = Sk.builtin.list.prototype.list_ass_item_;
Sk.builtin.list.prototype.sq$del_item = Sk.builtin.list.prototype.list_del_item_;
Sk.builtin.list.prototype.sq$ass_slice = Sk.builtin.list.prototype.list_ass_slice_;
Sk.builtin.list.prototype.sq$del_slice = Sk.builtin.list.prototype.list_del_slice_;
//Sk.builtin.list.prototype.sq$contains // iter version is fine
/*
Sk.builtin.list.prototype.sq$inplace_concat = list_inplace_concat;
Sk.builtin.list.prototype.sq$inplace_repeat = list_inplace_repeat;
*/

Sk.builtin.list.prototype.list_subscript_ = function(index)
{
    if (Sk.misceval.isIndex(index))
    {
        var i = Sk.misceval.asIndex(index);
        if (i !== undefined) 
        {
            if (i < 0) i = this.v.length + i;
            if (i < 0 || i >= this.v.length) {
                throw new Sk.builtin.IndexError("list index out of range");
            }
            return this.v[i]
        }
    }
    else if (index instanceof Sk.builtin.slice)
    {
        var ret = [];
        index.sssiter$(this, function(i, wrt)
                {
                    ret.push(wrt.v[i]);
                });
        return new Sk.builtin.list(ret);
    }

    throw new Sk.builtin.TypeError("list indices must be integers, not " + Sk.abstr.typeName(index));
};

Sk.builtin.list.prototype.list_ass_subscript_ = function(index, value)
{
    if (Sk.misceval.isIndex(index))
    {
        var i = Sk.misceval.asIndex(index);
        if (i !== undefined) 
        {
            if (i < 0) i = this.v.length + i;
            this.list_ass_item_(i, value);
            return;
        }
    }
    else if (index instanceof Sk.builtin.slice)
    {
        var indices = index.indices(this.v.length);
        if (indices[2] === 1) 
        {
            this.list_ass_slice_(indices[0], indices[1], value);
        }
        else
        {
            var tosub = [];
            index.sssiter$(this, function(i, wrt) { tosub.push(i); });
            var j = 0;
            if (tosub.length !== value.v.length) throw new Sk.builtin.ValueError("attempt to assign sequence of size " + value.v.length + " to extended slice of size " + tosub.length);
            for (var i = 0; i < tosub.length; ++i)
            {
                this.v.splice(tosub[i], 1, value.v[j]);
                j += 1;
            }
        }
        return;
    }

    throw new Sk.builtin.TypeError("list indices must be integers, not " + Sk.abstr.typeName(index));
};

Sk.builtin.list.prototype.list_del_subscript_ = function(index)
{
    if (Sk.misceval.isIndex(index))
    {
        var i = Sk.misceval.asIndex(index);
        if (i !== undefined) 
        {
            if (i < 0) i = this.v.length + i;
            this.list_del_item_(i);
            return;
        }
    }
    else if (index instanceof Sk.builtin.slice)
    {
        var indices = index.indices(this.v.length);
        if (indices[2] === 1)
        {
            this.list_del_slice_(indices[0], indices[1]);
        }
        else
        {
            var self = this;
            var dec = 0; // offset of removal for next index (because we'll have removed, but the iterator is giving orig indices)
            var offdir = indices[2] > 0 ? 1 : 0;
            index.sssiter$(this, function(i, wrt)
                           {
                               self.v.splice(i - dec, 1);
                               dec += offdir;
                           });
        }
        return;
    }

    throw new Sk.builtin.TypeError("list indices must be integers, not " + typeof index);
};

Sk.builtin.list.prototype.mp$subscript = Sk.builtin.list.prototype.list_subscript_;
Sk.builtin.list.prototype.mp$ass_subscript = Sk.builtin.list.prototype.list_ass_subscript_;
Sk.builtin.list.prototype.mp$del_subscript = Sk.builtin.list.prototype.list_del_subscript_;

Sk.builtin.list.prototype.__getitem__ = new Sk.builtin.func(function(self, index)
{
    return Sk.builtin.list.prototype.list_subscript_.call(self, index);
});

/**
 * @param {?=} self
 * @param {?=} cmp optional
 * @param {?=} key optional
 * @param {?=} reverse optional
 */
Sk.builtin.list.prototype.list_sort_ = function(self, cmp, key, reverse) {
    var has_key = key !== undefined && key !== null;
    var has_cmp = cmp !== undefined && cmp !== null;
    if (reverse == undefined) { reverse = false; }

    var timsort = new Sk.builtin.timSort(self);

    self.v = [];
    var zero = new Sk.builtin.nmber(0, Sk.builtin.nmber.int$);

    if (has_key){
        if (has_cmp) {
            timsort.lt = function(a, b){
                var res = Sk.misceval.callsim(cmp, a[0], b[0])
                return Sk.misceval.richCompareBool(res, zero, "Lt");
            };
        }
        else{
            timsort.lt = function(a, b) {
                return Sk.misceval.richCompareBool(a[0], b[0], "Lt");
            }
        }
        for (var i =0; i < timsort.listlength; i++){
            var item = timsort.list.v[i];
            var keyvalue = Sk.misceval.callsim(key, item);
            timsort.list.v[i] = [keyvalue, item];
        }
    } else if (has_cmp) {
        timsort.lt = function(a, b){
            var res = Sk.misceval.callsim(cmp, a, b);
            return Sk.misceval.richCompareBool(res, zero, "Lt");
        };
    }

    if (reverse){
        timsort.list.list_reverse_(timsort.list);
    }

    timsort.sort();

    if (reverse){
        timsort.list.list_reverse_(timsort.list);
    }

    if (has_key){
        for (var j = 0; j < timsort.listlength; j++){
            item = timsort.list.v[j][1];
            timsort.list.v[j] = item;
        }
    }

    var mucked = self.sq$length() > 0;

    self.v = timsort.list.v;

    if (mucked) {
        throw new Sk.builtin.OperationError("list modified during sort");
    }

    return Sk.builtin.none.none$;
}

/**
 * @param {Sk.builtin.list=} self optional
 **/
Sk.builtin.list.prototype.list_reverse_ = function(self)
{
    Sk.builtin.pyCheckArgs("reverse", arguments, 1, 1);

    var len = self.v.length;
    var old = self.v;
    var newarr = [];
    for (var i = len -1; i > -1; --i)
    {
        newarr.push(old[i]);
    }
    self.v = newarr;
    return Sk.builtin.none.none$;
}

//Sk.builtin.list.prototype.__reversed__ = todo;
Sk.builtin.list.prototype['__iter__'] = new Sk.builtin.func(function(self)
{
    Sk.builtin.pyCheckArgs("__iter__", arguments, 1, 1);

    return self.list_iter_();
});

Sk.builtin.list.prototype['append'] = new Sk.builtin.func(function(self, item)
{
    Sk.builtin.pyCheckArgs("append", arguments, 2, 2);

    self.v.push(item);
    return Sk.builtin.none.none$;
});

Sk.builtin.list.prototype['insert'] = new Sk.builtin.func(function(self, i, x)
{
    Sk.builtin.pyCheckArgs("insert", arguments, 3, 3);
    if (!Sk.builtin.checkNumber(i)) {
        throw new Sk.builtin.TypeError("an integer is required");
    };

    i = Sk.builtin.asnum$(i);
    if (i < 0) {
	i = i + self.v.length;
    }
    if (i < 0) {
	i = 0;
    }
    else if (i > self.v.length) {
	i = self.v.length;
    }
    self.v.splice(i, 0, x);
    return Sk.builtin.none.none$;
});

Sk.builtin.list.prototype['extend'] = new Sk.builtin.func(function(self, b)
{
    Sk.builtin.pyCheckArgs("extend", arguments, 2, 2);
    if (!Sk.builtin.checkIterable(b)) {
        throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(b) 
                                        + "' object is not iterable");  
    };
    if (self == b) {
        // Handle extending list with itself
        var newb = [];
        for (var it = b.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
            newb.push(i);

        // Concatenate
        self.v.push.apply(self.v, newb);

        return Sk.builtin.none.none$;
    };
    for (var it = b.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
        self.v.push(i);
    return Sk.builtin.none.none$;
});

Sk.builtin.list.prototype['pop'] = new Sk.builtin.func(function(self, i)
{
    Sk.builtin.pyCheckArgs("pop", arguments, 1, 2);
    if (i === undefined) {
        i = self.v.length - 1;
    };
    if (!Sk.builtin.checkNumber(i)) {
        throw new Sk.builtin.TypeError("an integer is required");
    };

    i = Sk.builtin.asnum$(i);
    if (i < 0) {
	i = i + self.v.length;
    }
    if ((i < 0) || (i >= self.v.length)) {
        throw new Sk.builtin.IndexError("pop index out of range");
    };

    var ret = self.v[i];
    self.v.splice(i, 1);
    return ret;
});

Sk.builtin.list.prototype['remove'] = new Sk.builtin.func(function(self, item)
{
    Sk.builtin.pyCheckArgs("remove", arguments, 2, 2);

    var idx = Sk.builtin.list.prototype['index'].func_code(self, item);
    self.v.splice(Sk.builtin.asnum$(idx), 1);
    return Sk.builtin.none.none$;
});

Sk.builtin.list.prototype['index'] = new Sk.builtin.func(function(self, item, start, stop)
{
    Sk.builtin.pyCheckArgs("index", arguments, 2, 4);
    if (start !== undefined && !Sk.builtin.checkInt(start)) {
        throw new Sk.builtin.TypeError("slice indices must be integers");
    }
    if (stop !== undefined && !Sk.builtin.checkInt(stop)) {
        throw new Sk.builtin.TypeError("slice indices must be integers");
    }

    var len = self.v.length;
    var obj = self.v;

    start = (start === undefined) ? 0 : start.v;
    if (start < 0) {
        start = ((start + len) >= 0) ? start + len : 0;
    }

    stop = (stop === undefined) ? len : stop.v;
    if (stop < 0) {
        stop = ((stop + len) >= 0) ? stop + len : 0;
    }

    for (var i = start; i < stop; ++i)
    {
        if (Sk.misceval.richCompareBool(obj[i], item, "Eq"))
            return Sk.builtin.assk$(i, Sk.builtin.nmber.int$);
    }
    throw new Sk.builtin.ValueError("list.index(x): x not in list");
});

Sk.builtin.list.prototype['count'] = new Sk.builtin.func(function(self, item)
{
    Sk.builtin.pyCheckArgs("count", arguments, 2, 2);

    var len = self.v.length;
    var obj = self.v;
    var count = 0;
    for (var i = 0; i < len; ++i)
    {
        if (Sk.misceval.richCompareBool(obj[i], item, "Eq"))
        {
            count += 1;
        }
    }
    return new Sk.builtin.nmber(count, Sk.builtin.nmber.int$);
});

Sk.builtin.list.prototype['reverse'] = new Sk.builtin.func(Sk.builtin.list.prototype.list_reverse_);

Sk.builtin.list.prototype['sort'] = new Sk.builtin.func(Sk.builtin.list.prototype.list_sort_);

// Make sure that key/value variations of lst.sort() work
// See issue 45 on github as to possible alternate approaches to this and
// why this was chosen - csev
Sk.builtin.list.prototype['sort'].func_code['co_varnames']=['__self__','cmp', 'key', 'reverse'];
goog.exportSymbol("Sk.builtin.list", Sk.builtin.list);
var interned = {};

/**
 * @constructor
 * @param {*} x
 * @extends Sk.builtin.object
 */
Sk.builtin.str = function(x)
{
    if (x === undefined) x = "";
    if (x instanceof Sk.builtin.str && x !== Sk.builtin.str.prototype.ob$type) return x;
    if (!(this instanceof Sk.builtin.str)) return new Sk.builtin.str(x);

    // convert to js string
    var ret;
    if (x === true) ret = "True";
    else if (x === false) ret = "False";
    else if ((x === null) || (x instanceof Sk.builtin.none)) ret = "None";
    else if (x instanceof Sk.builtin.bool)
    {
	if (x.v) ret = "True";
	else ret = "False";
    }
    else if (typeof x === "number")
    {
        ret = x.toString();
        if (ret === "Infinity") ret = "inf";
        else if (ret === "-Infinity") ret = "-inf";
    }
    else if (typeof x === "string")
        ret = x;
    else if (x.tp$str !== undefined)
    {
        ret = x.tp$str();
        if (!(ret instanceof Sk.builtin.str)) throw new Sk.builtin.ValueError("__str__ didn't return a str");
        return ret;
    }
    else 
        return Sk.misceval.objectRepr(x);

    // interning required for strings in py
    if (Object.prototype.hasOwnProperty.call(interned, "1"+ret)) // note, have to use Object to avoid __proto__, etc. failing
    {
        return interned["1"+ret];
    }

    this.__class__ = Sk.builtin.str;
    this.v = ret;
    this["v"] = this.v;
    interned["1"+ret] = this;
    return this;

};
goog.exportSymbol("Sk.builtin.str", Sk.builtin.str);

Sk.builtin.str.$emptystr = new Sk.builtin.str('');

Sk.builtin.str.prototype.mp$subscript = function(index)
{
	index = Sk.builtin.asnum$(index);
    if (typeof index === "number" && Math.floor(index) === index /* not a float*/ )
    {
        if (index < 0) index = this.v.length + index;
        if (index < 0 || index >= this.v.length) throw new Sk.builtin.IndexError("string index out of range");
        return new Sk.builtin.str(this.v.charAt(index));
    }
    else if (index instanceof Sk.builtin.slice)
    {
        var ret = '';
        index.sssiter$(this, function(i, wrt) {
                if (i >= 0 && i < wrt.v.length)
                    ret += wrt.v.charAt(i);
                });
        return new Sk.builtin.str(ret);
    }
    else
        throw new Sk.builtin.TypeError("string indices must be numbers, not " + typeof index);
};

Sk.builtin.str.prototype.sq$length = function()
{
    return this.v.length;
};
Sk.builtin.str.prototype.sq$concat = function(other) 
{ 
    if (!other || !Sk.builtin.checkString(other))
    {
        var otypename = Sk.abstr.typeName(other);
        throw new Sk.builtin.TypeError("cannot concatenate 'str' and '"
                            + otypename + "' objects");
    }
    return new Sk.builtin.str(this.v + other.v); 
};
Sk.builtin.str.prototype.nb$add = Sk.builtin.str.prototype.sq$concat;
Sk.builtin.str.prototype.nb$inplace_add = Sk.builtin.str.prototype.sq$concat;
Sk.builtin.str.prototype.sq$repeat = function(n)
{
    if (!Sk.builtin.checkInt(n)) {
        throw new Sk.builtin.TypeError("can't multiply sequence by non-int of type '" + Sk.abstr.typeName(n) +"'");
    }

    n = Sk.builtin.asnum$(n);
    var ret = "";
    for (var i = 0; i < n; ++i)
        ret += this.v;
    return new Sk.builtin.str(ret);
};
Sk.builtin.str.prototype.nb$multiply = Sk.builtin.str.prototype.sq$repeat;
Sk.builtin.str.prototype.nb$inplace_multiply = Sk.builtin.str.prototype.sq$repeat;
Sk.builtin.str.prototype.sq$item = function() { goog.asserts.fail(); };
Sk.builtin.str.prototype.sq$slice = function(i1, i2)
{
	i1 = Sk.builtin.asnum$(i1);
	i2 = Sk.builtin.asnum$(i2);
    if (i1 < 0) i1 = 0;
    return new Sk.builtin.str(this.v.substr(i1, i2 - i1));
};

Sk.builtin.str.prototype.sq$contains = function(ob) {
    if ( ob.v === undefined || ob.v.constructor != String) {
        throw new Sk.builtin.TypeError("TypeError: 'In <string> requires string as left operand");
    }
    if (this.v.indexOf(ob.v) != -1) {
        return true;
    } else {
        return false;
    }
}

Sk.builtin.str.prototype.tp$name = "str";
Sk.builtin.str.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;
Sk.builtin.str.prototype.tp$iter = function()
{
    var ret =
    {
        tp$iter: function() { return ret; },
        $obj: this,
        $index: 0,
        tp$iternext: function()
        {
            // todo; StopIteration
            if (ret.$index >= ret.$obj.v.length) return undefined;
           return new Sk.builtin.str(ret.$obj.v.substr(ret.$index++, 1));
        }
    };
    return ret;
};

Sk.builtin.str.prototype.tp$richcompare = function(other, op)
{
    if (!(other instanceof Sk.builtin.str)) return undefined;

    switch (op)
    {
        case 'Lt': return this.v < other.v;
        case 'LtE': return this.v <= other.v;
        case 'Eq': return this.v === other.v;
        case 'NotEq': return this.v !== other.v;
        case 'Gt': return this.v > other.v;
        case 'GtE': return this.v >= other.v;
        default:
            goog.asserts.fail();
    }
};

Sk.builtin.str.prototype['$r'] = function()
{
    // single is preferred
    var quote = "'";
    if (this.v.indexOf("'") !== -1 && this.v.indexOf('"') === -1)
    {
        quote = '"';
    }
    var len = this.v.length;
    var ret = quote;
    for (var i = 0; i < len; ++i)
    {
        var c = this.v.charAt(i);
        if (c === quote || c === '\\')
            ret += '\\' + c;
        else if (c === '\t')
            ret += '\\t';
        else if (c === '\n')
            ret += '\\n';
        else if (c === '\r')
            ret += '\\r';
        else if (c < ' ' || c >= 0x7f)
        {
            var ashex = c.charCodeAt(0).toString(16);
            if (ashex.length < 2) ashex = "0" + ashex;
            ret += "\\x" + ashex;
        }
        else
            ret += c;
    }
    ret += quote;
    return new Sk.builtin.str(ret);
};


Sk.builtin.str.re_escape_ = function(s)
{
    var ret = [];
	var re = /^[A-Za-z0-9]+$/;
    for (var i = 0; i < s.length; ++i)
    {
        var c = s.charAt(i);

        if (re.test(c))
        {
            ret.push(c);
        }
        else
        {
            if (c === "\\000")
                ret.push("\\000");
            else
                ret.push("\\" + c);
        }
    }
    return ret.join('');
};

Sk.builtin.str.prototype['lower'] = new Sk.builtin.func(function(self)
{
    Sk.builtin.pyCheckArgs("lower", arguments, 1, 1);
    return new Sk.builtin.str(self.v.toLowerCase());
});

Sk.builtin.str.prototype['upper'] = new Sk.builtin.func(function(self)
{
    Sk.builtin.pyCheckArgs("upper", arguments, 1, 1);
    return new Sk.builtin.str(self.v.toUpperCase());
});

Sk.builtin.str.prototype['capitalize'] = new Sk.builtin.func(function(self)
{
    Sk.builtin.pyCheckArgs("capitalize", arguments, 1, 1);
    var orig = self.v;
    var cap;
    var i;

    if (orig.length === 0) {
        return new Sk.builtin.str("");
    };

    cap = orig.charAt(0).toUpperCase();

    for (i = 1; i < orig.length; i++) {
        cap += orig.charAt(i).toLowerCase();
    };
        
    return new Sk.builtin.str(cap);
});

Sk.builtin.str.prototype['join'] = new Sk.builtin.func(function(self, seq)
{
    Sk.builtin.pyCheckArgs("join", arguments, 2, 2);
    Sk.builtin.pyCheckType("seq", "iterable", Sk.builtin.checkIterable(seq));
    var arrOfStrs = [];
    for (var it = seq.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
    {
        if (i.constructor !== Sk.builtin.str) throw "TypeError: sequence item " + arrOfStrs.length + ": expected string, " + typeof i + " found";
        arrOfStrs.push(i.v);
    }
    return new Sk.builtin.str(arrOfStrs.join(self.v));
});

Sk.builtin.str.prototype['split'] = new Sk.builtin.func(function(self, on, howmany)
{
    Sk.builtin.pyCheckArgs("split", arguments, 1, 3);
    if ((on === undefined) || (on instanceof Sk.builtin.none)) {
        on = null;
    }
    if ((on !== null) && !Sk.builtin.checkString(on)) { 
        throw new Sk.builtin.TypeError("expected a string");
    }
    if ((on !== null) && on.v === "") {
        throw new Sk.builtin.ValueError("empty separator");
    }
    if ((howmany !== undefined) && !Sk.builtin.checkInt(howmany)) {
        throw new Sk.builtin.TypeError("an integer is required");
    }

    howmany = Sk.builtin.asnum$(howmany);
    var regex = /[\s]+/g;
    var str = self.v;
    if (on === null) {
        str = str.trimLeft();
    } else {
	// Escape special characters in "on" so we can use a regexp
	var s = on.v.replace(/([.*+?=|\\\/()\[\]\{\}^$])/g, "\\$1");
        regex = new RegExp(s, "g");
    }

    // This is almost identical to re.split, 
    // except how the regexp is constructed

    var result = [];
    var match;
    var index = 0;
    var splits = 0;
    while ((match = regex.exec(str)) != null) {
        if (match.index === regex.lastIndex) {
            // empty match
            break;
        }
        result.push(new Sk.builtin.str(str.substring(index, match.index)));
        index = regex.lastIndex;
        splits += 1;
        if (howmany && (splits >= howmany)) {
            break;
        }
    }
    str = str.substring(index);
    if (on !== null || (str.length > 0)) {
        result.push(new Sk.builtin.str(str));
    }

    return new Sk.builtin.list(result);
});

Sk.builtin.str.prototype['strip'] = new Sk.builtin.func(function(self, chars)
{
    Sk.builtin.pyCheckArgs("strip", arguments, 1, 2);
    if ((chars !== undefined) && !Sk.builtin.checkString(chars)) {
	throw new Sk.builtin.TypeError("strip arg must be None or str");
    }
    var pattern;
    if (chars === undefined) {
	pattern =  /^\s+|\s+$/g;
    }
    else {
	var regex = Sk.builtin.str.re_escape_(chars.v);
	pattern = new RegExp("^["+regex+"]+|["+regex+"]+$","g");
    }
    return new Sk.builtin.str(self.v.replace(pattern, ''));
});

Sk.builtin.str.prototype['lstrip'] = new Sk.builtin.func(function(self, chars)
{
    Sk.builtin.pyCheckArgs("lstrip", arguments, 1, 2);
    if ((chars !== undefined) && !Sk.builtin.checkString(chars)) {
	throw new Sk.builtin.TypeError("lstrip arg must be None or str");
    }
    var pattern;
    if (chars === undefined) {
	pattern =  /^\s+/g;
    }
    else {
	var regex = Sk.builtin.str.re_escape_(chars.v);
	pattern = new RegExp("^["+regex+"]+","g");
    }
    return new Sk.builtin.str(self.v.replace(pattern, ''));
});

Sk.builtin.str.prototype['rstrip'] = new Sk.builtin.func(function(self, chars)
{
    Sk.builtin.pyCheckArgs("rstrip", arguments, 1, 2);
    if ((chars !== undefined) && !Sk.builtin.checkString(chars)) {
	throw new Sk.builtin.TypeError("rstrip arg must be None or str");
    }
    var pattern;
    if (chars === undefined) {
	pattern =  /\s+$/g;
    }
    else {
	var regex = Sk.builtin.str.re_escape_(chars.v);
	pattern = new RegExp("["+regex+"]+$","g");
    }
    return new Sk.builtin.str(self.v.replace(pattern, ''));
});

Sk.builtin.str.prototype['partition'] = new Sk.builtin.func(function(self, sep)
{
    Sk.builtin.pyCheckArgs("partition", arguments, 2, 2);
    Sk.builtin.pyCheckType("sep", "string", Sk.builtin.checkString(sep));
    var sepStr = new Sk.builtin.str(sep);
    var pos = self.v.indexOf(sepStr.v);
    if (pos < 0)
    {
        return new Sk.builtin.tuple([self, Sk.builtin.str.$emptystr, Sk.builtin.str.$emptystr]);
    }

    return new Sk.builtin.tuple([
        new Sk.builtin.str(self.v.substring(0, pos)),
        sepStr,
        new Sk.builtin.str(self.v.substring(pos + sepStr.v.length))]);
});

Sk.builtin.str.prototype['rpartition'] = new Sk.builtin.func(function(self, sep)
{
    Sk.builtin.pyCheckArgs("rpartition", arguments, 2, 2);
    Sk.builtin.pyCheckType("sep", "string", Sk.builtin.checkString(sep));
    var sepStr = new Sk.builtin.str(sep);
    var pos = self.v.lastIndexOf(sepStr.v);
    if (pos < 0)
    {
        return new Sk.builtin.tuple([Sk.builtin.str.$emptystr, Sk.builtin.str.$emptystr, self]);
    }

    return new Sk.builtin.tuple([
        new Sk.builtin.str(self.v.substring(0, pos)),
        sepStr,
        new Sk.builtin.str(self.v.substring(pos + sepStr.v.length))]);
});

Sk.builtin.str.prototype['count'] = new Sk.builtin.func(function(self, pat, start, end) {
    Sk.builtin.pyCheckArgs("count", arguments, 2, 4);
    if (!Sk.builtin.checkString(pat)) {
	throw new Sk.builtin.TypeError("expected a character buffer object");
    }
    if ((start !== undefined) && !Sk.builtin.checkInt(start)) {
	throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");
    }
    if ((end !== undefined) && !Sk.builtin.checkInt(end)) {
	throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");
    }

    if (start === undefined)
	start = 0;
    else {
	start = Sk.builtin.asnum$(start);
	start = start >= 0 ? start : self.v.length + start;
    }

    if (end === undefined)
	end = self.v.length;
    else {
	end = Sk.builtin.asnum$(end);
	end = end >= 0 ? end : self.v.length + end;
    }

    var m = new RegExp(pat.v,'g');
    var slice = self.v.slice(start,end);
    var ctl = slice.match(m)
    if (! ctl) {
        return  new Sk.builtin.nmber(0, Sk.builtin.nmber.int$);
    } else {
        return new Sk.builtin.nmber(ctl.length, Sk.builtin.nmber.int$);
    }
    
});

Sk.builtin.str.prototype['ljust'] = new Sk.builtin.func(function(self, len, fillchar) {
    Sk.builtin.pyCheckArgs("ljust", arguments, 2, 3);
    if (!Sk.builtin.checkInt(len)) {
	throw new Sk.builtin.TypeError("integer argument exepcted, got "
				       + Sk.abstr.typeName(len));
    }
    if ((fillchar !== undefined) && (!Sk.builtin.checkString(fillchar)
				     || fillchar.v.length !== 1)) {
	throw new Sk.builtin.TypeError("must be char, not "
				       + Sk.abstr.typeName(fillchar))
    }
    if (fillchar === undefined) {
	fillchar = " ";
    } else {
	fillchar = fillchar.v;
    }
	len = Sk.builtin.asnum$(len);
    if (self.v.length >= len) {
        return self;
    } else {
        var newstr = Array.prototype.join.call({length:Math.floor(len-self.v.length)+1},fillchar);
        return new Sk.builtin.str(self.v+newstr);
    }
});

Sk.builtin.str.prototype['rjust'] = new Sk.builtin.func(function(self, len, fillchar) {
    Sk.builtin.pyCheckArgs("rjust", arguments, 2, 3);
    if (!Sk.builtin.checkInt(len)) {
	throw new Sk.builtin.TypeError("integer argument exepcted, got "
				       + Sk.abstr.typeName(len));
    }
    if ((fillchar !== undefined) && (!Sk.builtin.checkString(fillchar)
				     || fillchar.v.length !== 1)) {
	throw new Sk.builtin.TypeError("must be char, not "
				       + Sk.abstr.typeName(fillchar))
    }
    if (fillchar === undefined) {
	fillchar = " ";
    } else {
	fillchar = fillchar.v;
    }
	len = Sk.builtin.asnum$(len);
    if (self.v.length >= len) {
        return self;
    } else {
        var newstr = Array.prototype.join.call({length:Math.floor(len-self.v.length)+1},fillchar);
        return new Sk.builtin.str(newstr+self.v);
    }

});

Sk.builtin.str.prototype['center'] = new Sk.builtin.func(function(self, len, fillchar) {
    Sk.builtin.pyCheckArgs("center", arguments, 2, 3);
    if (!Sk.builtin.checkInt(len)) {
	throw new Sk.builtin.TypeError("integer argument exepcted, got "
				       + Sk.abstr.typeName(len));
    }
    if ((fillchar !== undefined) && (!Sk.builtin.checkString(fillchar)
				     || fillchar.v.length !== 1)) {
	throw new Sk.builtin.TypeError("must be char, not "
				       + Sk.abstr.typeName(fillchar))
    }
    if (fillchar === undefined) {
	fillchar = " ";
    } else {
	fillchar = fillchar.v;
    }
	len = Sk.builtin.asnum$(len);
    if (self.v.length >= len) {
        return self;
    } else {
        var newstr1 = Array.prototype.join.call({length:Math.floor((len-self.v.length)/2)+1},fillchar);
        var newstr = newstr1+self.v+newstr1;
        if (newstr.length < len ) {
            newstr = newstr + fillchar
        }
        return new Sk.builtin.str(newstr);
    }

});

Sk.builtin.str.prototype['find'] = new Sk.builtin.func(function(self, tgt, start, end) {
    Sk.builtin.pyCheckArgs("find", arguments, 2, 4);
    if (!Sk.builtin.checkString(tgt)) {
	throw new Sk.builtin.TypeError("expected a character buffer object");
    }
    if ((start !== undefined) && !Sk.builtin.checkInt(start)) {
	throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");
    }
    if ((end !== undefined) && !Sk.builtin.checkInt(end)) {
	throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");
    }

    if (start === undefined)
	start = 0;
    else {
	start = Sk.builtin.asnum$(start);
	start = start >= 0 ? start : self.v.length + start;
    }

    if (end === undefined)
	end = self.v.length;
    else {
	end = Sk.builtin.asnum$(end);
	end = end >= 0 ? end : self.v.length + end;
    }

    var idx = self.v.indexOf(tgt.v, start);
    idx = ((idx >= start) && (idx < end)) ? idx : -1;

    return new Sk.builtin.nmber(idx, Sk.builtin.nmber.int$);
});

Sk.builtin.str.prototype['index'] = new Sk.builtin.func(function(self, tgt, start, end) {
    Sk.builtin.pyCheckArgs("index", arguments, 2, 4);
    var idx = Sk.misceval.callsim(self['find'], self, tgt, start, end);
    if (Sk.builtin.asnum$(idx) === -1) {
        throw new Sk.builtin.ValueError("substring not found");
    };
    return idx;
});

Sk.builtin.str.prototype['rfind'] = new Sk.builtin.func(function(self, tgt, start, end) {
    Sk.builtin.pyCheckArgs("rfind", arguments, 2, 4);
    if (!Sk.builtin.checkString(tgt)) {
	throw new Sk.builtin.TypeError("expected a character buffer object");
    }
    if ((start !== undefined) && !Sk.builtin.checkInt(start)) {
	throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");
    }
    if ((end !== undefined) && !Sk.builtin.checkInt(end)) {
	throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");
    }

    if (start === undefined)
	start = 0;
    else {
	start = Sk.builtin.asnum$(start);
	start = start >= 0 ? start : self.v.length + start;
    }

    if (end === undefined)
	end = self.v.length;
    else {
	end = Sk.builtin.asnum$(end);
	end = end >= 0 ? end : self.v.length + end;
    }

    var idx = self.v.lastIndexOf(tgt.v, end);
    idx = (idx !== end) ? idx : self.v.lastIndexOf(tgt.v, end-1);
    idx = ((idx >= start) && (idx < end)) ? idx : -1;

    return new Sk.builtin.nmber(idx, Sk.builtin.nmber.int$);
});

Sk.builtin.str.prototype['rindex'] = new Sk.builtin.func(function(self, tgt, start, end) {
    Sk.builtin.pyCheckArgs('rindex', arguments, 2, 4);
    var idx = Sk.misceval.callsim(self['rfind'], self, tgt, start, end);
    if (Sk.builtin.asnum$(idx) === -1) {
        throw new Sk.builtin.ValueError("substring not found");
    };
    return idx;
});

Sk.builtin.str.prototype['startswith'] = new Sk.builtin.func(function(self, tgt) {
    Sk.builtin.pyCheckArgs("startswith", arguments, 2, 2);
    Sk.builtin.pyCheckType("tgt", "string", Sk.builtin.checkString(tgt));
    return Sk.builtin.bool(0 == self.v.indexOf(tgt.v));
});

// http://stackoverflow.com/questions/280634/endswith-in-javascript
Sk.builtin.str.prototype['endswith'] = new Sk.builtin.func(function(self, tgt) {
    Sk.builtin.pyCheckArgs("endswith", arguments, 2, 2);
    Sk.builtin.pyCheckType("tgt", "string", Sk.builtin.checkString(tgt));
    return Sk.builtin.bool(self.v.indexOf(tgt.v, self.v.length - tgt.v.length) !== -1);
});

Sk.builtin.str.prototype['replace'] = new Sk.builtin.func(function(self, oldS, newS, count)
{
    Sk.builtin.pyCheckArgs("replace", arguments, 3, 4);
    Sk.builtin.pyCheckType("oldS", "string", Sk.builtin.checkString(oldS));
    Sk.builtin.pyCheckType("newS", "string", Sk.builtin.checkString(newS));
    if ((count !== undefined) && !Sk.builtin.checkInt(count)) {
	throw new Sk.builtin.TypeError("integer argument expected, got " +
				       Sk.abstr.typeName(count));
    }
    count = Sk.builtin.asnum$(count);
    var patt = new RegExp(Sk.builtin.str.re_escape_(oldS.v), "g");

    if ((count === undefined) || (count < 0)) {
	return new Sk.builtin.str(self.v.replace(patt, newS.v));
    }

    var c = 0;
    function replacer(match) {
	c++;
	if (c <= count) {
	    return newS.v;
	}
	return match;
    }
    return new Sk.builtin.str(self.v.replace(patt, replacer));
});

Sk.builtin.str.prototype['isdigit'] = new Sk.builtin.func(function(self) {
    Sk.builtin.pyCheckArgs("isdigit", arguments, 1, 1);
    if (self.v.length === 0) { return Sk.builtin.bool(false); }
    var i;
    for (i=0; i<self.v.length; i++) {
        var ch = self.v.charAt(i);
        if (ch < '0' || ch > '9') {
            return Sk.builtin.bool(false);
        };
    };
    return Sk.builtin.bool(true);
});

Sk.builtin.str.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('str', Sk.builtin.str);

Sk.builtin.str.prototype.nb$remainder = function(rhs)
{
    // % format op. rhs can be a value, a tuple, or something with __getitem__ (dict)

    // From http://docs.python.org/library/stdtypes.html#string-formatting the
    // format looks like:
    // 1. The '%' character, which marks the start of the specifier.
    // 2. Mapping key (optional), consisting of a parenthesised sequence of characters (for example, (somename)).
    // 3. Conversion flags (optional), which affect the result of some conversion types.
    // 4. Minimum field width (optional). If specified as an '*' (asterisk), the actual width is read from the next element of the tuple in values, and the object to convert comes after the minimum field width and optional precision.
    // 5. Precision (optional), given as a '.' (dot) followed by the precision. If specified as '*' (an asterisk), the actual width is read from the next element of the tuple in values, and the value to convert comes after the precision.
    // 6. Length modifier (optional).
    // 7. Conversion type.
    //
    // length modifier is ignored

    if (rhs.constructor !== Sk.builtin.tuple && (rhs.mp$subscript === undefined || rhs.constructor === Sk.builtin.str)) rhs = new Sk.builtin.tuple([rhs]);

    // general approach is to use a regex that matches the format above, and
    // do an re.sub with a function as replacement to make the subs.

    //           1 2222222222222222   33333333   444444444   5555555555555  66666  777777777777777777
    var regex = /%(\([a-zA-Z0-9]+\))?([#0 +\-]+)?(\*|[0-9]+)?(\.(\*|[0-9]+))?[hlL]?([diouxXeEfFgGcrs%])/g;
    var index = 0;
    var replFunc = function(substring, mappingKey, conversionFlags, fieldWidth, precision, precbody, conversionType)
    {
		fieldWidth = Sk.builtin.asnum$(fieldWidth);
		precision  = Sk.builtin.asnum$(precision);

        var i;
        if (mappingKey === undefined || mappingKey === "" ) i = index++; // ff passes '' not undef for some reason

        var zeroPad = false;
        var leftAdjust = false;
        var blankBeforePositive = false;
        var precedeWithSign = false;
        var alternateForm = false;
        if (conversionFlags)
        {
            if (conversionFlags.indexOf("-") !== -1) leftAdjust = true;
            else if (conversionFlags.indexOf("0") !== -1) zeroPad = true;

            if (conversionFlags.indexOf("+") !== -1) precedeWithSign = true;
            else if (conversionFlags.indexOf(" ") !== -1) blankBeforePositive = true;

            alternateForm = conversionFlags.indexOf("#") !== -1;
        }

        if (precision)
        {
            precision = parseInt(precision.substr(1), 10);
        }

        var formatNumber = function(n, base)
        {
			base = Sk.builtin.asnum$(base);
            var j;
            var r;
            var neg = false;
            var didSign = false;
            if (typeof n === "number")
            {
                if (n < 0)
                {
                    n = -n;
                    neg = true;
                }
                r = n.toString(base);
            }
            else if (n instanceof Sk.builtin.nmber)
            {
                r = n.str$(base, false);
				if (r.length > 2 && r.substr(-2) === ".0")
					r = r.substr(0, r.length - 2);
                neg = n.nb$isnegative();
            }
            else if (n instanceof Sk.builtin.lng)
            {
                r = n.str$(base, false);
                neg = n.nb$isnegative();	//	neg = n.size$ < 0;	RNL long.js change
            }

            goog.asserts.assert(r !== undefined, "unhandled number format");

            var precZeroPadded = false;

            if (precision)
            {
                //print("r.length",r.length,"precision",precision);
                for (j = r.length; j < precision; ++j)
                {
                    r = '0' + r;
                    precZeroPadded = true;
                }
            }

            var prefix = '';

            if (neg) prefix = "-";
            else if (precedeWithSign) prefix = "+" + prefix;
            else if (blankBeforePositive) prefix = " " + prefix;

            if (alternateForm)
            {
                if (base === 16) prefix += '0x';
                else if (base === 8 && !precZeroPadded && r !== "0") prefix += '0';
            }

            return [prefix, r];
        };

        var handleWidth = function(args)
        {
            var prefix = args[0];
            var r = args[1];
            var j;
            if (fieldWidth)
            {
                fieldWidth = parseInt(fieldWidth, 10);
                var totLen = r.length + prefix.length;
                if (zeroPad)
                    for (j = totLen; j < fieldWidth; ++j)
                        r = '0' + r;
                else if (leftAdjust)
                    for (j = totLen; j < fieldWidth; ++j)
                        r = r + ' ';
                else
                    for (j = totLen; j < fieldWidth; ++j)
                        prefix = ' ' + prefix;
            }
            return prefix + r;
        };

        var value;
        //print("Rhs:",rhs, "ctor", rhs.constructor);
        if (rhs.constructor === Sk.builtin.tuple)
        {
            value = rhs.v[i];
        }
        else if (rhs.mp$subscript !== undefined)
        {
            var mk = mappingKey.substring(1, mappingKey.length - 1);
            //print("mk",mk);
            value = rhs.mp$subscript(new Sk.builtin.str(mk));
        }
        else throw new Sk.builtin.AttributeError(rhs.tp$name + " instance has no attribute 'mp$subscript'");
        var r;
        var base = 10;
        switch (conversionType)
        {
            case 'd':
            case 'i':
                return handleWidth(formatNumber(value, 10));
            case 'o':
                return handleWidth(formatNumber(value, 8));
            case 'x':
                return handleWidth(formatNumber(value, 16));
            case 'X':
                return handleWidth(formatNumber(value, 16)).toUpperCase();

            case 'f':
            case 'F':
            case 'e':
            case 'E':
            case 'g':
            case 'G':
				var convValue = Sk.builtin.asnum$(value);
				if (typeof convValue === "string")
					convValue = Number(convValue);
				if (convValue === Infinity)
					return "inf";
				if (convValue === -Infinity)
					return "-inf";
				if (isNaN(convValue))
					return "nan";
                var convName = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(conversionType.toLowerCase())];
				if (precision === undefined || precision === "")
					if (conversionType === 'e' || conversionType === 'E')
						precision = 6;
					else if (conversionType === 'f' || conversionType === 'F')
						precision = 7;
                var result = (convValue)[convName](precision);
                if ('EFG'.indexOf(conversionType) !== -1) result = result.toUpperCase();
                // todo; signs etc.
                return handleWidth(['', result]);

            case 'c':
                if (typeof value === "number")
                    return String.fromCharCode(value);
                else if (value instanceof Sk.builtin.nmber)
                    return String.fromCharCode(value.v);
                else if (value instanceof Sk.builtin.lng)
                    return String.fromCharCode(value.str$(10,false)[0]);
                else if (value.constructor === Sk.builtin.str)
                    return value.v.substr(0, 1);
                else
                    throw new Sk.builtin.TypeError("an integer is required");
                break; // stupid lint

            case 'r':
                r = Sk.builtin.repr(value);
                if (precision) return r.v.substr(0, precision);
                return r.v;
            case 's':
                //print("value",value);
                //print("replace:");
                //print("  index", index);
                //print("  substring", substring);
                //print("  mappingKey", mappingKey);
                //print("  conversionFlags", conversionFlags);
                //print("  fieldWidth", fieldWidth);
                //print("  precision", precision);
                //print("  conversionType", conversionType);
                r = new Sk.builtin.str(value);
                if (precision) return r.v.substr(0, precision);
                return r.v;
            case '%':
                return '%';
        }
    };
    
    var ret = this.v.replace(regex, replFunc);
    return new Sk.builtin.str(ret);
};
/**
 * @constructor
 * @param {Array.<Object>|Object} L
 */
Sk.builtin.tuple = function(L)
{
    if (!(this instanceof Sk.builtin.tuple)) return new Sk.builtin.tuple(L);

    if (L === undefined)
    {
        L = [];
    }

    if (Object.prototype.toString.apply(L) === '[object Array]')
    {
        this.v = L;
    }
    else
    {
        if (L.tp$iter)
        {
            this.v = [];
            for (var it = L.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
                this.v.push(i);
        }
        else
            throw new Sk.builtin.ValueError("expecting Array or iterable");        
    }

    this.__class__ = Sk.builtin.tuple;

    this["v"] = this.v;
    return this;
};

Sk.builtin.tuple.prototype.tp$name = "tuple";
Sk.builtin.tuple.prototype['$r'] = function()
{
    if (this.v.length === 0) return new Sk.builtin.str("()");
    var bits = [];
    for (var i = 0; i < this.v.length; ++i)
    {
        bits[i] = Sk.misceval.objectRepr(this.v[i]).v;
    }
    var ret = bits.join(', ');
    if (this.v.length === 1) ret += ",";
    return new Sk.builtin.str("(" + ret + ")");
};

Sk.builtin.tuple.prototype.mp$subscript = function(index)
{
    if (Sk.misceval.isIndex(index))
    {
	var i = Sk.misceval.asIndex(index);
	if (i !== undefined)
	{
            if (i < 0) i = this.v.length + i;
            if (i < 0 || i >= this.v.length) {
		throw new Sk.builtin.IndexError("tuple index out of range");
	    }
            return this.v[i];
	}
    }
    else if (index instanceof Sk.builtin.slice)
    {
        var ret = [];
        index.sssiter$(this, function(i, wrt)
                {
                    ret.push(wrt.v[i]);
                });
        return new Sk.builtin.tuple(ret);
    }

    throw new Sk.builtin.TypeError("tuple indices must be integers, not " + Sk.abstr.typeName(index));
};

// todo; the numbers and order are taken from python, but the answer's
// obviously not the same because there's no int wrapping. shouldn't matter,
// but would be nice to make the hash() values the same if it's not too
// expensive to simplify tests.
Sk.builtin.tuple.prototype.tp$hash = function()
{
    var mult = 1000003;
    var x = 0x345678;
    var len = this.v.length;
    for (var i = 0; i < len; ++i)
    {
        var y = Sk.builtin.hash(this.v[i]).v;
        if (y === -1) return new Sk.builtin.nmber(-1, Sk.builtin.nmber.int$);
        x = (x ^ y) * mult;
        mult += 82520 + len + len;
    }
    x += 97531;
    if (x === -1) x = -2;
    return new Sk.builtin.nmber(x, Sk.builtin.nmber.int$);
};

Sk.builtin.tuple.prototype.sq$repeat = function(n)
{
    n = Sk.builtin.asnum$(n);
    var ret = [];
    for (var i = 0; i < n; ++i)
        for (var j = 0; j < this.v.length; ++ j)
            ret.push(this.v[j]);
    return new Sk.builtin.tuple(ret);
};
Sk.builtin.tuple.prototype.nb$multiply = Sk.builtin.tuple.prototype.sq$repeat;
Sk.builtin.tuple.prototype.nb$inplace_multiply = Sk.builtin.tuple.prototype.sq$repeat;


Sk.builtin.tuple.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('tuple', Sk.builtin.tuple);

Sk.builtin.tuple.prototype.tp$iter = function()
{
    var ret =
    {
        tp$iter: function() { return ret; },
        $obj: this,
        $index: 0,
        tp$iternext: function()
        {
            // todo; StopIteration
            if (ret.$index >= ret.$obj.v.length) return undefined;
            return ret.$obj.v[ret.$index++];
        }
    };
    return ret;
};

Sk.builtin.tuple.prototype['__iter__'] = new Sk.builtin.func(function(self)
{
    Sk.builtin.pyCheckArgs("__iter__", arguments, 1, 1);

    return self.tp$iter();
});

Sk.builtin.tuple.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;

Sk.builtin.tuple.prototype.tp$richcompare = function(w, op)
{
    //print("  tup rc", JSON.stringify(this.v), JSON.stringify(w), op);
        
    // w not a tuple
    if (!w.__class__ || w.__class__ != Sk.builtin.tuple)
    {
        // shortcuts for eq/not
        if (op === 'Eq') return false;
        if (op === 'NotEq') return true;

        // todo; other types should have an arbitrary order
        return false;
    }

    var v = this.v;
    var w = w.v;
    var vl = v.length;
    var wl = w.length;

    var i;
    for (i = 0; i < vl && i < wl; ++i)
    {
        var k = Sk.misceval.richCompareBool(v[i], w[i], 'Eq');
        if (!k) break;
    }

    if (i >= vl || i >= wl)
    {
        // no more items to compare, compare sizes
        switch (op)
        {
            case 'Lt': return vl < wl;
            case 'LtE': return vl <= wl;
            case 'Eq': return vl === wl;
            case 'NotEq': return vl !== wl;
            case 'Gt': return vl > wl;
            case 'GtE': return vl >= wl;
            default: goog.asserts.fail();
        }
    }

    // we have an item that's different

    // shortcuts for eq/not
    if (op === 'Eq') return false;
    if (op === 'NotEq') return true;

    // or, compare the differing element using the proper operator
    //print("  tup rcb end", i, v[i] instanceof Sk.builtin.str, JSON.stringify(v[i]), w[i] instanceof Sk.builtin.str, JSON.stringify(w[i]), op);
    return Sk.misceval.richCompareBool(v[i], w[i], op);
};

Sk.builtin.tuple.prototype.sq$concat = function(other)
{
    return new Sk.builtin.tuple(this.v.concat(other.v));
};

Sk.builtin.tuple.prototype.nb$add = Sk.builtin.tuple.prototype.sq$concat;
Sk.builtin.tuple.prototype.nb$inplace_add = Sk.builtin.tuple.prototype.sq$concat;

Sk.builtin.tuple.prototype.sq$length = function() { return this.v.length; };


Sk.builtin.tuple.prototype['index'] = new Sk.builtin.func(function(self, item)
{
    var len = self.v.length;
    var obj = self.v;
    for (var i = 0; i < len; ++i)
    {
        if (Sk.misceval.richCompareBool(obj[i], item, "Eq"))
            return Sk.builtin.assk$(i, Sk.builtin.nmber.int$);
    }
    throw new Sk.builtin.ValueError("tuple.index(x): x not in tuple");
});

Sk.builtin.tuple.prototype['count'] = new Sk.builtin.func(function(self, item)
{
    var len = self.v.length;
    var obj = self.v;
    var count = 0;
    for (var i = 0; i < len; ++i)
    {
        if (Sk.misceval.richCompareBool(obj[i], item, "Eq"))
        {
            count += 1;
        }
    }
    return  new Sk.builtin.nmber(count, Sk.builtin.nmber.int$);
});

goog.exportSymbol("Sk.builtin.tuple", Sk.builtin.tuple);
/**
 * @constructor
 * @param {Array.<Object>} L
 */
Sk.builtin.dict = function dict(L)
{
    if (!(this instanceof Sk.builtin.dict)) return new Sk.builtin.dict(L);

    if (L === undefined)
    {
        L = [];
    }

    this.size = 0;

    if (Object.prototype.toString.apply(L) === '[object Array]')
    {
        // Handle dictionary literals
        for (var i = 0; i < L.length; i += 2)
        {
            this.mp$ass_subscript(L[i], L[i+1]);
        }
    }
    else if (L instanceof Sk.builtin.dict) {
        // Handle calls of type "dict(mapping)" from Python code
        for (var it = L.tp$iter(), k = it.tp$iternext();
             k !== undefined;
             k = it.tp$iternext())
        {
            var v = L.mp$subscript(k);
            if (v === undefined)
            {
                //print(k, "had undefined v");
                v = null;
            }
            this.mp$ass_subscript(k, v);
        }
    }
    else if (L.tp$iter)
    {
        // Handle calls of type "dict(iterable)" from Python code
        for (var it = L.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
        {
            if (i.mp$subscript)
            {
                this.mp$ass_subscript(i.mp$subscript(0), i.mp$subscript(1));
            }
            else
            {
                throw new Sk.builtin.TypeError("element " + this.size + " is not a sequence");    
            }
        }
    }
    else
    {
        throw new Sk.builtin.TypeError("object is not iterable");
    }

    this.__class__ = Sk.builtin.dict;

    return this;
};

Sk.builtin.dict.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('dict', Sk.builtin.dict);

var kf = Sk.builtin.hash;

Sk.builtin.dict.prototype.key$lookup = function(bucket, key)
{
    var item;
    var eq;
    var i;

    for (i=0; i<bucket.items.length; i++)
    {
        item = bucket.items[i];
        eq = Sk.misceval.richCompareBool(item.lhs, key, 'Eq');
        if (eq)
        {
            return item;
        }
    }
    
    return null;
}   

Sk.builtin.dict.prototype.key$pop = function(bucket, key)
{
    var item;
    var eq;
    var i;

    for (i=0; i<bucket.items.length; i++)
    {
        item = bucket.items[i];
        eq = Sk.misceval.richCompareBool(item.lhs, key, 'Eq');
        if (eq)
        {
            bucket.items.splice(i, 1);
            this.size -= 1;
            return item;
        }
    }
    return undefined;    
}

// Perform dictionary lookup, either return value or undefined if key not in dictionary
Sk.builtin.dict.prototype.mp$lookup = function(key)
{
    var k = kf(key);
    var bucket = this[k.v];
    var item;

    // todo; does this need to go through mp$ma_lookup

    if (bucket !== undefined)
    {
        item = this.key$lookup(bucket, key);
        if (item) {
            return item.rhs;
        };
    }

    // Not found in dictionary     
    return undefined;
}

Sk.builtin.dict.prototype.mp$subscript = function(key)
{
    var res = this.mp$lookup(key);

    if (res !== undefined)
    {
        // Found in dictionary
        return res;
    }
    else
    {
        // Not found in dictionary
        var s = new Sk.builtin.str(key);
        throw new Sk.builtin.KeyError(s.v);
    }
};

Sk.builtin.dict.prototype.sq$contains = function(ob)
{
    var res = this.mp$lookup(ob);

    return (res !== undefined);
}

Sk.builtin.dict.prototype.mp$ass_subscript = function(key, w)
{
    var k = kf(key);
    var bucket = this[k.v];
    var item;

    if (bucket === undefined)
    {
        // New bucket
        bucket = {$hash: k, items: [{lhs: key, rhs: w}]};
        this[k.v] = bucket;
        this.size += 1;
        return;
    }

    item = this.key$lookup(bucket, key);
    if (item) {
        item.rhs = w;
        return;
    }

    // Not found in dictionary
    bucket.items.push({lhs: key, rhs: w});
    this.size += 1;
};

Sk.builtin.dict.prototype.mp$del_subscript = function(key)
{
    var k = kf(key);
    var bucket = this[k.v];
    var item;
    var s;

    // todo; does this need to go through mp$ma_lookup

    if (bucket !== undefined)
    {
        item = this.key$pop(bucket, key);
        if (item !== undefined) {
            return;
        };
    }

    // Not found in dictionary     
    s = new Sk.builtin.str(key);
    throw new Sk.builtin.KeyError(s.v);    
}

Sk.builtin.dict.prototype.tp$iter = function()
{
    var allkeys = [];
    for (var k in this)
    {
        if (this.hasOwnProperty(k))
        {
            var bucket = this[k];
            if (bucket && bucket.$hash !== undefined) // skip internal stuff. todo; merge pyobj and this
            {
                for (var i=0; i<bucket.items.length; i++)
                {
                    allkeys.push(bucket.items[i].lhs);
                }
            }
        }
    }
    //print(allkeys);

    var ret =
    {
        tp$iter: function() { return ret; },
        $obj: this,
        $index: 0,
        $keys: allkeys,
        tp$iternext: function()
        {
            // todo; StopIteration
            if (ret.$index >= ret.$keys.length) return undefined;
            return ret.$keys[ret.$index++];
            // return ret.$obj[ret.$keys[ret.$index++]].lhs;
        }
    };
    return ret;
};

Sk.builtin.dict.prototype['__iter__'] = new Sk.builtin.func(function(self)
{
    Sk.builtin.pyCheckArgs("__iter__", arguments, 1, 1);

    return self.tp$iter();
});

Sk.builtin.dict.prototype['$r'] = function()
{
    var ret = [];
    for (var iter = this.tp$iter(), k = iter.tp$iternext();
            k !== undefined;
            k = iter.tp$iternext())
    {
        var v = this.mp$subscript(k);
        if (v === undefined)
        {
            //print(k, "had undefined v");
            v = null;
        }
        ret.push(Sk.misceval.objectRepr(k).v + ": " + Sk.misceval.objectRepr(v).v);
    }
    return new Sk.builtin.str("{" + ret.join(", ") + "}");
};

Sk.builtin.dict.prototype.mp$length = function() { return this.size; };

Sk.builtin.dict.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;
Sk.builtin.dict.prototype.tp$hash = Sk.builtin.object.prototype.HashNotImplemented;

Sk.builtin.dict.prototype.tp$richcompare = function(other, op)
{
    // if the comparison allows for equality then short-circuit it here
    if (this === other && Sk.misceval.opAllowsEquality(op))
        return true;

    // Only support Eq and NotEq comparisons
    switch (op)
    {
        case 'Lt': return undefined;
        case 'LtE': return undefined;
        case 'Eq': break;
        case 'NotEq': break;
        case 'Gt': return undefined;
        case 'GtE': return undefined;
        default:
            goog.asserts.fail();
    }

    if (!(other instanceof Sk.builtin.dict)) {
        if (op === 'Eq') {
            return false;
        } else {
            return true;
        }
    }

    var thisl = this.size;
    var otherl = other.size;

    if (thisl !== otherl) {
        if (op === 'Eq') {
            return false;
        } else {
            return true;
        }
    }

    for (var iter = this.tp$iter(), k = iter.tp$iternext();
            k !== undefined;
            k = iter.tp$iternext())
    {
        var v = this.mp$subscript(k);
        var otherv = other.mp$subscript(k);

        if (!Sk.misceval.richCompareBool(v, otherv, 'Eq'))
        {
            if (op === 'Eq') {
                return false;
            } else {
                return true;
            }            
        }
    }

    if (op === 'Eq') {
        return true;
    } else {
        return false;
    }                
}

Sk.builtin.dict.prototype['get'] = new Sk.builtin.func(function(self, k, d)
{
    var ret;

    if (d === undefined) {
        d = Sk.builtin.none.none$;
    }

    ret = self.mp$lookup(k);
    if (ret === undefined)
    {
        ret = d;
    }

    return ret;
});

Sk.builtin.dict.prototype['pop'] = new Sk.builtin.func(function(self, key, d)
{
    var k = kf(key);
    var bucket = self[k.v];
    var item;
    var s;

    // todo; does this need to go through mp$ma_lookup
    if (bucket !== undefined)
    {
        item = self.key$pop(bucket, key);
        if (item !== undefined) {
            return item.rhs;
        };
    }

    // Not found in dictionary     
    if (d !== undefined) {
	return d;
    }

    s = new Sk.builtin.str(key);
    throw new Sk.builtin.KeyError(s.v);    
});

Sk.builtin.dict.prototype['has_key'] = new Sk.builtin.func(function(self, k)
{
    return Sk.builtin.bool(self.sq$contains(k));
});

Sk.builtin.dict.prototype['items'] = new Sk.builtin.func(function(self)
{
    var ret = [];

    for (var iter = self.tp$iter(), k = iter.tp$iternext();
            k !== undefined;
            k = iter.tp$iternext())
    {
        var v = self.mp$subscript(k);
        if (v === undefined)
        {
            //print(k, "had undefined v");
            v = null;
        }
        ret.push(new Sk.builtin.tuple([k, v]));
    }
    return new Sk.builtin.list(ret);
});

Sk.builtin.dict.prototype['keys'] = new Sk.builtin.func(function(self)
{
    var ret = [];

    for (var iter = self.tp$iter(), k = iter.tp$iternext();
            k !== undefined;
            k = iter.tp$iternext())
    {
        ret.push(k);
    }
    return new Sk.builtin.list(ret);
});

Sk.builtin.dict.prototype['values'] = new Sk.builtin.func(function(self)
{
    var ret = [];

    for (var iter = self.tp$iter(), k = iter.tp$iternext();
            k !== undefined;
            k = iter.tp$iternext())
    {
        var v = self.mp$subscript(k);
        if (v === undefined)
        {
            v = null;
        }
        ret.push(v);
    }
    return new Sk.builtin.list(ret);
});

Sk.builtin.dict.prototype.tp$name = "dict";

goog.exportSymbol("Sk.builtin.dict", Sk.builtin.dict);

/*

$.prototype.clear = function() { throw "todo; dict.clear"; };
$.prototype.copy = function() { throw "todo; dict.copy"; };
$.prototype.fromkeys = function() { throw "todo; dict.fromkeys"; };
$.prototype.get = function() { throw "todo; dict.get"; };

$.prototype.has_key = function(key)
{
	return this.hasOwnProperty(kf(key));
};

$.prototype.items = function() { throw "todo; dict.items"; };
$.prototype.iteritems = function() { throw "todo; dict.iteritems"; };
$.prototype.iterkeys = function() { throw "todo; dict.iterkeys"; };
$.prototype.itervalues = function() { throw "todo; dict.itervalues"; };
$.prototype.keys = function() { throw "todo; dict.keys"; };
$.prototype.pop = function() { throw "todo; dict.pop"; };
$.prototype.popitem = function() { throw "todo; dict.popitem"; };
$.prototype.setdefault = function() { throw "todo; dict.setdefault"; };
$.prototype.update = function() { throw "todo; dict.update"; };
$.prototype.values = function() { throw "todo; dict.values"; };

$.prototype.__getitem__ = function(key)
{
    var entry = this[kf(key)];
    return typeof entry === 'undefined' ? undefined : entry.rhs;
};

$.prototype.__delitem__ = function(key)
{
    var k = kf(key);

    if (this.hasOwnProperty(k))
    {
        this.size -= 1;
        delete this[k];
    }

    return this;
};

$.prototype.__class__ = new Sk.builtin.type('dict', [Sk.types.object], {});

$.prototype.__iter__ = function()
{
    var allkeys = [];
    for (var k in this)
    {
        if (this.hasOwnProperty(k))
        {
            var i = this[k];
            if (i && i.hasOwnProperty('lhs')) // skip internal stuff. todo; merge pyobj and this
            {
                allkeys.push(k);
            }
        }
    }
    //print(allkeys);

    var ret =
    {
        __iter__: function() { return ret; },
        $obj: this,
        $index: 0,
        $keys: allkeys,
        next: function()
        {
            // todo; StopIteration
            if (ret.$index >= ret.$keys.length) return undefined;
            return ret.$obj[ret.$keys[ret.$index++]].lhs;
        }
    };
    return ret;
};
*/
/**
 * @fileoverview
 * @suppress {checkTypes}
 */

/*
 * Basic JavaScript BN library - subset useful for RSA encryption.
 * 
 * Copyright (c) 2003-2005  Tom Wu
 * All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
 *
 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * In addition, the following condition applies:
 *
 * All redistributions must retain an intact copy of this copyright notice
 * and disclaimer.
 */


// (public) Constructor
/**
 * @constructor
 * @param {number|string|null} a
 * @param {number=} b
 * @param {*=} c
 */
Sk.builtin.biginteger = function(a,b,c) {
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// Bits per digit
//Sk.builtin.biginteger.dbits;

// JavaScript engine analysis
Sk.builtin.biginteger.canary = 0xdeadbeefcafe;
Sk.builtin.biginteger.j_lm = ((Sk.builtin.biginteger.canary&0xffffff)==0xefcafe);

// return new, unset Sk.builtin.biginteger
Sk.builtin.biginteger.nbi = function() { return new Sk.builtin.biginteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
Sk.builtin.biginteger.prototype.am1 = function(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this[i++]+w[j]+c;
    c = Math.floor(v/0x4000000);
    w[j++] = v&0x3ffffff;
  }
  return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
Sk.builtin.biginteger.prototype.am2 = function(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this[i]&0x7fff;
    var h = this[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
Sk.builtin.biginteger.prototype.am3 = function(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this[i]&0x3fff;
    var h = this[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w[j++] = l&0xfffffff;
  }
  return c;
}

// We need to select the fastest one that works in this environment. 
//if (Sk.builtin.biginteger.j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
//	Sk.builtin.biginteger.prototype.am = am2;
//	Sk.builtin.biginteger.dbits = 30;
//} else if (Sk.builtin.biginteger.j_lm && (navigator.appName != "Netscape")) {
//	Sk.builtin.biginteger.prototype.am = am1;
//	Sk.builtin.biginteger.dbits = 26;
//} else { // Mozilla/Netscape seems to prefer am3
//	Sk.builtin.biginteger.prototype.am = am3;
//	Sk.builtin.biginteger.dbits = 28;
//}

// For node.js, we pick am3 with max Sk.builtin.biginteger.dbits to 28.
Sk.builtin.biginteger.prototype.am = Sk.builtin.biginteger.prototype.am3;
Sk.builtin.biginteger.dbits = 28;

Sk.builtin.biginteger.prototype.DB = Sk.builtin.biginteger.dbits;
Sk.builtin.biginteger.prototype.DM = ((1<<Sk.builtin.biginteger.dbits)-1);
Sk.builtin.biginteger.prototype.DV = (1<<Sk.builtin.biginteger.dbits);

Sk.builtin.biginteger.BI_FP = 52;
Sk.builtin.biginteger.prototype.FV = Math.pow(2,Sk.builtin.biginteger.BI_FP);
Sk.builtin.biginteger.prototype.F1 = Sk.builtin.biginteger.BI_FP-Sk.builtin.biginteger.dbits;
Sk.builtin.biginteger.prototype.F2 = 2*Sk.builtin.biginteger.dbits-Sk.builtin.biginteger.BI_FP;

// Digit conversions
Sk.builtin.biginteger.BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
Sk.builtin.biginteger.BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) Sk.builtin.biginteger.BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) Sk.builtin.biginteger.BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) Sk.builtin.biginteger.BI_RC[rr++] = vv;

Sk.builtin.biginteger.int2char = function(n) { return Sk.builtin.biginteger.BI_RM.charAt(n); }
Sk.builtin.biginteger.intAt = function(s,i) {
  var c = Sk.builtin.biginteger.BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
Sk.builtin.biginteger.prototype.bnpCopyTo = function(r) {
  for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
Sk.builtin.biginteger.prototype.bnpFromInt = function(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this[0] = x;
  else if(x < -1) this[0] = x+this.DV;
  else this.t = 0;
}

// return bigint initialized to value
Sk.builtin.biginteger.nbv = function(i) { var r = new Sk.builtin.biginteger(null); r.bnpFromInt(i);  return r; }

// (protected) set from string and radix
Sk.builtin.biginteger.prototype.bnpFromString = function(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:Sk.builtin.biginteger.intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this[this.t++] = x;
    else if(sh+k > this.DB) {
      this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this[this.t++] = (x>>(this.DB-sh));
    }
    else
      this[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) Sk.builtin.biginteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
Sk.builtin.biginteger.prototype.bnpClamp = function() {
  var c = this.s&this.DM;
  while(this.t > 0 && this[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
Sk.builtin.biginteger.prototype.bnToString = function(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = Sk.builtin.biginteger.int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this[i]&((1<<p)-1))<<(k-p);
        d |= this[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += Sk.builtin.biginteger.int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
Sk.builtin.biginteger.prototype.bnNegate = function() { var r = Sk.builtin.biginteger.nbi(); Sk.builtin.biginteger.ZERO.subTo(this,r); return r; }

// (public) |this|
Sk.builtin.biginteger.prototype.bnAbs = function() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
Sk.builtin.biginteger.prototype.bnCompareTo = function(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return (this.s<0)?-r:r;
  while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
Sk.builtin.biginteger.nbits = function(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
Sk.builtin.biginteger.prototype.bnBitLength = function() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+Sk.builtin.biginteger.nbits(this[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
Sk.builtin.biginteger.prototype.bnpDLShiftTo = function(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
  for(i = n-1; i >= 0; --i) r[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
Sk.builtin.biginteger.prototype.bnpDRShiftTo = function(n,r) {
  for(var i = n; i < this.t; ++i) r[i-n] = this[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
Sk.builtin.biginteger.prototype.bnpLShiftTo = function(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r[i+ds+1] = (this[i]>>cbs)|c;
    c = (this[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
Sk.builtin.biginteger.prototype.bnpRShiftTo = function(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r[0] = this[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r[i-ds-1] |= (this[i]&bm)<<cbs;
    r[i-ds] = this[i]>>bs;
  }
  if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
Sk.builtin.biginteger.prototype.bnpSubTo = function(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]-a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r[i++] = this.DV+c;
  else if(c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
Sk.builtin.biginteger.prototype.bnpMultiplyTo = function(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) Sk.builtin.biginteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
Sk.builtin.biginteger.prototype.bnpSquareTo = function(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x[i],r,2*i,0,1);
    if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r[i+x.t] -= x.DV;
      r[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
Sk.builtin.biginteger.prototype.bnpDivRemTo = function(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = Sk.builtin.biginteger.nbi();
  var y = Sk.builtin.biginteger.nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-Sk.builtin.biginteger.nbits(pm[pm.t-1]);	// normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?Sk.builtin.biginteger.nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t,r);
  }
  Sk.builtin.biginteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y);	// "negative" y so we can replace sub with am later
  while(y.t < ys) y[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
    if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) Sk.builtin.biginteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
  if(ts < 0) Sk.builtin.biginteger.ZERO.subTo(r,r);
}

// (public) this mod a
Sk.builtin.biginteger.prototype.bnMod = function(a) {
  var r = Sk.builtin.biginteger.nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(Sk.builtin.biginteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
/**
 * @constructor
 * @extends Sk.builtin.biginteger
 */
Sk.builtin.biginteger.Classic = function(m) { this.m = m; }
Sk.builtin.biginteger.prototype.cConvert = function(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
Sk.builtin.biginteger.prototype.cRevert = function(x) { return x; }
Sk.builtin.biginteger.prototype.cReduce = function(x) { x.divRemTo(this.m,null,x); }
Sk.builtin.biginteger.prototype.cMulTo  = function(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
Sk.builtin.biginteger.prototype.cSqrTo  = function(x,r) { x.squareTo(r); this.reduce(r); }

Sk.builtin.biginteger.Classic.prototype.convert = Sk.builtin.biginteger.prototype.cConvert;
Sk.builtin.biginteger.Classic.prototype.revert = Sk.builtin.biginteger.prototype.cRevert;
Sk.builtin.biginteger.Classic.prototype.reduce = Sk.builtin.biginteger.prototype.cReduce;
Sk.builtin.biginteger.Classic.prototype.mulTo = Sk.builtin.biginteger.prototype.cMulTo;
Sk.builtin.biginteger.Classic.prototype.sqrTo = Sk.builtin.biginteger.prototype.cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
Sk.builtin.biginteger.prototype.bnpInvDigit = function() {
  if(this.t < 1) return 0;
  var x = this[0];
  if((x&1) == 0) return 0;
  var y = x&3;		// y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^Sk.builtin.biginteger.dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Sk.builtin.Montgomery reduction
/**
 * @constructor
 * @extends Sk.builtin.biginteger
 */
Sk.builtin.biginteger.Montgomery = function(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
Sk.builtin.biginteger.prototype.montConvert = function(x) {
  var r = Sk.builtin.biginteger.nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(Sk.builtin.biginteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
Sk.builtin.biginteger.prototype.montRevert = function(x) {
  var r = Sk.builtin.biginteger.nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
Sk.builtin.biginteger.prototype.montReduce = function(x) {
  while(x.t <= this.mt2)	// pad x so am has enough room later
    x[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
Sk.builtin.biginteger.prototype.montSqrTo = function(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
Sk.builtin.biginteger.prototype.montMulTo = function(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Sk.builtin.biginteger.Montgomery.prototype.convert = Sk.builtin.biginteger.prototype.montConvert;
Sk.builtin.biginteger.Montgomery.prototype.revert = Sk.builtin.biginteger.prototype.montRevert;
Sk.builtin.biginteger.Montgomery.prototype.reduce = Sk.builtin.biginteger.prototype.montReduce;
Sk.builtin.biginteger.Montgomery.prototype.mulTo = Sk.builtin.biginteger.prototype.montMulTo;
Sk.builtin.biginteger.Montgomery.prototype.sqrTo = Sk.builtin.biginteger.prototype.montSqrTo;

// (protected) true iff this is even
Sk.builtin.biginteger.prototype.bnpIsEven = function() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
Sk.builtin.biginteger.prototype.bnpExp = function(e,z) {
  if(e > 0xffffffff || e < 1) return Sk.builtin.biginteger.ONE;
  var r = Sk.builtin.biginteger.nbi(), r2 = Sk.builtin.biginteger.nbi(), g = z.convert(this), i = Sk.builtin.biginteger.nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
Sk.builtin.biginteger.prototype.bnModPowInt = function(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Sk.builtin.biginteger.Classic(m); else z = new Sk.builtin.biginteger.Montgomery(m);
  return this.exp(e,z);
}

// protected
Sk.builtin.biginteger.prototype.copyTo = Sk.builtin.biginteger.prototype.bnpCopyTo;
Sk.builtin.biginteger.prototype.fromInt = Sk.builtin.biginteger.prototype.bnpFromInt;
Sk.builtin.biginteger.prototype.fromString = Sk.builtin.biginteger.prototype.bnpFromString;
Sk.builtin.biginteger.prototype.clamp = Sk.builtin.biginteger.prototype.bnpClamp;
Sk.builtin.biginteger.prototype.dlShiftTo = Sk.builtin.biginteger.prototype.bnpDLShiftTo;
Sk.builtin.biginteger.prototype.drShiftTo = Sk.builtin.biginteger.prototype.bnpDRShiftTo;
Sk.builtin.biginteger.prototype.lShiftTo = Sk.builtin.biginteger.prototype.bnpLShiftTo;
Sk.builtin.biginteger.prototype.rShiftTo = Sk.builtin.biginteger.prototype.bnpRShiftTo;
Sk.builtin.biginteger.prototype.subTo = Sk.builtin.biginteger.prototype.bnpSubTo;
Sk.builtin.biginteger.prototype.multiplyTo = Sk.builtin.biginteger.prototype.bnpMultiplyTo;
Sk.builtin.biginteger.prototype.squareTo = Sk.builtin.biginteger.prototype.bnpSquareTo;
Sk.builtin.biginteger.prototype.divRemTo = Sk.builtin.biginteger.prototype.bnpDivRemTo;
Sk.builtin.biginteger.prototype.invDigit = Sk.builtin.biginteger.prototype.bnpInvDigit;
Sk.builtin.biginteger.prototype.isEven = Sk.builtin.biginteger.prototype.bnpIsEven;
Sk.builtin.biginteger.prototype.exp = Sk.builtin.biginteger.prototype.bnpExp;

// public
Sk.builtin.biginteger.prototype.toString = Sk.builtin.biginteger.prototype.bnToString;
Sk.builtin.biginteger.prototype.negate = Sk.builtin.biginteger.prototype.bnNegate;
Sk.builtin.biginteger.prototype.abs = Sk.builtin.biginteger.prototype.bnAbs;
Sk.builtin.biginteger.prototype.compareTo = Sk.builtin.biginteger.prototype.bnCompareTo;
Sk.builtin.biginteger.prototype.bitLength = Sk.builtin.biginteger.prototype.bnBitLength;
Sk.builtin.biginteger.prototype.mod = Sk.builtin.biginteger.prototype.bnMod;
Sk.builtin.biginteger.prototype.modPowInt = Sk.builtin.biginteger.prototype.bnModPowInt;

// "constants"
Sk.builtin.biginteger.ZERO = Sk.builtin.biginteger.nbv(0);
Sk.builtin.biginteger.ONE = Sk.builtin.biginteger.nbv(1);

//Copyright (c) 2005-2009  Tom Wu
//All Rights Reserved.
//See "LICENSE" for details.

//Extended JavaScript BN functions, required for RSA private ops.

//Version 1.1: new Sk.builtin.biginteger("0", 10) returns "proper" zero

//(public)
Sk.builtin.biginteger.prototype.bnClone = function() { var r = Sk.builtin.biginteger.nbi(); this.copyTo(r); return r; }

//(public) return value as integer
Sk.builtin.biginteger.prototype.bnIntValue = function() {
if(this.s < 0) {
 if(this.t == 1) return this[0]-this.DV;
 else if(this.t == 0) return -1;
}
else if(this.t == 1) return this[0];
else if(this.t == 0) return 0;
// assumes 16 < DB < 32
return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
}

//(public) return value as byte
Sk.builtin.biginteger.prototype.bnByteValue = function() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

//(public) return value as short (assumes DB>=16)
Sk.builtin.biginteger.prototype.bnShortValue = function() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

//(protected) return x s.t. r^x < DV
Sk.builtin.biginteger.prototype.bnpChunkSize = function(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

//(public) 0 if this == 0, 1 if this > 0
Sk.builtin.biginteger.prototype.bnSigNum = function() {
if(this.s < 0) return -1;
else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
else return 1;
}

//(protected) convert to radix string
Sk.builtin.biginteger.prototype.bnpToRadix = function(b) {
if(b == null) b = 10;
if(this.signum() == 0 || b < 2 || b > 36) return "0";
var cs = this.chunkSize(b);
var a = Math.pow(b,cs);
var d = Sk.builtin.biginteger.nbv(a), y = Sk.builtin.biginteger.nbi(), z = Sk.builtin.biginteger.nbi(), r = "";
this.divRemTo(d,y,z);
while(y.signum() > 0) {
 r = (a+z.intValue()).toString(b).substr(1) + r;
 y.divRemTo(d,y,z);
}
return z.intValue().toString(b) + r;
}

//(protected) convert from radix string
Sk.builtin.biginteger.prototype.bnpFromRadix = function(s,b) {
this.fromInt(0);
if(b == null) b = 10;
var cs = this.chunkSize(b);
var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
for(var i = 0; i < s.length; ++i) {
 var x = Sk.builtin.biginteger.intAt(s,i);
 if(x < 0) {
   if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
   if(s.charAt(i) == ".") break;
   continue;
 }
 w = b*w+x;
 if(++j >= cs) {
   this.dMultiply(d);
   this.dAddOffset(w,0);
   j = 0;
   w = 0;
 }
}
if(j > 0) {
 this.dMultiply(Math.pow(b,j));
 this.dAddOffset(w,0);
}
if(mi) Sk.builtin.biginteger.ZERO.subTo(this,this);
}

//(protected) alternate constructor
Sk.builtin.biginteger.prototype.bnpFromNumber = function(a,b,c) {
if("number" == typeof b) {
 // new Sk.builtin.biginteger(int,int,RNG)
 if(a < 2) this.fromInt(1);
 else {
   this.fromNumber(a,c);
   if(!this.testBit(a-1))	// force MSB set
     this.bitwiseTo(Sk.builtin.biginteger.ONE.shiftLeft(a-1),Sk.builtin.biginteger.op_or,this);
   if(this.isEven()) this.dAddOffset(1,0); // force odd
   while(!this.isProbablePrime(b)) {
     this.dAddOffset(2,0);
     if(this.bitLength() > a) this.subTo(Sk.builtin.biginteger.ONE.shiftLeft(a-1),this);
   }
 }
}
//	Constructor to support Java BigInteger random generation.  Forget it.
   this.fromString(a+"");
//else {
// // new Sk.builtin.biginteger(int,RNG)
// var x = new Array(), t = a&7;
// x.length = (a>>3)+1;
// b.nextBytes(x);
// if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
// this.fromString(x,256);
//}
}

//(public) convert to bigendian byte array
Sk.builtin.biginteger.prototype.bnToByteArray = function() {
var i = this.t, r = new Array();
r[0] = this.s;
var p = this.DB-(i*this.DB)%8, d, k = 0;
if(i-- > 0) {
 if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
   r[k++] = d|(this.s<<(this.DB-p));
 while(i >= 0) {
   if(p < 8) {
     d = (this[i]&((1<<p)-1))<<(8-p);
     d |= this[--i]>>(p+=this.DB-8);
   }
   else {
     d = (this[i]>>(p-=8))&0xff;
     if(p <= 0) { p += this.DB; --i; }
   }
   if((d&0x80) != 0) d |= -256;
   if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
   if(k > 0 || d != this.s) r[k++] = d;
 }
}
return r;
}

Sk.builtin.biginteger.prototype.bnEquals = function(a) { return(this.compareTo(a)==0); }
Sk.builtin.biginteger.prototype.bnMin = function(a) { return(this.compareTo(a)<0)?this:a; }
Sk.builtin.biginteger.prototype.bnMax = function(a) { return(this.compareTo(a)>0)?this:a; }

//(protected) r = this op a (bitwise)
Sk.builtin.biginteger.prototype.bnpBitwiseTo = function(a,op,r) {
var i, f, m = Math.min(a.t,this.t);
for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
if(a.t < this.t) {
 f = a.s&this.DM;
 for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
 r.t = this.t;
}
else {
 f = this.s&this.DM;
 for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
 r.t = a.t;
}
r.s = op(this.s,a.s);
r.clamp();
}

//(public) this & a
Sk.builtin.biginteger.op_and = function(x,y) { return x&y; }
Sk.builtin.biginteger.prototype.bnAnd = function(a) { var r = Sk.builtin.biginteger.nbi(); this.bitwiseTo(a,Sk.builtin.biginteger.op_and,r); return r; }

//(public) this | a
Sk.builtin.biginteger.op_or = function(x,y) { return x|y; }
Sk.builtin.biginteger.prototype.bnOr = function(a) { var r = Sk.builtin.biginteger.nbi(); this.bitwiseTo(a,Sk.builtin.biginteger.op_or,r); return r; }

//(public) this ^ a
Sk.builtin.biginteger.op_xor = function(x,y) { return x^y; }
Sk.builtin.biginteger.prototype.bnXor = function(a) { var r = Sk.builtin.biginteger.nbi(); this.bitwiseTo(a,Sk.builtin.biginteger.op_xor,r); return r; }

//(public) this & ~a
Sk.builtin.biginteger.op_andnot = function(x,y) { return x&~y; }
Sk.builtin.biginteger.prototype.bnAndNot = function(a) { var r = Sk.builtin.biginteger.nbi(); this.bitwiseTo(a,Sk.builtin.biginteger.op_andnot,r); return r; }

//(public) ~this
Sk.builtin.biginteger.prototype.bnNot = function() {
var r = Sk.builtin.biginteger.nbi();
for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
r.t = this.t;
r.s = ~this.s;
return r;
}

//(public) this << n
Sk.builtin.biginteger.prototype.bnShiftLeft = function(n) {
var r = Sk.builtin.biginteger.nbi();
if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
return r;
}

//(public) this >> n
Sk.builtin.biginteger.prototype.bnShiftRight = function(n) {
var r = Sk.builtin.biginteger.nbi();
if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
return r;
}

//return index of lowest 1-bit in x, x < 2^31
Sk.builtin.biginteger.lbit = function(x) {
if(x == 0) return -1;
var r = 0;
if((x&0xffff) == 0) { x >>= 16; r += 16; }
if((x&0xff) == 0) { x >>= 8; r += 8; }
if((x&0xf) == 0) { x >>= 4; r += 4; }
if((x&3) == 0) { x >>= 2; r += 2; }
if((x&1) == 0) ++r;
return r;
}

//(public) returns index of lowest 1-bit (or -1 if none)
Sk.builtin.biginteger.prototype.bnGetLowestSetBit = function() {
for(var i = 0; i < this.t; ++i)
 if(this[i] != 0) return i*this.DB+Sk.builtin.biginteger.lbit(this[i]);
if(this.s < 0) return this.t*this.DB;
return -1;
}

//return number of 1 bits in x
Sk.builtin.biginteger.cbit = function(x) {
var r = 0;
while(x != 0) { x &= x-1; ++r; }
return r;
}

//(public) return number of set bits
Sk.builtin.biginteger.prototype.bnBitCount = function() {
var r = 0, x = this.s&this.DM;
for(var i = 0; i < this.t; ++i) r += Sk.builtin.biginteger.cbit(this[i]^x);
return r;
}

//(public) true iff nth bit is set
Sk.builtin.biginteger.prototype.bnTestBit = function(n) {
var j = Math.floor(n/this.DB);
if(j >= this.t) return(this.s!=0);
return((this[j]&(1<<(n%this.DB)))!=0);
}

//(protected) this op (1<<n)
Sk.builtin.biginteger.prototype.bnpChangeBit = function(n,op) {
var r = Sk.builtin.biginteger.ONE.shiftLeft(n);
this.bitwiseTo(r,op,r);
return r;
}

//(public) this | (1<<n)
Sk.builtin.biginteger.prototype.bnSetBit = function(n) { return this.changeBit(n,Sk.builtin.biginteger.op_or); }

//(public) this & ~(1<<n)
Sk.builtin.biginteger.prototype.bnClearBit = function(n) { return this.changeBit(n,Sk.builtin.biginteger.op_andnot); }

//(public) this ^ (1<<n)
Sk.builtin.biginteger.prototype.bnFlipBit = function(n) { return this.changeBit(n,Sk.builtin.biginteger.op_xor); }

//(protected) r = this + a
Sk.builtin.biginteger.prototype.bnpAddTo = function(a,r) {
var i = 0, c = 0, m = Math.min(a.t,this.t);
while(i < m) {
 c += this[i]+a[i];
 r[i++] = c&this.DM;
 c >>= this.DB;
}
if(a.t < this.t) {
 c += a.s;
 while(i < this.t) {
   c += this[i];
   r[i++] = c&this.DM;
   c >>= this.DB;
 }
 c += this.s;
}
else {
 c += this.s;
 while(i < a.t) {
   c += a[i];
   r[i++] = c&this.DM;
   c >>= this.DB;
 }
 c += a.s;
}
r.s = (c<0)?-1:0;
if(c > 0) r[i++] = c;
else if(c < -1) r[i++] = this.DV+c;
r.t = i;
r.clamp();
}

//(public) this + a
Sk.builtin.biginteger.prototype.bnAdd = function(a) { var r = Sk.builtin.biginteger.nbi(); this.addTo(a,r); return r; }

//(public) this - a
Sk.builtin.biginteger.prototype.bnSubtract = function(a) { var r = Sk.builtin.biginteger.nbi(); this.subTo(a,r); return r; }

//(public) this * a
Sk.builtin.biginteger.prototype.bnMultiply = function(a) { var r = Sk.builtin.biginteger.nbi(); this.multiplyTo(a,r); return r; }

//(public) this / a
Sk.builtin.biginteger.prototype.bnDivide = function(a) { var r = Sk.builtin.biginteger.nbi(); this.divRemTo(a,r,null); return r; }

//(public) this % a
Sk.builtin.biginteger.prototype.bnRemainder = function(a) { var r = Sk.builtin.biginteger.nbi(); this.divRemTo(a,null,r); return r; }

//(public) [this/a,this%a]
Sk.builtin.biginteger.prototype.bnDivideAndRemainder = function(a) {
var q = Sk.builtin.biginteger.nbi(), r = Sk.builtin.biginteger.nbi();
this.divRemTo(a,q,r);
return new Array(q,r);
}

//(protected) this *= n, this >= 0, 1 < n < DV
Sk.builtin.biginteger.prototype.bnpDMultiply = function(n) {
this[this.t] = this.am(0,n-1,this,0,0,this.t);
++this.t;
this.clamp();
}

//(protected) this += n << w words, this >= 0
Sk.builtin.biginteger.prototype.bnpDAddOffset = function(n,w) {
if(n == 0) return;
while(this.t <= w) this[this.t++] = 0;
this[w] += n;
while(this[w] >= this.DV) {
 this[w] -= this.DV;
 if(++w >= this.t) this[this.t++] = 0;
 ++this[w];
}
}

//A "null" reducer
/**
 * @constructor
 * @extends Sk.builtin.biginteger
 */
Sk.builtin.biginteger.NullExp = function() {}
Sk.builtin.biginteger.prototype.nNop = function(x) { return x; }
Sk.builtin.biginteger.prototype.nMulTo = function(x,y,r) { x.multiplyTo(y,r); }
Sk.builtin.biginteger.prototype.nSqrTo = function(x,r) { x.squareTo(r); }

Sk.builtin.biginteger.NullExp.prototype.convert = Sk.builtin.biginteger.prototype.nNop;
Sk.builtin.biginteger.NullExp.prototype.revert = Sk.builtin.biginteger.prototype.nNop;
Sk.builtin.biginteger.NullExp.prototype.mulTo = Sk.builtin.biginteger.prototype.nMulTo;
Sk.builtin.biginteger.NullExp.prototype.sqrTo = Sk.builtin.biginteger.prototype.nSqrTo;

//(public) this^e
Sk.builtin.biginteger.prototype.bnPow = function(e) { return this.exp(e,new Sk.builtin.biginteger.NullExp()); }

//(protected) r = lower n words of "this * a", a.t <= n
//"this" should be the larger one if appropriate.
Sk.builtin.biginteger.prototype.bnpMultiplyLowerTo = function(a,n,r) {
var i = Math.min(this.t+a.t,n);
r.s = 0; // assumes a,this >= 0
r.t = i;
while(i > 0) r[--i] = 0;
var j;
for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
r.clamp();
}

//(protected) r = "this * a" without lower n words, n > 0
//"this" should be the larger one if appropriate.
Sk.builtin.biginteger.prototype.bnpMultiplyUpperTo = function(a,n,r) {
--n;
var i = r.t = this.t+a.t-n;
r.s = 0; // assumes a,this >= 0
while(--i >= 0) r[i] = 0;
for(i = Math.max(n-this.t,0); i < a.t; ++i)
 r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
r.clamp();
r.drShiftTo(1,r);
}

//Barrett modular reduction
/**
 * @constructor
 * @extends Sk.builtin.biginteger
 */
Sk.builtin.biginteger.Barrett = function(m) {
// setup Barrett
this.r2 = Sk.builtin.biginteger.nbi();
this.q3 = Sk.builtin.biginteger.nbi();
Sk.builtin.biginteger.ONE.dlShiftTo(2*m.t,this.r2);
this.mu = this.r2.divide(m);
this.m = m;
}

Sk.builtin.biginteger.prototype.barrettConvert = function(x) {
if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
else if(x.compareTo(this.m) < 0) return x;
else { var r = Sk.builtin.biginteger.nbi(); x.copyTo(r); this.reduce(r); return r; }
}

Sk.builtin.biginteger.prototype.barrettRevert = function(x) { return x; }

//x = x mod m (HAC 14.42)
Sk.builtin.biginteger.prototype.barrettReduce = function(x) {
x.drShiftTo(this.m.t-1,this.r2);
if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
x.subTo(this.r2,x);
while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

//r = x^2 mod m; x != r
Sk.builtin.biginteger.prototype.barrettSqrTo = function(x,r) { x.squareTo(r); this.reduce(r); }

//r = x*y mod m; x,y != r
Sk.builtin.biginteger.prototype.barrettMulTo = function(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Sk.builtin.biginteger.Barrett.prototype.convert = Sk.builtin.biginteger.prototype.barrettConvert;
Sk.builtin.biginteger.Barrett.prototype.revert = Sk.builtin.biginteger.prototype.barrettRevert;
Sk.builtin.biginteger.Barrett.prototype.reduce = Sk.builtin.biginteger.prototype.barrettReduce;
Sk.builtin.biginteger.Barrett.prototype.mulTo = Sk.builtin.biginteger.prototype.barrettMulTo;
Sk.builtin.biginteger.Barrett.prototype.sqrTo = Sk.builtin.biginteger.prototype.barrettSqrTo;

//(public) this^e % m (HAC 14.85)
Sk.builtin.biginteger.prototype.bnModPow = function(e,m) {
var i = e.bitLength(), k, r = Sk.builtin.biginteger.nbv(1), z;
if(i <= 0) return r;
else if(i < 18) k = 1;
else if(i < 48) k = 3;
else if(i < 144) k = 4;
else if(i < 768) k = 5;
else k = 6;
if(i < 8)
 z = new Sk.builtin.biginteger.Classic(m);
else if(m.isEven())
 z = new Sk.builtin.biginteger.Barrett(m);
else
 z = new Sk.builtin.biginteger.Montgomery(m);

// precomputation
var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
g[1] = z.convert(this);
if(k > 1) {
 var g2 = Sk.builtin.biginteger.nbi();
 z.sqrTo(g[1],g2);
 while(n <= km) {
   g[n] = Sk.builtin.biginteger.nbi();
   z.mulTo(g2,g[n-2],g[n]);
   n += 2;
 }
}

var j = e.t-1, w, is1 = true, r2 = Sk.builtin.biginteger.nbi(), t;
i = Sk.builtin.biginteger.nbits(e[j])-1;
while(j >= 0) {
 if(i >= k1) w = (e[j]>>(i-k1))&km;
 else {
   w = (e[j]&((1<<(i+1))-1))<<(k1-i);
   if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
 }

 n = k;
 while((w&1) == 0) { w >>= 1; --n; }
 if((i -= n) < 0) { i += this.DB; --j; }
 if(is1) {	// ret == 1, don't bother squaring or multiplying it
   g[w].copyTo(r);
   is1 = false;
 }
 else {
   while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
   if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
   z.mulTo(r2,g[w],r);
 }

 while(j >= 0 && (e[j]&(1<<i)) == 0) {
   z.sqrTo(r,r2); t = r; r = r2; r2 = t;
   if(--i < 0) { i = this.DB-1; --j; }
 }
}
return z.revert(r);
}

//(public) gcd(this,a) (HAC 14.54)
Sk.builtin.biginteger.prototype.bnGCD = function(a) {
var x = (this.s<0)?this.negate():this.clone();
var y = (a.s<0)?a.negate():a.clone();
if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
var i = x.getLowestSetBit(), g = y.getLowestSetBit();
if(g < 0) return x;
if(i < g) g = i;
if(g > 0) {
 x.rShiftTo(g,x);
 y.rShiftTo(g,y);
}
while(x.signum() > 0) {
 if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
 if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
 if(x.compareTo(y) >= 0) {
   x.subTo(y,x);
   x.rShiftTo(1,x);
 }
 else {
   y.subTo(x,y);
   y.rShiftTo(1,y);
 }
}
if(g > 0) y.lShiftTo(g,y);
return y;
}

//(protected) this % n, n < 2^26
Sk.builtin.biginteger.prototype.bnpModInt = function(n) {
if(n <= 0) return 0;
var d = this.DV%n, r = (this.s<0)?n-1:0;
if(this.t > 0)
 if(d == 0) r = this[0]%n;
 else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
return r;
}

//(public) 1/this % m (HAC 14.61)
Sk.builtin.biginteger.prototype.bnModInverse = function(m) {
var ac = m.isEven();
if((this.isEven() && ac) || m.signum() == 0) return Sk.builtin.biginteger.ZERO;
var u = m.clone(), v = this.clone();
var a = Sk.builtin.biginteger.nbv(1), b = Sk.builtin.biginteger.nbv(0), c = Sk.builtin.biginteger.nbv(0), d = Sk.builtin.biginteger.nbv(1);
while(u.signum() != 0) {
 while(u.isEven()) {
   u.rShiftTo(1,u);
   if(ac) {
     if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
     a.rShiftTo(1,a);
   }
   else if(!b.isEven()) b.subTo(m,b);
   b.rShiftTo(1,b);
 }
 while(v.isEven()) {
   v.rShiftTo(1,v);
   if(ac) {
     if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
     c.rShiftTo(1,c);
   }
   else if(!d.isEven()) d.subTo(m,d);
   d.rShiftTo(1,d);
 }
 if(u.compareTo(v) >= 0) {
   u.subTo(v,u);
   if(ac) a.subTo(c,a);
   b.subTo(d,b);
 }
 else {
   v.subTo(u,v);
   if(ac) c.subTo(a,c);
   d.subTo(b,d);
 }
}
if(v.compareTo(Sk.builtin.biginteger.ONE) != 0) return Sk.builtin.biginteger.ZERO;
if(d.compareTo(m) >= 0) return d.subtract(m);
if(d.signum() < 0) d.addTo(m,d); else return d;
if(d.signum() < 0) return d.add(m); else return d;
}

Sk.builtin.biginteger.lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509];
Sk.builtin.biginteger.lplim = (1<<26)/Sk.builtin.biginteger.lowprimes[Sk.builtin.biginteger.lowprimes.length-1];

//(public) test primality with certainty >= 1-.5^t
Sk.builtin.biginteger.prototype.bnIsProbablePrime = function(t) {
var i, x = this.abs();
if(x.t == 1 && x[0] <= Sk.builtin.biginteger.lowprimes[Sk.builtin.biginteger.lowprimes.length-1]) {
 for(i = 0; i < Sk.builtin.biginteger.lowprimes.length; ++i)
   if(x[0] == Sk.builtin.biginteger.lowprimes[i]) return true;
 return false;
}
if(x.isEven()) return false;
i = 1;
while(i < Sk.builtin.biginteger.lowprimes.length) {
 var m = Sk.builtin.biginteger.lowprimes[i], j = i+1;
 while(j < Sk.builtin.biginteger.lowprimes.length && m < Sk.builtin.biginteger.lplim) m *= Sk.builtin.biginteger.lowprimes[j++];
 m = x.modInt(m);
 while(i < j) if(m%Sk.builtin.biginteger.lowprimes[i++] == 0) return false;
}
return x.millerRabin(t);
}

//(protected) true if probably prime (HAC 4.24, Miller-Rabin)
Sk.builtin.biginteger.prototype.bnpMillerRabin = function(t) {
var n1 = this.subtract(Sk.builtin.biginteger.ONE);
var k = n1.getLowestSetBit();
if(k <= 0) return false;
var r = n1.shiftRight(k);
t = (t+1)>>1;
if(t > Sk.builtin.biginteger.lowprimes.length) t = Sk.builtin.biginteger.lowprimes.length;
var a = Sk.builtin.biginteger.nbi();
for(var i = 0; i < t; ++i) {
 a.fromInt(Sk.builtin.biginteger.lowprimes[i]);
 var y = a.modPow(r,this);
 if(y.compareTo(Sk.builtin.biginteger.ONE) != 0 && y.compareTo(n1) != 0) {
   var j = 1;
   while(j++ < k && y.compareTo(n1) != 0) {
     y = y.modPowInt(2,this);
     if(y.compareTo(Sk.builtin.biginteger.ONE) == 0) return false;
   }
   if(y.compareTo(n1) != 0) return false;
 }
}
return true;
}

Sk.builtin.biginteger.prototype.isnegative = function() { return this.s < 0; }
Sk.builtin.biginteger.prototype.ispositive = function() { return this.s >= 0; }
Sk.builtin.biginteger.prototype.trueCompare = function(a) {
	if (this.s >= 0 && a.s < 0) return 1;
	if (this.s < 0 && a.s >= 0) return -1;
	return this.compare(a);
}

//protected
Sk.builtin.biginteger.prototype.chunkSize = Sk.builtin.biginteger.prototype.bnpChunkSize;
Sk.builtin.biginteger.prototype.toRadix = Sk.builtin.biginteger.prototype.bnpToRadix;
Sk.builtin.biginteger.prototype.fromRadix = Sk.builtin.biginteger.prototype.bnpFromRadix;
Sk.builtin.biginteger.prototype.fromNumber = Sk.builtin.biginteger.prototype.bnpFromNumber;
Sk.builtin.biginteger.prototype.bitwiseTo = Sk.builtin.biginteger.prototype.bnpBitwiseTo;
Sk.builtin.biginteger.prototype.changeBit = Sk.builtin.biginteger.prototype.bnpChangeBit;
Sk.builtin.biginteger.prototype.addTo = Sk.builtin.biginteger.prototype.bnpAddTo;
Sk.builtin.biginteger.prototype.dMultiply = Sk.builtin.biginteger.prototype.bnpDMultiply;
Sk.builtin.biginteger.prototype.dAddOffset = Sk.builtin.biginteger.prototype.bnpDAddOffset;
Sk.builtin.biginteger.prototype.multiplyLowerTo = Sk.builtin.biginteger.prototype.bnpMultiplyLowerTo;
Sk.builtin.biginteger.prototype.multiplyUpperTo = Sk.builtin.biginteger.prototype.bnpMultiplyUpperTo;
Sk.builtin.biginteger.prototype.modInt = Sk.builtin.biginteger.prototype.bnpModInt;
Sk.builtin.biginteger.prototype.millerRabin = Sk.builtin.biginteger.prototype.bnpMillerRabin;

//public
Sk.builtin.biginteger.prototype.clone = Sk.builtin.biginteger.prototype.bnClone;
Sk.builtin.biginteger.prototype.intValue = Sk.builtin.biginteger.prototype.bnIntValue;
Sk.builtin.biginteger.prototype.byteValue = Sk.builtin.biginteger.prototype.bnByteValue;
Sk.builtin.biginteger.prototype.shortValue = Sk.builtin.biginteger.prototype.bnShortValue;
Sk.builtin.biginteger.prototype.signum = Sk.builtin.biginteger.prototype.bnSigNum;
Sk.builtin.biginteger.prototype.toByteArray = Sk.builtin.biginteger.prototype.bnToByteArray;
Sk.builtin.biginteger.prototype.equals = Sk.builtin.biginteger.prototype.bnEquals;
Sk.builtin.biginteger.prototype.compare = Sk.builtin.biginteger.prototype.compareTo;
Sk.builtin.biginteger.prototype.min = Sk.builtin.biginteger.prototype.bnMin;
Sk.builtin.biginteger.prototype.max = Sk.builtin.biginteger.prototype.bnMax;
Sk.builtin.biginteger.prototype.and = Sk.builtin.biginteger.prototype.bnAnd;
Sk.builtin.biginteger.prototype.or = Sk.builtin.biginteger.prototype.bnOr;
Sk.builtin.biginteger.prototype.xor = Sk.builtin.biginteger.prototype.bnXor;
Sk.builtin.biginteger.prototype.andNot = Sk.builtin.biginteger.prototype.bnAndNot;
Sk.builtin.biginteger.prototype.not = Sk.builtin.biginteger.prototype.bnNot;
Sk.builtin.biginteger.prototype.shiftLeft = Sk.builtin.biginteger.prototype.bnShiftLeft;
Sk.builtin.biginteger.prototype.shiftRight = Sk.builtin.biginteger.prototype.bnShiftRight;
Sk.builtin.biginteger.prototype.getLowestSetBit = Sk.builtin.biginteger.prototype.bnGetLowestSetBit;
Sk.builtin.biginteger.prototype.bitCount = Sk.builtin.biginteger.prototype.bnBitCount;
Sk.builtin.biginteger.prototype.testBit = Sk.builtin.biginteger.prototype.bnTestBit;
Sk.builtin.biginteger.prototype.setBit = Sk.builtin.biginteger.prototype.bnSetBit;
Sk.builtin.biginteger.prototype.clearBit = Sk.builtin.biginteger.prototype.bnClearBit;
Sk.builtin.biginteger.prototype.flipBit = Sk.builtin.biginteger.prototype.bnFlipBit;
Sk.builtin.biginteger.prototype.add = Sk.builtin.biginteger.prototype.bnAdd;
Sk.builtin.biginteger.prototype.subtract = Sk.builtin.biginteger.prototype.bnSubtract;
Sk.builtin.biginteger.prototype.multiply = Sk.builtin.biginteger.prototype.bnMultiply;
Sk.builtin.biginteger.prototype.divide = Sk.builtin.biginteger.prototype.bnDivide;
Sk.builtin.biginteger.prototype.remainder = Sk.builtin.biginteger.prototype.bnRemainder;
Sk.builtin.biginteger.prototype.divideAndRemainder = Sk.builtin.biginteger.prototype.bnDivideAndRemainder;
Sk.builtin.biginteger.prototype.modPow = Sk.builtin.biginteger.prototype.bnModPow;
Sk.builtin.biginteger.prototype.modInverse = Sk.builtin.biginteger.prototype.bnModInverse;
Sk.builtin.biginteger.prototype.pow = Sk.builtin.biginteger.prototype.bnPow;
Sk.builtin.biginteger.prototype.gcd = Sk.builtin.biginteger.prototype.bnGCD;
Sk.builtin.biginteger.prototype.isProbablePrime = Sk.builtin.biginteger.prototype.bnIsProbablePrime;
//Sk.builtin.biginteger.int2char = int2char;

//Sk.builtin.biginteger interfaces not implemented in jsbn:

//Sk.builtin.biginteger(int signum, byte[] magnitude)
//double doubleValue()
//float floatValue()
//int hashCode()
//long longValue()
//static Sk.builtin.biginteger valueOf(long val)

//module.exports = Sk.builtin.biginteger;
// long aka "bignumber" implementation
//
//  Using javascript BigInteger by Tom Wu
/**
 * @constructor
 */
Sk.builtin.nmber = function(x, skType)	/* number is a reserved word */
{
    if (!(this instanceof Sk.builtin.nmber)) return new Sk.builtin.nmber(x, skType);

	if (x instanceof Sk.builtin.str)
		x = x.v;

	if (x instanceof Sk.builtin.nmber) {
		this.v = x.v;
		this.skType = x.skType;
	} else if (typeof x === "number") {
		this.v = x;
		if (skType === undefined) {
			if (x > Sk.builtin.nmber.threshold$ || x < -Sk.builtin.nmber.threshold$ || x % 1 != 0)
				this.skType = Sk.builtin.nmber.float$;
			else
				this.skType = Sk.builtin.nmber.int$;
		} else {
			this.skType = skType;
			if (skType === Sk.builtin.nmber.int$)
			if (x > Sk.builtin.nmber.threshold$ || x < -Sk.builtin.nmber.threshold$)
				return new Sk.builtin.lng(x);
		}
	} else if (typeof x === "string") {
		var result = Sk.numberFromStr(x);
		if (skType !== undefined)
			result.skType = skType;
		if (skType === Sk.builtin.nmber.int$)
			if (result.v > Sk.builtin.nmber.threshold$ || result.v < -Sk.builtin.nmber.threshold$)
				return new Sk.builtin.lng(x);
		return result;
	} else if (x instanceof Sk.builtin.lng) {
		return Sk.numberFromStr(x.str$(10, true));
	} else if (x instanceof Sk.builtin.biginteger) {
		var result = Sk.numberFromStr(x.toString());
		if (skType !== undefined)
			result.skType = skType;
		if (skType === Sk.builtin.nmber.int$)
			if (result.v > Sk.builtin.nmber.threshold$ || result.v < -Sk.builtin.nmber.threshold$)
				return new Sk.builtin.lng(x);
	} else {
		this.v = 0;
		if (skType === undefined)
			this.skType = Sk.builtin.nmber.int$;
		else
			this.skType = skType;
	}

    return this;
};

Sk.builtin.nmber.prototype.tp$index = function()
{
    return this.v;
};

Sk.builtin.nmber.prototype.tp$hash = function()
{
    //the hash of all numbers should be an int and since javascript doesn't really 
    //care every number can be an int.
    return new Sk.builtin.nmber(this.v, Sk.builtin.nmber.int$);
};

Sk.builtin.nmber.prototype.tp$name = "number";
Sk.builtin.nmber.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('number', Sk.builtin.nmber);

//	Threshold to determine when types should be converted to long
Sk.builtin.nmber.threshold$ = Math.pow(2, 53);
Sk.builtin.nmber.float$ = "float";
Sk.builtin.nmber.int$ = "int";

Sk.builtin.nmber.fromInt$ = function(ival)
{
	return new Sk.builtin.nmber(ival, undefined);
};

// js string (not Sk.builtin.str) -> long. used to create longs in transformer, respects
// 0x, 0o, 0b, etc.
Sk.numberFromStr = function(s)
{
	if (s == 'inf')
		return new Sk.builtin.nmber(Infinity, undefined);
	if (s == '-inf')
		return new Sk.builtin.nmber(-Infinity, undefined);

	var res = new Sk.builtin.nmber(0, undefined);

	 if (s.indexOf('.') !== -1
            || s.indexOf('e') !== -1
            || s.indexOf('E') !== -1)
    {
        res.v = parseFloat(s);
		res.skType = Sk.builtin.nmber.float$;
		return res;
    }

    // ugly gunk to placate an overly-nanny closure-compiler:
    // http://code.google.com/p/closure-compiler/issues/detail?id=111
    // this is all just to emulate "parseInt(s)" with no radix.
    var tmp = s;
	var s1;
    if (s.charAt(0) === '-') tmp = s.substr(1);
    if (tmp.charAt(0) === '0' && (tmp.charAt(1) === 'x' || tmp.charAt(1) === 'X'))
        s1 = parseInt(s, 16);
    else if (tmp.charAt(0) === '0' && (tmp.charAt(1) === 'b' || tmp.charAt(1) === 'B'))
        s1 = parseInt(s, 2);
    else if (tmp.charAt(0) === '0')
        s1 = parseInt(s, 8);
    else
        s1 = parseInt(s, 10);

	res.v = s1;
	res.skType = Sk.builtin.nmber.int$;
	return res;
};
goog.exportSymbol("Sk.numberFromStr", Sk.numberFromStr);

Sk.builtin.nmber.prototype.clone = function()
{
	return new Sk.builtin.nmber(this, undefined);
};

Sk.builtin.nmber.prototype.toFixed = function(x) {
	x = Sk.builtin.asnum$(x);
	return this.v.toFixed(x)
}

Sk.builtin.nmber.prototype.nb$add = function(other)
{
	var result;

	if (typeof other === "number")
		other = new Sk.builtin.nmber(other, undefined);
	else if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.nmber) {
		result = new Sk.builtin.nmber(this.v + other.v, undefined);
		if (this.skType === Sk.builtin.nmber.float$ || other.skType === Sk.builtin.nmber.float$)
			result.skType = Sk.builtin.nmber.float$;
		else {
			result.skType = Sk.builtin.nmber.int$;
			if (result.v > Sk.builtin.nmber.threshold$ || result.v < -Sk.builtin.nmber.threshold$) {
				//	Promote to long
				result = new Sk.builtin.lng(this.v).nb$add(other.v);
			}
		}
		return result;
	}

	if (other instanceof Sk.builtin.lng) {
		if (this.skType === Sk.builtin.nmber.float$) {  // float + long --> float
			result = new Sk.builtin.nmber(this.v + parseFloat(other.str$(10, true)), Sk.builtin.nmber.float$);
		} else {	//	int + long --> long
			var thisAsLong = new Sk.builtin.lng(this.v);
			result = thisAsLong.nb$add(other);
		}
		return result;
	}

	return undefined;
};


Sk.builtin.nmber.prototype.nb$subtract = function(other)
{
	var result;

	if (typeof other === "number") {
		other = new Sk.builtin.nmber(other, undefined);
	}
	else if (other instanceof Sk.builtin.bool) {
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);
	}

	if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.nmber) {
		result = new Sk.builtin.nmber(this.v - other.v, undefined);
		if (this.skType === Sk.builtin.nmber.float$ || other.skType === Sk.builtin.nmber.float$)
			result.skType = Sk.builtin.nmber.float$;
		else {
			result.skType = Sk.builtin.nmber.int$;
			if (result.v > Sk.builtin.nmber.threshold$ || result.v < -Sk.builtin.nmber.threshold$) {
				//	Promote to long
				result = new Sk.builtin.lng(this.v).nb$subtract(other.v);
			}
		}
		return result;
	}

	if (other instanceof Sk.builtin.lng) {
		if (this.skType === Sk.builtin.nmber.float$) {  // float + long --> float
			result = new Sk.builtin.nmber(this.v - parseFloat(other.str$(10, true)), Sk.builtin.nmber.float$);
		} else {	//	int - long --> long
			var thisAsLong = new Sk.builtin.lng(this.v);
			result = thisAsLong.nb$subtract(other);
		}
		return result;
	}

	return undefined;
};

Sk.builtin.nmber.prototype.nb$multiply = function(other)
{
	var result;

	if (typeof other === "number")
		other = new Sk.builtin.nmber(other, undefined);
	else if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.nmber) {
		result = new Sk.builtin.nmber(this.v * other.v, undefined);
		if (this.skType === Sk.builtin.nmber.float$ || other.skType === Sk.builtin.nmber.float$)
			result.skType = Sk.builtin.nmber.float$;
		else {
			result.skType = Sk.builtin.nmber.int$;
			if (result.v > Sk.builtin.nmber.threshold$ || result.v < -Sk.builtin.nmber.threshold$) {
				//	Promote to long
				result = new Sk.builtin.lng(this.v).nb$multiply(other.v);
			}
		}
		return result;
	}

	if (other instanceof Sk.builtin.lng) {
		if (this.skType === Sk.builtin.nmber.float$) {  // float + long --> float
			result = new Sk.builtin.nmber(this.v * parseFloat(other.str$(10, true)), Sk.builtin.nmber.float$);
		} else {	//	int - long --> long
			var thisAsLong = new Sk.builtin.lng(this.v);
			result = thisAsLong.nb$multiply(other);
		}
		return result;
	}

	return undefined;
};

Sk.builtin.nmber.prototype.nb$divide = function(other)
{
	var result;

	if (typeof other === "number")
		other = new Sk.builtin.nmber(other, undefined);
	else if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.nmber) {
		if (other.v == 0)
			throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");

		if (this.v === Infinity)
			if (other.v === Infinity || other.v === -Infinity)
				return new Sk.builtin.nmber(NaN, Sk.builtin.nmber.float$);
			else if (other.nb$isnegative())
				return new Sk.builtin.nmber(-Infinity, Sk.builtin.nmber.float$);
			else
				return new Sk.builtin.nmber(Infinity, Sk.builtin.nmber.float$);
		if (this.v === -Infinity)
			if (other.v === Infinity || other.v === -Infinity)
				return new Sk.builtin.nmber(NaN, Sk.builtin.nmber.float$);
			else if (other.nb$isnegative())
				return new Sk.builtin.nmber(Infinity, Sk.builtin.nmber.float$);
			else
				return new Sk.builtin.nmber(-Infinity, Sk.builtin.nmber.float$);

		result = new Sk.builtin.nmber(this.v / other.v, undefined);
		if (this.skType === Sk.builtin.nmber.float$ || other.skType === Sk.builtin.nmber.float$ || Sk.python3)
			result.skType = Sk.builtin.nmber.float$;
		else {
			result.v = Math.floor(result.v);
			result.skType = Sk.builtin.nmber.int$;
			if (result.v > Sk.builtin.nmber.threshold$ || result.v < -Sk.builtin.nmber.threshold$) {
				//	Promote to long
				result = new Sk.builtin.lng(this.v).nb$divide(other.v);
			}
		}
		return result;
	}

	if (other instanceof Sk.builtin.lng) {
		if (other.longCompare(Sk.builtin.biginteger.ZERO) == 0)
			throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");

		if (this.v === Infinity)
			if (other.nb$isnegative())
				return new Sk.builtin.nmber(-Infinity, Sk.builtin.nmber.float$);
			else
				return new Sk.builtin.nmber(Infinity, Sk.builtin.nmber.float$);
		if (this.v === -Infinity)
			if (other.nb$isnegative())
				return new Sk.builtin.nmber(Infinity, Sk.builtin.nmber.float$);
			else
				return new Sk.builtin.nmber(-Infinity, Sk.builtin.nmber.float$);

		if (this.skType === Sk.builtin.nmber.float$ || Sk.python3) {  // float / long --> float
			result = new Sk.builtin.nmber(this.v / parseFloat(other.str$(10, true)), Sk.builtin.nmber.float$);
		} else {	//	int - long --> long
			var thisAsLong = new Sk.builtin.lng(this.v);
			result = thisAsLong.nb$divide(other);
		}
		return result;
	}

	return undefined;
};

Sk.builtin.nmber.prototype.nb$floor_divide = function(other)
{
	var result;

	if (typeof other === "number")
		other = new Sk.builtin.nmber(other, undefined);
	else if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (this.v === Infinity || this.v === -Infinity)
		return new Sk.builtin.nmber(NaN, Sk.builtin.nmber.float$);

	if (other instanceof Sk.builtin.nmber) {
		if (other.v == 0)
			throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");

		if (other.v === Infinity)
			if (this.nb$isnegative())
				return new Sk.builtin.nmber(-1, Sk.builtin.nmber.float$);
			else
				return new Sk.builtin.nmber(0, Sk.builtin.nmber.float$);
		if (other.v === -Infinity)
			if (this.nb$isnegative() || !this.nb$nonzero())
				return new Sk.builtin.nmber(0, Sk.builtin.nmber.float$);
			else
				return new Sk.builtin.nmber(-1, Sk.builtin.nmber.float$);

		result = new Sk.builtin.nmber(Math.floor(this.v / other.v), undefined);
		if (this.skType === Sk.builtin.nmber.float$ || other.skType === Sk.builtin.nmber.float$)
			result.skType = Sk.builtin.nmber.float$;
		else {
			result.v = Math.floor(result.v);
			result.skType = Sk.builtin.nmber.int$;
			if (result.v > Sk.builtin.nmber.threshold$ || result.v < -Sk.builtin.nmber.threshold$) {
				//	Promote to long
				result = new Sk.builtin.lng(this.v).nb$floor_divide(other.v);
			}
		}
		return result;
	}

	if (other instanceof Sk.builtin.lng) {
		if (other.longCompare(Sk.builtin.biginteger.ZERO) == 0)
			throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");
		if (this.skType === Sk.builtin.nmber.float$) {  // float / long --> float
			result = Math.floor(this.v / parseFloat(other.str$(10, true)));
			result = new Sk.builtin.nmber(result, Sk.builtin.nmber.float$);
		} else {	//	int - long --> long
			var thisAsLong = new Sk.builtin.lng(this.v);
			result = thisAsLong.nb$floor_divide(other);
		}
		return result;
	}

	return undefined;
};

Sk.builtin.nmber.prototype.nb$remainder = function(other)
{
	var result;

	if (typeof other === "number")
		other = new Sk.builtin.nmber(other, undefined);
	else if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.nmber) {
		if (other.v == 0)
			throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");

		if (this.v == 0)
			if (this.skType == Sk.builtin.nmber.float$ || other.skType == Sk.builtin.nmber.float$)
				return new Sk.builtin.nmber(0, Sk.builtin.nmber.float$);
			else
				return new Sk.builtin.nmber(0, Sk.builtin.nmber.int$);

		if (other.v === Infinity)
			if (this.v === Infinity || this.v === -Infinity)
				return new Sk.builtin.nmber(NaN, Sk.builtin.nmber.float$);
			else if (this.nb$ispositive())
				return new Sk.builtin.nmber(this.v, Sk.builtin.nmber.float$);
			else
				return new Sk.builtin.nmber(Infinity, Sk.builtin.nmber.float$);

		//	Javacript logic on negatives doesn't work for Python... do this instead
		var tmp = this.v % other.v;
		if (this.v < 0) {
			if (other.v > 0 && tmp < 0)
				tmp = tmp + other.v;
		} else {
			if (other.v < 0 && tmp != 0)
				tmp = tmp + other.v;
		}
		if (this.skType === Sk.builtin.nmber.float$ || other.skType === Sk.builtin.nmber.float$)
			result = new Sk.builtin.nmber(tmp, Sk.builtin.nmber.float$);
		else {
		//	tmp = Math.floor(tmp);
			result = new Sk.builtin.nmber(tmp, Sk.builtin.nmber.int$);
			if (result.v > Sk.builtin.nmber.threshold$ || result.v < -Sk.builtin.nmber.threshold$) {
				//	Promote to long
				result = new Sk.builtin.lng(this.v).nb$remainder(other.v);
			}
		}
		return result;
	}

	if (other instanceof Sk.builtin.lng) {
		if (other.longCompare(Sk.builtin.biginteger.ZERO) == 0)
			throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");

		if (this.v == 0)
			if (this.skType === Sk.builtin.nmber.int$)
				return new Sk.builtin.lng(0);
			else
				return new Sk.builtin.nmber(0, this.skType);

		if (this.skType === Sk.builtin.nmber.float$) {  // float / long --> float
			var op2 = parseFloat(other.str$(10, true))
			var tmp = this.v % op2;
			if (tmp < 0) {
				if (op2 > 0 && tmp != 0)
					tmp = tmp + op2;
			} else {
				if (op2 < 0 && tmp != 0)
					tmp = tmp + op2;
			}
			result = new Sk.builtin.nmber(tmp, Sk.builtin.nmber.float$);
		} else {	//	int - long --> long
			var thisAsLong = new Sk.builtin.lng(this.v);
			result = thisAsLong.nb$remainder(other);
		}
		return result;
	}

	return undefined;
};

Sk.builtin.nmber.prototype.nb$power = function(other)
{
	var result;

	if (typeof other === "number")
		other = new Sk.builtin.nmber(other, undefined);
	else if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.bool)
		other = new Sk.builtin.nmber(Sk.builtin.asnum$(other), undefined);

	if (other instanceof Sk.builtin.nmber) {
		if (this.v < 0 && other.v % 1 != 0)
			throw new Sk.builtin.NegativePowerError("cannot raise a negative number to a fractional power");
		if (this.v == 0 && other.v < 0) {
			throw new Sk.builtin.NegativePowerError("cannot raise zero to a negative power");
		}

		result = new Sk.builtin.nmber(Math.pow(this.v, other.v), undefined);
		if (this.skType === Sk.builtin.nmber.float$ || other.skType === Sk.builtin.nmber.float$ || other.v < 0)
			result.skType = Sk.builtin.nmber.float$;
		else {
			result.v = Math.floor(result.v);
			result.skType = Sk.builtin.nmber.int$;
			if (result.v > Sk.builtin.nmber.threshold$ || result.v < -Sk.builtin.nmber.threshold$) {
				//	Promote to long
				result = new Sk.builtin.lng(this.v).nb$power(other.v);
			}
		}
	    if ((Math.abs(result.v) === Infinity)
		&& (Math.abs(this.v) !== Infinity)
		&& (Math.abs(other.v) !== Infinity)) {
		throw new Sk.builtin.OverflowError("Numerical result out of range");
	    }
		return result;
	}

	if (other instanceof Sk.builtin.lng) {
		if (this.v == 0 && other.longCompare(Sk.builtin.biginteger.ZERO) < 0)
			throw new Sk.builtin.NegativePowerError("cannot raise zero to a negative power");
		if (this.skType === Sk.builtin.nmber.float$ || other.nb$isnegative()) {  // float / long --> float
			result = new Sk.builtin.nmber(Math.pow(this.v, parseFloat(other.str$(10, true))), Sk.builtin.nmber.float$);
		} else {	//	int - long --> long
			var thisAsLong = new Sk.builtin.lng(this.v);
			result = thisAsLong.nb$power(other);
		}
		return result;
	}

	return undefined;
};

Sk.builtin.nmber.prototype.nb$and = function(other)
{
	var tmp;
        other = Sk.builtin.asnum$(other);
        tmp = this.v & other;
        if ((tmp !== undefined) && (tmp < 0)) {
            tmp = tmp + 4294967296; // convert back to unsigned
        }

	if (tmp !== undefined)
		return new Sk.builtin.nmber(tmp, undefined);

	return undefined;
}

Sk.builtin.nmber.prototype.nb$or = function(other)
{
	var tmp;
        other = Sk.builtin.asnum$(other);
        tmp = this.v | other;
        if ((tmp !== undefined) && (tmp < 0)) {
            tmp = tmp + 4294967296; // convert back to unsigned
        }

	if (tmp !== undefined)
		return new Sk.builtin.nmber(tmp, undefined);

	return undefined;
}

Sk.builtin.nmber.prototype.nb$xor = function(other)
{
	var tmp;
        other = Sk.builtin.asnum$(other);
        tmp = this.v ^ other;
        if ((tmp !== undefined) && (tmp < 0)) {
            tmp = tmp + 4294967296; // convert back to unsigned
        }

	if (tmp !== undefined)
		return new Sk.builtin.nmber(tmp, undefined);

	return undefined;
}

Sk.builtin.nmber.prototype.nb$lshift = function(other)
{
    var tmp;
    var shift = Sk.builtin.asnum$(other);

    if (shift !== undefined) {
        if (shift < 0)
	    throw new Sk.builtin.ValueError("negative shift count");
	tmp = this.v << shift;
	if (tmp <= this.v) {
	    // Fail, recompute with longs
	    return Sk.builtin.lng.fromInt$(this.v).nb$lshift(shift);
	}
    }

	if (tmp !== undefined)
		return new Sk.builtin.nmber(tmp, this.skType);

	return undefined;
}

Sk.builtin.nmber.prototype.nb$rshift = function(other)
{
    var tmp;
    var shift = Sk.builtin.asnum$(other);

    if (shift !== undefined) {
        if (shift < 0)
	    throw new Sk.builtin.ValueError("negative shift count");
	tmp = this.v >> shift;
	if ((this.v > 0) && (tmp < 0)) {
	    // Fix incorrect sign extension
	    tmp = tmp & (Math.pow(2, 32-shift) - 1);
	}
    }

	if (tmp !== undefined)
		return new Sk.builtin.nmber(tmp, this.skType);

	return undefined;
}

Sk.builtin.nmber.prototype.nb$inplace_add = Sk.builtin.nmber.prototype.nb$add;

Sk.builtin.nmber.prototype.nb$inplace_subtract = Sk.builtin.nmber.prototype.nb$subtract;

Sk.builtin.nmber.prototype.nb$inplace_multiply = Sk.builtin.nmber.prototype.nb$multiply;

Sk.builtin.nmber.prototype.nb$inplace_divide = Sk.builtin.nmber.prototype.nb$divide;

Sk.builtin.nmber.prototype.nb$inplace_remainder = Sk.builtin.nmber.prototype.nb$remainder;

Sk.builtin.nmber.prototype.nb$inplace_floor_divide = Sk.builtin.nmber.prototype.nb$floor_divide;

Sk.builtin.nmber.prototype.nb$inplace_power = Sk.builtin.nmber.prototype.nb$power;

Sk.builtin.nmber.prototype.nb$inplace_and = Sk.builtin.nmber.prototype.nb$and;

Sk.builtin.nmber.prototype.nb$inplace_or = Sk.builtin.nmber.prototype.nb$or;

Sk.builtin.nmber.prototype.nb$inplace_xor = Sk.builtin.nmber.prototype.nb$xor;

Sk.builtin.nmber.prototype.nb$inplace_lshift = Sk.builtin.nmber.prototype.nb$lshift;

Sk.builtin.nmber.prototype.nb$inplace_rshift = Sk.builtin.nmber.prototype.nb$rshift;

Sk.builtin.nmber.prototype.nb$negative = function()
{
	return new Sk.builtin.nmber(-this.v, undefined);
};

Sk.builtin.nmber.prototype.nb$positive = function() { return this.clone(); };

Sk.builtin.nmber.prototype.nb$nonzero = function()
{
	return this.v !== 0;
};

Sk.builtin.nmber.prototype.nb$isnegative = function() { return this.v < 0 };

Sk.builtin.nmber.prototype.nb$ispositive = function() { return this.v >= 0 };

Sk.builtin.nmber.prototype.numberCompare = function(other)
{
	if (other instanceof Sk.builtin.bool)
	    other = Sk.builtin.asnum$(other);

	if (other instanceof Sk.builtin.none)
		other = 0;

	if (typeof other === "number") {
		return this.v - other;
	}

	if (other instanceof Sk.builtin.nmber) {
		if (this.v == Infinity && other.v == Infinity) return 0;
		if (this.v == -Infinity && other.v == -Infinity) return 0;
		return this.v - other.v;
	}

	if (other instanceof Sk.builtin.lng) {
		if (this.skType === Sk.builtin.nmber.int$ || this.v % 1 == 0) {
			var thisAsLong = new Sk.builtin.lng(this.v);
			var tmp = thisAsLong.longCompare(other);
			return tmp;
		}
		var diff = this.nb$subtract(other);
		if (diff instanceof Sk.builtin.nmber) {
			return diff.v;
		} else if (diff instanceof Sk.builtin.lng) {
			return diff.longCompare(Sk.builtin.biginteger.ZERO);
		}
	}

	return undefined;
}

Sk.builtin.nmber.prototype.__eq__ = function(me, other) {
	return (me.numberCompare(other) == 0) && !(other instanceof Sk.builtin.none);
};

Sk.builtin.nmber.prototype.__ne__ = function(me, other) {
	return (me.numberCompare(other) != 0) || (other instanceof Sk.builtin.none);
};

Sk.builtin.nmber.prototype.__lt__ = function(me, other) {
	return me.numberCompare(other) < 0;
};

Sk.builtin.nmber.prototype.__le__ = function(me, other) {
	return me.numberCompare(other) <= 0;
};

Sk.builtin.nmber.prototype.__gt__ = function(me, other) {
	return me.numberCompare(other) > 0;
};

Sk.builtin.nmber.prototype.__ge__ = function(me, other) {
	return me.numberCompare(other) >= 0;
};

Sk.builtin.nmber.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;

Sk.builtin.nmber.prototype['$r'] = function()
{
    return new Sk.builtin.str(this.str$(10, true));
};

Sk.builtin.nmber.prototype.tp$str = function()
{
    return new Sk.builtin.str(this.str$(10, true));
};

Sk.builtin.nmber.prototype.str$ = function(base, sign)
{
	if (isNaN(this.v))
		return "nan";

	if (sign === undefined) sign = true;

	if (this.v == Infinity)
		return 'inf';
	if (this.v == -Infinity && sign)
		return '-inf';
	if (this.v == -Infinity && !sign)
		return 'inf';

	var work = sign ? this.v : Math.abs(this.v);


	var tmp;
	if (base === undefined || base === 10) {
		if (this.skType == Sk.builtin.nmber.float$) {
			tmp = work.toPrecision(12);

		    // transform fractions with 4 or more leading zeroes into exponents
		    var idx = tmp.indexOf('.');
		    var pre = work.toString().slice(0,idx);
		    var post = work.toString().slice(idx);
		    if (pre.match(/^-?0$/) && post.slice(1).match(/^0{4,}/)) {
			if (tmp.length < 12)
			    tmp = work.toExponential();
			else
			    tmp = work.toExponential(11);
		    }

			while (tmp.charAt(tmp.length-1) == "0" && tmp.indexOf('e') < 0) {
				tmp = tmp.substring(0,tmp.length-1)
			}
			if (tmp.charAt(tmp.length-1) == ".") {
				tmp = tmp + "0"
			}
			tmp = tmp.replace(new RegExp('\\.0+e'),'e',"i")
		    // make exponent two digits instead of one (ie e+09 not e+9)
		    tmp = tmp.replace(/(e[-+])([1-9])$/, "$10$2");
		    // remove trailing zeroes before the exponent
		    tmp = tmp.replace(/0+(e.*)/,'$1');
		} else {
			tmp = work.toString()
		}
	} else {
		tmp = work.toString(base);
	}

	if (this.skType !== Sk.builtin.nmber.float$)
		return tmp;
	if (tmp.indexOf('.') < 0 && tmp.indexOf('E') < 0 && tmp.indexOf('e') < 0)
		tmp = tmp + '.0';
	return tmp;
};

goog.exportSymbol("Sk.builtin.nmber", Sk.builtin.nmber);
// long aka "bignumber" implementation
//
//  Using javascript BigInteger by Tom Wu
/**
 * @constructor
 * @param {*} x
 * @param {number=} base
 */
Sk.builtin.lng = function(x, base)	/* long is a reserved word */
{
    base = Sk.builtin.asnum$(base);
    if (!(this instanceof Sk.builtin.lng)) return new Sk.builtin.lng(x, base);

    if (x === undefined)
	this.biginteger = new Sk.builtin.biginteger(0);
    else if (x instanceof Sk.builtin.lng)
	this.biginteger = x.biginteger.clone();
    else if (x instanceof Sk.builtin.biginteger)
	this.biginteger = x;
    else if (x instanceof String)
	return Sk.longFromStr(x, base);
    else if (x instanceof Sk.builtin.str)
	return Sk.longFromStr(x.v, base);
    else {
	if ((x !== undefined) && (!Sk.builtin.checkString(x)
			      && !Sk.builtin.checkNumber(x)))
	{
	    if (x === true)
		x = 1;
	    else if (x === false)
		x = 0;
	    else
		throw new Sk.builtin.TypeError("long() argument must be a string or a number, not '" + Sk.abstr.typeName(x) + "'");
	}

	x = Sk.builtin.asnum$nofloat(x);
	this.biginteger = new Sk.builtin.biginteger(x);
    }

    return this;
};

Sk.builtin.lng.prototype.tp$index = function()
{
    return parseInt(this.str$(10, true), 10);
};

Sk.builtin.lng.prototype.tp$hash = function()
{
    return new Sk.builtin.nmber(this.tp$index(), Sk.builtin.nmber.int$);
};

Sk.builtin.lng.prototype.tp$name = "long";
Sk.builtin.lng.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('long', Sk.builtin.lng);

//	Threshold to determine when types should be converted to long
Sk.builtin.lng.threshold$ = Math.pow(2, 53);

Sk.builtin.lng.MAX_INT$ = new Sk.builtin.lng(Sk.builtin.lng.threshold$);
Sk.builtin.lng.MIN_INT$ = new Sk.builtin.lng(-Sk.builtin.lng.threshold$);

//Sk.builtin.lng.LONG_DIVIDE$ = 0;
//Sk.builtin.lng.FLOAT_DIVIDE$ = -1;
//Sk.builtin.lng.VARIABLE_DIVIDE$ = -2;
//// Positive values reserved for scaled, fixed precision big number implementations where mode = number of digits to the right of the decimal
//Sk.builtin.lng.dividemode$ = Sk.builtin.lng.LONG_DIVIDE$;

Sk.builtin.lng.prototype.cantBeInt = function() {
	return (this.longCompare(Sk.builtin.lng.MAX_INT$) > 0) || (this.longCompare(Sk.builtin.lng.MIN_INT$) < 0);
}

//Sk.builtin.lng.longDivideMode = function(m) 
//{
//	if (m) {
//		if (m instanceof Sk.builtin.str) {
//			if (m.v == 'float') m = Sk.builtin.lng.FLOAT_DIVIDE$;
//			else if (m.v == 'long')  m = Sk.builtin.lng.LONG_DIVIDE$;
//			else if (m.v == 'variable') m = Sk.builtin.lng.VARIABLE_DIVIDE$;
//			else goog.asserts.assert(true, "Invalid long division mode.");
//		}
//		Sk.builtin.lng.dividemode$ = m;
//	}
//	if (Sk.builtin.lng.dividemode$ == Sk.builtin.lng.FLOAT_DIVIDE$)
//		return new Sk.builtin.str('float');
//	if (Sk.builtin.lng.dividemode$ == Sk.builtin.lng.VARIABLE_DIVIDE$)
//		return new Sk.builtin.str('variable');
//	return new Sk.builtin.str('long'); 
//};

Sk.builtin.lng.fromInt$ = function(ival) 
{
	return new Sk.builtin.lng(ival);
};

// js string (not Sk.builtin.str) -> long. used to create longs in transformer, respects
// 0x, 0o, 0b, etc.
Sk.longFromStr = function(s, base)
{
    // l/L are valid digits with base >= 22
    // goog.asserts.assert(s.charAt(s.length - 1) !== "L" && s.charAt(s.length - 1) !== 'l', "L suffix should be removed before here");

    var parser = function (s, base) {
        if (base == 10)
            return new Sk.builtin.biginteger(s);
        else
            return new Sk.builtin.biginteger(s, base);
    };

    var biginteger = Sk.str2number(s, base, parser, function(x){return x.negate();}, "long");

    return new Sk.builtin.lng(biginteger);
};
goog.exportSymbol("Sk.longFromStr", Sk.longFromStr);

Sk.builtin.lng.prototype.toInt$ = function()
{
    return this.biginteger.intValue();
};

Sk.builtin.lng.prototype.clone = function()
{
	return new Sk.builtin.lng(this);
};

Sk.builtin.lng.prototype.nb$add = function(other)
{
	if (other instanceof Sk.builtin.bool) {
		other = new Sk.builtin.lng(Sk.builtin.asnum$(other));
	}

	if (other instanceof Sk.builtin.nmber) {
		if (other.skType === Sk.builtin.nmber.float$) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$add(other);
		} else {
			//	Promote an int to long
			other = new Sk.builtin.lng(other.v);
		}
	}

	if (other instanceof Sk.builtin.lng) {
		return new Sk.builtin.lng(this.biginteger.add(other.biginteger));
	}

	if (other instanceof Sk.builtin.biginteger) {
		return new Sk.builtin.lng(this.biginteger.add(other));
	}

	return new Sk.builtin.lng(this.biginteger.add(new Sk.builtin.biginteger(other)));
};

Sk.builtin.lng.prototype.nb$inplace_add = Sk.builtin.lng.prototype.nb$add;

Sk.builtin.lng.prototype.nb$subtract = function(other)
{
	if (other instanceof Sk.builtin.bool) {
		other = new Sk.builtin.lng(Sk.builtin.asnum$(other));
	}

	if (other instanceof Sk.builtin.nmber) {
		if (other.skType === Sk.builtin.nmber.float$) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$subtract(other);
		} else {
			//	Promote an int to long
			other = new Sk.builtin.lng(other.v);
		}
	}

	if (other instanceof Sk.builtin.lng) {
		return new Sk.builtin.lng(this.biginteger.subtract(other.biginteger));
	}

	if (other instanceof Sk.builtin.biginteger) {
		return new Sk.builtin.lng(this.biginteger.subtract(other));
	}

	return new Sk.builtin.lng(this.biginteger.subtract(new Sk.builtin.biginteger(other)));
};

Sk.builtin.lng.prototype.nb$inplace_subtract = Sk.builtin.lng.prototype.nb$subtract;

Sk.builtin.lng.prototype.nb$multiply = function(other)
{
	if (other instanceof Sk.builtin.bool) {
		other = new Sk.builtin.lng(Sk.builtin.asnum$(other));
	}

	if (other instanceof Sk.builtin.nmber) {
		if (other.skType === Sk.builtin.nmber.float$) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$multiply(other);
		} else {
			//	Promote an int to long
			other = new Sk.builtin.lng(other.v);
		}
	}

	if (other instanceof Sk.builtin.lng) {
		return new Sk.builtin.lng(this.biginteger.multiply(other.biginteger));
	}

	if (other instanceof Sk.builtin.biginteger) {
		return new Sk.builtin.lng(this.biginteger.multiply(other));
	}

	return new Sk.builtin.lng(this.biginteger.multiply(new Sk.builtin.biginteger(other)));
};

Sk.builtin.lng.prototype.nb$inplace_multiply = Sk.builtin.lng.prototype.nb$multiply;

Sk.builtin.lng.prototype.nb$divide = function(other)
{
	if (other instanceof Sk.builtin.bool) {
		other = new Sk.builtin.lng(Sk.builtin.asnum$(other));
	}

	if (other instanceof Sk.builtin.nmber) {
		if (other.skType === Sk.builtin.nmber.float$) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$divide(other);
		} else {
			//	Promote an int to long
			other = new Sk.builtin.lng(other.v);
		}
	}

	var result;
//	if (Sk.builtin.lng.dividemode$ == Sk.builtin.lng.FLOAT_DIVIDE$ || Sk.builtin.lng.dividemode$ == Sk.builtin.lng.VARIABLE_DIVIDE$) {
//		if (other instanceof Sk.builtin.lng) {
//			result = this.biginteger.divideAndRemainder(other.biginteger);
//		} else if (other instanceof Sk.builtin.biginteger) {
//			result = this.biginteger.divideAndRemainder(other);
//		} else {
//			result = this.biginteger.divideAndRemainder(new Sk.builtin.biginteger(other));
//		}
//
//		//	result = Array of quotient [0], remainder [1]
//
//		if (result [1].compare(Sk.builtin.biginteger.ZERO) != 0) {
//			//	Non-zero remainder -- this will be a float no matter what
//			return parseFloat(this.biginteger.toString()) / parseFloat(other.biginteger.toString());
//		} else {
//			//	No remainder
//			if (Sk.builtin.lng.dividemode$ == Sk.builtin.lng.FLOAT_DIVIDE$)
//				return parseFloat(result [0].toString());		//	Float option with no remainder, return quotient as float
//			else
//				return new Sk.builtin.lng(result [0]);			//	Variable option with no remainder, return new long from quotient
//		}
//	}

//	Standard, long result mode

	if (! (other instanceof Sk.builtin.lng) ) {
		other = new Sk.builtin.lng(other);
	}

	//	Special logic to round DOWN towards negative infinity for negative results
	var thisneg = this.nb$isnegative();
	var otherneg = other.nb$isnegative();
	if ((thisneg && !otherneg) || (otherneg && !thisneg)) {
		result = this.biginteger.divideAndRemainder(other.biginteger);
		//	If remainder is zero or positive, just return division result
		if (result[1].trueCompare(Sk.builtin.biginteger.ZERO) == 0) {
			//	No remainder, just return result
			return new Sk.builtin.lng(result[0]);
		} else {
			//	Reminder... subtract 1 from the result (like rounding to neg infinity)
			result = result[0].subtract(Sk.builtin.biginteger.ONE);
			return new Sk.builtin.lng(result);
		}
	} else {
		return new Sk.builtin.lng(this.biginteger.divide(other.biginteger));
	}
};

Sk.builtin.lng.prototype.nb$inplace_divide = Sk.builtin.lng.prototype.nb$divide;

Sk.builtin.lng.prototype.nb$floor_divide = function(other)
{
	if (other instanceof Sk.builtin.bool) {
		other = new Sk.builtin.lng(Sk.builtin.asnum$(other));
	}

	if (other instanceof Sk.builtin.nmber) {
		if (other.skType === Sk.builtin.nmber.float$) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$floor_divide(other);
		}
	}

	return this.nb$divide(other);
};

Sk.builtin.lng.prototype.nb$inplace_floor_divide = Sk.builtin.lng.prototype.nb$floor_divide;

Sk.builtin.lng.prototype.nb$remainder = function(other)
{
	if (other instanceof Sk.builtin.bool) {
		other = new Sk.builtin.lng(Sk.builtin.asnum$(other));
	}

	if (this.biginteger.trueCompare(Sk.builtin.biginteger.ZERO) === 0)
		if (other instanceof Sk.builtin.nmber && other.skType === Sk.builtin.nmber.float$)
			return new Sk.builtin.nmber(0, Sk.builtin.nmber.float$);
		else
			return new Sk.builtin.lng(0);

	if (other instanceof Sk.builtin.nmber) {
		if (other.skType === Sk.builtin.nmber.float$) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$remainder(other);
		} else {
			//	Promote an int to long
			other = new Sk.builtin.lng(other.v);
		}
	}

	if (! (other instanceof Sk.builtin.lng) ) {
		other = new Sk.builtin.lng(other);
	}

	var tmp = new Sk.builtin.lng(this.biginteger.remainder(other.biginteger));
	if (this.nb$isnegative()) {
		if (other.nb$ispositive() && tmp.nb$nonzero())
			tmp = tmp.nb$add(other).nb$remainder(other);
	} else {
		if (other.nb$isnegative() && tmp.nb$nonzero())
			tmp = tmp.nb$add(other);
	}
	return tmp;

};

Sk.builtin.lng.prototype.nb$inplace_remainder = Sk.builtin.lng.prototype.nb$remainder;

/**
 * @param {number|Object} n
 * @param {number|Object=} mod
 * @suppress {checkTypes}
 */
Sk.builtin.lng.prototype.nb$power = function(n, mod)
{
    if (mod !== undefined)
    {
	n = new Sk.builtin.biginteger(Sk.builtin.asnum$(n));
	mod = new Sk.builtin.biginteger(Sk.builtin.asnum$(mod));

	return new Sk.builtin.lng(this.biginteger.modPowInt(n, mod));
    }
	if (typeof n === "number") {
		if (n < 0) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$power(n);
		} else
			return new Sk.builtin.lng(this.biginteger.pow(new Sk.builtin.biginteger(n)));
	}

	if (n instanceof Sk.builtin.bool) {
	    return new Sk.builtin.lng(this.biginteger.pow(new Sk.builtin.biginteger(Sk.builtin.asnum$(n))));
	}

	if (n instanceof Sk.builtin.nmber) {
		if (n.skType === Sk.builtin.nmber.float$ || n.v < 0) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$power(n);
		} else {
			//	Promote an int to long
			n = new Sk.builtin.lng(n.v);
		}
	}

	if (n instanceof Sk.builtin.lng) {
		if (n.nb$isnegative()) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$power(n);
		} else
			return new Sk.builtin.lng(this.biginteger.pow(n.biginteger));
	}

	if (n instanceof Sk.builtin.biginteger) {
		if (n.isnegative()) {
			var thisAsFloat = new Sk.builtin.nmber(this.str$(10, true), Sk.builtin.nmber.float$);
			return thisAsFloat.nb$power(n);
		}
		return new Sk.builtin.lng(this.biginteger.pow(n));
	}

	return new Sk.builtin.lng(this.biginteger.pow(new Sk.builtin.biginteger(n)));
};

Sk.builtin.lng.prototype.nb$inplace_power = Sk.builtin.lng.prototype.nb$power;

Sk.builtin.lng.prototype.nb$lshift = function(other)
{
    if (other instanceof Sk.builtin.lng) {
	if (other.biginteger.signum() < 0) {
	    throw new Sk.builtin.ValueError("negative shift count");
	}
	return new Sk.builtin.lng(this.biginteger.shiftLeft(other.biginteger));
    }
    if (other instanceof Sk.builtin.biginteger) {
	if (other.signum() < 0) {
	    throw new Sk.builtin.ValueError("negative shift count");
	}
	return new Sk.builtin.lng(this.biginteger.shiftLeft(other));
    }
    
    if (other < 0) {
	throw new Sk.builtin.ValueError("negative shift count");
    }
    other = Sk.builtin.asnum$(other);
    return new Sk.builtin.lng(this.biginteger.shiftLeft(new Sk.builtin.biginteger(other)));
}

Sk.builtin.lng.prototype.nb$inplace_lshift = Sk.builtin.lng.prototype.nb$lshift;

Sk.builtin.lng.prototype.nb$rshift = function(other)
{
    if (other instanceof Sk.builtin.lng) {
	if (other.biginteger.signum() < 0) {
	    throw new Sk.builtin.ValueError("negative shift count");
	}
	return new Sk.builtin.lng(this.biginteger.shiftRight(other.biginteger));
    }
    if (other instanceof Sk.builtin.biginteger) {
	if (other.signum() < 0) {
	    throw new Sk.builtin.ValueError("negative shift count");
	}
	return new Sk.builtin.lng(this.biginteger.shiftRight(other));
    }
    
    if (other < 0) {
	throw new Sk.builtin.ValueError("negative shift count");
    }
    other = Sk.builtin.asnum$(other);
    return new Sk.builtin.lng(this.biginteger.shiftRight(new Sk.builtin.biginteger(other)));
}

Sk.builtin.lng.prototype.nb$inplace_rshift = Sk.builtin.lng.prototype.nb$rshift;

Sk.builtin.lng.prototype.nb$and = function(other)
{
    if (other instanceof Sk.builtin.lng) {
	return new Sk.builtin.lng(this.biginteger.and(other.biginteger));
    }
    if (other instanceof Sk.builtin.biginteger) {
	return new Sk.builtin.lng(this.biginteger.and(other));
    }
    
    other = Sk.builtin.asnum$(other);
    return new Sk.builtin.lng(this.biginteger.and(new Sk.builtin.biginteger(other)));
}

Sk.builtin.lng.prototype.nb$inplace_and = Sk.builtin.lng.prototype.nb$and;

Sk.builtin.lng.prototype.nb$or = function(other)
{
    if (other instanceof Sk.builtin.lng) {
	return new Sk.builtin.lng(this.biginteger.or(other.biginteger));
    }
    if (other instanceof Sk.builtin.biginteger) {
	return new Sk.builtin.lng(this.biginteger.or(other));
    }
    
    other = Sk.builtin.asnum$(other);
    return new Sk.builtin.lng(this.biginteger.or(new Sk.builtin.biginteger(other)));
}

Sk.builtin.lng.prototype.nb$inplace_or = Sk.builtin.lng.prototype.nb$or;

Sk.builtin.lng.prototype.nb$xor = function(other)
{
    if (other instanceof Sk.builtin.lng) {
	return new Sk.builtin.lng(this.biginteger.xor(other.biginteger));
    }
    if (other instanceof Sk.builtin.biginteger) {
	return new Sk.builtin.lng(this.biginteger.xor(other));
    }
    
    other = Sk.builtin.asnum$(other);
    return new Sk.builtin.lng(this.biginteger.xor(new Sk.builtin.biginteger(other)));
}

Sk.builtin.lng.prototype.nb$inplace_xor = Sk.builtin.lng.prototype.nb$xor;

Sk.builtin.lng.prototype.nb$negative = function()
{
	return new Sk.builtin.lng(this.biginteger.negate());
};

Sk.builtin.lng.prototype.nb$positive = function() { return this.clone(); };

Sk.builtin.lng.prototype.nb$nonzero = function()
{
	return this.biginteger.trueCompare(Sk.builtin.biginteger.ZERO) !== 0;
};

Sk.builtin.lng.prototype.nb$isnegative = function()
{
	return this.biginteger.isnegative();
	//return this.biginteger.trueCompare(Sk.builtin.biginteger.ZERO) < 0;
};

Sk.builtin.lng.prototype.nb$ispositive = function()
{
	return ! this.biginteger.isnegative();
	//return this.biginteger.trueCompare(Sk.builtin.biginteger.ZERO) >= 0;
};

Sk.builtin.lng.prototype.longCompare = function(other)
{
	if (typeof other === "boolean")
		if (other)
			other = 1;
		else
			other = 0;

	var tmp;

	if (typeof other === "number") {
		other = new Sk.builtin.lng(other);
	}

	if (other instanceof Sk.builtin.nmber) {
		if (other.skType === Sk.builtin.nmber.int$ || other.v % 1 == 0) {
			var otherAsLong = new Sk.builtin.lng(other.v);
			return this.longCompare(otherAsLong);
		} else {
			var thisAsFloat = new Sk.builtin.nmber(this, Sk.builtin.nmber.float$);
			return thisAsFloat.numberCompare(other);
		}
	}

	else if (other instanceof Sk.builtin.lng) {
//		tmp = this.biginteger.trueCompare(other.biginteger);
		tmp = this.biginteger.subtract(other.biginteger);
	}

	else if (other instanceof Sk.builtin.biginteger) {
//		tmp = this.biginteger.trueCompare(other);
		tmp = this.biginteger.subtract(other);
	}

	else {
//		tmp = this.biginteger.trueCompare(new Sk.builtin.biginteger(other));
		tmp = this.biginteger.subtract(new Sk.builtin.biginteger(other));
	}

	return tmp;
}

Sk.builtin.lng.prototype.__eq__ = function(me, other) {
	return me.longCompare(other) == 0 && !(other instanceof Sk.builtin.none);
};

Sk.builtin.lng.prototype.__ne__ = function(me, other) {
	return me.longCompare(other) != 0 || (other instanceof Sk.builtin.none);
};

Sk.builtin.lng.prototype.__lt__ = function(me, other) {
	return me.longCompare(other) < 0;
};

Sk.builtin.lng.prototype.__le__ = function(me, other) {
	return me.longCompare(other) <= 0;
};

Sk.builtin.lng.prototype.__gt__ = function(me, other) {
	return me.longCompare(other) > 0;
};

Sk.builtin.lng.prototype.__ge__ = function(me, other) {
	return me.longCompare(other) >= 0;
};

Sk.builtin.lng.prototype['$r'] = function()
{
    return new Sk.builtin.str(this.str$(10, true) + "L");
};

Sk.builtin.lng.prototype.tp$str = function()
{
    return new Sk.builtin.str(this.str$(10, true));
};

Sk.builtin.lng.prototype.str$ = function(base, sign)
{
	if (sign === undefined) sign = true;

	var work = sign ? this.biginteger : this.biginteger.abs();

	if (base === undefined || base === 10) {
		return work.toString();
	}

	//	Another base... convert...
	return work.toString(base);
};
// Takes a JavaScript string and returns a number using the
// parser and negater functions (for int/long right now)
//
// parser should take a string that is a postive number which only
// contains characters that are valid in the given base and a base and
// return a number
//
// negater should take a number and return its negation
//
// fname is a string containing the function name to be used in error
// messages
Sk.str2number = function(s, base, parser, negater, fname)
{
    var origs = s;
    var neg = false;

    // strip whitespace from ends
    // s = s.trim();
    s = s.replace(/^\s+|\s+$/g, '');

    // check for minus sign
    if (s.charAt(0) == '-') {
	neg = true;
	s = s.substring(1);
    }

    // check for plus sign
    if (s.charAt(0) == '+') {
	s = s.substring(1);
    }

    if (base === undefined) base = 10; // default radix is 10, not dwim

    if (base < 2 || base > 36) {
	if (base != 0) {
	    throw new Sk.builtin.ValueError(fname + "() base must be >= 2 and <= 36");
	}
    }

    if ( s.substring(0,2).toLowerCase() == '0x' ) {
        if (base == 16 || base == 0) {
	    s = s.substring(2);
	    base = 16;
        } else if (base < 34) {
	    throw new Sk.builtin.ValueError("invalid literal for " + fname + "() with base " + base + ": '" + origs + "'");
	}
    }
    else if ( s.substring(0,2).toLowerCase() == '0b' ) { 
        if (base == 2 || base == 0) {
            s = s.substring(2);
            base = 2;
        } else if (base < 12) {
	    throw new Sk.builtin.ValueError("invalid literal for " + fname + "() with base " + base + ": '" + origs + "'");
        }        
    }
    else if ( s.substring(0,2).toLowerCase() == '0o' ) {
        if (base == 8 || base == 0) {
	    s = s.substring(2);
	    base = 8;
        } else if (base < 25) {
	    throw new Sk.builtin.ValueError("invalid literal for " + fname + "() with base " + base + ": '" + origs + "'");
	}
    }
    else if ( s.charAt(0) == '0' ) {
	if (s == '0') return 0;
	if (base == 8 || base == 0) {
	    base = 8;
	}
    }

    if (base == 0) base = 10;

    if (s.length === 0) {
	throw new Sk.builtin.ValueError("invalid literal for " + fname + "() with base " + base + ": '" + origs + "'");
    }

    // check all characters are valid
    var i, ch, val;
    for (i=0; i<s.length; i++) {
	ch = s.charCodeAt(i);
	val = base;
	if ((ch >= 48) && (ch <= 57)) {
	    // 0-9
	    val = ch - 48;
        }
	else if ((ch >= 65) && (ch <= 90)) {
	    // A-Z
	    val = ch - 65 + 10;
        }
        else if ((ch >= 97) && (ch <= 122)) {
	    // a-z
	    val = ch - 97 + 10;
	}

	if (val >= base) {
	    throw new Sk.builtin.ValueError("invalid literal for " + fname + "() with base " + base + ": '" + origs + "'");
	}
    }

    // parse number
    val = parser(s, base);
    if (neg) {
	val = negater(val);
    }
    return val;
}

Sk.builtin.int_ = function(x, base)
{
    if ((x !== undefined) && (!Sk.builtin.checkString(x)
			      && !Sk.builtin.checkNumber(x)))
    {
	if (x instanceof Sk.builtin.bool)
	    x = Sk.builtin.asnum$(x);
	else
	    throw new Sk.builtin.TypeError("int() argument must be a string or a number, not '" + Sk.abstr.typeName(x) + "'");
    }

    if (x instanceof Sk.builtin.str)
    {
		base = Sk.builtin.asnum$(base);
        var val = Sk.str2number(x.v, base, parseInt, 
                                function(x){return -x;}, "int");
        if ((val > Sk.builtin.lng.threshold$) 
            || (val < -Sk.builtin.lng.threshold$)) 
        {
            // Too big for int, convert to long
            return new Sk.builtin.lng(x, base);

        }

        return new Sk.builtin.nmber(val, Sk.builtin.nmber.int$);
    }

    if (base !== undefined) {
	throw new Sk.builtin.TypeError("int() can't convert non-string with explicit base");
    }

    if (x instanceof Sk.builtin.lng)
    {
	if (x.cantBeInt())
	    return new Sk.builtin.lng(x);
	else
	    return new Sk.builtin.nmber(x.toInt$(), Sk.builtin.nmber.int$);
    }

    // sneaky way to do truncate, floor doesn't work < 0, round doesn't work on the .5> side
    // bitwise ops convert to 32bit int in the "C-truncate-way" we want.
    x = Sk.builtin.asnum$(x);
    return new Sk.builtin.nmber(x | 0, Sk.builtin.nmber.int$);
};

Sk.builtin.int_.prototype.tp$name = "int";
Sk.builtin.int_.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('int', Sk.builtin.int_);
Sk.builtin.float_ = function(x)
{
    if (x === undefined)
    {
        return new Sk.builtin.nmber(0.0, Sk.builtin.nmber.float$);
    }

    if (x instanceof Sk.builtin.str)
    {
		var tmp;

	if (x.v.match(/^-inf$/i)) {
	    tmp = -Infinity;
	}
	else if (x.v.match(/^[+]?inf$/i)) {
	    tmp = Infinity;
	}
	else if (x.v.match(/^[-+]?nan$/i)) {
	    tmp = NaN;
	}

        else if (!isNaN(x.v))
            tmp = parseFloat(x.v);
        else {
            throw new Sk.builtin.ValueError("float: Argument: " + x.v + " is not number");
        }
		return new Sk.builtin.nmber(tmp, Sk.builtin.nmber.float$);
    }

    // Floats are just numbers
    if (typeof x === "number" || x instanceof Sk.builtin.nmber
	|| x instanceof Sk.builtin.lng)
    {
	x = Sk.builtin.asnum$(x);
        return new Sk.builtin.nmber(x, Sk.builtin.nmber.float$);
    }

    // Convert booleans
    if (x instanceof Sk.builtin.bool)
    {
	x = Sk.builtin.asnum$(x);
	return new Sk.builtin.nmber(x, Sk.builtin.nmber.float$);
    }

    throw new Sk.builtin.TypeError("float() argument must be a string or a number");
};

Sk.builtin.float_.prototype.tp$name = "float";
Sk.builtin.float_.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('float', Sk.builtin.float_);
/**
 * @constructor
 * @param {Object} start
 * @param {Object=} stop
 * @param {Object=} step
 */
Sk.builtin.slice = function slice(start, stop, step)
{
    if (Sk.builtin.asnum$(step) === 0) {
	throw new Sk.builtin.ValueError("slice step cannot be zero");
    }

    if (!(this instanceof Sk.builtin.slice)) return new Sk.builtin.slice(start, stop, step);

    if (stop === undefined && step === undefined)
    {
        stop = start;
        start = Sk.builtin.none.none$;
    }
    if (stop === undefined) stop = Sk.builtin.none.none$;
    if (step === undefined) step = Sk.builtin.none.none$;
    this.start = start;
    this.stop = stop;
    this.step = step;

    this.__class__ = Sk.builtin.slice;

    this['$d'] = new Sk.builtin.dict([Sk.builtin.slice$start, this.start,
                                      Sk.builtin.slice$stop, this.stop,
                                      Sk.builtin.slice$step, this.step]);

    return this;
};

Sk.builtin.slice.prototype.tp$name = 'slice';
Sk.builtin.slice.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('slice', Sk.builtin.slice);

Sk.builtin.slice.prototype['$r'] = function()
{
    var a = Sk.builtin.repr(this.start).v;
    var b = Sk.builtin.repr(this.stop).v;
    var c = Sk.builtin.repr(this.step).v;
    return new Sk.builtin.str("slice(" + a + ", " + b + ", " + c + ")");
};

Sk.builtin.slice.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;

Sk.builtin.slice.prototype.tp$richcompare = function(w, op)
{
    // w not a slice
    if (!w.__class__ || w.__class__ != Sk.builtin.slice)
    {
        // shortcuts for eq/not
        if (op === 'Eq') return false;
        if (op === 'NotEq') return true;

        // todo; other types should have an arbitrary order
        return false;
    }

    // This is how CPython does it
    var t1, t2;
    t1 = new Sk.builtin.tuple([this.start,this.stop,this.step]);
    t2 = new Sk.builtin.tuple([w.start,w.stop,w.step]);
    
    return t1.tp$richcompare(t2, op);
};

Sk.builtin.slice.prototype.indices = function(length)
{
    if ((!Sk.builtin.checkInt(this.start)
             && !Sk.builtin.checkNone(this.start))
            || (!Sk.builtin.checkInt(this.stop)
                && !Sk.builtin.checkNone(this.stop))
            || (!Sk.builtin.checkInt(this.step)
                && !Sk.builtin.checkNone(this.step))) {
            throw new Sk.builtin.TypeError("slice indices must be integers or None");
    }

	    var start = Sk.builtin.asnum$(this.start),
	        stop  = Sk.builtin.asnum$(this.stop),
	        step  = Sk.builtin.asnum$(this.step);

	length = Sk.builtin.asnum$(length);
    // this seems ugly, better way?
    var i;
    if (step === null) step = 1;
    if (step > 0)
    {
        if (start === null) start = 0;
        if (stop === null) stop = length;
        if (stop > length) {
            stop = length;
        }
        if (start < 0) {
            start = length + start;
            if (start < 0) {
                start = 0;
            }
        }
        if (stop < 0) stop = length + stop;
    }
    else
    {
        if (start === null) start = length - 1;
        if (start >= length) {
            start = length - 1;
        }
        if (stop === null) {
            stop = -1;
        } else if (stop < 0) {
            stop = length + stop;
            if (stop < 0) {
                stop = -1;
            }
        }
        if (start < 0) start = length + start;
    }
    return [start, stop, step];
};

Sk.builtin.slice.prototype.sssiter$ = function(wrt, f)
{   
	var wrtv = Sk.builtin.asnum$(wrt);
    var sss = this.indices(typeof wrtv === "number" ? wrtv : wrt.v.length);
    if (sss[2] > 0)
    {
        var i;
        for (i = sss[0]; i < sss[1]; i += sss[2])
            if (f(i, wrtv) === false) return;	//	wrt or wrtv? RNL
    }
    else
    {
        for (i = sss[0]; i > sss[1]; i += sss[2])
            if (f(i, wrtv) === false) return;	//	wrt or wrtv? RNL

    }
};

Sk.builtin.slice$start = new Sk.builtin.str("start");
Sk.builtin.slice$stop = new Sk.builtin.str("stop");
Sk.builtin.slice$step = new Sk.builtin.str("step");
/**
 * @constructor
 * @param {Array.<Object>} S
 */
Sk.builtin.set = function(S)
{
    if (!(this instanceof Sk.builtin.set)) return new Sk.builtin.set(S);

    if (typeof(S) === 'undefined')
    {
        S = [];
    }

    this.set_reset_();
    var S_list = new Sk.builtin.list(S);
    // python sorts sets on init, but not thereafter.
    // Skulpt seems to init a new set each time you add/remove something
    //Sk.builtin.list.prototype['sort'].func_code(S);
    for (var it = S_list.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
    {
        Sk.builtin.set.prototype['add'].func_code(this, i);
    }

    this.__class__ = Sk.builtin.set;

    this["v"] = this.v;
    return this;
};


Sk.builtin.set.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('set', Sk.builtin.set);

Sk.builtin.set.prototype.set_iter_ = function()
{
    var ret = Sk.builtin.dict.prototype['keys'].func_code(this['v']);
    return ret.tp$iter();
};

Sk.builtin.set.prototype.set_reset_ = function()
{
    this.v = new Sk.builtin.dict([]);
};

Sk.builtin.set.prototype.tp$name = 'set';
Sk.builtin.set.prototype['$r'] = function()
{
    var ret = [];
    for (var it = this.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
    {
        ret.push(Sk.misceval.objectRepr(i).v);
    }
    return new Sk.builtin.str('set([' + ret.join(', ') + '])');
};
Sk.builtin.set.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;
// todo; you can't hash a set() -- what should this be?
Sk.builtin.set.prototype.tp$hash = Sk.builtin.object.prototype.HashNotImplemented;

Sk.builtin.set.prototype.tp$richcompare = function(w, op)
{
    // todo; NotImplemented if either isn't a set

    if (this === w && Sk.misceval.opAllowsEquality(op))
        return true;

    // w not a set
    if (!w.__class__ || w.__class__ != Sk.builtin.set)
    {
        // shortcuts for eq/not
        if (op === 'Eq') return false;
        if (op === 'NotEq') return true;

        // todo; other types should have an arbitrary order
        return false;
    }

    var vl = this.sq$length();
    var wl = w.sq$length();

    // easy short-cut
    if (wl !== vl)
    {
        if (op === 'Eq')
            return false;
        if (op === 'NotEq')
            return true;
    }

    // used quite a lot in comparisons.
    var isSub = false;
    var isSuper = false;

    // gather common info
    switch (op)
    {
        case 'Lt':
        case 'LtE':
        case 'Eq':
        case 'NotEq':
            isSub = Sk.builtin.set.prototype['issubset'].func_code(this, w);
            break;
        case 'Gt':
        case 'GtE':
            isSuper = Sk.builtin.set.prototype['issuperset'].func_code(this, w);
            break;
        default:
            goog.asserts.fail();
    }

    switch (op)
    {
        case 'Lt':
            return vl < wl && isSub;
        case 'LtE':
        case 'Eq':  // we already know that the lengths are equal
            return isSub;
        case 'NotEq':
            return !isSub;
        case 'Gt':
            return vl > wl && isSuper;
        case 'GtE':
            return isSuper;
    }
};

Sk.builtin.set.prototype.tp$iter = Sk.builtin.set.prototype.set_iter_;
Sk.builtin.set.prototype.sq$length = function() { return this['v'].mp$length(); }

Sk.builtin.set.prototype['isdisjoint'] = new Sk.builtin.func(function(self, other)
{
    // requires all items in self to not be in other
    for (var it = self.tp$iter(), item = it.tp$iternext(); item !== undefined; item = it.tp$iternext())
    {
        var isIn = Sk.abstr.sequenceContains(other, item);
        if (isIn)
        {
            return Sk.builtin.bool.false$;
        }
    }
    return Sk.builtin.bool.true$;
});

Sk.builtin.set.prototype['issubset'] = new Sk.builtin.func(function(self, other)
{
    var selfLength = self.sq$length();
    var otherLength = other.sq$length();
    if (selfLength > otherLength)
    {
        // every item in this set can't be in other if it's shorter!
        return Sk.builtin.bool.false$;
    }
    for (var it = self.tp$iter(), item = it.tp$iternext(); item !== undefined; item = it.tp$iternext())
    {
        var isIn = Sk.abstr.sequenceContains(other, item);
        if (!isIn)
        {
            return Sk.builtin.bool.false$;
        }
    }
    return Sk.builtin.bool.true$;
});

Sk.builtin.set.prototype['issuperset'] = new Sk.builtin.func(function(self, other)
{
    return Sk.builtin.set.prototype['issubset'].func_code(other, self);
});

Sk.builtin.set.prototype['union'] = new Sk.builtin.func(function(self)
{
    var S = new Sk.builtin.set(self);
    for (var i=1; i < arguments.length; i++)
    {
        Sk.builtin.set.prototype['update'].func_code(S, arguments[i]);
    }
    return S;
});

Sk.builtin.set.prototype['intersection'] = new Sk.builtin.func(function(self)
{
    var S = Sk.builtin.set.prototype['copy'].func_code(self);
    arguments[0] = S;
    Sk.builtin.set.prototype['intersection_update'].func_code.apply(null, arguments);
    return S;
});

Sk.builtin.set.prototype['difference'] = new Sk.builtin.func(function(self, other)
{
    var S = Sk.builtin.set.prototype['copy'].func_code(self);
    arguments[0] = S;
    Sk.builtin.set.prototype['difference_update'].func_code.apply(null, arguments);
    return S;
});

Sk.builtin.set.prototype['symmetric_difference'] = new Sk.builtin.func(function(self, other)
{
    var S = Sk.builtin.set.prototype['union'].func_code(self, other);
    for (var it = S.tp$iter(), item = it.tp$iternext(); item !== undefined; item = it.tp$iternext())
    {
        if ( Sk.abstr.sequenceContains(self, item) && Sk.abstr.sequenceContains(other, item) )
        {
            Sk.builtin.set.prototype['discard'].func_code(S, item);
        }
    }
    return S;
});

Sk.builtin.set.prototype['copy'] = new Sk.builtin.func(function(self)
{
    return new Sk.builtin.set(self);
});

Sk.builtin.set.prototype['update'] = new Sk.builtin.func(function(self, other)
{
    for (var it = other.tp$iter(), item = it.tp$iternext(); item !== undefined; item = it.tp$iternext())
    {
        Sk.builtin.set.prototype['add'].func_code(self, item);
    }
    return Sk.builtin.none.none$;
});

Sk.builtin.set.prototype['intersection_update'] = new Sk.builtin.func(function(self, other)
{
    for (var it = self.tp$iter(), item = it.tp$iternext(); item !== undefined; item = it.tp$iternext())
    {
        for (var i=1; i < arguments.length; i++)
        {
            if (!Sk.abstr.sequenceContains(arguments[i], item))
            {
                Sk.builtin.set.prototype['discard'].func_code(self, item);
                break;
            }
        }
    }
    return Sk.builtin.none.none$;
});

Sk.builtin.set.prototype['difference_update'] = new Sk.builtin.func(function(self, other)
{
    for (var it = self.tp$iter(), item = it.tp$iternext(); item !== undefined; item = it.tp$iternext())
    {
        for (var i=1; i < arguments.length; i++)
        {
            if (Sk.abstr.sequenceContains(arguments[i], item))
            {
                Sk.builtin.set.prototype['discard'].func_code(self, item);
                break;
            }
        }
    }
    return Sk.builtin.none.none$;
});

Sk.builtin.set.prototype['symmetric_difference_update'] = new Sk.builtin.func(function(self, other)
{
    var sd = Sk.builtin.set.prototype['symmetric_difference'].func_code(self, other);
    self.set_reset_();
    Sk.builtin.set.prototype['update'].func_code(self, sd);
    return Sk.builtin.none.none$;
});


Sk.builtin.set.prototype['add'] = new Sk.builtin.func(function(self, item)
{
    self.v.mp$ass_subscript(item, true);
    return Sk.builtin.none.none$;
});

Sk.builtin.set.prototype['discard'] = new Sk.builtin.func(function(self, item)
{
    Sk.builtin.dict.prototype['pop'].func_code(self.v, item, 
					       Sk.builtin.none.none$);
    return Sk.builtin.none.none$;
});

Sk.builtin.set.prototype['pop'] = new Sk.builtin.func(function(self)
{
    if (self.sq$length() === 0)
    {
        throw new Sk.builtin.KeyError("pop from an empty set");
    }

    var it = self.tp$iter(), item = it.tp$iternext();
    Sk.builtin.set.prototype['discard'].func_code(self, item);
    return item;
});

Sk.builtin.set.prototype['remove'] = new Sk.builtin.func(function(self, item)
{
    self.v.mp$del_subscript(item);
    return Sk.builtin.none.none$;
});


goog.exportSymbol("Sk.builtin.set", Sk.builtin.set);/**
 * @constructor
 */
Sk.builtin.module = function()
{
};
goog.exportSymbol("Sk.builtin.module", Sk.builtin.module);

Sk.builtin.module.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('module', Sk.builtin.module);
Sk.builtin.module.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;
Sk.builtin.module.prototype.tp$setattr = Sk.builtin.object.prototype.GenericSetAttr;
/**
 * @constructor
 * @param {Function} code javascript code object for the function
 * @param {Object} globals where this function was defined
 * @param {Object} args arguments to the original call (stored into locals for
 * the generator to reenter)
 * @param {Object=} closure dict of free variables
 * @param {Object=} closure2 another dict of free variables that will be
 * merged into 'closure'. there's 2 to simplify generated code (one is $free,
 * the other is $cell)
 *
 * co_varnames and co_name come from generated code, must access as dict.
 */
Sk.builtin.generator = function(code, globals, args, closure, closure2)
{
    if (!code) return; // ctor hack
    this.func_code = code;
    this.func_globals = globals || null;
    this.gi$running = false;
    this['gi$resumeat'] = 0;
    this['gi$sentvalue'] = undefined;
    this['gi$locals'] = {};
    if (args.length > 0)
    {
        // store arguments into locals because they have to be maintained
        // too. 'fast' var lookups are locals in generator functions.
        for (var i = 0; i < code['co_varnames'].length; ++i)
            this['gi$locals'][code['co_varnames'][i]] = args[i];
    }
    if (closure2 !== undefined)
    {
        // todo; confirm that modification here can't cause problems
        for (var k in closure2)
            closure[k] = closure2[k];
    }
    //print(JSON.stringify(closure));
    this.func_closure = closure;
    return this;
};
goog.exportSymbol("Sk.builtin.generator", Sk.builtin.generator);

Sk.builtin.generator.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;

Sk.builtin.generator.prototype.tp$iter = function()
{
    return this;
};

Sk.builtin.generator.prototype.tp$iternext = function(yielded)
{
    this.gi$running = true;
    if (yielded === undefined) yielded = null;
    this['gi$sentvalue'] = yielded;

    // note: functions expect 'this' to be globals to avoid having to
    // slice/unshift onto the main args
    var args = [ this ];
    if (this.func_closure)
        args.push(this.func_closure);
    var ret = this.func_code.apply(this.func_globals, args); 
    //print("ret", JSON.stringify(ret));
    this.gi$running = false;
    goog.asserts.assert(ret !== undefined);
    if (ret !== null)
    {
        // returns a pair: resume target and yielded value
        this['gi$resumeat'] = ret[0];
        ret = ret[1];
    }
    else
    {
        // todo; StopIteration
        return undefined;
    }
    //print("returning:", JSON.stringify(ret));
    return ret;
};

Sk.builtin.generator.prototype['next'] = new Sk.builtin.func(function(self)
{
    return self.tp$iternext();
});

Sk.builtin.generator.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('generator', Sk.builtin.generator);

Sk.builtin.generator.prototype['$r'] = function()
{
    return new Sk.builtin.str("<generator object " + this.func_code['co_name'].v + ">");
};

Sk.builtin.generator.prototype['send'] = new Sk.builtin.func(function(self, value)
{
    return self.tp$iternext(value);
});

/**
 * Creates a generator with the specified next function and additional
 * instance data. Useful in Javascript-implemented modules to implement
 * the __iter__ method.
 */
Sk.builtin.makeGenerator = function(next, data)
{
  var gen = new Sk.builtin.generator(null,null,null);
  gen.tp$iternext = next;

  for (var key in data)
  {
    if (data.hasOwnProperty(key))
    {
      gen[key] = data[key];
    }
  }

  return gen;
};
goog.exportSymbol("Sk.builtin.makeGenerator", Sk.builtin.makeGenerator);

/**
 * @constructor
 * @param {Sk.builtin.str} name
 * @param {Sk.builtin.str} mode
 * @param {Object} buffering
 */
Sk.builtin.file = function(name, mode, buffering)
{
    this.mode = mode;
    this.name = name;
    this.closed = false;
	if ( Sk.inBrowser ) {  // todo:  Maybe provide a replaceable function for non-import files
        var elem = document.getElementById(name.v);
        if ( elem == null) {
            throw new Sk.builtin.IOError("[Errno 2] No such file or directory: '"+name.v+"'");
        } else {
           if( elem.nodeName.toLowerCase() == "textarea") {
               this.data$ = elem.value;
           }
           else {
	           this.data$ = elem.textContent;
	       }
	    }
	} else {
  		this.data$ = Sk.read(name.v);
	}
	this.lineList = this.data$.split("\n");
	this.lineList = this.lineList.slice(0,-1);
	for(var i in this.lineList) {
		this.lineList[i] = this.lineList[i]+'\n';
	}
	this.currentLine = 0;
    this.pos$ = 0;

	this.__class__ = Sk.builtin.file;

    return this;
};

Sk.builtin.file.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('file', Sk.builtin.file);

Sk.builtin.file.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;

Sk.builtin.file.prototype['$r'] = function()
{
    return new Sk.builtin.str("<"
        + (this.closed ? "closed" : "open")
        + "file '"
        + this.name
        + "', mode '"
        + this.mode
        + "'>");
};

Sk.builtin.file.prototype.tp$iter = function()
{
    var allLines = this.lineList;

    var ret =
    {
        tp$iter: function() { return ret; },
        $obj: this,
        $index: 0,
        $lines: allLines,
        tp$iternext: function()
        {
            if (ret.$index >= ret.$lines.length) return undefined;
            return new Sk.builtin.str(ret.$lines[ret.$index++]);
        }
    };
    return ret;
};


Sk.builtin.file.prototype['close'] = new Sk.builtin.func(function(self)
{
    self.closed = true;
});


Sk.builtin.file.prototype['flush'] = new Sk.builtin.func(function(self) {});
Sk.builtin.file.prototype['fileno'] = new Sk.builtin.func(function(self) { return 10; }); // > 0, not 1/2/3
Sk.builtin.file.prototype['isatty'] = new Sk.builtin.func(function(self) { return false; });


Sk.builtin.file.prototype['read'] = new Sk.builtin.func(function(self, size)
{
    if (self.closed) throw new Sk.builtin.ValueError("I/O operation on closed file");
    var len = self.data$.length;
    if (size === undefined) size = len;
    var ret = new Sk.builtin.str(self.data$.substr(self.pos$, size));
    self.pos$ += size;
    if (self.pos$ >= len) self.pos$ = len;
    return ret;
});

Sk.builtin.file.prototype['readline'] = new Sk.builtin.func(function(self, size)
{
	var line = "";
	if (self.currentLine < self.lineList.length) {
		line = self.lineList[self.currentLine];
    	self.currentLine++;
	}
	return new Sk.builtin.str(line);
});

Sk.builtin.file.prototype['readlines'] = new Sk.builtin.func(function(self, sizehint)
{
    var arr = [];
    for(var i = self.currentLine; i < self.lineList.length; i++) {
		arr.push(new Sk.builtin.str(self.lineList[i]));
    }
	return new Sk.builtin.list(arr);
});

Sk.builtin.file.prototype['seek'] = new Sk.builtin.func(function(self, offset, whence)
{
    if (whence === undefined ) whence = 1;
    if (whence == 1) {
		self.pos$ = offset;
	} else {
		self.pos$ = self.data$ + offset;
	}
});

Sk.builtin.file.prototype['tell'] =  new Sk.builtin.func(function(self)
{
    return self.pos$;
});


Sk.builtin.file.prototype['truncate'] = new Sk.builtin.func(function(self, size)
{
    goog.asserts.fail();
});

Sk.builtin.file.prototype['write'] = new Sk.builtin.func(function(self, str)
{
    goog.asserts.fail();
});


goog.exportSymbol("Sk.builtin.file", Sk.builtin.file);
Sk.ffi = Sk.ffi || {};

/**
 * maps from Javascript Object/Array/string to Python dict/list/str.
 *
 * only works on basic objects that are being used as storage, doesn't handle
 * functions, etc.
 */
Sk.ffi.remapToPy = function(obj)
{
    if (Object.prototype.toString.call(obj) === "[object Array]")
    {
        var arr = [];
        for (var i = 0; i < obj.length; ++i)
            arr.push(Sk.ffi.remapToPy(obj[i]));
        return new Sk.builtin.list(arr);
    }
    else if (typeof obj === "object")
    {
        var kvs = [];
        for (var k in obj)
        {
            kvs.push(Sk.ffi.remapToPy(k));
            kvs.push(Sk.ffi.remapToPy(obj[k]));
        }
        return new Sk.builtin.dict(kvs);
    }
    else if (typeof obj === "string")
        return new Sk.builtin.str(obj);
    else if (typeof obj === "number")
		return new Sk.builtin.nmber(obj, undefined);
	else if (typeof obj === "boolean")
        return obj;
    goog.asserts.fail("unhandled remap type " + typeof(obj));
};
goog.exportSymbol("Sk.ffi.remapToPy", Sk.ffi.remapToPy);

/**
 * maps from Python dict/list/str to Javascript Object/Array/string.
 */
Sk.ffi.remapToJs = function(obj)
{
    if (obj instanceof Sk.builtin.dict)
    {
        var ret = {};
        for (var iter = obj.tp$iter(), k = iter.tp$iternext();
                k !== undefined;
                k = iter.tp$iternext())
        {
            var v = obj.mp$subscript(k);
            if (v === undefined)
                v = null;
            var kAsJs = Sk.ffi.remapToJs(k);
            // todo; assert that this is a reasonble lhs?
            ret[kAsJs] = Sk.ffi.remapToJs(v);
        }
        return ret;
    }
    else if (obj instanceof Sk.builtin.list)
    {
        var ret = [];
        for (var i = 0; i < obj.v.length; ++i)
            ret.push(Sk.ffi.remapToJs(obj.v[i]));
        return ret;
    }
	else if (obj instanceof Sk.builtin.nmber)
	{
		return Sk.builtin.asnum$(obj);
	}
	else if (obj instanceof Sk.builtin.lng)
	{
		return Sk.builtin.asnum$(obj);
	}
    else if (typeof obj === "number" || typeof obj === "boolean")
        return obj;
    else
        return obj.v;
};
goog.exportSymbol("Sk.ffi.remapToJs", Sk.ffi.remapToJs);

Sk.ffi.callback = function(fn)
{
    if (fn === undefined) return fn;
    return function() {
        return Sk.misceval.apply(fn, undefined, undefined, undefined, Array.prototype.slice.call(arguments, 0));
    };
};
goog.exportSymbol("Sk.ffi.callback", Sk.ffi.callback);

Sk.ffi.stdwrap = function(type, towrap)
{
    var inst = new type();
    inst['v'] = towrap;
    return inst;
};
goog.exportSymbol("Sk.ffi.stdwrap", Sk.ffi.stdwrap);

/**
 * for when the return type might be one of a variety of basic types.
 * number|string, etc.
 */
Sk.ffi.basicwrap = function(obj)
{
	if (obj instanceof Sk.builtin.nmber)
		return Sk.builtin.asnum$(obj);
	if (obj instanceof Sk.builtin.lng)
		return Sk.builtin.asnum$(obj);
    if (typeof obj === "number" || typeof obj === "boolean")
        return obj;
    if (typeof obj === "string")
        return new Sk.builtin.str(obj);
    goog.asserts.fail("unexpected type for basicwrap");
};
goog.exportSymbol("Sk.ffi.basicwrap", Sk.ffi.basicwrap);

Sk.ffi.unwrapo = function(obj)
{
    if (obj === undefined) return undefined;
    return obj['v'];
};
goog.exportSymbol("Sk.ffi.unwrapo", Sk.ffi.unwrapo);

Sk.ffi.unwrapn = function(obj)
{
    if (obj === null) return null;
    return obj['v'];
};
goog.exportSymbol("Sk.ffi.unwrapn", Sk.ffi.unwrapn);
/**
 * @constructor
 * @param {Object} iterable
 * @param {number=} start
 * @extends Sk.builtin.object
 */
Sk.builtin.enumerate = function(iterable, start)
{
    if (!(this instanceof Sk.builtin.enumerate)) return new Sk.builtin.enumerate(iterable, start);

    Sk.builtin.pyCheckArgs("enumerate", arguments, 1, 2);
    if (!Sk.builtin.checkIterable(iterable)) {
        throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(iterable) + "' object is not iterable");
    }
    if (start !== undefined) {
        if (!Sk.misceval.isIndex(start)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(start) + "' object cannot be interpreted as an index");
        } else {
	    start = Sk.misceval.asIndex(start);
	}
    }
    else {
	start = 0;
    }

    var it = iterable.tp$iter();

    this.tp$iter = function() { return this; };
    this.$index = start;
    this.tp$iternext = function () {
        // todo; StopIteration
        var next = it.tp$iternext();
        if (next === undefined) return undefined;
	var idx = Sk.builtin.assk$(this.$index++, Sk.builtin.nmber.int$);
        return new Sk.builtin.tuple([idx, next]);
    };

    this.__class__ = Sk.builtin.enumerate;

    return this;
}

Sk.builtin.enumerate.prototype.tp$name = "enumerate";
Sk.builtin.enumerate.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj('enumerate', Sk.builtin.enumerate);

Sk.builtin.enumerate.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;

Sk.builtin.enumerate.prototype['__iter__'] = new Sk.builtin.func(function(self)
{
    return self.tp$iter();
});								 

Sk.builtin.enumerate.prototype['next'] = new Sk.builtin.func(function(self)
{
    return self.tp$iternext();
});								 
/*
 * This is a port of tokenize.py by Ka-Ping Yee.
 *
 * each call to readline should return one line of input as a string, or
 * undefined if it's finished.
 *
 * callback is called for each token with 5 args:
 * 1. the token type
 * 2. the token string
 * 3. [ start_row, start_col ]
 * 4. [ end_row, end_col ]
 * 5. logical line where the token was found, including continuation lines
 *
 * callback can return true to abort.
 *
 */

/**
 * @constructor
 */
Sk.Tokenizer = function (filename, interactive, callback)
{
    this.filename = filename;
    this.callback = callback;
    this.lnum = 0;
    this.parenlev = 0;
    this.continued = false;
    this.namechars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
    this.numchars = '0123456789';
    this.contstr = '';
    this.needcont = false;
    this.contline = undefined;
    this.indents = [0];
    this.endprog = /.*/;
    this.strstart = [-1,-1];
    this.interactive = interactive;
    this.doneFunc = function()
    {
        for (var i = 1; i < this.indents.length; ++i) // pop remaining indent levels
        {
            if (this.callback(Sk.Tokenizer.Tokens.T_DEDENT, '', [this.lnum, 0], [this.lnum, 0], '')) return 'done';
        }
        if (this.callback(Sk.Tokenizer.Tokens.T_ENDMARKER, '', [this.lnum, 0], [this.lnum, 0], '')) return 'done';

        return 'failed';
    };

};

/**
 * @enum {number}
 */
Sk.Tokenizer.Tokens = {
    T_ENDMARKER: 0,
    T_NAME: 1,
    T_NUMBER: 2,
    T_STRING: 3,
    T_NEWLINE: 4,
    T_INDENT: 5,
    T_DEDENT: 6,
    T_LPAR: 7,
    T_RPAR: 8,
    T_LSQB: 9,
    T_RSQB: 10,
    T_COLON: 11,
    T_COMMA: 12,
    T_SEMI: 13,
    T_PLUS: 14,
    T_MINUS: 15,
    T_STAR: 16,
    T_SLASH: 17,
    T_VBAR: 18,
    T_AMPER: 19,
    T_LESS: 20,
    T_GREATER: 21,
    T_EQUAL: 22,
    T_DOT: 23,
    T_PERCENT: 24,
    T_BACKQUOTE: 25,
    T_LBRACE: 26,
    T_RBRACE: 27,
    T_EQEQUAL: 28,
    T_NOTEQUAL: 29,
    T_LESSEQUAL: 30,
    T_GREATEREQUAL: 31,
    T_TILDE: 32,
    T_CIRCUMFLEX: 33,
    T_LEFTSHIFT: 34,
    T_RIGHTSHIFT: 35,
    T_DOUBLESTAR: 36,
    T_PLUSEQUAL: 37,
    T_MINEQUAL: 38,
    T_STAREQUAL: 39,
    T_SLASHEQUAL: 40,
    T_PERCENTEQUAL: 41,
    T_AMPEREQUAL: 42,
    T_VBAREQUAL: 43,
    T_CIRCUMFLEXEQUAL: 44,
    T_LEFTSHIFTEQUAL: 45,
    T_RIGHTSHIFTEQUAL: 46,
    T_DOUBLESTAREQUAL: 47,
    T_DOUBLESLASH: 48,
    T_DOUBLESLASHEQUAL: 49,
    T_AT: 50,
    T_OP: 51,
    T_COMMENT: 52,
    T_NL: 53,
    T_RARROW: 54,
    T_ERRORTOKEN: 55,
    T_N_TOKENS: 56,
    T_NT_OFFSET: 256
};

/** @param {...*} x */
function group(x)
{
    var args = Array.prototype.slice.call(arguments);
    return '(' + args.join('|') + ')'; 
}

/** @param {...*} x */
function any(x) { return group.apply(null, arguments) + "*"; }

/** @param {...*} x */
function maybe(x) { return group.apply(null, arguments) + "?"; }

/* we have to use string and ctor to be able to build patterns up. + on /.../
 * does something strange. */
var Whitespace = "[ \\f\\t]*";
var Comment_ = "#[^\\r\\n]*";
var Ident = "[a-zA-Z_]\\w*";

var Binnumber = '0[bB][01]*';
var Hexnumber = '0[xX][\\da-fA-F]*[lL]?';
var Octnumber = '0[oO]?[0-7]*[lL]?';
var Decnumber = '[1-9]\\d*[lL]?';
var Intnumber = group(Binnumber, Hexnumber, Octnumber, Decnumber);

var Exponent = "[eE][-+]?\\d+";
var Pointfloat = group("\\d+\\.\\d*", "\\.\\d+") + maybe(Exponent);
var Expfloat = '\\d+' + Exponent;
var Floatnumber = group(Pointfloat, Expfloat);
var Imagnumber = group("\\d+[jJ]", Floatnumber + "[jJ]");
var Number_ = group(Imagnumber, Floatnumber, Intnumber);

// tail end of ' string
var Single = "^[^'\\\\]*(?:\\\\.[^'\\\\]*)*'";
// tail end of " string
var Double_= '^[^"\\\\]*(?:\\\\.[^"\\\\]*)*"';
// tail end of ''' string
var Single3 = "[^'\\\\]*(?:(?:\\\\.|'(?!''))[^'\\\\]*)*'''";
// tail end of """ string
var Double3 = '[^"\\\\]*(?:(?:\\\\.|"(?!""))[^"\\\\]*)*"""';
var Triple = group("[ubUB]?[rR]?'''", '[ubUB]?[rR]?"""');
var String_ = group("[uU]?[rR]?'[^\\n'\\\\]*(?:\\\\.[^\\n'\\\\]*)*'",
        '[uU]?[rR]?"[^\\n"\\\\]*(?:\\\\.[^\\n"\\\\]*)*"');

// Because of leftmost-then-longest match semantics, be sure to put the
// longest operators first (e.g., if = came before ==, == would get
// recognized as two instances of =).
var Operator = group("\\*\\*=?", ">>=?", "<<=?", "<>", "!=",
                 "//=?", "->",
                 "[+\\-*/%&|^=<>]=?",
                 "~");

var Bracket = '[\\][(){}]';
var Special = group('\\r?\\n', '[:;.,`@]');
var Funny  = group(Operator, Bracket, Special);

var ContStr = group("[uUbB]?[rR]?'[^\\n'\\\\]*(?:\\\\.[^\\n'\\\\]*)*" +
                group("'", '\\\\\\r?\\n'),
                '[uUbB]?[rR]?"[^\\n"\\\\]*(?:\\\\.[^\\n"\\\\]*)*' +
                group('"', '\\\\\\r?\\n'));
var PseudoExtras = group('\\\\\\r?\\n', Comment_, Triple);
// Need to prefix with "^" as we only want to match what's next
var PseudoToken = "^" + group(PseudoExtras, Number_, Funny, ContStr, Ident);

var pseudoprog;
var single3prog;
var double3prog;
var endprogs = {};

var triple_quoted = {
"'''": true, '"""': true,
"r'''": true, 'r"""': true, "R'''": true, 'R"""': true,
"u'''": true, 'u"""': true, "U'''": true, 'U"""': true,
"b'''": true, 'b"""': true, "B'''": true, 'B"""': true,
"ur'''": true, 'ur"""': true, "Ur'''": true, 'Ur"""': true,
"uR'''": true, 'uR"""': true, "UR'''": true, 'UR"""': true,
"br'''": true, 'br"""': true, "Br'''": true, 'Br"""': true,
"bR'''": true, 'bR"""': true, "BR'''": true, 'BR"""': true
};

var single_quoted = {
"'": true, '"': true,
"r'": true, 'r"': true, "R'": true, 'R"': true,
"u'": true, 'u"': true, "U'": true, 'U"': true,
"b'": true, 'b"': true, "B'": true, 'B"': true,
"ur'": true, 'ur"': true, "Ur'": true, 'Ur"': true,
"uR'": true, 'uR"': true, "UR'": true, 'UR"': true,
"br'": true, 'br"': true, "Br'": true, 'Br"': true,
"bR'": true, 'bR"': true, "BR'": true, 'BR"': true
};

// hack to make closure keep those objects. not sure what a better way is.
(function() {
 for (var k in triple_quoted) {}
 for (var k in single_quoted) {}
 }());


var tabsize = 8;

function contains(a, obj)
{
    var i = a.length;
    while (i--)
    {
        if (a[i] === obj)
        {
            return true;
        }
    }
    return false;
}

function rstrip(input, what)
{
    for (var i = input.length; i > 0; --i)
    {
        if (what.indexOf(input.charAt(i - 1)) === -1) break;
    }
    return input.substring(0, i);
}

Sk.Tokenizer.prototype.generateTokens = function(line)
{
    var endmatch, pos, column, end, max;


    // bnm - Move these definitions in this function otherwise test state is preserved between
    // calls on single3prog and double3prog causing weird errors with having multiple instances
    // of triple quoted strings in the same program.

    var pseudoprog = new RegExp(PseudoToken);
    var single3prog = new RegExp(Single3, "g");
    var double3prog = new RegExp(Double3, "g");

    var endprogs = {     "'": new RegExp(Single, "g"), '"': new RegExp(Double_, "g"),
    "'''": single3prog, '"""': double3prog,
    "r'''": single3prog, 'r"""': double3prog,
    "u'''": single3prog, 'u"""': double3prog,
    "b'''": single3prog, 'b"""': double3prog,
    "ur'''": single3prog, 'ur"""': double3prog,
    "br'''": single3prog, 'br"""': double3prog,
    "R'''": single3prog, 'R"""': double3prog,
    "U'''": single3prog, 'U"""': double3prog,
    "B'''": single3prog, 'B"""': double3prog,
    "uR'''": single3prog, 'uR"""': double3prog,
    "Ur'''": single3prog, 'Ur"""': double3prog,
    "UR'''": single3prog, 'UR"""': double3prog,
    "bR'''": single3prog, 'bR"""': double3prog,
    "Br'''": single3prog, 'Br"""': double3prog,
    "BR'''": single3prog, 'BR"""': double3prog,
    'r': null, 'R': null,
    'u': null, 'U': null,
    'b': null, 'B': null
    };



    if (!line) line = '';
    //print("LINE:'"+line+"'");

    this.lnum += 1;
    pos = 0;
    max = line.length;

    if (this.contstr.length > 0)
    {
        if (!line)
        {
            throw new Sk.builtin.TokenError("EOF in multi-line string", this.filename, this.strstart[0], this.strstart[1], this.contline);
        }
        this.endprog.lastIndex = 0;
        endmatch = this.endprog.test(line);
        if (endmatch)
        {
            pos = end = this.endprog.lastIndex;
            if (this.callback(Sk.Tokenizer.Tokens.T_STRING, this.contstr + line.substring(0,end),
                        this.strstart, [this.lnum, end], this.contline + line))
                return 'done';
            this.contstr = '';
            this.needcont = false;
            this.contline = undefined;
        }
        else if (this.needcont && line.substring(line.length - 2) !== "\\\n" && line.substring(line.length - 3) !== "\\\r\n")
        {
            if (this.callback(Sk.Tokenizer.Tokens.T_ERRORTOKEN, this.contstr + line,
                        this.strstart, [this.lnum, line.length], this.contline))
                return 'done';
            this.contstr = '';
            this.contline = undefined;
            return false;
        }
        else
        {
            this.contstr += line;
            this.contline = this.contline + line;
            return false;
        }
    }
    else if (this.parenlev === 0 && !this.continued)
    {
        if (!line) return this.doneFunc();
        column = 0;
        while (pos < max)
        {
            if (line.charAt(pos) === ' ') column += 1;
            else if (line.charAt(pos) === '\t') column = (column/tabsize + 1)*tabsize;
            else if (line.charAt(pos) === '\f') column = 0;
            else break;
            pos = pos + 1;
        }
        if (pos === max) return this.doneFunc();

        if ("#\r\n".indexOf(line.charAt(pos)) !== -1) // skip comments or blank lines
        {
            if (line.charAt(pos) === '#')
            {
                var comment_token = rstrip(line.substring(pos), '\r\n');
                var nl_pos = pos + comment_token.length;
                if (this.callback(Sk.Tokenizer.Tokens.T_COMMENT, comment_token,
                            [this.lnum, pos], [this.lnum, pos + comment_token.length], line))
                    return 'done';
                //print("HERE:1");
                if (this.callback(Sk.Tokenizer.Tokens.T_NL, line.substring(nl_pos),
                            [this.lnum, nl_pos], [this.lnum, line.length], line))
                    return 'done';
                return false;
            }
            else
            {
                //print("HERE:2");
                if (this.callback(Sk.Tokenizer.Tokens.T_NL, line.substring(pos),
                            [this.lnum, pos], [this.lnum, line.length], line))
                    return 'done';
                if (!this.interactive) return false;
            }
        }

        if (column > this.indents[this.indents.length - 1]) // count indents or dedents
        {
            this.indents.push(column);
            if (this.callback(Sk.Tokenizer.Tokens.T_INDENT, line.substring(0, pos), [this.lnum, 0], [this.lnum, pos], line))
                return 'done';
        }
        while (column < this.indents[this.indents.length - 1])
        {
            if (!contains(this.indents, column))
            {
                throw new Sk.builtin.IndentationError("unindent does not match any outer indentation level",
                        this.filename, this.lnum, pos, line);
            }
            this.indents.splice(this.indents.length - 1, 1);
            //print("dedent here");
            if (this.callback(Sk.Tokenizer.Tokens.T_DEDENT, '', [this.lnum, pos], [this.lnum, pos], line))
                return 'done';
        }
    }
    else // continued statement
    {
        if (!line)
        {
            throw new Sk.builtin.TokenError("EOF in multi-line statement", this.filename, this.lnum, 0, line);
        }
        this.continued = false;
    }

    while (pos < max)
    {
        //print("pos:"+pos+":"+max);
        // js regexes don't return any info about matches, other than the
        // content. we'd like to put a \w+ before pseudomatch, but then we
        // can't get any data
        var capos = line.charAt(pos);
        while (capos === ' ' || capos === '\f' || capos === '\t')
        {
            pos += 1;
            capos = line.charAt(pos);
        }
        pseudoprog.lastIndex = 0;
        var pseudomatch = pseudoprog.exec(line.substring(pos));
        if (pseudomatch)
        {
            var start = pos;
            end = start + pseudomatch[1].length;
            var spos = [this.lnum, start];
            var epos = [this.lnum, end];
            pos = end;
            var token = line.substring(start, end);
            var initial = line.charAt(start);
            //Sk.debugout("token:",token, "initial:",initial, start, end);
            if (this.numchars.indexOf(initial) !== -1 || (initial === '.' && token !== '.'))
            {
                if (this.callback(Sk.Tokenizer.Tokens.T_NUMBER, token, spos, epos, line)) return 'done';
            }
            else if (initial === '\r' || initial === '\n')
            {
                var newl = Sk.Tokenizer.Tokens.T_NEWLINE;
                //print("HERE:3");
                if (this.parenlev > 0) newl = Sk.Tokenizer.Tokens.T_NL;
                if (this.callback(newl, token, spos, epos, line)) return 'done';
            }
            else if (initial === '#')
            {
                if (this.callback(Sk.Tokenizer.Tokens.T_COMMENT, token, spos, epos, line)) return 'done';
            }
            else if (triple_quoted.hasOwnProperty(token))
            {
                this.endprog = endprogs[token];
                this.endprog.lastIndex = 0;
                endmatch = this.endprog.test(line.substring(pos));
                if (endmatch)
                {
                    pos = this.endprog.lastIndex + pos;
                    token = line.substring(start, pos);
                    if (this.callback(Sk.Tokenizer.Tokens.T_STRING, token, spos, [this.lnum, pos], line)) return 'done';
                }
                else
                {
                    this.strstart = [this.lnum, start];
                    this.contstr = line.substring(start);
                    this.contline = line;
                    return false;
                }
            }
            else if (single_quoted.hasOwnProperty(initial) ||
                    single_quoted.hasOwnProperty(token.substring(0, 2)) ||
                    single_quoted.hasOwnProperty(token.substring(0, 3)))
            {
                if (token[token.length - 1] === '\n')
                {
                    this.strstart = [this.lnum, start];
                    this.endprog = endprogs[initial] || endprogs[token[1]] || endprogs[token[2]];
                    this.contstr = line.substring(start);
                    this.needcont = true;
                    this.contline = line;
                    //print("i, t1, t2", initial, token[1], token[2]);
                    //print("ep, cs", this.endprog, this.contstr);
                    return false;
                }
                else
                {
                    if (this.callback(Sk.Tokenizer.Tokens.T_STRING, token, spos, epos, line)) return 'done';
                }
            }
            else if (this.namechars.indexOf(initial) !== -1)
            {
                if (this.callback(Sk.Tokenizer.Tokens.T_NAME, token, spos, epos, line)) return 'done';
            }
            else if (initial === '\\')
            {
                //print("HERE:4");
                if (this.callback(Sk.Tokenizer.Tokens.T_NL, token, spos, [this.lnum, pos], line)) return 'done';
                this.continued = true;
            }
            else
            {
                if ('([{'.indexOf(initial) !== -1) this.parenlev += 1;
                else if (')]}'.indexOf(initial) !== -1) this.parenlev -= 1;
                if (this.callback(Sk.Tokenizer.Tokens.T_OP, token, spos, epos, line)) return 'done';
            }
        }
        else
        {
            if (this.callback(Sk.Tokenizer.Tokens.T_ERRORTOKEN, line.charAt(pos),
                        [this.lnum, pos], [this.lnum, pos+1], line))
                return 'done';
            pos += 1;
        }
    }

    return false;
};

Sk.Tokenizer.tokenNames = {
    0: 'T_ENDMARKER', 1: 'T_NAME', 2: 'T_NUMBER', 3: 'T_STRING', 4: 'T_NEWLINE',
    5: 'T_INDENT', 6: 'T_DEDENT', 7: 'T_LPAR', 8: 'T_RPAR', 9: 'T_LSQB',
    10: 'T_RSQB', 11: 'T_COLON', 12: 'T_COMMA', 13: 'T_SEMI', 14: 'T_PLUS',
    15: 'T_MINUS', 16: 'T_STAR', 17: 'T_SLASH', 18: 'T_VBAR', 19: 'T_AMPER',
    20: 'T_LESS', 21: 'T_GREATER', 22: 'T_EQUAL', 23: 'T_DOT', 24: 'T_PERCENT',
    25: 'T_BACKQUOTE', 26: 'T_LBRACE', 27: 'T_RBRACE', 28: 'T_EQEQUAL', 29: 'T_NOTEQUAL',
    30: 'T_LESSEQUAL', 31: 'T_GREATEREQUAL', 32: 'T_TILDE', 33: 'T_CIRCUMFLEX', 34: 'T_LEFTSHIFT',
    35: 'T_RIGHTSHIFT', 36: 'T_DOUBLESTAR', 37: 'T_PLUSEQUAL', 38: 'T_MINEQUAL', 39: 'T_STAREQUAL',
    40: 'T_SLASHEQUAL', 41: 'T_PERCENTEQUAL', 42: 'T_AMPEREQUAL', 43: 'T_VBAREQUAL', 44: 'T_CIRCUMFLEXEQUAL',
    45: 'T_LEFTSHIFTEQUAL', 46: 'T_RIGHTSHIFTEQUAL', 47: 'T_DOUBLESTAREQUAL', 48: 'T_DOUBLESLASH', 49: 'T_DOUBLESLASHEQUAL',
    50: 'T_AT', 51: 'T_OP', 52: 'T_COMMENT', 53: 'T_NL', 54: 'T_RARROW',
    55: 'T_ERRORTOKEN', 56: 'T_N_TOKENS',
    256: 'T_NT_OFFSET'
};

goog.exportSymbol("Sk.Tokenizer", Sk.Tokenizer);
goog.exportSymbol("Sk.Tokenizer.prototype.generateTokens", Sk.Tokenizer.prototype.generateTokens);
goog.exportSymbol("Sk.Tokenizer.tokenNames", Sk.Tokenizer.tokenNames);
// generated by pgen/main.py
Sk.OpMap = {
"(": Sk.Tokenizer.Tokens.T_LPAR,
")": Sk.Tokenizer.Tokens.T_RPAR,
"[": Sk.Tokenizer.Tokens.T_LSQB,
"]": Sk.Tokenizer.Tokens.T_RSQB,
":": Sk.Tokenizer.Tokens.T_COLON,
",": Sk.Tokenizer.Tokens.T_COMMA,
";": Sk.Tokenizer.Tokens.T_SEMI,
"+": Sk.Tokenizer.Tokens.T_PLUS,
"-": Sk.Tokenizer.Tokens.T_MINUS,
"*": Sk.Tokenizer.Tokens.T_STAR,
"/": Sk.Tokenizer.Tokens.T_SLASH,
"|": Sk.Tokenizer.Tokens.T_VBAR,
"&": Sk.Tokenizer.Tokens.T_AMPER,
"<": Sk.Tokenizer.Tokens.T_LESS,
">": Sk.Tokenizer.Tokens.T_GREATER,
"=": Sk.Tokenizer.Tokens.T_EQUAL,
".": Sk.Tokenizer.Tokens.T_DOT,
"%": Sk.Tokenizer.Tokens.T_PERCENT,
"`": Sk.Tokenizer.Tokens.T_BACKQUOTE,
"{": Sk.Tokenizer.Tokens.T_LBRACE,
"}": Sk.Tokenizer.Tokens.T_RBRACE,
"@": Sk.Tokenizer.Tokens.T_AT,
"==": Sk.Tokenizer.Tokens.T_EQEQUAL,
"!=": Sk.Tokenizer.Tokens.T_NOTEQUAL,
"<>": Sk.Tokenizer.Tokens.T_NOTEQUAL,
"<=": Sk.Tokenizer.Tokens.T_LESSEQUAL,
">=": Sk.Tokenizer.Tokens.T_GREATEREQUAL,
"~": Sk.Tokenizer.Tokens.T_TILDE,
"^": Sk.Tokenizer.Tokens.T_CIRCUMFLEX,
"<<": Sk.Tokenizer.Tokens.T_LEFTSHIFT,
">>": Sk.Tokenizer.Tokens.T_RIGHTSHIFT,
"**": Sk.Tokenizer.Tokens.T_DOUBLESTAR,
"+=": Sk.Tokenizer.Tokens.T_PLUSEQUAL,
"-=": Sk.Tokenizer.Tokens.T_MINEQUAL,
"*=": Sk.Tokenizer.Tokens.T_STAREQUAL,
"/=": Sk.Tokenizer.Tokens.T_SLASHEQUAL,
"%=": Sk.Tokenizer.Tokens.T_PERCENTEQUAL,
"&=": Sk.Tokenizer.Tokens.T_AMPEREQUAL,
"|=": Sk.Tokenizer.Tokens.T_VBAREQUAL,
"^=": Sk.Tokenizer.Tokens.T_CIRCUMFLEXEQUAL,
"<<=": Sk.Tokenizer.Tokens.T_LEFTSHIFTEQUAL,
">>=": Sk.Tokenizer.Tokens.T_RIGHTSHIFTEQUAL,
"**=": Sk.Tokenizer.Tokens.T_DOUBLESTAREQUAL,
"//": Sk.Tokenizer.Tokens.T_DOUBLESLASH,
"//=": Sk.Tokenizer.Tokens.T_DOUBLESLASHEQUAL,
"->": Sk.Tokenizer.Tokens.T_RARROW
};
Sk.ParseTables = {
sym:
{and_expr: 257,
 and_test: 258,
 arglist: 259,
 argument: 260,
 arith_expr: 261,
 assert_stmt: 262,
 atom: 263,
 augassign: 264,
 break_stmt: 265,
 classdef: 266,
 comp_op: 267,
 comparison: 268,
 compound_stmt: 269,
 continue_stmt: 270,
 decorated: 271,
 decorator: 272,
 decorators: 273,
 del_stmt: 274,
 dictmaker: 275,
 dotted_as_name: 276,
 dotted_as_names: 277,
 dotted_name: 278,
 encoding_decl: 279,
 eval_input: 280,
 except_clause: 281,
 exec_stmt: 282,
 expr: 283,
 expr_stmt: 284,
 exprlist: 285,
 factor: 286,
 file_input: 287,
 flow_stmt: 288,
 for_stmt: 289,
 fpdef: 290,
 fplist: 291,
 funcdef: 292,
 gen_for: 293,
 gen_if: 294,
 gen_iter: 295,
 global_stmt: 296,
 if_stmt: 297,
 import_as_name: 298,
 import_as_names: 299,
 import_from: 300,
 import_name: 301,
 import_stmt: 302,
 lambdef: 303,
 list_for: 304,
 list_if: 305,
 list_iter: 306,
 listmaker: 307,
 not_test: 308,
 old_lambdef: 309,
 old_test: 310,
 or_test: 311,
 parameters: 312,
 pass_stmt: 313,
 power: 314,
 print_stmt: 315,
 raise_stmt: 316,
 return_stmt: 317,
 shift_expr: 318,
 simple_stmt: 319,
 single_input: 256,
 sliceop: 320,
 small_stmt: 321,
 stmt: 322,
 subscript: 323,
 subscriptlist: 324,
 suite: 325,
 term: 326,
 test: 327,
 testlist: 328,
 testlist1: 329,
 testlist_gexp: 330,
 testlist_safe: 331,
 trailer: 332,
 try_stmt: 333,
 varargslist: 334,
 while_stmt: 335,
 with_stmt: 336,
 with_var: 337,
 xor_expr: 338,
 yield_expr: 339,
 yield_stmt: 340},
number2symbol:
{256: 'single_input',
 257: 'and_expr',
 258: 'and_test',
 259: 'arglist',
 260: 'argument',
 261: 'arith_expr',
 262: 'assert_stmt',
 263: 'atom',
 264: 'augassign',
 265: 'break_stmt',
 266: 'classdef',
 267: 'comp_op',
 268: 'comparison',
 269: 'compound_stmt',
 270: 'continue_stmt',
 271: 'decorated',
 272: 'decorator',
 273: 'decorators',
 274: 'del_stmt',
 275: 'dictmaker',
 276: 'dotted_as_name',
 277: 'dotted_as_names',
 278: 'dotted_name',
 279: 'encoding_decl',
 280: 'eval_input',
 281: 'except_clause',
 282: 'exec_stmt',
 283: 'expr',
 284: 'expr_stmt',
 285: 'exprlist',
 286: 'factor',
 287: 'file_input',
 288: 'flow_stmt',
 289: 'for_stmt',
 290: 'fpdef',
 291: 'fplist',
 292: 'funcdef',
 293: 'gen_for',
 294: 'gen_if',
 295: 'gen_iter',
 296: 'global_stmt',
 297: 'if_stmt',
 298: 'import_as_name',
 299: 'import_as_names',
 300: 'import_from',
 301: 'import_name',
 302: 'import_stmt',
 303: 'lambdef',
 304: 'list_for',
 305: 'list_if',
 306: 'list_iter',
 307: 'listmaker',
 308: 'not_test',
 309: 'old_lambdef',
 310: 'old_test',
 311: 'or_test',
 312: 'parameters',
 313: 'pass_stmt',
 314: 'power',
 315: 'print_stmt',
 316: 'raise_stmt',
 317: 'return_stmt',
 318: 'shift_expr',
 319: 'simple_stmt',
 320: 'sliceop',
 321: 'small_stmt',
 322: 'stmt',
 323: 'subscript',
 324: 'subscriptlist',
 325: 'suite',
 326: 'term',
 327: 'test',
 328: 'testlist',
 329: 'testlist1',
 330: 'testlist_gexp',
 331: 'testlist_safe',
 332: 'trailer',
 333: 'try_stmt',
 334: 'varargslist',
 335: 'while_stmt',
 336: 'with_stmt',
 337: 'with_var',
 338: 'xor_expr',
 339: 'yield_expr',
 340: 'yield_stmt'},
dfas:
{256: [[[[1, 1], [2, 1], [3, 2]], [[0, 1]], [[2, 1]]],
       {2: 1,
        4: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 1,
        10: 1,
        11: 1,
        12: 1,
        13: 1,
        14: 1,
        15: 1,
        16: 1,
        17: 1,
        18: 1,
        19: 1,
        20: 1,
        21: 1,
        22: 1,
        23: 1,
        24: 1,
        25: 1,
        26: 1,
        27: 1,
        28: 1,
        29: 1,
        30: 1,
        31: 1,
        32: 1,
        33: 1,
        34: 1,
        35: 1,
        36: 1}],
 257: [[[[37, 1]], [[38, 0], [0, 1]]],
       {6: 1, 8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 24: 1, 28: 1, 35: 1}],
 258: [[[[39, 1]], [[40, 0], [0, 1]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1}],
 259: [[[[41, 1], [42, 2], [43, 3]],
        [[44, 4]],
        [[45, 5], [0, 2]],
        [[44, 6]],
        [[45, 7], [0, 4]],
        [[41, 1], [42, 2], [43, 3], [0, 5]],
        [[0, 6]],
        [[42, 4], [43, 3]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1,
        41: 1,
        43: 1}],
 260: [[[[44, 1]], [[46, 2], [47, 3], [0, 1]], [[0, 2]], [[44, 2]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 261: [[[[48, 1]], [[24, 0], [35, 0], [0, 1]]],
       {6: 1, 8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 24: 1, 28: 1, 35: 1}],
 262: [[[[19, 1]], [[44, 2]], [[45, 3], [0, 2]], [[44, 4]], [[0, 4]]],
       {19: 1}],
 263: [[[[17, 1], [8, 2], [9, 5], [28, 4], [11, 3], [13, 6], [20, 2]],
        [[17, 1], [0, 1]],
        [[0, 2]],
        [[49, 7], [50, 2]],
        [[51, 2], [52, 8], [53, 8]],
        [[54, 9], [55, 2]],
        [[56, 10]],
        [[50, 2]],
        [[51, 2]],
        [[55, 2]],
        [[13, 2]]],
       {8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 28: 1}],
 264: [[[[57, 1],
         [58, 1],
         [59, 1],
         [60, 1],
         [61, 1],
         [62, 1],
         [63, 1],
         [64, 1],
         [65, 1],
         [66, 1],
         [67, 1],
         [68, 1]],
        [[0, 1]]],
       {57: 1,
        58: 1,
        59: 1,
        60: 1,
        61: 1,
        62: 1,
        63: 1,
        64: 1,
        65: 1,
        66: 1,
        67: 1,
        68: 1}],
 265: [[[[31, 1]], [[0, 1]]], {31: 1}],
 266: [[[[10, 1]],
        [[20, 2]],
        [[69, 3], [28, 4]],
        [[70, 5]],
        [[51, 6], [71, 7]],
        [[0, 5]],
        [[69, 3]],
        [[51, 6]]],
       {10: 1}],
 267: [[[[72, 1],
         [73, 1],
         [7, 2],
         [74, 1],
         [72, 1],
         [75, 1],
         [76, 1],
         [77, 3],
         [78, 1],
         [79, 1]],
        [[0, 1]],
        [[75, 1]],
        [[7, 1], [0, 3]]],
       {7: 1, 72: 1, 73: 1, 74: 1, 75: 1, 76: 1, 77: 1, 78: 1, 79: 1}],
 268: [[[[80, 1]], [[81, 0], [0, 1]]],
       {6: 1, 8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 24: 1, 28: 1, 35: 1}],
 269: [[[[82, 1],
         [83, 1],
         [84, 1],
         [85, 1],
         [86, 1],
         [87, 1],
         [88, 1],
         [89, 1]],
        [[0, 1]]],
       {4: 1, 10: 1, 14: 1, 16: 1, 27: 1, 30: 1, 33: 1, 34: 1}],
 270: [[[[32, 1]], [[0, 1]]], {32: 1}],
 271: [[[[90, 1]], [[88, 2], [85, 2]], [[0, 2]]], {33: 1}],
 272: [[[[33, 1]],
        [[91, 2]],
        [[28, 4], [2, 3]],
        [[0, 3]],
        [[51, 5], [92, 6]],
        [[2, 3]],
        [[51, 5]]],
       {33: 1}],
 273: [[[[93, 1]], [[93, 1], [0, 1]]], {33: 1}],
 274: [[[[21, 1]], [[94, 2]], [[0, 2]]], {21: 1}],
 275: [[[[44, 1]],
        [[69, 2]],
        [[44, 3]],
        [[45, 4], [0, 3]],
        [[44, 1], [0, 4]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 276: [[[[91, 1]], [[95, 2], [0, 1]], [[20, 3]], [[0, 3]]], {20: 1}],
 277: [[[[96, 1]], [[45, 0], [0, 1]]], {20: 1}],
 278: [[[[20, 1]], [[97, 0], [0, 1]]], {20: 1}],
 279: [[[[20, 1]], [[0, 1]]], {20: 1}],
 280: [[[[71, 1]], [[2, 1], [98, 2]], [[0, 2]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 281: [[[[99, 1]],
        [[44, 2], [0, 1]],
        [[95, 3], [45, 3], [0, 2]],
        [[44, 4]],
        [[0, 4]]],
       {99: 1}],
 282: [[[[15, 1]],
        [[80, 2]],
        [[75, 3], [0, 2]],
        [[44, 4]],
        [[45, 5], [0, 4]],
        [[44, 6]],
        [[0, 6]]],
       {15: 1}],
 283: [[[[100, 1]], [[101, 0], [0, 1]]],
       {6: 1, 8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 24: 1, 28: 1, 35: 1}],
 284: [[[[71, 1]],
        [[102, 2], [47, 3], [0, 1]],
        [[71, 4], [53, 4]],
        [[71, 5], [53, 5]],
        [[0, 4]],
        [[47, 3], [0, 5]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 285: [[[[80, 1]], [[45, 2], [0, 1]], [[80, 1], [0, 2]]],
       {6: 1, 8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 24: 1, 28: 1, 35: 1}],
 286: [[[[103, 2], [24, 1], [6, 1], [35, 1]], [[104, 2]], [[0, 2]]],
       {6: 1, 8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 24: 1, 28: 1, 35: 1}],
 287: [[[[2, 0], [98, 1], [105, 0]], [[0, 1]]],
       {2: 1,
        4: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 1,
        10: 1,
        11: 1,
        12: 1,
        13: 1,
        14: 1,
        15: 1,
        16: 1,
        17: 1,
        18: 1,
        19: 1,
        20: 1,
        21: 1,
        22: 1,
        23: 1,
        24: 1,
        25: 1,
        26: 1,
        27: 1,
        28: 1,
        29: 1,
        30: 1,
        31: 1,
        32: 1,
        33: 1,
        34: 1,
        35: 1,
        36: 1,
        98: 1}],
 288: [[[[106, 1], [107, 1], [108, 1], [109, 1], [110, 1]], [[0, 1]]],
       {5: 1, 18: 1, 25: 1, 31: 1, 32: 1}],
 289: [[[[27, 1]],
        [[94, 2]],
        [[75, 3]],
        [[71, 4]],
        [[69, 5]],
        [[70, 6]],
        [[111, 7], [0, 6]],
        [[69, 8]],
        [[70, 9]],
        [[0, 9]]],
       {27: 1}],
 290: [[[[28, 1], [20, 2]], [[112, 3]], [[0, 2]], [[51, 2]]], {20: 1, 28: 1}],
 291: [[[[113, 1]], [[45, 2], [0, 1]], [[113, 1], [0, 2]]], {20: 1, 28: 1}],
 292: [[[[4, 1]], [[20, 2]], [[114, 3]], [[69, 4]], [[70, 5]], [[0, 5]]],
       {4: 1}],
 293: [[[[27, 1]],
        [[94, 2]],
        [[75, 3]],
        [[115, 4]],
        [[116, 5], [0, 4]],
        [[0, 5]]],
       {27: 1}],
 294: [[[[30, 1]], [[117, 2]], [[116, 3], [0, 2]], [[0, 3]]], {30: 1}],
 295: [[[[46, 1], [118, 1]], [[0, 1]]], {27: 1, 30: 1}],
 296: [[[[26, 1]], [[20, 2]], [[45, 1], [0, 2]]], {26: 1}],
 297: [[[[30, 1]],
        [[44, 2]],
        [[69, 3]],
        [[70, 4]],
        [[111, 5], [119, 1], [0, 4]],
        [[69, 6]],
        [[70, 7]],
        [[0, 7]]],
       {30: 1}],
 298: [[[[20, 1]], [[95, 2], [0, 1]], [[20, 3]], [[0, 3]]], {20: 1}],
 299: [[[[120, 1]], [[45, 2], [0, 1]], [[120, 1], [0, 2]]], {20: 1}],
 300: [[[[29, 1]],
        [[91, 2], [97, 3]],
        [[23, 4]],
        [[91, 2], [23, 4], [97, 3]],
        [[121, 5], [41, 5], [28, 6]],
        [[0, 5]],
        [[121, 7]],
        [[51, 5]]],
       {29: 1}],
 301: [[[[23, 1]], [[122, 2]], [[0, 2]]], {23: 1}],
 302: [[[[123, 1], [124, 1]], [[0, 1]]], {23: 1, 29: 1}],
 303: [[[[36, 1]], [[69, 2], [125, 3]], [[44, 4]], [[69, 2]], [[0, 4]]],
       {36: 1}],
 304: [[[[27, 1]],
        [[94, 2]],
        [[75, 3]],
        [[126, 4]],
        [[127, 5], [0, 4]],
        [[0, 5]]],
       {27: 1}],
 305: [[[[30, 1]], [[117, 2]], [[127, 3], [0, 2]], [[0, 3]]], {30: 1}],
 306: [[[[128, 1], [129, 1]], [[0, 1]]], {27: 1, 30: 1}],
 307: [[[[44, 1]],
        [[128, 2], [45, 3], [0, 1]],
        [[0, 2]],
        [[44, 4], [0, 3]],
        [[45, 3], [0, 4]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 308: [[[[7, 1], [130, 2]], [[39, 2]], [[0, 2]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1}],
 309: [[[[36, 1]], [[69, 2], [125, 3]], [[117, 4]], [[69, 2]], [[0, 4]]],
       {36: 1}],
 310: [[[[131, 1], [115, 1]], [[0, 1]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 311: [[[[132, 1]], [[133, 0], [0, 1]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1}],
 312: [[[[28, 1]], [[51, 2], [125, 3]], [[0, 2]], [[51, 2]]], {28: 1}],
 313: [[[[22, 1]], [[0, 1]]], {22: 1}],
 314: [[[[134, 1]], [[135, 1], [43, 2], [0, 1]], [[104, 3]], [[0, 3]]],
       {8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 28: 1}],
 315: [[[[12, 1]],
        [[44, 2], [136, 3], [0, 1]],
        [[45, 4], [0, 2]],
        [[44, 5]],
        [[44, 2], [0, 4]],
        [[45, 6], [0, 5]],
        [[44, 7]],
        [[45, 8], [0, 7]],
        [[44, 7], [0, 8]]],
       {12: 1}],
 316: [[[[5, 1]],
        [[44, 2], [0, 1]],
        [[45, 3], [0, 2]],
        [[44, 4]],
        [[45, 5], [0, 4]],
        [[44, 6]],
        [[0, 6]]],
       {5: 1}],
 317: [[[[18, 1]], [[71, 2], [0, 1]], [[0, 2]]], {18: 1}],
 318: [[[[137, 1]], [[136, 0], [138, 0], [0, 1]]],
       {6: 1, 8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 24: 1, 28: 1, 35: 1}],
 319: [[[[139, 1]], [[2, 2], [140, 3]], [[0, 2]], [[139, 1], [2, 2]]],
       {5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        12: 1,
        13: 1,
        15: 1,
        17: 1,
        18: 1,
        19: 1,
        20: 1,
        21: 1,
        22: 1,
        23: 1,
        24: 1,
        25: 1,
        26: 1,
        28: 1,
        29: 1,
        31: 1,
        32: 1,
        35: 1,
        36: 1}],
 320: [[[[69, 1]], [[44, 2], [0, 1]], [[0, 2]]], {69: 1}],
 321: [[[[141, 1],
         [142, 1],
         [143, 1],
         [144, 1],
         [145, 1],
         [146, 1],
         [147, 1],
         [148, 1],
         [149, 1]],
        [[0, 1]]],
       {5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        12: 1,
        13: 1,
        15: 1,
        17: 1,
        18: 1,
        19: 1,
        20: 1,
        21: 1,
        22: 1,
        23: 1,
        24: 1,
        25: 1,
        26: 1,
        28: 1,
        29: 1,
        31: 1,
        32: 1,
        35: 1,
        36: 1}],
 322: [[[[1, 1], [3, 1]], [[0, 1]]],
       {4: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 1,
        10: 1,
        11: 1,
        12: 1,
        13: 1,
        14: 1,
        15: 1,
        16: 1,
        17: 1,
        18: 1,
        19: 1,
        20: 1,
        21: 1,
        22: 1,
        23: 1,
        24: 1,
        25: 1,
        26: 1,
        27: 1,
        28: 1,
        29: 1,
        30: 1,
        31: 1,
        32: 1,
        33: 1,
        34: 1,
        35: 1,
        36: 1}],
 323: [[[[44, 1], [69, 2], [97, 3]],
        [[69, 2], [0, 1]],
        [[44, 4], [150, 5], [0, 2]],
        [[97, 6]],
        [[150, 5], [0, 4]],
        [[0, 5]],
        [[97, 5]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1,
        69: 1,
        97: 1}],
 324: [[[[151, 1]], [[45, 2], [0, 1]], [[151, 1], [0, 2]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1,
        69: 1,
        97: 1}],
 325: [[[[1, 1], [2, 2]],
        [[0, 1]],
        [[152, 3]],
        [[105, 4]],
        [[153, 1], [105, 4]]],
       {2: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        12: 1,
        13: 1,
        15: 1,
        17: 1,
        18: 1,
        19: 1,
        20: 1,
        21: 1,
        22: 1,
        23: 1,
        24: 1,
        25: 1,
        26: 1,
        28: 1,
        29: 1,
        31: 1,
        32: 1,
        35: 1,
        36: 1}],
 326: [[[[104, 1]], [[154, 0], [41, 0], [155, 0], [156, 0], [0, 1]]],
       {6: 1, 8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 24: 1, 28: 1, 35: 1}],
 327: [[[[115, 1], [157, 2]],
        [[30, 3], [0, 1]],
        [[0, 2]],
        [[115, 4]],
        [[111, 5]],
        [[44, 2]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 328: [[[[44, 1]], [[45, 2], [0, 1]], [[44, 1], [0, 2]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 329: [[[[44, 1]], [[45, 0], [0, 1]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 330: [[[[44, 1]],
        [[46, 2], [45, 3], [0, 1]],
        [[0, 2]],
        [[44, 4], [0, 3]],
        [[45, 3], [0, 4]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 331: [[[[117, 1]],
        [[45, 2], [0, 1]],
        [[117, 3]],
        [[45, 4], [0, 3]],
        [[117, 3], [0, 4]]],
       {6: 1,
        7: 1,
        8: 1,
        9: 1,
        11: 1,
        13: 1,
        17: 1,
        20: 1,
        24: 1,
        28: 1,
        35: 1,
        36: 1}],
 332: [[[[28, 1], [97, 2], [11, 3]],
        [[51, 4], [92, 5]],
        [[20, 4]],
        [[158, 6]],
        [[0, 4]],
        [[51, 4]],
        [[50, 4]]],
       {11: 1, 28: 1, 97: 1}],
 333: [[[[14, 1]],
        [[69, 2]],
        [[70, 3]],
        [[159, 4], [160, 5]],
        [[69, 6]],
        [[69, 7]],
        [[70, 8]],
        [[70, 9]],
        [[159, 4], [111, 10], [160, 5], [0, 8]],
        [[0, 9]],
        [[69, 11]],
        [[70, 12]],
        [[160, 5], [0, 12]]],
       {14: 1}],
 334: [[[[41, 1], [113, 2], [43, 3]],
        [[20, 4]],
        [[47, 5], [45, 6], [0, 2]],
        [[20, 7]],
        [[45, 8], [0, 4]],
        [[44, 9]],
        [[41, 1], [113, 2], [43, 3], [0, 6]],
        [[0, 7]],
        [[43, 3]],
        [[45, 6], [0, 9]]],
       {20: 1, 28: 1, 41: 1, 43: 1}],
 335: [[[[16, 1]],
        [[44, 2]],
        [[69, 3]],
        [[70, 4]],
        [[111, 5], [0, 4]],
        [[69, 6]],
        [[70, 7]],
        [[0, 7]]],
       {16: 1}],
 336: [[[[34, 1]],
        [[44, 2]],
        [[69, 3], [161, 4]],
        [[70, 5]],
        [[69, 3]],
        [[0, 5]]],
       {34: 1}],
 337: [[[[95, 1]], [[80, 2]], [[0, 2]]], {95: 1}],
 338: [[[[162, 1]], [[163, 0], [0, 1]]],
       {6: 1, 8: 1, 9: 1, 11: 1, 13: 1, 17: 1, 20: 1, 24: 1, 28: 1, 35: 1}],
 339: [[[[25, 1]], [[71, 2], [0, 1]], [[0, 2]]], {25: 1}],
 340: [[[[53, 1]], [[0, 1]]], {25: 1}]},
states:
[[[[1, 1], [2, 1], [3, 2]], [[0, 1]], [[2, 1]]],
 [[[37, 1]], [[38, 0], [0, 1]]],
 [[[39, 1]], [[40, 0], [0, 1]]],
 [[[41, 1], [42, 2], [43, 3]],
  [[44, 4]],
  [[45, 5], [0, 2]],
  [[44, 6]],
  [[45, 7], [0, 4]],
  [[41, 1], [42, 2], [43, 3], [0, 5]],
  [[0, 6]],
  [[42, 4], [43, 3]]],
 [[[44, 1]], [[46, 2], [47, 3], [0, 1]], [[0, 2]], [[44, 2]]],
 [[[48, 1]], [[24, 0], [35, 0], [0, 1]]],
 [[[19, 1]], [[44, 2]], [[45, 3], [0, 2]], [[44, 4]], [[0, 4]]],
 [[[17, 1], [8, 2], [9, 5], [28, 4], [11, 3], [13, 6], [20, 2]],
  [[17, 1], [0, 1]],
  [[0, 2]],
  [[49, 7], [50, 2]],
  [[51, 2], [52, 8], [53, 8]],
  [[54, 9], [55, 2]],
  [[56, 10]],
  [[50, 2]],
  [[51, 2]],
  [[55, 2]],
  [[13, 2]]],
 [[[57, 1],
   [58, 1],
   [59, 1],
   [60, 1],
   [61, 1],
   [62, 1],
   [63, 1],
   [64, 1],
   [65, 1],
   [66, 1],
   [67, 1],
   [68, 1]],
  [[0, 1]]],
 [[[31, 1]], [[0, 1]]],
 [[[10, 1]],
  [[20, 2]],
  [[69, 3], [28, 4]],
  [[70, 5]],
  [[51, 6], [71, 7]],
  [[0, 5]],
  [[69, 3]],
  [[51, 6]]],
 [[[72, 1],
   [73, 1],
   [7, 2],
   [74, 1],
   [72, 1],
   [75, 1],
   [76, 1],
   [77, 3],
   [78, 1],
   [79, 1]],
  [[0, 1]],
  [[75, 1]],
  [[7, 1], [0, 3]]],
 [[[80, 1]], [[81, 0], [0, 1]]],
 [[[82, 1], [83, 1], [84, 1], [85, 1], [86, 1], [87, 1], [88, 1], [89, 1]],
  [[0, 1]]],
 [[[32, 1]], [[0, 1]]],
 [[[90, 1]], [[88, 2], [85, 2]], [[0, 2]]],
 [[[33, 1]],
  [[91, 2]],
  [[28, 4], [2, 3]],
  [[0, 3]],
  [[51, 5], [92, 6]],
  [[2, 3]],
  [[51, 5]]],
 [[[93, 1]], [[93, 1], [0, 1]]],
 [[[21, 1]], [[94, 2]], [[0, 2]]],
 [[[44, 1]], [[69, 2]], [[44, 3]], [[45, 4], [0, 3]], [[44, 1], [0, 4]]],
 [[[91, 1]], [[95, 2], [0, 1]], [[20, 3]], [[0, 3]]],
 [[[96, 1]], [[45, 0], [0, 1]]],
 [[[20, 1]], [[97, 0], [0, 1]]],
 [[[20, 1]], [[0, 1]]],
 [[[71, 1]], [[2, 1], [98, 2]], [[0, 2]]],
 [[[99, 1]],
  [[44, 2], [0, 1]],
  [[95, 3], [45, 3], [0, 2]],
  [[44, 4]],
  [[0, 4]]],
 [[[15, 1]],
  [[80, 2]],
  [[75, 3], [0, 2]],
  [[44, 4]],
  [[45, 5], [0, 4]],
  [[44, 6]],
  [[0, 6]]],
 [[[100, 1]], [[101, 0], [0, 1]]],
 [[[71, 1]],
  [[102, 2], [47, 3], [0, 1]],
  [[71, 4], [53, 4]],
  [[71, 5], [53, 5]],
  [[0, 4]],
  [[47, 3], [0, 5]]],
 [[[80, 1]], [[45, 2], [0, 1]], [[80, 1], [0, 2]]],
 [[[103, 2], [24, 1], [6, 1], [35, 1]], [[104, 2]], [[0, 2]]],
 [[[2, 0], [98, 1], [105, 0]], [[0, 1]]],
 [[[106, 1], [107, 1], [108, 1], [109, 1], [110, 1]], [[0, 1]]],
 [[[27, 1]],
  [[94, 2]],
  [[75, 3]],
  [[71, 4]],
  [[69, 5]],
  [[70, 6]],
  [[111, 7], [0, 6]],
  [[69, 8]],
  [[70, 9]],
  [[0, 9]]],
 [[[28, 1], [20, 2]], [[112, 3]], [[0, 2]], [[51, 2]]],
 [[[113, 1]], [[45, 2], [0, 1]], [[113, 1], [0, 2]]],
 [[[4, 1]], [[20, 2]], [[114, 3]], [[69, 4]], [[70, 5]], [[0, 5]]],
 [[[27, 1]], [[94, 2]], [[75, 3]], [[115, 4]], [[116, 5], [0, 4]], [[0, 5]]],
 [[[30, 1]], [[117, 2]], [[116, 3], [0, 2]], [[0, 3]]],
 [[[46, 1], [118, 1]], [[0, 1]]],
 [[[26, 1]], [[20, 2]], [[45, 1], [0, 2]]],
 [[[30, 1]],
  [[44, 2]],
  [[69, 3]],
  [[70, 4]],
  [[111, 5], [119, 1], [0, 4]],
  [[69, 6]],
  [[70, 7]],
  [[0, 7]]],
 [[[20, 1]], [[95, 2], [0, 1]], [[20, 3]], [[0, 3]]],
 [[[120, 1]], [[45, 2], [0, 1]], [[120, 1], [0, 2]]],
 [[[29, 1]],
  [[91, 2], [97, 3]],
  [[23, 4]],
  [[91, 2], [23, 4], [97, 3]],
  [[121, 5], [41, 5], [28, 6]],
  [[0, 5]],
  [[121, 7]],
  [[51, 5]]],
 [[[23, 1]], [[122, 2]], [[0, 2]]],
 [[[123, 1], [124, 1]], [[0, 1]]],
 [[[36, 1]], [[69, 2], [125, 3]], [[44, 4]], [[69, 2]], [[0, 4]]],
 [[[27, 1]], [[94, 2]], [[75, 3]], [[126, 4]], [[127, 5], [0, 4]], [[0, 5]]],
 [[[30, 1]], [[117, 2]], [[127, 3], [0, 2]], [[0, 3]]],
 [[[128, 1], [129, 1]], [[0, 1]]],
 [[[44, 1]],
  [[128, 2], [45, 3], [0, 1]],
  [[0, 2]],
  [[44, 4], [0, 3]],
  [[45, 3], [0, 4]]],
 [[[7, 1], [130, 2]], [[39, 2]], [[0, 2]]],
 [[[36, 1]], [[69, 2], [125, 3]], [[117, 4]], [[69, 2]], [[0, 4]]],
 [[[131, 1], [115, 1]], [[0, 1]]],
 [[[132, 1]], [[133, 0], [0, 1]]],
 [[[28, 1]], [[51, 2], [125, 3]], [[0, 2]], [[51, 2]]],
 [[[22, 1]], [[0, 1]]],
 [[[134, 1]], [[135, 1], [43, 2], [0, 1]], [[104, 3]], [[0, 3]]],
 [[[12, 1]],
  [[44, 2], [136, 3], [0, 1]],
  [[45, 4], [0, 2]],
  [[44, 5]],
  [[44, 2], [0, 4]],
  [[45, 6], [0, 5]],
  [[44, 7]],
  [[45, 8], [0, 7]],
  [[44, 7], [0, 8]]],
 [[[5, 1]],
  [[44, 2], [0, 1]],
  [[45, 3], [0, 2]],
  [[44, 4]],
  [[45, 5], [0, 4]],
  [[44, 6]],
  [[0, 6]]],
 [[[18, 1]], [[71, 2], [0, 1]], [[0, 2]]],
 [[[137, 1]], [[136, 0], [138, 0], [0, 1]]],
 [[[139, 1]], [[2, 2], [140, 3]], [[0, 2]], [[139, 1], [2, 2]]],
 [[[69, 1]], [[44, 2], [0, 1]], [[0, 2]]],
 [[[141, 1],
   [142, 1],
   [143, 1],
   [144, 1],
   [145, 1],
   [146, 1],
   [147, 1],
   [148, 1],
   [149, 1]],
  [[0, 1]]],
 [[[1, 1], [3, 1]], [[0, 1]]],
 [[[44, 1], [69, 2], [97, 3]],
  [[69, 2], [0, 1]],
  [[44, 4], [150, 5], [0, 2]],
  [[97, 6]],
  [[150, 5], [0, 4]],
  [[0, 5]],
  [[97, 5]]],
 [[[151, 1]], [[45, 2], [0, 1]], [[151, 1], [0, 2]]],
 [[[1, 1], [2, 2]], [[0, 1]], [[152, 3]], [[105, 4]], [[153, 1], [105, 4]]],
 [[[104, 1]], [[154, 0], [41, 0], [155, 0], [156, 0], [0, 1]]],
 [[[115, 1], [157, 2]],
  [[30, 3], [0, 1]],
  [[0, 2]],
  [[115, 4]],
  [[111, 5]],
  [[44, 2]]],
 [[[44, 1]], [[45, 2], [0, 1]], [[44, 1], [0, 2]]],
 [[[44, 1]], [[45, 0], [0, 1]]],
 [[[44, 1]],
  [[46, 2], [45, 3], [0, 1]],
  [[0, 2]],
  [[44, 4], [0, 3]],
  [[45, 3], [0, 4]]],
 [[[117, 1]],
  [[45, 2], [0, 1]],
  [[117, 3]],
  [[45, 4], [0, 3]],
  [[117, 3], [0, 4]]],
 [[[28, 1], [97, 2], [11, 3]],
  [[51, 4], [92, 5]],
  [[20, 4]],
  [[158, 6]],
  [[0, 4]],
  [[51, 4]],
  [[50, 4]]],
 [[[14, 1]],
  [[69, 2]],
  [[70, 3]],
  [[159, 4], [160, 5]],
  [[69, 6]],
  [[69, 7]],
  [[70, 8]],
  [[70, 9]],
  [[159, 4], [111, 10], [160, 5], [0, 8]],
  [[0, 9]],
  [[69, 11]],
  [[70, 12]],
  [[160, 5], [0, 12]]],
 [[[41, 1], [113, 2], [43, 3]],
  [[20, 4]],
  [[47, 5], [45, 6], [0, 2]],
  [[20, 7]],
  [[45, 8], [0, 4]],
  [[44, 9]],
  [[41, 1], [113, 2], [43, 3], [0, 6]],
  [[0, 7]],
  [[43, 3]],
  [[45, 6], [0, 9]]],
 [[[16, 1]],
  [[44, 2]],
  [[69, 3]],
  [[70, 4]],
  [[111, 5], [0, 4]],
  [[69, 6]],
  [[70, 7]],
  [[0, 7]]],
 [[[34, 1]], [[44, 2]], [[69, 3], [161, 4]], [[70, 5]], [[69, 3]], [[0, 5]]],
 [[[95, 1]], [[80, 2]], [[0, 2]]],
 [[[162, 1]], [[163, 0], [0, 1]]],
 [[[25, 1]], [[71, 2], [0, 1]], [[0, 2]]],
 [[[53, 1]], [[0, 1]]]],
labels:
[[0, 'EMPTY'],
 [319, null],
 [4, null],
 [269, null],
 [1, 'def'],
 [1, 'raise'],
 [32, null],
 [1, 'not'],
 [2, null],
 [26, null],
 [1, 'class'],
 [9, null],
 [1, 'print'],
 [25, null],
 [1, 'try'],
 [1, 'exec'],
 [1, 'while'],
 [3, null],
 [1, 'return'],
 [1, 'assert'],
 [1, null],
 [1, 'del'],
 [1, 'pass'],
 [1, 'import'],
 [15, null],
 [1, 'yield'],
 [1, 'global'],
 [1, 'for'],
 [7, null],
 [1, 'from'],
 [1, 'if'],
 [1, 'break'],
 [1, 'continue'],
 [50, null],
 [1, 'with'],
 [14, null],
 [1, 'lambda'],
 [318, null],
 [19, null],
 [308, null],
 [1, 'and'],
 [16, null],
 [260, null],
 [36, null],
 [327, null],
 [12, null],
 [293, null],
 [22, null],
 [326, null],
 [307, null],
 [10, null],
 [8, null],
 [330, null],
 [339, null],
 [275, null],
 [27, null],
 [329, null],
 [46, null],
 [39, null],
 [41, null],
 [47, null],
 [42, null],
 [43, null],
 [37, null],
 [44, null],
 [49, null],
 [40, null],
 [38, null],
 [45, null],
 [11, null],
 [325, null],
 [328, null],
 [29, null],
 [21, null],
 [28, null],
 [1, 'in'],
 [30, null],
 [1, 'is'],
 [31, null],
 [20, null],
 [283, null],
 [267, null],
 [333, null],
 [297, null],
 [289, null],
 [266, null],
 [336, null],
 [335, null],
 [292, null],
 [271, null],
 [273, null],
 [278, null],
 [259, null],
 [272, null],
 [285, null],
 [1, 'as'],
 [276, null],
 [23, null],
 [0, null],
 [1, 'except'],
 [338, null],
 [18, null],
 [264, null],
 [314, null],
 [286, null],
 [322, null],
 [265, null],
 [270, null],
 [316, null],
 [317, null],
 [340, null],
 [1, 'else'],
 [291, null],
 [290, null],
 [312, null],
 [311, null],
 [295, null],
 [310, null],
 [294, null],
 [1, 'elif'],
 [298, null],
 [299, null],
 [277, null],
 [301, null],
 [300, null],
 [334, null],
 [331, null],
 [306, null],
 [304, null],
 [305, null],
 [268, null],
 [309, null],
 [258, null],
 [1, 'or'],
 [263, null],
 [332, null],
 [35, null],
 [261, null],
 [34, null],
 [321, null],
 [13, null],
 [288, null],
 [262, null],
 [284, null],
 [313, null],
 [315, null],
 [274, null],
 [282, null],
 [296, null],
 [302, null],
 [320, null],
 [323, null],
 [5, null],
 [6, null],
 [48, null],
 [17, null],
 [24, null],
 [303, null],
 [324, null],
 [281, null],
 [1, 'finally'],
 [337, null],
 [257, null],
 [33, null]],
keywords:
{'and': 40,
 'as': 95,
 'assert': 19,
 'break': 31,
 'class': 10,
 'continue': 32,
 'def': 4,
 'del': 21,
 'elif': 119,
 'else': 111,
 'except': 99,
 'exec': 15,
 'finally': 160,
 'for': 27,
 'from': 29,
 'global': 26,
 'if': 30,
 'import': 23,
 'in': 75,
 'is': 77,
 'lambda': 36,
 'not': 7,
 'or': 133,
 'pass': 22,
 'print': 12,
 'raise': 5,
 'return': 18,
 'try': 14,
 'while': 16,
 'with': 34,
 'yield': 25},
tokens:
{0: 98,
 1: 20,
 2: 8,
 3: 17,
 4: 2,
 5: 152,
 6: 153,
 7: 28,
 8: 51,
 9: 11,
 10: 50,
 11: 69,
 12: 45,
 13: 140,
 14: 35,
 15: 24,
 16: 41,
 17: 155,
 18: 101,
 19: 38,
 20: 79,
 21: 73,
 22: 47,
 23: 97,
 24: 156,
 25: 13,
 26: 9,
 27: 55,
 28: 74,
 29: 72,
 30: 76,
 31: 78,
 32: 6,
 33: 163,
 34: 138,
 35: 136,
 36: 43,
 37: 63,
 38: 67,
 39: 58,
 40: 66,
 41: 59,
 42: 61,
 43: 62,
 44: 64,
 45: 68,
 46: 57,
 47: 60,
 48: 154,
 49: 65,
 50: 33},
start: 256
};
// low level parser to a concrete syntax tree, derived from cpython's lib2to3

/**
 *
 * @constructor
 * @param {Object} grammar
 *
 * p = new Parser(grammar);
 * p.setup([start]);
 * foreach input token:
 *     if p.addtoken(...):
 *         break
 * root = p.rootnode
 *
 * can throw ParseError
 */
function Parser(filename, grammar)
{
    this.filename = filename;
    this.grammar = grammar;
    return this;
}


Parser.prototype.setup = function(start)
{
    start = start || this.grammar.start;
    //print("START:"+start);

    var newnode =
    {
        type: start,
        value: null,
        context: null,
        children: []
    };
    var stackentry =
    {
        dfa: this.grammar.dfas[start],
        state: 0,
        node: newnode
    };
    this.stack = [stackentry];
    this.used_names = {};
};

function findInDfa(a, obj)
{
    var i = a.length;
    while (i--)
    {
        if (a[i][0] === obj[0] && a[i][1] === obj[1])
        {
            return true;
        }
    }
    return false;
}


// Add a token; return true if we're done
Parser.prototype.addtoken = function(type, value, context)
{
    var ilabel = this.classify(type, value, context);
    //print("ilabel:"+ilabel);

OUTERWHILE:
    while (true)
    {
        var tp = this.stack[this.stack.length - 1];
        var states = tp.dfa[0];
        var first = tp.dfa[1];
        var arcs = states[tp.state];

        // look for a state with this label
        for (var a = 0; a < arcs.length; ++a)
        {
            var i = arcs[a][0];
            var newstate = arcs[a][1];
            var t = this.grammar.labels[i][0];
            var v = this.grammar.labels[i][1];
            //print("a:"+a+", t:"+t+", i:"+i);
            if (ilabel === i)
            {
                // look it up in the list of labels
                goog.asserts.assert(t < 256);
                // shift a token; we're done with it
                this.shift(type, value, newstate, context);
                // pop while we are in an accept-only state
                var state = newstate;
                //print("before:"+JSON.stringify(states[state]) + ":state:"+state+":"+JSON.stringify(states[state]));
                while (states[state].length === 1
                        && states[state][0][0] === 0
                        && states[state][0][1] === state) // states[state] == [(0, state)])
                {
                    this.pop();
                    //print("in after pop:"+JSON.stringify(states[state]) + ":state:"+state+":"+JSON.stringify(states[state]));
                    if (this.stack.length === 0)
                    {
                        // done!
                        return true;
                    }
                    tp = this.stack[this.stack.length - 1];
                    state = tp.state;
                    states = tp.dfa[0];
                    first = tp.dfa[1];
                    //print(JSON.stringify(states), JSON.stringify(first));
                    //print("bottom:"+JSON.stringify(states[state]) + ":state:"+state+":"+JSON.stringify(states[state]));
                }
                // done with this token
                //print("DONE, return false");
                return false;
            }
            else if (t >= 256)
            {
                var itsdfa = this.grammar.dfas[t];
                var itsfirst = itsdfa[1];
                if (itsfirst.hasOwnProperty(ilabel))
                {
                    // push a symbol
                    this.push(t, this.grammar.dfas[t], newstate, context);
                    continue OUTERWHILE;
                }
            }
        }

        //print("findInDfa: " + JSON.stringify(arcs)+" vs. " + tp.state);
        if (findInDfa(arcs, [0, tp.state]))
        {
            // an accepting state, pop it and try somethign else
            //print("WAA");
            this.pop();
            if (this.stack.length === 0)
            {
                throw new Sk.builtin.ParseError("too much input", this.filename);
            }
        }
        else
        {
            // no transition
            var errline = context[0][0];
            throw new Sk.builtin.ParseError("bad input", this.filename, errline, context);	//	RNL
//          throw new Sk.builtin.ParseError("bad input on line " + errline.toString());		RNL
        }
    }
};

// turn a token into a label
Parser.prototype.classify = function(type, value, context)
{
    var ilabel;
    if (type === Sk.Tokenizer.Tokens.T_NAME)
    {
        this.used_names[value] = true;
        ilabel = this.grammar.keywords.hasOwnProperty(value) && this.grammar.keywords[value];
        if (ilabel)
        {
            //print("is keyword");
            return ilabel;
        }
    }
    ilabel = this.grammar.tokens.hasOwnProperty(type) && this.grammar.tokens[type];
    if (!ilabel) {
        // throw new Sk.builtin.ParseError("bad token", type, value, context);
        // Questionable modification to put line number in position 2
        // like everywhere else and filename in position 1.
        throw new Sk.builtin.ParseError("bad token", this.filename, context[0][0], context);
    }
    return ilabel;
};

// shift a token
Parser.prototype.shift = function(type, value, newstate, context)
{
    var dfa = this.stack[this.stack.length - 1].dfa;
    var state = this.stack[this.stack.length - 1].state;
    var node = this.stack[this.stack.length - 1].node;
    //print("context", context);
    var newnode = {
        type: type, 
        value: value,
        lineno: context[0][0],         // throwing away end here to match cpython
        col_offset: context[0][1],
        children: null
    };
    if (newnode)
    {
        node.children.push(newnode);
    }
    this.stack[this.stack.length - 1] = {
        dfa: dfa,
        state: newstate,
        node: node
    };
};

// push a nonterminal
Parser.prototype.push = function(type, newdfa, newstate, context)
{
    var dfa = this.stack[this.stack.length - 1].dfa; 
    var node = this.stack[this.stack.length - 1].node; 
    var newnode = {
        type: type,
        value: null,
        lineno: context[0][0],      // throwing away end here to match cpython
        col_offset: context[0][1],
        children: []
    };
    this.stack[this.stack.length - 1] = {
            dfa: dfa,
            state: newstate,
            node: node
        };
    this.stack.push({
            dfa: newdfa,
            state: 0,
            node: newnode
        });
};

//var ac = 0;
//var bc = 0;

// pop a nonterminal
Parser.prototype.pop = function()
{
    var pop = this.stack.pop();
    var newnode = pop.node;
    //print("POP");
    if (newnode)
    {
        //print("A", ac++, newnode.type);
        //print("stacklen:"+this.stack.length);
        if (this.stack.length !== 0)
        {
            //print("B", bc++);
            var node = this.stack[this.stack.length - 1].node;
            node.children.push(newnode);
        }
        else
        {
            //print("C");
            this.rootnode = newnode;
            this.rootnode.used_names = this.used_names;
        }
    }
};

/**
 * parser for interactive input. returns a function that should be called with
 * lines of input as they are entered. the function will return false
 * until the input is complete, when it will return the rootnode of the parse.
 *
 * @param {string} filename
 * @param {string=} style root of parse tree (optional)
 */
function makeParser(filename, style)
{
    if (style === undefined) style = "file_input";
    var p = new Parser(filename, Sk.ParseTables);
    // for closure's benefit
    if (style === "file_input")
        p.setup(Sk.ParseTables.sym.file_input);
    else
        goog.asserts.fail("todo;");
    var curIndex = 0;
    var lineno = 1;
    var column = 0;
    var prefix = "";
    var T_COMMENT = Sk.Tokenizer.Tokens.T_COMMENT;
    var T_NL = Sk.Tokenizer.Tokens.T_NL;
    var T_OP = Sk.Tokenizer.Tokens.T_OP;
    var tokenizer = new Sk.Tokenizer(filename, style === "single_input", function(type, value, start, end, line)
            {
                //print(JSON.stringify([type, value, start, end, line]));
                var s_lineno = start[0];
                var s_column = start[1];
                /*
                if (s_lineno !== lineno && s_column !== column)
                {
                    // todo; update prefix and line/col
                }
                */
                if (type === T_COMMENT || type === T_NL)
                {
                    prefix += value;
                    lineno = end[0];
                    column = end[1];
                    if (value[value.length - 1] === "\n")
                    {
                        lineno += 1;
                        column = 0;
                    }
                    //print("  not calling addtoken");
                    return undefined;
                }
                if (type === T_OP)
                {
                    type = Sk.OpMap[value];
                }
                if (p.addtoken(type, value, [start, end, line]))
                {
                    return true;
                }
            });
    return function(line)
    {
        var ret = tokenizer.generateTokens(line);
        //print("tok:"+ret);
        if (ret)
        {
            if (ret !== "done") {
                throw new Sk.builtin.ParseError("incomplete input", this.filename);
			}
            return p.rootnode;
        }
        return false;
    };
}

Sk.parse = function parse(filename, input)
{
    var parseFunc = makeParser(filename);
    if (input.substr(input.length - 1, 1) !== "\n") input += "\n";
    //print("input:"+input);
    var lines = input.split("\n");
    var ret;
    for (var i = 0; i < lines.length; ++i)
    {
        ret = parseFunc(lines[i] + ((i === lines.length - 1) ? "" : "\n"));
    }
    return ret;
};

Sk.parseTreeDump = function parseTreeDump(n, indent)
{
    //return JSON.stringify(n, null, 2);
    indent = indent || "";
    var ret = "";
    ret += indent;
    if (n.type >= 256) // non-term
    {
        ret += Sk.ParseTables.number2symbol[n.type] + "\n";
        for (var i = 0; i < n.children.length; ++i)
        {
            ret += Sk.parseTreeDump(n.children[i], indent + "  ");
        }
    }
    else
    {
        ret += Sk.Tokenizer.tokenNames[n.type] + ": " + new Sk.builtin.str(n.value)['$r']().v + "\n";
    }
    return ret;
};


goog.exportSymbol("Sk.parse", Sk.parse);
goog.exportSymbol("Sk.parseTreeDump", Sk.parseTreeDump);
/* File automatically generated by asdl_js.py. */

/* ----- expr_context ----- */
/** @constructor */
function Load() {}
/** @constructor */
function Store() {}
/** @constructor */
function Del() {}
/** @constructor */
function AugLoad() {}
/** @constructor */
function AugStore() {}
/** @constructor */
function Param() {}

/* ----- boolop ----- */
/** @constructor */
function And() {}
/** @constructor */
function Or() {}

/* ----- operator ----- */
/** @constructor */
function Add() {}
/** @constructor */
function Sub() {}
/** @constructor */
function Mult() {}
/** @constructor */
function Div() {}
/** @constructor */
function Mod() {}
/** @constructor */
function Pow() {}
/** @constructor */
function LShift() {}
/** @constructor */
function RShift() {}
/** @constructor */
function BitOr() {}
/** @constructor */
function BitXor() {}
/** @constructor */
function BitAnd() {}
/** @constructor */
function FloorDiv() {}

/* ----- unaryop ----- */
/** @constructor */
function Invert() {}
/** @constructor */
function Not() {}
/** @constructor */
function UAdd() {}
/** @constructor */
function USub() {}

/* ----- cmpop ----- */
/** @constructor */
function Eq() {}
/** @constructor */
function NotEq() {}
/** @constructor */
function Lt() {}
/** @constructor */
function LtE() {}
/** @constructor */
function Gt() {}
/** @constructor */
function GtE() {}
/** @constructor */
function Is() {}
/** @constructor */
function IsNot() {}
/** @constructor */
function In_() {}
/** @constructor */
function NotIn() {}







/* ---------------------- */
/* constructors for nodes */
/* ---------------------- */





/** @constructor */
function Module(/* {asdl_seq *} */ body)
{
    this.body = body;
    return this;
}

/** @constructor */
function Interactive(/* {asdl_seq *} */ body)
{
    this.body = body;
    return this;
}

/** @constructor */
function Expression(/* {expr_ty} */ body)
{
    goog.asserts.assert(body !== null && body !== undefined);
    this.body = body;
    return this;
}

/** @constructor */
function Suite(/* {asdl_seq *} */ body)
{
    this.body = body;
    return this;
}

/** @constructor */
function FunctionDef(/* {identifier} */ name, /* {arguments__ty} */ args, /*
                          {asdl_seq *} */ body, /* {asdl_seq *} */
                          decorator_list, /* {int} */ lineno, /* {int} */
                          col_offset)
{
    goog.asserts.assert(name !== null && name !== undefined);
    goog.asserts.assert(args !== null && args !== undefined);
    this.name = name;
    this.args = args;
    this.body = body;
    this.decorator_list = decorator_list;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function ClassDef(/* {identifier} */ name, /* {asdl_seq *} */ bases, /*
                       {asdl_seq *} */ body, /* {asdl_seq *} */ decorator_list,
                       /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(name !== null && name !== undefined);
    this.name = name;
    this.bases = bases;
    this.body = body;
    this.decorator_list = decorator_list;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Return_(/* {expr_ty} */ value, /* {int} */ lineno, /* {int} */
                      col_offset)
{
    this.value = value;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Delete_(/* {asdl_seq *} */ targets, /* {int} */ lineno, /* {int} */
                      col_offset)
{
    this.targets = targets;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Assign(/* {asdl_seq *} */ targets, /* {expr_ty} */ value, /* {int} */
                     lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(value !== null && value !== undefined);
    this.targets = targets;
    this.value = value;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function AugAssign(/* {expr_ty} */ target, /* {operator_ty} */ op, /* {expr_ty}
                        */ value, /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(target !== null && target !== undefined);
    goog.asserts.assert(op !== null && op !== undefined);
    goog.asserts.assert(value !== null && value !== undefined);
    this.target = target;
    this.op = op;
    this.value = value;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Print(/* {expr_ty} */ dest, /* {asdl_seq *} */ values, /* {bool} */
                    nl, /* {int} */ lineno, /* {int} */ col_offset)
{
    this.dest = dest;
    this.values = values;
    this.nl = nl;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function For_(/* {expr_ty} */ target, /* {expr_ty} */ iter, /* {asdl_seq *} */
                   body, /* {asdl_seq *} */ orelse, /* {int} */ lineno, /*
                   {int} */ col_offset)
{
    goog.asserts.assert(target !== null && target !== undefined);
    goog.asserts.assert(iter !== null && iter !== undefined);
    this.target = target;
    this.iter = iter;
    this.body = body;
    this.orelse = orelse;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function While_(/* {expr_ty} */ test, /* {asdl_seq *} */ body, /* {asdl_seq *}
                     */ orelse, /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(test !== null && test !== undefined);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function If_(/* {expr_ty} */ test, /* {asdl_seq *} */ body, /* {asdl_seq *} */
                  orelse, /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(test !== null && test !== undefined);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function With_(/* {expr_ty} */ context_expr, /* {expr_ty} */ optional_vars, /*
                    {asdl_seq *} */ body, /* {int} */ lineno, /* {int} */
                    col_offset)
{
    goog.asserts.assert(context_expr !== null && context_expr !== undefined);
    this.context_expr = context_expr;
    this.optional_vars = optional_vars;
    this.body = body;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Raise(/* {expr_ty} */ type, /* {expr_ty} */ inst, /* {expr_ty} */
                    tback, /* {int} */ lineno, /* {int} */ col_offset)
{
    this.type = type;
    this.inst = inst;
    this.tback = tback;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function TryExcept(/* {asdl_seq *} */ body, /* {asdl_seq *} */ handlers, /*
                        {asdl_seq *} */ orelse, /* {int} */ lineno, /* {int} */
                        col_offset)
{
    this.body = body;
    this.handlers = handlers;
    this.orelse = orelse;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function TryFinally(/* {asdl_seq *} */ body, /* {asdl_seq *} */ finalbody, /*
                         {int} */ lineno, /* {int} */ col_offset)
{
    this.body = body;
    this.finalbody = finalbody;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Assert(/* {expr_ty} */ test, /* {expr_ty} */ msg, /* {int} */ lineno,
                     /* {int} */ col_offset)
{
    goog.asserts.assert(test !== null && test !== undefined);
    this.test = test;
    this.msg = msg;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Import_(/* {asdl_seq *} */ names, /* {int} */ lineno, /* {int} */
                      col_offset)
{
    this.names = names;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function ImportFrom(/* {identifier} */ module, /* {asdl_seq *} */ names, /*
                         {int} */ level, /* {int} */ lineno, /* {int} */
                         col_offset)
{
    goog.asserts.assert(module !== null && module !== undefined);
    this.module = module;
    this.names = names;
    this.level = level;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Exec(/* {expr_ty} */ body, /* {expr_ty} */ globals, /* {expr_ty} */
                   locals, /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(body !== null && body !== undefined);
    this.body = body;
    this.globals = globals;
    this.locals = locals;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Global(/* {asdl_seq *} */ names, /* {int} */ lineno, /* {int} */
                     col_offset)
{
    this.names = names;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Expr(/* {expr_ty} */ value, /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(value !== null && value !== undefined);
    this.value = value;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Pass(/* {int} */ lineno, /* {int} */ col_offset)
{
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Break_(/* {int} */ lineno, /* {int} */ col_offset)
{
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Continue_(/* {int} */ lineno, /* {int} */ col_offset)
{
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function BoolOp(/* {boolop_ty} */ op, /* {asdl_seq *} */ values, /* {int} */
                     lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(op !== null && op !== undefined);
    this.op = op;
    this.values = values;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function BinOp(/* {expr_ty} */ left, /* {operator_ty} */ op, /* {expr_ty} */
                    right, /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(left !== null && left !== undefined);
    goog.asserts.assert(op !== null && op !== undefined);
    goog.asserts.assert(right !== null && right !== undefined);
    this.left = left;
    this.op = op;
    this.right = right;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function UnaryOp(/* {unaryop_ty} */ op, /* {expr_ty} */ operand, /* {int} */
                      lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(op !== null && op !== undefined);
    goog.asserts.assert(operand !== null && operand !== undefined);
    this.op = op;
    this.operand = operand;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Lambda(/* {arguments__ty} */ args, /* {expr_ty} */ body, /* {int} */
                     lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(args !== null && args !== undefined);
    goog.asserts.assert(body !== null && body !== undefined);
    this.args = args;
    this.body = body;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function IfExp(/* {expr_ty} */ test, /* {expr_ty} */ body, /* {expr_ty} */
                    orelse, /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(test !== null && test !== undefined);
    goog.asserts.assert(body !== null && body !== undefined);
    goog.asserts.assert(orelse !== null && orelse !== undefined);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Dict(/* {asdl_seq *} */ keys, /* {asdl_seq *} */ values, /* {int} */
                   lineno, /* {int} */ col_offset)
{
    this.keys = keys;
    this.values = values;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function ListComp(/* {expr_ty} */ elt, /* {asdl_seq *} */ generators, /* {int}
                       */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(elt !== null && elt !== undefined);
    this.elt = elt;
    this.generators = generators;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function GeneratorExp(/* {expr_ty} */ elt, /* {asdl_seq *} */ generators, /*
                           {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(elt !== null && elt !== undefined);
    this.elt = elt;
    this.generators = generators;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Yield(/* {expr_ty} */ value, /* {int} */ lineno, /* {int} */
                    col_offset)
{
    this.value = value;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Compare(/* {expr_ty} */ left, /* {asdl_int_seq *} */ ops, /* {asdl_seq
                      *} */ comparators, /* {int} */ lineno, /* {int} */
                      col_offset)
{
    goog.asserts.assert(left !== null && left !== undefined);
    this.left = left;
    this.ops = ops;
    this.comparators = comparators;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Call(/* {expr_ty} */ func, /* {asdl_seq *} */ args, /* {asdl_seq *} */
                   keywords, /* {expr_ty} */ starargs, /* {expr_ty} */ kwargs,
                   /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(func !== null && func !== undefined);
    this.func = func;
    this.args = args;
    this.keywords = keywords;
    this.starargs = starargs;
    this.kwargs = kwargs;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Num(/* {object} */ n, /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(n !== null && n !== undefined);
    this.n = n;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Str(/* {string} */ s, /* {int} */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(s !== null && s !== undefined);
    this.s = s;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Attribute(/* {expr_ty} */ value, /* {identifier} */ attr, /*
                        {expr_context_ty} */ ctx, /* {int} */ lineno, /* {int}
                        */ col_offset)
{
    goog.asserts.assert(value !== null && value !== undefined);
    goog.asserts.assert(attr !== null && attr !== undefined);
    goog.asserts.assert(ctx !== null && ctx !== undefined);
    this.value = value;
    this.attr = attr;
    this.ctx = ctx;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Subscript(/* {expr_ty} */ value, /* {slice_ty} */ slice, /*
                        {expr_context_ty} */ ctx, /* {int} */ lineno, /* {int}
                        */ col_offset)
{
    goog.asserts.assert(value !== null && value !== undefined);
    goog.asserts.assert(slice !== null && slice !== undefined);
    goog.asserts.assert(ctx !== null && ctx !== undefined);
    this.value = value;
    this.slice = slice;
    this.ctx = ctx;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Name(/* {identifier} */ id, /* {expr_context_ty} */ ctx, /* {int} */
                   lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(id !== null && id !== undefined);
    goog.asserts.assert(ctx !== null && ctx !== undefined);
    this.id = id;
    this.ctx = ctx;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function List(/* {asdl_seq *} */ elts, /* {expr_context_ty} */ ctx, /* {int} */
                   lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(ctx !== null && ctx !== undefined);
    this.elts = elts;
    this.ctx = ctx;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Tuple(/* {asdl_seq *} */ elts, /* {expr_context_ty} */ ctx, /* {int}
                    */ lineno, /* {int} */ col_offset)
{
    goog.asserts.assert(ctx !== null && ctx !== undefined);
    this.elts = elts;
    this.ctx = ctx;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function Ellipsis()
{
    return this;
}

/** @constructor */
function Slice(/* {expr_ty} */ lower, /* {expr_ty} */ upper, /* {expr_ty} */
                    step)
{
    this.lower = lower;
    this.upper = upper;
    this.step = step;
    return this;
}

/** @constructor */
function ExtSlice(/* {asdl_seq *} */ dims)
{
    this.dims = dims;
    return this;
}

/** @constructor */
function Index(/* {expr_ty} */ value)
{
    goog.asserts.assert(value !== null && value !== undefined);
    this.value = value;
    return this;
}

/** @constructor */
function comprehension(/* {expr_ty} */ target, /* {expr_ty} */ iter, /*
                            {asdl_seq *} */ ifs)
{
    goog.asserts.assert(target !== null && target !== undefined);
    goog.asserts.assert(iter !== null && iter !== undefined);
    this.target = target;
    this.iter = iter;
    this.ifs = ifs;
    return this;
}

/** @constructor */
function ExceptHandler(/* {expr_ty} */ type, /* {expr_ty} */ name, /* {asdl_seq
                            *} */ body, /* {int} */ lineno, /* {int} */
                            col_offset)
{
    this.type = type;
    this.name = name;
    this.body = body;
    this.lineno = lineno;
    this.col_offset = col_offset;
    return this;
}

/** @constructor */
function arguments_(/* {asdl_seq *} */ args, /* {identifier} */ vararg, /*
                         {identifier} */ kwarg, /* {asdl_seq *} */ defaults)
{
    this.args = args;
    this.vararg = vararg;
    this.kwarg = kwarg;
    this.defaults = defaults;
    return this;
}

/** @constructor */
function keyword(/* {identifier} */ arg, /* {expr_ty} */ value)
{
    goog.asserts.assert(arg !== null && arg !== undefined);
    goog.asserts.assert(value !== null && value !== undefined);
    this.arg = arg;
    this.value = value;
    return this;
}

/** @constructor */
function alias(/* {identifier} */ name, /* {identifier} */ asname)
{
    goog.asserts.assert(name !== null && name !== undefined);
    this.name = name;
    this.asname = asname;
    return this;
}


Module.prototype._astname = "Module";
Module.prototype._fields = [
    "body", function(n) { return n.body; }
];
Interactive.prototype._astname = "Interactive";
Interactive.prototype._fields = [
    "body", function(n) { return n.body; }
];
Expression.prototype._astname = "Expression";
Expression.prototype._fields = [
    "body", function(n) { return n.body; }
];
Suite.prototype._astname = "Suite";
Suite.prototype._fields = [
    "body", function(n) { return n.body; }
];
FunctionDef.prototype._astname = "FunctionDef";
FunctionDef.prototype._fields = [
    "name", function(n) { return n.name; },
    "args", function(n) { return n.args; },
    "body", function(n) { return n.body; },
    "decorator_list", function(n) { return n.decorator_list; }
];
ClassDef.prototype._astname = "ClassDef";
ClassDef.prototype._fields = [
    "name", function(n) { return n.name; },
    "bases", function(n) { return n.bases; },
    "body", function(n) { return n.body; },
    "decorator_list", function(n) { return n.decorator_list; }
];
Return_.prototype._astname = "Return";
Return_.prototype._fields = [
    "value", function(n) { return n.value; }
];
Delete_.prototype._astname = "Delete";
Delete_.prototype._fields = [
    "targets", function(n) { return n.targets; }
];
Assign.prototype._astname = "Assign";
Assign.prototype._fields = [
    "targets", function(n) { return n.targets; },
    "value", function(n) { return n.value; }
];
AugAssign.prototype._astname = "AugAssign";
AugAssign.prototype._fields = [
    "target", function(n) { return n.target; },
    "op", function(n) { return n.op; },
    "value", function(n) { return n.value; }
];
Print.prototype._astname = "Print";
Print.prototype._fields = [
    "dest", function(n) { return n.dest; },
    "values", function(n) { return n.values; },
    "nl", function(n) { return n.nl; }
];
For_.prototype._astname = "For";
For_.prototype._fields = [
    "target", function(n) { return n.target; },
    "iter", function(n) { return n.iter; },
    "body", function(n) { return n.body; },
    "orelse", function(n) { return n.orelse; }
];
While_.prototype._astname = "While";
While_.prototype._fields = [
    "test", function(n) { return n.test; },
    "body", function(n) { return n.body; },
    "orelse", function(n) { return n.orelse; }
];
If_.prototype._astname = "If";
If_.prototype._fields = [
    "test", function(n) { return n.test; },
    "body", function(n) { return n.body; },
    "orelse", function(n) { return n.orelse; }
];
With_.prototype._astname = "With";
With_.prototype._fields = [
    "context_expr", function(n) { return n.context_expr; },
    "optional_vars", function(n) { return n.optional_vars; },
    "body", function(n) { return n.body; }
];
Raise.prototype._astname = "Raise";
Raise.prototype._fields = [
    "type", function(n) { return n.type; },
    "inst", function(n) { return n.inst; },
    "tback", function(n) { return n.tback; }
];
TryExcept.prototype._astname = "TryExcept";
TryExcept.prototype._fields = [
    "body", function(n) { return n.body; },
    "handlers", function(n) { return n.handlers; },
    "orelse", function(n) { return n.orelse; }
];
TryFinally.prototype._astname = "TryFinally";
TryFinally.prototype._fields = [
    "body", function(n) { return n.body; },
    "finalbody", function(n) { return n.finalbody; }
];
Assert.prototype._astname = "Assert";
Assert.prototype._fields = [
    "test", function(n) { return n.test; },
    "msg", function(n) { return n.msg; }
];
Import_.prototype._astname = "Import";
Import_.prototype._fields = [
    "names", function(n) { return n.names; }
];
ImportFrom.prototype._astname = "ImportFrom";
ImportFrom.prototype._fields = [
    "module", function(n) { return n.module; },
    "names", function(n) { return n.names; },
    "level", function(n) { return n.level; }
];
Exec.prototype._astname = "Exec";
Exec.prototype._fields = [
    "body", function(n) { return n.body; },
    "globals", function(n) { return n.globals; },
    "locals", function(n) { return n.locals; }
];
Global.prototype._astname = "Global";
Global.prototype._fields = [
    "names", function(n) { return n.names; }
];
Expr.prototype._astname = "Expr";
Expr.prototype._fields = [
    "value", function(n) { return n.value; }
];
Pass.prototype._astname = "Pass";
Pass.prototype._fields = [
];
Break_.prototype._astname = "Break";
Break_.prototype._fields = [
];
Continue_.prototype._astname = "Continue";
Continue_.prototype._fields = [
];
BoolOp.prototype._astname = "BoolOp";
BoolOp.prototype._fields = [
    "op", function(n) { return n.op; },
    "values", function(n) { return n.values; }
];
BinOp.prototype._astname = "BinOp";
BinOp.prototype._fields = [
    "left", function(n) { return n.left; },
    "op", function(n) { return n.op; },
    "right", function(n) { return n.right; }
];
UnaryOp.prototype._astname = "UnaryOp";
UnaryOp.prototype._fields = [
    "op", function(n) { return n.op; },
    "operand", function(n) { return n.operand; }
];
Lambda.prototype._astname = "Lambda";
Lambda.prototype._fields = [
    "args", function(n) { return n.args; },
    "body", function(n) { return n.body; }
];
IfExp.prototype._astname = "IfExp";
IfExp.prototype._fields = [
    "test", function(n) { return n.test; },
    "body", function(n) { return n.body; },
    "orelse", function(n) { return n.orelse; }
];
Dict.prototype._astname = "Dict";
Dict.prototype._fields = [
    "keys", function(n) { return n.keys; },
    "values", function(n) { return n.values; }
];
ListComp.prototype._astname = "ListComp";
ListComp.prototype._fields = [
    "elt", function(n) { return n.elt; },
    "generators", function(n) { return n.generators; }
];
GeneratorExp.prototype._astname = "GeneratorExp";
GeneratorExp.prototype._fields = [
    "elt", function(n) { return n.elt; },
    "generators", function(n) { return n.generators; }
];
Yield.prototype._astname = "Yield";
Yield.prototype._fields = [
    "value", function(n) { return n.value; }
];
Compare.prototype._astname = "Compare";
Compare.prototype._fields = [
    "left", function(n) { return n.left; },
    "ops", function(n) { return n.ops; },
    "comparators", function(n) { return n.comparators; }
];
Call.prototype._astname = "Call";
Call.prototype._fields = [
    "func", function(n) { return n.func; },
    "args", function(n) { return n.args; },
    "keywords", function(n) { return n.keywords; },
    "starargs", function(n) { return n.starargs; },
    "kwargs", function(n) { return n.kwargs; }
];
Num.prototype._astname = "Num";
Num.prototype._fields = [
    "n", function(n) { return n.n; }
];
Str.prototype._astname = "Str";
Str.prototype._fields = [
    "s", function(n) { return n.s; }
];
Attribute.prototype._astname = "Attribute";
Attribute.prototype._fields = [
    "value", function(n) { return n.value; },
    "attr", function(n) { return n.attr; },
    "ctx", function(n) { return n.ctx; }
];
Subscript.prototype._astname = "Subscript";
Subscript.prototype._fields = [
    "value", function(n) { return n.value; },
    "slice", function(n) { return n.slice; },
    "ctx", function(n) { return n.ctx; }
];
Name.prototype._astname = "Name";
Name.prototype._fields = [
    "id", function(n) { return n.id; },
    "ctx", function(n) { return n.ctx; }
];
List.prototype._astname = "List";
List.prototype._fields = [
    "elts", function(n) { return n.elts; },
    "ctx", function(n) { return n.ctx; }
];
Tuple.prototype._astname = "Tuple";
Tuple.prototype._fields = [
    "elts", function(n) { return n.elts; },
    "ctx", function(n) { return n.ctx; }
];
Load.prototype._astname = "Load";
Load.prototype._isenum = true;
Store.prototype._astname = "Store";
Store.prototype._isenum = true;
Del.prototype._astname = "Del";
Del.prototype._isenum = true;
AugLoad.prototype._astname = "AugLoad";
AugLoad.prototype._isenum = true;
AugStore.prototype._astname = "AugStore";
AugStore.prototype._isenum = true;
Param.prototype._astname = "Param";
Param.prototype._isenum = true;
Ellipsis.prototype._astname = "Ellipsis";
Ellipsis.prototype._fields = [
];
Slice.prototype._astname = "Slice";
Slice.prototype._fields = [
    "lower", function(n) { return n.lower; },
    "upper", function(n) { return n.upper; },
    "step", function(n) { return n.step; }
];
ExtSlice.prototype._astname = "ExtSlice";
ExtSlice.prototype._fields = [
    "dims", function(n) { return n.dims; }
];
Index.prototype._astname = "Index";
Index.prototype._fields = [
    "value", function(n) { return n.value; }
];
And.prototype._astname = "And";
And.prototype._isenum = true;
Or.prototype._astname = "Or";
Or.prototype._isenum = true;
Add.prototype._astname = "Add";
Add.prototype._isenum = true;
Sub.prototype._astname = "Sub";
Sub.prototype._isenum = true;
Mult.prototype._astname = "Mult";
Mult.prototype._isenum = true;
Div.prototype._astname = "Div";
Div.prototype._isenum = true;
Mod.prototype._astname = "Mod";
Mod.prototype._isenum = true;
Pow.prototype._astname = "Pow";
Pow.prototype._isenum = true;
LShift.prototype._astname = "LShift";
LShift.prototype._isenum = true;
RShift.prototype._astname = "RShift";
RShift.prototype._isenum = true;
BitOr.prototype._astname = "BitOr";
BitOr.prototype._isenum = true;
BitXor.prototype._astname = "BitXor";
BitXor.prototype._isenum = true;
BitAnd.prototype._astname = "BitAnd";
BitAnd.prototype._isenum = true;
FloorDiv.prototype._astname = "FloorDiv";
FloorDiv.prototype._isenum = true;
Invert.prototype._astname = "Invert";
Invert.prototype._isenum = true;
Not.prototype._astname = "Not";
Not.prototype._isenum = true;
UAdd.prototype._astname = "UAdd";
UAdd.prototype._isenum = true;
USub.prototype._astname = "USub";
USub.prototype._isenum = true;
Eq.prototype._astname = "Eq";
Eq.prototype._isenum = true;
NotEq.prototype._astname = "NotEq";
NotEq.prototype._isenum = true;
Lt.prototype._astname = "Lt";
Lt.prototype._isenum = true;
LtE.prototype._astname = "LtE";
LtE.prototype._isenum = true;
Gt.prototype._astname = "Gt";
Gt.prototype._isenum = true;
GtE.prototype._astname = "GtE";
GtE.prototype._isenum = true;
Is.prototype._astname = "Is";
Is.prototype._isenum = true;
IsNot.prototype._astname = "IsNot";
IsNot.prototype._isenum = true;
In_.prototype._astname = "In";
In_.prototype._isenum = true;
NotIn.prototype._astname = "NotIn";
NotIn.prototype._isenum = true;
comprehension.prototype._astname = "comprehension";
comprehension.prototype._fields = [
    "target", function(n) { return n.target; },
    "iter", function(n) { return n.iter; },
    "ifs", function(n) { return n.ifs; }
];
ExceptHandler.prototype._astname = "ExceptHandler";
ExceptHandler.prototype._fields = [
    "type", function(n) { return n.type; },
    "name", function(n) { return n.name; },
    "body", function(n) { return n.body; }
];
arguments_.prototype._astname = "arguments";
arguments_.prototype._fields = [
    "args", function(n) { return n.args; },
    "vararg", function(n) { return n.vararg; },
    "kwarg", function(n) { return n.kwarg; },
    "defaults", function(n) { return n.defaults; }
];
keyword.prototype._astname = "keyword";
keyword.prototype._fields = [
    "arg", function(n) { return n.arg; },
    "value", function(n) { return n.value; }
];
alias.prototype._astname = "alias";
alias.prototype._fields = [
    "name", function(n) { return n.name; },
    "asname", function(n) { return n.asname; }
];

//
// This is pretty much a straight port of ast.c from CPython 2.6.5.
//
// The previous version was easier to work with and more JS-ish, but having a
// somewhat different ast structure than cpython makes testing more difficult.
//
// This way, we can use a dump from the ast module on any arbitrary python
// code and know that we're the same up to ast level, at least.
//

var SYM = Sk.ParseTables.sym;
var TOK = Sk.Tokenizer.Tokens;

/** @constructor */
function Compiling(encoding, filename)
{
    this.c_encoding = encoding;
    this.c_filename = filename;
}

/**
 * @return {number}
 */
function NCH(n) { goog.asserts.assert(n !== undefined); if (n.children === null) return 0; return n.children.length; }

function CHILD(n, i)
{
    goog.asserts.assert(n !== undefined);
    goog.asserts.assert(i !== undefined);
    return n.children[i];
}

function REQ(n, type) { goog.asserts.assert(n.type === type, "node wasn't expected type"); }

function strobj(s)
{
    goog.asserts.assert(typeof s === "string", "expecting string, got " + (typeof s));
    return new Sk.builtin.str(s);
}

/** @return {number} */
function numStmts(n)
{
    switch (n.type)
    {
        case SYM.single_input:
            if (CHILD(n, 0).type === TOK.T_NEWLINE)
                return 0;
            else
                return numStmts(CHILD(n, 0));
        case SYM.file_input:
            var cnt = 0;
            for (var i = 0; i < NCH(n); ++i)
            {
                var ch = CHILD(n, i);
                if (ch.type === SYM.stmt)
                    cnt += numStmts(ch);
            }
            return cnt;
        case SYM.stmt:
            return numStmts(CHILD(n, 0));
        case SYM.compound_stmt:
            return 1;
        case SYM.simple_stmt:
            return Math.floor(NCH(n) / 2); // div 2 is to remove count of ;s
        case SYM.suite:
            if (NCH(n) === 1)
                return numStmts(CHILD(n, 0));
            else
            {
                 var cnt = 0;
                 for (var i = 2; i < NCH(n) - 1; ++i)
                     cnt += numStmts(CHILD(n, i));
                 return cnt;
            }
        default:
            goog.asserts.fail("Non-statement found");
    }
    return 0;
}

function forbiddenCheck(c, n, x, lineno)
{
    if (x === "None") throw new Sk.builtin.SyntaxError("assignment to None", c.c_filename, lineno);
    if (x === "True" || x === "False") throw new Sk.builtin.SyntaxError("assignment to True or False is forbidden", c.c_filename, lineno);
}

/**
 * Set the context ctx for e, recursively traversing e.
 *
 * Only sets context for expr kinds that can appear in assignment context as
 * per the asdl file.
 */
function setContext(c, e, ctx, n)
{
    goog.asserts.assert(ctx !== AugStore && ctx !== AugLoad);
    var s = null;
    var exprName = null;

    switch (e.constructor)
    {
        case Attribute:
        case Name:
            if (ctx === Store) forbiddenCheck(c, n, e.attr, n.lineno);
            e.ctx = ctx;
            break;
        case Subscript:
            e.ctx = ctx;
            break;
        case List:
            e.ctx = ctx;
            s = e.elts;
            break;
        case Tuple:
            if (e.elts.length === 0)
                throw new Sk.builtin.SyntaxError("can't assign to ()", c.c_filename, n.lineno);
            e.ctx = ctx;
            s = e.elts;
            break;
        case Lambda:
            exprName = "lambda";
            break;
        case Call:
            exprName = "function call";
            break;
        case BoolOp:
        case BinOp:
        case UnaryOp:
            exprName = "operator";
            break;
        case GeneratorExp:
            exprName = "generator expression";
            break;
        case Yield:
            exprName = "yield expression";
            break;
        case ListComp:
            exprName = "list comprehension";
            break;
        case Dict:
        case Num:
        case Str:
            exprName = "literal";
            break;
        case Compare:
            exprName = "comparison";
            break;
        case IfExp:
            exprName = "conditional expression";
            break;
        default:
            goog.asserts.fail("unhandled expression in assignment");
    }
    if (exprName)
    {
        throw new Sk.builtin.SyntaxError("can't " + (ctx === Store ? "assign to" : "delete") + " " + exprName, c.c_filename, n.lineno);
    }

    if (s)
    {
        for (var i = 0; i < s.length; ++i)
        {
            setContext(c, s[i], ctx, n);
        }
    }
}

var operatorMap = {};
(function() {
    operatorMap[TOK.T_VBAR] = BitOr;
    operatorMap[TOK.T_VBAR] = BitOr;
    operatorMap[TOK.T_CIRCUMFLEX] = BitXor;
    operatorMap[TOK.T_AMPER] = BitAnd;
    operatorMap[TOK.T_LEFTSHIFT] = LShift;
    operatorMap[TOK.T_RIGHTSHIFT] = RShift;
    operatorMap[TOK.T_PLUS] = Add;
    operatorMap[TOK.T_MINUS] = Sub;
    operatorMap[TOK.T_STAR] = Mult;
    operatorMap[TOK.T_SLASH] = Div;
    operatorMap[TOK.T_DOUBLESLASH] = FloorDiv;
    operatorMap[TOK.T_PERCENT] = Mod;
}());
function getOperator(n)
{
    goog.asserts.assert(operatorMap[n.type] !== undefined);
    return operatorMap[n.type];
}

function astForCompOp(c, n)
{
    /* comp_op: '<'|'>'|'=='|'>='|'<='|'<>'|'!='|'in'|'not' 'in'|'is'
               |'is' 'not'
    */
    REQ(n, SYM.comp_op);
    if (NCH(n) === 1)
    {
        n = CHILD(n, 0);
        switch (n.type)
        {
            case TOK.T_LESS: return Lt;
            case TOK.T_GREATER: return Gt;
            case TOK.T_EQEQUAL: return Eq;
            case TOK.T_LESSEQUAL: return LtE;
            case TOK.T_GREATEREQUAL: return GtE;
            case TOK.T_NOTEQUAL: return NotEq;
            case TOK.T_NAME:
                if (n.value === "in") return In_;
                if (n.value === "is") return Is;
        }
    }
    else if (NCH(n) === 2)
    {
        if (CHILD(n, 0).type === TOK.T_NAME)
        {
            if (CHILD(n, 1).value === "in") return NotIn;
            if (CHILD(n, 0).value === "is") return IsNot;
        }
    }
    goog.asserts.fail("invalid comp_op");
}

function seqForTestlist(c, n)
{
    /* testlist: test (',' test)* [','] */
    goog.asserts.assert(n.type === SYM.testlist ||
            n.type === SYM.listmaker ||
            n.type === SYM.testlist_gexp ||
            n.type === SYM.testlist_safe ||
            n.type === SYM.testlist1);
    var seq = [];
    for (var i = 0; i < NCH(n); i += 2)
    {
        goog.asserts.assert(CHILD(n, i).type === SYM.test || CHILD(n, i).type === SYM.old_test);
        seq[i / 2] = astForExpr(c, CHILD(n, i));
    }
    return seq;
}

function astForSuite(c, n)
{
    /* suite: simple_stmt | NEWLINE INDENT stmt+ DEDENT */
    REQ(n, SYM.suite);
    var seq = [];
    var pos = 0;
    var ch;
    if (CHILD(n, 0).type === SYM.simple_stmt)
    {
        n = CHILD(n, 0);
        /* simple_stmt always ends with an NEWLINE and may have a trailing
         * SEMI. */
        var end = NCH(n) - 1;
        if (CHILD(n, end - 1).type === TOK.T_SEMI)
            end -= 1;
        for (var i = 0; i < end; i += 2) // by 2 to skip ;
            seq[pos++] = astForStmt(c, CHILD(n, i));
    }
    else
    {
        for (var i = 2; i < NCH(n) - 1; ++i)
        {
            ch = CHILD(n, i);
            REQ(ch, SYM.stmt);
            var num = numStmts(ch);
            if (num === 1)
            {
                // small_stmt or compound_stmt w/ only 1 child
                seq[pos++] = astForStmt(c, ch);
            }
            else
            {
                ch = CHILD(ch, 0);
                REQ(ch, SYM.simple_stmt);
                for (var j = 0; j < NCH(ch); j += 2)
                {
                    if (NCH(CHILD(ch, j)) === 0)
                    {
                        goog.asserts.assert(j + 1 === NCH(ch));
                        break;
                    }
                    seq[pos++] = astForStmt(c, CHILD(ch, j));
                }
            }
        }
    }
    goog.asserts.assert(pos === numStmts(n));
    return seq;
}

function astForExceptClause(c, exc, body)
{
    /* except_clause: 'except' [test [(',' | 'as') test]] */
    REQ(exc, SYM.except_clause);
    REQ(body, SYM.suite);
    if (NCH(exc) === 1)
        return new ExceptHandler(null, null, astForSuite(c, body), exc.lineno, exc.col_offset);
    else if (NCH(exc) === 2)
        return new ExceptHandler(astForExpr(c, CHILD(exc, 1)), null, astForSuite(c, body), exc.lineno, exc.col_offset);
    else if (NCH(exc) === 4)
    {
        var e = astForExpr(c, CHILD(exc, 3));
        setContext(c, e, Store, CHILD(exc, 3));
        return new ExceptHandler(astForExpr(c, CHILD(exc, 1)), e, astForSuite(c, body), exc.lineno, exc.col_offset);
    }
    goog.asserts.fail("wrong number of children for except clause");
}

function astForTryStmt(c, n)
{
    var nc = NCH(n);
    var nexcept = (nc - 3) / 3;
    var body, orelse = [], finally_ = null;

    REQ(n, SYM.try_stmt);
    body = astForSuite(c, CHILD(n, 2));
    if (CHILD(n, nc - 3).type === TOK.T_NAME)
    {
        if (CHILD(n, nc - 3).value === "finally")
        {
            if (nc >= 9 && CHILD(n, nc - 6).type === TOK.T_NAME)
            {
                /* we can assume it's an "else",
                   because nc >= 9 for try-else-finally and
                   it would otherwise have a type of except_clause */
                orelse = astForSuite(c, CHILD(n, nc - 4));
                nexcept--;
            }

            finally_ = astForSuite(c, CHILD(n, nc - 1));
            nexcept--;
        }
        else
        {
            /* we can assume it's an "else",
               otherwise it would have a type of except_clause */
            orelse = astForSuite(c, CHILD(n, nc - 1));
            nexcept--;
        }
    }
    else if (CHILD(n, nc - 3).type !== SYM.except_clause)
    {
        throw new Sk.builtin.SyntaxError("malformed 'try' statement", c.c_filename, n.lineno);
    }

    if (nexcept > 0)
    {
        var handlers = [];
        for (var i = 0; i < nexcept; ++i)
            handlers[i] = astForExceptClause(c, CHILD(n, 3 + i * 3), CHILD(n, 5 + i * 3));
        var exceptSt = new TryExcept(body, handlers, orelse, n.lineno, n.col_offset);

        if (!finally_)
            return exceptSt;

        /* if a 'finally' is present too, we nest the TryExcept within a
           TryFinally to emulate try ... except ... finally */
        body = [exceptSt];
    }

    goog.asserts.assert(finally_ !== null);
    return new TryFinally(body, finally_, n.lineno, n.col_offset);
}


function astForDottedName(c, n)
{
    REQ(n, SYM.dotted_name);
    var lineno = n.lineno;
    var col_offset = n.col_offset;
    var id = strobj(CHILD(n, 0).value);
    var e = new Name(id, Load, lineno, col_offset);
    for (var i = 2; i < NCH(n); i += 2)
    {
        id = strobj(CHILD(n, i).value);
        e = new Attribute(e, id, Load, lineno, col_offset);
    }
    return e;
}

function astForDecorator(c, n)
{
    /* decorator: '@' dotted_name [ '(' [arglist] ')' ] NEWLINE */
    REQ(n, SYM.decorator);
    REQ(CHILD(n, 0), TOK.T_AT);
    REQ(CHILD(n, NCH(n) - 1), TOK.T_NEWLINE);
    var nameExpr = astForDottedName(c, CHILD(n, 1));
    var d;
    if (NCH(n) === 3) // no args
        return nameExpr;
    else if (NCH(n) === 5) // call with no args
        return new Call(nameExpr, [], [], null, null, n.lineno, n.col_offset);
    else
        return astForCall(c, CHILD(n, 3), nameExpr);
}

function astForDecorators(c, n)
{
    REQ(n, SYM.decorators);
    var decoratorSeq = [];
    for (var i = 0; i < NCH(n); ++i)
        decoratorSeq[i] = astForDecorator(c, CHILD(n, i));
    return decoratorSeq;
}

function astForDecorated(c, n)
{
    REQ(n, SYM.decorated);
    var decoratorSeq = astForDecorators(c, CHILD(n, 0));
    goog.asserts.assert(CHILD(n, 1).type === SYM.funcdef || CHILD(n, 1).type === SYM.classdef);

    var thing = null;
    if (CHILD(n, 1).type === SYM.funcdef)
        thing = astForFuncdef(c, CHILD(n, 1), decoratorSeq);
    else if (CHILD(n, 1) === SYM.classdef)
        thing = astForClassdef(c, CHILD(n, 1), decoratorSeq);
    if (thing)
    {
        thing.lineno = n.lineno;
        thing.col_offset = n.col_offset;
    }
    return thing;
}

function astForWithVar(c, n)
{
    REQ(n, SYM.with_var);
    return astForExpr(c, CHILD(n, 1));
}

function astForWithStmt(c, n)
{
    /* with_stmt: 'with' test [ with_var ] ':' suite */
    var suiteIndex = 3; // skip with, test, :
    goog.asserts.assert(n.type === SYM.with_stmt);
    var contextExpr = astForExpr(c, CHILD(n, 1));
    if (CHILD(n, 2).type === SYM.with_var)
    {
        var optionalVars = astForWithVar(c, CHILD(n, 2));
        setContext(c, optionalVars, Store, n);
        suiteIndex = 4;
    }
    return new With_(contextExpr, optionalVars, astForSuite(c, CHILD(n, suiteIndex)), n.lineno, n.col_offset);
}

function astForExecStmt(c, n)
{
    var expr1, globals = null, locals = null;
    var nchildren = NCH(n);
    goog.asserts.assert(nchildren === 2 || nchildren === 4 || nchildren === 6);

    /* exec_stmt: 'exec' expr ['in' test [',' test]] */
    REQ(n, SYM.exec_stmt);
    var expr1 = astForExpr(c, CHILD(n, 1));
    if (nchildren >= 4)
        globals = astForExpr(c, CHILD(n, 3));
    if (nchildren === 6)
        locals = astForExpr(c, CHILD(n, 5));
    return new Exec(expr1, globals, locals, n.lineno, n.col_offset);
}

function astForIfStmt(c, n)
{
    /* if_stmt: 'if' test ':' suite ('elif' test ':' suite)*
       ['else' ':' suite]
    */
    REQ(n, SYM.if_stmt);
    if (NCH(n) === 4)
        return new If_(
                astForExpr(c, CHILD(n, 1)),
                astForSuite(c, CHILD(n, 3)),
                [], n.lineno, n.col_offset);

    var s = CHILD(n, 4).value;
    var decider = s.charAt(2); // elSe or elIf
    if (decider === 's')
    {
        return new If_(
                astForExpr(c, CHILD(n, 1)),
                astForSuite(c, CHILD(n, 3)), 
                astForSuite(c, CHILD(n, 6)), 
                n.lineno, n.col_offset);
    }
    else if (decider === 'i')
    {
        var nElif = NCH(n) - 4;
        var hasElse = false;
        var orelse = [];
        
        /* must reference the child nElif+1 since 'else' token is third, not
         * fourth child from the end. */
        if (CHILD(n, nElif + 1).type === TOK.T_NAME
            && CHILD(n, nElif + 1).value.charAt(2) === 's')
        {
            hasElse = true;
            nElif -= 3;
        }
        nElif /= 4;

        if (hasElse)
        {
            orelse = [
                new If_(
                    astForExpr(c, CHILD(n, NCH(n) - 6)),
                    astForSuite(c, CHILD(n, NCH(n) - 4)),
                    astForSuite(c, CHILD(n, NCH(n) - 1)),
                    CHILD(n, NCH(n) - 6).lineno,
                    CHILD(n, NCH(n) - 6).col_offset)];
            nElif--;
        }

        for (var i = 0; i < nElif; ++i)
        {
            var off = 5 + (nElif - i - 1) * 4;
            orelse = [
                new If_(
                    astForExpr(c, CHILD(n, off)),
                    astForSuite(c, CHILD(n, off + 2)),
                    orelse,
                    CHILD(n, off).lineno,
                    CHILD(n, off).col_offset)];
        }
        return new If_(
                astForExpr(c, CHILD(n, 1)),
                astForSuite(c, CHILD(n, 3)),
                orelse, n.lineno, n.col_offset);
    }
    
    goog.asserts.fail("unexpected token in 'if' statement");
}

function astForExprlist(c, n, context)
{
    REQ(n, SYM.exprlist);
    var seq = [];
    for (var i = 0; i < NCH(n); i += 2)
    {
        var e = astForExpr(c, CHILD(n, i));
        seq[i / 2] = e;
        if (context) setContext(c, e, context, CHILD(n, i));
    }
    return seq;
}

function astForDelStmt(c, n)
{
    /* del_stmt: 'del' exprlist */
    REQ(n, SYM.del_stmt);
    return new Delete_(astForExprlist(c, CHILD(n, 1), Del), n.lineno, n.col_offset);
}

function astForGlobalStmt(c, n)
{
    /* global_stmt: 'global' NAME (',' NAME)* */
    REQ(n, SYM.global_stmt);
    var s = [];
    for (var i = 1; i < NCH(n); i += 2)
    {
        s[(i - 1) / 2] = strobj(CHILD(n, i).value);
    }
    return new Global(s, n.lineno, n.col_offset);
}

function astForAssertStmt(c, n)
{
    /* assert_stmt: 'assert' test [',' test] */
    REQ(n, SYM.assert_stmt);
    if (NCH(n) === 2)
        return new Assert(astForExpr(c, CHILD(n, 1)), null, n.lineno, n.col_offset);
    else if (NCH(n) === 4)
        return new Assert(astForExpr(c, CHILD(n, 1)), astForExpr(c, CHILD(n, 3)), n.lineno, n.col_offset);
    goog.asserts.fail("improper number of parts to assert stmt");
}

function aliasForImportName(c, n)
{
    /*
      import_as_name: NAME ['as' NAME]
      dotted_as_name: dotted_name ['as' NAME]
      dotted_name: NAME ('.' NAME)*
    */

    loop: while (true) {
        switch (n.type)
        {
            case SYM.import_as_name:
                var str = null;
                var name = strobj(CHILD(n, 0).value);
                if (NCH(n) === 3)
                    str = CHILD(n, 2).value;
                return new alias(name, str == null ? null : strobj(str));
            case SYM.dotted_as_name:
                if (NCH(n) === 1)
                {
                    n = CHILD(n, 0);
                    continue loop;
                }
                else
                {
                    var a = aliasForImportName(c, CHILD(n, 0));
                    goog.asserts.assert(!a.asname);
                    a.asname = strobj(CHILD(n, 2).value);
                    return a;
                }
            case SYM.dotted_name:
                if (NCH(n) === 1)
                    return new alias(strobj(CHILD(n, 0).value), null);
                else
                {
                    // create a string of the form a.b.c
                    var str = '';
                    for (var i = 0; i < NCH(n); i += 2)
                        str += CHILD(n, i).value + ".";
                    return new alias(strobj(str.substr(0, str.length - 1)), null);
                }
            case TOK.T_STAR:
                return new alias(strobj("*"), null);
            default:
                throw new Sk.builtin.SyntaxError("unexpected import name", c.c_filename, n.lineno);
        }
    break; }
}

function astForImportStmt(c, n)
{
    /*
      import_stmt: import_name | import_from
      import_name: 'import' dotted_as_names
      import_from: 'from' ('.'* dotted_name | '.') 'import'
                          ('*' | '(' import_as_names ')' | import_as_names)
    */
    REQ(n, SYM.import_stmt);
    var lineno = n.lineno;
    var col_offset = n.col_offset;
    n = CHILD(n, 0);
    if (n.type === SYM.import_name)
    {
        n = CHILD(n, 1);
        REQ(n, SYM.dotted_as_names);
        var aliases = [];
        for (var i = 0; i < NCH(n); i += 2)
            aliases[i / 2] = aliasForImportName(c, CHILD(n, i));
        return new Import_(aliases, lineno, col_offset);
    }
    else if (n.type === SYM.import_from)
    {
        var mod = null;
        var ndots = 0;
        var nchildren;

        for (var idx = 1; idx < NCH(n); ++idx)
        {
            if (CHILD(n, idx).type === SYM.dotted_name)
            {
                mod = aliasForImportName(c, CHILD(n, idx));
                idx++;
                break;
            }
            else if (CHILD(n, idx).type !== TOK.T_DOT)
                break;
            ndots++;
        }
        ++idx; // skip the import keyword
        switch (CHILD(n, idx).type)
        {
            case TOK.T_STAR:
                // from ... import
                n = CHILD(n, idx);
                nchildren = 1;
                break;
            case TOK.T_LPAR:
                // from ... import (x, y, z)
                n = CHILD(n, idx + 1);
                nchildren = NCH(n);
                break;
            case SYM.import_as_names:
                // from ... import x, y, z
                n = CHILD(n, idx);
                nchildren = NCH(n);
                if (nchildren % 2 === 0)
                    throw new Sk.builtin.SyntaxError("trailing comma not allowed without surrounding parentheses", c.c_filename, n.lineno);
                break;
            default:
                throw new Sk.builtin.SyntaxError("Unexpected node-type in from-import", c.c_filename, n.lineno);
        }
        var aliases = [];
        if (n.type === TOK.T_STAR)
            aliases[0] = aliasForImportName(c, n);
        else
            for (var i = 0; i < NCH(n); i += 2)
                aliases[i / 2] = aliasForImportName(c, CHILD(n, i));
        var modname = mod ? mod.name.v : "";
        return new ImportFrom(strobj(modname), aliases, ndots, lineno, col_offset);
    }
    throw new Sk.builtin.SyntaxError("unknown import statement", c.c_filename, n.lineno);
}

function astForTestlistGexp(c, n)
{
    /* testlist_gexp: test ( gen_for | (',' test)* [','] ) */
    /* argument: test [ gen_for ] */
    goog.asserts.assert(n.type === SYM.testlist_gexp || n.type === SYM.argument);
    if (NCH(n) > 1 && CHILD(n, 1).type === SYM.gen_for)
        return astForGenexp(c, n);
    return astForTestlist(c, n);
}

function astForListcomp(c, n)
{
    /* listmaker: test ( list_for | (',' test)* [','] )
       list_for: 'for' exprlist 'in' testlist_safe [list_iter]
       list_iter: list_for | list_if
       list_if: 'if' test [list_iter]
       testlist_safe: test [(',' test)+ [',']]
    */

    function countListFors(c, n)
    {
        var nfors = 0;
        var ch = CHILD(n, 1);
        count_list_for: while(true) {
            nfors++;
            REQ(ch, SYM.list_for);
            if (NCH(ch) === 5)
                ch = CHILD(ch, 4);
            else
                return nfors;
            count_list_iter: while(true) {
                REQ(ch, SYM.list_iter);
                ch = CHILD(ch, 0);
                if (ch.type === SYM.list_for)
                    continue count_list_for;
                else if (ch.type === SYM.list_if)
                {
                    if (NCH(ch) === 3)
                    {
                        ch = CHILD(ch, 2);
                        continue count_list_iter;
                    }
                    else
                        return nfors;
                }
            break; }
        break; }
    }

    function countListIfs(c, n)
    {
        var nifs = 0;
        while (true)
        {
            REQ(n, SYM.list_iter);
            if (CHILD(n, 0).type === SYM.list_for)
                return nifs;
            n = CHILD(n, 0);
            REQ(n, SYM.list_if);
            nifs++;
            if (NCH(n) == 2)
                return nifs;
            n = CHILD(n, 2);
        }
    }

    REQ(n, SYM.listmaker);
    goog.asserts.assert(NCH(n) > 1);
    var elt = astForExpr(c, CHILD(n, 0));
    var nfors = countListFors(c, n);
    var listcomps = [];
    var ch = CHILD(n, 1);
    for (var i = 0; i < nfors; ++i)
    {
        REQ(ch, SYM.list_for);
        var forch = CHILD(ch, 1);
        var t = astForExprlist(c, forch, Store);
        var expression = astForTestlist(c, CHILD(ch, 3));
        var lc;
        if (NCH(forch) === 1)
            lc = new comprehension(t[0], expression, []);
        else
            lc = new comprehension(new Tuple(t, Store, ch.lineno, ch.col_offset), expression, []);

        if (NCH(ch) === 5)
        {
            ch = CHILD(ch, 4);
            var nifs = countListIfs(c, ch);
            var ifs = [];
            for (var j = 0; j < nifs; ++j)
            {
                REQ(ch, SYM.list_iter);
                ch = CHILD(ch, 0);
                REQ(ch, SYM.list_if);
                ifs[j] = astForExpr(c, CHILD(ch, 1));
                if (NCH(ch) === 3)
                    ch = CHILD(ch, 2);
            }
            if (ch.type === SYM.list_iter)
                ch = CHILD(ch, 0);
            lc.ifs = ifs;
        }
        listcomps[i] = lc;
    }
    return new ListComp(elt, listcomps, n.lineno, n.col_offset);
}

function astForFactor(c, n)
{
    /* some random peephole thing that cpy does */
    if (CHILD(n, 0).type === TOK.T_MINUS && NCH(n) === 2)
    {
        var pfactor = CHILD(n, 1);
        if (pfactor.type === SYM.factor && NCH(pfactor) === 1)
        {
            var ppower = CHILD(pfactor, 0);
            if (ppower.type === SYM.power && NCH(ppower) === 1)
            {
                var patom = CHILD(ppower, 0);
                if (patom.type === SYM.atom)
                {
                    var pnum = CHILD(patom, 0);
                    if (pnum.type === TOK.T_NUMBER)
                    {
                        pnum.value = "-" + pnum.value;
                        return astForAtom(c, patom);
                    }
                }
            }
        }
    }

    var expression = astForExpr(c, CHILD(n, 1));
    switch (CHILD(n, 0).type)
    {
        case TOK.T_PLUS: return new UnaryOp(UAdd, expression, n.lineno, n.col_offset);
        case TOK.T_MINUS: return new UnaryOp(USub, expression, n.lineno, n.col_offset);
        case TOK.T_TILDE: return new UnaryOp(Invert, expression, n.lineno, n.col_offset);
    }

    goog.asserts.fail("unhandled factor");
}

function astForForStmt(c, n)
{
    /* for_stmt: 'for' exprlist 'in' testlist ':' suite ['else' ':' suite] */
    var seq = [];
    REQ(n, SYM.for_stmt);
    if (NCH(n) === 9)
        seq = astForSuite(c, CHILD(n, 8));
    var nodeTarget = CHILD(n, 1);
    var _target = astForExprlist(c, nodeTarget, Store);
    var target;
    if (NCH(nodeTarget) === 1)
        target = _target[0];
    else
        target = new Tuple(_target, Store, n.lineno, n.col_offset);

    return new For_(target,
            astForTestlist(c, CHILD(n, 3)),
            astForSuite(c, CHILD(n, 5)),
            seq, n.lineno, n.col_offset);
}

function astForCall(c, n, func)
{
    /*
      arglist: (argument ',')* (argument [',']| '*' test [',' '**' test]
               | '**' test)
      argument: [test '='] test [gen_for]        # Really [keyword '='] test
    */
    REQ(n, SYM.arglist);
    var nargs = 0;
    var nkeywords = 0;
    var ngens = 0;
    for (var i = 0; i < NCH(n); ++i)
    {
        var ch = CHILD(n, i);
        if (ch.type === SYM.argument)
        {
            if (NCH(ch) === 1) nargs++;
            else if (CHILD(ch, 1).type === SYM.gen_for) ngens++;
            else nkeywords++;
        }
    }
    if (ngens > 1 || (ngens && (nargs || nkeywords)))
        throw new Sk.builtin.SyntaxError("Generator expression must be parenthesized if not sole argument", c.c_filename, n.lineno);
    if (nargs + nkeywords + ngens > 255)
        throw new Sk.builtin.SyntaxError("more than 255 arguments", c.c_filename, n.lineno);
    var args = [];
    var keywords = [];
    nargs = 0;
    nkeywords = 0;
    var vararg = null;
    var kwarg = null;
    for (var i = 0; i < NCH(n); ++i)
    {
        var ch = CHILD(n, i);
        if (ch.type === SYM.argument)
        {
            if (NCH(ch) === 1)
            {
                if (nkeywords) throw new Sk.builtin.SyntaxError("non-keyword arg after keyword arg", c.c_filename, n.lineno);
                if (vararg) throw new Sk.builtin.SyntaxError("only named arguments may follow *expression", c.c_filename, n.lineno);
                args[nargs++] = astForExpr(c, CHILD(ch, 0));
            }
            else if (CHILD(ch, 1).type === SYM.gen_for)
                args[nargs++] = astForGenexp(c, ch);
            else
            {
                var e = astForExpr(c, CHILD(ch, 0));
                if (e.constructor === Lambda) throw new Sk.builtin.SyntaxError("lambda cannot contain assignment", c.c_filename, n.lineno);
                else if (e.constructor !== Name) throw new Sk.builtin.SyntaxError("keyword can't be an expression", c.c_filename, n.lineno);
                var key = e.id;
                forbiddenCheck(c, CHILD(ch, 0), key, n.lineno);
                for (var k = 0; k < nkeywords; ++k)
                {
                    var tmp = keywords[k].arg;
                    if (tmp === key) throw new Sk.builtin.SyntaxError("keyword argument repeated", c.c_filename, n.lineno);
                }
                keywords[nkeywords++] = new keyword(key, astForExpr(c, CHILD(ch, 2)));
            }
        }
        else if (ch.type === TOK.T_STAR)
            vararg = astForExpr(c, CHILD(n, ++i));
        else if (ch.type === TOK.T_DOUBLESTAR)
            kwarg = astForExpr(c, CHILD(n, ++i));
    }
    return new Call(func, args, keywords, vararg, kwarg, func.lineno, func.col_offset);
}

function astForTrailer(c, n, leftExpr)
{
    /* trailer: '(' [arglist] ')' | '[' subscriptlist ']' | '.' NAME 
       subscriptlist: subscript (',' subscript)* [',']
       subscript: '.' '.' '.' | test | [test] ':' [test] [sliceop]
     */
    REQ(n, SYM.trailer);
    if (CHILD(n, 0).type === TOK.T_LPAR)
    {
        if (NCH(n) === 2)
            return new Call(leftExpr, [], [], null, null, n.lineno, n.col_offset);
        else
            return astForCall(c, CHILD(n, 1), leftExpr);
    }
    else if (CHILD(n, 0).type === TOK.T_DOT)
        return new Attribute(leftExpr, strobj(CHILD(n, 1).value), Load, n.lineno, n.col_offset);
    else
    {
        REQ(CHILD(n, 0), TOK.T_LSQB);
        REQ(CHILD(n, 2), TOK.T_RSQB);
        n = CHILD(n, 1);
        if (NCH(n) === 1)
            return new Subscript(leftExpr, astForSlice(c, CHILD(n, 0)), Load, n.lineno, n.col_offset);
        else
        {
            /* The grammar is ambiguous here. The ambiguity is resolved 
               by treating the sequence as a tuple literal if there are
               no slice features.
            */
            var simple = true;
            var slices = [];
            for (var j = 0; j < NCH(n); j += 2)
            {
                var slc = astForSlice(c, CHILD(n, j));
                if (slc.constructor !== Index)
                    simple = false;
                slices[j / 2] = slc;
            }
            if (!simple)
            {
                return new Subscript(leftExpr, new ExtSlice(slices), Load, n.lineno, n.col_offset);
            }
            var elts = [];
            for (var j = 0; j < slices.length; ++j)
            {
                var slc = slices[j];
                goog.asserts.assert(slc.constructor === Index && slc.value !== null && slc.value !== undefined);
                elts[j] = slc.value;
            }
            var e = new Tuple(elts, Load, n.lineno, n.col_offset);
            return new Subscript(leftExpr, new Index(e), Load, n.lineno, n.col_offset);
        }
    }
}

function astForFlowStmt(c, n)
{
    /*
      flow_stmt: break_stmt | continue_stmt | return_stmt | raise_stmt
                 | yield_stmt
      break_stmt: 'break'
      continue_stmt: 'continue'
      return_stmt: 'return' [testlist]
      yield_stmt: yield_expr
      yield_expr: 'yield' testlist
      raise_stmt: 'raise' [test [',' test [',' test]]]
    */
    var ch;
    REQ(n, SYM.flow_stmt);
    ch = CHILD(n, 0);
    switch (ch.type)
    {
        case SYM.break_stmt: return new Break_(n.lineno, n.col_offset);
        case SYM.continue_stmt: return new Continue_(n.lineno, n.col_offset);
        case SYM.yield_stmt:
            return new Expr(astForExpr(c, CHILD(ch, 0)), n.lineno, n.col_offset);
        case SYM.return_stmt:
            if (NCH(ch) === 1)
                return new Return_(null, n.lineno, n.col_offset);
            else
                return new Return_(astForTestlist(c, CHILD(ch, 1)), n.lineno, n.col_offset);
        case SYM.raise_stmt:
            if (NCH(ch) === 1)
                return new Raise(null, null, null, n.lineno, n.col_offset);
            else if (NCH(ch) === 2)
                return new Raise(astForExpr(c, CHILD(ch, 1)), null, null, n.lineno, n.col_offset);
            else if (NCH(ch) === 4)
                return new Raise(
                        astForExpr(c, CHILD(ch, 1)),
                        astForExpr(c, CHILD(ch, 3)),
                        null, n.lineno, n.col_offset);
            else if (NCH(ch) === 6)
                return new Raise(
                        astForExpr(c, CHILD(ch, 1)),
                        astForExpr(c, CHILD(ch, 3)),
                        astForExpr(c, CHILD(ch, 5)),
                        n.lineno, n.col_offset);
        default:
            goog.asserts.fail("unexpected flow_stmt");
    }
    goog.asserts.fail("unhandled flow statement");
}

function astForArguments(c, n)
{
    /* parameters: '(' [varargslist] ')'
       varargslist: (fpdef ['=' test] ',')* ('*' NAME [',' '**' NAME]
            | '**' NAME) | fpdef ['=' test] (',' fpdef ['=' test])* [',']
    */
    var ch;
    var vararg = null;
    var kwarg = null;
    if (n.type === SYM.parameters)
    {
        if (NCH(n) === 2) // () as arglist
            return new arguments_([], null, null, []);
        n = CHILD(n, 1);
    }
    REQ(n, SYM.varargslist);

    var args = [];
    var defaults = [];

    /* fpdef: NAME | '(' fplist ')'
       fplist: fpdef (',' fpdef)* [',']
    */
    var foundDefault = false;
    var i = 0;
    var j = 0; // index for defaults
    var k = 0; // index for args
    while (i < NCH(n))
    {
        ch = CHILD(n, i);
        switch (ch.type)
        {
            case SYM.fpdef:
                var complexArgs = 0;
                var parenthesized = 0;
                handle_fpdef: while (true) {
                    if (i + 1 < NCH(n) && CHILD(n, i + 1).type === TOK.T_EQUAL)
                    {
                        defaults[j++] = astForExpr(c, CHILD(n, i + 2));
                        i += 2;
                        foundDefault = true;
                    }
                    else if (foundDefault)
                    {
                        /* def f((x)=4): pass should raise an error.
                           def f((x, (y))): pass will just incur the tuple unpacking warning. */
                        if (parenthesized && !complexArgs)
                            throw new Sk.builtin.SyntaxError("parenthesized arg with default", c.c_filename, n.lineno);
                        throw new Sk.builtin.SyntaxError("non-default argument follows default argument", c.c_filename, n.lineno);
                    }

                    if (NCH(ch) === 3)
                    {
                        ch = CHILD(ch, 1);
                        // def foo((x)): is not complex, special case.
                        if (NCH(ch) !== 1)
                        {
                            throw new Sk.builtin.SyntaxError("tuple parameter unpacking has been removed", c.c_filename, n.lineno);
                        }
                        else
                        {
                            /* def foo((x)): setup for checking NAME below. */
                            /* Loop because there can be many parens and tuple
                               unpacking mixed in. */
                            parenthesized = true;
                            ch = CHILD(ch, 0);
                            goog.asserts.assert(ch.type === SYM.fpdef);
                            continue handle_fpdef;
                        }
                    }
                    if (CHILD(ch, 0).type === TOK.T_NAME)
                    {
                        forbiddenCheck(c, n, CHILD(ch, 0).value, n.lineno);
                        var id = strobj(CHILD(ch, 0).value);
                        args[k++] = new Name(id, Param, ch.lineno, ch.col_offset);
                    }
                    i += 2;
                    if (parenthesized)
                        throw new Sk.builtin.SyntaxError("parenthesized argument names are invalid", c.c_filename, n.lineno);
                break; }
                break;
            case TOK.T_STAR:
                forbiddenCheck(c, CHILD(n, i + 1), CHILD(n, i + 1).value, n.lineno);
                vararg = strobj(CHILD(n, i + 1).value);
                i += 3;
                break;
            case TOK.T_DOUBLESTAR:
                forbiddenCheck(c, CHILD(n, i + 1), CHILD(n, i + 1).value, n.lineno);
                kwarg = strobj(CHILD(n, i + 1).value);
                i += 3;
                break;
            default:
                goog.asserts.fail("unexpected node in varargslist");
        }
    }
    return new arguments_(args, vararg, kwarg, defaults);
}

function astForFuncdef(c, n, decoratorSeq)
{
    /* funcdef: 'def' NAME parameters ':' suite */
    REQ(n, SYM.funcdef);
    var name = strobj(CHILD(n, 1).value);
    forbiddenCheck(c, CHILD(n, 1), CHILD(n, 1).value, n.lineno);
    var args = astForArguments(c, CHILD(n, 2));
    var body = astForSuite(c, CHILD(n, 4));
    return new FunctionDef(name, args, body, decoratorSeq, n.lineno, n.col_offset);
}

function astForClassBases(c, n)
{
    /* testlist: test (',' test)* [','] */
    goog.asserts.assert(NCH(n) > 0);
    REQ(n, SYM.testlist);
    if (NCH(n) === 1)
        return [ astForExpr(c, CHILD(n, 0)) ];
    return seqForTestlist(c, n);
}

function astForClassdef(c, n, decoratorSeq)
{
    /* classdef: 'class' NAME ['(' testlist ')'] ':' suite */
    REQ(n, SYM.classdef);
    forbiddenCheck(c, n, CHILD(n, 1).value, n.lineno);
    var classname = strobj(CHILD(n, 1).value);
    if (NCH(n) === 4)
        return new ClassDef(classname, [], astForSuite(c, CHILD(n, 3)), decoratorSeq, n.lineno, n.col_offset);
    if (CHILD(n, 3).type === TOK.T_RPAR)
        return new ClassDef(classname, [], astForSuite(c, CHILD(n, 5)), decoratorSeq, n.lineno, n.col_offset);

    var bases = astForClassBases(c, CHILD(n, 3));
    var s = astForSuite(c, CHILD(n, 6));
    return new ClassDef(classname, bases, s, decoratorSeq, n.lineno, n.col_offset);
}

function astForLambdef(c, n)
{
    /* lambdef: 'lambda' [varargslist] ':' test */
    var args;
    var expression;
    if (NCH(n) === 3)
    {
        args = new arguments_([], null, null, []);
        expression = astForExpr(c, CHILD(n, 2));
    }
    else
    {
        args = astForArguments(c, CHILD(n, 1));
        expression = astForExpr(c, CHILD(n, 3));
    }
    return new Lambda(args, expression, n.lineno, n.col_offset);
}

function astForGenexp(c, n)
{
    /* testlist_gexp: test ( gen_for | (',' test)* [','] )
       argument: [test '='] test [gen_for]       # Really [keyword '='] test */
    goog.asserts.assert(n.type === SYM.testlist_gexp || n.type === SYM.argument);
    goog.asserts.assert(NCH(n) > 1);

    function countGenFors(c, n)
    {
        var nfors = 0;
        var ch = CHILD(n, 1);
        count_gen_for: while(true) {
            nfors++;
            REQ(ch, SYM.gen_for);
            if (NCH(ch) === 5)
                ch = CHILD(ch, 4);
            else
                return nfors;
            count_gen_iter: while(true) {
                REQ(ch, SYM.gen_iter);
                ch = CHILD(ch, 0);
                if (ch.type === SYM.gen_for)
                    continue count_gen_for;
                else if (ch.type === SYM.gen_if)
                {
                    if (NCH(ch) === 3)
                    {
                        ch = CHILD(ch, 2);
                        continue count_gen_iter;
                    }
                    else
                        return nfors;
                }
            break; }
        break; }
        goog.asserts.fail("logic error in countGenFors");
    }

    function countGenIfs(c, n)
    {
        var nifs = 0;
        while (true)
        {
            REQ(n, SYM.gen_iter);
            if (CHILD(n, 0).type === SYM.gen_for)
                return nifs;
            n = CHILD(n, 0);
            REQ(n, SYM.gen_if);
            nifs++;
            if (NCH(n) == 2)
                return nifs;
            n = CHILD(n, 2);
        }
    }

    var elt = astForExpr(c, CHILD(n, 0));
    var nfors = countGenFors(c, n);
    var genexps = [];
    var ch = CHILD(n, 1);
    for (var i = 0; i < nfors; ++i)
    {
        REQ(ch, SYM.gen_for);
        var forch = CHILD(ch, 1);
        var t = astForExprlist(c, forch, Store);
        var expression = astForExpr(c, CHILD(ch, 3));
        var ge;
        if (NCH(forch) === 1)
            ge = new comprehension(t[0], expression, []);
        else
            ge = new comprehension(new Tuple(t, Store, ch.lineno, ch.col_offset), expression, []);
        if (NCH(ch) === 5)
        {
            ch = CHILD(ch, 4);
            var nifs = countGenIfs(c, ch);
            var ifs = [];
            for (var j = 0; j < nifs; ++j)
            {
                REQ(ch, SYM.gen_iter);
                ch = CHILD(ch, 0);
                REQ(ch, SYM.gen_if);
                expression = astForExpr(c, CHILD(ch, 1));
                ifs[j] = expression;
                if (NCH(ch) === 3)
                    ch = CHILD(ch, 2);
            }
            if (ch.type === SYM.gen_iter)
                ch = CHILD(ch, 0);
            ge.ifs = ifs;
        }
        genexps[i] = ge;
    }
    return new GeneratorExp(elt, genexps, n.lineno, n.col_offset);
}

function astForWhileStmt(c, n)
{
    /* while_stmt: 'while' test ':' suite ['else' ':' suite] */
    REQ(n, SYM.while_stmt);
    if (NCH(n) === 4)
        return new While_(astForExpr(c, CHILD(n, 1)), astForSuite(c, CHILD(n, 3)), [], n.lineno, n.col_offset);
    else if (NCH(n) === 7)
        return new While_(astForExpr(c, CHILD(n, 1)), astForSuite(c, CHILD(n, 3)), astForSuite(c, CHILD(n, 6)), n.lineno, n.col_offset);
    goog.asserts.fail("wrong number of tokens for 'while' stmt");
}

function astForAugassign(c, n)
{
    REQ(n, SYM.augassign);
    n = CHILD(n, 0);
    switch (n.value.charAt(0))
    {
        case '+': return Add;
        case '-': return Sub;
        case '/': if (n.value.charAt(1) === '/') return FloorDiv;
                  return Div;
        case '%': return Mod;
        case '<': return LShift;
        case '>': return RShift;
        case '&': return BitAnd;
        case '^': return BitXor;
        case '|': return BitOr;
        case '*': if (n.value.charAt(1) === '*') return Pow;
                  return Mult;
        default: goog.asserts.fail("invalid augassign");
    }
}

function astForBinop(c, n)
{
    /* Must account for a sequence of expressions.
        How should A op B op C by represented?  
        BinOp(BinOp(A, op, B), op, C).
    */
    var result = new BinOp(
            astForExpr(c, CHILD(n, 0)),
            getOperator(CHILD(n, 1)),
            astForExpr(c, CHILD(n, 2)),
            n.lineno, n.col_offset);
    var nops = (NCH(n) - 1) / 2;
    for (var i = 1 ; i < nops; ++i)
    {
        var nextOper = CHILD(n, i * 2 + 1);
        var newoperator = getOperator(nextOper);
        var tmp = astForExpr(c, CHILD(n, i * 2 + 2));
        result = new BinOp(result, newoperator, tmp, nextOper.lineno, nextOper.col_offset);
    }
    return result;

}

function astForTestlist(c, n)
{
    /* testlist_gexp: test (',' test)* [','] */
    /* testlist: test (',' test)* [','] */
    /* testlist_safe: test (',' test)+ [','] */
    /* testlist1: test (',' test)* */
    goog.asserts.assert(NCH(n) > 0);
    if (n.type === SYM.testlist_gexp)
    {
        if (NCH(n) > 1)
        {
            goog.asserts.assert(CHILD(n, 1).type !== SYM.gen_for);
        }
    }
    else
    {
        goog.asserts.assert(n.type === SYM.testlist || n.type === SYM.testlist_safe || n.type === SYM.testlist1);
    }

    if (NCH(n) === 1)
    {
        return astForExpr(c, CHILD(n, 0));
    }
    else
    {
        return new Tuple(seqForTestlist(c, n), Load, n.lineno, n.col_offset);
    }

}

function astForExprStmt(c, n)
{
    REQ(n, SYM.expr_stmt);
    /* expr_stmt: testlist (augassign (yield_expr|testlist) 
                | ('=' (yield_expr|testlist))*)
       testlist: test (',' test)* [',']
       augassign: '+=' | '-=' | '*=' | '/=' | '%=' | '&=' | '|=' | '^='
                | '<<=' | '>>=' | '**=' | '//='
       test: ... here starts the operator precendence dance
     */
    if (NCH(n) === 1)
        return new Expr(astForTestlist(c, CHILD(n, 0)), n.lineno, n.col_offset);
    else if (CHILD(n, 1).type === SYM.augassign)
    {
        var ch = CHILD(n, 0);
        var expr1 = astForTestlist(c, ch);
        switch (expr1.constructor)
        {
            case GeneratorExp: throw new Sk.builtin.SyntaxError("augmented assignment to generator expression not possible", c.c_filename, n.lineno);
            case Yield: throw new Sk.builtin.SyntaxError("augmented assignment to yield expression not possible", c.c_filename, n.lineno);
            case Name:
                var varName = expr1.id;
                forbiddenCheck(c, ch, varName, n.lineno);
                break;
            case Attribute:
            case Subscript:
                break;
            default:
                throw new Sk.builtin.SyntaxError("illegal expression for augmented assignment", c.c_filename, n.lineno);
        }
        setContext(c, expr1, Store, ch);

        ch = CHILD(n, 2);
        var expr2;
        if (ch.type === SYM.testlist)
            expr2 = astForTestlist(c, ch);
        else
            expr2 = astForExpr(c, ch);

        return new AugAssign(expr1, astForAugassign(c, CHILD(n, 1)), expr2, n.lineno, n.col_offset);
    }
    else
    {
        // normal assignment
        REQ(CHILD(n, 1), TOK.T_EQUAL);
        var targets = [];
        for (var i = 0; i < NCH(n) - 2; i += 2)
        {
            var ch = CHILD(n, i);
            if (ch.type === SYM.yield_expr) throw new Sk.builtin.SyntaxError("assignment to yield expression not possible", c.c_filename, n.lineno);
            var e = astForTestlist(c, ch);
            setContext(c, e, Store, CHILD(n, i));
            targets[i / 2] = e;
        }
        var value = CHILD(n, NCH(n) - 1);
        var expression;
        if (value.type === SYM.testlist)
            expression = astForTestlist(c, value);
        else
            expression = astForExpr(c, value);
        return new Assign(targets, expression, n.lineno, n.col_offset);
    }
}

function astForIfexpr(c, n)
{
    /* test: or_test 'if' or_test 'else' test */ 
    goog.asserts.assert(NCH(n) === 5);
    return new IfExp(
            astForExpr(c, CHILD(n, 2)),
            astForExpr(c, CHILD(n, 0)),
            astForExpr(c, CHILD(n, 4)),
            n.lineno, n.col_offset);
}

/**
 * s is a python-style string literal, including quote characters and u/r/b
 * prefixes. Returns decoded string object.
 */
function parsestr(c, s)
{
    var encodeUtf8 = function(s) { return unescape(encodeURIComponent(s)); };
    var decodeUtf8 = function(s) { return decodeURIComponent(escape(s)); };
    var decodeEscape = function(s, quote)
    {
        var len = s.length;
        var ret = '';
        for (var i = 0; i < len; ++i)
        {
            var c = s.charAt(i);
            if (c === '\\')
            {
                ++i;
                c = s.charAt(i);
                if (c === 'n') ret += "\n";
                else if (c === '\\') ret += "\\";
                else if (c === 't') ret += "\t";
                else if (c === 'r') ret += "\r";
                else if (c === 'b') ret += "\b";
                else if (c === 'f') ret += "\f";
                else if (c === 'v') ret += "\v";
                else if (c === '0') ret += "\0";
                else if (c === '"') ret += '"';
                else if (c === '\'') ret += '\'';
                else if (c === '\n') /* escaped newline, join lines */ {}
                else if (c === 'x')
                {
                    var d0 = s.charAt(++i);
                    var d1 = s.charAt(++i);
                    ret += String.fromCharCode(parseInt(d0+d1, 16));
                }
                else if (c === 'u' || c === 'U')
                {
                    var d0 = s.charAt(++i);
                    var d1 = s.charAt(++i);
                    var d2 = s.charAt(++i);
                    var d3 = s.charAt(++i);
                    ret += String.fromCharCode(parseInt(d0+d1, 16), parseInt(d2+d3, 16));
                }
                else
                {
                    // Leave it alone
                    ret += "\\" + c;
                    // goog.asserts.fail("unhandled escape: '" + c.charCodeAt(0) + "'");
                }
            }
            else
            {
                ret += c;
            }
        }
        return ret;
    };

    //print("parsestr", s);

    var quote = s.charAt(0);
    var rawmode = false;

    if (quote === 'u' || quote === 'U')
    {
        s = s.substr(1);
        quote = s.charAt(0);
    }
    else if (quote === 'r' || quote === 'R')
    {
        s = s.substr(1);
        quote = s.charAt(0);
        rawmode = true;
    }
    goog.asserts.assert(quote !== 'b' && quote !== 'B', "todo; haven't done b'' strings yet");

    goog.asserts.assert(quote === "'" || quote === '"' && s.charAt(s.length - 1) === quote);
    s = s.substr(1, s.length - 2);

    if (s.length >= 4 && s.charAt(0) === quote && s.charAt(1) === quote)
    {
        goog.asserts.assert(s.charAt(s.length - 1) === quote && s.charAt(s.length - 2) === quote);
        s = s.substr(2, s.length - 4);
    }

    if (rawmode || s.indexOf('\\') === -1)
    {
        return strobj(decodeUtf8(s));
    }
    return strobj(decodeEscape(s, quote));
}

function parsestrplus(c, n)
{
    REQ(CHILD(n, 0), TOK.T_STRING);
    var ret = new Sk.builtin.str("");
    for (var i = 0; i < NCH(n); ++i)
    {
        try {
            ret = ret.sq$concat(parsestr(c, CHILD(n, i).value));
        } catch (x) {
            throw new Sk.builtin.SyntaxError("invalid string (possibly contains a unicode character)", c.c_filename, CHILD(n, i).lineno);
        }
    }
    return ret;
}

function parsenumber(c, s, lineno)
{
    var end = s.charAt(s.length - 1);

    // todo; no complex support
    if (end === 'j' || end === 'J') {
	throw new Sk.builtin.SyntaxError("complex numbers are currently unsupported", c.c_filename, lineno);
    }

    // Handle longs
    if (end === 'l' || end === 'L') {
        return Sk.longFromStr(s.substr(0, s.length - 1), 0);
    }
    
    // todo; we don't currently distinguish between int and float so
    // str is wrong for these.
    if (s.indexOf('.') !== -1)
    {
        return new Sk.builtin.nmber(parseFloat(s), Sk.builtin.nmber.float$);
    }

    // Handle integers of various bases
    var tmp = s;
    var val;
    var neg = false;
    if (s.charAt(0) === '-') {
        tmp = s.substr(1);
        neg = true;
    }

    if (tmp.charAt(0) === '0' && (tmp.charAt(1) === 'x' || tmp.charAt(1) === 'X')) {
        // Hex
        tmp = tmp.substring(2);
        val = parseInt(tmp, 16);
    } else if ((s.indexOf('e') !== -1) || (s.indexOf('E') !== -1)) {
	// Float with exponent (needed to make sure e/E wasn't hex first)
	return new Sk.builtin.nmber(parseFloat(s), Sk.builtin.nmber.float$);
    } else if (tmp.charAt(0) === '0' && (tmp.charAt(1) === 'b' || tmp.charAt(1) === 'B')) {
        // Binary
        tmp = tmp.substring(2);
        val = parseInt(tmp, 2);
    } else if (tmp.charAt(0) === '0') {
        if (tmp === "0") {
            // Zero
            val = 0;
        } else {
            // Octal
            tmp = tmp.substring(1);
            if ((tmp.charAt(0) === 'o') || (tmp.charAt(0) === 'O')) {
                tmp = tmp.substring(1);
            }
            val = parseInt(tmp, 8);            
        }
    }
    else {
        // Decimal
        val = parseInt(tmp, 10);
    }

    // Convert to long
    if (val > Sk.builtin.lng.threshold$
        && Math.floor(val) === val
        && (s.indexOf('e') === -1 && s.indexOf('E') === -1))
    {
        return Sk.longFromStr(s, 0);
    }

    // Small enough, return parsed number
    if (neg) {
        return new Sk.builtin.nmber(-val, Sk.builtin.int$);
    } else {
        return new Sk.builtin.nmber(val, Sk.builtin.int$);
    }
}

function astForSlice(c, n)
{
    REQ(n, SYM.subscript);

    /*
       subscript: '.' '.' '.' | test | [test] ':' [test] [sliceop]
       sliceop: ':' [test]
    */
    var ch = CHILD(n, 0);
    var lower = null;
    var upper = null;
    var step = null;
    if (ch.type === TOK.T_DOT)
        return new Ellipsis();
    if (NCH(n) === 1 && ch.type === SYM.test)
        return new Index(astForExpr(c, ch));
    if (ch.type === SYM.test)
        lower = astForExpr(c, ch);
    if (ch.type === TOK.T_COLON)
    {
        if (NCH(n) > 1)
        {
            var n2 = CHILD(n, 1);
            if (n2.type === SYM.test)
                upper = astForExpr(c, n2);
        }
    }
    else if (NCH(n) > 2)
    {
        var n2 = CHILD(n, 2);
        if (n2.type === SYM.test)
            upper = astForExpr(c, n2);
    }

    ch = CHILD(n, NCH(n) - 1);
    if (ch.type === SYM.sliceop)
    {
        if (NCH(ch) === 1)
        {
            ch = CHILD(ch, 0);
            step = new Name(strobj("None"), Load, ch.lineno, ch.col_offset);
        }
        else
        {
            ch = CHILD(ch, 1);
            if (ch.type === SYM.test)
                step = astForExpr(c, ch);
        }
    }
    return new Slice(lower, upper, step);
}

function astForAtom(c, n)
{
    /* atom: '(' [yield_expr|testlist_gexp] ')' | '[' [listmaker] ']'
       | '{' [dictmaker] '}' | '`' testlist '`' | NAME | NUMBER | STRING+
    */
    var ch = CHILD(n, 0);
    switch (ch.type)
    {
        case TOK.T_NAME:
            // All names start in Load context, but may be changed later
            return new Name(strobj(ch.value), Load, n.lineno, n.col_offset);
        case TOK.T_STRING:
            return new Str(parsestrplus(c, n), n.lineno, n.col_offset);
        case TOK.T_NUMBER:
        return new Num(parsenumber(c, ch.value, n.lineno), n.lineno, n.col_offset);
        case TOK.T_LPAR: // various uses for parens
            ch = CHILD(n, 1);
            if (ch.type === TOK.T_RPAR)
                return new Tuple([], Load, n.lineno, n.col_offset);
            if (ch.type === SYM.yield_expr)
                return astForExpr(c, ch);
            if (NCH(ch) > 1 && CHILD(ch, 1).type === SYM.gen_for)
                return astForGenexp(c, ch);
            return astForTestlistGexp(c, ch);
        case TOK.T_LSQB: // list or listcomp
            ch = CHILD(n, 1);
            if (ch.type === TOK.T_RSQB)
                return new List([], Load, n.lineno, n.col_offset);
            REQ(ch, SYM.listmaker);
            if (NCH(ch) === 1 || CHILD(ch, 1).type === TOK.T_COMMA)
                return new List(seqForTestlist(c, ch), Load, n.lineno, n.col_offset);
            else
                return astForListcomp(c, ch);
        case TOK.T_LBRACE:
            /* dictmaker: test ':' test (',' test ':' test)* [','] */
            ch = CHILD(n, 1);
            var size = Math.floor((NCH(ch) + 1) / 4); // + 1 for no trailing comma case
            var keys = [];
            var values = [];
            for (var i = 0; i < NCH(ch); i += 4)
            {
                keys[i / 4] = astForExpr(c, CHILD(ch, i));
                values[i / 4] = astForExpr(c, CHILD(ch, i + 2));
            }
            return new Dict(keys, values, n.lineno, n.col_offset);
        case TOK.T_BACKQUOTE:
            throw new Sk.builtin.SyntaxError("backquote not supported, use repr()", c.c_filename, n.lineno);
        default:
            goog.asserts.fail("unhandled atom", ch.type);
    }
}

function astForPower(c, n)
{
    /* power: atom trailer* ('**' factor)*
     */
    REQ(n, SYM.power);
    var e = astForAtom(c, CHILD(n, 0));
    if (NCH(n) === 1) return e;
    for (var i = 1; i < NCH(n); ++i)
    {
        var ch = CHILD(n, i);
        if (ch.type !== SYM.trailer)
            break;
        var tmp = astForTrailer(c, ch, e);
        tmp.lineno = e.lineno;
        tmp.col_offset = e.col_offset;
        e = tmp;
    }
    if (CHILD(n, NCH(n) - 1).type === SYM.factor)
    {
        var f = astForExpr(c, CHILD(n, NCH(n) - 1));
        e = new BinOp(e, Pow, f, n.lineno, n.col_offset);
    }
    return e;
}

function astForExpr(c, n)
{
    /* handle the full range of simple expressions
       test: or_test ['if' or_test 'else' test] | lambdef
       or_test: and_test ('or' and_test)* 
       and_test: not_test ('and' not_test)*
       not_test: 'not' not_test | comparison
       comparison: expr (comp_op expr)*
       expr: xor_expr ('|' xor_expr)*
       xor_expr: and_expr ('^' and_expr)*
       and_expr: shift_expr ('&' shift_expr)*
       shift_expr: arith_expr (('<<'|'>>') arith_expr)*
       arith_expr: term (('+'|'-') term)*
       term: factor (('*'|'/'|'%'|'//') factor)*
       factor: ('+'|'-'|'~') factor | power
       power: atom trailer* ('**' factor)*

       As well as modified versions that exist for backward compatibility,
       to explicitly allow:
       [ x for x in lambda: 0, lambda: 1 ]
       (which would be ambiguous without these extra rules)
       
       old_test: or_test | old_lambdef
       old_lambdef: 'lambda' [vararglist] ':' old_test

    */

    LOOP: while (true) {
        switch (n.type)
        {
            case SYM.test:
            case SYM.old_test:
                if (CHILD(n, 0).type === SYM.lambdef || CHILD(n, 0).type === SYM.old_lambdef)
                    return astForLambdef(c, CHILD(n, 0));
                else if (NCH(n) > 1)
                    return astForIfexpr(c, n);
                // fallthrough
            case SYM.or_test:
            case SYM.and_test:
                if (NCH(n) === 1)
                {
                    n = CHILD(n, 0);
                    continue LOOP;
                }
                var seq = [];
                for (var i = 0; i < NCH(n); i += 2)
                    seq[i / 2] = astForExpr(c, CHILD(n, i));
                if (CHILD(n, 1).value === "and")
                    return new BoolOp(And, seq, n.lineno, n.col_offset);
                goog.asserts.assert(CHILD(n, 1).value === "or");
                return new BoolOp(Or, seq, n.lineno, n.col_offset);
            case SYM.not_test:
                if (NCH(n) === 1)
                {
                    n = CHILD(n, 0);
                    continue LOOP;
                }
                else
                {
                    return new UnaryOp(Not, astForExpr(c, CHILD(n, 1)), n.lineno, n.col_offset);
                }
            case SYM.comparison:
                if (NCH(n) === 1)
                {
                    n = CHILD(n, 0);
                    continue LOOP;
                }
                else
                {
                    var ops = [];
                    var cmps = [];
                    for (var i = 1; i < NCH(n); i += 2)
                    {
                        ops[(i - 1) / 2] = astForCompOp(c, CHILD(n, i));
                        cmps[(i - 1) / 2] = astForExpr(c, CHILD(n, i + 1));
                    }
                    return new Compare(astForExpr(c, CHILD(n, 0)), ops, cmps, n.lineno, n.col_offset);
                }
            case SYM.expr:
            case SYM.xor_expr:
            case SYM.and_expr:
            case SYM.shift_expr:
            case SYM.arith_expr:
            case SYM.term:
                if (NCH(n) === 1)
                {
                    n = CHILD(n, 0);
                    continue LOOP;
                }
                return astForBinop(c, n);
            case SYM.yield_expr:
                var exp = null;
                if (NCH(n) === 2)
                {
                    exp = astForTestlist(c, CHILD(n, 1))
                }
                return new Yield(exp, n.lineno, n.col_offset);
            case SYM.factor:
                if (NCH(n) === 1)
                {
                    n = CHILD(n, 0);
                    continue LOOP;
                }
                return astForFactor(c, n);
            case SYM.power:
                return astForPower(c, n);
            default:
                goog.asserts.fail("unhandled expr", "n.type: %d", n.type);
        }
    break; }
}

function astForPrintStmt(c, n)
{
    /* print_stmt: 'print' ( [ test (',' test)* [','] ]
                             | '>>' test [ (',' test)+ [','] ] )
     */
    var start = 1;
    var dest = null;
    REQ(n, SYM.print_stmt);
    if (NCH(n) >= 2 && CHILD(n, 1).type === TOK.T_RIGHTSHIFT)
    {
        dest = astForExpr(c, CHILD(n, 2));
        start = 4;
    }
    var seq = [];
    for (var i = start, j = 0; i < NCH(n); i += 2, ++j)
    {
        seq[j] = astForExpr(c, CHILD(n, i));
    }
    var nl = (CHILD(n, NCH(n) - 1)).type === TOK.T_COMMA ? false : true;
    return new Print(dest, seq, nl, n.lineno, n.col_offset);
}

function astForStmt(c, n)
{
    if (n.type === SYM.stmt)
    {
        goog.asserts.assert(NCH(n) === 1);
        n = CHILD(n, 0);
    }
    if (n.type === SYM.simple_stmt)
    {
        goog.asserts.assert(numStmts(n) === 1);
        n = CHILD(n, 0);
    }
    if (n.type === SYM.small_stmt)
    {
        REQ(n, SYM.small_stmt);
        n = CHILD(n, 0);
        /* small_stmt: expr_stmt | print_stmt  | del_stmt | pass_stmt
                     | flow_stmt | import_stmt | global_stmt | exec_stmt
                     | assert_stmt
        */
        switch (n.type)
        {
            case SYM.expr_stmt: return astForExprStmt(c, n);
            case SYM.print_stmt: return astForPrintStmt(c, n);
            case SYM.del_stmt: return astForDelStmt(c, n);
            case SYM.pass_stmt: return new Pass(n.lineno, n.col_offset);
            case SYM.flow_stmt: return astForFlowStmt(c, n);
            case SYM.import_stmt: return astForImportStmt(c, n);
            case SYM.global_stmt: return astForGlobalStmt(c, n);
            case SYM.exec_stmt: return astForExecStmt(c, n);
            case SYM.assert_stmt: return astForAssertStmt(c, n);
            default: goog.asserts.fail("unhandled small_stmt");
        }
    }
    else
    {
        /* compound_stmt: if_stmt | while_stmt | for_stmt | try_stmt
                        | funcdef | classdef | decorated
        */
        var ch = CHILD(n, 0);
        REQ(n, SYM.compound_stmt);
        switch (ch.type)
        {
            case SYM.if_stmt: return astForIfStmt(c, ch);
            case SYM.while_stmt: return astForWhileStmt(c, ch);
            case SYM.for_stmt: return astForForStmt(c, ch);
            case SYM.try_stmt: return astForTryStmt(c, ch);
            case SYM.with_stmt: return astForWithStmt(c, ch);
            case SYM.funcdef: return astForFuncdef(c, ch, []);
            case SYM.classdef: return astForClassdef(c, ch, []);
            case SYM.decorated: return astForDecorated(c, ch);
            default: goog.asserts.assert("unhandled compound_stmt");
        }
    }
}

Sk.astFromParse = function(n, filename)
{
    var c = new Compiling("utf-8", filename);

    var stmts = [];
    var ch;
    var k = 0;
    switch (n.type)
    {
        case SYM.file_input:
            for (var i = 0; i < NCH(n) - 1; ++i)
            {
                var ch = CHILD(n, i);
                if (n.type === TOK.T_NEWLINE)
                    continue;
                REQ(ch, SYM.stmt);
                var num = numStmts(ch);
                if (num === 1)
                {
                    stmts[k++] = astForStmt(c, ch);
                }
                else
                {
                    ch = CHILD(ch, 0);
                    REQ(ch, SYM.simple_stmt);
                    for (var j = 0; j < num; ++j)
                    {
                        stmts[k++] = astForStmt(c, CHILD(ch, j * 2));
                    }
                }
            }
            return new Module(stmts);
        case SYM.eval_input:
            goog.asserts.fail("todo;");
        case SYM.single_input:
            goog.asserts.fail("todo;");
        default:
            goog.asserts.fail("todo;");
    }
};

Sk.astDump = function(node)
{
    var spaces = function(n) // todo; blurgh
    {
        var ret = "";
        for (var i = 0; i < n; ++i)
            ret += " ";
        return ret;
    }

    var _format = function(node, indent)
    {
        if (node === null)
        {
            return indent+"None";
        }
        else if (node.prototype && node.prototype._astname !== undefined && node.prototype._isenum)
        {
            return indent + node.prototype._astname + "()";
        }
        else if (node._astname !== undefined)
        {
            var namelen = spaces(node._astname.length + 1);
            var fields = [];
            for (var i = 0; i < node._fields.length; i += 2) // iter_fields
            {
                var a = node._fields[i]; // field name
                var b = node._fields[i + 1](node); // field getter func
                var fieldlen = spaces(a.length + 1);
                fields.push([a, _format(b, indent + namelen + fieldlen)]);
            }
            var attrs = [];
            for (var i = 0; i < fields.length; ++i)
            {
                var field = fields[i];
                attrs.push(field[0] + "=" + field[1].replace(/^\s+/, ''));
            }
            var fieldstr = attrs.join(',\n' + indent + namelen);
            return indent + node._astname + "(" + fieldstr + ")";
        }
        else if (goog.isArrayLike(node))
        {
            //Sk.debugout("arr", node.length);
            var elems = [];
            for (var i = 0; i < node.length; ++i)
            {
                var x = node[i];
                elems.push(_format(x, indent + " "));
            }
            var elemsstr = elems.join(',\n');
            return indent + "[" + elemsstr.replace(/^\s+/, '') + "]";
        }
        else
        {
            var ret;
            if (node === true) ret = "True";
            else if (node === false) ret = "False";
            else if (node instanceof Sk.builtin.lng) ret = node.tp$str().v;
            else if (node instanceof Sk.builtin.str) ret = node['$r']().v;
            else ret = "" + node;
            return indent + ret;
        }
    };

    return _format(node, "");
};

goog.exportSymbol("Sk.astFromParse", Sk.astFromParse);
goog.exportSymbol("Sk.astDump", Sk.astDump);
/* Flags for def-use information */

var DEF_GLOBAL = 1;           /* global stmt */
var DEF_LOCAL = 2;            /* assignment in code block */
var DEF_PARAM = 2<<1;         /* formal parameter */
var USE = 2<<2;               /* name is used */
var DEF_STAR = 2<<3;          /* parameter is star arg */
var DEF_DOUBLESTAR = 2<<4;    /* parameter is star-star arg */
var DEF_INTUPLE = 2<<5;       /* name defined in tuple in parameters */
var DEF_FREE = 2<<6;          /* name used but not defined in nested block */
var DEF_FREE_GLOBAL = 2<<7;   /* free variable is actually implicit global */
var DEF_FREE_CLASS = 2<<8;    /* free variable from class's method */
var DEF_IMPORT = 2<<9;        /* assignment occurred via import */

var DEF_BOUND = (DEF_LOCAL | DEF_PARAM | DEF_IMPORT);

/* GLOBAL_EXPLICIT and GLOBAL_IMPLICIT are used internally by the symbol
   table.  GLOBAL is returned from PyST_GetScope() for either of them. 
   It is stored in ste_symbols at bits 12-14.
*/
var SCOPE_OFF = 11;
var SCOPE_MASK = 7;

var LOCAL = 1;
var GLOBAL_EXPLICIT = 2;
var GLOBAL_IMPLICIT = 3;
var FREE = 4;
var CELL = 5;

/* The following three names are used for the ste_unoptimized bit field */
var OPT_IMPORT_STAR = 1;
var OPT_EXEC = 2;
var OPT_BARE_EXEC = 4;
var OPT_TOPLEVEL = 8;  /* top-level names, including eval and exec */

var GENERATOR = 2;
var GENERATOR_EXPRESSION = 2;

var ModuleBlock = 'module';
var FunctionBlock = 'function';
var ClassBlock = 'class';

/**
 * @constructor
 * @param {string} name
 * @param {number} flags
 * @param {Array.<SymbolTableScope>} namespaces
 */
function Symbol(name, flags, namespaces)
{
    this.__name = name;
    this.__flags = flags;
    this.__scope = (flags >> SCOPE_OFF) & SCOPE_MASK;
    this.__namespaces = namespaces || [];
};
Symbol.prototype.get_name = function() { return this.__name; }
Symbol.prototype.is_referenced = function() { return !!(this.__flags & USE); }
Symbol.prototype.is_parameter = function() { return !!(this.__flags & DEF_PARAM); }
Symbol.prototype.is_global = function() { return this.__scope === GLOBAL_IMPLICIT || this.__scope == GLOBAL_EXPLICIT; }
Symbol.prototype.is_declared_global = function() { return this.__scope == GLOBAL_EXPLICIT; }
Symbol.prototype.is_local = function() { return !!(this.__flags & DEF_BOUND); }
Symbol.prototype.is_free = function() { return this.__scope == FREE; }
Symbol.prototype.is_imported = function() { return !!(this.__flags & DEF_IMPORT); }
Symbol.prototype.is_assigned = function() { return !!(this.__flags & DEF_LOCAL); }
Symbol.prototype.is_namespace = function() { return this.__namespaces && this.__namespaces.length > 0; }
Symbol.prototype.get_namespaces = function() { return this.__namespaces; }

var astScopeCounter = 0;

/**
 * @constructor
 * @param {SymbolTable} table
 * @param {string} name
 * @param {string} type
 * @param {number} lineno
 */
function SymbolTableScope(table, name, type, ast, lineno)
{
    this.symFlags = {};
    this.name = name;
    this.varnames = [];
    this.children = [];
    this.blockType = type;

    this.isNested = false;
    this.hasFree = false;
    this.childHasFree = false;  // true if child block has free vars including free refs to globals
    this.generator = false;
    this.varargs = false;
    this.varkeywords = false;
    this.returnsValue = false;

    this.lineno = lineno;

    this.table = table;

    if (table.cur && (table.cur.nested || table.cur.blockType === FunctionBlock))
        this.isNested = true;

    ast.scopeId = astScopeCounter++;
    table.stss[ast.scopeId] = this;

    // cache of Symbols for returning to other parts of code
    this.symbols = {};
}
SymbolTableScope.prototype.get_type = function() { return this.blockType; };
SymbolTableScope.prototype.get_name = function() { return this.name; };
SymbolTableScope.prototype.get_lineno = function() { return this.lineno; };
SymbolTableScope.prototype.is_nested = function() { return this.isNested; };
SymbolTableScope.prototype.has_children = function() { return this.children.length > 0; };
SymbolTableScope.prototype.get_identifiers = function() { return this._identsMatching(function(x) { return true; }); };
SymbolTableScope.prototype.lookup = function(name)
{
    var sym;
    if (!this.symbols.hasOwnProperty(name))
    {
        var flags = this.symFlags[name];
        var namespaces = this.__check_children(name);
        sym = this.symbols[name] = new Symbol(name, flags, namespaces);
    }
    else
    {
        sym = this.symbols[name];
    }
    return sym;
};
SymbolTableScope.prototype.__check_children = function(name)
{
    //print("  check_children:", name);
    var ret = [];
    for (var i = 0; i < this.children.length; ++i)
    {
        var child = this.children[i];
        if (child.name === name)
            ret.push(child);
    }
    return ret;
};

SymbolTableScope.prototype._identsMatching = function(f)
{
    var ret = [];
    for (var k in this.symFlags)
    {
        if (this.symFlags.hasOwnProperty(k))
        {
            if (f(this.symFlags[k]))
                ret.push(k);
        }
    }
    ret.sort();
    return ret;
};
SymbolTableScope.prototype.get_parameters = function()
{
    goog.asserts.assert(this.get_type() == 'function', "get_parameters only valid for function scopes");
    if (!this._funcParams)
        this._funcParams = this._identsMatching(function(x) { return x & DEF_PARAM; });
    return this._funcParams;
};
SymbolTableScope.prototype.get_locals = function()
{
    goog.asserts.assert(this.get_type() == 'function', "get_locals only valid for function scopes");
    if (!this._funcLocals)
        this._funcLocals = this._identsMatching(function(x) { return x & DEF_BOUND; });
    return this._funcLocals;
};
SymbolTableScope.prototype.get_globals = function()
{
    goog.asserts.assert(this.get_type() == 'function', "get_globals only valid for function scopes");
    if (!this._funcGlobals)
    {
        this._funcGlobals = this._identsMatching(function(x) {
                var masked = (x >> SCOPE_OFF) & SCOPE_MASK;
                return masked == GLOBAL_IMPLICIT || masked == GLOBAL_EXPLICIT;
            });
    }
    return this._funcGlobals;
};
SymbolTableScope.prototype.get_frees = function()
{
    goog.asserts.assert(this.get_type() == 'function', "get_frees only valid for function scopes");
    if (!this._funcFrees)
    {
        this._funcFrees = this._identsMatching(function(x) {
                var masked = (x >> SCOPE_OFF) & SCOPE_MASK;
                return masked == FREE;
            });
    }
    return this._funcFrees;
};
SymbolTableScope.prototype.get_methods = function()
{
    goog.asserts.assert(this.get_type() == 'class', "get_methods only valid for class scopes");
    if (!this._classMethods)
    {
        // todo; uniq?
        var all = [];
        for (var i = 0; i < this.children.length; ++i)
            all.push(this.children[i].name);
        all.sort();
        this._classMethods = all;
    }
    return this._classMethods;
};
SymbolTableScope.prototype.getScope = function(name)
{
    //print("getScope");
    //for (var k in this.symFlags) print(k);
    var v = this.symFlags[name];
    if (v === undefined) return 0;
    return (v >> SCOPE_OFF) & SCOPE_MASK;
};

/**
 * @constructor
 * @param {string} filename
 */
function SymbolTable(filename)
{
    this.filename = filename;
    this.cur = null;
    this.top = null;
    this.stack = [];
    this.global = null; // points at top level module symFlags
    this.curClass = null; // current class or null
    this.tmpname = 0;

    // mapping from ast nodes to their scope if they have one. we add an
    // id to the ast node when a scope is created for it, and store it in
    // here for the compiler to lookup later.
    this.stss = {};
}
SymbolTable.prototype.getStsForAst = function(ast)
{
    goog.asserts.assert(ast.scopeId !== undefined, "ast wasn't added to st?");
    var v = this.stss[ast.scopeId];
    goog.asserts.assert(v !== undefined, "unknown sym tab entry");
    return v;
};

SymbolTable.prototype.SEQStmt = function(nodes)
{
    goog.asserts.assert(goog.isArrayLike(nodes), "SEQ: nodes isn't array? got %s", nodes);
    var len = nodes.length;
    for (var i = 0; i < len; ++i)
    {
        var val = nodes[i];
        if (val) this.visitStmt(val);
    }
};
SymbolTable.prototype.SEQExpr = function(nodes)
{
    goog.asserts.assert(goog.isArrayLike(nodes), "SEQ: nodes isn't array? got %s", nodes);
    var len = nodes.length;
    for (var i = 0; i < len; ++i)
    {
        var val = nodes[i];
        if (val) this.visitExpr(val);
    }
};

SymbolTable.prototype.enterBlock = function(name, blockType, ast, lineno)
{
    name = fixReservedNames(name);
    //print("enterBlock:", name);
    var prev = null;
    if (this.cur)
    {
        prev = this.cur;
        this.stack.push(this.cur);
    }
    this.cur = new SymbolTableScope(this, name, blockType, ast, lineno);
    if (name === 'top')
    {
        //print("    setting global because it's top");
        this.global = this.cur.symFlags;
    }
    if (prev)
    {
        //print("    adding", this.cur.name, "to", prev.name);
        prev.children.push(this.cur);
    }
};

SymbolTable.prototype.exitBlock = function()
{
    //print("exitBlock");
    this.cur = null;
    if (this.stack.length > 0)
        this.cur = this.stack.pop();
};

SymbolTable.prototype.visitParams = function(args, toplevel)
{
    for (var i = 0; i < args.length; ++i)
    {
        var arg = args[i];
        if (arg.constructor === Name)
        {
            goog.asserts.assert(arg.ctx === Param || (arg.ctx === Store && !toplevel));
            this.addDef(arg.id, DEF_PARAM, arg.lineno);
        }
        else
        {
            // Tuple isn't supported
            throw new Sk.builtin.SyntaxError("invalid expression in parameter list", this.filename);
        }
    }
}

SymbolTable.prototype.visitArguments = function(a, lineno)
{
    if (a.args) this.visitParams(a.args, true);
    if (a.vararg)
    {
        this.addDef(a.vararg, DEF_PARAM, lineno);
        this.cur.varargs = true;
    }
    if (a.kwarg)
    {
        this.addDef(a.kwarg, DEF_PARAM, lineno);
        this.cur.varkeywords = true;
    }
};

SymbolTable.prototype.newTmpname = function(lineno)
{
    this.addDef(new Sk.builtin.str("_[" + (++this.tmpname) + "]"), DEF_LOCAL, lineno);
}

SymbolTable.prototype.addDef = function(name, flag, lineno)
{
    //print("addDef:", name.v, flag);
    var mangled = mangleName(this.curClass, new Sk.builtin.str(name)).v;
    mangled = fixReservedNames(mangled);
    var val = this.cur.symFlags[mangled];
    if (val !== undefined)
    {
        if ((flag & DEF_PARAM) && (val & DEF_PARAM))
        {
            throw new Sk.builtin.SyntaxError("duplicate argument '" + name.v + "' in function definition", this.filename, lineno);
        }
        val |= flag;
    }
    else
    {
        val = flag;
    }
    this.cur.symFlags[mangled] = val;
    if (flag & DEF_PARAM)
    {
        this.cur.varnames.push(mangled);
    }
    else if (flag & DEF_GLOBAL)
    {
        val = flag;
        var fromGlobal = this.global[mangled];
        if (fromGlobal !== undefined) val |= fromGlobal;
        this.global[mangled] = val;
    }
};

SymbolTable.prototype.visitSlice = function(s)
{
    switch (s.constructor)
    {
        case Slice:
            if (s.lower) this.visitExpr(s.lower);
            if (s.upper) this.visitExpr(s.upper);
            if (s.step) this.visitExpr(s.step);
            break;
        case ExtSlice:
            for (var i = 0; i < s.dims.length; ++i)
                this.visitSlice(s.dims[i]);
            break;
        case Index:
            this.visitExpr(s.value);
            break;
        case Ellipsis:
            break;
    }
};

SymbolTable.prototype.visitStmt = function(s)
{
    goog.asserts.assert(s !== undefined, "visitStmt called with undefined");
    switch (s.constructor)
    {
        case FunctionDef:
            this.addDef(s.name, DEF_LOCAL, s.lineno);
            if (s.args.defaults) this.SEQExpr(s.args.defaults);
            if (s.decorator_list) this.SEQExpr(s.decorator_list);
            this.enterBlock(s.name.v, FunctionBlock, s, s.lineno);
            this.visitArguments(s.args, s.lineno);
            this.SEQStmt(s.body);
            this.exitBlock();
            break;
        case ClassDef:
            this.addDef(s.name, DEF_LOCAL, s.lineno);
            this.SEQExpr(s.bases);
            if (s.decorator_list) this.SEQExpr(s.decorator_list);
            this.enterBlock(s.name.v, ClassBlock, s, s.lineno);
            var tmp = this.curClass;
            this.curClass = s.name;
            this.SEQStmt(s.body);
            this.curCalss = tmp;
            this.exitBlock();
            break;
        case Return_:
            if (s.value)
            {
                this.visitExpr(s.value);
                this.cur.returnsValue = true;
                if (this.cur.generator)
                    throw new Sk.builtin.SyntaxError("'return' with argument inside generator", this.filename);
            }
            break;
        case Delete_:
            this.SEQExpr(s.targets);
            break;
        case Assign:
            this.SEQExpr(s.targets);
            this.visitExpr(s.value);
            break;
        case AugAssign:
            this.visitExpr(s.target);
            this.visitExpr(s.value);
            break;
        case Print:
            if (s.dest) this.visitExpr(s.dest);
            this.SEQExpr(s.values);
            break;
        case For_:
            this.visitExpr(s.target);
            this.visitExpr(s.iter);
            this.SEQStmt(s.body);
            if (s.orelse) this.SEQStmt(s.orelse);
            break;
        case While_:
            this.visitExpr(s.test);
            this.SEQStmt(s.body);
            if (s.orelse) this.SEQStmt(s.orelse);
            break;
        case If_:
            this.visitExpr(s.test);
            this.SEQStmt(s.body);
            if (s.orelse)
                this.SEQStmt(s.orelse);
            break;
        case Raise:
            if (s.type)
            {
                this.visitExpr(s.type);
                if (s.inst)
                {
                    this.visitExpr(s.inst);
                    if (s.tback)
                        this.visitExpr(s.tback);
                }
            }
            break;
        case TryExcept:
            this.SEQStmt(s.body);
            this.SEQStmt(s.orelse);
            this.visitExcepthandlers(s.handlers);
            break;
        case TryFinally:
            this.SEQStmt(s.body);
            this.SEQStmt(s.finalbody);
            break;
        case Assert:
            this.visitExpr(s.test);
            if (s.msg) this.visitExpr(s.msg);
            break;
        case Import_:
        case ImportFrom:
            this.visitAlias(s.names, s.lineno);
            break;
        case Exec:
            this.visitExpr(s.body);
            if (s.globals)
            {
                this.visitExpr(s.globals);
                if (s.locals)
                    this.visitExpr(s.locals);
            }
            break;
        case Global:
            var nameslen = s.names.length;
            for (var i = 0; i < nameslen; ++i)
            {
                var name = mangleName(this.curClass, s.names[i]).v;
                name = fixReservedNames(name);
                var cur = this.cur.symFlags[name];
                if (cur & (DEF_LOCAL | USE))
                {
                    if (cur & DEF_LOCAL) {
                        throw new Sk.builtin.SyntaxError("name '" + name + "' is assigned to before global declaration", this.filename, s.lineno);
                    }
                    else
                        throw new Sk.builtin.SyntaxError("name '" + name + "' is used prior to global declaration", this.filename, s.lineno);
                }
                this.addDef(new Sk.builtin.str(name), DEF_GLOBAL, s.lineno);
            }
            break;
        case Expr:
            this.visitExpr(s.value);
            break;
        case Pass:
        case Break_:
        case Continue_:
            // nothing
            break;
        case With_:
            this.newTmpname(s.lineno);
            this.visitExpr(s.context_expr);
            if (s.optional_vars)
            {
                this.newTmpname(s.lineno);
                this.visitExpr(s.optional_vars);
            }
            this.SEQStmt(s.body);
            break;

        default:
            goog.asserts.fail("Unhandled type " + s.constructor.name + " in visitStmt");
    }
};

SymbolTable.prototype.visitExpr = function(e)
{
    goog.asserts.assert(e !== undefined, "visitExpr called with undefined");
    //print("  e: ", e.constructor.name);
    switch (e.constructor)
    {
        case BoolOp:
            this.SEQExpr(e.values);
            break;
        case BinOp:
            this.visitExpr(e.left);
            this.visitExpr(e.right);
            break;
        case UnaryOp:
            this.visitExpr(e.operand);
            break;
        case Lambda:
            this.addDef(new Sk.builtin.str("lambda"), DEF_LOCAL, e.lineno);
            if (e.args.defaults)
                this.SEQExpr(e.args.defaults);
            this.enterBlock("lambda", FunctionBlock, e, e.lineno);
            this.visitArguments(e.args, e.lineno);
            this.visitExpr(e.body);
            this.exitBlock();
            break;
        case IfExp:
            this.visitExpr(e.test);
            this.visitExpr(e.body);
            this.visitExpr(e.orelse);
            break;
        case Dict:
            this.SEQExpr(e.keys);
            this.SEQExpr(e.values);
            break;
        case ListComp:
            this.newTmpname(e.lineno);
            this.visitExpr(e.elt);
            this.visitComprehension(e.generators, 0);
            break;
        case GeneratorExp:
            this.visitGenexp(e);
            break;
        case Yield:
            if (e.value) this.visitExpr(e.value);
            this.cur.generator = true;
            if (this.cur.returnsValue)
                throw new Sk.builtin.SyntaxError("'return' with argument inside generator", this.filename);
            break;
        case Compare:
            this.visitExpr(e.left);
            this.SEQExpr(e.comparators);
            break;
        case Call:
            this.visitExpr(e.func);
            this.SEQExpr(e.args);
            for (var i = 0; i < e.keywords.length; ++i)
                this.visitExpr(e.keywords[i].value);
            //print(JSON.stringify(e.starargs, null, 2));
            //print(JSON.stringify(e.kwargs, null,2));
            if (e.starargs) this.visitExpr(e.starargs);
            if (e.kwargs) this.visitExpr(e.kwargs);
            break;
        case Num:
        case Str:
            break;
        case Attribute:
            this.visitExpr(e.value);
            break;
        case Subscript:
            this.visitExpr(e.value);
            this.visitSlice(e.slice);
            break;
        case Name:
            this.addDef(e.id, e.ctx === Load ? USE : DEF_LOCAL, e.lineno);
            break;
        case List:
        case Tuple:
            this.SEQExpr(e.elts);
            break;
        default:
            goog.asserts.fail("Unhandled type " + e.constructor.name + " in visitExpr");
    }
};

SymbolTable.prototype.visitComprehension = function(lcs, startAt)
{
    var len = lcs.length;
    for (var i = startAt; i < len; ++i)
    {
        var lc = lcs[i];
        this.visitExpr(lc.target);
        this.visitExpr(lc.iter);
        this.SEQExpr(lc.ifs);
    }
};

SymbolTable.prototype.visitAlias = function(names, lineno)
{
    /* Compute store_name, the name actually bound by the import
        operation.  It is diferent than a->name when a->name is a
        dotted package name (e.g. spam.eggs) 
    */
    for (var i = 0; i < names.length; ++i)
    {
        var a = names[i];
        var name = a.asname === null ? a.name.v : a.asname.v;
        var storename = name;
        var dot = name.indexOf('.');
        if (dot !== -1)
            storename = name.substr(0, dot);
        if (name !== "*")
            this.addDef(new Sk.builtin.str(storename), DEF_IMPORT, lineno);
        else
        {
            if (this.cur.blockType !== ModuleBlock)
                throw new Sk.builtin.SyntaxError("import * only allowed at module level", this.filename);
        }
    }
};

SymbolTable.prototype.visitGenexp = function(e)
{
    var outermost = e.generators[0];
    // outermost is evaled in current scope
    this.visitExpr(outermost.iter);
    this.enterBlock("genexpr", FunctionBlock, e, e.lineno);
    this.cur.generator = true;
    this.addDef(new Sk.builtin.str(".0"), DEF_PARAM, e.lineno);
    this.visitExpr(outermost.target);
    this.SEQExpr(outermost.ifs);
    this.visitComprehension(e.generators, 1);
    this.visitExpr(e.elt);
    this.exitBlock();
};

SymbolTable.prototype.visitExcepthandlers = function(handlers)
{
    for (var i = 0, eh; eh = handlers[i]; ++i)
    {
        if (eh.type) this.visitExpr(eh.type);
        if (eh.name) this.visitExpr(eh.name);
        this.SEQStmt(eh.body);
    }
};

function _dictUpdate(a, b)
{
    for (var kb in b)
    {
        a[kb] = b[kb];
    }
}

SymbolTable.prototype.analyzeBlock = function(ste, bound, free, global)
{
    var local = {};
    var scope = {};
    var newglobal = {};
    var newbound = {};
    var newfree = {};

    if (ste.blockType == ClassBlock)
    {
        _dictUpdate(newglobal, global);
        if (bound)
            _dictUpdate(newbound, bound);
    }

    for (var name in ste.symFlags)
    {
        var flags = ste.symFlags[name];
        this.analyzeName(ste, scope, name, flags, bound, local, free, global);
    }

    if (ste.blockType !== ClassBlock)
    {
        if (ste.blockType === FunctionBlock)
            _dictUpdate(newbound, local);
        if (bound)
            _dictUpdate(newbound, bound);
        _dictUpdate(newglobal, global);
    }

    var allfree = {};
    var childlen = ste.children.length;
    for (var i = 0; i < childlen; ++i)
    {
        var c = ste.children[i];
        this.analyzeChildBlock(c, newbound, newfree, newglobal, allfree);
        if (c.hasFree || c.childHasFree)
            ste.childHasFree = true;
    }

    _dictUpdate(newfree, allfree);
    if (ste.blockType === FunctionBlock) this.analyzeCells(scope, newfree);
    this.updateSymbols(ste.symFlags, scope, bound, newfree, ste.blockType === ClassBlock);

    _dictUpdate(free, newfree);
};

SymbolTable.prototype.analyzeChildBlock = function(entry, bound, free, global, childFree)
{
    var tempBound = {};
    _dictUpdate(tempBound, bound);
    var tempFree = {};
    _dictUpdate(tempFree, free);
    var tempGlobal = {};
    _dictUpdate(tempGlobal, global);

    this.analyzeBlock(entry, tempBound, tempFree, tempGlobal);
    _dictUpdate(childFree, tempFree);
};

SymbolTable.prototype.analyzeCells = function(scope, free)
{
    for (var name in scope)
    {
        var flags = scope[name];
        if (flags !== LOCAL) continue;
        if (free[name] === undefined) continue;
        scope[name] = CELL;
        delete free[name];
    }
};

/**
 * store scope info back into the st symbols dict. symbols is modified,
 * others are not.
 */
SymbolTable.prototype.updateSymbols = function(symbols, scope, bound, free, classflag)
{
    for (var name in symbols)
    {
        var flags = symbols[name];
        var w = scope[name];
        flags |= w << SCOPE_OFF;
        symbols[name] = flags;
    }

    var freeValue = FREE << SCOPE_OFF;
    var pos = 0;
    for (var name in free)
    {
        var o = symbols[name];
        if (o !== undefined)
        {
            // it could be a free variable in a method of the class that has
            // the same name as a local or global in the class scope
            if (classflag && (o & (DEF_BOUND | DEF_GLOBAL)))
            {
                var i = o | DEF_FREE_CLASS;
                symbols[name] = i;
            }
            // else it's not free, probably a cell
            continue;
        }
        if (bound[name] === undefined) continue;
        symbols[name] = freeValue;
    }
};

SymbolTable.prototype.analyzeName = function(ste, dict, name, flags, bound, local, free, global)
{
    if (flags & DEF_GLOBAL)
    {
        if (flags & DEF_PARAM) throw new Sk.builtin.SyntaxError("name '" + name + "' is local and global", this.filename, ste.lineno);
        dict[name] = GLOBAL_EXPLICIT;
        global[name] = null;
        if (bound && bound[name] !== undefined) delete bound[name];
        return;
    }
    if (flags & DEF_BOUND)
    {
        dict[name] = LOCAL;
        local[name] = null;
        delete global[name];
        return;
    }

    if (bound && bound[name] !== undefined)
    {
        dict[name] = FREE;
        ste.hasFree = true;
        free[name] = null;
    }
    else if (global && global[name] !== undefined)
    {
        dict[name] = GLOBAL_IMPLICIT;
    }
    else
    {
        if (ste.isNested)
            ste.hasFree = true;
        dict[name] = GLOBAL_IMPLICIT;
    }
};

SymbolTable.prototype.analyze = function()
{
    var free = {};
    var global = {};
    this.analyzeBlock(this.top, null, free, global);
};

/**
 * @param {Object} ast
 * @param {string} filename
 */
Sk.symboltable = function(ast, filename)
{
    var ret = new SymbolTable(filename);

    ret.enterBlock("top", ModuleBlock, ast, 0);
    ret.top = ret.cur;

    //print(Sk.astDump(ast));
    for (var i = 0; i < ast.body.length; ++i)
        ret.visitStmt(ast.body[i]);

    ret.exitBlock();

    ret.analyze();

    return ret;
};

Sk.dumpSymtab = function(st)
{
    var pyBoolStr = function(b) { return b ? "True" : "False"; }
    var pyList = function(l) {
        var ret = [];
        for (var i = 0; i < l.length; ++i)
        {
            ret.push(new Sk.builtin.str(l[i])['$r']().v);
        }
        return '[' + ret.join(', ') + ']';
    };
    var getIdents = function(obj, indent)
    {
        if (indent === undefined) indent = "";
        var ret = "";
        ret += indent + "Sym_type: " + obj.get_type() + "\n";
        ret += indent + "Sym_name: " + obj.get_name() + "\n";
        ret += indent + "Sym_lineno: " + obj.get_lineno() + "\n";
        ret += indent + "Sym_nested: " + pyBoolStr(obj.is_nested()) + "\n";
        ret += indent + "Sym_haschildren: " + pyBoolStr(obj.has_children()) + "\n";
        if (obj.get_type() === "class")
        {
            ret += indent + "Class_methods: " + pyList(obj.get_methods()) + "\n";
        }
        else if (obj.get_type() === "function")
        {
            ret += indent + "Func_params: " + pyList(obj.get_parameters()) + "\n";
            ret += indent + "Func_locals: " + pyList(obj.get_locals()) + "\n";
            ret += indent + "Func_globals: " + pyList(obj.get_globals()) + "\n";
            ret += indent + "Func_frees: " + pyList(obj.get_frees()) + "\n";
        }
        ret += indent + "-- Identifiers --\n";
        var objidents = obj.get_identifiers();
        var objidentslen = objidents.length;
        for (var i = 0; i < objidentslen; ++i)
        {
            var info = obj.lookup(objidents[i]);
            ret += indent + "name: " + info.get_name() + "\n";
            ret += indent + "  is_referenced: " + pyBoolStr(info.is_referenced()) + "\n";
            ret += indent + "  is_imported: " + pyBoolStr(info.is_imported()) + "\n";
            ret += indent + "  is_parameter: " + pyBoolStr(info.is_parameter()) + "\n";
            ret += indent + "  is_global: " + pyBoolStr(info.is_global()) + "\n";
            ret += indent + "  is_declared_global: " + pyBoolStr(info.is_declared_global()) + "\n";
            ret += indent + "  is_local: " + pyBoolStr(info.is_local()) + "\n";
            ret += indent + "  is_free: " + pyBoolStr(info.is_free()) + "\n";
            ret += indent + "  is_assigned: " + pyBoolStr(info.is_assigned()) + "\n";
            ret += indent + "  is_namespace: " + pyBoolStr(info.is_namespace()) + "\n";
            var nss = info.get_namespaces();
            var nsslen = nss.length;
            ret += indent + "  namespaces: [\n";
            var sub = [];
            for (var j = 0; j < nsslen; ++j)
            {
                var ns = nss[j];
                sub.push(getIdents(ns, indent + "    "));
            }
            ret += sub.join('\n');
            ret += indent + "  ]\n";
        }
        return ret;
    }
    return getIdents(st.top, "");
};

goog.exportSymbol("Sk.symboltable", Sk.symboltable);
goog.exportSymbol("Sk.dumpSymtab", Sk.dumpSymtab);
/** @param {...*} x */
var out;

Sk.gensymcount = 0;

/**
 * @constructor
 * @param {string} filename
 * @param {SymbolTable} st
 * @param {number} flags
 * @param {string=} sourceCodeForAnnotation used to add original source to listing if desired
 */
function Compiler(filename, st, flags, sourceCodeForAnnotation)
{
    this.filename = filename;
    this.st = st;
    this.flags = flags;
    this.interactive = false;
    this.nestlevel = 0;

    this.u = null;
    this.stack = [];

    this.result = [];

    // this.gensymcount = 0;

    this.allUnits = [];

    this.source = sourceCodeForAnnotation ? sourceCodeForAnnotation.split("\n") : false;
}

/**
 * @constructor
 *
 * Stuff that changes on entry/exit of code blocks. must be saved and restored
 * when returning to a block.
 *
 * Corresponds to the body of a module, class, or function.
 */

function CompilerUnit()
{
    this.ste = null;
    this.name = null;

    this.private_ = null;
    this.firstlineno = 0;
    this.lineno = 0;
    this.linenoSet = false;
    this.localnames = [];

    this.blocknum = 0;
    this.blocks = [];
    this.curblock = 0;

    this.scopename = null;

    this.prefixCode = '';
    this.varDeclsCode = '';
    this.switchCode = '';
    this.suffixCode = '';

    // stack of where to go on a break
    this.breakBlocks = [];
    // stack of where to go on a continue
    this.continueBlocks = [];
    this.exceptBlocks = [];
    this.finallyBlocks = [];
}

CompilerUnit.prototype.activateScope = function()
{
    var self = this;

    out = function() {
        var b = self.blocks[self.curblock];
        for (var i = 0; i < arguments.length; ++i)
            b.push(arguments[i]);
    };
};

Compiler.prototype.getSourceLine = function(lineno)
{
    goog.asserts.assert(this.source);
    return this.source[lineno - 1];
};

Compiler.prototype.annotateSource = function(ast)
{
    if (this.source)
    {
        var lineno = ast.lineno;
        var col_offset = ast.col_offset;
        out("\n//\n// line ", lineno, ":\n// ", this.getSourceLine(lineno), "\n// ");
        for (var i = 0; i < col_offset; ++i) out(" ");
        out("^\n//\n");

		out("\nSk.currLineNo = ",lineno, ";\nSk.currColNo = ",col_offset,"\n\n");	//	Added by RNL
		out("\nSk.currFilename = '",this.filename,"';\n\n");	//	Added by RNL
    }
};

Compiler.prototype.gensym = function(hint)
{
    hint = hint || '';
    hint = '$' + hint;
    hint += Sk.gensymcount++;
    return hint;
};

Compiler.prototype.niceName = function(roughName)
{
    return this.gensym(roughName.replace("<", "").replace(">", "").replace(" ", "_"));
}

var reservedWords_ = { 'abstract': true, 'as': true, 'boolean': true,
    'break': true, 'byte': true, 'case': true, 'catch': true, 'char': true,
    'class': true, 'continue': true, 'const': true, 'debugger': true,
    'default': true, 'delete': true, 'do': true, 'double': true, 'else': true,
    'enum': true, 'export': true, 'extends': true, 'false': true,
    'final': true, 'finally': true, 'float': true, 'for': true,
    'function': true, 'goto': true, 'if': true, 'implements': true,
    'import': true, 'in': true, 'instanceof': true, 'int': true,
    'interface': true, 'is': true, 'long': true, 'namespace': true,
    'native': true, 'new': true, 'null': true, 'package': true,
    'private': true, 'protected': true, 'public': true, 'return': true,
    'short': true, 'static': true, 'super': false, 'switch': true,
    'synchronized': true, 'this': true, 'throw': true, 'throws': true,
    'transient': true, 'true': true, 'try': true, 'typeof': true, 'use': true,
    'var': true, 'void': true, 'volatile': true, 'while': true, 'with': true
};

function fixReservedWords(name)
{
    if (reservedWords_[name] !== true)
        return name;
    return name + "_$rw$";
}

var reservedNames_ = { '__defineGetter__': true, '__defineSetter__': true, 
    'apply': true, 'call': true, 'eval': true, 'hasOwnProperty': true, 
    'isPrototypeOf': true, 
    '__lookupGetter__': true, '__lookupSetter__': true, 
    '__noSuchMethod__': true, 'propertyIsEnumerable': true,
    'toSource': true, 'toLocaleString': true, 'toString': true,
    'unwatch': true, 'valueOf': true, 'watch': true, 'length': true
};

function fixReservedNames(name)
{
    if (reservedNames_[name])
        return name + "_$rn$";
    return name;
}

function mangleName(priv, ident)
{
    var name = ident.v;
    var strpriv = null;

    if (priv === null || name === null || name.charAt(0) !== '_' || name.charAt(1) !== '_')
        return ident;
    // don't mangle __id__
    if (name.charAt(name.length - 1) === '_' && name.charAt(name.length - 2) === '_')
        return ident;
    // don't mangle classes that are all _ (obscure much?)
    strpriv = priv.v;
    strpriv.replace(/_/g, '');
    if (strpriv === '')
        return ident;

    strpriv = priv.v;
    strpriv.replace(/^_*/, '');
    strpriv = new Sk.builtin.str('_' + strpriv + name);
    return strpriv;
}

/**
 * @param {string} hint basename for gensym
 * @param {...*} rest
 */
Compiler.prototype._gr = function(hint, rest)
{
    var v = this.gensym(hint);
    out("var ", v, "=");
    for (var i = 1; i < arguments.length; ++i)
    {
        out(arguments[i]);
    }
    out(";");
    return v;
}

/**
* Function to test if an interrupt should occur if the program has been running for too long.
* This function is executed at every test/branch operation.
*/
Compiler.prototype._interruptTest = function() { // Added by RNL
	out("if (Sk.execStart === undefined) {Sk.execStart=new Date()}");
  	out("if (Sk.execLimit != null && new Date() - Sk.execStart > Sk.execLimit) {throw new Sk.builtin.TimeLimitError(Sk.timeoutMsg())}");
}

Compiler.prototype._jumpfalse = function(test, block)
{
    var cond = this._gr('jfalse', "(", test, "===false||!Sk.misceval.isTrue(", test, "))");
    this._interruptTest();	// Added by RNL
    out("if(", cond, "){/*test failed */$blk=", block, ";continue;}");
};

Compiler.prototype._jumpundef = function(test, block)
{
    this._interruptTest();	// Added by RNL
    out("if(", test, "===undefined){$blk=", block, ";continue;}");
};

Compiler.prototype._jumptrue = function(test, block)
{
    var cond = this._gr('jtrue', "(", test, "===true||Sk.misceval.isTrue(", test, "))");
    this._interruptTest();	// Added by RNL
    out("if(", cond, "){/*test passed */$blk=", block, ";continue;}");
};

Compiler.prototype._jump = function(block)
{
    this._interruptTest();	// Added by RNL
    out("$blk=", block, ";/* jump */continue;");
};

Compiler.prototype.ctupleorlist = function(e, data, tuporlist)
{
    goog.asserts.assert(tuporlist === 'tuple' || tuporlist === 'list');
    if (e.ctx === Store)
    {
        for (var i = 0; i < e.elts.length; ++i)
        {
            this.vexpr(e.elts[i], "Sk.abstr.objectGetItem(" + data + "," + i + ")");
        }
    }
    else if (e.ctx === Load)
    {
        var items = [];
        for (var i = 0; i < e.elts.length; ++i)
        {
            items.push(this._gr('elem', this.vexpr(e.elts[i])));
        }
        return this._gr('load'+tuporlist, "new Sk.builtins['", tuporlist, "']([", items, "])");
    }
};

Compiler.prototype.cdict = function(e)
{
    goog.asserts.assert(e.values.length === e.keys.length);
    var items = [];
    for (var i = 0; i < e.values.length; ++i)
    {
        var v = this.vexpr(e.values[i]); // "backwards" to match order in cpy
        items.push(this.vexpr(e.keys[i]));
        items.push(v);
    }
    return this._gr('loaddict', "new Sk.builtins['dict']([", items, "])");
};

Compiler.prototype.clistcompgen = function(tmpname, generators, genIndex, elt)
{
    var start = this.newBlock('list gen start');
    var skip = this.newBlock('list gen skip');
    var anchor = this.newBlock('list gen anchor');

    var l = generators[genIndex];
    var toiter = this.vexpr(l.iter);
    var iter = this._gr("iter", "Sk.abstr.iter(", toiter, ")");
    this._jump(start);
    this.setBlock(start);

    // load targets
    var nexti = this._gr('next', "Sk.abstr.iternext(", iter, ")");
    this._jumpundef(nexti, anchor); // todo; this should be handled by StopIteration
    var target = this.vexpr(l.target, nexti);

    var n = l.ifs.length;
    for (var i = 0; i < n; ++i)
    {
        var ifres = this.vexpr(l.ifs[i]);
        this._jumpfalse(ifres, start);
    }

    if (++genIndex < generators.length)
    {
        this.clistcompgen(tmpname, generators, genIndex, elt);
    }

    if (genIndex >= generators.length)
    {
        var velt = this.vexpr(elt);
        out(tmpname, ".v.push(", velt, ");"); // todo;
        this._jump(skip);
        this.setBlock(skip);
    }

    this._jump(start);

    this.setBlock(anchor);

    return tmpname;
};

Compiler.prototype.clistcomp = function(e)
{
    goog.asserts.assert(e instanceof ListComp);
    var tmp = this._gr("_compr", "new Sk.builtins['list']([])"); // note: _ is impt. for hack in name mangling (same as cpy)
    return this.clistcompgen(tmp, e.generators, 0, e.elt);
};

Compiler.prototype.cyield = function(e)
{
    if (this.u.ste.blockType !== FunctionBlock)
        throw new SyntaxError("'yield' outside function");
    var val = 'null';
    if (e.value)
        val = this.vexpr(e.value);
    var nextBlock = this.newBlock('after yield');
    // return a pair: resume target block and yielded value
    out("return [/*resume*/", nextBlock, ",/*ret*/", val, "];");
    this.setBlock(nextBlock);
    return '$gen.gi$sentvalue'; // will either be null if none sent, or the value from gen.send(value)
}

Compiler.prototype.ccompare = function(e)
{
    goog.asserts.assert(e.ops.length === e.comparators.length);
    var cur = this.vexpr(e.left);
    var n = e.ops.length;
    var done = this.newBlock("done");
    var fres = this._gr('compareres', 'null');

    for (var i = 0; i < n; ++i)
    {
        var rhs = this.vexpr(e.comparators[i]);
        var res = this._gr('compare', "Sk.builtin.bool(Sk.misceval.richCompareBool(", cur, ",", rhs, ",'", e.ops[i].prototype._astname, "'))");
        out(fres, '=', res, ';');
        this._jumpfalse(res, done);
        cur = rhs;
    }
    this._jump(done);
    this.setBlock(done);
    return fres;
};

Compiler.prototype.ccall = function(e)
{
    var func = this.vexpr(e.func);
    var args = this.vseqexpr(e.args);
    //print(JSON.stringify(e, null, 2));
    if (e.keywords.length > 0 || e.starargs || e.kwargs)
    {
        var kwarray = [];
        for (var i = 0; i < e.keywords.length; ++i)
        {
            kwarray.push("'" + e.keywords[i].arg.v + "'");
            kwarray.push(this.vexpr(e.keywords[i].value));
        }
        var keywords = "[" + kwarray.join(",") + "]";
        var starargs = "undefined";
        var kwargs = "undefined";
        if (e.starargs)
            starargs = this.vexpr(e.starargs);
        if (e.kwargs)
            kwargs = this.vexpr(e.kwargs);
        return this._gr('call', "Sk.misceval.call(", func, "," , kwargs, ",", starargs, ",", keywords, args.length > 0 ? "," : "", args, ")");
    }
    else
    {
        return this._gr('call', "Sk.misceval.callsim(", func, args.length > 0 ? "," : "", args, ")");
    }
};

Compiler.prototype.cslice = function(s)
{
    goog.asserts.assert(s instanceof Slice);
    var low = s.lower ? this.vexpr(s.lower) : s.step ? 'Sk.builtin.none.none$' : 'new Sk.builtin.nmber(0)'; // todo;ideally, these numbers would be constants
    var high = s.upper ? this.vexpr(s.upper) : s.step ? 'Sk.builtin.none.none$' : 'new Sk.builtin.nmber(2147483647)';
    var step = s.step ? this.vexpr(s.step) : 'Sk.builtin.none.none$';
    return this._gr('slice', "new Sk.builtins['slice'](", low, ",", high, ",", step, ")");
};

Compiler.prototype.eslice = function(dims)
{
    goog.asserts.assert(dims instanceof Array);
    var dimSubs = [], subs;
    for(var i = 0; i < dims.length; i++) {
        dimSubs.push(this.vslicesub(dims[i]));
    }
    return this._gr('extslice', "new Sk.builtins['tuple']([", dimSubs, "])");
};

Compiler.prototype.vslicesub = function(s)
{
    var subs;
    switch (s.constructor)
    {
        case Number:
        case String:
            // Already compiled, should only happen for augmented assignments
            subs = s;
            break;
        case Index:
            subs = this.vexpr(s.value);
            break;
        case Slice:
            subs = this.cslice(s);
            break;
        case Ellipsis:
            goog.asserts.fail("todo compile.js Ellipsis;");
            break;
        case ExtSlice:
            subs = this.eslice(s.dims);
            break;
        default:
            goog.asserts.fail("invalid subscript kind");
    }
    return subs;
}

Compiler.prototype.vslice = function(s, ctx, obj, dataToStore)
{
    var subs = this.vslicesub(s);
    return this.chandlesubscr(ctx, obj, subs, dataToStore);
};

Compiler.prototype.chandlesubscr = function(ctx, obj, subs, data)
{
    if (ctx === Load || ctx === AugLoad)
        return this._gr('lsubscr', "Sk.abstr.objectGetItem(", obj, ",", subs, ")");
    else if (ctx === Store || ctx === AugStore)
        out("Sk.abstr.objectSetItem(", obj, ",", subs, ",", data, ");");
    else if (ctx === Del)
        out("Sk.abstr.objectDelItem(", obj, ",", subs, ");");
    else
        goog.asserts.fail("handlesubscr fail");
};

Compiler.prototype.cboolop = function(e)
{
    goog.asserts.assert(e instanceof BoolOp);
    var jtype;
    var ifFailed;
    if (e.op === And)
        jtype = this._jumpfalse;
    else
        jtype = this._jumptrue;
    var end = this.newBlock('end of boolop');
    var s = e.values;
    var n = s.length;
    var retval;
    for (var i = 0; i < n; ++i)
    {
        var expres = this.vexpr(s[i])
        if (i === 0)
        {
            retval = this._gr('boolopsucc', expres);
        }
        out(retval, "=", expres, ";");
        jtype.call(this, expres, end);
    }
    this._jump(end);
    this.setBlock(end);
    return retval;
};


/**
 *
 * compiles an expression. to 'return' something, it'll gensym a var and store
 * into that var so that the calling code doesn't have avoid just pasting the
 * returned name.
 *
 * @param {Object} e
 * @param {string=} data data to store in a store operation
 * @param {Object=} augstoreval value to store to for an aug operation (not
 * vexpr'd yet)
 */
Compiler.prototype.vexpr = function(e, data, augstoreval)
{
    if (e.lineno > this.u.lineno)
    {
        this.u.lineno = e.lineno;
        this.u.linenoSet = false;
    }
    //this.annotateSource(e);
    switch (e.constructor)
    {
        case BoolOp:
            return this.cboolop(e);
        case BinOp:
            return this._gr('binop', "Sk.abstr.numberBinOp(", this.vexpr(e.left), ",", this.vexpr(e.right), ",'", e.op.prototype._astname, "')");
        case UnaryOp:
            return this._gr('unaryop', "Sk.abstr.numberUnaryOp(", this.vexpr(e.operand), ",'", e.op.prototype._astname, "')");
        case Lambda:
            return this.clambda(e);
        case IfExp:
            return this.cifexp(e);
        case Dict:
            return this.cdict(e);
        case ListComp:
            return this.clistcomp(e);
        case GeneratorExp:
            return this.cgenexp(e);
        case Yield:
            return this.cyield(e);
        case Compare:
            return this.ccompare(e);
        case Call:
            var result = this.ccall(e);
            // After the function call, we've returned to this line
            this.annotateSource(e);
            return result;
        case Num:
            if (typeof e.n === "number")
                return e.n;
	    else if (e.n instanceof Sk.builtin.nmber)
		return "new Sk.builtin.nmber(" + e.n.v + ",'" + e.n.skType + "')";
            else if (e.n instanceof Sk.builtin.lng)
                return "Sk.longFromStr('" + e.n.tp$str().v + "')";
            goog.asserts.fail("unhandled Num type");
        case Str:
            return this._gr('str', "new Sk.builtins['str'](", e.s['$r']().v, ")");
        case Attribute:
            var val;
            if (e.ctx !== AugStore)
                val = this.vexpr(e.value);
            var mangled = e.attr['$r']().v;
            mangled = mangled.substring(1, mangled.length-1);
            mangled = mangleName(this.u.private_, new Sk.builtin.str(mangled)).v;
            mangled = fixReservedWords(mangled);
            mangled = fixReservedNames(mangled);
            switch (e.ctx)
            {
                case AugLoad:
                case Load:
                    return this._gr("lattr", "Sk.abstr.gattr(", val, ",'", mangled, "')");
                case AugStore:
                    out("if(", data, "!==undefined){"); // special case to avoid re-store if inplace worked
                    val = this.vexpr(augstoreval || null); // the || null can never happen, but closure thinks we can get here with it being undef
                    out("Sk.abstr.sattr(", val, ",'", mangled, "',", data, ");");
                    out("}");
                    break;
                case Store:
                    out("Sk.abstr.sattr(", val, ",'", mangled, "',", data, ");");
                    break;
                case Del:
                    goog.asserts.fail("todo Del;");
                    break;
                case Param:
                default:
                    goog.asserts.fail("invalid attribute expression");
            }
            break;
        case Subscript:
            var val;
            switch (e.ctx)
            {
                case AugLoad:
                case Load:
                case Store:
                case Del:
                    return this.vslice(e.slice, e.ctx, this.vexpr(e.value), data);
                case AugStore:
                    out("if(", data, "!==undefined){"); // special case to avoid re-store if inplace worked
                    val = this.vexpr(augstoreval || null); // the || null can never happen, but closure thinks we can get here with it being undef
                    this.vslice(e.slice, e.ctx, val, data);
                    out("}");
                    break;
                case Param:
                default:
                    goog.asserts.fail("invalid subscript expression");
            }
            break;
        case Name:
            return this.nameop(e.id, e.ctx, data);
        case List:
            return this.ctupleorlist(e, data, 'list');
        case Tuple:
            return this.ctupleorlist(e, data, 'tuple');
        default:
            goog.asserts.fail("unhandled case in vexpr");
    }
};

/**
 * @param {Array.<Object>} exprs
 * @param {Array.<string>=} data
 */
Compiler.prototype.vseqexpr = function(exprs, data)
{
    goog.asserts.assert(data === undefined || exprs.length === data.length);
    var ret = [];
    for (var i = 0; i < exprs.length; ++i)
        ret.push(this.vexpr(exprs[i], data === undefined ? undefined : data[i]));
    return ret;
};

Compiler.prototype.caugassign = function(s)
{
    goog.asserts.assert(s instanceof AugAssign);
    var e = s.target;
    switch (e.constructor)
    {
        case Attribute:
            var auge = new Attribute(e.value, e.attr, AugLoad, e.lineno, e.col_offset);
            var aug = this.vexpr(auge);
            var val = this.vexpr(s.value);
            var res = this._gr('inplbinopattr', "Sk.abstr.numberInplaceBinOp(", aug, ",", val, ",'", s.op.prototype._astname, "')");
            auge.ctx = AugStore;
            return this.vexpr(auge, res, e.value)
        case Subscript:
            // Only compile the subscript value once
            var augsub = this.vslicesub(e.slice);
            var auge = new Subscript(e.value, augsub, AugLoad, e.lineno, e.col_offset);
            var aug = this.vexpr(auge);
            var val = this.vexpr(s.value);
            var res = this._gr('inplbinopsubscr', "Sk.abstr.numberInplaceBinOp(", aug, ",", val, ",'", s.op.prototype._astname, "')");
            auge.ctx = AugStore;
            return this.vexpr(auge, res, e.value)
        case Name:
            var to = this.nameop(e.id, Load);
            var val = this.vexpr(s.value);
            var res = this._gr('inplbinop', "Sk.abstr.numberInplaceBinOp(", to, ",", val, ",'", s.op.prototype._astname, "')");
            return this.nameop(e.id, Store, res);
        default:
            goog.asserts.fail("unhandled case in augassign");
    }
};

/**
 * optimize some constant exprs. returns 0 if always 0, 1 if always 1 or -1 otherwise.
 */
Compiler.prototype.exprConstant = function(e)
{
    switch (e.constructor)
    {
        case Num:
            return Sk.misceval.isTrue(e.n);
        case Str:
            return Sk.misceval.isTrue(e.s);
        case Name:
            // todo; do __debug__ test here if opt
        default:
            return -1;
    }
};

Compiler.prototype.newBlock = function(name)
{
    var ret = this.u.blocknum++;
    this.u.blocks[ret] = [];
    this.u.blocks[ret]._name = name || '<unnamed>';
    return ret;
};
Compiler.prototype.setBlock = function(n)
{
    goog.asserts.assert(n >= 0 && n < this.u.blocknum);
    this.u.curblock = n;
};

Compiler.prototype.pushBreakBlock = function(n)
{
    goog.asserts.assert(n >= 0 && n < this.u.blocknum);
    this.u.breakBlocks.push(n);
};
Compiler.prototype.popBreakBlock = function()
{
    this.u.breakBlocks.pop();
};

Compiler.prototype.pushContinueBlock = function(n)
{
    goog.asserts.assert(n >= 0 && n < this.u.blocknum);
    this.u.continueBlocks.push(n);
};
Compiler.prototype.popContinueBlock = function()
{
    this.u.continueBlocks.pop();
};

Compiler.prototype.pushExceptBlock = function(n)
{
    goog.asserts.assert(n >= 0 && n < this.u.blocknum);
    this.u.exceptBlocks.push(n);
};
Compiler.prototype.popExceptBlock = function()
{
    this.u.exceptBlocks.pop();
};

Compiler.prototype.pushFinallyBlock = function(n)
{
    goog.asserts.assert(n >= 0 && n < this.u.blocknum);
    this.u.finallyBlocks.push(n);
};
Compiler.prototype.popFinallyBlock = function()
{
    this.u.finallyBlocks.pop();
};

Compiler.prototype.setupExcept = function(eb)
{
    out("$exc.push(", eb, ");");
    //this.pushExceptBlock(eb);
};

Compiler.prototype.endExcept = function()
{
    out("$exc.pop();");
};

Compiler.prototype.outputLocals = function(unit)
{
    var have = {};
    //print("args", unit.name.v, JSON.stringify(unit.argnames));
    for (var i = 0; unit.argnames && i < unit.argnames.length; ++i)
        have[unit.argnames[i]] = true;
    unit.localnames.sort();
    var output = [];
    for (var i = 0; i < unit.localnames.length; ++i)
    {
        var name = unit.localnames[i];
        if (have[name] === undefined)
        {
            output.push(name);
            have[name] = true;
        }
    }
    if (output.length > 0)
        return "var " + output.join(",") + "; /* locals */";
    return "";
};

Compiler.prototype.outputAllUnits = function()
{
    var ret = '';
    for (var j = 0; j < this.allUnits.length; ++j)
    {
        var unit = this.allUnits[j];
        ret += unit.prefixCode;
        ret += this.outputLocals(unit);
        ret += unit.varDeclsCode;
        ret += unit.switchCode;
        var blocks = unit.blocks;
        for (var i = 0; i < blocks.length; ++i)
        {
            ret += "case " + i + ": /* --- " + blocks[i]._name + " --- */";
            ret += blocks[i].join('');

            ret += "throw new Sk.builtin.SystemError('internal error: unterminated block');";
        }
        ret += unit.suffixCode;
    }
    return ret;
};

Compiler.prototype.cif = function(s)
{
    goog.asserts.assert(s instanceof If_);
    var constant = this.exprConstant(s.test);
    if (constant === 0)
    {
        if (s.orelse)
            this.vseqstmt(s.orelse);
    }
    else if (constant === 1)
    {
        this.vseqstmt(s.body);
    }
    else
    {
        var end = this.newBlock('end of if');
        var next = this.newBlock('next branch of if');

        var test = this.vexpr(s.test);
        this._jumpfalse(test, next);
        this.vseqstmt(s.body);
        this._jump(end);

        this.setBlock(next);
        if (s.orelse)
            this.vseqstmt(s.orelse);
        this._jump(end);
    }
    this.setBlock(end);

};

Compiler.prototype.cwhile = function(s)
{
    var constant = this.exprConstant(s.test);
    if (constant === 0)
    {
        if (s.orelse)
            this.vseqstmt(s.orelse);
    }
    else
    {
        var top = this.newBlock('while test');
        this._jump(top);
        this.setBlock(top);

        var next = this.newBlock('after while');
        var orelse = s.orelse.length > 0 ? this.newBlock('while orelse') : null;
        var body = this.newBlock('while body');

        this._jumpfalse(this.vexpr(s.test), orelse ? orelse : next);
        this._jump(body);

        this.pushBreakBlock(next);
        this.pushContinueBlock(top);

        this.setBlock(body);
        this.vseqstmt(s.body);
        this._jump(top);

        this.popContinueBlock();
        this.popBreakBlock();

        if (s.orelse.length > 0)
        {
            this.setBlock(orelse);
            this.vseqstmt(s.orelse);
            this._jump(next);
        }

        this.setBlock(next);
    }
};

Compiler.prototype.cfor = function(s)
{
    var start = this.newBlock('for start');
    var cleanup = this.newBlock('for cleanup');
    var end = this.newBlock('for end');

    this.pushBreakBlock(end);
    this.pushContinueBlock(start);

    // get the iterator
    var toiter = this.vexpr(s.iter);
    var iter;
    if (this.u.ste.generator)
    {
        // if we're in a generator, we have to store the iterator to a local
        // so it's preserved (as we cross blocks here and assume it survives)
        iter = "$loc." + this.gensym("iter");
        out(iter, "=Sk.abstr.iter(", toiter, ");");
    }
    else
        iter = this._gr("iter", "Sk.abstr.iter(", toiter, ")");

    this._jump(start);

    this.setBlock(start);

    // load targets
    var nexti = this._gr('next', "Sk.abstr.iternext(", iter, ")");
    this._jumpundef(nexti, cleanup); // todo; this should be handled by StopIteration
    var target = this.vexpr(s.target, nexti);

    // execute body
    this.vseqstmt(s.body);
    
    // jump to top of loop
    this._jump(start);

    this.setBlock(cleanup);
    this.popContinueBlock();
    this.popBreakBlock();

    this.vseqstmt(s.orelse);
    this._jump(end);

    this.setBlock(end);
};

Compiler.prototype.craise = function(s)
{
    if (s && s.type && s.type.id && (s.type.id.v === "StopIteration"))
    {
        // currently, we only handle StopIteration, and all it does it return
        // undefined which is what our iterator protocol requires.
        //
        // totally hacky, but good enough for now.
        out("return undefined;");
    }
    else
    {
        var inst = '';
        if (s.inst)
        {
            // handles: raise Error, arguments
            inst = this.vexpr(s.inst);
            out("throw ", this.vexpr(s.type), "(", inst, ");");
        }
        else if (s.type)
        {
            if (s.type.func)
            {
                // handles: raise Error(arguments)
                out("throw ", this.vexpr(s.type), ";");
            }
            else
            {
                // handles: raise Error
                out("throw ", this.vexpr(s.type), "('');");
            }
        }
        else
        {
            // re-raise
            out("throw $err;");
        }
    }
};

Compiler.prototype.ctryexcept = function(s)
{
    var n = s.handlers.length;

    // Create a block for each except clause
    var handlers = [];
    for (var i = 0; i < n; ++i)
    {
        handlers.push(this.newBlock("except_" + i + "_"));
    }

    var unhandled = this.newBlock("unhandled");
    var orelse = this.newBlock("orelse");
    var end = this.newBlock("end");

    this.setupExcept(handlers[0]);
    this.vseqstmt(s.body);
    this.endExcept();
    this._jump(orelse);

    for (var i = 0; i < n; ++i)
    {
        this.setBlock(handlers[i]);
        var handler = s.handlers[i];
        if (!handler.type && i < n - 1)
        {
            throw new SyntaxError("default 'except:' must be last");
        }

        if (handler.type)
        {
            // should jump to next handler if err not isinstance of handler.type
            var handlertype = this.vexpr(handler.type);
            var next = (i == n-1) ? unhandled : handlers[i+1];

            // var isinstance = this.nameop(new Sk.builtin.str("isinstance"), Load));
            // var check = this._gr('call', "Sk.misceval.callsim(", isinstance, ", $err, ", handlertype, ")");

            // this check is not right, should use isinstance, but exception objects
            // are not yet proper Python objects
            var check = this._gr('instance', "$err instanceof ", handlertype);
            this._jumpfalse(check, next);
        }

        if (handler.name)
        {
            this.vexpr(handler.name, "$err");
        }

        // Need to execute finally before leaving body if an exception is raised
        this.vseqstmt(handler.body);

        // Should jump to finally, but finally is not implemented yet
        this._jump(end);
    }

    // If no except clause catches exception, throw it again
    this.setBlock(unhandled);
    // Should execute finally first
    out("throw $err;");

    this.setBlock(orelse);
    this.vseqstmt(s.orelse);
    // Should jump to finally, but finally is not implemented yet
    this._jump(end);
    this.setBlock(end);
};

Compiler.prototype.ctryfinally = function(s)
{
    out("/*todo; tryfinally*/");
    // everything but the finally?
    this.ctryexcept(s.body[0]);
};

Compiler.prototype.cassert = function(s)
{
    /* todo; warnings method
    if (s.test instanceof Tuple && s.test.elts.length > 0)
        Sk.warn("assertion is always true, perhaps remove parentheses?");
    */

    var test = this.vexpr(s.test);
    var end = this.newBlock("end");
    this._jumptrue(test, end);
    // todo; exception handling
    // maybe replace with goog.asserts.fail?? or just an alert?
    out("throw new Sk.builtin.AssertionError(", s.msg ? this.vexpr(s.msg) : "", ");");
    this.setBlock(end);
};

Compiler.prototype.cimportas = function(name, asname, mod)
{
    var src = name.v;
    var dotLoc = src.indexOf(".");
    //print("src", src);
    //print("dotLoc", dotLoc);
    var cur = mod;
    if (dotLoc !== -1)
    {
        // if there's dots in the module name, __import__ will have returned
        // the top-level module. so, we need to extract the actual module by
        // getattr'ing up through the names, and then storing the leaf under
        // the name it was to be imported as.
        src = src.substr(dotLoc + 1);
        //print("src now", src);
        while (dotLoc !== -1)
        {
            dotLoc = src.indexOf(".");
            var attr = dotLoc !== -1 ? src.substr(0, dotLoc) : src;
            cur = this._gr('lattr', "Sk.abstr.gattr(", cur, ",'", attr, "')");
            src = src.substr(dotLoc + 1);
        }
    }
    return this.nameop(asname, Store, cur);
};

Compiler.prototype.cimport = function(s)
{
    var n = s.names.length;
    for (var i = 0; i < n; ++i)
    {
        var alias = s.names[i];
        var mod = this._gr('module', "Sk.builtin.__import__(", alias.name['$r']().v, ",$gbl,$loc,[])");

        if (alias.asname)
        {
            this.cimportas(alias.name, alias.asname, mod);
        }
        else
        {
            var tmp = alias.name;
            var lastDot = tmp.v.indexOf('.');
            if (lastDot !== -1)
                tmp = new Sk.builtin.str(tmp.v.substr(0, lastDot));
            this.nameop(tmp, Store, mod);
        }
    }
};

Compiler.prototype.cfromimport = function(s)
{
    var n = s.names.length;
    var names = [];
    for (var i = 0; i < n; ++i)
        names[i] = s.names[i].name['$r']().v;
    var mod = this._gr('module', "Sk.builtin.__import__(", s.module['$r']().v, ",$gbl,$loc,[", names, "])");
    for (var i = 0; i < n; ++i)
    {
        var alias = s.names[i];
        if (i === 0 && alias.name.v === "*")
        {
            goog.asserts.assert(n === 1);
            out("Sk.importStar(", mod,  ",$loc, $gbl);");
            return;
        }

        var got = this._gr('item', "Sk.abstr.gattr(", mod, ",", alias.name['$r']().v, ")");
        var storeName = alias.name;
        if (alias.asname)
            storeName = alias.asname;
        this.nameop(storeName, Store, got);
    }
};

/**
 * builds a code object (js function) for various constructs. used by def,
 * lambda, generator expressions. it isn't used for class because it seemed
 * different enough.
 *
 * handles:
 * - setting up a new scope
 * - decorators (if any)
 * - defaults setup
 * - setup for cell and free vars
 * - setup and modification for generators
 *
 * @param {Object} n ast node to build for
 * @param {Sk.builtin.str} coname name of code object to build
 * @param {Array} decorator_list ast of decorators if any
 * @param {arguments_} args arguments to function, if any
 * @param {Function} callback called after setup to do actual work of function
 *
 * @returns the name of the newly created function or generator object.
 *
 */
Compiler.prototype.buildcodeobj = function(n, coname, decorator_list, args, callback)
{
    var decos = [];
    var defaults = [];
    var vararg = null;
    var kwarg = null;

    // decorators and defaults have to be evaluated out here before we enter
    // the new scope. we output the defaults and attach them to this code
    // object, but only once we know the name of it (so we do it after we've
    // exited the scope near the end of this function).
    if (decorator_list)
        decos = this.vseqexpr(decorator_list);
    if (args && args.defaults)
        defaults = this.vseqexpr(args.defaults);
    if (args && args.vararg)
        vararg = args.vararg;
    if (args && args.kwarg)
        kwarg = args.kwarg;

    //
    // enter the new scope, and create the first block
    //
    var scopename = this.enterScope(coname, n, n.lineno);

    var isGenerator = this.u.ste.generator;
    var hasFree = this.u.ste.hasFree;
    var hasCell = this.u.ste.childHasFree;

    var entryBlock = this.newBlock('codeobj entry');

    //
    // the header of the function, and arguments
    //
    this.u.prefixCode = "var " + scopename + "=(function " + this.niceName(coname.v) + "$(";

    var funcArgs = [];
    if (isGenerator)
    {
        if (kwarg)
        {
            throw new SyntaxError(coname.v + "(): keyword arguments in generators not supported");
        }
        if (vararg)
        {
            throw new SyntaxError(coname.v + "(): variable number of arguments in generators not supported");    
        }
        funcArgs.push("$gen");
    }
    else
    {
        if (kwarg)
            funcArgs.push("$kwa");
        for (var i = 0; args && i < args.args.length; ++i)
            funcArgs.push(this.nameop(args.args[i].id, Param));
    }
    if (hasFree)
        funcArgs.push("$free");
    this.u.prefixCode += funcArgs.join(",");

    this.u.prefixCode += "){";

    if (isGenerator) this.u.prefixCode += "\n// generator\n";
    if (hasFree) this.u.prefixCode += "\n// has free\n";
    if (hasCell) this.u.prefixCode += "\n// has cell\n";

    //
    // set up standard dicts/variables
    //
    var locals = "{}";
    if (isGenerator)
    {
        entryBlock = "$gen.gi$resumeat";
        locals = "$gen.gi$locals";
    }
    var cells = "";
    if (hasCell)
        cells = ",$cell={}";

    // note special usage of 'this' to avoid having to slice globals into
    // all function invocations in call
    this.u.varDeclsCode += "var $blk=" + entryBlock + ",$exc=[],$loc=" + locals + cells + ",$gbl=this,$err=undefined;";

    //
    // copy all parameters that are also cells into the cells dict. this is so
    // they can be accessed correctly by nested scopes.
    //
    for (var i = 0; args && i < args.args.length; ++i)
    {
        var id = args.args[i].id;
        if (this.isCell(id))
            this.u.varDeclsCode += "$cell." + id.v + "=" + id.v + ";";
    }

    //
    // make sure correct number of arguments were passed (generators handled below)
    //
    if (!isGenerator) {
        var minargs = args ? args.args.length - defaults.length : 0;
        var maxargs = vararg ? Infinity : (args ? args.args.length : 0);
        var kw = kwarg ? true : false;
        this.u.varDeclsCode += "Sk.builtin.pyCheckArgs(\"" + coname.v + 
            "\", arguments, " + minargs + ", " + maxargs + ", " + kw + 
            ", " + hasFree + ");";
    }

    //
    // initialize default arguments. we store the values of the defaults to
    // this code object as .$defaults just below after we exit this scope.
    //
    if (defaults.length > 0)
    {
        // defaults have to be "right justified" so if there's less defaults
        // than args we offset to make them match up (we don't need another
        // correlation in the ast)
        var offset = args.args.length - defaults.length;
        for (var i = 0; i < defaults.length; ++i)
        {
            var argname = this.nameop(args.args[i + offset].id, Param);
            this.u.varDeclsCode += "if(" + argname + "===undefined)" + argname +"=" + scopename+".$defaults[" + i + "];";
        }
    }

    //
    // initialize vararg, if any
    //
    if (vararg)
    {
        var start = funcArgs.length;
        this.u.varDeclsCode += vararg.v + "=new Sk.builtins['tuple'](Array.prototype.slice.call(arguments," + start + ")); /*vararg*/";
    }

    //
    // initialize kwarg, if any
    //
    if (kwarg)
    {
        this.u.varDeclsCode += kwarg.v + "=new Sk.builtins['dict']($kwa);";
    }

    //
    // finally, set up the block switch that the jump code expects
    //
    // Old switch code
    // this.u.switchCode += "while(true){switch($blk){";
    // this.u.suffixCode = "}break;}});";

    // New switch code to catch exceptions
    this.u.switchCode = "while(true){try{ switch($blk){";
    this.u.suffixCode = "} }catch(err){if ($exc.length>0) { $err = err; $blk=$exc.pop(); continue; } else { throw err; }} }});";

    //
    // jump back to the handler so it can do the main actual work of the
    // function
    //
    callback.call(this, scopename);

    //
    // get a list of all the argument names (used to attach to the code
    // object, and also to allow us to declare only locals that aren't also
    // parameters).
    var argnames;
    if (args && args.args.length > 0)
    {
        var argnamesarr = [];
        for (var i = 0; i < args.args.length; ++i)
            argnamesarr.push(args.args[i].id.v);

        argnames = argnamesarr.join("', '");
        // store to unit so we know what local variables not to declare
        this.u.argnames = argnamesarr;
    }

    //
    // and exit the code object scope
    //
    this.exitScope();

    //
    // attach the default values we evaluated at the beginning to the code
    // object so that it can get at them to set any arguments that are left
    // unset.
    //
    if (defaults.length > 0)
        out(scopename, ".$defaults=[", defaults.join(','), "];");


    //
    // attach co_varnames (only the argument names) for keyword argument
    // binding.
    //
    if (argnames)
    {
        out(scopename, ".co_varnames=['", argnames, "'];");
    }

    //
    // attach flags
    //
    if (kwarg)
    {
        out(scopename, ".co_kwargs=1;");
    }

    //
    // build either a 'function' or 'generator'. the function is just a simple
    // constructor call. the generator is more complicated. it needs to make a
    // new generator every time it's called, so the thing that's returned is
    // actually a function that makes the generator (and passes arguments to
    // the function onwards to the generator). this should probably actually
    // be a function object, rather than a js function like it is now. we also
    // have to build the argument names to pass to the generator because it
    // needs to store all locals into itself so that they're maintained across
    // yields.
    //
    // todo; possibly this should be outside?
    //
    var frees = "";
    if (hasFree)
    {
        frees = ",$cell";
        // if the scope we're in where we're defining this one has free
        // vars, they may also be cell vars, so we pass those to the
        // closure too.
        var containingHasFree = this.u.ste.hasFree;
        if (containingHasFree)
            frees += ",$free";
    }
    if (isGenerator)
        // Keyword and variable arguments are not currently supported in generators.
        // The call to pyCheckArgs assumes they can't be true.
        if (args && args.args.length > 0)
            return this._gr("gener", "new Sk.builtins['function']((function(){var $origargs=Array.prototype.slice.call(arguments);Sk.builtin.pyCheckArgs(\"", 
                                     coname.v, "\",arguments,", args.args.length - defaults.length, ",", args.args.length, 
                                     ");return new Sk.builtins['generator'](", scopename, ",$gbl,$origargs", frees, ");}))");
        else
            return this._gr("gener", "new Sk.builtins['function']((function(){Sk.builtin.pyCheckArgs(\"", coname.v, 
                                     "\",arguments,0,0);return new Sk.builtins['generator'](", scopename, ",$gbl,[]", frees, ");}))");
    else
        return this._gr("funcobj", "new Sk.builtins['function'](", scopename, ",$gbl", frees ,")");
};

Compiler.prototype.cfunction = function(s)
{
    goog.asserts.assert(s instanceof FunctionDef);
    var funcorgen = this.buildcodeobj(s, s.name, s.decorator_list, s.args, function(scopename)
            {
                this.vseqstmt(s.body);
                out("return Sk.builtin.none.none$;"); // if we fall off the bottom, we want the ret to be None
            });
    this.nameop(s.name, Store, funcorgen);
};

Compiler.prototype.clambda = function(e)
{
    goog.asserts.assert(e instanceof Lambda);
    var func = this.buildcodeobj(e, new Sk.builtin.str("<lambda>"), null, e.args, function(scopename)
            {
                var val = this.vexpr(e.body);
                out("return ", val, ";");
            });
    return func;
};

Compiler.prototype.cifexp = function(e)
{
    var next = this.newBlock('next of ifexp');
    var end = this.newBlock('end of ifexp');
    var ret = this._gr('res', 'null');

    var test = this.vexpr(e.test);
    this._jumpfalse(test, next);

    out(ret, '=', this.vexpr(e.body), ';');
    this._jump(end);

    this.setBlock(next);
    out(ret, '=', this.vexpr(e.orelse), ';');
    this._jump(end);

    this.setBlock(end);
    return ret;
};

Compiler.prototype.cgenexpgen = function(generators, genIndex, elt)
{
    var start = this.newBlock('start for ' + genIndex);
    var skip = this.newBlock('skip for ' + genIndex);
    var ifCleanup = this.newBlock('if cleanup for ' + genIndex);
    var end = this.newBlock('end for ' + genIndex);

    var ge = generators[genIndex];

    var iter;
    if (genIndex === 0)
    {
        // the outer most iterator is evaluated in the scope outside so we
        // have to evaluate it outside and store it into the generator as a
        // local, which we retrieve here.
        iter = "$loc.$iter0";
    }
    else
    {
        var toiter = this.vexpr(ge.iter);
        iter = "$loc." + this.gensym("iter");
        out(iter, "=", "Sk.abstr.iter(", toiter, ");");
    }
    this._jump(start);
    this.setBlock(start);

    // load targets
    var nexti = this._gr('next', "Sk.abstr.iternext(", iter, ")");
    this._jumpundef(nexti, end); // todo; this should be handled by StopIteration
    var target = this.vexpr(ge.target, nexti);

    var n = ge.ifs.length;
    for (var i = 0; i < n; ++i)
    {
        var ifres = this.vexpr(ge.ifs[i]);
        this._jumpfalse(ifres, start);
    }

    if (++genIndex < generators.length)
    {
        this.cgenexpgen(generators, genIndex, elt);
    }

    if (genIndex >= generators.length)
    {
        var velt = this.vexpr(elt);
        out("return [", skip, "/*resume*/,", velt, "/*ret*/];");
        this.setBlock(skip);
    }

    this._jump(start);

    this.setBlock(end);

    if (genIndex === 1)
        out("return Sk.builtin.none.none$;");
};

Compiler.prototype.cgenexp = function(e)
{
    var gen = this.buildcodeobj(e, new Sk.builtin.str("<genexpr>"), null, null, function(scopename)
            {
                this.cgenexpgen(e.generators, 0, e.elt);
            });

    // call the generator maker to get the generator. this is kind of dumb,
    // but the code builder builds a wrapper that makes generators for normal
    // function generators, so we just do it outside (even just new'ing it
    // inline would be fine).
    var gener = this._gr("gener", "Sk.misceval.callsim(", gen, ");");
    // stuff the outermost iterator into the generator after evaluating it
    // outside of the function. it's retrieved by the fixed name above.
    out(gener, ".gi$locals.$iter0=Sk.abstr.iter(", this.vexpr(e.generators[0].iter), ");");
    return gener;
};



Compiler.prototype.cclass = function(s)
{
    goog.asserts.assert(s instanceof ClassDef);
    var decos = s.decorator_list;

    // decorators and bases need to be eval'd out here
    //this.vseqexpr(decos);
    
    var bases = this.vseqexpr(s.bases);

    var scopename = this.enterScope(s.name, s, s.lineno);
    var entryBlock = this.newBlock('class entry');

    this.u.prefixCode = "var " + scopename + "=(function $" + s.name.v + "$class_outer($globals,$locals,$rest){var $gbl=$globals,$loc=$locals;";
    this.u.switchCode += "return(function " + s.name.v + "(){";
    this.u.switchCode += "var $blk=" + entryBlock + ",$exc=[];while(true){switch($blk){";
    this.u.suffixCode = "}break;}}).apply(null,$rest);});";

    this.u.private_ = s.name;
    
    this.cbody(s.body);
    out("break;");

    // build class

    // apply decorators

    this.exitScope();

    // todo; metaclass
    var wrapped = this._gr("built", "Sk.misceval.buildClass($gbl,", scopename, ",", s.name['$r']().v, ",[", bases, "])");

    // store our new class under the right name
    this.nameop(s.name, Store, wrapped);
};

Compiler.prototype.ccontinue = function(s)
{
    if (this.u.continueBlocks.length === 0)
        throw new SyntaxError("'continue' outside loop");
    // todo; continue out of exception blocks
    this._jump(this.u.continueBlocks[this.u.continueBlocks.length - 1]);
};

/**
 * compiles a statement
 */
Compiler.prototype.vstmt = function(s)
{
    this.u.lineno = s.lineno;
    this.u.linenoSet = false;

    this.annotateSource(s);

    switch (s.constructor)
    {
        case FunctionDef:
            this.cfunction(s);
            break;
        case ClassDef:
            this.cclass(s);
            break;
        case Return_:
            if (this.u.ste.blockType !== FunctionBlock)
                throw new SyntaxError("'return' outside function");
            if (s.value)
                out("return ", this.vexpr(s.value), ";");
            else
                out("return Sk.builtin.none.none$;");
            break;
        case Delete_:
            this.vseqexpr(s.targets);
            break;
        case Assign:
            var n = s.targets.length;
            var val = this.vexpr(s.value);
            for (var i = 0; i < n; ++i)
                this.vexpr(s.targets[i], val);
            break;
        case AugAssign:
            return this.caugassign(s);
        case Print:
            this.cprint(s);
            break;
        case For_:
            return this.cfor(s);
        case While_:
            return this.cwhile(s);
        case If_:
            return this.cif(s);
        case Raise:
            return this.craise(s);
        case TryExcept:
            return this.ctryexcept(s);
        case TryFinally:
            return this.ctryfinally(s);
        case Assert:
            return this.cassert(s);
        case Import_:
            return this.cimport(s);
        case ImportFrom:
            return this.cfromimport(s);
        case Global:
            break;
        case Expr:
            this.vexpr(s.value);
            break;
        case Pass:
            break;
        case Break_:
            if (this.u.breakBlocks.length === 0)
                throw new SyntaxError("'break' outside loop");
            this._jump(this.u.breakBlocks[this.u.breakBlocks.length - 1]);
            break;
        case Continue_:
            this.ccontinue(s);
            break;
        default:
            goog.asserts.fail("unhandled case in vstmt");
    }
};

Compiler.prototype.vseqstmt = function(stmts)
{
    for (var i = 0; i < stmts.length; ++i) this.vstmt(stmts[i]);
};

var OP_FAST = 0;
var OP_GLOBAL = 1;
var OP_DEREF = 2;
var OP_NAME = 3;
var D_NAMES = 0;
var D_FREEVARS = 1;
var D_CELLVARS = 2;

Compiler.prototype.isCell = function(name)
{
    var mangled = mangleName(this.u.private_, name).v;
    var scope = this.u.ste.getScope(mangled);
    var dict = null;
    if (scope === CELL)
        return true;
    return false;
};

/**
 * @param {Sk.builtin.str} name
 * @param {Object} ctx
 * @param {string=} dataToStore
 */
Compiler.prototype.nameop = function(name, ctx, dataToStore)
{
    if ((ctx === Store || ctx === AugStore || ctx === Del) && name.v === "__debug__")
        throw new Sk.builtin.SyntaxError("can not assign to __debug__");
    if ((ctx === Store || ctx === AugStore || ctx === Del) && name.v === "None")
        throw new Sk.builtin.SyntaxError("can not assign to None");

    if (name.v === "None") return "Sk.builtin.none.none$";
    if (name.v === "True") return "Sk.builtin.bool.true$";
    if (name.v === "False") return "Sk.builtin.bool.false$";

    var mangled = mangleName(this.u.private_, name).v;
    // Have to do this before looking it up in the scope
    mangled = fixReservedNames(mangled);
    var op = 0;
    var optype = OP_NAME;
    var scope = this.u.ste.getScope(mangled);
    var dict = null;
    switch (scope)
    {
        case FREE:
            dict = "$free";
            optype = OP_DEREF;
            break;
        case CELL:
            dict = "$cell";
            optype = OP_DEREF;
            break;
        case LOCAL:
            // can't do FAST in generators or at module/class scope
            if (this.u.ste.blockType === FunctionBlock && !this.u.ste.generator)
                optype = OP_FAST;
            break;
        case GLOBAL_IMPLICIT:
            if (this.u.ste.blockType === FunctionBlock)
                optype = OP_GLOBAL;
            break;
        case GLOBAL_EXPLICIT:
            optype = OP_GLOBAL;
        default:
            break;
    }

    // have to do this after looking it up in the scope
    mangled = fixReservedWords(mangled);

    //print("mangled", mangled);
    // TODO TODO TODO todo; import * at global scope failing here
    goog.asserts.assert(scope || name.v.charAt(1) === '_');

    // in generator or at module scope, we need to store to $loc, rather that
    // to actual JS stack variables.
    var mangledNoPre = mangled;
    if (this.u.ste.generator || this.u.ste.blockType !== FunctionBlock)
        mangled = "$loc." + mangled;
    else if (optype === OP_FAST || optype === OP_NAME)
        this.u.localnames.push(mangled);

    switch (optype)
    {
        case OP_FAST:
            switch (ctx)
            {
                case Load:
                case Param:
                    // Need to check that it is bound!
                    out("if (", mangled, " === undefined) { throw new Error('local variable \\\'", mangled, "\\\' referenced before assignment'); }\n");
                    return mangled;
                case Store:
                    out(mangled, "=", dataToStore, ";");
                    break;
                case Del:
                    out("delete ", mangled, ";");
                    break;
                default:
                    goog.asserts.fail("unhandled");
            }
            break;
        case OP_NAME:
            switch (ctx)
            {
                case Load:
                    var v = this.gensym('loadname');
                    // can't be || for loc.x = 0 or null
                    out("var ", v, "=", mangled, "!==undefined?",mangled,":Sk.misceval.loadname('",mangledNoPre,"',$gbl);");
                    return v;
                case Store:
                    out(mangled, "=", dataToStore, ";");
                    break;
                case Del:
                    out("delete ", mangled, ";");
                    break;
                case Param:
                    return mangled;
                default:
                    goog.asserts.fail("unhandled");
            }
            break;
        case OP_GLOBAL:
            switch (ctx)
            {
                case Load:
                    return this._gr("loadgbl", "Sk.misceval.loadname('", mangledNoPre, "',$gbl)");
                case Store:
                    out("$gbl.", mangledNoPre, "=", dataToStore, ';');
                    break;
                case Del:
                    out("delete $gbl.", mangledNoPre);
                    break;
                default:
                    goog.asserts.fail("unhandled case in name op_global");
            }
            break;
        case OP_DEREF:
            switch (ctx)
            {
                case Load:
                    return dict + "." + mangledNoPre;
                case Store:
                    out(dict, ".", mangledNoPre, "=", dataToStore, ";");
                    break;
                case Param:
                    return mangledNoPre;
                default:
                    goog.asserts.fail("unhandled case in name op_deref");
            }
            break;
        default:
            goog.asserts.fail("unhandled case");
    }
};

Compiler.prototype.enterScope = function(name, key, lineno)
{
    var u = new CompilerUnit();
    u.ste = this.st.getStsForAst(key);
    u.name = name;
    u.firstlineno = lineno;

    if (this.u && this.u.private_)
        u.private_ = this.u.private_;

    this.stack.push(this.u);
    this.allUnits.push(u);
    var scopeName = this.gensym('scope');
    u.scopename = scopeName;

    this.u = u;
    this.u.activateScope();

    this.nestlevel++;

    return scopeName;
};

Compiler.prototype.exitScope = function()
{
    var prev = this.u;
    this.nestlevel--;
    if (this.stack.length - 1 >= 0)
        this.u = this.stack.pop();
    else
        this.u = null;
    if (this.u)
        this.u.activateScope();

    if (prev.name.v !== "<module>") {// todo; hacky
        var mangled = prev.name['$r']().v;
        mangled = mangled.substring(1, mangled.length-1);
        mangled = fixReservedWords(mangled);
        mangled = fixReservedNames(mangled);
        out(prev.scopename, ".co_name=new Sk.builtins['str']('", mangled, "');");
    }
};

Compiler.prototype.cbody = function(stmts)
{
    for (var i = 0; i < stmts.length; ++i)
        this.vstmt(stmts[i]);
};

Compiler.prototype.cprint = function(s)
{
    goog.asserts.assert(s instanceof Print);
    var dest = 'null';
    if (s.dest)
        dest = this.vexpr(s.dest);

    var n = s.values.length;
    // todo; dest disabled
    for (var i = 0; i < n; ++i)
        out('Sk.misceval.print_(', /*dest, ',',*/ "new Sk.builtins['str'](", this.vexpr(s.values[i]), ').v);');
    if (s.nl)
        out('Sk.misceval.print_(', /*dest, ',*/ '"\\n");');
};
Compiler.prototype.cmod = function(mod)
{
    //print("-----");
    //print(Sk.astDump(mod));
    var modf = this.enterScope(new Sk.builtin.str("<module>"), mod, 0);

    var entryBlock = this.newBlock('module entry');
    this.u.prefixCode = "var " + modf + "=(function($modname){";
    this.u.varDeclsCode = "var $gbl = {};" +
                         "if (Sk.retainGlobals) {" + 
						  "    if (Sk.globals) { $gbl = Sk.globals; Sk.globals = $gbl }" + 
						  "    else { Sk.globals = $gbl; }" +
						  "} else { Sk.globals = $gbl; }" +
						  "var $blk=" + entryBlock + ",$exc=[],$loc=$gbl,$err=undefined;$gbl.__name__=$modname;" ;

    // Add the try block that pops the try/except stack if one exists
    // Github Issue #38
    // Google Code Issue: 109 / 114

    // Old code:
    //this.u.switchCode = "while(true){switch($blk){";
    //this.u.suffixCode = "}}});";

    // New Code:
    this.u.switchCode = "try { while(true){try{ switch($blk){";
    this.u.suffixCode = "} }catch(err){if ($exc.length>0) { $err = err; $blk=$exc.pop(); continue; } else { throw err; }} } }catch(err){ if (err instanceof Sk.builtin.SystemExit && !Sk.throwSystemExit) { Sk.misceval.print_(err.toString() + '\\n'); return $loc; } else { throw err; } } });";

    // Note - this change may need to be adjusted for all the other instances of
    // switchCode and suffixCode in this file.  Not knowing how to test those
    // other cases I left them alone.   At least the changes to
    // setupExcept and endExcept will insure that the generated JavaScript
    // will be syntactically correct.  The worst that will happen is that when
    // code in a try block blows up, we will not know to run the except block.
    // The other problem is that we might catch something that is really an internal
    // error - it might be nice to add code in the above catch block that looked at
    // the kind of exception and only popped the stack for exceptions that are
    // from the original code rather than artifacts of some code generation or
    // exeution environment error.  We at least err on the side of exceptions
    // being revealed to the user.  drchuck - Wed Jan 23 19:20:18 EST 2013

    switch (mod.constructor)
    {
        case Module:
            this.cbody(mod.body);
            out("return $loc;");
            break;
        default:
            goog.asserts.fail("todo; unhandled case in compilerMod");
    }
    this.exitScope();

    this.result.push(this.outputAllUnits());
    return modf;
};

/**
 * @param {string} source the code
 * @param {string} filename where it came from
 * @param {string} mode one of 'exec', 'eval', or 'single'
 */
Sk.compile = function(source, filename, mode)
{
    //print("FILE:", filename);
    var cst = Sk.parse(filename, source);
    var ast = Sk.astFromParse(cst, filename);
    var st = Sk.symboltable(ast, filename);
    var c = new Compiler(filename, st, 0, source); // todo; CO_xxx
    var funcname = c.cmod(ast);
    var ret = c.result.join('');
    return {
        funcname: funcname,
        code: ret
    };
};

goog.exportSymbol("Sk.compile", Sk.compile);

Sk.resetCompiler = function()
{
    Sk.gensymcount = 0;
}

goog.exportSymbol("Sk.resetCompiler", Sk.resetCompiler);
// this is stored into sys specially, rather than created by sys
Sk.sysmodules = new Sk.builtin.dict([]);
Sk.realsyspath = undefined;

/**
 * @param {string} name to look for
 * @param {string} ext extension to use (.py or .js)
 * @param {boolean=} failok will throw if not true
 */
Sk.importSearchPathForName = function(name, ext, failok)
{
    var L = Sk.realsyspath;
    for (var it = L.tp$iter(), i = it.tp$iternext(); i !== undefined; i = it.tp$iternext())
    {
        var nameAsPath = name.replace(/\./g, "/");
        var fns = [
            i.v + "/" + nameAsPath + ext,                 // module
            i.v + "/" + nameAsPath + "/__init__" + ext    // package
                ];

        for (var j = 0; j < fns.length; ++j)
        {
            var fn = fns[j];
            //Sk.debugout("  import search, trying", fn);
            try {
                // todo; lame, this is the only way we have to test existence right now
                Sk.read(fn);
                //Sk.debugout("import search, found at", name, "type", ext, "at", fn);
                return fn;
            } catch (e) {};
        }
    }
   
    if (!failok)
        throw new Sk.builtin.ImportError("No module named " + name);
    //Sk.debugout("import search, nothing found, but failure was ok");
};

Sk.doOneTimeInitialization = function()
{
    // can't fill these out when making the type because tuple/dict aren't
    // defined yet.
    Sk.builtin.type.basesStr_ = new Sk.builtin.str("__bases__");
    Sk.builtin.type.mroStr_ = new Sk.builtin.str("__mro__");
    Sk.builtin.object['$d'] = new Sk.builtin.dict([]);
    Sk.builtin.object['$d'].mp$ass_subscript(Sk.builtin.type.basesStr_, new Sk.builtin.tuple([]));
    Sk.builtin.object['$d'].mp$ass_subscript(Sk.builtin.type.mroStr_, new Sk.builtin.tuple([Sk.builtin.object]));
};

/**
 * currently only pull once from Sk.syspath. User might want to change
 * from js or from py.
 */
Sk.importSetUpPath = function()
{
    if (!Sk.realsyspath)
    {
        var paths = [
            new Sk.builtin.str("src/builtin"),
            new Sk.builtin.str("src/lib"),
            new Sk.builtin.str(".")
        ];
        for (var i = 0; i < Sk.syspath.length; ++i)
            paths.push(new Sk.builtin.str(Sk.syspath[i]));
        Sk.realsyspath = new Sk.builtin.list(paths);

        Sk.doOneTimeInitialization();

    }
};

if (COMPILED)
{
    var js_beautify = function(x) { return x; };
}

/**
 * @param {string} name name of module to import
 * @param {boolean=} dumpJS whether to output the generated js code
 * @param {string=} modname what to call the module after it's imported if
 * it's to be renamed (i.e. __main__)
 * @param {string=} suppliedPyBody use as the body of the text for the module
 * rather than Sk.read'ing it.
 */
Sk.importModuleInternal_ = function(name, dumpJS, modname, suppliedPyBody)
{
    //dumpJS = true;
    Sk.importSetUpPath();

    // if no module name override, supplied, use default name
    if (modname === undefined) modname = name;

    var toReturn = null;
    var modNameSplit = modname.split(".");
    var parentModName;

    // if leaf is already in sys.modules, early out
    try {
        var prev = Sk.sysmodules.mp$subscript(modname);
        // if we're a dotted module, return the top level, otherwise ourselves
        if (modNameSplit.length > 1)
            return Sk.sysmodules.mp$subscript(modNameSplit[0]);
        else
            return prev;        
    } catch (x) {
        // not in sys.modules, continue
    }

    if (modNameSplit.length > 1)
    {
        // if we're a module inside a package (i.e. a.b.c), then we'll need to return the
        // top-level package ('a'). recurse upwards on our parent, importing
        // all parent packages. so, here we're importing 'a.b', which will in
        // turn import 'a', and then return 'a' eventually.
        parentModName = modNameSplit.slice(0, modNameSplit.length - 1).join(".");
        toReturn = Sk.importModuleInternal_(parentModName, dumpJS);
    }

    // otherwise:
    // - create module object
    // - add module object to sys.modules
    // - compile source to (function(){...});
    // - run module and set the module locals returned to the module __dict__
    var module = new Sk.builtin.module();
    Sk.sysmodules.mp$ass_subscript(name, module);
    var filename, co, googClosure;

    if (suppliedPyBody)
    {
        filename = name + ".py";
        co = Sk.compile(suppliedPyBody, filename, "exec");
    }
    else
    {
        // if we have it as a builtin (i.e. already in JS) module then load that.
        var builtinfn = Sk.importSearchPathForName(name, ".js", true);
        if (builtinfn)
        {
            filename = builtinfn;
            co = { funcname: "$builtinmodule", code: Sk.read(filename) };
        }
        else
        {
            filename = Sk.importSearchPathForName(name, ".py");
            co = Sk.compile(Sk.read(filename), filename, "exec");
        }
    }

    module.$js = co.code; // todo; only in DEBUG?
    var finalcode = co.code;
	if (Sk.dateSet == null || !Sk.dateSet) {
		finalcode = 'Sk.execStart = new Date();\n' + co.code;
		Sk.dateSet = true;
	}

    //if (!COMPILED)
    {
        if (dumpJS)
        {
            var withLineNumbers = function(code)
            {
                var beaut = js_beautify(co.code);
                var lines = beaut.split("\n");
                for (var i = 1; i <= lines.length; ++i)
                {
                    var width = ("" + i).length;
                    var pad = "";
                    for (var j = width; j < 5; ++j) pad += " ";
                    lines[i - 1] = "/* " + pad + i + " */ " + lines[i - 1];
                }
                return lines.join("\n");
            };
            finalcode = withLineNumbers(co.code);
            Sk.debugout(finalcode);
        }
    }

    var namestr = "new Sk.builtin.str('" + modname + "')";
    finalcode += "\n" + co.funcname + "(" + namestr + ");";

//	if (Sk.debugCode)
//		Sk.debugout(finalcode);

    var modlocs = goog.global['eval'](finalcode);
    // pass in __name__ so the module can set it (so that the code can access
    // it), but also set it after we're done so that builtins don't have to
    // remember to do it.
    if (!modlocs['__name__'])
        modlocs['__name__'] = new Sk.builtin.str(modname);

    module['$d'] = modlocs;

    if (toReturn)
    {
        // if we were a dotted name, then we want to return the top-most
        // package. we store ourselves into our parent as an attribute
        var parentModule = Sk.sysmodules.mp$subscript(parentModName);
        parentModule.tp$setattr(modNameSplit[modNameSplit.length - 1], module);
        //print("import returning parent module, modname", modname, "__name__", toReturn.tp$getattr("__name__").v);
        return toReturn;
    }

    //print("name", name, "modname", modname, "returning leaf");
    // otherwise we return the actual module that we just imported
    return module;
};

/**
 * @param {string} name the module name
 * @param {boolean=} dumpJS print out the js code after compilation for debugging
 */
Sk.importModule = function(name, dumpJS)
{
    return Sk.importModuleInternal_(name, dumpJS);
};

Sk.importMain = function(name, dumpJS)
{
	Sk.dateSet = false;
	Sk.filesLoaded = false
	//	Added to reset imports
	Sk.sysmodules = new Sk.builtin.dict([]);
	Sk.realsyspath = undefined;

    Sk.resetCompiler();

    return Sk.importModuleInternal_(name, dumpJS, "__main__");
};

Sk.importMainWithBody = function(name, dumpJS, body)
{
	Sk.dateSet = false;
	Sk.filesLoaded = false
	//	Added to reset imports
	Sk.sysmodules = new Sk.builtin.dict([]);
	Sk.realsyspath = undefined;
    
    Sk.resetCompiler();

    return Sk.importModuleInternal_(name, dumpJS, "__main__", body);
};

Sk.builtin.__import__ = function(name, globals, locals, fromlist)
{
    // Save the Sk.globals variable importModuleInternal_ may replace it when it compiles
    // a Python language module.  for some reason, __name__ gets overwritten.
    var saveSk = Sk.globals;
    var ret = Sk.importModuleInternal_(name);
    if (saveSk !== Sk.globals) {
        Sk.globals = saveSk;
    }
    if (!fromlist || fromlist.length === 0) {
        return ret;
    }
    // if there's a fromlist we want to return the actual module, not the
    // toplevel namespace
    ret = Sk.sysmodules.mp$subscript(name);
    goog.asserts.assert(ret);
    return ret;
};

Sk.importStar = function(module,loc,global) {
    // from the global scope, globals and locals can be the same.  So the loop below
    // could accidentally overwrite __name__, erasing __main__.
    var nn = global['__name__'];
    var props = Object['getOwnPropertyNames'](module['$d'])
    for(var i in props) {
        loc[props[i]] = module['$d'][props[i]];
    }
    if (global['__name__'] !== nn) {
        global['__name__'] = nn;
    }
}

goog.exportSymbol("Sk.importMain", Sk.importMain);
goog.exportSymbol("Sk.importMainWithBody", Sk.importMainWithBody);
goog.exportSymbol("Sk.builtin.__import__", Sk.builtin.__import__);
goog.exportSymbol("Sk.importStar", Sk.importStar);
/**
 * @constructor
 * @param {Sk.builtin.list=} list
 * @param {number=} length optional
 * @extends Sk.builtin.object
 */
Sk.builtin.timSort = function(list, length){
    this.list = new Sk.builtin.list(list.v);
    // When we get into galloping mode, we stay there until both runs win less
    // often than MIN_GALLOP consecutive times.  See listsort.txt for more info.
    this.MIN_GALLOP = 7;
    if (length) {
        this.listlength = length;
    }
    else {
        this.listlength = list.sq$length();
    }
};

Sk.builtin.timSort.prototype.lt = function(a, b){
	return Sk.misceval.richCompareBool(a, b, "Lt");
};

Sk.builtin.timSort.prototype.le = function(a, b){
    return !this.lt(b, a)
};

Sk.builtin.timSort.prototype.setitem = function(item ,value){
    this.list.v[item] = value;
};

/*
 # binarysort is the best method for sorting small arrays: it does
 # few compares, but can do data movement quadratic in the number of
 # elements.
 # "a" is a contiguous slice of a list, and is sorted via binary insertion.
 # This sort is stable.
 # On entry, the first "sorted" elements are already sorted.
 # Even in case of error, the output slice will be some permutation of
 # the input (nothing is lost or duplicated)
*/
Sk.builtin.timSort.prototype.binary_sort = function(a, sorted) {
    for(var start = a.base + sorted; start < a.base + a.len; start++){
        var l = a.base;
        var r = start;
        var pivot = a.getitem(r);
        // Invariants:
        // pivot >= all in [base, l).
        // pivot  < all in [r, start).
        // The second is vacuously true at the start.
        while(l < r){
            var p = l + ((r - l) >> 1);
			if (this.lt(pivot, a.getitem(p))){
                r = p;
            }
            else {
                l = p + 1;
            }
        }
        goog.asserts.assert(l === r);
        // The invariants still hold, so pivot >= all in [base, l) and
        // pivot < all in [l, start), so pivot belongs at l.  Note
        // that if there are elements equal to pivot, l points to the
        // first slot after them -- that's why this sort is stable.
        // Slide over to make room.
        for (var p = start; p > l; p--) {
            a.setitem(p, a.getitem(p-1));
        }
        a.setitem(l, pivot);
    }
};

Sk.builtin.timSort.prototype.count_run = function(a){
	/*
	# Compute the length of the run in the slice "a".
    # "A run" is the longest ascending sequence, with
    #
    #     a[0] <= a[1] <= a[2] <= ...
    #
    # or the longest descending sequence, with
    #
    #     a[0] > a[1] > a[2] > ...
    #
    # Return (run, descending) where descending is False in the former case,
    # or True in the latter.
    # For its intended use in a stable mergesort, the strictness of the defn of
    # "descending" is needed so that the caller can safely reverse a descending
    # sequence without violating stability (strict > ensures there are no equal
    # elements to get out of order).
*/
	var descending;
	if (a.len <= 1) {
		var n = a.len;
		descending = false;
	}
	else {
		var n = 2;
		if (this.lt(a.getitem(a.base + 1), a.getitem(a.base))){
			descending = true;
			for (var p = a.base + 2; p < a.base + a.len; p++){
				if (this.lt(a.getitem(p), a.getitem(p-1))){
					n++;
				}
				else {
					break;
				}
			}
		}
		else{
			descending = false;
			for (p = a.base + 2; p < a.base + a.len; p++){
	        	if (this.lt(a.getitem(p), a.getitem(p-1)))
				{
			        break;
			    }
				else {
					n++;
				}
			}
		}
	}
	return {'run': new Sk.builtin.listSlice(a.list, a.base, n), 'descending': descending};
};

Sk.builtin.timSort.prototype.sort = function (){
	/*
	# ____________________________________________________________
    # Entry point.
	*/

	var remaining = new Sk.builtin.listSlice(this.list, 0, this.listlength);
	if (remaining.len < 2){
		return;
	}

    // March over the array once, left to right, finding natural runs,
    // and extending short natural runs to minrun elements.
    this.merge_init();
    var minrun = this.merge_compute_minrun(remaining.len);
	while (remaining.len > 0){
		// Identify next run.
		var cr = this.count_run(remaining);
		if (cr.descending){
			cr.run.reverse();
		}
		// If short, extend to min(minrun, nremaining).
		if (cr.run.len < minrun){
			var sorted = cr.run.len;
            if (minrun < remaining.len){
                cr.run.len = minrun;
            }
            else {
                cr.run.len = remaining.len;
            }
			this.binary_sort(cr.run, sorted)
		}
		// Advance remaining past this run.
        remaining.advance(cr.run.len);
		// Push run onto pending-runs stack, and maybe merge.
        this.pending.push(cr.run);
        this.merge_collapse();
  	}
	goog.asserts.assert(remaining.base == this.listlength);

  	this.merge_force_collapse();
  	goog.asserts.assert(this.pending.length == 1);
	goog.asserts.assert(this.pending[0].base == 0);
	goog.asserts.assert(this.pending[0].len == this.listlength);
};

/*
	# Locate the proper position of key in a sorted vector; if the vector
	# contains an element equal to key, return the position immediately to the
	# left of the leftmost equal element -- or to the right of the rightmost
	# equal element if the flag "rightmost" is set.
	#
	# "hint" is an index at which to begin the search, 0 <= hint < a.len.
	# The closer hint is to the final result, the faster this runs.
	#
	# The return value is the index 0 <= k <= a.len such that
	#
	#     a[k-1] < key <= a[k]      (if rightmost is False)
	#     a[k-1] <= key < a[k]      (if rightmost is True)
	#
	# as long as the indices are in bound.  IOW, key belongs at index k;
	# or, IOW, the first k elements of a should precede key, and the last
	# n-k should follow key.
*/
Sk.builtin.timSort.prototype.gallop = function(key, a, hint, rightmost){
    goog.asserts.assert(0 <= hint && hint < a.len);
	var lower;
	var self = this;
 	if (rightmost) {
		lower = function (a,b) { return self.le(a,b); } // search for the largest k for which a[k] <= key
	}
	else {
		lower = function (a,b) { return self.lt(a,b); } // search for the largest k for which a[k] < key
	}
	var p = a.base + hint;
	var lastofs = 0;
	var ofs = 1;
    var maxofs;
	if (lower(a.getitem(p), key)) {
		// a[hint] < key -- gallop right, until
	    // a[hint + lastofs] < key <= a[hint + ofs]

	    maxofs = a.len - hint // a[a.len-1] is highest
	    while (ofs < maxofs){
	    	if (lower(a.getitem(p + ofs), key)) {
	        	lastofs = ofs
	        	try {
	            	ofs = (ofs << 1) + 1;
                } catch (err){
					ofs = maxofs
				}
			}
	        else {
	        	// key <= a[hint + ofs]
	            break;
			}
        }
        if (ofs > maxofs) {
            ofs = maxofs;
        }
        // Translate back to offsets relative to a.
        lastofs += hint;
        ofs += hint;
	}
	else {
		// key <= a[hint] -- gallop left, until
        // a[hint - ofs] < key <= a[hint - lastofs]
        maxofs = hint + 1   // a[0] is lowest
        while (ofs < maxofs) {
            if (lower(a.getitem(p - ofs), key)) {
                break;
			}
            else {
                // key <= a[hint - ofs]
                lastofs = ofs
                try {
                    ofs = (ofs << 1) + 1;
                } catch(err) {
					ofs = maxofs;
				}
			}
		}
        if (ofs > maxofs){
            ofs = maxofs
		}
        // Translate back to positive offsets relative to a.
        var hintminofs = hint-ofs;
		var hintminlastofs = hint-lastofs;
        lastofs = hintminofs;
        ofs = hintminlastofs;
	}
	goog.asserts.assert( -1 <= lastofs < ofs <= a.len);

    // Now a[lastofs] < key <= a[ofs], so key belongs somewhere to the
    // right of lastofs but no farther right than ofs.  Do a binary
    // search, with invariant a[lastofs-1] < key <= a[ofs].

    lastofs += 1;
    while (lastofs < ofs){
        var m = lastofs + ((ofs - lastofs) >> 1);
        if (lower(a.getitem(a.base + m), key)){
            lastofs = m+1;   // a[m] < key
        }
		else{
            ofs = m;         // key <= a[m]
		}
	}
    goog.asserts.assert(lastofs == ofs);         // so a[ofs-1] < key <= a[ofs]
    return ofs;
};

// ____________________________________________________________

Sk.builtin.timSort.prototype.merge_init = function(){
    // This controls when we get *into* galloping mode.  It's initialized
    // to MIN_GALLOP.  merge_lo and merge_hi tend to nudge it higher for
    // random data, and lower for highly structured data.
    this.min_gallop = this.MIN_GALLOP

    // A stack of n pending runs yet to be merged.  Run #i starts at
    // address pending[i].base and extends for pending[i].len elements.
    // It's always true (so long as the indices are in bounds) that
    //
    //     pending[i].base + pending[i].len == pending[i+1].base
    //
    // so we could cut the storage for this, but it's a minor amount,
    // and keeping all the info explicit simplifies the code.
    this.pending = [];
};

// Merge the slice "a" with the slice "b" in a stable way, in-place.
// a.len <= b.len.  See listsort.txt for more info.
// a.len and b.len must be > 0, and a.base + a.len == b.base.
// Must also have that b.list[b.base] < a.list[a.base], that
// a.list[a.base+a.len-1] belongs at the end of the merge, and should have

Sk.builtin.timSort.prototype.merge_lo= function(a, b) {
    goog.asserts.assert(a.len > 0 && b.len > 0 && a.base + a.len == b.base);
    var min_gallop = this.min_gallop;
    var dest = a.base;
    a = a.copyitems();

    // Invariant: elements in "a" are waiting to be reinserted into the list
    // at "dest".  They should be merged with the elements of "b".
    // b.base == dest + a.len.
    // We use a finally block to ensure that the elements remaining in
    // the copy "a" are reinserted back into this.list in all cases.
    try {
        this.setitem(dest, b.popleft());

        dest++;
        if (a.len == 1 || b.len == 0){ return; }

        var acount, bcount;
        while (true){
            acount = 0;   // number of times A won in a row
            bcount = 0;   // number of times B won in a row

            // Do the straightforward thing until (if ever) one run
            // appears to win consistently.
            while (true){
                if (this.lt(b.getitem(b.base), a.getitem(a.base))){
                    this.setitem(dest, b.popleft());
                    dest ++;
                    if (b.len == 0){ return; }
                    bcount ++;
                    acount = 0;
                    if (bcount >= min_gallop){ break; }
                }
                else {
                    this.setitem(dest, a.popleft());
                    dest ++;
                    if (a.len == 1){ return; }
                    acount ++;
                    bcount = 0;
                    if (acount >= min_gallop){
                        break;
                    }
                }
            }

            // One run is winning so consistently that galloping may
            // be a huge win.  So try that, and continue galloping until
            // (if ever) neither run appears to be winning consistently
            // anymore.
            min_gallop += 1;

            while (true) {
                min_gallop -= min_gallop > 1;
                this.min_gallop = min_gallop;
                acount = this.gallop(b.getitem(b.base), a, 0, true);
                for (var p = a.base; p < a.base + acount; p++) {
                    this.setitem(dest, a.getitem(p));
                    dest++;
                }

                a.advance(acount);

                if (a.len <= 1) { return; }

                this.setitem(dest, b.popleft());
                dest ++;

                // a.len==0 is impossible now if the comparison
                // function is consistent, but we can't assume
                // that it is.
                if (b.len == 0) { return; }

                bcount = this.gallop(a.getitem(a.base), b, 0, false);

                for (var p = b.base; p < b.base + bcount; p++) {
                    this.setitem(dest, b.getitem(p))
                    dest ++;
                }

                b.advance(bcount)
                if (b.len == 0) { return; }
                this.setitem(dest, a.popleft());
                dest++;

                if (a.len == 1) { return; }

                if (acount < this.MIN_GALLOP && bcount < this.MIN_GALLOP) { break; }

                min_gallop++;  // penalize it for leaving galloping mode
                this.min_gallop = min_gallop;
            }
        }
    }
    finally{
        // The last element of a belongs at the end of the merge, so we copy
        // the remaining elements of b before the remaining elements of a.
        goog.asserts.assert(a.len >= 0 && b.len >= 0);
        for (var p = b.base; p < b.base + b.len; p++) {
            this.setitem(dest, b.getitem(p))
            dest ++;
        }
        for (var p = a.base; p < a.base + a.len; p++){
            this.setitem(dest, a.getitem(p))
            dest ++;
        }
    }
}

Sk.builtin.timSort.prototype.merge_hi= function(a, b) {
    goog.asserts.assert(a.len > 0 && b.len > 0 && a.base + a.len == b.base);
    var min_gallop = this.min_gallop;
    var dest = b.base + b.len;
    b = b.copyitems();

    // Invariant: elements in "a" are waiting to be reinserted into the list
    // at "dest".  They should be merged with the elements of "b".
    // b.base == dest + a.len.
    // We use a finally block to ensure that the elements remaining in
    // the copy "a" are reinserted back into this.list in all cases.
    try {
        dest--;
        this.setitem(dest, a.popright());

        if (a.len == 0 || b.len == 1){ return; }

        var acount, bcount, nexta, nextb;
        while (true){
            acount = 0;   // number of times A won in a row
            bcount = 0;   // number of times B won in a row

            // Do the straightforward thing until (if ever) one run
            // appears to win consistently.
            while (true){
                nexta = a.getitem(a.base + a.len - 1);
                nextb = b.getitem(b.base + b.len - 1);
                if (this.lt(nextb, nexta)){
                    dest--;
                    this.setitem(dest, nexta);
                    a.len--;
                    if (a.len == 0){ return; }
                    acount ++;
                    bcount = 0;
                    if (acount >= min_gallop){ break; }
                }
                else {
                    dest--;
                    this.setitem(dest, nextb);
                    b.len--;
                    if (b.len == 1){ return; }
                    bcount ++;
                    acount = 0;
                    if (bcount >= min_gallop){ break; }
                }
            }

            // One run is winning so consistently that galloping may
            // be a huge win.  So try that, and continue galloping until
            // (if ever) neither run appears to be winning consistently
            // anymore.
            min_gallop += 1;

            while (true) {
                min_gallop -= min_gallop > 1;
                this.min_gallop = min_gallop;
                nextb = b.getitem(b.base + b.len - 1);
                var k = this.gallop(nextb, a, a.len - 1, true);
                acount = a.len - k;
                for (var p = a.base + a.len - 1; p > a.base + k - 1; p--) {
                    dest--;
                    this.setitem(dest, a.getitem(p));
                }
                a.len -= acount;
                if (a.len == 0) { return; }

                dest--;
                this.setitem(dest, b.popright());
                if (b.len == 1) { return; }

                nexta = a.getitem(a.base + a.len - 1);
                k = this.gallop(nexta, b, b.len - 1, false);
                bcount = b.len - k;
                for (var p = b.base + b.len - 1; p > b.base + k - 1; p--) {
                    dest --;
                    this.setitem(dest, b.getitem(p));
                }

                b.len -= bcount;

                // b.len==0 is impossible now if the comparison
                // function is consistent, but we can't assume
                // that it is.
                if (b.len <= 1) { return; }
                dest--;
                this.setitem(dest, a.popright());
                if (a.len == 0) { return; }

                if (acount < this.MIN_GALLOP && bcount < this.MIN_GALLOP) { break; }

                min_gallop++;  // penalize it for leaving galloping mode
                this.min_gallop = min_gallop;
            }
        }
    }
    finally{
        // The last element of a belongs at the end of the merge, so we copy
        // the remaining elements of b before the remaining elements of a.
        goog.asserts.assert(a.len >= 0 && b.len >= 0);
        for (var p = a.base + a.len - 1; p > a.base - 1; p--){
            dest --;
            this.setitem(dest, a.getitem(p))
        }
        for (var p = b.base + b.len - 1; p > b.base - 1; p--) {
            dest--;
            this.setitem(dest, b.getitem(p))
        }
    }
}

// Merge the two runs at stack indices i and i+1.

Sk.builtin.timSort.prototype.merge_at = function(i){
	if (i < 0) {
		i = this.pending.length + i;
	}

    var a = this.pending[i];
    var b = this.pending[i+1];
    goog.asserts.assert(a.len > 0 && b.len > 0);
    goog.asserts.assert(a.base + a.len == b.base);

    // Record the length of the combined runs and remove the run b
    this.pending[i] = new Sk.builtin.listSlice(this.list, a.base, a.len + b.len);
    this.pending.splice(i + 1, 1)

    // Where does b start in a?  Elements in a before that can be
    // ignored (already in place).
    var k = this.gallop(b.getitem(b.base), a, 0, true);
    a.advance(k);
    if (a.len == 0) { return; }

    // Where does a end in b?  Elements in b after that can be
    // ignored (already in place).
    b.len = this.gallop(a.getitem(a.base+a.len-1), b, b.len-1, false)
    if (b.len == 0) { return; }

    // Merge what remains of the runs.  The direction is chosen to
    // minimize the temporary storage needed.
    if (a.len <= b.len) {
        this.merge_lo(a, b);
    }
    else{
        this.merge_hi(a, b);
    }
}

// Examine the stack of runs waiting to be merged, merging adjacent runs
// until the stack invariants are re-established:
//
// 1. len[-3] > len[-2] + len[-1]
// 2. len[-2] > len[-1]
//
// See listsort.txt for more info.
Sk.builtin.timSort.prototype.merge_collapse = function() {
    var p = this.pending;
    while (p.length > 1)
    {
        if (p.length >= 3 && p[p.length-3].len <= p[p.length-2].len + p[p.length-1].len) {
            if (p[p.length-3].len < p[p.length-1].len) {
                this.merge_at(-3);
            }
            else{
                this.merge_at(-2);
            }
        } else if(p[p.length-2].len <= p[p.length-1].len) {
            this.merge_at(-2);
        }
        else{
            break;
        }
    }
}

// Regardless of invariants, merge all runs on the stack until only one
// remains.  This is used at the end of the mergesort.

Sk.builtin.timSort.prototype.merge_force_collapse = function(){
    var p = this.pending
    while (p.length > 1 ){
        if (p.length >= 3 && p[p.length-3].len < p[p.length-1].len) {
            this.merge_at(-3);
        }
        else{
            this.merge_at(-2);
        }
    }
}
// Compute a good value for the minimum run length; natural runs shorter
// than this are boosted artificially via binary insertion.
//
// If n < 64, return n (it's too small to bother with fancy stuff).
// Else if n is an exact power of 2, return 32.
// Else return an int k, 32 <= k <= 64, such that n/k is close to, but
// strictly less than, an exact power of 2.
//
// See listsort.txt for more info.

Sk.builtin.timSort.prototype.merge_compute_minrun = function (n){
    var r = 0    // becomes 1 if any 1 bits are shifted off
    while (n >= 64){
        r = r | n & 1;
        n >>= 1;
    }
    return n + r;
};

//ListSlice
/**
 * @constructor
 * @param {Sk.builtin.list=} list
 * @param {number=} base
 * @param {number=} len
 * @extends Sk.builtin.object
 */
Sk.builtin.listSlice = function(list, base, len) {
    this.list = list;
    this.base = base;
    this.len = len;
};

Sk.builtin.listSlice.prototype.copyitems = function (){
    //Make a copy of the slice of the original list
    var start = this.base;
    var stop = this.base + this.len;
    goog.asserts.assert(0 <= start <= stop);
    return new Sk.builtin.listSlice(new Sk.builtin.list(this.list.v.slice(start, stop)), 0, this.len);
};

Sk.builtin.listSlice.prototype.advance = function (n){
    this.base += n;
	this.len -= n;
	goog.asserts.assert(this.base <= this.list.sq$length());
};

Sk.builtin.listSlice.prototype.getitem = function (item){
    return this.list.v[item];
};

Sk.builtin.listSlice.prototype.setitem = function (item, value){
    this.list.v[item] = value;
};

Sk.builtin.listSlice.prototype.popleft = function (){
    var result = this.list.v[this.base];
    this.base++;
    this.len--;
    return result;
};

Sk.builtin.listSlice.prototype.popright = function (){
    this.len--;
    return this.list.v[this.base + this.len];
};

Sk.builtin.listSlice.prototype.reverse = function (){
    // Reverse the slice in-place.
    var list = this.list;
    var lo = this.base;
    var hi = lo + this.len - 1;
    while (lo < hi){
        var list_hi = list.v[hi];
        var list_lo = list.v[lo];
        list.v[lo] = list_hi;
        list.v[hi] = list_lo;
        lo++;
        hi--;
    }
};

goog.exportSymbol("Sk.builtin.listSlice", Sk.builtin.listSlice);
goog.exportSymbol("Sk.builtin.timSort", Sk.builtin.timSort);// Note: the hacky names on int, long, float have to correspond with the
// uniquization that the compiler does for words that are reserved in
// Javascript. This is a bit hokey.
Sk.builtins = {
'range': Sk.builtin.range,
'round': Sk.builtin.round,
'len': Sk.builtin.len,
'min': Sk.builtin.min,
'max': Sk.builtin.max,
'sum': Sk.builtin.sum,
'zip': Sk.builtin.zip,
'abs': Sk.builtin.abs,
'fabs': Sk.builtin.abs,	//	Added by RNL
'ord': Sk.builtin.ord,
'chr': Sk.builtin.chr,
'hex': Sk.builtin.hex,
'oct': Sk.builtin.oct,
'bin': Sk.builtin.bin,
'dir': Sk.builtin.dir,
'repr': Sk.builtin.repr,
'open': Sk.builtin.open,
'isinstance': Sk.builtin.isinstance,
'hash': Sk.builtin.hash,
'getattr': Sk.builtin.getattr,
'float_$rw$': Sk.builtin.float_,
'int_$rw$': Sk.builtin.int_,
'hasattr': Sk.builtin.hasattr,

'map' : Sk.builtin.map,
'filter' : Sk.builtin.filter,
'reduce' : Sk.builtin.reduce,
'sorted' : Sk.builtin.sorted,

'bool': Sk.builtin.bool,
'any': Sk.builtin.any,
'all': Sk.builtin.all,
'enumerate': Sk.builtin.enumerate,

'AttributeError': Sk.builtin.AttributeError,
'ValueError': Sk.builtin.ValueError,
'Exception' : Sk.builtin.Exception,
'ZeroDivisionError' : Sk.builtin.ZeroDivisionError,
'AssertionError' : Sk.builtin.AssertionError,
'ImportError' : Sk.builtin.ImportError,
'IndentationError' : Sk.builtin.IndentationError,
'IndexError' : Sk.builtin.IndexError,
'KeyError' : Sk.builtin.KeyError,
'TypeError' : Sk.builtin.TypeError,
'NameError' : Sk.builtin.NameError,
'IOError' : Sk.builtin.IOError,
'NotImplementedError' : Sk.builtin.NotImplementedError,
'SystemExit': Sk.builtin.SystemExit,
'OverflowError' : Sk.builtin.OverflowError,
'OperationError': Sk.builtin.OperationError,

'dict': Sk.builtin.dict,
'file': Sk.builtin.file,
'function': Sk.builtin.func,
'generator': Sk.builtin.generator,
'list': Sk.builtin.list,
'long_$rw$': Sk.builtin.lng,
'method': Sk.builtin.method,
'object': Sk.builtin.object,
'slice': Sk.builtin.slice,
'str': Sk.builtin.str,
'set': Sk.builtin.set,
'tuple': Sk.builtin.tuple,
'type': Sk.builtin.type,
'input': Sk.builtin.input,
'raw_input': Sk.builtin.raw_input,
/*'read': Sk.builtin.read,*/
'jseval': Sk.builtin.jseval,
'jsmillis': Sk.builtin.jsmillis,
'quit': Sk.builtin.quit,
'exit': Sk.builtin.quit,

// Functions below are not implemented
'bytearray': Sk.builtin.bytearray,
'callable': Sk.builtin.callable,
'complex' : Sk.builtin.complex,
'delattr' : Sk.builtin.delattr,
'divmod' : Sk.builtin.divmod,
'eval_$rn$' : Sk.builtin.eval_,
'execfile' : Sk.builtin.execfile,
'format' : Sk.builtin.format,
'frozenset' : Sk.builtin.frozenset,
'globals' : Sk.builtin.globals,
'help' : Sk.builtin.help,
'issubclass' : Sk.builtin.issubclass,
'iter': Sk.builtin.iter,
'locals' : Sk.builtin.locals,
'memoryview' : Sk.builtin.memoryview,
'next' : Sk.builtin.next_,
'pow' : Sk.builtin.pow,
'property' : Sk.builtin.property,
'reload' : Sk.builtin.reload,
'reversed' : Sk.builtin.reversed,
'super': Sk.builtin.superbi,
'unichr' : Sk.builtin.unichr,
'vars' : Sk.builtin.vars,
'xrange' : Sk.builtin.xrange,
'apply_$rn$' : Sk.builtin.apply_,
'buffer' : Sk.builtin.buffer,
'coerce' : Sk.builtin.coerce,
'intern' : Sk.builtin.intern
};
goog.exportSymbol("Sk.builtins", Sk.builtins);
Sk.interop = {}

goog.exportSymbol("Sk.interop", Sk.interop);
