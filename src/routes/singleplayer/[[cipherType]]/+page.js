// +page.server.js
import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$db/shared-utils/CipherTypes';

export function load({ params }) {
    const cipherType = params['cipherType'] && cipherTypes[params['cipherType']] ? params['cipherType'] : 'Redirect';
    if (cipherType === 'Redirect') {
        throw redirect(303, '/singleplayer/Aristocrat');
    }

    return {
        props: {
            cipherType: params['cipherType']
        }
    };
}
