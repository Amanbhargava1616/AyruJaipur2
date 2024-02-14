const formatter = new Intl.NumberFormat( undefined)

function formateCurrency( value ) {
    return formatter.format( value );
}

export { formateCurrency };
