import { Type } from "./interfaces"
import { INJECT_METADATA_TOKEN } from "./inject"
import { Provider, Token } from "./interfaces"
import { isConstructor, isClassProvider, isValueProvider } from "./utils"

export interface InjectorItem{
  instance: any,
  injector: Injector,
  provider: Provider.Typed
}

export class Injector{
  private instances: Map<Token, any> = new Map()
  private providers: Map<Token, Provider.Typed> = new Map()

  private subInjectors: Set<Injector> = new Set()

  private isTypedProvider(target: Provider.Typed | Provider.Ctor){
    return (target as Provider.Typed).provide !== undefined
  }

  private isPlaneProvider(target: Provider.Ctor){
    return isConstructor(target)
  }

  addChildInjector(injector: Injector){
    this.subInjectors.add(injector)
  }

  addProvider(...providers: Array<Provider.Ctor | Provider.Typed>){
    for (let provider of providers){
      if (this.isPlaneProvider(provider as Provider.Ctor)){
        this.providers.set(provider as Provider.Ctor, {
          provide: provider as Provider.Ctor,
          useClass: provider as Provider.Ctor
        })
      } else if (this.isTypedProvider(provider)){
        this.providers.set((provider as Provider.Typed).provide , provider as Provider.Typed)
      } else {
        throw new Error('Target is not a provider!')
      }
    } 
  }

  private find(token: Token): InjectorItem{
    for (let subInjector of this.subInjectors.values()){
      const res = subInjector.get(token)
      if (res) return res
    }
  }

  private get(token: Token): InjectorItem{
    const provider = this.providers.get(token)

    if (provider){
      return {
        instance: this.instances.get(token),
        provider,
        injector: this,
      }
    }
  }

  async resolve<T = any>(token: Token, createNewInstance?: boolean): Promise<T>{
    if (this.providers.has(token)){
      if (this.instances.has(token)){
        return this.instances.get(token)
      } else {
        return this.createInstance<T>(this.providers.get(token))
      }
    } else {
      const childInjectorItem = this.find(token)

      if (!childInjectorItem) throw new Error('Not found target in injector! Target: ' + (isConstructor(token) ? (token as any).name : token as any))

      let instance = childInjectorItem.instance
      if (!instance) {
        instance = await childInjectorItem.injector.createInstance<T>(childInjectorItem.provider, createNewInstance)
      }
      return instance
    }
  }

  private async createInstance<T = any>(provider: Provider.Typed, createNewInstance: boolean = false): Promise<T>{
    let instance

    if (isClassProvider(provider)){
      instance = await this.injectClass(provider as Provider.Class<T>)
    } else if (isValueProvider(provider)){
      instance = await this.injectValue(provider as Provider.Value<T>)
    } else {
      instance = await this.injectFactory(provider as Provider.Factory<T>)
    }
    
    if (instance.setup !== undefined && typeof instance.setup == 'function'){
      await instance.setup()
    }

    if (!createNewInstance){
      if (this.instances.has(provider.provide)){
        console.warn(`Warning! Injector provider ${String(provider.provide)} is overrided!`)
      }

      this.instances.set(provider.provide, instance)
    }

    return instance
  } 

  private async injectClass<T = any>(classProvider: Provider.Class): Promise<T>{
    const target = classProvider.useClass
    const paramtypes = Reflect.getMetadata('design:paramtypes', target) || []
    const injects = Reflect.getMetadata(INJECT_METADATA_TOKEN, target)

    for (let i in injects){
      paramtypes[i] = injects[i]
    }

    return Reflect.construct(target, await this.resolveDependencies(paramtypes));
  }

  public async resolveDependencies<T>(paramtypes: Type<T>[]): Promise<Array<any>>{
    const deps = []
    
    for (let i in paramtypes){
      const dep = await this.resolve(paramtypes[i])
      deps.push(dep)
    }

    return deps
  }

  private injectValue<T>(valueProvider: Provider.Value<T>): T{
    return valueProvider.useValue
  }

  private async injectFactory<T>(factoryProvider: Provider.Factory<T>): Promise<T>{
    if (factoryProvider.inject && factoryProvider.inject.length){
      const deps = []
      
      for (let i in factoryProvider.inject){
        deps.push(await this.resolve(factoryProvider.inject[i]))
      }

      return factoryProvider.useFactory(...deps);
    } else {
      return factoryProvider.useFactory();
    }
  }
}
