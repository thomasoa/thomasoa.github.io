// File constants
var zero = BigInt(0);
var one = BigInt(1);
function abs(value) {
    if (value < BigInt(0)) {
        return -value;
    }
    else {
        return value;
    }
}
export function safe_mod(n1, n2) {
    // Computes n1 % n2, but with values r in range
    // 0 <= r < abs(n2)
    // The % operator sometimes returns negative numbers
    n2 = abs(n2);
    var result = n1 % n2;
    if (result < zero) {
        return result + n2;
    }
    else {
        return result;
    }
}
export function long_gcd(m, n) {
    var quotients = Array();
    m = abs(m);
    if (m == zero) {
        throw Error('long_gcd cannot be called when m is zero');
    }
    n = safe_mod(n, m);
    while (n != zero) {
        var q = m / n;
        var r = m % n;
        quotients.push(q);
        m = n;
        n = r;
    }
    return { gcd: m, quotients: quotients };
}
function buildInverseFromQuotients(quotients) {
    // Standard algorithm for contiued fraction expansion
    // Numerators only needed.
    //
    // If m/n is a fraction, then the penultimate continued fraction for m/n, p/q,
    // satisfies np-mq= +/- 1, depending on the parity of the number of terms. So the
    // inverse with be +/- p. Here we compute the continued fraction numerators only.
    //
    var p_0 = zero, p_1 = one;
    quotients.forEach(function (quotient) {
        var p_new = p_1 * quotient + p_0;
        p_0 = p_1;
        p_1 = p_new;
    });
    if (quotients.length % 2 == 1) {
        return p_0;
    }
    else {
        return p_1 - p_0;
    }
}
export function modular_inverse(modulus, unit) {
    if (modulus < zero) {
        modulus = -modulus;
    }
    unit = safe_mod(unit, modulus);
    var result = long_gcd(modulus, unit);
    if (result.gcd != one) {
        throw Error('Modulus ' + modulus
            + ' and unit ' + unit
            + ' are not relatively prime, gcd=' + result.gcd);
    }
    return buildInverseFromQuotients(result.quotients);
}
