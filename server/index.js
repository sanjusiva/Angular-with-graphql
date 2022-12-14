const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressJwt = require('express-jwt'); //auth
const jwt = require('jsonwebtoken'); //auth
const { graphqlHTTP } = require('express-graphql');
const jwtSecret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');
const db = require('./db')
const app = express();
app.use(cors());
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(cors(), bodyParser.json(), expressJwt({
  secret: jwtSecret,
  algorithms: ['HS256'],
  credentialsRequired: false
}));

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLList,
} = require('graphql')


// const Todos = [
//   { id: 1, name: 'Cook Meals', description: 'Need to cook meals' },
//   { id: 2, name: 'Wash Clothes', description: 'Need to put the clothes in WM' },
// ]
const Greet = [
  { message: 'Hi ' }
]
const Students = [
  {
    id: 1,
    firstName: 'Jimin',
    lastName: 'Park',
    email: 'jimin.park@bts.org',
    password: 'pass123'
  },
  {
    id: 2,
    firstName: 'Jungkook',
    lastName: 'Joen',
    email: 'jungkook.mohamjoenmad@bts.org',
    password: 'pass123'
  }
]

const TodoType = new GraphQLObjectType({
  name: 'Todo',
  description: 'This is a todo',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: new GraphQLNonNull(GraphQLString) },
  })
})
const StudentType = new GraphQLObjectType({
  name: 'Student',
  description: 'This is a student',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  })
})
const GreetType = new GraphQLObjectType({
  name: 'Greet',
  description: 'Greetings',
  fields: () => ({
    message: { type: GraphQLString },
    token: { type: GraphQLString }
  })
})
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    todos: {
      type: new GraphQLList(TodoType),
      description: 'List of All Todos',
      resolve: () => db.todos.list()
    },
    todo: {
      type: TodoType,
      description: 'Single Todo',
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt)
        },
      },
      resolve: (root, args) => {
        return db.todos.list().find(todo => todo.id === args.id)
      }
    },
    students: {
      type: new GraphQLList(StudentType),
      description: 'List of students',
      resolve: () => {
        console.log("logggggg: ", Students);
        return Students
      }
    },
    greeting: {
      type: StudentType,
      description: 'Greet Student',
      args: {
        firstName: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, args) => {
        // {
        //   greeting(firstName:"Jimin"){
        //     email
        //   }
        // }
        return Students.find(greeting => greeting.firstName === args.firstName)
      }
    },
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addTodo: {
      type: TodoType,
      description: 'Add a new Todo',
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString)
        },
        description: {
          type: new GraphQLNonNull(GraphQLString)
        },
      },
      resolve: (root, args) => {
        console.log(db.todos.list().length);
        const newTodo = {
          id: db.todos.list().length + 1,
          name: args.name,
          description: args.description,
        }
        // Todos.push(newTodo)
        // return newTodo
        db.todos.create(newTodo)
        // return db.todos.list()
        return newTodo
      }
    },
    deleteTodo: {
      type: TodoType,
      description: 'Delete a Todo',
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt)
        },
      },
      resolve: (root, args) => {
        const todo = db.todos.list().find(todo => todo.id === args.id)
        if (todo) {
          db.todos.list().splice(db.todos.list().indexOf(todo), 1)
          return todo
        }
        return null
      }
    },
    greetingWithAuth: {
      type: GreetType,
      description: 'Signin Check',
      args: {
        token: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, args, context, info) => {
        console.log("hereeeee");
        console.log("context: ", context);
        if (!context.user) {
          console.log("user: ");
          throw new Error('Unauthorized');
        }
        console.log("else", Greet);
        return { message: `HELLO ${context.user.firstName}` };
      }
    },
    login: {
      type: StudentType,
      description: 'Post email and password',
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLString)
        },
        password: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, args) => {
        const { email, password } = args
        const user = Students.find((user) => {
          console.log("in: ", user.email);
          return user.email === email
        });
        console.log("bool: ", user);
        if (!(user && user.password === password)) {
          res.sendStatus(401);
          return;
        }
          const token = jwt.sign({ sub: user.id }, jwtSecret);

          console.log("graphql login post", args, token);
          return {firstName:token}
        }
        
      }
    })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})


app.use('/graphql', graphqlHTTP((req) => ({
  schema: schema,
  graphiql: true,
  context: { user: req.user && Students[req.user.sub - 1] }
})));

app.post('/login', (req, res) => {
  console.log("post");
  //   const email = req.body.email;
  //  const password = req.body.password;
  const { email, password } = req.body
  // const email = req.params.email;
  //  const password = req.params.password;

  const user = Students.find((user) => {
    console.log("in: ", user.email);
    return user.email === email
  });
  console.log("bool: ", user);
  if (!(user && user.password === password)) {
    res.sendStatus(401);
    return;
  }
  const token = jwt.sign({ sub: user.id }, jwtSecret);
  console.log("token: ", token);
  return res.send({ token });
});

app.listen(4000);

console.log('Running a GraphQL API server at localhost:4000/graphql');