import express from 'express';
import session from 'express-session';
import handlebars from 'express-handlebars';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';

import viewsRouter from './routes/views.router.js';
import sessionsRouter from './routes/session.router.js';
import initializePassportStrategies from './config/passport.config.js';

import __dirname from './utils.js';

const app = express();

app.engine('handlebars',handlebars.engine());
app.set('views',`${__dirname}/views`);
app.set('view engine','handlebars');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(`${__dirname}/public`));

const connection = mongoose.connect("mongodb+srv://santiagodanielgomez:AhMbwxyx24izrjse@e-commerce.wnmhhjz.mongodb.net/?retryWrites=true&w=majority")

app.use(session({
    store: new MongoStore({
        mongoUrl:"mongodb+srv://santiagodanielgomez:AhMbwxyx24izrjse@e-commerce.wnmhhjz.mongodb.net/?retryWrites=true&w=majority",
        ttl: 3600,
    }),
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
initializePassportStrategies();

app.use('/',viewsRouter);
app.use('/api/sessions',sessionsRouter);

app.listen(8080,()=>console.log("Listening"));