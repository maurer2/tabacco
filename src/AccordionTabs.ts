type Appearance = 'Accordion' | 'Tabs';
export type Data = Map<string, string>;

const html = String.raw;

export class AccordionTabs {
  #domElement;
  #data;
  #activeKey: string | undefined;
  #mediaQueryLargeScreen = window.matchMedia('(width >= 800px)');
  #isScrollMarkerGroupTabsSupported = CSS.supports('scroll-marker-group', 'before tabs'); // Chrome 154+ and older with "Experimental Web Platform features"-flag enabled

  constructor(domElement: HTMLElement, data: Data, startKey?: string) {
    this.#domElement = domElement;
    this.#data = data;
    this.#activeKey = startKey;

    // toggle event does not bubble
    this.#domElement.addEventListener('toggle', this.#handleToggle, { capture: true });
    // ignores click events from tab panels or accordion
    this.#domElement.addEventListener('click', this.#handleTabClick);
    this.#mediaQueryLargeScreen.addEventListener('change', this.#handleMediaQueryChange);
    // called when element is ctrl+f-ed when used with hidden="until-found", does not bubble
    this.#domElement.addEventListener('beforematch', this.#handleBeforeMatch, { capture: true });
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

  // beforematch fires on the hidden panels, not the tab
  #handleBeforeMatch = (event: Event): void => {
    const targetElement = event.target;
    if (!targetElement || !(targetElement instanceof HTMLElement)) {
      return;
    }

    const foundPanel: HTMLElement | null = targetElement.closest('[role="tabpanel"]');
    if (!foundPanel) {
      return;
    }

    const newActiveKey = foundPanel.dataset.key;
    if (newActiveKey === undefined || newActiveKey === this.#activeKey) {
      return;
    }

    this.#activeKey = newActiveKey;
    this.render();
  };

  #handleMediaQueryChange = (): void => {
    this.render();
  };

  #getAccordionMarkup() {
    const detailsSummaryTags = [...this.#data].map(([key, data]) => {
      const isActive = key === this.#activeKey;

      return html`
        <details
          name="accordion"
          data-key="${key}"
          ${isActive ? 'open' : ''}
        >
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
        tab: html`
          <button
            class="trigger"
            role="tab"
            id="${tabId}"
            data-key="${key}"
            aria-selected="${isActive ? 'true' : 'false'}"
            aria-controls="${panelId}"
            ${isActive ? 'focusgroupstart' : ''}
          >
            ${key}
          </button>
        `,
        panel: html`
          <article
            class="content"
            role="tabpanel"
            tabindex="0"
            id="${panelId}"
            data-key="${key}"
            aria-labelledby="${tabId}"
            ${isActive ? '' : 'hidden="until-found"'}
          >
            ${data}
          </article>
        `,
      };
    });

    const markup = html`
      <div class="tabs">
        <div
          class="tablist"
          role="tablist"
          focusgroup="tablist nomemory"
          aria-label="Categories"
        >
          ${tabsAndPanels.map(({ tab }) => tab).join('')}
        </div>
        <div class="tabpanels">${tabsAndPanels.map(({ panel }) => panel).join('')}</div>
      </div>
    `;

    return markup;
  }

  // Chrome 154+ and older versions with "Experimental Web Platform features"-flag enabled
  // https://developer.chrome.com/blog/chrome-154-beta?hl=en
  // https://chromestatus.com/feature/5109685301673984
  // https://gist.github.com/danielsakhapov/aa8e744701224994609aebb3e9e316e3
  #getScrollMarkerGroupTabsMarkup() {
    const listEntries = [...this.#data].map(
      ([key, data]) => html`<li data-label=${key}>${data}</li>`,
    );

    const markup = html`
      <ul class="scroll-marker-group-tabs">
        ${listEntries.join('')}
      </ul>
    `;

    return markup;
  }

  render(): void {
    if (this.#appearance === 'Accordion') {
      this.#domElement.innerHTML = this.#getAccordionMarkup();
      return;
    }

    if (this.#isScrollMarkerGroupTabsSupported) {
      this.#domElement.innerHTML = this.#getScrollMarkerGroupTabsMarkup();
      return;
    }

    this.#domElement.innerHTML = this.#getTabListMarkup();
  }
}
