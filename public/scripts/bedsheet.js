$( function () {
    $( ".priceBtn" ).click( function () {
        const style = $( this ).data( 'style' );
        console.log( style )
        $( ".active" ).removeClass( "active" );
        $( this ).addClass( "active" );
        $( "#itemPrice" ).html( $( this ).data( 'price' ) )
        $( "#itemquantity" ).html( $( this ).data( 'quantity' ) + ' available' )
    } )

    $( ".subImageDiv" ).click( function () {
        $( ".itemImage" ).attr( "src", $( this ).children( "img" ).attr( "src" ) )
    } )
} )