class OnceServer {
    static start() {
        let ONCE = new OnceServer();
        console.log("ONCE Server done");
    }
    constructor() {
    }
}

export default OnceServer;