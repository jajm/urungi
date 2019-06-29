const jQuery = require('jquery');
Object.defineProperty(window, 'jQuery', { value: jQuery });
Object.defineProperty(window, '$', { value: jQuery });

const angular = require('angular');
Object.defineProperty(window, 'angular', { value: angular });

require('angular-route');
require('angular-gettext');

const Noty = require('noty');
Object.defineProperty(window, 'Noty', { value: Noty });

require('./dist/templates/templates.js');
require('./public/js/core/core.module.js');
require('./public/js/core/constants.js');
require('./public/js/core/connection.js');
require('./public/js/core/api.js');
require('./public/js/core/uuid.service.js');
require('./public/js/data-sources/data-sources.module.js');
require('./public/js/data-sources/data-sources-list.controller.js');
require('angular-mocks');
