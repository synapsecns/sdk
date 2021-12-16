# synapseprotocol-sdk

Typescript SDK for the Synapse Protocol.

## Usage instructions

See the [Docs](https://github.com/synapsecns/sdk/wiki).

## Development instructions

### Notes

Please only file PRs against the `dev` branch. PRs against master, unless incredibly urgent (ie. they fix major production bugs), will be ignored
due to the frequency at which `dev` is updated and the insinuant merge conflicts which then occur. 

### Setup (for development)

1. Install [nvm](https://github.com/nvm-sh/nvm) (if not already installed on your system)
2. `nvm use`
   - If yarn is not already installed for the given NPM version: `npm install -g yarn` 
3. `yarn setup`

### Tests

`yarn test`

### Build

`yarn build`

Compiled and built files are output to `dist/`.  
