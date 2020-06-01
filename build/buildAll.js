const vars = require('./variables');

const IntegratedBuilder = require('webext-buildtools-integrated-builder').default;
const winston = require('winston');

async function build() {
    const logger = winston.createLogger({
        level: 'debug',
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.cli()
        ),
        prettyPrint: JSON.stringify,
        transports: [new winston.transports.Console()]
    });

    const options = {
        zipOptions: {
            zipOutPath: vars.path.packedZip
        },
        firefoxAddons: {
            api: {
                jwtIssuer: vars.firefoxAddons.jwtIssuer,
                jwtSecret: vars.firefoxAddons.jwtSecret,
            },
            deploy: {
                extensionId: vars.firefoxAddons.extensionId
            },
            signXpi: {
                extensionId: vars.firefoxAddons.offlineExtId,
                xpiOutPath: vars.path.packedXpi
            }
        },
        chromeWebstore: {
            extensionId: vars.googleWebStore.extensionId,
            apiAccess: {
                clientId: vars.googleWebStore.clientId,
                clientSecret: vars.googleWebStore.clientSecret,
                refreshToken: vars.googleWebStore.refreshToken
            },
            downloadCrx: {
                outCrxFilePath: vars.path.deployedCrx
            }
        }
    };

    const builder = new IntegratedBuilder(options, logger.log.bind(logger), false, true);

    builder.setInputDirPath(vars.path.extensionDir);

    builder.requireChromeWebstoreDeploy();
    builder.requireChromeWebstorePublishedCrx();
    builder.requireFirefoxAddonsDeploy();
    builder.requireFirefoxAddonsSignedXpi();
    builder.requireManifest();
    builder.requireZip();

    try {
        const result = await builder.build();

        if (result.errors.length > 0) {
            logger.error(`Build finished with ${result.errors.length} errors`);
            for (const errItem in result.errors) {
                logger.error(`${errItem.error} in ${errItem.targetName} builder`);
            }
            process.exit(1);
        } else {
            logger.info('Build successfully finished');
            console.log(result);
        }
    }
    catch (e) {
        logger.error('Build promise was rejected with error: ', e.toString());
        process.exit(1);
    }
}

build();