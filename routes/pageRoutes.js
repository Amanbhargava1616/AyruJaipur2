// firebase imports
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";

// module imports
import { Router } from "express";

import { formateCurrency } from "../public/scripts/currencyFormatter.js"
import { calculateDiscount } from "../public/scripts/calculateDiscount.js"

// class for Non-Sale item for non sale list
class productData {
    constructor( ID, name, imgUrl, baseprice, productType, qunatity ) {
        this.itemId = ID;
        this.itemName = name;
        this.itemImgUrl = imgUrl;
        this.itemPrice = formateCurrency( baseprice );
        this.itemAvaibility = parseInt( qunatity );
        this.productType = productType;

        return this;
    }
}


// class for Sale item for sale list
// class for specific sale item 
class saleItemData {
    constructor( ID, name, imgUrl, baseprice, qunatity, discount, subImgsUrlList, description, specification, instructions, disclaimer, endingline ) {
        this.itemId = ID;
        this.itemName = name;
        this.itemImgUrl = imgUrl;
        this.itemPrice = formateCurrency( baseprice );
        this.itemAvaibility = parseInt( qunatity );
        this.discount = parseInt( discount );
        this.discountPrice = formateCurrency( ( 1 - this.discount * 0.01 ) * parseFloat( baseprice ) )
        this.subImgsUrlList = subImgsUrlList
        this.description = description
        this.instructions = instructions
        this.specification = specification
        this.disclaimer = disclaimer
        this.endingline = endingline

        return this;
    }
}

// class for specific sale item bedsheet 

class saleBedsheetData {
    constructor( name, imgUrl, single, queen, king, discount, subImgsUrlList, description, specification, instructions, disclaimer, endingline ) {

        this.itemName = name;
        this.itemImgUrl = imgUrl;

        // inserting discount price in arrays
        single.push( formateCurrency( ( 1 - discount * 0.01 ) * parseFloat( single[ 0 ] ) ) )
        queen.push( formateCurrency( ( 1 - discount * 0.01 ) * parseFloat( queen[ 0 ] ) ) )
        king.push( formateCurrency( ( 1 - discount * 0.01 ) * parseFloat( king[ 0 ] ) ) )

        // formating the original price
        single[ 0 ] = formateCurrency( single[ 0 ] );
        queen[ 0 ] = formateCurrency( queen[ 0 ] );
        king[ 0 ] = formateCurrency( king[ 0 ] );

        return { ...this, single, queen, king, subImgsUrlList, description, specification, instructions, disclaimer, endingline, discount };
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
    const clientReviewRef = await getDocs( collection( imports.db, "clientlove" ) );
    const docSnapHome = await getDoc( docRefHome );



    if ( docSnapHome.exists() ) {

        const clientReview = await Promise.all( clientReviewRef.docs.map( async ( doc ) => {

            return { ...doc.data(), clientName: doc.id }
        } ) );
        console.log( clientReview )

        console.log( "Document data:", docSnapHome.data() );
        res.render( 'home', { homepageList: docSnapHome.data(), clientreviewList: clientReview } )

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



// rendering page for sale items
router.get( "/discounted-items", async function ( req, res ) {


    const saleSnapshot = await getDocs( collection( imports.db, 'sale' ) );

    const saleItemList = await Promise.all( saleSnapshot.docs.map( async ( doc ) => {
        // doc.data() is never undefined for query doc snapshots

        const saleItemCategory = doc.data().itemref[ '_key' ].path.segments[ 5 ];

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

            return new saleItemData( doc.id, saleItemSnap.data().name, imgURLSaleItem, saleItemSnap.data().baseprice, totalSaleItemQuantity, doc.data().discount )

        } else
            return new saleItemData( doc.id, saleItemSnap.data().name, imgURLSaleItem, saleItemSnap.data().baseprice, saleItemSnap.data().quantity, doc.data().discount )

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

        const productType = ( product == "newArrivals" || product == "bestSellers" ? doc.data().itemref[ '_key' ].path.segments[ 5 ] : product )

        if ( product == "newArrivals" || product == "bestSellers" ) {
            doc = await getDoc( doc.data().itemref );
        }

        const imgRefProduct = ref( imports.storage, productType + "/" + doc.id );
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

            return new productData( doc.id, doc.data().name, imgURLProduct, doc.data().baseprice, productType, totalQuantityAvailable )

        }
        else
            return new productData( doc.id, doc.data().name, imgURLProduct, doc.data().baseprice, productType, doc.data().quantity )

    } ) );

    console.log( ProductDataList );

    res.render( "products", { list: ProductDataList, product: product } );

} )


// specific non sale product for bedsheet
router.get( "/collections/bedsheets/product/:item", async function ( req, res ) {

    const bedsheetID = req.params.item;

    // reading all the data of products in db
    const bedsheetRef = doc( imports.db, 'bedsheets', bedsheetID );
    const bedsheetSnap = await getDoc( bedsheetRef );

    // reference to a bucket in cloud storage
    const imgRef = ref( imports.storage, 'bedsheets' + "/" + bedsheetID );
    const imgURL = await getDownloadURL( imgRef )
        .then( ( url ) => {


            // console.log( url );
            return url;
        } )
        .catch( ( er6 ) => {
            console.error( er6 )
        } );

    const subImgsRef = ref( imports.storage, `bedsheets/${bedsheetID}` );

    const subImgsUrlList = await listAll( subImgsRef )
        .then( async res => {

            return await Promise.all( res.items.map( async ( subImageRef ) => {

                return await getDownloadURL( subImageRef );
            } ) )

        } ).catch( ( er8 ) => {
            console.error( er8 )
        } )
    // console.log( subImgsUrlList )

    const bedsheetData = { ...bedsheetSnap.data(), url: imgURL, subImgsUrlList: subImgsUrlList };

    bedsheetData.single[ 0 ] = formateCurrency( bedsheetData.single[ 0 ] )
    bedsheetData.queen[ 0 ] = formateCurrency( bedsheetData.queen[ 0 ] )
    bedsheetData.king[ 0 ] = formateCurrency( bedsheetData.king[ 0 ] )

    console.log( bedsheetData );

    res.render( 'bedsheet', { itemData: bedsheetData } )

} );


router.get( "/collections/sale/product/:item", async function ( req, res ) {

    const saleItemID = req.params.item;


    // reference and data of the sale item 
    const saleItemDocRef = doc( imports.db, 'sale', saleItemID );
    const saleItemDocSnap = await getDoc( saleItemDocRef );

    // item category
    const saleItemCategory = saleItemDocSnap.data().itemref[ '_key' ].path.segments[ 5 ];

    // data of the item
    var saleItemSnap = await getDoc( saleItemDocSnap.data().itemref );


    // reference to a bucket in cloud storage
    const saleImgRef = ref( imports.storage, saleItemCategory + "/" + saleItemSnap.id );
    const saleImgURL = await getDownloadURL( saleImgRef );

    // reference to bucket in for sub images
    const subImgsRef = ref( imports.storage, `${saleItemCategory}/${saleItemSnap.id}` );

    const subImgsUrlList = await listAll( subImgsRef )
        .then( async res => {

            return await Promise.all( res.items.map( async ( subImageRef ) => {

                return await getDownloadURL( subImageRef );
            } ) )

        } ).catch( ( er9 ) => {
            console.error( er9 )
        } )
    // console.log( subImgsUrlList )


    if ( saleItemCategory == 'bedsheets' ) {

        const salebedsheetData = new saleBedsheetData( saleItemSnap.data().name, saleImgURL, saleItemSnap.data().single, saleItemSnap.data().queen, saleItemSnap.data().king, saleItemDocSnap.data().discount, subImgsUrlList, saleItemSnap.data().description, saleItemSnap.data().specification, saleItemSnap.data().instructions, saleItemSnap.data().disclaimer, saleItemSnap.data().endingline )
        console.log( salebedsheetData )
        res.render( 'sale-bedsheet', { itemData: salebedsheetData } )
    } else {

        const saleData = new saleItemData( saleItemSnap.id, saleItemSnap.data().name, saleImgURL, saleItemSnap.data().baseprice, saleItemSnap.data().quantity, saleItemDocSnap.data().discount, subImgsUrlList, saleItemSnap.data().description, saleItemSnap.data().specification, saleItemSnap.data().instructions, saleItemSnap.data().disclaimer, saleItemSnap.data().endingline )
        console.log( saleData )
        res.render( 'sale-item', { itemData: saleData } )

    }


} )


// specific none sale product for category { bedcover ,quilt ,dohar}
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

    const subImgsRef = ref( imports.storage, `${category}/${itemID}` );

    const subImgsUrlList = await listAll( subImgsRef )
        .then( async res => {

            return await Promise.all( res.items.map( async ( subImageRef ) => {

                return await getDownloadURL( subImageRef );
            } ) )

        } ).catch( ( er10 ) => {
            console.error( er10 )
        } )
    // console.log( subImgsUrlList )

    const itemData = { ...itemSnap.data(), url: imgURL, subImgsUrlList: subImgsUrlList };

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


// about us page
router.get( "/about-Us", async function ( req, res ) {

    res.render( 'aboutUs' );
} );


// contact us page
router.get( "/contact-Us", async function ( req, res ) {

    res.render( 'contactPage' );
} );

// terms of service
router.get( "/terms-of-service", async function ( req, res ) {

    res.render( 'termsOfService' );
} );

// privacy policy
router.get( "/privacy-policy", async function ( req, res ) {

    res.render( 'privacyPolicy' );
} );


export { router };