import image from '$lib/data/Images.json';

let test = image[0].ImageID

export function load() {
	return {
		summaries: image.map((image) => ({
			imageID: image.ImageID,
            imageURL: image.ImageURL
		}))
	};
}