import React from 'react'; // JSX

import renderer from 'react-test-renderer'; // for snapshots

// for running tests on jQuery-like tests
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

import FrontSideTask from '../FrontSideTask';

const task = {
	completed: true,
	name: "Test task",
	id: 0,
	attachment_count: 0,
	descendants: [
		{ name: "First descendant", id: 1, completed: false },
		{ name: "Second descendant", id: 2, completed: false }
	]
};
const checkboxChange = () => {};

jest.mock('../Checkbox'); // checkbox is from @material library which doesn't test well

test('FrontSideTask snapshot', () => {
	const component = renderer.create(
		<FrontSideTask task={task} checkboxChange={checkboxChange} disableDescendantCount={false} />
	);
	let tree = component.toJSON();
	expect(tree).toMatchSnapshot();
});

test('has descendants by default', () => {
	const wrapper = shallow( <FrontSideTask task={task} checkboxChange={checkboxChange} /> );
	const descendants = wrapper.find('.descendants');
	expect(descendants.exists()).toBeTruthy();
});

test('disableDescendantCount hides descendant count', () => {
	const wrapper = shallow( <FrontSideTask task={task} checkboxChange={checkboxChange} disableDescendantCount={true} /> );
	const descendants = wrapper.find('.descendants')
	expect(descendants.exists()).toBeFalsy();
});
