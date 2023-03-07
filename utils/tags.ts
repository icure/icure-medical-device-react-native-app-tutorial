export const tagsByIds =
  <TagType extends string>(tagType: TagType, listMarker?: string) =>
  (result: {id?: string}[] | undefined) => {
    const listMarkerTag = listMarker ? [{type: tagType, id: listMarker}] : [];
    return result ? result.map(({id}: {id?: string}) => ({type: tagType, id})).concat(listMarkerTag) : [];
  };

export const tagsByIdsPaginated =
  <TagType extends string>(tagType: TagType, listMarker?: string) =>
  (result: {rows?: {id?: string}[]}) =>
    tagsByIds(tagType, listMarker)(result?.rows ?? []);
