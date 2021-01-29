import { Injectable } from "../lib/injectable"
import { Injector } from "../lib/injector"

bootstrap()

async function bootstrap(){
  const injector = new Injector()

  injector.addProvider(Application, {
    provide: SomeService,
    useClass: MockSomeService
  })

  await injector.resolve(Application)
}

@Injectable()
class Application{
  constructor(someService: SomeService){
    console.log('someService.getValue', someService.getValue())
  }
}

@Injectable()
class SomeService{
  setup(){
    console.log('Some class inited')
  }

  getValue(): number{
    return 10
  }
}

@Injectable()
class MockSomeService{
  setup(){
    console.log('Some mocked service inited')
  }

  getValue(): number{
    return 20
  }
}