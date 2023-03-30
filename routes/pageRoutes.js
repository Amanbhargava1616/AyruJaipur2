// firebase imports
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";



// module imports
import { Router } from "express";

import { formateCurrency } from "../public/scripts/currencyFormatter.js"
import { calculateDiscount } from "../public/scripts/calculateDiscount.js"


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





// rendering collections page
router.get( "/collections", function ( req, res ) {
    res.render( "collections" );
} )



router.get( "/discounted-items", async function ( req, res ) {


    const saleSnapshot = await getDocs( collection( imports.db, 'sale' ) );

    const saleItemList = await Promise.all( saleSnapshot.docs.map( async ( doc ) => {
        // doc.data() is never undefined for query doc snapshots
        const saleItemSnap = await getDoc( doc.data().itemref );
        const saleItem = { ...saleItemSnap.data(), discount: doc.data().discount };



        // saleItem.single.push( calculateDiscount( saleItem.single[ 0 ], saleItem.discount ) )
        // saleItem.queen.push( calculateDiscount( saleItem.queen[ 0 ], saleItem.discount ) )
        // saleItem.king.push( calculateDiscount( saleItem.king[ 0 ], saleItem.discount ) )
        // saleItem.single[ 0 ] = formateCurrency( saleItem.single[ 0 ] )
        // saleItem.king[ 0 ] = formateCurrency( saleItem.king[ 0 ] )
        // saleItem.queen[ 0 ] = formateCurrency( saleItem.queen[ 0 ] )
        saleItem.baseprice = formateCurrency( saleItem.baseprice );
        console.log( saleItem )

        return saleItem;

    } ) );


    console.log( saleItemList );

} )



// rendering a product page
router.get( "/collections/:product", async function ( req, res ) {

    const product = req.params.product;


    // reading all the data of products in db
    const querySnapshot = await getDocs( collection( imports.db, product ) );

    const ProductDataList = await Promise.all( querySnapshot.docs.map( async ( doc ) => {

        const imgRefProduct = ref( imports.storage, product + "/" + doc.id );
        const imgURLProduct = await getDownloadURL( imgRefProduct )
            .then( ( url ) => {
                // `url` is the download URL for 'images/stars.jpg'

                return url;
            } )
            .catch( ( er2 ) => {
                console.error( er2 )
            } );

        if ( product == 'bedsheets' ) {
            var totalQuantityAvailable = parseInt( doc.data().king[ 1 ] ) + parseInt( doc.data().queen[ 1 ] ) + parseInt( doc.data().single[ 1 ] )
            return ( { itemId: doc.id, itemName: doc.data().name, itemImgUrl: imgURLProduct, itemPrice: formateCurrency( doc.data().baseprice ), itemAvaibility: totalQuantityAvailable } )

        }
        else
            return ( { itemId: doc.id, itemName: doc.data().name, itemImgUrl: imgURLProduct, itemPrice: formateCurrency( doc.data().baseprice ), itemAvaibility: doc.data().quantity } )

    } ) );

    console.log( ProductDataList );

    res.render( "products", { list: ProductDataList, product: product } );
} )


// specific product for bedsheet
router.get( "/collections/bedsheets/product/:item", async function ( req, res ) {

    const itemID = req.params.item;

    // reading all the data of products in db
    const itemRef = doc( imports.db, 'bedsheets', itemID );
    const itemSnap = await getDoc( itemRef );

    // reference to a bucket in cloud storage
    const imgRef = ref( imports.storage, 'bedsheets' + "/" + itemID );
    const imgURL = await getDownloadURL( imgRef )
        .then( ( url ) => {
            // `url` is the download URL for 'images/stars.jpg'

            // console.log( url );
            return url;
        } )
        .catch( ( er3 ) => {
            console.error( er3 )
        } );

    const itemData = { ...itemSnap.data(), url: imgURL };

    itemData.single[ 0 ] = formateCurrency( itemData.single[ 0 ] )
    itemData.queen[ 0 ] = formateCurrency( itemData.queen[ 0 ] )
    itemData.king[ 0 ] = formateCurrency( itemData.king[ 0 ] )

    console.log( itemData );

    res.render( 'bedsheet', { itemData: itemData } )

} );


// specific product for category
router.get( "/collections/:category/product/:item", async function ( req, res ) {

    const itemID = req.params.item;
    const category = req.params.category;

    // reading all the data of products in db
    const itemRef = doc( imports.db, category, itemID );
    const itemSnap = await getDoc( itemRef );

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

    const itemData = { ...itemSnap.data(), url: imgURL };

    itemData.baseprice = formateCurrency( itemData.baseprice );

    console.log( itemData );

    res.render( 'item', { itemData: itemData } )

} );


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