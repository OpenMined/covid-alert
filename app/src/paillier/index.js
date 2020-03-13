import * as bcu from "./bigint-crypto-utils";
import BigInt from "big-integer";

const _ONE = BigInt(1);

export const generateRandomKeys = async function(
  bitLength = 3072,
  simpleVariant = false
) {
  let p, q, n, phi, n2, g, lambda, mu;
  // if p and q are bitLength/2 long ->  2**(bitLength - 2) <= n < 2**(bitLength)
  do {
    p = await bcu.prime(Math.floor(bitLength / 2) + 1);
    q = await bcu.prime(Math.floor(bitLength / 2));
    n = p * q;
  } while (q === p || bcu.bitLength(n) != bitLength);

  phi = (p - _ONE) * (q - _ONE);

  n2 = n ** BigInt(2);

  if (simpleVariant === true) {
    //If using p,q of equivalent length, a simpler variant of the key
    // generation steps would be to set
    // g=n+1, lambda=(p-1)(q-1), mu=lambda.invertm(n)
    g = n + _ONE;
    lambda = phi;
    mu = bcu.modInv(lambda, n);
  } else {
    g = getGenerator(n, n2);
    lambda = bcu.lcm(p - _ONE, q - _ONE);
    mu = bcu.modInv(L(bcu.modPow(g, lambda, n2), n), n);
  }

  const publicKey = new PublicKey(n, g);
  const privateKey = new PrivateKey(lambda, mu, publicKey, p, q);
  return { publicKey: publicKey, privateKey: privateKey };
};

export const PublicKey = class PublicKey {
  constructor(n, g) {
    this.n = BigInt(n);
    this._n2 = this.n ** BigInt(2); // cache n^2
    this.g = BigInt(g);
  }

  get bitLength() {
    return bcu.bitLength(this.n);
  }

  encrypt(m) {
    let r;
    r = bcu.randBetween(this.n);
    return (
      (bcu.modPow(this.g, m, this._n2) * bcu.modPow(r, this.n, this._n2)) %
      this._n2
    );
  }

  addition(...ciphertexts) {
    // ciphertexts of numbers
    return ciphertexts.reduce(
      (sum, next) => (sum * BigInt(next)) % this._n2,
      _ONE
    );
  }

  multiply(c, k) {
    // c is ciphertext. k is either a cleartext message (number) or a scalar
    if (typeof k === "string") k = BigInt(k);
    return bcu.modPow(BigInt(c), k, this._n2);
  }
};

export const PrivateKey = class PrivateKey {
  constructor(lambda, mu, publicKey, p = null, q = null) {
    this.lambda = BigInt(lambda);
    this.mu = BigInt(mu);
    this._p = p ? BigInt(p) : null;
    this._q = q ? BigInt(q) : null;
    this.publicKey = publicKey;
  }

  get bitLength() {
    return bcu.bitLength(this.publicKey.n);
  }

  get n() {
    return this.publicKey.n;
  }

  decrypt(c) {
    return (
      (L(
        bcu.modPow(BigInt(c), this.lambda, this.publicKey._n2),
        this.publicKey.n
      ) *
        this.mu) %
      this.publicKey.n
    );
  }
};

function L(a, n) {
  return BigInt(a - _ONE) / BigInt(n);
}

function getGenerator(n, n2 = bcu.modPow(n, 2)) {
  const alpha = bcu.randBetween(n);
  const beta = bcu.randBetween(n);
  return ((alpha * n + _ONE) * bcu.modPow(beta, n, n2)) % n2;
}
