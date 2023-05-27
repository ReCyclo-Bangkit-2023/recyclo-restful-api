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
