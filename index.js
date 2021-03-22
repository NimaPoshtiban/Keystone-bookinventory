const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'bookinventory';
const adapterConfig = { mongoUri: 'mongodb://localhost/bookinventory' };



const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
});

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({ name: PROJECT_NAME, enableDefaultRoute: true })],
};
