export function blockchains(contract) {
  return contract.events('Blockchain')
}

export async function sign(hash, chainId, provider, signer) {
   const header = provider.getBlockByHash(hash)
   const rlpHeader = ethers.utils.RLP.encode(
     Object.values(header).map((v) => (v === 0 ? "0x" : v))
   );
  const payload = ethers.utils.keccak256(rlpHeader);
  const { _vs: vs, r } = ethers.utils.splitSignature(
    await signer.signMessage(ethers.utils.arrayify(payload))
  );
  return [rlpHeader,[vs,r],chainId,payload,0,[]]
}
export async function signFuse(hash, chainId, provider, signer, cycleEnd, validators) {
   const header = provider.getBlockByHash(hash)
      const rlpHeader = ethers.utils.RLP.encode(
        Object.values(header).map((v) => (v === 0 ? "0x" : v))
      );
      const blockHash = ethers.utils.keccak256(rlpHeader);
      const packed = ethers.utils.solidityPack(
        ["bytes32", "address[]", "uint256"],
        [blockHash, validators, cycleEnd]
      );
      const payload = ethers.utils.keccak256(packed);
      const { _vs: vs, r } = ethers.utils.splitSignature(
        await signer.signMessage(ethers.utils.arrayify(payload))
      );
      return [rlpHeader,[vs,r],chainId,payload,cycleEnd,validators]
}
// specs: [[isFuse,from,to,chainId,provider,signer,cycleEnd,validators]]
export function publish(specs){
  const blocks = (await Promise.all(specs.map(s => {
    const [isFuse, from, to, ...rest] = s
    const hashes = await provider.getBlocks(from, to)
    return await Promise.all(hashes.map(h => (isFuse?signFuse:sign)(h, ...rest)))
  })).flat()
  await contract.addSignedBlocks(blocks)
}
