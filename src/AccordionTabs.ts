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
    const markupTabs = `
      <div role="tablist">
        ${[...this.#data]
          .map(([key]) => {
            const isActive = key === this.#activeKey;

            return `
              <button role="tab" id="tab-${key}" aria-selected="${isActive ? 'true' : 'false'}" aria-controls="panel-${key}">${key}</button>
            `;
          })
          .join('')}
      </div>
    `;

    const markupPanel = [...this.#data]
      .map(([key, data]) => {
        const isActive = key === this.#activeKey;

        return `
          <article role="tabpanel" id="panel-${key}" aria-labelledby="tab-${key}" ${isActive ? '' : 'hidden'}>${data}</article>
        `;
      })
      .join('');

    return [markupTabs, markupPanel].join('');
  }

  render(): void {
    this.#domElement.innerHTML = [
      this.#getAccordionMarkup(),
      '<hr/>',
      this.#getTabListMarkup(),
    ].join('');
  }
}
