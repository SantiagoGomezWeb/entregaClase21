import passport from 'passport';
import local from 'passport-local';
import GithubStrategy from 'passport-github2';
import userModel from '../dao/mongo/user.js';
import { createHash, validatePassword } from '../utils.js';

const LocalStrategy = local.Strategy; 

// Objetivo 2: register y login con passport
const initializePassportStrategies = () => {
  passport.use(
    'register',
    new LocalStrategy(
      { passReqToCallback: true, usernameField: 'email' },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name } = req.body;
          const exists = await userModel.findOne({ email });
          if (exists)
            return done(null, false, { message: 'User already exists' });
          const hashedPassword = await createHash(password);
          const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword,
          };
          const result = await userModel.create(user);
          done(null, result);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    'login',
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        if (email === 'admin@admin.com' && password === '123') {
          const user = {
            id: 0,
            name: `Admin`,
            role: 'admin',
            email: '...',
          };
          return done(null, user);
        }
        let user;
        user = await userModel.findOne({ email });
        if (!user)
          return done(null, false, { message: 'Incorrect Credentials' });
        const isValidPassword = await validatePassword(password, user.password);
        if (!isValidPassword)
          return done(null, false, { message: 'Invalid password' });
        user = {
          id: user._id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
        };
        return done(null, user);
      }
    )
  );

  // Objetivo 3: login con GitHub
  passport.use(
    'github',
    new GithubStrategy(
      {
        clientID: 'Iv1.37289a2174c03974',
        clientSecret: 'b67cd862eff84a8c818a46cc6f6e640875e4f77d',
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          const { name, email } = profile._json;
          const user = await userModel.findOne({ email });
          if(!user) {
            const newUser =  {
              first_name: name,
              email,
              password:''
            }
            const result = await userModel.create(newUser);
            done(null,result);
          }
          done(null,user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    return done(null, user.id);
  });
  passport.deserializeUser(async function (id, done) {
    if (id === 0) {
      return done(null, {
        role: 'admin',
        name: 'ADMIN',
      });
    }
    const user = await userModel.findOne({ _id: id });
    return done(null, user);
  });
};
export default initializePassportStrategies;