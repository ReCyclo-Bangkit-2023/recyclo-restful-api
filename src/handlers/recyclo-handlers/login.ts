import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import bcrypt from 'bcrypt';
import config from '../../config/config.js';
import AuthenticationError from '../../exception/authentication-error.js';
import getHourInSeconds from '../../lib/get-hour-in-seconds.js';
import type {
  LoginRequestBodyProps,
  UserDataDocProps,
} from '../../types/types.js';

const firestoreDB = new Firestore();

const login = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { email, password } = request.payload as LoginRequestBodyProps;

    const usersRef = firestoreDB.collection('users');
    const usersSnapshot = await usersRef.where('email', '==', email).get();

    if (usersSnapshot.empty) {
      throw new AuthenticationError('email atau password salah');
    }

    const usersData: UserDataDocProps[] = [];

    usersSnapshot.forEach((doc) => {
      const userDocData = doc.data() as UserDataDocProps;
      usersData.push(userDocData);
    });

    const userData = usersData[0];

    const passwordIsValid = await bcrypt.compare(password, userData.password);

    const currentDateInSec = Date.now() / 1000;

    const jwtToken = Jwt.token.generate(
      {
        userId: userData.userId,
        iat: currentDateInSec,
        exp: currentDateInSec + getHourInSeconds(5),
      },
      {
        algorithm: 'HS512',
        key: config.JWT_KEY,
      }
    );

    if (passwordIsValid) {
      return h
        .response({
          error: false,
          token: jwtToken,
          userId: userData.userId,
        })
        .code(200);
    } else {
      throw new AuthenticationError('email atau password salah');
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return h
        .response({
          error: true,
          message: error.message,
        })
        .code(401);
    }
  }
};

export default login;
