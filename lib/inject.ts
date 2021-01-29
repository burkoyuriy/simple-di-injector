import { Token } from "./interfaces";

export const INJECT_METADATA_TOKEN = '__inject-token__';

export interface InjectParameterDescription {
  index: number,
  token: Token
}

export function Inject(token: Token) {
  return (target: Object, propertyKey: string | symbol, propertyIndex: number) => {
    const injectParams: {[key: string]: Token} = Reflect.getOwnMetadata(INJECT_METADATA_TOKEN, target, propertyKey) || {}
    injectParams[propertyIndex] = token

    Reflect.defineMetadata(
      INJECT_METADATA_TOKEN,
      injectParams,
      target,
      propertyKey,
    )
  }
}