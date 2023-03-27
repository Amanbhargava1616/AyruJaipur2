const formatter = new Intl.NumberFormat( undefined, {
    currency: "INR",
    style: "currency"
} )

function formateCurrency( value ) {
    return formatter.format( value );
}

export { formateCurrency };
