class OnceWorker {
    static start() {
        let onceThread = new Worker("OnceWorker.js");
        onceThread.addEventListener('message', this.receiveMessage);
        return onceThread;
    }
    constructor() {
    }

    receiveMessage(e) {
        console.log(e.data);
    }
}

export default OnceWorker;