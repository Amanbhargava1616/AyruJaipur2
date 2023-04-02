$( function () {
    $( ".priceBtn" ).click( function () {
        const style = $( this ).data( 'style' );
        console.log( 'sale' + style )
        $( ".active" ).removeClass( "active" );
        $( this ).addClass( "active" );
        $( "#itemPrice" ).children( 'del' ).html( $( this ).data( 'originalprice' ) )
        $( "#itemPrice" ).children( 'span' ).html( $( this ).data( 'discountprice' ) )
        $( "#itemquantity" ).html( $( this ).data( 'quantity' ) + ' available' )
    } )
} )