const mainnet = require('./tokens/mainnet.json');
const { request, gql } = require('graphql-request')

async function fetchBridgedTokens(foreignAddresses) {
  const query = gql`{
    bridgedTokens (where:{foreignAddress_in: ${JSON.stringify(foreignAddresses)}}) {
      address
      name
      decimals
      symbol
      foreignAddress
    }
  }`
  const response = await request('https://graph.fuse.io/subgraphs/name/fuseio/fuse-ethereum-bridge', query)
  return response.bridgedTokens
}

async function buildList() {
  const foreignAddresses = mainnet.map(token => token.address);
  const fuseTokens = await fetchBridgedTokens(foreignAddresses);
  const bridgedFuseTokens = mainnet.map(mainnetToken => {
    const fuseToken = fuseTokens.find(token => token.foreignAddress == mainnetToken.address.toLowerCase());
    if (fuseToken) {
      delete fuseToken.foreignAddress
      return {...mainnetToken, ...fuseToken, chainId: 122 };
    }
  }).filter(t => t != null);
  return bridgedFuseTokens;
}


module.exports = buildList