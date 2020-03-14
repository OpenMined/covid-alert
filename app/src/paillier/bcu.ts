import "react-native-get-random-values";

import JSBI from "jsbi";

const _ZERO = JSBI.BigInt(0);
const _ONE = JSBI.BigInt(1);
const _TWO = JSBI.BigInt(2);

/**
 * Absolute value. abs(a)==a if a>=0. abs(a)==-a if a<0
 */
export function abs(a: JSBI): JSBI {
  return JSBI.GE(a, _ZERO) ? a : JSBI.unaryMinus(a);
}

/**
 * Returns the bitlength of a number
 */
export function bitLength(a: JSBI): number {
  if (JSBI.EQ(a, _ONE)) return 1;
  let bits = 1;
  do {
    bits++;
  } while (JSBI.GT((a = JSBI.signedRightShift(a, _ONE)), _ONE));
  return bits;
}

interface EGcdReturn {
  g: JSBI;
  x: JSBI;
  y: JSBI;
}

/**
 * An iterative implementation of the extended euclidean algorithm or extended greatest common divisor algorithm.
 * Take positive integers a, b as input, and return a triple (g, x, y), such that ax + by = g = gcd(a, b).
 */
export function eGcd(a: JSBI, b: JSBI): EGcdReturn {
  if (JSBI.LE(a, _ZERO) || JSBI.LE(b, _ZERO)) {
    throw new Error("a, b must be positive");
  }

  let x = _ZERO;
  let y = _ONE;
  let u = _ONE;
  let v = _ZERO;

  while (a !== _ZERO) {
    let q = JSBI.divide(b, a);
    let r = JSBI.remainder(b, a);
    let m = JSBI.subtract(x, JSBI.multiply(u, q));
    let n = JSBI.subtract(y, JSBI.multiply(v, q));
    b = a;
    a = r;
    x = u;
    y = v;
    u = m;
    v = n;
  }
  return {
    g: b,
    x: x,
    y: y
  };
}

/**
 * Greatest-common divisor of two integers based on the iterative binary algorithm.
 */
export function gcd(a: JSBI, b: JSBI): JSBI {
  a = abs(a);
  b = abs(b);
  if (JSBI.EQ(a, _ZERO)) return b;
  else if (JSBI.EQ(b, _ZERO)) return a;

  let shift = _ZERO;
  while (JSBI.equal(JSBI.bitwiseAnd(JSBI.bitwiseOr(a, b), _ONE), _ZERO)) {
    a = JSBI.signedRightShift(a, _ONE);
    b = JSBI.signedRightShift(b, _ONE);
    shift = JSBI.add(shift, _ONE);
  }
  while (JSBI.equal(JSBI.bitwiseAnd(a, _ONE), _ZERO)) {
    a = JSBI.signedRightShift(a, _ONE);
  }
  do {
    while (JSBI.equal(JSBI.bitwiseAnd(b, _ONE), _ZERO)) {
      b = JSBI.signedRightShift(b, _ONE);
    }
    if (JSBI.GT(a, b)) {
      let x = a;
      a = b;
      b = x;
    }
    b = JSBI.subtract(b, a);
  } while (JSBI.notEqual(b, _ZERO));

  // rescale
  return JSBI.leftShift(a, shift);
}

/**
 * The least common multiple computed as abs(a*b)/gcd(a,b)
 */
export function lcm(a: JSBI, b: JSBI): JSBI {
  if (JSBI.equal(a, _ZERO) && JSBI.equal(b, _ZERO)) return _ZERO;
  return JSBI.divide(abs(JSBI.multiply(a, b)), gcd(a, b));
}

/**
 * Maximum. max(a,b)==a if a>=b. max(a,b)==b if a<=b
 */
export function max(a: JSBI, b: JSBI): JSBI {
  return JSBI.GE(a, b) ? a : b;
}

/**
 * Minimum. min(a,b)==b if a>=b. min(a,b)==a if a<=b
 */
export function min(a: JSBI, b: JSBI): JSBI {
  return JSBI.GE(a, b) ? b : a;
}

/**
 * Modular inverse.
 */
export function modInv(a: JSBI, n: JSBI): JSBI {
  if (JSBI.equal(a, _ZERO) || JSBI.LE(n, _ZERO)) {
    throw new Error("modInv does not exist");
  }

  let egcd = eGcd(toZn(a, n), n);
  if (JSBI.NE(egcd.g, _ONE)) {
    throw new Error("modInv does not exist");
  } else {
    return toZn(egcd.x, n);
  }
}

/**
 * Modular exponentiation b**e mod n. Currently using the right-to-left binary method
 */
export function modPow(b: JSBI, e: JSBI, n: JSBI): JSBI {
  if (JSBI.EQ(n, _ZERO)) {
    throw new Error("no modPow");
  } else if (JSBI.EQ(n, _ONE)) return _ZERO;

  b = toZn(b, n);

  if (JSBI.LT(e, _ZERO)) {
    return modInv(modPow(b, abs(e), n), n);
  }

  let r = _ONE;
  while (JSBI.GT(e, _ZERO)) {
    if (JSBI.EQ(JSBI.remainder(e, _TWO), _ONE)) {
      r = JSBI.remainder(JSBI.multiply(r, b), n);
    }
    e = JSBI.divide(e, _TWO);
    b = JSBI.remainder(JSBI.exponentiate(b, _TWO), n);
  }
  return r;
}

/**
 * A probably-prime (Miller-Rabin), cryptographically-secure, random-number generator.
 * The browser version uses web workers to parallelise prime look up. Therefore, it does not lock the UI
 * main process, and it can be much faster (if several cores or cpu are available).
 * The node version can also use worker_threads if they are available (enabled by default with Node 11 and
 * and can be enabled at runtime executing node --experimental-worker with node >=10.5.0).
 */
export function prime(bitLength: number, iterations = 16): JSBI {
  if (bitLength < 1)
    throw new RangeError(`bitLength MUST be > 0 and it is ${bitLength}`);

  let rnd = _ZERO;
  do {
    rnd = fromBuffer(randBytes(bitLength / 8, true));
  } while (!isProbablyPrime(rnd, iterations));
  return rnd;
}

/**
 * Returns a cryptographically secure random integer between [min,max]
 */
export function randBetween(max: JSBI, min: JSBI = _ONE): JSBI {
  if (max <= min) throw new Error("max must be > min");
  const interval = JSBI.subtract(max, min);
  let bitLen = bitLength(interval);
  let rnd: JSBI;
  do {
    let buf = randBits(bitLen);
    rnd = fromBuffer(buf);
  } while (JSBI.GT(rnd, interval));
  return JSBI.add(rnd, min);
}

/**
 * Secure random bits for both node and browsers. Node version uses crypto.randomFill() and browser one self.crypto.getRandomValues()
 */
export function randBits(bitLength: number, forceLength = false): Uint8Array {
  if (bitLength < 1)
    throw new RangeError(`bitLength MUST be > 0 and it is ${bitLength}`);

  const byteLength = Math.ceil(bitLength / 8);
  let rndBytes = randBytes(byteLength, false);
  // Fill with 0's the extra bits
  rndBytes[0] = rndBytes[0] & (2 ** (bitLength % 8) - 1);
  if (forceLength) {
    let mask = bitLength % 8 ? 2 ** ((bitLength % 8) - 1) : 128;
    rndBytes[0] = rndBytes[0] | mask;
  }
  return rndBytes;
}

/**
 * Secure random bytes for both node and browsers. Node version uses crypto.randomFill() and browser one self.crypto.getRandomValues()
 */
export function randBytes(byteLength: number, forceLength = false) {
  if (byteLength < 1)
    throw new RangeError(`byteLength MUST be > 0 and it is ${byteLength}`);

  const buf = new Uint8Array(byteLength);
  crypto.getRandomValues(buf);
  // If fixed length is required we put the first bit to 1 -> to get the necessary bitLength
  if (forceLength) buf[0] = buf[0] | 128;
  return buf;
}

/**
 * Finds the smallest positive element that is congruent to a in modulo n
 */
export function toZn(a: JSBI, n: JSBI): JSBI {
  if (JSBI.LE(n, _ZERO)) {
    throw new Error("invalid toZn");
  }

  a = JSBI.remainder(a, n);
  return JSBI.LT(a, _ZERO) ? JSBI.add(a, n) : a;
}

/* HELPER FUNCTIONS */

function fromBuffer(buf: Uint8Array): JSBI {
  let ret = _ZERO;
  buf.forEach(i => {
    const bi = JSBI.BigInt(i);
    ret = JSBI.add(JSBI.leftShift(ret, JSBI.BigInt(8)), bi);
  });
  return ret;
}

/**
 * The test first tries if any of the first 250 small primes are a factor of the input number and then passes several
 * iterations of Miller-Rabin Probabilistic Primality Test (FIPS 186-4 C.3.1)
 */
export function isProbablyPrime(w: JSBI, iterations = 16): boolean {
  /*
	PREFILTERING. Even values but 2 are not primes, so don't test. 
	1 is not a prime and the M-R algorithm needs w>1.
	*/
  if (JSBI.equal(w, _TWO)) return true;
  else if (JSBI.equal(JSBI.bitwiseAnd(w, _ONE), _ZERO) || JSBI.equal(w, _ONE))
    return false;

  /*
    Test if any of the first 250 small primes are a factor of w. 2 is not tested because it was already tested above.
    */
  const firstPrimes = [
    3,
    5,
    7,
    11,
    13,
    17,
    19,
    23,
    29,
    31,
    37,
    41,
    43,
    47,
    53,
    59,
    61,
    67,
    71,
    73,
    79,
    83,
    89,
    97,
    101,
    103,
    107,
    109,
    113,
    127,
    131,
    137,
    139,
    149,
    151,
    157,
    163,
    167,
    173,
    179,
    181,
    191,
    193,
    197,
    199,
    211,
    223,
    227,
    229,
    233,
    239,
    241,
    251,
    257,
    263,
    269,
    271,
    277,
    281,
    283,
    293,
    307,
    311,
    313,
    317,
    331,
    337,
    347,
    349,
    353,
    359,
    367,
    373,
    379,
    383,
    389,
    397,
    401,
    409,
    419,
    421,
    431,
    433,
    439,
    443,
    449,
    457,
    461,
    463,
    467,
    479,
    487,
    491,
    499,
    503,
    509,
    521,
    523,
    541,
    547,
    557,
    563,
    569,
    571,
    577,
    587,
    593,
    599,
    601,
    607,
    613,
    617,
    619,
    631,
    641,
    643,
    647,
    653,
    659,
    661,
    673,
    677,
    683,
    691,
    701,
    709,
    719,
    727,
    733,
    739,
    743,
    751,
    757,
    761,
    769,
    773,
    787,
    797,
    809,
    811,
    821,
    823,
    827,
    829,
    839,
    853,
    857,
    859,
    863,
    877,
    881,
    883,
    887,
    907,
    911,
    919,
    929,
    937,
    941,
    947,
    953,
    967,
    971,
    977,
    983,
    991,
    997,
    1009,
    1013,
    1019,
    1021,
    1031,
    1033,
    1039,
    1049,
    1051,
    1061,
    1063,
    1069,
    1087,
    1091,
    1093,
    1097,
    1103,
    1109,
    1117,
    1123,
    1129,
    1151,
    1153,
    1163,
    1171,
    1181,
    1187,
    1193,
    1201,
    1213,
    1217,
    1223,
    1229,
    1231,
    1237,
    1249,
    1259,
    1277,
    1279,
    1283,
    1289,
    1291,
    1297,
    1301,
    1303,
    1307,
    1319,
    1321,
    1327,
    1361,
    1367,
    1373,
    1381,
    1399,
    1409,
    1423,
    1427,
    1429,
    1433,
    1439,
    1447,
    1451,
    1453,
    1459,
    1471,
    1481,
    1483,
    1487,
    1489,
    1493,
    1499,
    1511,
    1523,
    1531,
    1543,
    1549,
    1553,
    1559,
    1567,
    1571,
    1579,
    1583,
    1597
  ];
  for (
    let i = 0;
    i < firstPrimes.length && JSBI.LE(JSBI.BigInt(firstPrimes[i]), w);
    i++
  ) {
    const p = JSBI.BigInt(firstPrimes[i]);
    if (JSBI.equal(w, p)) return true;
    else if (JSBI.equal(JSBI.remainder(w, p), _ZERO)) return false;
  }

  /*
    1. Let a be the largest integer such that 2**a divides w-1.
    2. m = (w-1) / 2**a.
    3. wlen = len (w).
    4. For i = 1 to iterations do
        4.1 Obtain a string b of wlen bits from an RBG.
        Comment: Ensure that 1 < b < w-1.
        4.2 If ((b = 1) or (b = w-1)), then go to step 4.1.
        4.3 z = b**m mod w.
        4.4 If ((z = 1) or (z = w - 1)), then go to step 4.7.
        4.5 For j = 1 to a - 1 do.
        4.5.1 z = z**2 mod w.
        4.5.2 If (z = w-1), then go to step 4.7.
        4.5.3 If (z = 1), then go to step 4.6.
        4.6 Return COMPOSITE.
        4.7 Continue.
        Comment: Increment i for the do-loop in step 4.
    5. Return PROBABLY PRIME.
    */
  let a = _ZERO,
    d = JSBI.subtract(w, _ONE);
  while (JSBI.EQ(JSBI.remainder(d, _TWO), _ZERO)) {
    d = JSBI.divide(d, _TWO);
    a = JSBI.add(a, _ONE);
  }

  let m = JSBI.divide(JSBI.subtract(w, _ONE), JSBI.exponentiate(_TWO, a));

  loop: do {
    let b = randBetween(JSBI.subtract(w, _ONE), _TWO);
    let z = modPow(b, m, w);
    if (JSBI.EQ(z, _ONE) || JSBI.EQ(z, JSBI.subtract(w, _ONE))) continue;

    for (let j = 1; JSBI.LT(j, a); j++) {
      z = modPow(z, _TWO, w);
      if (JSBI.equal(z, JSBI.subtract(w, _ONE))) continue loop;
      if (JSBI.EQ(z, _ONE)) break;
    }
    return false;
  } while (--iterations);

  return true;
}
