import getImages from '$lib/data/Images.json';
import getImageTag from '$lib/data/ImageTag.json';
import getTag from '$lib/data/Tag.json';
import getTagType from '$lib/data/TagType.json';

export function load() {
    /**
     * Object to hold all of the data imported from the mock JSON database
     */
    const formattedData = {
        images: getImages.map((imageData) => ({
            imageID: imageData.ImageID,
            imageURL: imageData.ImageURL,
        })),
        imageTags: getImageTag.map((imageTagData) => ({
            imageID: imageTagData.ImageID,
            tagID: imageTagData.TagID,
        })),
        tags: getTag.map((tagData) => ({
            tagID: tagData.TagID,
            tagName: tagData.TagName,
            tagTypeID: tagData.TagTypeID,
        })),
        tagTypes: getTagType.map((tagTypeData) => ({
            tagTypeID: tagTypeData.TagTypeID,
            typeName: tagTypeData.TypeName,
            typeColor: tagTypeData.TypeColor,
        })),
    };

    return formattedData;
}
