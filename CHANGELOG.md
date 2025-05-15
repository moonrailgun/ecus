# Changelog

## [0.11.0](https://github.com/moonrailgun/iexpo/compare/v0.10.1...v0.11.0) (2025-05-15)

### Features

* **deployment:** enhance statistics query with deduplication and grouping logic ([072dfe6](https://github.com/moonrailgun/iexpo/commit/072dfe662a3a04e80381b119fbd97a905817cc29))

## [0.10.1](https://github.com/moonrailgun/iexpo/compare/v0.10.0...v0.10.1) (2025-05-14)

### Others

* **upload:** update parameter handling in chunked upload routes ([f83fa21](https://github.com/moonrailgun/iexpo/commit/f83fa210b361c2b39643ee045081721ae98fb178))

## [0.10.0](https://github.com/moonrailgun/iexpo/compare/v0.9.0...v0.10.0) (2025-05-13)

### Features

* add upload duration logging to update command ([3df1a18](https://github.com/moonrailgun/iexpo/commit/3df1a181aaf4b47038914210565a33c5685742cb))
* **cli:** prevent duplicate entry of .ecus/ in .gitignore ([311cf35](https://github.com/moonrailgun/iexpo/commit/311cf3561b3906123ee266bad3cb469449646879))
* **upload:** implement chunked file upload and handle zip files ([d2a7b39](https://github.com/moonrailgun/iexpo/commit/d2a7b39dd8026de05f53f8549e272f4a31679802))

### Others

* update cli version ([6b79587](https://github.com/moonrailgun/iexpo/commit/6b7958771511363b8edb944440f4b16a6ac60972))
* update version to 1.2.3 and modify export command for iOS and Android platforms ([52937b7](https://github.com/moonrailgun/iexpo/commit/52937b7e8c8695e4691b1c55f67202046906102f))

## [0.9.0](https://github.com/moonrailgun/iexpo/compare/v0.8.1...v0.9.0) (2025-04-15)

### Features

* add access log cleanup cron job ([cd00c37](https://github.com/moonrailgun/iexpo/commit/cd00c37d5ad421e938b0241cf46ee0fd66032e3e))
* add metadata option to update command ([f96443f](https://github.com/moonrailgun/iexpo/commit/f96443fe654488f5d5b1382c60643e3821a92acf))

### Bug Fixes

* include deploymentId in cache clearing logic ([0726847](https://github.com/moonrailgun/iexpo/commit/072684782cf64646b78aab42c699f7d7d253dd4a))

### Document

* add README ([4f02aed](https://github.com/moonrailgun/iexpo/commit/4f02aed0fe7beb8218170fc92b2c29ef0fb02f3d))

### Others

* add index on updateId in activeDeploymentHistory table ([8c5f009](https://github.com/moonrailgun/iexpo/commit/8c5f00962bb4fd2124004d8684ca0c09787007ad))
* change import statement to use type for Session ([1579150](https://github.com/moonrailgun/iexpo/commit/1579150f9bc33259320bc34bd070968027ec399c))
* update dependencies and add key to avoid conflict ([294cd53](https://github.com/moonrailgun/iexpo/commit/294cd5317578bb7accd5dbba523d452ee0e20a36))

## [0.8.1](https://github.com/moonrailgun/iexpo/compare/v0.8.0...v0.8.1) (2025-04-01)

### Bug Fixes

* fix type cast issue ([ecaa164](https://github.com/moonrailgun/iexpo/commit/ecaa1645085a1c90ff5debdfe1775006f2bc758f))

## [0.8.0](https://github.com/moonrailgun/iexpo/compare/v0.7.1...v0.8.0) (2025-03-27)

### Features

* add deployment.updateMetadata endpoint ([b5e795b](https://github.com/moonrailgun/iexpo/commit/b5e795bc9266419bc0e1c1527c184e308fc6f0b0))
* add indexes to access_log table for improved query performance ([d507ea2](https://github.com/moonrailgun/iexpo/commit/d507ea2067180af8262dd1392c97936393389a08))
* add update metadata modify and display ([0193a7e](https://github.com/moonrailgun/iexpo/commit/0193a7ee149d5cba29c2cf0a8ba2e2d5167a2b72))

### Bug Fixes

* fix render issue for usage chart ([651ac7a](https://github.com/moonrailgun/iexpo/commit/651ac7ad593a566a68d2ae673accf48835bd9be8))

### Others

* change typo ([884ccb1](https://github.com/moonrailgun/iexpo/commit/884ccb1f86710918e2cffcdd1a1f399903629607))
* remove unnecessary log ([3c5714e](https://github.com/moonrailgun/iexpo/commit/3c5714e3fa449e6241c746e3a91f8d49218ac9ed))
* update active history logic ([1bd3e99](https://github.com/moonrailgun/iexpo/commit/1bd3e99ffb62f3070b95aa9f1e9b367f1c666609))
* update README ([aef4acc](https://github.com/moonrailgun/iexpo/commit/aef4acc41deb585d64090725db4b1b2812e2147e))

## [0.7.1](https://github.com/moonrailgun/iexpo/compare/v0.7.0...v0.7.1) (2025-03-23)

### Others

* return 200 for no runtime version response ([f23e4a1](https://github.com/moonrailgun/iexpo/commit/f23e4a1b86caa1440be25b04481b9b86e16e72e6))

## [0.7.0](https://github.com/moonrailgun/iexpo/compare/v0.6.2...v0.7.0) (2025-03-22)

### Features

* enhance usage statistics with runtime filtering and additional color options ([d19355a](https://github.com/moonrailgun/iexpo/commit/d19355a75f983a107d220d9ec65f5f63b9e852b7))

## [0.6.2](https://github.com/moonrailgun/iexpo/compare/v0.6.1...v0.6.2) (2025-03-19)

### Features

* add config command which can update ([f1bd819](https://github.com/moonrailgun/iexpo/commit/f1bd819a1688ceac1fc656b2ae3b9862fad46227))

### Others

* add file caches ([8127a08](https://github.com/moonrailgun/iexpo/commit/8127a08fb57453ad4cc88965ec7296ed6303a339))
* update label ([d0ac116](https://github.com/moonrailgun/iexpo/commit/d0ac1164442ecd2241468ce48a4e02bd07e35834))
* update stop progress logic ([3bf13a8](https://github.com/moonrailgun/iexpo/commit/3bf13a87db9c376d066f64fc6d6b18670815a37f))
* use || rather than ?? to face empty string case ([be32f81](https://github.com/moonrailgun/iexpo/commit/be32f81674ca5744cb478805fb250e51416ab8c3))

## [0.6.1](https://github.com/moonrailgun/iexpo/compare/v0.6.0...v0.6.1) (2025-03-12)

### Others

* improve upload display, add progress ([c4076f3](https://github.com/moonrailgun/iexpo/commit/c4076f3b0984ca4e65fd568f27826e5842bcb203))
* update ttl for deployment cache ([1a9f9db](https://github.com/moonrailgun/iexpo/commit/1a9f9dbe7815a3aca324e5bff653f704854e3367))

## [0.6.0](https://github.com/moonrailgun/iexpo/compare/v0.5.0...v0.6.0) (2025-03-10)

### Features

* display updateId and remove git width display ([72d2ed5](https://github.com/moonrailgun/iexpo/commit/72d2ed51c8f19391d3e50c54f5da28a648a4731b))

### Bug Fixes

* fix a bug which make alway return assets ([a086ba3](https://github.com/moonrailgun/iexpo/commit/a086ba37af3ce965a39ec2808813d95afae50671))

## [0.5.0](https://github.com/moonrailgun/iexpo/compare/v0.4.0...v0.5.0) (2025-03-07)

### Features

* add promote support when upload ([639c454](https://github.com/moonrailgun/iexpo/commit/639c454eca6655125bc4eeb11cd445a828e253d7))

## [0.4.0](https://github.com/moonrailgun/iexpo/compare/v0.3.0...v0.4.0) (2025-03-06)

### Features

* add cache to speed up get manifest detail ([f5424dd](https://github.com/moonrailgun/iexpo/commit/f5424dd01d977f688ba883246f00c67bb9856405))

### Others

* remove active deployment returning in activeDeployment query ([1b4c9fb](https://github.com/moonrailgun/iexpo/commit/1b4c9fb4fce5c3f89c86d5746989d435b4f00651))

## [0.3.0](https://github.com/moonrailgun/iexpo/compare/v0.2.4...v0.3.0) (2025-03-05)

### Features

* add default channel handle with no channel request ([0178936](https://github.com/moonrailgun/iexpo/commit/01789362aee8d05706c300e3c874184be3325719))
* add git info column ([4a4f94f](https://github.com/moonrailgun/iexpo/commit/4a4f94f0edb57f8716035dbb8400a6e27ad763ff))
* add gitinfo detail display in deployment list drawer ([0992823](https://github.com/moonrailgun/iexpo/commit/09928238f034c714a3df75c6c848b108f3e1e810))
* add statsAccess endpoint ([df55197](https://github.com/moonrailgun/iexpo/commit/df551975fa6e5709c3061372a1a1001ca10b9c90))
* add usage chart ([fc75fa7](https://github.com/moonrailgun/iexpo/commit/fc75fa73532beb9f57e8dd35b11b75261173f507))

### Others

* add dashboard ([7ad3490](https://github.com/moonrailgun/iexpo/commit/7ad349087bce579622b37264f7bf09957fd1c398))
* add init docker compose file ([0dfa0b1](https://github.com/moonrailgun/iexpo/commit/0dfa0b1b3420831f3c8bd863860974efeefcb34f))
* update dashboard ([f6a5838](https://github.com/moonrailgun/iexpo/commit/f6a5838f1b60488cd45ea85e0dfee5695dca532f))

## [0.2.4](https://github.com/moonrailgun/iexpo/compare/v0.2.3...v0.2.4) (2025-02-28)

### Others

* update dockerfile ([d44b563](https://github.com/moonrailgun/iexpo/commit/d44b56320b086d3334c358beb7b573e0bce20200))
* update dockerfile ([0c75fbb](https://github.com/moonrailgun/iexpo/commit/0c75fbb1ed195061e893ec646e9db3a8018963ba))

## [0.2.3](https://github.com/moonrailgun/iexpo/compare/v0.2.2...v0.2.3) (2025-02-28)

### Bug Fixes

* fix a bug which word maybe not correct match ([8d493b0](https://github.com/moonrailgun/iexpo/commit/8d493b0853eef75083f49d8e722705f80a464d02))

### Others

* update docker start command ([ecbb91f](https://github.com/moonrailgun/iexpo/commit/ecbb91f6347a4c2a9a02cc3b6ba9e8ecd86160e7))

## [0.2.2](https://github.com/moonrailgun/iexpo/compare/v0.2.1...v0.2.2) (2025-02-28)

### Features

* add trust host config ([29a39c1](https://github.com/moonrailgun/iexpo/commit/29a39c1543352ff8d27f54158d0e5b20318d7bab))

### Others

* add readme ([c8ce8d7](https://github.com/moonrailgun/iexpo/commit/c8ce8d7e3acb7a81283c993588eb437b43998a7c))

## [0.2.1](https://github.com/moonrailgun/iexpo/compare/v0.2.0...v0.2.1) (2025-02-27)

### Others

* update docker file ([2f012f6](https://github.com/moonrailgun/iexpo/commit/2f012f6b9e0a1c90e694ba717bce0d002927e977))

## 0.2.0 (2025-02-27)

### Features

* add api key page ([d22bce5](https://github.com/moonrailgun/iexpo/commit/d22bce5ea88c7f79afd38b8ec69f1181c92db03b))
* add apikey support ([5305601](https://github.com/moonrailgun/iexpo/commit/53056011aacf9c110c622f16c40ea800ce9759c6))
* add assets endpoint ([7412bb7](https://github.com/moonrailgun/iexpo/commit/7412bb7b8e8cdad087813936898911372e080b79))
* add audit logs and access logs and history ([d2a8d3b](https://github.com/moonrailgun/iexpo/commit/d2a8d3bbcec0a924cdd9d7ab066e134ef15a6e7c))
* add channel list ([ad5a21d](https://github.com/moonrailgun/iexpo/commit/ad5a21d3d50a69d03286ae6ec374ff228e24a177))
* add channel name fetch support ([b088596](https://github.com/moonrailgun/iexpo/commit/b088596a095821d2f0a61810bea083aa3c962fc9))
* add cli update command ([967aae3](https://github.com/moonrailgun/iexpo/commit/967aae3f587318e2482376c78db524cb88b76f58))
* add detail and config fetch drawer ([c159587](https://github.com/moonrailgun/iexpo/commit/c159587f51aa74834882a8bb699e980e719bc1f3))
* add dynamic rollback logic ([9f6ed89](https://github.com/moonrailgun/iexpo/commit/9f6ed8916a380ee1fe53258f8e5262a72afcd449))
* add git info for cli ([0caaa6f](https://github.com/moonrailgun/iexpo/commit/0caaa6f1c203faa01555bb5fe340efdf890822fe))
* add github organization limit support ([fd7e845](https://github.com/moonrailgun/iexpo/commit/fd7e84518b8e3cc8c681155f2e27c8fba8f24c07))
* add init and upload command in cli ([be0c466](https://github.com/moonrailgun/iexpo/commit/be0c466080dff4dcc2def8a4472a07b18a1310b7))
* add manifest and assets endpoint ([3db7b1f](https://github.com/moonrailgun/iexpo/commit/3db7b1f8f052af5ee09cc0f859814f63f845510b))
* add project manager and switch, and add deployment status in promote ([3de8d5e](https://github.com/moonrailgun/iexpo/commit/3de8d5e1481fa5458bc25f64a46be615e27d2707))
* add redis cache support ([53e1a60](https://github.com/moonrailgun/iexpo/commit/53e1a60cfc535902fc76f99482648216809f4878))
* add release it and add docker support ([70f3427](https://github.com/moonrailgun/iexpo/commit/70f3427dc8b0b4f79f284a49212877615ebf2e01))
* add rollback to embed support ([77e7f07](https://github.com/moonrailgun/iexpo/commit/77e7f07aea89702731d664fbc45a84b7a0921663))
* add tushan as admin UI ([b579627](https://github.com/moonrailgun/iexpo/commit/b579627b97ac3febd12f4af27f34bc03c2d05130))
* add upload feature ([b7790be](https://github.com/moonrailgun/iexpo/commit/b7790be3ddaa87cf32a33b599676246009d1cb57))
* add upload handle logic and deployment list ([48932de](https://github.com/moonrailgun/iexpo/commit/48932de044e1e90b957dc5f133838e8f5a51f24a))
* add upload zip file support ([8c9fb23](https://github.com/moonrailgun/iexpo/commit/8c9fb238c56081e682aa1ac6ead8187e5ee37d43))
* generate db migration files ([7860aa8](https://github.com/moonrailgun/iexpo/commit/7860aa8ce8bca36ddc08b7a1dd4cd0a417997629))
* manifest normal upgrade logic ([4e7e78d](https://github.com/moonrailgun/iexpo/commit/4e7e78dc93afafe8d35cdc1e84d28a1dc0ea080d))
* promote modal, active list ([0ea9070](https://github.com/moonrailgun/iexpo/commit/0ea90702b8b536eadd3769d5158a8d692ddd9c3e))
* support update ([9ab68bc](https://github.com/moonrailgun/iexpo/commit/9ab68bcec9d42126a530daa27676979ac799833d))

### Bug Fixes

* fix all build issues ([748ad77](https://github.com/moonrailgun/iexpo/commit/748ad77e2bbae8025a81066a8e7c78ff116aaf82))

### Others

* add example project init ([1b5765c](https://github.com/moonrailgun/iexpo/commit/1b5765c3f87513d33c892a1ebd3ec30359e2e162))
* add release it package ([32f640e](https://github.com/moonrailgun/iexpo/commit/32f640ee2b156c33f645ea3bd26655cc2420b752))
* add sign in logs ([af89c22](https://github.com/moonrailgun/iexpo/commit/af89c22bbd9ca91a7bb809595f5f4f5d99bce3ca))
* change default channel name to align eas ([e3993d4](https://github.com/moonrailgun/iexpo/commit/e3993d4d815fcc0983a4f1f4b0b45560ba97a112))
* custom navbar view ([5a635b5](https://github.com/moonrailgun/iexpo/commit/5a635b5b30a43e24bbc8d49861eae7be477e68a5))
* fix ci problem and migrate upload into transaction ([46c9808](https://github.com/moonrailgun/iexpo/commit/46c98087df54ad4e2320514f7d53387726233302))
* improve code ([6004020](https://github.com/moonrailgun/iexpo/commit/6004020e316408763e750e46f44a2d0463dd13ac))
* improve log create logic ([9a7bfb0](https://github.com/moonrailgun/iexpo/commit/9a7bfb0bb4b4b63873860710d41fe2cfa2168714))
* init ([f96feb1](https://github.com/moonrailgun/iexpo/commit/f96feb10ecc2e3035486e03a6ee6da23b22d38ce))
* move admin global modal under admin folder ([9962d1c](https://github.com/moonrailgun/iexpo/commit/9962d1c11e20adbe04fd3d57ad492cd67ec5c530))
* move app to single folder ([f030eb7](https://github.com/moonrailgun/iexpo/commit/f030eb73781c168c2f1887ff51c22572c673eb12))
* orgs limit ignore case ([172f2ea](https://github.com/moonrailgun/iexpo/commit/172f2eadd83e98e2cee4a830345611f233b31c5c))
* release ecus cli ([fec19d9](https://github.com/moonrailgun/iexpo/commit/fec19d9dbe148bbd67fcb53bf8ef884f9dd745fc))
* remove unused field ([cf284c1](https://github.com/moonrailgun/iexpo/commit/cf284c1eb7e1be77f97e8483592751577de16f33))
* remove unused post model ([e76d031](https://github.com/moonrailgun/iexpo/commit/e76d0318d771e1ecf1163f6eb8f5061d635e30f8))
* rename branch to channel ([e24b236](https://github.com/moonrailgun/iexpo/commit/e24b236725c54845092036b88cbbba6294fb8fef))
* rename iexpo => ecus ([99c7837](https://github.com/moonrailgun/iexpo/commit/99c7837e74d2460b80c53e486c056b50242a2f66))
* replace deployment id with uuid, because expo update's format ([12cba1f](https://github.com/moonrailgun/iexpo/commit/12cba1f1c65fedb6056e6292a70f1a98cfa3d6a0))
* speed up manifest endpoint with cache and prettier code ([58b344a](https://github.com/moonrailgun/iexpo/commit/58b344a652967396118523506c3257c1fc06fcc7))
* update application brand ([3a7a7d5](https://github.com/moonrailgun/iexpo/commit/3a7a7d58abced89fc01c42035d2050462a8d473a))
* update favicon ([6336001](https://github.com/moonrailgun/iexpo/commit/6336001ad062d97c2e6040e145d77e4292473271))
* use head command rather than object attr command to adaptar R2 ([61a0ac0](https://github.com/moonrailgun/iexpo/commit/61a0ac07cecae0b74df0fca4ba1941cb94b0e618))
