$( function () {
    const textToBeSent = `Hi, I would like to order ${$( ".waLink" ).data( "itemname" )}
    ${$( location ).attr( 'href' )}`
    const waLink = `https://api.whatsapp.com/send?phone=919785852222&text=${textToBeSent}`

    $( ".waLink" ).attr( "href", waLink )


    $( ".subImageDiv" ).click( function () {
        $( ".itemImage" ).attr( "src", $( this ).children( "img" ).attr( "src" ) )
    } )
} )