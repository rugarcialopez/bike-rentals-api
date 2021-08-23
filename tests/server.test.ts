
import mongoose from 'mongoose';
import app from '../src/app';
import supertest from 'supertest';
import User, { Role } from '../src/models/user';
import { IUserDocument } from '../src/types/user';

type AuthUser = {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role?: string
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

describe('GET /api/users',  () => {

  test('should require authorization', async () => {
    await supertest(app).get('/api/users')
      .expect(401);
  })

  test('should require manager role', async () => {
    const token = await signUp({
      firstName: 'Manager',
      lastName: 'One',
      email: 'manager01@example.com',
      password: 'manager01'
    });
    const response = await supertest(app).get('/api/users')
      .set('token', token)
      .expect(401);
    
    expect(response.body.message).toBe('Unauthorized role');
  })

  test('should return a JSON with the users', async () => {
    const token = await signUp({
      firstName: 'Manager',
      lastName: 'One',
      email: 'manager01@example.com',
      password: 'manager01',
      role: 'manager',
    });

    const user = await User.create({ firstName: 'Learner', lastName: 'One', email:'user01@example.com', password: 'test', role: 'user' });

    await supertest(app).get('/api/users')
      .set('token', token)
      .expect(200)
      .then((response) => {
        // Check type and length
        expect(Array.isArray(response.body.users)).toBeTruthy();
        expect(response.body.users.length).toEqual(1);

        // Check data
        expect(response.body.users[0].id).toBe(user._id.toString());
        expect(response.body.users[0].firstName).toBe(user.firstName);
        expect(response.body.users[0].lastName).toBe(user.lastName);
        expect(response.body.users[0].role).toBe(user.role);
      });
  })
});

describe('POST /api/add-user',  () => {

  const newUser =  { firstName: 'Learner', lastName: 'One', email:'user01@example.com', password: 'test', role: 'user' };

  test('should require authorization', async () => {
    await supertest(app).post('/api/add-user')
      .send(newUser)
      .expect(401);
  })

  test('should require manager role', async () => {
    const token = await signUp({
      firstName: 'Manager',
      lastName: 'One',
      email: 'mnanager01@example.com',
      password: 'manager01',
      role: 'user'
    });
    const response = await supertest(app).post('/api/add-user')
      .set('token', token)
      .send(newUser)
      .expect(401);
    
    expect(response.body.message).toBe('Unauthorized role');
  })

  test('should create a new user', async () => {
    const token = await signUp({
      firstName: 'Manager',
      lastName: 'One',
      email: 'mnanager01@example.com',
      password: 'manager01',
      role: 'manager'
    }); 

    await supertest(app).post('/api/add-user')
    .set('token', token)
    .send(newUser)
    .expect(200)
    .then(async (response) => {
      // Check the response
      expect(response.body.users).toBeTruthy();
      expect(response.body.users.length).toEqual(1);

      // Check data in the database
      const user = await User.findOne({ email: 'user01@example.com' });
      expect(user?.firstName).toBe(newUser.firstName);
      expect(user?.role).toBe(newUser.role);
    });
  })
});

describe('PUT /api/update-user/:id',  () => {

  const updatedUser = { firstName: 'User updated' };

  test('should require authorization', async () => {
    await supertest(app).put('/api/update-user/1')
      .send(updatedUser)
      .expect(401);
  })

  test('should require manager role', async () => {
    const token = await signUp({
      firstName: 'Manager',
      lastName: 'One',
      email: 'mnanager01@example.com',
      password: 'manager01',
      role: 'user'
    });
    const response = await supertest(app).put('/api/update-user/1')
      .set('token', token)
      .send(updatedUser)
      .expect(401);
    
    expect(response.body.message).toBe('Unauthorized role');
  })

  test('should update an existing user', async () => {
    const user = await User.create({ firstName: 'User', lastName: 'One', email:'user01@example.com', password: 'test', role: 'user' });
    const token = await signUp({
      firstName: 'Manager',
      lastName: 'One',
      email: 'mnanager01@example.com',
      password: 'manager01',
      role: 'manager'
    }); 

    await supertest(app).put(`/api/update-user/${user._id.toString()}`)
    .set('token', token)
    .send(updatedUser)
    .expect(200)
    .then(async (response) => {
      // Check the response
      expect(response.body.users).toBeTruthy();
      expect(response.body.users.length).toEqual(1);

      // Check data in the database
      const user = await User.findOne({ email: 'user01@example.com' });
      expect(user?.firstName).toBe(updatedUser.firstName);
    });
  })
});

describe('DELETE /api/delete-user/:id',  () => {

  test('should require authorization', async () => {
    await supertest(app).delete('/api/delete-user/1')
      .expect(401);
  })

  test('should require manager role', async () => {
    const token = await signUp({
      firstName: 'Manager',
      lastName: 'One',
      email: 'mnanager01@example.com',
      password: 'manager01',
      role: 'user'
    });
    const response = await supertest(app).delete('/api/delete-user/1')
      .set('token', token)
      .expect(401);
    
    expect(response.body.message).toBe('Unauthorized role');
  })

  test('should remove an existing user', async () => {
    const user = await User.create({ firstName: 'User', lastName: 'One', email:'user01@example.com', password: 'test', role: 'user' });
    const token = await signUp({
      firstName: 'Manager',
      lastName: 'One',
      email: 'mnanager01@example.com',
      password: 'manager01',
      role: 'manager'
    }); 

    await supertest(app).delete(`/api/delete-user/${user._id.toString()}`)
    .set('token', token)
    .expect(200)
    .then(async (response) => {
      // Check the response
      expect(response.body.users).toBeTruthy();
      expect(response.body.users.length).toEqual(0);
    });
  })
});
