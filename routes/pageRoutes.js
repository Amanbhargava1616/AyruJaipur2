// firebase imports
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";

// module imports
import { Router } from "express";

import { formateCurrency } from "../public/scripts/currencyFormatter.js"
import { calculateDiscount } from "../public/scripts/calculateDiscount.js"

// class for Non-Sale product
class nonSaleItemData {
    constructor( ID, name, imgUrl, baseprice, qunatity ) {
        this.itemId = ID;
        this.itemName = name;
        this.itemImgUrl = imgUrl;
        this.itemPrice = formateCurrency( baseprice );
        this.itemAvaibility = parseInt( qunatity );

        return this;
    }
}


// class for Sale product
class saleItemData {
    constructor( ID, name, imgUrl, baseprice, qunatity, discount, category ) {
        this.itemId = ID;
        this.itemName = name;
        this.itemImgUrl = imgUrl;
        this.itemPrice = formateCurrency( baseprice );
        this.itemAvaibility = parseInt( qunatity );
        this.discount = discount;
        this.category = category;

        return this;
    }
}


const router = Router();


// connection to database and firestore cloud
import imports from "../database/firebaseConfig.js";


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

    await setDoc( doc( imports.db, "registeredUsers", toBeRegister_UserData.emailID ), toBeRegister_UserData ).then( () => {
        console.log( "User Added successfully !" );

        res.redirect( '/home' )
    } ).catch( ( er1 ) => {
        console.error( "Error Updating document: ", er1 );
    } );

} )


// client love
router.get( "/clientLove", function ( req, res ) {


    // reference to client love bucket 
    const listRefClientLove = ref( imports.storage, 'client love' );

    listAll( listRefClientLove )
        .then( async ( clientLoveRes ) => {

            const clientLoveImagesList = await Promise.all( clientLoveRes.items.map( async ( clientLoveRes ) => {


                const clientLoveUrl = await getDownloadURL( clientLoveRes )
                    .then( ( url ) => {
                        // `url` is the download URL for 'images/*.jpg'

                        return url;
                    } )
                    .catch( ( er2 ) => {
                        console.error( er2 )
                    } );

                return clientLoveUrl;
            } ) )
            console.log( clientLoveImagesList );

            res.render( 'clientLove', { clientLoveImagesList: clientLoveImagesList } );


        } ).catch( ( er3 ) => {

            console.error( er3 )
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

        const saleItemCategory = doc.data().itemref[ '_key' ].path.segments[ 5 ]


        var saleItemSnap = await getDoc( doc.data().itemref );

        // reference to bucket/image.jpg
        const imgRefSaleItem = ref( imports.storage, saleItemCategory + "/" + saleItemSnap.id );
        const imgURLSaleItem = await getDownloadURL( imgRefSaleItem )
            .then( ( url ) => {
                // `url` is the download URL for 'images/stars.jpg'

                return url;
            } )
            .catch( ( er4 ) => {
                console.error( er4 )
            } );



        if ( saleItemCategory == 'bedsheets' ) {

            // calculating the total of no. of single ,queen ,king size bedsheets
            var totalSaleItemQuantity = parseInt( saleItemSnap.data().single[ 1 ] ) + parseInt( saleItemSnap.data().queen[ 1 ] ) + parseInt( saleItemSnap.data().king[ 1 ] )

            return new saleItemData( saleItemSnap.id, saleItemSnap.data().name, imgURLSaleItem, saleItemSnap.data().baseprice, totalSaleItemQuantity, doc.data().discount, saleItemCategory )

        } else
            return new saleItemData( saleItemSnap.id, saleItemSnap.data().name, imgURLSaleItem, saleItemSnap.data().baseprice, saleItemSnap.data().quantity, doc.data().discount, saleItemCategory )

    } ) );

    console.log( saleItemList );

    res.render( "products", { list: saleItemList, product: 'Sale' } );

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
            .catch( ( er5 ) => {
                console.error( er5 )
            } );

        if ( product == 'bedsheets' ) {

            // calculating the total of no. of single ,queen ,king size bedsheets
            var totalQuantityAvailable = parseInt( doc.data().king[ 1 ] ) + parseInt( doc.data().queen[ 1 ] ) + parseInt( doc.data().single[ 1 ] )

            return new nonSaleItemData( doc.id, doc.data().name, imgURLProduct, doc.data().baseprice, totalQuantityAvailable )

        }
        else
            return new nonSaleItemData( doc.id, doc.data().name, imgURLProduct, doc.data().baseprice, doc.data().quantity )

    } ) );

    console.log( ProductDataList );

    res.render( "products", { list: ProductDataList, product: product } );

} )


// specific product for bedsheet
router.get( "/collections/bedsheets/product/:item", async function ( req, res ) {

    const bedsheetID = req.params.item;

    // reading all the data of products in db
    const bedsheetRef = doc( imports.db, 'bedsheets', bedsheetID );
    const bedsheetSnap = await getDoc( bedsheetRef );

    // reference to a bucket in cloud storage
    const imgRef = ref( imports.storage, 'bedsheets' + "/" + bedsheetID );
    const imgURL = await getDownloadURL( imgRef )
        .then( ( url ) => {
            // `url` is the download URL for 'images/stars.jpg'

            // console.log( url );
            return url;
        } )
        .catch( ( er6 ) => {
            console.error( er6 )
        } );

    const bedsheetData = { ...bedsheetSnap.data(), url: imgURL };

    bedsheetData.single[ 0 ] = formateCurrency( bedsheetData.single[ 0 ] )
    bedsheetData.queen[ 0 ] = formateCurrency( bedsheetData.queen[ 0 ] )
    bedsheetData.king[ 0 ] = formateCurrency( bedsheetData.king[ 0 ] )

    console.log( bedsheetData );

    res.render( 'bedsheet', { itemData: bedsheetData } )

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
        .catch( ( er7 ) => {
            console.error( er7 )
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