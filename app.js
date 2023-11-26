const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET API2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
    id = ${todoId};
    `;

  const resultTodo = await db.get(getTodoQuery);
  response.send(resultTodo);
});
module.exports = app;

// POST API4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const getUpdateTodoQuery = `
    
    INSERT INTO 
    todo
    (id,todo,priority,status,category,due_date)
    VALUES
    (${id},'${todo}','${priority}','${status}','${category}',DATE(${dueDate}))

    `;
  await db.run(getUpdateTodoQuery);
  response.send("Todo Successfully Added");
});
module.exports = app;

// DELETE API6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletedTodoQuery = `
    
    DELETE 
    FROM 
    todo 
    WHERE
    id = ${todoId};
    `;
  await db.run(deletedTodoQuery);

  response.send("Todo Deleted");
});
module.exports = app;

// PUT

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updatedColumn = "";
  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;

    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;

    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;

    case requestBody.category !== undefined:
      updatedColumn = "Category";
      break;

    case requestBody.due_date !== undefined:
      updatedColumn = "Due Date";
      break;
  }

  const previousTodoQuery = `
    
    SELECT 
    *  
    FROM
    todo
    WHERE
    id = ${todoId};
    `;
  const previousTodo = await db.get(previousTodoQuery);
  const { status, priority, todo, category, dueDate } = request.body;

  const updateTodoQuery = `
    
    UPDATE 
    todo
    SET 
    status = '${status}',
    priority = '${priority}',
    todo = '${todo}',
    category = '${category}',
    due_date = ${dueDate}
    `;

  await db.run(updateTodoQuery);
  response.send(` ${updatedColumn} Updated`);
});
module.exports = app;
