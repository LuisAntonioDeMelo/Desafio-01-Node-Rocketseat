const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4} = require('uuid');
const util = require("util");

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;
    
    const user = users.find((user) =>  user.username === username);
    if(!user) {
      return response.status(400).json({error: "User not found"});
    }
    request.user = user;
    return next();
}


app.post('/users', (request, response) => {
  const { name , username } = request.body;
  const id = uuidv4();
  
  const userAlredyExists = users.some((user) => user.username === username);
  if(userAlredyExists) {
    return response.status(400).json({ error : "Customer alredy exists! "});
  }
  const user = {
    id,
    name,
    username,
    todos : []
  };
  users.push(user);
  return response.status(201).json(user).send();
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } =  request.body;
    const { user } = request;
    
    const todoOp = {
      id: uuidv4(),
      title,
      done : false,
      deadline: new Date(deadline),
      created_at: new Date(),
    }
    user.todos.push(todoOp);
    response.status(201).json(todoOp).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const {title, deadline} =  request.body;
  const { user } = request;
  
  const todo = user.todos.find((todo) => todo.id === id);
  if(!todo){
    return response.status(404).json({ error : "Todo not found! "});
  }
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find((todo) => todo.id === id);
  if(!todo){
    return response.status(404).json({ error : "Todo not found! "});
  }
  todo.done = true;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const {id} = request.params;
    const {user} = request;

    const todoIndex = user.todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return response.status(404).json({error: "Todo not found! "});
    }
    user.todos.splice(todoIndex, 1);
    console.log(user.todos);
    return response.status(204).json(user.todos);
  } catch (e) {
    console.log(e);
    return response.status(500).json({error: e});
  }

});

module.exports = app;