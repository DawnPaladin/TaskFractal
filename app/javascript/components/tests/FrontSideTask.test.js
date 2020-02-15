import React from 'react';
import FrontSideTask from '../FrontSideTask';
import renderer from 'react-test-renderer';

const task = {
	completed: true
};
const checkboxChange = () => {};

test('disableDescendantCount hides descendant count', () => {
	const component = renderer.create(
		<FrontSideTask task={task} checkboxChange={checkboxChange} disableDescendantCount={true} />
	);
	let tree = component.toJSON();
	expect(tree).toMatchSnapshot();
})
