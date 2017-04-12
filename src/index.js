/**s
 * Todomvc : Browser Side Launcher
 * 
 * @author Gilles Coomans
 */

import store from './store.js'; // my "immutable" store
import todomvcLexicon from './todomvc-html-lexicon'; // my custom html lexicon
import differ from 'babelute-html-dom-diffing-pragmatics'; // first degree diffing (only for DOM)
	
const h = todomvcLexicon.initializer(true),
	$root = document.getElementById('todoapp'); // where rendering take place

// don't forget to add your lexicon(s) name to differ (only for FirstLevel diffing - not needed for dom or string output)
differ.addLexicon(todomvcLexicon);	

// ---------- render ----------

let oldRendered, // for diffing tracking
	animFrame;

// bind todos update to main render
store.on('update', (state) => {
	if (animFrame)
		cancelAnimationFrame(animFrame);
	animFrame = requestAnimationFrame(() => {
		oldRendered = differ.$output($root, h.todomvc(state.todos, state.route, state.methods), oldRendered);
	});
});

// -------- routes ----------

// simple hashchange binding for routing
function hashChange() {
	store.route = window.location.hash.substring(2) || 'all';
	store.emit('update', store);
}
window.onhashchange = hashChange;

hashChange(); // set current route and launch