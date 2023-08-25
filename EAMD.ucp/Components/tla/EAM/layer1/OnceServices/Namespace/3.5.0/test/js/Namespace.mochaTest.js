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

describe('Namespace 1.0.0', function() {
  let Component, c1, testDiv;
  const descriptor = '/EAMD.ucp/Components/XXXXX/Namespace/1.0.0/Namespace.component.xml';

  it('should create a testDiv and get the Class ', async () => {
    testDiv = document.createElement('div');
    testDiv.classList.add('hidden');
    document.body.appendChild(testDiv);
    Component = await ONCE.dropSupport.loadDescriptor(descriptor);
  });
  it('testDiv element should be a div and Namespace class should exists', done => {
    expect(testDiv).to.be.an.instanceof(HTMLElement);
    expect(Component).to.be.an.instanceof(Function);
    done();
  });
  it('should create 1 instance of Namespace and add it into testDiv', done => {
    c1 = Component.getInstance().init();
    expect(c1).to.be.an.instanceof(Component);

    expect(c1).has.hasOwnProperty('properties');
    expect(c1.properties).hasOwnProperty('classes');
    // expect(c1.properties.classes).to.be.a('string');
    c1.defaultView.append(document.body);

    done();
  });

  it('should remove instances of Namespace and check testDiv for empty', done => {
    c1.defaultView.remove();
    const componentViews = UcpComponentSupport.getAllUcpViews();
    expect(componentViews).to.be.an.instanceof(Array);
    expect(testDiv.innerHTML).to.be.empty;
    done();
  });
  after(done => {
    testDiv.remove();
    done();
  });
});
