import type { Auth } from 'convex/server';

const authConfig = {
    providers: [
        {
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
            applicationID: 'convex',
        },
    ],
};

export default authConfig;
