import { Injectable } from "../lib/injectable"
import { Injector } from "../lib/injector"

bootstrap()

async function bootstrap(){
  const injector = new Injector()

  injector.addProvider(
    Application, 
    ConfigService, 
    {
      provide: SomeService,
      useFactory: (configService: ConfigService) => new SomeService(configService.get<string>('host'), configService.get<number>('port')),
      inject: [ConfigService]
    }
  )

  await injector.resolve(Application)
}

@Injectable()
class Application{
  constructor(someService: SomeService){
    console.log('Application address: ', someService.ADDRESS)
  }
}

@Injectable()
class ConfigService{
  private config: Map<string, any> = new Map()

  setup(){
    this.set('host', '127.0.0.1')
    this.set('port', 8080)
  }

  public set(key: string, value: any): void{
    this.config.set(key, value)
  }

  public get<T=any>(key: string): T{
    return this.config.get(key)
  }
}

class SomeService{
  constructor(private host: string, private port: number){
    // ...some logic
  }

  get ADDRESS(){
    return `${this.host}:${this.port}`
  }
}
