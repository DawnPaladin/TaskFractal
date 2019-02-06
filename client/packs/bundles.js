import ReactOnRails from 'react-on-rails';

import FrontSideTask from '../bundles/Chunky/components/FrontSideTask'
import BackSideTask from '../bundles/Chunky/components/BackSideTask';
import Outline from '../bundles/Chunky/components/Outline';

// This is how react_on_rails can see the HelloWorld in the browser.
ReactOnRails.register({
	BackSideTask, Outline, FrontSideTask
});
