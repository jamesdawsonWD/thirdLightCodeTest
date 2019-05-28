import { Image } from '@lib/models';

export const checkObjectProps = p => o =>
    p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o);


export const getImageThumbNail = (image: Image): string =>
    checkObjectProps(['links', 'thumb'])(image) ? image.links.thumb : null;

export const getImagePreview = (image: Image): string =>
    checkObjectProps(['links', 'thumb'])(image) ? image.links.thumb : null;
