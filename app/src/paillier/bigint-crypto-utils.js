import crypto from "crypto";
import BigInt from "big-integer";

const _ZERO = BigInt(0);
const _ONE = BigInt(1);
const _TWO = BigInt(2);

export const abs = a => {
  a = BigInt(a);
  return a.geq(_ZERO) ? a : -a;
};

export const bitLength = a => {
  a = BigInt(a);
  if (a.eq(_ONE)) return 1;
  let bits = 1;
  do {
    bits++;
  } while ((a = BigInt(a).shiftRight(_ONE)) > _ONE);
  return bits;
};

export const eGcd = (a, b) => {
  a = BigInt(a);
  b = BigInt(b);
  if (a.leq(_ZERO) | b.leq(_ZERO)) return NaN; // a and b MUST be positive

  let x = _ZERO;
  let y = _ONE;
  let u = _ONE;
  let v = _ZERO;

  while (a.neq(_ZERO)) {
    let q = b.divide(a);
    let r = b.mod(a);
    let m = x - u.multiply(q);
    let n = y - v.multiply(q);
    b = a;
    a = r;
    x = u;
    y = v;
    u = m;
    v = n;
  }
  return {
    b: b,
    x: x,
    y: y
  };
};

export const gcd = (a, b) => {
  a = abs(a);
  b = abs(b);
  if (a === _ZERO) return b;
  else if (b === _ZERO) return a;

  let shift = _ZERO;
  while (!((a | b) & _ONE)) {
    a = BigInt(a).shiftRight(_ONE);
    b = BigInt(b).shiftRight(_ONE);
    shift++;
  }
  while (!(a & _ONE)) a = BigInt(a).shiftRight(_ONE);
  do {
    while (!(b & _ONE)) b = BigInt(b).shiftRight(_ONE);
    if (a > b) {
      let x = a;
      a = b;
      b = x;
    }
    b -= a;
  } while (b);
  // rescale
  return a.shiftLeft(shift);
};

export const isProbablyPrime = async (w, iterations = 16) => {
  if (typeof w === "number") {
    w = BigInt(w);
  }
  {
    // Node.js
    return new Promise(resolve => {
      resolve(_isProbablyPrime(w, iterations));
    });
  }
};

export const lcm = (a, b) => {
  a = BigInt(a);
  b = BigInt(b);
  if (a === _ZERO && b === _ZERO) return _ZERO;
  return abs(a * b) / gcd(a, b);
};

export const max = (a, b) => {
  a = BigInt(a);
  b = BigInt(b);
  return a.geq(b) ? a : b;
};

export const min = (a, b) => {
  a = BigInt(a);
  b = BigInt(b);
  return a.geq(b) ? b : a;
};

export const modInv = (a, n) => {
  if (a.eq(_ZERO) | n.leq(_ZERO)) return NaN;

  let egcd = eGcd(toZn(a, n), n);
  if (egcd.b.neq(_ONE)) {
    return NaN; // modular inverse does not exist
  } else {
    return toZn(egcd.x, n);
  }
};

export const modPow = (b, e, n) => {
  n = BigInt(n);

  if (n === _ZERO) return NaN;
  else if (n === _ONE) return _ZERO;

  b = toZn(b, n);

  e = BigInt(e);

  if (e.lt(_ZERO)) {
    return modInv(modPow(b, abs(e), n), n);
  }

  let r = _ONE;
  while (e.gt(0)) {
    if (
      BigInt(e)
        .mod(_TWO)
        .eq(_ONE)
    ) {
      r = BigInt(r)
        .multiply(b)
        .mod(n);
    }
    e = BigInt(e).divide(_TWO);
    b = BigInt(b)
      .pow(_TWO)
      .mod(n);
  }
  return r;
};

export const prime = (bitLength, iterations = 16) => {
  if (bitLength < 1)
    throw new RangeError(`bitLength MUST be > 0 and it is ${bitLength}`);

  if (!_useWorkers) {
    let rnd = _ZERO;
    do {
      rnd = fromBuffer(randBytesSync(bitLength / 8, true));
    } while (!_isProbablyPrime(rnd, iterations));
    return new Promise(resolve => {
      resolve(rnd);
    });
  }

  return new Promise(resolve => {
    let workerList = [];
    const _onmessage = (msg, newWorker) => {
      if (msg.isPrime) {
        // if a prime number has been found, stop all the workers, and return it
        for (let j = 0; j < workerList.length; j++) {
          workerList[j].terminate();
        }
        while (workerList.length) {
          workerList.pop();
        }
        resolve(msg.value);
      } else {
        // if a composite is found, make the worker test another random number
        let buf = randBits(bitLength, true);
        let rnd = fromBuffer(buf);
        try {
          newWorker.postMessage({
            rnd: rnd,
            iterations: iterations,
            id: msg.id
          });
        } catch (error) {
          // The worker has already terminated. There is nothing to handle here
        }
      }
    };
    for (let i = 0; i < workerList.length; i++) {
      let buf = randBits(bitLength, true);
      let rnd = fromBuffer(buf);
      workerList[i].postMessage({
        rnd: rnd,
        iterations: iterations,
        id: i
      });
    }
  });
};

export const primeSync = (bitLength, iterations = 16) => {
  if (bitLength < 1)
    throw new RangeError(`bitLength MUST be > 0 and it is ${bitLength}`);
  let rnd = _ZERO;
  do {
    rnd = fromBuffer(randBytesSync(bitLength / 8, true));
  } while (!_isProbablyPrime(rnd, iterations));
  return rnd;
};

export const randBetween = (max, min = _ONE) => {
  if (max.leq(min)) throw new Error("max must be > min");
  const interval = max - min;
  let bitLen = bitLength(interval);

  let rnd;
  do {
    let buf = randBits(bitLen);
    rnd = fromBuffer(buf);
  } while (rnd.gt(interval));
  return rnd + min;
};

export const randBits = (bitLength, forceLength = false) => {
  if (bitLength < 1)
    throw new RangeError(`bitLength MUST be > 0 and it is ${bitLength}`);

  const byteLength = Math.ceil(bitLength / 8);
  let rndBytes = randBytesSync(byteLength, false);
  // Fill with 0's the extra bits
  rndBytes[0] = rndBytes[0] & (2 ** (bitLength % 8) - 1);
  if (forceLength) {
    let mask = bitLength % 8 ? 2 ** ((bitLength % 8) - 1) : 128;
    rndBytes[0] = rndBytes[0] | mask;
  }
  return rndBytes;
};

export const randBytes = (byteLength, forceLength = false) => {
  if (byteLength < 1)
    throw new RangeError(`byteLength MUST be > 0 and it is ${byteLength}`);

  let buf;
  {
    // node
    const crypto = require("crypto");
    buf = Buffer.alloc(byteLength);
    return crypto.randomFill(buf, function(resolve) {
      // If fixed length is required we put the first bit to 1 -> to get the necessary bitLength
      if (forceLength) buf[0] = buf[0] | 128;
      resolve(buf);
    });
  }
};

export const randBytesSync = (byteLength, forceLength = false) => {
  if (byteLength < 1)
    throw new RangeError(`byteLength MUST be > 0 and it is ${byteLength}`);

  let buf;
  {
    // node
    buf = Buffer.alloc(byteLength);
    crypto.randomFillSync(buf);
  }
  // If fixed length is required we put the first bit to 1 -> to get the necessary bitLength
  if (forceLength) buf[0] = buf[0] | 128;

  return buf;
};

export const toZn = (a, n) => {
  n = BigInt(n);
  if (n.leq(0)) return NaN;

  a = BigInt(a).mod(n);
  return a.lt(0) ? a + n : a;
};

/* HELPER FUNCTIONS */

function fromBuffer(buf) {
  let ret = _ZERO;
  for (let i of buf.values()) {
    let bi = BigInt(i);
    ret = BigInt(ret).shiftLeft(BigInt(8)) + bi;
  }
  return ret;
}

function _isProbablyPrime(w, iterations = 16) {
  /*
	PREFILTERING. Even values but 2 are not primes, so don't test. 
	1 is not a prime and the M-R algorithm needs w>1.
  */
  if (BigInt(w).eq(_TWO)) return true;
  else if (
    BigInt(w)
      .and(_ONE)
      .eq(_ZERO) ||
    BigInt(w).eq(_ONE)
  )
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
    i < firstPrimes.length && BigInt(firstPrimes[i]).leq(w);
    i++
  ) {
    const p = BigInt(firstPrimes[i]);
    if (w.eq(p)) return true;
    else if (w.mod(p).eq(_ZERO)) return false;
  }

  /*
    1. Let a be the largest integer such that 2**a divides w−1.
    2. m = (w−1) / 2**a.
    3. wlen = len (w).
    4. For i = 1 to iterations do
        4.1 Obtain a string b of wlen bits from an RBG.
        Comment: Ensure that 1 < b < w−1.
        4.2 If ((b ≤ 1) or (b ≥ w−1)), then go to step 4.1.
        4.3 z = b**m mod w.
        4.4 If ((z = 1) or (z = w − 1)), then go to step 4.7.
        4.5 For j = 1 to a − 1 do.
        4.5.1 z = z**2 mod w.
        4.5.2 If (z = w−1), then go to step 4.7.
        4.5.3 If (z = 1), then go to step 4.6.
        4.6 Return COMPOSITE.
        4.7 Continue.
        Comment: Increment i for the do-loop in step 4.
    5. Return PROBABLY PRIME.
    */
  let a = BigInt(_ZERO),
    d = w - _ONE;
  while (d.mod(_TWO).eq(_ZERO)) {
    d = d.divide(_TWO);
    a = a.add(1);
  }

  let m = (w - _ONE).divide(_TWO.pow(a));

  loop: do {
    let b = randBetween(w - _ONE, _TWO);
    let z = modPow(b, m, w);
    if (z.eq(_ONE) || z.eq(w - _ONE)) continue;

    for (let j = BigInt(1); j.lt(a); j = j.add(1)) {
      z = modPow(z, _TWO, w);
      if (z.eq(w - _ONE)) continue loop;
      if (z.eq(_ONE)) break;
    }
    return false;
  } while (--iterations);

  return true;
}

let _useWorkers = false; // The following is just to check whether Node.js can use workers
