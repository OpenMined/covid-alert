export default ({ homomorphic, createPaillier, createSeal, constants }) => {
  const defaults = {
    publicKeyName: 'public_key',
    secretKeyName: 'secret_key',
    relinKeyName: 'relin_key',
    galoisKeyName: 'galois_key'
  }

  const paillier = homomorphic.createProvider({
    ...defaults,
    prefix: 'paillier',
    constants: constants.PAILLIER
  })

  const seal = homomorphic.createProvider({
    ...defaults,
    prefix: 'seal',
    constants: constants.SEAL
  })

  return {
    paillier: createPaillier(paillier),
    seal: createSeal(seal)
  }
}
