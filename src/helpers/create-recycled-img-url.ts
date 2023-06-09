interface CreateRecycledImgUrlProps {
  recycledType: 'recycled-goods' | 'recycled-waste';
  userId: string;
  recycledId: string;
}

const createRecycledImgUrl =
  ({ recycledType, userId, recycledId }: CreateRecycledImgUrlProps) =>
  (numberImage: number) => {
    `https://storage.googleapis.com/recyclo-387407-bucket/${recycledType}/${userId}/${recycledId}/image${numberImage}.jpeg`;
  };

export default createRecycledImgUrl;
