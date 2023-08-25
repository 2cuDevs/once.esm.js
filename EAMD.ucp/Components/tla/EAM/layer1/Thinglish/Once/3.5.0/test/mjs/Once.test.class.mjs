import { time } from 'console';
import fs from 'fs';
import path from 'path';
import Once from '../../src/js/Once.class.mjs';
import Thinglish from '../../../../3.5.0/src/mjs/Thinglish.class.mjs';
import Loader from '../../../../../OnceServices/Loader/3.5.0/src/mjs/Loader.class.mjs';


/**
 * @class Tootsie
 * @description
 * Tootsie is a test suite for Once
 * 
 * Interupting a test
 * https://github.com/tjanczuk/tripwire/tree/master
*/
class Tootsie {
    static async start() {
        console.log("Total Object Oriented Test SuItE");
        console.log("Testing Once 3.5.0 with Tootsie\n");
        
        let testSuite = await (new Tootsie().init());
        return testSuite;
    }


    constructor() {
        console.log("created", this);
        // get the directory of this file
        this.fileURL = new URL(import.meta.url);
        this.path = this.fileURL.pathname.split(path.sep);
        this.fileName = this.path.pop();
        this.extensions = this.fileName.split(".");
        this.fileClass = this.extensions.shift();

        this.testConunter = 0;
        this.testIsRunning = false;

        this.defaultLogger = console;
        this.logger = this.defaultLogger;


        this.once = null;

        console.log(this);
        //Object.preventExtensions(this);
        Object.seal(this);
    }
    
    async init() {
        let module = await import('../../src/js/Once.class.mjs');
        let Once = module.default;
        Once.registerStartupHook(this.onceStartupHook.bind(this));
        
        return this;
    }

    async onceStartupHook(once) {
        ONCE.log("back in Tootsie:",this);
        this.once = ONCE;
        this.overwriteConsole();

        let testMethods = this.findTestMethods(this);
        console.log("testMethods:", testMethods);

        this.testIsRunning = true;


        let testResults = testMethods.map(test => this.callTestMethod(test));
    }

    callTestMethod(testMethod, timeout = 50) {

            ONCE.log("\n\ncalling testMethod:", testMethod.name);
            ONCE.log(">=====================================");
            // log the current nanoseconds
            //const abortController = new AbortController();
            //const aboardHandler  = setTimeout(() => abortController.abort(), timeout);
            //const timeoutHandler = setTimeout(this.timeoutTest, timeout);

            let startTime = process.hrtime.bigint();

            ONCE.log("start:", startTime);
            // call the test method

            let result = testMethod();

            let endTime = process.hrtime.bigint();
            let duration = endTime - startTime;
            
            // if (!abortController.signal.aborted) 
            //     clearTimeout(timeoutHandler);
            this.testIsRunning = false;
            // log the current nanoseconds
            ONCE.log("duration:", duration);
            ONCE.log("done with testMethod:", testMethod.name);
            ONCE.log("=====================================<");
            return result;
    } 

    timeoutTest() {
        if (this.testIsRunning) {
            ONCE.log("timeoutTest: test is running...need to be interrupted");
        }
        else {
            ONCE.log("timeoutTest: test is not running");
        }
    }


    /** move to Logger  start */
    overwriteConsole() {
        ONCE.logger = this.defaultLogger;

        this.logger = ONCE;
        console = ONCE;
    }

    restoreConsole() {
        ONCE.logger = this.defaultLogger;

        this.logger = this.defaultLogger;
        console = this.defaultLogger;
    }
     /** move to Logger  end */

    createTestingThread() {
        let createTestingThread = new Worker("TestingThread.mjs");
    }

    findTestMethods(testInstance) {
        let keys = Object.getOwnPropertyNames(Object.getPrototypeOf(testInstance));
        let testMethodNames = keys.filter(key => key.startsWith("test"));
        let tests = testMethodNames.map(testMethodName => testInstance[testMethodName].bind(testInstance));
        return tests;
    }

    suggestTestMethods(instanceToTest) {
        let keys = Object.getOwnPropertyNames(instanceToTest);
        let prototype = Object.getPrototypeOf(instanceToTest);
        while (prototype) {
            prototype = Object.getPrototypeOf(prototype);
            if (prototype.constructor.name === "Object") break;
            if (!prototype) break;
            keys = keys.concat(Object.getOwnPropertyNames(prototype).map(key => prototype.constructor.name+"."+key));
        }
        
        let testMethodNames = keys.flat();
        return testMethodNames;
    }

    /** 
     * test if ESModuelLoader implemaents the interface class Loader
     */
    testLoader() {
        //Thinglish.implement(ESModuleLoader, Loader);
    }


    /**
     * @method findTests
     * returns an array of test implementations
     */
    findTests() {
        // current directory
        let dir = fs.realpathSync(".");

        // os path seperator
        let sep = path.sep;
        let thisPath = dir.split(sep);

        // find files in this directory
        let files = fs.readdirSync(".");
        let tests = [];

    }

    expect(description,condition) {
        if (condition == true)
            ONCE.log("Expecting: "+description+" = fulfilled!");
        else
            throw new Error("Expecting: "+description+" = failed!");
    }

    async testOnceStart() {
        console.log("testing: Once.start()");
        let once = null;
        if (typeof ONCE !== "undefined") once = ONCE;
        let startedOnce = await Once.start();

        this.expect("Once has already been started", once !== null);
        this.expect("Once.start() returns the already started ONCE", startedOnce === ONCE && ONCE === once);
        return startedOnce;
    }

    testOnceCosntructor() {
        console.log("testing: new Once()");
        let once = null;
        if (typeof ONCE !== "undefined") once = ONCE;
        let newOnce = new Once();

        this.expect("Once has already been started", once !== null);
        this.expect("new Once() is in Once.STATE.SHUTDOWN", newOnce.state === Once.STATES.SHUTDOWN);
        try {
            newOnce.state = Once.STATES.NEW
            this.expect("newOnce.state = Once.STATES.NEW should have failed", false);
        }
        catch (error) {
            ONCE.log("newOnce.state = Once.STATES.NEW   failed as expected: ", error.message);
        }
        return newOnce;
    }

    testOnceInit() {
        console.log("testing: once.init()");
    }

    testOnceCoverage() {
        ONCE.log("more methods to test: ",this.suggestTestMethods(ONCE));
    }

    // testLongRunningMethod() {
    //     console.log("testing Long Running Method");
    //     for(let i=0; i<1000000000; i++) {        }
    //     console.log("testing Long Running Method done");
    // }

}

let tootsie = await Tootsie.start();
tootsie.logger.log("inititalized Tootsie... now waiting for ONCE startupHook...");
