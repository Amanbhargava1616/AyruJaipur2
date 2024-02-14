import { formateCurrency } from "./currencyFormatter.js";

function calculateDiscount( value, discount ) {


    value = parseFloat( value );
    discount = parseFloat( discount );

    console.log( value * ( 1 - discount * 0.01 ) );

    return formateCurrency( value * ( 1 - discount * 0.01 ) )


}


export { calculateDiscount }