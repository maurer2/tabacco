type Appearance = 'Accordion' | 'Tabs';
export type Data = Map<string, string>;

export class AccordionTabs {
  #domElement;
  #data;
  #activeKey: string | undefined;
  #mediaQueryLargeScreen = window.matchMedia('(width >= 800px)');

  constructor(domElement: HTMLElement, data: Data, startKey?: string) {
    this.#domElement = domElement;
    this.#data = data;
    this.#activeKey = startKey;

    // toggle event does not bubble
    this.#domElement.addEventListener('toggle', this.#handleToggle, { capture: true });
    // ignores click events from tab panels or accordion
    this.#domElement.addEventListener('click', this.#handleTabClick);
    this.#mediaQueryLargeScreen.addEventListener('change', this.#handleMediaQueryChange);
  }

  get #appearance(): Appearance {
    return this.#mediaQueryLargeScreen.matches ? 'Tabs' : 'Accordion';
  }

  // also called when a tab is expanded via ctrl+f search
  #handleToggle = (event: ToggleEvent): void => {
    const targetElement = event.target;

    if (!(targetElement instanceof HTMLDetailsElement)) {
      return;
    }

    const key = targetElement.dataset.key;
    if (key === undefined) {
      return;
    }

    if (event.newState === 'open') {
      this.#activeKey = key;

      return;
    }

    // details tag was closed but no new details tag was opened
    if (key === this.#activeKey) {
      this.#activeKey = undefined;
    }
  };

  #handleTabClick = (event: MouseEvent): void => {
    const targetElement = event.target;
    if (!targetElement || !(targetElement instanceof HTMLElement)) {
      return;
    }

    // ignore clicks outside the tab list (e.g. the accordion)
    const closestTab: HTMLButtonElement | null = targetElement.closest('[role="tab"]');
    if (!closestTab) {
      return;
    }

    const newActiveKey = closestTab.dataset.key;
    if (newActiveKey === undefined) {
      return;
    }

    // either close all tabs, or expand new tab
    this.#activeKey = newActiveKey === this.#activeKey ? undefined : newActiveKey;
    this.render();
  };

  #handleMediaQueryChange = (): void => {
    this.render();
  };

  #getAccordionMarkup() {
    const detailsSummaryTags = [...this.#data].map(([key, data]) => {
      const isActive = key === this.#activeKey;

      return `
        <details name="accordion" data-key="${key}" ${isActive ? 'open' : ''}>
          <summary class="trigger">${key}</summary>
          <div class="content">${data}</div>
        </details>
      `;
    });

    const markup = `
      <div class="accordion">
        ${detailsSummaryTags.join('')}
      </div>
    `;

    return markup;
  }

  // https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
  #getTabListMarkup() {
    const tabsAndPanels = [...this.#data].map(([key, data]) => {
      const isActive = key === this.#activeKey;
      const tabId = `tab-${key}`;
      const panelId = `panel-${key}`;

      return {
        tab: `
          <button class="trigger" role="tab" id="${tabId}" data-key="${key}" aria-selected="${isActive ? 'true' : 'false'}" aria-controls="${panelId}">${key}</button>
        `,
        panel: `
          <article class="content" role="tabpanel" id="${panelId}" aria-labelledby="${tabId}" ${isActive ? '' : 'hidden'}>${data}</article>
        `,
      };
    });

    const markup = `
      <div class="tabs">
        <div class="tablist" role="tablist">
          ${tabsAndPanels.map(({ tab }) => tab).join('')}
        </div>
        <div class="tabpanels">
          ${tabsAndPanels.map(({ panel }) => panel).join('')}
        </div>
      </div>
    `;

    return markup;
  }

  render(): void {
    this.#domElement.innerHTML =
      this.#appearance === 'Accordion' ? this.#getAccordionMarkup() : this.#getTabListMarkup();
  }
}
