import {gql} from 'apollo-angular'

const GET_TODOS = gql`
  query {
    todos {
      id
      name
      description
    }
  }
`

const AUTH_STUDENT=gql`
mutation greetingWithAuth($token:String!){
  greetingWithAuth(token:$token){
    message
  }
}
`

const ADD_TODO = gql`
  mutation addTodo($name: String!, $description: String!) {
    addTodo(name: $name, description: $description) {
      id
      name
      description
    }
  }
`
const POST_LOGIN=gql`
mutation login($email:String!, $password:String!){
  login(email:$email,password:$password){
    firstName
  }
}`

const DELETE_TODO = gql`
  mutation deleteTodo($id: Int!) {
    deleteTodo(id: $id) {
      id
    }
  }
  `

export {GET_TODOS, ADD_TODO, DELETE_TODO,AUTH_STUDENT, POST_LOGIN}
