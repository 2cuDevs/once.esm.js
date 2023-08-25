class Loader {
  constructor(name) {
    if (!Loader.counter) Loader.counter = 0;
    this.name = name;
    this.id = Loader.counter++;
    this.randomSleepExecTime = Math.random() * 100;
  }

  async load() {
    console.log("\t\tstart loader["+this.id+"]", this.name);
    let result = await this.work();
    console.log("\t\tresult loader["+this.id+"]: ", result);
  }

  work() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(this.id, "resolved after ", this.randomSleepExecTime, "ms");
        resolve(this.id+" resolved");
      }, this.randomSleepExecTime)
    })
  }
}

class Resource {
    constructor(name, nrOfDependencies) {
      if (Resource.level === undefined /*&& Resource.level<0*/) Resource.level=3;
      else Resource.level--;


      this.name = name;
      console.log("created Resource", this.name);
      this.dependencies = [];
      for (let index = 0; index < nrOfDependencies; index++) {
        //const element = array[index];
        this.dependencies.push(new Resource(name+"["+index+"]",Resource.level));
      }

    }

}


class FunctionPromiseQueue {

  init() {
    this._private = {
      queue: [],
      pendingPromise: false,
      workingOnPromise: false
    }
    return this;
  }

  enqueue(fun, params) {
    return new Promise((resolve, reject) => {
      this._private.queue.push({
        function: fun,
        params: params||[],
        resolve,
        reject
      });
      this.dequeue();
    });
  }

  dequeue() {
    if (this._private.workingOnPromise === true) return false;
    const item = this._private.queue.shift();
    if (!item) return false;
    try {
      this._private.workingOnPromise = true;
      item.function(...item.params)
        .then(value => {
          item.resolve(value);
          this._private.workingOnPromise = false;
          this.dequeue();
        })
        .catch(err => {
          item.reject(err);
          this._private.workingOnPromise = false;
          this.dequeue();
        })
    } catch (err) {
      item.reject(err);
      this._private.workingOnPromise = false;
      this.dequeue();
    }
    return true;
  }
}


class Kernel {
  static start() {
    let kernel = new Kernel().init();
  }
  constructor() {
    this.name = "Kernel";
  }

  init() {
    let resources = [
      new Resource("A",3),
      new Resource("B",0),
      new Resource("C",0),
      new Resource("D",6),
      new Resource("E",10),
    ];
    this.startResources(resources);
    return this;
  }

  async startResourcesQueued(resources) {
    console.log("startResources: ", resources);
    let queue = new FunctionPromiseQueue().init();
    //queue.enqueue(this.initResource);
    let result = resources.forEach(async r => {
      queue.enqueue(this.initResource.bind(this), [r]);
    });
    console.log("Resources started");
  }

  async startResourcesSerialized(resources) {
    console.log("startResources: ", resources);
    //let queue = new FunctionPromiseQueue().init();
    //queue.enqueue(this.initResource);
    for (let r of resources) {
      let result = await this.initResource(r);
    }
    console.log("Resources started");
  }

  async startResourcesParalell(resources) {
    console.log("startResources: ", resources);
    let result = await Promise.all(resources.map( this.initResource.bind(this) ));
    console.log("Resources started");
  }

  startResources(resources) {
    return this.startResourcesSerialized(resources)
  }

  async initResource(r) {
    console.log("\tload Ressource:", r.name);
    await new Loader(r.name).load();
    console.log("\tRessource:", r.name,"....loaded!");
    console.log("\tRessource dependencies:", r.dependencies);
    await this.startResources(r.dependencies);
    console.log("\tRessource dependencies:", r.name,"....loaded!");
  }

}

Kernel.start();


// let loader = [
//   new Loader("A"),
//   new Loader("B"),
//   new Loader("C"),
//   new Loader("D"),
//   new Loader("E"),
// ]

// loader.map(l => l.load())