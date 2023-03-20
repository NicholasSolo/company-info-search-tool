const basicApp = document.body.querySelector('#app');
const advancedApp = document.body.querySelector('#app2');

basicApp?.append(document.createElement('company-search'));

advancedApp?.append(document.createElement('company-search'));
advancedApp?.querySelector('company-search').setAttribute('dropdown', 'true');
