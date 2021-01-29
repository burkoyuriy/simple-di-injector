import { Inject } from "../lib/inject"
import { Injectable } from "../lib/injectable"
import { Injector } from "../lib/injector"

interface Config{
  host: string,
  port: number
}

bootstrap()

async function bootstrap(){
  const injector = new Injector()

  injector.addProvider(
    Application, 
    {
      provide: 'Config',
      useValue: {
        host: 'localhost',
        port: 8080
      }
    }
  )

  await injector.resolve(Application)
}

@Injectable()
class Application{
  constructor(@Inject('Config') config: Config){
    console.log('Application config', config)
  }
}