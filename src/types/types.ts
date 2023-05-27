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
