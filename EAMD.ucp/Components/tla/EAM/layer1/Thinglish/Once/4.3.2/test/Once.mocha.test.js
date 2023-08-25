/*
 * The Web 4.0 ™ platform is supported by enterprise level subscription through Cerulean Circle GmbH
 *    Copyright (C) 2017  Marcel Donges (marcel@donges.it)
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
    {
      license: "AGPL3.0",
      href: "http://www.gnu.org/licenses/agpl-3.0.de.html"
      coAuthors: [
        "Igor",
        "Philipp Bartels",
        }
    }
 */



/* global expect */

/*
var ONCE = require('../src/js/Once.class');
module.paths.push("../src/node_modules");
var chai = require('../src/node_modules/chai');
const {expect,should,assert} = chai;
*/


// ONCE 4.3.0 feat/WODA-1360-IOR-ENTITY-STORE

// designed to only run with 
// npm test
// NOT in the browser

//var createStatsCollector = require('./stats-collector');

const why_is_node_running = require('../node_modules/why-is-node-running') // should be your first require


var deepCopy = (data) => JSON.parse(JSON.stringify(data));

var compareData = (data) => { let result = { ...data }; delete result.time; return result; };


var sendRequest = async (method, ior, header, data) => {
  let requestOptions = {
    method,
    headers: header,
    body: JSON.stringify(data),
    redirect: 'follow'
  };

  const response = await fetch(ior, requestOptions)
  return await response.json();

}

const idealUDE = "/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponentUcpDomainEntity/4.3.0/IdealComponentUcpDomainEntity.component.xml";

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
    .assert = chai.assert;

const expressForceHttps = require('express-force-https');
var ONCE = require('../src/js/Once.class');
const version = "4.3.2";
console.log = () => { }

describe('Check DB ', function () {
  it('Check DB is available', async () => {
    let result = await ONCE.DBClient.query('select now()');
    expect(result.rows.length).to.equal(1);
  });

  it('Insert udeAccessValidation Script', async () => {
    try {
      let result = await ONCE.DBClient.query(`select * from udeAccessValidation('${UUID.uuidv4()}',null,'${UUID.uuidv4()}' ,array[''], array[''])`);
      expect(result.rows.length).to.equal(1);
    } catch (e) {
      logger.warn('Create missing DB Function udeAccessValidation');
      const fs = require('fs');
      const data = await fs.readFileSync('src/db.init/udeAccessValidation.sql', 'utf8');
      await ONCE.DBClient.query(data);
    }
  });

  it('Check udeAccessValidation Script', async () => {
    let result = await ONCE.DBClient.query(`select * from udeAccessValidation('${UUID.uuidv4()}',null,'${UUID.uuidv4()}' ,array[''], array[''])`);
    expect(result.rows.length).to.equal(1);
  });
});

describe('Check Config ', function () {
  it('Check if ONCE_DEFAULT_URL is set correctly', async () => {
    expect(ONCE.ENV.ONCE_DEFAULT_URL).to.not.be.undefined;
  });

  it('Check if ONCE_DEFAULT_KEYCLOAK_SERVER is set correctly', async () => {
    const ONCE_DEFAULT_KEYCLOAK_SERVER = JSON.parse(ONCE.ENV.ONCE_DEFAULT_KEYCLOAK_SERVER)
    expect(ONCE_DEFAULT_KEYCLOAK_SERVER?.realm, 'Missing Config Parameter realm').to.not.be.undefined;
    expect(ONCE_DEFAULT_KEYCLOAK_SERVER?.clientId, 'Missing Config Parameter clientId').to.not.be.undefined;
    expect(ONCE_DEFAULT_KEYCLOAK_SERVER?.url, 'Missing Config Parameter url').to.not.be.undefined;
    expect()

  });

});


describe('Booting Once ' + version, function () {
  let Component, c1, testDiv;
  const versionNamespace = version.replace(/\./g, "_");
  const descriptor = '/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/' + version + '/Once.component.xml';


  it('should be a singleton, that can be started only once', async () => {
    let existingONCE = ONCE;
    let newOnce = await Once.start();
    existingONCE.should.equal(newOnce);
  }).timeout(600000);

  it('should check if Once is a Class and ONCE has a mode', done => {
    //c1 = Component.getInstance().init();
    //console.log(descriptor);
    expect(Thinglish.isClass(Namespaces.tla.EAM.layer1.Thinglish.Once[versionNamespace].Once)).to.be.true;
    expect(ONCE.mode).to.be.a('string');
    done();
  });

  it('checks if Once was registered under the correct namespace', done => {
    expect(Namespaces.tla.EAM.layer1.Thinglish.Namespace[versionNamespace].Namespace).to.be.equal(Namespace);
    expect(Namespaces.tla.EAM.layer1.Thinglish.Once).to.be.instanceOf(Namespace);

    //expected false namespaces that should be of type Version but are of type Namespcae
    expect(Namespaces.tla.EAM.layer1.Thinglish.Once[versionNamespace]).to.be.instanceOf(Namespace);
    expect(Namespaces.tmp.light.Thinglish.namespace).to.be.instanceOf(Namespace);
    expect(Once.namespace).to.be.instanceOf(Namespace);
    expect(Version.namespace).to.be.instanceOf(Namespace);

    expect(Thinglish.namespace).to.be.instanceOf(Version);

    expect(Namespaces.tla.EAM.layer1.Thinglish.Once[versionNamespace].Once).to.be.equal(Once);
    //expect(Namespaces.tla.EAM.layer1.Thinglish.Once[versionNamespace].Once).to.be.equal(Once);
    done();
  });


  it('checks if a Namespace can be renamed', done => {
    expect(Namespaces.tla.EAM.layer1.name).to.be.a('string');
    //console.log(Namespaces.tla.EAM.layer1.name);
    Namespaces.tla.EAM.layer1.name = "layer4";
    expect(Namespaces.tla.EAM.layer1).to.be.an('undefined');
    //console.log(Namespaces.tla.EAM.layer2.name);
    expect(Namespaces.tla.EAM.layer4.name).to.be.a('string', "layer4");

    let thinglishNamespace = Namespaces.tla.EAM.layer4.Thinglish;
    expect(Namespaces.tla.EAM.layer4.Thinglish.Once).to.be.instanceOf(Namespace);
    //expect(Namespaces.tla.EAM.layer2.Thinglish.Once[versionNamespace].Once).to.be.equal(Once);
    //expect(Namespaces.tla.EAM.layer2.Thinglish.Once[versionNamespace].Once).to.be.equal(Once);

    Namespaces.tla.EAM.layer4.name = "layer1";
    expect(Namespaces.tla.EAM.layer1.Thinglish).to.be.equal(thinglishNamespace);
    done();
  });

  it('converts a Namespace into a package name', done => {
    //console.log(Namespaces.tla.EAM.layer1.Thinglish.Once.package);
    expect(Once.namespace.package).to.be.a('string', 'tla.EAM.layer1.Thinglish.Once.' + versionNamespace);
    done();
  });

  it('checks if common Version names are matched', done => {
    //console.log(Namespaces.tla.EAM.layer1.Thinglish.Once.package);
    expect(Namespace.isVersionName("4_0_0")).to.be.true;
    expect(Namespace.isVersionName("4_0_0-test")).to.be.true;
    expect(Namespace.isVersionName("a4_0_0")).to.be.false;
    expect(Namespace.isVersionName("4_a0_0")).to.be.false;
    expect(Namespace.isVersionName("4_0_a0")).to.be.false;
    expect(Namespace.isVersionName("1234_2560_850-SNAPSHOT.2019.10.10")).to.be.true;
    expect(Namespace.isVersionName("1d234_2560_850-SNAPSHOT.2019.10.10")).to.be.false;
    expect(Namespace.isVersionName("1234_2560_850/SNAPSHOT.2019.10.10")).to.be.false;
    expect(Namespace.isVersionName("1234_2560_850-SNAPSHOT_2019_10_10")).to.be.true;
    // @todo should be true ... but is not yet
    //expect(Namespace.isVersionName("4_0")).to.be.true;
    done();
  });

  it('checks if common Version names are converted correctly', done => {
    //console.log(Namespaces.tla.EAM.layer1.Thinglish.Once.package);
    expect(Version.parse("4_0_0").versionNumber).to.be.equal("4.0.0");
    expect(Version.parse("4_0_0-test").versionNumber).to.be.equal("4.0.0-test");
    expect(Version.parse("1234_2560_850-SNAPSHOT.2019.10.10").versionNumber).to.be.equal("1234.2560.850-SNAPSHOT.2019.10.10");
    // @todo should be true ... but is not yet
    // expect(Version.parse("1234_2560_850-SNAPSHOT_2019_10_10").versionNumber).to.be.equal("1234.2560.850-SNAPSHOT_2019_10_10");
    done();
  });

  after(done => {
    done();
  });
});


describe('Checking the API of ONCE ' + version, function () {
  it('checks if all functions requires methods are declared', done => {
    //console.log(Namespaces.tla.EAM.layer1.Thinglish.Once.package);
    expect(Once.start).to.exist;
    expect(ONCE.init).to.exist;
    expect(ONCE.discover).to.exist;
    //expect(ONCE.getIOR).to.exist;
    expect(ONCE.load).to.exist;
    expect(ONCE.call).to.exist;
    //expect(ONCE.update).to.exist;
    //expect(ONCE.hibernate).to.exist;
    //expect(ONCE.stage).to.exist;
    //expect(ONCE.stop).to.exist;
    //expect(ONCE.getStream).to.exist;
    //expect(ONCE.Store).to.exist;
    //expect(ONCE.getQoS).to.exist;
    done();
  });

  after(done => {
    done();
  });
});



describe('Checking the Typesystem ' + version, function () {
  it('checks all registered Namespaces after boot and their TypeDescriptors', done => {
    //console.log(Namespaces.tla.EAM.layer1.Thinglish.Once.package);
    const declaredTypes = Namespace.discover();
    declaredTypes.forEach(This => console.log(This.name, ":", This.type.name, This.type.extends ? "extends " + This.type.extends.name : ""));
    let n = new Namespace("testNamespace", Namespaces);
    console.log(n.name, n._private.get(n).id);

    let t = new Thing();
    // geht mit neuem constructor proxy
    //console.log(t.name, t.id, "so gehts nicht alles undefined");
    t.init();
    //console.log(t.name, t.id, "so gehts nicht alles undefined");


    t = Thing.getInstance();
    console.log(t.name, t.id, t.IOR, "so gehts");


    done();
  });

  after(done => {
    done();
  });
});


describe('Checking Interface discover  ' + version, function () {

  let implementations = [];


  let checkImplementation = function (aClass) {
    let allTypes = Thinglish.getAllTypes(aClass);
    console.log("All Types of Class", aClass.name);
    allTypes.forEach(i => {
      console.log("\t", i.name);
    });


    let directImplements = aClass.type.implements;
    directImplements.forEach(i => {
      let allStaticFeatures = Object.getOwnPropertyDescriptors(i);
      let allStaticFunctionNames = [];
      console.log("Interface Class", i.name);
      for (s in allStaticFeatures) {
        let descriptor = allStaticFeatures[s];
        //console.log("\timplements static",s,":",descriptor,"which is of type",typeof descriptor.value);
        allStaticFunctionNames.push(s);
      }




      let interfacePrototype = i.prototype; //NOT Object.getPrototypeOf(i)  which gives Interface (=== extends)
      let allPrototypeFeatures = Object.getOwnPropertyDescriptors(interfacePrototype);
      let allFunctionNames = [];
      console.log("Interface prototype", interfacePrototype);
      for (s in allPrototypeFeatures) {
        let descriptor = allPrototypeFeatures[s];
        //console.log("\timplements feature",s,":",descriptor,"which is of type",typeof descriptor.value);
        allFunctionNames.push(s);
      }

    });

  }

  //@Marcel Please check
  // it('checks available Interfaces', done => {
  //   let array = Interface.discover();
  //   console.log("List of interfaces:");
  //   array.forEach(e => {
  //     console.log(e.name);
  //     console.log("\timplemented by");
  //     let array = ONCE.global[e.name].discover();
  //     if (Array.isArray(array)) array.forEach(i => {
  //       console.log("\t\t", i.name);
  //       implementations.push(ONCE.global[i.name].name);
  //     });
  //   });
  //   done();
  // });

  it('checks if all features are correctly inherited', done => {
    implementations.forEach(i => {
      let aClass = ONCE.global[i];
      if (!aClass) {
        console.warn("NOT found: Class", i)
        return
      }
      let interfaces = aClass.type.implements;
      if (!interfaces)
        throw Error(i + " implements is not an array!")
      console.log(ONCE.global[i].name, "implements", interfaces.map(impl => impl.name));
      //let staticFeatures = Object.getOwnPropertyDescriptors(object);
      checkImplementation(ONCE.global[i]);
    })

    done();
  }).timeout(15000);

  it('checks if all features UutId are correctly inherited', done => {
    let idProvider = IdProvider.getInstance().init();
    console.log("call inherited method on ID:", idProvider.nonStaticMethodOfIdProvider());

    done();
  });

  //no Proxy for constructors any more, since they cannot handle super()
  // it('checks if constructor proxy works for IdProvider', done => {

  //     let idProvider = new IdProvider();
  //     expect(idProvider).to.be.instanceOf(UutID);
  //     console.log("creat ID:", idProvider.createId(idProvider));

  //   done();
  // });
});


describe('Checking IOR creation  ' + version, function () {
  let dependencies = Once.dependencies;
  let iors = undefined;
  let mixedIORs = [];

  it('checks IOR creation in diffrent formats', done => {
    console.log("Dependencies:", dependencies);
    iors = dependencies.map(
      d => new IOR().init(d)
    );
    console.log("Dependencies in package format:", iors);

    let aWeBean = new IOR().init("/EAMD.ucp/Components/com/canvas-gauges/CanvasGauges/2.1.7/src/html/weBeans/CanvasGauges.weBean.html");
    expect(aWeBean.loader).to.be.instanceOf(WeBeanLoader);
    let onceEnv = new IOR().init("ior:rest:/once/env");
    //expect(aWeBean.loader).to.be.instanceOf(WeBeanLoader); 

    mixedIORs = [aWeBean, onceEnv]

    done();
  });


  it('checks IOR as string', done => {
    //console.log("Dependencies:", iors);
    console.log("Dependencies in string format:", iors.map(i => i.toString()));
    console.log("Dependencies in loader names:", iors.map(ior => ior.loader.name));
    console.log("Dependencies in loader names:", iors.map(ior => ior.filename));
    done();
  });
});

describe('Checking Dependencies ' + version, function () {
  it('checks all dependencies of ONCE in diffrent formats', done => {
    let dependencies = Once.dependencies;
    console.log("Dependencies:", dependencies);
    let dependenciesInPackageFormat = dependencies.map(
      d => Namespace.path2namespace(d)
    );
    console.log("Dependencies in package format:", dependenciesInPackageFormat);
    done();
  });
});

describe('Checking Units ' + version, function () {
  let idealComponentClass;
  it('check discover units', async () => {
    idealComponentClass = await IOR.getInstance().init(idealUDE).load();
    expect(idealComponentClass.type.ucpComponentDescriptor.units?.[0]?.model?.class).to.be.equal(IdealComponentUcpDomainEntityDefaultView);
    let instance = idealComponentClass.getInstance().init();
  });

  it('check discover units (ViewClass)', async () => {
    const discoverResult = IdealComponentUcpDomainEntityDefaultView.discoverUnits();
    expect(discoverResult).to.be.equal(IdealComponentUcpDomainEntityDefaultView._private.units);
    expect(discoverResult?.[0]?.model?.type).to.be.equal(Unit.TYPE.WE_BEAN);
    expect(discoverResult?.[1]?.model?.type).to.be.equal(Unit.TYPE.LESS);

    // Discover Filter
    expect(IdealComponentUcpDomainEntityDefaultView.discoverUnits(Unit.TYPE.LESS)?.[0]).to.be.equal(discoverResult?.[1]);
  });

  it('check WeBean Unit IOR', async () => {
    let weBean = IdealComponentUcpDomainEntityDefaultView.discoverUnits(Unit.TYPE.WE_BEAN)?.[0];
    expect(weBean?.targetIOR?.href).to.be.equal('ior:' + idealComponentClass.IOR.basePath + weBean.model.href.replace(/^\./, ''));
  });

});


describe('Views ' + version, function () {
  let instance;
  it('controller.getView', async () => {
    let idealComponentClass = await IOR.getInstance().init(idealUDE).load();
    instance = idealComponentClass.getInstance().init();
    let defaultView = instance.controller.getView(instance, DefaultView);
    expect(defaultView).to.be.instanceOf(IdealComponentUcpDomainEntityDefaultView);

    let defaultView2 = instance.controller.getView(instance, DefaultView);
    expect(defaultView2).to.be.equal(defaultView);
  });

  it('controller.getView (new Instance)', async () => {
    let defaultView = instance.controller.getView(instance, DefaultView);
    expect(defaultView).to.be.instanceOf(IdealComponentUcpDomainEntityDefaultView);

    let defaultViewClone = instance.controller.getView(instance, DefaultView, true);
    expect(defaultViewClone).to.not.be.equal(defaultView);
  });

  it('ucpComponent.defaultView', async () => {
    let defaultView = instance.controller.getView(instance, DefaultView);
    expect(defaultView).to.be.instanceOf(IdealComponentUcpDomainEntityDefaultView);

    let defaultView2 = instance.defaultView;
    expect(defaultView2).to.be.equal(defaultView);
  });

});

describe('Views documentElement' + version, function () {
  let instance;
  it('view.documentElement', async () => {
    let idealComponentClass = await IOR.getInstance().init(idealUDE).load();
    instance = idealComponentClass.getInstance().init();
    let html = instance.defaultView.documentElement;
    expect(html).to.be.undefined;
    html = await instance.defaultView.getDocumentElement();

    expect(html).to.be.equal('No render Possible in Server Mode');

  });

});

describe('Interfaces', function () {
  it('Interface initInterface Method', async () => {
    ONCE.global.MochaTestInterfaceInit = Namespace.declare(
      class MochaTestInterfaceInit extends Interface {
        static initInterface() {
          this._private.interfaceTest = 'foo';
        }
      }
    );

    ONCE.global.MochaTestObjectInit = Namespace.declare(
      class MochaTestObjectInit extends Interface {
        static get implements() { return [ONCE.global.MochaTestInterfaceInit] }
      }
    );

    const instance = ONCE.global.MochaTestObjectInit.getInstance();
    expect(instance?._private?.interfaceTest).to.equal('foo');

  });
})


describe('Checking UcpComponentDescriptors ' + version, function () {
  let all = Namespaces.discover();

  it('checks all dependencies of ONCE in diffrent formats', done => {
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

describe('Check UcpDomainEntity Store', function () {
  const myHeadersUnauthenticated = {
    "Content-Type": "application/json",
  };

  const myHeadersMocha1 = {
    "Content-Type": "application/json",
  };

  const myHeadersMocha2 = {
    "Content-Type": "application/json",
  };
  let version = UUID.uuidv4();
  let predecessorVersion = [];
  let token;

  const findUDEUrl = ONCE.ENV.ONCE_DEFAULT_URL + '/once/findUde/'


  let predecessorVersion2 = [];

  const keycloakConfig = JSON.parse(ONCE.ENV.ONCE_DEFAULT_KEYCLOAK_SERVER);

  let uuidMocha1 = keycloakConfig.testClient.mocha1id || '42b8c48b-34d6-4a33-8c93-5e3782c05a48';
  let uuidMocha2 = keycloakConfig.testClient.mocha2id || 'ccfff6f6-7764-4111-98f3-6bf68d8e4b26';

  it('Login Mocha1 to Keycloak for a Session', async () => {
    const url = ONCE.ENV.ONCE_DEFAULT_URL + '/once/mocha/getMochaTestToken/Mocha1';
    let loginResult = await fetch(url);
    token = await loginResult.json();
    expect(token.access_token).to.be.not.undefined;
    myHeadersMocha1.Authorization = 'Bearer ' + token.access_token;

  });

  it('Login Mocha2 to Keycloak for a Session', async () => {
    const url = ONCE.ENV.ONCE_DEFAULT_URL + '/once/mocha/getMochaTestToken/Mocha2';
    let loginResult = await fetch(url);
    token = await loginResult.json();
    expect(token.access_token).to.be.not.undefined;
    myHeadersMocha2.Authorization = 'Bearer ' + token.access_token;

  });

  let versionList = [];

  describe('Check CRUD for own UDE', function () {

    const objectIor = 'ior:' + ONCE.ENV.ONCE_DEFAULT_URL + idealUDE;
    const ior_id = UUID.uuidv4();
    const ior = ONCE.ENV.ONCE_DEFAULT_URL + "/ior/" + ior_id;
    let lastData;

    it('Create UDE', async () => {

      const time = ONCE.now();
      let data = { "version": version, "predecessorVersion": predecessorVersion, "objectIor": objectIor, "time": time, "particle": { "attribute1": 'my new string' } }

      const result = await sendRequest('POST', ior, myHeadersMocha1, data);

      expect(result.stack).to.be.undefined;
      expect(result.particle).to.be.deep.include(data.particle);
      expect(result.iorId).to.be.deep.equal(ior_id);

    }).timeout(15000);

    it('Update UDE', async () => {

      const time = ONCE.now();
      predecessorVersion = [version];
      version = UUID.uuidv4();

      let data = { version, predecessorVersion, "objectIor": objectIor, time, "particle": { "attribute1": 'my new string 2' } }
      const result = await sendRequest('PUT', ior, myHeadersMocha1, data);

      lastData = result;

      expect(result.message).to.be.undefined;
      expect(result.particle).to.deep.include(data.particle);
      expect(result.version).to.equal(data.version);

      expect(result.writeAccess, 'writeAccess').to.be.true;

    }).timeout(15000);


    it('findUDE Object', async () => {
      let data = { config: { type: objectIor }, 'filter': { 'particle.attribute1': 'my new string 2' } }
      const result = await sendRequest('PUT', findUDEUrl, myHeadersMocha1, data);
      expect(result.message).to.be.undefined;
      expect(result.result?.[0]).to.equal('ior:ude:' + ior);
    });

    it('Retrieve UDE', async () => {

      const result = await sendRequest('GET', ior, myHeadersMocha1, undefined);

      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(lastData));

    }).timeout(15000);

    it('Delete UDE', async () => {

      const result = await sendRequest('DELETE', ior, myHeadersMocha1, undefined);
      expect(result).to.deep.equal({ "status": "deleted" });
    }).timeout(15000);

  });

  describe('Check direct Access to a User', function () {
    const objectIor = "ior:" + ONCE.ENV.ONCE_DEFAULT_URL + idealUDE;
    const ior_id = UUID.uuidv4();
    const ior = ONCE.ENV.ONCE_DEFAULT_URL + "/ior/" + ior_id;
    let lastData;

    it('Create UDE', async () => {

      const time = ONCE.now();
      let data = { "version": version, "predecessorVersion": predecessorVersion, "objectIor": objectIor, "time": time, "particle": { "attribute1": 'my new string 123' } }

      const result = await sendRequest('POST', ior, myHeadersMocha1, data);

      expect(result.message).to.be.undefined;
      expect(result.particle).to.be.deep.include(data.particle);
      expect(result.iorId).to.be.deep.equal(ior_id);

      lastData = result;

    }).timeout(15000);


    it('Retrieve UDE with Mocha2 (Access Denied)', async () => {

      const result = await sendRequest('GET', ior, myHeadersMocha2, undefined);

      expect(result.message).to.equal('Error: Access Denied');

    }).timeout(15000);


    it('findUDE with Mocha2 (Access Denied)', async () => {
      let data = { config: { type: objectIor }, 'filter': { 'particle.attribute1': 'my new string 123' } }
      const result = await sendRequest('PUT', findUDEUrl, myHeadersMocha2, data);
      expect(result.message).to.be.undefined;
      expect(result.result?.[0]).to.not.equal('ior:ude:' + ior);
    });

    it('Grant Access to Mocha2 ', async () => {

      lastData.particle._access = { readAccess: [uuidMocha2], owner: uuidMocha1 }
      lastData.predecessorVersion = [lastData.version];
      lastData.version = UUID.uuidv4();

      const result = await sendRequest('PUT', ior, myHeadersMocha1, lastData);

      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(lastData));
      lastData = result;

    }).timeout(15000);


    it('Retrieve UDE with Mocha2 (Access Grant)', async () => {

      const result = await sendRequest('GET', ior, myHeadersMocha2, undefined);
      expect(result.message).to.be.undefined;
      let compareDataSet = { ...lastData };
      compareDataSet.writeAccess = false;
      expect(result).to.deep.include(compareData(compareDataSet));

    }).timeout(15000);

    it('findUDE with Mocha2', async () => {
      let data = { config: { type: objectIor }, 'filter': { 'particle.attribute1': 'my new string 123' } }
      const result = await sendRequest('PUT', findUDEUrl, myHeadersMocha2, data);
      expect(result.message).to.be.undefined;
      expect(result.result?.[0]).to.equal('ior:ude:' + ior);
    });

    it('Delete UDE', async () => {
      const result = await sendRequest('DELETE', ior, myHeadersMocha1, undefined);
      expect(result).to.deep.equal({ "status": "deleted" });
    }).timeout(15000);
  });

  describe('Check: access with a Role (mochaUser)', function () {
    const objectIor = "ior:" + ONCE.ENV.ONCE_DEFAULT_URL + idealUDE;
    const ior_id = UUID.uuidv4();
    const ior = ONCE.ENV.ONCE_DEFAULT_URL + "/ior/" + ior_id;
    let lastData;

    it('Create UDE', async () => {

      const time = ONCE.now();
      let data = { "version": version, "predecessorVersion": predecessorVersion, "objectIor": objectIor, "time": time, "particle": { "attribute1": 'my new string 123' } }

      const result = await sendRequest('POST', ior, myHeadersMocha1, data);

      expect(result.message).to.be.undefined;
      expect(result.particle).to.be.deep.include(data.particle);
      expect(result.iorId).to.be.deep.equal(ior_id);

      lastData = result;

    }).timeout(15000);


    it('Retrieve UDE with Mocha2 (Access Denied)', async () => {

      const result = await sendRequest('GET', ior, myHeadersMocha2, undefined);

      expect(result.message).to.equal('Error: Access Denied');

    }).timeout(15000);


    it('findUDE with Mocha2 (Access Denied)', async () => {
      let data = { config: { type: objectIor }, 'filter': { 'particle.attribute1': 'my new string 123' } }
      const result = await sendRequest('PUT', findUDEUrl, myHeadersMocha2, data);
      expect(result.result?.[0]).to.not.equal('ior:ude:' + ior);
    });

    it('Grant Access to Mocha2 ', async () => {

      lastData.particle._access = { readAccess: ['mochaUser'], owner: uuidMocha1 }
      lastData.predecessorVersion = [lastData.version];
      lastData.version = UUID.uuidv4();

      const result = await sendRequest('PUT', ior, myHeadersMocha1, lastData);

      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(lastData));
      lastData = result;

    }).timeout(15000);


    it('Retrieve UDE with Mocha2 (Access Grant)', async () => {

      const result = await sendRequest('GET', ior, myHeadersMocha2, undefined);
      expect(result.message).to.be.undefined;
      let compareDataSet = { ...lastData };
      compareDataSet.writeAccess = false;

      expect(result).to.deep.include(compareData(compareDataSet));

    }).timeout(15000);

    it('findUDE with Mocha2', async () => {
      let data = { config: { type: objectIor }, 'filter': { 'particle.attribute1': 'my new string 123' } }
      const result = await sendRequest('PUT', findUDEUrl, myHeadersMocha2, data);
      expect(result.message).to.be.undefined;
      expect(result.result?.[0]).to.equal('ior:ude:' + ior);
    });

    it('Delete UDE', async () => {
      const result = await sendRequest('DELETE', ior, myHeadersMocha1, undefined);
      expect(result).to.deep.equal({ "status": "deleted" });
    }).timeout(15000);
  });



  describe('Check: access unauthorized', function () {
    const objectIor = "ior:" + ONCE.ENV.ONCE_DEFAULT_URL + idealUDE;
    const ior_id = UUID.uuidv4();
    const ior = ONCE.ENV.ONCE_DEFAULT_URL + "/ior/" + ior_id;
    let lastData;

    it('Create UDE', async () => {

      const time = ONCE.now();
      let data = { "version": version, "predecessorVersion": predecessorVersion, "objectIor": objectIor, "time": time, "particle": { "attribute1": 'my new string 123' } }

      const result = await sendRequest('POST', ior, myHeadersMocha1, data);

      expect(result.message).to.be.undefined;
      expect(result.particle).to.be.deep.include(data.particle);
      expect(result.iorId).to.be.deep.equal(ior_id);

      lastData = result;

    }).timeout(15000);


    it('Retrieve UDE Unauthenticated (Access Denied)', async () => {

      const result = await sendRequest('GET', ior, myHeadersUnauthenticated, undefined);

      expect(result.message).to.equal('Error: Access Denied');

    }).timeout(15000);


    it('findUDE Unauthenticated (Access Denied)', async () => {
      let data = { config: { type: objectIor }, 'filter': { 'particle.attribute1': 'my new string 123' } }
      const result = await sendRequest('PUT', findUDEUrl, myHeadersUnauthenticated, data);
      expect(result.message).to.be.undefined;
      expect(result.result?.[0]).to.not.equal('ior:ude:' + ior);
    });

    it('Grant Access to unauthenticated ', async () => {

      lastData.particle._access = { readAccess: ['unauthenticated'], owner: uuidMocha1 }
      lastData.predecessorVersion = [lastData.version];
      lastData.version = UUID.uuidv4();

      const result = await sendRequest('PUT', ior, myHeadersMocha1, lastData);

      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(lastData));
      lastData = result;

    }).timeout(15000);


    it('Retrieve Unauthenticated (Access Grant)', async () => {

      const result = await sendRequest('GET', ior, myHeadersUnauthenticated, undefined);
      expect(result.message).to.be.undefined;
      let compareDataSet = { ...lastData };
      compareDataSet.writeAccess = false;

      expect(result).to.deep.include(compareData(compareDataSet));

    }).timeout(15000);

    it('findUDE Unauthenticated', async () => {
      let data = { config: { type: objectIor }, 'filter': { 'particle.attribute1': 'my new string 123' } }
      const result = await sendRequest('PUT', findUDEUrl, myHeadersUnauthenticated, data);
      expect(result.message).to.be.undefined;
      expect(result.result?.[0]).to.equal('ior:ude:' + ior);
    });

    it('Delete UDE', async () => {
      const result = await sendRequest('DELETE', ior, myHeadersMocha1, undefined);
      expect(result).to.deep.equal({ "status": "deleted" });
    }).timeout(15000);
  });


  describe('Check: inheritance of Permissions', function () {
    const objectIor = 'ior:' + ONCE.ENV.ONCE_DEFAULT_URL + idealUDE;
    const ior_id = UUID.uuidv4();
    const ior = ONCE.ENV.ONCE_DEFAULT_URL + "/ior/" + ior_id;
    let lastData;


    const objectIor2 = 'ior:' + ONCE.ENV.ONCE_DEFAULT_URL + idealUDE;
    const ior_id2 = UUID.uuidv4();
    const ior2 = ONCE.ENV.ONCE_DEFAULT_URL + "/ior/" + ior_id2;
    let version2 = UUID.uuidv4();
    it('Create UDE', async () => {

      const time = ONCE.now();
      let data = { "version": version, "predecessorVersion": predecessorVersion, "objectIor": objectIor, "time": time, "particle": { "attribute1": 'my Mocha 1 String' } }

      const result = await sendRequest('POST', ior, myHeadersMocha1, data);

      expect(result.message).to.be.undefined;
      expect(result.particle).to.be.deep.include(data.particle);
      expect(result.iorId).to.be.deep.equal(ior_id);

      lastData = result;

    }).timeout(15000);

    it('Create UDE Owner Mocha 2', async () => {

      const time = ONCE.now();
      let data = { "version": version2, "predecessorVersion": predecessorVersion2, "objectIor": objectIor2, "time": time, "particle": { "attribute1": 'Mocha2 Data' } }

      const result = await sendRequest('POST', ior2, myHeadersMocha2, data);

      expect(result.message).to.be.undefined;
      expect(result.particle).to.be.deep.include(data.particle);
      expect(result.iorId).to.be.deep.equal(ior_id2);

    }).timeout(15000);

    it('Grant Read Access Mocha2 UDE ', async () => {

      lastData.particle._access.readAccess = ['ior:ude:' + ior2]
      //      lastData.particle.attribute2 = "Mocha2 Only for Shifter"
      lastData.predecessorVersion = [lastData.version];
      lastData.version = UUID.uuidv4();

      const result = await sendRequest('PUT', ior, myHeadersMocha1, lastData);

      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(lastData));

    }).timeout(15000);

    it('Retrieve UDE with Mocha2 over Related UDE', async () => {

      const result = await sendRequest('GET', ior, myHeadersMocha1, undefined);

      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(lastData));

    }).timeout(15000);

    it('findUDE with Mocha2', async () => {
      let data = { config: { type: objectIor }, 'filter': { 'particle.attribute1': 'my Mocha 1 String' } }
      const result = await sendRequest('PUT', findUDEUrl, myHeadersMocha2, data);
      expect(result.message).to.be.undefined;
      expect(result.result?.[0]).to.equal('ior:ude:' + ior);
    });

    describe('Cleanup ', function () {
      it('Delete UDE 1', async () => {

        const result = await sendRequest('DELETE', ior, myHeadersMocha1, undefined);
        expect(result).to.deep.equal({ "status": "deleted" });
      }).timeout(15000);

      it('Delete UDE 2', async () => {

        const result = await sendRequest('DELETE', ior2, myHeadersMocha2, undefined);
        expect(result).to.deep.equal({ "status": "deleted" });
      }).timeout(15000);

    });
  });



  describe('Check parameter Read Access', function () {

    const objectIor = 'ior:' + ONCE.ENV.ONCE_DEFAULT_URL + idealUDE;
    const ior_id = UUID.uuidv4();
    const ior = ONCE.ENV.ONCE_DEFAULT_URL + "/ior/" + ior_id;
    let lastData;


    it('Create UDE', async () => {

      const time = ONCE.now();
      let data = {
        version, predecessorVersion, objectIor, time, "particle": {
          "attribute1": 'my new string',
          "attribute2": 'Personal Data', '_access': { readAccess: [uuidMocha2], groupAttribute2: [] }
        }
      }

      const result = await sendRequest('POST', ior, myHeadersMocha1, data);

      expect(result.message).to.be.undefined;

      lastData = result;

    }).timeout(15000);


    it('Retrieve UDE with partial read access ', async () => {

      const result = await sendRequest('GET', ior, myHeadersMocha2, undefined);

      expect(result.message).to.be.undefined;
      expect(result.particle.attribute1).to.be.equal(lastData.particle.attribute1);
      expect(result.particle.attribute2).to.be.undefined;

    }).timeout(15000);

    it('Delete UDE 1', async () => {

      const result = await sendRequest('DELETE', ior, myHeadersMocha1, undefined);
      expect(result).to.deep.equal({ "status": "deleted" });
    }).timeout(15000);
  });


  describe('Check parameter Write Access', function () {
    const objectIor = 'ior:' + ONCE.ENV.ONCE_DEFAULT_URL + idealUDE;
    const ior_id = UUID.uuidv4();
    const ior = ONCE.ENV.ONCE_DEFAULT_URL + "/ior/" + ior_id;
    let lastData;


    it('Create UDE', async () => {

      const time = ONCE.now();
      let data = {
        version, predecessorVersion, objectIor, time, "particle": {
          "attribute1": 'my new string',
          "attribute2": 'Personal Data', '_access': { readAccess: [uuidMocha2], groupAttribute2: [], owner: uuidMocha1 }
        }
      }

      const result = await sendRequest('POST', ior, myHeadersMocha1, data);
      lastData = result;

      expect(result.stack).to.be.undefined;
      expect(result.particle).to.deep.include(data.particle);


    }).timeout(15000);


    it('Write without permissions (Access Denied)', async () => {

      let writeData = deepCopy(lastData);

      writeData.particle = { attribute1: "Now overwritten by Mocha2" };
      writeData.predecessorVersion = [writeData.version];
      writeData.version = UUID.uuidv4();

      const result = await sendRequest('PUT', ior, myHeadersMocha2, writeData);

      expect(result.message).to.be.equal('Error: No Updates are done');

    }).timeout(15000);


    it('Validate no write Access happened', async () => {

      const result = await sendRequest('GET', ior, myHeadersMocha1, undefined);

      //lastData = result;
      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(lastData));

    }).timeout(15000);



    it('Grant Write Access Mocha2 UDE ', async () => {

      let data = deepCopy(lastData);

      data.particle._access.writeAccess = [uuidMocha2]
      data.predecessorVersion = [data.version];
      data.version = UUID.uuidv4();

      const result = await sendRequest('PUT', ior, myHeadersMocha1, data);
      lastData = result;

      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(data));

    }).timeout(15000);

    it('Write to permitted attribute (Access Grand)', async () => {

      let writeData = deepCopy(lastData);

      writeData.particle.attribute1 = "Now overwritten by Mocha2";
      delete writeData.particle.attribute2;
      writeData.predecessorVersion = [writeData.version];
      writeData.version = UUID.uuidv4();

      const result = await sendRequest('PUT', ior, myHeadersMocha2, writeData);

      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(writeData));


    }).timeout(15000);

    it('Delete UDE 1', async () => {

      const result = await sendRequest('DELETE', ior, myHeadersMocha1, undefined);
      expect(result).to.deep.equal({ "status": "deleted" });
    }).timeout(15000);
  });


  describe('Check Write Access to Owner parameter', function () {
    const objectIor = 'ior:' + ONCE.ENV.ONCE_DEFAULT_URL + idealUDE;
    const ior_id = UUID.uuidv4();
    const ior = ONCE.ENV.ONCE_DEFAULT_URL + "/ior/" + ior_id;
    let lastData;


    it('Create UDE', async () => {

      const time = ONCE.now();
      let data = {
        version, predecessorVersion, objectIor, time, "particle": {
          "attribute1": 'my new string',
          "attribute2": 'Personal Data', '_access': { readAccess: [uuidMocha2], readAccess: [uuidMocha2], groupAttribute2: [], owner: uuidMocha1 }
        }
      }

      const result = await sendRequest('POST', ior, myHeadersMocha1, data);
      lastData = result;

      expect(result.message).to.be.undefined;
      expect(result.particle).to.deep.include(data.particle);


    }).timeout(15000);


    it('Change owner without permissions (Access Denied)', async () => {

      let writeData = deepCopy(lastData);

      writeData.particle._access.owner = uuidMocha2;
      writeData.predecessorVersion = [writeData.version];
      writeData.version = UUID.uuidv4();

      const result = await sendRequest('PUT', ior, myHeadersMocha2, writeData);

      expect(result.message).to.be.equal('Error: No Updates are done');

    }).timeout(15000);


    it('Mocha1 change owner to Mocha2', async () => {

      let writeData = deepCopy(lastData);

      writeData.particle._access.owner = uuidMocha2;
      writeData.predecessorVersion = [writeData.version];
      writeData.version = UUID.uuidv4();

      const result = await sendRequest('PUT', ior, myHeadersMocha1, writeData);

      writeData.writeAccess = false;
      expect(result.message).to.be.undefined;
      expect(result).to.deep.include(compareData(writeData));

    }).timeout(15000);

    it('Delete UDE 1', async () => {

      const result = await sendRequest('DELETE', ior, myHeadersMocha2, undefined);
      expect(result).to.deep.equal({ "status": "deleted" });
    }).timeout(15000);
  });

});


describe('UcpComponent lifecycle', function () {
  it('Start UcpComponent', done => {
    let ucpComponent = UcpComponent.getInstance().init();
    ucpComponent.model.test = 1;

    expect(ucpComponent.model.test).to.be.equal(1);
    done();
  });

  it('UcpComponent status active', done => {
    let ucpComponent = UcpComponent.getInstance().init();

    expect(ucpComponent.componentState).to.be.equal(UcpComponent.COMPONENT_STATES.ACTIVE);
    done();
  });

  it('UcpComponent status destroy', async () => {
    let ucpComponent = UcpComponent.getInstance().init();

    let hit = false;
    ucpComponent.onDestroy = async function () {
      await Thinglish.wait(10);
      hit = true;
    }
    await ucpComponent.destroy();
    expect(ucpComponent.componentState).to.be.equal(UcpComponent.COMPONENT_STATES.DESTROYED);
    expect(hit).to.be.true;

    try {
      ucpComponent.model;
      throw new Error("Missing Error model");
    } catch (err) {
      expect(err.message).to.equal("Component is destroyed");
    }

    try {
      ucpComponent.defaultView;
      throw new Error("Missing Error defaultView");
    } catch (err) {
      expect(err.message).to.equal("Component is destroyed. View lookup not possible");
    }

    try {
      ucpComponent.IOR;
      throw new Error("Missing Error IOR");
    } catch (err) {
      expect(err.message).to.equal("Component is destroyed");
    }

  });

});

describe('Check findClient on Client', () => {
  it('Check UcpDomainEntityDBLoader', done => {
    var ior = IOR.getInstance().init('ior:ude:/ior/131cac9f-ceb3-401f-a866-73f7a691fed7');
    expect(Client.findClient(ior)).to.be.instanceOf(UcpDomainEntityDBLoader);
    done();
  });

  it('Check DefaultRestClient', done => {
    var ior = IOR.getInstance().init('ior:ude:rest:some.domain.de/ior/131cac9f-ceb3-401f-a866-73f7a691fed7');
    expect(Client.findClient(ior)).to.be.instanceOf(DefaultRESTClient);
    done();
  });


  it('Check DefaultHTTPClient', done => {
    var ior = IOR.getInstance().init('http://test.so.domain.de/ior/131cac9f-ceb3-401f-a866-73f7a691fed7');
    expect(Client.findClient(ior)).to.be.instanceOf(DefaultHTTPClient);
    done();
  });
});

describe('Check find Loader in the IOR', () => {
  // it('Check UcpDomainEntityDBLoader', done => {

  //   done();
  // });

  it('Check UcpDomainEntityLoader', done => {
    let ior = IOR.getInstance().init('ior:ude:/ior/131cac9f-ceb3-401f-a866-73f7a691fed7');
    expect(ior.loader).to.be.instanceOf(UcpDomainEntityLoader);
    ior = IOR.getInstance().init(`ior:ude:rest:${ONCE.ENV.ONCE_DEFAULT_URL}/ior/131cac9f-ceb3-401f-a866-73f7a691fed7`);
    expect(ior.loader).to.be.instanceOf(UcpDomainEntityLoader);
    ior = IOR.getInstance().init('ior:ude:rest:http://some.other.domain.de/ior/131cac9f-ceb3-401f-a866-73f7a691fed7');
    expect(ior.loader).to.be.instanceOf(UcpDomainEntityLoader);
    done();
  });

  it('Check EAMDucpLoader', done => {
    var ior = IOR.getInstance().init('/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/4.3.0/Thinglish.component.xml');
    expect(ior.loader).to.be.instanceOf(EAMDucpLoader);
    done();
  });

  it('Check DocumentScriptLoader', done => {
    var ior = IOR.getInstance().init('http://test.xxx.de/foo/bar/some.class.js');
    expect(ior.loader).to.be.instanceOf(DocumentScriptLoader);
    done();
  });


  it('Check WeBeanLoader', done => {
    var ior = IOR.getInstance().init('http://test.xxx.de/foo/bar/some.weBean.html');
    expect(ior.loader).to.be.instanceOf(WeBeanLoader);
    done();
  });


});

describe('Check Url Class', function () {
  it('Parse URL', done => {

    var url = Url.getInstance().init('');

    var validate = [];
    validate.push({
      url: 'ior:ude:rest:http://localhost:8080/ior/131cac9f-ceb3-401f-a866-73f7a691fed7',
      result: {
        protocol: ['ior', 'ude', 'rest', 'http'],
        hostName: 'localhost',
        port: '8080',
        pathName: '/ior/131cac9f-ceb3-401f-a866-73f7a691fed7',
        origin: 'http://localhost:8080'
      }
    });

    validate.push({
      url: 'ior:ude:rest:http://test.wo-da.de/ior/131cac9f-ceb3-401f-a866-73f7a691fed7',
      result: {
        protocol: ['ior', 'ude', 'rest', 'http'],
        hostName: 'test.wo-da.de',
        pathName: '/ior/131cac9f-ceb3-401f-a866-73f7a691fed7',
        origin: 'http://test.wo-da.de'
      }
    });

    validate.push({
      url: '/ior/131cac9f-ceb3-401f-a866-73f7a691fed7',
      result: {
        protocol: [],
        pathName: '/ior/131cac9f-ceb3-401f-a866-73f7a691fed7'
      }
    });

    validate.push({
      url: 'ior:ude:rest:http://localhost:8080/testdir/testfile.txt?test=foo#ActionDo=run',
      result: {
        protocol: ['ior', 'ude', 'rest', 'http'],
        pathName: '/testdir/testfile.txt',
        fileName: 'testfile.txt',
        fileType: 'txt',
        search: 'test=foo',
        searchParameters: { 'test': 'foo' },
        hash: 'ActionDo=run',
        host: 'localhost:8080',
        port: '8080',
        normalizeHref: 'http://localhost:8080/testdir/testfile.txt?test=foo#ActionDo=run',
        origin: 'http://localhost:8080',
        hostName: 'localhost',
        href: 'ior:ude:rest:http://localhost:8080/testdir/testfile.txt?test=foo#ActionDo=run'

      }
    });

    validate.push({
      url: 'https://localhost:8443/EAMD.ucp/Components/org/shift/EAM/5_ux/ShifterNetwork/4.3.0/src/html/ShifterNetwork.html#',
      result: {
        protocol: ['https'],
        pathName: '/EAMD.ucp/Components/org/shift/EAM/5_ux/ShifterNetwork/4.3.0/src/html/ShifterNetwork.html',
        fileName: 'ShifterNetwork.html',
        fileType: 'html',
        search: '',
        searchParameters: {},
        hash: '',
        host: 'localhost:8443',
        port: '8443',
        normalizeHref: 'https://localhost:8443/EAMD.ucp/Components/org/shift/EAM/5_ux/ShifterNetwork/4.3.0/src/html/ShifterNetwork.html',
        origin: 'https://localhost:8443',
        hostName: 'localhost',
        href: 'https://localhost:8443/EAMD.ucp/Components/org/shift/EAM/5_ux/ShifterNetwork/4.3.0/src/html/ShifterNetwork.html'

      }
    });

    validate.push({
      url: 'https://shifter.staging.shiftphones.com:30484/',
      result: {
        protocol: ['https'],
        pathName: '/',
        fileName: null,
        fileType: null,
        search: '',
        searchParameters: {},
        hash: undefined,
        host: 'shifter.staging.shiftphones.com:30484',
        port: '30484',
        normalizeHref: 'https://shifter.staging.shiftphones.com:30484/',
        origin: 'https://shifter.staging.shiftphones.com:30484',
        hostName: 'shifter.staging.shiftphones.com',
        href: 'https://shifter.staging.shiftphones.com:30484/'

      }
    });




    for (let v of validate) {
      url.href = v.url;
      for (let r of Object.keys(v.result)) {
        expect(url[r], `URL: ${v.url}, Parameter: ${r}`).to.deep.equal(v.result[r]);
      }
    }
    done();
  });


  it('Clone URL', done => {

    const inputUrl = 'ior:ude:rest:http://localhost:8080/testdir/testfile.txt?test=foo#ActionDo=run'
    var url = Url.getInstance().init(inputUrl);

    var urlclone = url.clone();

    expect(url.href).to.equal(urlclone.href);

    expect(url.protocol).to.not.equal(urlclone.protocol);
    expect(url.searchParameters).to.not.equal(urlclone.searchParameters);

    urlclone.href = 'http://localhost:8080/testdir/testfile.txt?test=foo#ActionDo=run';

    expect(url.href).to.equal(inputUrl);

    done();
  });


  it('URL check order of search parameters', done => {

    const inputUrl = 'ior:ude:rest:http://localhost:8080/testdir/testfile.txt?x=1&c=2&b=5#ActionDo=run'
    var url = Url.getInstance().init(inputUrl);

    expect(url.searchParameters).to.deep.equal({ x: '1', c: '2', b: '5' });
    expect(url.search).to.equal('b=5&c=2&x=1');
    expect(url.href).to.equal('ior:ude:rest:http://localhost:8080/testdir/testfile.txt?b=5&c=2&x=1#ActionDo=run');


    done();
  });
});


describe('Joi extensions', function () {

  describe('IOR Object', function () {


    it('ior ', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let schema = UcpSchema.ior(idealComponentClass); //.iorType(idealComponentClass);

      let { error, value } = schema.validate(idealComponentClass.getInstance().init());

      expect(error).to.be.undefined;

    });


    it('ior.iorType', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let schema = UcpSchema.ior().iorType(idealComponentClass);

      let idealComponent = idealComponentClass.getInstance().init()
      let { error, value } = schema.validate(idealComponent);

      expect(error).to.be.undefined;
      expect(value).to.be.equal(idealComponent);

    });

    it('ior (Set unknown IOR Object)', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let schema = UcpSchema.ior(idealComponentClass); //.iorType(idealComponentClass);

      const iorObject = IOR.getInstance().init('/test');
      let { error, value } = schema.validate(iorObject);

      expect(error).to.be.undefined;
      expect(value).to.be.equal(iorObject);

    });

    it('ior (Interfaces)', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let schema = UcpSchema.ior(Component); //.iorType(idealComponentClass);

      const idealComponent = idealComponentClass.getInstance().init();

      let { error, value } = schema.validate(idealComponent);

      expect(error).to.be.undefined;
      expect(value).to.be.equal(idealComponent);

    });
    it('ior set Wrong type', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let idealComponentDEClass = await IOR.getInstance().init(idealUDE).load();

      let schema = UcpSchema.ior(idealComponentDEClass);

      const iorObject = idealComponentClass.getInstance().init();
      let { error, value } = schema.validate(iorObject);

      expect(error).to.not.be.undefined;
      expect(value).to.be.equal(iorObject);

    });

    it('ior as string', async () => {

      let iorObjectString = 'ior:some_url'
      let schema = UcpSchema.ior();
      let { error, value } = schema.validate(iorObjectString);

      expect(error).to.be.undefined;
      expect(value).to.be.equal(iorObjectString);
    });

    it('ior with definition and as string', async () => {

      let iorObjectString = 'ior:some_url'

      let idealComponentDEClass = await IOR.load(idealUDE);
      //const iorObject = idealComponentClass.getInstance().init();
      let schema2 = UcpSchema.ior(idealComponentDEClass);

      let { error, value } = schema2.validate(iorObjectString);
      expect(error).to.be.undefined;
      expect(value).to.be.equal(iorObjectString);


    });



    describe('Access control', function () {
      it('writeAccess (grand)', async () => {

        let schema = UcpSchema.ior().writeAccess('grantedDummy');
        expect(schema.getWriteAccess()).to.be.equal('grantedDummy');

      });



      it('readAccess ', async () => {

        let schema = UcpSchema.ior().readAccess('grantedDummy');
        expect(schema.getReadAccess()).to.be.equal('grantedDummy');
      });

      //@ToDo Need to be implemented
      // it('readAccess Inheritance in the Schema (Needs to be done)', async () => {

      //   let schema = UcpSchema.object().keys({ 'someIOR': UcpSchema.ior().readAccess('grantedDummy') });

      //   expect(schema.getReadAccess()).to.be.equal('grantedDummy');
      // });

    });
  });

  describe('Object', function () {
    it('Object getKeys', async () => {
      let schema = UcpSchema.object(
        {
          'test1': UcpSchema.object(),
          'test2': UcpSchema.number()
        }
      );
      let keys = schema.getKeys();
      expect(keys.test1).to.be.not.undefined;
      expect(keys.test2).to.be.not.undefined;
    });
  });


  describe('Array', function () {
    it('Array getItems', async () => {

      let number = UcpSchema.number();
      let schema = UcpSchema.array().items(
        number
      );
      expect(schema.getItems()[0]).to.be.equal(number);
    });
  });

  describe('Global Functions', function () {
    it('.readAccess', async () => {
      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();

      let schema = UcpSchema.number().readAccess('grantedDummy');
      const iorObject = idealComponentClass.getInstance().init();
      let accessGrant = schema.getReadAccess(iorObject);

      expect(accessGrant).to.be.equal('grantedDummy');
    });

    it('.localOnly', async () => {
      let schema = UcpSchema.number().localOnly();
      expect(schema.isLocalOnly()).to.be.true;
      let schema2 = UcpSchema.number();
      expect(schema2.isLocalOnly()).to.be.false;
    });
  });

  describe('Relationship', function () {
    it('Relationship (external vs internal)', async () => {
      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();

      let schema = UcpSchema.object({
        externalRel: UcpSchema.relationship(),
        internal: UcpSchema.object(),
        subObject: UcpSchema.object({ ex: UcpSchema.relationship(), int: UcpSchema.object() }),
        _componentInfo: UcpSchema.object(),
      });
      const iorObject = idealComponentClass.getInstance().init();
      iorObject.ucpModel.schema = schema;

      let externalObject = { 'some': 'external Data' };
      let internalObject = { 'foo': 'bar' };

      iorObject.model = { externalRel: externalObject, internal: internalObject, subObject: { ex: externalObject, int: internalObject } };


      expect(iorObject.model.externalRel._isModelProxy).to.be.undefined;
      expect(iorObject.model.internal._isModelProxy).to.be.true;

      expect(iorObject.model.subObject.ex._isModelProxy).to.be.undefined;
      expect(iorObject.model.subObject.int._isModelProxy).to.be.true;

      expect(iorObject.model.externalRel).to.be.equal(externalObject);
      expect(iorObject.model.internal).to.not.be.equal(internalObject);


    });
  });

  describe('Model Schema Test', function () {
    it('Big Example Schema', async () => {

      let securityContext = SessionManager;

      let dummyIor = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();

      let schema = UcpSchema.object(
        {
          '_local': UcpSchema.object(
            { '_securityContext': UcpSchema.ior(dummyIor) }
          ).localOnly(),
          'publicData': UcpSchema.object().readAccess(UcpSchema.ref('/_access.readAccess')),
          '_access': UcpSchema.object({
            'owner': UcpSchema.ior(),
            'readAccess': UcpSchema.array().items(UcpSchema.string()),
            'writeAccess': UcpSchema.array().items(UcpSchema.string()),
          }),

        }
      );
      let dummyInstance = dummyIor.getInstance().init();
      let data = {
        '_local':
          { '_securityContext': dummyInstance },
        '_access': {
          'owner': dummyInstance,
          'readAccess': ['grantedDummy'],
          'writeAccess': []
        }
      };

      let { error, value } = schema.validate(data);
      expect(error).to.be.undefined;

    });

  });


  describe('UcpModel Integration', function () {
    let component;
    let idealComponentClass;
    it('Create Schema', async () => {
      idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      component = idealComponentClass.getInstance().init();

      component.model = {};
      let schema = UcpSchema.object(
        {
          '_local': UcpSchema.object(
            { '_securityContext': UcpSchema.ior() }
          ).localOnly(),
          'publicData': UcpSchema.object({ 'string': UcpSchema.string() }).readAccess(UcpSchema.ref('/_access.readAccess')),
          '_access': UcpSchema.object({
            'owner': UcpSchema.ior(),
            'readAccess': UcpSchema.array().items(UcpSchema.string()),
            'writeAccess': UcpSchema.array().items(UcpSchema.string()),
          },
          ), _componentInfo: UcpSchema.object(),
        }
      );
      component.ucpModel.schema = schema;

      expect(component.ucpModel.schema).to.equal(schema);
    });

    it('Modify Model + Validate', async () => {



      let data = {
        '_access': {
          //'owner': idealComponentClass.getInstance().init(),
          'readAccess': ['grantedDummy'],
          'writeAccess': []
        }
      };
      component.model = data;

      // Negarive test
      try {
        component.model = { publicData: { string: 123 } };
        throw new Error('Missing Error')
      } catch (err) {
        expect(err.message).to.equal('DefaultIdealComponent: "publicData.string" must be a string; value: 123');
      }



    });

    it('.data2Store (Export for PM)', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let component = idealComponentClass.getInstance().init();

      let defaultSchema = component.createDefaultSchema();
      let schema = defaultSchema.keys(
        {
          '_local': UcpSchema.object(
            { 'localString': UcpSchema.string() }
          ).localOnly(),
          'publicData': UcpSchema.object(
            {
              'string': UcpSchema.string(),
              'localArray': UcpSchema.array().localOnly(),
              'localRef': UcpSchema.relationship(),
              'localNumber': UcpSchema.number().localOnly()
            }
          )

        }
      );
      component.ucpModel.schema = schema;

      // component.initUcpSchema(defaultUcpSchema => {
      //   return defaultUcpSchema.keys({
      //     '_local': UcpSchema.object(
      //       { 'localString': UcpSchema.string() }
      //     ).localOnly(),
      //     'publicData': UcpSchema.object(
      //       {
      //         'string': UcpSchema.string(),
      //         'localArray': UcpSchema.array().localOnly(),
      //         'localRef': UcpSchema.relationship(),
      //         'localNumber': UcpSchema.number().localOnly()
      //       }
      //     )
      //   })
      // })

      let data = { _local: { localString: 'test' }, publicData: { string: 'test2', localArray: ['123', 'asdf', 123], localRef: { 'test': 'me' } } };


      component.model = data;

      let dataShouldBeStored = { publicData: { string: 'test2' }, "_componentInfo": component.model._componentInfo };

      expect(component.ucpModel.data2Store).to.deep.equal(dataShouldBeStored);

    });

    it('Input wrong Data', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let component = idealComponentClass.getInstance().init();

      let schema = UcpSchema.object(
        {
          'publicData': UcpSchema.object(
            {
              'string': UcpSchema.string(),
            }
          ),
        }
      );
      component.ucpModel.schema = schema;
      try {
        component.model = { publicData: { string: 123 } };
        throw new Error('Missing Error');
      } catch (err) {
        expect(err.message).to.be.equal('DefaultIdealComponent: "publicData.string" must be a string; value: 123');
      }


    });

    it('Default Schema', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let sessionManagerClass = await IOR.getInstance().init('/EAMD.ucp/Components/org/Keycloak/KeycloakSessionManager/4.3.0/KeycloakSessionManager.component.xml').load();
      let component = idealComponentClass.getInstance().init();

      let schema = component.createDefaultSchema();
      component.ucpModel.schema = schema;

      let dummyObject = idealComponentClass.getInstance().init();

      let data = {
        '_local':
          { '_securityContext': sessionManagerClass.getInstance() }
        ,
        '_access': {
          //'owner': UUID.uuidv4(),
          'readAccess': [dummyObject],
          'writeAccess': [dummyObject],
        },
      };

      // Test if an Error is thrown
      component.model = data;

    });

    it('initUcpSchema', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let component1 = idealComponentClass.getInstance().init();

      component1.initUcpSchema(defaultUcpSchema => {
        return defaultUcpSchema.keys({ test: UcpSchema.number() });
      });

      let component2 = idealComponentClass.getInstance().init();
      component2.initUcpSchema(defaultUcpSchema => {
        return defaultUcpSchema.keys({ test: UcpSchema.number() });
      });

      expect(component1.ucpModel.schema).to.be.equal(component2.ucpModel.schema);

    });

    it('Validation one Value in the Model', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let component1 = idealComponentClass.getInstance().init();

      component1.initUcpSchema(defaultUcpSchema => {
        return defaultUcpSchema.keys({ test: UcpSchema.number() });
      });

      expect(component1.model.validate(123, 'test')).to.be.undefined;
      expect(component1.model.validate('123a', 'test')?.message).to.be.equal('"value" must be a number');

    });

    it('Validation whole data structure Model', async () => {

      let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
      let component1 = idealComponentClass.getInstance().init();

      component1.initUcpSchema(defaultUcpSchema => {
        return defaultUcpSchema.keys({ test: UcpSchema.number() });
      });

      expect(component1.model.validate({ test: 123 })).to.be.undefined;
      expect(component1.model.validate({ test: 'asc' })?.message).to.be.equal('"test" must be a number');

    });
  });
});

describe('Thinglish', function () {
  describe('lookupInObject', function () {

    it('Lookup List', async () => {
      let data = { test: { model: 'test', nullObject: null } };
      expect(Thinglish.lookupInObject(data, "test.model")).to.equal('test');
      expect(Thinglish.lookupInObject(data, "test.notExisting")).to.be.null;

      expect(Thinglish.lookupInObject(data, "test.nullObject")).to.be.null;
      expect(Thinglish.lookupInObject(data, "test.nullObject.notExisting")).to.be.null;


    });

    it('Lookup Array', async () => {
      let data = { test: [1, 2, 3, 4, 5, 6] };
      expect(Thinglish.lookupInObject(data, "test.[2]")).to.equal(3);
      expect(Thinglish.lookupInObject(data, "test.2")).to.equal(3);

      expect(Thinglish.lookupInObject(data, "test.[8]")).to.be.null;
    });
  });

});

describe('UcpModel', function () {
  it('Model export', async () => {
    let idealComponentClass = await IOR.getInstance().init('/EAMD.ucp/Components/tla/EAMD/ComponentTestBed/IdealComponent/1.1.0/IdealComponent.component.xml').load();
    let component = idealComponentClass.getInstance().init();
    let data = { publicData: 'test' }
    component.model = data;
    expect(component.ucpModel.export).to.deep.equal(data);

  });


  it('Model Loading Mode ON_ACCESS', async () => {

    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();
    component.ucpModel.loadingMode = UcpModelV2.LOADING_MODE.ON_ACCESS;

    idealUdeIOR = `ior:${idealUDE}`

    component.model.ref = idealUdeIOR;

    let result = component.model.ref;

    expect(Thinglish.isPromise(result)).to.be.true;
    let resultComponent = await result;

    expect(resultComponent).to.be.equal(idealComponentClass);

    // Test export
    expect(component.ucpModel.export.ref?.url).to.be.equal(idealUdeIOR);

    // Test data2Store
    expect(component.ucpModel.data2Store.ref?.url).to.be.equal(idealUdeIOR);


  });

  it('Model Loading Mode ON_LOAD', async () => {

    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();
    component.ucpModel.loadingMode = UcpModelV2.LOADING_MODE.ON_LOAD;

    idealUdeIOR = `ior:${idealUDE}`

    component.model.ref = idealUdeIOR;

    let result = component.model.ref;

    expect(result.url).to.be.equal(idealUdeIOR);

    // Test export
    expect(component.ucpModel.export.ref?.url, 'export').to.be.equal(idealUdeIOR);

    // Test data2Store
    expect(component.ucpModel.data2Store.ref?.url, 'data2Store').to.be.equal(idealUdeIOR);


    await component.ucpModel.load();

    expect(component.model.ref, 'Access loaded Class').to.be.equal(idealComponentClass);

    // Test export
    expect(component.ucpModel.export.ref?.url, 'export loaded').to.be.equal(idealUdeIOR);

    // Test data2Store
    expect(component.ucpModel.data2Store.ref, 'data2Store loaded').to.be.equal(idealComponentClass);

  });

  it('Model multiSet force Delete', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();
    component.model = { attribute1: 'test' };

    component.model.multiSet({ attribute2: 'test2' });

    expect(component.model.attribute1).to.be.equal('test');
    expect(component.model.attribute2).to.be.equal('test2');

    component.model.multiSet({ attribute2: 'test3' }, true);

    expect(component.model.attribute1).to.be.undefined;
    expect(component.model.attribute2).to.be.equal('test3');
  });

  it('Model multiSet async', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();
    let result = component.model.multiSet({ attribute2: 'test2' });
    expect(component.model.attribute2).to.be.equal('test2');
    expect(result).to.be.equal(component.ucpModel);
    expect(result.then).to.be.not.undefined;
  });

  it('Model Delete parameter', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();
    component.model = { attribute1: 'test' };
    expect(component.model.attribute1).to.be.equal('test');

    delete component.model.attribute1;
    expect(component.model.attribute1).to.be.undefined;
  });

  it('Empty Transaction', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();
    component.model = { attribute1: 'test' };

    expect(component.model.attribute1).to.be.equal('test');
    await component.ucpModel;
    const version = component.ucpModel.version;
    component.ucpModel.startTransaction();
    component.model.attribute1 = 'test';
    component.ucpModel.processTransaction();

    expect(component.ucpModel.version, 'same version').to.be.equal(version);
  });

  it('.writeAccessObjects', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();

    let schema = UcpSchema.object().keys({
      test1: UcpSchema.object().writeAccess('grantedDummy'),
      test2: UcpSchema.array().items(UcpSchema.string().writeAccess('grantedDummy2'))
    });
    component.ucpModel.schema = schema;

    let writeAccessObjects = component.ucpModel.writeAccessObjects

    expect(['writeAccess', 'grantedDummy', 'grantedDummy2']).to.be.deep.equal(writeAccessObjects)
  });

  it('change whole model', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();

    delete component.model.myNumbers;
    component.model.attribute1 = 'MyString';

    component.model = { myNumbers: [1, 2, 3] }
    expect(component.ucpModel.changeLog.myNumbers).to.not.be.undefined;
    expect(component.ucpModel.changeLog.attribute1.method).to.equal('delete');
  });

  it('local Parameter does not get deleted', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();

    component.model = {};
    let schema = component.createDefaultSchema().keys({
      test1: UcpSchema.string(),
      test2: UcpSchema.string().localOnly(),
    });
    component.ucpModel.schema = schema;

    component.model = { test1: 'ab', test2: 'bc' };

    component.ucpModel.importIorStructure({ data: { test1: 'xxxx' }, version: UUID.uuidv4() });

    expect(component.model.test1).to.equal('xxxx');
    expect(component.model.test2).to.equal('bc');

  });


  it('Rollback Transaction', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();

    component.model = {};
    let schema = component.createDefaultSchema().keys({
      test1: UcpSchema.string(),
      test2: UcpSchema.string().localOnly(),
    });
    component.ucpModel.schema = schema;
    component.model = { test1: 'ab', test2: 'bc' };

    component.ucpModel.startTransaction();

    component.model = { test1: '123', test2: '456' };

    expect(component.model.test1).to.equal('123');

    expect(component.ucpModel.changeLog.test1.to).to.equal('123');
    expect(component.ucpModel.changeLog.test1.from).to.equal('ab');
    expect(component.ucpModel.changeLog.test1.method).to.equal('set');


    expect(component.ucpModel.changeLog.test2.to).to.equal('456');
    expect(component.ucpModel.changeLog.test2.from).to.equal('bc');
    expect(component.ucpModel.changeLog.test2.method).to.equal('set');


    component.ucpModel.cancelTransaction();

    expect(component.model.test1).to.equal('ab');
    expect(component.model.test2).to.equal('bc');

    expect(component.ucpModel.changeLog.test1.to).to.equal('ab');
    expect(component.ucpModel.changeLog.test1.from).to.be.undefined;
    expect(component.ucpModel.changeLog.test1.method).to.equal('create');


    expect(component.ucpModel.changeLog.test2.to).to.equal('bc');
    expect(component.ucpModel.changeLog.test2.from).to.be.undefined;
    expect(component.ucpModel.changeLog.test2.method).to.equal('create');

  });

  it('write promise (Success) into the Model', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();

    let promiseHandler = Thinglish.createPromise();

    let originalVersion = component.ucpModel.version;
    component.model.attribute1 = promiseHandler.promise;

    expect(component.model.attribute1).to.equal(promiseHandler.promise);

    expect(component.ucpModel.version).to.equal(originalVersion);

    promiseHandler.setSuccess("some String");
    await promiseHandler.promise;

    expect(component.model.attribute1).to.equal("some String");

  });

  it('write promise (Fail) into the Model', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();

    let promiseHandler = Thinglish.createPromise();

    let originalVersion = component.ucpModel.version;
    let originalValue = component.model.attribute1;
    component.model.attribute1 = promiseHandler.promise;

    expect(component.model.attribute1).to.equal(promiseHandler.promise);

    expect(component.ucpModel.version).to.equal(originalVersion);

    promiseHandler.setError(new Error("Some error"));
    try {
      await promiseHandler.promise;
    } catch (err) { }
    await Thinglish.wait(10);

    expect(component.model.attribute1).to.equal(originalValue);

  });


  it('_importChangeLog', async () => {
    let idealComponentClass = await IOR.load(idealUDE);
    let component = idealComponentClass.getInstance().init();

    component.model = {};
    let schema = component.createDefaultSchema().keys({
      test1: UcpSchema.string(),
      test2: UcpSchema.string().localOnly(),
    });
    component.ucpModel.schema = schema;
    component.model = { test1: 'ab', test2: 'bc' };

    component.ucpModel.fullAccess = true;
    component.ucpModel._importChangeLog({ test1: { from: 'ab', to: 'xxx', method: ParticleSnapshotAction.METHOD_SET, time: 123, key: 'test1' } });

    expect(component.model.test1).to.equal('xxx');

  });


  describe('Array Handling', function () {


    it('Array splice', async () => {
      let idealComponentClass = await IOR.load(idealUDE);
      let component = idealComponentClass.getInstance().init();
      component.model.myNumbers = [1, 2, 3, 4];
      await component.ucpModel;

      component.ucpModel.startTransaction();
      component.model.myNumbers.splice(0, 2);
      component.ucpModel.processTransaction();

      await component.ucpModel;

      let changelog = component.ucpModel.changeLog;

      expect(changelog.myNumbers).to.not.be.undefined;

      expect(changelog.myNumbers[0].from, '0.from').to.equal(1);
      expect(changelog.myNumbers[0].to, '0.to').to.equal(3);


      expect(changelog.myNumbers[2].to).is.undefined;
      expect(changelog.myNumbers[3].to).is.undefined;


    });

    it('replace array in the Model', async () => {
      let idealComponentClass = await IOR.load(idealUDE);
      let component = idealComponentClass.getInstance().init();

      delete component.model.myNumbers;

      component.model.myNumbers = [1, 2, 3];
      expect(component.ucpModel.changeLog.myNumbers).to.not.be.undefined;
      component.model.myNumbers = [1, 2, 3, 4];
      expect(component.ucpModel.changeLog.myNumbers).to.not.be.undefined;
      expect(component.ucpModel.changeLog.myNumbers[3]).to.not.be.undefined;

    });

    it('array multi Changes in one Transaction', async () => {
      let idealComponentClass = await IOR.load(idealUDE);
      let component = idealComponentClass.getInstance().init();

      component.model.myNumbers = [1, 2, 3, 4, 5];
      expect(component.model.myNumbers).to.deep.equal([1, 2, 3, 4, 5]);

      component.ucpModel.startTransaction();
      component.model.myNumbers.push(6);
      expect(component.model.myNumbers).to.deep.equal([1, 2, 3, 4, 5, 6]);
      let changeLog = component.ucpModel.changeLog;
      delete changeLog.myNumbers[5].time;
      let changeLogCompare = { "myNumbers": { "5": { "_private": {}, "to": 6, "key": "myNumbers.5", "method": "create", from: undefined, } } };
      expect(changeLog).to.deep.include(changeLogCompare);

      component.model.myNumbers.push(7);
      changeLogCompare.myNumbers[6] = { "_private": {}, "to": 7, "key": "myNumbers.6", "method": "create", from: undefined, }
      changeLog = component.ucpModel.changeLog;
      delete changeLog.myNumbers[6].time;
      expect(changeLog).to.deep.include(changeLogCompare);

      component.model.myNumbers.splice(1, 1);
      changeLog = component.ucpModel.changeLog;
      changeLogCompare = {
        "myNumbers": { "1": { "_private": {}, "to": 3, "key": "myNumbers.1", "from": 2, "method": "set" }, "2": { "_private": {}, "to": 4, "key": "myNumbers.2", "from": 3, "method": "set" }, "3": { "_private": {}, "to": 5, "key": "myNumbers.3", "from": 4, "method": "set" }, "4": { "_private": {}, "to": 6, "key": "myNumbers.4", "from": 5, "method": "set" }, "5": { "_private": {}, "to": 7, "key": "myNumbers.5", "from": 6, "method": "set" }, "6": { "_private": {}, "method": "delete", "from": 7, "key": "myNumbers.6", to: undefined } }
      };
      for (let i of Object.keys(changeLog.myNumbers)) {
        delete changeLog.myNumbers[i].time;
      }

      expect(changeLog).to.deep.include(changeLogCompare);

    });
  });

});



describe('EventService', function () {
  it('Fire Event with once Target', async function () {
    let idealComponentClass = await IOR.load(idealUDE);
    let instance = idealComponentClass.getInstance().init();
    let instance2 = idealComponentClass.getInstance().init();

    let hit = false;
    instance2.callBack = (...args) => { hit = args }

    let input = ['some'];
    instance.eventSupport.addEventListener('myEvent', instance2, instance2.callBack);

    instance.eventSupport.fire('myEvent', instance, ...input);
    expect(hit[1]).to.equal(input[0]);
  });

  it('Fire Event Multiple input', async function () {
    let idealComponentClass = await IOR.load(idealUDE);
    let instance = idealComponentClass.getInstance().init();
    let instance2 = idealComponentClass.getInstance().init();

    let hit = false;
    instance2.callBack = (...args) => { hit = args }

    let input = ['some', 'data'];
    instance.eventSupport.addEventListener('myEvent', instance2, instance2.callBack);

    instance.eventSupport.fire('myEvent', instance, ...input);
    expect(hit[1]).to.equal(input[0]);
    expect(hit[2]).to.equal(input[1]);
  });

  it('Fire Event result', async function () {
    let idealComponentClass = await IOR.load(idealUDE);
    let instance = idealComponentClass.getInstance().init();
    let instance2 = idealComponentClass.getInstance().init();

    let hit = false;
    instance2.callBack = (...args) => { hit = args }

    let input = ['some'];
    instance.eventSupport.addEventListener('myEvent', instance2, instance2.callBack);

    let result = instance.eventSupport.fire('myEvent', instance, ...input);
    expect(result).to.deep.equal([undefined])
  });

  it('Fire Event async function result', async function () {
    let idealComponentClass = await IOR.load(idealUDE);
    let instance = idealComponentClass.getInstance().init();
    let instance2 = idealComponentClass.getInstance().init();

    let hit = false;
    instance2.callBack = async (...args) => { hit = args }

    let input = ['some'];
    instance.eventSupport.addEventListener('myEvent', instance2, instance2.callBack);

    let result = instance.eventSupport.fire('myEvent', instance, ...input);

    expect(Thinglish.isPromise(result)).to.be.true;
    await result;
    expect(hit[1]).to.equal(input[0]);

  });

  it('Fire Event with two Targets', async function () {
    let idealComponentClass = await IOR.load(idealUDE);
    let instance = idealComponentClass.getInstance().init();
    let instance2 = idealComponentClass.getInstance().init();

    let instance3 = idealComponentClass.getInstance().init();

    let hit2 = false;
    instance2.callBack = (...args) => { hit2 = args; return 'ok1' }
    instance.eventSupport.addEventListener('myEvent', instance2, instance2.callBack);

    let hit3 = false;
    instance3.callBack = (...args) => { hit3 = args; return 'ok2' }
    instance.eventSupport.addEventListener('myEvent', instance3, instance3.callBack);

    let input = ['some'];
    instance.eventSupport.fire('myEvent', instance, ...input);
    expect(hit2[1]).to.equal(input[0]);

    expect(hit3[1]).to.equal(input[0]);

  });

  it('Fire Event with two async Targets', async function () {
    let idealComponentClass = await IOR.load(idealUDE);
    let instance = idealComponentClass.getInstance().init();
    let instance2 = idealComponentClass.getInstance().init();

    let instance3 = idealComponentClass.getInstance().init();

    let hit2 = false;
    instance2.callBack = async (...args) => { hit2 = args; return 'ok1' }
    instance.eventSupport.addEventListener('myEvent', instance2, instance2.callBack);

    let hit3 = false;
    instance3.callBack = async (...args) => { hit3 = args; return 'ok2' }
    instance.eventSupport.addEventListener('myEvent', instance3, instance3.callBack);

    let input = ['some'];
    let resultPromise = instance.eventSupport.fire('myEvent', instance, ...input);

    expect(Thinglish.isPromise(resultPromise)).to.be.true;
    let result = await resultPromise;

    expect(result[0].value).to.be.equal('ok1');
    expect(result[1].value).to.be.equal('ok2');

    expect(result.length).to.be.equal(2);

    expect(hit2[1]).to.equal(input[0]);
    expect(hit3[1]).to.equal(input[0]);

  });
});


describe('FunctionPromiseQueue', function () {

  it('Result is passed', async function () {
    const queue = new FunctionPromiseQueue().init(`Test Queue: ${this.test.title}`);

    const asyncFunction = async (id) => {
      await Thinglish.wait(5);
      return "OK";
    }

    let result = await queue.enqueue(asyncFunction.bind(this));

    expect(result).to.equal('OK');
  });

  it('Sequence 10 async Functions', async function () {
    const queue = new FunctionPromiseQueue().init(`Test Queue: ${this.test.title}`);

    let result = [];
    const asyncFunction = async (id) => {
      let waitTime = Math.random() * 10;
      await Thinglish.wait(waitTime);
      result.push(id);
    }

    let lastPromise;
    for (let i = 0; i < 10; i++) {
      lastPromise = queue.enqueue(asyncFunction.bind(this, i));
    }
    await lastPromise;

    expect(result).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('Timeout in the queue with once function', async function () {
    const queueName = `Test Queue: ${this.test.title}`
    const queue = new FunctionPromiseQueue().init(queueName);
    queue._private.silentMode = true;

    const asyncFunction = async (id) => {
      await Thinglish.wait(200);
      return true;
    }

    try {
      await queue.enqueue(asyncFunction.bind(this), 50);
      throw new Error("Missing Error Message");
    } catch (err) {
      expect(`Got Timeout in FunctionPromiseQueue: 'Test Queue: Timeout in the queue with once function' Function: 'bound asyncFunction' | Function is running`).to.equal(err.message)
    }
  });

  it('Timeout in the queue with two function', async function () {
    const queueName = `Test Queue: ${this.test.title}`
    const queue = new FunctionPromiseQueue().init(queueName);
    queue._private.silentMode = true;

    const asyncFunction = async (id) => {
      await Thinglish.wait(200);
      return true;
    }

    const firstFunctionCallGenerator = async () => {
      try {

        await queue.enqueue(asyncFunction.bind(this), 50);
      } catch (err) {
        expect(`Got Timeout in FunctionPromiseQueue: \'${queueName}\' Function: \'bound asyncFunction\' | Function is running`, 'First Function').to.equal(err.message)

      }
    }
    const asyncFunction2 = async (id) => {
      return true;
    }

    firstFunctionCallGenerator();
    try {
      await queue.enqueue(asyncFunction2.bind(this), 10);
      throw new Error("Missing Error Message");
    } catch (err) {
      expect(`Got Timeout in FunctionPromiseQueue: \'${queueName}\' Function: \'bound asyncFunction2\' QueueSize: [1]`).to.equal(err.message);
    }

  });

  it('Timeout first long running Function and execute second function', async function () {
    const queueName = `Test Queue: ${this.test.title}`
    const queue = new FunctionPromiseQueue().init(queueName);
    queue._private.silentMode = true;

    const asyncFunction = async (id) => {
      await Thinglish.wait(100000);
      return true;
    }

    const firstFunctionCallGenerator = async () => {
      try {
        await queue.enqueue(asyncFunction.bind(this), 50);
        throw new Error("Missing Error");
      } catch (err) {
        expect(`Got Timeout in FunctionPromiseQueue: \'${queueName}\' Function: \'bound asyncFunction\' | Function is running`, 'First Function').to.equal(err.message)

      }
    }

    const asyncFunction2 = async (id) => {
      return 'OK';
    }

    firstFunctionCallGenerator();

    let result = await queue.enqueue(asyncFunction2.bind(this), 200);

    expect(result).to.equal('OK');

  }).timeout(3000);

});



describe('Store', function () {

  describe('WeakRefPromiseStore', function () {
    it('register Object => Object', async function () {
      let idealComponentClass = await IOR.load(idealUDE);
      let instance = idealComponentClass.getInstance().init();

      let store = WeakRefPromiseStore.getInstance().init();
      let target = { some: 'test' }
      store.register(instance, target);
      expect(store.lookup(instance)).to.be.equal(target);
    });

    it('register string => Object', async function () {
      let instance = 'some String';

      let store = WeakRefPromiseStore.getInstance().init();
      let target = { some: 'test' }
      store.register(instance, target);
      expect(store.lookup(instance)).to.be.equal(target);
    });
  });

  describe('WeakMapPromiseStore', function () {
    it('register Object => Object', async function () {
      let idealComponentClass = await IOR.load(idealUDE);
      let instance = idealComponentClass.getInstance().init();

      let store = WeakMapPromiseStore.getInstance().init();
      let target = { some: 'test' }
      store.register(instance, target);
      expect(store.lookup(instance)).to.be.equal(target);
    });

    it('register Object => String', async function () {
      let target = 'some String';
      let instance = { some: 'test' }

      let store = WeakMapPromiseStore.getInstance().init();
      store.register(instance, target);
      expect(store.lookup(instance)).to.be.equal(target);
    });

    it('register Object => Promise / event', async function () {
      let idealComponentClass = await IOR.load(idealUDE);
      let idealComponent = idealComponentClass.getInstance().init();

      let promiseResult = { some: 'test' }
      let instance = { some: 'instance' }

      let promiseHandler = Thinglish.createPromise();

      let result;
      let store = WeakMapPromiseStore.getInstance().init();
      store.eventSupport.addEventListener(Store.EVENT.ON_REGISTER, idealComponent, (...args) => { result = args });

      store.register(instance, promiseHandler.promise);
      expect(Thinglish.isPromise(store.lookup(instance))).to.be.true;
      expect(result).to.be.undefined;

      promiseHandler.setSuccess(promiseResult);
      await Thinglish.wait(10);

      expect(result[1]).to.be.equal(instance);
      expect(result[2]).to.be.equal(promiseResult);
      expect(store.lookup(instance)).to.be.equal(promiseResult);

    });

    it('register Object => Promise fails / event', async function () {
      let idealComponentClass = await IOR.load(idealUDE);
      let idealComponent = idealComponentClass.getInstance().init();

      let instance = { some: 'instance' }

      let promiseHandler = Thinglish.createPromise();

      let result;
      let store = WeakMapPromiseStore.getInstance().init();
      store.eventSupport.addEventListener(Store.EVENT.ON_REGISTER, idealComponent, (...args) => { result = args });

      store.register(instance, promiseHandler.promise);
      expect(Thinglish.isPromise(store.lookup(instance))).to.be.true;
      expect(result).to.be.undefined;

      promiseHandler.setError(new Error("something went wrong"));
      await Thinglish.wait(10);

      expect(result).to.be.undefined;
      expect(store.lookup(instance)).to.be.undefined;

    });


    it('event ON_REGISTER', async function () {
      let idealComponentClass = await IOR.load(idealUDE);
      let idealComponent = idealComponentClass.getInstance().init();

      let target = 'some String';
      let instance = { some: 'test' }

      let store = WeakMapPromiseStore.getInstance().init();

      let result;

      store.eventSupport.addEventListener(Store.EVENT.ON_REGISTER, idealComponent, (...args) => { result = args });
      store.register(instance, target);
      expect(result[1]).to.equal(instance);
      expect(result[2]).to.equal(target);

    });

    it('event ON_REMOVE', async function () {
      let idealComponentClass = await IOR.load(idealUDE);
      let idealComponent = idealComponentClass.getInstance().init();

      let target = 'some String';
      let instance = { some: 'test' }

      let store = WeakMapPromiseStore.getInstance().init();

      let result;

      store.eventSupport.addEventListener(Store.EVENT.ON_REMOVE, idealComponent, (...args) => { result = args });
      store.register(instance, target);
      store.remove(instance);
      expect(result[1]).to.equal(instance);

    });

    it('event ON_CLEAR', async function () {
      let idealComponentClass = await IOR.load(idealUDE);
      let idealComponent = idealComponentClass.getInstance().init();

      let target = 'some String';
      let instance = { some: 'test' }

      let store = WeakMapPromiseStore.getInstance().init();

      let result;

      store.eventSupport.addEventListener(Store.EVENT.ON_CLEAR, idealComponent, (...args) => { result = args });
      store.register(instance, target);
      store.clear();
      expect(result.length).to.equal(1);

    });
  });
});


// https://github.com/mochajs/mocha/issues/4798
// https://github.com/the-moebius/http-graceful-shutdown
describe('Once Server teardown after tests', function () {

  describe('Check if ONCE server is up', function () {
    it('shutdown Once server', async function () {
        if (ONCE.isStarted) {
          //ONCE.shutdown();
          console.log("ONCE is started.");
          console.log("ONCE.servers length : " + ONCE.servers.length)

          /** @type {module:net.Socket[]} sockets */
          const sockets = ONCE.sockets;
          sockets.forEach(s=>s.destroy());
           
          for (let i = 0; i < ONCE.servers.length; i++) {
            /** @type {module:http.Server} server */
            let server = ONCE.servers[i];
            server.close(() => {  console.log("shutting down express.server." + i) });
          }
        }
    });
  });

  describe('Kill process', function () {
    it('kill process', async function () {
        setTimeout(function () {
          console.log("Here is the output of why-is-node-running. Logs out active handles that are keeping node running.");
          why_is_node_running() // logs out active handles that are keeping node running
          process.kill(process.pid, "SIGINT");
        }, 20000);
        console.log("Cleanup and SIGINT in 20 seconds.");
      });
  });

});
