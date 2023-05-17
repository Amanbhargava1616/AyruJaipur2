$( function () {
    const textToBeSent = `Hi, I would like to order ${$( ".waLink" ).data( "itemname" )}
    ${$( location ).attr( 'href' )}`
    const waLink = `https://api.whatsapp.com/send?phone=919785852222&text=${textToBeSent}`

    $( ".waLink" ).attr( "href", waLink )


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