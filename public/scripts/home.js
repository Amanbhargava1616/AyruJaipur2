$( function () {
    $( '.your-class' ).slick( {
        dots: true,
        infinite: true,
        speed: 500,
        fade: true,
        cssEase: 'linear'
    } );

    $( '.autoplayClientLoveSlick' ).slick( {
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        dots: true,
        speed:3000
    } );

} )
