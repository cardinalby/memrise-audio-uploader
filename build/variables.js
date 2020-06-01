const path = require('path');

const basePath = path.join(__dirname, '..');

module.exports = {
    path: {
        extensionDir: path.join(basePath, 'extension'),
        packedZip: path.join(basePath, 'build/extension.zip'),
        packedXpi: path.join(basePath, 'build/extension.xpi'),
        deployedCrx: path.join(basePath, 'build/extensionDeployed.crx'),
        buildDir: path.join(basePath, 'build'),
    },
    googleWebStore: {
        refreshToken: process.env.G_REFRESH_TOKEN,
        extensionId: process.env.G_EXTENSION_ID,
        clientSecret: process.env.G_CLIENT_SECRET,
        clientId: process.env.G_CLIENT_ID
    },
    firefoxAddons: {
        extensionId: process.env.FF_EXTENSION_ID,
        offlineExtId: process.env.FF_OFFLINE_EXT_ID,
        jwtIssuer: process.env.FF_JWT_ISSUER,
        jwtSecret: process.env.FF_JWT_SECRET,
    }
};