/**s
 * Todomvc : Browser Side Launcher
 * 
 * @author Gilles Coomans
 */

import Todos from './store.js'; // my "immutable" store
import todomvcLexicon from './todomvc-html-lexicon'; // my custom html lexicon
import differ from 'babelute-html/src/pragmatics/html-to-dom-diffing'; // first degree diffing (only for DOM)
	
const h = todomvcLexicon.firstLevelInitializer,
	$root = document.getElementById('todoapp'); // where rendering take place

// don't forget to add your lexicon(s) name to differ's _targets
differ._targets.todomvc = true;	

// -------- render ----------

let oldRendered, // for diffing tracking
	animFrame;

// bind todos update to main render
Todos.on('update', (state) => {
	if (animFrame)
		cancelAnimationFrame(animFrame);
	animFrame = requestAnimationFrame(() => {
		oldRendered = differ.$output($root, h.todomvc(state.todos, state.route, state.methods), oldRendered);
	});
});

// -------- routes ----------

// simple hashchange binding for routing
function hashChange() {
	Todos.route = window.location.hash.substring(2) || 'all';
	Todos.emit('update', Todos);
}
window.onhashchange = hashChange;

hashChange(); // set current route and launch