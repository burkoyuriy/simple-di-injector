import { Injectable } from "../lib/injectable";
import { Injector } from "../lib/injector";

bootstrap()

async function bootstrap(){
  const injector = new Injector()
  const childInjector = new Injector()
  injector.addChildInjector(childInjector)

  injector.addProvider(
    Application, 
    LoggerService, 
    ConfigService,
  )

  await injector.resolve(Application)
}


@Injectable()
class Application{
  constructor(
    private logger: LoggerService,
    private config: ConfigService,
  ){
    this.logger.info('[application]', `Application inited with address: ${this.config.get('host')}:${this.config.get('port')}`)
    // some other logic
  }

  async setup(){
    // will be called when the instance is created 
    console.log('Setup Application')
  }
}

@Injectable()
class LoggerService{
  constructor(private config: ConfigService){}

  async setup(){
    // will be called when the instance is created 
    console.log(`Setup LoggerService. LogLevel: ${this.config.get<string>('logLevel')}, LoggerErrorsFile: ${this.config.get<string>('loggerErrorsFile')}`)
  }

  info(target: string, msg: string){
    console.log(msg)
  }
}

@Injectable()
class ConfigService{
  private config: Map<string, any> = new Map()

  setup(){
    // will be called when the instance is created 
    this.set('loggerErrorsFile', 'error.log')
    this.set('logLevel', 'info')
    this.set('host', 'localhost')
    this.set('port', 8080)
  }

  public set(key: string, value: any): void{
    this.config.set(key, value)
  }

  public get<T=any>(key: string): T{
    return this.config.get(key)
  }
}