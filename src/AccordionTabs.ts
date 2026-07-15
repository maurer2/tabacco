export class AccordionTabs {
  #domElement;
  #data;
  #activeKey;

  constructor(domElement: HTMLElement, data: Map<string, string>, startKey: string) {
    this.#domElement = domElement;
    this.#data = data;
    this.#activeKey = startKey;
  }

  #getAccordionMarkup() {
    const markup = [...this.#data]
      .map(([key, data]) => {
        const isActive = key === this.#activeKey;

        return `
          <details name="accordion" ${isActive ? 'open' : ''}>
            <summary>${key}</summary>
            <div>${data}</div>
          </details>
        `;
      })
      .join('');

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
          <button role="tab" id="${tabId}" aria-selected="${isActive ? 'true' : 'false'}" aria-controls="${panelId}">${key}</button>
        `,
        panel: `
          <article role="tabpanel" id="${panelId}" aria-labelledby="${tabId}" ${isActive ? '' : 'hidden'}>${data}</article>
        `,
      };
    });

    const markupTabs = `
      <div role="tablist">
        ${tabsAndPanels.map(({ tab }) => tab).join('')}
      </div>
    `;
    const markupPanels = tabsAndPanels.map(({ panel }) => panel).join('');

    return [markupTabs, markupPanels].join('');
  }

  render(): void {
    this.#domElement.innerHTML = [
      this.#getAccordionMarkup(),
      '<hr/>',
      this.#getTabListMarkup(),
    ].join('');
  }
}
