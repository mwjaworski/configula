const isType: Is = require('is_js');

type t_conf = Object;
type t_conf_object = any;
type is_fn = (v: any) => boolean;
type is_fn_custom = (v: any, is: Is, configuration: Configula) => boolean;

/**
 * Represents a single configuration where every stored key must have a defined type. Type determination is decided by is.js or a custom function which is provided the is.js object.
 * @see is_js
 */
export class Configula {

  protected _conf: t_conf_object = {};
  protected _type: t_conf_object = {};

  private __issues: string[] = [];

  /**
   * baseline the configuration
   */
  clear() {
    this._type = {};
    return this.empty();
  }

  /**
   * clear the configuration data, but keep the definition
   */
  empty() {
    this._conf = {};
    return this;
  }

  /**
   * Does a path store a value in the configuration
   * @param path a query in to the configuration (. to separate objects, [] to search arrays)
   * @return true if a value exists (not undefined) in the configuration
   */
  has(path: string): boolean {
    return this.read(path) !== undefined;
  }

  /**
   * @param path a query in to the configuration (. to separate objects, [] to search arrays)
   * @return a cloned portion of the configuration
   * @see Configula#read
   */
  clone(path?: string) {
    return Configula.__clone(this.read(path));
  }

  /**
   * @param o any object
   * @returns a deep clone or the original object, if the deep clone fails
   */
  private static __clone(o: any) {
    try {
      return JSON.parse(JSON.stringify(o));
    }
    catch (e) {
      return o;
    }
  }

  /**
   * @param path a query in to the configuration (. to separate objects, [] to search arrays)
   * @return a portion of the configuration
   */
  read(path?: string) {
    return (path !== undefined)
      ? this._getPath(this._conf, this._steps(this.__parsePath(path)))
      : this._conf;
  }

  /**
   *
   * @param path a query in to the configuration (. to separate objects, [] to search arrays)
   * @param value
   */
  write(path: string, value: t_conf | any) {
    return this.__traverse(path, value, `write`);
  }

  /**
   *
   * @param path a query in to the configuration (. to separate objects, [*] to define arrays)
   * @param type
   */
  define(path: string, type: any | string | is_fn_custom) {
    return this.__traverse(path, type, `define`);
  }

  /**
   * Call write for every leaf in the path
   * @param path the path to traverse to
   * @param v the value to write/define
   * @param method either `define` or `write` which both traverse configuration trees
   * @param issues all issues accrued during traversal
   */
  private __traverse(path: string, v: any, method: string): this {
    const isNestingObject = this.__isNestingObject(v);

    if (isNestingObject) {
      for (const k in v) {
        const _path = (!path) ? `${k}` : ((isType.array(v)) ? `${path}[${k}]` : `${path}.${k}`);

        this.__traverse(_path, v[k], method);
      }
    }
    else {
      const _this = this as any;

      _this[`_${method}`](path, v);
    }

    return this;
  }

  /**
   * Write a single value in to an leaf-path
   */
  protected _write(path: string, value: t_conf | string): this {
    const typeSteps = this._steps(this.__parsePathGlobIndex(path));
    const typeInflectionPoint = typeSteps.pop() as string;
    const typeParent = this._getPath(this._type, typeSteps);

    if (isType.undefined(value)) {
      this.__issues.push(`${typeSteps.join('.')} will not accept undefined as a value.`);
      return this;
    }
    else if (this.__isNestingObject(value)) {
      this.__issues.push(`${typeSteps.join('.')} should store simple values.`);
      return this;
    }

    if (!typeParent) {
      this.__issues.push(`${typeSteps.join('.')} is invalid.`);
      return this;
    }

    const typeDefinition: string = typeParent[typeInflectionPoint];

    if (!typeDefinition) {
      this.__issues.push(`${path} is invalid at ${JSON.stringify(typeInflectionPoint)}.`);
      return this;
    }

    if (!this._isPermitted(typeDefinition, value)) {
      this.__issues.push(`${path} matches an invalid type at ${JSON.stringify(typeDefinition)}.`);
      return this;
    }

    const steps = this._steps(this.__parsePath(path));
    const inflectionPoint = steps.pop() as string;
    const valueParent = this._createPath(this._conf, steps);

    valueParent[inflectionPoint] = value;
    return this;
  }

  /**
   * Write a type definition in to an leaf-path
   */
  protected _define(path: string, type: any | string | is_fn_custom, issues: string[]): this {
    const steps = this._steps(this.__parsePathGlobIndex(path));
    const inflectionPoint = steps.pop() as string;
    const typeParent = this._createPath(this._type, steps);

    typeParent[inflectionPoint] = type;
    return this;
  }

  /**
   *
   * @param _type a type function or is.js method
   * @param value the value to type-check
   * @return true if type-check permits the value
   */
  protected _isPermitted(_type: is_fn_custom | string, value: any): boolean {
    if (typeof _type === 'function') {
      return _type(value, isType, this);
    }
    else if (typeof _type === 'string') {
      return ((isType as any)[_type] as is_fn).call(isType, value);
    }
    else {
      return false;
    }
  }

  /**
   * Find the leaf element in the tree
   * @param root the top-level object to traverse
   * @param steps the path as an array of steps
   */
  protected _getPath(root: t_conf_object, steps: string[]) {
    let ptr = root;

    if (!ptr) {
      return undefined;
    }

    for (const index in steps) {
      let step = steps[index];
      const isNumeric = this.__isNumericStep(step);

      if (isNumeric) {
        step = step.substr(0, step.length - 1);
      }

      if (!ptr[step]) {
        return undefined;
      }

      ptr = ptr[step];
    }

    return ptr;
  }

  /**
   * Create a leaf element in the tree
   * @param root the top-level object to traverse
   * @param steps the path as an array of steps
   */
  protected _createPath(root: t_conf_object, steps: string[]) {
    let ptr = root;

    if (!ptr) {
      return undefined;
    }

    for (const index in steps) {
      let step = steps[index];
      const isNumeric = this.__isNumericStep(step);

      if (isNumeric) {
        step = step.substr(0, step.length - 1);
      }

      if (!ptr[step]) {
        ptr[step] = (isNumeric) ? [] : {};
      }

      ptr = ptr[step];
    }

    return ptr;
  }

  isOk(): boolean {
    return this.__issues.length <= 0;
  }

  /**
   * @return resolved if there are no issues, otherwise return the issues in a catch
   */
  issues(): Promise<string[]> {
    const issues = this.__cloneIssues();

    this.__clearIssues();
    return new Promise(function (resolve, reject) {
      if (issues.length > 0) {
        reject(issues);
      }
      else {
        resolve();
      }
    });
  }

  /**
   * Start the issues list for a write or define
   */
  private __cloneIssues(): string[] {
    return this.__issues.slice(0);
  }

  /**
   * Start the issues list for a write or define
   */
  private __clearIssues(): this {
    this.__issues = [];
    return this;
  }

  /**
   * @param path a query in to the configuration (. for object keys, !.<index> for array index)
   * @return an array of paths
   */
  protected _steps(path: string): string[] {
    return path.split(`.`);
  }

  /**
   * @param path a query in to the configuration (array indices are converted to an internal object/array notation, so `[V]` => `!.V` so the `!`)
   */
  private __parsePath(path: string): string {
    return path.replace(`[`, `!.`).replace(`]`, ``);
  }

  /**
   * @param path a query in to the configuration (array indices are converted to `[0]` so we store array rules at index 0 and apply to all elements). This allows us to represent arrays in the conf and type trees the same (as an array) which keeps the traversal code the same
   */
  private __parsePathGlobIndex(path: string): string {
    const findBrackets = /\[([^\]]+)\]/g;
    const zeroIndexPath = path.replace(findBrackets, `[0]`);

    return this.__parsePath(zeroIndexPath);
  }

  /**
   * @param step a single descending path in the tree
   * @return true if the path is an array index
   */
  private __isNumericStep(step: string): boolean {
    return !!step && step[step.length - 1] === '!';
  }

  /**
   * @param o is value an object or a nested object which defines the path further
   *
   * ```
   * write('a.b', { c: { value: 1 } }) IS_IDENTICAL_TO write('a.b.c.value', 1)
   * ```
   */
  private __isNestingObject(o: any): boolean {
    return isType.array(o) || (isType.object(o) && o.constructor.name === `Object`);
  }

}
