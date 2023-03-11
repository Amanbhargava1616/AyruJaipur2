// firebase imports
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";



// module imports
import { Router } from "express";


// importing multer
// import multer, { diskStorage } from "multer";


const router = Router();


// connection to database and firestore cloud
import imports from "../database/firebaseConfig.js";



// configrating multer to specify the storage loaction of file
// const storageConfig = diskStorage( {
//     destination: function ( req, file, cb ) {
//         cb( null, 'public/images' );
//     }
// } )


// intializing multer
// const upload = multer( { storage: storageConfig } )       // this helps to access the image in the comming request


// redirecting to landing Page
router.get( "/", function ( req, res ) {
    res.redirect( "/home" );
} )


// landing page
router.get( "/home", async function ( req, res ) {                                                  // router.get( "/home", upload.single( 'files' ), async function ( req, res ) {


    // reference to a bucket in cloud storage
    const storageRef = ref( imports.storage, "bedsheets" );


    // array of objects of all the images in bucket
    const imgList = await listAll( storageRef )
        .then( async ( imgRef ) => {

            const imgArr = await Promise.all( imgRef.items.map( async ( itemRef ) => {


                const imgData = await getDownloadURL( itemRef )
                    .then( ( imgUrl ) => {
                        // console.log( itemRef.name + " => " + imgUrl );
                        return ( { imgName: itemRef.name, imgUrl: imgUrl } )

                    } )
                    .catch( ( error ) => {
                        console.error( error )
                    } );
                return imgData;

            } )
            )
            // console.log( imgArr );
            return imgArr;


        } ).catch( ( er2 ) => {
            console.error( er2 );
        } );

    console.log( imgList );



    // reading all the products in db
    const querySnapshot = await getDocs( collection( imports.db, "ayruJaipur" ) );
    const tempDoc = [];
    querySnapshot.forEach( ( doc ) => {

        // doc.data() is never undefined for query doc snapshots
        console.log( doc.id, " => ", doc.data() );
        tempDoc.push( { id: doc.id, Data: doc.data() } )

    } );
    res.render( 'home', { itemList: tempDoc } )



} )


// registering a user
router.post( "/register", async function ( req, res ) {
    const toBeRegister_UserData = req.body;

    console.table( toBeRegister_UserData )

    // imports.db.collection( "registeredUsers" ).doc( toBeRegister_UserData.emailID ).set( toBeRegister_UserData )

    await setDoc( doc( imports.db, "registeredUsers", toBeRegister_UserData.emailID ), toBeRegister_UserData ).then( () => {
        console.log( "User Added successfully !" );

        res.redirect( '/home' )
    } )
        .catch( ( er1 ) => {
            console.error( "Error Updating document: ", er1 );
        } );

} )


// rendering collections page
router.get( "/collections", function ( req, res ) {
    res.render( "collections" );
} )




// rendering a product page
router.get( "/collections/:product", async function ( req, res ) {

    const product = req.params.product;


    // reading all the data of products in db
    const docSnap = await getDoc( doc( imports.db, "ayruJaipur", product ) );
    if ( docSnap.exists() ) {

        console.log( docSnap.data() );

    } else {
        console.log( "No such document!" );
    }



    // reference to a bucket in cloud storage
    const storageRef = ref( imports.storage, product );


    // array of objects of all the images in bucket
    const itemList = await listAll( storageRef )
        .then( async ( imgRef ) => {

            const imgArr = await Promise.all( imgRef.items.map( async ( itemRef ) => {


                const imgData = await getDownloadURL( itemRef )
                    .then( async ( imgUrl ) => {

                        // console.log( itemRef.name + " => " + imgUrl );
                        // console.log( docSnap.data()[ itemRef.name ] );

                        return ( { itemId: itemRef.name, itemName: docSnap.data()[ itemRef.name ][ 0 ], itemImgUrl: imgUrl, itemPrice: docSnap.data()[ itemRef.name ][ 1 ], itemAvaibility: docSnap.data()[ itemRef.name ][ 2 ] } )

                        // return ( { imgID: itemRef.name, itemImgUrl: imgUrl } )



                    } )
                    .catch( ( error ) => {
                        console.error( error )
                    } );
                return imgData;

            } )
            )
            // console.log( imgArr );
            return imgArr;


        } ).catch( ( er2 ) => {
            console.error( er2 );
        } );

    console.log( itemList );





    res.render( "products", { list: itemList, product: product } );
} )




export { router };