// The main function of the validator
export async function loop(delay) {
  const chains = await blockchains()
  await Promise.all(chains.map(([chainId, rpc]) => {
  }))
  setTimeout(() => loop(delay), delay)
}


