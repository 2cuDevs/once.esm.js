class OnceThread {
    static start() {
        
    }
    constructor() {
    }

    static receiveMessage(e) {
        self.postMessage('Sup, ' + e.data + '?');
    }
}
self.addEventListener('message', OnceThread.receiveMessage);

export default OnceThread;