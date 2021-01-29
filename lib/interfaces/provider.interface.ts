import { Type } from "../interfaces";
import { Abstract } from "./abstract.interface";

export type Token = string | symbol | Type<any> | Abstract<any> | Function

export namespace Provider{
  export type Ctor<T = any> = Type<T>
  export type Typed<T = any> = Class<T> | Factory<T> | Value<T>

  export interface Class<T = any>{
    provide: Token,
    useClass: Type<T>
  }

  export interface Factory<T = any>{
    provide: Token,
    useFactory: (...args: any[]) => T,
    inject?: Token[];
  }

  export interface Value<T = any>{
    provide: Token,
    useValue: T,
  }
}






