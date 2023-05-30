import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import config from '../../config/config.js';
import ValidationError from '../../exception/validation-error.js';
import getHourInSeconds from '../../lib/get-hour-in-seconds.js';
import type {
  RegisterRequestBodyProps,
  UserDataDocProps,
} from '../../types/types.js';

const db = new Firestore();

const register = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { fullname, email, address, phoneNumber, city, password } =
    request.payload as RegisterRequestBodyProps;

  const userId = `user:${nanoid(32)}`;
  const hashedPassword = await bcrypt.hash(password, 12);

  const usersRefs = db.collection('users');
  const userDocRef = db.collection('users').doc(userId);

  try {
    await db.runTransaction(async (tx) => {
      const users = await tx.get(usersRefs);

      users.forEach((doc) => {
        const userDoc = doc.data() as UserDataDocProps;
        if (userDoc.email === email) {
          throw new ValidationError('email telah digunakan');
        }
      });

      tx.set(userDocRef, {
        userId,
        fullname,
        email,
        address,
        phoneNumber,
        city,
        password: hashedPassword,
      });
    });

    const currentDateInSec = Date.now() / 1000;

    const jwtToken = Jwt.token.generate(
      {
        userId,
        iat: currentDateInSec,
        exp: currentDateInSec + getHourInSeconds(5),
      },
      {
        algorithm: 'HS512',
        key: config.JWT_KEY,
      }
    );

    return h
      .response({
        error: false,
        token: jwtToken,
        userId,
      })
      .code(201);
  } catch (error) {
    if (error instanceof ValidationError) {
      return h
        .response({
          error: true,
          message: error.message,
        })
        .code(409);
    }
  }
};

export default register;
