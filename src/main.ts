import { AccordionTabs, type Data } from '#AccordionTabs.ts';

import dataJson from './data.json' with { type: 'json' };
import './style.css';

const main = document.querySelector<HTMLElement>('main');
if (!main) {
  throw new Error('main tag missing');
}

const data: Data = new Map(Object.entries(dataJson));
const startKey = [...data.keys()][0];

const accordionTabs = new AccordionTabs(main, data, startKey);
accordionTabs.render();
