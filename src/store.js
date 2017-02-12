/**
 * Simple Naive "Immutable" Todo Store.
 * @author Gilles Coomans
 */

import EventEmitter from 'event-emitter-es6';

const Todos = new EventEmitter(),
	proto = {
		todos: [],
		route: 'all',
		ID: 0,
		methods: {
			append(title) {
				this.todos = this.todos.concat({
					title: title || '',
					id: this.ID++,
					completed: false
				});
				this.emit('update', this);
			},
			prepend(title) {
				this.todos = [{
					title: title || '',
					id: this.ID++,
					completed: false
				}].concat(this.todos);
				this.emit('update', this);
			},
			delete(id) {
				this.todos = this.todos.filter((todo) => {
					return todo.id !== id;
				});
				this.emit('update', this);
			},
			toggleComplete(id) {
				this.todos = this.todos.map((todo) => {
					if (todo.id === id) {
						todo = Object.assign({}, todo);
						todo.completed = !todo.completed;
					}
					return todo;
				});
				this.emit('update', this);
			},
			updateTitle(id, title) {
				this.todos = this.todos.map((todo) => {
					if (todo.id === id && todo.title !== title) {
						todo = Object.assign({}, todo);
						todo.title = title;
					}
					return todo;
				});
				this.emit('update', this);
			},
			clearCompleted() {
				this.todos = this.todos.filter((todo) => {
					return !todo.completed;
				});
				this.emit('update', this);
			},
			toggleAll() {
				this.todos = this.todos.map((todo) => {
					todo = Object.assign({}, todo);
					todo.completed = !todo.completed;
					return todo;
				});
				this.emit('update', this);
			}
		}
	};

// copy proto
for (const i in proto)
	Todos[i] = proto[i];

// bind all methods to root
for (const i in Todos.methods)
	Todos.methods[i] = Todos.methods[i].bind(Todos);

export default Todos;

//