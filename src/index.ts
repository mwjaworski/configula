import { tst, TSType } from './ts_type';

type t_conf = Object;
type t_conf_object = any;
type type_fn = (v: any) => boolean;
type type_fn_custom = (v: any, tst: TSType, configuration: Configula) => boolean;

export interface IConfigula {
  /**
   * baseline the configuration
   */
  clear(): void;
  /**
   * clear the configuration data, but keep the definition
   */
  empty(): void;
  /**
   * @return true if there are issues
   */
  isOk(): boolean;
  /**
   * @return resolved if there are no issues, otherwise return the issues in a catch
   */
  issues(): Promise<string[]>;
  /**
   * Does a path store a value in the configuration
   * @param path a query in to the configuration (. to separate objects, [] to search arrays)
   * @return true if a value exists (not undefined) in the configuration
   */
  has(path: string): boolean;
  /**
   * @param path a query in to the configuration (. to separate objects, [] to search arrays)
   * @return a cloned portion of the configuration
   * @see Configula#read
   */
  clone(path?: string): t_conf_object;
  /**
   * @param path a query in to the configuration (. to separate objects, [] to search arrays)
   * @return a portion of the configuration
   */
  read(path?: string): t_conf_object;
  /**
   *
   * @param path a query in to the configuration (. to separate objects, [] to search arrays)
   * @param value
   */
  write(path: string, value: t_conf | any): this;
  /**
   *
   * @param path a query in to the configuration (. to separate objects, [*] to define arrays)
   * @param type
   */
  define(path: string, type: any | string | type_fn_custom): this;
}

/**
 * Represents a single configuration where every stored key must have a defined type.
 *
 */
export class Configula implements IConfigula {

  protected _conf: t_conf_object = {};
  protected _type: t_conf_object = {};

  private __issues: string[] = [];

  constructor(private __of: any | TSType = tst) {

  }

  clear() {
    this._type = {};
    return this.empty();
  }

  empty() {
    this._conf = {};
    return this;
  }

  isOk(): boolean {
    return this.__issues.length <= 0;
  }

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

  has(path: string): boolean {
    return this.read(path) !== undefined;
  }

  clone(path?: string) {
    return Configula.__clone(this.read(path));
  }

  private static __clone(o: any) {
    try {
      return JSON.parse(JSON.stringify(o));
    }
    catch (e) {
      return o;
    }
  }

  read(path?: string) {
    return (path !== undefined)
      ? this._getPath(this._conf, this._steps(this.__parsePath(path)))
      : this._conf;
  }

  write(path: string, value: t_conf | any) {
    return this.__traverse(path, value, `write`);
  }

  define(path: string, type: any | string | type_fn_custom) {
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
        const _path = (!path) ? `${k}` : ((Array.isArray(v)) ? `${path}[${k}]` : `${path}.${k}`);

        this.__traverse(_path, v[k], method);
      }
    }
    else {
      (this as any)[`_${method}`](path, v);
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

    if (tst.undefined(value)) {
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
  protected _define(path: string, type: any | string | type_fn_custom, issues: string[]): this {
    const steps = this._steps(this.__parsePathGlobIndex(path));
    const inflectionPoint = steps.pop() as string;
    const typeParent = this._createPath(this._type, steps);

    typeParent[inflectionPoint] = type;
    return this;
  }

  /**
   * there are four conditions which could match:
   *
   * 1. a literal value matches with `===`
   * 2. a custom function
   * 3. a regular expression matches against a string (value will be coerced)
   * 4. a type matches from `of-ts`
   *
   * @param _type a type function or is.js method
   * @param value the value to type-check
   * @return true if type-check permits the value
   */
  protected _isPermitted(_type: type_fn_custom | any | RegExp, value: any): boolean {
    if (_type === value) {
      return true;
    }
    else if (tst.function(_type)) {
      return _type(value, this.__of, this);
    }
    else if (tst.string(value) && tst.regExp(_type)) {
      return (value + '').match(_type) !== null;
    }
    else if (tst.string(_type) && this.__of[_type]) {
      return ((this.__of as any)[_type] as type_fn).call(this.__of, value);
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
   * is array or pure object (not built from new but {})
   * @param o is value an object or a nested object which defines the path further
   *
   * ```
   * write('a.b', { c: { value: 1 } }) IS_IDENTICAL_TO write('a.b.c.value', 1)
   * ```
   */
  private __isNestingObject(o: any): boolean {
    return tst.array(o) || tst.object(o);
  }

}
