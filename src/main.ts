import { AccordionTabs } from '#AccordionTabs.ts';

import './style.css';

const main = document.querySelector<HTMLElement>('main');

const data = new Map<string, string>([
  ['Test1', 'Lorem ipsum dolor 1'],
  ['Test2', 'Lorem ipsum dolor 2'],
  ['Test3', 'Lorem ipsum dolor 3'],
]);
const startKey = [...data.keys()][0];

if (!main) {
  throw new Error('main tag missing');
}

const accordionTabs = new AccordionTabs(main, data, startKey);
accordionTabs.render();
