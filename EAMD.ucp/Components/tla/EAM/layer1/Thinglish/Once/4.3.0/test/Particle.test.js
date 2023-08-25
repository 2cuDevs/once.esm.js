
// designed to only run with 
// http://localhost:8080/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/4.3.0/test/html/Once.mochaTest.html
// ONLY in the browser

// ONCE 4.3.0 feat/WODA-1360-IOR-ENTITY-STORE

/* global Namespaces, Store, TypeDescriptor */


//import {expect} from "../node_modules/chai/chai.js"

const { expect } = chai;


// import { assert } from 'chai';  // Using Assert style
// import { expect } from 'chai';  // Using Expect style
// import { should } from 'chai';  // Using Should style

const idealComponentUcpDomainEntityPath = '/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponentUcpDomainEntity/4.3.0/IdealComponentUcpDomainEntity.component.xml';

const expectedClasses = ["Thing", "Once", "Thinglish", "Namespace", "ArraySet"];

//    "TypeDescriptor", "JavaScriptObjectDescriptor", "FeatureDescriptor", "PropertyDescriptor",
//    "RelationshipDescriptor", "CollectionDescriptor", "MethodDescriptor", "Version", "IOR",
//    "DefaultLogger", "Store", "DropSupport", 

let wait = (ms) => {
    return new Promise((resolve, reject) => {
        console.time('wait ' + ms);

        setTimeout(() => {
            console.timeEnd('wait ' + ms);
            resolve("done!")
        }, ms)
    });
}


let appendLastTest = (view) => {
    let tests = Array.from(document.querySelectorAll('li.suite > ul > li.test'));

    let lastTest = tests[tests.length - 1];
    return view.append(lastTest);

}

console.log = function () { }

describe('Validate UcpDomainEntity Websocket Notifications', function () {
    let ior = '';
    let retIor;

    var mode = 'parent';
    var idealComponent;

    let lastData;
    let pm;
    let user = 'Mocha1';

    let match = document.location.search.match(/user=(.+)/)
    if (match) {
        user = match[1];
    }

    let send = (text, value) => {
        return NewTestTab.send2NewTab(text, value);
    };



    it('Setup Keycloak Session Manager USER: ' + user, async () => {

        await IOR.getInstance().init('/EAMD.ucp/Components/org/Keycloak/KeycloakSessionManager/4.3.0/KeycloakSessionManager.component.xml').load();
        await MochaTestKeycloakSessionManager.getInstance().init(user);
    }).timeout(60000);

    it('Setup Notification Test', async () => {
        await IOR.load('/EAMD.ucp/Components/tla/EAM/layer3/AutomatedTesting/NewTestTab/4.3.0/NewTestTab.component.xml');
        let newTab = await NewTestTab.openNewTab('Mocha1');
        //await wait(4000);
    }).timeout(600000);


    describe('Basis test for User Mocha1', function () {

        it('Create and load UcpDomainEntity', async () => {

            const idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
            idealComponent = idealComponentClass.getInstance().init();
            idealComponent.model.attribute1 = 'bar';


            idealComponent.model.multiSet({ _componentConfig: { udePersistanceManagerMode: UDEPersistanceManager.MODE_NOTIFY } });
            let createResult = await idealComponent.PM.create();

            expect(createResult[0][1]).to.equal("Successfully registered");
            expect(createResult[0][0].iorId).to.equal(idealComponent.id);

            pm = idealComponent.Store.lookup(UDEPersistanceManager)[0];
            let result = await send('LOAD:' + idealComponent.IOR.href);
            expect(result).to.equal('LOAD OK Successfully registered');

            expect(pm._private.statistics.notificationCounter, 'notificationCounter').to.equal(0);
            expect(pm._private.statistics.updateCounter, 'updateCounter').to.equal(0);

            let childModel = await send('GET_MODEL');
            expect(childModel.attribute1).to.equal('bar');

        }).timeout(20000);

        it('Notify Model Proxy Array change ', async () => {

            // Check if data could be retrieved

            idealComponent.model.myNumbers.push(123);

            // Wait for the Notification to arrive at the other TAB
            await idealComponent.ucpModel;

            expect(pm._private.statistics.notificationCounter, 'notificationCounter').to.equal(1);
            expect(pm._private.statistics.updateCounter, 'updateCounter').to.equal(0);
            //expect(pm._private.transactionResult[idealComponent.ucpModel.latestVersion.id]?.[0]?.value?.[0]?.[1], 'Notification Result from other Tab is wrong').to.deep.equal('send 1 Notifications');

            await wait(100);

            let childModel = await send('GET_MODEL');
            expect(childModel.myNumbers).to.deep.equal([1, 2, 3, 4, 5, 123]);
        }).timeout(2000);

        it('Notify Model Proxy Object change', async () => {
            idealComponent.model.subParam = { 'text': 'Foo bar' };

            //await wait(200);
            await idealComponent.ucpModel;


            childModel = await send('GET_MODEL');

            expect(childModel.subParam).to.deep.equal({ 'text': 'Foo bar' });
        });

        it('Notify Model Proxy multiSet', async () => {
            idealComponent.model.multiSet({ 'attribute2': 'bar', 'subParam': { 'text': 'some text' } });
            //await wait(200);
            await idealComponent.ucpModel
            childModel = await send('GET_MODEL');
            expect(childModel.attribute2).to.equal('bar');
            expect(childModel.subParam).to.deep.equal({ 'text': 'some text' });


        });

        it('push items into an array', async () => {
            idealComponent.model.myNumbers = [];
            for (let i = 0; i < 10; i++) {
                idealComponent.model.myNumbers.push(i);
            }


            await wait(1000);
            await idealComponent.ucpModel
            childModel = await send('GET_MODEL');
            expect(childModel.myNumbers).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);


        });

        it('Notify Model 10 Changes at once', async () => {
            for (let i = 0; i < 10; i++) {
                idealComponent.model.attribute3 = `my Text ${i}`;
            }

            //await wait(200);
            //await idealComponent.ucpModel;
            let pmResult = await idealComponent.PM;

            childModel = await send('GET_MODEL');
            lastData = childModel;
            expect(childModel.attribute3).to.equal('my Text 9');
        });

        it('Notify Model clear Model (Fails some times. Need to check why)', async () => {
            let expectedData = { attribute2: 'test' }
            idealComponent.model = expectedData;
            expectedData._access = lastData._access;
            expectedData._componentConfig = lastData._componentConfig;
            expectedData._componentInfo = lastData._componentInfo;
            await idealComponent.ucpModel;

            expect(pm._private.transactionResult[idealComponent.ucpModel.latestVersion.id]?.['transactionResult']?.[1]?.value?.[1], 'Notification Result from other Tab is wrong').to.deep.equal('send 1 Notifications');


            await wait(200);
            childModel = await send('GET_MODEL');
            expect(childModel).to.deep.equal(expectedData);

        });

        it('Change started by other side', async () => {

            let changeResult = await send('SET_PARAMETER:model', { attribute1: 'other', attribute2: 'side' });
            expect(changeResult).to.equal('ok');
            await idealComponent.ucpModel;
            expect(idealComponent.model.attribute1).to.equal('other');
            expect(idealComponent.model.attribute2).to.equal('side');

        }).timeout(2000);


        it('Update Access Token on the Websocket', async () => {

            idealComponent.IOR.sessionManager.eventSupport.fire(KeycloakSessionManager.EVENT_ON_UPDATE_TOKEN, idealComponent.IOR.sessionManager);

        }).timeout(2000);


        after(async () => {

            if (mode === 'parent') {
                await idealComponent.PM.delete();
            }
        })
    });
    describe('Tests between Mocha1 and Mocha2 (full read Access)', function () {
        it('Setup Notification Test', async () => {

            //window.open(document.location.href + '?mode=child&user=Mocha2', '_blank');
            //expect(await send('READY?')).to.be.equal('READY!');

            let newTab = await NewTestTab.openNewTab('Mocha2');


        }).timeout(10000);


        it('Create and load UcpDomainEntity to Mocha2 (role mochaUser)', async () => {
            // Wait for the Child to get ready

            const idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
            idealComponent = idealComponentClass.getInstance().init();
            idealComponent.model.multiSet({ attribute1: 'bar', _access: { readAccess: ['mochaUser'], udePersistanceManagerMode: ['mochaUser'] } });


            idealComponent.model.multiSet({ _componentConfig: { udePersistanceManagerMode: UDEPersistanceManager.MODE_NOTIFY } });
            let createResult = await idealComponent.PM.create();

            expect(createResult[0][1]).to.equal("Successfully registered");
            expect(createResult[0][0].iorId).to.equal(idealComponent.id);
            //await wait(4000);

            pm = idealComponent.Store.lookup(UDEPersistanceManager)[0];

            let result = await send('LOAD:' + idealComponent.IOR.href);
            expect(result).to.equal('LOAD OK Successfully registered');

            expect(pm._private.statistics.notificationCounter, 'notificationCounter').to.equal(0);
            expect(pm._private.statistics.updateCounter, 'updateCounter').to.equal(0);

            let childModel = await send('GET_MODEL');
            expect(childModel.attribute1).to.equal('bar');

        }).timeout(2000);

        it('Notification to Mocha2 (role mochaUser)', async () => {
            idealComponent.model.multiSet({ 'attribute1': 'foo11', 'attribute2': 'bar', 'subParam': { 'text': 'some text' } });
            await idealComponent.ucpModel
            childModel = await send('GET_MODEL');
            expect(childModel.attribute1).to.equal('foo11');

            expect(childModel.attribute2).to.be.undefined;
            expect(childModel.subParam).to.deep.equal({ 'text': 'some text' });

        }).timeout(2000);

        it('Notification deletion to Mocha2 (role mochaUser)', async () => {
            delete idealComponent.model.attribute2;
            await idealComponent.ucpModel
            childModel = await send('GET_MODEL');
            expect(childModel.attribute2).to.be.undefined;
        }).timeout(2000);


        after(async () => {

            if (mode === 'parent') {
                await idealComponent.PM.delete();
                //send('CLOSE');
                //await wait(50);

            }
        })
    });
    describe('Tests between Mocha1 and Mocha2 (partial Access)', function () {


        it('Create and load UcpDomainEntity to Mocha2 (role mochaUser)', async () => {
            // Wait for the Child to get ready

            const idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
            idealComponent = idealComponentClass.getInstance().init();
            idealComponent.model.multiSet({ attribute1: 'bar', attribute2: 'foo2', _access: { groupAttribute2: ['mochaUser'], udePersistanceManagerMode: ['mochaUser'] } });


            idealComponent.model.multiSet({ _componentConfig: { udePersistanceManagerMode: UDEPersistanceManager.MODE_NOTIFY } });
            let createResult = await idealComponent.PM.create();

            expect(createResult[0][1]).to.equal("Successfully registered");
            expect(createResult[0][0].iorId).to.equal(idealComponent.id);
            //await wait(4000);

            pm = idealComponent.Store.lookup(UDEPersistanceManager)[0];

            let result = await send('LOAD:' + idealComponent.IOR.href);
            expect(result).to.equal('LOAD OK Successfully registered');

            expect(pm._private.statistics.notificationCounter, 'notificationCounter').to.equal(0);
            expect(pm._private.statistics.updateCounter, 'updateCounter').to.equal(0);

            let childModel = await send('GET_MODEL');
            expect(childModel.attribute1).to.be.undefined;
            expect(childModel.attribute2).to.be.equal('foo2');


        }).timeout(2000);

        it('Notification to Mocha2 (role mochaUser) (Test Notification Filter)', async () => {
            idealComponent.model.multiSet({ 'attribute2': 'bar5', 'attribute1': 'invisible' });
            await idealComponent.ucpModel
            childModel = await send('GET_MODEL');
            expect(childModel.attribute2).to.equal('bar5');
            expect(childModel.attribute1).to.be.undefined;

        }).timeout(2000);

        it('Notification deletion to Mocha2 (role mochaUser)', async () => {
            delete idealComponent.model.attribute2;
            await idealComponent.ucpModel;
            childModel = await send('GET_MODEL');
            expect(childModel.attribute2).to.be.undefined;


            let version2 = await send('GET_PARAMETER:ucpModel.version');
            expect(idealComponent.ucpModel.version).to.equal(version2);

        }).timeout(2000);


        it('Notification do not reach to Mocha2 (role mochaUser)', async () => {
            let version = await send('GET_PARAMETER:ucpModel.version');

            idealComponent.model.attribute1 = 'new value';
            await idealComponent.PM;
            await idealComponent.ucpModel;

            let version2 = await send('GET_PARAMETER:ucpModel.version');
            expect(version).to.be.equal(version2);
        }).timeout(2000);

        /*
                it('Change Object with partial write Access (role mochaUser)', async () => {
                    let attribute1 = idealComponent.model.attribute1;
        
        
                    let attribute2 = 'set for Mocha2'
                    idealComponent.model.attribute2 = attribute2;
                    await idealComponent.ucpModel;
                    await idealComponent.PM;
        
                    let iorUrl = idealComponent.IOR.url;
                    await MochaTestKeycloakSessionManager.getInstance().init('Mocha1');
        
                    let clearCashIor = IOR.getInstance().init('/once/clearUDECash');
                    let clearResult = await Client.findClient(clearCashIor).GET(clearCashIor);
                    expect(clearResult).equal('ok');
        
                    UcpDomainEntityLoader.staticStore.registry = {};
        
                    let remoteModel = await send(`EXECUTE: 
                    UcpDomainEntityLoader.staticStore.registry = {};
                    udeComponent = await IOR.load('${iorUrl}');
                    return udeComponent.model;
                    `);
        
                    expect(remoteModel.attribute2).equal(attribute2);
        
                    let newText = 'changed by Mocha1';
        
                    await send(`EXECUTE: udeComponent.model.attribute2 = '${newText}';`);
                    await Thinglish.wait(100);
        
                    let idealComponent2 = await IOR.load(iorUrl);
        
                    await Thinglish.wait(100);
        
                    expect(idealComponent2.model.attribute2).equal(newText);
        
                    expect(idealComponent2.model.attribute1).equal(attribute1);
        
        
                }).timeout(200000);
        */

        after(async () => {

            if (mode === 'parent') {
                await idealComponent.PM.delete();
            }
        })
    });


    describe('Tests between Mocha1 and Mocha2 (bidirectional Write)', function () {


        it('Create and load UcpDomainEntity to Mocha2 (role mochaUser)', async () => {
            // Wait for the Child to get ready

            const idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
            idealComponent = idealComponentClass.getInstance().init();
            idealComponent.model.multiSet({ attribute1: 'foo bar', _access: { writeAccess: ['mochaUser'], readAccess: ['mochaUser'], udePersistanceManagerMode: ['mochaUser'] } });


            idealComponent.model.multiSet({ _componentConfig: { udePersistanceManagerMode: UDEPersistanceManager.MODE_NOTIFY } });
            let createResult = await idealComponent.PM.create();

            expect(createResult[0][1]).to.equal("Successfully registered");
            expect(createResult[0][0].iorId).to.equal(idealComponent.id);
            //await wait(4000);

            pm = idealComponent.Store.lookup(UDEPersistanceManager)[0];

            let result = await send('LOAD:' + idealComponent.IOR.href);
            expect(result).to.equal('LOAD OK Successfully registered');

            expect(pm._private.statistics.notificationCounter, 'notificationCounter').to.equal(0);
            expect(pm._private.statistics.updateCounter, 'updateCounter').to.equal(0);

            let childModel = await send('GET_MODEL');
            expect(childModel.attribute1).to.be.equal('foo bar');


        }).timeout(2000);

        it('Notification Mocha1 to Mocha2', async () => {

            idealComponent.model.attribute1 = 'Mocha 1 Data';
            await idealComponent.ucpModel;
            await idealComponent.PM;
            let childModel = await send('GET_MODEL');
            expect(childModel.attribute1).to.equal('Mocha 1 Data');

        }).timeout(2000);

        it('Notification Mocha2 to Mocha1', async () => {

            let changeResult = await send('SET_PARAMETER:model', { attribute1: 'Mocha 2 Data' });
            expect(changeResult).to.equal('ok');
            await idealComponent.ucpModel;
            expect(idealComponent.model.attribute1).to.equal('Mocha 2 Data');

        }).timeout(2000);

        after(async () => {

            if (mode === 'parent') {
                await idealComponent.PM.delete();

            }
        })
    });

    describe('Negative Tests between Mocha1 and Mocha2 ', function () {
        it('Notification Mocha2 to Mocha1 without write access', async () => {

            await IOR.load('/EAMD.ucp/Components/tla/EAM/layer3/AutomatedTesting/NewTestTab/4.3.0/NewTestTab.component.xml');
            let newTab = await NewTestTab.openNewTab('Mocha2');

            let remoteResult = await newTab.execute(`
            await IOR.load('${idealComponentUcpDomainEntityPath}'); 
            udeComponent = IdealComponentUcpDomainEntity.getInstance().init();
            udeComponent.model.multiSet({
                _access: {groupAttribute2: ['mochaUser'], readAccess: ['mochaUser'], udePersistanceManagerMode: ['mochaUser']},
                _componentConfig: { udePersistanceManagerMode: UDEPersistanceManager.MODE_NOTIFY  }
            });
            await udeComponent.PM.create();
            return udeComponent.IOR.href`
            );

            let component = await IOR.load(remoteResult);


            component.model.attribute1 = 'some Text without write Access';

            await component.PM;
            // Give the other TAB time to working
            await Thinglish.wait(100);

            let pm = component.lookup(PersistanceManager)[0];

            expect(pm._private.transactionResult[component.ucpModel.latestVersion.id]?.importResult?.[0], 'Notification Result from other Tab is wrong').to.equal("Ignore KEY attribute1. Missing write access!");


            await component.PM.retrieve();

            expect(component.model.attribute1).to.not.equal('some Text without write Access');

            await newTab.execute(`await udeComponent.PM.delete();`);
            await newTab.closeTab();


        }).timeout(200000);
    });

});





describe('should check if ONCE booted correctly', function () {
    console.log("%cTest:", "color: darkgreen; font-weight: bold", this.title);
    beforeEach(function () {
        console.log("%c   testing", "color: darkgreen; font-weight: bold", this.currentTest.title); //displays test title for each test method      
    });

    it('if Once has a version', done => {

        expect(ONCE.versionNamespace).to.be.a('string');
        console.log("ONCE.versionNamespace=", ONCE.versionNamespace);

        done();
    });
});


describe('should check the class Private', function () {
    console.log("%cTest:", "color: darkgreen; font-weight: bold", this.title);
    //console.log("Full Title:",this.fullTitle());

    const publicValue = {
        test: "testValue"
    };
    const jsonWithPrivate = {
        publicValue,
        private: undefined
    }
    var privateVar = jsonWithPrivate.privateVar = new Private(publicValue, jsonWithPrivate);

    before(async () => {

        privateVar.log();
    }
    );

    beforeEach(function () {
        console.log("%c   testing", "color: darkgreen; font-weight: bold", this.currentTest.title); //displays test title for each test method      
    });
    afterEach(function () {
        //console.log("%c   next:", "color: darkgreen; font-weight: bold"); //displays test title for each test method      
    });

    it('access a private value with knowing the owner', done => {


        const p = privateVar.get(jsonWithPrivate);
        expect(p).to.be.an('object').and.to.deep.equal(publicValue);
        console.log("retrieved value=", p);
        privateVar.log();
        done();
    }
    );

    it('access a private value without knowing the owner', done => {

        privateVar.log();

        const p = privateVar.get();
        expect(p).to.be.an('string').and.to.equal('private! access denied');
        console.log("value=", p);

        done();
    }
    );

    it('modify private value without knowing the owner', done => {

        privateVar.log();
        const p = privateVar.get(jsonWithPrivate);
        console.log("original  value=", p);
        p.secret = "mist";
        console.log("modified  value=", p);

        const p2 = privateVar.get(jsonWithPrivate);
        console.log("retrieved value=", p2);
        expect(p2).to.be.an('object').and.to.deep.equal(publicValue);
        console.log("%cunmodified", "color: lightgreen; font-weight: bold");
        privateVar.log();

        done();
    }
    );

}
);


describe('should check the class Particle', function () {
    /*
    maybe later

        Class Particle   ==>  Class UcpModel
                                  let particle = Proxy(...)

        for 
          paticle = anotherClass;
          paticle = anArry;
          paticle = primitive;

    */



    console.log("%cTest:", "color: darkgreen; font-weight: bold", this.title);
    //console.log("Full Title:",this.fullTitle());
    const publicValue = {
        particleTest: "testValue"
    };
    const particle = new Particle(publicValue);

    before(async () => {

        particle.log();
    }
    );

    beforeEach(function () {
        console.log("%c   testing", "color: darkgreen; font-weight: bold", this.currentTest.title); //displays test title for each test method      
    });
    afterEach(function () {
        //console.log("%c   next:", "color: darkgreen; font-weight: bold"); //displays test title for each test method      
    });

    it('access particle.value.particleTest', done => {
        const p = particle.value.particleTest;
        expect(p).to.be.an('string').and.to.equal("testValue");
        console.log("retrieved value=", p);
        particle._private.log();
        done();
    }
    );

    it('set particle.value.particleTest', done => {
        particle.value.particleTest = "newValue";

        publicValue.particleTest = "killed it";

        const p = particle.value.particleTest;





        expect(p).to.be.an('string').and.to.equal("newValue");
        console.log("retrieved value=", p);
        console.log(particle.wave);



        done();
    }
    );

}
);

describe('Checking UcpComponentDescriptors ', function () {
    let all = Namespaces.discover();

    it('checks all dependencies of ONCE in different formats', done => {
        all.map(aClass => {
            if (Thinglish.isClass(aClass)) {

                let typeDescrior = aClass.type;
                let ucpComponentDescriptor = aClass.type.ucpComponentDescriptor;
                if (ucpComponentDescriptor) {
                    console.log(aClass.name)
                    if (ucpComponentDescriptor.model)
                        console.log("\tucpComponentDescriptor:", ucpComponentDescriptor.model.name)
                    else
                        console.log("\tucpComponentDescriptor:", ucpComponentDescriptor)
                }
                else {
                    console.log(aClass.name)
                    let ucpComponentDescriptor = Thinglish.lookupInObject(aClass, "scriptInfo.script.ior.referencedObject.type.name");
                    if (ucpComponentDescriptor)
                        console.log("\tis not a UcpComponent but was loaded from:", ucpComponentDescriptor)
                    else
                        console.log("\tloaded from:", Thinglish.lookupInObject(aClass, "scriptInfos.script.src"))

                }
            }
            else {
                console.log(aClass.name, "is not a class....");
            }
        });
        //console.log("Dependencies in package format:", dependenciesInPackageFormat);
        done();
    });

    it('checks if all ucpComponentDescriptors exist', done => {
        all.map(aClass => {
            let descriptor = aClass.type.ucpComponentDescriptor;
            expect(aClass.type.ucpComponentDescriptor).to.exist;
            let isDescriptorLoaded = aClass.type.ucpComponentDescriptor.isDescriptorLoaded;
            console.log("Decriptor for", aClass.name, "is loaded:", isDescriptorLoaded);
        });
        done();
    });

    it('checks all ucpComponentDescriptors unist', done => {
        all.map(aClass => {
            let descriptor = aClass.type.ucpComponentDescriptor;
            expect(aClass.type.ucpComponentDescriptor).to.exist;
            let isDescriptorLoaded = aClass.type.ucpComponentDescriptor.isDescriptorLoaded;
            console.log("Decriptor for", aClass.name, "is named:", descriptor.name);
            console.log("             ", aClass.name, "has units:", descriptor.units);
            console.log("             ", aClass.name, "has weBeanUnitPaths:", descriptor.weBeanUnitPaths);
        });
        done();
    });
});

describe('Component Bootup', function () {
    it('IdealComponentUcpDomainEntity Less Unit loading', async () => {
        let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
        let instance = idealComponentClass.getInstance().init();
        let lessHref = instance.defaultView.discoverUnits(Unit.TYPE.LESS)[0].targetIOR.normalizeHref;

        let linkId = Namespace.path2namespace(lessHref);
        expect(document.getElementById(linkId).outerHTML).to.match(/^<link/);
    });

    describe('View Rendering', function () {
        for (let view of [DefaultView, ItemView]) { //, DetailsView, OverView]) {
            let viewObject;
            it(view.name + ' => get ViewClass', async () => {
                let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
                let instance = idealComponentClass.getInstance().init();
                viewObject = instance[view.name.charAt(0).toLowerCase() + view.name.slice(1)];
                expect(Thinglish.isInstanceOf(viewObject, view)).to.be.true;
            });

            it(view.name + ' => get documentElement', async () => {
                let documentElement = viewObject.documentElement;
                expect(documentElement).to.be.null;

                let documentElement2 = await viewObject.getDocumentElement();
                expect(documentElement2.outerHTML).to.match(/^[ \n]*</);

                let documentElement3 = viewObject.documentElement;
                expect(documentElement3.outerHTML).to.match(/^[ \n]*</);
            });

        }
        /*
        @Bene Is not working that way. Need to find a better solution.
                it('View Cleanup if not in DOM', async () => {
                    let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
                    let instance = idealComponentClass.getInstance().init();
                    let defaultView1 = await instance.newDefaultView;
                    let defaultView2 = await instance.newDefaultView;
                    let defaultView3 = await instance.newDefaultView;
        
                    let viewInStore = await instance.defaultView;
                    expect(viewInStore).to.not.be.equal(defaultView1);
                    expect(viewInStore).to.not.be.equal(defaultView2);
                    expect(viewInStore).to.equal(defaultView3);
        
                    expect(instance.Store.lookup(DefaultView)).to.deep.equal([viewInStore]);
                });
        */
        it('Add Child to unrendered view', async () => {
            let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
            let instance = idealComponentClass.getInstance().init();

            let subComponent = await instance.getSubComponent();
            await instance.defaultView.add(subComponent);
            expect(instance.defaultView.children?.[0]).to.be.equal(subComponent.defaultView);

            const element = document.getElementById(subComponent.defaultView.id);
            expect(element, 'Element should not be in DOM').to.be.null;
        });

        it('Add Child Component as Promise (expect error)', async () => {
            let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
            let instance = idealComponentClass.getInstance().init();

            let subComponentPromise1 = instance.getSubComponent();

            try {
                await instance.defaultView.add(subComponentPromise1);
                throw new Error('Missing Error');
            } catch (err) {
                expect(err.message).to.be.equal('You can not add a Promise to a View')
            }

        });

        describe('View Rendering Callbacks', function () {

            it('View.onDomReady is called', async () => {
                let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
                let instance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;
                let hitFunction = false;
                view.onDomReady = () => { hitFunction = true }
                await view.append();

                view.remove();
                expect(hitFunction).to.be.true;

            });

            it('View.afterRender is called', async () => {
                let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
                let instance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;
                let hitFunction = false;
                view.afterRender = () => { hitFunction = true }
                await view.startRendering();

                expect(hitFunction).to.be.true;
            });

            it('View.onUpdate is called', async () => {
                let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
                let instance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;
                let hitFunction = false;
                await view.append();

                view.onUpdate = () => { hitFunction = true }

                instance.model.myNumbers.push(11);
                await instance.ucpModel;
                //await wait(400); // wait for the update
                view.remove();
                expect(hitFunction).to.be.true;
            });

            it('Component.onDomReadyView is called', async () => {
                let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
                let instance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;
                let hitFunction = false;
                instance.onDomReadyView = () => { hitFunction = true }
                await view.append();

                view.remove();
                expect(hitFunction).to.be.true;

            });

            it('Component.afterRenderView is called', async () => {
                let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
                let instance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;
                let hitFunction = false;
                instance.afterRenderView = () => { hitFunction = true }
                await view.startRendering();

                expect(hitFunction).to.be.true;
            });

            it('Component.onModelChanged is called', async () => {
                let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
                let instance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;
                let hitFunction = false;
                await view.startRendering();

                instance.onModelChanged = () => { hitFunction = true }
                instance.model.myNumbers.push(11);


                expect(hitFunction).to.be.true;
            });
        });
        describe('View Render Childs', function () {
            it('Add child bevore render', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                await instance.add(childInstance);
                let documentElement = await instance.getDocumentElement();
                await appendLastTest(instance.defaultView);

                expect(documentElement).to.not.be.null;

                //@ToDo Add again after redesign
                expect(instance.defaultView.children.length, 'children').to.equal(1);
                expect(instance.defaultView.declarativeChild.length).to.equal(3);
                expect(instance.defaultView.children[instance.defaultView.children.length - 1]).to.equal(childInstance.defaultView);

                expect(documentElement.querySelector(`[view-id='${childInstance.defaultView.id}']`)).to.not.be.null;
                instance.defaultView.remove();
            });

            it('Add child after render', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();
                let documentElement = await instance.getDocumentElement();

                await instance.add(childInstance);

                expect(documentElement).to.not.be.null;

                //@ToDo Add again after redesign
                //expect(instance.defaultView.children.length).to.equal(1);
                expect(instance.defaultView.children[instance.defaultView.children.length - 1]).to.equal(childInstance.defaultView);

                expect(documentElement.querySelector(`[view-id='${childInstance.defaultView.id}']`)).to.not.be.null;
            });

            it('Add child without render', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                await instance.add(childInstance);

                //@ToDo Add again after redesign
                //expect(instance.defaultView.children.length).to.equal(1);
                expect(instance.defaultView.children[instance.defaultView.children.length - 1]).to.equal(childInstance.defaultView);
            });

            it('Add child afterRender Callback', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                let hitFunction = false;
                childInstance.defaultView.afterRender = () => { hitFunction = true }

                await instance.getDocumentElement();
                await instance.add(childInstance);

                expect(hitFunction, 'afterRender Callback 1').to.be.true;

                // No callback on fullRerender Parent
                hitFunction = false;
                instance.defaultView.fullRerender();
                expect(hitFunction).to.be.false;
            });

            it('Add child onDomReady Callback', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                let hitFunction = false;
                childInstance.defaultView.onDomReady = () => { hitFunction = true }

                await instance.add(childInstance);
                expect(hitFunction).to.be.false;
                let view = instance.defaultView;
                await appendLastTest(view);

                expect(hitFunction).to.be.true;

                view.remove();

                hitFunction = false;
                childInstance.defaultView.fullRerender();
                expect(hitFunction).to.be.false;
            });


            it('View+Child => DomReady => removeFromDom => Add Child => AddToDom', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let view = instance.defaultView;
                let childInstance1 = idealComponentClass.getInstance().init();
                await instance.add(childInstance1);

                await appendLastTest(view);
                view.remove();

                let childInstance2 = idealComponentClass.getInstance().init();
                let hitFunction = false;
                childInstance2.defaultView.onDomReady = () => { hitFunction = true }

                await childInstance1.add(childInstance2);
                expect(hitFunction).to.be.false;

                await appendLastTest(view);
                expect(hitFunction).to.be.true;
                view.remove();
            });



            it('Add child CustomView', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                await instance.add(childInstance.itemView);

                //@ToDo Add again after redesign
                //expect(instance.defaultView.children.length).to.equal(1);
                expect(instance.defaultView.children[instance.defaultView.children.length - 1]).to.equal(childInstance.getCustomView(ItemView));
            });

            it('clear all Children', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                await instance.add(childInstance.defaultView);
                expect(instance.defaultView.children[instance.defaultView.children.length - 1]).to.equal(childInstance.defaultView);

                instance.defaultView.clear();
                expect(instance.defaultView.children.length).to.equal(0);
                let documentElement = await instance.getDocumentElement();

                expect(documentElement.querySelector(`[view-id='${childInstance.defaultView.id}']`)).to.be.null;
            });

            it('clear all Children  (without Await add)', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                instance.add(childInstance.defaultView);
                expect(instance.defaultView.children.length).to.equal(0);

                await instance.defaultView.clear();
                await instance.defaultView.renderQueue;
                expect(instance.defaultView.children.length).to.equal(0);
                let documentElement = await instance.getDocumentElement();

                expect(documentElement.querySelector(`[view-id='${childInstance.defaultView.id}']`)).to.be.null;
            });

            it('child.Remove', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                await instance.add(childInstance.defaultView);
                expect(instance.defaultView.children[instance.defaultView.children.length - 1]).to.equal(childInstance.defaultView);

                childInstance.defaultView.remove();
                //@ToDo Add again after redesign
                //expect(instance.defaultView.children.length).to.equal(0);
                let documentElement = await instance.getDocumentElement();

                expect(documentElement.querySelector(`[view-id='${childInstance.defaultView.id}']`)).to.be.null;
            });

            it('view.RemoveChildren', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();
                let childInstance2 = idealComponentClass.getInstance().init();

                await instance.add(childInstance);
                await instance.add(childInstance2);

                await instance.defaultView.removeChild(childInstance.defaultView);
                //@ToDo Add again after redesign
                //expect(instance.defaultView.children.length).to.equal(1);
                let documentElement = await instance.getDocumentElement();

                expect(documentElement.querySelector(`[view-id='${childInstance.defaultView.id}']`), 'removeChild').to.be.null;
                expect(documentElement.querySelector(`[view-id='${childInstance2.defaultView.id}']`), 'existing Child').to.not.be.null;
            });

            it('view.RemoveChildren (without Await add)', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();
                let childInstance2 = idealComponentClass.getInstance().init();

                instance.add(childInstance);
                instance.add(childInstance2);

                await instance.defaultView.removeChild(childInstance.defaultView);
                //@ToDo Add again after redesign
                //expect(instance.defaultView.children.length).to.equal(1);
                let documentElement = await instance.getDocumentElement();

                expect(documentElement.querySelector(`[view-id='${childInstance.defaultView.id}']`), 'removeChild').to.be.null;
                expect(documentElement.querySelector(`[view-id='${childInstance2.defaultView.id}']`), 'existing Child').to.not.be.null;
            });


            it('Webean only containing a Container', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                await instance.add(childInstance.overView);

                let documentElement = await instance.getDocumentElement();
                expect(documentElement.querySelector(`[view-id='${childInstance.overView.id}']`)).to.not.be.null;

                instance = idealComponentClass.getInstance().init();
                childInstance = idealComponentClass.getInstance().init();

                await instance.overView.add(childInstance);
                documentElement = await instance.overView.getDocumentElement();
                expect(documentElement.querySelector(`[view-id='${childInstance.defaultView.id}']`)).to.not.be.null;
            });

            it('Add multiple child async to check the sequence', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let children = [];
                let lastPromise;
                for (let i = 0; i < 10; i++) {
                    let childInstance = idealComponentClass.getInstance().init();
                    children.push(childInstance);
                    //@ToDo should be possible without await
                    instance.model.attribute1 = `some test ID: ${i}`;
                    lastPromise = instance.add(childInstance);
                }
                await lastPromise;


                let defaultView = instance.defaultView;
                for (let childId in children) {
                    expect(defaultView.children[(Number(childId))], `Child ${childId} match`).to.be.equal(children[Number(childId)].defaultView)
                }

                let documentElement = await instance.getDocumentElement();
                let domElements = Array.from(documentElement.querySelectorAll('.ude'));

                for (let childId in domElements) {
                    expect(domElements[Number(childId)]).to.be.equal(children[Number(childId)].defaultView.documentElement)
                }
            }).slow(0);

            it('combine add, clear, remove, and removeChildren to check the sequence', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let childInstance1 = idealComponentClass.getInstance().init();
                let childInstance2 = idealComponentClass.getInstance().init();
                let childInstance3 = idealComponentClass.getInstance().init();

                let defaultView = instance.defaultView;
                await defaultView.add(childInstance1);
                await defaultView.add(childInstance2);
                defaultView.clear();
                await defaultView.add(childInstance3);
                await defaultView.add(childInstance2);

                await defaultView.add(childInstance1);

                //@ToDo Not working. Need to be fixed
                //await defaultView.removeChild(childInstance2.defaultView);

                childInstance2.defaultView.remove();

                let documentElement = await instance.getDocumentElement();

                let domElements = Array.from(documentElement.querySelectorAll('.ude'));

                expect(domElements[0]).to.be.equal(childInstance3.defaultView.documentElement);
                expect(domElements[1]).to.be.equal(childInstance1.defaultView.documentElement);
            }).slow(0);

            it('combine add, clear, remove, and removeChildren to check the sequence (without Await add)', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let childInstance1 = idealComponentClass.getInstance().init();
                let childInstance2 = idealComponentClass.getInstance().init();
                let childInstance3 = idealComponentClass.getInstance().init();

                let defaultView = instance.defaultView;
                defaultView.add(childInstance1);
                defaultView.add(childInstance2);
                defaultView.clear();
                defaultView.add(childInstance3);
                defaultView.add(childInstance2);

                await defaultView.add(childInstance1);

                //@ToDo Not working. Need to be fixed
                //await defaultView.removeChild(childInstance2.defaultView);

                childInstance2.defaultView.remove();

                let documentElement = await instance.getDocumentElement();

                let domElements = Array.from(documentElement.querySelectorAll('.ude'));

                expect(domElements[0]).to.be.equal(childInstance3.defaultView.documentElement);
                expect(domElements[1]).to.be.equal(childInstance1.defaultView.documentElement);
            }).slow(0);

            it('HTML inside a Declarative WeBean', async () => {

                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestHtml);

                let documentElement = await view.getDocumentElement();

                expect(view.children.length).to.equal(0);
                expect(view.documentElement.children[0].children[0].children[1].children[0].outerHTML).to.equal('<a> Some Text </a>');
            }).slow(1);

            it('HTML inside a Declarative WeBean and Full Rerender', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestHtml);

                let documentElement = await view.getDocumentElement();
                expect(view.children.length).to.equal(0);

                await view.fullRerender();
                documentElement = await view.getDocumentElement();
                await appendLastTest(view);

                expect(view.children.length).to.equal(0);
                expect(view.documentElement.children[0].children[0].children[1].children[0].outerHTML).to.equal('<a> Some Text </a>');
                view.remove();
            }).slow(1);

            it('3 Declarative WeBean cascaded', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestCascade);

                let documentElement = await view.getDocumentElement();
                await appendLastTest(view);

                expect(view.children.length).to.equal(0);
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].children[0].value).to.equal('1');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].children[0].children[1].value).to.equal('2');

                view.remove();
            }).slow(0);

            it('3 Declarative WeBean cascaded onDomReady Callback', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let inputCallback = 0;

                let originalFunction = InputSelectDefaultView.prototype.onDomReady;

                InputSelectDefaultView.prototype.onDomReady = function (...args) {
                    inputCallback++;
                }


                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestCascade);

                let childInstance = idealComponentClass.getInstance().init();

                let idealOnDomReady = 0;
                view.onDomReady = function (...args) {
                    idealOnDomReady++;
                }
                let idealChildOnDomReady = 0;
                childInstance.defaultView.onDomReady = function (...args) {
                    idealChildOnDomReady++;
                }

                await view.add(childInstance);
                expect(idealOnDomReady, 'onDomReady Self Callbacks').to.equal(0);
                expect(idealChildOnDomReady, 'onDomReady Child Callbacks').to.equal(0);

                let documentElement = await view.getDocumentElement();
                expect(inputCallback, 'onDomReady Callbacks').to.equal(0);

                await appendLastTest(view);

                InputSelectDefaultView.prototype.onDomReady = originalFunction;

                expect(idealOnDomReady, 'onDomReady Self Callbacks').to.equal(1);
                expect(idealChildOnDomReady, 'onDomReady Child Callbacks').to.equal(1);


                expect(inputCallback, 'onDomReady Callbacks').to.equal(4);

                view.remove();

            }).slow(0);

            it('3 Declarative WeBean cascaded afterRender Callback', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let callback = 0;

                let originalFunction = InputSelectDefaultView.prototype.afterRender;

                InputSelectDefaultView.prototype.afterRender = function (...args) {
                    callback++;
                    //return originalFunction.bind(originalFunction)(...args)
                }

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestCascade);
                expect(callback, 'afterRender Callbacks').to.equal(0);

                let documentElement = await view.getDocumentElement();
                expect(callback, 'afterRender Callbacks').to.equal(3);

                await appendLastTest(view);

                InputSelectDefaultView.prototype.afterRender = originalFunction;

                expect(callback, 'afterRender Callbacks').to.equal(3);

                view.remove();

            }).slow(0);


            it('3 Declarative WeBean cascaded and Full Rerender', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestCascade);

                let documentElement = await view.getDocumentElement();
                await appendLastTest(view);

                expect(view.children.length).to.equal(0);
                expect(view.declarativeChild.length).to.equal(1);
                expect(view.declarativeChild[0].declarativeChild.length).to.equal(1);
                expect(view.declarativeChild[0].declarativeChild).to.deep.equal(view.declarativeChild[0].children);


                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].children[0].value).to.equal('1');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].children[0].children[1].value).to.equal('2');

                let html = documentElement.outerHTML;
                await view.fullRerender();
                documentElement = await view.getDocumentElement();

                expect(html.replaceAll(/>[\n ]+</g, '><')).to.equal(documentElement.outerHTML.replaceAll(/>[\n ]+</g, '><'));

                view.remove();
            }).slow(0);

            it('3 Declarative WeBean cascaded and Full Rerender first Child', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestCascade);

                let documentElement = await view.getDocumentElement();
                await appendLastTest(view);

                expect(view.children.length).to.equal(0);
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].children[0].value).to.equal('1');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].children[0].children[1].value).to.equal('2');

                let html = documentElement.outerHTML;
                await view.documentElement.children[0].children[0].ucpView.fullRerender();
                documentElement = await view.getDocumentElement();

                expect(html.replaceAll(/>[\n ]+</g, '><')).to.equal(documentElement.outerHTML.replaceAll(/>[\n ]+</g, '><'));
                view.remove();
            }).slow(0);

            it('3 Declarative WeBean cascaded and Full Rerender second Child', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestCascade);

                let documentElement = await view.getDocumentElement();
                await appendLastTest(view);

                expect(view.children.length).to.equal(0);
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].children[0].value).to.equal('1');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].children[0].children[1].value).to.equal('2');

                let html = documentElement.outerHTML;
                await view.documentElement.children[0].children[0].children[1].children[0].ucpView.fullRerender();
                documentElement = await view.getDocumentElement();

                expect(html.replaceAll(/>[\n ]+</g, '><')).to.equal(documentElement.outerHTML.replaceAll(/>[\n ]+</g, '><'));
                view.remove();
            }).slow(0);

            it('3 Declarative WeBean cascaded with HTML', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestCascadeWithHtml);

                let documentElement = await view.getDocumentElement();

                await appendLastTest(view);

                expect(view.children.length).to.equal(0);
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].outerHTML).to.equal('<a> Some Text </a>');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[1].children[0].value).to.equal('1');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[1].children[0].children[1].value).to.equal('2');
                view.remove();
            }).slow(0);

            it('3 Declarative WeBean cascaded with HTML and Full Rerender', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestCascadeWithHtml);

                let documentElement = await view.getDocumentElement();

                await appendLastTest(view);

                expect(view.children.length).to.equal(0);
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].outerHTML).to.equal('<a> Some Text </a>');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[1].children[0].value).to.equal('1');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[1].children[0].children[1].value).to.equal('2');

                let html = documentElement.outerHTML;
                await view.fullRerender();
                documentElement = await view.getDocumentElement();

                expect(html.replaceAll(/>[\n ]+</g, '><')).to.equal(documentElement.outerHTML.replaceAll(/>[\n ]+</g, '><'));
                view.remove();
            }).slow(0);

            it('Comment in the WeBean', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestWithComment);

                let documentElement = await view.getDocumentElement();
                await appendLastTest(view);

                expect(documentElement).to.not.be.null;
                expect(view.declarativeChild.length, 'declaredChild').to.equal(1);

                expect(view.declarativeChild[0].declarativeChild.length, 'sub declaredChild').to.equal(1);

                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[0].outerHTML).to.equal('<a> Some Text </a>');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[1].children[0].value).to.equal('');

                view.remove();
            });

            it('WeBean with direct closing Tag', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestWithComment);

                let documentElement = await view.getDocumentElement();
                await appendLastTest(view);

                expect(documentElement).to.not.be.null;
                expect(view.declarativeChild.length, 'declaredChild').to.equal(1);

                expect(view.declarativeChild[0].declarativeChild.length, 'sub declaredChild').to.equal(1);

                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[1].children[0].value).to.equal('');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[2].children[0].value).to.equal('');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[3].children[0].value).to.equal('8');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[4].children[0].value).to.equal('');
                expect(view.documentElement.children[0].children[0].children[1].children[0].children[1].children[5].children[0].value).to.equal('10');

                view.remove();
            });


            it('webeanProperty in declarative Children', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestWithComment);

                let documentElement = await view.getDocumentElement();
                await appendLastTest(view);

                expect(instance.firstInput).to.be.equal(view.declarativeChild[0].ucpComponent);
                expect(instance.lastInput, 'last weBean').to.not.be.undefined;
                expect(instance.lastInput).to.be.equal(instance.firstInput.defaultView.children[0].children[2].ucpComponent);

                view.remove();
            });

            it('Full Rerender and Plugin Container', async () => {
                let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
                let instance = idealComponentClass.getInstance().init();


                await instance.defaultView.startRendering();

                let input1 = DefaultInputSelect.getInstance().init();
                input1.model.optionList = ['select1'];
                await instance.subComponent1.add(input1);


                let input2 = DefaultInputSelect.getInstance().init();
                input2.model.optionList = ['select2'];

                await instance.subComponent2.add(input2);

                let view = instance.defaultView;
                await appendLastTest(view);

                expect(view.documentElement.querySelectorAll('.inputselect__select').length).to.equal(3);
                expect(view.documentElement.querySelectorAll('.inputselect__select > option')[0].value, 'check order of Elements').to.equal('select1');
                expect(view.documentElement.querySelectorAll('.inputselect__select > option')[1].value, 'check order of Elements').to.equal('select2');
                expect(view.documentElement.querySelectorAll('.inputselect__select > option')[2].value, 'check order of Elements').to.equal('3');

                let oldDocumentElement = view.documentElement;
                let oldDocumentElementString = oldDocumentElement.outerHTML;


                await view.fullRerender();

                expect(oldDocumentElement).to.not.equal(view.documentElement);
                expect(oldDocumentElementString.replaceAll(/[\n ]/g, '')).to.equal(view.documentElement.outerHTML.replaceAll(/[\n ]/g, ''));

                expect(view.documentElement.querySelectorAll('.inputselect__select').length).to.equal(3);
                expect(view.documentElement.querySelectorAll('.inputselect__select > option')[0].value, 'check order of Elements').to.equal('select1');
                expect(view.documentElement.querySelectorAll('.inputselect__select > option')[1].value, 'check order of Elements').to.equal('select2');
                expect(view.documentElement.querySelectorAll('.inputselect__select > option')[2].value, 'check order of Elements').to.equal('3');
                view.remove();
            }).timeout(100000).slow(0);


            it('render State Machine', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;

                expect(view.state).to.be.equal(UcpView.STATE.UNRENDERED);
                let documentElement = await view.getDocumentElement();
                expect(view.state).to.be.equal(UcpView.STATE.RENDERED);
                await appendLastTest(view);
                expect(view.state).to.be.equal(UcpView.STATE.IN_DOM);
                await view.fullRerender();
                expect(view.state).to.be.equal(UcpView.STATE.IN_DOM);

                view.remove();


            });

            it('only Container + Full Rendering', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestOnlyContainer);

                let childInstance = idealComponentClass.getInstance().init();

                await view.add(childInstance);
                await appendLastTest(view);

                let html = (await view.getDocumentElement()).outerHTML;
                expect(view.documentElement.children.length, 'Child').to.be.equal(1);

                expect(html).to.not.be.null;
                await view.fullRerender();
                expect(view.documentElement.children.length, 'Child').to.be.equal(1);

                expect(view.documentElement.outerHTML.replaceAll(/>[\n ]+</g, '><')).to.be.equal(html.replaceAll(/>[\n ]+</g, '><'));

                view.remove();

            });



            it('render and FullRerender outside of DOM', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;

                await instance.add(childInstance);

                let html = (await view.getDocumentElement()).outerHTML;

                expect(html).to.not.be.null;
                view.fullRerender();
                expect(view.state).to.equal(UcpView.STATE.REQUIRE_FULL_RERENDER);
                expect(view.documentElement.outerHTML).to.be.equal(html);
                let promise = view.getDocumentElement();
                expect(view.state).to.equal(UcpView.STATE.RENDERING);
                await promise;
                expect(view.state).to.equal(UcpView.STATE.RENDERED);

                expect(view.documentElement.outerHTML.replaceAll(/>[\n ]+</g, '><')).to.be.equal(html.replaceAll(/>[\n ]+</g, '><'));


            });


            it('Add, remove and add a Child again', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let childInstance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;
                let childView = childInstance.defaultView;

                await appendLastTest(view);
                expect(childView.state).to.be.equal(UcpView.STATE.UNRENDERED);

                await view.add(childInstance);
                expect(childView.state).to.be.equal(UcpView.STATE.IN_DOM);

                let html = (await view.getDocumentElement()).outerHTML;

                childView.remove();
                expect(childView.state).to.be.equal(UcpView.STATE.RENDERED);

                await view.add(childInstance);
                expect(childView.state).to.be.equal(UcpView.STATE.IN_DOM);

                expect(view.documentElement.outerHTML.replaceAll(/>[\n ]+</g, '><')).to.be.equal(html.replaceAll(/>[\n ]+</g, '><'));

                childView.remove();

                let hitFunction = 0;
                childView.onDomReady = () => { hitFunction++ }
                await view.add(childView);

                expect(hitFunction, 'onDomReady Callback').to.be.equal(1);

                view.remove();
            });

            it('Declarative Sub View of your own Component (<this-view>)', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestChildView);

                await appendLastTest(view);

                expect(view.children.length, 'child length').to.equal(1);
                expect(view.children[0], 'child').to.equal(instance.defaultView);


                view.remove();
            });

            it('MLC as TAG (<mlc-render>)', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestMLC);

                await appendLastTest(view);

                expect(view.container.innerText).to.equal('My English Text!!!');
                expect(view.children.length, 'child').to.equal(0);


                view.remove();
            });

            it('Render of destroyed Component', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let view = instance.defaultView;

                await appendLastTest(view);

                await instance.destroy();

                expect(view.isInDom).to.be.false;

                view.remove();
            });

            it('Change the model (FullRerender) and add children in parallel', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();
                let view = instance.getCustomView(IdealComponentUcpDomainEntityTestHtml);

                await appendLastTest(view);

                instance.model.myNumbers = [0, 0];

                for (let i = 0; i < 10; i++) {
                    let childInstance = idealComponentClass.getInstance().init();
                    childInstance.model._componentInfo.description += i;

                    let itemView = childInstance.itemView;
                    instance.model.myNumbers[0]++;
                    instance.model.myNumbers[1]++;
                    view.add(itemView);
                }
                // No Views are added already
                expect(view.children.length).to.equal(0);
                // Wait for the Views to be added
                await view;
                expect(view.children.length).to.equal(10);
                view.remove();

            }).timeout(10000);

            it('Siblings on Views', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let child1 = idealComponentClass.getInstance().init();
                let child2 = idealComponentClass.getInstance().init();
                let view = instance.defaultView;

                await appendLastTest(view);

                instance.add(child1);
                await instance.add(child2);

                expect(child1.defaultView.siblings.length).to.equal(1);
                expect(child1.defaultView.siblings[0]).to.equal(child2.defaultView);

                view.remove();
            });

            it('Child Parent Status during FullRerender', async () => {
                let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
                let instance = idealComponentClass.getInstance().init();

                let child1 = idealComponentClass.getInstance().init();

                instance.add(child1);
                let view = instance.defaultView
                await appendLastTest(view);

                await view;
                let promiseHandler = Thinglish.createPromise();
                child1.defaultView.afterRender = async function () {
                    await promiseHandler.promise;
                }

                let promiseHandler2 = Thinglish.createPromise();
                child1.defaultView.onDomReady = async function () {
                    await promiseHandler2.promise;
                }

                expect(child1.defaultView.state).to.equal(UcpView.STATE.IN_DOM);
                let result2 = child1.defaultView.fullRerender();
                expect(child1.defaultView.state).to.equal(UcpView.STATE.RENDERING);
                
                expect(child1.defaultView.parent, 'parent before afterRender').to.equal(view);
                await Thinglish.wait(10);

                expect(child1.defaultView.parent, 'parent during afterRender').to.equal(view);
                promiseHandler.setSuccess();
                await Thinglish.wait(10);

                expect(child1.defaultView.parent, 'parent during onDomReady').to.equal(view);
                promiseHandler2.setSuccess();
                await Thinglish.wait(10);

                expect(child1.defaultView.parent, 'parent after onDomReady').to.equal(view);

                view.remove();
            });

        });

    });
});


describe('Component SubComponent', function () {
    it('Async lazy loaded getMethod', async () => {
        let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
        let instance = idealComponentClass.getInstance().init();

        let subComponentPromise1 = instance.getSubComponent();
        let subComponentPromise2 = instance.getSubComponent();
        let subComponent1 = await subComponentPromise1;
        let subComponent2 = await subComponentPromise2;

        expect(subComponent1).to.be.instanceOf(DefaultCollapsiblePanel);

        expect(subComponent1, 'Components are identical').to.be.equal(subComponent2);


        const newSubComponent = {};
        instance.setSubComponent(newSubComponent);
        expect(await instance.getSubComponent()).to.be.equal(newSubComponent);


        let instance2 = idealComponentClass.getInstance().init();

        let subComponentPromise2_1 = instance2.getSubComponent();
        expect(subComponent1, 'Components are not identical').to.not.be.equal(subComponentPromise2_1);

    });

    it('Normal getter', async () => {
        let idealComponentClass = await IOR.getInstance().init(idealComponentUcpDomainEntityPath).load();
        let instance = idealComponentClass.getInstance().init();

        let subComponent1 = instance.subComponent;
        let subComponent2 = instance.subComponent;

        expect(subComponent1).to.be.instanceOf(DefaultCollapsiblePanel);

        expect(subComponent1).to.be.equal(subComponent2);


        //Break the sync getter
        const getComp = async () => { return await instance.subComponent }
        let subComponentPromise1 = getComp();
        let subComponentPromise2 = getComp();
        let subComponent11 = await subComponentPromise1;
        let subComponent12 = await subComponentPromise2;

        expect(subComponent11).to.be.instanceOf(DefaultCollapsiblePanel);

        expect(subComponent11).to.be.equal(subComponent12);

    });
});


describe('UcpModel', function () {



    it('delete non Existing UDEs on Load', async () => {
        let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
        let component = idealComponentClass.getInstance().init();

        let component1 = idealComponentClass.getInstance().init();
        await component1.PM.create();
        let component2 = idealComponentClass.getInstance().init();
        let component3 = idealComponentClass.getInstance().init();
        await component3.PM.create();
        let component4 = idealComponentClass.getInstance().init();

        let component5 = idealComponentClass.getInstance().init();

        component.model = {};
        let schema = component.createDefaultSchema().keys({
            arrayTest: UcpSchema.array().items(UcpSchema.ior()),
            test2: UcpSchema.ior(),
        });
        component.ucpModel.schema = schema;

        component.model.arrayTest = [];
        component.model.arrayTest.push(component1.IOR.href);
        component.model.arrayTest.push(component2.IOR.href);
        component.model.arrayTest.push(component3.IOR.href);
        component.model.arrayTest.push(component4.IOR.href);

        component.model.test2 = component5.IOR.href;

        await component.ucpModel.load();

        await component1.PM.delete();
        await component3.PM.delete();


        expect(component.model.arrayTest.length).to.equal(2);
        expect(component.model.arrayTest[0]).to.equal(component1);
        expect(component.model.arrayTest[1]).to.equal(component3);

        expect(component.model.test2).to.be.undefined;


    }).timeout(100000);
});

describe('Validate UcpDomainEntity Store', function () {
    let ior = '';
    let retIor;

    let modelSubComponent;

    let idealComponent;

    it('setup', async () => {
        if (!ONCE.lookup(SessionManager) || ONCE.lookup(SessionManager).length === 0) {
            await IOR.getInstance().init('/EAMD.ucp/Components/org/Keycloak/KeycloakSessionManager/4.3.0/KeycloakSessionManager.component.xml').load();
            await MochaTestKeycloakSessionManager.getInstance().init('Mocha1');
        }
    })

    it('IOR load promise handling', async () => {
        let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
        let component = idealComponentClass.getInstance().init();

        await component.PM.create();

        let ior = IOR.getInstance().init(component.IOR.href);
        let promise1 = ior.load();
        let promise2 = ior.load();


        expect(promise1).to.equal(promise2);

        let result1 = await promise1;
        let result2 = await promise2;

        await component.PM.delete();


        expect(result1).to.equal(result2);



    }).timeout(100000);



    it('Create UcpDomainEntity', async () => {
        //await IOR.getInstance().init('/EAMD.ucp/Components/org/Keycloak/KeycloakSessionManager/4.3.0/KeycloakSessionManager.component.xml').load();
        //await MochaTestKeycloakSessionManager.getInstance().init('Mocha1');

        let iorObject = IOR.getInstance().init(idealComponentUcpDomainEntityPath)
        const idealComponentClass = await iorObject.load();
        idealComponent = idealComponentClass.getInstance().init();
        //idealComponent.IOR.url = 'ior:ude:rest:http://localhost:8080/ior/lol';
        await idealComponent.PM.create();
        idealComponent.model.attribute1 = 'bar';
        ior = idealComponent.IOR.url;
        console.log(ior);

        let iorObject2 = IOR.getInstance().init(ior);
        let idealComponent2 = await iorObject2.load();

        await idealComponent.ucpModel;
        await idealComponent.PM;


        expect(idealComponent).to.be.equal(idealComponent2);
    }).slow(2);



    it('Update Owner on Creation', async () => {
        expect(idealComponent.model._access?.owner, 'update Owner').to.not.be.undefined;
    }).slow(2);


    it('Retrieve UcpDomainEntity (HTTPS + REST)', async () => {

        //await new Promise(resolve => setTimeout(() => resolve(), 50)); // Git the save some time
        UcpDomainEntityLoader.clearObjectStore();

        let iorObject = IOR.getInstance().init(ior);
        const idealComponent = await iorObject.load();
        expect(idealComponent.model.attribute1).to.be.equal('bar');
        expect(await idealComponent.lookup(PersistanceManager)[0].hasWriteAccess(), 'writeAccess').to.be.true;

        retIor = IdealComponentUcpDomainEntity.getInstance().init();

        idealComponent.model.ref = retIor;
        idealComponent.model.ref.model.attribute1 = 'bar4';
        await idealComponent.PM;

        modelSubComponent = idealComponent.model.ref.ucpModel.export;

        idealComponent.model.multiSet({ attribute1: 'bar2', subParam: { text: 'My text' } });
        //await idealComponent.ucpModel;

        await idealComponent.PM;

        await retIor.PM.create();


    }).slow(2);


    it('Retrieve UcpDomainEntity (WSS + REST)', async () => {

        //await new Promise(resolve => setTimeout(() => resolve(), 50)); // Git the save some time
        UcpDomainEntityLoader.clearObjectStore();

        let iorObject = IOR.getInstance().init(ior);
        iorObject.protocol.remove(/^https?$/);
        iorObject.protocol.push('wss');
        const idealComponent = await iorObject.load();
        expect(idealComponent.model.attribute1).to.be.equal('bar2');

    }).slow(2);

    it('Update UcpDomainEntity (HTTPS + REST)', async () => {
        UcpDomainEntityLoader.clearObjectStore();

        let iorObject = IOR.getInstance().init(ior);
        const idealComponent = await iorObject.load();
        expect(idealComponent.model.attribute1).to.be.equal('bar2');
        expect(idealComponent.model.subParam.text).to.be.equal('My text');

        await idealComponent.model.load();
        expect(idealComponent.model.ref.model.attribute1).to.be.equal('bar4');

    }).slow(2);

    it('Update UcpDomainEntity (WSS + REST)', async () => {
        UcpDomainEntityLoader.clearObjectStore();

        let iorObject = IOR.getInstance().init(ior);
        iorObject.protocol.remove(/^https?$/);
        iorObject.protocol.push('wss');
        const idealComponent = await iorObject.load();
        expect(idealComponent.model.attribute1).to.be.equal('bar2');
        expect(idealComponent.model.subParam.text).to.be.equal('My text');


        await idealComponent.model.load();
        expect(idealComponent.model.ref.model.attribute1).to.be.equal('bar4');

    }).slow(2);

    it('Find UcpDomainEntity', async () => {
        //let idealComponent = await IOR.load(ior);
        let componentList = await retIor.findAll();
        expect(componentList[0].id).to.be.equal(retIor.id);

    }).slow(2);


    it('Update the Array', async () => {

        let iorObject = await IOR.load(ior);
        iorObject.model.multiSet({ myNumbers: [1, 2, 3, 4] });

        await this.PM;
        iorObject.model.multiSet({ myNumbers: [] });
        await this.PM;

    }).slow(2).timeout(20000);

    it('Call Global Server Action', async () => {

        let iorObject = IOR.getInstance().init(ior);
        iorObject.protocol.push('wss');
        iorObject.protocol.remove(/https?/);

        let result = await iorObject.callAction('actionId:global:IdealComponentUcpDomainEntity.getModelRef');
        delete result._access;
        expect(result).to.deep.equal(modelSubComponent);

    }).slow(2);

    it('Destroy local', async () => {
        let idealComponent = await IOR.load(ior);
        idealComponent.destroy();

        expect(idealComponent.componentState).to.equal(UcpComponent.COMPONENT_STATES.DESTROYED);

        let idealComponent2 = await IOR.load(ior);

        expect(idealComponent).to.not.equal(idealComponent2);
        expect(idealComponent2.model.subParam.text).to.be.equal('My text');

    }).slow(2);

    it('Delete UcpDomainEntity', async () => {

        let iorObject = IOR.getInstance().init(ior);
        let idealComponent = await iorObject.load();
        await idealComponent.PM.delete();

        //UcpDomainEntityLoader.clearObjectStore();

        iorObject = IOR.getInstance().init(ior);
        idealComponent = await iorObject.load();

        expect(idealComponent).to.be.undefined;

        await retIor.PM.delete();
    }).slow(2);


    it('UDE Callback afterCreate', async () => {
        const idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
        idealComponent = idealComponentClass.getInstance().init();
        let hit = false;
        idealComponent.ude.afterCreate = function () {
            hit = true;
        }
        await idealComponent.PM.create();

        expect(hit).to.be.true;
        ior = idealComponent.IOR.url;
    }).slow(2);

    it('UDE Callback afterLoad', async () => {
        const idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath);
        const originalInit = idealComponentClass.prototype.init;

        let hit = false;
        idealComponentClass.prototype.init = function (...args) {
            let initThis = originalInit.call(this, ...args);
            initThis.ude.afterLoad = function () {
                hit = true;
            }
            return initThis;
        }

        UcpDomainEntityLoader.clearObjectStore();
        let idealComponent = await IOR.load(ior);

        idealComponentClass.prototype.init = originalInit;

        expect(hit).to.be.true;
        await idealComponent.PM.delete();
    }).slow(2);

    it('Create UcpDomainEntity Notify Mode', async () => {
        let iorObject = IOR.getInstance().init(idealComponentUcpDomainEntityPath)
        const idealComponentClass = await iorObject.load();
        idealComponent = idealComponentClass.getInstance().init();
        idealComponent.model.multiSet({ _componentConfig: { udePersistanceManagerMode: UDEPersistanceManager.MODE_NOTIFY } });
        let url = idealComponent.IOR.url;
        await idealComponent.PM.create();

        expect(idealComponent.IOR.url).to.be.equal(url);

        UcpDomainEntityLoader.clearObjectStore();

        idealComponent = await IOR.load(url);
        expect(idealComponent.IOR.url).to.be.equal(url);


    }).slow(2);


});


describe('SessionManager and Client Cleanup', function () {
    let currentSessionManager;
    it('Check existing SessionManager', async () => {
        let sessionManagerList = ONCE.Store.lookup(SessionManager);
        currentSessionManager = sessionManagerList[0];
        expect(sessionManagerList.length).to.equal(1);
        expect(sessionManagerList[0]).to.be.instanceOf(MochaTestKeycloakSessionManager);
    });

    it('Logout SessionManager', async () => {
        await currentSessionManager.logout();
    }).timeout(1000);

    it('Check SessionManager Cleanup', async () => {
        expect(currentSessionManager.componentState).to.equal(UcpComponent.COMPONENT_STATES.DESTROYED);
        expect(ONCE.Store.lookup(SessionManager).length).to.be.equal(0);
    });

    it('Check Client Cleanup', async () => {
        let httpClient = Client.findClient(IOR.getInstance().init(ONCE.ENV.ONCE_DEFAULT_URL));
        expect(httpClient).to.be.instanceOf(DefaultHTTPClient);
        expect(httpClient.sessionManager).to.be.undefined;


        for (const client of ONCE.Store.lookup(Client)) {
            // Only UcpComponents have this status
            if (Thinglish.isInstanceOf(client, UcpComponent)) {
                expect(client.componentState, `Client status (${client.type.class.name})`).to.be.equal(UcpComponent.COMPONENT_STATES.ACTIVE);
            }
        }

        for (const client of Object.values(DefaultHTTPClient.instanceStore.registry)) {
            expect(client.componentState, 'DefaultHTTPClient status').to.be.equal(UcpComponent.COMPONENT_STATES.ACTIVE);
        }


        let restIor = IOR.getInstance().init(ONCE.ENV.ONCE_DEFAULT_URL);
        restIor.protocol.push('rest');

        let restClient = Client.findClient(restIor);
        expect(restClient).to.be.instanceOf(DefaultRESTClient);
        expect(restClient.sessionManager).to.be.undefined;
    });

    it('Login with Mocha2, test and logout again', async () => {
        const sm = await MochaTestKeycloakSessionManager.getInstance().init('Mocha2');

        let restIor = IOR.getInstance().init(ONCE.ENV.ONCE_DEFAULT_URL);
        restIor.protocol.push('rest');
        let restClient = Client.findClient(restIor);
        expect(restClient).to.be.instanceOf(DefaultRESTClient);
        expect(restClient.sessionManager).to.be.equal(sm);
        expect(ONCE.Store.lookup(SessionManager)[0]).to.be.equal(sm);

        await sm.logout();
    });

    it('Login with Mocha2 open Websocket and logout', async () => {
        let sm = await MochaTestKeycloakSessionManager.getInstance().init('Mocha2');


        let idealComponentClass = await IOR.load(idealComponentUcpDomainEntityPath)
        idealComponent = idealComponentClass.getInstance().init();
        //idealComponent.IOR.url = 'ior:ude:rest:http://localhost:8080/ior/lol';
        idealComponent.model.multiSet({ _componentConfig: { udePersistanceManagerMode: UDEPersistanceManager.MODE_NOTIFY } });

        let result = await idealComponent.PM.create();

        let udeIor = idealComponent.IOR.href;


        await sm.logout();

        expect(ONCE.lookup(WebSocketClient).length).to.equal(0);

        sm = await MochaTestKeycloakSessionManager.getInstance().init('Mocha2');



        idealComponent = await IOR.load(udeIor);
        idealComponent.PM.delete();

        sm.logout();
    });

});
