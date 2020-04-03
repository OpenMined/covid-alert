export default ({ homomorphic, createPaillier, createSeal }) => {
  const defaults = {
    publicKeyName: 'public_key',
    secretKeyName: 'secret_key',
    relinKeyName: 'relin_key',
    galoisKeyName: 'galois_key'
  }

  const paillier = homomorphic.createProvider({
    ...defaults,
    prefix: 'paillier'
  })

  const seal = homomorphic.createProvider({
    ...defaults,
    prefix: 'seal'
  })

  return {
    paillier: createPaillier(paillier),
    seal: createSeal(seal)
  }
}
