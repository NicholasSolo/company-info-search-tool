const basicTemplate = document.querySelector('#basic');
const advancedTemplate = document.querySelector('#advanced');

import { getCompanyData } from './api.js';

class InfoItem extends HTMLElement {
    constructor () {
        super();
    }

    connectedCallback () {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <div class="info-block">
            <p class="label" style="margin-bottom: 3px">
                <slot name="label"></slot>
            </p>
        
            <div class="value" style="padding: 5px; border: 1px solid black">
                <slot name="value"></slot>
            </div>
        </div>
      `;
    }
}

class CommonWrapper extends HTMLElement {
    constructor () {
        super();
    }

    connectedCallback () {
        this.attachShadow({ mode: 'open' });
        this.renderComponent();
    }

    renderComponent () {
        this.shadowRoot.innerHTML = `
      <div class="app-header">
        <h4 class="app-title">Компания или ИП</h4>
      </div>

      <p class="company-type"></p>

      <div class="result-container"></div>
    `;

        const element = this.shadowRoot;
        const header = element.querySelector('.app-header');
        this.type = element.querySelector('.company-type');
        this.result = element.querySelector('.result-container');

        if (!this.getAttribute('dropdown')) {
            header.append(basicTemplate?.content.cloneNode(true));
            const form = header.querySelector('#form');

            form?.addEventListener('submit', e => {
                e.preventDefault();

                const query = form.querySelector('input').value;

                if (query) {
                    getCompanyData(query).then(data => {
                        this.renderResult(data);
                    });
                }
            });
        } else {
            header.append(advancedTemplate.content.cloneNode(true));
            const input = header.querySelector('.search-wrapper .search-input');
            this.list = header.querySelector('.options-list');

            document.addEventListener('click', e => {
                const { target } = e;

                if (
                    this.list.classList.contains('visible') &&
                    !target.closest('company-search')
                ) {
                    this.list.classList.remove('visible');
                }
            });

            element.addEventListener('click', e => {
                const { target } = e;

                if (target.closest('.list-item')) {
                    const listItem = target.closest('.list-item');

                    const name = listItem
                        .querySelector('.name')
                        .textContent.trim();
                    const inn = listItem
                        .querySelector('.inn')
                        .textContent.trim();

                    this.list.classList.remove('visible');

                    getCompanyData(`${name} ${inn}`, 1).then(data =>
                        this.renderResult(data)
                    );
                }

                if (
                    target.matches('.search-input') &&
                    element.querySelectorAll('li.list-item').length
                ) {
                    this.list.classList.toggle('visible');
                }
            });

            input.addEventListener('input', e => {
                const { target } = e;

                getCompanyData(target.value).then(data => {
                    if (data) {
                        this.renderDropdown(data);
                    }
                });
            });
        }
    }

    renderResult (renderData) {
        if (this.result.innerHTML) {
            this.result.innerHTML = '';
        }

        if (renderData) {
            this.type.innerHTML =
                renderData[0].type === 'LEGAL'
                    ? `Организация (${renderData[0].type})`
                    : `Частный предприниматель (${renderData[0].type})`;

            renderData[0].mainInfo.forEach(i => {
                const item = document.createElement('info-item');
                item.innerHTML = `
          <span slot="label">${i.label}</span>
          <span slot="value">${i.value}</span>
        `;

                this.result.append(item);
            });
        } else {
            this.result.innerHTML = 'По вашему запросу ничего не найдено';
        }
    }

    renderDropdown (dropdownData) {
        this.list.innerHTML = '';

        dropdownData.forEach(i => {
            const li = document.createElement('li');
            li.classList.add('list-item');

            li.innerHTML = `
        <div class="name">${i.mainInfo[0].value || i.mainInfo[1].value}</div>
        <div class="other">
          <span class="inn">${i.mainInfo[2].value.split('/')[0]}</span>
          <span class="address">${i.mainInfo[3].value || ''}</span>
        </div>
      `;

            this.list.append(li);
            this.list.classList.add('visible');
        });
    }

    static get observedAttributes () {
        return ['dropdown'];
    }

    attributeChangedCallback (name, oldValue, newValue) {
        this.renderComponent();
    }
}

customElements.define('info-item', InfoItem);
customElements.define('company-search', CommonWrapper);
