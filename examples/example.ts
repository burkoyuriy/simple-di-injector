import { Inject } from "../lib/inject";
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
    
    {
      provide: 'SOME_SERVICE_CLASS',
      useClass: SomeOtherService
    },

    {
      provide: 'SOME_FACTORY',
      useFactory: (configService: ConfigService) => {
        return new SomeOtherService()
      },
      inject: [ConfigService]
    }
  )

  childInjector.addProvider(
    {
      provide: 'SOME_VALUE',
      useValue: {
        test: 10
      }
    }
  )

  await injector.resolve(Application)
}


@Injectable()
class Application{
  constructor(
    private logger: LoggerService,
    private config: ConfigService,
    @Inject('SOME_VALUE') someValue: number,
    @Inject('SOME_SERVICE_CLASS') someServiceClass: SomeOtherService,
    @Inject('SOME_FACTORY') someFactory: SomeOtherService
  ){
    // some logic
  }

  async setup(){
    // will be called when the instance is created 
    console.log('Setup Application')
  }
}

@Injectable()
class LoggerService{
  async setup(){
    // will be called when the instance is created 
    console.log('Setup LoggerService')
  }
}

@Injectable()
class ConfigService{}

class SomeOtherService{}