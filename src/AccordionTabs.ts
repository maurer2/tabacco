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

  render(): void {
    this.#domElement.innerHTML = this.#getAccordionMarkup();
  }
}
