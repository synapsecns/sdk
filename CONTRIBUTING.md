# Contributing to synapsecns/sdk

We welcome issues and pull requests to this repo! If you have an idea which you think we should implement,
just open up a new issue and make sure to tag it as a feature request. 

If you're opening a PR, please note that PRs against the [`master`](https://github.com/synapsecns/sdk/tree/master) branch 
will likely be ignored; instead, make your changes in a branch based off of [`dev`](https://github.com/synapsecns/sdk/tree/dev). 
This stipulation is due to how fast changes occur in the `dev` branch, and our PR workflow for merging `dev` into `master` 
by way of squash commits; that is to say, opening a PR against `master` will likely cause several merge conflicts 
when trying to merge it into `dev`. So please, just save all of us the pain of working out merge conflicts
and make your changes against `dev`.

## PR formatting/etiquette

When opening a pull request, please use a short but descriptive title. You can be as verbose and descriptive as necessary
in the PR description, but try not to overthink it: if one sentence makes just as much sense as five, go with one.

Please also make sure that, when your changes are ready for review, to rebase your branch against `dev` to ensure that 
your fork is up to date with any changes made to `dev` in the meantime. 

## Tests

PRs from external contributors will not be considered for merging unless all of the following criteria are met: 

1. All existing tests pass
2. Test coverage of existing code is not decreased
3. New code -- especially significantly complex code -- has tests written for it, preferably a lot of them (both actual tests as well as test cases)
   1. Minimum required test coverage percentage for new code is 95%

If you need or want assistance from us in writing or improving tests, just let us know! We genuinely enjoy helping out contributors when we can. 

## Development environment setup

1. Install [nvm](https://github.com/nvm-sh/nvm) (if not already installed on your system)
2. Use the correct NodeJS version: `nvm use`
    - If yarn is not already installed for the given NPM version: `npm install -g yarn`
3. Install dependencies: `yarn`
4. Checkout a new branch, and start developing! (`git checkout -b [insert branch name here]`)

### Tests

`yarn test`

### Build

`yarn build`

Compiled and built files are output to `dist/`.
