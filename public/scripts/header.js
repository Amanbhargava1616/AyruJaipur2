$( function () {
    const registerBtn = $( "#registerBtn" );
    const backdrop = $( "#backdrop" );
    const registerModal = $( "#registerModal" );


    function open_register_modal( event ) {

        // showing the backdrop and form
        registerModal.css( "display", "block" );
        backdrop.css( "display", "block" )
    }

    function close_register_modal( event ) {

        // closing the backdrop and form
        registerModal.css( "display", "none" );
        backdrop.css( "display", "none" )
    }


    registerBtn.click( function name( params ) {
        open_register_modal();
    } )

    backdrop.click( close_register_modal );

} )
