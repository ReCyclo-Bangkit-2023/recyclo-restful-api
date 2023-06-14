import Jwt from '@hapi/jwt';

export interface UserDataDocProps {
  userId: string;
  fullname: string;
  email: string;
  address: string;
  phoneNumber: string;
  city: string;
  password: string;
}

export type RegisterRequestBodyProps = Omit<UserDataDocProps, 'userId'>;

export type LoginRequestBodyProps = Pick<
  UserDataDocProps,
  'email' | 'password'
>;

export interface DecodedTokenPayloadProps {
  userId: string;
  iat: number;
  exp: number;
}

export type JwtTokenVerifyOpt = Parameters<typeof Jwt.token.verify>[2];

export interface RecycledItem {
  id: string;
  recycledType: 'recycledGoods' | 'waste';
  userId: string;
  title: string;
  price: number;
  sold: number;
  kind: string;
  amount: number;
  image1: string;
  image2: string;
  image3: string;
  desc: string;
  lat: string;
  long: string;
}

export type RecycledGoodsDocProps = RecycledItem;

export interface AddRecycledGoodsReqBodyProps
  extends Omit<
    RecycledGoodsDocProps,
    'id' | 'recycledType' | 'userId' | 'image1' | 'image2' | 'image3'
  > {
  image1: Buffer;
  image2: Buffer;
  image3: Buffer;
}

export type PutRecycledGoodsReqBodyProps = AddRecycledGoodsReqBodyProps;

export type WasteDocProps = RecycledItem;

export type AddWasteReqBodyProps = AddRecycledGoodsReqBodyProps;

export type PutWasteReqBodyProps = AddWasteReqBodyProps;

export interface TransactionDocProps {
  id: string;
  userId: string;
  recycledId: string;
  image: string;
  title: string;
  totalPrice: number;
  amount: number;
  statusTransaction: 'waiting' | 'sending' | 'done';
  orderedDate: string;
  orderedTimestamp: number;
}

export type AddTransactionReqBodyProps = Pick<
  TransactionDocProps,
  'recycledId' | 'amount'
>;

export interface ItemCartDocProps {
  id: string;
  userId: string;
  recycledId: string;
  image: string;
  title: string;
  stock: number;
  price: number;
  city: string;
  amount: number;
}
