const isType: Is = require('is_js');

type t_conf = Object;
type t_conf_object = any;
type is_fn = (v: any) => boolean;

export class Configuration {

  protected _conf: t_conf_object = {};
  protected _type: t_conf_object = {};

  initialize() {
    this._conf = {};
    this._type = {};
    return this;
  }

  write(path: string, value: t_conf | any): this {
    return this.__traverse(path, value, `write`);
  }

  define(path: string, type: any | string): this {
    return this.__traverse(path, type, `define`);
  }

  private __traverse(path: string, v: any, method: string): this {
    const isNestingObject = this.__isNestingObject(v);
    const _this = this as any;

    if (isNestingObject) {
      for (const k in v) {
        const _path = (isType.array(v)) ? `${path}[${k}]` : `${path}.${k}`;
        const _v = v[k];

        _this[method](_path, _v);
      }
    }
    else {
      _this[`_${method}`](path, v);
    }

    return this;

  }

  _write(path: string, value: t_conf | string): this {
    const typeSteps = this._steps(this.__parsePathGlobIndex(path));
    const typeInflectionPoint = typeSteps.pop() as string;
    const typeParent = this._getPath(this._type, typeSteps);

    if (isType.object(value) || isType.array(value)) {
      return this;
    }

    if (!typeParent) {
      throw new TypeError(`${typeSteps.join('.')} is invalid.`);
    }

    const typeDefinition: string = typeParent[typeInflectionPoint];

    if (!typeDefinition) {
      throw new TypeError(`${path} is invalid at ${JSON.stringify(typeInflectionPoint)}.`);
    }

    if (!this._isPermitted(typeDefinition, value, path)) {
      throw new TypeError(`${path} matches an invalid type at ${JSON.stringify(typeDefinition)}.`);
    }

    const steps = this._steps(this.__parsePath(path));
    const inflectionPoint = steps.pop() as string;
    const valueParent = this._createPath(this._conf, steps);

    valueParent[inflectionPoint] = value;
    return this;
  }

  has(path: string): boolean {
    return !!this.read(path);
  }

  read(path: string) {
    return this._getPath(this._conf, this._steps(this.__parsePath(path)));
  }

  _define(path: string, type: t_conf | string): this {
    const steps = this._steps(this.__parsePathGlobIndex(path));
    const inflectionPoint = steps.pop() as string;
    const typeParent = this._createPath(this._type, steps);

    typeParent[inflectionPoint] = type;
    return this;
  }

  protected _isPermitted(_type: string, value: any, path: string): boolean {
    const isFn: is_fn = (isType as any)[_type] as is_fn;
    return (isFn) ? isFn.call(isType, value) : false;
  }

  /**
   *
   * @param root
   * @param steps
   */
  protected _getPath(root: t_conf_object, steps: string[]) {
    let ptr = root;

    if (!ptr) {
      return undefined;
    }

    for (let step of steps) {
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
   *
   * @param root
   * @param steps
   */
  protected _createPath(root: t_conf_object, steps: string[]) {
    let ptr = root;

    if (!ptr) {
      return undefined;
    }

    for (let step of steps) {
      const isNumeric = this.__isNumericStep(step);

      if (isNumeric) {
        step = step.substr(0, step.length - 1);
      }

      if (!ptr[step]) {
        ptr[step] = (isNumeric) ? [] : {}
      }

      ptr = ptr[step]
    }

    return ptr;
  }

  /**
   *
   * @param path
   */
  protected _steps(path: string): string[] {
    return path.split(`.`);
  }

  /**
   *
   * @param path
   */
  private __parsePath(path: string): string {
    return path.replace(`[`, `!.`).replace(`]`, ``);
  }

  /**
   * @param path
   */
  private __parsePathGlobIndex(path: string): string {
    const findBrackets = /\[([^\]]+)\]/g;
    const zeroIndexPath = path.replace(findBrackets, `[0]`);

    return this.__parsePath(zeroIndexPath);
  }

  private __isNumericStep(step: string): boolean {
    return !!step && step[step.length - 1] === '!';
  }

  private __isNestingObject(o: any): boolean {
    return isType.array(o) || (isType.object(o) && o.constructor.name === `Object`);
  }

}






// const isAlpha = /^[a-z]+$/i;
// const isNumeric = /^[0-9]+$/;
