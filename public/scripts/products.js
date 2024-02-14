$( function () {
    $( ".js-btn-view" ).click( function () {
        $( ".js-btn-view" ).find( "ul" ).removeClass( "active" );
        $( this ).find( "ul" ).addClass( "active" );

        var colNumber = $( this ).data( "col" )
        if ( colNumber == 2 ) {
            $( ".js-col" ).attr( "class", "js-col col-sm-6 col-12" )
        }
        else if ( colNumber == 3 ) {
            $( ".js-col" ).attr( "class", "js-col col-sm-6 col-12 col-lg-4" )
        }
        else {
            $( ".js-col" ).attr( "class", "js-col col-sm-6 col-12 col-lg-3" )
        }
    } )
} ) 