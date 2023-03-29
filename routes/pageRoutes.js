// firebase imports
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";



// module imports
import { Router } from "express";

import { formateCurrency } from "../public/scripts/currencyFormatter.js"


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



    const docRefHome = doc( imports.db, "ayruJaipur", "homepage" );
    const docSnapHome = await getDoc( docRefHome );

    if ( docSnapHome.exists() ) {

        console.log( "Document data:", docSnapHome.data() );
        res.render( 'home', { homepageList: docSnapHome.data() } )

    } else {
        // doc.data() will be undefined in this case
        res.render( '404' )
        console.log( "No such document!" );
    }

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

        console.table( docSnap.data() );

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

                        const item = docSnap.data()[ itemRef.name ]
                        // console.log( itemRef.name + " => " + imgUrl );
                        // console.table( item );
                        let totalQuantityAvailable = parseInt( item[ 'king' ][ 1 ] ) + parseInt( item[ 'queen' ][ 1 ] ) + parseInt( item[ 'single' ][ 1 ] )

                        return ( { itemId: itemRef.name, itemName: item.name, itemImgUrl: imgUrl, itemPrice: formateCurrency( item.baseprice ), itemAvaibility: totalQuantityAvailable } )

                        // return ( { imgID: itemRef.name, itemImgUrl: imgUrl } )



                    } )
                    .catch( ( error ) => {
                        console.error( error )
                    } );
                return imgData;

            } ) )
            // console.log( imgArr );
            return imgArr;


        } ).catch( ( er2 ) => {
            console.error( er2 );
        } );

    console.table( itemList );





    res.render( "products", { list: itemList, product: product } );
} )


// specific product
router.get( "/collections/:category/product/:item", async function ( req, res ) {

    const itemID = req.params.item;
    const category = req.params.category;

    // reading all the data of products in db
    const docSnap = await getDoc( doc( imports.db, "ayruJaipur", category ) );
    if ( docSnap.exists() ) {
        console.table( docSnap.data()[ itemID ] );

    } else {
        console.log( "No such document!" );
    }



    // reference to a bucket in cloud storage
    const imgRef = ref( imports.storage, category + "/" + itemID );
    const imgURL = await getDownloadURL( imgRef )
        .then( ( url ) => {
            // `url` is the download URL for 'images/stars.jpg'

            // console.log( url );
            return url;
        } )
        .catch( ( er3 ) => {
            console.error( er3 )
        } );

    const itemData = { ...docSnap.data()[ itemID ], url: imgURL };

    itemData.single[ 0 ] = formateCurrency( itemData.single[ 0 ] )
    itemData.queen[ 0 ] = formateCurrency( itemData.queen[ 0 ] )
    itemData.king[ 0 ] = formateCurrency( itemData.king[ 0 ] )

    console.log( itemData );

    res.render( 'item', { itemData: itemData } )

} );



// client love
router.get( "/clientLove", function ( req, res ) {



    const listRefClientLove = ref( imports.storage, 'client love' );

    listAll( listRefClientLove )
        .then( async ( clientLoveRes ) => {

            const clientLoveImagesList = await Promise.all( clientLoveRes.items.map( async ( clientLoveRes ) => {


                const clientLoveUrl = await getDownloadURL( clientLoveRes )
                    .then( ( url ) => {
                        // `url` is the download URL for 'images/*.jpg'

                        return url;
                    } )
                    .catch( ( er5 ) => {
                        console.error( er5 )
                    } );
                return clientLoveUrl;
            } ) )
            console.log( clientLoveImagesList );

            res.render( 'clientLove', { clientLoveImagesList: clientLoveImagesList } );


        } ).catch( ( er4 ) => {

            console.error( er4 )
            res.render( '500' )

        } );



} )


// refunf policy page
router.get( "/return&refund-policy", async function ( req, res ) {

    res.render( 'refundReturnPolicy' );
} );


// cancelation page
router.get( "/Cancellation", async function ( req, res ) {

    res.render( 'Cancellation' );
} );


// shipping page
router.get( "/Shipping", async function ( req, res ) {

    res.render( 'Shipping' );
} );




export { router };