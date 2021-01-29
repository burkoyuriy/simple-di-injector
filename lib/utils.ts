import { Provider } from "./interfaces/provider.interface";

export function isClassProvider(provider: Provider.Typed){
  return (provider as any).useClass !== undefined
}

export function isValueProvider(provider: Provider.Typed){
  return (provider as any).useValue !== undefined
}

export function isExistingProvider(provider: Provider.Typed){
  return (provider as any).useExisting !== undefined
}

export function isFactoryProvider(provider: Provider.Typed){
  return (provider as any).useFactory !== undefined
}

export const isConstructor = (symbol: any): boolean => {
  return symbol != undefined && 
    symbol != 'undefined' &&
    symbol instanceof Function &&
    symbol.constructor &&
    symbol.constructor instanceof Function &&
    Object.getPrototypeOf(symbol) !== Object.prototype &&
    symbol.constructor !== Object &&
    symbol.prototype.hasOwnProperty('constructor');
};