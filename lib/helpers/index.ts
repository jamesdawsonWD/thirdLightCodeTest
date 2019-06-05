import { Image } from '@lib/models';

import { ImageTL } from '@lib/helpers/imageTL';
import { Vector} from '@lib/helpers/vector';

export const checkObjectProps = p => o =>
p.reduce((xs, x) =>
(xs && xs[x]) ? xs[x] : null, o);


export const getImageThumbNail = (image: Image): string =>
checkObjectProps(['links', 'thumb'])(image) ? image.links.thumb : null;

export const getImagePreview = (image: Image): string =>
checkObjectProps(['links', 'thumb'])(image) ? image.links.thumb : null;

export const getMousePosition = (canvas: HTMLCanvasElement, event: MouseEvent): Vector => {
    const rect = canvas.getBoundingClientRect();
    return new Vector(event.clientX - rect.left, event.clientY - rect.top);
}

export const randomColorFromArray = (colors) => colors[Math.floor(Math.random() * colors.length)]

export {ImageTL, Vector};