/**
 * Todomvc html lexicon (aka web components)
 * @author Gilles Coomans
 */

import babelute from 'babelute';
import htmlLexicon from 'babelute-html/src/html-lexicon';

const todomvcLexicon = babelute.createLexicon('todomvc', htmlLexicon);

// lexicons need to be registred for One-Level-Development (i.e. for diffing)
babelute.registerLexicon(htmlLexicon);
babelute.registerLexicon(todomvcLexicon);

todomvcLexicon.addCompounds((h) => {
	return {
		// main entry point
		todomvc(todos, route, methods) {

			const visibleTodos = route !== 'all' ? todos.filter((todo) => {
				return (route === 'completed') ? todo.completed : !todo.completed;
			}) : todos;

			return this.div(
				h.class('todomvc-wrapper')
				.section(
					h.id('todoapp').class('todoapp')
					.todomvcHeader(methods)
					.section(
						h.id('main').class('main').visible(todos.length)
						.toggleAllButton(methods)
						.ul(
							h.id('todo-list').class('todo-list')
							.each(visibleTodos, (todo) => {
								return h.todoItem(todo, methods);
							})
						)
					)
					.statsSection(todos, route, methods)
				)
				.todomvcFooter()
			);
		},
		todomvcHeader(methods) {
			return this.header(
				h.id('header').class('header')
				.h1('Todos')
				.textInput('',
					h.id('new-todo').class('new-todo')
					.attr('placeholder', 'What needs to be done?')
					.on('keydown', (e) => {
						if (e.keyCode === 13 && e.target.value) {
							methods.append(e.target.value);
							e.target.value = '';
						}
					})
				)
			);
		},
		toggleAllButton(methods) {
			return this.checkbox(false,
				h.id('toggle-all').class('toggle-all')
				.attr('name', 'toggle')
				.on('click', methods.toggleAll)
			)
			.label(h.attr('for', 'toggle-all'), 'Mark all as complete');
		},
		todoLabel(methods, title, id) {
			return this.label(title,
				h.prop('contentEditable', true)
				.on('keyup', (e) => {
					if (e.keyCode === 27) // escape 
						methods.updateTitle(id, title);
					else //if (e.keyCode === 13 && e.target.value)
						methods.updateTitle(id, e.target.textContent);
				})
			);
		},
		todoItem(todo, methods) {
			return this.li(
				h.class('completed', todo.completed)
				.div(
					h.class('view')
					.checkbox(todo.completed, h.class('toggle').on('click', () => methods.toggleComplete(todo.id) ))
					.todoLabel(methods, todo.title, todo.id)
					.button(h.class('destroy').on('click', () => methods.delete(todo.id) ))
				)
			);
		},
		todomvcFooter() {
			return this.footer(
				h.id('info').class('info')
				.p('Written by ', h.a('https://github.com/nomocas', 'nomocas'))
				.p('Part of ', h.a('http://todomvc.com', 'TodoMVC'))
			);
		},
		statsSectionNav(route) {
			return this.ul(
				h.id('filters').class('filters')
				.li(h.a('#/', h.class('selected', route === 'all'), 'All'))
				.li(h.a('#/active', h.class('selected', route === 'active'), 'Active'))
				.li(h.a('#/completed', h.class('selected', route === 'completed'), 'Completed'))
			);
		},
		clearCompletedButton(todosCompleted, methods) {
			return this.button(
				h.id('clear-completed').class('clear-completed')
				.visible(todosCompleted > 0)
				.on('dblclick', methods.clearCompleted),
				'Clear completed (' + todosCompleted + ')'
			);
		},
		statsSection(todos, route, methods) {
			const todosLeft = todos.filter((todo) => {
					return !todo.completed;
				}).length,
				todosCompleted = todos.length - todosLeft;

			return this.footer(
				h.id('footer').class('footer')
				.visible(todos.length)
				.span(
					h.id('todo-count').class('todo-count').strong(todosLeft),
					(todosLeft === 1 ? ' item' : ' items') + ' left'
				)
				.statsSectionNav(route)
				.clearCompletedButton(todosCompleted, methods)
			);
		}
	};
});

export default todomvcLexicon;

