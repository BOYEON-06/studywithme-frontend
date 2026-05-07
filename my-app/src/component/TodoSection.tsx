import React from "react";
import type { Todo } from "../types/todo";

type TodoSectionProps = {
    todos: Todo[];
};

const TodoSection: React.FC<TodoSectionProps> = ({ todos }) => {
    return (
        <div className="content-card">
            <div className="card-title-row">
                <h3>TO DO</h3>
            </div>

            <div className="todo-list">
                {todos.map((todo) => (
                    <label className="todo-item" key={todo.id}>
                        <input type="checkbox" checked={todo.checked} readOnly />
                        <span className={todo.checked ? "checked" : ""}>
                            {todo.text}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default TodoSection;