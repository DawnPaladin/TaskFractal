import ReactOnRails from 'react-on-rails';

import FrontSideTask from '../bundles/Chunky/components/FrontSideTask'
import BackSideTask from '../bundles/Chunky/components/BackSideTask';
import Outline from '../bundles/Chunky/components/Outline';
import ToggleShowCompleted from '../bundles/Chunky/components/ToggleShowCompleted';

ReactOnRails.register({
	BackSideTask, Outline, FrontSideTask, ToggleShowCompleted
});
