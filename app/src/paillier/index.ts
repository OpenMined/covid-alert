import JSBI from "jsbi";
import * as bcu from "./bcu";

const _ONE = JSBI.BigInt(1);

/**
 * Generates a pair private, public key for the Paillier cryptosystem.
 */
export function generateRandomKeys(bitLength = 3072, simpleVariant = false) {
  let p: JSBI,
    q: JSBI,
    n: JSBI,
    phi: JSBI,
    n2: JSBI,
    g: number | JSBI,
    lambda: JSBI,
    mu: JSBI;
  // if p and q are bitLength/2 long ->  2**(bitLength - 2) <= n < 2**(bitLength)
  do {
    p = bcu.prime(Math.floor(bitLength / 2) + 1);
    q = bcu.prime(Math.floor(bitLength / 2));
    n = JSBI.multiply(p, q);
  } while (JSBI.equal(q, p) || bcu.bitLength(n) != bitLength);

  phi = JSBI.multiply(JSBI.subtract(p, _ONE), JSBI.subtract(q, _ONE));

  n2 = JSBI.exponentiate(n, JSBI.BigInt(2));

  if (simpleVariant === true) {
    //If using p,q of equivalent length, a simpler variant of the key
    // generation steps would be to set
    // g=n+1, lambda=(p-1)(q-1), mu=lambda.invertm(n)
    g = JSBI.add(n, _ONE);
    lambda = phi;
    mu = bcu.modInv(lambda, n);
  } else {
    g = getGenerator(n, n2);
    lambda = bcu.lcm(JSBI.subtract(p, _ONE), JSBI.subtract(q, _ONE));
    mu = bcu.modInv((bcu.modPow(g, lambda, n2), n), n);
  }

  const publicKey = new PublicKey(n, g);
  const privateKey = new PrivateKey(lambda, mu, publicKey, p, q);
  return { publicKey: publicKey, privateKey: privateKey };
}

/**
 * Class for a Paillier public key
 */
export class PublicKey {
  public _n2: JSBI;
  /**
   * Creates an instance of class PaillierPublicKey
   */
  constructor(public n: JSBI, public g: JSBI) {
    this._n2 = JSBI.exponentiate(n, JSBI.BigInt(2)); // cache n^2
  }

  /**
   * Get the bit length of the public modulo
   * @return {number} - bit length of the public modulo
   */
  get bitLength() {
    return bcu.bitLength(this.n);
  }

  /**
   * Paillier public-key encryption
   */
  encrypt(m: JSBI) {
    let r: JSBI;
    r = bcu.randBetween(this.n);
    return JSBI.remainder(
      JSBI.multiply(
        bcu.modPow(this.g, m, this._n2),
        bcu.modPow(r, this.n, this._n2)
      ),
      this._n2
    );
  }

  /**
   * Homomorphic addition
   */
  addition(...ciphertexts: JSBI[]) {
    // ciphertexts of numbers
    return ciphertexts.reduce(
      (sum, next) => JSBI.remainder(JSBI.multiply(sum, next), this._n2),
      _ONE
    );
  }

  /**
   * Pseudo-homomorphic Paillier multiplication
   */
  multiply(c: JSBI, k: JSBI) {
    // c is ciphertext. k is either a cleartext message (number) or a scalar
    return bcu.modPow(c, k, this._n2);
  }
}

/**
 * Class for Paillier private keys.
 */
export const PrivateKey = class PrivateKey {
  /**
   * Creates an instance of class PaillierPrivateKey
   */
  constructor(
    public lambda: JSBI,
    public mu: JSBI,
    public publicKey: PublicKey,
    public p: JSBI | null = null,
    public q: JSBI | null = null
  ) {}

  /**
   * Get the bit length of the public modulo
   */
  get bitLength() {
    return bcu.bitLength(this.publicKey.n);
  }

  /**
   * Get the public modulo n=p?q
   */
  get n() {
    return this.publicKey.n;
  }

  /**
   * Paillier private-key decryption
   */
  decrypt(c: JSBI) {
    return JSBI.remainder(
      JSBI.multiply(
        L(bcu.modPow(c, this.lambda, this.publicKey._n2), this.publicKey.n),
        this.mu
      ),
      this.publicKey.n
    );
  }
};

function L(a: JSBI, n: JSBI) {
  return JSBI.divide(JSBI.subtract(a, _ONE), n);
}

function getGenerator(n: JSBI, n2: JSBI) {
  const alpha = bcu.randBetween(n);
  const beta = bcu.randBetween(n);
  const left = JSBI.add(JSBI.multiply(alpha, n), _ONE);
  const mp = bcu.modPow(beta, n, n2);
  return JSBI.remainder(JSBI.multiply(left, mp), n2);
}
