import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ADD_TODO, DELETE_TODO, GET_TODOS, AUTH_STUDENT,  POST_LOGIN } from '../graphql/graphql.queries';
import { GraphqlService } from '../services/graphql.service';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit {
  todos: any[] = [];
  error: any;
  data:any;
  todoForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required)
  });

  addTodo() {
   
    this.apollo.mutate({
      mutation: ADD_TODO,
      variables: {
        name: this.todoForm.value.name,
        description: this.todoForm.value.description,
      },
      refetchQueries: [{
        query: GET_TODOS
      }]
    }).subscribe(({data}: any) => {
      console.log("add: ",data);
      
      this.todos = data.addTodo;
      this.todoForm.reset();
    }
    , (error) => {
      this.error = error;
    }
    );

  }

  deleteTodo(id: string) {
    
    this.apollo.mutate({
      mutation: DELETE_TODO,
      variables: {
        id: id,
      },
      refetchQueries: [{
        query: GET_TODOS
      }]
    }).subscribe(({data}: any) => {
      console.log("delete: ",data);
      this.todos = data.deleteTodo;
    }
    , (error) => {
      this.error = error;
    }
    );
  }

  signUp(){
    console.log("sign Upppppp: ",this.graphqlService.getTokenVal); 
    
   this.apollo.mutate({
    mutation:AUTH_STUDENT,
    variables:{
      token:this.graphqlService.getTokenVal,
    }
   }).subscribe(({data}:any)=>{
    console.log("dataaaa: ",data);
    this.data=data
   },(error)=>{
    console.log("error: ",error);
    
   })
  }

  post(){

    this.apollo.mutate({
      mutation:POST_LOGIN,
      variables:{
        email:"jimin.park@bts.org",
        password:"pass123"
      }
    }).subscribe(({data}:any)=>{
      console.log("success: ",data.login.firstName);
      this.graphqlService.setTokenVal=data.login.firstName;
    })
    

    // this.graphqlService.postSign().subscribe((res:any)=>{
    //   console.log("res: ",res.token);
    //   this.graphqlService.setTokenVal=res.token;
    // })
  }

  constructor(private apollo: Apollo,private http:HttpClient,private graphqlService: GraphqlService) { }

  ngOnInit(): void {
    this.apollo.watchQuery({
      query: GET_TODOS
    }).valueChanges.subscribe(({ data, error }: any) => {
      console.log("data: ",data);
      
      this.todos = data.todos;
      this.error = error;
  }
  );
  }
}
