import ReactOnRails from 'react-on-rails';

import FrontSideTask from '../bundles/Chunky/components/FrontSideTask'
import Chunky from '../bundles/Chunky/components/Chunky';
import Outline from '../bundles/Outline/components/Outline';

// This is how react_on_rails can see the HelloWorld in the browser.
ReactOnRails.register({
	Chunky, Outline, FrontSideTask
});
