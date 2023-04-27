function long_gcd(m, n) {
    var quotients = Array();
    var zero = BigInt(0);
    while (n != zero) {
        var q = m / n;
        var r = m % n;
        if (r == zero) {
            return { gcd: n, quotients: quotients };
        }
        quotients.push(q);
        m = n;
        n = r;
    }
}
export function modular_inverse(modulus, unit) {
    var zero = BigInt(0), one = BigInt(1);
    unit = unit % modulus;
    if (unit == zero) {
        throw Error('Unit ' + unit.toString() + ' is divible by the modulus ' + modulus.toString());
    }
    var result = long_gcd(modulus, unit);
    if (result.gcd != one) {
        throw Error('Modulus ' + modulus.toString()
            + ' and unit ' + unit.toString()
            + ' are not relatively prime');
    }
    var p_0 = zero, p_1 = one, q_0 = one, q_1 = zero;
    result.quotients.forEach(function (quotient) {
        var p_new = p_1 * quotient + p_0;
        var q_new = q_1 * quotient + q_0;
        p_0 = p_1;
        p_1 = p_new;
        q_0 = q_1;
        q_1 = q_new;
    });
    if (result.quotients.length % 2 == 0) {
        return p_1;
    }
    else {
        return modulus - p_1;
    }
}