// module imports
import express, { urlencoded } from "express";
import { dirname, join } from "path";
import { fileURLToPath } from 'url';


const app = express();



// connecting to routing files
import { router } from "./routes/pageRoutes.js";


// connection to database and firestore cloud
import imports from "./database/firebaseConfig.js"


// deploying
let port = 3000;
if ( process.env.PORT ) {
    port = process.env.PORT
}

const __dirname = dirname( fileURLToPath( import.meta.url ) );

const views_path = join( __dirname, 'views' )



// const { FirestoreStore } = require( '@google-cloud/connect-firestore' );                     // third party package for storing session in firestore



// const sessionStore = new FirestoreStore( {                           // constructor to configure the session
//     dataset: imports.db
// } );


// app.use( session( {                                                 // to use session
//     secret: "super-secret",
//     resave: false,                                                  // to not resave new sessions from same user
//     saveUninitialized: false,
//     store: sessionStore                                             // where to store session data

// } ) );

// app.use( cookieParser() )


app.set( 'view engine', 'ejs' );       // Activate ejs engine
app.set( 'views', views_path );


app.use( urlencoded( { extended: true } ) );      // Parse incoming request bodies
app.use( express.static( 'public' ) );   // Serve static files (e.g. CSS , JS)


app.use( router );



app.use( function ( error, req, res, next ) {

    // Default error handling 
    // Will become active whenever any route / middleware crashes
    console.log( error );
    res.status( 500 ).render( '500' );
} );


app.listen( port );