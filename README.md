# simple-di-injector
Simple dependency injection for nodejs written in typescript

## Install
```
npm install simple-di-injector --save
```

## Configuration
`tsconfig.json` file needs the following flags:
```
"experimentalDecorators": true,
"emitDecoratorMetadata": true
```

## Examples
1. [UseClass](https://github.com/burkoyuriy/simple-di-injector/blob/main/examples/useClass.ts)
2. [UseFactory](https://github.com/burkoyuriy/simple-di-injector/blob/main/examples/useFactory.ts)
3. [UseValue](https://github.com/burkoyuriy/simple-di-injector/blob/main/examples/useValue.ts)
4. [Full features](https://github.com/burkoyuriy/simple-di-injector/blob/main/examples/example.ts)

## Usage

### Initializing injector
Create injector instance

```ts
import { Injector } from 'simple-di-injector'
const injector = new Injector()
```

### Adding providers
```ts
@Injectable()
class ConfigService{}

@Injectable()
class LoggerService{
  constructor(configService: ConfigService){}
}

// Add class provider
injector.addProvider(ConfigService)
// or
injector.addProvider({
  provide: ConfigService
  useClass: MockedConfigService,
})


// Add factory provider
injector.addProvider({
  provide: LoggerService,
  useFactory: (configService: ConfigService) => new LoggerService(configService)
  inject?: [ConfigService]
})


// Add value provider
injector.addProvider({
  provide: 'SOME_VALUE',
  useValue: 'some value'
})
```

### Resolving providers
Each class can have a setup method (optional) that will be automatically called upon its creation.

```ts
@Injectable()
class Application{
  constructor(
    private config: ConfigService, 
    private logger: LoggerService, 
    @Inject('SOME_VALUE') private someValue: any
  ){}

  async setup(){
    // will be called when the instance is created 

    this.logger.info('Application inited')
  }
}

function bootstrap(){
  // create injector instance
  // add providers to injector
  
  const application = await injector.resolve(Application)
}
```

---
### Full usage example

```ts
import { Injectable, Injector } from "simple-di-injector";

bootstrap()

async function bootstrap(){
  const injector = new Injector()

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
```
