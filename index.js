const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'bookinventory';
const adapterConfig = { mongoUri: 'mongodb://localhost/bookinventory' };
const UserSchema = require('./schemas/User');
const BookSchema = require('./schemas/Book');

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
});

const isAdmin = ({ authentication: { item: user } }) =>
  !!user && !!user.isAdmin;
const isLoggedIn = ({ authentication: { item: user } }) => !!user;

const isOwner = ({ authentication: { item: user } }) => {
  if (!user) return false;

  return { id: user.id };
};

const isAdminOrOwner = (auth) => {
  const isAdmin = access.isAdmin(auth);
  const isOwner = access.isOwner(auth);

  return isAdmin ? isAdmin : isOwner;
};

const access = { isAdmin, isLoggedIn, isOwner, isAdminOrOwner };

keystone.createList('User', {
  fields: UserSchema.fields,
  access: {
    // has to be logged In
    read: access.isLoggedIn,
    // has to be admin
    create: access.isAdmin,
    update: access.isAdminOrOwner,
    delete: access.isAdmin,
    auth: true,
  },
  // showing username as label for user
  labelField: 'username',
});

keystone.createList('Book', {
  fields: BookSchema.fields,
  access: {
    // everyone can read it
    read: true,
    // has to be logged in
    create: access.isLoggedIn,
    // has to be admin or owner
    update: access.isAdminOrOwner,
    // has to be admin
    delete: access.isAdmin,
    auth: true,
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {
    identityField: 'username',
    secretFiled: 'password',
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
      isAccessAllowed: isLoggedIn,
    }),
  ],
};
