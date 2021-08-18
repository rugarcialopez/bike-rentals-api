
import mongoose from 'mongoose';
import app from '../src/app';
import supertest from 'supertest';
import User, { Role } from '../src/models/user';
import { IUserDocument } from '../src/types/user';

type AuthUser = {
  firstName: string,
  lastName: string,
  email: string,
  password: string
}

beforeEach((done) => {
  mongoose.connect('mongodb://localhost:27017/bike-rentals-test',
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
  });
});

const signUp = async (user: AuthUser) => {
  const response = await supertest(app).post('/api/signUp')
    .send(user)
    .expect(201)
  return response.body.token;
}

describe('GET /api/signUp',  () => {

  test('should validate "firstName", "lastName", "email" and "password" fields', async () => {
    const response = await supertest(app).post('/api/signUp')
      .send({
        firstName: '',
        lastName: 'One',
        email: 'learner01@example.com',
        password: '1234'
      })
      .expect(400)
    expect(response.body.message).toBe('firstName, lastName, email and password are required' );
  })

  test('should return a JSON with the logged user', async () => {
    const response = await supertest(app).post('/api/signUp')
      .send({
        firstName: 'Learner',
        lastName: 'One',
        email: 'learner01@example.com',
        password: '1234'
      })
      .expect(201)
    expect(response.body.token).toBeTruthy();
    expect(response.body.role).toBe(Role.User);
    expect(response.body.expirationTime).toBeTruthy();
    expect(response.body.userId).toBeTruthy();
  })
  
});

describe('GET /api/signIn',  () => {

  test('should validate "email" and "password" fields', async () => {
    const response = await supertest(app).post('/api/signIn')
      .send({
        email: 'learner01@example.com',
        password: ''
      })
      .expect(400)
    expect(response.body.message).toBe('email and password are required' );
  })

  test('should return a JSON with the logged user', async () => {
    await signUp({
      firstName: 'Learner',
      lastName: 'One',
      email: 'learner01@example.com',
      password: 'learner01'
    });
    const response = await supertest(app).post('/api/signIn')
      .send({
        email: 'learner01@example.com',
        password: 'learner01'
      })
      .expect(201)
    expect(response.body.token).toBeTruthy();
    expect(response.body.role).toBe(Role.User);
    expect(response.body.expirationTime).toBeTruthy();
    expect(response.body.userId).toBeTruthy();
  })
  
});