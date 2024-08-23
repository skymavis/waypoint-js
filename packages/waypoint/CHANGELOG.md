# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - Unreleased

- Fix default value of `redirectUrl` on RoninWaypointWallet's constructor

### Changed

- `eth_requestAccounts` always open ID popup to get new address

## [1.0.0] - BREAKING CHANGE

### Added

- Update changelog for v0.0.1 & v0.0.2
- Update client_id of playground
- Add authorize & redirectAuthorize function
- Allow custom scope on authorize flow
- typedoc for each function & MavisIdProvider

### Changed

- Rename `MavisIdProvider` to `RoninWaypointWallet`
- Rename `gateOrigin` params to `idOrigin`
- Send transaction - switch to consume `send` endpoint from Ronin Waypoint
- Sign data v4 - no longer modify `chainId`

### Fixed

- Fix window event `unload` is deprecated => change to `beforeunload`

### Removed

- Remove jwt-decode & decode result => since address no longer return in token
- Remove decoded profile from return result
- Remove `MavisIdAuth` class
- Remove `MavisIdProvider` class

## [0.0.2] - 2024-05-30 - BREAKING CHANGE

### Added

- `MavisIdAuth` for authenticate-only flow
- README section for authenticate-only flow
- Update repository in package.json

### Changed

- Return all access token in connect function
- Validate ID address before return

## [0.0.1] - 2024-05-29

### Added

- mavis-id-sdk packages
- workflow to release package to npm

### Fixed

- refactor typing & error handling
- authorize redirect url should configurable

[unreleased]: https://github.com/skymavis/waypoint-js/compare/mavis-id-sdk@v1.0.0...HEAD
[1.0.0]: https://github.com/skymavis/waypoint-js/compare/mavis-id-sdk@v0.0.2...mavis-id-sdk@v1.0.0
[0.0.2]: https://github.com/skymavis/waypoint-js/compare/mavis-id-sdk@v0.0.1...mavis-id-sdk@v0.0.2
[0.0.1]: https://github.com/skymavis/waypoint-js/releases/tag/mavis-id-sdk@v0.0.1
