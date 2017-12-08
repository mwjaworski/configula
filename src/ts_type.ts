export class TSType {

  array(o: any): o is Array<any> {
    return Array.isArray(o);
  }

  boolean(o: any): o is boolean {
    return typeof o === 'boolean';
  }

  string(o: any): o is string {
    return typeof o === 'string' || o instanceof String;
  }

  undefined(o: any): o is undefined {
    return typeof o === 'undefined';
  }

  null(o: any): o is null {
    return o === null;
  }

  number(o: any): o is number {
    return typeof o === 'number' && !this.nan(o);
  }

  nan(o: any) {
    return o !== o;
  }

  object(o: any): o is Object {
    return o && typeof o === 'object' && o.constructor === Object;
  }

  function(o: any): o is Function {
    return typeof o === 'function';
  }

  date(o: any): o is Date {
    return o instanceof Date;
  }

  error(o: any): o is Error {
    return o instanceof Error && typeof o.message !== 'undefined';
  }

  regExp(o: any): o is RegExp {
    return o instanceof RegExp;
  }

  symbol(o: any): o is Symbol {
    return typeof o === 'symbol';
  }
}

export const tst = new TSType();
