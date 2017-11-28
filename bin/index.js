"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isType = require('is_js');
/**
 * Represents a single configuration where every stored key must have a defined type. Type determination is decided by is.js or a custom function which is provided the is.js object.
 * @see is_js
 */
var Configuration = /** @class */ (function () {
    function Configuration() {
        this._conf = {};
        this._type = {};
    }
    /**
     * baseline the configuration
     */
    Configuration.prototype.clear = function () {
        this._type = {};
        return this.empty();
    };
    /**
     * clear the configuration data, but keep the definition
     */
    Configuration.prototype.empty = function () {
        this._conf = {};
        return this;
    };
    /**
     * Does a path store a value in the configuration
     * @param path a query in to the configuration (. to separate objects, [] to search arrays)
     * @return true if a value exists (not undefined) in the configuration
     */
    Configuration.prototype.has = function (path) {
        return this.read(path) !== undefined;
    };
    /**
     *
     * @param path a query in to the configuration (. to separate objects, [] to search arrays)
     */
    Configuration.prototype.read = function (path) {
        return this._getPath(this._conf, this._steps(this.__parsePath(path)));
    };
    /**
     *
     * @param path a query in to the configuration (. to separate objects, [] to search arrays)
     * @param value
     */
    Configuration.prototype.write = function (path, value) {
        var issues = this.__trackIssues();
        this.__traverse(path, value, "write", issues);
        return this.__reportIssues(issues);
    };
    /**
     *
     * @param path a query in to the configuration (. to separate objects, [*] to define arrays)
     * @param type
     */
    Configuration.prototype.define = function (path, type) {
        var issues = this.__trackIssues();
        this.__traverse(path, type, "define", issues);
        return this.__reportIssues(issues);
    };
    /**
     * Call write for every leaf in the path
     * @param path the path to traverse to
     * @param v the value to write/define
     * @param method either `define` or `write` which both traverse configuration trees
     * @param issues all issues accrued during traversal
     */
    Configuration.prototype.__traverse = function (path, v, method, issues) {
        var isNestingObject = this.__isNestingObject(v);
        if (isNestingObject) {
            for (var k in v) {
                var _path = (isType.array(v)) ? path + "[" + k + "]" : path + "." + k;
                this.__traverse(_path, v[k], method, issues);
            }
        }
        else {
            var _this = this;
            _this["_" + method](path, v, issues);
        }
    };
    /**
     * Write a single value in to an leaf-path
     */
    Configuration.prototype._write = function (path, value, issues) {
        var typeSteps = this._steps(this.__parsePathGlobIndex(path));
        var typeInflectionPoint = typeSteps.pop();
        var typeParent = this._getPath(this._type, typeSteps);
        if (isType.object(value) || isType.array(value)) {
            return this;
        }
        if (!typeParent) {
            issues.push(typeSteps.join('.') + " is invalid.");
            return this;
        }
        var typeDefinition = typeParent[typeInflectionPoint];
        if (!typeDefinition) {
            issues.push(path + " is invalid at " + JSON.stringify(typeInflectionPoint) + ".");
            return this;
        }
        if (!this._isPermitted(typeDefinition, value)) {
            issues.push(path + " matches an invalid type at " + JSON.stringify(typeDefinition) + ".");
            return this;
        }
        var steps = this._steps(this.__parsePath(path));
        var inflectionPoint = steps.pop();
        var valueParent = this._createPath(this._conf, steps);
        valueParent[inflectionPoint] = value;
        return this;
    };
    /**
     * Write a type definition in to an leaf-path
     */
    Configuration.prototype._define = function (path, type, issues) {
        var steps = this._steps(this.__parsePathGlobIndex(path));
        var inflectionPoint = steps.pop();
        var typeParent = this._createPath(this._type, steps);
        typeParent[inflectionPoint] = type;
        return this;
    };
    /**
     *
     * @param _type a type function or is.js method
     * @param value the value to type-check
     * @return true if type-check permits the value
     */
    Configuration.prototype._isPermitted = function (_type, value) {
        if (typeof _type === 'function') {
            return _type(value, isType, this);
        }
        else if (typeof _type === 'string') {
            return isType[_type].call(isType, value);
        }
        else {
            return false;
        }
    };
    /**
     * Find the leaf element in the tree
     * @param root the top-level object to traverse
     * @param steps the path as an array of steps
     */
    Configuration.prototype._getPath = function (root, steps) {
        var ptr = root;
        if (!ptr) {
            return undefined;
        }
        for (var index in steps) {
            var step = steps[index];
            var isNumeric = this.__isNumericStep(step);
            if (isNumeric) {
                step = step.substr(0, step.length - 1);
            }
            if (!ptr[step]) {
                return undefined;
            }
            ptr = ptr[step];
        }
        return ptr;
    };
    /**
     * Create a leaf element in the tree
     * @param root the top-level object to traverse
     * @param steps the path as an array of steps
     */
    Configuration.prototype._createPath = function (root, steps) {
        var ptr = root;
        if (!ptr) {
            return undefined;
        }
        for (var index in steps) {
            var step = steps[index];
            var isNumeric = this.__isNumericStep(step);
            if (isNumeric) {
                step = step.substr(0, step.length - 1);
            }
            if (!ptr[step]) {
                ptr[step] = (isNumeric) ? [] : {};
            }
            ptr = ptr[step];
        }
        return ptr;
    };
    /**
     * Start the issues list for a write or define
     */
    Configuration.prototype.__trackIssues = function () {
        return [];
    };
    /**
     * @return resolved if there are no issues, otherwise return the issues in a catch
     */
    Configuration.prototype.__reportIssues = function (issues) {
        return new Promise(function (resolve, reject) {
            if (issues.length > 0) {
                reject(issues);
            }
            else {
                resolve();
            }
        });
    };
    /**
     * @param path a query in to the configuration (. for object keys, !.<index> for array index)
     * @return an array of paths
     */
    Configuration.prototype._steps = function (path) {
        return path.split(".");
    };
    /**
     * @param path a query in to the configuration (array indices are converted to an internal object/array notation, so `[V]` => `!.V` so the `!`)
     */
    Configuration.prototype.__parsePath = function (path) {
        return path.replace("[", "!.").replace("]", "");
    };
    /**
     * @param path a query in to the configuration (array indices are converted to `[0]` so we store array rules at index 0 and apply to all elements). This allows us to represent arrays in the conf and type trees the same (as an array) which keeps the traversal code the same
     */
    Configuration.prototype.__parsePathGlobIndex = function (path) {
        var findBrackets = /\[([^\]]+)\]/g;
        var zeroIndexPath = path.replace(findBrackets, "[0]");
        return this.__parsePath(zeroIndexPath);
    };
    /**
     * @param step a single descending path in the tree
     * @return true if the path is an array index
     */
    Configuration.prototype.__isNumericStep = function (step) {
        return !!step && step[step.length - 1] === '!';
    };
    /**
     * @param o is value an object or a nested object which defines the path further
     *
     * ```
     * write('a.b', { c: { value: 1 } }) IS_IDENTICAL_TO write('a.b.c.value', 1)
     * ```
     */
    Configuration.prototype.__isNestingObject = function (o) {
        return isType.array(o) || (isType.object(o) && o.constructor.name === "Object");
    };
    return Configuration;
}());
exports.Configuration = Configuration;
//# sourceMappingURL=index.js.map